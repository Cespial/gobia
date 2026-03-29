"use client";

import { motion } from "framer-motion";
import { Landmark, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import type { FiscalData, IDFCategoria } from "@/lib/fut-client";

// ============================================================================
// Types
// ============================================================================

interface FiscalPanelProps {
  data: FiscalData;
  loading?: boolean;
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

interface IndicatorRowProps {
  label: string;
  value: number;
  threshold: number;
  higherIsBetter: boolean;
  unit?: string;
}

// ============================================================================
// Constants
// ============================================================================

const IDF_CATEGORIA_CONFIG: Record<
  IDFCategoria,
  { label: string; color: string; bgColor: string }
> = {
  sostenible: {
    label: "SOSTENIBLE",
    color: "#22C55E",
    bgColor: "bg-green-100",
  },
  solvente: {
    label: "SOLVENTE",
    color: "#EAB308",
    bgColor: "bg-yellow-100",
  },
  vulnerable: {
    label: "VULNERABLE",
    color: "#F97316",
    bgColor: "bg-orange-100",
  },
  deterioro: {
    label: "DETERIORO",
    color: "#EF4444",
    bgColor: "bg-red-100",
  },
};

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(Math.round(value));
}

// ============================================================================
// Sub-components
// ============================================================================

function ProgressBar({
  value,
  max = 100,
  color = "#B8956A",
  showLabel = true,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const height = size === "sm" ? "h-2" : "h-3";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${height} bg-gray-100 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={height}
          style={{ backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-[0.625rem] text-gray-500 font-medium w-10 text-right">
          {value.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

function IndicatorRow({
  label,
  value,
  threshold,
  higherIsBetter,
  unit = "%",
}: IndicatorRowProps) {
  const isGood = higherIsBetter ? value >= threshold : value <= threshold;
  const Icon = isGood ? CheckCircle : AlertCircle;
  const iconColor = isGood ? "text-green-500" : "text-orange-500";

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[0.75rem] text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[0.75rem] font-medium text-ink">
          {value.toFixed(1)}{unit}
        </span>
        <Icon size={12} className={iconColor} />
        <span className="text-[0.5625rem] text-gray-400">
          ({higherIsBetter ? ">" : "<"} {threshold}{unit})
        </span>
      </div>
    </div>
  );
}

function IngresoRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = (value / total) * 100;

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[0.6875rem] text-gray-500">{label}</span>
        <span className="text-[0.6875rem] font-medium text-ink">
          {formatCurrency(value)} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <ProgressBar value={percentage} color={color} showLabel={false} size="sm" />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function FiscalPanel({ data, loading = false }: FiscalPanelProps) {
  if (loading) {
    return <FiscalPanelSkeleton />;
  }

  const categoriaConfig = IDF_CATEGORIA_CONFIG[data.idf.categoria];

  return (
    <div className="space-y-4">
      {/* Header with IDF Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark size={16} className="text-ochre" />
          <h3 className="text-[0.8125rem] font-semibold text-ink uppercase tracking-wide">
            Hacienda Publica
          </h3>
        </div>
        <span className="text-[0.625rem] text-gray-400">
          Vigencia {data.vigencia}
        </span>
      </div>

      {/* IDF Score Card */}
      <div className="rounded-xl border border-border bg-cream/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[0.625rem] text-gray-400 uppercase tracking-wider mb-1">
              Indice de Desempeno Fiscal
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold"
                style={{ color: categoriaConfig.color }}
              >
                {data.idf.score.toFixed(1)}
              </span>
              <span className="text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-semibold ${categoriaConfig.bgColor}`}
              style={{ color: categoriaConfig.color }}
            >
              {data.idf.score >= 70 ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {categoriaConfig.label}
            </div>
            <div className="text-[0.625rem] text-gray-400 mt-1">
              Ranking: #{data.idf.ranking_dpto} de 125
            </div>
          </div>
        </div>

        {/* IDF Progress */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.idf.score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: categoriaConfig.color }}
          />
        </div>
      </div>

      {/* Ingresos Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-semibold text-gray-700 uppercase tracking-wider">
            Ingresos Totales
          </span>
          <span className="text-[0.875rem] font-bold text-ink">
            {formatCurrency(data.ingresos.total)}
          </span>
        </div>
        <div className="space-y-0.5">
          <IngresoRow
            label="Propios"
            value={data.ingresos.propios}
            total={data.ingresos.total}
            color="#B8956A"
          />
          <IngresoRow
            label="Transferencias"
            value={data.ingresos.transferencias}
            total={data.ingresos.total}
            color="#9B8A6E"
          />
          <IngresoRow
            label="Regalias"
            value={data.ingresos.regalias}
            total={data.ingresos.total}
            color="#C4A882"
          />
        </div>
      </div>

      {/* Gastos Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-semibold text-gray-700 uppercase tracking-wider">
            Gastos Totales
          </span>
          <span className="text-[0.875rem] font-bold text-ink">
            {formatCurrency(data.gastos.total)}
          </span>
        </div>
        <div className="space-y-0.5">
          <IngresoRow
            label="Inversion"
            value={data.gastos.inversion}
            total={data.gastos.total}
            color="#22C55E"
          />
          <IngresoRow
            label="Funcionamiento"
            value={data.gastos.funcionamiento}
            total={data.gastos.total}
            color="#EAB308"
          />
          <IngresoRow
            label="Deuda"
            value={data.gastos.deuda}
            total={data.gastos.total}
            color="#F97316"
          />
        </div>
      </div>

      {/* Ejecucion */}
      <div className="rounded-lg border border-border bg-paper p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-semibold text-gray-700 uppercase tracking-wider">
            Ejecucion Presupuestal
          </span>
          <span
            className="text-[0.875rem] font-bold"
            style={{
              color:
                data.gastos.ejecucion_pct >= 85
                  ? "#22C55E"
                  : data.gastos.ejecucion_pct >= 70
                    ? "#EAB308"
                    : "#EF4444",
            }}
          >
            {data.gastos.ejecucion_pct.toFixed(1)}%
          </span>
        </div>
        <ProgressBar
          value={data.gastos.ejecucion_pct}
          color={
            data.gastos.ejecucion_pct >= 85
              ? "#22C55E"
              : data.gastos.ejecucion_pct >= 70
                ? "#EAB308"
                : "#EF4444"
          }
          showLabel={false}
        />
      </div>

      {/* Cartera Morosa */}
      <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-semibold text-orange-700 uppercase tracking-wider">
            Cartera Morosa
          </span>
          <span className="text-[0.875rem] font-bold text-orange-600">
            {formatCurrency(data.cartera.total)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[0.625rem] text-gray-500">
          <span>
            Predial: {formatCurrency(data.cartera.predial)} | ICA:{" "}
            {formatCurrency(data.cartera.ica)}
          </span>
          <span>{data.cartera.edad_promedio_dias} dias prom.</span>
        </div>
      </div>

      {/* IDF Indicators */}
      <div>
        <div className="text-[0.6875rem] font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Indicadores IDF
        </div>
        <div className="space-y-0.5 rounded-lg border border-border bg-paper p-3">
          <IndicatorRow
            label="Autofinanciamiento func."
            value={data.idf.indicadores.autofinanciamiento_funcionamiento}
            threshold={60}
            higherIsBetter={false}
          />
          <IndicatorRow
            label="Dependencia transferencias"
            value={data.idf.indicadores.dependencia_transferencias}
            threshold={60}
            higherIsBetter={false}
          />
          <IndicatorRow
            label="Generacion recursos propios"
            value={data.idf.indicadores.generacion_recursos_propios}
            threshold={40}
            higherIsBetter={true}
          />
          <IndicatorRow
            label="Magnitud inversion"
            value={data.idf.indicadores.magnitud_inversion}
            threshold={50}
            higherIsBetter={true}
          />
          <IndicatorRow
            label="Capacidad de ahorro"
            value={data.idf.indicadores.capacidad_ahorro}
            threshold={0}
            higherIsBetter={true}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

function FiscalPanelSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="w-32 h-4 bg-gray-200 rounded" />
      </div>

      <div className="rounded-xl border border-border bg-gray-100 p-4">
        <div className="w-24 h-3 bg-gray-200 rounded mb-2" />
        <div className="w-20 h-8 bg-gray-200 rounded mb-3" />
        <div className="h-2 bg-gray-200 rounded-full" />
      </div>

      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="w-28 h-3 bg-gray-200 rounded mb-2" />
          <div className="space-y-1">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-4 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
