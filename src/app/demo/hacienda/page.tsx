"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, BarChart3 } from "lucide-react";
import GobiaLogo from "@/components/illustrations/GobiaLogo";

const DashboardSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-10 bg-cream rounded-lg w-2/3" />
    <div className="h-48 bg-cream rounded-xl" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-24 bg-cream rounded-xl" />
      <div className="h-24 bg-cream rounded-xl" />
    </div>
  </div>
);

const HaciendaDashboard = dynamic(() => import("@/components/dashboard/HaciendaDashboard"), {
  loading: () => <DashboardSkeleton />,
});
const FUTPanel = dynamic(() => import("@/components/dashboard/FUTPanel"), {
  loading: () => <DashboardSkeleton />,
});

export default function HaciendaPage() {
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
              Medellín — Hacienda
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
            <BarChart3 size={14} />
            Dashboard de Hacienda Pública
          </span>

          <h1 className="font-serif text-[2rem] md:text-[2.75rem] leading-[1.08] tracking-[-0.02em] text-ink mb-3">
            Hacienda Pública Municipal
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-gray-500 max-w-2xl">
            Visualización en tiempo real de la ejecución presupuestal, recaudo tributario,
            gastos por sector e indicadores de desempeño fiscal (IDF) del municipio de Medellín.
            Datos de la vigencia 2024.
          </p>
        </motion.div>

        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <HaciendaDashboard />
        </motion.div>

        {/* Live FUT Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <FUTPanel />
        </motion.div>
      </main>
    </div>
  );
}
