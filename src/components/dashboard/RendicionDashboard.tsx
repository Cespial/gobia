"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  FileCheck,
  AlertCircle,
  Clock,
  Calendar,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Shield,
} from "lucide-react";
import {
  reportesObligatorios,
  calendarioReportes,
  resumenCumplimiento,
} from "@/data/medellin-rendicion";
import type { ReporteObligatorio } from "@/data/medellin-rendicion";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const estadoConfig: Record<
  ReporteObligatorio["estado"],
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  completado: { label: "Completado", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  en_proceso: { label: "En proceso", color: "text-ochre", bg: "bg-ochre-soft", icon: Upload },
  pendiente: { label: "Pendiente", color: "text-gray-400", bg: "bg-cream", icon: Clock },
  atrasado: { label: "Atrasado", color: "text-red-500", bg: "bg-red-50", icon: AlertCircle },
};

function formatFecha(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function diasRestantes(iso: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.ceil((target.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RendicionDashboard() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-6">
      {/* Executive context sentence */}
      <div className="rounded-xl bg-cream/60 border border-border-light px-4 py-3">
        <p className="text-[0.8125rem] text-ink leading-relaxed">
          <strong className="text-ochre">Resumen ejecutivo:</strong>{" "}
          {resumenCumplimiento.tasaCumplimiento >= 90
            ? `Cumplimiento al ${resumenCumplimiento.tasaCumplimiento}% — rendición de cuentas en buen estado.`
            : resumenCumplimiento.tasaCumplimiento >= 70
              ? `Cumplimiento al ${resumenCumplimiento.tasaCumplimiento}% — avance aceptable, ${resumenCumplimiento.enProceso} reportes en proceso.`
              : `Cumplimiento al ${resumenCumplimiento.tasaCumplimiento}% — atención requerida por entidades de control.`}
          {resumenCumplimiento.atrasados > 0 && ` ${resumenCumplimiento.atrasados} reporte${resumenCumplimiento.atrasados > 1 ? "s" : ""} atrasado${resumenCumplimiento.atrasados > 1 ? "s" : ""} — riesgo disciplinario.`}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Summary KPIs                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total reportes",
            value: resumenCumplimiento.totalReportes.toString(),
            sub: `${resumenCumplimiento.totalFormatos} formatos`,
            icon: FileText,
            accent: "text-ink",
          },
          {
            label: "Completados",
            value: `${resumenCumplimiento.completados}`,
            sub: `${resumenCumplimiento.tasaCumplimiento}% cumplimiento`,
            icon: CheckCircle2,
            accent: "text-green-600",
          },
          {
            label: "En proceso",
            value: `${resumenCumplimiento.enProceso}`,
            sub: `${resumenCumplimiento.formatosCompletados}/${resumenCumplimiento.totalFormatos} formatos`,
            icon: Upload,
            accent: "text-ochre",
          },
          {
            label: "Atrasados",
            value: `${resumenCumplimiento.atrasados}`,
            sub: "Requieren acción inmediata",
            icon: AlertCircle,
            accent: resumenCumplimiento.atrasados > 0 ? "text-red-500" : "text-green-600",
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <kpi.icon size={14} className={kpi.accent} />
              <span className="text-[0.6875rem] text-gray-400 font-medium">{kpi.label}</span>
            </div>
            <div className={`font-serif text-[1.75rem] leading-none ${kpi.accent} mb-1`}>
              {kpi.value}
            </div>
            <div className="text-[0.625rem] text-gray-400">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Cumplimiento global progress                                        */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[0.875rem] font-semibold text-ink flex items-center gap-2">
            <Shield size={16} className="text-ochre" />
            Progreso general de rendición
          </h3>
          <span className="font-serif text-[1.25rem] text-ochre font-bold">
            {Math.round(
              reportesObligatorios.reduce((s, r) => s + r.progreso, 0) /
                reportesObligatorios.length
            )}
            %
          </span>
        </div>
        <div className="h-3 bg-cream rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.round(
                reportesObligatorios.reduce((s, r) => s + r.progreso, 0) /
                  reportesObligatorios.length
              )}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-ochre rounded-full"
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            {(
              [
                { key: "completado", label: "Completados", color: "bg-green-500" },
                { key: "en_proceso", label: "En proceso", color: "bg-ochre" },
                { key: "pendiente", label: "Pendientes", color: "bg-gray-300" },
                { key: "atrasado", label: "Atrasados", color: "bg-red-400" },
              ] as const
            ).map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-[0.625rem] text-gray-400">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.label} ({reportesObligatorios.filter((r) => r.estado === s.key).length})
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Report cards grid                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h3 className="text-[0.875rem] font-semibold text-ink mb-3 flex items-center gap-2">
          <FileCheck size={16} className="text-ochre" />
          Reportes obligatorios
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportesObligatorios.map((reporte, i) => {
            const cfg = estadoConfig[reporte.estado];
            const dias = diasRestantes(reporte.proximaFecha);
            const StatusIcon = cfg.icon;

            return (
              <motion.div
                key={reporte.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4 flex flex-col justify-between hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-[0.8125rem] font-semibold text-ink leading-snug">
                      {reporte.nombre}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold ${cfg.color} ${cfg.bg}`}
                    >
                      <StatusIcon size={10} />
                      {cfg.label}
                    </span>
                  </div>

                  <p className="text-[0.6875rem] text-gray-400 mb-3 leading-relaxed">
                    {reporte.descripcion}
                  </p>
                </div>

                {/* Metadata */}
                <div>
                  <div className="flex items-center justify-between text-[0.6875rem] mb-1.5">
                    <span className="text-sepia font-medium">{reporte.entidad}</span>
                    <span className="text-gray-400">{reporte.periodicidad}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-cream rounded-full overflow-hidden mb-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${reporte.progreso}%` }}
                      transition={{ duration: 0.5, delay: i * 0.04 }}
                      className={`h-full rounded-full ${
                        reporte.estado === "completado"
                          ? "bg-green-500"
                          : reporte.estado === "atrasado"
                            ? "bg-red-400"
                            : "bg-ochre"
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[0.625rem]">
                    <span className="text-gray-400">
                      {reporte.formatosCompletados}/{reporte.formatos} formatos
                    </span>
                    <span
                      className={`font-medium ${
                        reporte.estado === "completado"
                          ? "text-green-600"
                          : dias < 0
                            ? "text-red-500"
                            : dias <= 7
                              ? "text-amber-500"
                              : "text-gray-400"
                      }`}
                    >
                      {reporte.estado === "completado" ? (
                        "Entregado"
                      ) : dias < 0 ? (
                        <span className="flex items-center gap-0.5">
                          <AlertCircle size={9} />
                          Vencido hace {Math.abs(dias)}d
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Calendar size={9} />
                          {formatFecha(reporte.proximaFecha)} ({dias}d)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Calendar timeline                                                   */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[0.875rem] font-semibold text-ink flex items-center gap-2">
            <Calendar size={16} className="text-ochre" />
            Calendario de entregas
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-lg hover:bg-cream transition-colors text-gray-400 hover:text-ink"
              aria-label="Desplazar izquierda"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-lg hover:bg-cream transition-colors text-gray-400 hover:text-ink"
              aria-label="Desplazar derecha"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {calendarioReportes.map((mesData, mi) => (
            <motion.div
              key={mesData.mes}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: mi * 0.06 }}
              className="shrink-0 w-[240px] bg-cream rounded-xl p-4"
            >
              <div className="text-[0.8125rem] font-semibold text-ink mb-3">{mesData.mes}</div>
              <div className="space-y-2">
                {mesData.reportes.map((r, ri) => (
                  <div key={`${mesData.mes}-${ri}`} className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.625rem] font-bold shrink-0 ${
                        r.estado === "completado"
                          ? "bg-green-100 text-green-600"
                          : "bg-paper text-gray-400 border border-border"
                      }`}
                    >
                      {r.dia}
                    </span>
                    <span
                      className={`text-[0.6875rem] leading-tight ${
                        r.estado === "completado" ? "text-green-600 line-through" : "text-ink"
                      }`}
                    >
                      {r.nombre}
                    </span>
                    {r.estado === "completado" && (
                      <CheckCircle2 size={10} className="text-green-500 shrink-0 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-border-light text-[0.625rem] text-gray-400">
                {mesData.reportes.filter((r) => r.estado === "completado").length}/
                {mesData.reportes.length} completados
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-light">
          <span className="flex items-center gap-1.5 text-[0.625rem] text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Completado
          </span>
          <span className="flex items-center gap-1.5 text-[0.625rem] text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-300 border border-gray-400" /> Pendiente
          </span>
        </div>
      </motion.div>
    </div>
  );
}
