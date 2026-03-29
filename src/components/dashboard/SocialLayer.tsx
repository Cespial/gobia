"use client";

import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Stethoscope,
  Droplets,
  Wifi,
  Layers,
} from "lucide-react";
import type { SocialRanking } from "@/lib/terridata-client";

// ============================================================================
// Types
// ============================================================================

export type SocialLayerType =
  | "nbi"
  | "ipm"
  | "educacion"
  | "salud"
  | "acueducto"
  | "internet";

interface SocialLayerProps {
  onLayerChange: (layer: SocialLayerType) => void;
  activeLayer: SocialLayerType;
  data: SocialRanking[];
  loading?: boolean;
}

interface LayerConfig {
  id: SocialLayerType;
  label: string;
  icon: React.ReactNode;
  description: string;
  colorStops: [number, string][];
  unit: string;
  format: (value: number) => string;
  lowerIsBetter: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const LAYER_CONFIGS: LayerConfig[] = [
  {
    id: "nbi",
    label: "NBI",
    icon: <Users size={14} />,
    description: "Necesidades Basicas Insatisfechas",
    colorStops: [
      [10, "#22C55E"],   // Low NBI - green (good)
      [20, "#84CC16"],   // Medium-low - lime
      [35, "#EAB308"],   // Medium - yellow
      [50, "#F97316"],   // High - orange
      [100, "#EF4444"],  // Very high - red (bad)
    ],
    unit: "%",
    format: (v) => `${v.toFixed(1)}%`,
    lowerIsBetter: true,
  },
  {
    id: "ipm",
    label: "IPM",
    icon: <Users size={14} />,
    description: "Indice Pobreza Multidimensional",
    colorStops: [
      [12, "#22C55E"],   // Low IPM - green (good)
      [25, "#84CC16"],   // Medium-low - lime
      [40, "#EAB308"],   // Medium - yellow
      [55, "#F97316"],   // High - orange
      [100, "#EF4444"],  // Very high - red (bad)
    ],
    unit: "%",
    format: (v) => `${v.toFixed(1)}%`,
    lowerIsBetter: true,
  },
  {
    id: "educacion",
    label: "Educacion",
    icon: <GraduationCap size={14} />,
    description: "Cobertura educacion basica",
    colorStops: [
      [60, "#DBEAFE"],   // Low coverage - light blue
      [75, "#93C5FD"],   // Medium-low - medium blue
      [85, "#3B82F6"],   // Medium - blue
      [95, "#1D4ED8"],   // High - dark blue
    ],
    unit: "%",
    format: (v) => `${v.toFixed(0)}%`,
    lowerIsBetter: false,
  },
  {
    id: "salud",
    label: "Salud",
    icon: <Stethoscope size={14} />,
    description: "Afiliacion al sistema de salud",
    colorStops: [
      [75, "#DCFCE7"],   // Low - light green
      [85, "#86EFAC"],   // Medium-low - medium green
      [92, "#22C55E"],   // Medium - green
      [98, "#15803D"],   // High - dark green
    ],
    unit: "%",
    format: (v) => `${v.toFixed(1)}%`,
    lowerIsBetter: false,
  },
  {
    id: "acueducto",
    label: "Acueducto",
    icon: <Droplets size={14} />,
    description: "Cobertura de acueducto",
    colorStops: [
      [50, "#DBEAFE"],   // Low coverage - light blue
      [70, "#60A5FA"],   // Medium-low - medium blue
      [85, "#2563EB"],   // Medium - blue
      [95, "#1E40AF"],   // High - dark blue
    ],
    unit: "%",
    format: (v) => `${v.toFixed(0)}%`,
    lowerIsBetter: false,
  },
  {
    id: "internet",
    label: "Internet",
    icon: <Wifi size={14} />,
    description: "Cobertura de internet",
    colorStops: [
      [20, "#F3E8FF"],   // Low coverage - light purple
      [40, "#C084FC"],   // Medium-low - medium purple
      [60, "#9333EA"],   // Medium - purple
      [80, "#6B21A8"],   // High - dark purple
    ],
    unit: "%",
    format: (v) => `${v.toFixed(0)}%`,
    lowerIsBetter: false,
  },
];

// ============================================================================
// Component
// ============================================================================

export default function SocialLayer({
  onLayerChange,
  activeLayer,
  data,
  loading = false,
}: SocialLayerProps) {
  const activeConfig = LAYER_CONFIGS.find((c) => c.id === activeLayer);

  return (
    <div className="bg-paper/95 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-ink text-paper flex items-center gap-2">
        <Layers size={14} className="text-ochre" />
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wider">
          Capa Social
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
            {activeConfig.lowerIsBetter && (
              <span className="ml-1 text-gray-300">· menor = mejor</span>
            )}
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
            {activeConfig.colorStops.slice(0, 4).map(([value], index) => (
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
          <div className="flex justify-between">
            <span>Promedio:</span>
            <span className="font-medium text-ink">
              {activeConfig?.format(
                data.reduce((sum, m) => sum + m.valor, 0) / data.length
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Rango:</span>
            <span className="font-medium text-ink">
              {activeConfig?.format(Math.min(...data.map((m) => m.valor)))} -{" "}
              {activeConfig?.format(Math.max(...data.map((m) => m.valor)))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper: Get color for a value based on layer type
// ============================================================================

export function getSocialLayerColor(
  value: number,
  layerType: SocialLayerType
): string {
  const config = LAYER_CONFIGS.find((c) => c.id === layerType);
  if (!config) return "#DDD4C4";

  const stops = config.colorStops;

  // For lowerIsBetter, we traverse from low to high
  if (config.lowerIsBetter) {
    for (let i = 0; i < stops.length; i++) {
      if (value <= stops[i][0]) {
        return stops[i][1];
      }
    }
    return stops[stops.length - 1][1];
  }

  // For higherIsBetter, we find the highest threshold that value meets
  for (let i = stops.length - 1; i >= 0; i--) {
    if (value >= stops[i][0]) {
      return stops[i][1];
    }
  }

  return stops[0][1];
}

/**
 * Build Mapbox expression for social layer coloring
 */
export function buildSocialColorExpression(
  layerType: SocialLayerType,
  socialData: Map<string, number>
): mapboxgl.Expression {
  // Create a match expression that maps codigo_dane to colors
  const matchPairs: (string | mapboxgl.Expression)[] = [];

  socialData.forEach((value, codigoDane) => {
    matchPairs.push(codigoDane);
    matchPairs.push(getSocialLayerColor(value, layerType));
  });

  return [
    "match",
    ["get", "codigo_dane"],
    ...matchPairs,
    "#DDD4C4", // default color
  ] as mapboxgl.Expression;
}

/**
 * Get the layer configuration for a given layer type
 */
export function getSocialLayerConfig(layerType: SocialLayerType): LayerConfig | undefined {
  return LAYER_CONFIGS.find((c) => c.id === layerType);
}
