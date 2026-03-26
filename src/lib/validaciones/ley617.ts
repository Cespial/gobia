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
 * Art. 10 (Concejos): Absolute limits in SMLMV (not % of ICLD).
 * Art. 11 (Personerias): Absolute limits in SMLMV (not % of ICLD).
 */

import {
  fetchIngresosPorFuente,
  fetchGastosPorSeccion,
} from "@/lib/datos-gov-cuipo";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Salario Mínimo Legal Mensual Vigente 2025 */
const SMLMV_2025 = 1_423_500;

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
 * Art. 10 (Concejos): Absolute annual limits in SMLMV.
 * These cover honorarios + gastos operativos del Concejo.
 */
const LIMITES_CONCEJO_SMLMV: Record<number, number> = {
  0: 150, // Especial — simplified; actual formula depends on #concejales x sesiones x factor
  1: 150, // Primera
  2: 120, // Segunda
  3: 60,  // Tercera
  4: 40,  // Cuarta
  5: 30,  // Quinta
  6: 25,  // Sexta
};

/**
 * Art. 11 (Personerias): Absolute annual limits in SMLMV.
 */
const LIMITES_PERSONERIA_SMLMV: Record<number, number> = {
  0: 500, // Especial
  1: 350, // Primera
  2: 280, // Segunda
  3: 190, // Tercera
  4: 150, // Cuarta
  5: 120, // Quinta
  6: 100, // Sexta
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGlobalLimit(categoria: number): number {
  return LIMITES_LEY617[categoria] ?? LIMITES_LEY617[6];
}

function isICLDSource(fuenteName: string): boolean {
  const upper = (fuenteName || "").toUpperCase();
  return (
    upper.includes("LIBRE DESTINACION") || upper.includes("LIBRE DESTINACI")
  );
}

function isConcejo(seccionName: string): boolean {
  return seccionName.toUpperCase().includes("CONCEJO");
}

function isPersoneria(seccionName: string): boolean {
  return seccionName.toUpperCase().includes("PERSONERIA");
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

    if (isConcejo(seccionName)) {
      // Art. 10: Absolute limit in SMLMV
      const limiteSMLMV = LIMITES_CONCEJO_SMLMV[categoria] ?? LIMITES_CONCEJO_SMLMV[6];
      const limiteAbsoluto = limiteSMLMV * SMLMV_2025;

      secciones.push({
        seccion: seccionName,
        gastosFuncionamiento: gastos,
        icld: icldTotal,
        ratio: Math.round(ratio * 10000) / 10000,
        limite: 0, // not applicable for absolute limits
        limiteAbsoluto,
        limiteSMLMV,
        status: gastos <= limiteAbsoluto ? "cumple" : "no_cumple",
        tipoLimite: "absoluto",
      });
    } else if (isPersoneria(seccionName)) {
      // Art. 11: Absolute limit in SMLMV
      const limiteSMLMV = LIMITES_PERSONERIA_SMLMV[categoria] ?? LIMITES_PERSONERIA_SMLMV[6];
      const limiteAbsoluto = limiteSMLMV * SMLMV_2025;

      secciones.push({
        seccion: seccionName,
        gastosFuncionamiento: gastos,
        icld: icldTotal,
        ratio: Math.round(ratio * 10000) / 10000,
        limite: 0, // not applicable for absolute limits
        limiteAbsoluto,
        limiteSMLMV,
        status: gastos <= limiteAbsoluto ? "cumple" : "no_cumple",
        tipoLimite: "absoluto",
      });
    } else {
      // Admin Central & others: Art. 6 percentage limit
      secciones.push({
        seccion: seccionName,
        gastosFuncionamiento: gastos,
        icld: icldTotal,
        ratio: Math.round(ratio * 10000) / 10000,
        limite: limiteGlobal,
        status: ratio <= limiteGlobal ? "cumple" : "no_cumple",
        tipoLimite: "porcentaje",
      });
    }
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

  // 4. Global ratio (Art. 6 — Admin Central ratio only, but using total gastos for overview)
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
