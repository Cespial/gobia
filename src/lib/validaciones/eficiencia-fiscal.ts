/**
 * Eficiencia Fiscal — Refrendacion CGN
 *
 * Compares income reported in CUIPO (budget execution) vs income in CGN accounting
 * (contable) for each tax type using the correct CGN accounting formula:
 *
 *   CGN_total = CxC_saldo_final_I + Income_IV - Adjustments_IV - CxC_saldo_final_IV
 *
 * Where:
 * - CxC_saldo_final_I  = Cuentas por Cobrar saldo final from Trimestre I (start-of-year proxy)
 * - Income_IV           = Income account saldo final from Trimestre IV
 * - Adjustments_IV      = Adjustment account saldo final from Trimestre IV (only if positive)
 * - CxC_saldo_final_IV  = Cuentas por Cobrar saldo final from Trimestre IV (end of year)
 *
 * This represents: "CxC at start of year + income recognized - adjustments - CxC at end = net collected"
 *
 * Refrendation threshold: 25% variance. If |CUIPO/CGN - 1| < 25%, the tax is endorsed
 * with valor refrendado = min(|CGN|, CUIPO). Otherwise valor refrendado = 0.
 *
 * Since CGN Saldos data requires file upload (not available via API),
 * this validation operates in two modes:
 * 1. WITH CGN data (both trimesters): full cross-reference with correct formula
 * 2. WITH only CGN IV: degraded mode using Income_IV only
 * 3. WITHOUT CGN data: shows CUIPO totals only, marks as "pendiente"
 */

import { sodaCuipoQuery, CUIPO_DATASETS } from "@/lib/datos-gov-cuipo";
import type { CGNSaldosData, CGNSaldoRow } from "@/lib/chip-parser";

// Tax type mapping: CUIPO account -> CGN accounts (CxC, Income, Adjustment)
export const TAX_MAPPING = [
  {
    name: "Impuesto Predial Unificado",
    cuipo: "1.1.01.01.200",
    cgnCxC: "1.3.05.07",
    cgnIncome: "4.1.05.07",
    cgnAdjustment: "4.1.95.10",
  },
  {
    name: "Impuesto de Industria y Comercio",
    cuipo: "1.1.01.02.200",
    cgnCxC: "1.3.05.08",
    cgnIncome: "4.1.05.08",
    cgnAdjustment: "4.1.95.11",
  },
  {
    name: "Avisos y Tableros",
    cuipo: "1.1.01.02.201",
    cgnCxC: "1.3.05.21",
    cgnIncome: "4.1.05.21",
    cgnAdjustment: "4.1.95.18",
  },
  {
    name: "Sobretasa Ambiental",
    cuipo: "1.1.01.01.014",
    cgnCxC: null,
    cgnIncome: null,
    cgnAdjustment: null,
  },
  {
    name: "Alumbrado Publico",
    cuipo: "1.1.01.01.203",
    cgnCxC: "1.3.05.22",
    cgnIncome: "4.1.05.22",
    cgnAdjustment: null,
  },
  {
    name: "Vehiculos Automotores",
    cuipo: "1.1.02.06.003.01.02",
    cgnCxC: "1.3.05.33",
    cgnIncome: "4.1.05.33",
    cgnAdjustment: "4.1.95.25",
  },
  {
    name: "Delineacion Urbana",
    cuipo: "1.1.01.02.204",
    cgnCxC: "1.3.05.19",
    cgnIncome: "4.1.05.19",
    cgnAdjustment: null,
  },
  {
    name: "Sobretasa Bomberil",
    cuipo: "1.1.01.02.202",
    cgnCxC: null,
    cgnIncome: null,
    cgnAdjustment: null,
  },
  {
    name: "Publicidad Exterior Visual",
    cuipo: "1.1.01.02.211",  // was "1.1.01.02.202" which conflicted with Bomberil
    cgnCxC: "1.3.05.58",
    cgnIncome: "4.1.05.58",
    cgnAdjustment: "4.1.95.44",
  },
  {
    name: "Espectaculos Publicos",
    cuipo: "1.1.01.02.205",
    cgnCxC: null,
    cgnIncome: null,
    cgnAdjustment: null,
  },
  {
    name: "Sobretasa a la Gasolina",
    cuipo: "1.1.01.02.109",
    cgnCxC: "1.3.05.24",
    cgnIncome: "4.1.05.24",
    cgnAdjustment: null,
  },
  {
    name: "Circulacion y Transito",
    cuipo: "1.1.01.02.203",
    cgnCxC: "1.3.05.59",
    cgnIncome: "4.1.05.59",
    cgnAdjustment: "4.1.95.45",
  },
];

type TaxMapping = (typeof TAX_MAPPING)[number];

export interface TaxValidationRow {
  name: string;
  cuipoAccount: string;
  cuipoTotal: number;
  cgnTotal: number | null;
  cgnFormula: string | null;       // human-readable formula breakdown
  difference: number | null;
  variancePct: number | null;
  valorRefrendado: number | null;  // min(|CGN|, CUIPO) if within threshold, else 0
  refrenda: boolean | null;
}

export interface EficienciaFiscalResult {
  tributos: TaxValidationRow[];
  totalCuipo: number;
  totalCGN: number | null;
  totalDifference: number | null;
  hasCGNData: boolean;
  refrendaCount: number;
  noRefrendaCount: number;
  status: 'cumple' | 'no_cumple' | 'pendiente';
}

/**
 * Calculate CGN total for a single tax using the accounting formula:
 *   CGN = CxC_saldo_final_I + Income_IV - Adjustments_IV - CxC_saldo_final_IV
 *
 * When only CGN_IV is available (no CGN_I), falls back to: Income_IV * 1000
 *
 * Returns { total, formula } or null if no CGN mapping exists.
 */
function calcularCGNTotal(
  tax: TaxMapping,
  cgnMapI: Map<string, CGNSaldoRow> | null,
  cgnMapIV: Map<string, CGNSaldoRow>,
): { total: number; formula: string } | null {
  if (!tax.cgnIncome) return null; // no CGN mapping for this tax

  // Income from Trimestre IV
  const incomeIV = cgnMapIV.get(tax.cgnIncome)?.saldoFinal ?? 0;

  // Adjustments from Trimestre IV (subtract only if positive)
  const adjIV = tax.cgnAdjustment
    ? Math.max(0, cgnMapIV.get(tax.cgnAdjustment)?.saldoFinal ?? 0)
    : 0;

  if (cgnMapI) {
    // Full formula with both trimesters
    const cxcI = tax.cgnCxC ? (cgnMapI.get(tax.cgnCxC)?.saldoFinal ?? 0) : 0;
    const cxcIV = tax.cgnCxC ? (cgnMapIV.get(tax.cgnCxC)?.saldoFinal ?? 0) : 0;

    const total = (cxcI + incomeIV - adjIV - cxcIV) * 1000;
    const formula = `CxC_I(${cxcI}) + Income_IV(${incomeIV}) - Adj_IV(${adjIV}) - CxC_IV(${cxcIV}) = ${cxcI + incomeIV - adjIV - cxcIV} (x1000)`;
    return { total, formula };
  } else {
    // Degraded mode: only CGN_IV available, use income only
    const total = (incomeIV - adjIV) * 1000;
    const formula = `Income_IV(${incomeIV}) - Adj_IV(${adjIV}) = ${incomeIV - adjIV} (x1000, sin CGN_I)`;
    return { total, formula };
  }
}

export async function evaluateEficienciaFiscal(
  chipCode: string,
  periodo: string,
  cgnDataIV?: CGNSaldosData | null,
  cgnDataI?: CGNSaldosData | null,
): Promise<EficienciaFiscalResult> {
  // Fetch CUIPO income execution for all tax-related accounts
  const cuipoRows = await sodaCuipoQuery<{cuenta: string; total_recaudo: string}>({
    dataset: CUIPO_DATASETS.EJEC_INGRESOS,
    select: "cuenta, sum(total_recaudo) as total_recaudo",
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND (cuenta like '1.1.01%' OR cuenta like '1.1.02.06.003%')`,
    group: "cuenta",
    order: "cuenta ASC",
    limit: 500,
  });

  // Build CUIPO lookup: account code -> total recaudo
  const cuipoMap = new Map<string, number>();
  for (const row of cuipoRows) {
    cuipoMap.set(row.cuenta, parseFloat(row.total_recaudo || "0"));
  }

  // Build CGN lookup maps
  const hasCGNDataIV = !!cgnDataIV && cgnDataIV.rows.length > 0;
  const hasCGNDataI = !!cgnDataI && cgnDataI.rows.length > 0;
  const hasCGNData = hasCGNDataIV; // At minimum we need CGN IV

  const cgnMapIV = hasCGNDataIV
    ? new Map<string, CGNSaldoRow>(cgnDataIV!.rows.map(r => [r.codigo.trim(), r]))
    : new Map<string, CGNSaldoRow>();

  const cgnMapI = hasCGNDataI
    ? new Map<string, CGNSaldoRow>(cgnDataI!.rows.map(r => [r.codigo.trim(), r]))
    : null;

  // Calculate per-tax results
  const tributos: TaxValidationRow[] = TAX_MAPPING.map(tax => {
    // CUIPO total: find exact match or prefix match
    let cuipoTotal = cuipoMap.get(tax.cuipo) || 0;
    if (cuipoTotal === 0) {
      // Aggregate child accounts (e.g., "1.1.01.01.200" + "1.1.01.01.200.01")
      for (const [code, val] of cuipoMap.entries()) {
        if (code.startsWith(tax.cuipo + ".")) {
          cuipoTotal += val;
        }
      }
    }

    // CGN total using correct accounting formula
    let cgnTotal: number | null = null;
    let cgnFormula: string | null = null;

    if (hasCGNData) {
      const result = calcularCGNTotal(tax, cgnMapI, cgnMapIV);
      if (result) {
        cgnTotal = result.total;
        cgnFormula = result.formula;
      }
    }

    const difference = cgnTotal !== null ? Math.abs(cgnTotal - cuipoTotal) : null;

    // Variance = |CUIPO/CGN - 1|
    const variancePct = cgnTotal !== null && cgnTotal !== 0
      ? Math.abs(cuipoTotal / cgnTotal - 1) * 100
      : null;

    // Refrendation value
    let valorRefrendado: number | null = null;
    if (variancePct !== null && cgnTotal !== null) {
      if (variancePct < 25) {
        // Within threshold: refrendar the lesser of |CGN| and CUIPO
        valorRefrendado = Math.min(Math.abs(cgnTotal), cuipoTotal);
      } else {
        valorRefrendado = 0; // Over threshold: no refrendation
      }
    }

    // Refrenda: if refrendado/cuipo > 50% -> SI
    const refrenda = valorRefrendado !== null && cuipoTotal > 0
      ? valorRefrendado / cuipoTotal > 0.5
      : null;

    return {
      name: tax.name,
      cuipoAccount: tax.cuipo,
      cuipoTotal,
      cgnTotal,
      cgnFormula,
      difference,
      variancePct,
      valorRefrendado,
      refrenda,
    };
  });

  const totalCuipo = tributos.reduce((s, t) => s + t.cuipoTotal, 0);
  const totalCGN = hasCGNData ? tributos.reduce((s, t) => s + (t.cgnTotal || 0), 0) : null;
  const totalDifference = hasCGNData ? tributos.reduce((s, t) => s + (t.difference || 0), 0) : null;
  const refrendaCount = tributos.filter(t => t.refrenda === true).length;
  const noRefrendaCount = tributos.filter(t => t.refrenda === false).length;

  return {
    tributos,
    totalCuipo,
    totalCGN,
    totalDifference,
    hasCGNData,
    refrendaCount,
    noRefrendaCount,
    status: !hasCGNData ? 'pendiente' : noRefrendaCount === 0 ? 'cumple' : 'no_cumple',
  };
}
