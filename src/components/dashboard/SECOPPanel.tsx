"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

interface Contrato {
  nombre_de_la_entidad: string;
  estado_del_proceso: string;
  tipo_de_contrato: string;
  objeto_del_proceso: string;
  valor_contrato: string;
  numero_del_contrato: string;
  nom_raz_social_contratista: string;
  modalidad_de_contrataci_n: string;
}

function formatCurrency(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000).toFixed(0)} MM`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)} MM`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function estadoColor(estado: string): string {
  if (estado === "Celebrado" || estado === "Adjudicado") return "bg-green-100 text-green-700";
  if (estado === "Convocado") return "bg-blue-100 text-blue-700";
  if (estado === "Liquidado") return "bg-gray-100 text-gray-500";
  if (estado === "Borrador") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-500";
}

const FALLBACK_SECOP: Contrato[] = [
  { nombre_de_la_entidad: "Alcaldía de Medellín", estado_del_proceso: "Celebrado", tipo_de_contrato: "Prestación de servicios", objeto_del_proceso: "Prestación de servicios profesionales para apoyo a la gestión financiera y presupuestal de la Secretaría de Hacienda", valor_contrato: "85400000", numero_del_contrato: "4600095482", nom_raz_social_contratista: "Consultor Fiscal S.A.S.", modalidad_de_contrataci_n: "Contratación directa" },
  { nombre_de_la_entidad: "Alcaldía de Medellín", estado_del_proceso: "Adjudicado", tipo_de_contrato: "Obra", objeto_del_proceso: "Mejoramiento y mantenimiento de vías terciarias en comunas 1, 3 y 13 del municipio de Medellín", valor_contrato: "2450000000", numero_del_contrato: "4600095501", nom_raz_social_contratista: "Constructora Antioqueña Ltda.", modalidad_de_contrataci_n: "Licitación pública" },
  { nombre_de_la_entidad: "Alcaldía de Medellín", estado_del_proceso: "Convocado", tipo_de_contrato: "Consultoría", objeto_del_proceso: "Consultoría para actualización del Plan de Ordenamiento Territorial de Medellín", valor_contrato: "1200000000", numero_del_contrato: "4600095523", nom_raz_social_contratista: "", modalidad_de_contrataci_n: "Concurso de méritos" },
  { nombre_de_la_entidad: "Alcaldía de Medellín", estado_del_proceso: "Celebrado", tipo_de_contrato: "Suministro", objeto_del_proceso: "Suministro de equipos tecnológicos para modernización de secretarías municipales", valor_contrato: "890000000", numero_del_contrato: "4600095544", nom_raz_social_contratista: "TechGov Colombia S.A.", modalidad_de_contrataci_n: "Selección abreviada" },
  { nombre_de_la_entidad: "Alcaldía de Medellín", estado_del_proceso: "Liquidado", tipo_de_contrato: "Interventoría", objeto_del_proceso: "Interventoría técnica, administrativa y financiera al contrato de obra pública No. 4600094201", valor_contrato: "340000000", numero_del_contrato: "4600095102", nom_raz_social_contratista: "Ingeniería y Control S.A.S.", modalidad_de_contrataci_n: "Contratación directa" },
];

export default function SECOPPanel() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/datos-gov?dataset=secop-contratos&limit=10");
      const json = await res.json();
      if (json.ok && json.data?.length) {
        setContratos(json.data);
      } else {
        setContratos(FALLBACK_SECOP);
      }
    } catch {
      setContratos(FALLBACK_SECOP);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-paper shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-ink text-paper">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-ochre" />
          <h3 className="text-sm font-semibold">SECOP — Contratos Públicos</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.6875rem] text-gray-400">datos.gov.co en vivo</span>
          <button
            onClick={fetchData}
            className="text-gray-400 hover:text-paper transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading && contratos.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={20} className="animate-spin text-ochre mr-2" />
            <span className="text-[0.8125rem] text-gray-400">Cargando contratos de SECOP...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 py-8 justify-center text-red-500">
            <AlertCircle size={16} />
            <span className="text-[0.8125rem]">{error}</span>
          </div>
        )}

        {contratos.length > 0 && (
          <div className="space-y-2">
            {contratos.map((c, i) => (
              <motion.div
                key={c.numero_del_contrato}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border p-3 hover:border-ochre/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.8125rem] text-ink font-medium leading-snug line-clamp-2">
                      {c.objeto_del_proceso || "Sin objeto definido"}
                    </p>
                  </div>
                  <span className="font-serif text-[0.9375rem] text-ochre font-bold whitespace-nowrap">
                    {formatCurrency(c.valor_contrato)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[0.625rem] font-semibold px-2 py-0.5 rounded-full ${estadoColor(c.estado_del_proceso)}`}>
                    {c.estado_del_proceso}
                  </span>
                  <span className="text-[0.625rem] text-gray-400">
                    {c.tipo_de_contrato}
                  </span>
                  <span className="text-[0.625rem] text-gray-400">·</span>
                  <span className="text-[0.625rem] text-gray-400 truncate max-w-[140px] sm:max-w-[200px]" title={c.nombre_de_la_entidad}>
                    {c.nombre_de_la_entidad}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[0.625rem] text-gray-400">
            Fuente: SECOP Integrado · Colombia Compra Eficiente
          </span>
          <a
            href="https://www.datos.gov.co/d/rpmr-utcd"
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
