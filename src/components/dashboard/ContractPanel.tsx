"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Building2,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useContractData } from "@/hooks/useContractData";
import type { SecopContract } from "@/lib/secop-client";
import type { CuipoEjecucionByCategoria } from "@/lib/cuipo-client";

interface ContractPanelProps {
  codigoDane: string;
  municipioNombre: string;
  vigencia?: number;
}

export default function ContractPanel({
  codigoDane,
  municipioNombre,
  vigencia = 2024,
}: ContractPanelProps) {
  const { data, loading, error } = useContractData(codigoDane, vigencia);
  const [showAllContracts, setShowAllContracts] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-6">
        <AlertTriangle className="mx-auto mb-2 text-yellow-500" size={24} />
        <p className="text-sm text-gray-500">Error cargando datos de contratación</p>
        <p className="text-xs text-gray-400 mt-1">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-6">
        <FileText className="mx-auto mb-2 text-gray-300" size={32} />
        <p className="text-sm text-gray-500">Sin datos de contratación</p>
      </div>
    );
  }

  const { secop, cuipo } = data;
  const summary = secop.summary;

  // Get top 5 contracts by value
  const topContracts = secop.contracts
    .slice()
    .sort((a, b) => b.valor_contrato - a.valor_contrato)
    .slice(0, showAllContracts ? 10 : 5);

  // Calculate type distribution
  const tipoEntries = Object.entries(summary.por_tipo)
    .filter(([, val]) => val.cantidad > 0)
    .sort((a, b) => b[1].cantidad - a[1].cantidad);

  const totalByType = tipoEntries.reduce((sum, [, val]) => sum + val.cantidad, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-ochre" />
        <h3 className="text-[0.8125rem] font-semibold text-ink uppercase tracking-wide">
          Contratación Pública — {municipioNombre} {vigencia}
        </h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Total contratos"
          value={summary.total_contratos.toLocaleString("es-CO")}
          icon={<FileText size={14} />}
        />
        <SummaryCard
          label="Valor total"
          value={formatCurrency(summary.valor_total)}
          icon={<Building2 size={14} />}
        />
        <SummaryCard
          label="Promedio"
          value={formatCurrency(summary.valor_promedio)}
          icon={<TrendingUp size={14} />}
        />
      </div>

      {/* Contract Status */}
      {Object.keys(summary.por_estado).length > 0 && (
        <div className="bg-cream/50 rounded-lg p-3">
          <p className="text-[0.6875rem] text-gray-400 uppercase tracking-wider mb-2">
            Estado de contratos
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.por_estado).map(([estado, count]) => (
              <span
                key={estado}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[0.625rem] font-medium ${getEstadoStyle(estado)}`}
              >
                {getEstadoIcon(estado)}
                {estado}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Contracts */}
      {topContracts.length > 0 && (
        <div>
          <p className="text-[0.6875rem] text-gray-400 uppercase tracking-wider mb-2">
            Contratos principales (por valor)
          </p>
          <div className="space-y-2">
            {topContracts.map((contract, i) => (
              <ContractItem key={contract.id || i} contract={contract} rank={i + 1} />
            ))}
          </div>
          {secop.contracts.length > 5 && (
            <button
              onClick={() => setShowAllContracts(!showAllContracts)}
              className="flex items-center gap-1 mt-2 text-[0.75rem] text-ochre hover:underline"
            >
              {showAllContracts ? (
                <>
                  Ver menos <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Ver más ({secop.contracts.length - 5} más) <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Distribution by Type */}
      {tipoEntries.length > 0 && (
        <div>
          <p className="text-[0.6875rem] text-gray-400 uppercase tracking-wider mb-2">
            Distribución por tipo
          </p>
          <div className="space-y-2">
            {tipoEntries.map(([tipo, stats]) => {
              const pct = totalByType > 0 ? (stats.cantidad / totalByType) * 100 : 0;
              return (
                <TypeDistributionBar
                  key={tipo}
                  tipo={tipo}
                  cantidad={stats.cantidad}
                  porcentaje={pct}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* CUIPO Execution */}
      {cuipo && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[0.6875rem] text-gray-400 uppercase tracking-wider">
              Ejecución CUIPO {vigencia}
            </p>
            <span className={`text-[0.8125rem] font-semibold ${getEjecucionColor(cuipo.porcentaje_ejecucion)}`}>
              {cuipo.porcentaje_ejecucion}% total
            </span>
          </div>

          {cuipo.ejecucion_por_categoria.length > 0 ? (
            <div className="space-y-2">
              {cuipo.ejecucion_por_categoria.slice(0, 6).map((cat) => (
                <CuipoCategoryRow key={cat.categoria} data={cat} />
              ))}
            </div>
          ) : (
            <div className="bg-cream/50 rounded-lg p-3 text-center">
              <p className="text-[0.75rem] text-gray-500">
                Ejecución promedio: {cuipo.porcentaje_ejecucion}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Top Contractors */}
      {summary.top_contratistas.length > 0 && (
        <div>
          <p className="text-[0.6875rem] text-gray-400 uppercase tracking-wider mb-2">
            Top contratistas
          </p>
          <div className="space-y-2">
            {summary.top_contratistas.slice(0, 3).map((contratista, i) => (
              <div
                key={contratista.nit || i}
                className="flex items-center justify-between text-[0.75rem] py-1.5 border-b border-border-light last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[0.625rem] text-gray-400 w-4">{i + 1}.</span>
                  <span className="text-ink truncate">{contratista.nombre}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="font-medium text-ochre">
                    {formatCurrency(contratista.valor)}
                  </span>
                  <span className="text-[0.625rem] text-gray-400 ml-1">
                    ({contratista.contratos})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[0.625rem] text-gray-400">
          Fuente: SECOP II · CUIPO · datos.gov.co
        </span>
        <a
          href={`https://www.colombiacompra.gov.co/secop-ii`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[0.625rem] text-ochre hover:underline"
        >
          Ver en SECOP <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}

// Sub-components

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-cream/50 rounded-lg p-3 text-center">
      <div className="flex justify-center mb-1 text-ochre">{icon}</div>
      <p className="text-[0.6875rem] text-gray-400 mb-0.5">{label}</p>
      <p className="text-[0.875rem] font-semibold text-ink">{value}</p>
    </div>
  );
}

function ContractItem({ contract, rank }: { contract: SecopContract; rank: number }) {
  const truncatedObjeto = contract.objeto.length > 80
    ? contract.objeto.substring(0, 80) + "..."
    : contract.objeto;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="rounded-lg border border-border p-2.5 hover:border-ochre/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[0.75rem] text-ink leading-snug flex-1">
          <span className="text-[0.625rem] text-gray-400 mr-1">{rank}.</span>
          {truncatedObjeto || "Sin descripción"}
        </p>
        <span className="text-[0.8125rem] font-semibold text-ochre whitespace-nowrap">
          {formatCurrency(contract.valor_contrato)}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[0.5625rem] font-medium px-1.5 py-0.5 rounded-full ${getEstadoStyle(contract.estado)}`}>
          {contract.estado}
        </span>
        <span className="text-[0.5625rem] text-gray-400">{contract.tipo_contrato}</span>
        {contract.empresa_contratista && (
          <>
            <span className="text-[0.5625rem] text-gray-400">·</span>
            <span className="text-[0.5625rem] text-gray-400 truncate max-w-[120px]">
              {contract.empresa_contratista}
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}

function TypeDistributionBar({
  tipo,
  cantidad,
  porcentaje,
}: {
  tipo: string;
  cantidad: number;
  porcentaje: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[0.6875rem]">
        <span className="text-gray-600">{tipo}</span>
        <span className="text-ink font-medium">
          {cantidad} ({porcentaje.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${porcentaje}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: getTipoColor(tipo) }}
        />
      </div>
    </div>
  );
}

function CuipoCategoryRow({ data }: { data: CuipoEjecucionByCategoria }) {
  const status = getEjecucionStatus(data.porcentaje);

  return (
    <div className="flex items-center justify-between text-[0.75rem] py-1.5 border-b border-border-light last:border-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-gray-600 truncate">{data.categoria}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-gray-500 text-[0.6875rem]">
          {formatCurrency(data.ejecutado)}
        </span>
        <span className={`font-medium ${getEjecucionColor(data.porcentaje)}`}>
          {data.porcentaje}%
        </span>
        {status}
      </div>
    </div>
  );
}

// Helpers

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return `$${value.toLocaleString("es-CO")}`;
}

function getEstadoStyle(estado: string): string {
  const e = estado.toLowerCase();
  if (e.includes("celebrado") || e.includes("adjudicado")) return "bg-green-100 text-green-700";
  if (e.includes("ejecución") || e.includes("convocado")) return "bg-blue-100 text-blue-700";
  if (e.includes("liquidado") || e.includes("terminado")) return "bg-gray-100 text-gray-600";
  if (e.includes("evaluación")) return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-500";
}

function getEstadoIcon(estado: string): React.ReactNode {
  const e = estado.toLowerCase();
  if (e.includes("celebrado") || e.includes("adjudicado")) return <Check size={10} />;
  if (e.includes("ejecución")) return <Clock size={10} />;
  return null;
}

function getTipoColor(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t.includes("prestación") || t.includes("prestacion") || t.includes("servicios")) return "#3B82F6";
  if (t.includes("suministro")) return "#8B5CF6";
  if (t.includes("obra")) return "#F97316";
  if (t.includes("consultoría") || t.includes("consultoria")) return "#EC4899";
  if (t.includes("interventoría") || t.includes("interventoria")) return "#14B8A6";
  return "#6B7280";
}

function getEjecucionColor(pct: number): string {
  if (pct >= 85) return "text-green-600";
  if (pct >= 70) return "text-yellow-600";
  if (pct >= 50) return "text-orange-500";
  return "text-red-500";
}

function getEjecucionStatus(pct: number): React.ReactNode {
  if (pct >= 85) return <span className="text-green-500">✓</span>;
  if (pct >= 70) return <span className="text-yellow-500">○</span>;
  return <span className="text-red-500">!</span>;
}
