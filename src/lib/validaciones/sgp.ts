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
      cuipoPrefix: "1.1.02.06.001.04.01",
      label: "Alimentacion Escolar",
    },
    [SGP_CONCEPTOS.AGUA_POTABLE]: {
      cuipoPrefix: "1.1.02.06.001.05",
      label: "Agua Potable",
    },
  };

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
  const [sicodisData, cuipoIngresos, cuipoGastos, cuipoProgIngresos] =
    await Promise.all([
      fetchSGPResumen(year, deptCode, daneCode).catch(
        (): SGPResumenParticipacion[] => []
      ),
      sodaCuipoQuery<CuipoEjecIngresos>({
        dataset: CUIPO_DATASETS.EJEC_INGRESOS,
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta like '1.1.02.06%'`,
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
        where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta like '1.1.02.06%'`,
        limit: 50000,
        order: "cuenta ASC",
      }),
    ]);

  // 2. Build SICODIS distribution map by concept ID
  const sicodisMap = new Map<string, number>();
  for (const row of sicodisData) {
    sicodisMap.set(row.id_concepto, row.total);
  }

  // 3. Aggregate CUIPO income (recaudo) by SGP component
  const incomeByComponent = new Map<string, number>();
  for (const row of cuipoIngresos) {
    const cuenta = row.cuenta || "";
    for (const [conceptoId, mapping] of Object.entries(SGP_ACCOUNT_MAP)) {
      if (cuenta.startsWith(mapping.cuipoPrefix)) {
        const current = incomeByComponent.get(conceptoId) || 0;
        incomeByComponent.set(
          conceptoId,
          current + parseFloat(row.total_recaudo || "0")
        );
        break;
      }
    }
  }

  // 4. Aggregate CUIPO programming (presupuesto definitivo) by SGP component
  const budgetByComponent = new Map<string, number>();
  for (const row of cuipoProgIngresos) {
    const cuenta = row.cuenta || "";
    for (const [conceptoId, mapping] of Object.entries(SGP_ACCOUNT_MAP)) {
      if (cuenta.startsWith(mapping.cuipoPrefix)) {
        const current = budgetByComponent.get(conceptoId) || 0;
        budgetByComponent.set(
          conceptoId,
          current + parseFloat(row.presupuesto_definitivo || "0")
        );
        break;
      }
    }
  }

  // 5. Aggregate CUIPO expenses (compromisos) by SGP-related funding source
  //    We match expenses to components by looking at the funding source name
  const expenseByComponent = new Map<string, number>();
  for (const row of cuipoGastos) {
    const fuenteName = (row.nom_fuentes_financiacion || "").toUpperCase();

    // Match funding source name to SGP component
    if (
      fuenteName.includes("EDUCACION") ||
      fuenteName.includes("EDUCACI")
    ) {
      const current =
        expenseByComponent.get(SGP_CONCEPTOS.EDUCACION) || 0;
      expenseByComponent.set(
        SGP_CONCEPTOS.EDUCACION,
        current + parseFloat(row.compromisos || "0")
      );
    } else if (fuenteName.includes("SALUD")) {
      const current = expenseByComponent.get(SGP_CONCEPTOS.SALUD) || 0;
      expenseByComponent.set(
        SGP_CONCEPTOS.SALUD,
        current + parseFloat(row.compromisos || "0")
      );
    } else if (
      fuenteName.includes("AGUA") ||
      fuenteName.includes("SANEAMIENTO")
    ) {
      const current =
        expenseByComponent.get(SGP_CONCEPTOS.AGUA_POTABLE) || 0;
      expenseByComponent.set(
        SGP_CONCEPTOS.AGUA_POTABLE,
        current + parseFloat(row.compromisos || "0")
      );
    } else if (
      fuenteName.includes("PROPOSITO GENERAL") ||
      fuenteName.includes("PROP")
    ) {
      const current =
        expenseByComponent.get(SGP_CONCEPTOS.PROPOSITO_GENERAL) || 0;
      expenseByComponent.set(
        SGP_CONCEPTOS.PROPOSITO_GENERAL,
        current + parseFloat(row.compromisos || "0")
      );
    } else if (
      fuenteName.includes("ALIMENTACION") ||
      fuenteName.includes("ALIMENTACI")
    ) {
      const current =
        expenseByComponent.get(SGP_CONCEPTOS.ALIMENTACION_ESCOLAR) || 0;
      expenseByComponent.set(
        SGP_CONCEPTOS.ALIMENTACION_ESCOLAR,
        current + parseFloat(row.compromisos || "0")
      );
    } else {
      // Generic SGP expense -- attribute to Proposito General as catch-all
      const current =
        expenseByComponent.get(SGP_CONCEPTOS.PROPOSITO_GENERAL) || 0;
      expenseByComponent.set(
        SGP_CONCEPTOS.PROPOSITO_GENERAL,
        current + parseFloat(row.compromisos || "0")
      );
    }
  }

  // 6. Build component results
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

    const pctPresupuesto = safePct(presupuestado, distribucionDNP);
    const pctRecaudo = safePct(recaudado, distribucionDNP);
    const pctEjecucion = safePct(ejecutado, distribucionDNP);

    componentes.push({
      concepto: mapping.label,
      distribucionDNP,
      presupuestado,
      recaudado,
      ejecutado,
      pctPresupuesto,
      pctRecaudo,
      pctEjecucion,
      status: componentStatus(pctEjecucion),
    });
  }

  // 7. Calculate global totals
  const totalDistribuido = componentes.reduce(
    (s, c) => s + c.distribucionDNP,
    0
  );
  const totalPresupuestado = componentes.reduce(
    (s, c) => s + c.presupuestado,
    0
  );
  const totalRecaudado = componentes.reduce((s, c) => s + c.recaudado, 0);
  const totalEjecutado = componentes.reduce((s, c) => s + c.ejecutado, 0);
  const pctEjecucionGlobal = safePct(totalEjecutado, totalDistribuido);

  // 8. Determine global status
  const cumpleCount = componentes.filter((c) => c.status === "cumple").length;
  const criticoCount = componentes.filter(
    (c) => c.status === "critico"
  ).length;

  let status: "cumple" | "parcial" | "no_cumple";
  if (componentes.length === 0) {
    status = "no_cumple";
  } else if (cumpleCount === componentes.length) {
    status = "cumple";
  } else if (criticoCount === componentes.length) {
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
