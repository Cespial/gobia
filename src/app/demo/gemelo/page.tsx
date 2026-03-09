"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Globe } from "lucide-react";
import GobiaLogo from "@/components/illustrations/GobiaLogo";

const SECOPPanel = dynamic(() => import("@/components/dashboard/SECOPPanel"));
const GemeloMap = dynamic(() => import("@/components/dashboard/GemeloMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-cream rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-[0.75rem] text-gray-400">Cargando mapa...</span>
    </div>
  ),
});

export default function GemeloPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-ink text-paper">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between px-5 py-2.5 md:px-8">
          <div className="flex items-center gap-3">
            <a
              href="/demo"
              aria-label="Volver al demo principal"
              className="inline-flex items-center gap-1.5 text-[0.8125rem] text-gray-400 hover:text-paper transition-colors duration-200"
            >
              <ArrowLeft size={16} />
              Demo
            </a>
            <div className="h-4 w-px bg-gray-700" />
            <GobiaLogo variant="navbar-dark" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ochre-soft border border-ochre/20 px-3 py-1 text-[0.6875rem] font-semibold text-ochre">
              <MapPin size={12} />
              Medellín — Gemelo Municipal
            </span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1200px] px-5 md:px-8 py-10 md:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-ochre-soft border border-ochre/20 px-4 py-1.5 text-[0.75rem] font-semibold text-ochre mb-4">
            <Globe size={14} />
            Gemelo Digital Municipal
          </span>

          <h1 className="font-serif text-[2rem] md:text-[2.75rem] leading-[1.08] tracking-[-0.02em] text-ink mb-3">
            Gemelo Municipal
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-gray-500 max-w-2xl">
            Mapa interactivo con capas de datos fiscales, poblacionales y socioeconómicos
            de las 16 comunas de Medellín. Selecciona una capa para explorar la distribución
            territorial de los indicadores.
          </p>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <GemeloMap />
        </motion.div>

        {/* SECOP Live */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SECOPPanel />
        </motion.div>
      </main>
    </div>
  );
}
