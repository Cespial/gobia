"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Zap, Info } from "lucide-react";
import {
  indicadoresIDF,
  recaudoTributario,
  gastosCategoria,
  carteraMorosa,
  historicoIDF,
  ejecucionMensual,
} from "@/data/medellin-hacienda";
import {
  operacionesEfectivasCaja,
  mdmIndicators,
} from "@/data/medellin-terridata";

// ─── Computed values ──────────────────────────────────────────────────────

const idfScore = indicadoresIDF.find((i) => i.abreviatura === "IDF")?.valor ?? 83.6;
const idfTrend = historicoIDF.map((h) => h.idf);

const ingresos = operacionesEfectivasCaja.find((o) => o.indicator === "Ingresos totales")
  ?.series.find((s) => s.year === 2022)?.value ?? 6_894_172;
const mdm = mdmIndicators.find((m) => m.indicator === "MDM")
  ?.series.find((s) => s.year === 2022)?.value ?? 83.19;

const totalRecaudo = recaudoTributario.reduce((s, r) => s + r.recaudado, 0);
const totalPresupuestado = recaudoTributario.reduce((s, r) => s + r.presupuestado, 0);
const pctRecaudo = (totalRecaudo / totalPresupuestado) * 100;

const totalGastosEjec = gastosCategoria.reduce((s, g) => s + g.ejecutado, 0);
const totalGastosPres = gastosCategoria.reduce((s, g) => s + g.presupuesto, 0);
const pctEjecucion = (totalGastosEjec / totalGastosPres) * 100;

const latestMonth = ejecucionMensual[ejecucionMensual.length - 1];
const superavit = latestMonth.ingresosRecaudados - latestMonth.gastosEjecutados;

// ─── Alerts (derived) ─────────────────────────────────────────────────────

interface FiscalAlert {
  severity: "red" | "amber" | "green";
  icon: typeof AlertTriangle;
  title: string;
  detail: string;
}

const alerts: FiscalAlert[] = [];

recaudoTributario
  .filter((r) => r.porcentaje < 88)
  .sort((a, b) => a.porcentaje - b.porcentaje)
  .forEach((r) => {
    const deficit = r.presupuestado - r.recaudado;
    alerts.push({
      severity: r.porcentaje < 85 ? "red" : "amber",
      icon: AlertTriangle,
      title: `${r.impuesto}: ${r.porcentaje}%`,
      detail: `Déficit $${(deficit / 1000).toFixed(0)} MM`,
    });
  });

if (carteraMorosa.prescrito > 30_000) {
  alerts.push({
    severity: "amber",
    icon: Shield,
    title: `Cartera prescrita: $${(carteraMorosa.prescrito / 1000).toFixed(0)} MM`,
    detail: "Riesgo de pérdida patrimonial",
  });
}

gastosCategoria
  .filter((g) => (g.ejecutado / g.presupuesto) * 100 < 83)
  .forEach((g) => {
    alerts.push({
      severity: "amber",
      icon: Zap,
      title: `${g.categoria}: ${((g.ejecutado / g.presupuesto) * 100).toFixed(0)}% ejecución`,
      detail: "Por debajo del promedio sectorial",
    });
  });

// ─── KPI Tooltip component ──────────────────────────────────────────────

function KPITooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Close on outside click (mobile)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={tooltipRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-0.5 text-gray-500 hover:text-gray-300 transition-colors duration-150"
        aria-label="Más información"
      >
        {children}
        <Info size={10} className="opacity-40 group-hover:opacity-70" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-0 right-0 mb-1.5 pointer-events-none"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-lg pointer-events-auto">
              <p className="text-[0.6875rem] leading-relaxed text-gray-300">{text}</p>
              {/* Arrow */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sparkline component ──────────────────────────────────────────────────

function MiniSparkline({ values, color = "#B8956A" }: { values: number[]; color?: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 48;
  const h = 16;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Arc gauge component ──────────────────────────────────────────────────

function ArcGauge({ value, max = 100, size = 100 }: { value: number; max?: number; size?: number }) {
  const pct = Math.min(value / max, 1);
  const r = size / 2 - 8;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const fillAngle = startAngle + totalAngle * pct;

  const polarToCart = (angle: number) => ({
    x: size / 2 + r * Math.cos((angle * Math.PI) / 180),
    y: size / 2 + r * Math.sin((angle * Math.PI) / 180),
  });

  const startPt = polarToCart(startAngle);
  const endPt = polarToCart(endAngle);
  const fillPt = polarToCart(fillAngle);
  const largeArcBg = totalAngle > 180 ? 1 : 0;
  const largeArcFill = (fillAngle - startAngle) > 180 ? 1 : 0;

  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.85}`} className="mx-auto">
      <path
        d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArcBg} 1 ${endPt.x} ${endPt.y}`}
        fill="none" stroke="#362F26" strokeWidth={6} strokeLinecap="round"
      />
      <motion.path
        d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArcFill} 1 ${fillPt.x} ${fillPt.y}`}
        fill="none" stroke="#B8956A" strokeWidth={6} strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <text x={size / 2} y={size * 0.45} textAnchor="middle" fill="#B8956A" fontSize={size * 0.28} fontWeight="700" fontFamily="'Space Grotesk', serif">
        {value.toFixed(1)}
      </text>
      <text x={size / 2} y={size * 0.6} textAnchor="middle" fill="#9E9484" fontSize={size * 0.09} fontWeight="600">
        IDF · DNP
      </text>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

const kpis = [
  {
    label: "Ejecución de gastos",
    value: `${pctEjecucion.toFixed(1)}%`,
    sub: superavit > 0
      ? `Superávit: $${(superavit / 1000).toFixed(0)} MM`
      : `Déficit: $${(Math.abs(superavit) / 1000).toFixed(0)} MM`,
    change: 3.2,
    year: "2024",
    tooltip: "Porcentaje del presupuesto de gastos ejecutado efectivamente. Un valor >85% indica buena capacidad de ejecución. Si es bajo, puede significar falta de gestión contractual o recursos sin comprometer.",
  },
  {
    label: "Recaudo tributario",
    value: `${pctRecaudo.toFixed(1)}%`,
    sub: `$${(totalRecaudo / 1000).toFixed(0)} de $${(totalPresupuestado / 1000).toFixed(0)} MM`,
    change: 5.7,
    year: "2024",
    tooltip: "Porcentaje de impuestos recaudados vs. presupuestados. Ideal: >90%. Mide la efectividad de la gestión tributaria y la capacidad del municipio de generar ingresos propios.",
  },
  {
    label: "Ingresos totales",
    value: `$${(ingresos / 1_000_000).toFixed(1)}B`,
    sub: "Millones COP · OEC",
    change: 15.4,
    year: "2022",
    tooltip: "Ingresos totales según Operaciones Efectivas de Caja (OEC) reportadas al DNP. Incluye ingresos tributarios, no tributarios, transferencias y recursos de capital.",
  },
  {
    label: "Desempeño Municipal",
    value: mdm.toFixed(1),
    sub: "MDM · Posición #3 nacional",
    change: -0.5,
    year: "2022",
    tooltip: "Medición de Desempeño Municipal (MDM) del DNP. Evalúa gestión administrativa, resultados en educación, salud, servicios públicos e inversión. Escala 0-100, donde >80 es \"Sobresaliente\".",
  },
];

export default function FiscalPulseHero() {
  return (
    <div className="space-y-3">
      {/* Hero band */}
      <div className="bg-ink rounded-2xl p-3 lg:p-4 xl:p-4 text-paper">
        <div className="flex items-center gap-3 lg:gap-3 xl:gap-4">
          {/* IDF Gauge — left (smaller on tablet when panel is narrow) */}
          <div className="shrink-0">
            <KPITooltip text="Índice de Desempeño Fiscal del DNP. Mide la capacidad de gestión financiera del municipio. Rangos: >80 Sostenible, 70-80 Vulnerable, <70 Riesgo o Deterioro.">
              <div className="lg:scale-[0.85] xl:scale-100 origin-top">
                <ArcGauge value={idfScore} size={120} />
              </div>
            </KPITooltip>
            <div className="flex items-center justify-center gap-1.5 -mt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-900/40 px-2 py-0.5 text-[0.625rem] font-semibold text-green-400">
                Sostenible
              </span>
              <MiniSparkline values={idfTrend} color="#B8956A" />
            </div>
            <div className="text-[0.625rem] text-gray-500 text-center mt-1 flex items-center justify-center gap-1">
              Índice de Desempeño Fiscal
              <Info size={9} className="opacity-40" />
            </div>
          </div>

          {/* 4 KPIs — right */}
          <div className="flex-1 grid grid-cols-2 gap-2.5">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="bg-gray-900/40 rounded-lg p-2.5 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <KPITooltip text={kpi.tooltip}>
                    <span className="text-[0.6875rem] text-gray-400 cursor-help flex items-center gap-1">
                      {kpi.label}
                      <Info size={9} className="opacity-40" />
                    </span>
                  </KPITooltip>
                  <span className={`text-[0.625rem] font-medium px-1.5 py-0.5 rounded ${
                    kpi.year === "2024"
                      ? "text-green-400 bg-green-900/30"
                      : "text-gray-500 bg-gray-800/60"
                  }`}>
                    {kpi.year === "2024" ? "Vigente" : kpi.year}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-[1.25rem] leading-none text-ochre">{kpi.value}</span>
                  <span className={`inline-flex items-center gap-0.5 text-[0.625rem] font-bold ${kpi.change > 0 ? "text-green-400" : "text-red-400"}`}>
                    {kpi.change > 0 ? <TrendingUp size={10} className="inline" /> : <TrendingDown size={10} className="inline" />}
                    {kpi.change > 0 ? "+" : ""}{kpi.change}%
                  </span>
                </div>
                <div className="text-[0.625rem] text-gray-500 mt-0.5">{kpi.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert strip */}
      {alerts.length > 0 && (
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {alerts.slice(0, 5).map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className={`shrink-0 rounded-lg p-2.5 min-w-[190px] max-w-[230px] ${
                  alert.severity === "red"
                    ? "bg-red-50 border border-red-200"
                    : alert.severity === "amber"
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-green-50 border border-green-200"
                }`}
                style={{ borderLeftWidth: 3, borderLeftColor: alert.severity === "red" ? "#EF4444" : alert.severity === "amber" ? "#F59E0B" : "#22C55E" }}
              >
                <div className="flex items-start gap-1.5">
                  <alert.icon size={13} className={
                    alert.severity === "red" ? "text-red-500 shrink-0 mt-0.5" :
                    alert.severity === "amber" ? "text-amber-500 shrink-0 mt-0.5" :
                    "text-green-500 shrink-0 mt-0.5"
                  } />
                  <div>
                    <div className="text-[0.75rem] font-semibold text-ink leading-snug">{alert.title}</div>
                    <div className="text-[0.625rem] text-gray-500">{alert.detail}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Scroll fade indicator */}
          {alerts.length > 2 && (
            <div className="absolute top-0 right-0 bottom-1 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none rounded-r-lg" />
          )}
        </div>
      )}
    </div>
  );
}
