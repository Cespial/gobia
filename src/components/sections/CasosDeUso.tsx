"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, TrendingUp, FileCheck, ArrowUpRight } from "lucide-react";

const cases = [
  {
    icon: MapPin,
    municipality: "Alcaldía municipal",
    category: "Categoría 6",
    title: "Hacienda unificada + seguimiento PDM",
    description:
      "Municipio de categoría 6 con equipo de hacienda de 3 personas. Antes gastaban 2 semanas por trimestre preparando reportes FUT y CHIP manualmente. Con Gobia, la información presupuestal se consolida automáticamente y el seguimiento al plan de desarrollo se actualiza en tiempo real.",
    results: [
      { metric: "80%", label: "menos tiempo en reportes trimestrales" },
      { metric: "100%", label: "metas del PDM con seguimiento activo" },
      { metric: "0", label: "multas por rendición tardía" },
    ],
    accent: "ochre",
  },
  {
    icon: TrendingUp,
    municipality: "Gobernación departamental",
    category: "32 municipios",
    title: "Vista consolidada de gestión territorial",
    description:
      "Gobernación que necesitaba visibilidad sobre el desempeño fiscal de sus 32 municipios. El gemelo municipal de Gobia integra datos de TerriData, SISFUT y SECOP para generar un ranking de gestión en tiempo real con alertas tempranas.",
    results: [
      { metric: "32", label: "municipios monitoreados en una vista" },
      { metric: "15", label: "alertas tempranas en el primer trimestre" },
      { metric: "3x", label: "más rápido el análisis de desempeño fiscal" },
    ],
    accent: "ochre",
  },
  {
    icon: FileCheck,
    municipality: "Secretaría de hacienda",
    category: "Ciudad intermedia",
    title: "Exógena y estatuto tributario con IA",
    description:
      "Ciudad intermedia con estatuto tributario de 400+ artículos. La secretaría de hacienda usa el módulo de IA para consultar normativa en lenguaje natural y genera los archivos XML de exógena con validación automática cruzada contra la base contable.",
    results: [
      { metric: "5 min", label: "para consultar cualquier artículo" },
      { metric: "98%", label: "precisión en generación de XML exógena" },
      { metric: "0", label: "rechazos por errores de formato en DIAN" },
    ],
    accent: "ochre",
  },
];

const accentStyles = {
  ochre: { bg: "bg-ochre-soft", text: "text-ochre", border: "border-ochre/15" },
};

export default function CasosDeUso() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="casos" ref={ref} className="relative py-24 md:py-32 bg-paper">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">
        <div className="text-center mb-16">
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

        <div className="space-y-6">
          {cases.map((caso, i) => {
            const styles = accentStyles[caso.accent as keyof typeof accentStyles];
            return (
              <motion.div
                key={caso.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                className="card p-0 overflow-hidden group"
              >
                <div className="grid md:grid-cols-[1fr_300px]">
                  <div className="p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${styles.bg} ${styles.text}`}>
                        <caso.icon size={20} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[0.9375rem] font-bold text-ink">{caso.municipality}</p>
                        <p className="text-[0.75rem] text-gray-400">{caso.category}</p>
                      </div>
                    </div>

                    <h3 className="text-[1.25rem] font-bold text-ink mb-3">{caso.title}</h3>
                    <p className="text-[0.9375rem] leading-relaxed text-gray-500 mb-6">{caso.description}</p>

                    <a href="#contacto" className={`inline-flex items-center gap-1 text-[0.8125rem] font-semibold ${styles.text} hover:underline`}>
                      Conocer más
                      <ArrowUpRight size={14} />
                    </a>
                  </div>

                  <div className={`${styles.bg} border-t md:border-t-0 md:border-l ${styles.border} p-8 md:p-10 flex flex-col justify-center`}>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-5">
                      Resultados proyectados
                    </p>
                    <div className="space-y-5">
                      {caso.results.map((result) => (
                        <div key={result.label}>
                          <p className={`text-[1.75rem] font-bold ${styles.text} mb-0.5`}>{result.metric}</p>
                          <p className="text-[0.8125rem] text-gray-500 leading-snug">{result.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
