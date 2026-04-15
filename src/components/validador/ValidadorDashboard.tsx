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
  MapPin,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Upload,
  Download,
} from "lucide-react";
import { exportValidacionesToExcel } from "@/lib/excel-exporter";
import type { Municipio } from "@/data/municipios";
import type { FUTCierreData, CGNSaldosData, MapaInversionesData } from "@/lib/chip-parser";
import type { SGPEvaluationResult } from "@/lib/validaciones/sgp";
import type { Ley617Result } from "@/lib/validaciones/ley617";
import type { IDFResult } from "@/lib/validaciones/idf";
import type { Ley617Certification } from "@/lib/datos-gov-cuipo";
import type { EficienciaFiscalResult } from "@/lib/validaciones/eficiencia-fiscal";
import type { CGAResult } from "@/lib/validaciones/cga";
import { evaluateCierreVsCuipo, type CierreVsCuipoResult } from "@/lib/validaciones/cierre-vs-cuipo";
import { evaluateAguaPotable, type AguaPotableResult } from "@/lib/validaciones/agua-potable";
import { evaluateMapaInversiones, type MapaInversionesResult } from "@/lib/validaciones/mapa-inversiones";
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
  totalCompromisos?: number;
  totalGastos?: number;
  totalObligaciones?: number;
  totalPagos: number;
  totalReservas?: number;
  totalCxP?: number;
  superavit: number;
  saldoEnLibros?: number;
  pctEjecucion: number;
  pptoInicialIngresos?: number;
  pptoInicialGastos?: number;
  pptoDefinitivoIngresos?: number;
  pptoDefinitivoGastos?: number;
  equilibrioInicial?: number;
  equilibrioDefinitivo?: number;
  totalReservasVigAnterior?: number;
  totalCxpVigAnterior?: number;
  totalValidador?: number;
  porFuente: {
    codigo: string;
    nombre: string;
    consolidacion: number | null;
    recaudo: number;
    compromisos: number;
    obligaciones: number;
    pagos: number;
    reservas: number;
    cxp: number;
    superavit: number;
    validador: number;
    reservasVigAnterior: number;
    cxpVigAnterior: number;
    saldoEnLibros?: number;
  }[];
}

const VALIDACIONES = [
  { id: "equilibrio", icon: Scale, label: "Equilibrio Presupuestal", auto: true },
  { id: "sgp", icon: Banknote, label: "Evaluación SGP", auto: true },
  { id: "ley-617", icon: Landmark, label: "Ley 617 Funcionamiento", auto: true },
  { id: "idf", icon: TrendingUp, label: "Desempeño Fiscal (IDF)", auto: true },
  { id: "cierre-cuipo", icon: FileCheck, label: "Cierre FUT vs CUIPO", auto: false },
  { id: "cga", icon: ShieldCheck, label: "Equilibrio CGA", auto: true },
  { id: "eficiencia", icon: Receipt, label: "Eficiencia Fiscal", auto: true },
  { id: "agua", icon: Droplets, label: "Evaluación Agua Potable", auto: true },
  { id: "mapa", icon: MapPin, label: "Mapa de Inversiones (PDM)", auto: false },
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
  const [futCierre2024, setFutCierre2024] = useState<FUTCierreData | null>(null);
  const [cgnSaldos, setCgnSaldos] = useState<CGNSaldosData | null>(null);
  const [cgnSaldosI, setCgnSaldosI] = useState<CGNSaldosData | null>(null);
  const [ley617Certifications, setLey617Certifications] = useState<Ley617Certification[]>([]);
  const [eficienciaData, setEficienciaData] = useState<EficienciaFiscalResult | null>(null);
  const [cgaData, setCgaData] = useState<CGAResult | null>(null);
  const [cierreVsCuipoData, setCierreVsCuipoData] = useState<CierreVsCuipoResult | null>(null);
  const [aguaData, setAguaData] = useState<AguaPotableResult | null>(null);
  const [mapaData, setMapaData] = useState<MapaInversionesData | null>(null);
  const [mapaInversionesData, setMapaInversionesData] = useState<MapaInversionesResult | null>(null);

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
      mapa: { status: !mapaData ? "upload_needed" : "loading", label: !mapaData ? "Requiere Mapa de Inversiones" : "Calculando..." },
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

      // Cierre vs CUIPO (if FUT is already loaded)
      if (futCierre && eqData?.equilibrio) {
        const cierreResult = evaluateCierreVsCuipo(futCierre, eqData.equilibrio.porFuente);
        setCierreVsCuipoData(cierreResult);
        const diffCount = cierreResult.cruces.filter(
          (c) => c.consolidacion !== null &&
          (Math.abs(c.diffSaldoLibros) > 1 || Math.abs(c.diffReservas) > 1 || Math.abs(c.diffCxP) > 1)
        ).length;
        setResults((prev) => ({
          ...prev,
          "cierre-cuipo": {
            status: cierreResult.status,
            label: "Cierre FUT vs CUIPO",
            detail: diffCount === 0
              ? "Todos los cruces coinciden"
              : `${diffCount} diferencia(s) encontrada(s)`,
          },
        }));
      }
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
          detail: `Funcionamiento ${(ley617Result.ley617.ratioGlobal * 100).toFixed(1)}% del ICLD (límite: ${(ley617Result.ley617.limiteGlobal * 100).toFixed(0)}%)`,
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

    // 5. Agua Potable (standalone)
    setResults((prev) => ({ ...prev, agua: { status: "loading", label: "Calculando..." } }));
    try {
      const aguaResult = await evaluateAguaPotable(
        municipio.chipCode, municipio.code, municipio.deptCode, periodo, municipio.sgpTotal
      );
      setAguaData(aguaResult);
      setResults((prev) => ({
        ...prev,
        agua: {
          status: aguaResult.status,
          label: "Evaluacion Agua Potable",
          detail: `${aguaResult.subValidaciones.filter(s => s.status === "cumple").length}/${aguaResult.subValidaciones.length} sub-validaciones cumplen`,
        },
      }));
    } catch {
      setResults((prev) => ({
        ...prev,
        agua: { status: "error", label: "Error evaluando Agua Potable" },
      }));
    }

    // 6. CGA (baseline via API — FUT-dependent checks upgraded by useEffect below)
    const cgaResult = await runValidation("cga", "cga");
    if (cgaResult?.cga) {
      setCgaData(cgaResult.cga);
      const checks = cgaResult.cga.checks;
      const noCumple = checks.filter((c: { status: string }) => c.status === "no_cumple").length;
      const pendiente = checks.filter((c: { status: string }) => c.status === "pendiente").length;
      setResults((prev) => ({
        ...prev,
        cga: {
          status: cgaResult.cga.status,
          label: "Equilibrio CGA",
          detail: `${checks.length} verificaciones — ${noCumple > 0 ? `${noCumple} no cumple` : pendiente > 0 ? `${checks.length - pendiente}/${checks.length} verificados` : "Todas cumplen"}`,
        },
      }));
    }

    // 7. Eficiencia Fiscal (automatic — CUIPO side only, CGN requires upload)
    const efResult = await runValidation("eficiencia", "eficiencia");
    if (efResult) {
      setEficienciaData(efResult.eficiencia);
      setResults((prev) => ({
        ...prev,
        eficiencia: {
          status: efResult.eficiencia.status,
          label: "Eficiencia Fiscal",
          detail: efResult.eficiencia.hasCGNData
            ? `${efResult.eficiencia.refrendaCount} refrendan, ${efResult.eficiencia.noRefrendaCount} no`
            : `${efResult.eficiencia.tributos.filter((t: { cuipoTotal: number }) => t.cuipoTotal > 0).length} tributos con recaudo — CGN pendiente`,
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, municipio, runValidation]);

  useEffect(() => {
    if (periodo) runAll();
  }, [periodo, runAll]);

  // Export all validation results to Excel
  const handleExportExcel = useCallback(() => {
    exportValidacionesToExcel({
      municipio: {
        name: municipio.name,
        code: municipio.code,
        chipCode: municipio.chipCode,
      },
      periodo,
      equilibrio: equilibrioData,
      cierreVsCuipo: cierreVsCuipoData,
      ley617: ley617Data,
      cga: cgaData,
      agua: aguaData,
      sgp: sgpData,
      eficiencia: eficienciaData,
      idf: idfData,
      mapaInversiones: mapaInversionesData,
    });
  }, [municipio, periodo, equilibrioData, cierreVsCuipoData, ley617Data, cgaData, aguaData, sgpData, eficienciaData, idfData, mapaInversionesData]);

  // Re-run cierre validation when FUT is uploaded after initial load
  useEffect(() => {
    if (futCierre && equilibrioData) {
      const cierreResult = evaluateCierreVsCuipo(futCierre, equilibrioData.porFuente);
      setCierreVsCuipoData(cierreResult);
      const diffCount = cierreResult.cruces.filter(
        (c) => c.consolidacion !== null &&
        (Math.abs(c.diffSaldoLibros) > 1 || Math.abs(c.diffReservas) > 1 || Math.abs(c.diffCxP) > 1)
      ).length;
      setResults((prev) => ({
        ...prev,
        "cierre-cuipo": {
          status: cierreResult.status,
          label: "Cierre FUT vs CUIPO",
          detail: diffCount === 0
            ? "Todos los cruces coinciden"
            : `${diffCount} diferencia(s) encontrada(s)`,
        },
      }));
    }
  }, [futCierre, equilibrioData]);

  // Re-evaluate CGA client-side when FUT data or equilibrio data becomes available.
  // Only fires when at least one FUT file is loaded — the server-side CGA from
  // runAll handles the baseline case, so we skip the redundant call on initial load.
  useEffect(() => {
    // Only re-evaluate client-side when FUT data is available
    // (server-side CGA from runAll handles the baseline case)
    if (!futCierre && !futCierre2024) return;
    if (!periodo || !municipio.chipCode) return;

    let cancelled = false;

    const rerunCGA = async () => {
      try {
        const { evaluateCGA } = await import("@/lib/validaciones/cga");
        const result = await evaluateCGA(
          municipio.chipCode,
          periodo,
          futCierre,       // FUT 2025
          futCierre2024,   // FUT 2024
          equilibrioData ? {
            pptoInicialIngresos: equilibrioData.pptoInicialIngresos ?? 0,
            pptoInicialGastos: equilibrioData.pptoInicialGastos ?? 0,
            pptoDefinitivoIngresos: equilibrioData.pptoDefinitivoIngresos ?? 0,
            pptoDefinitivoGastos: equilibrioData.pptoDefinitivoGastos ?? 0,
            totalReservas: equilibrioData.totalReservas ?? 0,
            totalCxP: equilibrioData.totalCxP ?? 0,
            superavit: equilibrioData.superavit ?? 0,
          } : null,
        );
        if (cancelled) return;
        setCgaData(result);

        const failCount = result.checks.filter(c => c.status === "no_cumple").length;
        const pendingCount = result.checks.filter(c => c.status === "pendiente").length;
        setResults((prev) => ({
          ...prev,
          cga: {
            status: result.status,
            label: "Equilibrio CGA",
            detail: failCount > 0
              ? `${failCount} chequeo(s) NO CUMPLE`
              : pendingCount > 0
              ? `${result.checks.length - pendingCount}/${result.checks.length} verificados`
              : `${result.checks.length} chequeos CUMPLE`,
          },
        }));
      } catch (err) {
        if (!cancelled) console.error("CGA re-evaluation failed:", err);
      }
    };

    rerunCGA();
    return () => { cancelled = true; };
  }, [futCierre, futCierre2024, equilibrioData, periodo, municipio.chipCode]);

  // Re-run IDF when CGN Saldos data becomes available (endeudamiento indicator)
  useEffect(() => {
    if (!cgnSaldos || !periodo || !municipio.chipCode) return;
    let cancelled = false;
    const rerunIDF = async () => {
      try {
        const { calculateIDF } = await import("@/lib/validaciones/idf");
        const result = await calculateIDF(
          municipio.chipCode, periodo,
          { activos: cgnSaldos.activos, pasivos: cgnSaldos.pasivos }
        );
        if (cancelled) return;
        setIdfData(result);
        setResults(prev => ({
          ...prev,
          idf: {
            status: result.status,
            label: "Desempeño Fiscal (IDF)",
            detail: `IDF: ${result.idfTotal.toFixed(1)} — ${result.ranking}`,
          },
        }));
      } catch (err) {
        if (!cancelled) console.error("IDF re-evaluation failed:", err);
      }
    };
    rerunIDF();
    return () => { cancelled = true; };
  }, [cgnSaldos, periodo, municipio.chipCode]);

  // Run Mapa de Inversiones validation whenever mapa upload or period changes
  useEffect(() => {
    if (!periodo || !municipio.chipCode) return;
    let cancelled = false;

    const runMapa = async () => {
      setResults((prev) => ({
        ...prev,
        mapa: mapaData
          ? { status: "loading", label: "Calculando..." }
          : { status: "upload_needed", label: "Requiere Mapa de Inversiones" },
      }));
      try {
        const result = await evaluateMapaInversiones(
          municipio.chipCode,
          periodo,
          mapaData
        );
        if (cancelled) return;
        setMapaInversionesData(result);
        setResults((prev) => ({
          ...prev,
          mapa: {
            status: result.status === "pendiente"
              ? (mapaData ? "pendiente" : "upload_needed")
              : result.status,
            label: "Mapa de Inversiones",
            detail:
              result.status === "pendiente"
                ? `${result.totalBepinesCuipo} BPIN en CUIPO — cargue el mapa para validar`
                : `${result.bepinesConCruce}/${result.totalBepinesCuipo} BPIN cruzan (${result.pctCruceValor.toFixed(1)}% del valor)`,
          },
        }));
      } catch (err) {
        if (!cancelled) {
          setResults((prev) => ({
            ...prev,
            mapa: {
              status: "error",
              label: err instanceof Error ? err.message : "Error en Mapa de Inversiones",
            },
          }));
        }
      }
    };

    runMapa();
    return () => { cancelled = true; };
  }, [mapaData, periodo, municipio.chipCode]);

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
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!equilibrioData}
              >
                <Download className="h-4 w-4" />
                Descargar Excel
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
            onFUTCierre2024Loaded={setFutCierre2024}
            onCGNSaldosLoaded={setCgnSaldos}
            onCGNSaldosILoaded={setCgnSaldosI}
            onMapaInversionesLoaded={setMapaData}
            futCierre={futCierre}
            futCierre2024={futCierre2024}
            cgnSaldos={cgnSaldos}
            cgnSaldosI={cgnSaldosI}
            mapaInversiones={mapaData}
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
            (result.status !== "upload_needed" || v.id === "mapa");

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
      {activePanel === "cierre-cuipo" && (
        <CierreVsCuipoPanel data={cierreVsCuipoData} />
      )}
      {activePanel === "cga" && cgaData && (
        <CGAPanel data={cgaData} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "eficiencia" && eficienciaData && (
        <EficienciaFiscalPanel data={eficienciaData} periodo={periodo} municipio={municipio} />
      )}
      {activePanel === "agua" && <AguaPotablePanel data={aguaData} />}
      {activePanel === "mapa" && <MapaInversionesPanel data={mapaInversionesData} />}
    </div>
  );
}
