/**
 * Eficiencia Fiscal — Refrendacion CGN
 *
 * Compares income reported in CUIPO (budget execution) vs income in CGN accounting
 * (contable) for each tax type. If the variance exceeds 50%, the tax is NOT endorsed.
 *
 * The mapping between CUIPO and CGN accounts:
 * - Predial: CUIPO 1.1.01.01.200 -> CGN 4.1.05.07 (income) + 1.3.05.07 (CxC)
 * - ICA: CUIPO 1.1.01.02.200 -> CGN 4.1.05.08 + 1.3.05.08
 * - Avisos y Tableros: CUIPO 1.1.01.02.201 -> CGN 4.1.05.21 + 1.3.05.21
 * - Sobretasa Ambiental: CUIPO 1.1.01.01.014 -> (no direct CGN mapping)
 * - Alumbrado Publico: CUIPO 1.1.01.01.203 -> CGN 4.1.05.22
 * - Vehiculos: CUIPO 1.1.02.06.003.01.02 -> CGN 4.1.05.33 + 1.3.05.33
 * - Delineacion: CUIPO 1.1.01.02.204 -> CGN 4.1.05.19 + 1.3.05.19
 * - Sobretasa Bomberil: CUIPO 1.1.01.02.202 (approx) -> varies
 *
 * Since CGN Saldos data requires file upload (not available via API),
 * this validation operates in two modes:
 * 1. WITH CGN data: full cross-reference with variance calculation
 * 2. WITHOUT CGN data: shows CUIPO totals only, marks as "pendiente"
 */

import { sodaCuipoQuery, CUIPO_DATASETS } from "@/lib/datos-gov-cuipo";
import type { CGNSaldosData } from "@/lib/chip-parser";

// Tax type mapping: CUIPO account -> CGN income accounts + CGN CxC accounts
export const TAX_MAPPING = [
  { name: "Impuesto Predial Unificado", cuipo: "1.1.01.01.200", cgnIncome: ["4.1.05.07"], cgnCxC: ["1.3.05.07"] },
  { name: "Impuesto de Industria y Comercio", cuipo: "1.1.01.02.200", cgnIncome: ["4.1.05.08"], cgnCxC: ["1.3.05.08"] },
  { name: "Avisos y Tableros", cuipo: "1.1.01.02.201", cgnIncome: ["4.1.05.21"], cgnCxC: ["1.3.05.21"] },
  { name: "Sobretasa Ambiental", cuipo: "1.1.01.01.014", cgnIncome: [], cgnCxC: [] },
  { name: "Alumbrado Publico", cuipo: "1.1.01.01.203", cgnIncome: ["4.1.05.22"], cgnCxC: ["1.3.05.22"] },
  { name: "Vehiculos Automotores", cuipo: "1.1.02.06.003.01.02", cgnIncome: ["4.1.05.33"], cgnCxC: ["1.3.05.33"] },
  { name: "Delineacion Urbana", cuipo: "1.1.01.02.204", cgnIncome: ["4.1.05.19"], cgnCxC: ["1.3.05.19"] },
  { name: "Sobretasa Bomberil", cuipo: "1.1.01.02.202", cgnIncome: [], cgnCxC: [] },
  { name: "Publicidad Exterior Visual", cuipo: "1.1.01.02.203", cgnIncome: ["4.1.05.58"], cgnCxC: ["1.3.05.58"] },
  { name: "Espectaculos Publicos", cuipo: "1.1.01.02.205", cgnIncome: [], cgnCxC: [] },
  { name: "Sobretasa a la Gasolina", cuipo: "1.1.01.02.300", cgnIncome: ["4.1.05.24"], cgnCxC: ["1.3.05.24"] },
  { name: "Estampillas", cuipo: "1.1.01.02.109", cgnIncome: [], cgnCxC: [] },
];

export interface TaxValidationRow {
  name: string;
  cuipoAccount: string;
  cuipoTotal: number;      // CUIPO budget execution total
  cgnTotal: number | null;  // CGN accounting total (null if no CGN data)
  difference: number | null;
  variancePct: number | null;
  refrenda: boolean | null; // true if variance <= 50%, null if no CGN data
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

export async function evaluateEficienciaFiscal(
  chipCode: string,
  periodo: string,
  cgnData?: CGNSaldosData | null
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

  // Build CGN lookup if data is available
  const cgnMap = new Map<string, number>();
  if (cgnData) {
    for (const row of cgnData.rows) {
      cgnMap.set(row.codigo, row.saldoFinal * 1000); // CGN is in thousands
    }
  }

  const hasCGNData = !!cgnData && cgnData.rows.length > 0;

  // Calculate per-tax results
  const tributos: TaxValidationRow[] = TAX_MAPPING.map(tax => {
    // CUIPO total: find exact match or prefix match
    let cuipoTotal = cuipoMap.get(tax.cuipo) || 0;
    if (cuipoTotal === 0) {
      // Try prefix match
      for (const [code, val] of cuipoMap.entries()) {
        if (code.startsWith(tax.cuipo) && code.length === tax.cuipo.length) {
          cuipoTotal += val;
        }
      }
    }

    // CGN total: sum income accounts + delta CxC
    let cgnTotal: number | null = null;
    if (hasCGNData && tax.cgnIncome.length > 0) {
      cgnTotal = 0;
      for (const acct of tax.cgnIncome) {
        cgnTotal += cgnMap.get(acct) || 0;
      }
      // Add change in CxC (saldo final - saldo inicial) if available
      for (const acct of tax.cgnCxC) {
        const cxcRow = cgnData!.rows.find(r => r.codigo === acct);
        if (cxcRow) {
          cgnTotal += (cxcRow.saldoFinal - cxcRow.saldoInicial) * 1000;
        }
      }
    }

    const difference = cgnTotal !== null ? Math.abs(cgnTotal - cuipoTotal) : null;
    const variancePct = cgnTotal !== null && cgnTotal !== 0
      ? (difference! / Math.abs(cgnTotal)) * 100
      : null;
    const refrenda = variancePct !== null ? variancePct <= 50 : null;

    return {
      name: tax.name,
      cuipoAccount: tax.cuipo,
      cuipoTotal,
      cgnTotal,
      difference,
      variancePct,
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
