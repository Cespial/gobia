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
 * For Concejos (Art. 10) and Personerias (Art. 11) there are separate limits
 * based on SMLMV -- these are checked per-section against the same ICLD base.
 */

import {
  fetchIngresosPorFuente,
  fetchGastosPorSeccion,
} from "@/lib/datos-gov-cuipo";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Ley617Section {
  seccion: string;
  gastosFuncionamiento: number;
  icld: number;
  ratio: number;
  limite: number;
  status: "cumple" | "no_cumple";
}

export interface Ley617Result {
  icldTotal: number;
  gastosFuncionamientoTotal: number;
  ratioGlobal: number;
  limiteGlobal: number;
  secciones: Ley617Section[];
  status: "cumple" | "no_cumple";
}

// ---------------------------------------------------------------------------
// Legal limits (Art. 6 Ley 617/2000)
// ---------------------------------------------------------------------------

/**
 * Maximum ratio of gastos de funcionamiento / ICLD by municipal category.
 * Category 0 = Especial.
 */
const LIMITES_LEY617: Record<number, number> = {
  0: 0.5, // Especial
  1: 0.65, // Primera
  2: 0.7, // Segunda
  3: 0.7, // Tercera
  4: 0.8, // Cuarta
  5: 0.8, // Quinta
  6: 0.8, // Sexta
};

/**
 * Per-section limits as fraction of ICLD.
 * Art. 10 (Concejos): 1.5% for cat 1-2, 1.8% for cat 3-6
 * Art. 11 (Personerias): ~1.5-2.5% depending on category
 * These are approximate caps used as warning thresholds.
 */
const LIMITES_CONCEJO: Record<number, number> = {
  0: 0.015,
  1: 0.015,
  2: 0.015,
  3: 0.018,
  4: 0.018,
  5: 0.018,
  6: 0.018,
};

const LIMITES_PERSONERIA: Record<number, number> = {
  0: 0.015,
  1: 0.015,
  2: 0.018,
  3: 0.02,
  4: 0.02,
  5: 0.025,
  6: 0.025,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGlobalLimit(categoria: number): number {
  return LIMITES_LEY617[categoria] ?? LIMITES_LEY617[6];
}

function getSectionLimit(
  seccionName: string,
  categoria: number,
  globalLimit: number
): number {
  const upper = seccionName.toUpperCase();

  if (upper.includes("CONCEJO")) {
    return LIMITES_CONCEJO[categoria] ?? LIMITES_CONCEJO[6];
  }
  if (upper.includes("PERSONERIA")) {
    return LIMITES_PERSONERIA[categoria] ?? LIMITES_PERSONERIA[6];
  }

  // Administracion Central and any other section use the global Art. 6 limit
  return globalLimit;
}

function isICLDSource(fuenteName: string): boolean {
  const upper = (fuenteName || "").toUpperCase();
  return (
    upper.includes("LIBRE DESTINACION") || upper.includes("LIBRE DESTINACI")
  );
}

// ---------------------------------------------------------------------------
// Main evaluation
// ---------------------------------------------------------------------------

export async function evaluateLey617(
  chipCode: string,
  periodo: string,
  categoriaMunicipal?: number
): Promise<Ley617Result> {
  const categoria = categoriaMunicipal ?? 6;
  const limiteGlobal = getGlobalLimit(categoria);

  // Fetch CUIPO data in parallel
  const [ingresosPorFuente, gastosPorSeccion] = await Promise.all([
    fetchIngresosPorFuente(chipCode, periodo),
    fetchGastosPorSeccion(chipCode, periodo),
  ]);

  // 1. Calculate total ICLD (Ingresos Corrientes de Libre Destinacion)
  let icldTotal = 0;
  for (const row of ingresosPorFuente) {
    if (isICLDSource(row.nom_fuentes_financiacion)) {
      icldTotal += parseFloat(row.total_recaudo || "0");
    }
  }

  // 2. Aggregate operating expenses (cuenta starts with "2.1") by section,
  //    filtered to ICLD funding sources only.
  //    The fetchGastosPorSeccion already filters for cuenta like '2.1%' and VIGENCIA ACTUAL.
  const seccionMap = new Map<
    string,
    { gastos: number; seccionCode: string }
  >();

  for (const row of gastosPorSeccion) {
    // Only count expenses funded by ICLD
    if (!isICLDSource(row.nom_fuentes_financiacion)) continue;

    const seccionName = row.nom_seccion_presupuestal || "SIN SECCION";
    const existing = seccionMap.get(seccionName) || {
      gastos: 0,
      seccionCode: row.cod_seccion_presupuestal || "",
    };
    existing.gastos += parseFloat(row.compromisos || "0");
    seccionMap.set(seccionName, existing);
  }

  // 3. Build per-section results
  const secciones: Ley617Section[] = [];
  let gastosFuncionamientoTotal = 0;

  for (const [seccionName, data] of seccionMap.entries()) {
    const gastos = data.gastos;
    gastosFuncionamientoTotal += gastos;

    const ratio = icldTotal > 0 ? gastos / icldTotal : 0;
    const limite = getSectionLimit(seccionName, categoria, limiteGlobal);

    secciones.push({
      seccion: seccionName,
      gastosFuncionamiento: gastos,
      icld: icldTotal,
      ratio: Math.round(ratio * 10000) / 10000,
      limite,
      status: ratio <= limite ? "cumple" : "no_cumple",
    });
  }

  // Sort sections: Administracion Central first, then alphabetical
  secciones.sort((a, b) => {
    const aIsAdmin = a.seccion.toUpperCase().includes("ADMINISTRACION")
      || a.seccion.toUpperCase().includes("CENTRAL");
    const bIsAdmin = b.seccion.toUpperCase().includes("ADMINISTRACION")
      || b.seccion.toUpperCase().includes("CENTRAL");
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;
    return a.seccion.localeCompare(b.seccion);
  });

  // 4. Global ratio and status
  const ratioGlobal =
    icldTotal > 0 ? gastosFuncionamientoTotal / icldTotal : 0;
  const ratioGlobalRounded = Math.round(ratioGlobal * 10000) / 10000;

  const globalCumple = ratioGlobal <= limiteGlobal;
  const allSectionsCumple = secciones.every((s) => s.status === "cumple");

  return {
    icldTotal,
    gastosFuncionamientoTotal,
    ratioGlobal: ratioGlobalRounded,
    limiteGlobal,
    secciones,
    status: globalCumple && allSectionsCumple ? "cumple" : "no_cumple",
  };
}
