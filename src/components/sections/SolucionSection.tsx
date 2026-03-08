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
import RAGPipelineDiagram from "@/components/illustrations/RAGPipelineDiagram";

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

const features: {
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
  status: Status;
}[] = [
  {
    icon: LayoutDashboard,
    title: "Hacienda Dashboard",
    description:
      "Ejecución presupuestal, recaudo, cartera e IDF en tiempo real. Todo en una vista unificada.",
    status: "desarrollo",
  },
  {
    icon: TrendingUp,
    title: "Seguimiento PDM",
    description:
      "Metas del plan de desarrollo con semáforo automático, alertas tempranas y reportes listos para rendir cuentas.",
    status: "desarrollo",
  },
  {
    icon: Brain,
    title: "Estatuto Municipal IA",
    description:
      "Consulta tu estatuto tributario en lenguaje natural. IA que cita artículos, no que inventa respuestas.",
    status: "beta",
  },
  {
    icon: FileCheck,
    title: "Exógena Automatizada",
    description:
      "Genera los XML para DIAN en minutos, no en semanas. Validación cruzada antes de enviar.",
    status: "desarrollo",
  },
  {
    icon: MapPin,
    title: "Gemelo Municipal",
    description:
      "Mapa digital de tu municipio con datos sociales, fiscales e infraestructura integrados.",
    status: "proximamente",
  },
  {
    icon: Shield,
    title: "Rendición Automatizada",
    description:
      "SIRECI, SIA y FUT pre-generados con los datos que ya tienes. Sin doble digitación.",
    status: "proximamente",
  },
];

export default function SolucionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="solucion" ref={ref} className="relative py-24 md:py-32 bg-background">
      <div className="relative z-10 mx-auto max-w-[1120px] px-5 md:px-8">
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

        {/* Hub diagram: 6 modules connected */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <PlatformHubDiagram animate={isInView} />
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              className="card group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-ochre-soft text-sepia transition-all group-hover:bg-ochre group-hover:text-paper">
                  <feature.icon size={22} strokeWidth={1.5} />
                </div>
                <span className={`text-[0.625rem] font-semibold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full border ${statusStyles[feature.status]}`}>
                  {statusLabels[feature.status]}
                </span>
              </div>
              <h3 className="text-[1rem] font-bold text-ink mb-2">
                {feature.title}
              </h3>
              <p className="text-[0.875rem] leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* RAG Pipeline: how the AI module works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 mb-4"
        >
          <p className="text-center text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-6">
            Así funciona el módulo de IA
          </p>
          <RAGPipelineDiagram animate={isInView} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
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
