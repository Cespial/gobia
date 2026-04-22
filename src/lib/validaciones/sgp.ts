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
} from "@/lib/datos-gov-cuipo";
import type { CuipoProgIngresosRow } from "@/lib/chip-parser";
import { sumProgramacionUploadByPrefixes } from "@/lib/cuipo-processor";
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
  presupuestado: number | null;
  recaudado: number;
  ejecutado: number;
  pctPresupuesto: number | null;
  pctRecaudo: number;
  pctEjecucion: number;
  status: "cumple" | "alerta" | "critico";
}

export interface SGPEvaluationResult {
  totalDistribuido: number;
  totalPresupuestado: number | null;
  totalRecaudado: number;
  totalEjecutado: number;
  pctEjecucionGlobal: number;
  hasProgramacionData: boolean;
  componentes: SGPComponentResult[];
  status: "cumple" | "parcial" | "no_cumple";
}

// ---------------------------------------------------------------------------
// SGP Account Mapping + Expense Keywords
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
 * Maps SGP concept IDs to keywords in nom_fuentes_financiacion from CUIPO EJEC_GASTOS.
 * Each expense row is matched to the first concept whose keywords appear in the funding
 * source name (case-insensitive). Order matters for unambiguous matching.
 */
const SGP_EXPENSE_KEYWORDS: Record<string, string[]> = {
  [SGP_CONCEPTOS.EDUCACION]: ["EDUCACION"],
  [SGP_CONCEPTOS.SALUD]: ["SALUD"],
  [SGP_CONCEPTOS.AGUA_POTABLE]: ["AGUA POTABLE"],
  [SGP_CONCEPTOS.PROPOSITO_GENERAL]: ["PROPOSITO GENERAL"],
  [SGP_CONCEPTOS.ALIMENTACION_ESCOLAR]: [
    "ALIMENTACION ESCOLAR",
    "ASIGNACION ESPECIAL",
  ],
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

function safePctOrNull(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 10000) / 100;
}

// ---------------------------------------------------------------------------
// Main evaluation
// ---------------------------------------------------------------------------

export async function evaluateSGP(
  chipCode: string,
  daneCode: string,
  deptCode: string,
  periodo: string,
  progIngresosUpload?: CuipoProgIngresosRow[] | null
): Promise<SGPEvaluationResult> {
  const { year } = parsePeriodo(periodo);

  // 1. Fetch data in parallel: SICODIS distribution + CUIPO income + CUIPO expenses
  //    Restrict income queries to 1.1.02.06.001% (SGP-specific accounts only)
  const [sicodisData, cuipoIngresos, cuipoGastos] =
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

  // 5. Aggregate uploaded CHIP programming (presupuesto definitivo) by SGP component
  const budgetByComponent = new Map<string, number>();
  let hasProgramacionData = false;

  for (const [conceptoId, mapping] of Object.entries(SGP_ACCOUNT_MAP)) {
    const summary = sumProgramacionUploadByPrefixes(
      progIngresosUpload,
      [mapping.cuipoPrefix],
      "presupuestoDefinitivo"
    );

    if (summary.hasData) {
      budgetByComponent.set(conceptoId, summary.total ?? 0);
      hasProgramacionData = true;
    }
  }

  const primeraInfanciaBudget = sumProgramacionUploadByPrefixes(
    progIngresosUpload,
    [PRIMERA_INFANCIA_PREFIX],
    "presupuestoDefinitivo"
  );

  // 6. Aggregate CUIPO expenses (compromisos) — match each row to its SGP component
  //    using the nom_fuentes_financiacion field, which contains the specific funding
  //    source name (e.g. "SGP-EDUCACION-CALIDAD POR MATRICULA OFICIAL").
  const expenseByComponent = new Map<string, number>();
  for (const row of cuipoGastos) {
    const fuenteUpper = (row.nom_fuentes_financiacion || "").toUpperCase();
    const compromisos = parseFloat(row.compromisos || "0");

    for (const [conceptoId, keywords] of Object.entries(SGP_EXPENSE_KEYWORDS)) {
      if (keywords.some((kw) => fuenteUpper.includes(kw))) {
        const current = expenseByComponent.get(conceptoId) || 0;
        expenseByComponent.set(conceptoId, current + compromisos);
        break; // matched — don't double-count
      }
    }
  }

  // 7. Build component results
  const componentes: SGPComponentResult[] = [];

  for (const [conceptoId, mapping] of Object.entries(SGP_ACCOUNT_MAP)) {
    const distribucionDNP = sicodisMap.get(conceptoId) || 0;
    const presupuestado = hasProgramacionData
      ? (budgetByComponent.get(conceptoId) ?? 0)
      : null;
    const recaudado = incomeByComponent.get(conceptoId) || 0;
    const ejecutado = expenseByComponent.get(conceptoId) || 0;

    // Skip components with zero across the board
    if (
      distribucionDNP === 0 &&
      (presupuestado ?? 0) === 0 &&
      recaudado === 0 &&
      ejecutado === 0
    ) {
      continue;
    }

    // Use recaudado as reference for percentages when DNP distribution is available
    const pctPresupuesto =
      presupuestado === null
        ? null
        : safePctOrNull(presupuestado, distribucionDNP);
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
    });
  }

  // 7b. Add Primera Infancia as informational sub-row if data exists
  if (primeraInfanciaRecaudo > 0) {
    componentes.push({
      concepto: "  Primera Infancia (sub-componente)",
      distribucionDNP: 0,
      presupuestado: hasProgramacionData ? (primeraInfanciaBudget.total ?? 0) : null,
      recaudado: primeraInfanciaRecaudo,
      ejecutado: 0,
      pctPresupuesto: null,
      pctRecaudo: 0,
      pctEjecucion: 0,
      status: "alerta",
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
  const totalPresupuestado = hasProgramacionData
    ? mainComponents.reduce((s, c) => s + (c.presupuestado ?? 0), 0)
    : null;
  const totalRecaudado = mainComponents.reduce((s, c) => s + c.recaudado, 0);
  const totalEjecutado = mainComponents.reduce((s, c) => s + c.ejecutado, 0);
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
  } else if (!hasProgramacionData) {
    status = "parcial";
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
    hasProgramacionData,
    componentes,
    status,
  };
}
