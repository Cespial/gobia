"use client";

import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Stethoscope,
  Droplets,
  Wifi,
  CheckCircle,
  AlertCircle,
  MinusCircle,
} from "lucide-react";
import type { SocialData } from "@/lib/terridata-client";
import { ANTIOQUIA_SOCIAL_AVERAGES } from "@/data/antioquia-social-2022";

// ============================================================================
// Types
// ============================================================================

interface SocialPanelProps {
  data: SocialData;
  loading?: boolean;
}

interface IndicatorRowProps {
  label: string;
  value: number;
  average: number;
  unit?: string;
  lowerIsBetter?: boolean;
  precision?: number;
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

// ============================================================================
// Helpers
// ============================================================================

function getStatus(
  value: number,
  average: number,
  lowerIsBetter: boolean
): "green" | "yellow" | "red" {
  const diff = value - average;
  const threshold = average * 0.1; // 10% tolerance

  if (lowerIsBetter) {
    if (diff <= -threshold) return "green";
    if (diff >= threshold) return "red";
    return "yellow";
  } else {
    if (diff >= threshold) return "green";
    if (diff <= -threshold) return "red";
    return "yellow";
  }
}

function StatusIcon({
  status,
  size = 14,
}: {
  status: "green" | "yellow" | "red";
  size?: number;
}) {
  switch (status) {
    case "green":
      return <CheckCircle size={size} className="text-green-500" />;
    case "yellow":
      return <MinusCircle size={size} className="text-yellow-500" />;
    case "red":
      return <AlertCircle size={size} className="text-red-500" />;
  }
}

// ============================================================================
// Sub-components
// ============================================================================

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-ochre">{icon}</span>
        <h4 className="text-[0.75rem] font-semibold text-ink uppercase tracking-wide">
          {title}
        </h4>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function IndicatorRow({
  label,
  value,
  average,
  unit = "%",
  lowerIsBetter = false,
  precision = 1,
}: IndicatorRowProps) {
  const status = getStatus(value, average, lowerIsBetter);
  const formattedValue = value.toFixed(precision);
  const formattedAverage = average.toFixed(precision);

  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[0.75rem] text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[0.75rem] font-medium text-ink">
          {formattedValue}{unit}
        </span>
        <StatusIcon status={status} />
        <span className="text-[0.5625rem] text-gray-400 w-20 text-right">
          (Ant: {formattedAverage}{unit})
        </span>
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  max = 100,
  color = "#B8956A",
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[0.625rem] text-gray-500 font-medium w-12 text-right">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function SocialPanel({ data, loading = false }: SocialPanelProps) {
  if (loading) {
    return <SocialPanelSkeleton />;
  }

  const averages = ANTIOQUIA_SOCIAL_AVERAGES;

  return (
    <div className="space-y-1 divide-y divide-border-light">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-ochre" />
          <h3 className="text-[0.8125rem] font-semibold text-ink uppercase tracking-wide">
            Indicadores Sociales
          </h3>
        </div>
        <span className="text-[0.625rem] text-gray-400">
          TerriData {data.vigencia}
        </span>
      </div>

      {/* Educacion */}
      <Section icon={<GraduationCap size={14} />} title="Educacion">
        <IndicatorRow
          label="Cobertura basica"
          value={data.educacion.cobertura_neta_basica}
          average={averages.cobertura_educacion}
        />
        <IndicatorRow
          label="Cobertura media"
          value={data.educacion.cobertura_neta_media}
          average={averages.cobertura_educacion * 0.78}
        />
        <IndicatorRow
          label="Desercion escolar"
          value={data.educacion.tasa_desercion}
          average={3.4}
          lowerIsBetter={true}
        />
        <div className="flex items-center justify-between py-0.5">
          <span className="text-[0.75rem] text-gray-600">Saber 11 (promedio)</span>
          <div className="flex items-center gap-2">
            <span className="text-[0.75rem] font-medium text-ink">
              {data.educacion.puntaje_pruebas_saber.toFixed(1)}
            </span>
            <span className="text-[0.5625rem] text-gray-400">
              (Ant: 49.1)
            </span>
          </div>
        </div>
      </Section>

      {/* Salud */}
      <Section icon={<Stethoscope size={14} />} title="Salud">
        <IndicatorRow
          label="Afiliacion sistema"
          value={data.salud.afiliacion_salud}
          average={averages.afiliacion_salud}
        />
        <div className="flex items-center justify-between py-0.5">
          <span className="text-[0.75rem] text-gray-600">Mortalidad infantil</span>
          <div className="flex items-center gap-2">
            <span className="text-[0.75rem] font-medium text-ink">
              {data.salud.mortalidad_infantil.toFixed(1)}
            </span>
            <StatusIcon
              status={getStatus(data.salud.mortalidad_infantil, 12.4, true)}
            />
            <span className="text-[0.5625rem] text-gray-400">
              por 1000 NV
            </span>
          </div>
        </div>
        <IndicatorRow
          label="Vacunacion DPT"
          value={data.salud.cobertura_vacunacion}
          average={92.6}
        />
      </Section>

      {/* Servicios Publicos */}
      <Section icon={<Droplets size={14} />} title="Servicios Publicos">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[0.6875rem] text-gray-500">Acueducto</span>
              <StatusIcon
                status={getStatus(
                  data.servicios.cobertura_acueducto,
                  averages.cobertura_acueducto,
                  false
                )}
                size={12}
              />
            </div>
            <ProgressBar value={data.servicios.cobertura_acueducto} color="#3B82F6" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[0.6875rem] text-gray-500">Alcantarillado</span>
              <StatusIcon
                status={getStatus(
                  data.servicios.cobertura_alcantarillado,
                  averages.cobertura_alcantarillado,
                  false
                )}
                size={12}
              />
            </div>
            <ProgressBar value={data.servicios.cobertura_alcantarillado} color="#2563EB" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[0.6875rem] text-gray-500">Energia</span>
              <StatusIcon
                status={getStatus(
                  data.servicios.cobertura_energia,
                  averages.cobertura_energia,
                  false
                )}
                size={12}
              />
            </div>
            <ProgressBar value={data.servicios.cobertura_energia} color="#22C55E" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[0.6875rem] text-gray-500 flex items-center gap-1">
                <Wifi size={10} />
                Internet
                {data.servicios.cobertura_internet < 50 && (
                  <span className="text-[0.5rem] text-orange-500 ml-1">
                    (brecha digital)
                  </span>
                )}
              </span>
              <StatusIcon
                status={getStatus(
                  data.servicios.cobertura_internet,
                  averages.cobertura_internet,
                  false
                )}
                size={12}
              />
            </div>
            <ProgressBar value={data.servicios.cobertura_internet} color="#9333EA" />
          </div>
        </div>
      </Section>

      {/* Pobreza */}
      <Section icon={<Users size={14} />} title="Pobreza">
        <div className="rounded-lg border border-border bg-cream/50 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[0.5625rem] text-gray-400 uppercase tracking-wider mb-0.5">
                NBI
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xl font-bold ${
                    data.pobreza.nbi <= averages.nbi ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {data.pobreza.nbi.toFixed(1)}%
                </span>
                <StatusIcon
                  status={getStatus(data.pobreza.nbi, averages.nbi, true)}
                />
              </div>
              <div className="text-[0.5625rem] text-gray-400">
                Antioquia: {averages.nbi}%
              </div>
            </div>
            <div>
              <div className="text-[0.5625rem] text-gray-400 uppercase tracking-wider mb-0.5">
                IPM
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xl font-bold ${
                    data.pobreza.ipm <= averages.ipm ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {data.pobreza.ipm.toFixed(1)}%
                </span>
                <StatusIcon
                  status={getStatus(data.pobreza.ipm, averages.ipm, true)}
                />
              </div>
              <div className="text-[0.5625rem] text-gray-400">
                Antioquia: {averages.ipm}%
              </div>
            </div>
          </div>
          {data.pobreza.gini > 0 && (
            <div className="mt-2 pt-2 border-t border-border-light">
              <div className="flex items-center justify-between">
                <span className="text-[0.6875rem] text-gray-500">Coeficiente Gini</span>
                <span className="text-[0.75rem] font-medium text-ink">
                  {data.pobreza.gini.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

function SocialPanelSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="w-36 h-4 bg-gray-200 rounded" />
      </div>

      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3.5 h-3.5 bg-gray-200 rounded" />
            <div className="w-24 h-3 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-4 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
