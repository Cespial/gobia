"use client";

import type { CGAResult, CGACheck } from "@/lib/validaciones/cga";

/* ---------- helpers ---------- */

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function globalStatusColor(s: "cumple" | "no_cumple") {
  if (s === "cumple") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

function globalStatusLabel(s: "cumple" | "no_cumple") {
  if (s === "cumple") return "Cumple";
  return "No Cumple";
}

function checkStatusColor(s: "cumple" | "no_cumple") {
  if (s === "cumple") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

function differenceColor(diff: number, status: "cumple" | "no_cumple") {
  if (status === "cumple") return "text-emerald-400";
  return "text-red-400";
}

/* ---------- sub-components ---------- */

function CheckCard({ check }: { check: CGACheck }) {
  return (
    <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)] p-5">
      {/* Card header */}
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-sm font-semibold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {check.name}
        </h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${checkStatusColor(check.status)}`}
        >
          {check.status === "cumple" ? "Cumple" : "No Cumple"}
        </span>
      </div>

      {/* Two values side by side */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--gray-500)]">
            {check.value1Label}
          </div>
          <div
            className="text-lg font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(check.value1)}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--gray-500)]">
            {check.value2Label}
          </div>
          <div
            className="text-lg font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {formatCOP(check.value2)}
          </div>
        </div>
      </div>

      {/* Difference */}
      <div className="rounded-lg bg-[var(--gray-900)] px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--gray-500)]">Diferencia</span>
          <span
            className={`text-sm font-bold ${differenceColor(check.difference, check.status)}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {check.difference >= 0 ? "+" : ""}
            {formatCOP(check.difference)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- types ---------- */

interface CGAPanelProps {
  data: CGAResult;
  periodo: string;
  municipio: { code: string; name: string; dept: string };
}

/* ---------- main component ---------- */

export default function CGAPanel({ data, periodo, municipio }: CGAPanelProps) {
  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Equilibrio CGA
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
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${globalStatusColor(data.status)}`}
        >
          {globalStatusLabel(data.status)}
        </span>
      </div>

      {/* Check cards grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.checks.map((check) => (
          <CheckCard key={check.name} check={check} />
        ))}
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/50 px-4 py-3">
        <p className="text-xs text-[var(--gray-500)]">
          <span className="font-semibold text-[var(--gray-400)]">Nota:</span>{" "}
          Las reservas y CxP se comparan contra valores calculados de CUIPO.
          Para comparacion contra FUT Cierre, cargue el archivo correspondiente.
        </p>
      </div>
    </div>
  );
}
