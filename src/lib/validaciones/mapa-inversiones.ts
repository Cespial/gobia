/**
 * Mapa de Inversiones validation
 *
 * Cross-references CUIPO EJEC_GASTOS investment expenses (cuenta 2.3%)
 * against the uploaded Mapa de Inversiones (DNP) to verify that BEPINs
 * in the budget execution are registered in the Plan de Desarrollo Municipal.
 *
 * BEPINs that appear in CUIPO but NOT in the Mapa represent executed
 * investment that does NOT contribute to the PDM tracking.
 */

import {
  sodaCuipoQuery,
  CUIPO_DATASETS,
} from "@/lib/datos-gov-cuipo";
import type { MapaInversionesData } from "@/lib/chip-parser";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MapaCruceRow {
  bepin: string;
  productoMGA: string;
  nombreProducto: string;
  valorCuipo: number;
  existeEnMapa: boolean;
  valorMapa: number;
  status: "ok" | "sin_cruce";
}

export interface MapaInversionesResult {
  totalBepinesCuipo: number;
  bepinesConCruce: number;
  bepinesSinCruce: number;
  valorEjecutadoTotal: number;
  valorConCruce: number;
  valorSinCruce: number;
  pctCruceBepin: number;
  pctCruceValor: number;
  cruces: MapaCruceRow[];
  status: "cumple" | "parcial" | "no_cumple" | "pendiente";
}

// ---------------------------------------------------------------------------
// SODA aggregated result type (custom SELECT + GROUP BY)
// ---------------------------------------------------------------------------

interface CuipoBepinAggRow {
  bpin: string;
  cod_programatico_mga?: string;
  nom_programatico_mga?: string;
  compromisos: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safePct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

// ---------------------------------------------------------------------------
// Main evaluation
// ---------------------------------------------------------------------------

export async function evaluateMapaInversiones(
  chipCode: string,
  periodo: string,
  mapaData?: MapaInversionesData | null,
): Promise<MapaInversionesResult> {
  // 1. Fetch CUIPO EJEC_GASTOS investment expenses with BEPIN grouping
  const cuipoRows = await sodaCuipoQuery<CuipoBepinAggRow>({
    dataset: CUIPO_DATASETS.EJEC_GASTOS,
    select:
      "bpin, cod_programatico_mga, nom_programatico_mga, sum(compromisos) as compromisos",
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta like '2.3%' AND bpin != '0' AND nom_vigencia_del_gasto='VIGENCIA ACTUAL'`,
    group: "bpin, cod_programatico_mga, nom_programatico_mga",
    limit: 50000,
  });

  // 2. If no mapa data uploaded, return pendiente status with CUIPO summary
  if (!mapaData || mapaData.rows.length === 0) {
    const valorTotal = cuipoRows.reduce(
      (sum, r) => sum + parseFloat(r.compromisos || "0"),
      0
    );
    const uniqueBepins = new Set(cuipoRows.map((r) => r.bpin));

    return {
      totalBepinesCuipo: uniqueBepins.size,
      bepinesConCruce: 0,
      bepinesSinCruce: uniqueBepins.size,
      valorEjecutadoTotal: valorTotal,
      valorConCruce: 0,
      valorSinCruce: valorTotal,
      pctCruceBepin: 0,
      pctCruceValor: 0,
      cruces: cuipoRows.map((r) => ({
        bepin: r.bpin,
        productoMGA: r.cod_programatico_mga || "",
        nombreProducto: r.nom_programatico_mga || "",
        valorCuipo: parseFloat(r.compromisos || "0"),
        existeEnMapa: false,
        valorMapa: 0,
        status: "sin_cruce" as const,
      })),
      status: "pendiente",
    };
  }

  // 3. Build Set of BEPIN values from mapa (normalize: trim and remove leading zeros)
  const mapaBepinSet = new Set<string>();
  const mapaValorByBepin = new Map<string, number>();

  for (const row of mapaData.rows) {
    const normalized = row.bepin.replace(/^0+/, "").trim();
    if (!normalized) continue;
    mapaBepinSet.add(normalized);
    const current = mapaValorByBepin.get(normalized) || 0;
    mapaValorByBepin.set(normalized, current + row.valorEjecutado);
  }

  // 4. Cross-reference each CUIPO BEPIN against mapa
  const cruces: MapaCruceRow[] = [];
  let valorConCruce = 0;
  let valorSinCruce = 0;
  const bepinesConCruceSet = new Set<string>();
  const bepinesSinCruceSet = new Set<string>();

  for (const row of cuipoRows) {
    const normalizedBepin = row.bpin.replace(/^0+/, "").trim();
    const valorCuipo = parseFloat(row.compromisos || "0");
    const existeEnMapa = mapaBepinSet.has(normalizedBepin);
    const valorMapa = mapaValorByBepin.get(normalizedBepin) || 0;

    if (existeEnMapa) {
      valorConCruce += valorCuipo;
      bepinesConCruceSet.add(normalizedBepin);
    } else {
      valorSinCruce += valorCuipo;
      bepinesSinCruceSet.add(normalizedBepin);
    }

    cruces.push({
      bepin: row.bpin,
      productoMGA: row.cod_programatico_mga || "",
      nombreProducto: row.nom_programatico_mga || "",
      valorCuipo,
      existeEnMapa,
      valorMapa,
      status: existeEnMapa ? "ok" : "sin_cruce",
    });
  }

  // 5. Calculate totals
  const uniqueBepins = new Set(cuipoRows.map((r) => r.bpin.replace(/^0+/, "").trim()));
  const totalBepinesCuipo = uniqueBepins.size;
  const bepinesConCruce = bepinesConCruceSet.size;
  const bepinesSinCruce = bepinesSinCruceSet.size;
  const valorEjecutadoTotal = valorConCruce + valorSinCruce;

  const pctCruceBepin = safePct(bepinesConCruce, totalBepinesCuipo);
  const pctCruceValor = safePct(valorConCruce, valorEjecutadoTotal);

  // 6. Determine overall status
  let status: "cumple" | "parcial" | "no_cumple";
  if (pctCruceBepin >= 90 && pctCruceValor >= 90) {
    status = "cumple";
  } else if (pctCruceBepin >= 50 || pctCruceValor >= 50) {
    status = "parcial";
  } else {
    status = "no_cumple";
  }

  // Sort: sin_cruce first, then by value descending
  cruces.sort((a, b) => {
    if (a.status !== b.status) return a.status === "sin_cruce" ? -1 : 1;
    return b.valorCuipo - a.valorCuipo;
  });

  return {
    totalBepinesCuipo,
    bepinesConCruce,
    bepinesSinCruce,
    valorEjecutadoTotal,
    valorConCruce,
    valorSinCruce,
    pctCruceBepin,
    pctCruceValor,
    cruces,
    status,
  };
}
