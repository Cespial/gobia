"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import type { SubregionData } from "@/hooks/useDepartmentData";
import { formatCurrency, formatPopulation } from "@/hooks/useDepartmentData";

interface SubregionAnalysisProps {
  subregiones: SubregionData[];
  onSubregionClick?: (nombre: string) => void;
}

const SUBREGION_COLORS: Record<string, string> = {
  "Valle de Aburrá": "#B8956A",
  Oriente: "#7BA38C",
  Occidente: "#8B7355",
  Suroeste: "#A0616A",
  Norte: "#6B8E4E",
  Nordeste: "#5B7BA5",
  "Bajo Cauca": "#C4A882",
  Urabá: "#9B8A6E",
  "Magdalena Medio": "#7B6BA5",
};

function getIDFStatus(idf: number): { label: string; color: string } {
  if (idf >= 75) return { label: "Sostenible", color: "text-green-600 bg-green-50" };
  if (idf >= 65) return { label: "Solvente", color: "text-yellow-600 bg-yellow-50" };
  if (idf >= 55) return { label: "Vulnerable", color: "text-orange-600 bg-orange-50" };
  return { label: "En Riesgo", color: "text-red-600 bg-red-50" };
}

function getNBIStatus(nbi: number): { label: string; color: string } {
  if (nbi <= 10) return { label: "Bajo", color: "text-green-600" };
  if (nbi <= 20) return { label: "Medio", color: "text-yellow-600" };
  if (nbi <= 35) return { label: "Alto", color: "text-orange-600" };
  return { label: "Muy Alto", color: "text-red-600" };
}

export default function SubregionAnalysis({
  subregiones,
  onSubregionClick,
}: SubregionAnalysisProps) {
  return (
    <div className="rounded-xl border border-border bg-paper overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-ink text-paper">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-ochre" />
          <h3 className="text-sm font-semibold">Analisis por Subregion</h3>
        </div>
        <span className="text-[0.6875rem] text-gray-400">
          9 subregiones
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {subregiones.map((subregion, index) => {
          const idfStatus = getIDFStatus(subregion.idf_promedio);
          const nbiStatus = getNBIStatus(subregion.nbi_promedio);
          const subregionColor = SUBREGION_COLORS[subregion.nombre] || "#888";

          return (
            <motion.button
              key={subregion.nombre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSubregionClick?.(subregion.nombre)}
              className="group text-left rounded-xl border border-border p-4 hover:border-gray-300 hover:shadow-md transition-all"
            >
              {/* Subregion header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subregionColor }}
                  />
                  <h4 className="font-semibold text-ink text-[0.9375rem]">
                    {subregion.nombre}
                  </h4>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-300 group-hover:text-ochre transition-colors"
                />
              </div>

              {/* Stats */}
              <div className="space-y-2.5">
                {/* IDF */}
                <div className="flex items-center justify-between">
                  <span className="text-[0.75rem] text-gray-500">IDF Promedio</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">
                      {subregion.idf_promedio}
                    </span>
                    <span
                      className={`text-[0.625rem] px-1.5 py-0.5 rounded ${idfStatus.color}`}
                    >
                      {idfStatus.label}
                    </span>
                  </div>
                </div>

                {/* NBI */}
                <div className="flex items-center justify-between">
                  <span className="text-[0.75rem] text-gray-500">NBI Promedio</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">
                      {subregion.nbi_promedio}%
                    </span>
                    <span className={`text-[0.625rem] ${nbiStatus.color}`}>
                      {nbiStatus.label}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border-light pt-2.5 mt-2.5">
                  {/* Municipios */}
                  <div className="flex items-center justify-between text-[0.75rem]">
                    <span className="text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />
                      Municipios
                    </span>
                    <span className="font-medium text-ink">
                      {subregion.municipios}
                    </span>
                  </div>

                  {/* Poblacion */}
                  <div className="flex items-center justify-between text-[0.75rem] mt-1">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Users size={12} />
                      Poblacion
                    </span>
                    <span className="font-medium text-ink">
                      {formatPopulation(subregion.poblacion)}
                    </span>
                  </div>

                  {/* Deuda total */}
                  <div className="flex items-center justify-between text-[0.75rem] mt-1">
                    <span className="text-gray-500 flex items-center gap-1">
                      <TrendingUp size={12} />
                      Deuda total
                    </span>
                    <span className="font-medium text-ink font-mono text-[0.6875rem]">
                      {formatCurrency(subregion.deuda_total)}
                    </span>
                  </div>

                  {/* En riesgo */}
                  {subregion.municipios_en_riesgo > 0 && (
                    <div className="flex items-center justify-between text-[0.75rem] mt-1">
                      <span className="text-red-500 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        En riesgo
                      </span>
                      <span className="font-medium text-red-600">
                        {subregion.municipios_en_riesgo} mun.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
