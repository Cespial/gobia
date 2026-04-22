/**
 * datos.gov.co SODA API — CUIPO datasets
 * Fetches budget execution data for Colombian territorial entities
 */

const BASE_URL = "https://www.datos.gov.co/resource";

// Note: The DATOS_GOV_APP_TOKEN in .env.local is invalid.
// Anonymous access works fine for <1000 req/hr.
// To increase rate limit, register a new app at datos.gov.co/profile/app_tokens
const APP_TOKEN = "";

/** CUIPO + fiscal dataset IDs */
export const CUIPO_DATASETS = {
  /** Ejecución de Ingresos — 3.1M rows */
  EJEC_INGRESOS: "9axr-9gnb",
  /** Ejecución de Gastos — 11M+ rows */
  EJEC_GASTOS: "4f7r-epif",
  /** Programación de Ingresos — 2.5M rows */
  PROG_INGRESOS: "22ah-ddsj",
  /** Programación de Gastos — 9M rows */
  PROG_GASTOS: "d9mu-h6ar",
  /** Entidades registradas en CHIP */
  CHIP_ENTIDADES: "5c7g-ptic",
  /** Registro de Deuda Pública Territorial */
  DEUDA_PUBLICA: "9ksa-mf4g",
  /** Certificación Ley 617 (ICLD oficial CGR) — 11K rows, 2011-2020 */
  LEY617_ICLD: "vztn-viv4",
  /** Presupuesto de Gastos Ordinarios Histórico — 26.5M rows */
  PRESUPUESTO_HISTORICO: "i4a7-qxuj",
} as const;

/** Ambito code for municipalities */
export const AMBITO_MUNICIPIOS = "A439";

interface SodaOptions {
  dataset: string;
  where?: string;
  select?: string;
  order?: string;
  limit?: number;
  offset?: number;
  group?: string;
}

export async function sodaCuipoQuery<T = Record<string, unknown>>(
  options: SodaOptions
): Promise<T[]> {
  const params = new URLSearchParams();

  if (options.where) params.set("$where", options.where);
  if (options.select) params.set("$select", options.select);
  if (options.order) params.set("$order", options.order);
  if (options.limit) params.set("$limit", String(options.limit));
  if (options.offset) params.set("$offset", String(options.offset));
  if (options.group) params.set("$group", options.group);

  const url = `${BASE_URL}/${options.dataset}.json?${params.toString()}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (APP_TOKEN) headers["X-App-Token"] = APP_TOKEN;

  const res = await fetch(url, {
    headers,
    next: { revalidate: 86400 }, // Cache 24h — CUIPO data is quarterly
  });

  if (!res.ok) {
    throw new Error(`SODA API error ${res.status}: ${res.statusText} — ${url}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Periodo helpers
// ---------------------------------------------------------------------------

/** Quarterly periods: 20250301, 20250601, 20250901, 20251201, etc. */
export function buildPeriodo(year: number, quarter: 1 | 2 | 3 | 4): string {
  const months: Record<number, string> = { 1: "03", 2: "06", 3: "09", 4: "12" };
  return `${year}${months[quarter]}01`;
}

export function parsePeriodo(periodo: string): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const year = parseInt(periodo.slice(0, 4));
  const month = parseInt(periodo.slice(4, 6));
  const quarterMap: Record<number, 1 | 2 | 3 | 4> = { 3: 1, 6: 2, 9: 3, 12: 4 };
  return { year, quarter: quarterMap[month] ?? 4 };
}

export function periodoLabel(periodo: string): string {
  const { year, quarter } = parsePeriodo(periodo);
  const labels = { 1: "Ene-Mar", 2: "Abr-Jun", 3: "Jul-Sep", 4: "Oct-Dic" };
  return `${labels[quarter]} ${year}`;
}

export function parseCuipoAmount(
  value: string | number | null | undefined
): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === "NO APLICA") return 0;

  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

// ---------------------------------------------------------------------------
// CHIP entity code mapping
// ---------------------------------------------------------------------------

/**
 * CHIP codes do NOT follow a predictable pattern.
 * The last 5 digits are the DANE code, but the prefix varies.
 * Use MUNICIPIO_BY_CODE from @/data/municipios.ts for the correct mapping.
 */
export function chipToDaneCode(chipCode: string): string {
  return chipCode.slice(-5);
}

// ---------------------------------------------------------------------------
// CUIPO Data Types
// ---------------------------------------------------------------------------

export interface CuipoEjecIngresos {
  periodo: string;
  codigo_entidad: string;
  nombre_entidad: string;
  cuenta: string;
  nombre_cuenta: string;
  ambito_codigo: string;
  cod_fuentes_financiacion: string;
  nom_fuentes_financiacion: string;
  total_recaudo: string;
  recaudo_vac_ss: string; // Vigencia actual sin fondos
  recaudo_vac_cs: string; // Vigencia actual con fondos
  recaudo_van_ss: string; // Vigencia anterior sin fondos
  recaudo_van_cs: string; // Vigencia anterior con fondos
}

export interface CuipoEjecGastos {
  periodo: string;
  codigo_entidad: string;
  nombre_entidad: string;
  cuenta: string;
  nombre_cuenta: string;
  ambito_codigo: string;
  cod_vigencia_del_gasto: string;
  nom_vigencia_del_gasto: string;
  cod_seccion_presupuestal: string;
  nom_seccion_presupuestal: string;
  cod_fuentes_financiacion: string;
  nom_fuentes_financiacion: string;
  compromisos: string;
  obligaciones: string;
  pagos: string;
  bpin: string;
}

export interface CuipoProgIngresos {
  periodo: string;
  codigo_entidad: string;
  nombre_entidad: string;
  /** In PROG_INGRESOS this is often the entity scope (e.g. A439), not the budget code. */
  cuenta: string;
  nombre_cuenta: string;
  ambito_codigo: string;
  presupuesto_inicial: string;
  presupuesto_definitivo: string;
}

export function getProgramacionIngresoCode(
  row: Pick<CuipoProgIngresos, "ambito_codigo" | "cuenta">
): string {
  return (row.ambito_codigo || row.cuenta || "").trim();
}

export function isLeafCuipoCode(code: string, allCodes: Iterable<string>): boolean {
  const trimmed = code.trim();
  if (!trimmed) return true;

  const prefix = `${trimmed}.`;
  for (const current of allCodes) {
    if (current.startsWith(prefix)) return false;
  }

  return true;
}

export interface CuipoProgGastos {
  periodo: string;
  codigo_entidad: string;
  nombre_entidad: string;
  cuenta: string;
  nombre_cuenta: string;
  ambito_codigo: string;
  cod_vigencia_del_gasto: string;
  cod_seccion_presupuestal: string;
  apropiacion_inicial: string;
  apropiacion_definitiva: string;
}

// ---------------------------------------------------------------------------
// Data fetching functions
// ---------------------------------------------------------------------------

/** Fetch all income execution rows for a municipality in a period */
export async function fetchEjecucionIngresos(
  chipCode: string,
  periodo: string
): Promise<CuipoEjecIngresos[]> {
  return sodaCuipoQuery<CuipoEjecIngresos>({
    dataset: CUIPO_DATASETS.EJEC_INGRESOS,
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}'`,
    limit: 50000,
    order: "cuenta ASC",
  });
}

/** Fetch all expense execution rows for a municipality in a period */
export async function fetchEjecucionGastos(
  chipCode: string,
  periodo: string
): Promise<CuipoEjecGastos[]> {
  return sodaCuipoQuery<CuipoEjecGastos>({
    dataset: CUIPO_DATASETS.EJEC_GASTOS,
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}'`,
    limit: 50000,
    order: "cuenta ASC",
  });
}

/** Fetch income programming for a municipality in a period */
export async function fetchProgramacionIngresos(
  chipCode: string,
  periodo: string
): Promise<CuipoProgIngresos[]> {
  return sodaCuipoQuery<CuipoProgIngresos>({
    dataset: CUIPO_DATASETS.PROG_INGRESOS,
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}'`,
    limit: 50000,
    order: "ambito_codigo ASC",
  });
}

/** Fetch expense programming for a municipality in a period */
export async function fetchProgramacionGastos(
  chipCode: string,
  periodo: string
): Promise<CuipoProgGastos[]> {
  return sodaCuipoQuery<CuipoProgGastos>({
    dataset: CUIPO_DATASETS.PROG_GASTOS,
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}'`,
    limit: 50000,
    order: "cuenta ASC",
  });
}

/** Fetch aggregated income totals by top-level account for quick overview */
export async function fetchResumenIngresos(
  chipCode: string,
  periodo: string
): Promise<{ cuenta: string; nombre_cuenta: string; total_recaudo: string }[]> {
  return sodaCuipoQuery({
    dataset: CUIPO_DATASETS.EJEC_INGRESOS,
    select: "cuenta, nombre_cuenta, sum(total_recaudo) as total_recaudo",
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND length(cuenta) <= 5`,
    group: "cuenta, nombre_cuenta",
    order: "cuenta ASC",
    limit: 200,
  });
}

/** Fetch aggregated expense totals by top-level account */
export async function fetchResumenGastos(
  chipCode: string,
  periodo: string
): Promise<{
  cuenta: string;
  nombre_cuenta: string;
  compromisos: string;
  obligaciones: string;
  pagos: string;
}[]> {
  return sodaCuipoQuery({
    dataset: CUIPO_DATASETS.EJEC_GASTOS,
    select:
      "cuenta, nombre_cuenta, sum(compromisos) as compromisos, sum(obligaciones) as obligaciones, sum(pagos) as pagos",
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND nom_vigencia_del_gasto='VIGENCIA ACTUAL' AND length(cuenta) <= 5`,
    group: "cuenta, nombre_cuenta",
    order: "cuenta ASC",
    limit: 200,
  });
}

/** Fetch available periods for a municipality */
export async function fetchPeriodosDisponibles(
  chipCode: string
): Promise<string[]> {
  const result = await sodaCuipoQuery<{ periodo: string }>({
    dataset: CUIPO_DATASETS.EJEC_INGRESOS,
    select: "periodo",
    where: `codigo_entidad='${chipCode}'`,
    group: "periodo",
    order: "periodo DESC",
    limit: 50,
  });
  return result.map((r) => r.periodo);
}

/** Fetch expense execution grouped by funding source for equilibrium analysis */
export async function fetchGastosPorFuente(
  chipCode: string,
  periodo: string
): Promise<{
  cod_fuentes_financiacion: string;
  nom_fuentes_financiacion: string;
  nom_vigencia_del_gasto: string;
  compromisos: string;
  obligaciones: string;
  pagos: string;
}[]> {
  return sodaCuipoQuery({
    dataset: CUIPO_DATASETS.EJEC_GASTOS,
    select:
      "cod_fuentes_financiacion, nom_fuentes_financiacion, nom_vigencia_del_gasto, sum(compromisos) as compromisos, sum(obligaciones) as obligaciones, sum(pagos) as pagos",
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}'`,
    group:
      "cod_fuentes_financiacion, nom_fuentes_financiacion, nom_vigencia_del_gasto",
    order: "cod_fuentes_financiacion ASC",
    limit: 5000,
  });
}

/** Fetch income by funding source for equilibrium analysis */
export async function fetchIngresosPorFuente(
  chipCode: string,
  periodo: string
): Promise<{
  cod_fuentes_financiacion: string;
  nom_fuentes_financiacion: string;
  total_recaudo: string;
}[]> {
  return sodaCuipoQuery({
    dataset: CUIPO_DATASETS.EJEC_INGRESOS,
    select:
      "cod_fuentes_financiacion, nom_fuentes_financiacion, sum(total_recaudo) as total_recaudo",
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}'`,
    group: "cod_fuentes_financiacion, nom_fuentes_financiacion",
    order: "cod_fuentes_financiacion ASC",
    limit: 5000,
  });
}

// ---------------------------------------------------------------------------
// Ley 617 ICLD Certification (CGR official data, 2011-2020)
// ---------------------------------------------------------------------------

export interface Ley617Certification {
  codigochip: string;
  nombre: string;
  categoria: string;
  vigencia: string;
  limiteGF: number;
  icldNeto: number;
  gastosFuncionamiento: number;
  indicadorLey617: number;
  gastosConcejo: number | null;
  gastosPersoneria: number | null;
}

/** Fetch official Ley 617 certification from CGR (2011-2020) */
export async function fetchLey617Certificacion(
  chipCode: string
): Promise<Ley617Certification[]> {
  const raw = await sodaCuipoQuery<Record<string, string>>({
    dataset: CUIPO_DATASETS.LEY617_ICLD,
    where: `codigochip='${chipCode}'`,
    order: "vigencia DESC",
    limit: 20,
  });

  return raw.map((r) => ({
    codigochip: r.codigochip,
    nombre: r.nombremunicipiodepartamento,
    categoria: r.categoria,
    vigencia: r.vigencia,
    limiteGF: parseFloat(r.limitelegalgastodepartamentomunicipio || "0"),
    icldNeto: parseFloat(r.totalicldnetodepartamentomunicipio || "0"),
    gastosFuncionamiento: parseFloat(r.totalgastosfuncionamientodepartamentomunicipio || "0"),
    indicadorLey617: parseFloat(r.indicadorley617gficlddepartamentomunicipio || "0"),
    gastosConcejo: r.gastoscomprometidosconcejo !== "NA" ? parseFloat(r.gastoscomprometidosconcejo || "0") : null,
    gastosPersoneria: r.gastoscomprometidospersoneria !== "NA" ? parseFloat(r.gastoscomprometidospersoneria || "0") : null,
  }));
}

// ---------------------------------------------------------------------------

/** Fetch expense execution by section (Admin Central, Concejo, Personería) for Ley 617 */
export async function fetchGastosPorSeccion(
  chipCode: string,
  periodo: string
): Promise<{
  cod_seccion_presupuestal: string;
  nom_seccion_presupuestal: string;
  cuenta: string;
  nombre_cuenta: string;
  cod_fuentes_financiacion: string;
  nom_fuentes_financiacion: string;
  compromisos: string;
  obligaciones: string;
  pagos: string;
}[]> {
  return sodaCuipoQuery({
    dataset: CUIPO_DATASETS.EJEC_GASTOS,
    select:
      "cod_seccion_presupuestal, nom_seccion_presupuestal, cuenta, nombre_cuenta, cod_fuentes_financiacion, nom_fuentes_financiacion, sum(compromisos) as compromisos, sum(obligaciones) as obligaciones, sum(pagos) as pagos",
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND (cod_vigencia_del_gasto='1' OR cod_vigencia_del_gasto='4') AND cuenta like '2.1%'`,
    group:
      "cod_seccion_presupuestal, nom_seccion_presupuestal, cuenta, nombre_cuenta, cod_fuentes_financiacion, nom_fuentes_financiacion",
    order: "cuenta ASC",
    limit: 50000,
  });
}
