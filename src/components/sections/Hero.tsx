"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.25, 1, 0.5, 1] as const },
});

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background">
      {/* Video background — anchored to bottom */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero/hero-poster.jpg"
          className="absolute bottom-0 left-0 w-full h-auto min-h-full object-cover object-bottom"
        >
          <source src="/hero/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Top fade: cream overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to bottom,
              rgba(250, 246, 240, 0.98) 0%,
              rgba(250, 246, 240, 0.96) 30%,
              rgba(250, 246, 240, 0.90) 50%,
              rgba(250, 246, 240, 0.60) 70%,
              rgba(250, 246, 240, 0.20) 85%,
              rgba(250, 246, 240, 0) 100%
            )`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1120px] px-5 md:px-8 pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <motion.div {...fadeUp(0.1)} className="mb-6">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-ochre-soft border border-ochre/20 px-4 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-sepia">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ochre opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ochre" />
              </span>
              Plataforma GovTech para Colombia
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.2)}
            className="font-serif text-[2.5rem] md:text-[3.5rem] lg:text-[4.25rem] leading-[1.08] tracking-[-0.02em] text-ink mb-6"
          >
            Gestión pública{" "}
            <em className="text-ochre not-italic font-serif">inteligente</em>
            <br />
            para Colombia
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.35)}
            className="text-[1.0625rem] md:text-[1.1875rem] leading-relaxed text-gray-600 max-w-lg mb-10"
          >
            Conectamos hacienda, planeación y normativa en una sola plataforma.
            Para que alcaldías y gobernaciones tomen decisiones con datos, no con
            supuestos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.5)}
            className="flex flex-col sm:flex-row gap-3"
          >
            <a href="#contacto" className="btn-primary">
              Solicitar demo
              <ArrowRight size={16} />
            </a>
            <a href="#solucion" className="btn-secondary">
              <Play size={16} />
              Explorar la plataforma
            </a>
          </motion.div>

          {/* Trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.75rem] text-gray-400"
          >
            <span className="uppercase tracking-[0.1em] font-medium">
              Respaldado por
            </span>
            <span className="text-sepia font-medium">inplux.co</span>
            <span className="w-px h-3 bg-border" aria-hidden="true" />
            <span className="text-sepia font-medium">tribai.co</span>
            <span className="w-px h-3 bg-border" aria-hidden="true" />
            <span className="text-sepia font-medium">25 años de experiencia</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
