"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  kpisPrincipales,
  recaudoTributario,
  indicadoresIDF,
  gastosCategoria,
  ejecucionMensual,
  historicoIDF,
  carteraMorosa,
  fuentesRecursos,
} from "@/data/medellin-hacienda";

function formatCOP(millones: number): string {
  if (millones >= 1_000_000) return `$${(millones / 1_000_000).toFixed(1)}B`;
  if (millones >= 1_000) return `$${(millones / 1_000).toFixed(0)} MM`;
  return `$${millones.toFixed(0)} M`;
}

function pct(n: number, d: number) {
  return d > 0 ? ((n / d) * 100).toFixed(1) : "0";
}

export default function HaciendaDashboard() {
  const [activeTab, setActiveTab] = useState<"resumen" | "recaudo" | "gastos" | "idf">("resumen");

  const tabs = [
    { key: "resumen" as const, label: "Resumen" },
    { key: "recaudo" as const, label: "Recaudo" },
    { key: "gastos" as const, label: "Gastos" },
    { key: "idf" as const, label: "IDF" },
  ];

  // Executive context: determine fiscal health for decision-makers
  const totalRecaudado = recaudoTributario.reduce((s, r) => s + r.recaudado, 0);
  const totalPresupuestado = recaudoTributario.reduce((s, r) => s + r.presupuestado, 0);
  const recaudoPct = totalPresupuestado > 0 ? (totalRecaudado / totalPresupuestado) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Executive context sentence */}
      <div className="rounded-xl bg-cream/60 border border-border-light px-4 py-3">
        <p className="text-[0.8125rem] text-ink leading-relaxed">
          <strong className="text-ochre">Resumen ejecutivo:</strong>{" "}
          {recaudoPct >= 90
            ? `Recaudo tributario al ${recaudoPct.toFixed(0)}% de la meta — ejecución saludable. IDF en rango sostenible (83.6).`
            : recaudoPct >= 75
              ? `Recaudo al ${recaudoPct.toFixed(0)}% de la meta — requiere monitoreo. Revise componentes IDF con alertas.`
              : `Recaudo al ${recaudoPct.toFixed(0)}% de la meta — atención urgente requerida. Múltiples indicadores fiscales en riesgo.`}
          {carteraMorosa.prescrito > 30_000 && ` Cartera prescrita de ${formatCOP(carteraMorosa.prescrito)} requiere depuración.`}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-cream rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex-1 px-4 py-2.5 rounded-lg text-[0.8125rem] font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-paper text-ink shadow-sm"
                : "text-gray-400 hover:text-ochre"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RESUMEN */}
      {activeTab === "resumen" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {kpisPrincipales.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="text-[0.6875rem] text-gray-400 font-medium mb-1">{kpi.label}</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif text-[1.5rem] leading-none text-ink">{kpi.value}</span>
                  <span className={`inline-flex items-center gap-0.5 text-[0.625rem] font-bold ${
                    kpi.change > 0 ? "text-green-600" : kpi.change < 0 ? "text-red-500" : "text-gray-400"
                  }`}>
                    {kpi.change > 0 ? <TrendingUp size={10} /> : kpi.change < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                    {kpi.change > 0 ? "+" : ""}{kpi.change}%
                  </span>
                </div>
                <div className="text-[0.625rem] text-gray-400">{kpi.detail}</div>
              </motion.div>
            ))}
          </div>

          {/* Execution chart (bar chart) */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[0.875rem] font-semibold text-ink">Ejecución presupuestal 2024</h3>
              <span className="text-[0.6875rem] text-gray-400">Millones COP, acumulado</span>
            </div>
            <div className="flex items-end gap-1.5 h-48">
              {ejecucionMensual.map((m, i) => {
                const maxVal = ejecucionMensual[ejecucionMensual.length - 1].meta;
                const hIngresos = (m.ingresosRecaudados / maxVal) * 100;
                const hGastos = (m.gastosEjecutados / maxVal) * 100;
                const hMeta = (m.meta / maxVal) * 100;

                return (
                  <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full flex items-end gap-0.5 h-40">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${hIngresos}%` }}
                        transition={{ duration: 0.4, delay: i * 0.04 }}
                        className="flex-1 bg-ochre rounded-t"
                        title={`Ingresos: ${formatCOP(m.ingresosRecaudados)}`}
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${hGastos}%` }}
                        transition={{ duration: 0.4, delay: i * 0.04 + 0.1 }}
                        className="flex-1 bg-ink/20 rounded-t"
                        title={`Gastos: ${formatCOP(m.gastosEjecutados)}`}
                      />
                      {/* Meta line */}
                      <div
                        className="absolute left-0 right-0 border-t border-dashed border-ochre/40"
                        style={{ bottom: `${hMeta}%` }}
                      />
                    </div>
                    <span className="text-[0.625rem] text-gray-400">{m.mes}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-5 mt-3">
              <span className="flex items-center gap-1.5 text-[0.625rem] text-gray-400">
                <span className="w-3 h-2 rounded-sm bg-ochre" /> Ingresos
              </span>
              <span className="flex items-center gap-1.5 text-[0.625rem] text-gray-400">
                <span className="w-3 h-2 rounded-sm bg-ink/20" /> Gastos
              </span>
              <span className="flex items-center gap-1.5 text-[0.625rem] text-gray-400">
                <span className="w-3 h-0.5 border-t border-dashed border-ochre/60" style={{ width: 12 }} /> Meta
              </span>
            </div>
          </div>
        </div>
      )}

      {/* RECAUDO */}
      {activeTab === "recaudo" && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-[0.875rem] font-semibold text-ink mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-ochre" />
              Recaudo tributario por impuesto — 2024
            </h3>
            <div className="space-y-3">
              {recaudoTributario.map((r) => (
                <div key={r.impuesto}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[0.8125rem] text-ink font-medium">{r.impuesto}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[0.6875rem] text-gray-400">
                        {formatCOP(r.recaudado)} / {formatCOP(r.presupuestado)}
                      </span>
                      <span className={`text-[0.75rem] font-bold ${
                        r.porcentaje >= 90 ? "text-green-600" :
                        r.porcentaje >= 80 ? "text-ochre" : "text-red-500"
                      }`}>
                        {r.porcentaje}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-cream rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.porcentaje}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${
                        r.porcentaje >= 90 ? "bg-green-500" :
                        r.porcentaje >= 80 ? "bg-ochre" : "bg-red-400"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-5 pt-4 border-t border-border flex justify-between items-baseline">
              <span className="text-[0.875rem] font-bold text-ink">Total recaudo</span>
              <div className="text-right">
                <span className="font-serif text-[1.25rem] text-ochre font-bold">
                  {formatCOP(recaudoTributario.reduce((s, r) => s + r.recaudado, 0))}
                </span>
                <span className="text-[0.6875rem] text-gray-400 ml-2">
                  ({(recaudoTributario.reduce((s, r) => s + r.recaudado, 0) / recaudoTributario.reduce((s, r) => s + r.presupuestado, 0) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Cartera morosa */}
          <div className="card p-5">
            <h3 className="text-[0.875rem] font-semibold text-ink mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Cartera morosa
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-cream rounded-lg p-3">
                <div className="text-[0.6875rem] text-gray-400 mb-1">Total cartera</div>
                <div className="font-serif text-lg text-ink">{formatCOP(carteraMorosa.total)}</div>
              </div>
              <div className="bg-cream rounded-lg p-3">
                <div className="text-[0.6875rem] text-gray-400 mb-1">En gestión cobro</div>
                <div className="font-serif text-lg text-ochre">{carteraMorosa.gestionCobro}%</div>
              </div>
              <div className="bg-cream rounded-lg p-3">
                <div className="text-[0.6875rem] text-gray-400 mb-1">Recuperado 2024</div>
                <div className="font-serif text-lg text-green-600">{formatCOP(carteraMorosa.recuperado2024)}</div>
              </div>
              <div className="bg-red-50/60 border border-red-200/40 rounded-lg p-3">
                <div className="text-[0.6875rem] text-red-400 mb-1">Prescrito</div>
                <div className="font-serif text-lg text-red-500">{formatCOP(carteraMorosa.prescrito)}</div>
                <div className="text-[0.625rem] text-red-400/80 mt-0.5">Requiere depuración</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GASTOS */}
      {activeTab === "gastos" && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-[0.875rem] font-semibold text-ink mb-4 flex items-center gap-2">
              <PieChart size={16} className="text-ochre" />
              Gastos por sector — 2024
            </h3>

            {/* Visual donut + list */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Donut chart SVG */}
              <div className="flex justify-center">
                <svg viewBox="0 0 200 200" className="w-48 h-48">
                  {(() => {
                    const total = gastosCategoria.reduce((s, g) => s + g.ejecutado, 0);
                    let cumulative = 0;
                    return gastosCategoria.map((g) => {
                      const pctVal = g.ejecutado / total;
                      const startAngle = cumulative * 360;
                      cumulative += pctVal;
                      const endAngle = cumulative * 360;
                      const largeArc = pctVal > 0.5 ? 1 : 0;
                      const startRad = ((startAngle - 90) * Math.PI) / 180;
                      const endRad = ((endAngle - 90) * Math.PI) / 180;
                      const x1 = 100 + 80 * Math.cos(startRad);
                      const y1 = 100 + 80 * Math.sin(startRad);
                      const x2 = 100 + 80 * Math.cos(endRad);
                      const y2 = 100 + 80 * Math.sin(endRad);
                      const ix1 = 100 + 50 * Math.cos(endRad);
                      const iy1 = 100 + 50 * Math.sin(endRad);
                      const ix2 = 100 + 50 * Math.cos(startRad);
                      const iy2 = 100 + 50 * Math.sin(startRad);

                      return (
                        <path
                          key={g.categoria}
                          d={`M ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A 50 50 0 ${largeArc} 0 ${ix2} ${iy2} Z`}
                          fill={g.color}
                          opacity={0.85}
                        />
                      );
                    });
                  })()}
                  <text x="100" y="96" textAnchor="middle" fill="#2C2418" fontSize="14" fontWeight="700" fontFamily="'DM Serif Display', serif">
                    {formatCOP(gastosCategoria.reduce((s, g) => s + g.ejecutado, 0))}
                  </text>
                  <text x="100" y="112" textAnchor="middle" fill="#9E9484" fontSize="8" fontFamily="'Plus Jakarta Sans', sans-serif">
                    Total ejecutado
                  </text>
                </svg>
              </div>

              {/* Legend list */}
              <div className="space-y-2">
                {gastosCategoria.map((g) => (
                  <div key={g.categoria} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: g.color }} />
                    <span className="flex-1 text-[0.8125rem] text-ink">{g.categoria}</span>
                    <span className="text-[0.75rem] text-gray-400">{formatCOP(g.ejecutado)}</span>
                    <span className="text-[0.6875rem] font-semibold text-ink w-12 text-right">
                      {pct(g.ejecutado, g.presupuesto)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fuentes de recursos */}
          <div className="card p-5">
            <h3 className="text-[0.875rem] font-semibold text-ink mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-ochre" />
              Fuentes de recursos
            </h3>
            <div className="space-y-2.5">
              {fuentesRecursos.map((f) => {
                const pctVal = (f.ejecutado / f.aprobado) * 100;
                return (
                  <div key={f.fuente}>
                    <div className="flex justify-between text-[0.75rem] mb-1">
                      <span className="text-ink font-medium">{f.fuente}</span>
                      <span className="text-gray-400">{formatCOP(f.ejecutado)} / {formatCOP(f.aprobado)}</span>
                    </div>
                    <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                      <div className="h-full bg-ochre rounded-full" style={{ width: `${pctVal}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* IDF */}
      {activeTab === "idf" && (
        <div className="space-y-4">
          {/* IDF Score hero */}
          <div className="card p-6 text-center">
            <div className="text-[0.75rem] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              Índice de Desempeño Fiscal 2024
            </div>
            <div className="font-serif text-[3.5rem] leading-none text-ochre mb-1">83.6</div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[0.75rem] font-semibold text-green-700">
              <CheckCircle2 size={14} />
              Rango: Sostenible
            </div>
          </div>

          {/* IDF Components */}
          <div className="card p-5">
            <h3 className="text-[0.875rem] font-semibold text-ink mb-4">Componentes del IDF</h3>
            <div className="space-y-3">
              {indicadoresIDF.map((ind) => {
                const isGood = ind.abreviatura === "AF" || ind.abreviatura === "DT" || ind.abreviatura === "MD"
                  ? ind.valor < ind.meta
                  : ind.valor > ind.meta;

                return (
                  <div key={ind.abreviatura} className={`flex items-center gap-3 rounded-lg p-2 ${!isGood ? "bg-amber-50/60 border border-amber-200/50" : ""}`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[0.6875rem] font-bold ${!isGood ? "bg-amber-100 text-amber-700" : "bg-cream text-sepia"}`}>
                      {ind.abreviatura}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between text-[0.8125rem] mb-0.5">
                        <span className="text-ink">{ind.indicador}</span>
                        <span className={`font-bold ${isGood ? "text-green-600" : "text-amber-500"}`}>
                          {ind.valor}{ind.unidad === "%" ? "%" : ""}
                        </span>
                      </div>
                      <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isGood ? "bg-green-500" : "bg-amber-400"}`}
                          style={{ width: `${Math.min(ind.valor, 100)}%` }}
                        />
                      </div>
                      {!isGood && (
                        <div className="text-[0.625rem] text-amber-600 font-medium mt-1">
                          Revisar con Hacienda — meta: {ind.meta}{ind.unidad === "%" ? "%" : ""}
                        </div>
                      )}
                    </div>
                    <span className={`text-[0.625rem] ${
                      ind.tendencia === "up" ? "text-green-500" :
                      ind.tendencia === "down" ? "text-red-400" : "text-gray-400"
                    }`}>
                      {ind.tendencia === "up" ? <TrendingUp size={12} /> :
                       ind.tendencia === "down" ? <TrendingDown size={12} /> :
                       <Minus size={12} />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historic IDF chart */}
          <div className="card p-5">
            <h3 className="text-[0.875rem] font-semibold text-ink mb-4">Histórico IDF 2019-2024</h3>
            <div className="flex items-end gap-3 h-40">
              {historicoIDF.map((h, i) => (
                <div key={h.year} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full flex items-end gap-0.5 h-32">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h.idf}%` }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="flex-1 bg-ochre rounded-t"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h.gestion}%` }}
                      transition={{ duration: 0.5, delay: i * 0.08 + 0.05 }}
                      className="flex-1 bg-ochre/40 rounded-t"
                    />
                  </div>
                  <span className="text-[0.625rem] font-bold text-ink">{h.idf}</span>
                  <span className="text-[0.625rem] text-gray-400">{h.year}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-[0.625rem] text-gray-400">
                <span className="w-3 h-2 rounded-sm bg-ochre" /> IDF Global
              </span>
              <span className="flex items-center gap-1.5 text-[0.625rem] text-gray-400">
                <span className="w-3 h-2 rounded-sm bg-ochre/40" /> Gestión
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
