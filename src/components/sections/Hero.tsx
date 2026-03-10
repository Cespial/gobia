"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.25, 1, 0.5, 1] as const },
});

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex flex-col bg-background overflow-hidden">
      {/* ── Video background layer ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/hero/hero-data-viz-poster.jpg"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-auto mix-blend-multiply opacity-70"
        >
          <source src="/hero/hero-data-viz.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Top gradient: protects text zone ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[80%] z-[1] pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            #FAF6F0 0%,
            #FAF6F0 55%,
            rgba(250, 246, 240, 0.95) 65%,
            rgba(250, 246, 240, 0.7) 78%,
            rgba(250, 246, 240, 0.3) 90%,
            transparent 100%
          )`,
        }}
      />

      {/* ── Text content — upper zone ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-start mx-auto max-w-[1120px] w-full px-5 md:px-8 pt-28 md:pt-36">
        <div className="max-w-xl">
          {/* Eyebrow */}
          <motion.div {...fadeUp(0.1)} className="mb-5">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-ochre-soft border border-ochre/20 px-4 py-1.5 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-sepia">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ochre opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ochre" />
              </span>
              Plataforma GovTech
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.2)}
            className="font-serif font-bold text-[2.25rem] md:text-[3rem] lg:text-[3.75rem] leading-[1.08] tracking-[-0.025em] text-ink mb-5"
          >
            Gestión pública
            <br />
            <span className="text-ochre">inteligente</span> para
            <br />
            Colombia
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.35)}
            className="text-[1rem] md:text-[1.0625rem] leading-relaxed text-ink/70 max-w-md mb-8"
          >
            Conectamos hacienda, planeación y normativa en una sola
            plataforma. Para que alcaldías y gobernaciones tomen decisiones
            con datos, no con supuestos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.5)}
            className="flex flex-col sm:flex-row gap-3"
          >
            <a href="/demo" className="btn-primary">
              Ver demo Medellín
              <ArrowRight size={16} />
            </a>
            <a href="#contacto" className="btn-secondary">
              Solicitar demo
            </a>
          </motion.div>
        </div>
      </div>

      {/* ── Trust bar — bottom, above video ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-10 mt-auto border-t border-border/50 bg-background/80 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-[1120px] px-5 md:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-3 text-[0.8125rem]">
            <span className="uppercase tracking-[0.1em] font-semibold text-gray-400 text-[0.75rem]">
              Respaldado por
            </span>
            <div className="flex items-center gap-x-6 gap-y-2 flex-wrap justify-center">
              <a href="https://inplux.co" target="_blank" rel="noopener noreferrer" className="text-ink font-semibold hover:text-ochre transition-colors">inplux.co</a>
              <span className="w-px h-3 bg-border" aria-hidden="true" />
              <a href="https://tribai.co" target="_blank" rel="noopener noreferrer" className="text-ink font-semibold hover:text-ochre transition-colors">tribai.co</a>
              <span className="w-px h-3 bg-border" aria-hidden="true" />
              <a href="https://fourier.dev" target="_blank" rel="noopener noreferrer" className="text-ink font-semibold hover:text-ochre transition-colors">fourier.dev</a>
              <span className="w-px h-3 bg-border" aria-hidden="true" />
              <span className="text-ink font-semibold">25 años de experiencia</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
