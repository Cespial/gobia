"use client";

import type { AguaPotableResult, AguaPotableSubValidacion } from "@/lib/validaciones/agua-potable";

/* ---------- helpers ---------- */

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}MM`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function formatMaybeCOP(value: number | null): string {
  return value === null ? "N/D" : formatCOP(value);
}

type Status = "cumple" | "no_cumple" | "pendiente";

function statusColors(s: Status) {
  if (s === "cumple") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (s === "pendiente") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

function statusLabel(s: Status) {
  if (s === "cumple") return "CUMPLE";
  if (s === "pendiente") return "PENDIENTE";
  return "NO CUMPLE";
}

function barColor(s: Status) {
  if (s === "cumple") return "bg-emerald-400";
  if (s === "pendiente") return "bg-amber-400";
  return "bg-red-400";
}

/* ---------- sub-components ---------- */

function SubValidacionCard({ sv }: { sv: AguaPotableSubValidacion }) {
  const pct = sv.porcentaje;
  const umbral = sv.umbral !== null ? sv.umbral * 100 : null;

  // Bar shows percentage relative to max display
  const maxDisplay = umbral !== null ? Math.max(umbral * 1.5, 100) : 100;
  const barWidth = pct !== null ? Math.min((pct / maxDisplay) * 100, 100) : 0;
  const umbralPos = umbral !== null ? (umbral / maxDisplay) * 100 : null;

  return (
    <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)] p-5">
      {/* Card header */}
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-sm font-semibold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {sv.nombre}
        </h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColors(sv.status)}`}
        >
          {statusLabel(sv.status)}
        </span>
      </div>

      {/* Two values */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--gray-500)]">
            {sv.valor1Label}
          </div>
          <div
            className="text-base font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatMaybeCOP(sv.valor1)}
          </div>
        </div>
        {sv.valor2Label !== "Umbral minimo" ? (
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--gray-500)]">
              {sv.valor2Label}
            </div>
            <div
              className="text-base font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {formatMaybeCOP(sv.valor2)}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--gray-500)]">
              Estado
            </div>
            <div
              className={`text-base font-bold ${sv.status === "cumple" ? "text-emerald-400" : "text-red-400"}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {sv.status === "cumple" ? "Se pagan subsidios" : "Sin subsidios"}
            </div>
          </div>
        )}
      </div>

      {/* Percentage + bar (only if porcentaje is available) */}
      {pct !== null && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-[var(--gray-500)]">Porcentaje</span>
            <span className={`font-semibold ${barColor(sv.status).replace("bg-", "text-")}`}>
              {pct.toFixed(1)}%
              {umbral !== null && (
                <span className="ml-1 font-normal text-[var(--gray-500)]">
                  / limite {umbral.toFixed(0)}%
                </span>
              )}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--gray-700)]">
            <div
              className={`h-full rounded-full transition-all ${barColor(sv.status)}`}
              style={{ width: `${barWidth}%` }}
            />
            {umbralPos !== null && (
              <div
                className="absolute top-0 h-full w-0.5 bg-[var(--ochre)]"
                style={{ left: `${umbralPos}%` }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- props ---------- */

interface AguaPotablePanelProps {
  data: AguaPotableResult | null;
}

/* ---------- main component ---------- */

export default function AguaPotablePanel({ data }: AguaPotablePanelProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-12">
        <p className="text-sm text-[var(--gray-400)]">Calculando...</p>
      </div>
    );
  }

  const globalStatus = data.status as "cumple" | "parcial" | "no_cumple";
  const globalColors =
    globalStatus === "cumple"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : globalStatus === "no_cumple"
      ? "text-red-400 bg-red-400/10 border-red-400/20"
      : "text-amber-400 bg-amber-400/10 border-amber-400/20";
  const globalLabel =
    globalStatus === "cumple" ? "Cumple" : globalStatus === "no_cumple" ? "No Cumple" : "Parcial";

  const { subsidiosDetalle } = data;
  const balancePositivo = subsidiosDetalle.balance >= 0;

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Agua Potable y Saneamiento Basico
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-400)]">
            Evaluacion Ministerio de Vivienda &mdash; Codigo DANE {data.codigoDane}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${globalColors}`}>
          {globalLabel}
        </span>
      </div>

      {/* Summary KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Distribucion SICODIS
          </div>
          <div
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(data.distribucionSICODIS)}
          </div>
          <div className="mt-1 text-xs text-[var(--gray-400)]">
            SGP Agua Potable asignado por DNP
          </div>
        </div>
        <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Presupuesto Definitivo
          </div>
          <div
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatMaybeCOP(data.presupuestoDefinitivo)}
          </div>
          <div className="mt-1 text-xs text-[var(--gray-400)]">
            Presupuesto programado en el archivo CHIP PROG_ING
          </div>
        </div>
      </div>

      {!data.hasProgramacionData && (
        <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          La asignación de recursos queda pendiente hasta cargar el archivo CHIP <span className="font-semibold">PROG_ING</span>.
        </div>
      )}

      {/* Sub-validation cards */}
      <div className="mb-6">
        <h3
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sub-Validaciones ({data.subValidaciones.filter((s) => s.status === "cumple").length}/
          {data.subValidaciones.length} cumplen)
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.subValidaciones.map((sv) => (
            <SubValidacionCard key={sv.nombre} sv={sv} />
          ))}
        </div>
      </div>

      {/* Subsidios detail table */}
      <div className="mb-6 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
        <h3
          className="mb-4 text-sm font-semibold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Desglose de Subsidios
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--gray-700)] text-left">
                <th className="py-2 pr-4 text-xs font-medium text-[var(--gray-500)]">Concepto</th>
                <th className="py-2 text-right text-xs font-medium text-[var(--gray-500)]">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-800)]/60">
              <tr>
                <td className="py-2.5 pr-4 text-[var(--gray-300)]">Subsidios Acueducto</td>
                <td className="py-2.5 text-right text-[var(--gray-300)]">
                  {formatCOP(subsidiosDetalle.acueducto)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[var(--gray-300)]">Subsidios Alcantarillado</td>
                <td className="py-2.5 text-right text-[var(--gray-300)]">
                  {formatCOP(subsidiosDetalle.alcantarillado)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[var(--gray-300)]">Subsidios Aseo</td>
                <td className="py-2.5 text-right text-[var(--gray-300)]">
                  {formatCOP(subsidiosDetalle.aseo)}
                </td>
              </tr>
              <tr className="border-t border-[var(--gray-700)]">
                <td
                  className="py-2.5 pr-4 font-semibold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Total Subsidios Otorgados
                </td>
                <td
                  className="py-2.5 text-right font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatCOP(subsidiosDetalle.totalSubsidios)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[var(--gray-300)]">
                  Contribuciones de Solidaridad
                </td>
                <td className="py-2.5 text-right text-[var(--gray-300)]">
                  {formatCOP(subsidiosDetalle.contribucionesSolidaridad)}
                </td>
              </tr>
              <tr className="border-t border-[var(--gray-700)]">
                <td
                  className="py-2.5 pr-4 font-semibold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Balance (Subsidios &minus; Contribuciones)
                </td>
                <td
                  className={`py-2.5 text-right font-bold ${
                    balancePositivo ? "text-emerald-400" : "text-red-400"
                  }`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {subsidiosDetalle.balance >= 0 ? "+" : ""}
                  {formatCOP(subsidiosDetalle.balance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/50 px-4 py-3 text-xs text-[var(--gray-500)]">
        <strong className="text-[var(--gray-400)]">Nota:</strong> La evaluacion de Agua Potable
        y Saneamiento Basico (APSB) verifica el cumplimiento de la ejecucion del SGP-APSB
        segun los lineamientos del Ministerio de Vivienda, Ciudad y Territorio. Los datos
        provienen del CUIPO (datos.gov.co) y SICODIS (DNP).
      </div>
    </div>
  );
}
