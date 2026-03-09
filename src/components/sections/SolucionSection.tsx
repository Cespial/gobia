"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  LayoutDashboard,
  Brain,
  FileCheck,
  MapPin,
  TrendingUp,
  Shield,
} from "lucide-react";
import PlatformHubDiagram from "@/components/illustrations/PlatformHubDiagram";

const statusStyles = {
  beta: "bg-ochre/10 text-ochre border-ochre/20",
  desarrollo: "bg-cream text-sepia border-border",
  proximamente: "bg-gray-100 text-gray-400 border-gray-200",
} as const;

type Status = keyof typeof statusStyles;

const statusLabels: Record<Status, string> = {
  beta: "Beta activa",
  desarrollo: "En desarrollo",
  proximamente: "Próximamente",
};

const features = [
  {
    icon: LayoutDashboard,
    title: "Hacienda Dashboard",
    description:
      "Ejecución presupuestal, recaudo, cartera e IDF consolidados automáticamente.",
    status: "desarrollo" as Status,
    highlights: ["Ejecución presupuestal", "Recaudo", "Scorecard IDF"],
  },
  {
    icon: Brain,
    title: "Estatuto Municipal IA",
    description:
      "Consulta tu estatuto tributario en lenguaje natural con citación verificable.",
    status: "beta" as Status,
    highlights: ["540+ artículos", "Citación verificable", "Búsqueda semántica"],
  },
  {
    icon: TrendingUp,
    title: "Seguimiento PDM",
    description:
      "Metas del plan de desarrollo con semáforo automático y alertas tempranas.",
    status: "desarrollo" as Status,
    highlights: ["Semáforo automático", "Alertas", "Reportes PDF"],
  },
  {
    icon: FileCheck,
    title: "Exógena Automatizada",
    description:
      "Genera XML para DIAN en minutos con validación cruzada de NIT y cruces contables.",
    status: "desarrollo" as Status,
    highlights: ["6 formatos DIAN", "Validación NIT", "0 rechazos"],
  },
  {
    icon: MapPin,
    title: "Gemelo Municipal",
    description:
      "Mapa digital con datos sociales, fiscales e infraestructura de DANE y TerriData.",
    status: "proximamente" as Status,
    highlights: ["Georreferenciado", "5 capas", "1,122 municipios"],
  },
  {
    icon: Shield,
    title: "Rendición Automatizada",
    description:
      "SIRECI, SIA y FUT pre-generados en el formato exacto de cada entidad.",
    status: "proximamente" as Status,
    highlights: ["SIRECI · SIA · FUT", "Calendario fiscal", "Sin doble digitación"],
  },
];

export default function SolucionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="solucion" ref={ref} className="relative py-24 md:py-32 bg-background">
      <div className="relative z-10 mx-auto max-w-[1120px] px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-4"
          >
            La solución
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-ink mb-5"
          >
            Una plataforma, toda la gestión
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[1.0625rem] leading-relaxed text-gray-500 max-w-2xl mx-auto"
          >
            Gobia conecta los datos que hoy están dispersos en decenas de
            sistemas. Hacienda, planeación y normativa tributaria convergen en un
            solo lugar.
          </motion.p>
        </div>

        {/* Hub diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <PlatformHubDiagram animate={isInView} />
        </motion.div>

        {/* Compact feature grid — 2x3 on desktop, 1 col on mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
              className="card p-5 md:p-6 flex flex-col"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-ochre-soft text-sepia">
                  <feature.icon size={16} strokeWidth={1.5} />
                </div>
                <span className={`text-[0.5625rem] font-semibold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full border ${statusStyles[feature.status]}`}>
                  {statusLabels[feature.status]}
                </span>
              </div>

              <h3 className="text-[1rem] font-bold text-ink mb-1.5">
                {feature.title}
              </h3>

              <p className="text-[0.8125rem] leading-relaxed text-gray-500 mb-4 flex-1">
                {feature.description}
              </p>

              {/* Highlight chips */}
              <div className="flex flex-wrap gap-1.5">
                {feature.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-ochre-soft text-[0.625rem] font-medium text-sepia"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Compliance badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 rounded-full bg-paper border border-border px-6 py-3 shadow-sm">
            <Shield size={18} className="text-ochre" />
            <span className="text-[0.8125rem] font-semibold text-ink">
              Compatible con normativa colombiana vigente
            </span>
            <span className="text-[0.6875rem] text-gray-400 font-medium">
              Res. 111/2025 &middot; Ley 962/2005
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
