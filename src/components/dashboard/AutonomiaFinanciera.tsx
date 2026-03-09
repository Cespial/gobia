"use client";

import { motion } from "framer-motion";
import { Landmark, ArrowRight } from "lucide-react";
import { fuentesRecursos } from "@/data/medellin-hacienda";
import { operacionesEfectivasCaja } from "@/data/medellin-terridata";

const totalAprobado = fuentesRecursos.reduce((s, f) => s + f.aprobado, 0);
const recursosPropios = fuentesRecursos.find((f) => f.fuente === "Recursos propios");
const sgp = fuentesRecursos.find((f) => f.fuente === "SGP");
const credito = fuentesRecursos.find((f) => f.fuente === "Crédito");

const pctPropios = recursosPropios ? (recursosPropios.aprobado / totalAprobado) * 100 : 0;
const pctSGP = sgp ? (sgp.aprobado / totalAprobado) * 100 : 0;
const pctCredito = credito ? (credito.aprobado / totalAprobado) * 100 : 0;
const pctOtros = 100 - pctPropios - pctSGP - pctCredito;

const ingresosTotales = operacionesEfectivasCaja.find((o) => o.indicator === "Ingresos totales");
const ingresosCorrientes = operacionesEfectivasCaja.find((o) => o.indicator === "Ingresos corrientes");
const gastosFuncionamiento = operacionesEfectivasCaja.find((o) => o.indicator === "Funcionamiento");
const ahorroCorriente = operacionesEfectivasCaja.find((o) => o.indicator === "Déficit o ahorro corriente");

function fmtMM(millones: number): string {
  if (millones >= 1_000_000) return `$${(millones / 1_000_000).toFixed(1)}B`;
  if (millones >= 1_000) return `$${(millones / 1_000).toFixed(0)} MM`;
  return `$${millones.toFixed(0)}m`;
}

const segments = [
  { label: "Recursos propios", pct: pctPropios, color: "#B8956A" },
  { label: "SGP (Transferencias)", pct: pctSGP, color: "#5B7BA5" },
  { label: "Crédito", pct: pctCredito, color: "#A0616A" },
  { label: "Otros (Regalías, cofin.)", pct: pctOtros, color: "#DDD4C4" },
];

export default function AutonomiaFinanciera() {
  return (
    <div className="bg-paper rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[0.8125rem] font-semibold text-ink flex items-center gap-1.5">
          <Landmark size={14} className="text-ochre" />
          Autonomía financiera
        </h3>
        <span className="text-[0.625rem] text-gray-400">Composición de ingresos aprobados</span>
      </div>

      {/* Composition bar */}
      <div className="mb-3">
        <div className="h-7 rounded-lg overflow-hidden flex">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.label}
              initial={{ width: 0 }}
              animate={{ width: `${seg.pct}%` }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="h-full relative group"
              style={{ backgroundColor: seg.color }}
              title={`${seg.label}: ${seg.pct.toFixed(1)}%`}
            >
              {seg.pct > 15 && (
                <span className="absolute inset-0 flex items-center justify-center text-[0.625rem] font-bold text-white drop-shadow-sm">
                  {seg.pct.toFixed(0)}%
                </span>
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {segments.map((seg) => (
            <span key={seg.label} className="flex items-center gap-1 text-[0.625rem] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
              {seg.label} ({seg.pct.toFixed(1)}%)
            </span>
          ))}
        </div>
      </div>

      {/* OEC flow — vertical on mobile, horizontal on desktop */}
      <div className="border-t border-border pt-3">
        <div className="text-[0.625rem] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Flujo presupuestal (OEC 2022 · Millones COP)
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2">
          {[
            { label: "Ingresos totales", value: ingresosTotales?.series[0]?.value ?? 0, style: "text-ink" },
            { label: "Ingresos corrientes", value: ingresosCorrientes?.series[0]?.value ?? 0, style: "text-ink" },
            { label: "Funcionamiento", value: gastosFuncionamiento?.series[0]?.value ?? 0, style: "text-red-500" },
            { label: "Ahorro corriente", value: ahorroCorriente?.series[0]?.value ?? 0, style: "text-green-600" },
          ].map((item) => (
            <div key={item.label} className="bg-cream rounded-lg px-2.5 py-2 text-center">
              <div className="text-[0.625rem] text-gray-400 leading-tight mb-0.5">{item.label}</div>
              <div className={`font-serif text-[0.875rem] font-bold ${item.style}`}>
                {fmtMM(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
