"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Map,
  Download,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import GobiaLogo from "@/components/illustrations/GobiaLogo";
import { useDepartmentData } from "@/hooks/useDepartmentData";
import { useAntioquiaMunicipalities } from "@/hooks/useAntioquiaMunicipalities";
import type { AntioquiaMunicipality } from "@/data/antioquia-municipalities";

// Dynamic imports for heavy components
const DepartmentKPIs = dynamic(
  () => import("@/components/dashboard/DepartmentKPIs"),
  { ssr: false }
);
const AlertSystem = dynamic(
  () => import("@/components/dashboard/AlertSystem"),
  { ssr: false }
);
const MunicipalityRanking = dynamic(
  () => import("@/components/dashboard/MunicipalityRanking"),
  { ssr: false }
);
const SubregionAnalysis = dynamic(
  () => import("@/components/dashboard/SubregionAnalysis"),
  { ssr: false }
);
const HistoricalTrends = dynamic(
  () => import("@/components/dashboard/HistoricalTrends"),
  { ssr: false }
);
const AntioquiaMap = dynamic(
  () => import("@/components/dashboard/AntioquiaMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-cream rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-[0.75rem] text-gray-400">
          Cargando mapa de Antioquia...
        </span>
      </div>
    ),
  }
);
const MunicipalityPanel = dynamic(
  () => import("@/components/dashboard/MunicipalityPanel"),
  { ssr: false }
);

export default function AntioquiaDashboardPage() {
  const { data, loading, error, refetch } = useDepartmentData();
  const { getMunicipality } = useAntioquiaMunicipalities({ fetchGeoJSON: false });

  const [selectedMunicipality, setSelectedMunicipality] =
    useState<AntioquiaMunicipality | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleMunicipalitySelect = useCallback(
    (municipality: AntioquiaMunicipality) => {
      setSelectedMunicipality(municipality);
      setIsPanelOpen(true);
    },
    []
  );

  const handleMunicipalityClick = useCallback(
    (codigoDane: string) => {
      const muni = getMunicipality(codigoDane);
      if (muni) {
        setSelectedMunicipality(muni);
        setIsPanelOpen(true);
      }
    },
    [getMunicipality]
  );

  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedMunicipality(null);
    setIsPanelOpen(false);
  }, []);

  const handleExportPDF = useCallback(async () => {
    // Simple export - in production would use html2canvas + jspdf
    window.print();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error cargando datos</p>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <button
            onClick={refetch}
            className="btn-primary px-4 py-2 rounded-lg text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-ink text-paper print:hidden">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between px-5 py-2.5 md:px-8">
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
          <div className="flex items-center gap-3">
            <button
              onClick={refetch}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Refrescar datos"
            >
              <RefreshCw size={16} className="text-gray-400" />
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ochre text-paper text-[0.75rem] font-medium hover:bg-ochre/90 transition-colors"
            >
              <Download size={14} />
              Exportar
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1400px] px-5 md:px-8 py-8 md:py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.75rem] text-gray-400 mb-4">
            <a href="/" className="hover:text-ink">
              gobia
            </a>
            <span>/</span>
            <a href="/demo" className="hover:text-ink">
              Demo
            </a>
            <span>/</span>
            <span className="text-ink font-medium">Antioquia</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-ochre-soft border border-ochre/20 px-4 py-1.5 text-[0.75rem] font-semibold text-ochre">
                  <Building2 size={14} />
                  Centro de Mando Digital
                </span>
              </div>
              <h1 className="font-serif text-[1.75rem] md:text-[2.5rem] leading-[1.08] tracking-[-0.02em] text-ink">
                Gobernacion de Antioquia
              </h1>
              <p className="text-[0.9375rem] leading-relaxed text-gray-500 mt-2 max-w-2xl">
                Monitoreo integral de los 125 municipios del departamento.
                Indicadores fiscales, sociales y de contratacion en tiempo real.
              </p>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-2">
              <a
                href="/demo/gemelo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[0.75rem] font-medium text-gray-500 hover:bg-cream hover:text-ink transition-colors"
              >
                <Map size={14} />
                Ver Mapa Interactivo
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-[0.8125rem] font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Tablero Ejecutivo
          </h2>
          <DepartmentKPIs kpis={data.kpis} />
        </motion.section>

        {/* Map + Alerts grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Map */}
          <div>
            <h2 className="text-[0.8125rem] font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Mapa Departamental
            </h2>
            <AntioquiaMap
              height="400px"
              onMunicipalitySelect={handleMunicipalitySelect}
              onDeselect={handleDeselect}
              selectedCode={selectedMunicipality?.codigo_dane}
            />
          </div>

          {/* Alerts */}
          <div>
            <h2 className="text-[0.8125rem] font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Alertas Activas
            </h2>
            <AlertSystem
              alerts={data.alerts}
              onAlertClick={handleMunicipalityClick}
              maxVisible={8}
            />
          </div>
        </motion.section>

        {/* Subregion Analysis */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-[0.8125rem] font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Analisis por Subregion
          </h2>
          <SubregionAnalysis subregiones={data.subregiones} />
        </motion.section>

        {/* Historical Trends */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-[0.8125rem] font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Tendencias Historicas (2019-2024)
          </h2>
          <HistoricalTrends tendencias={data.tendencias} />
        </motion.section>

        {/* Full Ranking */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-[0.8125rem] font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Ranking de 125 Municipios
          </h2>
          <MunicipalityRanking
            ranking={data.ranking}
            onMunicipalityClick={handleMunicipalityClick}
          />
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-border pt-6 mt-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[0.75rem] text-gray-400">
            <div>
              <p>
                Datos: DNP, DANE, TerriData, SECOP II, FUT | Ultima actualizacion:{" "}
                {new Date(data.timestamp).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="/demo" className="hover:text-ink">
                Volver a demos
              </a>
              <a href="/demo/gemelo" className="hover:text-ink">
                Gemelo Municipal
              </a>
              <a href="/demo/hacienda" className="hover:text-ink">
                Hacienda Dashboard
              </a>
            </div>
          </div>
        </motion.footer>
      </main>

      {/* Municipality Panel */}
      <MunicipalityPanel
        municipality={selectedMunicipality}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav skeleton */}
      <div className="sticky top-0 z-50 bg-ink h-12" />

      <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-8 md:py-12">
        {/* Hero skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-96 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-80 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* KPIs skeleton */}
        <div className="mb-8">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Map + Alerts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse" />
        </div>

        {/* Subregion skeleton */}
        <div className="mb-8">
          <div className="h-4 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
