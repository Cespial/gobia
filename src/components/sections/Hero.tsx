"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.25, 1, 0.5, 1] as const },
});

const fadeIn = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, delay },
});

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero">
      {/* Blurred orbs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[15%] left-[15%] w-[420px] h-[420px] rounded-full bg-teal/[0.07] blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[360px] h-[360px] rounded-full bg-blue/[0.08] blur-[100px]" />
        <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[80px]" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-[1120px] px-5 md:px-8 pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="max-w-3xl">
          {/* Eyebrow badge */}
          <motion.div {...fadeUp(0.1)} className="mb-6">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] px-4 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-teal-soft">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
              </span>
              Plataforma GovTech para Colombia
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.2)}
            className="font-serif text-[2.75rem] md:text-[4rem] lg:text-[4.75rem] leading-[1.05] tracking-[-0.02em] text-white mb-6"
          >
            Gestión pública{" "}
            <em className="text-teal-soft italic not-italic font-serif" style={{ fontStyle: "italic" }}>
              inteligente
            </em>
            <br />
            para Colombia
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.35)}
            className="text-[1.125rem] md:text-[1.25rem] leading-relaxed text-white/70 max-w-xl mb-10"
          >
            Conectamos hacienda, planeación y normativa en una sola plataforma.
            Para que alcaldías y gobernaciones tomen decisiones con datos, no con
            supuestos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.5)}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-navy px-7 py-3.5 text-[0.9375rem] font-semibold transition-all duration-200 hover:bg-blue-soft hover:shadow-lg hover:-translate-y-0.5 min-h-[48px]"
            >
              Solicitar demo
              <ArrowRight size={16} strokeWidth={2.5} />
            </a>
            <a
              href="#casos"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white px-7 py-3.5 text-[0.9375rem] font-semibold transition-all duration-200 hover:bg-white/10 hover:border-white/30 min-h-[48px]"
            >
              <Play size={16} strokeWidth={2.5} />
              Ver casos de uso
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            {...fadeIn(0.8)}
            className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.75rem] text-white/40"
          >
            <span className="uppercase tracking-[0.12em] font-medium">
              Respaldado por
            </span>
            <span className="text-white/55 font-medium">inplux.co</span>
            <span className="w-px h-3 bg-white/20" aria-hidden="true" />
            <span className="text-white/55 font-medium">tribai.co</span>
            <span className="w-px h-3 bg-white/20" aria-hidden="true" />
            <span className="text-white/55 font-medium">
              25 años de experiencia
            </span>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.8) 40%, rgba(255,255,255,0) 100%)",
        }}
      />
    </section>
  );
}
