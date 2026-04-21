"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle } from "lucide-react";
import type { Municipio } from "@/data/municipios";
import { getConsolidada, FUENTES_HOMOLOGADAS } from "@/data/fuentes-consolidacion";

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
  totalReservasVigAnterior?: number;
  totalCxpVigAnterior?: number;
  totalValidador?: number;
  porFuente: {
    codigo: string;
    nombre: string;
    consolidacion?: number | null;
    recaudo: number;
    compromisos: number;
    obligaciones?: number;
    pagos: number;
    reservas?: number;
    cxp?: number;
    superavit: number;
    validador?: number;
    reservasVigAnterior?: number;
    cxpVigAnterior?: number;
    saldoEnLibros?: number;
  }[];
}

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}MM`;
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
  const [vistaConsolidada, setVistaConsolidada] = useState(false);

  // Backwards compat: support both totalCompromisos and totalGastos
  const totalCompromisos = data.totalCompromisos ?? data.totalGastos ?? 0;
  const totalObligaciones = data.totalObligaciones ?? 0;
  const totalReservas = data.totalReservas ?? 0;
  const totalCxP = data.totalCxP ?? 0;
  const saldoEnLibros = data.saldoEnLibros ?? 0;

  // D3: Build consolidated fuente view
  const consolidatedFuentes = useMemo(() => {
    const map = new Map<string, {
      codigo: string;
      nombre: string;
      recaudo: number;
      compromisos: number;
      obligaciones: number;
      pagos: number;
      reservas: number;
      cxp: number;
      superavit: number;
      validador: number;
      reservasVigAnterior: number;
      cxpVigAnterior: number;
      saldoEnLibros: number;
    }>();

    for (const f of data.porFuente) {
      const consolidadaCodigo = getConsolidada(f.codigo) ?? f.codigo;
      const existing = map.get(consolidadaCodigo);

      // Find the consolidated description
      const homologada = FUENTES_HOMOLOGADAS.find(
        (h) => h.consolidadaCodigo === consolidadaCodigo
      );
      const consolidadaNombre = homologada?.consolidadaDescripcion ?? f.nombre;

      if (existing) {
        existing.recaudo += f.recaudo;
        existing.compromisos += f.compromisos;
        existing.obligaciones += (f.obligaciones ?? 0);
        existing.pagos += f.pagos;
        existing.reservas += (f.reservas ?? 0);
        existing.cxp += (f.cxp ?? 0);
        existing.superavit += f.superavit;
        existing.validador += (f.validador ?? 0);
        existing.reservasVigAnterior += (f.reservasVigAnterior ?? 0);
        existing.cxpVigAnterior += (f.cxpVigAnterior ?? 0);
        existing.saldoEnLibros += (f.saldoEnLibros ?? 0);
      } else {
        map.set(consolidadaCodigo, {
          codigo: consolidadaCodigo,
          nombre: consolidadaNombre,
          recaudo: f.recaudo,
          compromisos: f.compromisos,
          obligaciones: f.obligaciones ?? 0,
          pagos: f.pagos,
          reservas: f.reservas ?? 0,
          cxp: f.cxp ?? 0,
          superavit: f.superavit,
          validador: f.validador ?? 0,
          reservasVigAnterior: f.reservasVigAnterior ?? 0,
          cxpVigAnterior: f.cxpVigAnterior ?? 0,
          saldoEnLibros: f.saldoEnLibros ?? 0,
        });
      }
    }

    return Array.from(map.values());
  }, [data.porFuente]);

  const activeFuentes = vistaConsolidada ? consolidatedFuentes : data.porFuente;

  const topFuentes = activeFuentes
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

  // Execution metrics
  const pctEjecucionGastos = pptoDefinitivoGastos > 0 ? (totalCompromisos / pptoDefinitivoGastos) * 100 : 0;
  const saldoDisponible = pptoDefinitivoGastos > 0 ? pptoDefinitivoGastos - totalCompromisos : 0;
  const showPresupuestoBox = pptoInicialGastos > 0;

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

      {/* Presupuesto Summary Box */}
      {showPresupuestoBox && (
        <div className="mb-6 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/40 p-5">
          <h3
            className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--gray-400)]"
          >
            Equilibrio Presupuestal
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--gray-700)] text-left text-[var(--gray-500)]">
                  <th className="py-2 pr-6 font-medium"></th>
                  <th className="py-2 pr-6 text-right font-medium">Inicial</th>
                  <th className="py-2 pr-6 text-right font-medium">Definitivo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--gray-800)]/50">
                  <td className="py-2 pr-6 text-[var(--gray-400)]">Ingresos</td>
                  <td className="py-2 pr-6 text-right text-[var(--gray-300)]">{formatCOP(pptoInicialIngresos)}</td>
                  <td className="py-2 pr-6 text-right text-[var(--gray-300)]">{formatCOP(pptoDefinitivoIngresos)}</td>
                </tr>
                <tr className="border-b border-[var(--gray-800)]/50">
                  <td className="py-2 pr-6 text-[var(--gray-400)]">Gastos</td>
                  <td className="py-2 pr-6 text-right text-[var(--gray-300)]">{formatCOP(pptoInicialGastos)}</td>
                  <td className="py-2 pr-6 text-right text-[var(--gray-300)]">{formatCOP(pptoDefinitivoGastos)}</td>
                </tr>
                <tr className="border-b border-[var(--gray-800)]/50">
                  <td className="py-2 pr-6 font-medium text-white">Diferencia</td>
                  <td className={`py-2 pr-6 text-right font-medium ${pptoInicialIngresos - pptoInicialGastos >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCOP(pptoInicialIngresos - pptoInicialGastos)}
                  </td>
                  <td className={`py-2 pr-6 text-right font-medium ${pptoDefinitivoIngresos - pptoDefinitivoGastos >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCOP(pptoDefinitivoIngresos - pptoDefinitivoGastos)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-6 text-[var(--gray-400)]">Estado</td>
                  <td className="py-2 pr-6 text-right">
                    {pptoInicialIngresos > 0 ? (
                      pptoInicialIngresos >= pptoInicialGastos ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> CUMPLE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                          <XCircle className="h-3 w-3" /> NO CUMPLE
                        </span>
                      )
                    ) : (
                      <span className="text-[var(--gray-600)]">N/D</span>
                    )}
                  </td>
                  <td className="py-2 pr-6 text-right">
                    {pptoDefinitivoIngresos > 0 ? (
                      pptoDefinitivoIngresos >= pptoDefinitivoGastos ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> CUMPLE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                          <XCircle className="h-3 w-3" /> NO CUMPLE
                        </span>
                      )
                    ) : (
                      <span className="text-[var(--gray-600)]">N/D</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Execution metrics */}
          <div className="mt-4 flex flex-wrap gap-6 border-t border-[var(--gray-700)] pt-3">
            <div className="text-xs">
              <span className="text-[var(--gray-500)]">% Ejecucion (compromisos / ppto definitivo gastos): </span>
              <span className="font-semibold text-white">{pctEjecucionGastos.toFixed(1)}%</span>
            </div>
            {pptoDefinitivoGastos > 0 && (
              <div className="text-xs">
                <span className="text-[var(--gray-500)]">Saldo disponible: </span>
                <span className={`font-semibold ${saldoDisponible >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCOP(saldoDisponible)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* D3: Toggle vista detallada / consolidada */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setVistaConsolidada(false)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            !vistaConsolidada
              ? "border-[var(--ochre)] bg-[var(--ochre)]/10 text-[var(--ochre)]"
              : "border-[var(--gray-700)] bg-[var(--gray-800)] text-[var(--gray-400)] hover:text-white"
          }`}
        >
          Vista detallada
        </button>
        <button
          onClick={() => setVistaConsolidada(true)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            vistaConsolidada
              ? "border-[var(--ochre)] bg-[var(--ochre)]/10 text-[var(--ochre)]"
              : "border-[var(--gray-700)] bg-[var(--gray-800)] text-[var(--gray-400)] hover:text-white"
          }`}
        >
          Vista consolidada
        </button>
        {vistaConsolidada && (
          <span className="text-[10px] text-[var(--gray-500)]">
            RF + RB + Vigencia agrupadas por fuente consolidada ({consolidatedFuentes.length} fuentes)
          </span>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-medium text-[var(--gray-400)]">
            Top fuentes de financiacion{vistaConsolidada ? " (consolidadas)" : ""} (millones COP)
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
          {vistaConsolidada ? "Detalle por fuente consolidada" : "Detalle por fuente de financiacion"}
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
                <th className="px-3 py-2 text-right text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">Validador</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">Res. Vig. Ant.</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-[var(--gray-500)] uppercase tracking-wider">CxP Vig. Ant.</th>
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
                  <td className={`px-3 py-2 text-right text-sm tabular-nums ${(f.validador ?? 0) !== 0 ? 'text-red-400 font-bold' : 'text-[var(--gray-400)]'}`}>
                    {formatCOP(f.validador ?? 0)}
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--gray-400)]">
                    {formatCOP(f.reservasVigAnterior ?? 0)}
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--gray-400)]">
                    {formatCOP(f.cxpVigAnterior ?? 0)}
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
              {(() => {
                const footerIngresos = activeFuentes.reduce((s, f) => s + f.recaudo, 0);
                const footerCompromisos = activeFuentes.reduce((s, f) => s + f.compromisos, 0);
                const footerPagos = activeFuentes.reduce((s, f) => s + f.pagos, 0);
                const footerReservas = activeFuentes.reduce((s, f) => s + (f.reservas ?? 0), 0);
                const footerCxP = activeFuentes.reduce((s, f) => s + (f.cxp ?? 0), 0);
                const footerSuperavit = activeFuentes.reduce((s, f) => s + f.superavit, 0);
                const footerValidador = activeFuentes.reduce((s, f) => s + (f.validador ?? 0), 0);
                const footerReservasVigAnt = activeFuentes.reduce((s, f) => s + (f.reservasVigAnterior ?? 0), 0);
                const footerCxpVigAnt = activeFuentes.reduce((s, f) => s + (f.cxpVigAnterior ?? 0), 0);
                const footerSaldoLibros = activeFuentes.reduce((s, f) => s + (f.saldoEnLibros ?? 0), 0);
                return (
                  <tr className="border-t border-[var(--gray-700)] font-medium text-white">
                    <td className="py-2 pr-4">TOTAL</td>
                    <td className="py-2 pr-4 text-right">{formatCOP(footerIngresos)}</td>
                    <td className="py-2 pr-4 text-right">{formatCOP(footerCompromisos)}</td>
                    <td className="py-2 pr-4 text-right">{formatCOP(footerPagos)}</td>
                    <td className="py-2 pr-4 text-right">{formatCOP(footerReservas)}</td>
                    <td className="py-2 pr-4 text-right">{formatCOP(footerCxP)}</td>
                    <td
                      className={`py-2 pr-4 text-right ${
                        footerSuperavit >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatCOP(footerSuperavit)}
                    </td>
                    <td className={`px-3 py-2 text-right text-sm tabular-nums ${footerValidador !== 0 ? 'text-red-400 font-bold' : 'text-[var(--gray-400)]'}`}>
                      {formatCOP(footerValidador)}
                    </td>
                    <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--gray-400)]">
                      {formatCOP(footerReservasVigAnt)}
                    </td>
                    <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--gray-400)]">
                      {formatCOP(footerCxpVigAnt)}
                    </td>
                    <td
                      className={`py-2 text-right ${
                        footerSaldoLibros >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatCOP(footerSaldoLibros)}
                    </td>
                  </tr>
                );
              })()}
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
