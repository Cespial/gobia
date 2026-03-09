"use client";

import { motion } from "framer-motion";
import { Building2, Users, TrendingUp, MapPin, Scale, FileText } from "lucide-react";
import { estatutoMeta, tributosDistritales, estatutoStructure, tarifasICA } from "@/data/medellin-estatuto";

const stats = [
  {
    icon: Building2,
    value: "Medellín",
    label: "Distrito Especial de CTeI",
    detail: `DANE ${estatutoMeta.codDane}`,
  },
  {
    icon: FileText,
    value: `${estatutoStructure.reduce((s, t) => s + (t.capitulos ?? []).reduce((a, c) => a + c.articulos.length, 0), 0)}+`,
    label: "Artículos indexados",
    detail: estatutoMeta.acuerdo,
  },
  {
    icon: Scale,
    value: `${tributosDistritales.length}`,
    label: "Tributos distritales",
    detail: "Art. 7 del Estatuto",
  },
  {
    icon: TrendingUp,
    value: `${tarifasICA.length * 8}+`,
    label: "Códigos CIIU con tarifa",
    detail: "Industrial · Comercial · Servicios",
  },
  {
    icon: Users,
    value: "2.6M",
    label: "Habitantes",
    detail: "Segunda ciudad de Colombia",
  },
  {
    icon: MapPin,
    value: "83.6",
    label: "MDM Score (2020)",
    detail: "Medición de Desempeño Municipal",
  },
];

export default function MedellinStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="card p-4 md:p-5"
        >
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-ochre-soft text-ochre mb-3">
            <stat.icon size={18} strokeWidth={1.5} />
          </div>
          <div className="font-serif text-[1.5rem] md:text-[1.75rem] leading-none tracking-[-0.02em] text-ink mb-1">
            {stat.value}
          </div>
          <div className="text-[0.8125rem] font-semibold text-ink mb-0.5">
            {stat.label}
          </div>
          <div className="text-[0.6875rem] text-gray-400">
            {stat.detail}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
