"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileDown, Loader2, XCircle } from "lucide-react";
import type { Municipio } from "@/data/municipios";
import {
  buildValidationRun,
  formatValidationPeriodLabel,
  type ValidationInputSource,
  type ValidationModuleResult,
  type ValidationModuleStatus,
  type ValidationRun,
} from "@/lib/validation-run";

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e6) {
    const m = value / 1e6;
    return `$${Math.abs(m) >= 1000 ? Math.round(m).toLocaleString("es-CO") : m.toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function periodoLabel(periodo: string): string {
  return formatValidationPeriodLabel(periodo);
}

function statusLabel(status: ValidationModuleStatus): string {
  if (status === "cumple") return "CUMPLE";
  if (status === "no_cumple") return "NO CUMPLE";
  if (status === "upload_needed") return "REQUIERE INSUMO";
  if (status === "error") return "ERROR";
  if (status === "loading") return "CALCULANDO";
  if (status === "pendiente") return "PENDIENTE";
  return "PARCIAL";
}

function statusClasses(status: ValidationModuleStatus): string {
  if (status === "cumple") return "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
  if (status === "no_cumple" || status === "error") return "border-red-500/20 bg-red-500/5 text-red-400";
  if (status === "upload_needed") return "border-blue-500/20 bg-blue-500/5 text-blue-400";
  return "border-amber-500/20 bg-amber-500/5 text-amber-400";
}

function sourceLabel(source: string): string {
  if (source === "api") return "API pública";
  if (source === "fixture") return "Demo precargado";
  if (source === "uploaded") return "Archivo cargado";
  return "Faltante";
}

function runModeLabel(mode: ValidationRun["runMode"]): string {
  if (mode === "demo_fixture") return "Demo precargado";
  if (mode === "mixed") return "Mixta";
  return "API pública";
}

function inputStatusLabel(status: ValidationInputSource["status"]): string {
  if (status === "available") return "Usado";
  if (status === "partial") return "Parcial";
  if (status === "excluded") return "Excluido";
  return "Faltante";
}

function inputStatusClasses(input: ValidationInputSource): string {
  if (input.status === "available" && input.source === "fixture") return "border-[var(--ochre)]/30 bg-[var(--ochre)]/10 text-[var(--ochre)]";
  if (input.status === "available") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  if (input.status === "excluded") return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  if (input.status === "partial") return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  return "border-red-500/20 bg-red-500/10 text-red-300";
}

function warningClasses(severity: "info" | "medium" | "high"): string {
  if (severity === "high") return "border-red-500/25 bg-red-500/10 text-red-200";
  if (severity === "medium") return "border-amber-500/25 bg-amber-500/10 text-amber-200";
  return "border-blue-500/25 bg-blue-500/10 text-blue-200";
}

function inputDetail(input: ValidationInputSource): string {
  return input.excludedReason ?? input.detail;
}

function inputPeriodMeta(input: ValidationInputSource): string[] {
  return [
    input.rows !== undefined ? `${input.rows} filas` : "",
    input.period || "",
    input.expectedPeriod ? `Esperado: ${input.expectedPeriod}` : "",
    input.actualPeriod ? `Detectado: ${input.actualPeriod}` : "",
  ].filter(Boolean);
}

function ModuleCard({ module }: { module: ValidationModuleResult }) {
  return (
    <div className={`rounded-xl border p-5 ${statusClasses(module.status)}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{module.label}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusClasses(module.status)}`}>
          {statusLabel(module.status)}
        </span>
      </div>
      <p className="mb-3 text-xs text-[var(--gray-400)]">{module.summary}</p>
      {module.metrics.length > 0 && (
        <div className="space-y-1">
          {module.metrics.slice(0, 6).map((metric) => (
            <div key={`${module.id}-${metric.label}`} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[var(--gray-500)]">{metric.label}</span>
              <span className="text-right font-medium text-[var(--gray-300)]">{metric.value}</span>
            </div>
          ))}
          {module.metrics.length > 6 && (
            <p className="text-[10px] text-[var(--gray-600)]">
              +{module.metrics.length - 6} indicadores más en el PDF
            </p>
          )}
        </div>
      )}
      {module.nextAction && (
        <div className="mt-4 rounded-lg border border-[var(--gray-800)] bg-[var(--gray-900)]/70 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gray-500)]">
            Acción recomendada
          </div>
          <p className="mt-1 text-xs text-[var(--gray-300)]">{module.nextAction}</p>
        </div>
      )}
    </div>
  );
}

export default function ReportView({
  municipio,
  periodo,
}: {
  municipio: Municipio;
  periodo?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [run, setRun] = useState<ValidationRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRun() {
      setLoading(true);
      setError(null);
      try {
        const nextRun = await buildValidationRun({
          municipio,
          periodo,
          includeFixtures: true,
        });
        if (!cancelled) setRun(nextRun);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error generando reporte");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRun();
    return () => {
      cancelled = true;
    };
  }, [municipio, periodo]);

  const counts = useMemo(() => {
    const modules = run?.modules ?? [];
    return {
      cumple: modules.filter((m) => m.status === "cumple").length,
      noCumple: modules.filter((m) => m.status === "no_cumple").length,
      parcial: modules.filter((m) => m.status === "parcial" || m.status === "pendiente").length,
      requiere: modules.filter((m) => m.status === "upload_needed").length,
    };
  }, [run]);

  const generatePDF = useCallback(async () => {
    if (!run) return;

    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE VALIDACIÓN FISCAL", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 107, 107);
    doc.text(`Municipio: ${run.municipio.name} (${run.municipio.dept.charAt(0) + run.municipio.dept.slice(1).toLowerCase()})`, 14, 32);
    doc.text(`Código DANE: ${run.municipio.code} | CHIP: ${run.municipio.chipCode}`, 14, 38);
    doc.text(`Período: ${periodoLabel(run.periodo)} | Modo: ${runModeLabel(run.runMode)} | SGP 2025: ${formatCOP(municipio.sgpTotal)}`, 14, 44);
    doc.text(`Generado: ${new Date(run.generatedAt).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}`, 14, 50);
    doc.text(`Versión de reglas: ${run.ruleVersion}`, 14, 56);

    doc.setDrawColor(184, 149, 106);
    doc.setLineWidth(0.5);
    doc.line(14, 60, 196, 60);

    let yPos = 66;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text("Metodología", 14, yPos);
    yPos += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const methodologyLines = doc.splitTextToSize(
      `Este reporte replica la misma corrida usada por el dashboard y los anexos Excel. Las validaciones usan la versión ${run.ruleVersion}; las fuentes pueden ser API pública, demo precargado, archivo cargado, faltantes o excluidas por período.`,
      182,
    ) as string[];
    doc.text(methodologyLines, 14, yPos);
    yPos += methodologyLines.length * 4 + 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Cobertura", "Valor"]],
      body: [
        ["Estado global", `${run.summary.label} - ${run.summary.detail}`],
        ["Período seleccionado", run.coverage.periodLabel],
        ["Modo de corrida", runModeLabel(run.runMode)],
        ["Insumos", `${run.coverage.availableInputs} usados, ${run.coverage.missingInputs} faltantes, ${run.coverage.excludedInputs} excluidos`],
        ["Validaciones", `${run.coverage.completeModules} completas, ${run.coverage.partialModules} parciales, ${run.coverage.blockedModules} bloqueadas`],
      ],
      headStyles: { fillColor: [26, 26, 26], textColor: [184, 149, 106], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 248, 246] },
      columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 140 } },
      margin: { left: 14, right: 14 },
    });

    yPos = ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yPos) + 8;

    if (run.warnings.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [["Advertencia", "Severidad", "Detalle"]],
        body: run.warnings.map((warning) => [
          warning.title,
          warning.severity.toUpperCase(),
          warning.detail,
        ]),
        headStyles: { fillColor: [64, 64, 64], textColor: [184, 149, 106], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
        columnStyles: {
          0: { cellWidth: 44 },
          1: { cellWidth: 24 },
          2: { cellWidth: 114 },
        },
        margin: { left: 14, right: 14 },
      });
      yPos = ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yPos) + 8;
    }

    if (run.summary.topFindings.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [["Hallazgo priorizado", "Severidad", "Acción"]],
        body: run.summary.topFindings.map((finding) => [
          `${finding.title}\n${finding.detail}`,
          finding.severity.toUpperCase(),
          finding.nextAction,
        ]),
        headStyles: { fillColor: [64, 64, 64], textColor: [184, 149, 106], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
        columnStyles: {
          0: { cellWidth: 72 },
          1: { cellWidth: 24 },
          2: { cellWidth: 86 },
        },
        margin: { left: 14, right: 14 },
      });
      yPos = ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yPos) + 8;
    }

    autoTable(doc, {
      startY: yPos,
      head: [["Validación", "Estado", "Resumen", "Acción recomendada"]],
      body: run.modules.map((module) => [
        module.label,
        statusLabel(module.status),
        module.summary,
        module.nextAction,
      ]),
      headStyles: { fillColor: [26, 26, 26], textColor: [184, 149, 106], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 248, 246] },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 28 },
        2: { cellWidth: 58 },
        3: { cellWidth: 54 },
      },
    });

    yPos = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120;
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text("Fuentes e insumos", 14, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [["Insumo", "Estado", "Fuente", "Período", "Detalle"]],
      body: run.inputSources.map((input) => [
        input.label,
        inputStatusLabel(input.status),
        sourceLabel(input.source),
        input.actualPeriod || input.period || input.expectedPeriod || "",
        inputPeriodMeta(input).length
          ? `${inputDetail(input)}\n${inputPeriodMeta(input).join(" | ")}`
          : inputDetail(input),
      ]),
      headStyles: { fillColor: [64, 64, 64], textColor: [184, 149, 106], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 248, 246] },
      columnStyles: {
        0: { cellWidth: 44 },
        1: { cellWidth: 24 },
        2: { cellWidth: 30 },
        3: { cellWidth: 28 },
        4: { cellWidth: 56 },
      },
      margin: { left: 14, right: 14 },
    });

    yPos = ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yPos) + 10;

    for (const module of run.modules) {
      if (!module.metrics.length) continue;
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 26);
      doc.text(module.label, 14, yPos);
      yPos += 2;

      autoTable(doc, {
        startY: yPos,
        head: [["Indicador", "Valor"]],
        body: module.metrics.map((metric) => [metric.label, metric.value]),
        headStyles: { fillColor: [64, 64, 64], textColor: [184, 149, 106], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
        columnStyles: { 0: { cellWidth: 90 } },
        margin: { left: 14, right: 14 },
      });

      yPos = ((doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yPos) + 8;
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`Gobia - Validador Fiscal Municipal | Página ${i} de ${pageCount}`, 14, 290);
      doc.text("gobia.co", 180, 290);
    }

    doc.save(`reporte-fiscal-${run.municipio.code}-${run.municipio.name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  }, [municipio.sgpTotal, run]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--ochre)]" />
        <span className="ml-3 text-[var(--gray-400)]">Generando reporte...</span>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-sm text-red-300">
        {error || "No fue posible generar el reporte."}
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5 sm:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Reporte de Validación Fiscal
            </h1>
            <div className="mt-2 space-y-1 text-sm text-[var(--gray-400)]">
              <p>
                <span className="font-medium text-white">{run.municipio.name}</span>
                {" - "}
                {run.municipio.dept.charAt(0) + run.municipio.dept.slice(1).toLowerCase()}
              </p>
              <p>
                DANE {run.municipio.code} | CHIP {run.municipio.chipCode} | Período{" "}
                {periodoLabel(run.periodo)}
              </p>
              <p>SGP 2025: {formatCOP(municipio.sgpTotal)}</p>
              <p className="text-xs text-[var(--gray-500)]">
                {new Date(run.generatedAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <button
            onClick={generatePDF}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--ochre)] px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
          >
            <FileDown className="h-4 w-4" />
            Descargar PDF
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {counts.cumple > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {counts.cumple} Cumple
            </div>
          )}
          {counts.noCumple > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-400">
              <XCircle className="h-4 w-4" />
              {counts.noCumple} No cumple
            </div>
          )}
          {counts.parcial > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              {counts.parcial} Parcial
            </div>
          )}
          {counts.requiere > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-400">
              <AlertTriangle className="h-4 w-4" />
              {counts.requiere} Requiere insumo
            </div>
          )}
        </div>

        <div className="mb-8 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/45 p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ochre)]">
                Cobertura y advertencias
              </h2>
              <p className="mt-1 text-sm text-[var(--gray-300)]">{run.coverage.dataSourcesSummary}</p>
            </div>
            <span className="w-fit rounded-full border border-[var(--ochre)]/25 bg-[var(--ochre)]/10 px-3 py-1 text-xs font-semibold text-[var(--ochre)]">
              {runModeLabel(run.runMode)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
            <div className="rounded-lg border border-[var(--gray-700)] bg-[var(--gray-900)]/60 p-3">
              <div className="text-[var(--gray-500)]">Período</div>
              <div className="mt-1 font-semibold text-white">{run.coverage.periodLabel}</div>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="text-[var(--gray-500)]">Insumos usados</div>
              <div className="mt-1 font-semibold text-emerald-300">{run.coverage.availableInputs}</div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="text-[var(--gray-500)]">Parciales</div>
              <div className="mt-1 font-semibold text-amber-300">{run.coverage.partialModules}</div>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <div className="text-[var(--gray-500)]">Bloqueadas</div>
              <div className="mt-1 font-semibold text-red-300">{run.coverage.blockedModules}</div>
            </div>
          </div>
          {run.warnings.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {run.warnings.slice(0, 4).map((warning) => (
                <div key={warning.id} className={`rounded-lg border p-3 text-xs ${warningClasses(warning.severity)}`}>
                  <div className="font-semibold text-white">{warning.title}</div>
                  <p className="mt-1 text-current/85">{warning.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ochre)]">
            Metodología y trazabilidad
          </h2>
          <p className="mt-2 text-sm text-[var(--gray-300)]">
            Este reporte es una vista de la misma corrida usada por el dashboard. Las validaciones
            se calculan con la versión <span className="text-white">{run.ruleVersion}</span>, en modo{" "}
            <span className="text-white">{runModeLabel(run.runMode)}</span>, y conservan estado por
            fuente: usada, faltante, parcial o excluida.
          </p>
        </div>

        {run.summary.topFindings.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--gray-500)]">
              Hallazgos priorizados
            </h2>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {run.summary.topFindings.map((finding) => (
                <div key={`${finding.moduleId}-${finding.title}`} className={`rounded-xl border p-4 ${finding.severity === "blocked" ? "border-blue-500/20 bg-blue-500/5" : finding.severity === "high" ? "border-red-500/20 bg-red-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
                  <h3 className="text-sm font-semibold text-white">{finding.title}</h3>
                  <p className="mt-1 text-xs text-[var(--gray-400)]">{finding.detail}</p>
                  <p className="mt-3 text-xs font-medium text-[var(--ochre)]">{finding.nextAction}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--gray-600)]">
                    Destino: {finding.actionTarget.replace("input:", "insumo ").replace("module:", "módulo ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--gray-500)]">
            Fuentes e insumos
          </h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {run.inputSources.map((input) => (
              <div key={input.key} className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/40 p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold text-white">{input.label}</div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${inputStatusClasses(input)}`}>
                    {inputStatusLabel(input.status)}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--gray-500)]">{sourceLabel(input.source)}</p>
                <p className="mt-1 text-xs text-[var(--gray-400)]">{inputDetail(input)}</p>
                {inputPeriodMeta(input).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--gray-500)]">
                    {inputPeriodMeta(input).map((meta) => (
                      <span key={meta}>{meta}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {run.modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>

        <div className="mt-8 border-t border-[var(--gray-800)] pt-4 text-center text-xs text-[var(--gray-600)]">
          Generado por{" "}
          <span className="text-[var(--ochre)]" style={{ fontFamily: "var(--font-display)" }}>
            Gobia
          </span>{" "}
          - Plataforma de gestión pública inteligente | gobia.co
        </div>
      </div>
    </div>
  );
}
