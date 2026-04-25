/**
 * Ley 617/2000 Validation
 *
 * Checks that "gastos de funcionamiento" (operating expenses) funded with
 * ICLD (Ingresos Corrientes de Libre Destinacion) don't exceed legal limits.
 *
 * Legal limits by municipal category (Art. 6):
 * - Especial: 50%
 * - Primera: 65%
 * - Segunda: 70%
 * - Tercera: 70%
 * - Cuarta: 80%
 * - Quinta: 80%
 * - Sexta: 80%
 *
 * Art. 10 (Concejos): Absolute limits calculated via formula (honorarios + gastos generales).
 * Art. 11 (Personerias): Absolute limits in SMLMV (not % of ICLD).
 *
 * ICLD validation: Only income under specific CUIPO account codes counts.
 * The old approach (string-matching "LIBRE DESTINACION") has been replaced
 * with exact account-code + funding-source validation per CGR SI.17 methodology.
 */

import {
  fetchEjecucionIngresos,
  fetchGastosPorSeccion,
  chipToDaneCode,
} from "@/lib/datos-gov-cuipo";

import {
  fetchEjecucionIngresosLocal,
  fetchGastosPorSeccionLocal,
  hasLocalCuipo,
} from "@/lib/cuipo-local-xlsb";

import {
  isICLDCuenta,
  isICLDCuentaConCondiciones,
  isGastoDeducible617ConCondiciones,
  GASTOS_DEDUCIBLES_617,
  GF_FUENTES_VALIDAS,
  LIMITES_ADMIN_CENTRAL,
  LIMITES_PERSONERIA_SMLMV,
  SMLMV_2025,
  calcularLimiteConcejoAnual,
  CONCEJALES_POR_CATEGORIA,
  SESIONES_ORDINARIAS_DEFECTO,
  FONDOS_DEDUCCION_DEFAULT,
  calcularPorcentajeFondos,
  fondoParaCuenta,
  type FondoDeduccionICLD,
} from "@/data/icld-rubros-validos";

import { checkTipoNorma, checkFechaNorma } from "@/data/alertas-icld";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Ley617Section {
  seccion: string;
  gastosFuncionamiento: number;
  icld: number;
  ratio: number;
  /** For Admin Central: percentage limit (0-1). For Concejo/Personeria: not used directly */
  limite: number;
  /** Absolute limit in COP for Concejo/Personeria */
  limiteAbsoluto?: number;
  /** Limit expressed in SMLMV units for Concejo/Personeria */
  limiteSMLMV?: number;
  status: "cumple" | "no_cumple";
  /** Indicates whether limit is a percentage of ICLD or an absolute COP amount */
  tipoLimite: "porcentaje" | "absoluto";
}

export interface AlertaICLDRow {
  cuenta: string;
  nombre: string;
  fuente: string;
  alerta: string;
  valor: number;
}

export interface ICLDDetalleRow {
  cuenta: string;
  nombre: string;
  recaudo: number;
  esValido: boolean;
}

export interface Ley617Result {
  /** Backward compat: alias for icldNeto (used by Ley617Panel) */
  icldTotal: number;
  /** Sum of all income where funding source name is ICLD (before account validation) */
  icldBruto: number;
  /** Sum of income where funding source is ICLD AND account code is valid */
  icldValidado: number;
  /** Deduction amount used for ICLD Neto (max of reportada vs calculada) */
  deduccionFondos: number;
  /** Deduction read from actual CUIPO data (destinación específica fuentes) */
  deduccionReportada: number;
  /** Suma de (% × ICLD Validado) sobre los fondos editables del catálogo */
  deduccionCalculada: number;
  /** Porcentaje total aplicado para deduccionCalculada (suma de fondos) */
  porcentajeFondosTotal: number;
  /** Catálogo de fondos con porcentajes efectivamente usados (defaults o overrides) */
  fondosDeduccion: FondoDeduccionICLD[];
  /** Origen de los datos CUIPO: "local" (archivo .xlsb) o "api" (datos.gov.co) */
  dataSource: "local" | "api";
  /** Σ recaudo de rubros whitelist que fallan condiciones de fuente/norma. = deduccionFondos */
  deduccionFondosPorNorma: number;
  /** Detalle por rubro de deduccionFondosPorNorma con la razón del fallo */
  deduccionFondosPorNormaDetalle: {
    cuenta: string;
    nombre: string;
    fuente: string;
    valor: number;
    razon: string;
  }[];
  /** Σ compromisos en cuentas de gasto mapeadas a los 6 fondos (auxiliar — no usado como deducción) */
  deduccionFondosCompromisos: number;
  /** Desglose auxiliar por fondo de los compromisos */
  deduccionFondosBreakdown: {
    fondoId: string;
    fondoNombre: string;
    valor: number;
    detalle: { cuenta: string; nombre: string; fuente: string; valor: number }[];
  }[];
  /** Detail of each reported deduction fuente */
  deduccionReportadaDetalle: { codigoFuente: string; nombreFuente: string; valor: number }[];
  /** icldValidado - deduccionFondos — the denominator for ratio calculations */
  icldNeto: number;
  /** icldBruto - icldValidado — money in ICLD sources but wrong account codes */
  accionesMejora: number;
  /** Total 2.1.* compromisos for Admin Central (before deductions) */
  gastosFuncionamientoTotal: number;
  /** Sum of deductible expense compromisos (Admin Central only) */
  gastosDeducidos: number;
  /** gastosFuncionamientoTotal - gastosDeducidos (Admin Central only, after deductions) */
  gastosFuncionamientoNeto: number;
  ratioGlobal: number;
  limiteGlobal: number;
  secciones: Ley617Section[];
  /** Detailed breakdown of each deducted expense */
  gastosDeducidosDetalle: { codigo: string; nombre: string; valor: number }[];
  /** ICLD rows flagged with tipoNorma / fechaNorma alerts (D1) */
  alertasICLD: AlertaICLDRow[];
  /** Per-rubro breakdown of ICLD income (valid + invalid accounts) */
  icldDetalle: ICLDDetalleRow[];
  status: "cumple" | "no_cumple";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGlobalLimit(categoria: number): number {
  return LIMITES_ADMIN_CENTRAL[categoria] ?? LIMITES_ADMIN_CENTRAL[6];
}

function isConcejo(seccionName: string): boolean {
  return seccionName.toUpperCase().includes("CONCEJO");
}

function isPersoneria(seccionName: string): boolean {
  return seccionName.toUpperCase().includes("PERSONERIA");
}

function isAdminCentral(seccionName: string): boolean {
  const upper = seccionName.toUpperCase();
  return upper.includes("ADMINISTRACION") || upper.includes("CENTRAL");
}

/**
 * Check if a funding source name corresponds to Rendimientos Financieros (RF).
 * Conservada para uso futuro (alertas / desagregaciones). El cálculo de ICLD
 * Bruto/Validado ya no la usa: la whitelist de 55 cuentas garantiza por sí
 * sola que el rubro sea de libre destinación.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isRendimientosFinancieros(nombreFuente: string): boolean {
  const upper = (nombreFuente || "").toUpperCase().trim();
  return (
    upper.startsWith("R.F.") ||
    upper.startsWith("RF ") ||
    upper.includes("RENDIMIENTOS FINANCIEROS")
  );
}

/**
 * Check if a funding source name corresponds to Recursos del Balance (RB).
 * Conservada para uso futuro. La whitelist de 55 cuentas ya excluye RB por sí.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isRecursosDelBalance(nombreFuente: string): boolean {
  const upper = (nombreFuente || "").toUpperCase().trim();
  return (
    upper.startsWith("R.B.") ||
    upper.startsWith("RB ") ||
    upper.includes("RECURSOS DEL BALANCE")
  );
}

/**
 * Check if a funding source CODE is ICLD or SGP-LD (for gastos filtering).
 * Uses the exact codes from GF_FUENTES_VALIDAS: 1.2.1.0.00 and 1.2.4.3.04.
 */
function isGFFuenteValida(codigoFuente: string): boolean {
  const code = (codigoFuente || "").split(" ")[0].trim();
  return GF_FUENTES_VALIDAS.includes(code);
}

/**
 * Fuente codes that represent destinación específica deductions carved from ICLD.
 * These are legal obligations (Ley 99 ambiental, fondos de gestión riesgo, etc.)
 * whose reported income should be deducted from ICLD to get ICLD Neto.
 */
const FUENTES_DEDUCCION_ICLD = [
  "1.2.3.4.02",  // ICLD LEY 99 - DESTINO AMBIENTAL (Ley 99/1993 Art. 44)
  // NOTE: 1.2.2.0.00 (destinación específica por acto administrativo) was removed —
  // it is too broad and would incorrectly deduct the entire category.
];

// ---------------------------------------------------------------------------
// Main evaluation
// ---------------------------------------------------------------------------

/**
 * Overrides opcionales del catálogo de fondos editables.
 * `fondosOverride` reemplaza el catálogo completo (espera la lista con porcentajes).
 * `fondosPorId` permite parchear sólo algunos fondos por su id (más conveniente
 * cuando el cliente sólo quiere setear algunos valores).
 *
 * `dataSource` controla el origen de los datos CUIPO:
 *   - "auto" (default): usa archivo local si existe (`hasLocalCuipo(periodo)`),
 *     de lo contrario cae al API datos.gov.co.
 *   - "local": fuerza el uso de archivos `.xlsb`/`.xlsx` desde
 *     `process.env.CUIPO_LOCAL_PATH` (default `~/Downloads`).
 *   - "api": fuerza el uso del API datos.gov.co.
 */
export interface Ley617Options {
  fondosOverride?: FondoDeduccionICLD[];
  fondosPorId?: Record<string, { porcentaje?: number; customLabel?: string }>;
  dataSource?: "auto" | "local" | "api";
}

export async function evaluateLey617(
  chipCode: string,
  periodo: string,
  categoriaMunicipal?: number,
  options: Ley617Options = {}
): Promise<Ley617Result> {
  const categoria = categoriaMunicipal ?? 6;
  const limiteGlobal = getGlobalLimit(categoria);

  // Construye el catálogo efectivo de fondos a partir del default + overrides
  const fondosBase = options.fondosOverride ?? FONDOS_DEDUCCION_DEFAULT;
  const fondosDeduccion: FondoDeduccionICLD[] = fondosBase.map((f) => {
    const patch = options.fondosPorId?.[f.id];
    if (!patch) return { ...f };
    return {
      ...f,
      porcentaje: patch.porcentaje !== undefined
        ? Math.max(0, Math.min(1, patch.porcentaje))   // clamp 0..100%
        : f.porcentaje,
      customLabel: patch.customLabel ?? f.customLabel,
    };
  });
  const porcentajeFondosTotal = calcularPorcentajeFondos(fondosDeduccion);

  // -------------------------------------------------------------------------
  // Selección de fuente de datos (local .xlsb vs API datos.gov.co)
  // - "auto": usa local si hay archivo, si no API
  // - "local"/"api": fuerza
  // -------------------------------------------------------------------------
  const dataSource = options.dataSource ?? "auto";
  const useLocal =
    dataSource === "local" ||
    (dataSource === "auto" && hasLocalCuipo(periodo));

  // Para el archivo local los archivos están indexados por DANE (5 dígitos),
  // no por CHIP completo. `chipToDaneCode` toma los últimos 5 dígitos del
  // código CHIP para coincidir.
  const daneCode = chipToDaneCode(chipCode);

  // Fetch CUIPO data in parallel
  const [ingresosRows, gastosPorSeccion] = useLocal
    ? await Promise.all([
        fetchEjecucionIngresosLocal(daneCode, periodo),
        fetchGastosPorSeccionLocal(daneCode, periodo),
      ])
    : await Promise.all([
        fetchEjecucionIngresos(chipCode, periodo),
        fetchGastosPorSeccion(chipCode, periodo),
      ]);

  // -------------------------------------------------------------------------
  // 0. Leaf-row detection: filter out parent/aggregation rows to prevent
  //    double-counting (parent cuenta = sum of children cuentas).
  //    A row is a "leaf" if no other row's cuenta starts with its cuenta + "."
  // -------------------------------------------------------------------------
  const allIngCuentas = new Set(ingresosRows.map(r => (r.cuenta || "").trim()));
  function isLeafIngreso(cuenta: string): boolean {
    const trimmed = cuenta.trim();
    if (!trimmed) return true; // rows without cuenta pass through
    const prefix = trimmed + ".";
    for (const c of allIngCuentas) {
      if (c.startsWith(prefix)) return false;
    }
    return true;
  }
  const ingresosLeaf = ingresosRows.filter(r => isLeafIngreso((r.cuenta || "").trim()));

  // -------------------------------------------------------------------------
  // 1. Calculate ICLD: bruto, validado, acciones de mejora, neto
  // -------------------------------------------------------------------------
  let icldBruto = 0;
  let icldValidado = 0;
  const icldDetalle: ICLDDetalleRow[] = [];

  // C2: Collect reported deductions from destinación específica fuentes
  let deduccionReportada = 0;
  const deduccionReportadaDetalle: { codigoFuente: string; nombreFuente: string; valor: number }[] = [];

  // ──────────────────────────────────────────────────────────────────────
  // Deducción Fondos (POR NORMA — modo principal):
  //   Σ recaudo de filas cuya cuenta está en la whitelist de 55 rubros
  //   ICLD pero que fallan alguna de las 3 condiciones:
  //     - fuente ∈ {1.2.1.0.00 ICLD, 1.2.4.3.04 SGP-LD}
  //     - tipoNorma  contiene "NO APLICA"
  //     - fechaNorma = "NO APLICA"  (también número de norma)
  //   Es decir: rubros que parecen ICLD por la cuenta, pero tienen una
  //   destinación específica por norma (acuerdo, ley, etc.) que los saca
  //   del ICLD efectivo. Equivale a `icldBruto - icldValidado`.
  // ──────────────────────────────────────────────────────────────────────
  let deduccionFondosPorNorma = 0;
  const deduccionFondosPorNormaDetalle: {
    cuenta: string;
    nombre: string;
    fuente: string;
    valor: number;
    razon: string;
  }[] = [];

  // ──────────────────────────────────────────────────────────────────────
  // Deducción Fondos (COMPROMISOS — Opción B, métrica auxiliar):
  //   Σ compromisos en cuentas de gasto mapeadas a los 6 fondos del
  //   catálogo, financiados con ICLD/SGP-LD. Sirve como referencia
  //   cruzada (cuánto efectivamente fluye a fondos vía gasto), pero NO
  //   se usa como deducción principal.
  // ──────────────────────────────────────────────────────────────────────
  let deduccionFondosCompromisos = 0;
  const deduccionFondosBreakdown: Record<string, {
    fondoId: string;
    fondoNombre: string;
    valor: number;
    detalle: { cuenta: string; nombre: string; fuente: string; valor: number }[];
  }> = {};
  for (const f of fondosDeduccion) {
    deduccionFondosBreakdown[f.id] = {
      fondoId: f.id,
      fondoNombre: f.nombre,
      valor: 0,
      detalle: [],
    };
  }

  for (const row of ingresosLeaf) {
    const fuenteNombre = row.nom_fuentes_financiacion || "";
    const fuenteCodigo = (row.cod_fuentes_financiacion || "").split(" ")[0].trim();
    const cuenta = (row.cuenta || "").trim();
    const recaudo = parseFloat(row.total_recaudo || "0");

    // ──────────────────────────────────────────────────────────────────────
    // Deducción reportada — recaudo en fuentes de destinación específica
    // (carved del ICLD por norma, p.ej. Ley 99/93 ambiental). Se acumula
    // independientemente del filtro de bruto.
    // ──────────────────────────────────────────────────────────────────────
    if (FUENTES_DEDUCCION_ICLD.includes(fuenteCodigo) && recaudo > 0) {
      deduccionReportada += recaudo;
      const existing = deduccionReportadaDetalle.find(
        (d) => d.codigoFuente === fuenteCodigo
      );
      if (existing) {
        existing.valor += recaudo;
      } else {
        deduccionReportadaDetalle.push({
          codigoFuente: fuenteCodigo,
          nombreFuente: fuenteNombre,
          valor: recaudo,
        });
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // Lectura de campos de norma (vienen sólo en uploads CUIPO directos;
    // el API datos.gov.co no los expone)
    // ──────────────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowAny = row as unknown as Record<string, any>;
    const tipoNormaRow = typeof rowAny.tipo_norma === "string"
      ? (rowAny.tipo_norma as string)
      : (typeof rowAny.tipoNorma === "string" ? (rowAny.tipoNorma as string) : undefined);
    const fechaNormaRow = typeof rowAny.fecha_norma === "string"
      ? (rowAny.fecha_norma as string)
      : (typeof rowAny.fechaNorma === "string" ? (rowAny.fechaNorma as string) : undefined);

    // ──────────────────────────────────────────────────────────────────────
    // ICLD Bruto — única condición: la cuenta es uno de los 55 códigos
    // CUIPO de la whitelist (`ICLD_CUENTAS_VALIDAS`). No se filtra por
    // fuente ni se excluyen RF/RB; la whitelist ya garantiza que sólo
    // entran rubros que por naturaleza son de libre destinación.
    // ──────────────────────────────────────────────────────────────────────
    if (!isICLDCuenta(cuenta)) continue;
    icldBruto += recaudo;

    // ──────────────────────────────────────────────────────────────────────
    // ICLD Validado — bruto + 3 condiciones de Johan (TAREAS.xlsx):
    //   ① fuente ∈ {1.2.1.0.00 ICLD, 1.2.4.3.04 SGP-LD}
    //   ② tipoNorma  contiene "NO APLICA"
    //   ③ fechaNorma = "NO APLICA"
    // ──────────────────────────────────────────────────────────────────────
    const validacion = isICLDCuentaConCondiciones(
      cuenta,
      fuenteCodigo,
      tipoNormaRow,
      fechaNormaRow
    );
    const esValido = validacion.valida;
    if (esValido) {
      icldValidado += recaudo;
    } else if (recaudo > 0) {
      // Falló alguna condición → entra a la deducción de fondos por norma.
      // Razón: rubro está en la whitelist (cuenta válida ICLD), pero ya sea
      // la fuente NO es ICLD/SGP-LD, o algún campo de norma (tipo, fecha,
      // número) NO contiene "NO APLICA" — i.e. tiene una destinación
      // específica que la saca del ICLD efectivo.
      deduccionFondosPorNorma += recaudo;
      deduccionFondosPorNormaDetalle.push({
        cuenta,
        nombre: row.nombre_cuenta || cuenta,
        fuente: fuenteNombre,
        valor: recaudo,
        razon: validacion.errores.join("; "),
      });
    }

    // Collect per-rubro ICLD detail for Excel export
    if (recaudo > 0) {
      icldDetalle.push({
        cuenta: (row.cuenta || "").trim(),
        nombre: row.nombre_cuenta || row.cuenta || "",
        recaudo,
        esValido,
      });
    }
  }

  const accionesMejora = icldBruto - icldValidado;

  // -------------------------------------------------------------------------
  // D1: Scan ICLD rows for tipoNorma / fechaNorma alert conditions
  // The API (datos.gov.co) does not include these fields, so alertas will
  // only populate when CUIPO files are uploaded directly with those columns.
  // -------------------------------------------------------------------------
  const alertasICLD: AlertaICLDRow[] = [];
  for (const row of ingresosLeaf) {
    const fuenteCodigo = (row.cod_fuentes_financiacion || "").split(" ")[0].trim();
    const fuenteNombre = row.nom_fuentes_financiacion || "";
    // Las alertas se evalúan sobre cuentas ICLD válidas (mismo criterio que el bruto)
    if (!isICLDCuenta((row.cuenta || "").trim())) continue;

    const recaudo = parseFloat(row.total_recaudo || "0");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowAny = row as Record<string, any>;
    const tipoNorma = rowAny.tipo_norma ?? rowAny.tipoNorma;
    const fechaNorma = rowAny.fecha_norma ?? rowAny.fechaNorma;

    const alertaMsgs: string[] = [];

    if (tipoNorma !== undefined && typeof tipoNorma === "string") {
      const alerta = checkTipoNorma(tipoNorma, fuenteCodigo);
      if (alerta) {
        alertaMsgs.push(`Tipo norma "${tipoNorma}" — ${alerta.descripcion}`);
      }
    }

    if (fechaNorma !== undefined && typeof fechaNorma === "string") {
      const alerta = checkFechaNorma(fechaNorma, fuenteCodigo);
      if (alerta) {
        alertaMsgs.push(`Fecha norma "${fechaNorma}" — ${alerta.descripcion}`);
      }
    }

    if (alertaMsgs.length > 0) {
      alertasICLD.push({
        cuenta: row.cuenta || "",
        nombre: row.nombre_cuenta || "",
        fuente: fuenteNombre,
        alerta: alertaMsgs.join("; "),
        valor: recaudo,
      });
    }
  }

  // Deducción Calculada (modo manual %) = Σ (% por fondo) × ICLD Validado.
  // Sólo se usa como fallback cuando la deducción por compromisos es 0.
  const deduccionCalculada = icldValidado * porcentajeFondosTotal;
  // NOTA: la deducción real (Opción B) y `icldNeto` se calculan más abajo,
  // después de iterar gastos para acumular `deduccionFondosCompromisos`.

  // -------------------------------------------------------------------------
  // 2. Aggregate operating expenses (cuenta starts with "2.1") by section,
  //    filtered to ICLD/SGP-LD funding sources only (by fuente CODE).
  //    fetchGastosPorSeccion filters for cuenta like '2.1%' and
  //    cod_vigencia_del_gasto in ('1','4') (vigencia actual + vigencias futuras).
  //    It returns individual account rows (with `cuenta`) for deduction matching.
  // -------------------------------------------------------------------------
  // Leaf-row detection for gastos (same logic as ingresos)
  const allGasCuentas = new Set(gastosPorSeccion.map(r => (r.cuenta || "").trim()));
  function isLeafGasto(cuenta: string): boolean {
    const trimmed = cuenta.trim();
    if (!trimmed) return true;
    const prefix = trimmed + ".";
    for (const c of allGasCuentas) {
      if (c.startsWith(prefix)) return false;
    }
    return true;
  }
  const gastosPorSeccionLeaf = gastosPorSeccion.filter(r => isLeafGasto((r.cuenta || "").trim()));

  const seccionMap = new Map<
    string,
    {
      gastos: number;
      gastosDeducidos: number;
      seccionCode: string;
      deducidosDetalle: { codigo: string; nombre: string; valor: number }[];
    }
  >();

  for (const row of gastosPorSeccionLeaf) {
    // C3: Only count expenses funded by ICLD/SGP-LD — check fuente CODE, not just name
    const fuenteCodigo = row.cod_fuentes_financiacion || "";
    if (!isGFFuenteValida(fuenteCodigo)) continue;

    const seccionName = row.nom_seccion_presupuestal || "SIN SECCION";
    const compromisos = parseFloat(row.compromisos || "0");
    const cuenta = row.cuenta || "";

    const existing = seccionMap.get(seccionName) || {
      gastos: 0,
      gastosDeducidos: 0,
      seccionCode: row.cod_seccion_presupuestal || "",
      deducidosDetalle: [],
    };

    existing.gastos += compromisos;

    // C4: Use conditional deduction check — 2.1.2.02.02.007 only deducts if fuente != ICLD/SGP-LD
    if (isGastoDeducible617ConCondiciones(cuenta, fuenteCodigo) && compromisos > 0) {
      existing.gastosDeducidos += compromisos;
      // Find the canonical name from GASTOS_DEDUCIBLES_617
      const gastoInfo = GASTOS_DEDUCIBLES_617.find(
        (g) => g.codigo === cuenta.trim()
      );
      existing.deducidosDetalle.push({
        codigo: cuenta.trim(),
        nombre: gastoInfo?.nombre || row.nombre_cuenta || cuenta,
        valor: compromisos,
      });
    }

    // ──────────────────────────────────────────────────────────────────────
    // Deducción Fondos (Opción B) — atribuye este compromiso al fondo cuyo
    // prefijo de cuenta es el más largo que matchea la cuenta actual.
    // Sólo cuenta si el gasto se financió con ICLD/SGP-LD (mismo filtro
    // que ya aplicó arriba). El resultado se acumula independiente de la
    // sección presupuestal.
    // ──────────────────────────────────────────────────────────────────────
    if (compromisos > 0) {
      const fondo = fondoParaCuenta(cuenta.trim(), fondosDeduccion);
      if (fondo) {
        deduccionFondosCompromisos += compromisos;
        const bucket = deduccionFondosBreakdown[fondo.id];
        bucket.valor += compromisos;
        bucket.detalle.push({
          cuenta: cuenta.trim(),
          nombre: row.nombre_cuenta || cuenta,
          fuente: fuenteCodigo,
          valor: compromisos,
        });
      }
    }

    seccionMap.set(seccionName, existing);
  }

  // -------------------------------------------------------------------------
  // 2.5. Deducción Fondos (USADA) — modo principal: POR NORMA
  //   = Σ recaudo de rubros en whitelist que NO cumplen las condiciones
  //     de fuente o norma. Equivale a `icldBruto - icldValidado`.
  //   Las otras métricas (compromisos B, reportada, calculada %) se
  //   exponen como auxiliares en el resultado pero NO impactan icldNeto.
  // -------------------------------------------------------------------------
  const deduccionFondos = deduccionFondosPorNorma;
  const icldNeto = icldValidado - deduccionFondos;

  // -------------------------------------------------------------------------
  // 3. Build per-section results
  // -------------------------------------------------------------------------
  const secciones: Ley617Section[] = [];
  let gastosFuncionamientoTotal = 0;
  let gastosDeducidosTotal = 0;
  const gastosDeducidosDetalle: { codigo: string; nombre: string; valor: number }[] = [];

  for (const [seccionName, data] of seccionMap.entries()) {
    // For Admin Central, use net expenses (after deductions)
    const isAdmin = isAdminCentral(seccionName);
    const gastosForRatio = isAdmin
      ? data.gastos - data.gastosDeducidos
      : data.gastos;

    gastosFuncionamientoTotal += data.gastos;

    if (isAdmin) {
      gastosDeducidosTotal += data.gastosDeducidos;
      gastosDeducidosDetalle.push(...data.deducidosDetalle);
    }

    // Use icldNeto as denominator for ratio calculations
    const ratio = icldNeto > 0 ? gastosForRatio / icldNeto : 0;

    if (isConcejo(seccionName)) {
      // Art. 10: Use calcularLimiteConcejoAnual formula
      // TODO: Accept numConcejales and numSesiones as user input.
      // Fallback: use category-based defaults from Ley 136/1994.
      const numConcejales = CONCEJALES_POR_CATEGORIA[categoria] ?? CONCEJALES_POR_CATEGORIA[6];
      const numSesiones = SESIONES_ORDINARIAS_DEFECTO;
      const concejoLimite = calcularLimiteConcejoAnual(
        icldNeto,
        numConcejales,
        numSesiones
      );
      const limiteAbsoluto = concejoLimite.total;
      const limiteSMLMV = Math.round(limiteAbsoluto / SMLMV_2025);

      secciones.push({
        seccion: seccionName,
        gastosFuncionamiento: data.gastos,
        icld: icldNeto,
        ratio: Math.round(ratio * 10000) / 10000,
        limite: 0, // not applicable for absolute limits
        limiteAbsoluto,
        limiteSMLMV,
        status: data.gastos <= limiteAbsoluto ? "cumple" : "no_cumple",
        tipoLimite: "absoluto",
      });
    } else if (isPersoneria(seccionName)) {
      // Art. 11: Absolute limit in SMLMV
      const limiteSMLMV =
        LIMITES_PERSONERIA_SMLMV[categoria] ?? LIMITES_PERSONERIA_SMLMV[6];
      const limiteAbsoluto = limiteSMLMV * SMLMV_2025;

      secciones.push({
        seccion: seccionName,
        gastosFuncionamiento: data.gastos,
        icld: icldNeto,
        ratio: Math.round(ratio * 10000) / 10000,
        limite: 0, // not applicable for absolute limits
        limiteAbsoluto,
        limiteSMLMV,
        status: data.gastos <= limiteAbsoluto ? "cumple" : "no_cumple",
        tipoLimite: "absoluto",
      });
    } else {
      // Admin Central & others: Art. 6 percentage limit
      // For Admin Central, ratio uses net expenses (after deductions)
      secciones.push({
        seccion: seccionName,
        gastosFuncionamiento: isAdmin ? gastosForRatio : data.gastos,
        icld: icldNeto,
        ratio: Math.round(ratio * 10000) / 10000,
        limite: limiteGlobal,
        status: ratio <= limiteGlobal ? "cumple" : "no_cumple",
        tipoLimite: "porcentaje",
      });
    }
  }

  // Sort sections: Administracion Central first, then alphabetical
  secciones.sort((a, b) => {
    const aIsAdmin = isAdminCentral(a.seccion);
    const bIsAdmin = isAdminCentral(b.seccion);
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;
    return a.seccion.localeCompare(b.seccion);
  });

  // -------------------------------------------------------------------------
  // 4. Global ratio (Art. 6 — Admin Central net expenses / icldNeto only)
  //    Concejo and Personería have their own absolute limits (Art. 10, 11)
  //    and must NOT inflate the Art. 6 percentage ratio.
  // -------------------------------------------------------------------------
  const adminSection = secciones.find(
    (s) => !isConcejo(s.seccion) && !isPersoneria(s.seccion)
  );
  const gastosFuncionamientoNeto = adminSection
    ? adminSection.gastosFuncionamiento
    : gastosFuncionamientoTotal - gastosDeducidosTotal;
  const ratioGlobal =
    icldNeto > 0 ? gastosFuncionamientoNeto / icldNeto : 0;
  const ratioGlobalRounded = Math.round(ratioGlobal * 10000) / 10000;

  const globalCumple = ratioGlobal <= limiteGlobal;
  const allSectionsCumple = secciones.every((s) => s.status === "cumple");

  return {
    // Backward compat: icldTotal = icldNeto (so Ley617Panel still works)
    icldTotal: icldNeto,
    dataSource: useLocal ? "local" : "api",
    // New detailed ICLD fields
    icldBruto,
    icldValidado,
    deduccionFondos,
    deduccionReportada,
    deduccionCalculada,
    porcentajeFondosTotal,
    fondosDeduccion,
    deduccionFondosPorNorma,
    deduccionFondosPorNormaDetalle,
    deduccionFondosCompromisos,
    deduccionFondosBreakdown: Object.values(deduccionFondosBreakdown),
    deduccionReportadaDetalle,
    icldNeto,
    accionesMejora,
    // Expense fields
    gastosFuncionamientoTotal,
    gastosDeducidos: gastosDeducidosTotal,
    gastosFuncionamientoNeto,
    // Ratios
    ratioGlobal: ratioGlobalRounded,
    limiteGlobal,
    secciones,
    gastosDeducidosDetalle,
    alertasICLD,
    icldDetalle: icldDetalle.sort((a, b) => a.cuenta.localeCompare(b.cuenta)),
    status: globalCumple && allSectionsCumple ? "cumple" : "no_cumple",
  };
}
