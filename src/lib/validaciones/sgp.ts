/**
 * SGP Evaluation -- compares SICODIS distribution vs CUIPO execution
 *
 * Logic:
 * 1. Fetch SGP distribution from SICODIS API for the municipality's year
 * 2. Fetch CUIPO income execution filtered to SGP accounts (cuenta starts with "1.1.02.06")
 * 3. Fetch CUIPO expense execution filtered to SGP funding sources
 * 4. Compare: distributed vs budgeted vs collected vs executed
 * 5. Calculate compliance percentage for each SGP component
 */

import {
  sodaCuipoQuery,
  CUIPO_DATASETS,
  parsePeriodo,
  type CuipoEjecIngresos,
  type CuipoEjecGastos,
  type CuipoProgIngresos,
} from "@/lib/datos-gov-cuipo";
import {
  fetchSGPResumen,
  SGP_CONCEPTOS,
  type SGPResumenParticipacion,
} from "@/lib/sicodis";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SGPComponentResult {
  concepto: string;
  distribucionDNP: number;
  presupuestado: number;
  recaudado: number;
  ejecutado: number;
  pctPresupuesto: number;
  pctRecaudo: number;
  pctEjecucion: number;
  status: "cumple" | "alerta" | "critico";
  /** If true, the ejecutado is a global estimate, not per-component */
  ejecutadoEstimado?: boolean;
}

export interface SGPEvaluationResult {
  totalDistribuido: number;
  totalPresupuestado: number;
  totalRecaudado: number;
  totalEjecutado: number;
  pctEjecucionGlobal: number;
  componentes: SGPComponentResult[];
  status: "cumple" | "parcial" | "no_cumple";
}

// ---------------------------------------------------------------------------
// SGP Account Mapping
// ---------------------------------------------------------------------------

/**
 * Maps SGP concept IDs (SICODIS) to CUIPO account prefixes.
 * The CUIPO accounts for SGP income follow the pattern 1.1.02.06.001.XX
 *
 * Restricted to 1.1.02.06.001% to avoid capturing non-SGP transfers
 * under the broader 1.1.02.06%.
 */
const SGP_ACCOUNT_MAP: Record<string, { cuipoPrefix: string; label: string }> =
  {
    [SGP_CONCEPTOS.EDUCACION]: {
      cuipoPrefix: "1.1.02.06.001.01",
      label: "Educacion",
    },
    [SGP_CONCEPTOS.SALUD]: {
      cuipoPrefix: "1.1.02.06.001.02",
      label: "Salud",
    },
    [SGP_CONCEPTOS.PROPOSITO_GENERAL]: {
      cuipoPrefix: "1.1.02.06.001.03",
      label: "Proposito General",
    },
    [SGP_CONCEPTOS.ALIMENTACION_ESCOLAR]: {
      cuipoPrefix: "1.1.02.06.001.04",
      label: "Asignaciones Especiales",
    },
    [SGP_CONCEPTOS.AGUA_POTABLE]: {
      cuipoPrefix: "1.1.02.06.001.05",
      label: "Agua Potable",
    },
  };

/**
 * Additional Primera Infancia sub-component.
 * Mapped separately for reporting but aggregated under Asignaciones Especiales
 * in the main account map (SICODIS concept 0106).
 * Account: 1.1.02.06.001.04.02
 */
const PRIMERA_INFANCIA_PREFIX = "1.1.02.06.001.04.02";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function componentStatus(
  pctEjecucion: number
): "cumple" | "alerta" | "critico" {
  if (pctEjecucion >= 80) return "cumple";
  if (pctEjecucion >= 50) return "alerta";
  return "critico";
}

function safePct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

// ---------------------------------------------------------------------------
// Main evaluation
// ---------------------------------------------------------------------------

export async function evaluateSGP(
  chipCode: string,
  daneCode: string,
  deptCode: string,
  periodo: string
): Promise<SGPEvaluationResult> {
  const { year } = parsePeriodo(periodo);

  // 1. Fetch data in parallel: SICODIS distribution + CUIPO income + CUIPO expenses + CUIPO programming
  //    Restrict income queries to 1.1.02.06.001% (SGP-specific accounts only)
  const [sicodisData, cuipoIngresos, cuipoGastos, cuipoProgIngresos] =
    await Promise.all([
      fetchSGPResumen(year, deptCode, daneCode).catch(
        (): SGPResumenParticipacion[] => []
      ),
      sodaCuipoQuery<CuipoEjecIngresos>({
        dataset: CUIPO_DATASETS.EJEC_INGRESOS,
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta like '1.1.02.06.001%'`,
        limit: 50000,
        order: "cuenta ASC",
      }),
      sodaCuipoQuery<CuipoEjecGastos>({
        dataset: CUIPO_DATASETS.EJEC_GASTOS,
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND nom_fuentes_financiacion like '%SGP%' AND nom_vigencia_del_gasto='VIGENCIA ACTUAL'`,
        limit: 50000,
        order: "cuenta ASC",
      }),
      sodaCuipoQuery<CuipoProgIngresos>({
        dataset: CUIPO_DATASETS.PROG_INGRESOS,
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta like '1.1.02.06.001%'`,
        limit: 50000,
        order: "cuenta ASC",
      }),
    ]);

  // 2. Build SICODIS distribution map by concept ID
  //    Handle gracefully if SICODIS returns different structures
  const sicodisMap = new Map<string, number>();
  for (const row of sicodisData) {
    if (row.id_concepto && typeof row.total === "number") {
      sicodisMap.set(row.id_concepto, row.total);
    }
  }

  // 3. Leaf-row detection for income accounts to prevent double-counting
  const allIncomeCuentas = new Set(cuipoIngresos.map((r) => r.cuenta || ""));
  const allProgCuentas = new Set(cuipoProgIngresos.map((r) => r.cuenta || ""));

  function isLeaf(cuenta: string, allCuentas: Set<string>): boolean {
    const prefix = cuenta + ".";
    for (const c of allCuentas) {
      if (c.startsWith(prefix)) return false;
    }
    return true;
  }

  // 4. Aggregate CUIPO income (recaudo) by SGP component using account code matching
  const incomeByComponent = new Map<string, number>();
  let primeraInfanciaRecaudo = 0;

  for (const row of cuipoIngresos) {
    const cuenta = row.cuenta || "";
    if (!isLeaf(cuenta, allIncomeCuentas)) continue;

    const recaudo = parseFloat(row.total_recaudo || "0");

    // Track Primera Infancia sub-component
    if (cuenta.startsWith(PRIMERA_INFANCIA_PREFIX)) {
      primeraInfanciaRecaudo += recaudo;
    }

    // Match to the most specific SGP component by prefix
    let matched = false;
    for (const [conceptoId, mapping] of Object.entries(SGP_ACCOUNT_MAP)) {
      if (cuenta.startsWith(mapping.cuipoPrefix)) {
        const current = incomeByComponent.get(conceptoId) || 0;
        incomeByComponent.set(conceptoId, current + recaudo);
        matched = true;
        break;
      }
    }

    // If not matched to any known component but is under SGP prefix,
    // attribute to Proposito General as catch-all
    if (!matched && cuenta.startsWith("1.1.02.06.001")) {
      const current =
        incomeByComponent.get(SGP_CONCEPTOS.PROPOSITO_GENERAL) || 0;
      incomeByComponent.set(
        SGP_CONCEPTOS.PROPOSITO_GENERAL,
        current + recaudo
      );
    }
  }

  // 5. Aggregate CUIPO programming (presupuesto definitivo) by SGP component
  const budgetByComponent = new Map<string, number>();
  for (const row of cuipoProgIngresos) {
    const cuenta = row.cuenta || "";
    if (!isLeaf(cuenta, allProgCuentas)) continue;

    const ppto = parseFloat(row.presupuesto_definitivo || "0");

    for (const [conceptoId, mapping] of Object.entries(SGP_ACCOUNT_MAP)) {
      if (cuenta.startsWith(mapping.cuipoPrefix)) {
        const current = budgetByComponent.get(conceptoId) || 0;
        budgetByComponent.set(conceptoId, current + ppto);
        break;
      }
    }
  }

  // 6. Aggregate CUIPO expenses (compromisos) — global SGP execution total
  //    Per-component breakdown of expenses is unreliable with fuzzy name matching.
  //    Instead, compute a single global SGP execution figure and distribute
  //    proportionally based on income recaudo shares.
  let totalSGPExpenses = 0;
  for (const row of cuipoGastos) {
    totalSGPExpenses += parseFloat(row.compromisos || "0");
  }

  // Calculate total SGP income for proportional distribution
  let totalSGPIncome = 0;
  for (const val of incomeByComponent.values()) {
    totalSGPIncome += val;
  }

  // Distribute expenses proportionally based on income share
  const expenseByComponent = new Map<string, number>();
  if (totalSGPIncome > 0 && totalSGPExpenses > 0) {
    for (const [conceptoId] of Object.entries(SGP_ACCOUNT_MAP)) {
      const componentIncome = incomeByComponent.get(conceptoId) || 0;
      const share = componentIncome / totalSGPIncome;
      expenseByComponent.set(conceptoId, totalSGPExpenses * share);
    }
  }

  // 7. Build component results
  const componentes: SGPComponentResult[] = [];

  for (const [conceptoId, mapping] of Object.entries(SGP_ACCOUNT_MAP)) {
    const distribucionDNP = sicodisMap.get(conceptoId) || 0;
    const presupuestado = budgetByComponent.get(conceptoId) || 0;
    const recaudado = incomeByComponent.get(conceptoId) || 0;
    const ejecutado = expenseByComponent.get(conceptoId) || 0;

    // Skip components with zero across the board
    if (
      distribucionDNP === 0 &&
      presupuestado === 0 &&
      recaudado === 0 &&
      ejecutado === 0
    ) {
      continue;
    }

    // Use recaudado as reference for percentages when DNP distribution is available
    const pctPresupuesto = safePct(presupuestado, distribucionDNP);
    const pctRecaudo = safePct(recaudado, distribucionDNP);
    const pctEjecucion = safePct(ejecutado, distribucionDNP);

    componentes.push({
      concepto: mapping.label,
      distribucionDNP,
      presupuestado,
      recaudado,
      ejecutado: Math.round(ejecutado),
      pctPresupuesto,
      pctRecaudo,
      pctEjecucion,
      status: componentStatus(pctEjecucion),
      ejecutadoEstimado: totalSGPExpenses > 0,
    });
  }

  // 7b. Add Primera Infancia as informational sub-row if data exists
  if (primeraInfanciaRecaudo > 0) {
    componentes.push({
      concepto: "  Primera Infancia (sub-componente)",
      distribucionDNP: 0,
      presupuestado: 0,
      recaudado: primeraInfanciaRecaudo,
      ejecutado: 0,
      pctPresupuesto: 0,
      pctRecaudo: 0,
      pctEjecucion: 0,
      status: "alerta",
      ejecutadoEstimado: true,
    });
  }

  // 8. Calculate global totals (excluding sub-component rows)
  const mainComponents = componentes.filter(
    (c) => !c.concepto.startsWith("  ")
  );
  const totalDistribuido = mainComponents.reduce(
    (s, c) => s + c.distribucionDNP,
    0
  );
  const totalPresupuestado = mainComponents.reduce(
    (s, c) => s + c.presupuestado,
    0
  );
  const totalRecaudado = mainComponents.reduce((s, c) => s + c.recaudado, 0);
  const totalEjecutado = Math.round(totalSGPExpenses);
  const pctEjecucionGlobal = safePct(totalEjecutado, totalDistribuido);

  // 9. Determine global status
  const cumpleCount = mainComponents.filter(
    (c) => c.status === "cumple"
  ).length;
  const criticoCount = mainComponents.filter(
    (c) => c.status === "critico"
  ).length;

  let status: "cumple" | "parcial" | "no_cumple";
  if (mainComponents.length === 0) {
    status = "no_cumple";
  } else if (cumpleCount === mainComponents.length) {
    status = "cumple";
  } else if (criticoCount === mainComponents.length) {
    status = "no_cumple";
  } else {
    status = "parcial";
  }

  return {
    totalDistribuido,
    totalPresupuestado,
    totalRecaudado,
    totalEjecutado,
    pctEjecucionGlobal,
    componentes,
    status,
  };
}
