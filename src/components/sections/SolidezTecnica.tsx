"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Server, Lock, Zap, Globe } from "lucide-react";
import ArchitectureSVG from "@/components/illustrations/ArchitectureSVG";

const techStack = [
  "Next.js",
  "TypeScript",
  "PostgreSQL",
  "PostGIS",
  "pgvector",
  "Claude AI",
  "Tailwind CSS",
  "Vercel",
];

const guarantees = [
  { icon: Server, metric: "99.5%", label: "Uptime garantizado" },
  { icon: Lock, metric: "AES-256", label: "Cifrado end-to-end" },
  { icon: Zap, metric: "<3s", label: "Tiempo de respuesta" },
  { icon: Globe, metric: "WCAG AA", label: "Accesibilidad NTC 5854" },
];

export default function SolidezTecnica() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="tecnologia"
      ref={ref}
      className="relative pt-4 pb-16 md:py-32 bg-ink text-paper overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,253,248,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,253,248,.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Gradient fade: dark → light (bottom) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 md:h-28 z-[1] pointer-events-none"
        style={{ background: "linear-gradient(to bottom, var(--ink), var(--paper))" }}
      />

      <div className="relative z-10 mx-auto max-w-[1120px] px-5 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-4"
            >
              Solidez técnica
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif font-bold text-[1.75rem] md:text-[2.25rem] leading-[1.1] tracking-[-0.02em] mb-6"
            >
              Construida para la escala del{" "}
              <span className="text-ochre">sector público</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-[1.0625rem] leading-relaxed text-paper/60 mb-10"
            >
              Arquitectura multi-tenant con aislamiento por municipio. Cada
              entidad territorial opera en su propio espacio seguro, con datos
              que nunca se cruzan entre organizaciones.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-full bg-paper/[0.06] border border-paper/10 px-3.5 py-1.5 text-[0.75rem] font-medium text-paper/60 transition-colors duration-200 hover:bg-paper/[0.12] hover:text-paper/80"
                >
                  {tech}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <ArchitectureSVG animate={isInView} />
          </motion.div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-paper/[0.06]">
                <item.icon size={20} className="text-ochre" strokeWidth={1.5} />
              </div>
              <p className="text-[1.5rem] font-bold text-paper mb-1 tracking-tight">
                {item.metric}
              </p>
              <p className="text-[0.8125rem] font-semibold text-paper/70">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
