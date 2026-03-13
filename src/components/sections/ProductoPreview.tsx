"use client";

import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/* ─── Animated number counter ────────────────────────────────────────────── */

function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  inView,
  delay = 0,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  inView: boolean;
  delay?: number;
}) {
  const [display, setDisplay] = useState("0");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!inView) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplay(value.toFixed(decimals));
      setFinished(true);
      return;
    }

    let controls: { stop: () => void } | undefined;
    const timeout = setTimeout(() => {
      const mv = { val: 0 };
      controls = animate(mv, { val: value }, {
        duration: 1.4,
        ease: [0.25, 1, 0.5, 1],
        onUpdate: () => {
          setDisplay(mv.val.toFixed(decimals));
        },
        onComplete: () => {
          setFinished(true);
        },
      });
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      controls?.stop();
    };
  }, [inView, value, decimals, delay]);

  return (
    <motion.span
      animate={finished ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
    >
      {prefix}{display}{suffix}
    </motion.span>
  );
}

/* ─── Sparkline (pure CSS/SVG) ───────────────────────────────────────────── */

function Sparkline({ data, color = "var(--ochre)" }: { data: number[]; color?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 20;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block ml-2 align-middle">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Progress bar ───────────────────────────────────────────────────────── */

function ProgressBar({ value, max, inView }: { value: number; max: number; inView: boolean }) {
  const pct = (value / max) * 100;

  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: "var(--ochre)" }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
      />
    </div>
  );
}

/* ─── Budget bar row ─────────────────────────────────────────────────────── */

function BudgetBar({
  label,
  value,
  maxValue,
  inView,
  index,
}: {
  label: string;
  value: number;
  maxValue: number;
  inView: boolean;
  index: number;
}) {
  const pct = (value / maxValue) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[0.6875rem] text-sepia w-[88px] shrink-0 text-right font-medium">
        {label}
      </span>
      <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden relative">
        <motion.div
          className="h-full rounded"
          style={{ background: index === 1 ? "var(--ochre)" : "var(--ink)" }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{
            duration: 1,
            delay: 0.8 + index * 0.1,
            ease: [0.25, 1, 0.5, 1],
          }}
        />
        <motion.span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.5625rem] font-semibold"
          style={{ color: pct > 45 ? "var(--paper)" : "var(--ink)" }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
        >
          {value.toLocaleString("es-CO")} MM
        </motion.span>
      </div>
    </div>
  );
}

/* ─── KPI data ───────────────────────────────────────────────────────────── */

const sparklineData = [62, 65, 63, 68, 70, 72, 71, 75, 74, 76, 78, 78.4];

const budgetCategories = [
  { label: "Funcionamiento", value: 1842 },
  { label: "Inversión", value: 4267 },
  { label: "Deuda", value: 386 },
  { label: "SGP", value: 2145 },
  { label: "Propios", value: 3102 },
];

const maxBudget = Math.max(...budgetCategories.map((b) => b.value));

/* ─── Main component ────────────────────────────────────────────────────── */

export default function ProductoPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-paper overflow-hidden">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">
        {/* ── Section header ── */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre-text mb-4"
          >
            El producto
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif font-bold text-[1.75rem] md:text-[2.25rem] leading-[1.1] tracking-[-0.02em] text-ink mb-5"
          >
            Todo en un solo dashboard
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[1.0625rem] leading-relaxed text-gray-500 max-w-xl mx-auto"
          >
            Ejecución presupuestal, metas del PDM, alertas normativas y
            generación de reportes — accesibles desde una interfaz diseñada
            para el funcionario público.
          </motion.p>
        </div>

        {/* ── Browser-frame mini dashboard ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 1, 0.5, 1] as const }}
          className="relative"
        >
          {/* Browser chrome */}
          <div className="rounded-t-xl bg-ink px-4 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            </div>
            <div className="flex-1 mx-8">
              <div className="bg-white/10 rounded-md px-3 py-1 text-[0.6875rem] text-white/50 text-center">
                gobia.co/demo
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="rounded-b-xl border border-t-0 border-border bg-background p-4 md:p-6">
            {/* Dashboard header bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-ink flex items-center justify-center">
                  <span className="text-[0.5rem] font-bold text-paper leading-none">G</span>
                </div>
                <span className="text-[0.75rem] font-semibold text-ink">
                  Medellín — Panel Fiscal
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[0.625rem] text-sepia">Vigencia 2024</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* ── KPI cards row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {/* Ejecución Presupuestal */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-paper rounded-lg border border-border p-3.5 group"
              >
                <span className="text-[0.625rem] uppercase tracking-[0.08em] text-sepia font-medium block mb-1">
                  Ejecución Presupuestal
                </span>
                <div className="flex items-end justify-between">
                  <span className="text-[1.5rem] md:text-[1.75rem] font-bold text-ink leading-none tracking-tight">
                    <AnimatedNumber value={78.4} decimals={1} suffix="%" inView={isInView} delay={0.5} />
                  </span>
                  <Sparkline data={sparklineData} />
                </div>
                <span className="text-[0.5625rem] text-sepia mt-1.5 block">
                  +3.2pp vs. mes anterior
                </span>
              </motion.div>

              {/* Recaudo Efectivo */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-paper rounded-lg border border-border p-3.5"
              >
                <span className="text-[0.625rem] uppercase tracking-[0.08em] text-sepia font-medium block mb-1">
                  Recaudo Efectivo
                </span>
                <div className="flex items-end justify-between">
                  <span className="text-[1.5rem] md:text-[1.75rem] font-bold text-ink leading-none tracking-tight">
                    $<AnimatedNumber value={142.3} decimals={1} suffix="M" inView={isInView} delay={0.6} />
                  </span>
                </div>
                <span className="text-[0.5625rem] text-sepia mt-1.5 block">
                  92.1% de la meta anual
                </span>
              </motion.div>

              {/* Metas PDM Cumplidas */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-paper rounded-lg border border-border p-3.5"
              >
                <span className="text-[0.625rem] uppercase tracking-[0.08em] text-sepia font-medium block mb-1">
                  Metas PDM Cumplidas
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[1.5rem] md:text-[1.75rem] font-bold text-ink leading-none tracking-tight">
                    <AnimatedNumber value={64} inView={isInView} delay={0.7} />
                  </span>
                  <span className="text-[0.875rem] font-semibold text-sepia">/98</span>
                </div>
                <ProgressBar value={64} max={98} inView={isInView} />
              </motion.div>

              {/* IDF Score */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-paper rounded-lg border border-border p-3.5"
              >
                <span className="text-[0.625rem] uppercase tracking-[0.08em] text-sepia font-medium block mb-1">
                  IDF Score
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-[1.5rem] md:text-[1.75rem] font-bold text-ink leading-none tracking-tight">
                    <AnimatedNumber value={83.6} decimals={1} inView={isInView} delay={0.8} />
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.5625rem] font-semibold bg-emerald-50 text-emerald-700 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Sostenible
                  </span>
                </div>
                <span className="text-[0.5625rem] text-sepia mt-1.5 block">
                  Rango 80-100: desempeño alto
                </span>
              </motion.div>
            </div>

            {/* ── Budget bar chart ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="bg-paper rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[0.6875rem] font-semibold text-ink uppercase tracking-[0.06em]">
                  Composición Presupuestal 2024
                </span>
                <span className="text-[0.5625rem] text-sepia">
                  Cifras en miles de millones COP
                </span>
              </div>
              <div className="space-y-2">
                {budgetCategories.map((cat, i) => (
                  <BudgetBar
                    key={cat.label}
                    label={cat.label}
                    value={cat.value}
                    maxValue={maxBudget}
                    inView={isInView}
                    index={i}
                  />
                ))}
              </div>
            </motion.div>

            {/* ── CTA ── */}
            <div className="flex justify-center mt-5">
              <a href="/demo" className="btn-primary">
                Ver demo completo — Medellín
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
