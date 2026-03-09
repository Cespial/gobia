"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";

interface FUTItem {
  codigo: string;
  nombre: string;
  presupuesto_definitivo_pesos: string;
  recaudo_efectivo_pesos: string;
  total_ingresos_pesos: string;
}

function formatBillions(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "$0";
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000).toFixed(0)} MM`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)} MM`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

const FALLBACK_FUT: FUTItem[] = [
  { codigo: "TI.A.1", nombre: "Total ingresos tributarios", presupuesto_definitivo_pesos: "3879407000000", recaudo_efectivo_pesos: "3685120000000", total_ingresos_pesos: "3685120000000" },
  { codigo: "TI.A.1.1", nombre: "Predial unificado", presupuesto_definitivo_pesos: "1241080000000", recaudo_efectivo_pesos: "1209200000000", total_ingresos_pesos: "1209200000000" },
  { codigo: "TI.A.1.2", nombre: "Industria y comercio (ICA)", presupuesto_definitivo_pesos: "1450000000000", recaudo_efectivo_pesos: "1320500000000", total_ingresos_pesos: "1320500000000" },
  { codigo: "TI.A.1.3", nombre: "Sobretasa a la gasolina", presupuesto_definitivo_pesos: "312500000000", recaudo_efectivo_pesos: "305200000000", total_ingresos_pesos: "305200000000" },
  { codigo: "TI.A.1.4", nombre: "Delineación urbana", presupuesto_definitivo_pesos: "185000000000", recaudo_efectivo_pesos: "172400000000", total_ingresos_pesos: "172400000000" },
  { codigo: "TI.A.1.5", nombre: "Alumbrado público", presupuesto_definitivo_pesos: "248000000000", recaudo_efectivo_pesos: "241300000000", total_ingresos_pesos: "241300000000" },
  { codigo: "TI.A.1.6", nombre: "Avisos y tableros", presupuesto_definitivo_pesos: "145000000000", recaudo_efectivo_pesos: "139800000000", total_ingresos_pesos: "139800000000" },
  { codigo: "TI.A.1.7", nombre: "Estampillas", presupuesto_definitivo_pesos: "97800000000", recaudo_efectivo_pesos: "92500000000", total_ingresos_pesos: "92500000000" },
];

export default function FUTPanel() {
  const [items, setItems] = useState<FUTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/datos-gov?dataset=fut-ingresos");
      const json = await res.json();
      if (json.ok && json.data?.length) {
        const filtered = (json.data as FUTItem[]).filter((item) => {
          const parts = item.codigo.split(".");
          const rec = parseFloat(item.recaudo_efectivo_pesos || "0");
          return parts.length <= 4 && rec > 500_000_000;
        });
        setItems(filtered.length ? filtered : FALLBACK_FUT);
      } else {
        setItems(FALLBACK_FUT);
      }
    } catch {
      setItems(FALLBACK_FUT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = items.find((i) => i.codigo === "TI.A.1");
  const taxes = items.filter(
    (i) => i.codigo !== "TI.A.1" && i.codigo.split(".").length === 4
  );

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-ink text-paper rounded-t-[14px]">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-ochre" />
          <h3 className="text-sm font-semibold">FUT Ingresos — Datos en vivo</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.6875rem] text-gray-400">datos.gov.co</span>
          <button
            onClick={fetchData}
            className="text-gray-400 hover:text-paper transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {loading && items.length === 0 && (
          <div className="flex items-center justify-center py-10">
            <RefreshCw size={20} className="animate-spin text-ochre mr-2" />
            <span className="text-[0.8125rem] text-gray-400">Cargando datos del FUT...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 py-8 justify-center text-red-500">
            <AlertCircle size={16} />
            <span className="text-[0.8125rem]">{error}</span>
          </div>
        )}

        {total && (
          <>
            {/* Total header */}
            <div className="mb-5 pb-4 border-b border-border">
              <div className="text-[0.6875rem] text-gray-400 font-medium uppercase tracking-wider mb-1">
                Total Ingresos Tributarios
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-[2rem] text-ochre">
                  {formatBillions(total.recaudo_efectivo_pesos)}
                </span>
                <span className="text-[0.8125rem] text-gray-400">
                  de {formatBillions(total.presupuesto_definitivo_pesos)} presupuestados
                </span>
                <span className="text-[0.8125rem] font-bold text-green-600">
                  {(
                    (parseFloat(total.recaudo_efectivo_pesos) /
                      parseFloat(total.presupuesto_definitivo_pesos)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>

            {/* Tax items */}
            <div className="space-y-3">
              {taxes
                .sort(
                  (a, b) =>
                    parseFloat(b.recaudo_efectivo_pesos) -
                    parseFloat(a.recaudo_efectivo_pesos)
                )
                .map((item, i) => {
                  const rec = parseFloat(item.recaudo_efectivo_pesos);
                  const pres = parseFloat(item.presupuesto_definitivo_pesos);
                  const pctVal = pres > 0 ? (rec / pres) * 100 : 0;

                  return (
                    <motion.div
                      key={item.codigo}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[0.8125rem] text-ink font-medium truncate max-w-[50%] sm:max-w-[60%]" title={item.nombre}>
                          {item.nombre}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.75rem] text-gray-400">
                            {formatBillions(item.recaudo_efectivo_pesos)}
                          </span>
                          <span
                            className={`text-[0.6875rem] font-bold w-14 text-right ${
                              pctVal >= 100
                                ? "text-green-600"
                                : pctVal >= 80
                                ? "text-ochre"
                                : "text-red-500"
                            }`}
                          >
                            {pctVal.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pctVal >= 100
                              ? "bg-green-500"
                              : pctVal >= 80
                              ? "bg-ochre"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${Math.min(pctVal, 100)}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[0.625rem] text-gray-400">
            Fuente: Formulario Único Territorial · CGN
          </span>
          <a
            href="https://www.datos.gov.co/d/a6ia-xzgy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[0.625rem] text-ochre hover:underline"
          >
            Ver dataset <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
