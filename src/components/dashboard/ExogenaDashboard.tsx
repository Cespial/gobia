"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowRight,
  Clock,
  Search,
  ShieldCheck,
  FileCode2,
  Send,
  Info,
  Loader2,
} from "lucide-react";
import {
  formatosExogena,
  resumenExogena,
  erroresValidacion,
  pipelineExogena,
} from "@/data/medellin-exogena";
import type { FormatoExogena, ValidacionError, EtapaPipeline } from "@/data/medellin-exogena";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("es-CO");
}

function estadoBadge(estado: FormatoExogena["estado"]) {
  const map = {
    validado: { label: "Validado", bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2 },
    en_revision: { label: "En revisión", bg: "bg-amber-50", text: "text-amber-700", icon: Search },
    pendiente: { label: "Pendiente", bg: "bg-gray-100", text: "text-gray-500", icon: Clock },
    error: { label: "Error", bg: "bg-red-50", text: "text-red-600", icon: XCircle },
  } as const;
  return map[estado];
}

function severidadConfig(severidad: ValidacionError["severidad"]) {
  const map = {
    critico: { label: "Crítico", bg: "bg-red-50", text: "text-red-600", icon: XCircle },
    advertencia: { label: "Advertencia", bg: "bg-amber-50", text: "text-amber-600", icon: AlertTriangle },
    info: { label: "Info", bg: "bg-blue-50", text: "text-blue-600", icon: Info },
  } as const;
  return map[severidad];
}

function pipelineIcon(etapa: string) {
  const map: Record<string, typeof FileSpreadsheet> = {
    Extraccion: Upload,
    Validacion: ShieldCheck,
    "Formato XML": FileCode2,
    "Envio DIAN": Send,
  };
  return map[etapa] ?? FileSpreadsheet;
}

function pipelineEstadoColor(estado: EtapaPipeline["estado"]) {
  const map = {
    completado: "bg-green-500",
    en_proceso: "bg-ochre",
    pendiente: "bg-gray-300",
    error: "bg-red-500",
  } as const;
  return map[estado];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ExogenaDashboard() {
  const [activeTab, setActiveTab] = useState<"resumen" | "formatos" | "errores" | "pipeline">("resumen");

  const tabs = [
    { key: "resumen" as const, label: "Resumen" },
    { key: "formatos" as const, label: "Formatos" },
    { key: "errores" as const, label: "Errores" },
    { key: "pipeline" as const, label: "Pipeline" },
  ];

  const validatedPct =
    resumenExogena.totalFormatos > 0
      ? ((resumenExogena.formatosValidados / resumenExogena.totalFormatos) * 100).toFixed(0)
      : "0";

  return (
    <div className="space-y-6">
      {/* Executive context sentence */}
      <div className="rounded-xl bg-cream/60 border border-border-light px-4 py-3">
        <p className="text-[0.8125rem] text-ink leading-relaxed">
          <strong className="text-ochre">Resumen ejecutivo:</strong>{" "}
          {resumenExogena.formatosValidados === resumenExogena.totalFormatos
            ? `Todos los formatos validados y listos para envío a la DIAN.`
            : `${validatedPct}% de formatos validados (${resumenExogena.formatosValidados}/${resumenExogena.totalFormatos}).`}
          {resumenExogena.registrosConError > 0 && ` ${resumenExogena.registrosConError} errores pendientes de corregir.`}
          {resumenExogena.diasRestantes <= 15 && ` Quedan ${resumenExogena.diasRestantes} días para la fecha límite — acción prioritaria.`}
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

      {/* ================================================================= */}
      {/* RESUMEN                                                           */}
      {/* ================================================================= */}
      {activeTab === "resumen" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Formatos totales",
                value: String(resumenExogena.totalFormatos),
                detail: `Vigencia ${resumenExogena.vigencia}`,
                icon: FileSpreadsheet,
                accent: false,
              },
              {
                label: "Validados",
                value: `${validatedPct}%`,
                detail: `${resumenExogena.formatosValidados} de ${resumenExogena.totalFormatos} formatos`,
                icon: CheckCircle2,
                accent: false,
              },
              {
                label: "Registros totales",
                value: formatNumber(resumenExogena.totalRegistros),
                detail: "Todos los formatos",
                icon: FileSpreadsheet,
                accent: false,
              },
              {
                label: "Errores detectados",
                value: String(resumenExogena.registrosConError),
                detail: `${resumenExogena.diasRestantes} días para fecha límite`,
                icon: AlertTriangle,
                accent: resumenExogena.registrosConError > 0,
              },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={14} className={kpi.accent ? "text-red-500" : "text-ochre"} />
                    <span className="text-[0.6875rem] text-gray-400 font-medium">{kpi.label}</span>
                  </div>
                  <div className="font-serif text-[1.5rem] leading-none text-ink mb-1">
                    {kpi.value}
                  </div>
                  <div className="text-[0.625rem] text-gray-400">{kpi.detail}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Fecha limite banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ochre-soft flex items-center justify-center">
                <Clock size={20} className="text-ochre" />
              </div>
              <div>
                <div className="text-[0.8125rem] font-semibold text-ink">
                  Fecha límite de presentación
                </div>
                <div className="text-[0.75rem] text-gray-400">
                  {resumenExogena.fechaLimite} &middot; Resolución DIAN
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-serif text-[1.5rem] leading-none ${
                resumenExogena.diasRestantes <= 7 ? "text-red-500" :
                resumenExogena.diasRestantes <= 15 ? "text-amber-500" : "text-ochre"
              }`}>
                {resumenExogena.diasRestantes}
              </div>
              <div className="text-[0.625rem] text-gray-400">días restantes</div>
            </div>
          </motion.div>

          {/* Compact pipeline preview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-5"
          >
            <h3 className="text-[0.875rem] font-semibold text-ink mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-ochre" />
              Pipeline de procesamiento
            </h3>
            <div className="flex items-center gap-2">
              {pipelineExogena.map((etapa, i) => {
                const Icon = pipelineIcon(etapa.etapa);
                const isLast = i === pipelineExogena.length - 1;
                return (
                  <div key={etapa.etapa} className="flex items-center gap-2 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon size={14} className={
                          etapa.estado === "completado" ? "text-green-600" :
                          etapa.estado === "en_proceso" ? "text-ochre" :
                          "text-gray-400"
                        } />
                        <span className="text-[0.6875rem] font-medium text-ink truncate">
                          {etapa.etapa === "Formato XML" ? "XML" : etapa.etapa}
                        </span>
                      </div>
                      <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${etapa.progreso}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className={`h-full rounded-full ${pipelineEstadoColor(etapa.estado)}`}
                        />
                      </div>
                      <div className="text-[0.625rem] text-gray-400 mt-0.5">{etapa.progreso}%</div>
                    </div>
                    {!isLast && (
                      <ArrowRight size={12} className="text-gray-300 shrink-0 mt-[-0.5rem]" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* ================================================================= */}
      {/* FORMATOS                                                          */}
      {/* ================================================================= */}
      {activeTab === "formatos" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formatosExogena.map((formato, i) => {
              const badge = estadoBadge(formato.estado);
              const BadgeIcon = badge.icon;
              return (
                <motion.div
                  key={formato.formato}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center text-[0.6875rem] font-bold text-sepia">
                        {formato.formato}
                      </span>
                      <div>
                        <div className="text-[0.8125rem] font-semibold text-ink">
                          {formato.nombre}
                        </div>
                        <div className="text-[0.625rem] text-gray-400">
                          Formato {formato.formato}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-semibold ${badge.bg} ${badge.text}`}>
                      <BadgeIcon size={10} />
                      {badge.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[0.6875rem] text-gray-400 leading-relaxed mb-3 line-clamp-2">
                    {formato.descripcion}
                  </p>

                  {/* Footer stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-[0.6875rem] text-ink font-medium">
                        {formatNumber(formato.registros)} registros
                      </span>
                      {formato.errores > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[0.625rem] text-red-500 font-semibold">
                          <AlertTriangle size={10} />
                          {formato.errores} errores
                        </span>
                      )}
                    </div>
                    <span className="text-[0.625rem] text-gray-400">
                      {formato.ultimaActualizacion}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Totals row */}
          <div className="card p-4 flex items-center justify-between">
            <span className="text-[0.8125rem] font-semibold text-ink">Total registros</span>
            <div className="flex items-center gap-4">
              <span className="font-serif text-[1.25rem] text-ochre font-bold">
                {formatNumber(resumenExogena.totalRegistros)}
              </span>
              <span className="text-[0.6875rem] text-gray-400">
                en {resumenExogena.totalFormatos} formatos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ERRORES                                                           */}
      {/* ================================================================= */}
      {activeTab === "errores" && (
        <div className="space-y-4">
          {/* Error summary */}
          <div className="grid grid-cols-3 gap-3">
            {(["critico", "advertencia", "info"] as const).map((sev) => {
              const config = severidadConfig(sev);
              const SevIcon = config.icon;
              const count = erroresValidacion
                .filter((e) => e.severidad === sev)
                .reduce((sum, e) => sum + e.registrosAfectados, 0);
              const qty = erroresValidacion.filter((e) => e.severidad === sev).length;
              return (
                <motion.div
                  key={sev}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 text-center"
                >
                  <SevIcon size={20} className={`mx-auto mb-1.5 ${config.text}`} />
                  <div className="font-serif text-[1.25rem] leading-none text-ink mb-0.5">
                    {count}
                  </div>
                  <div className="text-[0.625rem] text-gray-400">
                    {qty} {config.label.toLowerCase()}
                    {qty !== 1 ? "s" : ""}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Error list */}
          <div className="card p-5">
            <h3 className="text-[0.875rem] font-semibold text-ink mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Errores de validación detectados
            </h3>
            <div className="space-y-2.5">
              {erroresValidacion.map((err, i) => {
                const config = severidadConfig(err.severidad);
                const SevIcon = config.icon;
                return (
                  <motion.div
                    key={`${err.formato}-${err.tipo}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-start gap-3 rounded-lg p-3 ${config.bg}`}
                  >
                    <SevIcon size={16} className={`shrink-0 mt-0.5 ${config.text}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[0.8125rem] font-medium text-ink">{err.tipo}</span>
                        <span className="text-[0.6875rem] font-bold text-ink shrink-0">
                          Fmt. {err.formato}
                        </span>
                      </div>
                      <div className="text-[0.6875rem] text-gray-400 mt-0.5">
                        {err.registrosAfectados} registro{err.registrosAfectados !== 1 ? "s" : ""} afectado{err.registrosAfectados !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-semibold shrink-0 ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-4 pt-3 border-t border-border flex justify-between items-baseline">
              <span className="text-[0.8125rem] font-semibold text-ink">Total registros afectados</span>
              <span className="font-serif text-[1.125rem] text-red-500 font-bold">
                {erroresValidacion.reduce((sum, e) => sum + e.registrosAfectados, 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* PIPELINE                                                          */}
      {/* ================================================================= */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          {/* Pipeline stages - vertical detail view */}
          <div className="card p-5">
            <h3 className="text-[0.875rem] font-semibold text-ink mb-5 flex items-center gap-2">
              <ShieldCheck size={16} className="text-ochre" />
              Pipeline: Extracción → Validación → Formato XML → Envío DIAN
            </h3>

            <div className="space-y-0">
              {pipelineExogena.map((etapa, i) => {
                const Icon = pipelineIcon(etapa.etapa);
                const isLast = i === pipelineExogena.length - 1;
                const isActive = etapa.estado === "en_proceso";

                return (
                  <motion.div
                    key={etapa.etapa}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="flex gap-4">
                      {/* Vertical timeline */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          etapa.estado === "completado" ? "bg-green-50" :
                          etapa.estado === "en_proceso" ? "bg-ochre-soft" :
                          etapa.estado === "error" ? "bg-red-50" :
                          "bg-gray-100"
                        }`}>
                          {isActive ? (
                            <Loader2 size={18} className="text-ochre animate-spin" />
                          ) : (
                            <Icon size={18} className={
                              etapa.estado === "completado" ? "text-green-600" :
                              etapa.estado === "error" ? "text-red-500" :
                              "text-gray-400"
                            } />
                          )}
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-8 ${
                            etapa.estado === "completado" ? "bg-green-300" : "bg-gray-200"
                          }`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <div className="text-[0.8125rem] font-semibold text-ink">
                              {etapa.etapa === "Formato XML" ? "Generación XML" : etapa.etapa}
                            </div>
                            <div className="text-[0.6875rem] text-gray-400">
                              {etapa.descripcion}
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-semibold shrink-0 ml-2 ${
                            etapa.estado === "completado" ? "bg-green-50 text-green-700" :
                            etapa.estado === "en_proceso" ? "bg-amber-50 text-amber-700" :
                            etapa.estado === "error" ? "bg-red-50 text-red-600" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            {etapa.estado === "completado" && <CheckCircle2 size={10} />}
                            {etapa.estado === "en_proceso" && <Loader2 size={10} className="animate-spin" />}
                            {etapa.estado === "error" && <XCircle size={10} />}
                            {etapa.estado === "pendiente" && <Clock size={10} />}
                            {etapa.estado === "completado" ? "Completado" :
                             etapa.estado === "en_proceso" ? "En proceso" :
                             etapa.estado === "error" ? "Error" : "Pendiente"}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[0.625rem] text-gray-400 mb-1">
                            <span>
                              {formatNumber(etapa.registrosProcesados)} / {formatNumber(etapa.registrosTotales)} registros
                            </span>
                            <span className="font-semibold text-ink">{etapa.progreso}%</span>
                          </div>
                          <div className="h-2 bg-cream rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${etapa.progreso}%` }}
                              transition={{ duration: 0.8, delay: i * 0.15 }}
                              className={`h-full rounded-full ${pipelineEstadoColor(etapa.estado)}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Overall progress */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-5"
          >
            <h3 className="text-[0.875rem] font-semibold text-ink mb-3">Progreso general</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-cream rounded-full overflow-hidden flex">
                  {pipelineExogena.map((etapa) => {
                    const segmentWidth = 100 / pipelineExogena.length;
                    return (
                      <div key={etapa.etapa} className="relative" style={{ width: `${segmentWidth}%` }}>
                        <div className="absolute inset-0 bg-cream" />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(etapa.progreso / 100) * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className={`absolute inset-y-0 left-0 ${pipelineEstadoColor(etapa.estado)}`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1.5">
                  {pipelineExogena.map((etapa) => (
                    <span key={etapa.etapa} className="text-[0.625rem] text-gray-400">
                      {etapa.etapa === "Formato XML" ? "XML" :
                       etapa.etapa === "Envio DIAN" ? "DIAN" : etapa.etapa}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif text-[1.5rem] leading-none text-ochre">
                  {Math.round(
                    pipelineExogena.reduce((sum, e) => sum + e.progreso, 0) /
                    pipelineExogena.length
                  )}%
                </div>
                <div className="text-[0.625rem] text-gray-400">completado</div>
              </div>
            </div>
          </motion.div>

          {/* Action hint */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-4 flex items-center gap-3 border-ochre/30"
          >
            <div className="w-9 h-9 rounded-lg bg-ochre-soft flex items-center justify-center shrink-0">
              <Send size={16} className="text-ochre" />
            </div>
            <div className="flex-1">
              <div className="text-[0.8125rem] font-semibold text-ink">
                Envío programado al portal MUISCA
              </div>
              <div className="text-[0.6875rem] text-gray-400">
                Una vez validados todos los formatos, se generará el XML consolidado para radicación ante la DIAN.
              </div>
            </div>
            <ArrowRight size={16} className="text-ochre shrink-0" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
