"use client";

import { motion } from "framer-motion";
import {
  GraduationCap, Heart, Users, Briefcase, Home,
  Shield, DollarSign, BarChart3, Factory,
} from "lucide-react";
import {
  educacionIndicators,
  saludIndicators,
  pobrezaIndicators,
  seguridadIndicators,
  mercadoLaboralIndicators,
  viviendaIndicators,
  valorAgregadoMunicipal,
  poblacionTotal,
} from "@/data/medellin-terridata";

interface DimensionCard {
  label: string;
  icon: typeof GraduationCap;
  color: string;
  bg: string;
  headline: string;
  value: string;
  sub: string;
}

const pop = poblacionTotal.series.find((p) => p.year === 2024)?.value ?? 2_623_607;

const cards: DimensionCard[] = [
  {
    label: "Educación",
    icon: GraduationCap,
    color: "text-blue-600",
    bg: "bg-blue-100",
    headline: "Cobertura neta",
    value: `${(educacionIndicators.find((e) => e.indicator.includes("Cobertura neta en educación"))?.series[0]?.value ?? 96.2).toFixed(1)}%`,
    sub: "Educación media",
  },
  {
    label: "Salud",
    icon: Heart,
    color: "text-rose-600",
    bg: "bg-rose-100",
    headline: "Mortalidad infantil",
    value: `${(saludIndicators.find((s) => s.indicator.includes("Tasa de mortalidad infantil"))?.series[0]?.value ?? 7.2).toFixed(1)}`,
    sub: "por 1.000 nacidos vivos",
  },
  {
    label: "Población",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-100",
    headline: "Habitantes",
    value: `${(pop / 1_000_000).toFixed(2)}M`,
    sub: "Proyección DANE 2024",
  },
  {
    label: "Pobreza",
    icon: DollarSign,
    color: "text-amber-600",
    bg: "bg-amber-100",
    headline: "IPM",
    value: `${(pobrezaIndicators.find((p) => p.indicator.includes("Índice de Pobreza Multidimensional"))?.series[0]?.value ?? 11.8).toFixed(1)}%`,
    sub: "Pobreza multidimensional",
  },
  {
    label: "Seguridad",
    icon: Shield,
    color: "text-red-600",
    bg: "bg-red-100",
    headline: "Tasa de homicidios",
    value: `${(seguridadIndicators.find((s) => s.indicator.includes("Tasa de homicidios"))?.series[0]?.value ?? 18.7).toFixed(1)}`,
    sub: "por 100.000 habitantes",
  },
  {
    label: "Empleo",
    icon: Briefcase,
    color: "text-teal-600",
    bg: "bg-teal-100",
    headline: "Tasa de desempleo",
    value: `${(mercadoLaboralIndicators.find((m) => m.indicator.includes("Tasa de desempleo"))?.series[0]?.value ?? 11.3).toFixed(1)}%`,
    sub: "DANE GEIH 2023",
  },
  {
    label: "Vivienda",
    icon: Home,
    color: "text-orange-600",
    bg: "bg-orange-100",
    headline: "Déficit cualitativo",
    value: `${(viviendaIndicators.find((v) => v.indicator.includes("cualitativo"))?.series[0]?.value ?? 3.8).toFixed(1)}%`,
    sub: "Censo DANE 2018",
  },
  {
    label: "Economía",
    icon: Factory,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    headline: "Valor agregado",
    value: `$${((valorAgregadoMunicipal[0]?.series[0]?.value ?? 72_000_000) / 1_000_000).toFixed(0)} MM`,
    sub: "Millones COP corrientes",
  },
];

export default function TerriDataRibbon() {
  return (
    <div className="bg-ink rounded-xl p-4 text-paper">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[0.8125rem] font-semibold flex items-center gap-1.5">
          <BarChart3 size={14} className="text-ochre" />
          Contexto territorial — TerriData DNP
        </h3>
        <span className="text-[0.625rem] text-gray-400">8 dimensiones · desliza →</span>
      </div>

      {/* Horizontal scroll with fade indicator */}
      <div className="relative">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="shrink-0 bg-paper/10 backdrop-blur-sm rounded-xl p-3 min-w-[140px] max-w-[160px] border border-gray-700/30 hover:border-ochre/40 hover:bg-paper/15 transition-colors duration-200 cursor-default"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`w-6 h-6 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={12} className={card.color} />
                </span>
                <span className="text-[0.75rem] font-semibold text-gray-200">{card.label}</span>
              </div>
              <div className="text-[0.625rem] text-gray-400 mb-0.5">{card.headline}</div>
              <div className="font-serif text-[1.125rem] text-ochre leading-none mb-0.5">{card.value}</div>
              <div className="text-[0.625rem] text-gray-500">{card.sub}</div>
            </motion.div>
          ))}
        </div>
        {/* Scroll fade */}
        <div className="absolute top-0 right-0 bottom-1 w-10 bg-gradient-to-l from-ink to-transparent pointer-events-none rounded-r-xl" />
      </div>
    </div>
  );
}
