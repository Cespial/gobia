"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import dynamic from "next/dynamic";

const FragmentedDataSVG = dynamic(() => import("@/components/illustrations/FragmentedDataSVG"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[680/490] rounded-2xl bg-gray-100 animate-pulse" />
  ),
});

const painMetrics = [
  {
    value: "2 sem.",
    label: "para preparar un reporte trimestral FUT",
    detail: "Consolidar datos de CHIP, Excel y SISFUT manualmente cada trimestre.",
  },
  {
    value: "4+",
    label: "sistemas sin conexión entre sí",
    detail: "Cada reporte requiere extraer datos de sistemas independientes que no se comunican.",
  },
  {
    value: "0",
    label: "alertas tempranas de gestión fiscal",
    detail: "Los problemas se detectan cuando ya generaron multas o sanciones.",
  },
];

export default function ProblemaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="problema" ref={ref} className="relative py-24 md:py-32 bg-paper">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-4"
        >
          El problema
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif font-bold text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-ink max-w-2xl mb-5"
        >
          Así luce hoy la gestión pública en Colombia
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-[1.0625rem] leading-relaxed text-gray-500 max-w-xl mb-16"
        >
          Un funcionario público debe navegar{" "}
          <span className="font-semibold text-ink">16+ fuentes de datos desconectadas</span>
          {" "}— cada una con su formato, su portal, su lógica. El resultado:
          semanas de trabajo manual, errores y cero visibilidad.
        </motion.p>

        {/* Star SVG: Fragmented data sources diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-14"
        >
          <FragmentedDataSVG animate={isInView} />
        </motion.div>

        {/* Pain metrics — visual counters */}
        <div className="grid gap-5 md:grid-cols-3">
          {painMetrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              className="relative rounded-xl border border-border bg-paper p-6 md:p-7"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: [0.25, 1, 0.5, 1] }}
                  className="font-serif font-bold text-[2rem] md:text-[2.5rem] leading-none tracking-[-0.02em] text-ochre"
                >
                  {metric.value}
                </motion.span>
                <span className="text-[0.8125rem] font-semibold text-ink leading-snug">
                  {metric.label}
                </span>
              </div>
              <p className="text-[0.8125rem] leading-relaxed text-gray-400">
                {metric.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-14 text-center space-y-5"
        >
          <p className="text-[1.125rem] text-gray-400 italic font-serif">
            &ldquo;No debería ser así. Y ya no tiene que serlo.&rdquo;
          </p>
          <a
            href="#solucion"
            className="inline-flex items-center gap-2 text-[0.875rem] font-semibold text-ochre hover:text-ink transition-colors duration-200"
          >
            Ver cómo lo resolvemos
            <ArrowDown size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
