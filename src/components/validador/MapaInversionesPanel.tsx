"use client";

import { CheckCircle2, XCircle, Upload, MapPin } from "lucide-react";
import type { MapaInversionesResult } from "@/lib/validaciones/mapa-inversiones";

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

export default function MapaInversionesPanel({
  data,
}: {
  data: MapaInversionesResult | null;
}) {
  if (!data || data.status === "pendiente") {
    return (
      <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Upload className="h-8 w-8 text-[var(--gray-500)]" />
          <p className="text-sm text-[var(--gray-400)]">
            Cargue el Mapa de Inversiones (DNP) para validar los BPIN contra el Plan de Desarrollo
          </p>
          {data && data.totalBepinesCuipo > 0 && (
            <p className="text-xs text-[var(--gray-500)]">
              {data.totalBepinesCuipo} BPIN encontrados en CUIPO ({formatCOP(data.valorEjecutadoTotal)} en inversion)
            </p>
          )}
        </div>
      </div>
    );
  }

  const isCumple = data.status === "cumple";
  const isParcial = data.status === "parcial";

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mapa de Inversiones vs CUIPO
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-400)]">
            Cruce de BPIN ejecutados contra el Plan de Desarrollo Municipal (DNP)
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
            isCumple
              ? "bg-emerald-500/15 text-emerald-400"
              : isParcial
              ? "bg-amber-500/15 text-amber-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {isCumple ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          {isCumple ? "CUMPLE" : isParcial ? "PARCIAL" : "NO CUMPLE"}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            BPIN en CUIPO
          </div>
          <div
            className="text-lg font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.totalBepinesCuipo}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            BPIN con cruce
          </div>
          <div
            className="text-lg font-bold text-emerald-400"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.bepinesConCruce}
            <span className="ml-1 text-sm font-normal text-[var(--gray-500)]">
              ({data.pctCruceBepin.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            $ con cruce (PDM)
          </div>
          <div
            className="text-lg font-bold text-emerald-400"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(data.valorConCruce)}
            <span className="ml-1 text-sm font-normal text-[var(--gray-500)]">
              ({data.pctCruceValor.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            $ sin cruce
          </div>
          <div
            className={`text-lg font-bold ${data.valorSinCruce > 0 ? "text-red-400" : "text-emerald-400"}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(data.valorSinCruce)}
            <span className="ml-1 text-sm font-normal text-[var(--gray-500)]">
              ({(100 - data.pctCruceValor).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--gray-400)]">
          <span>Cobertura de inversion en PDM</span>
          <span className="font-semibold text-white">{data.pctCruceValor.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--gray-800)]">
          <div
            className={`h-full rounded-full transition-all ${
              data.pctCruceValor >= 90
                ? "bg-emerald-400"
                : data.pctCruceValor >= 50
                ? "bg-amber-400"
                : "bg-red-400"
            }`}
            style={{ width: `${Math.min(data.pctCruceValor, 100)}%` }}
          />
        </div>
      </div>

      {/* BPIN detail table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--gray-700)]">
              <th className="py-2 pr-3 text-left font-medium text-[var(--gray-500)]">
                Estado
              </th>
              <th className="py-2 pr-3 text-left font-medium text-[var(--gray-500)]">
                BPIN
              </th>
              <th className="py-2 pr-3 text-left font-medium text-[var(--gray-500)]">
                Producto MGA
              </th>
              <th className="py-2 pr-3 text-left font-medium text-[var(--gray-500)]">
                Nombre Producto
              </th>
              <th className="py-2 pr-3 text-right font-medium text-[var(--gray-500)]">
                Valor CUIPO
              </th>
              <th className="py-2 pr-3 text-right font-medium text-[var(--gray-500)]">
                Valor Mapa
              </th>
              <th className="py-2 text-left font-medium text-[var(--gray-500)]">
                Observacion
              </th>
            </tr>
          </thead>
          <tbody>
            {data.cruces.map((row, idx) => (
              <tr
                key={`${row.bepin}-${row.productoMGA}-${idx}`}
                className={`border-b border-[var(--gray-800)]/50 transition-colors hover:bg-[var(--gray-800)]/30 ${
                  row.status === "sin_cruce" ? "bg-red-500/5" : ""
                }`}
              >
                <td className="py-2 pr-3">
                  {row.status === "ok" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-[var(--gray-300)]">
                  {row.bepin}
                </td>
                <td className="py-2 pr-3 text-[var(--gray-400)]">
                  {row.productoMGA || "—"}
                </td>
                <td className="max-w-[200px] truncate py-2 pr-3 text-white">
                  {row.nombreProducto || "—"}
                </td>
                <td className="py-2 pr-3 text-right text-[var(--gray-300)]">
                  {formatCOP(row.valorCuipo)}
                </td>
                <td className="py-2 pr-3 text-right text-[var(--gray-300)]">
                  {row.existeEnMapa ? formatCOP(row.valorMapa) : "—"}
                </td>
                <td className="py-2 text-left">
                  {row.status === "sin_cruce" ? (
                    <span className="flex items-center gap-1 text-red-400">
                      <MapPin className="h-3 w-3" />
                      No suma al Plan de Desarrollo
                    </span>
                  ) : (
                    <span className="text-emerald-400">Registrado en PDM</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--gray-700)] font-medium text-white">
              <td className="py-2 pr-3" colSpan={4}>
                TOTAL
              </td>
              <td className="py-2 pr-3 text-right font-bold">
                {formatCOP(data.valorEjecutadoTotal)}
              </td>
              <td className="py-2 pr-3" />
              <td className="py-2">
                <span className="text-emerald-400">{data.bepinesConCruce} cruzan</span>
                {data.bepinesSinCruce > 0 && (
                  <span className="ml-2 text-red-400">{data.bepinesSinCruce} sin cruce</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
