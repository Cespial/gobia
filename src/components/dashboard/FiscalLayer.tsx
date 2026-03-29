"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  AlertTriangle,
  Layers,
} from "lucide-react";
import type { IDFRanking } from "@/lib/fut-client";

// ============================================================================
// Types
// ============================================================================

export type FiscalLayerType =
  | "idf"
  | "ejecucion"
  | "ingresos_propios"
  | "dependencia";

interface FiscalLayerProps {
  onLayerChange: (layer: FiscalLayerType) => void;
  activeLayer: FiscalLayerType;
  data: IDFRanking[];
  loading?: boolean;
}

interface LayerConfig {
  id: FiscalLayerType;
  label: string;
  icon: React.ReactNode;
  description: string;
  colorStops: [number, string][];
  unit: string;
  format: (value: number) => string;
}

// ============================================================================
// Constants
// ============================================================================

const LAYER_CONFIGS: LayerConfig[] = [
  {
    id: "idf",
    label: "IDF",
    icon: <TrendingUp size={14} />,
    description: "Indice de Desempeno Fiscal",
    colorStops: [
      [50, "#EF4444"], // deterioro - red
      [60, "#F97316"], // vulnerable - orange
      [70, "#EAB308"], // solvente - yellow
      [80, "#22C55E"], // sostenible - green
    ],
    unit: "pts",
    format: (v) => v.toFixed(1),
  },
  {
    id: "ejecucion",
    label: "Ejecucion",
    icon: <Wallet size={14} />,
    description: "Ejecucion presupuestal",
    colorStops: [
      [60, "#EF4444"], // Low execution - red
      [75, "#F97316"], // Medium - orange
      [85, "#EAB308"], // Good - yellow
      [95, "#22C55E"], // Excellent - green
    ],
    unit: "%",
    format: (v) => `${v.toFixed(0)}%`,
  },
  {
    id: "ingresos_propios",
    label: "Rec. Propios",
    icon: <PiggyBank size={14} />,
    description: "Generacion recursos propios",
    colorStops: [
      [20, "#DDD4C4"], // Low - cream
      [40, "#C4A882"], // Medium-low - tan
      [60, "#B8956A"], // Medium - ochre
      [80, "#8B7355"], // High - brown
    ],
    unit: "%",
    format: (v) => `${v.toFixed(0)}%`,
  },
  {
    id: "dependencia",
    label: "Dep. Transf.",
    icon: <AlertTriangle size={14} />,
    description: "Dependencia de transferencias",
    colorStops: [
      [30, "#22C55E"], // Low dependency - green (good)
      [45, "#EAB308"], // Medium - yellow
      [60, "#F97316"], // High - orange
      [75, "#EF4444"], // Very high - red (bad)
    ],
    unit: "%",
    format: (v) => `${v.toFixed(0)}%`,
  },
];

// ============================================================================
// Component
// ============================================================================

export default function FiscalLayer({
  onLayerChange,
  activeLayer,
  data,
  loading = false,
}: FiscalLayerProps) {
  const activeConfig = LAYER_CONFIGS.find((c) => c.id === activeLayer);

  return (
    <div className="bg-paper/95 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-ink text-paper flex items-center gap-2">
        <Layers size={14} className="text-ochre" />
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wider">
          Capa Fiscal
        </span>
        {loading && (
          <span className="ml-auto text-[0.5625rem] text-gray-400 animate-pulse">
            Cargando...
          </span>
        )}
      </div>

      {/* Layer buttons */}
      <div className="p-2 space-y-1">
        {LAYER_CONFIGS.map((config) => (
          <button
            key={config.id}
            onClick={() => onLayerChange(config.id)}
            className={`
              flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left
              transition-all duration-200
              ${
                activeLayer === config.id
                  ? "bg-ochre-soft text-ochre"
                  : "text-gray-500 hover:bg-cream hover:text-ink"
              }
            `}
          >
            <span
              className={`flex-shrink-0 ${
                activeLayer === config.id ? "text-ochre" : "text-gray-400"
              }`}
            >
              {config.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[0.75rem] font-medium truncate">
                {config.label}
              </div>
              <div className="text-[0.5625rem] text-gray-400 truncate">
                {config.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Legend for active layer */}
      {activeConfig && (
        <motion.div
          key={activeLayer}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-3 py-2 border-t border-border bg-cream/50"
        >
          <div className="text-[0.5625rem] text-gray-400 mb-2 font-medium">
            Leyenda ({activeConfig.unit})
          </div>
          <div className="flex items-center gap-1">
            {/* Gradient bar */}
            <div
              className="flex-1 h-3 rounded-sm overflow-hidden"
              style={{
                background: `linear-gradient(to right, ${activeConfig.colorStops
                  .map(([_, color]) => color)
                  .join(", ")})`,
              }}
            />
          </div>
          {/* Labels */}
          <div className="flex justify-between mt-1">
            {activeConfig.colorStops.map(([value], index) => (
              <span
                key={index}
                className="text-[0.5rem] text-gray-500"
              >
                {activeConfig.format(value)}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats summary */}
      {data.length > 0 && (
        <div className="px-3 py-2 border-t border-border text-[0.625rem] text-gray-500">
          <div className="flex justify-between">
            <span>Municipios:</span>
            <span className="font-medium text-ink">{data.length}</span>
          </div>
          {activeLayer === "idf" && (
            <>
              <div className="flex justify-between">
                <span>Promedio IDF:</span>
                <span className="font-medium text-ink">
                  {(data.reduce((sum, m) => sum + m.idf, 0) / data.length).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rango:</span>
                <span className="font-medium text-ink">
                  {Math.min(...data.map((m) => m.idf)).toFixed(1)} -{" "}
                  {Math.max(...data.map((m) => m.idf)).toFixed(1)}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper: Get color for a value based on layer type
// ============================================================================

export function getFiscalLayerColor(
  value: number,
  layerType: FiscalLayerType
): string {
  const config = LAYER_CONFIGS.find((c) => c.id === layerType);
  if (!config) return "#DDD4C4";

  const stops = config.colorStops;

  // Find the appropriate color stop
  for (let i = stops.length - 1; i >= 0; i--) {
    if (value >= stops[i][0]) {
      return stops[i][1];
    }
  }

  return stops[0][1];
}

/**
 * Build Mapbox expression for fiscal layer coloring
 */
export function buildFiscalColorExpression(
  layerType: FiscalLayerType,
  idfData: Map<string, number>
): mapboxgl.Expression {
  // Create a match expression that maps codigo_dane to colors
  const matchPairs: (string | mapboxgl.Expression)[] = [];

  idfData.forEach((value, codigoDane) => {
    matchPairs.push(codigoDane);
    matchPairs.push(getFiscalLayerColor(value, layerType));
  });

  return [
    "match",
    ["get", "codigo_dane"],
    ...matchPairs,
    "#DDD4C4", // default color
  ] as mapboxgl.Expression;
}
