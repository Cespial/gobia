"use client";

import { Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import type { CuipoMunicipioResumen } from "@/hooks/useCuipoData";

// ============================================================================
// Types
// ============================================================================

export type CuipoLayerMetric = "ejecucion" | "gasto_total";

interface CuipoLayerProps {
  data: CuipoMunicipioResumen[];
  activeMetric: CuipoLayerMetric;
  onMetricChange: (metric: CuipoLayerMetric) => void;
}

// ============================================================================
// Color helpers (exported for map integration)
// ============================================================================

export function getCuipoEjecucionChoroplethColor(pct: number): string {
  if (pct >= 85) return "#22C55E";
  if (pct >= 70) return "#EAB308";
  if (pct >= 50) return "#F97316";
  return "#EF4444";
}

export function getCuipoGastoColor(value: number): string {
  if (value >= 500_000_000_000) return "#1E40AF";
  if (value >= 100_000_000_000) return "#3B82F6";
  if (value >= 50_000_000_000) return "#93C5FD";
  return "#DBEAFE";
}

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString("es-CO")}`;
}

// ============================================================================
// Component
// ============================================================================

export default function CuipoLayer({
  data,
  activeMetric,
  onMetricChange,
}: CuipoLayerProps) {
  const avgEjecucion =
    data.length > 0
      ? Math.round(
          (data.reduce((s, d) => s + d.porcentaje_ejecucion, 0) / data.length) *
            10
        ) / 10
      : 0;
  const totalGasto = data.reduce((s, d) => s + d.total_gasto, 0);

  // Top/bottom performers
  const sorted = [...data].sort(
    (a, b) => b.porcentaje_ejecucion - a.porcentaje_ejecucion
  );
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  return (
    <div className="bg-paper/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border-light">
        <Activity size={14} className="text-ochre" />
        <span className="text-[0.6875rem] font-semibold text-ink uppercase tracking-wider">
          Ejecución CUIPO
        </span>
      </div>

      {/* Metric toggle */}
      <div className="space-y-1">
        <button
          onClick={() => onMetricChange("ejecucion")}
          className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left transition-all duration-200 ${
            activeMetric === "ejecucion"
              ? "bg-ochre-soft text-ochre border border-ochre/20"
              : "text-gray-500 hover:bg-cream hover:text-ink"
          }`}
        >
          <Activity
            size={14}
            className={activeMetric === "ejecucion" ? "text-ochre" : "text-gray-400"}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[0.75rem] font-medium truncate">% Ejecución</p>
            <p className="text-[0.625rem] text-gray-400 truncate">
              Gasto ejecutado / presupuesto
            </p>
          </div>
        </button>
        <button
          onClick={() => onMetricChange("gasto_total")}
          className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left transition-all duration-200 ${
            activeMetric === "gasto_total"
              ? "bg-ochre-soft text-ochre border border-ochre/20"
              : "text-gray-500 hover:bg-cream hover:text-ink"
          }`}
        >
          <BarChart3
            size={14}
            className={activeMetric === "gasto_total" ? "text-ochre" : "text-gray-400"}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[0.75rem] font-medium truncate">Gasto total</p>
            <p className="text-[0.625rem] text-gray-400 truncate">
              Monto ejecutado en COP
            </p>
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="pt-2 border-t border-border-light space-y-2">
        <div className="flex justify-between items-center text-[0.6875rem]">
          <span className="text-gray-400">Ejecución prom.</span>
          <span
            className={`font-semibold ${
              avgEjecucion >= 85
                ? "text-green-600"
                : avgEjecucion >= 70
                  ? "text-yellow-600"
                  : avgEjecucion >= 50
                    ? "text-orange-500"
                    : "text-red-500"
            }`}
          >
            {avgEjecucion}%
          </span>
        </div>
        <div className="flex justify-between items-center text-[0.6875rem]">
          <span className="text-gray-400">Gasto total</span>
          <span className="font-semibold text-ink">{formatCurrency(totalGasto)}</span>
        </div>
        <div className="flex justify-between items-center text-[0.6875rem]">
          <span className="text-gray-400">Municipios</span>
          <span className="font-semibold text-ink">{data.length}</span>
        </div>
      </div>

      {/* Top performers */}
      {top3.length > 0 && (
        <div className="pt-2 border-t border-border-light">
          <p className="text-[0.5625rem] text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp size={10} className="text-green-500" />
            Mayor ejecución
          </p>
          <div className="space-y-1">
            {top3.map((m, i) => (
              <div
                key={m.codigo_dane}
                className="flex items-center justify-between text-[0.625rem]"
              >
                <span className="text-gray-600 truncate max-w-[120px]">
                  {i + 1}. {m.municipio}
                </span>
                <span className="font-medium text-green-600">
                  {m.porcentaje_ejecucion}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom performers */}
      {bottom3.length > 0 && (
        <div className="pt-2 border-t border-border-light">
          <p className="text-[0.5625rem] text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <TrendingDown size={10} className="text-red-500" />
            Menor ejecución
          </p>
          <div className="space-y-1">
            {bottom3.map((m, i) => (
              <div
                key={m.codigo_dane}
                className="flex items-center justify-between text-[0.625rem]"
              >
                <span className="text-gray-600 truncate max-w-[120px]">
                  {data.length - 2 + i}. {m.municipio}
                </span>
                <span className="font-medium text-red-500">
                  {m.porcentaje_ejecucion}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <CuipoLegend activeMetric={activeMetric} />
    </div>
  );
}

function CuipoLegend({ activeMetric }: { activeMetric: CuipoLayerMetric }) {
  if (activeMetric === "ejecucion") {
    return (
      <div className="pt-2 border-t border-border-light">
        <p className="text-[0.5625rem] text-gray-400 mb-1.5 uppercase tracking-wider">
          % Ejecución presupuestal
        </p>
        <div className="space-y-1">
          <LegendItem color="#22C55E" label="85%+ (Excelente)" />
          <LegendItem color="#EAB308" label="70-84% (Bueno)" />
          <LegendItem color="#F97316" label="50-69% (Regular)" />
          <LegendItem color="#EF4444" label="<50% (Bajo)" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 border-t border-border-light">
      <p className="text-[0.5625rem] text-gray-400 mb-1.5 uppercase tracking-wider">
        Gasto ejecutado
      </p>
      <div className="space-y-1">
        <LegendItem color="#1E40AF" label="$500B+ COP" />
        <LegendItem color="#3B82F6" label="$100B-$500B COP" />
        <LegendItem color="#93C5FD" label="$50B-$100B COP" />
        <LegendItem color="#DBEAFE" label="<$50B COP" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-[0.625rem] text-gray-600">{label}</span>
    </div>
  );
}
