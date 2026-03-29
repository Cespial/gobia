"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  Building2,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Award,
} from "lucide-react";
import type { AntioquiaMunicipality } from "@/data/antioquia-municipalities";
import { CATEGORIA_LABELS } from "@/data/antioquia-municipalities";
import { useMunicipalityData, type MunicipalityFullData } from "@/hooks/useMunicipalityData";
import { useFiscalData } from "@/hooks/useFiscalData";
import { ANTIOQUIA_AVERAGES, getIndicatorStatus } from "@/data/antioquia-averages";
import FiscalPanel from "./FiscalPanel";

interface MunicipalityPanelProps {
  municipality: AntioquiaMunicipality | null;
  onClose: () => void;
  isOpen: boolean;
}

export default function MunicipalityPanel({
  municipality,
  onClose,
  isOpen,
}: MunicipalityPanelProps) {
  const { data, loading, error } = useMunicipalityData(
    municipality?.codigo_dane ?? null
  );

  return (
    <AnimatePresence>
      {isOpen && municipality && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-paper border-l border-border shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-ink text-paper border-b border-gray-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Cerrar panel"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h2 className="font-semibold text-lg leading-tight">
                    {municipality.nombre}
                  </h2>
                  <p className="text-[0.75rem] text-gray-400">
                    {municipality.subregion} · {CATEGORIA_LABELS[municipality.categoria]}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <PanelSkeleton />
              ) : error ? (
                <div className="p-5 text-center">
                  <p className="text-sm text-red-500 mb-2">Error cargando datos</p>
                  <p className="text-xs text-gray-400">{error.message}</p>
                </div>
              ) : data ? (
                <PanelContent data={data} municipality={municipality} />
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PanelContent({
  data,
  municipality,
}: {
  data: MunicipalityFullData;
  municipality: AntioquiaMunicipality;
}) {
  // Fetch detailed fiscal data
  const { data: fiscalData, loading: fiscalLoading } = useFiscalData(
    municipality.codigo_dane
  );

  return (
    <div className="divide-y divide-border">
      {/* Perfil General */}
      <Section icon={<Building2 size={16} />} title="Perfil General">
        <div className="grid grid-cols-2 gap-3">
          <DataItem label="Poblacion" value={formatNumber(data.profile.poblacion)} />
          <DataItem label="Area" value={`${formatNumber(data.profile.area_km2)} km²`} />
          <DataItem label="Subregion" value={data.profile.subregion} />
          <DataItem
            label="Codigo DANE"
            value={data.profile.codigo_dane}
            mono
          />
        </div>
      </Section>

      {/* Fiscal Panel - Enhanced with FUT data */}
      <div className="px-5 py-4">
        {fiscalData ? (
          <FiscalPanel data={fiscalData} loading={fiscalLoading} />
        ) : fiscalLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        ) : (
          <FiscalPanelFallback data={data} />
        )}
      </div>

      {/* Indicadores Sociales */}
      <Section icon={<Users size={16} />} title="Indicadores Sociales (TerriData)">
        <div className="grid grid-cols-2 gap-3">
          <DataItem
            label="NBI"
            value={`${data.terridata.nbi}%`}
            status={getIndicatorStatus(data.terridata.nbi, "nbi")}
          />
          <DataItem
            label="IPM"
            value={`${data.terridata.ipm}%`}
          />
          <DataItem
            label="Cobertura educacion"
            value={`${data.terridata.cobertura_educacion}%`}
            status={getIndicatorStatus(data.terridata.cobertura_educacion, "cobertura")}
          />
          <DataItem
            label="Afiliacion salud"
            value={`${data.terridata.afiliacion_salud}%`}
            status={getIndicatorStatus(data.terridata.afiliacion_salud, "cobertura")}
          />
          <DataItem
            label="Cobertura acueducto"
            value={`${data.terridata.cobertura_acueducto}%`}
          />
          <DataItem
            label="Tasa desempleo"
            value={`${data.terridata.tasa_desempleo}%`}
          />
        </div>
      </Section>

      {/* Contratacion SECOP */}
      <Section icon={<FileText size={16} />} title="Contratacion (SECOP)">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <DataItem label="Contratos" value={data.contracts.total_count.toString()} />
            <DataItem label="Activos" value={data.contracts.active.toString()} />
            <DataItem label="Valor total" value={formatCurrency(data.contracts.total_value)} />
          </div>

          {data.contracts.top_sectores.length > 0 && (
            <div className="pt-2">
              <p className="text-[0.6875rem] text-gray-400 uppercase tracking-wider mb-2">
                Top sectores
              </p>
              <div className="space-y-1.5">
                {data.contracts.top_sectores.slice(0, 3).map((sector) => (
                  <div
                    key={sector.sector}
                    className="flex items-center justify-between text-[0.75rem]"
                  >
                    <span className="text-gray-600">{sector.sector}</span>
                    <span className="font-medium text-ink">
                      {formatCurrency(sector.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <a
            href={`https://www.colombiacompra.gov.co/secop-ii`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.75rem] text-ochre hover:underline mt-2"
          >
            Ver detalle en SECOP
            <ExternalLink size={12} />
          </a>
        </div>
      </Section>

      {/* Comparacion Departamental */}
      <Section icon={<Award size={16} />} title="vs. Antioquia">
        <div className="space-y-3">
          <ComparisonRow
            label="IDF"
            municipalValue={data.fiscal.idf}
            avgValue={ANTIOQUIA_AVERAGES.idf}
            difference={data.comparison.idf_vs_avg}
            higherIsBetter
          />
          <ComparisonRow
            label="NBI"
            municipalValue={data.terridata.nbi}
            avgValue={ANTIOQUIA_AVERAGES.nbi}
            difference={data.comparison.nbi_vs_avg}
            higherIsBetter={false}
            isPercent
          />

          <div className="pt-2 border-t border-border-light">
            <div className="flex items-center justify-between">
              <span className="text-[0.8125rem] text-gray-600">
                Ranking departamental (IDF)
              </span>
              <span className="font-semibold text-ink">
                #{data.comparison.ranking_idf} de 125
              </span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-ochre">{icon}</span>
        <h3 className="text-[0.8125rem] font-semibold text-ink uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function DataItem({
  label,
  value,
  mono = false,
  status,
}: {
  label: string;
  value: string;
  mono?: boolean;
  status?: "green" | "yellow" | "red";
}) {
  return (
    <div>
      <p className="text-[0.6875rem] text-gray-400 mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className={`text-[0.875rem] font-medium text-ink ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
        {status && <StatusBadge status={status} size="sm" />}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  size = "md",
}: {
  status: "green" | "yellow" | "red";
  size?: "sm" | "md";
}) {
  const colors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  const sizeClass = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";

  return <span className={`${sizeClass} rounded-full ${colors[status]}`} />;
}

function ComparisonRow({
  label,
  municipalValue,
  avgValue,
  difference,
  higherIsBetter,
  isPercent = false,
}: {
  label: string;
  municipalValue: number;
  avgValue: number;
  difference: number;
  higherIsBetter: boolean;
  isPercent?: boolean;
}) {
  const isBetter = higherIsBetter ? difference > 0 : difference < 0;
  const isNeutral = Math.abs(difference) < 0.5;

  const TrendIcon = isNeutral ? Minus : isBetter ? TrendingUp : TrendingDown;
  const trendColor = isNeutral
    ? "text-gray-400"
    : isBetter
      ? "text-green-600"
      : "text-red-500";

  const suffix = isPercent ? "%" : "";

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-[0.8125rem] text-gray-600">{label}</span>
        <div className="text-[0.6875rem] text-gray-400">
          Promedio Antioquia: {avgValue}{suffix}
        </div>
      </div>
      <div className="text-right flex items-center gap-2">
        <span className="font-semibold text-ink">
          {municipalValue}{suffix}
        </span>
        <div className={`flex items-center gap-0.5 ${trendColor}`}>
          <TrendIcon size={14} />
          <span className="text-[0.75rem] font-medium">
            {difference > 0 ? "+" : ""}{difference}{suffix}
          </span>
        </div>
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="divide-y divide-border animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded bg-gray-200" />
            <div className="w-32 h-4 rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j}>
                <div className="w-16 h-3 rounded bg-gray-100 mb-1" />
                <div className="w-24 h-4 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helpers
function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-CO").format(num);
}

function formatCurrency(num: number): string {
  if (num >= 1_000_000_000_000) {
    return `$${(num / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  return `$${formatNumber(num)}`;
}

// Fallback component when FUT fiscal data is not available
function FiscalPanelFallback({ data }: { data: MunicipalityFullData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-ochre">
          <Award size={16} />
        </span>
        <h3 className="text-[0.8125rem] font-semibold text-ink uppercase tracking-wide">
          Indicadores Fiscales
        </h3>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[0.8125rem] text-gray-600">IDF (2023)</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">{data.fiscal.idf}</span>
          <StatusBadge status={getIndicatorStatus(data.fiscal.idf, "idf")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DataItem
          label="Recaudo predial"
          value={formatCurrency(data.fiscal.recaudo_predial)}
        />
        <DataItem
          label="Recaudo ICA"
          value={formatCurrency(data.fiscal.recaudo_ica)}
        />
        <DataItem
          label="Ejecucion gastos"
          value={`${data.fiscal.ejecucion_gastos}%`}
          status={getIndicatorStatus(data.fiscal.ejecucion_gastos, "ejecucion")}
        />
        <DataItem
          label="Dep. transferencias"
          value={`${data.fiscal.dependencia_transferencias}%`}
        />
      </div>
    </div>
  );
}
