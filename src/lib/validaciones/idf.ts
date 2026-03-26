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
  type CuipoEjecIngresos,
  type CuipoEjecGastos,
  type CuipoProgIngresos,
  type CuipoProgGastos,
} from "@/lib/datos-gov-cuipo";
import { evaluateLey617 } from "@/lib/validaciones/ley617";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IDFIndicator {
  name: string;
  value: number;
  score: number; // 0-100 normalized
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

function interpretLey617(ratio: number): string {
  if (ratio <= 0.5) return "Gastos de funcionamiento muy por debajo del limite legal";
  if (ratio <= 0.7) return "Gastos de funcionamiento dentro de parametros legales";
  if (ratio <= 0.8) return "Gastos de funcionamiento cercanos al limite legal";
  return "Gastos de funcionamiento exceden el limite de Ley 617";
}

// ---------------------------------------------------------------------------
// Account classification helpers
// ---------------------------------------------------------------------------

/** Income account "1.1" = Ingresos corrientes */
function isIngresoCorriente(cuenta: string): boolean {
  return cuenta.startsWith("1.1");
}

/** Transfer income: "1.1.02" = Transferencias corrientes */
function isTransferencia(cuenta: string): boolean {
  return cuenta.startsWith("1.1.02");
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
  periodo: string
): Promise<IDFResult> {
  // Fetch all required CUIPO data in parallel
  const [ejecIngresos, ejecGastos, progIngresos, progGastos, ley617Result] =
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
      sodaCuipoQuery<CuipoProgIngresos>({
        dataset: CUIPO_DATASETS.PROG_INGRESOS,
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}'`,
        limit: 50000,
        order: "cuenta ASC",
      }),
      sodaCuipoQuery<CuipoProgGastos>({
        dataset: CUIPO_DATASETS.PROG_GASTOS,
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND nom_vigencia_del_gasto='VIGENCIA ACTUAL'`,
        limit: 50000,
        order: "cuenta ASC",
      }),
      evaluateLey617(chipCode, periodo).catch(() => null),
    ]);

  // ---------------------------------------------------------------------------
  // Aggregate income execution
  // ---------------------------------------------------------------------------
  let ingresosTotales = 0;
  let ingresosCorrientes = 0;
  let ingresosTransferencias = 0;
  let ingresosPropiosRecaudo = 0; // For programming capacity

  for (const row of ejecIngresos) {
    const cuenta = row.cuenta || "";
    const recaudo = parseFloat(row.total_recaudo || "0");

    ingresosTotales += recaudo;

    if (isIngresoCorriente(cuenta)) {
      ingresosCorrientes += recaudo;
    }
    if (isTransferencia(cuenta)) {
      ingresosTransferencias += recaudo;
    }
    if (isIngresoPropioForProgramming(cuenta)) {
      ingresosPropiosRecaudo += recaudo;
    }
  }

  // ---------------------------------------------------------------------------
  // Aggregate expense execution
  // ---------------------------------------------------------------------------
  let gastosCorrientes = 0;
  let gastosInversion = 0;
  let formacionBrutaCapital = 0;
  let compromisosTotal = 0;

  for (const row of ejecGastos) {
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
  }

  // ---------------------------------------------------------------------------
  // Aggregate programming data
  // ---------------------------------------------------------------------------
  let presupuestoInicialPropios = 0;
  for (const row of progIngresos) {
    const cuenta = row.cuenta || "";
    if (isIngresoPropioForProgramming(cuenta)) {
      presupuestoInicialPropios += parseFloat(
        row.presupuesto_inicial || "0"
      );
    }
  }

  let apropiacionDefinitivaTotal = 0;
  for (const row of progGastos) {
    apropiacionDefinitivaTotal += parseFloat(
      row.apropiacion_definitiva || "0"
    );
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

  // 3. Endeudamiento LP (placeholder -- needs CGN balance sheet data)
  //    We assign a neutral score of 60 when data is not available
  const deudaRatio = 0;
  const deudaScore = 60;

  // 4. Ahorro corriente
  const ahorroCorrienteRatio = safeDivide(
    ingresosCorrientes - gastosCorrientes,
    ingresosCorrientes
  );
  const ahorroScore = normalizeDirect(
    Math.max(0, ahorroCorrienteRatio)
  );

  // 5. Balance fiscal primario (placeholder)
  //    Simplified: (Ingresos - Gastos) / Ingresos
  const balancePrimarioRatio = safeDivide(
    ingresosTotales - compromisosTotal,
    ingresosTotales
  );
  const balanceScore = normalizeDirect(
    Math.max(0, balancePrimarioRatio)
  );

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
      name: "Capacidad de endeudamiento",
      value: Math.round(deudaRatio * 10000) / 100,
      score: deudaScore,
      interpretation:
        "Dato no disponible en CUIPO. Requiere balance CGN.",
    },
    {
      name: "Ahorro corriente",
      value: Math.round(ahorroCorrienteRatio * 10000) / 100,
      score: ahorroScore,
      interpretation: interpretAhorro(ahorroCorrienteRatio),
    },
    {
      name: "Balance fiscal primario",
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
  const progCapScore = normalizeProgramming(progCapRatio);

  // 2. Ejecucion de compromisos
  const ejecCompRatio = safeDivide(
    compromisosTotal,
    apropiacionDefinitivaTotal
  );
  const ejecCompScore = normalizeDirect(ejecCompRatio);

  // 3. Cumplimiento Ley 617
  const ley617Ratio = ley617Result ? ley617Result.ratioGlobal : 0.8;
  // For Ley 617 compliance, lower ratio is better (inverse)
  const ley617Score = normalizeInverse(ley617Ratio);

  const gestionFinanciera: IDFIndicator[] = [
    {
      name: "Capacidad de programacion de ingresos",
      value: Math.round(progCapRatio * 10000) / 100,
      score: progCapScore,
      interpretation: interpretProgramacion(progCapRatio),
    },
    {
      name: "Ejecucion de compromisos",
      value: Math.round(ejecCompRatio * 10000) / 100,
      score: ejecCompScore,
      interpretation: interpretEjecucion(ejecCompRatio),
    },
    {
      name: "Cumplimiento Ley 617",
      value: Math.round(ley617Ratio * 10000) / 100,
      score: ley617Score,
      interpretation: interpretLey617(ley617Ratio),
    },
  ];

  // ---------------------------------------------------------------------------
  // Composite IDF Score
  // ---------------------------------------------------------------------------

  // Average each group
  const scoreResultados =
    resultadosFiscales.reduce((s, i) => s + i.score, 0) /
    resultadosFiscales.length;

  const scoreGestion =
    gestionFinanciera.reduce((s, i) => s + i.score, 0) /
    gestionFinanciera.length;

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
