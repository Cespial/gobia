"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Leaf,
  Shield,
  Briefcase,
  Landmark,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  type LucideIcon,
} from "lucide-react";
import {
  pdmMedellin,
  getStatusColor,
  getStatusLabel,
  type PDMStrategicLine,
  type PDMIndicator,
  type StatusColor,
} from "@/data/medellin-pdm";

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Leaf,
  Shield,
  Briefcase,
  Landmark,
};

// ---------------------------------------------------------------------------
// Utility: format numbers
// ---------------------------------------------------------------------------

function fmtNum(n: number, unidad: string): string {
  if (unidad === "número" || unidad === "personas" || unidad === "ha") {
    return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
  }
  if (unidad === "puntos" || unidad === "de 0 a 100") {
    return n.toLocaleString("es-CO", { maximumFractionDigits: 1 });
  }
  return n.toLocaleString("es-CO", { maximumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Status colors (tailwind classes)
// ---------------------------------------------------------------------------

const statusClasses: Record<StatusColor, { bg: string; text: string; bar: string; badge: string }> = {
  verde: {
    bg: "bg-green-50",
    text: "text-green-700",
    bar: "bg-green-500",
    badge: "bg-green-100 text-green-700",
  },
  amarillo: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    bar: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
  },
  rojo: {
    bg: "bg-red-50",
    text: "text-red-700",
    bar: "bg-red-400",
    badge: "bg-red-100 text-red-700",
  },
};

const statusIcons: Record<StatusColor, LucideIcon> = {
  verde: CheckCircle2,
  amarillo: AlertCircle,
  rojo: XCircle,
};

// ---------------------------------------------------------------------------
// Progress Ring SVG
// ---------------------------------------------------------------------------

function ProgressRing({
  value,
  size = 160,
  stroke = 12,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#EDE6DA"
        strokeWidth={stroke}
      />
      {/* Progress arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#B8956A"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Indicator Row
// ---------------------------------------------------------------------------

function IndicatorRow({ ind, index }: { ind: PDMIndicator; index: number }) {
  const status = getStatusColor(ind.avance);
  const classes = statusClasses[status];
  const StatusIcon = statusIcons[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="py-3 border-b border-border-light last:border-0"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <StatusIcon size={12} className={classes.text} />
            <span className="text-[0.8125rem] font-medium text-ink leading-tight">
              {ind.nombre}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[0.6875rem] text-gray-400">
            <span>Base: {fmtNum(ind.lineaBase, ind.unidad)} {ind.unidad}</span>
            <span className="text-border">|</span>
            <span>Meta: {fmtNum(ind.meta, ind.unidad)}</span>
            <span className="text-border">|</span>
            <span>Actual ({ind.anioActual}): <strong className="text-ink">{fmtNum(ind.actual, ind.unidad)}</strong></span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className={`text-[0.875rem] font-bold ${classes.text}`}>
            {ind.avance.toFixed(0)}%
          </span>
          <span className={`text-[0.625rem] font-semibold px-1.5 py-0.5 rounded-full ${classes.badge}`}>
            {getStatusLabel(status)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-cream rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(ind.avance, 100)}%` }}
          transition={{ duration: 0.6, delay: index * 0.03 }}
          className={`h-full rounded-full ${classes.bar}`}
        />
      </div>

      {/* Source */}
      <div className="mt-1 flex items-center gap-1 text-[0.625rem] text-gray-400">
        <Info size={9} />
        {ind.fuente}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Strategic Line Card
// ---------------------------------------------------------------------------

function LineCard({
  linea,
  isSelected,
  onToggle,
}: {
  linea: PDMStrategicLine;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const Icon = iconMap[linea.icono] ?? Target;
  const avStatus = getStatusColor(linea.avanceGlobal);
  const avClasses = statusClasses[avStatus];

  // Count indicators by status
  let verde = 0;
  let amarillo = 0;
  let rojo = 0;
  for (const m of linea.metas) {
    for (const ind of m.indicadores) {
      const s = getStatusColor(ind.avance);
      if (s === "verde") verde++;
      else if (s === "amarillo") amarillo++;
      else rojo++;
    }
  }
  const totalInds = verde + amarillo + rojo;

  return (
    <div className="card overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-cream/50 transition-colors"
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${linea.color}15` }}
        >
          <Icon size={20} style={{ color: linea.color }} />
        </div>

        {/* Title & subtitle */}
        <div className="flex-1 min-w-0">
          <div className="text-[0.6875rem] text-gray-400 font-semibold">
            Línea {linea.numero}
          </div>
          <div className="text-[0.875rem] font-semibold text-ink leading-tight truncate">
            {linea.nombre}
          </div>
          <div className="text-[0.6875rem] text-gray-400 mt-0.5 line-clamp-1">
            {linea.descripcion}
          </div>
        </div>

        {/* Progress + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mini status dots */}
          <div className="hidden md:flex items-center gap-1 text-[0.625rem]">
            {verde > 0 && (
              <span className="flex items-center gap-0.5 text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {verde}
              </span>
            )}
            {amarillo > 0 && (
              <span className="flex items-center gap-0.5 text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {amarillo}
              </span>
            )}
            {rojo > 0 && (
              <span className="flex items-center gap-0.5 text-red-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {rojo}
              </span>
            )}
          </div>

          {/* Progress badge */}
          <span className={`text-[0.875rem] font-bold ${avClasses.text}`}>
            {linea.avanceGlobal}%
          </span>

          {isSelected ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Summary bar */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 text-[0.6875rem] text-gray-400 mb-2">
                <BarChart3 size={12} className="text-ochre" />
                {totalInds} indicadores: {verde} en meta, {amarillo} en progreso, {rojo} rezagados
              </div>
              {/* Global progress bar for line */}
              <div className="h-2 bg-cream rounded-full overflow-hidden flex">
                {verde > 0 && (
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(verde / totalInds) * 100}%` }}
                  />
                )}
                {amarillo > 0 && (
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(amarillo / totalInds) * 100}%` }}
                  />
                )}
                {rojo > 0 && (
                  <div
                    className="h-full bg-red-400"
                    style={{ width: `${(rojo / totalInds) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Metas & Indicators */}
            <div className="px-4 pb-4 space-y-4">
              {linea.metas.map((meta) => (
                <div key={meta.nombre}>
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={12} className="text-ochre" />
                    <h4 className="text-[0.8125rem] font-semibold text-ink">
                      {meta.nombre}
                    </h4>
                  </div>
                  <div className="ml-0.5">
                    {meta.indicadores.map((ind, j) => (
                      <IndicatorRow key={ind.nombre} ind={ind} index={j} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function PDMDashboard() {
  const [expandedLine, setExpandedLine] = useState<number | null>(null);

  const pdm = pdmMedellin;

  // Executive context for decision-makers
  const rojoCount = pdm.metasRojo;
  const totalInds = pdm.totalIndicadores;
  const pctEnMeta = totalInds > 0 ? ((pdm.metasVerde / totalInds) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      {/* Executive context sentence */}
      <div className="rounded-xl bg-cream/60 border border-border-light px-4 py-3">
        <p className="text-[0.8125rem] text-ink leading-relaxed">
          <strong className="text-ochre">Resumen ejecutivo:</strong>{" "}
          {pdm.ejecucionGlobal >= 60
            ? `PDM al ${pdm.ejecucionGlobal}% de ejecución global — ${pctEnMeta}% de indicadores en meta.`
            : `PDM al ${pdm.ejecucionGlobal}% de ejecución — por debajo del ritmo esperado.`}
          {rojoCount > 0 && ` ${rojoCount} indicador${rojoCount > 1 ? "es" : ""} rezagado${rojoCount > 1 ? "s" : ""} requiere${rojoCount > 1 ? "n" : ""} atención inmediata.`}
        </p>
      </div>

      {/* ---- Header: Overall Execution ---- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Progress Ring */}
          <div className="relative shrink-0">
            <ProgressRing value={pdm.ejecucionGlobal} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-[2.5rem] leading-none text-ochre">
                {pdm.ejecucionGlobal}%
              </span>
              <span className="text-[0.625rem] text-gray-400 font-semibold mt-0.5">
                Ejecución global
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="text-[0.6875rem] uppercase tracking-[0.1em] text-ochre font-semibold mb-1">
              Plan de Desarrollo Municipal
            </div>
            <h2 className="font-serif text-[1.5rem] md:text-[1.75rem] text-ink leading-tight mb-1">
              {pdm.nombre}
            </h2>
            <div className="text-[0.8125rem] text-gray-400 mb-3">
              {pdm.periodo} &mdash; Alcalde {pdm.alcalde}
            </div>

            {/* KPI pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <div className="bg-cream rounded-lg px-3 py-2 text-center">
                <div className="text-[0.625rem] text-gray-400">Indicadores</div>
                <div className="font-serif text-lg text-ink">{pdm.totalIndicadores}</div>
              </div>
              <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                <div className="flex items-center gap-1 text-[0.625rem] text-green-600">
                  <CheckCircle2 size={10} /> En meta
                </div>
                <div className="font-serif text-lg text-green-700">{pdm.metasVerde}</div>
              </div>
              <div className="bg-amber-50 rounded-lg px-3 py-2 text-center">
                <div className="flex items-center gap-1 text-[0.625rem] text-amber-600">
                  <AlertCircle size={10} /> En progreso
                </div>
                <div className="font-serif text-lg text-amber-700">{pdm.metasAmarillo}</div>
              </div>
              <div className="bg-red-50 rounded-lg px-3 py-2 text-center">
                <div className="flex items-center gap-1 text-[0.625rem] text-red-500">
                  <XCircle size={10} /> Rezagado
                </div>
                <div className="font-serif text-lg text-red-600">{pdm.metasRojo}</div>
              </div>
              <div className="bg-cream rounded-lg px-3 py-2 text-center">
                <div className="text-[0.625rem] text-gray-400">MDM Gestion</div>
                <div className="font-serif text-lg text-ochre">{pdm.mdmGestion}</div>
              </div>
              <div className="bg-cream rounded-lg px-3 py-2 text-center">
                <div className="text-[0.625rem] text-gray-400">MDM Resultados</div>
                <div className="font-serif text-lg text-ochre">{pdm.mdmResultados}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---- Line-by-line progress summary bar ---- */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-ochre" />
          <span className="text-[0.8125rem] font-semibold text-ink">
            Avance por línea estratégica
          </span>
        </div>
        <div className="space-y-2.5">
          {pdm.lineas.map((linea) => {
            const status = getStatusColor(linea.avanceGlobal);
            const classes = statusClasses[status];
            const Icon = iconMap[linea.icono] ?? Target;
            return (
              <div key={linea.numero}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon size={13} style={{ color: linea.color }} />
                    <span className="text-[0.75rem] text-ink font-medium">
                      L{linea.numero}. {linea.nombre}
                    </span>
                  </div>
                  <span className={`text-[0.75rem] font-bold ${classes.text}`}>
                    {linea.avanceGlobal}%
                  </span>
                </div>
                <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${linea.avanceGlobal}%` }}
                    transition={{ duration: 0.8, delay: linea.numero * 0.1 }}
                    className={`h-full rounded-full ${classes.bar}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Strategic Lines (expandable cards) ---- */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-ochre" />
          <span className="text-[0.8125rem] font-semibold text-ink">
            Líneas estratégicas &mdash; detalle de indicadores
          </span>
        </div>
        {pdm.lineas.map((linea) => (
          <LineCard
            key={linea.numero}
            linea={linea}
            isSelected={expandedLine === linea.numero}
            onToggle={() =>
              setExpandedLine((prev) =>
                prev === linea.numero ? null : linea.numero
              )
            }
          />
        ))}
      </div>

      {/* ---- Footer note ---- */}
      <div className="text-[0.625rem] text-gray-400 text-center py-2">
        Datos de indicadores: TerriData (DNP), MinEducacion, MinSalud, DANE, ICFES, Funcion Publica, MinDefensa.
        <br />
        Metas cuatrienales y avance basados en el PDM 2024-2027 de Medellin.
        Última actualización: Marzo 2026.
      </div>
    </div>
  );
}
