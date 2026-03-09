"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, Zap } from "lucide-react";

const rows = [
  {
    task: "Reporte trimestral FUT",
    before: "2 semanas, 3 funcionarios, Excel + copiar/pegar entre sistemas",
    after: "15 minutos — consolidación automática desde datos ya integrados",
  },
  {
    task: "Consulta del estatuto tributario",
    before: "Buscar en PDF de 400+ páginas, interpretar manualmente cada artículo",
    after: "Pregunta en lenguaje natural, respuesta con citación de artículos",
  },
  {
    task: "Generación exógena DIAN",
    before: "3–4 días, XML armado a mano, alto riesgo de rechazo por formato",
    after: "30 minutos — validación cruzada automática contra base contable",
  },
  {
    task: "Seguimiento metas del PDM",
    before: "Semáforo manual en Excel, actualización mensual o trimestral",
    after: "Dashboard en tiempo real con alertas automáticas por meta",
  },
  {
    task: "Rendición SIRECI / SIA / FUT",
    before: "Días de consolidación manual, doble digitación, riesgo de multa",
    after: "Reportes pre-generados con datos ya capturados en el sistema",
  },
];

export default function Comparativa() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-4"
          >
            Antes vs. con Gobia
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif font-bold text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-ink mb-5"
          >
            El impacto en números reales
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[1.0625rem] leading-relaxed text-gray-500 max-w-2xl mx-auto"
          >
            Así cambia el día a día de un funcionario público cuando la
            tecnología trabaja a su favor.
          </motion.p>
        </div>

        {/* Table — desktop */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:block"
        >
          <div className="rounded-2xl border border-border bg-paper overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border">
              <div className="px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-gray-400">
                Proceso
              </div>
              <div className="px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-gray-400 border-l border-border flex items-center gap-2">
                <Clock size={14} className="text-gray-300" />
                Flujo tradicional
              </div>
              <div className="px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ochre border-l border-border flex items-center gap-2">
                <Zap size={14} className="text-ochre" />
                Con Gobia
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.task}
                className={`grid grid-cols-[1fr_1fr_1fr] ${i < rows.length - 1 ? "border-b border-border-light" : ""}`}
              >
                <div className="px-6 py-5 text-[0.9375rem] font-semibold text-ink">
                  {row.task}
                </div>
                <div className="px-6 py-5 text-[0.875rem] leading-relaxed text-gray-500 border-l border-border-light">
                  {row.before}
                </div>
                <div className="px-6 py-5 text-[0.875rem] leading-relaxed text-ink font-medium border-l border-border-light bg-ochre-soft/30">
                  {row.after}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cards — mobile */}
        <div className="md:hidden space-y-4">
          {rows.map((row, i) => (
            <motion.div
              key={row.task}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              className="card"
            >
              <h3 className="text-[0.9375rem] font-bold text-ink mb-3">
                {row.task}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-1 flex items-center gap-1.5">
                    <Clock size={12} />
                    Antes
                  </p>
                  <p className="text-[0.8125rem] leading-relaxed text-gray-500">
                    {row.before}
                  </p>
                </div>
                <div className="rounded-lg bg-ochre-soft/40 p-3">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ochre mb-1 flex items-center gap-1.5">
                    <Zap size={12} />
                    Con Gobia
                  </p>
                  <p className="text-[0.8125rem] leading-relaxed text-ink font-medium">
                    {row.after}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-[0.75rem] text-gray-400 mt-8 italic"
        >
          * Estimaciones basadas en análisis de eficiencia para entidades de categorías 4–6.
          Resultados reales dependen de la configuración y volumen de cada entidad.
        </motion.p>
      </div>
    </section>
  );
}
