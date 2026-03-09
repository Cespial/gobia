"use client";

import { motion } from "framer-motion";
import { DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { recaudoTributario } from "@/data/medellin-hacienda";

const totalRecaudo = recaudoTributario.reduce((s, r) => s + r.recaudado, 0);
const totalPresup = recaudoTributario.reduce((s, r) => s + r.presupuestado, 0);
const totalDeficit = totalPresup - totalRecaudo;
const pctGlobal = (totalRecaudo / totalPresup) * 100;

const sorted = [...recaudoTributario].sort((a, b) => b.recaudado - a.recaudado);
const underperformers = recaudoTributario.filter((r) => r.porcentaje < 90).sort((a, b) => a.porcentaje - b.porcentaje);

const COLORS = ["#B8956A", "#8B7355", "#6B8E4E", "#5B7BA5", "#A0616A", "#7B6BA5", "#9E9484", "#DDD4C4", "#4A7B6E"];

function fmtMM(millones: number): string {
  if (millones >= 1_000_000) return `$${(millones / 1_000_000).toFixed(1)}B`;
  return `$${(millones / 1000).toFixed(0)} MM`;
}

export default function RecaudoRadiografia() {
  return (
    <div className="bg-paper rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[0.8125rem] font-semibold text-ink flex items-center gap-1.5">
          <DollarSign size={14} className="text-ochre" />
          Radiografía del recaudo 2024
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[1.125rem] text-ochre font-bold">
            {pctGlobal.toFixed(1)}%
          </span>
          <span className="text-[0.625rem] text-gray-400">cumplimiento</span>
        </div>
      </div>

      {/* Stacked horizontal bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.625rem] text-gray-400">$0</span>
          <span className="text-[0.625rem] text-gray-400">Presupuestado: {fmtMM(totalPresup)}</span>
        </div>
        <div className="relative h-8 bg-cream rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex">
            {sorted.map((r, i) => (
              <motion.div
                key={r.impuesto}
                initial={{ width: 0 }}
                animate={{ width: `${(r.recaudado / totalPresup) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="h-full relative group cursor-default"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                title={`${r.impuesto}: ${fmtMM(r.recaudado)} (${r.porcentaje}%)`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[0.625rem] text-gray-500 flex items-center gap-1">
            <TrendingUp size={10} className="text-green-500" />
            Recaudado: {fmtMM(totalRecaudo)}
          </span>
          <span className="text-[0.625rem] text-red-500 font-semibold">
            Déficit: {fmtMM(totalDeficit)}
          </span>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
          {sorted.slice(0, 5).map((r, i) => (
            <span key={r.impuesto} className="flex items-center gap-1 text-[0.625rem] text-gray-400">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i] }} />
              {r.impuesto}
            </span>
          ))}
        </div>
      </div>

      {/* Underperformers */}
      {underperformers.length > 0 && (
        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <AlertTriangle size={12} className="text-amber-500" />
            <span className="text-[0.75rem] font-semibold text-ink">Impuestos bajo meta (&lt;90%)</span>
          </div>
          <div className="space-y-2">
            {underperformers.map((r) => {
              const deficit = r.presupuestado - r.recaudado;
              return (
                <div key={r.impuesto}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[0.75rem] text-ink font-medium">{r.impuesto}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[0.75rem] font-bold ${r.porcentaje < 85 ? "text-red-500" : "text-amber-500"}`}>
                        {r.porcentaje}%
                      </span>
                      <span className="text-[0.625rem] text-gray-400">
                        -{fmtMM(deficit)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.porcentaje < 85 ? "bg-red-400" : "bg-amber-400"}`}
                      style={{ width: `${r.porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
