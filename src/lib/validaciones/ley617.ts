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
 * Art. 10 (Concejos): Absolute limits calculated via formula (honorarios + gastos generales).
 * Art. 11 (Personerias): Absolute limits in SMLMV (not % of ICLD).
 *
 * ICLD validation: Only income under specific CUIPO account codes counts.
 * The old approach (string-matching "LIBRE DESTINACION") has been replaced
 * with exact account-code + funding-source validation per CGR SI.17 methodology.
 */

import {
  fetchEjecucionIngresos,
  fetchGastosPorSeccion,
} from "@/lib/datos-gov-cuipo";

import {
  isICLDFuente,
  isICLDCuenta,
  isGastoDeducible617,
  GASTOS_DEDUCIBLES_617,
  TOTAL_DEDUCCION_FONDOS,
  LIMITES_ADMIN_CENTRAL,
  LIMITES_PERSONERIA_SMLMV,
  SMLMV_2025,
  calcularLimiteConcejoAnual,
  CONCEJALES_POR_CATEGORIA,
  SESIONES_ORDINARIAS_DEFECTO,
} from "@/data/icld-rubros-validos";

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
  /** Backward compat: alias for icldNeto (used by Ley617Panel) */
  icldTotal: number;
  /** Sum of all income where funding source name is ICLD (before account validation) */
  icldBruto: number;
  /** Sum of income where funding source is ICLD AND account code is valid */
  icldValidado: number;
  /** 3% legal fund deduction from icldValidado */
  deduccionFondos: number;
  /** icldValidado - deduccionFondos — the denominator for ratio calculations */
  icldNeto: number;
  /** icldBruto - icldValidado — money in ICLD sources but wrong account codes */
  accionesMejora: number;
  /** Total 2.1.* compromisos for Admin Central (before deductions) */
  gastosFuncionamientoTotal: number;
  /** Sum of deductible expense compromisos (Admin Central only) */
  gastosDeducidos: number;
  /** gastosFuncionamientoTotal - gastosDeducidos (Admin Central only, after deductions) */
  gastosFuncionamientoNeto: number;
  ratioGlobal: number;
  limiteGlobal: number;
  secciones: Ley617Section[];
  /** Detailed breakdown of each deducted expense */
  gastosDeducidosDetalle: { codigo: string; nombre: string; valor: number }[];
  status: "cumple" | "no_cumple";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGlobalLimit(categoria: number): number {
  return LIMITES_ADMIN_CENTRAL[categoria] ?? LIMITES_ADMIN_CENTRAL[6];
}

function isConcejo(seccionName: string): boolean {
  return seccionName.toUpperCase().includes("CONCEJO");
}

function isPersoneria(seccionName: string): boolean {
  return seccionName.toUpperCase().includes("PERSONERIA");
}

function isAdminCentral(seccionName: string): boolean {
  const upper = seccionName.toUpperCase();
  return upper.includes("ADMINISTRACION") || upper.includes("CENTRAL");
}

/**
 * Check if a funding source name corresponds to Rendimientos Financieros (RF).
 * These should be excluded from ICLD bruto because they are not vigencia actual income.
 */
function isRendimientosFinancieros(nombreFuente: string): boolean {
  const upper = (nombreFuente || "").toUpperCase().trim();
  return (
    upper.startsWith("R.F.") ||
    upper.startsWith("RF ") ||
    upper.includes("RENDIMIENTOS FINANCIEROS")
  );
}

/**
 * Check if a funding source name corresponds to Recursos del Balance (RB).
 * These should be excluded from ICLD bruto because they are prior-year resources.
 */
function isRecursosDelBalance(nombreFuente: string): boolean {
  const upper = (nombreFuente || "").toUpperCase().trim();
  return (
    upper.startsWith("R.B.") ||
    upper.startsWith("RB ") ||
    upper.includes("RECURSOS DEL BALANCE")
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
  // Using fetchEjecucionIngresos (full rows with `cuenta`) instead of
  // fetchIngresosPorFuente (which only returns aggregates without `cuenta`)
  const [ingresosRows, gastosPorSeccion] = await Promise.all([
    fetchEjecucionIngresos(chipCode, periodo),
    fetchGastosPorSeccion(chipCode, periodo),
  ]);

  // -------------------------------------------------------------------------
  // 1. Calculate ICLD: bruto, validado, acciones de mejora, neto
  // -------------------------------------------------------------------------
  let icldBruto = 0;
  let icldValidado = 0;

  for (const row of ingresosRows) {
    const fuenteIsICLD = isICLDFuente(row.nom_fuentes_financiacion);
    if (!fuenteIsICLD) continue;

    // Exclude Rendimientos Financieros (RF) and Recursos del Balance (RB)
    // from ICLD — only vigencia actual income should count
    const fuenteNombre = row.nom_fuentes_financiacion || "";
    if (isRendimientosFinancieros(fuenteNombre) || isRecursosDelBalance(fuenteNombre)) {
      continue;
    }

    const recaudo = parseFloat(row.total_recaudo || "0");
    icldBruto += recaudo;

    // Only count toward validated ICLD if account code is also valid
    if (isICLDCuenta(row.cuenta)) {
      icldValidado += recaudo;
    }
  }

  const accionesMejora = icldBruto - icldValidado;
  const deduccionFondos = icldValidado * TOTAL_DEDUCCION_FONDOS;
  const icldNeto = icldValidado - deduccionFondos;

  // -------------------------------------------------------------------------
  // 2. Aggregate operating expenses (cuenta starts with "2.1") by section,
  //    filtered to ICLD funding sources only.
  //    fetchGastosPorSeccion already filters for cuenta like '2.1%' and VIGENCIA ACTUAL.
  //    It returns individual account rows (with `cuenta`) for deduction matching.
  // -------------------------------------------------------------------------
  const seccionMap = new Map<
    string,
    {
      gastos: number;
      gastosDeducidos: number;
      seccionCode: string;
      deducidosDetalle: { codigo: string; nombre: string; valor: number }[];
    }
  >();

  for (const row of gastosPorSeccion) {
    // Only count expenses funded by ICLD
    if (!isICLDFuente(row.nom_fuentes_financiacion)) continue;

    const seccionName = row.nom_seccion_presupuestal || "SIN SECCION";
    const compromisos = parseFloat(row.compromisos || "0");
    const cuenta = row.cuenta || "";

    const existing = seccionMap.get(seccionName) || {
      gastos: 0,
      gastosDeducidos: 0,
      seccionCode: row.cod_seccion_presupuestal || "",
      deducidosDetalle: [],
    };

    existing.gastos += compromisos;

    // Check if this expense is deductible (for Admin Central primarily)
    if (isGastoDeducible617(cuenta) && compromisos > 0) {
      existing.gastosDeducidos += compromisos;
      // Find the canonical name from GASTOS_DEDUCIBLES_617
      const gastoInfo = GASTOS_DEDUCIBLES_617.find(
        (g) => g.codigo === cuenta.trim()
      );
      existing.deducidosDetalle.push({
        codigo: cuenta.trim(),
        nombre: gastoInfo?.nombre || row.nombre_cuenta || cuenta,
        valor: compromisos,
      });
    }

    seccionMap.set(seccionName, existing);
  }

  // -------------------------------------------------------------------------
  // 3. Build per-section results
  // -------------------------------------------------------------------------
  const secciones: Ley617Section[] = [];
  let gastosFuncionamientoTotal = 0;
  let gastosDeducidosTotal = 0;
  const gastosDeducidosDetalle: { codigo: string; nombre: string; valor: number }[] = [];

  for (const [seccionName, data] of seccionMap.entries()) {
    // For Admin Central, use net expenses (after deductions)
    const isAdmin = isAdminCentral(seccionName);
    const gastosForRatio = isAdmin
      ? data.gastos - data.gastosDeducidos
      : data.gastos;

    gastosFuncionamientoTotal += data.gastos;

    if (isAdmin) {
      gastosDeducidosTotal += data.gastosDeducidos;
      gastosDeducidosDetalle.push(...data.deducidosDetalle);
    }

    // Use icldNeto as denominator for ratio calculations
    const ratio = icldNeto > 0 ? gastosForRatio / icldNeto : 0;

    if (isConcejo(seccionName)) {
      // Art. 10: Use calcularLimiteConcejoAnual formula
      // TODO: Accept numConcejales and numSesiones as user input.
      // Fallback: use category-based defaults from Ley 136/1994.
      const numConcejales = CONCEJALES_POR_CATEGORIA[categoria] ?? CONCEJALES_POR_CATEGORIA[6];
      const numSesiones = SESIONES_ORDINARIAS_DEFECTO;
      const concejoLimite = calcularLimiteConcejoAnual(
        icldNeto,
        numConcejales,
        numSesiones
      );
      const limiteAbsoluto = concejoLimite.total;
      const limiteSMLMV = Math.round(limiteAbsoluto / SMLMV_2025);

      secciones.push({
        seccion: seccionName,
        gastosFuncionamiento: data.gastos,
        icld: icldNeto,
        ratio: Math.round(ratio * 10000) / 10000,
        limite: 0, // not applicable for absolute limits
        limiteAbsoluto,
        limiteSMLMV,
        status: data.gastos <= limiteAbsoluto ? "cumple" : "no_cumple",
        tipoLimite: "absoluto",
      });
    } else if (isPersoneria(seccionName)) {
      // Art. 11: Absolute limit in SMLMV
      const limiteSMLMV =
        LIMITES_PERSONERIA_SMLMV[categoria] ?? LIMITES_PERSONERIA_SMLMV[6];
      const limiteAbsoluto = limiteSMLMV * SMLMV_2025;

      secciones.push({
        seccion: seccionName,
        gastosFuncionamiento: data.gastos,
        icld: icldNeto,
        ratio: Math.round(ratio * 10000) / 10000,
        limite: 0, // not applicable for absolute limits
        limiteAbsoluto,
        limiteSMLMV,
        status: data.gastos <= limiteAbsoluto ? "cumple" : "no_cumple",
        tipoLimite: "absoluto",
      });
    } else {
      // Admin Central & others: Art. 6 percentage limit
      // For Admin Central, ratio uses net expenses (after deductions)
      secciones.push({
        seccion: seccionName,
        gastosFuncionamiento: isAdmin ? gastosForRatio : data.gastos,
        icld: icldNeto,
        ratio: Math.round(ratio * 10000) / 10000,
        limite: limiteGlobal,
        status: ratio <= limiteGlobal ? "cumple" : "no_cumple",
        tipoLimite: "porcentaje",
      });
    }
  }

  // Sort sections: Administracion Central first, then alphabetical
  secciones.sort((a, b) => {
    const aIsAdmin = isAdminCentral(a.seccion);
    const bIsAdmin = isAdminCentral(b.seccion);
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;
    return a.seccion.localeCompare(b.seccion);
  });

  // -------------------------------------------------------------------------
  // 4. Global ratio (Art. 6 — Admin Central net expenses / icldNeto only)
  //    Concejo and Personería have their own absolute limits (Art. 10, 11)
  //    and must NOT inflate the Art. 6 percentage ratio.
  // -------------------------------------------------------------------------
  const adminSection = secciones.find(
    (s) => !isConcejo(s.seccion) && !isPersoneria(s.seccion)
  );
  const gastosFuncionamientoNeto = adminSection
    ? adminSection.gastosFuncionamiento
    : gastosFuncionamientoTotal - gastosDeducidosTotal;
  const ratioGlobal =
    icldNeto > 0 ? gastosFuncionamientoNeto / icldNeto : 0;
  const ratioGlobalRounded = Math.round(ratioGlobal * 10000) / 10000;

  const globalCumple = ratioGlobal <= limiteGlobal;
  const allSectionsCumple = secciones.every((s) => s.status === "cumple");

  return {
    // Backward compat: icldTotal = icldNeto (so Ley617Panel still works)
    icldTotal: icldNeto,
    // New detailed ICLD fields
    icldBruto,
    icldValidado,
    deduccionFondos,
    icldNeto,
    accionesMejora,
    // Expense fields
    gastosFuncionamientoTotal,
    gastosDeducidos: gastosDeducidosTotal,
    gastosFuncionamientoNeto,
    // Ratios
    ratioGlobal: ratioGlobalRounded,
    limiteGlobal,
    secciones,
    gastosDeducidosDetalle,
    status: globalCumple && allSectionsCumple ? "cumple" : "no_cumple",
  };
}
