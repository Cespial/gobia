"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Server, Lock, Zap, Globe } from "lucide-react";

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
  {
    icon: Server,
    metric: "99.5%",
    label: "Uptime garantizado",
  },
  {
    icon: Lock,
    metric: "AES-256",
    label: "Cifrado end-to-end",
  },
  {
    icon: Zap,
    metric: "<3s",
    label: "Tiempo de respuesta",
  },
  {
    icon: Globe,
    metric: "WCAG AA",
    label: "Accesibilidad NTC 5854",
  },
];

export default function SolidezTecnica() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="tecnologia"
      ref={ref}
      className="relative py-24 md:py-32 bg-navy text-white overflow-hidden"
    >
      {/* Background: grid pattern + blurred orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1120px] px-5 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Left column: text content + tech stack */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-teal-soft mb-4"
            >
              Solidez técnica
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] mb-6"
            >
              Construida para la escala del
              <span className="text-teal-soft italic"> sector público</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-[1.0625rem] leading-relaxed text-white/60 mb-10"
            >
              Arquitectura multi-tenant con aislamiento por municipio. Cada
              entidad territorial opera en su propio espacio seguro, con datos
              que nunca se cruzan entre organizaciones.
            </motion.p>

            {/* Tech stack chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-full bg-white/[0.08] border border-white/10 px-3.5 py-1.5 text-[0.75rem] font-medium text-white/70"
                >
                  {tech}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right column: architecture diagram */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
              <div className="space-y-4">
                {/* Presentation layer */}
                <div className="rounded-xl bg-white/[0.06] border border-white/10 p-4">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-teal-soft mb-3">
                    Capa de presentación
                  </p>
                  <div className="flex gap-2">
                    {["Dashboard", "IA Chat", "Mapas", "Reportes"].map(
                      (item) => (
                        <span
                          key={item}
                          className="flex-1 text-center rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 text-[0.6875rem] font-medium text-white/60"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-px h-6 bg-white/20" />
                </div>

                {/* API + IA Pipeline layer (teal tinted) */}
                <div className="rounded-xl bg-teal/10 border border-teal/20 p-4">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-teal-soft mb-3">
                    API + IA Pipeline
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "RAG",
                      "ETL",
                      "Auth",
                      "Multi-tenant",
                      "Alertas",
                      "XML Gen",
                    ].map((item) => (
                      <span
                        key={item}
                        className="text-center rounded-lg bg-white/[0.06] py-1.5 text-[0.625rem] font-medium text-white/50"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-px h-6 bg-white/20" />
                </div>

                {/* Data + Vectors layer */}
                <div className="rounded-xl bg-white/[0.06] border border-white/10 p-4">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-teal-soft mb-3">
                    Datos + Vectores
                  </p>
                  <div className="flex gap-2">
                    {["PostgreSQL", "PostGIS", "pgvector"].map((item) => (
                      <span
                        key={item}
                        className="flex-1 text-center rounded-lg bg-blue/10 border border-blue/20 py-2 text-[0.6875rem] font-medium text-white/60"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Guarantee metrics */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.08]">
                <item.icon
                  size={20}
                  className="text-teal-soft"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-[1.5rem] font-bold text-white mb-1 font-mono tracking-tight">
                {item.metric}
              </p>
              <p className="text-[0.8125rem] font-semibold text-white/80">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
