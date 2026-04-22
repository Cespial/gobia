"use client";

import { useState, useEffect, useCallback } from "react";
import { FileDown, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { Municipio } from "@/data/municipios";
import { parseFUTCierre, parseCGNSaldos, parseCuipoFiles } from "@/lib/chip-parser";
import { evaluateCierreVsCuipo } from "@/lib/validaciones/cierre-vs-cuipo";
import { evaluateEficienciaFiscal } from "@/lib/validaciones/eficiencia-fiscal";
import { evaluateAguaPotable } from "@/lib/validaciones/agua-potable";
import { evaluateSGP } from "@/lib/validaciones/sgp";
import { calculateIDF } from "@/lib/validaciones/idf";

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}MM`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

interface ValidationSummary {
  name: string;
  status: "cumple" | "no_cumple" | "parcial" | "error";
  detail: string;
  metrics?: { label: string; value: string }[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ReportView({ municipio }: { municipio: Municipio }) {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("");
  const [validations, setValidations] = useState<ValidationSummary[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const chip = municipio.chipCode;
      if (!chip) { setLoading(false); return; }

      try {
        const periodsRes = await fetch(`/api/plataforma/cuipo?action=periodos&chip=${chip}`);
        const { periodos } = await periodsRes.json();
        if (!periodos?.length) { setLoading(false); return; }
        const p = periodos[0];
        setPeriodo(p);

        const [eq, ley, leyOf] = await Promise.all([
          fetch(`/api/plataforma/cuipo?action=equilibrio&chip=${chip}&periodo=${p}`).then(r => r.json()).catch(() => null),
          fetch(`/api/plataforma/cuipo?action=ley617&chip=${chip}&periodo=${p}`).then(r => r.json()).catch(() => null),
          fetch(`/api/plataforma/cuipo?action=ley617oficial&chip=${chip}`).then(r => r.json()).catch(() => null),
        ]);

        const results: ValidationSummary[] = [];

        async function loadFixture(path: string): Promise<ArrayBuffer | null> {
          try { const r = await fetch(path); return r.ok ? r.arrayBuffer() : null; } catch { return null; }
        }

        const code = municipio.code;
        const cuipoNames = [
          "cuipo_prog_ing", "cuipo_ejec_ing",
          "cuipo_prog_gas", "cuipo_ejec_gas",
        ];
        const [futBuf25, futBuf24, cgnBuf4, cgnBuf1, ...cuipoBufs] = await Promise.all([
          loadFixture(`/fixtures/${code}/fut_cierre_2025.xlsx`),
          loadFixture(`/fixtures/${code}/fut_cierre_2024.xlsx`),
          loadFixture(`/fixtures/${code}/cgn_saldos_IV.xlsx`),
          loadFixture(`/fixtures/${code}/cgn_saldos_I.xlsx`),
          ...cuipoNames.map((name) => loadFixture(`/fixtures/${code}/${name}.xlsx`)),
        ]);

        const futData25 = futBuf25 ? parseFUTCierre(futBuf25) : null;
        const futData24 = futBuf24 ? parseFUTCierre(futBuf24) : null;
        const cgnData4 = cgnBuf4 ? parseCGNSaldos(cgnBuf4) : null;
        const cgnData1 = cgnBuf1 ? parseCGNSaldos(cgnBuf1) : null;
        const validCuipo = cuipoBufs
          .map((buf, i) => buf ? { name: `${cuipoNames[i]}.xlsx`, buffer: buf } : null)
          .filter((item): item is { name: string; buffer: ArrayBuffer } => item !== null);
        const cuipoData = validCuipo.length > 0 ? parseCuipoFiles(validCuipo) : null;
        const progIngresosUpload = cuipoData?.progIngresos ?? null;
        const [sgp, idf, aguaResult] = await Promise.all([
          evaluateSGP(chip, municipio.code, municipio.deptCode, p, progIngresosUpload).catch(() => null),
          calculateIDF(
            chip,
            p,
            cgnData4 ? { activos: cgnData4.activos, pasivos: cgnData4.pasivos } : null,
            progIngresosUpload
          ).catch(() => null),
          evaluateAguaPotable(
            chip,
            municipio.code,
            municipio.deptCode,
            p,
            municipio.sgpTotal,
            progIngresosUpload
          ).catch(() => null),
        ]);

        // Equilibrio
        if (eq?.ok) {
          const e = eq.equilibrio;
          const diff = Math.abs(e.totalIngresos - e.totalGastos);
          results.push({
            name: "Equilibrio Presupuestal",
            status: diff <= e.totalIngresos * 0.01 ? "cumple" : "no_cumple",
            detail: `Ejecución: ${e.pctEjecucion.toFixed(1)}% — ${e.porFuente.length} fuentes`,
            metrics: [
              { label: "Total Ingresos", value: formatCOP(e.totalIngresos) },
              { label: "Total Compromisos", value: formatCOP(e.totalGastos) },
              { label: "Total Pagos", value: formatCOP(e.totalPagos) },
              { label: "Superávit", value: formatCOP(e.superavit) },
            ],
          });
        }

        // SGP
        if (sgp) {
          const s = sgp;
          results.push({
            name: "Evaluación SGP",
            status: s.status,
            detail: s.hasProgramacionData
              ? `${s.pctEjecucionGlobal.toFixed(1)}% ejecutado — ${s.componentes.length} componentes`
              : `${s.pctEjecucionGlobal.toFixed(1)}% ejecutado — presupuesto N/D hasta cargar PROG_ING`,
            metrics: s.componentes.map((c: any) => ({
              label: c.concepto,
              value: `${c.pctEjecucion.toFixed(1)}% (${c.status})`,
            })),
          });
        }

        // Ley 617
        if (ley?.ok) {
          const l = ley.ley617;
          results.push({
            name: "Ley 617/2000",
            status: l.status,
            detail: `Ratio: ${(l.ratioGlobal * 100).toFixed(1)}% — Límite: ${(l.limiteGlobal * 100).toFixed(0)}%`,
            metrics: [
              { label: "ICLD", value: formatCOP(l.icldTotal) },
              { label: "Gastos Funcionamiento", value: formatCOP(l.gastosFuncionamientoTotal) },
              ...l.secciones.map((s: any) => ({
                label: s.seccion.replace("ENTIDADES TERRITORIALES - ", ""),
                value: s.tipoLimite === "absoluto"
                  ? `${formatCOP(s.gastosFuncionamiento)} / ${formatCOP(s.limiteAbsoluto)} (${s.status === "cumple" ? "OK" : "ALERTA"})`
                  : `${(s.ratio * 100).toFixed(1)}% / ${(s.limite * 100).toFixed(0)}% (${s.status === "cumple" ? "OK" : "ALERTA"})`,
              })),
            ],
          });
        }

        // Ley 617 Oficial
        if (leyOf?.ok && leyOf.certifications?.length > 0) {
          const latest = leyOf.certifications[0];
          results.push({
            name: "Certificación CGR Ley 617",
            status: latest.indicadorLey617 <= latest.limiteGF ? "cumple" : "no_cumple",
            detail: `${leyOf.certifications.length} vigencias (${leyOf.certifications[leyOf.certifications.length - 1].vigencia}-${latest.vigencia})`,
            metrics: [
              { label: `Última vigencia (${latest.vigencia})`, value: `${latest.indicadorLey617}% (Cat. ${latest.categoria})` },
              { label: "ICLD certificado", value: formatCOP(latest.icldNeto) },
            ],
          });
        }

        // IDF
        if (idf) {
          const i = idf;
          results.push({
            name: "Desempeño Fiscal (IDF)",
            status: i.status,
            detail: `${i.ranking}: ${i.idfTotal.toFixed(1)}/100`,
            metrics: [
              { label: "Score Resultados (80%)", value: `${i.scoreResultados.toFixed(1)}` },
              { label: "Score Gestión (20%)", value: `${i.scoreGestion.toFixed(1)}` },
              ...i.resultadosFiscales.map((ind: any) => ({
                label: ind.name,
                value: ind.score !== null ? `${ind.score.toFixed(0)} pts` : "N/D",
              })),
            ],
          });
        }

        // Cierre FUT vs CUIPO
        if (futData25 && futData25.rows.length > 0 && eq?.ok) {
          const cierreResult = evaluateCierreVsCuipo(futData25, eq.equilibrio.porFuente);
          const diffCount = cierreResult.cruces.filter(
            (c: any) => c.consolidacion !== null && (Math.abs(c.diffSaldoLibros) > 1 || Math.abs(c.diffReservas) > 1 || Math.abs(c.diffCxP) > 1)
          ).length;
          results.push({
            name: "Cierre FUT vs CUIPO",
            status: cierreResult.status === "cumple" ? "cumple" : "no_cumple",
            detail: diffCount === 0 ? "Todos los cruces coinciden" : `${diffCount} diferencia(s) encontrada(s)`,
            metrics: [
              { label: "Diff Saldo Libros", value: formatCOP(cierreResult.totalDiffSaldoLibros) },
              { label: "Diff Reservas", value: formatCOP(cierreResult.totalDiffReservas) },
              { label: "Diff CxP", value: formatCOP(cierreResult.totalDiffCxP) },
            ],
          });
        } else {
          results.push({ name: "Cierre FUT vs CUIPO", status: "parcial", detail: "Requiere carga de archivo FUT Cierre", metrics: [] });
        }

        // CGA
        if (futData25 && futData25.rows.length > 0 && eq?.ok) {
          try {
            const { evaluateCGA } = await import("@/lib/validaciones/cga");
            const cgaResult = await evaluateCGA(chip, p, futData25, futData24, {
              pptoInicialIngresos: eq.equilibrio.pptoInicialIngresos ?? 0,
              pptoInicialGastos: eq.equilibrio.pptoInicialGastos ?? 0,
              pptoDefinitivoIngresos: eq.equilibrio.pptoDefinitivoIngresos ?? 0,
              pptoDefinitivoGastos: eq.equilibrio.pptoDefinitivoGastos ?? 0,
              totalReservas: eq.equilibrio.totalReservas ?? 0,
              totalCxP: eq.equilibrio.totalCxP ?? 0,
              superavit: eq.equilibrio.superavit ?? 0,
            });
            const failCount = cgaResult.checks.filter((c: any) => c.status === "no_cumple").length;
            results.push({
              name: "Equilibrio CGA",
              status: cgaResult.status === "cumple" ? "cumple" : cgaResult.status === "pendiente" ? "parcial" : "no_cumple",
              detail: `${cgaResult.checks.length} chequeos — ${failCount} no cumple`,
              metrics: cgaResult.checks.map((c: any) => ({
                label: c.name,
                value: c.status === "pendiente" ? "Pendiente" : c.status === "cumple" ? "Cumple" : `No cumple (diff: ${formatCOP(Math.abs(c.difference))})`,
              })),
            });
          } catch {
            results.push({ name: "Equilibrio CGA", status: "parcial", detail: "Error al calcular", metrics: [] });
          }
        } else {
          results.push({ name: "Equilibrio CGA", status: "parcial", detail: "Requiere carga de archivo FUT Cierre", metrics: [] });
        }

        // Eficiencia Fiscal
        if (cgnData4 && cgnData4.rows.length > 0) {
          try {
            const efResult = await evaluateEficienciaFiscal(chip, p, cgnData4, cgnData1);
            results.push({
              name: "Eficiencia Fiscal",
              status: efResult.status === "cumple" ? "cumple" : efResult.status === "pendiente" ? "parcial" : "no_cumple",
              detail: `${efResult.refrendaCount} impuestos refrendados de ${efResult.tributos.length}`,
              metrics: efResult.tributos.filter((t: any) => t.cuipoTotal > 0).map((t: any) => ({
                label: t.name,
                value: t.refrenda === null ? "Sin CGN" : t.refrenda ? `SI (var ${t.variancePct?.toFixed(1)}%)` : `NO (var ${t.variancePct?.toFixed(1)}%)`,
              })),
            });
          } catch {
            results.push({ name: "Eficiencia Fiscal", status: "parcial", detail: "Error al calcular", metrics: [] });
          }
        } else {
          results.push({ name: "Eficiencia Fiscal", status: "parcial", detail: "Requiere carga de CGN Saldos", metrics: [] });
        }

        // Agua Potable
        if (aguaResult) {
          results.push({
            name: "Evaluación Agua Potable",
            status: aguaResult.status,
            detail: aguaResult.hasProgramacionData
              ? `${aguaResult.subValidaciones.filter((s: any) => s.status === "cumple").length}/${aguaResult.subValidaciones.length} sub-validaciones cumplen`
              : "Asignación de recursos pendiente hasta cargar PROG_ING",
            metrics: aguaResult.subValidaciones.map((s: any) => ({
              label: s.nombre,
              value: s.porcentaje !== null ? `${s.porcentaje.toFixed(1)}% (${s.status})` : s.status,
            })),
          });
        }

        setValidations(results);
      } catch (err) {
        console.error("Report fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [municipio]);

  const generatePDF = useCallback(async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE VALIDACIÓN FISCAL", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 107, 107);
    doc.text(`Municipio: ${municipio.name} (${municipio.dept.charAt(0) + municipio.dept.slice(1).toLowerCase()})`, 14, 32);
    doc.text(`Código DANE: ${municipio.code} | CHIP: ${municipio.chipCode}`, 14, 38);
    doc.text(`Período: ${periodo} | SGP 2025: ${formatCOP(municipio.sgpTotal)}`, 14, 44);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}`, 14, 50);
    doc.text("Plataforma: Gobia — gobia.co/plataforma/validador", 14, 56);

    // Ochre line
    doc.setDrawColor(184, 149, 106);
    doc.setLineWidth(0.5);
    doc.line(14, 60, 196, 60);

    // Summary table
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: 66,
      head: [["#", "Validación", "Estado", "Detalle"]],
      body: validations.map((v, i) => [
        String(i + 1),
        v.name,
        v.status === "cumple" ? "CUMPLE" : v.status === "no_cumple" ? "NO CUMPLE" : "PARCIAL",
        v.detail,
      ]),
      headStyles: { fillColor: [26, 26, 26], textColor: [184, 149, 106], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 248, 246] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 45 },
        2: { cellWidth: 25 },
        3: { cellWidth: "auto" },
      },
      didParseCell: (data: any) => {
        if (data.column.index === 2 && data.section === "body") {
          const val = data.cell.raw;
          if (val === "CUMPLE") data.cell.styles.textColor = [16, 185, 129];
          else if (val === "NO CUMPLE") data.cell.styles.textColor = [239, 68, 68];
          else data.cell.styles.textColor = [245, 158, 11];
        }
      },
    });

    // Detailed metrics for each validation
    let yPos = (doc as any).lastAutoTable?.finalY + 10 || 140;

    for (const v of validations) {
      if (!v.metrics?.length) continue;

      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 26);
      doc.text(v.name, 14, yPos);
      yPos += 2;

      autoTable(doc, {
        startY: yPos,
        head: [["Indicador", "Valor"]],
        body: v.metrics.map((m) => [m.label, m.value]),
        headStyles: { fillColor: [64, 64, 64], textColor: [184, 149, 106], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
        columnStyles: { 0: { cellWidth: 90 } },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable?.finalY + 8 || yPos + 40;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Gobia — Validador Fiscal Municipal | Página ${i} de ${pageCount}`,
        14,
        290
      );
      doc.text("gobia.co", 180, 290);
    }

    doc.save(`reporte-fiscal-${municipio.code}-${municipio.name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  }, [municipio, periodo, validations]);

  // Period label
  const periodoLabel = periodo
    ? `${({ "03": "T1", "06": "T2", "09": "T3", "12": "T4" } as Record<string, string>)[periodo.slice(4, 6)] || ""} ${periodo.slice(0, 4)}`
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--ochre)]" />
        <span className="ml-3 text-[var(--gray-400)]">Generando reporte...</span>
      </div>
    );
  }

  const cumpleCount = validations.filter((v) => v.status === "cumple").length;
  const noCount = validations.filter((v) => v.status === "no_cumple").length;
  const parcialCount = validations.filter((v) => v.status === "parcial").length;

  return (
    <div>
      {/* Report card */}
      <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Reporte de Validación Fiscal
            </h1>
            <div className="mt-2 space-y-1 text-sm text-[var(--gray-400)]">
              <p>
                <span className="text-white font-medium">{municipio.name}</span>
                {" — "}
                {municipio.dept.charAt(0) + municipio.dept.slice(1).toLowerCase()}
              </p>
              <p>
                DANE {municipio.code} | CHIP {municipio.chipCode} | Período{" "}
                {periodoLabel}
              </p>
              <p>SGP 2025: {formatCOP(municipio.sgpTotal)}</p>
              <p className="text-xs text-[var(--gray-500)]">
                {new Date().toLocaleDateString("es-CO", {
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
            className="flex items-center gap-2 rounded-xl bg-[var(--ochre)] px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
          >
            <FileDown className="h-4 w-4" />
            Descargar PDF
          </button>
        </div>

        {/* Summary pills */}
        <div className="mb-8 flex items-center gap-3">
          {cumpleCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {cumpleCount} Cumple
            </div>
          )}
          {noCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-400">
              <XCircle className="h-4 w-4" />
              {noCount} No cumple
            </div>
          )}
          {parcialCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              {parcialCount} Parcial
            </div>
          )}
        </div>

        {/* Validation cards grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {validations.map((v) => (
            <div
              key={v.name}
              className={`rounded-xl border p-5 ${
                v.status === "cumple"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : v.status === "no_cumple"
                  ? "border-red-500/20 bg-red-500/5"
                  : "border-amber-500/20 bg-amber-500/5"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{v.name}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    v.status === "cumple"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : v.status === "no_cumple"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {v.status === "cumple" ? "CUMPLE" : v.status === "no_cumple" ? "NO CUMPLE" : "PARCIAL"}
                </span>
              </div>
              <p className="mb-3 text-xs text-[var(--gray-400)]">{v.detail}</p>
              {v.metrics && v.metrics.length > 0 && (
                <div className="space-y-1">
                  {v.metrics.slice(0, 6).map((m) => (
                    <div key={m.label} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--gray-500)]">{m.label}</span>
                      <span className="font-medium text-[var(--gray-300)]">{m.value}</span>
                    </div>
                  ))}
                  {v.metrics.length > 6 && (
                    <p className="text-[10px] text-[var(--gray-600)]">
                      +{v.metrics.length - 6} indicadores más en el PDF
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-[var(--gray-800)] pt-4 text-center text-xs text-[var(--gray-600)]">
          Generado por{" "}
          <span className="text-[var(--ochre)]" style={{ fontFamily: "var(--font-display)" }}>
            Gobia
          </span>{" "}
          — Plataforma de gestión pública inteligente | gobia.co
        </div>
      </div>
    </div>
  );
}
