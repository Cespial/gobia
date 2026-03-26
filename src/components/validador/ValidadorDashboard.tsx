"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Scale,
  FileCheck,
  Landmark,
  ShieldCheck,
  Droplets,
  Banknote,
  Receipt,
  TrendingUp,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Upload,
} from "lucide-react";
import type { Municipio } from "@/data/municipios";
import type { FUTCierreData, CGNSaldosData } from "@/lib/chip-parser";
import type { SGPEvaluationResult, SGPComponentResult } from "@/lib/validaciones/sgp";
import type { Ley617Result } from "@/lib/validaciones/ley617";
import type { IDFResult } from "@/lib/validaciones/idf";
import type { Ley617Certification } from "@/lib/datos-gov-cuipo";
import EquilibrioPanel from "./EquilibrioPanel";
import SGPPanel from "./SGPPanel";
import Ley617Panel from "./Ley617Panel";
import IDFPanel from "./IDFPanel";
import FileUploadPanel from "./FileUploadPanel";
import CierreVsCuipoPanel from "./CierreVsCuipoPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValidationResult {
  status: "cumple" | "no_cumple" | "parcial" | "pendiente" | "loading" | "error" | "upload_needed";
  label: string;
  detail?: string;
}

interface EquilibrioData {
  totalIngresos: number;
  totalGastos: number;
  totalPagos: number;
  superavit: number;
  pctEjecucion: number;
  porFuente: {
    codigo: string;
    nombre: string;
    recaudo: number;
    compromisos: number;
    obligaciones: number;
    pagos: number;
    superavit: number;
  }[];
}

const VALIDACIONES = [
  { id: "equilibrio", icon: Scale, label: "Equilibrio Presupuestal", auto: true },
  { id: "sgp", icon: Banknote, label: "Evaluación SGP", auto: true },
  { id: "ley-617", icon: Landmark, label: "Ley 617 Funcionamiento", auto: true },
  { id: "idf", icon: TrendingUp, label: "Desempeño Fiscal (IDF)", auto: true },
  { id: "cierre-cuipo", icon: FileCheck, label: "Cierre FUT vs CUIPO", auto: false },
  { id: "cga", icon: ShieldCheck, label: "Equilibrio CGA", auto: false },
  { id: "eficiencia", icon: Receipt, label: "Eficiencia Fiscal", auto: false },
  { id: "agua", icon: Droplets, label: "Evaluación Agua Potable", auto: true },
];

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ValidationResult["status"] }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    cumple: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "CUMPLE" },
    no_cumple: { bg: "bg-red-500/15", text: "text-red-400", label: "NO CUMPLE" },
    parcial: { bg: "bg-amber-500/15", text: "text-amber-400", label: "PARCIAL" },
    pendiente: { bg: "bg-[var(--gray-800)]", text: "text-[var(--gray-500)]", label: "—" },
    loading: { bg: "bg-[var(--gray-800)]", text: "text-[var(--gray-400)]", label: "..." },
    error: { bg: "bg-red-500/15", text: "text-red-400", label: "ERROR" },
    upload_needed: { bg: "bg-blue-500/15", text: "text-blue-400", label: "REQUIERE ARCHIVO" },
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

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString("es-CO")}`;
}

function periodoLabel(p: string): string {
  const year = p.slice(0, 4);
  const month = parseInt(p.slice(4, 6));
  const labels: Record<number, string> = { 3: "T1", 6: "T2", 9: "T3", 12: "T4" };
  return `${labels[month] || month} ${year}`;
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function ValidadorDashboard({ municipio }: { municipio: Municipio }) {
  const [periodo, setPeriodo] = useState("");
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [results, setResults] = useState<Record<string, ValidationResult>>({});
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Data stores
  const [equilibrioData, setEquilibrioData] = useState<EquilibrioData | null>(null);
  const [sgpData, setSgpData] = useState<SGPEvaluationResult | null>(null);
  const [ley617Data, setLey617Data] = useState<Ley617Result | null>(null);
  const [idfData, setIdfData] = useState<IDFResult | null>(null);
  const [futCierre, setFutCierre] = useState<FUTCierreData | null>(null);
  const [cgnSaldos, setCgnSaldos] = useState<CGNSaldosData | null>(null);
  const [ley617Certifications, setLey617Certifications] = useState<Ley617Certification[]>([]);

  // -----------------------------------------------------------------------
  // Fetch periods
  // -----------------------------------------------------------------------
  useEffect(() => {
    async function loadPeriodos() {
      setLoadingPeriodos(true);
      try {
        const res = await fetch(
          `/api/plataforma/cuipo?action=periodos&chip=${municipio.chipCode}`
        );
        const data = await res.json();
        if (data.ok && data.periodos.length > 0) {
          setPeriodos(data.periodos);
          setPeriodo(data.periodos[0]);
        }
      } catch {
        setPeriodos([]);
      } finally {
        setLoadingPeriodos(false);
      }
    }
    if (municipio.chipCode) loadPeriodos();
  }, [municipio.chipCode]);

  // -----------------------------------------------------------------------
  // Generic fetch helper
  // -----------------------------------------------------------------------
  const runValidation = useCallback(
    async (id: string, action: string, extraParams: string = "") => {
      setResults((prev) => ({ ...prev, [id]: { status: "loading", label: "Calculando..." } }));
      try {
        const res = await fetch(
          `/api/plataforma/cuipo?action=${action}&chip=${municipio.chipCode}&periodo=${periodo}${extraParams}`
        );
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);
        return data;
      } catch (err) {
        setResults((prev) => ({
          ...prev,
          [id]: { status: "error", label: err instanceof Error ? err.message : "Error" },
        }));
        return null;
      }
    },
    [municipio.chipCode, periodo]
  );

  // -----------------------------------------------------------------------
  // Run ALL validations when period changes
  // -----------------------------------------------------------------------
  const runAll = useCallback(async () => {
    if (!periodo || !municipio.chipCode) return;

    // Mark upload-dependent validations
    const needsUpload = !futCierre;
    setResults((prev) => ({
      ...prev,
      "cierre-cuipo": { status: needsUpload ? "upload_needed" : "pendiente", label: "Requiere FUT Cierre" },
      cga: { status: needsUpload ? "upload_needed" : "pendiente", label: "Requiere FUT Cierre" },
      eficiencia: { status: !cgnSaldos ? "upload_needed" : "pendiente", label: "Requiere CGN Saldos" },
    }));

    // 1. Equilibrio
    const eqData = await runValidation("equilibrio", "equilibrio");
    if (eqData) {
      setEquilibrioData(eqData.equilibrio);
      const diff = Math.abs(eqData.equilibrio.totalIngresos - eqData.equilibrio.totalGastos);
      const tol = eqData.equilibrio.totalIngresos * 0.01;
      setResults((prev) => ({
        ...prev,
        equilibrio: {
          status: diff <= tol ? "cumple" : "no_cumple",
          label: "Equilibrio Presupuestal",
          detail: `Ingresos ${formatCOP(eqData.equilibrio.totalIngresos)} vs Gastos ${formatCOP(eqData.equilibrio.totalGastos)} — ${eqData.equilibrio.pctEjecucion.toFixed(1)}%`,
        },
      }));
    }

    // 2. SGP
    const sgpResult = await runValidation(
      "sgp",
      "sgp",
      `&dane=${municipio.code}&dept=${municipio.deptCode}`
    );
    if (sgpResult) {
      setSgpData(sgpResult.sgp);
      setResults((prev) => ({
        ...prev,
        sgp: {
          status: sgpResult.sgp.status,
          label: "Evaluación SGP",
          detail: `Ejecutado ${sgpResult.sgp.pctEjecucionGlobal.toFixed(1)}% del SGP distribuido (${sgpResult.sgp.componentes.length} componentes)`,
        },
      }));
    }

    // 3. Ley 617 (calculated + official certifications in parallel)
    const [ley617Result, ley617OfficialResult] = await Promise.all([
      runValidation("ley-617", "ley617"),
      fetch(`/api/plataforma/cuipo?action=ley617oficial&chip=${municipio.chipCode}`)
        .then(r => r.json())
        .catch(() => null),
    ]);
    if (ley617Result) {
      setLey617Data(ley617Result.ley617);
      setResults((prev) => ({
        ...prev,
        "ley-617": {
          status: ley617Result.ley617.status,
          label: "Ley 617",
          detail: `Funcionamiento ${ley617Result.ley617.ratioGlobal.toFixed(1)}% del ICLD (límite: ${ley617Result.ley617.limiteGlobal}%)`,
        },
      }));
    }
    if (ley617OfficialResult?.ok) {
      setLey617Certifications(ley617OfficialResult.certifications);
    }

    // 4. IDF
    const idfResult = await runValidation("idf", "idf");
    if (idfResult) {
      setIdfData(idfResult.idf);
      setResults((prev) => ({
        ...prev,
        idf: {
          status: idfResult.idf.status,
          label: "IDF",
          detail: `${idfResult.idf.ranking}: ${idfResult.idf.idfTotal.toFixed(1)}/100`,
        },
      }));
    }

    // 5. Agua Potable (derived from SGP water component)
    if (sgpResult) {
      const aguaComp = sgpResult.sgp.componentes.find(
        (c: SGPComponentResult) => c.concepto.toLowerCase().includes("agua")
      );
      setResults((prev) => ({
        ...prev,
        agua: aguaComp
          ? {
              status: aguaComp.pctEjecucion >= 80 ? "cumple" : aguaComp.pctEjecucion >= 50 ? "parcial" : "no_cumple",
              label: "Agua Potable",
              detail: `Ejecutado ${aguaComp.pctEjecucion.toFixed(1)}% del SGP-APSB (${formatCOP(aguaComp.ejecutado)} de ${formatCOP(aguaComp.distribucionDNP)})`,
            }
          : { status: "error", label: "Sin datos de agua potable en SGP" },
      }));
    }
  }, [periodo, municipio, runValidation, futCierre, cgnSaldos]);

  useEffect(() => {
    if (periodo) runAll();
  }, [periodo, runAll]);

  // -----------------------------------------------------------------------
  // Count summary
  // -----------------------------------------------------------------------
  const counts = Object.values(results).reduce(
    (acc, r) => {
      if (r.status === "cumple") acc.cumple++;
      else if (r.status === "no_cumple") acc.noCumple++;
      else if (r.status === "parcial") acc.parcial++;
      else if (r.status === "loading") acc.loading++;
      return acc;
    },
    { cumple: 0, noCumple: 0, parcial: 0, loading: 0 }
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div>
      {/* Period selector + summary */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
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
            <div className="flex items-center gap-2">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="rounded-lg border border-[var(--gray-700)] bg-[var(--gray-800)] px-4 py-2 text-sm text-white outline-none focus:border-[var(--ochre)]"
              >
                {periodos.map((p) => (
                  <option key={p} value={p}>{periodoLabel(p)}</option>
                ))}
              </select>
              <button
                onClick={runAll}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--gray-700)] px-3 py-2 text-xs text-[var(--gray-400)] transition-colors hover:border-[var(--ochre)] hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Recalcular
              </button>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  showUpload
                    ? "border-[var(--ochre)] text-[var(--ochre)]"
                    : "border-[var(--gray-700)] text-[var(--gray-400)] hover:border-[var(--ochre)] hover:text-white"
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Cargar archivos CHIP
              </button>
            </div>
          )}
        </div>

        {/* Summary pills */}
        {periodo && (
          <div className="flex items-center gap-2">
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
            {counts.loading > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--gray-800)] px-3 py-1 text-xs text-[var(--gray-400)]">
                <Loader2 className="h-3 w-3 animate-spin" /> {counts.loading}
              </span>
            )}
          </div>
        )}
      </div>

      {/* File upload panel (collapsible) */}
      {showUpload && (
        <div className="mb-6">
          <FileUploadPanel
            onFUTCierreLoaded={setFutCierre}
            onCGNSaldosLoaded={setCgnSaldos}
            futCierre={futCierre}
            cgnSaldos={cgnSaldos}
          />
        </div>
      )}

      {/* Validation semaphore grid */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {VALIDACIONES.map((v) => {
          const result = results[v.id];
          const isActive = activePanel === v.id;
          const isClickable =
            result &&
            result.status !== "pendiente" &&
            result.status !== "loading" &&
            result.status !== "upload_needed";

          return (
            <button
              key={v.id}
              onClick={() => {
                if (isClickable) setActivePanel(isActive ? null : v.id);
                if (result?.status === "upload_needed") setShowUpload(true);
              }}
              className={`group rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-[var(--ochre)] bg-[var(--ochre)]/5"
                  : "border-[var(--gray-800)] bg-[var(--gray-900)] hover:border-[var(--gray-700)]"
              } ${!isClickable ? "opacity-60" : "cursor-pointer"}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <v.icon className={`h-5 w-5 ${isActive ? "text-[var(--ochre)]" : "text-[var(--gray-500)]"}`} />
                <StatusBadge status={result?.status ?? "pendiente"} />
              </div>
              <div className="text-sm font-medium text-white">{v.label}</div>
              {result?.detail && (
                <div className="mt-1 text-xs text-[var(--gray-400)] line-clamp-2">{result.detail}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail panels */}
      {activePanel === "equilibrio" && equilibrioData && (
        <EquilibrioPanel data={equilibrioData} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "sgp" && sgpData && (
        <SGPPanel data={sgpData} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "ley-617" && ley617Data && (
        <Ley617Panel data={ley617Data} certifications={ley617Certifications} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "idf" && idfData && (
        <IDFPanel data={idfData} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "cierre-cuipo" && futCierre && equilibrioData && (
        <CierreVsCuipoPanel
          futCierre={futCierre}
          equilibrioData={equilibrioData}
          periodo={periodo}
          municipio={municipio}
        />
      )}
    </div>
  );
}
