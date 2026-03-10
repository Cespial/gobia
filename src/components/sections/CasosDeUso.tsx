"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { MapPin, TrendingUp, FileCheck, CheckCircle2 } from "lucide-react";

/* ─── Metric types ─── */
type MetricType = "ring" | "bold" | "dots";

interface Metric {
  type: MetricType;
  value: number;
  suffix?: string;
  label?: string;
  /** For dots visualization: total dots in the grid */
  totalDots?: number;
}

interface CaseData {
  icon: typeof MapPin;
  entity: string;
  tag: string;
  title: string;
  benefits: string[];
  metrics: Metric[];
}

/* ─── Data ─── */
const cases: CaseData[] = [
  {
    icon: MapPin,
    entity: "Alcaldía municipal",
    tag: "Categoría 6",
    title: "Hacienda unificada + seguimiento PDM",
    benefits: [
      "80% menos tiempo en reportes trimestrales",
      "100% metas del PDM con seguimiento activo",
      "0 multas por rendición tardía",
    ],
    metrics: [
      { type: "ring", value: 80, suffix: "%", label: "menos tiempo" },
      { type: "bold", value: 0, suffix: " multas", label: "por rendición" },
    ],
  },
  {
    icon: TrendingUp,
    entity: "Gobernación departamental",
    tag: "32 municipios",
    title: "Vista consolidada de gestión territorial",
    benefits: [
      "32 municipios monitoreados en una sola vista",
      "Alertas tempranas de desempeño fiscal",
      "3x más rápido el análisis departamental",
    ],
    metrics: [
      { type: "dots", value: 32, totalDots: 36, label: "municipios" },
      { type: "bold", value: 3, suffix: "x", label: "más rápido" },
    ],
  },
  {
    icon: FileCheck,
    entity: "Secretaría de hacienda",
    tag: "Ciudad intermedia",
    title: "Exógena y estatuto tributario con IA",
    benefits: [
      "5 min para consultar cualquier artículo",
      "98% precisión en generación de XML exógena",
      "0 rechazos por errores de formato en DIAN",
    ],
    metrics: [
      { type: "ring", value: 98, suffix: "%", label: "precisión" },
      { type: "bold", value: 5, suffix: " min", label: "por consulta" },
    ],
  },
];

/* ─── Animated counter hook ─── */
function useCountUp(target: number, isInView: boolean, duration = 1.5) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [isInView, target, duration, motionValue]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => unsubscribe();
  }, [rounded]);

  return display;
}

/* ─── Circular progress ring ─── */
function ProgressRing({
  percent,
  isInView,
}: {
  percent: number;
  isInView: boolean;
}) {
  const size = 40;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E5E5"
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--ochre)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={
          isInView
            ? { strokeDashoffset: circumference - (percent / 100) * circumference }
            : { strokeDashoffset: circumference }
        }
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
    </svg>
  );
}

/* ─── Dot grid visualization ─── */
function DotGrid({
  filled,
  total,
  isInView,
}: {
  filled: number;
  total: number;
  isInView: boolean;
}) {
  const cols = 6;

  return (
    <div
      className="grid gap-[3px] shrink-0"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, width: 40, height: 40 }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: 4, height: 4 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  scale: 1,
                  backgroundColor: i < filled ? "var(--ochre)" : "#E5E5E5",
                }
              : { opacity: 0, scale: 0 }
          }
          transition={{
            duration: 0.3,
            delay: isInView ? 0.3 + i * 0.03 : 0,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Single metric display ─── */
function MetricDisplay({
  metric,
  isInView,
}: {
  metric: Metric;
  isInView: boolean;
}) {
  const count = useCountUp(metric.value, isInView);

  if (metric.type === "ring") {
    return (
      <div className="flex items-center gap-2.5">
        <ProgressRing percent={metric.value} isInView={isInView} />
        <div>
          <p className="text-[0.9375rem] font-bold text-ochre leading-tight">
            {count}
            {metric.suffix}
          </p>
          {metric.label && (
            <p className="text-[0.6875rem] text-gray-400 leading-tight">{metric.label}</p>
          )}
        </div>
      </div>
    );
  }

  if (metric.type === "dots") {
    return (
      <div className="flex items-center gap-2.5">
        <DotGrid
          filled={metric.value}
          total={metric.totalDots ?? 36}
          isInView={isInView}
        />
        <div>
          <p className="text-[0.9375rem] font-bold text-ochre leading-tight">
            {count}
            {metric.suffix}
          </p>
          {metric.label && (
            <p className="text-[0.6875rem] text-gray-400 leading-tight">{metric.label}</p>
          )}
        </div>
      </div>
    );
  }

  /* bold */
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-[1.125rem] font-bold text-ochre leading-tight">
        {count}
        {metric.suffix}
      </p>
      {metric.label && (
        <p className="text-[0.6875rem] text-gray-400 leading-tight">{metric.label}</p>
      )}
    </div>
  );
}

/* ─── Main component ─── */
export default function CasosDeUso() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="casos" ref={ref} className="relative py-24 md:py-32 bg-paper">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-4"
          >
            Casos de uso
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif font-bold text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-ink mb-5"
          >
            Diseñada para la realidad municipal
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[1.0625rem] leading-relaxed text-gray-500 max-w-2xl mx-auto"
          >
            Desde municipios de categoría 6 hasta gobernaciones departamentales,
            Gobia se adapta a la escala y necesidades de cada entidad.
          </motion.p>
        </div>

        {/* Compact case cards — 3 columns on desktop */}
        <div className="grid md:grid-cols-3 gap-4">
          {cases.map((caso, i) => (
            <motion.div
              key={caso.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-ochre-soft text-ochre">
                  <caso.icon size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[0.8125rem] font-bold text-ink leading-tight">{caso.entity}</p>
                  <p className="text-[0.6875rem] text-gray-400">{caso.tag}</p>
                </div>
              </div>

              <h3 className="text-[0.9375rem] font-bold text-ink mb-4">{caso.title}</h3>

              <ul className="space-y-2.5">
                {caso.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-ochre mt-0.5 shrink-0" />
                    <span className="text-[0.8125rem] leading-snug text-gray-500">{b}</span>
                  </li>
                ))}
              </ul>

              {/* Metrics row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-5 mt-5 pt-4 border-t border-border-light"
              >
                {caso.metrics.map((metric, mi) => (
                  <MetricDisplay key={mi} metric={metric} isInView={isInView} />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-[0.75rem] text-gray-400 mt-8 italic"
        >
          * Proyecciones basadas en análisis de procesos para entidades de características similares.
        </motion.p>
      </div>
    </section>
  );
}
