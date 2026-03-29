"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Calendar, ChevronDown } from "lucide-react";
import type { HistoricalData, HistoricalPoint } from "@/hooks/useDepartmentData";
import { formatCurrency } from "@/hooks/useDepartmentData";

interface HistoricalTrendsProps {
  tendencias: HistoricalData;
}

type MetricKey = keyof HistoricalData;

const METRIC_CONFIG: Record<
  MetricKey,
  {
    label: string;
    unit: string;
    format: (v: number) => string;
    higherIsBetter: boolean;
    color: string;
  }
> = {
  idf_historico: {
    label: "IDF Promedio",
    unit: "pts",
    format: (v) => v.toFixed(1),
    higherIsBetter: true,
    color: "#B8956A",
  },
  nbi_historico: {
    label: "NBI Promedio",
    unit: "%",
    format: (v) => v.toFixed(1),
    higherIsBetter: false,
    color: "#7BA38C",
  },
  deuda_historica: {
    label: "Deuda Total",
    unit: "",
    format: (v) => formatCurrency(v),
    higherIsBetter: false,
    color: "#A0616A",
  },
  ejecucion_historica: {
    label: "Ejecucion",
    unit: "%",
    format: (v) => v.toFixed(1),
    higherIsBetter: true,
    color: "#5B7BA5",
  },
  ingresos_propios_historico: {
    label: "Ingresos Propios",
    unit: "%",
    format: (v) => v.toFixed(1),
    higherIsBetter: true,
    color: "#6B8E4E",
  },
};

function SimpleLineChart({
  data,
  config,
}: {
  data: HistoricalPoint[];
  config: (typeof METRIC_CONFIG)[MetricKey];
}) {
  if (data.length === 0) return null;

  const minVal = Math.min(...data.map((d) => d.valor));
  const maxVal = Math.max(...data.map((d) => d.valor));
  const range = maxVal - minVal || 1;

  // Generate SVG path
  const width = 100;
  const height = 40;
  const padding = 4;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (d.valor - minVal) / range) * (height - padding * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10">
      {/* Area fill */}
      <path d={areaD} fill={config.color} fillOpacity={0.1} />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={config.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={2}
          fill={config.color}
        />
      ))}
    </svg>
  );
}

function TrendIndicator({
  data,
  higherIsBetter,
}: {
  data: HistoricalPoint[];
  higherIsBetter: boolean;
}) {
  if (data.length < 2) return null;

  const first = data[0].valor;
  const last = data[data.length - 1].valor;
  const change = last - first;
  const percentChange = ((change / first) * 100).toFixed(1);

  const isPositive = higherIsBetter ? change > 0 : change < 0;
  const Icon = change > 0 ? TrendingUp : TrendingDown;

  return (
    <div
      className={`flex items-center gap-1 text-[0.6875rem] ${
        isPositive ? "text-green-600" : "text-red-500"
      }`}
    >
      <Icon size={12} />
      <span>
        {change > 0 ? "+" : ""}
        {percentChange}%
      </span>
      <span className="text-gray-400 ml-1">
        ({data[0].año}-{data[data.length - 1].año})
      </span>
    </div>
  );
}

export default function HistoricalTrends({ tendencias }: HistoricalTrendsProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("idf_historico");

  const metrics: MetricKey[] = [
    "idf_historico",
    "nbi_historico",
    "ejecucion_historica",
    "deuda_historica",
    "ingresos_propios_historico",
  ];

  return (
    <div className="rounded-xl border border-border bg-paper overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-ink text-paper">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-ochre" />
          <h3 className="text-sm font-semibold">Tendencias Historicas</h3>
        </div>
        <span className="text-[0.6875rem] text-gray-400">2019-2024</span>
      </div>

      {/* Metric selector */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-cream/50 overflow-x-auto">
        {metrics.map((key) => {
          const config = METRIC_CONFIG[key];
          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors ${
                selectedMetric === key
                  ? "bg-ink text-paper"
                  : "bg-paper text-gray-500 hover:bg-gray-100"
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Chart grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {metrics.map((key, index) => {
          const config = METRIC_CONFIG[key];
          const data = tendencias[key];
          const lastValue = data[data.length - 1]?.valor ?? 0;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedMetric(key)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                selectedMetric === key
                  ? "border-ochre bg-ochre-soft/30 shadow-sm"
                  : "border-border hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.75rem] font-medium text-gray-600">
                  {config.label}
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-ink">
                  {config.format(lastValue)}
                </span>
                {config.unit && (
                  <span className="text-[0.6875rem] text-gray-400">
                    {config.unit}
                  </span>
                )}
              </div>

              <TrendIndicator data={data} higherIsBetter={config.higherIsBetter} />

              <div className="mt-3">
                <SimpleLineChart data={data} config={config} />
              </div>

              {/* Year labels */}
              <div className="flex justify-between mt-1 text-[0.5625rem] text-gray-400">
                <span>{data[0]?.año}</span>
                <span>{data[data.length - 1]?.año}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed view for selected metric */}
      <div className="px-5 py-4 border-t border-border bg-cream/30">
        <h4 className="text-[0.8125rem] font-semibold text-ink mb-3">
          {METRIC_CONFIG[selectedMetric].label} - Serie Completa
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.75rem]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-gray-500 font-medium">
                  Año
                </th>
                <th className="px-3 py-2 text-right text-gray-500 font-medium">
                  Valor
                </th>
                <th className="px-3 py-2 text-right text-gray-500 font-medium">
                  Var. Anual
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {tendencias[selectedMetric].map((point, i) => {
                const prev = tendencias[selectedMetric][i - 1]?.valor;
                const change = prev ? point.valor - prev : 0;
                const config = METRIC_CONFIG[selectedMetric];
                const isPositive = config.higherIsBetter
                  ? change > 0
                  : change < 0;

                return (
                  <tr key={point.año} className="hover:bg-cream/50">
                    <td className="px-3 py-2 font-medium text-ink">
                      {point.año}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {config.format(point.valor)}
                      {config.unit && (
                        <span className="text-gray-400 ml-1">
                          {config.unit}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {prev && (
                        <span
                          className={
                            isPositive ? "text-green-600" : "text-red-500"
                          }
                        >
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
