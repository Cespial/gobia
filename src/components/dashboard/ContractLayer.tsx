"use client";

import { FileText, DollarSign, BarChart3, Activity } from "lucide-react";

export type ContractLayerType = "cantidad" | "valor" | "ejecucion_cuipo" | "tipo_predominante";

interface ContractMetrics {
  codigo_dane: string;
  municipio: string;
  total_contratos: number;
  valor_total: number;
  tipo_predominante: string;
  porcentaje_ejecucion: number;
}

interface ContractLayerProps {
  onLayerChange: (layer: ContractLayerType) => void;
  activeLayer: ContractLayerType;
  data: ContractMetrics[];
}

const LAYER_CONFIG: Record<ContractLayerType, {
  label: string;
  icon: React.ReactNode;
  description: string;
}> = {
  cantidad: {
    label: "Total contratos",
    icon: <FileText size={14} />,
    description: "Cantidad de contratos por municipio",
  },
  valor: {
    label: "Valor contratación",
    icon: <DollarSign size={14} />,
    description: "Valor total en COP",
  },
  ejecucion_cuipo: {
    label: "Ejecución CUIPO",
    icon: <Activity size={14} />,
    description: "% de ejecución presupuestal",
  },
  tipo_predominante: {
    label: "Tipo predominante",
    icon: <BarChart3 size={14} />,
    description: "Tipo de contrato más común",
  },
};

export default function ContractLayer({
  onLayerChange,
  activeLayer,
  data,
}: ContractLayerProps) {
  // Calculate aggregate stats
  const totalContratos = data.reduce((sum, m) => sum + m.total_contratos, 0);
  const totalValor = data.reduce((sum, m) => sum + m.valor_total, 0);
  const avgEjecucion = data.length > 0
    ? data.reduce((sum, m) => sum + m.porcentaje_ejecucion, 0) / data.length
    : 0;

  return (
    <div className="bg-paper/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border-light">
        <FileText size={14} className="text-ochre" />
        <span className="text-[0.6875rem] font-semibold text-ink uppercase tracking-wider">
          Capa Contratación
        </span>
      </div>

      {/* Layer buttons */}
      <div className="space-y-1">
        {(Object.keys(LAYER_CONFIG) as ContractLayerType[]).map((layer) => {
          const config = LAYER_CONFIG[layer];
          const isActive = activeLayer === layer;

          return (
            <button
              key={layer}
              onClick={() => onLayerChange(layer)}
              className={`
                flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-left
                transition-all duration-200
                ${isActive
                  ? "bg-ochre-soft text-ochre border border-ochre/20"
                  : "text-gray-500 hover:bg-cream hover:text-ink"
                }
              `}
            >
              <span className={isActive ? "text-ochre" : "text-gray-400"}>
                {config.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.75rem] font-medium truncate">
                  {config.label}
                </p>
                <p className="text-[0.625rem] text-gray-400 truncate">
                  {config.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="pt-2 border-t border-border-light space-y-2">
        <div className="flex justify-between items-center text-[0.6875rem]">
          <span className="text-gray-400">Total contratos</span>
          <span className="font-semibold text-ink">
            {totalContratos.toLocaleString("es-CO")}
          </span>
        </div>
        <div className="flex justify-between items-center text-[0.6875rem]">
          <span className="text-gray-400">Valor total</span>
          <span className="font-semibold text-ink">
            {formatCurrency(totalValor)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[0.6875rem]">
          <span className="text-gray-400">Ejecución prom.</span>
          <span className={`font-semibold ${getEjecucionColor(avgEjecucion)}`}>
            {avgEjecucion.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Legend for active layer */}
      <ContractLegend activeLayer={activeLayer} />
    </div>
  );
}

function ContractLegend({ activeLayer }: { activeLayer: ContractLayerType }) {
  if (activeLayer === "cantidad") {
    return (
      <div className="pt-2 border-t border-border-light">
        <p className="text-[0.5625rem] text-gray-400 mb-1.5 uppercase tracking-wider">
          Escala contratos
        </p>
        <div className="space-y-1">
          <LegendItem color="#22C55E" label="500+ contratos" />
          <LegendItem color="#EAB308" label="100-499 contratos" />
          <LegendItem color="#F97316" label="50-99 contratos" />
          <LegendItem color="#EF4444" label="<50 contratos" />
        </div>
      </div>
    );
  }

  if (activeLayer === "valor") {
    return (
      <div className="pt-2 border-t border-border-light">
        <p className="text-[0.5625rem] text-gray-400 mb-1.5 uppercase tracking-wider">
          Escala valor
        </p>
        <div className="space-y-1">
          <LegendItem color="#22C55E" label="$100B+ COP" />
          <LegendItem color="#EAB308" label="$50B-$100B COP" />
          <LegendItem color="#F97316" label="$20B-$50B COP" />
          <LegendItem color="#EF4444" label="<$20B COP" />
        </div>
      </div>
    );
  }

  if (activeLayer === "ejecucion_cuipo") {
    return (
      <div className="pt-2 border-t border-border-light">
        <p className="text-[0.5625rem] text-gray-400 mb-1.5 uppercase tracking-wider">
          % Ejecución
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

  // tipo_predominante
  return (
    <div className="pt-2 border-t border-border-light">
      <p className="text-[0.5625rem] text-gray-400 mb-1.5 uppercase tracking-wider">
        Tipo contrato
      </p>
      <div className="space-y-1">
        <LegendItem color="#3B82F6" label="Prestación servicios" />
        <LegendItem color="#8B5CF6" label="Suministro" />
        <LegendItem color="#F97316" label="Obra pública" />
        <LegendItem color="#EC4899" label="Consultoría" />
        <LegendItem color="#6B7280" label="Otros" />
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

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  return `$${value.toLocaleString("es-CO")}`;
}

function getEjecucionColor(pct: number): string {
  if (pct >= 85) return "text-green-600";
  if (pct >= 70) return "text-yellow-600";
  if (pct >= 50) return "text-orange-500";
  return "text-red-500";
}

// Color helpers for map integration
export function getContractCountColor(count: number): string {
  if (count >= 500) return "#22C55E";
  if (count >= 100) return "#EAB308";
  if (count >= 50) return "#F97316";
  return "#EF4444";
}

export function getContractValueColor(value: number): string {
  if (value >= 100_000_000_000) return "#22C55E";
  if (value >= 50_000_000_000) return "#EAB308";
  if (value >= 20_000_000_000) return "#F97316";
  return "#EF4444";
}

export function getEjecucionCuipoColor(pct: number): string {
  if (pct >= 85) return "#22C55E";
  if (pct >= 70) return "#EAB308";
  if (pct >= 50) return "#F97316";
  return "#EF4444";
}

export function getTipoPredominanteColor(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t.includes("prestación") || t.includes("prestacion") || t.includes("servicios")) return "#3B82F6";
  if (t.includes("suministro")) return "#8B5CF6";
  if (t.includes("obra")) return "#F97316";
  if (t.includes("consultoría") || t.includes("consultoria")) return "#EC4899";
  return "#6B7280";
}
