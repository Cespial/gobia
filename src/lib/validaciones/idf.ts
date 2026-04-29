/**
 * IDF Calculation -- Nuevo Indice de Desempeno Fiscal (DNP)
 *
 * Formula: (80% * Resultados Fiscales) + (20% * Gestion Financiera)
 *
 * Resultados Fiscales (5 indicators):
 * 1. Dependencia transferencias: (SGP + Otras Transferencias) / Ingresos Totales
 * 2. Relevancia FBK: Formacion Bruta Capital / Gastos Inversion
 * 3. Endeudamiento LP: placeholder (needs CGN balance data)
 * 4. Ahorro corriente: (Ingresos Corrientes - Gastos Corrientes) / Ingresos Corrientes
 * 5. Balance fiscal primario: placeholder
 *
 * Gestion Financiera (3 indicators):
 * 1. Capacidad programacion ingresos: Recaudo / Presupuesto Inicial (own revenues)
 * 2. Ejecucion compromisos: Compromisos / Apropiacion Definitiva
 * 3. Cumplimiento Ley 617: ratio from Ley617 evaluation
 */

import {
  sodaCuipoQuery,
  CUIPO_DATASETS,
  parseCuipoAmount,
  filterLeafRows,
  type CuipoEjecIngresos,
  type CuipoEjecGastos,
  type CuipoProgGastos,
} from "@/lib/datos-gov-cuipo";
import type { CuipoProgIngresosRow } from "@/lib/chip-parser";
import { sumProgramacionUploadByPrefixes } from "@/lib/cuipo-processor";
import { evaluateLey617 } from "@/lib/validaciones/ley617";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IDFIndicator {
  name: string;
  value: number;
  score: number | null; // 0-100 normalized, null when data not available
  interpretation: string;
}

export interface IDFResult {
  resultadosFiscales: IDFIndicator[];
  gestionFinanciera: IDFIndicator[];
  scoreResultados: number;
  scoreGestion: number;
  idfTotal: number; // 0-100
  ranking: string; // 'Sobresaliente' | 'Satisfactorio' | 'Medio' | 'Bajo' | 'Critico'
  status: "cumple" | "parcial" | "no_cumple";
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

/**
 * For indicators where LOWER is better (e.g. dependency on transfers,
 * debt ratio), a lower raw value yields a higher score.
 * Range: 0% -> score 100, 100% -> score 0 (linear).
 */
function normalizeInverse(ratio: number): number {
  const clamped = Math.max(0, Math.min(1, ratio));
  return Math.round((1 - clamped) * 100);
}

/**
 * For indicators where HIGHER is better (e.g. savings, execution rate),
 * a higher raw value yields a higher score.
 * Range: 0% -> score 0, 100% -> score 100 (linear, capped).
 */
function normalizeDirect(ratio: number): number {
  const clamped = Math.max(0, Math.min(1, ratio));
  return Math.round(clamped * 100);
}

/**
 * For programming capacity: optimal is 100% (recaudo matches budget).
 * Deviation in either direction penalizes.
 * Score = 100 - |deviation| * 100, floored at 0.
 */
function normalizeProgramming(ratio: number): number {
  const deviation = Math.abs(ratio - 1);
  return Math.max(0, Math.round((1 - deviation) * 100));
}

function safeDivide(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

function getRanking(
  idf: number
): "Sobresaliente" | "Satisfactorio" | "Medio" | "Bajo" | "Critico" {
  if (idf >= 80) return "Sobresaliente";
  if (idf >= 70) return "Satisfactorio";
  if (idf >= 60) return "Medio";
  if (idf >= 40) return "Bajo";
  return "Critico";
}

function interpretDependencia(ratio: number): string {
  if (ratio > 0.7) return "Alta dependencia de transferencias nacionales";
  if (ratio > 0.5) return "Dependencia moderada de transferencias";
  return "Baja dependencia, buena generacion de recursos propios";
}

function interpretFBK(ratio: number): string {
  if (ratio > 0.5) return "Alta proporcion de inversion en formacion de capital";
  if (ratio > 0.25) return "Proporcion moderada de formacion bruta de capital";
  return "Baja formacion de capital respecto a inversion total";
}

function interpretAhorro(ratio: number): string {
  if (ratio > 0.3) return "Excelente capacidad de ahorro corriente";
  if (ratio > 0.1) return "Capacidad de ahorro corriente aceptable";
  if (ratio > 0) return "Margen de ahorro corriente reducido";
  return "Desahorro corriente: gastos corrientes superan ingresos corrientes";
}

function interpretProgramacion(ratio: number): string {
  if (ratio > 1.1) return "Recaudo supera significativamente lo presupuestado";
  if (ratio >= 0.9) return "Buena capacidad de programacion presupuestal";
  if (ratio >= 0.7) return "Programacion presupuestal aceptable";
  return "Baja capacidad de programacion: recaudo muy inferior al presupuesto";
}

function interpretEjecucion(ratio: number): string {
  if (ratio >= 0.9) return "Excelente ejecucion de compromisos";
  if (ratio >= 0.7) return "Ejecucion de compromisos aceptable";
  if (ratio >= 0.5) return "Ejecucion de compromisos baja";
  return "Muy baja ejecucion de compromisos presupuestales";
}

// ---------------------------------------------------------------------------
// Account classification helpers
// ---------------------------------------------------------------------------

/** Income account "1.1" = Ingresos corrientes */
function isIngresoCorriente(cuenta: string): boolean {
  return cuenta.startsWith("1.1");
}

/** Transfer income corrientes: "1.1.02" = Transferencias corrientes */
function isTransferenciaCorriente(cuenta: string): boolean {
  return cuenta.startsWith("1.1.02");
}

/** Transfer income capital: "1.2.02" = Transferencias de Capital */
function isTransferenciaCapital(cuenta: string): boolean {
  return cuenta.startsWith("1.2.02");
}

/** Debt service expenses: "2.2" = Servicio de la deuda */
function isServicioDeuda(cuenta: string): boolean {
  return cuenta.startsWith("2.2");
}

/** Credit income: "1.2.01" = Recursos del crédito */
function isIngresoCreditoInterno(cuenta: string): boolean {
  return cuenta.startsWith("1.2.01");
}

/** Own revenue: "1.1.01" = Ingresos tributarios + "1.1.03" = No tributarios (excluding transfers) */
function isIngresoPropioForProgramming(cuenta: string): boolean {
  return cuenta.startsWith("1.1.01") || cuenta.startsWith("1.1.03");
}

/** Operating expenses: "2.1" = Gastos corrientes / funcionamiento */
function isGastoCorriente(cuenta: string): boolean {
  return cuenta.startsWith("2.1");
}

/** Investment expenses: "2.3" = Gastos de inversion */
function isGastoInversion(cuenta: string): boolean {
  return cuenta.startsWith("2.3");
}

/**
 * Formacion Bruta de Capital within investment.
 * Account "2.3.2" or sometimes "2.3.02" depending on CUIPO coding.
 */
function isFormacionBrutaCapital(cuenta: string): boolean {
  return cuenta.startsWith("2.3.2") || cuenta.startsWith("2.3.02");
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

export async function calculateIDF(
  chipCode: string,
  periodo: string,
  cgnSaldos?: { activos: number; pasivos: number; rows?: { codigo: string; nombre: string; saldoFinal: number }[] } | null,
  progIngresosUpload?: CuipoProgIngresosRow[] | null,
  precomputedLey617?: import("@/lib/validaciones/ley617").Ley617Result | null,
): Promise<IDFResult> {
  // Fetch all required CUIPO data in parallel
  const [ejecIngresos, ejecGastos, progGastos, ley617Result] =
    await Promise.all([
      sodaCuipoQuery<CuipoEjecIngresos>({
        dataset: CUIPO_DATASETS.EJEC_INGRESOS,
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}'`,
        limit: 50000,
        order: "cuenta ASC",
      }),
      sodaCuipoQuery<CuipoEjecGastos>({
        dataset: CUIPO_DATASETS.EJEC_GASTOS,
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND nom_vigencia_del_gasto='VIGENCIA ACTUAL'`,
        limit: 50000,
        order: "cuenta ASC",
      }),
      sodaCuipoQuery<CuipoProgGastos>({
        dataset: CUIPO_DATASETS.PROG_GASTOS,
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND nom_vigencia_del_gasto='VIGENCIA ACTUAL'`,
        limit: 50000,
        order: "cuenta ASC",
      }),
      // Use precomputed Ley617 result when available (avoids double-fetch with different data sources)
      precomputedLey617 !== undefined
        ? Promise.resolve(precomputedLey617)
        : evaluateLey617(chipCode, periodo).catch(() => null),
    ]);

  // ---------------------------------------------------------------------------
  // Leaf-row detection: only aggregate the most detailed level available
  // ---------------------------------------------------------------------------
  const leafIngresos = filterLeafRows(ejecIngresos, r => r.cuenta || "");
  const leafGastos = filterLeafRows(ejecGastos, r => r.cuenta || "");

  // ---------------------------------------------------------------------------
  // Aggregate income execution (leaf rows only)
  // ---------------------------------------------------------------------------
  let ingresosTotales = 0;
  let ingresosCorrientes = 0;
  let ingresosTransferenciasCorrientes = 0;
  let ingresosTransferenciasCapital = 0;
  let ingresosCredito = 0;
  let ingresosPropiosRecaudo = 0; // For programming capacity

  for (const row of leafIngresos) {
    const cuenta = row.cuenta || "";

    const recaudo = parseFloat(row.total_recaudo || "0");

    ingresosTotales += recaudo;

    if (isIngresoCorriente(cuenta)) {
      ingresosCorrientes += recaudo;
    }
    if (isTransferenciaCorriente(cuenta)) {
      ingresosTransferenciasCorrientes += recaudo;
    }
    if (isTransferenciaCapital(cuenta)) {
      ingresosTransferenciasCapital += recaudo;
    }
    if (isIngresoCreditoInterno(cuenta)) {
      ingresosCredito += recaudo;
    }
    if (isIngresoPropioForProgramming(cuenta)) {
      ingresosPropiosRecaudo += recaudo;
    }
  }

  // Total transfers = corrientes + capital
  const ingresosTransferencias =
    ingresosTransferenciasCorrientes + ingresosTransferenciasCapital;

  // ---------------------------------------------------------------------------
  // Aggregate expense execution (leaf rows only)
  // ---------------------------------------------------------------------------
  let gastosCorrientes = 0;
  let gastosInversion = 0;
  let formacionBrutaCapital = 0;
  let compromisosTotal = 0;
  let servicioDeuda = 0;

  for (const row of leafGastos) {
    const cuenta = row.cuenta || "";

    const compromisos = parseFloat(row.compromisos || "0");

    compromisosTotal += compromisos;

    if (isGastoCorriente(cuenta)) {
      gastosCorrientes += compromisos;
    }
    if (isGastoInversion(cuenta)) {
      gastosInversion += compromisos;
    }
    if (isFormacionBrutaCapital(cuenta)) {
      formacionBrutaCapital += compromisos;
    }
    if (isServicioDeuda(cuenta)) {
      servicioDeuda += compromisos;
    }
  }

  // ---------------------------------------------------------------------------
  // Aggregate programming data (leaf rows only)
  // ---------------------------------------------------------------------------
  const leafProgGastos = filterLeafRows(progGastos, r => r.cuenta || "");

  const programacionPropios = sumProgramacionUploadByPrefixes(
    progIngresosUpload,
    ["1.1.01", "1.1.03"],
    "presupuestoInicial"
  );
  const presupuestoInicialPropios = programacionPropios.total ?? 0;

  let apropiacionDefinitivaTotal = 0;
  for (const row of leafProgGastos) {
    apropiacionDefinitivaTotal += parseCuipoAmount(row.apropiacion_definitiva);
  }

  // ---------------------------------------------------------------------------
  // RESULTADOS FISCALES (5 indicators)
  // ---------------------------------------------------------------------------

  // 1. Dependencia transferencias
  const depTransRatio = safeDivide(
    ingresosTransferencias,
    ingresosTotales
  );
  const depTransScore = normalizeInverse(depTransRatio);

  // 2. Relevancia FBK
  const fbkRatio = safeDivide(formacionBrutaCapital, gastosInversion);
  const fbkScore = normalizeDirect(fbkRatio);

  // 3. Endeudamiento LP — prefer specific debt accounts (2.2 + 2.3) from CGN rows
  let deudaFinanciera = 0;
  let deudaLabel = "Capacidad de endeudamiento";

  if (cgnSaldos?.rows && cgnSaldos.rows.length > 0) {
    for (const row of cgnSaldos.rows) {
      const code = (row.codigo || "").trim();
      if (code === "2.2" || code === "2.3") {
        deudaFinanciera += row.saldoFinal ?? 0;
      }
    }
    deudaLabel = "Endeudamiento (deuda financiera / ingresos corrientes)";
  } else if (cgnSaldos) {
    // Fallback: generic pasivos/activos
    deudaFinanciera = cgnSaldos.pasivos;
    deudaLabel = "Endeudamiento (pasivos / activos)";
  }

  const hasDeuda = deudaFinanciera > 0 && (cgnSaldos?.rows ? ingresosCorrientes > 0 : (cgnSaldos?.activos ?? 0) > 0);
  const deudaRatio = hasDeuda
    ? (cgnSaldos?.rows ? deudaFinanciera / ingresosCorrientes : deudaFinanciera / cgnSaldos!.activos)
    : 0;
  const deudaScore: number | null = cgnSaldos ? normalizeInverse(deudaRatio) : null;

  // 4. Ahorro corriente
  const ahorroCorrienteRatio = safeDivide(
    ingresosCorrientes - gastosCorrientes,
    ingresosCorrientes
  );
  const ahorroScore = normalizeDirect(
    Math.max(0, ahorroCorrienteRatio)
  );

  // 5. Balance fiscal primario
  //    Formula: (Ingresos totales - Crédito) - (Gastos totales - Servicio deuda)
  //    Ratio:   Balance primario / (Ingresos totales - Crédito)
  //    If credit/debt separation not available, fall back to simplified formula
  const ingresosNetos = ingresosTotales - ingresosCredito; // Ingresos sin crédito
  const gastosNetos = compromisosTotal - servicioDeuda; // Gastos sin servicio deuda
  const balancePrimario = ingresosNetos - gastosNetos;

  // Use the proper formula when debt components are identifiable
  const hasDebtBreakdown = ingresosCredito > 0 || servicioDeuda > 0;
  const balancePrimarioRatio = hasDebtBreakdown
    ? safeDivide(balancePrimario, ingresosNetos)
    : safeDivide(ingresosTotales - compromisosTotal, ingresosTotales);
  const balanceScore = normalizeDirect(
    Math.max(0, balancePrimarioRatio)
  );
  const balanceLabel = hasDebtBreakdown
    ? "Balance fiscal primario"
    : "Balance fiscal (simplificado)";

  const resultadosFiscales: IDFIndicator[] = [
    {
      name: "Dependencia de transferencias",
      value: Math.round(depTransRatio * 10000) / 100,
      score: depTransScore,
      interpretation: interpretDependencia(depTransRatio),
    },
    {
      name: "Relevancia formacion bruta de capital",
      value: Math.round(fbkRatio * 10000) / 100,
      score: fbkScore,
      interpretation: interpretFBK(fbkRatio),
    },
    {
      name: deudaLabel,
      value: Math.round(deudaRatio * 10000) / 100,
      score: deudaScore,
      interpretation: !cgnSaldos
        ? "No disponible \u2014 requiere CGN Saldos"
        : deudaFinanciera === 0
        ? "Sin deuda financiera reportada (CGN 2.2 + 2.3 = 0)"
        : deudaRatio > 0.5 ? "Alto endeudamiento relativo a ingresos"
        : deudaRatio > 0.3 ? "Endeudamiento moderado"
        : "Bajo endeudamiento, buena capacidad",
    },
    {
      name: "Ahorro corriente",
      value: Math.round(ahorroCorrienteRatio * 10000) / 100,
      score: ahorroScore,
      interpretation: interpretAhorro(ahorroCorrienteRatio),
    },
    {
      name: balanceLabel,
      value: Math.round(balancePrimarioRatio * 10000) / 100,
      score: balanceScore,
      interpretation:
        balancePrimarioRatio >= 0
          ? "Balance primario positivo"
          : "Balance primario negativo",
    },
  ];

  // ---------------------------------------------------------------------------
  // GESTION FINANCIERA (3 indicators)
  // ---------------------------------------------------------------------------

  // 1. Capacidad de programacion de ingresos
  const progCapRatio = safeDivide(
    ingresosPropiosRecaudo,
    presupuestoInicialPropios
  );
  const progCapScore = programacionPropios.hasData
    ? (presupuestoInicialPropios > 0 ? normalizeProgramming(progCapRatio) : 0)
    : null;

  // 2. Ejecucion de compromisos
  const ejecCompRatio = safeDivide(
    compromisosTotal,
    apropiacionDefinitivaTotal
  );
  const ejecCompScore = normalizeDirect(ejecCompRatio);

  // 3. Nivel de holgura Ley 617 — holgura = limite - ratio (higher is better)
  const ley617Limite = ley617Result ? ley617Result.limiteGlobal : 0.8;
  const ley617Ratio = ley617Result ? ley617Result.ratioGlobal : 0.8;
  const holgura = Math.max(0, ley617Limite - ley617Ratio);
  // Score: higher holgura = better. Normalized over the full limit range.
  const ley617Score = ley617Limite > 0 ? normalizeDirect(holgura / ley617Limite) : 0;

  const gestionFinanciera: IDFIndicator[] = [
    {
      name: "Capacidad de programacion de ingresos",
      value: Math.round(progCapRatio * 10000) / 100,
      score: progCapScore,
      interpretation: !programacionPropios.hasData
        ? "No disponible — requiere archivo CHIP PROG_ING"
        : presupuestoInicialPropios > 0
        ? interpretProgramacion(progCapRatio)
        : "Presupuesto inicial de ingresos propios reportado en 0 en el archivo CHIP",
    },
    {
      name: "Ejecucion de compromisos",
      value: Math.round(ejecCompRatio * 10000) / 100,
      score: ejecCompScore,
      interpretation: interpretEjecucion(ejecCompRatio),
    },
    {
      name: "Nivel de holgura Ley 617",
      value: Math.round(holgura * 10000) / 100,
      score: ley617Score,
      interpretation:
        holgura > 0.3 ? "Amplia holgura respecto al limite de Ley 617"
        : holgura > 0.1 ? "Holgura moderada respecto al limite de Ley 617"
        : holgura > 0 ? "Holgura reducida — cerca del limite legal"
        : "Sin holgura — gastos de funcionamiento igualan o superan el limite",
    },
  ];

  // ---------------------------------------------------------------------------
  // Composite IDF Score
  // ---------------------------------------------------------------------------

  // Average each group — exclude null indicators from the average
  function avgNonNull(indicators: IDFIndicator[]): number {
    const valid = indicators.filter((i) => i.score !== null);
    if (valid.length === 0) return 0;
    return valid.reduce((s, i) => s + (i.score as number), 0) / valid.length;
  }

  const scoreResultados = avgNonNull(resultadosFiscales);
  const scoreGestion = avgNonNull(gestionFinanciera);

  // Weighted: 80% results + 20% management
  const idfTotal =
    Math.round((0.8 * scoreResultados + 0.2 * scoreGestion) * 100) / 100;

  const ranking = getRanking(idfTotal);

  // Status based on ranking
  let status: "cumple" | "parcial" | "no_cumple";
  if (idfTotal >= 70) {
    status = "cumple";
  } else if (idfTotal >= 40) {
    status = "parcial";
  } else {
    status = "no_cumple";
  }

  return {
    resultadosFiscales,
    gestionFinanciera,
    scoreResultados: Math.round(scoreResultados * 100) / 100,
    scoreGestion: Math.round(scoreGestion * 100) / 100,
    idfTotal,
    ranking,
    status,
  };
}
