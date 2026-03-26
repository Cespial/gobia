"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { FUTCierreData } from "@/lib/chip-parser";

interface EquilibrioFuente {
  codigo: string;
  nombre: string;
  recaudo: number;
  compromisos: number;
  obligaciones: number;
  pagos: number;
  reservas: number;
  cxp: number;
  superavit: number;
  saldoEnLibros?: number;
}

interface CierreVsCuipoProps {
  futCierre: FUTCierreData;
  equilibrioData: {
    porFuente: EquilibrioFuente[];
  };
  periodo: string;
  municipio: { code: string; name: string; dept: string };
}

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

interface ComparisonRow {
  codigo: string;
  nombre: string;
  futSaldoLibros: number;
  futReservas: number;
  futCxP: number;
  cuipoSaldoLibros: number;
  cuipoReservas: number;
  cuipoCxP: number;
  diffSaldoLibros: number;
  diffReservas: number;
  diffCxP: number;
}

export default function CierreVsCuipoPanel({
  futCierre,
  equilibrioData,
  periodo,
  municipio,
}: CierreVsCuipoProps) {
  const { comparisonRows, totals, cumple, matchedCount, totalCount, futOnlyRows, cuipoOnlyRows } =
    useMemo(() => {
      const rows: ComparisonRow[] = [];

      // FUT uses codes like "C.1", "C.1.1" while CUIPO uses funding source codes.
      // 1:1 matching by code is not possible. Instead, we show:
      //   - TOTAL comparison (FUT total vs CUIPO total) as the main metric
      //   - FUT detail rows (from uploaded file) for reference
      //   - CUIPO detail rows (from equilibrio) for reference

      // Build a map of FUT Cierre rows by code for lookup
      const futMap = new Map(
        futCierre.rows.map((r) => [r.codigo, r])
      );

      // Build a map of CUIPO fuentes by code
      const cuipoMap = new Map(
        equilibrioData.porFuente.map((f) => [f.codigo, f])
      );

      // Collect all unique codes from both sources
      const allCodes = new Set<string>();
      for (const r of futCierre.rows) {
        if (r.codigo !== "C" && r.codigo !== "VAL") {
          allCodes.add(r.codigo);
        }
      }
      for (const f of equilibrioData.porFuente) {
        allCodes.add(f.codigo);
      }

      // Sort codes naturally
      const sortedCodes = Array.from(allCodes).sort((a, b) => {
        const partsA = a.split(".").map((p) => parseInt(p) || 0);
        const partsB = b.split(".").map((p) => parseInt(p) || 0);
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
          const diff = (partsA[i] || 0) - (partsB[i] || 0);
          if (diff !== 0) return diff;
        }
        return a.localeCompare(b);
      });

      // Track FUT-only vs CUIPO-only rows
      let futOnly = 0;
      let cuipoOnly = 0;

      for (const code of sortedCodes) {
        const fut = futMap.get(code);
        const cuipo = cuipoMap.get(code);

        if (fut && !cuipo) futOnly++;
        if (cuipo && !fut) cuipoOnly++;

        // CUIPO: use real reservas and cxp from equilibrio data
        //   Reservas = Compromisos - Obligaciones
        //   CxP = Obligaciones - Pagos
        const cuipoSaldoLibros = cuipo
          ? (cuipo.saldoEnLibros ?? cuipo.superavit)
          : 0;
        const cuipoReservas = cuipo ? cuipo.reservas : 0;
        const cuipoCxP = cuipo ? cuipo.cxp : 0;

        const futSaldoLibros = fut ? fut.saldoEnLibros : 0;
        const futReservas = fut ? fut.reservasPresupuestales : 0;
        const futCxP = fut
          ? fut.cuentasPorPagarVigencia + fut.cxpVigenciasAnteriores
          : 0;

        rows.push({
          codigo: code,
          nombre: fut?.nombre || cuipo?.nombre || code,
          futSaldoLibros,
          futReservas,
          futCxP,
          cuipoSaldoLibros,
          cuipoReservas,
          cuipoCxP,
          diffSaldoLibros: futSaldoLibros - cuipoSaldoLibros,
          diffReservas: futReservas - cuipoReservas,
          diffCxP: futCxP - cuipoCxP,
        });
      }

      // Compute totals
      const totalsRow: ComparisonRow = rows.reduce(
        (acc, r) => ({
          ...acc,
          futSaldoLibros: acc.futSaldoLibros + r.futSaldoLibros,
          futReservas: acc.futReservas + r.futReservas,
          futCxP: acc.futCxP + r.futCxP,
          cuipoSaldoLibros: acc.cuipoSaldoLibros + r.cuipoSaldoLibros,
          cuipoReservas: acc.cuipoReservas + r.cuipoReservas,
          cuipoCxP: acc.cuipoCxP + r.cuipoCxP,
          diffSaldoLibros: acc.diffSaldoLibros + r.diffSaldoLibros,
          diffReservas: acc.diffReservas + r.diffReservas,
          diffCxP: acc.diffCxP + r.diffCxP,
        }),
        {
          codigo: "TOTAL",
          nombre: "TOTAL",
          futSaldoLibros: 0,
          futReservas: 0,
          futCxP: 0,
          cuipoSaldoLibros: 0,
          cuipoReservas: 0,
          cuipoCxP: 0,
          diffSaldoLibros: 0,
          diffReservas: 0,
          diffCxP: 0,
        }
      );

      // Count matches (tolerance: 1% of FUT value or $1M, whichever is greater)
      let matched = 0;
      for (const r of rows) {
        const tolerance = Math.max(
          Math.abs(r.futSaldoLibros) * 0.01,
          1_000_000
        );
        if (Math.abs(r.diffSaldoLibros) <= tolerance) {
          matched++;
        }
      }

      const allCumple =
        rows.length > 0 &&
        Math.abs(totalsRow.diffSaldoLibros) <=
          Math.max(Math.abs(totalsRow.futSaldoLibros) * 0.01, 1_000_000);

      return {
        comparisonRows: rows,
        totals: totalsRow,
        cumple: allCumple,
        matchedCount: matched,
        totalCount: rows.length,
        futOnlyRows: futOnly,
        cuipoOnlyRows: cuipoOnly,
      };
    }, [futCierre, equilibrioData]);

  const periodoLabel = (() => {
    const year = periodo.slice(0, 4);
    const month = parseInt(periodo.slice(4, 6));
    const labels: Record<number, string> = {
      3: "T1",
      6: "T2",
      9: "T3",
      12: "T4",
    };
    return `${year} ${labels[month] || `M${month}`}`;
  })();

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Conciliacion Cierre FUT vs CUIPO
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-400)]">
            {municipio.name} ({municipio.dept}) — {periodoLabel} — Vigencia{" "}
            {futCierre.vigencia}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
            cumple
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {cumple ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          {cumple ? "CUMPLE" : "NO CUMPLE"}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Fuentes comparadas
          </div>
          <div
            className="text-lg font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {totalCount}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Conciliadas
          </div>
          <div
            className="text-lg font-bold text-emerald-400"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {matchedCount}/{totalCount}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Dif. Total Saldo Libros
          </div>
          <div
            className={`text-lg font-bold ${
              Math.abs(totals.diffSaldoLibros) < 1_000_000
                ? "text-emerald-400"
                : "text-red-400"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(totals.diffSaldoLibros)}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Dif. Total CxP
          </div>
          <div
            className={`text-lg font-bold ${
              Math.abs(totals.diffCxP) < 1_000_000
                ? "text-emerald-400"
                : "text-red-400"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(totals.diffCxP)}
          </div>
        </div>
      </div>

      {/* Warning about code mapping */}
      <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-1">
          <p>
            <strong>Reservas CUIPO</strong> = Compromisos &minus; Obligaciones.{" "}
            <strong>CxP CUIPO</strong> = Obligaciones &minus; Pagos. Valores
            derivados de la ejecucion por fuente.
          </p>
          <p>
            FUT usa codigos tipo &quot;C.1&quot;, &quot;C.1.1&quot; mientras
            CUIPO usa codigos de fuente de financiacion. La comparacion
            por fuente individual requiere mapeo manual; la
            conciliacion de <strong>totales</strong> es confiable.
            {(futOnlyRows > 0 || cuipoOnlyRows > 0) && (
              <span>
                {" "}({futOnlyRows} fuentes solo en FUT, {cuipoOnlyRows} solo en
                CUIPO)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--gray-800)]">
              <th
                className="py-2 pr-3 text-left font-medium text-[var(--gray-500)]"
                rowSpan={2}
              >
                Codigo
              </th>
              <th
                className="py-2 pr-3 text-left font-medium text-[var(--gray-500)]"
                rowSpan={2}
              >
                Fuente
              </th>
              <th
                className="border-b border-[var(--gray-800)] px-2 py-1 text-center font-medium text-[var(--ochre)]"
                colSpan={3}
              >
                FUT Cierre
              </th>
              <th
                className="border-b border-[var(--gray-800)] px-2 py-1 text-center font-medium text-blue-400"
                colSpan={3}
              >
                CUIPO
              </th>
              <th
                className="border-b border-[var(--gray-800)] px-2 py-1 text-center font-medium text-[var(--gray-400)]"
                colSpan={3}
              >
                Diferencia
              </th>
            </tr>
            <tr className="border-b border-[var(--gray-700)] text-[var(--gray-500)]">
              <th className="px-2 py-1.5 text-right font-medium">
                Saldo Libros
              </th>
              <th className="px-2 py-1.5 text-right font-medium">Reservas</th>
              <th className="px-2 py-1.5 text-right font-medium">CxP</th>
              <th className="px-2 py-1.5 text-right font-medium">
                Saldo Libros
              </th>
              <th className="px-2 py-1.5 text-right font-medium">Reservas</th>
              <th className="px-2 py-1.5 text-right font-medium">CxP</th>
              <th className="px-2 py-1.5 text-right font-medium">
                Saldo Libros
              </th>
              <th className="px-2 py-1.5 text-right font-medium">Reservas</th>
              <th className="px-2 py-1.5 text-right font-medium">CxP</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => {
              const hasDiff =
                Math.abs(row.diffSaldoLibros) >
                Math.max(Math.abs(row.futSaldoLibros) * 0.01, 1_000_000);

              return (
                <tr
                  key={row.codigo}
                  className={`border-b border-[var(--gray-800)]/50 transition-colors hover:bg-[var(--gray-800)]/30 ${
                    hasDiff ? "bg-red-500/5" : ""
                  }`}
                >
                  <td className="py-2 pr-3 font-mono text-[var(--gray-400)]">
                    {row.codigo}
                  </td>
                  <td className="max-w-[200px] truncate py-2 pr-3 text-white">
                    {row.nombre}
                  </td>
                  {/* FUT Cierre columns */}
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {formatCOP(row.futSaldoLibros)}
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {formatCOP(row.futReservas)}
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {formatCOP(row.futCxP)}
                  </td>
                  {/* CUIPO columns */}
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {formatCOP(row.cuipoSaldoLibros)}
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {formatCOP(row.cuipoReservas)}
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {formatCOP(row.cuipoCxP)}
                  </td>
                  {/* Difference columns */}
                  <td
                    className={`px-2 py-2 text-right font-medium ${
                      Math.abs(row.diffSaldoLibros) < 1_000_000
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCOP(row.diffSaldoLibros)}
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-medium ${
                      Math.abs(row.diffReservas) < 1_000_000
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCOP(row.diffReservas)}
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-medium ${
                      Math.abs(row.diffCxP) < 1_000_000
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCOP(row.diffCxP)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--gray-700)] font-medium text-white">
              <td className="py-2 pr-3" colSpan={2}>
                TOTAL
              </td>
              <td className="px-2 py-2 text-right">
                {formatCOP(totals.futSaldoLibros)}
              </td>
              <td className="px-2 py-2 text-right">
                {formatCOP(totals.futReservas)}
              </td>
              <td className="px-2 py-2 text-right">
                {formatCOP(totals.futCxP)}
              </td>
              <td className="px-2 py-2 text-right">
                {formatCOP(totals.cuipoSaldoLibros)}
              </td>
              <td className="px-2 py-2 text-right">
                {formatCOP(totals.cuipoReservas)}
              </td>
              <td className="px-2 py-2 text-right">
                {formatCOP(totals.cuipoCxP)}
              </td>
              <td
                className={`px-2 py-2 text-right font-bold ${
                  Math.abs(totals.diffSaldoLibros) < 1_000_000
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatCOP(totals.diffSaldoLibros)}
              </td>
              <td
                className={`px-2 py-2 text-right font-bold ${
                  Math.abs(totals.diffReservas) < 1_000_000
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatCOP(totals.diffReservas)}
              </td>
              <td
                className={`px-2 py-2 text-right font-bold ${
                  Math.abs(totals.diffCxP) < 1_000_000
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatCOP(totals.diffCxP)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
