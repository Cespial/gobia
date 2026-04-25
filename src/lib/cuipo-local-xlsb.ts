import "server-only";

/**
 * CUIPO local — lector de archivos .xlsb / .xlsx descargados de CHIP CGN.
 *
 * Provee las mismas funciones que `datos-gov-cuipo.ts` (`fetchEjecucionIngresos`,
 * `fetchGastosPorSeccion`, `fetchPeriodosDisponibles`) pero leyendo desde disco
 * en vez de la API datos.gov.co. Esto permite cálculos contra archivos CUIPO
 * directos que SÍ traen los campos `tipo_norma`, `fecha_norma`, `numero_norma`
 * y `compromisos` reales por sección/fuente — necesarios para la deducción
 * Fondos (Opción B) y la validación CGR de las 3 condiciones de Johan.
 *
 * Uso:
 *   - Setear env var `CUIPO_LOCAL_PATH` apuntando al directorio de archivos
 *     (default: `/Users/cristianespinal/Downloads/`).
 *   - Los nombres se buscan por el patrón `${YEAR}_${MONTH}_CUIPO[A|B|C|D]_*.xls(b|x)`.
 *   - El periodo CUIPO sigue el patrón `2025_8` (año_mes).
 *
 * Caché:
 *   - Los archivos parseados se cachean a nivel módulo (clave = ruta absoluta).
 *   - Primera lectura puede tardar 5-10s con 150k filas; siguientes son <50ms.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  statSync,
} from "fs";
import { join, basename } from "path";
import { homedir } from "os";
import * as XLSX from "xlsx";
import type {
  CuipoEjecIngresos,
  CuipoEjecGastos,
} from "./datos-gov-cuipo";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEFAULT_LOCAL_PATH = "/Users/cristianespinal/Downloads";

function getLocalPath(): string {
  return process.env.CUIPO_LOCAL_PATH || DEFAULT_LOCAL_PATH;
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

type CuipoFileKind = "A" | "B" | "C" | "D";

const KIND_LABEL: Record<CuipoFileKind, string> = {
  A: "PROGRAMACION_DE_INGRESOS",
  B: "EJECUCION_DE_INGRESOS",
  C: "PROGRAMACION_DE_GASTOS",
  D: "EJECUCION_DE_GASTOS",
};

/**
 * Localiza el archivo CUIPO para un periodo y tipo dado en el directorio
 * configurado. Acepta archivos `.xlsb` o `.xlsx`. Periodo CUIPO formato
 * `YYYY_M` (p.ej. `2025_8`).
 */
function findCuipoFile(periodo: string, kind: CuipoFileKind): string | null {
  const dir = getLocalPath();
  if (!existsSync(dir)) return null;

  const expectedPrefix = `${periodo}_CUIPO${kind}_`;
  const label = KIND_LABEL[kind];

  for (const name of readdirSync(dir)) {
    if (!name.startsWith(expectedPrefix)) continue;
    if (!/\.(xlsb|xlsx)$/i.test(name)) continue;
    if (!name.toUpperCase().includes(label)) continue;
    return join(dir, name);
  }
  return null;
}

/** True si existe al menos un archivo CUIPO local para el periodo dado. */
export function hasLocalCuipo(periodo: string): boolean {
  return findCuipoFile(periodo, "B") !== null;
}

// ---------------------------------------------------------------------------
// Parser (cacheado por archivo)
// ---------------------------------------------------------------------------

type RawRow = (string | number | null)[];

const memCache = new Map<string, RawRow[]>();

/** Directorio de caché en disco (~/.cache/gobia-cuipo) — pre-procesado JSON. */
function getCacheDir(): string {
  const dir = join(homedir(), ".cache", "gobia-cuipo");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Convierte un archivo .xlsb/.xlsx a JSON ligero (solo las columnas que se
 * usan después). El JSON se guarda en disco para que la próxima lectura
 * sea casi instantánea (decenas de ms en vez de minutos).
 *
 * Las columnas extraídas siguen los layouts de los archivos CHIP CGN:
 *   - CUIPOB / Ejecución Ingresos: cols 1..30 (incluye norma y recaudo)
 *   - CUIPOD / Ejecución Gastos:   cols 1..34 (incluye fuente y compromisos)
 *
 * Para evitar mantener mappings duplicados, extrae las columnas 0..MAX_COL
 * y guarda valores `null` en celdas vacías. El consumidor sabe qué índice
 * usar.
 */
function convertWorkbookToCache(absPath: string, cachePath: string): RawRow[] {
  const wb = XLSX.readFile(absPath, {
    cellDates: false,
    cellStyles: false,
    cellFormula: false,
    cellHTML: false,
  });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rangeRef = ws["!ref"];
  if (!rangeRef) {
    writeFileSync(cachePath, "[]");
    return [];
  }
  const range = XLSX.utils.decode_range(rangeRef);

  // Acceso directo a celdas (mucho más rápido que sheet_to_json para .xlsb)
  // Iteramos fila×columna en C, asignando valores directamente.
  const MAX_COL = Math.min(range.e.c, 40);
  const rows: RawRow[] = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const arr: RawRow = new Array(MAX_COL + 1).fill(null);
    let hasContent = false;
    for (let c = 0; c <= MAX_COL; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      const cell = ws[ref];
      if (cell && cell.v !== undefined && cell.v !== null) {
        arr[c] = cell.v as string | number;
        hasContent = true;
      }
    }
    if (hasContent) rows.push(arr);
  }

  writeFileSync(cachePath, JSON.stringify(rows));
  return rows;
}

/**
 * Lee un archivo .xlsb/.xlsx y devuelve filas como arrays indexados por
 * número de columna. Tres niveles de caché:
 *   1. Memoria (Map por ruta) — instantáneo
 *   2. Disco JSON pre-procesado — milisegundos
 *   3. Parser XLSX completo — minutos (sólo primera vez)
 *
 * El caché en disco se invalida si el .xlsb cambió (mtime más nuevo).
 */
function readWorkbookRows(absPath: string): RawRow[] {
  const cached = memCache.get(absPath);
  if (cached) return cached;

  const cachePath = join(
    getCacheDir(),
    basename(absPath).replace(/\.(xlsb|xlsx)$/i, "") + ".json"
  );

  // Caché en disco fresco?
  if (existsSync(cachePath)) {
    try {
      const cacheStat = statSync(cachePath);
      const fileStat = statSync(absPath);
      if (cacheStat.mtimeMs >= fileStat.mtimeMs) {
        const buf = readFileSync(cachePath, "utf8");
        const rows: RawRow[] = JSON.parse(buf);
        memCache.set(absPath, rows);
        return rows;
      }
    } catch {
      // caché corrupto → re-procesar
    }
  }

  // Procesar .xlsb (lento, sólo primera vez)
  const rows = convertWorkbookToCache(absPath, cachePath);
  memCache.set(absPath, rows);
  return rows;
}

function s(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function n(v: unknown): string {
  // Devuelve string numérico (mismo shape que la API datos.gov)
  if (v === null || v === undefined || v === "") return "0";
  if (typeof v === "number") return String(v);
  const f = parseFloat(String(v));
  return Number.isFinite(f) ? String(f) : "0";
}

// ---------------------------------------------------------------------------
// CUIPOB — Ejecución de Ingresos
// Layout (header en fila 17, datos desde fila 18 — índice 16 / 17 en 0-based):
//   col[1] Año Vigencia · [2] Periodo · [4] Código DANE · [6] Entidad
//   [11] Código Concepto · [12] Concepto · [17] Código Fuente Financiación
//   [18] Fuente Financiación · [23] Norma (string combinado nº/fecha)
//   [24] Código Tipo de Norma · [25] Tipo de Norma · [30] Total Recaudo
// ---------------------------------------------------------------------------

interface CuipoEjecIngresosLocal extends CuipoEjecIngresos {
  /** Campos extra de archivo local que el API no expone */
  numero_norma?: string;
  fecha_norma?: string;
  tipo_norma?: string;
  cod_tipo_norma?: string;
}

/** Fetch ingresos ejecución para un DANE+periodo desde archivo local. */
export async function fetchEjecucionIngresosLocal(
  daneCode: string,
  periodo: string
): Promise<CuipoEjecIngresosLocal[]> {
  const file = findCuipoFile(periodo, "B");
  if (!file) {
    throw new Error(
      `CUIPO local: no se encontró archivo CUIPOB para periodo ${periodo} en ${getLocalPath()}`
    );
  }

  const rows = readWorkbookRows(file);
  const out: CuipoEjecIngresosLocal[] = [];
  const targetDane = daneCode.padStart(5, "0");

  for (const row of rows) {
    const dane = s(row[4]);
    if (dane !== targetDane) continue;

    // Norma combina número y fecha en una sola string ("488 / 24-12-1998 - 20%"
    // o "NA"). Para la deducción Fondos sólo nos interesa si dice "NA" / "NO APLICA".
    const normaRaw = s(row[23]);
    const normaUpper = normaRaw.toUpperCase();
    const isNoAplica = normaUpper === "NA" || normaUpper === "NO APLICA";
    const numero_norma = isNoAplica ? "NO APLICA" : normaRaw;
    const fecha_norma = isNoAplica ? "NO APLICA" : normaRaw;

    out.push({
      periodo,
      codigo_entidad: dane,
      nombre_entidad: s(row[6]),
      cuenta: s(row[11]),
      nombre_cuenta: s(row[12]),
      ambito_codigo: "A439",
      cod_fuentes_financiacion: s(row[17]),
      nom_fuentes_financiacion: s(row[18]),
      total_recaudo: n(row[30]),
      recaudo_vac_ss: n(row[28]),
      recaudo_vac_cs: n(row[29]),
      recaudo_van_ss: n(row[26]),
      recaudo_van_cs: n(row[27]),
      // Campos extra (sólo en local)
      numero_norma,
      fecha_norma,
      tipo_norma: s(row[25]),
      cod_tipo_norma: s(row[24]),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// CUIPOD — Ejecución de Gastos
// Layout (header en fila 18 / 0-based 17, datos desde 18):
//   col[4] Código DANE · [11] Código Concepto · [12] Concepto
//   [13] Código Vigencia del Gasto · [14] Vigencia del Gasto
//   [15] Código Sección Presupuestal · [16] Sección Presupuestal
//   [23] Código Fuente Financiación · [24] Fuente Financiación
//   [32] Compromisos · [33] Obligaciones · [34] Pagos
// ---------------------------------------------------------------------------

/** Fetch gastos ejecución agrupados con detalle para un DANE+periodo. */
export async function fetchEjecucionGastosLocal(
  daneCode: string,
  periodo: string
): Promise<CuipoEjecGastos[]> {
  const file = findCuipoFile(periodo, "D");
  if (!file) {
    throw new Error(
      `CUIPO local: no se encontró archivo CUIPOD para periodo ${periodo} en ${getLocalPath()}`
    );
  }

  const rows = readWorkbookRows(file);
  const out: CuipoEjecGastos[] = [];
  const targetDane = daneCode.padStart(5, "0");

  for (const row of rows) {
    const dane = s(row[4]);
    if (dane !== targetDane) continue;

    out.push({
      periodo,
      codigo_entidad: dane,
      nombre_entidad: s(row[6]),
      cuenta: s(row[11]),
      nombre_cuenta: s(row[12]),
      ambito_codigo: "A439",
      cod_vigencia_del_gasto: s(row[13]),
      nom_vigencia_del_gasto: s(row[14]),
      cod_seccion_presupuestal: s(row[15]),
      nom_seccion_presupuestal: s(row[16]),
      cod_fuentes_financiacion: s(row[23]),
      nom_fuentes_financiacion: s(row[24]),
      compromisos: n(row[32]),
      obligaciones: n(row[33]),
      pagos: n(row[34]),
      bpin: s(row[25]),
    });
  }
  return out;
}

/**
 * Variante que aplica el mismo filtro que `fetchGastosPorSeccion` del API:
 * sólo cuentas que empiezan por `2.1` (gastos de funcionamiento) y
 * cod_vigencia_del_gasto = '1' (vigencia actual).
 *
 * Mantiene la firma (chip-style — pero internamente se usa el DANE).
 */
export async function fetchGastosPorSeccionLocal(
  chipOrDaneCode: string,
  periodo: string
): Promise<CuipoEjecGastos[]> {
  const dane = chipOrDaneCode.length > 5
    ? chipOrDaneCode.slice(-5)
    : chipOrDaneCode;
  const all = await fetchEjecucionGastosLocal(dane, periodo);
  return all.filter((r) => {
    const cuenta = (r.cuenta || "").trim();
    if (!cuenta.startsWith("2.1")) return false;
    const codVig = (r.cod_vigencia_del_gasto || "").trim();
    return codVig === "1";
  });
}

// ---------------------------------------------------------------------------
// Periodos disponibles (basado en archivos presentes en disco)
// ---------------------------------------------------------------------------

export async function fetchPeriodosDisponiblesLocal(): Promise<string[]> {
  const dir = getLocalPath();
  if (!existsSync(dir)) return [];
  const periodos = new Set<string>();
  for (const name of readdirSync(dir)) {
    const m = name.match(/^(\d{4}_\d+)_CUIPO[A-D]_/);
    if (m) periodos.add(m[1]);
  }
  return Array.from(periodos).sort().reverse();
}
