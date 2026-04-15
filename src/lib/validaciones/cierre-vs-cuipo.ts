/**
 * Cierre FUT vs CUIPO cross-reference
 *
 * For each FUT Cierre row, compares three values against CUIPO Equilibrio:
 * 1. Saldo en Libros: FUT col O (superávit) vs Equilibrio saldoEnLibros
 * 2. Reservas: FUT col M vs Equilibrio reservas
 * 3. CxP: FUT col J vs Equilibrio cxp
 *
 * The link between FUT and Equilibrio is the consolidation code:
 * - FUT row "C.1.2" has consolidacion=1
 * - Equilibrio fuentes with consolidacion=1 are summed
 */

import { MAPEO_FUT } from "@/data/mapeo-fut-consolidacion";
import type { FUTCierreData } from "@/lib/chip-parser";

export interface CruceRow {
  codigoFUT: string;
  nombre: string;
  nivel: number;
  consolidacion: number | null;
  saldoLibrosFUT: number;
  saldoLibrosCUIPO: number;
  diffSaldoLibros: number;
  reservasFUT: number;
  reservasCUIPO: number;
  diffReservas: number;
  cxpFUT: number;
  cxpCUIPO: number;
  diffCxP: number;
  hasData: boolean;
}

export interface CierreVsCuipoResult {
  cruces: CruceRow[];
  totalDiffSaldoLibros: number;
  totalDiffReservas: number;
  totalDiffCxP: number;
  status: "cumple" | "no_cumple";
}

interface EquilibrioFuente {
  consolidacion: number | null;
  saldoEnLibros?: number;
  reservas: number;
  cxp: number;
}

/**
 * Cross-reference FUT Cierre data against Equilibrio data.
 */
export function evaluateCierreVsCuipo(
  futCierre: FUTCierreData,
  equilibrioPorFuente: EquilibrioFuente[]
): CierreVsCuipoResult {
  // Build consolidation aggregates from equilibrio
  const eqByConsolidacion = new Map<number, { saldoEnLibros: number; reservas: number; cxp: number }>();

  for (const f of equilibrioPorFuente) {
    if (f.consolidacion === null) continue;
    const existing = eqByConsolidacion.get(f.consolidacion) || { saldoEnLibros: 0, reservas: 0, cxp: 0 };
    existing.saldoEnLibros += f.saldoEnLibros ?? 0;
    existing.reservas += f.reservas;
    existing.cxp += f.cxp;
    eqByConsolidacion.set(f.consolidacion, existing);
  }

  // Build FUT lookup by code
  const futByCode = new Map<string, { saldoEnLibros: number; reservas: number; cxp: number }>();
  for (const row of futCierre.rows) {
    futByCode.set(row.codigo.trim(), {
      saldoEnLibros: row.saldoEnLibros,
      reservas: row.reservasPresupuestales,
      cxp: row.cuentasPorPagarVigencia,
    });
  }
  if (futCierre.total) {
    futByCode.set(futCierre.total.codigo.trim(), {
      saldoEnLibros: futCierre.total.saldoEnLibros,
      reservas: futCierre.total.reservasPresupuestales,
      cxp: futCierre.total.cuentasPorPagarVigencia,
    });
  }

  // Build cross-reference rows
  const cruces: CruceRow[] = [];

  for (const mapeo of MAPEO_FUT) {
    const futData = futByCode.get(mapeo.codigoFUT.trim());
    const saldoLibrosFUT = futData?.saldoEnLibros ?? 0;
    const reservasFUT = futData?.reservas ?? 0;
    const cxpFUT = futData?.cxp ?? 0;

    let saldoLibrosCUIPO = 0;
    let reservasCUIPO = 0;
    let cxpCUIPO = 0;

    if (mapeo.consolidacion !== null) {
      const eq = eqByConsolidacion.get(mapeo.consolidacion);
      if (eq) {
        saldoLibrosCUIPO = eq.saldoEnLibros;
        reservasCUIPO = eq.reservas;
        cxpCUIPO = eq.cxp;
      }
    }

    const hasData = futData !== undefined || mapeo.consolidacion !== null;

    cruces.push({
      codigoFUT: mapeo.codigoFUT,
      nombre: mapeo.nombre,
      nivel: mapeo.nivel,
      consolidacion: mapeo.consolidacion,
      saldoLibrosFUT,
      saldoLibrosCUIPO,
      diffSaldoLibros: saldoLibrosCUIPO - saldoLibrosFUT,
      reservasFUT,
      reservasCUIPO,
      diffReservas: reservasCUIPO - reservasFUT,
      cxpFUT,
      cxpCUIPO,
      diffCxP: cxpCUIPO - cxpFUT,
      hasData,
    });
  }

  const withData = cruces.filter((c) => c.consolidacion !== null);
  const totalDiffSaldoLibros = withData.reduce((s, c) => s + Math.abs(c.diffSaldoLibros), 0);
  const totalDiffReservas = withData.reduce((s, c) => s + Math.abs(c.diffReservas), 0);
  const totalDiffCxP = withData.reduce((s, c) => s + Math.abs(c.diffCxP), 0);

  const tolerance = 1;
  const allOk = withData.every(
    (c) =>
      Math.abs(c.diffSaldoLibros) <= tolerance &&
      Math.abs(c.diffReservas) <= tolerance &&
      Math.abs(c.diffCxP) <= tolerance
  );

  return {
    cruces,
    totalDiffSaldoLibros,
    totalDiffReservas,
    totalDiffCxP,
    status: allOk ? "cumple" : "no_cumple",
  };
}
