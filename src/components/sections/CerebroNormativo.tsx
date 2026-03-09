"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import KnowledgeGraph from "@/components/illustrations/KnowledgeGraph";

const metrics = [
  { value: "540+", label: "artículos indexados" },
  { value: "1,200+", label: "conexiones normativas" },
  { value: "6", label: "libros del estatuto" },
];

export default function CerebroNormativo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-ink text-paper overflow-hidden"
    >
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,253,248,0.3) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1120px] px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-4"
          >
            Cerebro normativo
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] mb-5"
          >
            Toda la normativa,{" "}
            <em className="text-ochre not-italic">conectada</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[1.0625rem] leading-relaxed text-paper/50 max-w-2xl mx-auto"
          >
            Nuestro grafo de conocimiento mapea cada artículo del Estatuto
            Tributario Municipal y sus relaciones. Cuando consultas, la IA navega
            esta red para encontrar la respuesta más completa — con citación de
            fuentes.
          </motion.p>
        </div>

        {/* Example query */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-xl mx-auto mb-10"
        >
          <div className="rounded-xl border border-paper/10 bg-paper/5 p-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-paper/30 mb-2">
              Ejemplo de consulta
            </p>
            <p className="text-[0.9375rem] text-paper/70 italic mb-3">
              &ldquo;¿Cuál es la tarifa del impuesto predial para predios rurales con avalúo menor a 50 SMLMV?&rdquo;
            </p>
            <div className="flex items-start gap-2 pl-3 border-l-2 border-ochre/40">
              <p className="text-[0.8125rem] text-paper/50 leading-relaxed">
                <span className="text-ochre font-semibold">Art. 23, Libro I</span> — Tarifa diferencial del 5‰ para predios rurales con avalúo catastral inferior a 50 SMLMV, según Acuerdo Municipal 048 de 2023...
              </p>
            </div>
          </div>
        </motion.div>

        {/* Graph */}
        <KnowledgeGraph animate={isInView} />

        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-14 grid grid-cols-3 divide-x divide-paper/10 max-w-lg mx-auto"
        >
          {metrics.map((m) => (
            <div key={m.label} className="text-center px-4">
              <p className="text-[1.75rem] font-bold text-ochre mb-1">
                {m.value}
              </p>
              <p className="text-[0.75rem] text-paper/50 font-medium">
                {m.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Teaser CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-[0.8125rem] text-paper/30 mt-10 italic"
        >
          Próximamente: Explorador interactivo del grafo normativo completo
        </motion.p>
      </div>
    </section>
  );
}
