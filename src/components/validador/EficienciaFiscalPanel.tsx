"use client";

import type { EficienciaFiscalResult } from "@/lib/validaciones/eficiencia-fiscal";

/* ---------- helpers ---------- */

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e6) { const m = value / 1e6; return `$${Math.abs(m) >= 1000 ? Math.round(m).toLocaleString("es-CO") : m.toFixed(1)}M`; }
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function statusColor(status: 'cumple' | 'no_cumple' | 'pendiente') {
  if (status === "cumple") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (status === "no_cumple") return "text-red-400 bg-red-400/10 border-red-400/20";
  return "text-gray-400 bg-gray-400/10 border-gray-400/20";
}

function statusLabel(status: 'cumple' | 'no_cumple' | 'pendiente') {
  if (status === "cumple") return "Cumple";
  if (status === "no_cumple") return "No Cumple";
  return "Pendiente";
}

function refrendaColor(refrenda: boolean | null) {
  if (refrenda === true) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (refrenda === false) return "text-red-400 bg-red-400/10 border-red-400/20";
  return "text-gray-400 bg-gray-400/10 border-gray-400/20";
}

function refrendaLabel(refrenda: boolean | null) {
  if (refrenda === true) return "REFRENDA";
  if (refrenda === false) return "NO REFRENDA";
  return "PENDIENTE";
}

/* ---------- sub-components ---------- */

function KPI({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </span>
      </div>
      {subtext && <div className="mt-1 text-xs text-[var(--gray-400)]">{subtext}</div>}
    </div>
  );
}

/* ---------- types ---------- */

interface EficienciaFiscalPanelProps {
  data: EficienciaFiscalResult;
  periodo: string;
  municipio: { code: string; name: string; dept: string };
}

/* ---------- main component ---------- */

export default function EficienciaFiscalPanel({
  data,
  periodo,
  municipio,
}: EficienciaFiscalPanelProps) {
  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Eficiencia Fiscal &mdash; Refrendacion CGN
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-400)]">
            {municipio.name} ({municipio.dept}) &mdash; Periodo{" "}
            {periodo.slice(0, 4)} T
            {(
              {
                "03": "1",
                "06": "2",
                "09": "3",
                "12": "4",
              } as Record<string, string>
            )[periodo.slice(4, 6)] || "?"}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(data.status)}`}
        >
          {statusLabel(data.status)}
        </span>
      </div>

      {/* Info banner when no CGN data */}
      {!data.hasCGNData && (
        <div className="mb-6 rounded-xl border border-gray-400/20 bg-gray-400/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <span className="text-sm text-gray-400">
              Carga los CGN Saldos para activar la validacion completa.
              Actualmente se muestran solo los totales CUIPO.
            </span>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KPI label="Total CUIPO" value={formatCOP(data.totalCuipo)} />
        <KPI
          label="Total CGN"
          value={data.totalCGN !== null ? formatCOP(data.totalCGN) : "---"}
        />
        <KPI
          label="Diferencia Total"
          value={data.totalDifference !== null ? formatCOP(data.totalDifference) : "---"}
        />
        <KPI
          label="Refrendados"
          value={`${data.refrendaCount}`}
          subtext={`de ${data.tributos.length} tributos`}
        />
        <KPI
          label="No Refrendados"
          value={`${data.noRefrendaCount}`}
          subtext={data.noRefrendaCount > 0 ? "Varianza > 50%" : ""}
        />
      </div>

      {/* Detail table */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--gray-400)]">
          Detalle por tributo
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--gray-800)] text-left text-[var(--gray-500)]">
                <th className="py-2 pr-4 font-medium">Tributo</th>
                <th className="py-2 pr-4 font-medium">Cuenta CUIPO</th>
                <th className="py-2 pr-4 text-right font-medium">Recaudo CUIPO</th>
                <th className="py-2 pr-4 text-right font-medium">Total CGN</th>
                <th className="py-2 pr-4 text-right font-medium">Diferencia</th>
                <th className="py-2 pr-4 text-right font-medium">Varianza %</th>
                <th className="py-2 text-center font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.tributos.map((t) => (
                <tr
                  key={t.cuipoAccount}
                  className="border-b border-[var(--gray-800)]/50 transition-colors hover:bg-[var(--gray-800)]/30"
                >
                  <td className="py-2 pr-4 text-white">{t.name}</td>
                  <td className="py-2 pr-4 font-mono text-[var(--gray-400)]">
                    {t.cuipoAccount}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatCOP(t.cuipoTotal)}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {t.cgnTotal !== null ? formatCOP(t.cgnTotal) : <span className="text-[var(--gray-600)]">&mdash;</span>}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {t.difference !== null ? formatCOP(t.difference) : <span className="text-[var(--gray-600)]">&mdash;</span>}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {t.variancePct !== null ? (
                      <span
                        className={
                          t.variancePct <= 50
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {t.variancePct.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-[var(--gray-600)]">&mdash;</span>
                    )}
                  </td>
                  <td className="py-2 text-center">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${refrendaColor(t.refrenda)}`}
                    >
                      {refrendaLabel(t.refrenda)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--gray-700)] font-medium text-white">
                <td className="py-2 pr-4">TOTAL</td>
                <td className="py-2 pr-4" />
                <td className="py-2 pr-4 text-right text-[var(--ochre)]">
                  {formatCOP(data.totalCuipo)}
                </td>
                <td className="py-2 pr-4 text-right text-[var(--ochre)]">
                  {data.totalCGN !== null ? formatCOP(data.totalCGN) : <span className="text-[var(--gray-600)]">&mdash;</span>}
                </td>
                <td className="py-2 pr-4 text-right text-[var(--ochre)]">
                  {data.totalDifference !== null ? formatCOP(data.totalDifference) : <span className="text-[var(--gray-600)]">&mdash;</span>}
                </td>
                <td className="py-2 pr-4" />
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
