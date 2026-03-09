"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  BarChart3,
  PieChart,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  Database,
  ClipboardList,
  FileCheck,
  X,
} from "lucide-react";
import GobiaLogo from "@/components/illustrations/GobiaLogo";
import { comunasData } from "@/data/comunas-data";
import SectionNav from "@/components/dashboard/SectionNav";
import FiscalPulseHero from "@/components/dashboard/FiscalPulseHero";

// Lazy-load below-fold and heavy components
const ExecutiveSummary = dynamic(() => import("@/components/dashboard/ExecutiveSummary"));
const RecaudoRadiografia = dynamic(() => import("@/components/dashboard/RecaudoRadiografia"));
const IDFDeepDive = dynamic(() => import("@/components/dashboard/IDFDeepDive"));
const AutonomiaFinanciera = dynamic(() => import("@/components/dashboard/AutonomiaFinanciera"));
const TerriDataRibbon = dynamic(() => import("@/components/dashboard/TerriDataRibbon"));
const UnifiedMap = dynamic(() => import("@/components/dashboard/UnifiedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-cream animate-pulse flex items-center justify-center">
      <span className="text-[0.75rem] text-gray-400">Cargando mapa...</span>
    </div>
  ),
});
const LiveDataPanel = dynamic(() => import("@/components/dashboard/LiveDataPanel"));
const EstatutoChat = dynamic(() => import("@/components/demo/EstatutoChat"));

import {
  poblacionTotal,
  inversionPorSectores,
} from "@/data/medellin-terridata";

import {
  gastosCategoria,
  ejecucionMensual,
  carteraMorosa,
} from "@/data/medellin-hacienda";

// ─── Computed values ──────────────────────────────────────────────────────────

const pop2024 = poblacionTotal.series.find((p) => p.year === 2024)?.value ?? 2_623_607;

const totalGastosEjecutados = gastosCategoria.reduce((s, g) => s + g.ejecutado, 0);

const topSectors = inversionPorSectores.slice(0, 5);
const maxSectorVal = topSectors[0]?.value ?? 1;

const latestMonth = ejecucionMensual[ejecucionMensual.length - 1];
const superavit = latestMonth.ingresosRecaudados - latestMonth.gastosEjecutados;

function formatCOP(millones: number): string {
  if (millones >= 1_000_000) return `$${(millones / 1_000_000).toFixed(1)}B`;
  if (millones >= 1_000) return `$${(millones / 1_000).toFixed(0)} MM`;
  return `$${millones.toFixed(0)} M`;
}

export default function DemoPage() {
  const [selectedComuna, setSelectedComuna] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const selectedComunaData = selectedComuna ? comunasData[selectedComuna] : null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ═══ Compact Header ═══ */}
      <nav className="flex-none bg-ink text-paper z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-paper transition-colors" title="Volver al inicio" aria-label="Volver al inicio">
              <ArrowLeft size={16} />
            </a>
            <GobiaLogo variant="navbar-dark" />
            <div className="flex items-center gap-2 ml-2">
              <div className="h-4 w-px bg-gray-700" />
              <MapPin size={12} className="text-ochre" />
              <span className="text-[0.8125rem] font-semibold">Medellín</span>
              <span className="hidden sm:inline text-[0.6875rem] text-gray-400">
                · {(pop2024 / 1_000_000).toFixed(2)}M habitantes
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              aria-label={chatOpen ? "Cerrar Estatuto IA" : "Abrir Estatuto IA"}
              aria-expanded={chatOpen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all ${
                chatOpen ? "bg-ochre text-paper" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <MessageSquare size={13} />
              <span className="hidden sm:inline">Estatuto IA</span>
            </button>
            <span className="hidden md:inline text-[0.625rem] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
              Centro de Mando Fiscal
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-label="Sistema activo" title="Conexión activa" />
          </div>
        </div>
      </nav>

      {/* ═══ Main Layout: Map + Panel ═══ */}
      <div className="flex-1 flex min-h-0 relative">

        {/* ── Left: Persistent Map ── */}
        <div className="hidden lg:block w-[55%] relative border-r border-border">
          <UnifiedMap
            selectedComuna={selectedComuna}
            onComunaSelect={setSelectedComuna}
            className="h-full"
          />
          {/* Map footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/80 to-transparent px-4 py-3">
            <div className="flex items-center justify-between text-paper">
              <div className="flex items-center gap-2 text-[0.625rem] text-gray-300">
                <Database size={11} className="text-ochre" />
                16 comunas · 349 barrios · GeoJSON
              </div>
              <div className="text-[0.6875rem] text-gray-400">
                Fuentes: TerriData · datos.gov.co · FUT · SECOP
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Scrollable Data Panel ── */}
        <div id="data-panel" className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-5 space-y-4">

            {/* Sticky section nav */}
            <SectionNav />

            {/* Mobile map (only visible < lg) */}
            <div className="lg:hidden rounded-xl border border-border overflow-hidden h-[300px]">
              <UnifiedMap
                selectedComuna={selectedComuna}
                onComunaSelect={setSelectedComuna}
                className="h-full"
              />
            </div>

            {/* ── Selected Comuna Banner ── */}
            {selectedComunaData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl bg-ink text-paper p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-ochre" />
                    <span className="text-[0.9375rem] font-semibold">{selectedComunaData.nombre}</span>
                    <span className="text-[0.6875rem] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">Comuna {selectedComuna}</span>
                  </div>
                  <button onClick={() => setSelectedComuna(null)} aria-label="Cerrar detalle de comuna" className="text-gray-400 hover:text-paper p-1">
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    { label: "Población", value: `${(selectedComunaData.poblacion / 1000).toFixed(0)}K` },
                    { label: "Predial", value: `$${(selectedComunaData.predial / 1000).toFixed(1)} MM` },
                    { label: "ICA", value: `$${(selectedComunaData.ica / 1000).toFixed(1)} MM` },
                    { label: "Estrato prom.", value: `~${selectedComunaData.estrato}` },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-[0.625rem] text-gray-400">{item.label}</div>
                      <div className="text-[0.9375rem] font-bold text-ochre">{item.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══ TIER 0: Executive Summary ═══ */}
            <div id="resumen">
              <ExecutiveSummary />
            </div>

            {/* ═══ TIER 1: Fiscal Pulse Hero ═══ */}
            <FiscalPulseHero />

            {/* ═══ TIER 2: Presupuesto y Recaudo ═══ */}
            <div id="presupuesto" className="flex items-center gap-2 pt-1 scroll-mt-12">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-gray-400">Presupuesto y Recaudo</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Ejecución presupuestal + Superávit */}
            <div className="bg-paper rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[0.8125rem] font-semibold text-ink flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-ochre" />
                  Ejecución presupuestal 2024
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[0.6875rem] font-bold px-2 py-0.5 rounded ${superavit > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {superavit > 0 ? "Superávit" : "Déficit"}: {formatCOP(Math.abs(superavit))}
                  </span>
                </div>
              </div>
              <div className="flex items-end gap-1 h-32">
                {ejecucionMensual.map((m, i) => {
                  const maxVal = ejecucionMensual[ejecucionMensual.length - 1].meta;
                  const hIngresos = (m.ingresosRecaudados / maxVal) * 100;
                  const hGastos = (m.gastosEjecutados / maxVal) * 100;
                  const hMeta = (m.meta / maxVal) * 100;
                  return (
                    <div key={m.mes} className="flex-1 flex flex-col items-center gap-0.5 group/bar cursor-default">
                      <div className="relative w-full flex items-end gap-px h-24">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${hIngresos}%` }}
                          transition={{ duration: 0.4, delay: i * 0.03 }}
                          className="flex-1 bg-ochre rounded-t-sm group-hover/bar:brightness-110 transition-all duration-150"
                          title={`Ingresos: ${formatCOP(m.ingresosRecaudados)}`}
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${hGastos}%` }}
                          transition={{ duration: 0.4, delay: i * 0.03 + 0.08 }}
                          className="flex-1 bg-ink/20 rounded-t-sm group-hover/bar:bg-ink/30 transition-all duration-150"
                          title={`Gastos: ${formatCOP(m.gastosEjecutados)}`}
                        />
                        <div
                          className="absolute left-0 right-0 border-t border-dashed border-ochre/40"
                          style={{ bottom: `${hMeta}%` }}
                        />
                      </div>
                      <span className="text-[0.6875rem] text-gray-400">{m.mes}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-[0.625rem] text-gray-400">
                  <span className="w-2.5 h-1.5 rounded-sm bg-ochre" /> Ingresos
                </span>
                <span className="flex items-center gap-1 text-[0.625rem] text-gray-400">
                  <span className="w-2.5 h-1.5 rounded-sm bg-ink/20" /> Gastos
                </span>
                <span className="flex items-center gap-1 text-[0.625rem] text-gray-400">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-ochre/60" style={{ width: 10 }} /> Meta
                </span>
              </div>
            </div>

            {/* Recaudo Radiografía */}
            <RecaudoRadiografia />

            {/* ═══ TIER 2: Estructura de Gasto ═══ */}
            <div id="gasto" className="flex items-center gap-2 pt-1 scroll-mt-12">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-gray-400">Gasto y Cartera</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Gastos donut */}
              <div className="bg-paper rounded-xl border border-border p-4">
                <h3 className="text-[0.8125rem] font-semibold text-ink mb-3 flex items-center gap-1.5">
                  <PieChart size={14} className="text-ochre" />
                  Estructura del gasto 2024
                </h3>
                <div className="flex gap-4">
                  <svg viewBox="0 0 200 200" className="w-28 h-28 shrink-0">
                    {(() => {
                      const total = totalGastosEjecutados;
                      let cumulative = 0;
                      return gastosCategoria.map((g) => {
                        const pctVal = g.ejecutado / total;
                        const startAngle = cumulative * 360;
                        cumulative += pctVal;
                        const endAngle = cumulative * 360;
                        const largeArc = pctVal > 0.5 ? 1 : 0;
                        const startRad = ((startAngle - 90) * Math.PI) / 180;
                        const endRad = ((endAngle - 90) * Math.PI) / 180;
                        const x1 = 100 + 80 * Math.cos(startRad);
                        const y1 = 100 + 80 * Math.sin(startRad);
                        const x2 = 100 + 80 * Math.cos(endRad);
                        const y2 = 100 + 80 * Math.sin(endRad);
                        const ix1 = 100 + 50 * Math.cos(endRad);
                        const iy1 = 100 + 50 * Math.sin(endRad);
                        const ix2 = 100 + 50 * Math.cos(startRad);
                        const iy2 = 100 + 50 * Math.sin(startRad);
                        return (
                          <path
                            key={g.categoria}
                            d={`M ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A 50 50 0 ${largeArc} 0 ${ix2} ${iy2} Z`}
                            fill={g.color}
                            opacity={0.85}
                          />
                        );
                      });
                    })()}
                    <text x="100" y="96" textAnchor="middle" fill="#2C2418" fontSize="12" fontWeight="700" fontFamily="'DM Serif Display', serif">
                      {formatCOP(totalGastosEjecutados)}
                    </text>
                    <text x="100" y="112" textAnchor="middle" fill="#9E9484" fontSize="7">
                      ejecutado
                    </text>
                  </svg>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {gastosCategoria.map((g) => {
                      const pct = ((g.ejecutado / g.presupuesto) * 100).toFixed(0);
                      return (
                        <div key={g.categoria} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: g.color }} />
                          <span className="flex-1 text-[0.75rem] text-ink truncate">{g.categoria}</span>
                          <span className="text-[0.6875rem] text-gray-400 shrink-0">{pct}%</span>
                          <span className="text-[0.6875rem] text-gray-400 shrink-0">{formatCOP(g.ejecutado)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cartera Morosa enhanced */}
              <div className="bg-paper rounded-xl border border-border p-4">
                <h3 className="text-[0.8125rem] font-semibold text-ink mb-3 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Cartera morosa
                </h3>

                {/* Alert banner for prescrita */}
                {carteraMorosa.prescrito > 30_000 && (
                  <div className="mb-3 rounded-lg bg-red-50 border-l-[3px] border-red-400 px-3 py-2">
                    <div className="text-[0.75rem] font-semibold text-red-700">
                      {formatCOP(carteraMorosa.prescrito)} en cartera prescrita
                    </div>
                    <div className="text-[0.625rem] text-red-600/80 leading-snug">
                      Deuda que no se puede cobrar por vencimiento legal (&gt;5 años). Requiere depuración contable para liberar reservas.
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "Total cartera", value: formatCOP(carteraMorosa.total), color: "text-ink", bg: "bg-cream", tooltip: "Deuda total de contribuyentes pendiente de cobro" },
                    { label: "Gestión cobro", value: `${carteraMorosa.gestionCobro}%`, color: "text-ochre", bg: "bg-cream", tooltip: "Porcentaje de cartera en proceso activo de cobro" },
                    { label: "Recuperado 2024", value: formatCOP(carteraMorosa.recuperado2024), color: "text-green-600", bg: "bg-green-50", tooltip: "Monto efectivamente recuperado de cartera morosa en 2024" },
                    { label: "Prescrito (pérdida)", value: formatCOP(carteraMorosa.prescrito), color: "text-red-500", bg: "bg-red-50", tooltip: "Cartera que ya no se puede cobrar por vencimiento legal" },
                  ].map((card, i) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.03, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                      className={`${card.bg} rounded-lg p-2.5 cursor-default transition-colors`}
                      title={card.tooltip}
                    >
                      <div className="text-[0.625rem] text-gray-400 mb-0.5">{card.label}</div>
                      <div className={`font-serif text-[1rem] ${card.color}`}>{card.value}</div>
                    </motion.div>
                  ))}
                </div>
                {/* Cartera composition bar */}
                <div>
                  <div className="text-[0.625rem] text-gray-400 mb-1">Composición por impuesto</div>
                  <div className="h-5 rounded-lg overflow-hidden flex">
                    <div className="bg-ochre h-full flex items-center justify-center hover:brightness-110 transition-all duration-200 cursor-default" style={{ width: `${(carteraMorosa.predial / carteraMorosa.total) * 100}%` }} title={`Predial: ${formatCOP(carteraMorosa.predial)}`}>
                      <span className="text-[0.5rem] font-bold text-white drop-shadow-sm">
                        {((carteraMorosa.predial / carteraMorosa.total) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="bg-[#5B7BA5] h-full flex items-center justify-center hover:brightness-110 transition-all duration-200 cursor-default" style={{ width: `${(carteraMorosa.ica / carteraMorosa.total) * 100}%` }} title={`ICA: ${formatCOP(carteraMorosa.ica)}`}>
                      <span className="text-[0.5rem] font-bold text-white drop-shadow-sm">
                        {((carteraMorosa.ica / carteraMorosa.total) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="bg-[#9E9484] h-full flex items-center justify-center hover:brightness-110 transition-all duration-200 cursor-default" style={{ width: `${(carteraMorosa.otros / carteraMorosa.total) * 100}%` }} title={`Otros: ${formatCOP(carteraMorosa.otros)}`}>
                      <span className="text-[0.5rem] font-bold text-white drop-shadow-sm">
                        {((carteraMorosa.otros / carteraMorosa.total) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[0.6875rem] text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-sm bg-ochre" /> Predial {formatCOP(carteraMorosa.predial)}
                    </span>
                    <span className="flex items-center gap-1 text-[0.6875rem] text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#5B7BA5]" /> ICA {formatCOP(carteraMorosa.ica)}
                    </span>
                    <span className="flex items-center gap-1 text-[0.6875rem] text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#9E9484]" /> Otros {formatCOP(carteraMorosa.otros)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ TIER 2: Desempeño Fiscal ═══ */}
            <div id="fiscal" className="flex items-center gap-2 pt-1 scroll-mt-12">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-gray-400">Desempeño Fiscal</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <IDFDeepDive />

            <AutonomiaFinanciera />

            {/* ═══ TIER 2: Inversión y Contexto ═══ */}
            <div id="inversion" className="flex items-center gap-2 pt-1 scroll-mt-12">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-gray-400">Inversión y Contexto</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="bg-paper rounded-xl border border-border p-4">
              <h3 className="text-[0.8125rem] font-semibold text-ink mb-3 flex items-center gap-1.5">
                <ClipboardList size={14} className="text-green-600" />
                Inversión por sector — TerriData 2020
              </h3>
              <div className="space-y-2">
                {topSectors.map((s) => (
                  <div key={s.sector} className="group/sector cursor-default hover:bg-cream/50 -mx-2 px-2 py-0.5 rounded-lg transition-colors duration-150">
                    <div className="flex justify-between text-[0.75rem] mb-0.5">
                      <span className="text-ink font-medium truncate max-w-[55%] group-hover/sector:text-ochre transition-colors duration-150">{s.sector}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.625rem] text-gray-400">{(s.percentage * 100).toFixed(0)}%</span>
                        <span className="text-[0.6875rem] text-gray-400">${(s.value / 1_000_000_000).toFixed(0)} MM</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.value / maxSectorVal) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-green-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TerriData Ribbon */}
            <TerriDataRibbon />

            {/* ═══ TIER 3: Datos en vivo ═══ */}
            <div id="datos-vivo" className="flex items-center gap-2 pt-1 scroll-mt-12">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-gray-400">Datos en vivo</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <LiveDataPanel />

            {/* ── Quick links to sub-pages ── */}
            <div className="flex items-center gap-2 pt-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-gray-400">Módulos</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Plan de Desarrollo", desc: "Metas PDM e indicadores ODS", href: "/demo/pdm", icon: ClipboardList, color: "text-green-600", bg: "bg-green-50" },
                { label: "Reportes", desc: "Rendición y exógena DIAN", href: "/demo/rendicion", icon: FileCheck, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Exógena DIAN", desc: "Formatos y validación tributaria", href: "/demo/exogena", icon: FileCheck, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Hacienda", desc: "Dashboard financiero completo", href: "/demo/hacienda", icon: BarChart3, color: "text-ochre", bg: "bg-ochre-soft" },
              ].map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  className="bg-paper rounded-xl border border-border p-3 flex items-center gap-3 hover:border-ochre/30 hover:bg-cream/50 transition-colors duration-200 group"
                >
                  <span className={`w-9 h-9 rounded-lg ${link.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <link.icon size={16} className={link.color} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.8125rem] font-semibold text-ink">{link.label}</div>
                    <div className="text-[0.6875rem] text-gray-400">{link.desc}</div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-ochre group-hover:translate-x-0.5 transition-all shrink-0" />
                </motion.a>
              ))}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-center py-4">
              <div className="inline-flex items-center gap-2 text-[0.625rem] text-gray-400">
                <Database size={11} className="text-ochre" />
                Acuerdo 093/2023 · TerriData DNP · datos.gov.co · FUT · SECOP
              </div>
            </div>
          </div>
        </div>

        {/* ── Estatuto Chat Slide-over ── */}
        {chatOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-[380px] max-w-full 2xl:relative 2xl:w-[380px] border-l border-border bg-paper flex flex-col overflow-hidden shrink-0 z-30 shadow-2xl 2xl:shadow-none"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-cream">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-ochre" />
                <span className="text-[0.8125rem] font-semibold text-ink">Estatuto Tributario IA</span>
              </div>
              <button onClick={() => setChatOpen(false)} aria-label="Cerrar chat" className="text-gray-400 hover:text-ink">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <EstatutoChat />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
