"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { tarifasPredial, tarifasICA, tarifasFinancieras } from "@/data/medellin-estatuto";

type Tab = "predial" | "ica" | "financiero";

const tabs: { key: Tab; label: string }[] = [
  { key: "predial", label: "Predial" },
  { key: "ica", label: "ICA por CIIU" },
  { key: "financiero", label: "Financiero" },
];

export default function TarifasTable() {
  const [active, setActive] = useState<Tab>("predial");

  return (
    <div className="rounded-2xl border border-border bg-paper overflow-hidden shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`relative flex-1 px-4 py-3 text-[0.8125rem] font-semibold transition-colors duration-200 ${
              active === tab.key ? "text-ink" : "text-gray-400 hover:text-sepia"
            }`}
          >
            {tab.label}
            {active === tab.key && (
              <motion.span
                layoutId="tarifa-tab"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-ochre rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-[420px] overflow-y-auto">
        {active === "predial" && (
          <div>
            <div className="px-4 pt-4 pb-2">
              <h4 className="text-[0.75rem] font-semibold uppercase tracking-wider text-gray-400">
                Residencial — Art. 24
              </h4>
            </div>
            <table className="w-full text-[0.8125rem]">
              <thead>
                <tr className="border-b border-border-light text-left text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-2">Estrato</th>
                  <th className="px-4 py-2">Rango avalúo</th>
                  <th className="px-4 py-2 text-right">Tarifa (x mil)</th>
                </tr>
              </thead>
              <tbody>
                {tarifasPredial.residencial.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-light/50 hover:bg-cream/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-semibold text-ink">{row.estrato}</td>
                    <td className="px-4 py-2.5 text-gray-500">{row.rangoAvaluo}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[3rem] rounded-md bg-ochre-soft px-2 py-0.5 text-[0.75rem] font-bold text-ochre">
                        {row.tarifaXMil}‰
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-4 pt-4 pb-2">
              <h4 className="text-[0.75rem] font-semibold uppercase tracking-wider text-gray-400">
                No Residencial
              </h4>
            </div>
            <table className="w-full text-[0.8125rem]">
              <thead>
                <tr className="border-b border-border-light text-left text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-2">Categoría</th>
                  <th className="px-4 py-2 text-right">Tarifa (x mil)</th>
                </tr>
              </thead>
              <tbody>
                {tarifasPredial.noResidencial.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-light/50 hover:bg-cream/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-ink">{row.categoria}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[3rem] rounded-md bg-ochre-soft px-2 py-0.5 text-[0.75rem] font-bold text-ochre">
                        {row.tarifaXMil}‰
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === "ica" && (
          <table className="w-full text-[0.8125rem]">
            <thead>
              <tr className="border-b border-border-light text-left text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-2">CIIU</th>
                <th className="px-4 py-2">Actividad</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2 text-right">Tarifa (x mil)</th>
              </tr>
            </thead>
            <tbody>
              {tarifasICA.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border-light/50 hover:bg-cream/50 transition-colors"
                >
                  <td className="px-4 py-2.5 font-mono text-[0.75rem] text-sepia">{row.codigoCIIU}</td>
                  <td className="px-4 py-2.5 text-ink">{row.actividad}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[0.625rem] font-semibold ${
                      row.tipo === "Industrial" ? "bg-blue-50 text-blue-600" :
                      row.tipo === "Comercial" ? "bg-green-50 text-green-600" :
                      row.tipo === "Servicios" ? "bg-purple-50 text-purple-600" :
                      "bg-amber-50 text-amber-600"
                    }`}>
                      {row.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="inline-flex items-center justify-center min-w-[3rem] rounded-md bg-ochre-soft px-2 py-0.5 text-[0.75rem] font-bold text-ochre">
                      {row.tarifaXMil}‰
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {active === "financiero" && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-[0.75rem] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Tarifas progresivas — Art. 71
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {tarifasFinancieras.progresion.map((item) => (
                  <div
                    key={item.year}
                    className={`rounded-xl border p-4 text-center ${
                      item.year >= 2025
                        ? "border-ochre/30 bg-ochre-soft"
                        : "border-border bg-paper"
                    }`}
                  >
                    <div className="text-[0.6875rem] text-gray-400 mb-1">{item.year}{"nota" in item ? "+" : ""}</div>
                    <div className="font-serif text-2xl text-ink">{item.tarifaXMil}</div>
                    <div className="text-[0.625rem] text-gray-400">x mil</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[0.75rem] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Actividades cubiertas
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tarifasFinancieras.actividades.map((act) => (
                  <span
                    key={act}
                    className="inline-flex px-2.5 py-1 rounded-md bg-cream text-[0.6875rem] text-sepia border border-border-light"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
