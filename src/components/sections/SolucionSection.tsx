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
  ArrowUpRight,
} from "lucide-react";
import PlatformHubDiagram from "@/components/illustrations/PlatformHubDiagram";
import HaciendaFeatureSVG from "@/components/illustrations/HaciendaFeatureSVG";
import PDMFeatureSVG from "@/components/illustrations/PDMFeatureSVG";
import EstatutoFeatureSVG from "@/components/illustrations/EstatutoFeatureSVG";
import ExogenaFeatureSVG from "@/components/illustrations/ExogenaFeatureSVG";
import GemeloFeatureSVG from "@/components/illustrations/GemeloFeatureSVG";
import RendicionFeatureSVG from "@/components/illustrations/RendicionFeatureSVG";

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
      "Ejecución presupuestal, recaudo, cartera e IDF en tiempo real. Todo en una vista unificada con datos de FUT, SISFUT y CHIP consolidados automáticamente.",
    status: "desarrollo" as Status,
    Illustration: HaciendaFeatureSVG,
    highlights: ["Ejecución presupuestal", "Recaudo por impuesto", "Scorecard IDF"],
  },
  {
    icon: Brain,
    title: "Estatuto Municipal IA",
    description:
      "Consulta tu estatuto tributario en lenguaje natural. IA que cita artículos específicos con referencias verificables, no que inventa respuestas.",
    status: "beta" as Status,
    Illustration: EstatutoFeatureSVG,
    highlights: ["Citación verificable", "540+ artículos indexados", "Búsqueda semántica"],
  },
  {
    icon: TrendingUp,
    title: "Seguimiento PDM",
    description:
      "Metas del plan de desarrollo con semáforo automático, alertas tempranas y reportes listos para rendir cuentas. Alineado con metodología DNP.",
    status: "desarrollo" as Status,
    Illustration: PDMFeatureSVG,
    highlights: ["Semáforo automático", "Alertas tempranas", "Reportes PDF"],
  },
  {
    icon: FileCheck,
    title: "Exógena Automatizada",
    description:
      "Genera los XML para DIAN en minutos, no en semanas. Validación cruzada de NIT, cruces contables y formato ISO 8859-1 antes de enviar.",
    status: "desarrollo" as Status,
    Illustration: ExogenaFeatureSVG,
    highlights: ["6 formatos DIAN", "Validación NIT", "0 rechazos MUISCA"],
  },
  {
    icon: MapPin,
    title: "Gemelo Municipal",
    description:
      "Mapa digital de tu municipio con datos sociales, fiscales e infraestructura integrados. Fuentes: DANE, TerriData, SECOP.",
    status: "proximamente" as Status,
    Illustration: GemeloFeatureSVG,
    highlights: ["Datos georreferenciados", "5 capas de datos", "1,122 municipios"],
  },
  {
    icon: Shield,
    title: "Rendición Automatizada",
    description:
      "SIRECI, SIA y FUT pre-generados con los datos que ya tienes. Cada archivo en el formato exacto que pide cada entidad — sin doble digitación.",
    status: "proximamente" as Status,
    Illustration: RendicionFeatureSVG,
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
          className="mb-20"
        >
          <PlatformHubDiagram animate={isInView} />
        </motion.div>

        {/* Feature showcase — alternating layout */}
        <div className="space-y-8 md:space-y-6">
          {features.map((feature, i) => {
            const isReversed = i % 2 === 1;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                className="card p-0 overflow-hidden"
              >
                <div className={`grid md:grid-cols-2 ${isReversed ? "" : ""}`}>
                  {/* SVG Illustration */}
                  <div className={`p-6 md:p-8 bg-paper/50 flex items-center justify-center ${isReversed ? "md:order-2" : ""}`}>
                    <div className="w-full max-w-[360px]">
                      <feature.Illustration animate={isInView} delay={0.3 + i * 0.1} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-6 md:p-8 lg:p-10 flex flex-col justify-center ${isReversed ? "md:order-1" : ""}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-ochre-soft text-sepia">
                        <feature.icon size={20} strokeWidth={1.5} />
                      </div>
                      <span className={`text-[0.625rem] font-semibold uppercase tracking-[0.06em] px-2.5 py-1 rounded-full border ${statusStyles[feature.status]}`}>
                        {statusLabels[feature.status]}
                      </span>
                    </div>

                    <h3 className="font-serif text-[1.375rem] md:text-[1.5rem] leading-[1.15] tracking-[-0.01em] text-ink mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-[0.9375rem] leading-relaxed text-gray-500 mb-5">
                      {feature.description}
                    </p>

                    {/* Highlight chips */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {feature.highlights.map((h) => (
                        <span
                          key={h}
                          className="inline-flex items-center px-2.5 py-1 rounded-md bg-ochre-soft text-[0.6875rem] font-medium text-sepia"
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    <a
                      href="#contacto"
                      className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-ochre hover:underline self-start"
                    >
                      Solicitar demo
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Compliance badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-14 flex justify-center"
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
