"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FileWarning, Clock, BarChart3 } from "lucide-react";

const painPoints = [
  {
    icon: FileWarning,
    title: "Reportes manuales, errores constantes",
    description:
      "CHIP, SIRECI, FUT, Exógena — cada sistema con su propio formato, sus propios plazos. El funcionario público pasa más tiempo llenando formularios que tomando decisiones.",
  },
  {
    icon: Clock,
    title: "Información desactualizada y fragmentada",
    description:
      "Los datos de hacienda no se cruzan con los del plan de desarrollo. Las alertas llegan cuando ya es tarde. No hay una vista unificada del municipio.",
  },
  {
    icon: BarChart3,
    title: "Decisiones sin respaldo de datos",
    description:
      "Se aprueba presupuesto sin saber el estado real de cartera. Se evalúan metas sin indicadores actualizados. La gestión se basa en intuición, no en evidencia.",
  },
];

export default function ProblemaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="problema"
      ref={ref}
      className="relative py-24 md:py-32 bg-white"
    >
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-teal">
            El problema
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-navy max-w-2xl mb-5"
        >
          Así luce hoy la gestión pública en Colombia
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-[1.0625rem] leading-relaxed text-gray-500 max-w-xl mb-16"
        >
          Cada entidad territorial enfrenta los mismos retos. Sistemas
          desconectados, normativa compleja y equipos que hacen lo mejor que
          pueden con herramientas del siglo pasado.
        </motion.p>

        {/* Pain points grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="card group"
            >
              <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-warm-50 text-navy transition-colors group-hover:bg-teal-soft group-hover:text-teal">
                <point.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-[1.0625rem] font-bold text-navy mb-3 leading-snug">
                {point.title}
              </h3>
              <p className="text-[0.9375rem] leading-relaxed text-gray-500">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Closing quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-[1.125rem] text-gray-400 italic font-serif">
            &ldquo;No debería ser así. Y ya no tiene que serlo.&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  );
}
