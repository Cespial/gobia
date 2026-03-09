"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, BarChart3, FileCheck, ClipboardList, Megaphone, MapPin, Brain } from "lucide-react";

const modules = [
  { icon: BarChart3, label: "Hacienda", href: "/demo" },
  { icon: ClipboardList, label: "PDM", href: "/demo/pdm" },
  { icon: Brain, label: "Estatuto IA", href: "/demo/estatuto" },
  { icon: FileCheck, label: "Exógena", href: "/demo/exogena" },
  { icon: Megaphone, label: "Rendición", href: "/demo/rendicion" },
  { icon: MapPin, label: "Gemelo", href: "/demo/gemelo" },
];

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
            className="font-serif font-bold text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-ink mb-5"
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

        {/* Browser-frame demo preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 1, 0.5, 1] as const }}
          className="relative"
        >
          {/* Browser chrome */}
          <div className="rounded-t-xl bg-ink px-4 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            </div>
            <div className="flex-1 mx-8">
              <div className="bg-white/10 rounded-md px-3 py-1 text-[0.6875rem] text-white/50 text-center">
                gobia.co/demo
              </div>
            </div>
          </div>

          {/* Module grid inside browser frame */}
          <div className="rounded-b-xl border border-t-0 border-border bg-background p-6 md:p-8">
            <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-sepia mb-5 text-center">
              Explora cada módulo con datos reales de Medellín
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {modules.map((mod, i) => (
                <motion.a
                  key={mod.label}
                  href={mod.href}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.06 }}
                  className="flex items-center gap-2.5 p-3.5 rounded-xl bg-paper border border-border hover:border-ochre/40 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-ochre-soft text-sepia group-hover:text-ochre transition-colors">
                    <mod.icon size={16} strokeWidth={1.5} />
                  </div>
                  <span className="text-[0.8125rem] font-semibold text-ink">{mod.label}</span>
                </motion.a>
              ))}
            </div>

            <div className="flex justify-center">
              <a
                href="/demo"
                className="btn-primary"
              >
                Ver demo completo — Medellín
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
