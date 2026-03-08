"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero">
      {/* Mesh overlay */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-2xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1120px] px-5 md:px-8 pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-teal-soft">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              Plataforma GovTech para Colombia
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-serif text-[2.75rem] md:text-[4rem] lg:text-[4.75rem] leading-[1.05] tracking-[-0.02em] text-white mb-6"
          >
            Gestión pública{" "}
            <span className="text-teal-soft italic">inteligente</span>
            <br />
            para Colombia
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-[1.125rem] md:text-[1.25rem] leading-relaxed text-white/70 max-w-xl mb-10"
          >
            Conectamos hacienda, planeación y normativa en una sola plataforma.
            Para que alcaldías y gobernaciones tomen decisiones con datos, no con
            supuestos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-navy px-7 py-3.5 text-[0.9375rem] font-semibold transition-all duration-200 hover:bg-blue-soft hover:shadow-lg hover:-translate-y-0.5 min-h-[48px]"
            >
              Solicitar demo
              <ArrowRight size={16} />
            </a>
            <a
              href="#casos"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white px-7 py-3.5 text-[0.9375rem] font-semibold transition-all duration-200 hover:bg-white/10 hover:border-white/30 min-h-[48px]"
            >
              <Play size={16} />
              Ver casos de uso
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.75rem] text-white/40"
          >
            <span className="uppercase tracking-[0.12em] font-medium">
              Respaldado por
            </span>
            <span className="text-white/50 font-medium">inplux.co</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-white/50 font-medium">tribai.co</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-white/50 font-medium">25 años de experiencia</span>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
