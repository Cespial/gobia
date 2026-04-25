/**
 * CUIPO Processor — Build equilibrio data from parsed CUIPO files
 *
 * This module converts parsed CUIPO file data into the same EquilibrioData
 * shape that the API route returns, enabling client-side validation when
 * users upload CHIP files directly.
 */

import type { CuipoData, CuipoProgIngresosRow } from "./chip-parser";
import { FUENTES_CONSOLIDACION } from '@/data/fuentes-consolidacion';

// ---------------------------------------------------------------------------
// Types (must match the EquilibrioData shape in ValidadorDashboard)
// ---------------------------------------------------------------------------

export interface EquilibrioFromCuipo {
  totalIngresos: number;
  totalCompromisos: number;
  totalGastos: number;
  totalObligaciones: number;
  totalPagos: number;
  totalReservas: number;
  totalCxP: number;
  superavit: number;
  saldoEnLibros: number;
  pctEjecucion: number;
  pptoInicialIngresos: number;
  pptoInicialGastos: number;
  pptoDefinitivoIngresos: number;
  pptoDefinitivoGastos: number;
  equilibrioInicial: number;
  equilibrioDefinitivo: number;
  totalReservasVigAnterior: number;
  totalCxpVigAnterior: number;
  totalValidador: number;
  porFuente: {
    codigo: string;
    nombre: string;
    consolidacion: number | null;
    recaudo: number;
    compromisos: number;
    obligaciones: number;
    pagos: number;
    reservas: number;
    cxp: number;
    superavit: number;
    validador: number;
    reservasVigAnterior: number;
    cxpVigAnterior: number;
    saldoEnLibros: number;
  }[];
}

// ---------------------------------------------------------------------------
// Name → code mapping (reverse lookup)
// ---------------------------------------------------------------------------

/** Build a map from uppercase fuente name → CUIPO code */
const nameToCuipoCode = new Map<string, string>();
for (const f of FUENTES_CONSOLIDACION) {
  nameToCuipoCode.set(f.nombre.toUpperCase().trim(), f.codigoCuipo);
}

/**
 * Try to match a CHIP fuente name to a CUIPO code from the consolidation table.
 * Uses fuzzy prefix matching as fallback since CHIP names may differ slightly.
 */
function matchFuenteToCode(nombre: string): string {
  const upper = nombre.toUpperCase().trim();

  // Exact match
  const exact = nameToCuipoCode.get(upper);
  if (exact) return exact;

  // Try matching with startsWith (CHIP names sometimes have extra suffixes)
  for (const [mapName, code] of nameToCuipoCode.entries()) {
    if (upper.startsWith(mapName) || mapName.startsWith(upper)) {
      return code;
    }
  }

  // Try contains match for shorter names
  for (const [mapName, code] of nameToCuipoCode.entries()) {
    if (upper.includes(mapName) || mapName.includes(upper)) {
      return code;
    }
  }

  return ''; // No match found
}

/**
 * Get consolidation code for a fuente name by looking up its CUIPO code.
 */
function getConsolidacionByName(nombre: string): number | null {
  const code = matchFuenteToCode(nombre);
  if (!code) return null;

  const entry = FUENTES_CONSOLIDACION.find(f => f.codigoCuipo === code);
  return entry?.consolidacion ?? null;
}

// ---------------------------------------------------------------------------
// Main processor
// ---------------------------------------------------------------------------

/**
 * Build EquilibrioData from parsed CUIPO files.
 * This replicates the logic in the API route (src/app/api/plataforma/cuipo/route.ts)
 * but uses client-side parsed data instead of API responses.
 */
export function normalizeProgramacionUploadCode(cuenta: string): string {
  return cuenta.trim().replace(/\.+$/, "");
}

export function isLeafProgramacionUploadCode(
  cuenta: string,
  allCuentas: Set<string>
): boolean {
  const normalized = normalizeProgramacionUploadCode(cuenta);
  if (!normalized) return false;

  const prefix = `${normalized}.`;
  for (const c of allCuentas) {
    if (c !== normalized && c.startsWith(prefix)) return false;
  }

  return true;
}

export function getLeafProgramacionUploadRows(
  rows: CuipoProgIngresosRow[] | null | undefined
): CuipoProgIngresosRow[] {
  if (!rows || rows.length === 0) return [];

  const allCuentas = new Set(
    rows
      .map((row) => normalizeProgramacionUploadCode(row.cuenta))
      .filter(Boolean)
  );

  return rows.filter((row) =>
    isLeafProgramacionUploadCode(row.cuenta, allCuentas)
  );
}

export function sumProgramacionUploadByPrefixes(
  rows: CuipoProgIngresosRow[] | null | undefined,
  prefixes: string[],
  field: "presupuestoInicial" | "presupuestoDefinitivo"
): { total: number | null; hasData: boolean; matchedRows: number } {
  if (!rows || rows.length === 0 || prefixes.length === 0) {
    return { total: null, hasData: false, matchedRows: 0 };
  }

  const normalizedPrefixes = prefixes
    .map((prefix) => normalizeProgramacionUploadCode(prefix))
    .filter(Boolean);

  let total = 0;
  let matchedRows = 0;

  for (const row of getLeafProgramacionUploadRows(rows)) {
    const cuenta = normalizeProgramacionUploadCode(row.cuenta);
    if (
      normalizedPrefixes.some(
        (prefix) => cuenta === prefix || cuenta.startsWith(`${prefix}.`)
      )
    ) {
      total += row[field] ?? 0;
      matchedRows++;
    }
  }

  return {
    total: matchedRows > 0 ? total : null,
    hasData: matchedRows > 0,
    matchedRows,
  };
}

export function buildEquilibrioFromCuipo(cuipoData: CuipoData): EquilibrioFromCuipo {
  // Aggregate income by fuente name
  const fuenteMap = new Map<
    string,
    {
      nombre: string;
      codigo: string;
      recaudo: number;
      compromisos_va: number;
      obligaciones_va: number;
      pagos_va: number;
      compromisos_res: number;
      pagos_res: number;
      compromisos_cxp: number;
      pagos_cxp: number;
    }
  >();

  const emptyFuente = (nombre: string) => ({
    nombre,
    codigo: matchFuenteToCode(nombre) || nombre,
    recaudo: 0,
    compromisos_va: 0,
    obligaciones_va: 0,
    pagos_va: 0,
    compromisos_res: 0,
    pagos_res: 0,
    compromisos_cxp: 0,
    pagos_cxp: 0,
  });

  // Process income rows (leaf rows only — already filtered by parser)
  for (const row of cuipoData.ejecIngresos) {
    const key = row.fuente.toUpperCase().trim();
    if (!key) continue;

    const existing = fuenteMap.get(key) || emptyFuente(row.fuente);
    existing.recaudo += row.totalRecaudo;
    fuenteMap.set(key, existing);
  }

  // Process expense rows (leaf rows only — already filtered by parser)
  for (const row of cuipoData.ejecGastos) {
    const key = row.fuente.toUpperCase().trim();
    if (!key) continue;

    const existing = fuenteMap.get(key) || emptyFuente(row.fuente);

    const vigencia = row.vigencia.toUpperCase();

    if (vigencia.includes('VIGENCIA ACTUAL') || vigencia === '' || vigencia.includes('ADMINISTRACION')) {
      // If vigencia is blank or doesn't match reservas/cxp, treat as vigencia actual
      if (!vigencia.includes('RESERVA') && !vigencia.includes('CUENTAS POR PAGAR')) {
        existing.compromisos_va += row.compromisos;
        existing.obligaciones_va += row.obligaciones;
        existing.pagos_va += row.pagos;
      }
    }

    if (vigencia.includes('RESERVA')) {
      existing.compromisos_res += row.compromisos;
      existing.pagos_res += row.pagos;
    }

    if (vigencia.includes('CUENTAS POR PAGAR')) {
      existing.compromisos_cxp += row.compromisos;
      existing.pagos_cxp += row.pagos;
    }

    fuenteMap.set(key, existing);
  }

  // Calculate derived fields per funding source (same logic as API route)
  const porFuente = Array.from(fuenteMap.values()).map((f) => {
    const reservas_va = Math.max(0, f.compromisos_va - f.obligaciones_va);
    const cxp_va = Math.max(0, f.obligaciones_va - f.pagos_va);
    const superavit = f.recaudo - f.compromisos_va;
    const reservasVigAnterior = f.compromisos_res - f.pagos_res;
    const cxpVigAnterior = f.compromisos_cxp - f.pagos_cxp;
    const saldoEnLibros = superavit + reservas_va + cxp_va + reservasVigAnterior + cxpVigAnterior;
    const validador = f.compromisos_va - f.pagos_va - reservas_va - cxp_va;

    return {
      codigo: f.codigo,
      nombre: f.nombre,
      consolidacion: getConsolidacionByName(f.nombre),
      recaudo: f.recaudo,
      compromisos: f.compromisos_va,
      obligaciones: f.obligaciones_va,
      pagos: f.pagos_va,
      reservas: reservas_va,
      cxp: cxp_va,
      superavit,
      validador,
      reservasVigAnterior,
      cxpVigAnterior,
      saldoEnLibros,
    };
  });

  // Totals
  const totalIngresos = porFuente.reduce((s, f) => s + f.recaudo, 0);
  const totalCompromisos = porFuente.reduce((s, f) => s + f.compromisos, 0);
  const totalObligaciones = porFuente.reduce((s, f) => s + f.obligaciones, 0);
  const totalPagos = porFuente.reduce((s, f) => s + f.pagos, 0);
  const totalReservas = porFuente.reduce((s, f) => s + f.reservas, 0);
  const totalCxP = porFuente.reduce((s, f) => s + f.cxp, 0);
  const superavit = totalIngresos - totalCompromisos;
  const saldoEnLibros = porFuente.reduce((s, f) => s + f.saldoEnLibros, 0);
  const pctEjecucion = totalIngresos > 0 ? (totalCompromisos / totalIngresos) * 100 : 0;
  const totalReservasVigAnterior = porFuente.reduce((s, f) => s + f.reservasVigAnterior, 0);
  const totalCxpVigAnterior = porFuente.reduce((s, f) => s + f.cxpVigAnterior, 0);
  const totalValidador = porFuente.reduce((s, f) => s + f.validador, 0);

  // Programming totals — use the PARENT row (cuenta="1" or "2") directly
  // because CHIP prog files have duplicate leaf rows (with and without
  // detalle sectorial), causing 2x inflation if summed.
  const progIngTotal = cuipoData.progIngresos?.find(
    (r) => r.cuenta.trim() === "1" || r.cuenta.trim() === "1 "
  );
  const progGasTotal = cuipoData.progGastos?.find(
    (r) => r.cuenta.trim() === "2" || r.cuenta.trim() === "2 "
  );

  const pptoInicialIngresos = progIngTotal?.presupuestoInicial ?? 0;
  const pptoDefinitivoIngresos = progIngTotal?.presupuestoDefinitivo ?? 0;
  const pptoInicialGastos = progGasTotal?.presupuestoInicial ?? 0;
  const pptoDefinitivoGastos = progGasTotal?.presupuestoDefinitivo ?? 0;

  const equilibrioInicial = pptoInicialIngresos > 0 ? pptoInicialIngresos - pptoInicialGastos : 0;
  const equilibrioDefinitivo = pptoDefinitivoIngresos > 0 ? pptoDefinitivoIngresos - pptoDefinitivoGastos : 0;

  return {
    totalIngresos,
    totalCompromisos,
    totalGastos: totalCompromisos, // backwards compat alias
    totalObligaciones,
    totalPagos,
    totalReservas,
    totalCxP,
    superavit,
    saldoEnLibros,
    pctEjecucion,
    pptoInicialIngresos,
    pptoInicialGastos,
    pptoDefinitivoIngresos,
    pptoDefinitivoGastos,
    equilibrioInicial,
    equilibrioDefinitivo,
    totalReservasVigAnterior,
    totalCxpVigAnterior,
    totalValidador,
    porFuente: porFuente.sort((a, b) => b.recaudo - a.recaudo),
  };
}
