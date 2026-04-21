"use client";

import { useState } from "react";
import { ACCIONES_MEJORA } from "@/data/acciones-mejora";
import { DESTINACIONES_ESPECIFICAS_DEFAULT } from "@/data/alertas-icld";

/* ---------- helpers ---------- */

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}MM`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

/** SMLMV 2025 for display reference */
const SMLMV_2025 = 1_423_500;

/* ---------- types ---------- */

interface Ley617Certification {
  vigencia: string;
  categoria: string;
  icldNeto: number;
  gastosFuncionamiento: number;
  indicadorLey617: number;
  limiteGF: number;
  gastosConcejo: number | null;
  gastosPersoneria: number | null;
}

interface Ley617SectionData {
  seccion: string;
  gastosFuncionamiento: number;
  icld: number;
  ratio: number;
  limite: number;
  limiteAbsoluto?: number;
  limiteSMLMV?: number;
  status: "cumple" | "no_cumple";
  tipoLimite?: "porcentaje" | "absoluto";
}

interface GastoDeducidoDetalle {
  codigo: string;
  nombre: string;
  valor: number;
}

interface Ley617PanelProps {
  data: {
    icldTotal: number;
    gastosFuncionamientoTotal: number;
    ratioGlobal: number;
    limiteGlobal: number;
    secciones: Ley617SectionData[];
    status: "cumple" | "no_cumple";
    // New ICLD breakdown fields
    icldBruto?: number;
    icldValidado?: number;
    deduccionFondos?: number;
    deduccionReportada?: number;
    deduccionCalculada?: number;
    deduccionReportadaDetalle?: { codigoFuente: string; nombreFuente: string; valor: number }[];
    icldNeto?: number;
    accionesMejora?: number;
    gastosDeducidos?: number;
    gastosFuncionamientoNeto?: number;
    gastosDeducidosDetalle?: GastoDeducidoDetalle[];
    alertasICLD?: { cuenta: string; nombre: string; fuente: string; alerta: string; valor: number }[];
    icldDetalle?: { cuenta: string; nombre: string; recaudo: number; esValido: boolean }[];
  };
  certifications?: Ley617Certification[];
  periodo: string;
  municipio: { code: string; name: string; dept: string };
}

/* ---------- sub-components ---------- */

function KPI({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </span>
      </div>
      {subtext && <div className="mt-1 text-xs text-[var(--gray-400)]">{subtext}</div>}
    </div>
  );
}

/** Semicircular gauge showing ratio vs limit (for percentage-based sections) */
function Gauge({
  ratio,
  limite,
  status,
}: {
  ratio: number;
  limite: number;
  status: "cumple" | "no_cumple";
}) {
  const maxDisplay = Math.max(limite * 1.5, 100);
  const ratioAngle = Math.min((ratio / maxDisplay) * 180, 180);
  const limiteAngle = (limite / maxDisplay) * 180;
  const isCumple = status === "cumple";

  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  function polarToCartesian(
    cx: number,
    cy: number,
    r: number,
    angleDeg: number,
  ) {
    const angleRad = ((180 + angleDeg) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  }

  const cx = 120;
  const cy = 110;
  const r = 90;
  const limitPos = polarToCartesian(cx, cy, r + 12, limiteAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={240} height={140} viewBox="0 0 240 140">
        {/* Background arc */}
        <path
          d={describeArc(cx, cy, r, 0, 180)}
          fill="none"
          stroke="#404040"
          strokeWidth={16}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {ratioAngle > 0 && (
          <path
            d={describeArc(cx, cy, r, 0, ratioAngle)}
            fill="none"
            stroke={isCumple ? "#34d399" : "#f87171"}
            strokeWidth={16}
            strokeLinecap="round"
          />
        )}
        {/* Limit marker */}
        <circle cx={limitPos.x} cy={limitPos.y} r={4} fill="#B8956A" />
        <text
          x={limitPos.x}
          y={limitPos.y - 10}
          textAnchor="middle"
          fill="#B8956A"
          fontSize={10}
          fontWeight={600}
        >
          Limite {limite}%
        </text>
      </svg>

      {/* Central number */}
      <div className="-mt-16 text-center">
        <span
          className={`text-4xl font-bold ${isCumple ? "text-emerald-400" : "text-red-400"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {ratio.toFixed(1)}%
        </span>
        <div className="mt-1 text-xs text-[var(--gray-400)]">
          Gastos / ICLD
        </div>
      </div>
    </div>
  );
}

/** Section card for percentage-based limit (Admin Central) */
function PercentageSectionCard({ s }: { s: Ley617SectionData }) {
  const secCumple = s.status === "cumple";
  const limiteDisplay = s.limite * 100;

  return (
    <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h4
          className="text-sm font-semibold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {s.seccion}
        </h4>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            secCumple
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              : "border-red-400/20 bg-red-400/10 text-red-400"
          }`}
        >
          {secCumple ? "CUMPLE" : "NO CUMPLE"}
        </span>
      </div>

      <div className="mb-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--gray-500)]">Gastos func.</span>
          <span className="text-[var(--gray-300)]">
            {formatCOP(s.gastosFuncionamiento)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--gray-500)]">ICLD</span>
          <span className="text-[var(--gray-300)]">
            {formatCOP(s.icld)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--gray-500)]">Ratio</span>
          <span
            className={`font-semibold ${secCumple ? "text-emerald-400" : "text-red-400"}`}
          >
            {(s.ratio * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--gray-500)]">Limite legal (Art. 6)</span>
          <span className="text-[var(--ochre)]">{limiteDisplay}%</span>
        </div>
      </div>

      {/* Progress bar: ratio vs limit */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--gray-700)]">
        <div
          className={`h-full rounded-full transition-all ${
            secCumple ? "bg-emerald-400" : "bg-red-400"
          }`}
          style={{
            width: `${Math.min(((s.ratio * 100) / Math.max(limiteDisplay * 1.5, 100)) * 100, 100)}%`,
          }}
        />
        {/* Limit marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-[var(--ochre)]"
          style={{
            left: `${(limiteDisplay / Math.max(limiteDisplay * 1.5, 100)) * 100}%`,
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[var(--gray-500)]">
        <span>0%</span>
        <span>{limiteDisplay}% limite</span>
      </div>
    </div>
  );
}

/** Section card for absolute SMLMV-based limit (Concejo, Personeria) */
function AbsoluteSectionCard({ s }: { s: Ley617SectionData }) {
  const secCumple = s.status === "cumple";
  const limiteAbsoluto = s.limiteAbsoluto ?? 0;
  const limiteSMLMV = s.limiteSMLMV ?? 0;
  const pctUsed = limiteAbsoluto > 0 ? (s.gastosFuncionamiento / limiteAbsoluto) * 100 : 0;
  const artLabel = s.seccion.toUpperCase().includes("CONCEJO") ? "Art. 10" : "Art. 11";

  return (
    <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h4
          className="text-sm font-semibold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {s.seccion}
        </h4>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            secCumple
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              : "border-red-400/20 bg-red-400/10 text-red-400"
          }`}
        >
          {secCumple ? "CUMPLE" : "NO CUMPLE"}
        </span>
      </div>

      <div className="mb-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--gray-500)]">Gastos func.</span>
          <span className="text-[var(--gray-300)]">
            {formatCOP(s.gastosFuncionamiento)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--gray-500)]">Limite ({artLabel})</span>
          <span className="text-[var(--ochre)]">
            {limiteSMLMV} SMLMV
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--gray-500)]">Limite en COP</span>
          <span className="text-[var(--ochre)]">
            {formatCOP(limiteAbsoluto)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--gray-500)]">Uso del limite</span>
          <span
            className={`font-semibold ${secCumple ? "text-emerald-400" : "text-red-400"}`}
          >
            {pctUsed.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Progress bar: gastos vs absolute limit */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--gray-700)]">
        <div
          className={`h-full rounded-full transition-all ${
            secCumple ? "bg-emerald-400" : "bg-red-400"
          }`}
          style={{
            width: `${Math.min(pctUsed, 100)}%`,
          }}
        />
        {/* 100% limit marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-[var(--ochre)]"
          style={{ left: "66.67%" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[var(--gray-500)]">
        <span>$0</span>
        <span>{formatCOP(limiteAbsoluto)} limite</span>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function Ley617Panel({
  data,
  certifications,
  periodo,
  municipio,
}: Ley617PanelProps) {
  const isCumple = data.status === "cumple";
  const [showICLDDetalle, setShowICLDDetalle] = useState(false);

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Cumplimiento Ley 617/2000
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-400)]">
            {municipio.name} ({municipio.dept}) &mdash; Periodo{" "}
            {periodo.slice(0, 4)} T
            {(
              {
                "03": "1",
                "06": "2",
                "09": "3",
                "12": "4",
              } as Record<string, string>
            )[periodo.slice(4, 6)] || "?"}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            isCumple
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              : "border-red-400/20 bg-red-400/10 text-red-400"
          }`}
        >
          {isCumple ? "Cumple" : "No Cumple"}
        </span>
      </div>

      {/* Gauge + KPIs row */}
      <div className="mb-8 grid grid-cols-1 items-center gap-6 lg:grid-cols-3">
        <div className="flex justify-center lg:col-span-1">
          <Gauge
            ratio={data.ratioGlobal * 100}
            limite={data.limiteGlobal * 100}
            status={data.status}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <KPI
            label="ICLD Total"
            value={formatCOP(data.icldTotal)}
            subtext="Ingresos Corrientes de Libre Destinacion"
          />
          <KPI
            label="Gastos de Funcionamiento"
            value={formatCOP(data.gastosFuncionamientoTotal)}
            subtext={`Ratio global: ${(data.ratioGlobal * 100).toFixed(1)}% / Limite: ${(data.limiteGlobal * 100).toFixed(0)}%`}
          />
        </div>
      </div>

      {/* SMLMV reference */}
      <div className="mb-6 rounded-lg border border-[var(--gray-800)] bg-[var(--gray-800)]/50 px-4 py-2.5 text-xs text-[var(--gray-400)]">
        <strong className="text-[var(--gray-300)]">Referencia SMLMV 2025:</strong>{" "}
        ${SMLMV_2025.toLocaleString("es-CO")} COP/mes. Los limites de Concejo (Art. 10) y
        Personeria (Art. 11) son montos absolutos en SMLMV, no porcentajes del ICLD.
      </div>

      {/* ICLD Desglose */}
      {data.icldBruto !== undefined && (
        <div className="mb-6 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
          <h3
            className="mb-4 text-sm font-semibold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Desglose ICLD
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--gray-400)]">ICLD Bruto (registrado)</span>
              <span className="font-medium text-white">{formatCOP(data.icldBruto!)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--gray-400)]">
                (&minus;) En rubros no válidos
              </span>
              <span className="font-medium text-red-400">
                {data.accionesMejora! > 0 ? `-${formatCOP(data.accionesMejora!)}` : formatCOP(0)}
              </span>
            </div>
            <div className="my-1 border-t border-[var(--gray-800)]" />
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">= ICLD Validado</span>
              <span className="font-semibold text-white">{formatCOP(data.icldValidado ?? data.icldBruto!)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--gray-400)]">
                (&minus;) Deducciones fondos legales
              </span>
              <span className="font-medium text-[var(--gray-400)]">
                -{formatCOP(data.deduccionFondos ?? 0)}
              </span>
            </div>
            {/* Show reported vs calculated deduction comparison */}
            {data.deduccionReportada !== undefined && data.deduccionCalculada !== undefined && (
              <div className="ml-4 space-y-0.5 text-xs">
                <div className="flex justify-between text-[var(--gray-500)]">
                  <span>Reportada (datos CUIPO)</span>
                  <span>{formatCOP(data.deduccionReportada)}</span>
                </div>
                <div className="flex justify-between text-[var(--gray-500)]">
                  <span>Calculada (3%)</span>
                  <span>{formatCOP(data.deduccionCalculada)}</span>
                </div>
                {data.deduccionReportada > 0 && Math.abs(data.deduccionReportada - data.deduccionCalculada) > 1000 && (
                  <div className="mt-1 text-amber-400/80">
                    Diferencia: {formatCOP(Math.abs(data.deduccionReportada - data.deduccionCalculada))}
                  </div>
                )}
              </div>
            )}
            <div className="my-1 border-t border-[var(--gray-800)]" />
            <div className="flex items-center justify-between rounded-lg bg-[var(--gray-800)] px-3 py-2">
              <span
                className="font-semibold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                = ICLD Neto
              </span>
              <span
                className="font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatCOP(data.icldNeto ?? data.icldTotal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ICLD Detalle — collapsible per-rubro breakdown */}
      {data.icldDetalle && data.icldDetalle.length > 0 && (
        <div className="mb-6 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
          {/* Header row with toggle */}
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Detalle Rubros ICLD ({data.icldDetalle.length} rubros)
            </h3>
            <button
              onClick={() => setShowICLDDetalle((v) => !v)}
              className="rounded-lg border border-[var(--gray-700)] bg-[var(--gray-800)] px-3 py-1 text-xs text-[var(--gray-400)] transition-colors hover:border-[var(--gray-600)] hover:text-white"
            >
              {showICLDDetalle ? "Ocultar rubros ICLD" : "Ver rubros ICLD"}
            </button>
          </div>

          {showICLDDetalle && (() => {
            const sorted = [...data.icldDetalle!].sort((a, b) => b.recaudo - a.recaudo);
            const subtotalValidos = sorted.filter((d) => d.esValido).reduce((s, d) => s + d.recaudo, 0);
            const subtotalNoValidos = sorted.filter((d) => !d.esValido).reduce((s, d) => s + d.recaudo, 0);

            return (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--gray-700)] text-left text-[var(--gray-500)]">
                      <th className="py-2 pr-4 font-medium">Código</th>
                      <th className="py-2 pr-4 font-medium">Nombre</th>
                      <th className="py-2 pr-4 text-right font-medium">Recaudo</th>
                      <th className="py-2 text-center font-medium">¿Válido?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((d, i) => (
                      <tr
                        key={`${d.cuenta}-${i}`}
                        className={`border-b ${
                          d.esValido
                            ? "border-emerald-400/10 bg-emerald-400/5"
                            : "border-amber-400/10 bg-amber-400/5"
                        }`}
                      >
                        <td
                          className="py-2 pr-4 font-mono text-xs text-[var(--gray-400)]"
                          style={{ fontFamily: "Consolas, monospace" }}
                        >
                          {d.cuenta}
                        </td>
                        <td className="py-2 pr-4 text-[var(--gray-300)]">{d.nombre}</td>
                        <td className="py-2 pr-4 text-right text-[var(--gray-300)]">
                          {formatCOP(d.recaudo)}
                        </td>
                        <td className="py-2 text-center">
                          {d.esValido ? (
                            <span className="font-semibold text-emerald-400">SI ✓</span>
                          ) : (
                            <span className="font-semibold text-amber-400">
                              NO ✗ → Acción de mejora
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[var(--gray-700)]">
                      <td colSpan={2} className="py-2 pr-4 text-xs font-semibold text-emerald-400">
                        Subtotal Válidos
                      </td>
                      <td className="py-2 pr-4 text-right text-xs font-semibold text-emerald-400">
                        {formatCOP(subtotalValidos)}
                      </td>
                      <td />
                    </tr>
                    {subtotalNoValidos > 0 && (
                      <tr className="border-t border-[var(--gray-800)]">
                        <td colSpan={2} className="py-2 pr-4 text-xs font-semibold text-amber-400">
                          Subtotal No Válidos (acciones de mejora)
                        </td>
                        <td className="py-2 pr-4 text-right text-xs font-semibold text-amber-400">
                          {formatCOP(subtotalNoValidos)}
                        </td>
                        <td />
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* D1: Alertas ICLD — tipoNorma / fechaNorma issues */}
      {data.alertasICLD && data.alertasICLD.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5">
          <h3
            className="mb-3 text-sm font-semibold text-red-400"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Alertas ICLD ({data.alertasICLD.length})
          </h3>
          <p className="mb-3 text-xs text-red-400/80">
            Rubros con fuente ICLD que tienen tipoNorma o fechaNorma diferente a &quot;NO APLICA&quot;.
            Estos rubros no seran sujetos de considerarlos dentro de los ICLD.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-red-400/20 text-left text-red-400/60">
                  <th className="py-2 pr-3 font-medium">Cuenta</th>
                  <th className="py-2 pr-3 font-medium">Nombre</th>
                  <th className="py-2 pr-3 font-medium">Fuente</th>
                  <th className="py-2 pr-3 font-medium">Alerta</th>
                  <th className="py-2 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.alertasICLD.map((a, i) => (
                  <tr key={`${a.cuenta}-${i}`} className="border-b border-red-400/10">
                    <td className="py-2 pr-3 font-mono text-red-300/80">{a.cuenta}</td>
                    <td className="py-2 pr-3 text-red-300/80">{a.nombre}</td>
                    <td className="py-2 pr-3 text-red-300/60">{a.fuente.length > 40 ? a.fuente.slice(0, 40) + "..." : a.fuente}</td>
                    <td className="py-2 pr-3 text-red-300/80">{a.alerta}</td>
                    <td className="py-2 text-right text-red-300">{formatCOP(a.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* D2: Acciones de Mejora desagregadas */}
      {(data.accionesMejora ?? 0) > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="mt-0.5 text-amber-400">!</span>
            <div>
              <p className="text-sm font-semibold text-amber-400">
                Acciones de Mejora: {formatCOP(data.accionesMejora!)} en rubros que no cuentan como ICLD
              </p>
              <p className="mt-1 text-xs text-amber-400/80">
                Este valor fue registrado en fuentes de libre destinacion pero en cuentas que la
                Contraloria no acepta. Reclasificar mejoraria el indicador.
              </p>
            </div>
          </div>

          {/* Categorized breakdown from Johan's typology */}
          <div className="space-y-3">
            {ACCIONES_MEJORA.map((cat, catIdx) => {
              // Detect which items apply based on current data
              const applicableItems = cat.items.map((item) => {
                const lower = item.toLowerCase();
                let applies = false;

                // Category 1: Errores aritmeticos
                if (lower.includes("compromisos mayores a presupuesto")) {
                  // Would need presupuesto definitivo vs compromisos
                  applies = false; // Cannot determine without full data
                }
                if (lower.includes("obligaciones mayores a los compromisos")) {
                  applies = false; // Cannot determine here
                }
                if (lower.includes("pagos mayores a las obligaciones")) {
                  applies = false; // Cannot determine here
                }

                // Category 2: Clasificadores
                if (lower.includes("uso de fuentes en rubros no permitidos")) {
                  applies = (data.accionesMejora ?? 0) > 0;
                }

                // Category 4: Ley 617
                if (lower.includes("rubros que no suman para el indicador")) {
                  applies = (data.accionesMejora ?? 0) > 0;
                }
                if (lower.includes("combinaciones que no suman para el indicador")) {
                  applies = (data.accionesMejora ?? 0) > 0;
                }

                return { item, applies };
              });

              const hasApplicable = applicableItems.some((a) => a.applies);

              return (
                <div key={catIdx} className="rounded-lg border border-amber-500/10 bg-amber-500/5 px-4 py-3">
                  <h4 className="mb-2 text-xs font-semibold text-amber-300">
                    {catIdx + 1}. {cat.categoria}
                    {hasApplicable && (
                      <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] text-amber-400">
                        DETECTADO
                      </span>
                    )}
                  </h4>
                  <ul className="space-y-1 text-xs">
                    {applicableItems.map(({ item, applies }, itemIdx) => (
                      <li
                        key={itemIdx}
                        className={`flex items-start gap-2 ${
                          applies ? "text-amber-300" : "text-amber-400/50"
                        }`}
                      >
                        <span className="mt-0.5 flex-shrink-0">
                          {applies ? "\u25CF" : "\u25CB"}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gastos Deducibles table */}
      {data.gastosDeducidosDetalle && data.gastosDeducidosDetalle.length > 0 && (
        <div className="mb-6 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
          <h3
            className="mb-3 text-sm font-semibold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Gastos deducidos del funcionamiento
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--gray-700)] text-left text-[var(--gray-500)]">
                  <th className="py-2 pr-4 font-medium">Código</th>
                  <th className="py-2 pr-4 font-medium">Nombre</th>
                  <th className="py-2 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.gastosDeducidosDetalle.map((item) => (
                  <tr
                    key={item.codigo}
                    className="border-b border-[var(--gray-800)]/50"
                  >
                    <td className="py-2 pr-4 font-mono text-[var(--gray-500)]">
                      {item.codigo}
                    </td>
                    <td className="py-2 pr-4 text-[var(--gray-300)]">{item.nombre}</td>
                    <td className="py-2 text-right text-[var(--gray-300)]">
                      {formatCOP(item.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--gray-700)]">
                  <td
                    colSpan={2}
                    className="py-2 pr-4 font-semibold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Total deducido
                  </td>
                  <td
                    className="py-2 text-right font-bold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {formatCOP(data.gastosDeducidos ?? data.gastosDeducidosDetalle.reduce((s, i) => s + i.valor, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Section cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {data.secciones.map((s) => {
          const tipoLimite = s.tipoLimite ?? "porcentaje";
          if (tipoLimite === "absoluto") {
            return <AbsoluteSectionCard key={s.seccion} s={s} />;
          }
          return <PercentageSectionCard key={s.seccion} s={s} />;
        })}
      </div>

      {/* D4: Destinaciones Específicas informational table */}
      {data.icldNeto !== undefined && (
        <div className="mb-6 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
          <h3
            className="mb-2 text-sm font-semibold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Destinaciones Especificas
          </h3>
          <p className="mb-4 text-xs text-[var(--gray-500)]">
            Porcentajes del ICLD asignados por acto administrativo municipal. Estos valores son
            configurables por cada entidad territorial (edicion en futuras versiones).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--gray-700)] text-left text-[var(--gray-500)]">
                  <th className="py-2 pr-4 font-medium">Destinacion</th>
                  <th className="py-2 pr-4 text-right font-medium">% ICLD</th>
                  <th className="py-2 pr-4 text-right font-medium">Valor estimado</th>
                  <th className="py-2 font-medium">Acto administrativo</th>
                </tr>
              </thead>
              <tbody>
                {DESTINACIONES_ESPECIFICAS_DEFAULT.map((d, i) => {
                  const valorEstimado = (d.porcentajeICLD / 100) * (data.icldNeto ?? data.icldTotal);
                  return (
                    <tr key={i} className="border-b border-[var(--gray-800)]/50">
                      <td className="py-2 pr-4 text-[var(--gray-300)]">{d.nombre}</td>
                      <td className="py-2 pr-4 text-right text-[var(--gray-400)]">
                        {d.porcentajeICLD > 0 ? `${d.porcentajeICLD}%` : "Por configurar"}
                      </td>
                      <td className="py-2 pr-4 text-right text-[var(--gray-400)]">
                        {d.porcentajeICLD > 0 ? formatCOP(valorEstimado) : "-"}
                      </td>
                      <td className="py-2 text-[var(--gray-500)]">{d.actoAdministrativo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10px] text-[var(--gray-600)]">
            Nota: Los porcentajes se configuran por municipio segun sus actos administrativos. Los
            valores en 0% indican que el municipio aun no ha registrado su porcentaje.
          </p>
        </div>
      )}

      {/* Historical CGR Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-[var(--gray-400)]">
            Certificacion oficial CGR (historico 2011-2020)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--gray-700)] text-left text-[var(--gray-500)]">
                  <th className="py-2 pr-3 font-medium">Vigencia</th>
                  <th className="py-2 pr-3 font-medium">Categoria</th>
                  <th className="py-2 pr-3 text-right font-medium">ICLD Neto</th>
                  <th className="py-2 pr-3 text-right font-medium">Gastos Func.</th>
                  <th className="py-2 pr-3 text-right font-medium">Indicador</th>
                  <th className="py-2 text-right font-medium">Limite</th>
                </tr>
              </thead>
              <tbody>
                {certifications.map((c) => {
                  const cumple = c.indicadorLey617 <= c.limiteGF;
                  return (
                    <tr key={c.vigencia} className="border-b border-[var(--gray-800)]/50">
                      <td className="py-2 pr-3 font-medium text-white">{c.vigencia}</td>
                      <td className="py-2 pr-3 text-[var(--gray-400)]">{c.categoria}</td>
                      <td className="py-2 pr-3 text-right text-[var(--gray-300)]">{formatCOP(c.icldNeto)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--gray-300)]">{formatCOP(c.gastosFuncionamiento)}</td>
                      <td className={`py-2 pr-3 text-right font-medium ${cumple ? "text-emerald-400" : "text-red-400"}`}>
                        {c.indicadorLey617.toFixed(1)}%
                      </td>
                      <td className="py-2 text-right text-[var(--gray-500)]">{c.limiteGF}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-[var(--gray-600)]">
            Fuente: datos.gov.co/resource/vztn-viv4 — Certificacion CGR Ley 617
          </p>
        </div>
      )}

      {/* Footer note */}
      <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/50 px-4 py-3 text-xs text-[var(--gray-500)]">
        <strong className="text-[var(--gray-400)]">Nota:</strong> La Ley
        617/2000 establece limites al gasto de funcionamiento de las entidades
        territoriales. Art. 6: Administracion Central con limite como % de ICLD
        segun categoria. Art. 10: Concejos con limite absoluto en SMLMV. Art. 11:
        Personerias con limite absoluto en SMLMV. El incumplimiento puede derivar
        en planes de ajuste fiscal y restricciones presupuestales.
      </div>
    </div>
  );
}
