"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------- helpers ---------- */

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e6) { const m = value / 1e6; return `$${Math.abs(m) >= 1000 ? m.toFixed(0) : m.toFixed(1)}M`; }
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function formatMaybeCOP(value: number | null): string {
  return value === null ? "N/D" : formatCOP(value);
}

function formatDistributionPct(
  numerator: number | null,
  denominator: number
): string | undefined {
  if (numerator === null || denominator <= 0) return undefined;
  return `${((numerator / denominator) * 100).toFixed(1)}% de distribución`;
}

function statusColor(s: "cumple" | "alerta" | "critico") {
  if (s === "cumple") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (s === "alerta") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

function statusLabel(s: "cumple" | "alerta" | "critico") {
  if (s === "cumple") return "Cumple";
  if (s === "alerta") return "Alerta";
  return "Crítico";
}

function barColor(s: "cumple" | "alerta" | "critico") {
  if (s === "cumple") return "bg-emerald-400";
  if (s === "alerta") return "bg-amber-400";
  return "bg-red-400";
}

function globalStatusColor(s: "cumple" | "parcial" | "no_cumple") {
  if (s === "cumple") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (s === "parcial") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

function globalStatusLabel(s: "cumple" | "parcial" | "no_cumple") {
  if (s === "cumple") return "Cumple";
  if (s === "parcial") return "Parcial";
  return "No Cumple";
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

interface SGPPanelProps {
  data: {
    totalDistribuido: number;
    totalPresupuestado: number | null;
    totalRecaudado: number;
    totalEjecutado: number;
    pctEjecucionGlobal: number;
    hasProgramacionData: boolean;
    componentes: {
      concepto: string;
      distribucionDNP: number;
      presupuestado: number | null;
      recaudado: number;
      ejecutado: number;
      pctPresupuesto: number | null;
      pctRecaudo: number;
      pctEjecucion: number;
      status: "cumple" | "alerta" | "critico";
    }[];
    status: "cumple" | "parcial" | "no_cumple";
  };
  periodo: string;
  municipio: { code: string; name: string; dept: string };
}

/* ---------- main component ---------- */

export default function SGPPanel({ data, periodo, municipio }: SGPPanelProps) {
  const chartData = data.componentes.map((c) => ({
    name:
      c.concepto.length > 28 ? c.concepto.slice(0, 28) + "\u2026" : c.concepto,
    "Distribución DNP": c.distribucionDNP / 1e6,
    Ejecutado: c.ejecutado / 1e6,
    status: c.status,
  }));

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Evaluación SGP
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-400)]">
            {municipio.name} ({municipio.dept}) &mdash; Período{" "}
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

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPI label="Distribución DNP" value={formatCOP(data.totalDistribuido)} />
        <KPI
          label="Presupuestado"
          value={formatMaybeCOP(data.totalPresupuestado)}
          subtext={formatDistributionPct(data.totalPresupuestado, data.totalDistribuido)}
        />
        <KPI
          label="Recaudado"
          value={formatCOP(data.totalRecaudado)}
          subtext={formatDistributionPct(data.totalRecaudado, data.totalDistribuido)}
        />
        <KPI
          label="Ejecutado"
          value={formatCOP(data.totalEjecutado)}
          subtext={`${data.pctEjecucionGlobal.toFixed(1)}% ejecución global`}
        />
      </div>

      {!data.hasProgramacionData && (
        <div className="mb-8 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          El presupuesto SGP queda en N/D hasta cargar el archivo CHIP <span className="font-semibold">PROG_ING</span>.
        </div>
      )}

      {/* Bar chart: Distribution vs Execution */}
      {chartData.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-medium text-[var(--gray-400)]">
            Distribución DNP vs Ejecución por componente (millones COP)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: "#737373", fontSize: 11 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={200}
                  tick={{ fill: "#A3A3A3", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#262626",
                    border: "1px solid #404040",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 12,
                  }}
                  formatter={(value) => `$${Number(value).toFixed(1)}M`}
                />
                <Bar
                  dataKey="Distribución DNP"
                  fill="#B8956A"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="Ejecutado"
                  fill="#525252"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detail table */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--gray-400)]">
          Detalle por componente SGP
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--gray-800)] text-left text-[var(--gray-500)]">
                <th className="py-2 pr-4 font-medium">Componente</th>
                <th className="py-2 pr-4 text-right font-medium">Dist. DNP</th>
                <th className="py-2 pr-4 text-right font-medium">Presup.</th>
                <th className="py-2 pr-4 text-right font-medium">Recaudado</th>
                <th className="py-2 pr-4 text-right font-medium">Ejecutado</th>
                <th className="py-2 pr-4 text-right font-medium">% Ejec.</th>
                <th className="py-2 text-center font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.componentes.map((c) => (
                <tr
                  key={c.concepto}
                  className="border-b border-[var(--gray-800)]/50 transition-colors hover:bg-[var(--gray-800)]/30"
                >
                  <td className="py-2 pr-4 text-white">{c.concepto}</td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatCOP(c.distribucionDNP)}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatMaybeCOP(c.presupuestado)}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatCOP(c.recaudado)}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatCOP(c.ejecutado)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--gray-800)]">
                        <div
                          className={`h-full rounded-full ${barColor(c.status)}`}
                          style={{
                            width: `${Math.min(c.pctEjecucion, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[var(--gray-300)]">
                        {c.pctEjecucion.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2 text-center">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColor(c.status)}`}
                    >
                      {statusLabel(c.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--gray-700)] font-medium text-white">
                <td className="py-2 pr-4">TOTAL</td>
                <td className="py-2 pr-4 text-right">
                  {formatCOP(data.totalDistribuido)}
                </td>
                <td className="py-2 pr-4 text-right">
                  {formatMaybeCOP(data.totalPresupuestado)}
                </td>
                <td className="py-2 pr-4 text-right">
                  {formatCOP(data.totalRecaudado)}
                </td>
                <td className="py-2 pr-4 text-right">
                  {formatCOP(data.totalEjecutado)}
                </td>
                <td className="py-2 pr-4 text-right text-[var(--ochre)]">
                  {data.pctEjecucionGlobal.toFixed(1)}%
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
