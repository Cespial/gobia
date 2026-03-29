"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  AlertTriangle,
  DollarSign,
  GraduationCap,
  Heart,
} from "lucide-react";
import type { DepartmentKPI } from "@/hooks/useDepartmentData";
import { formatCurrency, formatPopulation } from "@/hooks/useDepartmentData";

interface DepartmentKPIsProps {
  kpis: DepartmentKPI;
}

const CATEGORY_COLORS = {
  sostenible: { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100" },
  solvente: { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-100" },
  vulnerable: { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-100" },
  deterioro: { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100" },
};

const CATEGORY_LABELS = {
  sostenible: "Sostenible",
  solvente: "Solvente",
  vulnerable: "Vulnerable",
  deterioro: "Deterioro",
};

export default function DepartmentKPIs({ kpis }: DepartmentKPIsProps) {
  const categoryColors = CATEGORY_COLORS[kpis.idf_categoria];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* IDF Promedio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl border border-border p-4 ${categoryColors.bg}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-medium text-gray-500 uppercase tracking-wide">
            IDF Promedio
          </span>
          <TrendingUp size={14} className="text-green-600" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-2xl font-bold ${categoryColors.text}`}>
            {kpis.idf_promedio}
          </span>
          <span className="text-[0.6875rem] text-gray-400">pts</span>
        </div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-medium ${categoryColors.badge} ${categoryColors.text}`}>
          {CATEGORY_LABELS[kpis.idf_categoria]}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[0.625rem] text-green-600">
          <TrendingUp size={10} />
          <span>+2.3 pts vs 2023</span>
        </div>
      </motion.div>

      {/* NBI Promedio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-paper p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-medium text-gray-500 uppercase tracking-wide">
            NBI Promedio
          </span>
          <Users size={14} className="text-gray-400" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-ink">
            {kpis.nbi_promedio}%
          </span>
        </div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-medium ${
          kpis.nbi_promedio <= 10 ? "bg-green-100 text-green-700" :
          kpis.nbi_promedio <= 20 ? "bg-yellow-100 text-yellow-700" :
          "bg-red-100 text-red-700"
        }`}>
          {kpis.nbi_promedio <= 10 ? "Bajo" : kpis.nbi_promedio <= 20 ? "Medio" : "Alto"}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[0.625rem] text-green-600">
          <TrendingDown size={10} />
          <span>-0.5 pts vs 2023</span>
        </div>
      </motion.div>

      {/* Ejecucion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-paper p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-medium text-gray-500 uppercase tracking-wide">
            Ejecucion
          </span>
          <Building2 size={14} className="text-gray-400" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-ink">
            {kpis.ejecucion_promedio}%
          </span>
        </div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-medium ${
          kpis.ejecucion_promedio >= 85 ? "bg-green-100 text-green-700" :
          kpis.ejecucion_promedio >= 70 ? "bg-yellow-100 text-yellow-700" :
          "bg-red-100 text-red-700"
        }`}>
          {kpis.ejecucion_promedio >= 85 ? "Bien" : kpis.ejecucion_promedio >= 70 ? "Regular" : "Bajo"}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[0.625rem] text-gray-500">
          <TrendingDown size={10} />
          <span>-0.4 pts vs 2023</span>
        </div>
      </motion.div>

      {/* Deuda Per Capita */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-border bg-paper p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-medium text-gray-500 uppercase tracking-wide">
            Deuda p/c
          </span>
          <DollarSign size={14} className="text-gray-400" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-ink">
            {formatCurrency(kpis.deuda_percapita)}
          </span>
        </div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-medium ${
          kpis.deuda_percapita <= 1500000 ? "bg-green-100 text-green-700" :
          kpis.deuda_percapita <= 3000000 ? "bg-yellow-100 text-yellow-700" :
          "bg-red-100 text-red-700"
        }`}>
          {kpis.deuda_percapita <= 1500000 ? "Bajo" : kpis.deuda_percapita <= 3000000 ? "Medio" : "Alto"}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[0.625rem] text-orange-600">
          <TrendingUp size={10} />
          <span>+5.2% vs 2023</span>
        </div>
      </motion.div>

      {/* Municipios en Riesgo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-red-200 bg-red-50 p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-medium text-red-600 uppercase tracking-wide">
            En Riesgo
          </span>
          <AlertTriangle size={14} className="text-red-500" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-red-700">
            {kpis.municipios_en_riesgo}
          </span>
          <span className="text-[0.6875rem] text-red-500">municipios</span>
        </div>
        <div className="text-[0.625rem] text-red-600">
          IDF &lt; 60 pts
        </div>
        <div className="mt-2 flex items-center gap-1 text-[0.625rem] text-red-600">
          <span>{Math.round((kpis.municipios_en_riesgo / 125) * 100)}% del total</span>
        </div>
      </motion.div>

      {/* Poblacion Total */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl border border-border bg-paper p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.6875rem] font-medium text-gray-500 uppercase tracking-wide">
            Poblacion
          </span>
          <Users size={14} className="text-gray-400" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-ink">
            {formatPopulation(kpis.poblacion_total)}
          </span>
          <span className="text-[0.6875rem] text-gray-400">hab.</span>
        </div>
        <div className="text-[0.625rem] text-gray-500">
          {kpis.municipios_total} municipios
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[0.5625rem] text-gray-500">
          <div className="flex items-center gap-1">
            <GraduationCap size={10} />
            <span>{kpis.cobertura_educacion}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={10} />
            <span>{kpis.afiliacion_salud}%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
