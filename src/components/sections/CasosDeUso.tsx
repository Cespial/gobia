"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, TrendingUp, FileCheck, CheckCircle2 } from "lucide-react";

const cases = [
  {
    icon: MapPin,
    entity: "Alcaldía municipal",
    tag: "Categoría 6",
    title: "Hacienda unificada + seguimiento PDM",
    benefits: [
      "80% menos tiempo en reportes trimestrales",
      "100% metas del PDM con seguimiento activo",
      "0 multas por rendición tardía",
    ],
  },
  {
    icon: TrendingUp,
    entity: "Gobernación departamental",
    tag: "32 municipios",
    title: "Vista consolidada de gestión territorial",
    benefits: [
      "32 municipios monitoreados en una sola vista",
      "Alertas tempranas de desempeño fiscal",
      "3x más rápido el análisis departamental",
    ],
  },
  {
    icon: FileCheck,
    entity: "Secretaría de hacienda",
    tag: "Ciudad intermedia",
    title: "Exógena y estatuto tributario con IA",
    benefits: [
      "5 min para consultar cualquier artículo",
      "98% precisión en generación de XML exógena",
      "0 rechazos por errores de formato en DIAN",
    ],
  },
];

export default function CasosDeUso() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="casos" ref={ref} className="relative py-24 md:py-32 bg-paper">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-4"
          >
            Casos de uso
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-ink mb-5"
          >
            Diseñada para la realidad municipal
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[1.0625rem] leading-relaxed text-gray-500 max-w-2xl mx-auto"
          >
            Desde municipios de categoría 6 hasta gobernaciones departamentales,
            Gobia se adapta a la escala y necesidades de cada entidad.
          </motion.p>
        </div>

        {/* Compact case cards — 3 columns on desktop */}
        <div className="grid md:grid-cols-3 gap-4">
          {cases.map((caso, i) => (
            <motion.div
              key={caso.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-ochre-soft text-ochre">
                  <caso.icon size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[0.8125rem] font-bold text-ink leading-tight">{caso.entity}</p>
                  <p className="text-[0.6875rem] text-gray-400">{caso.tag}</p>
                </div>
              </div>

              <h3 className="text-[0.9375rem] font-bold text-ink mb-4">{caso.title}</h3>

              <ul className="space-y-2.5">
                {caso.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-ochre mt-0.5 shrink-0" />
                    <span className="text-[0.8125rem] leading-snug text-gray-500">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-[0.75rem] text-gray-400 mt-8 italic"
        >
          * Proyecciones basadas en análisis de procesos para entidades de características similares.
        </motion.p>
      </div>
    </section>
  );
}
