"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import type { Alert } from "@/hooks/useDepartmentData";
import { getAlertColorClass } from "@/hooks/useDepartmentData";

interface AlertSystemProps {
  alerts: Alert[];
  onAlertClick?: (codigoDane: string) => void;
  maxVisible?: number;
}

const ALERT_TYPE_ICONS = {
  idf_deterioro: AlertTriangle,
  deuda_alta: AlertCircle,
  nbi_critico: AlertTriangle,
  ejecucion_baja: AlertCircle,
  cartera_morosa: AlertCircle,
};

const ALERT_TYPE_LABELS = {
  idf_deterioro: "Deterioro Fiscal",
  deuda_alta: "Deuda Alta",
  nbi_critico: "NBI Critico",
  ejecucion_baja: "Ejecucion Baja",
  cartera_morosa: "Cartera Morosa",
};

const SEVERITY_ICONS = {
  critica: "text-red-600",
  alta: "text-orange-600",
  media: "text-yellow-600",
};

export default function AlertSystem({
  alerts,
  onAlertClick,
  maxVisible = 10,
}: AlertSystemProps) {
  const [expanded, setExpanded] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredAlerts = filterType
    ? alerts.filter((a) => a.tipo === filterType)
    : alerts;

  const visibleAlerts = expanded
    ? filteredAlerts
    : filteredAlerts.slice(0, maxVisible);

  const criticalCount = alerts.filter((a) => a.severidad === "critica").length;
  const highCount = alerts.filter((a) => a.severidad === "alta").length;

  return (
    <div className="rounded-xl border border-border bg-paper overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-ink text-paper">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <h3 className="text-sm font-semibold">Alertas Criticas</h3>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[0.625rem] font-medium">
              {criticalCount} criticas
            </span>
          )}
          {highCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[0.625rem] font-medium">
              {highCount} altas
            </span>
          )}
          <span className="text-[0.6875rem] text-gray-400">
            {alerts.length} alertas activas
          </span>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 px-5 py-2 border-b border-border bg-cream/50 overflow-x-auto">
        <button
          onClick={() => setFilterType(null)}
          className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[0.6875rem] font-medium transition-colors ${
            filterType === null
              ? "bg-ink text-paper"
              : "bg-paper text-gray-500 hover:bg-gray-100"
          }`}
        >
          Todas
        </button>
        {["idf_deterioro", "nbi_critico", "ejecucion_baja"].map((tipo) => {
          const count = alerts.filter((a) => a.tipo === tipo).length;
          if (count === 0) return null;
          return (
            <button
              key={tipo}
              onClick={() => setFilterType(filterType === tipo ? null : tipo)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[0.6875rem] font-medium transition-colors ${
                filterType === tipo
                  ? "bg-ink text-paper"
                  : "bg-paper text-gray-500 hover:bg-gray-100"
              }`}
            >
              {ALERT_TYPE_LABELS[tipo as keyof typeof ALERT_TYPE_LABELS]} ({count})
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {visibleAlerts.map((alert, index) => {
            const Icon = ALERT_TYPE_ICONS[alert.tipo];
            return (
              <motion.button
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onAlertClick?.(alert.codigo_dane)}
                className="w-full flex items-start gap-3 px-5 py-3 hover:bg-cream/50 transition-colors text-left group"
              >
                <div className={`mt-0.5 ${SEVERITY_ICONS[alert.severidad]}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-ink text-sm">
                      {alert.municipio}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[0.5625rem] font-medium uppercase tracking-wide border ${getAlertColorClass(
                        alert.severidad
                      )}`}
                    >
                      {alert.severidad}
                    </span>
                  </div>
                  <p className="text-[0.8125rem] text-gray-600">{alert.mensaje}</p>
                  <div className="flex items-center gap-3 mt-1 text-[0.6875rem] text-gray-400">
                    <span>
                      Valor: <strong className="text-gray-600">{alert.valor}</strong>
                    </span>
                    <span>
                      Umbral: <strong className="text-gray-600">{alert.umbral}</strong>
                    </span>
                  </div>
                </div>
                <ExternalLink
                  size={14}
                  className="text-gray-300 group-hover:text-ochre transition-colors mt-1"
                />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show more / less */}
      {filteredAlerts.length > maxVisible && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 border-t border-border text-[0.75rem] font-medium text-gray-500 hover:text-ink hover:bg-cream/50 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Ver todas las alertas ({filteredAlerts.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}
