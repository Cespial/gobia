"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle } from "lucide-react";
import type { Municipio } from "@/data/municipios";

interface EquilibrioData {
  totalIngresos: number;
  totalCompromisos?: number;
  /** @deprecated Use totalCompromisos instead */
  totalGastos?: number;
  totalObligaciones?: number;
  totalPagos: number;
  totalReservas?: number;
  totalCxP?: number;
  superavit: number;
  saldoEnLibros?: number;
  pctEjecucion: number;
  // Programming data
  pptoInicialIngresos?: number;
  pptoInicialGastos?: number;
  pptoDefinitivoIngresos?: number;
  pptoDefinitivoGastos?: number;
  equilibrioInicial?: number;
  equilibrioDefinitivo?: number;
  porFuente: {
    codigo: string;
    nombre: string;
    recaudo: number;
    compromisos: number;
    obligaciones?: number;
    pagos: number;
    reservas?: number;
    cxp?: number;
    superavit: number;
    saldoEnLibros?: number;
  }[];
}

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function KPI({
  label,
  value,
  subtext,
  trend,
}: {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-[var(--gray-500)]";

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
        {trend && <TrendIcon className={`h-4 w-4 ${trendColor}`} />}
      </div>
      {subtext && <div className="mt-1 text-xs text-[var(--gray-400)]">{subtext}</div>}
    </div>
  );
}

function EquilibrioCheck({
  label,
  ingresos,
  gastos,
}: {
  label: string;
  ingresos: number;
  gastos: number;
}) {
  const diff = ingresos - gastos;
  // Tolerance: equilibrium is "met" if difference is within 0.01% of income
  const tolerance = Math.max(ingresos, gastos) * 0.0001;
  const isBalanced = Math.abs(diff) <= tolerance;

  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--gray-800)] bg-[var(--gray-800)]/50 px-4 py-3">
      <div className="space-y-0.5">
        <div className="text-xs font-medium text-[var(--gray-400)]">{label}</div>
        <div className="flex gap-4 text-xs">
          <span className="text-[var(--gray-500)]">
            Ingresos: <span className="text-[var(--gray-300)]">{formatCOP(ingresos)}</span>
          </span>
          <span className="text-[var(--gray-500)]">
            Gastos: <span className="text-[var(--gray-300)]">{formatCOP(gastos)}</span>
          </span>
          <span className="text-[var(--gray-500)]">
            Diferencia: <span className={diff === 0 ? "text-emerald-400" : "text-amber-400"}>{formatCOP(diff)}</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {isBalanced ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">CUMPLE</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">DESBALANCE</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function EquilibrioPanel({
  data,
  periodo,
  municipio,
}: {
  data: EquilibrioData;
  periodo: string;
  municipio: Municipio;
}) {
  // Backwards compat: support both totalCompromisos and totalGastos
  const totalCompromisos = data.totalCompromisos ?? data.totalGastos ?? 0;
  const totalObligaciones = data.totalObligaciones ?? 0;
  const totalReservas = data.totalReservas ?? 0;
  const totalCxP = data.totalCxP ?? 0;
  const saldoEnLibros = data.saldoEnLibros ?? 0;

  const topFuentes = data.porFuente
    .filter((f) => f.recaudo > 0 || f.compromisos > 0)
    .sort((a, b) => b.recaudo - a.recaudo)
    .slice(0, 15);

  const chartData = topFuentes.map((f) => ({
    name: f.nombre.length > 30 ? f.nombre.slice(0, 30) + "..." : f.nombre,
    Recaudo: f.recaudo / 1e6,
    Compromisos: f.compromisos / 1e6,
    Pagos: f.pagos / 1e6,
  }));

  // Programming data with defaults
  const pptoInicialIngresos = data.pptoInicialIngresos ?? 0;
  const pptoInicialGastos = data.pptoInicialGastos ?? 0;
  const pptoDefinitivoIngresos = data.pptoDefinitivoIngresos ?? 0;
  const pptoDefinitivoGastos = data.pptoDefinitivoGastos ?? 0;
  const hasProgramming = pptoInicialIngresos > 0 || pptoDefinitivoIngresos > 0;

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Equilibrio Presupuestal
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-400)]">
            {municipio.name} — Periodo {periodo.slice(0, 4)} T
            {({ "03": "1", "06": "2", "09": "3", "12": "4" } as Record<string, string>)[
              periodo.slice(4, 6)
            ] || "?"}
          </p>
        </div>
      </div>

      {/* KPIs — Row 1 */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPI
          label="Total Ingresos"
          value={formatCOP(data.totalIngresos)}
          trend="up"
        />
        <KPI
          label="Total Compromisos"
          value={formatCOP(totalCompromisos)}
          trend="neutral"
        />
        <KPI
          label="Total Pagos"
          value={formatCOP(data.totalPagos)}
          subtext={totalCompromisos > 0 ? `${((data.totalPagos / totalCompromisos) * 100).toFixed(1)}% de compromisos` : undefined}
        />
        <KPI
          label="Superavit / Deficit"
          value={formatCOP(data.superavit)}
          trend={data.superavit >= 0 ? "up" : "down"}
          subtext={`Ejecucion: ${data.pctEjecucion.toFixed(1)}%`}
        />
      </div>

      {/* KPIs — Row 2: New fields */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPI
          label="Total Obligaciones"
          value={formatCOP(totalObligaciones)}
          subtext={totalCompromisos > 0 ? `${((totalObligaciones / totalCompromisos) * 100).toFixed(1)}% de compromisos` : undefined}
        />
        <KPI
          label="Total Reservas"
          value={formatCOP(totalReservas)}
          subtext="Compromisos - Obligaciones (VA)"
        />
        <KPI
          label="Total CxP"
          value={formatCOP(totalCxP)}
          subtext="Obligaciones - Pagos (VA)"
        />
        <KPI
          label="Saldo en Libros"
          value={formatCOP(saldoEnLibros)}
          trend={saldoEnLibros >= 0 ? "up" : "down"}
          subtext="Disponibilidad real del municipio"
        />
      </div>

      {/* Verificacion de Equilibrio Presupuestal */}
      {hasProgramming && (
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-[var(--gray-400)]">
            Verificacion de Equilibrio Presupuestal
          </h3>
          <div className="space-y-3">
            <EquilibrioCheck
              label="Presupuesto Inicial"
              ingresos={pptoInicialIngresos}
              gastos={pptoInicialGastos}
            />
            <EquilibrioCheck
              label="Presupuesto Definitivo"
              ingresos={pptoDefinitivoIngresos}
              gastos={pptoDefinitivoGastos}
            />
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-medium text-[var(--gray-400)]">
            Top fuentes de financiacion (millones COP)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fill: "#737373", fontSize: 11 }} />
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
                <Bar dataKey="Recaudo" fill="#B8956A" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Compromisos" fill="#525252" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Pagos" fill="#404040" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detail table */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--gray-400)]">
          Detalle por fuente de financiacion
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--gray-800)] text-left text-[var(--gray-500)]">
                <th className="py-2 pr-4 font-medium">Fuente</th>
                <th className="py-2 pr-4 text-right font-medium">Recaudo</th>
                <th className="py-2 pr-4 text-right font-medium">Compromisos</th>
                <th className="py-2 pr-4 text-right font-medium">Pagos</th>
                <th className="py-2 pr-4 text-right font-medium">Reservas</th>
                <th className="py-2 pr-4 text-right font-medium">CxP</th>
                <th className="py-2 pr-4 text-right font-medium">Superavit</th>
                <th className="py-2 text-right font-medium">Saldo Libros</th>
              </tr>
            </thead>
            <tbody>
              {topFuentes.map((f) => (
                <tr
                  key={f.codigo}
                  className="border-b border-[var(--gray-800)]/50 transition-colors hover:bg-[var(--gray-800)]/30"
                >
                  <td className="py-2 pr-4">
                    <span className="text-white">{f.nombre}</span>
                    <span className="ml-1 text-[var(--gray-600)]">{f.codigo}</span>
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatCOP(f.recaudo)}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatCOP(f.compromisos)}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatCOP(f.pagos)}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatCOP(f.reservas ?? 0)}
                  </td>
                  <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                    {formatCOP(f.cxp ?? 0)}
                  </td>
                  <td
                    className={`py-2 pr-4 text-right font-medium ${
                      f.superavit >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatCOP(f.superavit)}
                  </td>
                  <td
                    className={`py-2 text-right font-medium ${
                      (f.saldoEnLibros ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatCOP(f.saldoEnLibros ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--gray-700)] font-medium text-white">
                <td className="py-2 pr-4">TOTAL</td>
                <td className="py-2 pr-4 text-right">{formatCOP(data.totalIngresos)}</td>
                <td className="py-2 pr-4 text-right">{formatCOP(totalCompromisos)}</td>
                <td className="py-2 pr-4 text-right">{formatCOP(data.totalPagos)}</td>
                <td className="py-2 pr-4 text-right">{formatCOP(totalReservas)}</td>
                <td className="py-2 pr-4 text-right">{formatCOP(totalCxP)}</td>
                <td
                  className={`py-2 pr-4 text-right ${
                    data.superavit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatCOP(data.superavit)}
                </td>
                <td
                  className={`py-2 text-right ${
                    saldoEnLibros >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatCOP(saldoEnLibros)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
