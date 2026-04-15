"use client";

import { CheckCircle2, XCircle, Upload } from "lucide-react";
import type { CierreVsCuipoResult } from "@/lib/validaciones/cierre-vs-cuipo";

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function diffColor(value: number): string {
  return Math.abs(value) > 1 ? "text-red-400" : "text-emerald-400";
}

export default function CierreVsCuipoPanel({
  data,
}: {
  data: CierreVsCuipoResult | null;
}) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Upload className="h-8 w-8 text-[var(--gray-500)]" />
          <p className="text-sm text-[var(--gray-400)]">
            Cargue el FUT Cierre Fiscal para ver los cruces
          </p>
        </div>
      </div>
    );
  }

  const cumple = data.status === "cumple";

  // Filter rows: skip parent rows without data (no consolidation and no data)
  const visibleRows = data.cruces.filter(
    (c) => !(c.hasData === false && c.consolidacion === null)
  );

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
            Cruce por fuente de financiacion (consolidacion)
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
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Dif. Total Saldo en Libros
          </div>
          <div
            className={`text-lg font-bold ${diffColor(data.totalDiffSaldoLibros)}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(data.totalDiffSaldoLibros)}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Dif. Total Reservas
          </div>
          <div
            className={`text-lg font-bold ${diffColor(data.totalDiffReservas)}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(data.totalDiffReservas)}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Dif. Total CxP
          </div>
          <div
            className={`text-lg font-bold ${diffColor(data.totalDiffCxP)}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(data.totalDiffCxP)}
          </div>
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
                Nombre
              </th>
              <th
                className="border-b border-[var(--gray-800)] px-2 py-1 text-center font-medium text-[var(--gray-400)]"
                colSpan={3}
              >
                Saldo en Libros
              </th>
              <th
                className="border-b border-[var(--gray-800)] px-2 py-1 text-center font-medium text-[var(--gray-400)]"
                colSpan={3}
              >
                Reservas
              </th>
              <th
                className="border-b border-[var(--gray-800)] px-2 py-1 text-center font-medium text-[var(--gray-400)]"
                colSpan={3}
              >
                CxP
              </th>
            </tr>
            <tr className="border-b border-[var(--gray-700)] text-[var(--gray-500)]">
              <th className="px-2 py-1.5 text-right font-medium">FUT</th>
              <th className="px-2 py-1.5 text-right font-medium">CUIPO</th>
              <th className="px-2 py-1.5 text-right font-medium">Diff</th>
              <th className="px-2 py-1.5 text-right font-medium">FUT</th>
              <th className="px-2 py-1.5 text-right font-medium">CUIPO</th>
              <th className="px-2 py-1.5 text-right font-medium">Diff</th>
              <th className="px-2 py-1.5 text-right font-medium">FUT</th>
              <th className="px-2 py-1.5 text-right font-medium">CUIPO</th>
              <th className="px-2 py-1.5 text-right font-medium">Diff</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const isParent = row.nivel <= 1;
              const hasDiff =
                row.consolidacion !== null &&
                (Math.abs(row.diffSaldoLibros) > 1 ||
                  Math.abs(row.diffReservas) > 1 ||
                  Math.abs(row.diffCxP) > 1);

              return (
                <tr
                  key={row.codigoFUT}
                  className={`border-b border-[var(--gray-800)]/50 transition-colors hover:bg-[var(--gray-800)]/30 ${
                    hasDiff ? "bg-red-500/5" : ""
                  }`}
                >
                  <td
                    className={`py-2 pr-3 font-mono text-[var(--gray-400)] ${
                      isParent ? "font-bold" : ""
                    }`}
                  >
                    {row.codigoFUT}
                  </td>
                  <td
                    className={`max-w-[220px] truncate py-2 pr-3 text-white ${
                      isParent ? "font-bold" : ""
                    }`}
                    style={{ paddingLeft: `${row.nivel * 12}px` }}
                  >
                    {row.nombre}
                  </td>
                  {/* Saldo en Libros */}
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {formatCOP(row.saldoLibrosFUT)}
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {row.consolidacion !== null
                      ? formatCOP(row.saldoLibrosCUIPO)
                      : "—"}
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-medium ${
                      row.consolidacion !== null
                        ? diffColor(row.diffSaldoLibros)
                        : "text-[var(--gray-600)]"
                    }`}
                  >
                    {row.consolidacion !== null
                      ? formatCOP(row.diffSaldoLibros)
                      : "—"}
                  </td>
                  {/* Reservas */}
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {formatCOP(row.reservasFUT)}
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {row.consolidacion !== null
                      ? formatCOP(row.reservasCUIPO)
                      : "—"}
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-medium ${
                      row.consolidacion !== null
                        ? diffColor(row.diffReservas)
                        : "text-[var(--gray-600)]"
                    }`}
                  >
                    {row.consolidacion !== null
                      ? formatCOP(row.diffReservas)
                      : "—"}
                  </td>
                  {/* CxP */}
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {formatCOP(row.cxpFUT)}
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--gray-300)]">
                    {row.consolidacion !== null
                      ? formatCOP(row.cxpCUIPO)
                      : "—"}
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-medium ${
                      row.consolidacion !== null
                        ? diffColor(row.diffCxP)
                        : "text-[var(--gray-600)]"
                    }`}
                  >
                    {row.consolidacion !== null
                      ? formatCOP(row.diffCxP)
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--gray-700)] font-medium text-white">
              <td className="py-2 pr-3" colSpan={2}>
                TOTAL DIFERENCIA ABSOLUTA
              </td>
              <td className="px-2 py-2" colSpan={2} />
              <td
                className={`px-2 py-2 text-right font-bold ${diffColor(data.totalDiffSaldoLibros)}`}
              >
                {formatCOP(data.totalDiffSaldoLibros)}
              </td>
              <td className="px-2 py-2" colSpan={2} />
              <td
                className={`px-2 py-2 text-right font-bold ${diffColor(data.totalDiffReservas)}`}
              >
                {formatCOP(data.totalDiffReservas)}
              </td>
              <td className="px-2 py-2" colSpan={2} />
              <td
                className={`px-2 py-2 text-right font-bold ${diffColor(data.totalDiffCxP)}`}
              >
                {formatCOP(data.totalDiffCxP)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
