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
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8 pt-28 pb-10 md:pt-36 md:pb-16">
        {/* Split layout: text left, video right */}
        <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[55%_45%] gap-8 md:gap-12 items-center">
          {/* Left — Text */}
          <div>
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
              className="text-[1rem] md:text-[1.0625rem] leading-relaxed text-gray-500 max-w-md mb-8"
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

          {/* Right — Video visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="relative"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/hero/hero-data-viz-poster.jpg"
              className="w-full h-auto"
            >
              <source src="/hero/hero-data-viz.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </div>

        {/* Trust bar — full width, clean */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 md:mt-16 pt-6 border-t border-border/50"
        >
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
        </motion.div>
      </div>
    </section>
  );
}
