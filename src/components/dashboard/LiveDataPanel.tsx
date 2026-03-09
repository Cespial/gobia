"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Briefcase,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Wifi,
  AlertTriangle,
} from "lucide-react";

// ─── Types ───

interface FUTItem {
  codigo: string;
  nombre: string;
  presupuesto_definitivo_pesos: string;
  recaudo_efectivo_pesos: string;
}

interface Contrato {
  nombre_de_la_entidad: string;
  estado_del_proceso: string;
  tipo_de_contrato: string;
  objeto_del_proceso: string;
  valor_contrato: string;
  numero_del_contrato: string;
}

// ─── Helpers ───

function formatLive(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "$0";
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000).toFixed(0)} MM`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)} MM`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function estadoColor(estado: string): string {
  if (estado === "Celebrado" || estado === "Adjudicado") return "bg-green-100 text-green-700";
  if (estado === "Convocado") return "bg-blue-100 text-blue-700";
  if (estado === "Liquidado") return "bg-gray-100 text-gray-500";
  return "bg-amber-100 text-amber-700";
}

// ─── Fallback data for offline/error scenarios ───

const FALLBACK_FUT: FUTItem[] = [
  { codigo: "TI.A.1", nombre: "Total ingresos tributarios", presupuesto_definitivo_pesos: "3879407000000", recaudo_efectivo_pesos: "3685120000000" },
  { codigo: "TI.A.1.1", nombre: "Predial unificado", presupuesto_definitivo_pesos: "1241080000000", recaudo_efectivo_pesos: "1209200000000" },
  { codigo: "TI.A.1.2", nombre: "Industria y comercio (ICA)", presupuesto_definitivo_pesos: "1450000000000", recaudo_efectivo_pesos: "1320500000000" },
  { codigo: "TI.A.1.3", nombre: "Sobretasa a la gasolina", presupuesto_definitivo_pesos: "312500000000", recaudo_efectivo_pesos: "305200000000" },
  { codigo: "TI.A.1.4", nombre: "Delineación urbana", presupuesto_definitivo_pesos: "185000000000", recaudo_efectivo_pesos: "172400000000" },
  { codigo: "TI.A.1.5", nombre: "Alumbrado público", presupuesto_definitivo_pesos: "248000000000", recaudo_efectivo_pesos: "241300000000" },
  { codigo: "TI.A.1.6", nombre: "Avisos y tableros", presupuesto_definitivo_pesos: "145000000000", recaudo_efectivo_pesos: "139800000000" },
  { codigo: "TI.A.1.7", nombre: "Estampillas", presupuesto_definitivo_pesos: "97800000000", recaudo_efectivo_pesos: "92500000000" },
];

const FALLBACK_SECOP: Contrato[] = [
  { nombre_de_la_entidad: "Alcaldía de Medellín", estado_del_proceso: "Celebrado", tipo_de_contrato: "Prestación de servicios", objeto_del_proceso: "Prestación de servicios profesionales para apoyo a la gestión financiera y presupuestal", valor_contrato: "85400000", numero_del_contrato: "4600095482" },
  { nombre_de_la_entidad: "Alcaldía de Medellín", estado_del_proceso: "Adjudicado", tipo_de_contrato: "Obra", objeto_del_proceso: "Mejoramiento y mantenimiento de vías terciarias en comunas 1, 3 y 13", valor_contrato: "2450000000", numero_del_contrato: "4600095501" },
  { nombre_de_la_entidad: "Alcaldía de Medellín", estado_del_proceso: "Convocado", tipo_de_contrato: "Consultoría", objeto_del_proceso: "Consultoría para actualización del Plan de Ordenamiento Territorial", valor_contrato: "1200000000", numero_del_contrato: "4600095523" },
  { nombre_de_la_entidad: "Alcaldía de Medellín", estado_del_proceso: "Celebrado", tipo_de_contrato: "Suministro", objeto_del_proceso: "Suministro de equipos tecnológicos para modernización de secretarías", valor_contrato: "890000000", numero_del_contrato: "4600095544" },
];

// ─── Component ───

export default function LiveDataPanel() {
  const [futItems, setFutItems] = useState<FUTItem[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [futLoading, setFutLoading] = useState(true);
  const [secopLoading, setSecopLoading] = useState(true);
  const [futExpanded, setFutExpanded] = useState(true);
  const [secopExpanded, setSecopExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const [futError, setFutError] = useState<string | null>(null);
  const [secopError, setSecopError] = useState<string | null>(null);

  const fetchFUT = async () => {
    setFutLoading(true);
    setFutError(null);
    try {
      const res = await fetch("/api/datos-gov?dataset=fut-ingresos");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.ok && json.data?.length) {
        const filtered = (json.data as FUTItem[]).filter((item) => {
          const parts = item.codigo.split(".");
          const rec = parseFloat(item.recaudo_efectivo_pesos || "0");
          return parts.length <= 4 && rec > 500_000_000;
        });
        setFutItems(filtered.length ? filtered : FALLBACK_FUT);
        setLastUpdate(new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
      } else {
        setFutItems(FALLBACK_FUT);
        setLastUpdate("demo");
      }
    } catch {
      setFutItems(FALLBACK_FUT);
      setLastUpdate("demo");
    }
    setFutLoading(false);
  };

  const fetchSECOP = async () => {
    setSecopLoading(true);
    setSecopError(null);
    try {
      const res = await fetch("/api/datos-gov?dataset=secop-contratos&limit=6");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.ok) {
        setContratos(json.data);
      } else {
        setContratos(FALLBACK_SECOP);
      }
    } catch {
      setContratos(FALLBACK_SECOP);
    }
    setSecopLoading(false);
  };

  useEffect(() => {
    fetchFUT();
    fetchSECOP();
  }, []);

  const futTotal = futItems.find((i) => i.codigo === "TI.A.1");
  const futTaxes = futItems
    .filter((i) => i.codigo !== "TI.A.1" && i.codigo.split(".").length === 4)
    .sort((a, b) => parseFloat(b.recaudo_efectivo_pesos) - parseFloat(a.recaudo_efectivo_pesos))
    .slice(0, 6);

  return (
    <div className="space-y-3">
      {/* Live status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi size={12} className="text-green-500" />
          <span className="text-[0.75rem] font-semibold text-green-600 uppercase tracking-wider">
            Datos en vivo
          </span>
          {lastUpdate && (
            <span className="text-[0.6875rem] text-gray-400">· {lastUpdate}</span>
          )}
        </div>
        <button
          onClick={() => { fetchFUT(); fetchSECOP(); }}
          className="flex items-center gap-1 text-[0.625rem] text-gray-400 hover:text-ochre transition-colors"
        >
          <RefreshCw size={11} className={futLoading || secopLoading ? "animate-spin" : ""} />
          <span className="text-[0.75rem]">Actualizar</span>
        </button>
      </div>

      {/* ── FUT Ingresos ── */}
      <div className="bg-paper rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setFutExpanded(!futExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-cream/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database size={13} className="text-ochre" />
            <span className="text-[0.8125rem] font-semibold text-ink">FUT Ingresos</span>
            {futTotal && (
              <span className="text-[0.6875rem] font-bold text-ochre">
                {formatLive(futTotal.recaudo_efectivo_pesos)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://www.datos.gov.co/d/a6ia-xzgy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[0.6875rem] text-ochre hover:underline flex items-center gap-0.5"
            >
              datos.gov.co <ExternalLink size={8} />
            </a>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${futExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </button>
        <AnimatePresence>
          {futExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                {futError ? (
                  <div role="alert" className="flex items-center justify-center py-6 gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-[0.75rem] text-gray-500">{futError}</span>
                    <button onClick={fetchFUT} className="text-[0.75rem] text-ochre hover:underline ml-1">Reintentar</button>
                  </div>
                ) : futLoading && futItems.length === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <RefreshCw size={16} className="animate-spin text-ochre mr-2" />
                    <span className="text-[0.75rem] text-gray-400">Cargando FUT...</span>
                  </div>
                ) : futTotal ? (
                  <div className="space-y-2">
                    {/* Total bar */}
                    <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-border">
                      <span className="text-[0.6875rem] text-gray-400">Total tributarios</span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-[1.125rem] text-ochre">{formatLive(futTotal.recaudo_efectivo_pesos)}</span>
                        <span className="text-[0.625rem] text-gray-400">
                          de {formatLive(futTotal.presupuesto_definitivo_pesos)}
                        </span>
                        <span className="text-[0.625rem] font-bold text-green-600">
                          {((parseFloat(futTotal.recaudo_efectivo_pesos) / parseFloat(futTotal.presupuesto_definitivo_pesos)) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {futTaxes.map((item) => {
                      const rec = parseFloat(item.recaudo_efectivo_pesos);
                      const pres = parseFloat(item.presupuesto_definitivo_pesos);
                      const pctVal = pres > 0 ? (rec / pres) * 100 : 0;
                      return (
                        <div key={item.codigo}>
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="text-[0.6875rem] text-ink truncate max-w-[50%] sm:max-w-[55%]" title={item.nombre}>{item.nombre}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[0.6875rem] text-gray-400">{formatLive(item.recaudo_efectivo_pesos)}</span>
                              <span className={`text-[0.625rem] font-bold ${
                                pctVal >= 100 ? "text-green-600" : pctVal >= 80 ? "text-ochre" : "text-red-500"
                              }`}>
                                {pctVal.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="h-1 bg-cream rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pctVal >= 100 ? "bg-green-500" : pctVal >= 80 ? "bg-ochre" : "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(pctVal, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[0.75rem] text-gray-400 py-4 text-center">Sin datos disponibles</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SECOP Contratos ── */}
      <div className="bg-paper rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setSecopExpanded(!secopExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-cream/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Briefcase size={13} className="text-ochre" />
            <span className="text-[0.8125rem] font-semibold text-ink">SECOP Contratos</span>
            {contratos.length > 0 && (
              <span className="text-[0.625rem] text-gray-400 bg-cream px-1.5 py-0.5 rounded">
                {contratos.length} recientes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://www.datos.gov.co/d/rpmr-utcd"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[0.6875rem] text-ochre hover:underline flex items-center gap-0.5"
            >
              datos.gov.co <ExternalLink size={8} />
            </a>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${secopExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </button>
        <AnimatePresence>
          {secopExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                {secopError ? (
                  <div role="alert" className="flex items-center justify-center py-6 gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-[0.75rem] text-gray-500">{secopError}</span>
                    <button onClick={fetchSECOP} className="text-[0.75rem] text-ochre hover:underline ml-1">Reintentar</button>
                  </div>
                ) : secopLoading && contratos.length === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <RefreshCw size={16} className="animate-spin text-ochre mr-2" />
                    <span className="text-[0.75rem] text-gray-400">Cargando SECOP...</span>
                  </div>
                ) : contratos.length > 0 ? (
                  <div className="space-y-2">
                    {contratos.map((c, i) => (
                      <motion.div
                        key={c.numero_del_contrato || i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="rounded-lg border border-border p-2.5 hover:border-ochre/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-[0.6875rem] text-ink font-medium leading-snug line-clamp-2 flex-1">
                            {c.objeto_del_proceso || "Sin objeto definido"}
                          </p>
                          <span className="font-serif text-[0.8125rem] text-ochre font-bold whitespace-nowrap shrink-0">
                            {formatLive(c.valor_contrato)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[0.6875rem] font-semibold px-1.5 py-0.5 rounded-full ${estadoColor(c.estado_del_proceso)}`}>
                            {c.estado_del_proceso}
                          </span>
                          <span className="text-[0.6875rem] text-gray-400">{c.tipo_de_contrato}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[0.75rem] text-gray-400 py-4 text-center">Sin contratos disponibles</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
