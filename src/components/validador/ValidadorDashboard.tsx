"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Database,
  Download,
  FileText,
  FileCheck,
  Landmark,
  Loader2,
  MapPin,
  Receipt,
  RefreshCw,
  Scale,
  ShieldCheck,
  TrendingUp,
  Upload,
} from "lucide-react";
import { exportValidacionesToExcel } from "@/lib/excel-exporter";
import type { Municipio } from "@/data/municipios";
import type { FUTCierreData, CGNSaldosData, MapaInversionesData, CuipoData } from "@/lib/chip-parser";
import {
  buildValidationRun,
  DEMO_VALIDATION_PERIOD,
  formatValidationPeriodLabel,
  hasDemoValidationFixtures,
  type ValidationModuleStatus,
  type ValidationRun,
} from "@/lib/validation-run";
import EquilibrioPanel from "./EquilibrioPanel";
import SGPPanel from "./SGPPanel";
import Ley617Panel from "./Ley617Panel";
import IDFPanel from "./IDFPanel";
import FileUploadPanel from "./FileUploadPanel";
import CierreVsCuipoPanel from "./CierreVsCuipoPanel";
import EficienciaFiscalPanel from "./EficienciaFiscalPanel";
import CGAPanel from "./CGAPanel";
import AguaPotablePanel from "./AguaPotablePanel";
import MapaInversionesPanel from "./MapaInversionesPanel";

interface ValidationResult {
  status: ValidationModuleStatus;
  label: string;
  detail?: string;
}

const VALIDACIONES = [
  { id: "equilibrio", icon: Scale, label: "Equilibrio Presupuestal" },
  { id: "sgp", icon: Banknote, label: "Evaluación SGP" },
  { id: "ley-617", icon: Landmark, label: "Ley 617 Funcionamiento" },
  { id: "idf", icon: TrendingUp, label: "Desempeño Fiscal (IDF)" },
  { id: "cierre-cuipo", icon: FileCheck, label: "Cierre FUT vs CUIPO" },
  { id: "cga", icon: ShieldCheck, label: "Equilibrio CGA" },
  { id: "eficiencia", icon: Receipt, label: "Eficiencia Fiscal" },
  { id: "agua", icon: Database, label: "Evaluación Agua Potable" },
  { id: "mapa", icon: MapPin, label: "Mapa de Inversiones (PDM)" },
];

function StatusBadge({ status }: { status: ValidationResult["status"] }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    cumple: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "CUMPLE" },
    no_cumple: { bg: "bg-red-500/15", text: "text-red-400", label: "NO CUMPLE" },
    parcial: { bg: "bg-amber-500/15", text: "text-amber-400", label: "PARCIAL" },
    pendiente: { bg: "bg-[var(--gray-800)]", text: "text-[var(--gray-500)]", label: "PENDIENTE" },
    loading: { bg: "bg-[var(--gray-800)]", text: "text-[var(--gray-400)]", label: "..." },
    error: { bg: "bg-red-500/15", text: "text-red-400", label: "ERROR" },
    upload_needed: { bg: "bg-blue-500/15", text: "text-blue-400", label: "REQUIERE INSUMO" },
  };
  const c = config[status] ?? config.pendiente;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}>
      {status === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === "error" && <AlertTriangle className="h-3 w-3" />}
      {status === "upload_needed" && <Upload className="h-3 w-3" />}
      {c.label}
    </span>
  );
}

function periodoLabel(p: string): string {
  return formatValidationPeriodLabel(p);
}

function statusTone(status: ValidationRun["summary"]["status"]) {
  if (status === "cumple") {
    return {
      border: "border-emerald-500/25",
      bg: "bg-emerald-500/5",
      text: "text-emerald-400",
      icon: CheckCircle2,
    };
  }
  if (status === "riesgo_medio") {
    return {
      border: "border-amber-500/25",
      bg: "bg-amber-500/5",
      text: "text-amber-400",
      icon: AlertTriangle,
    };
  }
  return {
    border: "border-red-500/25",
    bg: "bg-red-500/5",
    text: "text-red-400",
    icon: AlertTriangle,
  };
}

function runModeLabel(mode: ValidationRun["runMode"]): string {
  if (mode === "demo_fixture") return "Demo precargado";
  if (mode === "mixed") return "Mixta";
  return "API pública";
}

function RunCoverageBand({ run }: { run: ValidationRun }) {
  const visibleWarnings = run.warnings.filter((item) => item.severity !== "info").slice(0, 2);

  return (
    <section className="mb-4 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)]/80 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--ochre)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--ochre)]">
              {runModeLabel(run.runMode)}
            </span>
            <span className="text-sm font-medium text-white">{run.coverage.periodLabel}</span>
          </div>
          <p className="mt-1 text-xs text-[var(--gray-400)]">{run.coverage.dataSourcesSummary}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:flex sm:text-left">
          <div className="rounded-lg bg-[var(--gray-800)] px-3 py-2">
            <div className="font-semibold text-white">{run.coverage.completeModules}</div>
            <div className="text-[var(--gray-500)]">completas</div>
          </div>
          <div className="rounded-lg bg-amber-500/10 px-3 py-2">
            <div className="font-semibold text-amber-300">{run.coverage.partialModules}</div>
            <div className="text-[var(--gray-500)]">parciales</div>
          </div>
          <div className="rounded-lg bg-blue-500/10 px-3 py-2">
            <div className="font-semibold text-blue-300">{run.coverage.blockedModules}</div>
            <div className="text-[var(--gray-500)]">bloqueadas</div>
          </div>
        </div>
      </div>
      {visibleWarnings.length > 0 && (
        <div className="mt-3 space-y-2">
          {visibleWarnings.map((item) => (
            <div key={item.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-100">
              <span className="font-semibold">{item.title}: </span>
              <span className="text-amber-100/80">{item.detail}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ExecutiveSummary({ run }: { run: ValidationRun }) {
  const tone = statusTone(run.summary.status);
  const SummaryIcon = tone.icon;
  const missing = run.summary.missingInputs.slice(0, 4);

  return (
    <section className={`mb-6 rounded-2xl border ${tone.border} ${tone.bg} p-5`}>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <SummaryIcon className={`h-5 w-5 ${tone.text}`} />
            <h2
              className="text-lg font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Resumen ejecutivo
            </h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone.text} bg-black/20`}>
              {run.summary.label}
            </span>
          </div>
          <p className="text-sm text-[var(--gray-300)]">{run.summary.detail}</p>
          <div className="mt-4 rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)]/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
              Próxima acción
            </div>
            <p className="mt-1 text-sm font-medium text-white">{run.summary.nextAction}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
            Hallazgos críticos
          </h3>
          {run.summary.topFindings.length > 0 ? (
            <div className="space-y-2">
              {run.summary.topFindings.map((finding) => (
                <div key={`${finding.moduleId}-${finding.title}`} className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)]/70 p-3">
                  <div className="text-sm font-semibold text-white">{finding.title}</div>
                  <p className="mt-1 text-xs text-[var(--gray-400)]">{finding.detail}</p>
                  <p className="mt-2 text-xs font-medium text-[var(--ochre)]">{finding.nextAction}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)]/70 p-3 text-sm text-[var(--gray-400)]">
              Sin hallazgos críticos en las validaciones disponibles.
            </p>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--gray-500)]">
            Insumos faltantes
          </h3>
          {missing.length > 0 ? (
            <div className="space-y-2">
              {missing.map((input) => (
                <div key={input.key} className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)]/70 p-3">
                  <div className="text-sm font-semibold text-white">{input.label}</div>
                  <p className="mt-1 text-xs text-[var(--gray-400)]">{input.excludedReason ?? input.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)]/70 p-3 text-sm text-[var(--gray-400)]">
              Todos los insumos clave disponibles para esta corrida.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function loadingResults(): Record<string, ValidationResult> {
  return Object.fromEntries(
    VALIDACIONES.map((v) => [
      v.id,
      { status: "loading" as const, label: "Calculando..." },
    ]),
  );
}

function resultsFromRun(run: ValidationRun): Record<string, ValidationResult> {
  return Object.fromEntries(
    run.modules.map((module) => [
      module.id,
      {
        status: module.status,
        label: module.label,
        detail: module.summary,
      },
    ]),
  );
}

export default function ValidadorDashboard({ municipio }: { municipio: Municipio }) {
  const [periodo, setPeriodo] = useState("");
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [results, setResults] = useState<Record<string, ValidationResult>>({});
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [validationRun, setValidationRun] = useState<ValidationRun | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const [futCierre, setFutCierre] = useState<FUTCierreData | null>(null);
  const [futCierre2024, setFutCierre2024] = useState<FUTCierreData | null>(null);
  const [cgnSaldos, setCgnSaldos] = useState<CGNSaldosData | null>(null);
  const [cgnSaldosI, setCgnSaldosI] = useState<CGNSaldosData | null>(null);
  const [mapaData, setMapaData] = useState<MapaInversionesData | null>(null);
  const [cuipoData, setCuipoData] = useState<CuipoData | null>(null);

  useEffect(() => {
    async function loadPeriodos() {
      setLoadingPeriodos(true);
      try {
        const res = await fetch(
          `/api/plataforma/cuipo?action=periodos&chip=${municipio.chipCode}`,
        );
        if (res.status === 401) {
          window.location.href = "/plataforma/login";
          return;
        }
        const data = await res.json();
        if (data.ok && data.periodos.length > 0) {
          const apiPeriodos = data.periodos.filter((p: string) => p !== DEMO_VALIDATION_PERIOD);
          const nextPeriodos = hasDemoValidationFixtures(municipio)
            ? [DEMO_VALIDATION_PERIOD, ...apiPeriodos]
            : apiPeriodos;
          setPeriodos(nextPeriodos);
          setPeriodo(nextPeriodos[0]);
        }
      } catch {
        setPeriodos([]);
      } finally {
        setLoadingPeriodos(false);
      }
    }
    if (municipio.chipCode) loadPeriodos();
  }, [municipio.chipCode]);

  const runAll = useCallback(async () => {
    if (!periodo || !municipio.chipCode) return;

    setRunError(null);
    setResults(loadingResults());
    setValidationRun(null);

    try {
      const run = await buildValidationRun({
        municipio,
        periodo,
        includeFixtures: true,
        uploads: {
          futCierre,
          futCierre2024,
          cgnSaldos,
          cgnSaldosI,
          mapaData,
          cuipoData,
        },
      });
      setValidationRun(run);
      setResults(resultsFromRun(run));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error calculando validaciones";
      setRunError(message);
      setResults((prev) => {
        const errorResults: Record<string, ValidationResult> = {};
        for (const key of Object.keys(prev)) {
          errorResults[key] = { status: "error", label: message };
        }
        return errorResults;
      });
    }
  }, [
    periodo,
    municipio,
    futCierre,
    futCierre2024,
    cgnSaldos,
    cgnSaldosI,
    mapaData,
    cuipoData,
  ]);

  useEffect(() => {
    if (periodo) runAll();
  }, [periodo, runAll]);

  const handleExportExcel = useCallback(() => {
    if (!validationRun) return;
    exportValidacionesToExcel({
      municipio: validationRun.municipio,
      periodo: validationRun.periodo,
      equilibrio: validationRun.data.equilibrio,
      cierreVsCuipo: validationRun.data.cierreVsCuipo,
      ley617: validationRun.data.ley617,
      cga: validationRun.data.cga,
      agua: validationRun.data.agua,
      sgp: validationRun.data.sgp,
      eficiencia: validationRun.data.eficiencia,
      idf: validationRun.data.idf,
      mapaInversiones: validationRun.data.mapaInversiones,
      validationRun,
    });
  }, [validationRun]);

  const counts = useMemo(
    () =>
      Object.values(results).reduce(
        (acc, r) => {
          if (r.status === "cumple") acc.cumple++;
          else if (r.status === "no_cumple") acc.noCumple++;
          else if (r.status === "parcial") acc.parcial++;
          else if (r.status === "loading") acc.loading++;
          else if (r.status === "upload_needed") acc.uploadNeeded++;
          return acc;
        },
        { cumple: 0, noCumple: 0, parcial: 0, loading: 0, uploadNeeded: 0 },
      ),
    [results],
  );

  const data = validationRun?.data;
  const isRunning = Object.values(results).some((result) => result.status === "loading");
  const effectiveFutCierre = data?.futCierre ?? futCierre;
  const effectiveFutCierre2024 = data?.futCierre2024 ?? futCierre2024;
  const effectiveCgnSaldos = data?.cgnSaldos ?? cgnSaldos;
  const effectiveCgnSaldosI = data?.cgnSaldosI ?? cgnSaldosI;
  const effectiveMapaData = data?.mapaData ?? mapaData;
  const effectiveCuipoData = data?.cuipoData ?? cuipoData;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Período de análisis
          </label>
          {loadingPeriodos ? (
            <div className="flex items-center gap-2 text-sm text-[var(--gray-400)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando períodos...
            </div>
          ) : periodos.length === 0 ? (
            <div className="text-sm text-red-400">Sin datos CUIPO para este municipio</div>
          ) : (
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="col-span-2 rounded-lg border border-[var(--gray-700)] bg-[var(--gray-800)] px-4 py-2 text-sm text-white outline-none focus:border-[var(--ochre)] sm:col-span-1"
              >
                {periodos.map((p) => (
                  <option key={p} value={p}>
                    {p === DEMO_VALIDATION_PERIOD ? periodoLabel(p) : `${periodoLabel(p)} · API pública`}
                  </option>
                ))}
              </select>
              <Link
                href={`/plataforma/validador/${municipio.code}/reporte?periodo=${periodo}`}
                aria-disabled={!validationRun || isRunning}
                className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[var(--ochre)] px-3 py-2 text-xs font-semibold text-white transition-all hover:brightness-110 ${
                  !validationRun || isRunning ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Reporte
              </Link>
              <button
                onClick={runAll}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[var(--gray-700)] px-3 py-2 text-xs text-[var(--gray-400)] transition-colors hover:border-[var(--ochre)] hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Recalcular
              </button>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  showUpload
                    ? "border-[var(--ochre)] text-[var(--ochre)]"
                    : "border-[var(--gray-700)] text-[var(--gray-400)] hover:border-[var(--ochre)] hover:text-white"
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Insumos
              </button>
              <button
                onClick={handleExportExcel}
                className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1"
                disabled={!validationRun?.data.equilibrio || isRunning}
              >
                <Download className="h-4 w-4" />
                Descargar Excel
              </button>
            </div>
          )}
        </div>

        {periodo && (
          <div className="flex flex-wrap items-center gap-2">
            {counts.cumple > 0 && (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                {counts.cumple} Cumple
              </span>
            )}
            {counts.noCumple > 0 && (
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">
                {counts.noCumple} No cumple
              </span>
            )}
            {counts.parcial > 0 && (
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
                {counts.parcial} Parcial
              </span>
            )}
            {counts.uploadNeeded > 0 && (
              <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-400">
                {counts.uploadNeeded} Requiere insumo
              </span>
            )}
            {counts.loading > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--gray-800)] px-3 py-1 text-xs text-[var(--gray-400)]">
                <Loader2 className="h-3 w-3 animate-spin" /> {counts.loading}
              </span>
            )}
          </div>
        )}
      </div>

      {runError && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {runError}
        </div>
      )}

      {validationRun && <RunCoverageBand run={validationRun} />}
      {validationRun && <ExecutiveSummary run={validationRun} />}

      {showUpload && (
        <div className="mb-6">
          <FileUploadPanel
            inputSources={validationRun?.inputSources ?? []}
            onFUTCierreLoaded={setFutCierre}
            onFUTCierre2024Loaded={setFutCierre2024}
            onCGNSaldosLoaded={setCgnSaldos}
            onCGNSaldosILoaded={setCgnSaldosI}
            onMapaInversionesLoaded={setMapaData}
            onCuipoDataLoaded={setCuipoData}
            futCierre={effectiveFutCierre}
            futCierre2024={effectiveFutCierre2024}
            cgnSaldos={effectiveCgnSaldos}
            cgnSaldosI={effectiveCgnSaldosI}
            mapaInversiones={effectiveMapaData}
            cuipoData={effectiveCuipoData}
          />
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {VALIDACIONES.map((v) => {
          const result = results[v.id];
          const isActive = activePanel === v.id;
          const isClickable =
            result &&
            result.status !== "pendiente" &&
            result.status !== "loading" &&
            result.status !== "error";

          return (
            <button
              key={v.id}
              onClick={() => {
                if (result?.status === "upload_needed") {
                  setShowUpload(true);
                  setActivePanel(null);
                  return;
                }
                if (isClickable) setActivePanel(isActive ? null : v.id);
              }}
              className={`group rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-[var(--ochre)] bg-[var(--ochre)]/5"
                  : "border-[var(--gray-800)] bg-[var(--gray-900)] hover:border-[var(--gray-700)]"
              } ${!isClickable && result?.status !== "upload_needed" ? "opacity-60" : "cursor-pointer"}`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <v.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[var(--ochre)]" : "text-[var(--gray-500)]"}`} />
                <StatusBadge status={result?.status ?? "pendiente"} />
              </div>
              <div className="text-sm font-medium text-white">{v.label}</div>
              {result?.detail && (
                <div className="mt-1 line-clamp-2 text-xs text-[var(--gray-400)]">{result.detail}</div>
              )}
            </button>
          );
        })}
      </div>

      {activePanel === "equilibrio" && data?.equilibrio && (
        <EquilibrioPanel data={data.equilibrio} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "sgp" && data?.sgp && (
        <SGPPanel data={data.sgp} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "ley-617" && data?.ley617 && (
        <Ley617Panel data={data.ley617} certifications={data.ley617Certifications} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "idf" && data?.idf && (
        <IDFPanel data={data.idf} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "cierre-cuipo" && (
        <CierreVsCuipoPanel data={data?.cierreVsCuipo ?? null} />
      )}
      {activePanel === "cga" && data?.cga && (
        <CGAPanel data={data.cga} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "eficiencia" && data?.eficiencia && (
        <EficienciaFiscalPanel data={data.eficiencia} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "agua" && <AguaPotablePanel data={data?.agua ?? null} />}
      {activePanel === "mapa" && <MapaInversionesPanel data={data?.mapaInversiones ?? null} />}
    </div>
  );
}
