"use client";

import type { CGAResult, CGACheck } from "@/lib/validaciones/cga";

/* ---------- helpers ---------- */

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e6) { const m = value / 1e6; return `$${Math.abs(m) >= 1000 ? Math.round(m).toLocaleString("es-CO") : m.toFixed(1)}M`; }
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

type Status = "cumple" | "no_cumple" | "pendiente";

function globalStatusColor(s: Status) {
  if (s === "cumple") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (s === "pendiente") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

function globalStatusLabel(s: Status) {
  if (s === "cumple") return "Cumple";
  if (s === "pendiente") return "Pendiente";
  return "No Cumple";
}

function checkStatusColor(s: Status) {
  if (s === "cumple") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (s === "pendiente") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

function differenceColor(status: Status) {
  if (status === "cumple") return "text-emerald-400";
  if (status === "pendiente") return "text-amber-400";
  return "text-red-400";
}

const GROUP_LABELS: Record<string, string> = {
  equilibrio: "Equilibrio Presupuestal",
  vigencia_2025: "Vigencia 2025",
  superavit: "Superávit Fiscal",
  cross_vigencia: "Cruce Vigencia 2024 → 2025",
};

const GROUP_ORDER = ["equilibrio", "vigencia_2025", "superavit", "cross_vigencia"];

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
          {globalStatusLabel(check.status)}
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

      {/* Difference + tolerance */}
      <div className="rounded-lg bg-[var(--gray-900)] px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--gray-500)]">Diferencia</span>
          <span
            className={`text-sm font-bold ${differenceColor(check.status)}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {check.difference >= 0 ? "+" : ""}
            {formatCOP(check.difference)}
          </span>
        </div>
        {check.tolerance > 0 && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] text-[var(--gray-600)]">Tolerancia</span>
            <span className="text-[10px] text-[var(--gray-500)]">
              ±{formatCOP(check.tolerance)}
            </span>
          </div>
        )}
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
  // Group checks by group field
  const grouped = GROUP_ORDER.map((g) => ({
    key: g,
    label: GROUP_LABELS[g] || g,
    checks: data.checks.filter((c) => c.group === g),
  })).filter((g) => g.checks.length > 0);

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

      {/* Grouped check cards */}
      {grouped.map((group) => (
        <div key={group.key} className="mb-6">
          <h3
            className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {group.label}
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {group.checks.map((check) => (
              <CheckCard key={check.name} check={check} />
            ))}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/50 px-4 py-3">
        <p className="text-xs text-[var(--gray-500)]">
          <span className="font-semibold text-[var(--gray-400)]">Nota:</span>{" "}
          Los checks marcados como{" "}
          <span className="font-semibold text-amber-400">Pendiente</span>{" "}
          requieren carga del archivo FUT Cierre correspondiente para su
          validación completa.
        </p>
      </div>
    </div>
  );
}
