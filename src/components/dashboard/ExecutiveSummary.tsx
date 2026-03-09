"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import {
  indicadoresIDF,
  recaudoTributario,
  gastosCategoria,
  ejecucionMensual,
  carteraMorosa,
} from "@/data/medellin-hacienda";
import { operacionesEfectivasCaja } from "@/data/medellin-terridata";

// ─── Derive insights from data ────────────────────────────────────────────

const idf = indicadoresIDF.find((i) => i.abreviatura === "IDF")?.valor ?? 83.6;
const idfRango = idf >= 80 ? "Sostenible" : idf >= 70 ? "Solvente" : idf >= 60 ? "Vulnerable" : "Riesgo";

const totalRecaudo = recaudoTributario.reduce((s, r) => s + r.recaudado, 0);
const totalPresup = recaudoTributario.reduce((s, r) => s + r.presupuestado, 0);
const pctRecaudo = (totalRecaudo / totalPresup) * 100;

const totalGastosEjec = gastosCategoria.reduce((s, g) => s + g.ejecutado, 0);
const totalGastosPres = gastosCategoria.reduce((s, g) => s + g.presupuesto, 0);
const pctEjecucion = (totalGastosEjec / totalGastosPres) * 100;

const latestMonth = ejecucionMensual[ejecucionMensual.length - 1];
const superavit = latestMonth.ingresosRecaudados - latestMonth.gastosEjecutados;

const ingresosOEC = operacionesEfectivasCaja.find((o) => o.indicator === "Ingresos totales");
const ingresosYoY = ingresosOEC?.series[0] && ingresosOEC?.series[1]
  ? ((ingresosOEC.series[0].value - ingresosOEC.series[1].value) / ingresosOEC.series[1].value * 100)
  : 15.4;

// Low-performing taxes
const lowTaxes = recaudoTributario.filter((r) => r.porcentaje < 90);
const lowSectors = gastosCategoria.filter((g) => (g.ejecutado / g.presupuesto) * 100 < 83);

// ─── Compute health score (0-100) ────────────────────────────────────────

const healthFactors = [
  { weight: 0.3, score: Math.min(idf, 100) },
  { weight: 0.25, score: pctRecaudo },
  { weight: 0.25, score: pctEjecucion },
  { weight: 0.1, score: Math.min((carteraMorosa.gestionCobro / 100) * 100, 100) },
  { weight: 0.1, score: superavit > 0 ? 90 : 50 },
];
const healthScore = healthFactors.reduce((s, f) => s + f.weight * f.score, 0);

const healthColor = healthScore >= 85 ? "text-green-600" : healthScore >= 70 ? "text-ochre" : "text-red-500";
const healthBg = healthScore >= 85 ? "bg-green-50" : healthScore >= 70 ? "bg-ochre-soft" : "bg-red-50";
const healthLabel = healthScore >= 85 ? "Saludable" : healthScore >= 70 ? "Aceptable" : "Requiere atención";

// ─── Generate top insights ───────────────────────────────────────────────

interface Insight {
  type: "success" | "warning" | "action";
  title: string;
  detail: string;
}

const insights: Insight[] = [];

// Superávit
if (superavit > 0) {
  insights.push({
    type: "success",
    title: `Superávit de $${(superavit / 1000).toFixed(0)} MM al cierre`,
    detail: "Los ingresos superan los gastos. Oportunidad para inversión estratégica o reducción de deuda.",
  });
} else {
  insights.push({
    type: "warning",
    title: `Déficit de $${(Math.abs(superavit) / 1000).toFixed(0)} MM`,
    detail: "Se recomienda revisar la ejecución de gastos y acelerar el recaudo pendiente.",
  });
}

// Recaudo
if (lowTaxes.length > 0) {
  const worstTax = lowTaxes[lowTaxes.length - 1];
  const totalDeficit = lowTaxes.reduce((s, t) => s + (t.presupuestado - t.recaudado), 0);
  insights.push({
    type: "action",
    title: `${lowTaxes.length} impuesto${lowTaxes.length > 1 ? "s" : ""} por debajo de meta de recaudo`,
    detail: `Déficit acumulado de $${(totalDeficit / 1000).toFixed(0)} MM. Priorice gestión de cobro en ${worstTax.impuesto} (${worstTax.porcentaje}%).`,
  });
}

// Cartera prescrita
if (carteraMorosa.prescrito > 30_000) {
  insights.push({
    type: "warning",
    title: `$${(carteraMorosa.prescrito / 1000).toFixed(0)} MM en cartera prescrita`,
    detail: "Riesgo de pérdida patrimonial. Considere depuración contable y fortalecimiento de cobro coactivo.",
  });
}

// Low execution sectors
if (lowSectors.length > 0) {
  insights.push({
    type: "action",
    title: `${lowSectors.length} sector${lowSectors.length > 1 ? "es" : ""} con baja ejecución`,
    detail: `${lowSectors.map((s) => s.categoria).join(", ")} están por debajo del 83%. Revise cuellos de botella en contratación.`,
  });
}

// IDF trend
if (idf >= 80) {
  insights.push({
    type: "success",
    title: `IDF en rango ${idfRango} (${idf} pts)`,
    detail: `Tendencia positiva en los últimos 4 años. Mantenga disciplina fiscal para conservar la calificación.`,
  });
}

// ─── Component ───────────────────────────────────────────────────────────

export default function ExecutiveSummary() {
  // Sort insights: warnings first, then actions, then successes
  const sortedInsights = [...insights].sort((a, b) => {
    const order = { warning: 0, action: 1, success: 2 };
    return order[a.type] - order[b.type];
  });

  return (
    <div className="bg-paper rounded-xl border border-border overflow-hidden">
      {/* Header band with prominent health score */}
      <div className="bg-ink px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-ochre" />
            <span className="text-[0.8125rem] font-semibold text-paper">Resumen ejecutivo</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${healthBg}`}>
            <span className={`font-serif text-[1.25rem] font-bold leading-none ${healthColor}`}>
              {healthScore.toFixed(0)}
            </span>
            <div className="flex flex-col">
              <span className={`text-[0.6875rem] font-bold leading-tight ${healthColor}`}>
                {healthLabel}
              </span>
              <span className={`text-[0.5625rem] leading-tight ${healthColor} opacity-70`}>
                Salud fiscal
              </span>
            </div>
          </div>
        </div>
        {/* One-line executive summary */}
        <p className="text-[0.75rem] text-gray-400 leading-snug">
          {healthScore >= 85
            ? "El municipio mantiene finanzas sólidas. Oportunidad para inversión estratégica."
            : healthScore >= 70
            ? "Finanzas estables con áreas que requieren seguimiento para mantener sostenibilidad."
            : "Se requiere acción inmediata en recaudo y control de gasto para estabilizar las finanzas."}
        </p>
      </div>

      {/* Quick metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 divide-x divide-border border-b border-border">
        {[
          { label: "Desempeño Fiscal", shortLabel: "IDF", value: idf.toFixed(1), sub: idfRango, good: idf >= 80, tooltip: "Índice de Desempeño Fiscal (DNP). Mide la salud financiera del municipio. Escala 0-100." },
          { label: "Ejecución", shortLabel: "Ejecución", value: `${pctEjecucion.toFixed(0)}%`, sub: "del presupuesto", good: pctEjecucion >= 85, tooltip: "Porcentaje del presupuesto de gastos ejecutado. Ideal: >85%." },
          { label: "Recaudo", shortLabel: "Recaudo", value: `${pctRecaudo.toFixed(0)}%`, sub: "tributario", good: pctRecaudo >= 90, tooltip: "Recaudo tributario como porcentaje del presupuesto. Ideal: >90%." },
          { label: "Balance", shortLabel: "Balance", value: superavit > 0 ? "Superávit" : "Déficit", sub: `$${(Math.abs(superavit) / 1000).toFixed(0)} MM`, good: superavit > 0, tooltip: "Diferencia entre ingresos recaudados y gastos ejecutados al cierre." },
        ].map((m, i) => (
          <motion.div
            key={m.shortLabel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="px-3 py-2.5 text-center cursor-default"
            title={m.tooltip}
          >
            <div className="text-[0.625rem] text-gray-400 uppercase tracking-wider">{m.label}</div>
            <div className={`font-serif text-[1.125rem] leading-tight ${m.good ? "text-ink" : "text-amber-600"}`}>
              {m.value}
            </div>
            <div className={`text-[0.625rem] ${m.good ? "text-gray-400" : "text-amber-500 font-medium"}`}>{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Insights — sorted by severity, top 2 shown prominently */}
      <div className="p-3 space-y-2">
        {sortedInsights.slice(0, 4).map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className={`flex items-start gap-2 ${i < 2 ? "py-1" : ""}`}
          >
            {insight.type === "success" ? (
              <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
            ) : insight.type === "warning" ? (
              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <TrendingUp size={14} className="text-ochre shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <div className={`text-[0.75rem] font-semibold leading-snug ${insight.type === "warning" ? "text-amber-700" : "text-ink"}`}>
                  {insight.title}
                </div>
                {insight.type === "action" && (
                  <span className="text-[0.5625rem] font-bold bg-ochre-soft text-ochre px-1.5 py-px rounded uppercase tracking-wider shrink-0">
                    Acción
                  </span>
                )}
              </div>
              <div className="text-[0.625rem] text-gray-500 leading-relaxed">{insight.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
