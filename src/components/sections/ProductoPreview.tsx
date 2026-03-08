"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import DashboardMockupSVG from "@/components/illustrations/DashboardMockupSVG";

export default function ProductoPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-paper overflow-hidden">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-4"
          >
            El producto
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-ink mb-5"
          >
            Todo en un solo dashboard
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[1.0625rem] leading-relaxed text-gray-500 max-w-xl mx-auto"
          >
            Ejecución presupuestal, metas del PDM, alertas normativas y
            generación de reportes — accesibles desde una interfaz diseñada
            para el funcionario público.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 1, 0.5, 1] as const }}
        >
          <DashboardMockupSVG animate={isInView} />
        </motion.div>
      </div>
    </section>
  );
}
