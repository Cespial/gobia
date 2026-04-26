"use client";

import type { Municipio } from "@/data/municipios";
import {
  parseCGNSaldos,
  parseCuipoFiles,
  parseFUTCierre,
  type CGNSaldosData,
  type CuipoData,
  type FUTCierreData,
  type MapaInversionesData,
} from "@/lib/chip-parser";
import { buildEquilibrioFromCuipo } from "@/lib/cuipo-processor";
import type { Ley617Certification } from "@/lib/datos-gov-cuipo";
import type { AguaPotableResult } from "@/lib/validaciones/agua-potable";
import { evaluateAguaPotable } from "@/lib/validaciones/agua-potable";
import type { CGAResult } from "@/lib/validaciones/cga";
import { evaluateCGA } from "@/lib/validaciones/cga";
import type { CierreVsCuipoResult } from "@/lib/validaciones/cierre-vs-cuipo";
import { evaluateCierreVsCuipo } from "@/lib/validaciones/cierre-vs-cuipo";
import type { EficienciaFiscalResult } from "@/lib/validaciones/eficiencia-fiscal";
import { evaluateEficienciaFiscal } from "@/lib/validaciones/eficiencia-fiscal";
import type { IDFResult } from "@/lib/validaciones/idf";
import { calculateIDF } from "@/lib/validaciones/idf";
import type { Ley617Result } from "@/lib/validaciones/ley617";
import type { MapaInversionesResult } from "@/lib/validaciones/mapa-inversiones";
import { evaluateMapaInversiones } from "@/lib/validaciones/mapa-inversiones";
import type { SGPEvaluationResult } from "@/lib/validaciones/sgp";
import { evaluateSGP } from "@/lib/validaciones/sgp";

export type ValidationModuleStatus =
  | "cumple"
  | "no_cumple"
  | "parcial"
  | "pendiente"
  | "loading"
  | "error"
  | "upload_needed";

export type ValidationSeverity = "ok" | "medium" | "high" | "blocked" | "info";

export type ValidationInputSourceKind = "api" | "fixture" | "uploaded" | "missing";
export type ValidationRunMode = "api" | "demo_fixture" | "mixed";
export type ValidationWarningSeverity = "info" | "medium" | "high";

export interface ValidationInputSource {
  key: string;
  label: string;
  technicalName?: string;
  source: ValidationInputSourceKind;
  status: "available" | "partial" | "missing" | "excluded";
  rows?: number;
  period?: string;
  expectedPeriod?: string;
  actualPeriod?: string;
  compatible?: boolean;
  excludedReason?: string;
  detail: string;
  requiredFor: string[];
}

export interface ValidationFinding {
  moduleId: string;
  title: string;
  detail: string;
  severity: Exclude<ValidationSeverity, "ok" | "info">;
  nextAction: string;
  priorityScore: number;
  impactAmount?: number;
  actionTarget: string;
}

export interface ValidationMetric {
  label: string;
  value: string;
}

export interface ValidationModuleResult {
  id: string;
  label: string;
  status: ValidationModuleStatus;
  severity: ValidationSeverity;
  summary: string;
  inputs: string[];
  metrics: ValidationMetric[];
  findings: ValidationFinding[];
  nextAction: string;
}

export interface ValidationRunData {
  equilibrio: EquilibrioData | null;
  cierreVsCuipo: CierreVsCuipoResult | null;
  ley617: Ley617Result | null;
  cga: CGAResult | null;
  agua: AguaPotableResult | null;
  sgp: SGPEvaluationResult | null;
  eficiencia: EficienciaFiscalResult | null;
  idf: IDFResult | null;
  mapaInversiones: MapaInversionesResult | null;
  ley617Certifications: Ley617Certification[];
  futCierre: FUTCierreData | null;
  futCierre2024: FUTCierreData | null;
  cgnSaldos: CGNSaldosData | null;
  cgnSaldosI: CGNSaldosData | null;
  mapaData: MapaInversionesData | null;
  cuipoData: CuipoData | null;
}

export interface ValidationRunSummary {
  status: "cumple" | "riesgo_medio" | "riesgo_alto";
  label: string;
  detail: string;
  nextAction: string;
  topFindings: ValidationFinding[];
  missingInputs: ValidationInputSource[];
}

export interface ValidationWarning {
  id: string;
  title: string;
  detail: string;
  severity: ValidationWarningSeverity;
  inputKey?: string;
  moduleId?: string;
}

export interface ValidationRunCoverage {
  selectedPeriod: string;
  periodLabel: string;
  runMode: ValidationRunMode;
  availableInputs: number;
  missingInputs: number;
  excludedInputs: number;
  completeModules: number;
  partialModules: number;
  blockedModules: number;
  dataSourcesSummary: string;
}

export interface ValidationRun {
  municipio: {
    name: string;
    code: string;
    chipCode: string;
    dept: string;
  };
  periodo: string;
  generatedAt: string;
  ruleVersion: string;
  runMode: ValidationRunMode;
  coverage: ValidationRunCoverage;
  warnings: ValidationWarning[];
  inputSources: ValidationInputSource[];
  modules: ValidationModuleResult[];
  summary: ValidationRunSummary;
  data: ValidationRunData;
}

export interface ValidationRunUploads {
  futCierre?: FUTCierreData | null;
  futCierre2024?: FUTCierreData | null;
  cgnSaldos?: CGNSaldosData | null;
  cgnSaldosI?: CGNSaldosData | null;
  mapaData?: MapaInversionesData | null;
  cuipoData?: CuipoData | null;
}

export interface BuildValidationRunOptions {
  municipio: Municipio;
  periodo?: string;
  uploads?: ValidationRunUploads;
  includeFixtures?: boolean;
}

export interface EquilibrioData {
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
    consolidacion?: number | null;
    recaudo: number;
    compromisos: number;
    obligaciones?: number;
    pagos: number;
    reservas?: number;
    cxp?: number;
    superavit: number;
    validador?: number;
    reservasVigAnterior?: number;
    cxpVigAnterior?: number;
    saldoEnLibros?: number;
  }[];
}

const RULE_VERSION = "gobia-validador-v1";
export const DEMO_VALIDATION_MUNICIPIO_CODE = "05091";
export const DEMO_VALIDATION_PERIOD = "20251201";
export const DEMO_VALIDATION_PERIOD_LABEL = "T4 2025 Demo / Cierre anual";
const DEMO_FIXTURE_ACTUAL_PERIOD = "T4 2025 Demo";

const CUIPO_FIXTURE_NAMES = [
  "cuipo_prog_ing",
  "cuipo_ejec_ing",
  "cuipo_prog_gas",
  "cuipo_ejec_gas",
] as const;

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e6) {
    const m = value / 1e6;
    return `$${Math.abs(m) >= 1000 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

export function isDemoValidationPeriod(periodo: string | null | undefined): boolean {
  return periodo === DEMO_VALIDATION_PERIOD;
}

export function hasDemoValidationFixtures(municipio: Pick<Municipio, "code">): boolean {
  return municipio.code === DEMO_VALIDATION_MUNICIPIO_CODE;
}

export function formatValidationPeriodLabel(periodo: string): string {
  if (isDemoValidationPeriod(periodo)) return DEMO_VALIDATION_PERIOD_LABEL;
  const year = periodo.slice(0, 4);
  const month = periodo.slice(4, 6);
  const labels: Record<string, string> = { "03": "T1", "06": "T2", "09": "T3", "12": "T4" };
  return `${labels[month] || month} ${year}`;
}

function isAnnualClosurePeriod(periodo: string): boolean {
  return isDemoValidationPeriod(periodo) || periodo.slice(4, 6) === "12";
}

function fixtureExcludedReason(periodo: string): string {
  return `Demo precargado solo disponible para ${DEMO_VALIDATION_PERIOD_LABEL}; período seleccionado ${formatValidationPeriodLabel(periodo)}.`;
}

function warning(
  id: string,
  title: string,
  detail: string,
  severity: ValidationWarningSeverity,
  extras: Pick<ValidationWarning, "inputKey" | "moduleId"> = {},
): ValidationWarning {
  return { id, title, detail, severity, ...extras };
}

async function loadFixture(path: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

async function fetchApi<T>(
  action: string,
  chipCode: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  const search = new URLSearchParams({ action, chip: chipCode, ...params });
  const res = await fetch(`/api/plataforma/cuipo?${search.toString()}`);
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/plataforma/login";
    return null;
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Error consultando ${action}`);
  }
  return data as T;
}

function sourceFor(
  source: ValidationInputSourceKind,
  available: boolean,
): Pick<ValidationInputSource, "source" | "status" | "compatible"> {
  if (!available) return { source: "missing", status: "missing", compatible: false };
  return { source, status: "available", compatible: true };
}

function excludedSource(
  source: ValidationInputSourceKind,
  expectedPeriod: string,
  actualPeriod: string,
  excludedReason: string,
): Pick<
  ValidationInputSource,
  "source" | "status" | "expectedPeriod" | "actualPeriod" | "compatible" | "excludedReason"
> {
  return {
    source,
    status: "excluded",
    expectedPeriod,
    actualPeriod,
    compatible: false,
    excludedReason,
  };
}

function buildInputSource(input: ValidationInputSource): ValidationInputSource {
  return input;
}

function isStatusBad(status: ValidationModuleStatus): boolean {
  return status === "no_cumple" || status === "error";
}

function moduleSeverity(status: ValidationModuleStatus): ValidationSeverity {
  if (status === "cumple") return "ok";
  if (status === "no_cumple" || status === "error") return "high";
  if (status === "upload_needed") return "blocked";
  if (status === "parcial") return "medium";
  return "info";
}

function diffCount(cierre: CierreVsCuipoResult): number {
  return cierre.cruces.filter(
    (c) =>
      c.consolidacion !== null &&
      (Math.abs(c.diffSaldoLibros) > 1 ||
        Math.abs(c.diffReservas) > 1 ||
        Math.abs(c.diffCxP) > 1),
  ).length;
}

function makeFinding(
  moduleId: string,
  title: string,
  detail: string,
  severity: "medium" | "high" | "blocked",
  nextAction: string,
  options: {
    priorityScore?: number;
    impactAmount?: number;
    actionTarget?: string;
  } = {},
): ValidationFinding {
  const severityBase = severity === "blocked" ? 300 : severity === "high" ? 200 : 100;
  const impactBoost = options.impactAmount ? Math.min(99, Math.log10(Math.max(1, options.impactAmount))) : 0;
  return {
    moduleId,
    title,
    detail,
    severity,
    nextAction,
    priorityScore: options.priorityScore ?? Math.round(severityBase + impactBoost),
    impactAmount: options.impactAmount,
    actionTarget: options.actionTarget ?? `module:${moduleId}`,
  };
}

function moduleResult(params: Omit<ValidationModuleResult, "severity">): ValidationModuleResult {
  return {
    ...params,
    severity: moduleSeverity(params.status),
  };
}

async function loadEffectiveInputs(
  municipio: Municipio,
  uploads: ValidationRunUploads,
  includeFixtures: boolean,
  selectedPeriod: string,
): Promise<{
  futCierre: FUTCierreData | null;
  futCierre2024: FUTCierreData | null;
  cgnSaldos: CGNSaldosData | null;
  cgnSaldosI: CGNSaldosData | null;
  mapaData: MapaInversionesData | null;
  cuipoData: CuipoData | null;
  inputSources: ValidationInputSource[];
  warnings: ValidationWarning[];
}> {
  const code = municipio.code;
  const selectedPeriodLabel = formatValidationPeriodLabel(selectedPeriod);
  const expectedYear = selectedPeriod.slice(0, 4);
  const expectedPriorYear = String(Number(expectedYear) - 1);
  const annualCompatible = isAnnualClosurePeriod(selectedPeriod);
  const demoFixturesAvailable = includeFixtures && hasDemoValidationFixtures(municipio);
  const fixtureAllowed = demoFixturesAvailable && isDemoValidationPeriod(selectedPeriod);
  const fixtureBlockedReason = demoFixturesAvailable && !fixtureAllowed
    ? fixtureExcludedReason(selectedPeriod)
    : null;
  const warnings: ValidationWarning[] = [];

  let futCierre = uploads.futCierre ?? null;
  let futCierre2024 = uploads.futCierre2024 ?? null;
  let cgnSaldos = uploads.cgnSaldos ?? null;
  let cgnSaldosI = uploads.cgnSaldosI ?? null;
  const mapaData = uploads.mapaData ?? null;
  let cuipoData = uploads.cuipoData ?? null;

  let futSource: ValidationInputSourceKind = futCierre ? "uploaded" : "missing";
  let fut2024Source: ValidationInputSourceKind = futCierre2024 ? "uploaded" : "missing";
  let cgnSource: ValidationInputSourceKind = cgnSaldos ? "uploaded" : "missing";
  let cgnISource: ValidationInputSourceKind = cgnSaldosI ? "uploaded" : "missing";
  const mapaSource: ValidationInputSourceKind = mapaData ? "uploaded" : "missing";
  let cuipoSource: ValidationInputSourceKind = cuipoData ? "uploaded" : "missing";
  let futMeta: ReturnType<typeof sourceFor> | ReturnType<typeof excludedSource> | null = null;
  let fut2024Meta: ReturnType<typeof sourceFor> | ReturnType<typeof excludedSource> | null = null;
  let cgnMeta: ReturnType<typeof sourceFor> | ReturnType<typeof excludedSource> | null = null;
  let cgnIMeta: ReturnType<typeof sourceFor> | ReturnType<typeof excludedSource> | null = null;
  let cuipoMeta: ReturnType<typeof sourceFor> | ReturnType<typeof excludedSource> | null = null;
  let cuipoProgGasMeta: ReturnType<typeof sourceFor> | ReturnType<typeof excludedSource> | null = null;

  if (fixtureBlockedReason) {
    warnings.push(warning(
      "demo-fixtures-excluded",
      "Demo precargado excluido por período",
      fixtureBlockedReason,
      "medium",
    ));
    if (!futCierre) futMeta = excludedSource("fixture", selectedPeriodLabel, DEMO_FIXTURE_ACTUAL_PERIOD, fixtureBlockedReason);
    if (!futCierre2024) fut2024Meta = excludedSource("fixture", selectedPeriodLabel, "Vigencia 2024 demo", fixtureBlockedReason);
    if (!cgnSaldos) cgnMeta = excludedSource("fixture", selectedPeriodLabel, "CGN IV demo", fixtureBlockedReason);
    if (!cgnSaldosI) cgnIMeta = excludedSource("fixture", selectedPeriodLabel, "CGN I demo", fixtureBlockedReason);
    if (!cuipoData) {
      cuipoMeta = excludedSource("fixture", selectedPeriodLabel, DEMO_FIXTURE_ACTUAL_PERIOD, fixtureBlockedReason);
      cuipoProgGasMeta = excludedSource("fixture", selectedPeriodLabel, DEMO_FIXTURE_ACTUAL_PERIOD, fixtureBlockedReason);
    }
  }

  function excludeUploadedInput(
    key: string,
    title: string,
    actualPeriod: string,
    reason: string,
  ) {
    warnings.push(warning(
      `${key}-excluded`,
      title,
      reason,
      "medium",
      { inputKey: key },
    ));
    return excludedSource("uploaded", selectedPeriodLabel, actualPeriod, reason);
  }

  if (futCierre && (!annualCompatible || (futCierre.vigencia !== "unknown" && futCierre.vigencia !== expectedYear))) {
    const reason = annualCompatible
      ? `FUT Cierre ${futCierre.vigencia} no corresponde a la vigencia esperada ${expectedYear}.`
      : `FUT Cierre es insumo de cierre anual y no se usa en ${selectedPeriodLabel}.`;
    futMeta = excludeUploadedInput("fut_cierre", "FUT Cierre excluido", futCierre.vigencia, reason);
    futCierre = null;
  }
  if (futCierre2024 && (!annualCompatible || (futCierre2024.vigencia !== "unknown" && futCierre2024.vigencia !== expectedPriorYear))) {
    const reason = annualCompatible
      ? `FUT Cierre anterior ${futCierre2024.vigencia} no corresponde a la vigencia esperada ${expectedPriorYear}.`
      : `FUT Cierre anterior es insumo de cierre anual y no se usa en ${selectedPeriodLabel}.`;
    fut2024Meta = excludeUploadedInput("fut_cierre_anterior", "FUT Cierre anterior excluido", futCierre2024.vigencia, reason);
    futCierre2024 = null;
  }
  if (cgnSaldos && !annualCompatible) {
    const reason = `CGN Saldos IV es insumo de cierre anual y no se usa en ${selectedPeriodLabel}.`;
    cgnMeta = excludeUploadedInput("cgn_saldos_iv", "CGN IV excluido", cgnSaldos.trimestre, reason);
    cgnSaldos = null;
  }
  if (cgnSaldosI && !annualCompatible) {
    const reason = `CGN Saldos I se usa para la refrendación anual y no se mezcla con ${selectedPeriodLabel}.`;
    cgnIMeta = excludeUploadedInput("cgn_saldos_i", "CGN I excluido", cgnSaldosI.trimestre, reason);
    cgnSaldosI = null;
  }
  if (cuipoData && !annualCompatible && cuipoData.periodo.toLowerCase().includes("cierre")) {
    const reason = `Archivos CUIPO de cierre anual no se usan en ${selectedPeriodLabel}.`;
    cuipoMeta = excludeUploadedInput("cuipo_ejec_ing", "CUIPO cierre excluido", cuipoData.periodo, reason);
    cuipoProgGasMeta = excludedSource("uploaded", selectedPeriodLabel, cuipoData.periodo, reason);
    cuipoData = null;
  }

  if (fixtureAllowed) {
    const [futBuf, fut2024Buf, cgnBuf, cgnIBuf] = await Promise.all([
      futCierre ? Promise.resolve(null) : loadFixture(`/fixtures/${code}/fut_cierre_2025.xlsx`),
      futCierre2024 ? Promise.resolve(null) : loadFixture(`/fixtures/${code}/fut_cierre_2024.xlsx`),
      cgnSaldos ? Promise.resolve(null) : loadFixture(`/fixtures/${code}/cgn_saldos_IV.xlsx`),
      cgnSaldosI ? Promise.resolve(null) : loadFixture(`/fixtures/${code}/cgn_saldos_I.xlsx`),
    ]);

    if (!futCierre && futBuf) {
      const parsed = parseFUTCierre(futBuf, "2025");
      if (parsed.rows.length > 0) {
        futCierre = parsed;
        futSource = "fixture";
        futMeta = null;
      }
    }
    if (!futCierre2024 && fut2024Buf) {
      const parsed = parseFUTCierre(fut2024Buf, "2024");
      if (parsed.rows.length > 0) {
        futCierre2024 = parsed;
        fut2024Source = "fixture";
        fut2024Meta = null;
      }
    }
    if (!cgnSaldos && cgnBuf) {
      const parsed = parseCGNSaldos(cgnBuf, "IV");
      if (parsed.rows.length > 0) {
        cgnSaldos = parsed;
        cgnSource = "fixture";
        cgnMeta = null;
      }
    }
    if (!cgnSaldosI && cgnIBuf) {
      const parsed = parseCGNSaldos(cgnIBuf, "I");
      if (parsed.rows.length > 0) {
        cgnSaldosI = parsed;
        cgnISource = "fixture";
        cgnIMeta = null;
      }
    }

    if (!cuipoData) {
      const buffers = await Promise.all(
        CUIPO_FIXTURE_NAMES.map(async (name) => {
          const buffer = await loadFixture(`/fixtures/${code}/${name}.xlsx`);
          return buffer ? { name: `${name}.xlsx`, buffer } : null;
        }),
      );
      const validBuffers = buffers.filter(
        (item): item is { name: string; buffer: ArrayBuffer } => item !== null,
      );
      if (validBuffers.length > 0) {
        const parsed = parseCuipoFiles(validBuffers);
        if (
          parsed.ejecIngresos.length > 0 ||
          parsed.ejecGastos.length > 0 ||
          parsed.progIngresos.length > 0 ||
          parsed.progGastos.length > 0
        ) {
          cuipoData = parsed;
          cuipoSource = "fixture";
          cuipoMeta = null;
          cuipoProgGasMeta = null;
        }
      }
    }
  }

  const inputSources = [
    buildInputSource({
      key: "cuipo_api",
      label: "Ejecución presupuestal pública",
      technicalName: "CUIPO datos.gov.co",
      source: "api",
      status: "available",
      detail: "Consulta pública por código CHIP y período.",
      requiredFor: ["Equilibrio", "Ley 617", "IDF", "SGP", "Eficiencia fiscal"],
    }),
    buildInputSource({
      key: "cuipo_ejec_ing",
      label: "Ejecución de ingresos",
      technicalName: "CUIPO EJEC_ING",
      ...(cuipoMeta ?? sourceFor(cuipoSource, !!cuipoData?.ejecIngresos.length)),
      rows: cuipoData?.ejecIngresos.length,
      period: cuipoData?.periodo,
      detail: cuipoData?.ejecIngresos.length
        ? "Disponible para recalcular equilibrio desde archivo CHIP."
        : "Falta para recalcular equilibrio desde archivo CHIP.",
      requiredFor: ["Equilibrio", "SGP", "Agua potable"],
    }),
    buildInputSource({
      key: "cuipo_ejec_gas",
      label: "Ejecución de gastos",
      technicalName: "CUIPO EJEC_GAS",
      ...(cuipoMeta ?? sourceFor(cuipoSource, !!cuipoData?.ejecGastos.length)),
      rows: cuipoData?.ejecGastos.length,
      period: cuipoData?.periodo,
      detail: cuipoData?.ejecGastos.length
        ? "Disponible para recalcular compromisos, pagos, reservas y BPIN."
        : "Falta para recalcular compromisos, pagos, reservas y BPIN.",
      requiredFor: ["Equilibrio", "Cierre FUT vs CUIPO", "Mapa de inversiones"],
    }),
    buildInputSource({
      key: "cuipo_prog_ing",
      label: "Presupuesto de ingresos",
      technicalName: "CUIPO PROG_ING",
      ...(cuipoMeta ?? sourceFor(cuipoSource, !!cuipoData?.progIngresos.length)),
      rows: cuipoData?.progIngresos.length,
      period: cuipoData?.periodo,
      detail: cuipoData?.progIngresos.length
        ? "Disponible para completar presupuesto y validaciones de programación."
        : "Falta para completar presupuesto, SGP y agua potable.",
      requiredFor: ["SGP", "Agua potable", "IDF", "CGA"],
    }),
    buildInputSource({
      key: "cuipo_prog_gas",
      label: "Presupuesto de gastos",
      technicalName: "CUIPO PROG_GAS",
      ...(cuipoProgGasMeta ?? cuipoMeta ?? sourceFor(cuipoSource, !!cuipoData?.progGastos.length)),
      rows: cuipoData?.progGastos.length,
      period: cuipoData?.periodo,
      detail: cuipoData?.progGastos.length
        ? "Disponible como soporte de programación de gastos."
        : "Falta como soporte de programación de gastos.",
      requiredFor: ["CGA"],
    }),
    buildInputSource({
      key: "fut_cierre",
      label: "Cierre fiscal vigencia actual",
      technicalName: "FUT Cierre",
      ...(futMeta ?? sourceFor(futSource, !!futCierre?.rows.length)),
      rows: futCierre?.rows.length,
      period: futCierre?.vigencia,
      detail: futCierre ? "Disponible para cruces de cierre y CGA." : "Falta para cruces de cierre y CGA.",
      requiredFor: ["Cierre FUT vs CUIPO", "CGA"],
    }),
    buildInputSource({
      key: "fut_cierre_anterior",
      label: "Cierre fiscal vigencia anterior",
      technicalName: "FUT Cierre año anterior",
      ...(fut2024Meta ?? sourceFor(fut2024Source, !!futCierre2024?.rows.length)),
      rows: futCierre2024?.rows.length,
      period: futCierre2024?.vigencia,
      detail: futCierre2024 ? "Disponible para cruces de reservas y CxP." : "Falta para cruces de reservas y CxP.",
      requiredFor: ["CGA"],
    }),
    buildInputSource({
      key: "cgn_saldos_iv",
      label: "Saldos contables cierre",
      technicalName: "CGN Saldos IV",
      ...(cgnMeta ?? sourceFor(cgnSource, !!cgnSaldos?.rows.length)),
      rows: cgnSaldos?.rows.length,
      period: cgnSaldos?.trimestre,
      detail: cgnSaldos ? "Disponible para IDF y eficiencia fiscal." : "Falta para IDF patrimonial y eficiencia fiscal.",
      requiredFor: ["IDF", "Eficiencia fiscal"],
    }),
    buildInputSource({
      key: "cgn_saldos_i",
      label: "Saldos contables iniciales",
      technicalName: "CGN Saldos I",
      ...(cgnIMeta ?? sourceFor(cgnISource, !!cgnSaldosI?.rows.length)),
      rows: cgnSaldosI?.rows.length,
      period: cgnSaldosI?.trimestre,
      detail: cgnSaldosI ? "Disponible para refrendación fiscal completa." : "Falta para refrendación fiscal completa.",
      requiredFor: ["Eficiencia fiscal"],
    }),
    buildInputSource({
      key: "mapa_inversiones",
      label: "Mapa de inversiones",
      technicalName: "DNP Mapa de Inversiones",
      ...sourceFor(mapaSource, !!mapaData?.rows.length),
      rows: mapaData?.rows.length,
      period: mapaData?.year,
      detail: mapaData ? "Disponible para cruce de BPIN contra PDM." : "Falta para validar BPIN contra PDM.",
      requiredFor: ["Mapa de inversiones"],
    }),
  ];

  return {
    futCierre,
    futCierre2024,
    cgnSaldos,
    cgnSaldosI,
    mapaData,
    cuipoData,
    inputSources,
    warnings,
  };
}

function buildSummary(
  modules: ValidationModuleResult[],
  inputSources: ValidationInputSource[],
  warnings: ValidationWarning[],
): ValidationRunSummary {
  const noCumple = modules.filter((m) => m.status === "no_cumple").length;
  const blocked = modules.filter((m) => m.status === "upload_needed" || m.status === "error").length;
  const partial = modules.filter((m) => m.status === "parcial" || m.status === "pendiente").length;
  const topFindings = modules
    .flatMap((m) => m.findings)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);
  const missingInputs = inputSources.filter((i) => i.status === "missing" || i.status === "excluded");
  const excluded = inputSources.filter((i) => i.status === "excluded").length;
  const warningCount = warnings.filter((w) => w.severity !== "info").length;

  if (noCumple >= 2 || blocked > 0) {
    return {
      status: "riesgo_alto",
      label: "Riesgo alto",
      detail: `${noCumple} validaciones no cumplen, ${blocked} requieren insumos y ${excluded} fuente(s) fueron excluidas por cobertura.`,
      nextAction: topFindings[0]?.nextAction || missingInputs[0]?.detail || "Priorizar carga de insumos faltantes.",
      topFindings,
      missingInputs,
    };
  }

  if (noCumple > 0 || partial > 0) {
    return {
      status: "riesgo_medio",
      label: "Riesgo medio",
      detail: `${noCumple} validación no cumple, ${partial} quedan parciales y ${warningCount} advertencia(s) requieren revisión.`,
      nextAction: topFindings[0]?.nextAction || missingInputs[0]?.detail || "Revisar hallazgos parciales antes del cierre.",
      topFindings,
      missingInputs,
    };
  }

  return {
    status: "cumple",
    label: "Cumple",
    detail: "Las validaciones disponibles no presentan alertas críticas.",
    nextAction: "Exportar soporte y conservar trazabilidad de fuentes.",
    topFindings,
    missingInputs,
  };
}

function determineRunMode(inputSources: ValidationInputSource[]): ValidationRunMode {
  const hasFixture = inputSources.some((input) => input.status === "available" && input.source === "fixture");
  const hasUploaded = inputSources.some((input) => input.status === "available" && input.source === "uploaded");
  if (hasFixture && !hasUploaded) return "demo_fixture";
  if (hasFixture || hasUploaded) return "mixed";
  return "api";
}

function buildCoverage(
  periodo: string,
  runMode: ValidationRunMode,
  inputSources: ValidationInputSource[],
  modules: ValidationModuleResult[],
): ValidationRunCoverage {
  const availableInputs = inputSources.filter((input) => input.status === "available").length;
  const missingInputs = inputSources.filter((input) => input.status === "missing").length;
  const excludedInputs = inputSources.filter((input) => input.status === "excluded").length;
  const completeModules = modules.filter((module) => module.status === "cumple" || module.status === "no_cumple").length;
  const partialModules = modules.filter((module) => module.status === "parcial" || module.status === "pendiente").length;
  const blockedModules = modules.filter((module) => module.status === "upload_needed" || module.status === "error").length;
  const modeLabel = runMode === "demo_fixture"
    ? "Demo precargado"
    : runMode === "mixed"
      ? "Mixta"
      : "API pública";

  return {
    selectedPeriod: periodo,
    periodLabel: formatValidationPeriodLabel(periodo),
    runMode,
    availableInputs,
    missingInputs,
    excludedInputs,
    completeModules,
    partialModules,
    blockedModules,
    dataSourcesSummary: `${modeLabel}: ${availableInputs} insumo(s) disponibles, ${missingInputs} faltante(s), ${excludedInputs} excluido(s).`,
  };
}

function reconcileCuipoInputSources(
  inputSources: ValidationInputSource[],
  context: {
    equilibrio: EquilibrioData | null;
    sgp: SGPEvaluationResult | null;
    agua: AguaPotableResult | null;
    hasCuipoUpload: boolean;
    periodLabel: string;
  },
): ValidationInputSource[] {
  if (context.hasCuipoUpload) return inputSources;

  const makeApiInput = (
    input: ValidationInputSource,
    status: "available" | "partial",
    detail: string,
  ): ValidationInputSource => ({
    ...input,
    source: "api",
    status,
    expectedPeriod: context.periodLabel,
    actualPeriod: context.periodLabel,
    compatible: true,
    excludedReason: undefined,
    detail,
  });

  return inputSources.map((input) => {
    if (input.status === "excluded" && input.source === "uploaded") return input;

    if (input.key === "cuipo_ejec_ing" && context.equilibrio) {
      return makeApiInput(
        input,
        "available",
        "Disponible vía API pública para recaudos y equilibrio del período seleccionado.",
      );
    }
    if (input.key === "cuipo_ejec_gas" && context.equilibrio) {
      return makeApiInput(
        input,
        "available",
        "Disponible vía API pública para compromisos, pagos y equilibrio del período seleccionado.",
      );
    }
    if (input.key === "cuipo_prog_ing") {
      const hasProgramacion = Boolean(context.sgp?.hasProgramacionData || context.agua?.hasProgramacionData);
      return makeApiInput(
        input,
        hasProgramacion ? "available" : "partial",
        hasProgramacion
          ? "Disponible vía API pública para programación de ingresos."
          : "API pública consultada, pero la programación de ingresos queda parcial; cargar PROG_ING para completar SGP, agua potable e IDF.",
      );
    }
    if (input.key === "cuipo_prog_gas" && input.status === "excluded" && input.source === "fixture") {
      return {
        ...input,
        source: "missing",
        status: "missing",
        expectedPeriod: context.periodLabel,
        actualPeriod: undefined,
        period: undefined,
        compatible: false,
        excludedReason: undefined,
        detail: "Falta Presupuesto de gastos (PROG_GAS) para completar validaciones CGA.",
      };
    }
    return input;
  });
}

export async function buildValidationRun({
  municipio,
  periodo,
  uploads = {},
  includeFixtures = true,
}: BuildValidationRunOptions): Promise<ValidationRun> {
  let effectivePeriodo = periodo;
  if (!effectivePeriodo) {
    const data = await fetchApi<{ ok: true; periodos: string[] }>("periodos", municipio.chipCode);
    effectivePeriodo = data?.periodos?.[0];
  }
  if (!effectivePeriodo) throw new Error("Sin periodo disponible para validar.");

  const inputs = await loadEffectiveInputs(municipio, uploads, includeFixtures, effectivePeriodo);
  const progIngresosUpload = inputs.cuipoData?.progIngresos ?? null;
  const hasCuipoExecutionUpload = !!inputs.cuipoData && (
    inputs.cuipoData.ejecIngresos.length > 0 || inputs.cuipoData.ejecGastos.length > 0
  );

  let equilibrio: EquilibrioData | null = null;
  if (hasCuipoExecutionUpload && inputs.cuipoData) {
    equilibrio = buildEquilibrioFromCuipo(inputs.cuipoData);
  } else {
    const eqData = await fetchApi<{ ok: true; equilibrio: EquilibrioData }>(
      "equilibrio",
      municipio.chipCode,
      { periodo: effectivePeriodo },
    );
    equilibrio = eqData?.equilibrio ?? null;
  }

  const [sgp, ley617Data, ley617OfficialData, idf, agua, cga, eficiencia, mapaInversiones] =
    await Promise.all([
      evaluateSGP(
        municipio.chipCode,
        municipio.code,
        municipio.deptCode,
        effectivePeriodo,
        progIngresosUpload,
      ).catch(() => null),
      fetchApi<{ ok: true; ley617: Ley617Result }>("ley617", municipio.chipCode, {
        periodo: effectivePeriodo,
      }).catch(() => null),
      fetchApi<{ ok: true; certifications: Ley617Certification[] }>(
        "ley617oficial",
        municipio.chipCode,
      ).catch(() => null),
      calculateIDF(
        municipio.chipCode,
        effectivePeriodo,
        inputs.cgnSaldos ? { activos: inputs.cgnSaldos.activos, pasivos: inputs.cgnSaldos.pasivos, rows: inputs.cgnSaldos.rows } : null,
        progIngresosUpload,
      ).catch(() => null),
      evaluateAguaPotable(
        municipio.chipCode,
        municipio.code,
        municipio.deptCode,
        effectivePeriodo,
        municipio.sgpTotal,
        progIngresosUpload,
      ).catch(() => null),
      evaluateCGA(
        municipio.chipCode,
        effectivePeriodo,
        inputs.futCierre,
        inputs.futCierre2024,
        equilibrio
          ? {
              pptoInicialIngresos: equilibrio.pptoInicialIngresos ?? 0,
              pptoInicialGastos: equilibrio.pptoInicialGastos ?? 0,
              pptoDefinitivoIngresos: equilibrio.pptoDefinitivoIngresos ?? 0,
              pptoDefinitivoGastos: equilibrio.pptoDefinitivoGastos ?? 0,
              totalReservas: equilibrio.totalReservas ?? 0,
              totalCxP: equilibrio.totalCxP ?? 0,
              superavit: equilibrio.superavit ?? 0,
            }
          : null,
      ).catch(() => null),
      evaluateEficienciaFiscal(
        municipio.chipCode,
        effectivePeriodo,
        inputs.cgnSaldos,
        inputs.cgnSaldosI,
      ).catch(() => null),
      evaluateMapaInversiones(municipio.chipCode, effectivePeriodo, inputs.mapaData).catch(() => null),
    ]);

  const ley617 = ley617Data?.ley617 ?? null;
  const ley617Certifications = ley617OfficialData?.certifications ?? [];
  const cierreVsCuipo =
    inputs.futCierre && equilibrio
      ? evaluateCierreVsCuipo(
          inputs.futCierre,
          equilibrio.porFuente.map((fuente) => ({
            consolidacion: fuente.consolidacion ?? null,
            saldoEnLibros: fuente.saldoEnLibros ?? 0,
            reservas: fuente.reservas ?? 0,
            cxp: fuente.cxp ?? 0,
          })),
        )
      : null;

  const modules: ValidationModuleResult[] = [];

  if (equilibrio) {
    const totalCompromisos = equilibrio.totalCompromisos ?? equilibrio.totalGastos ?? 0;
    const diff = Math.abs(equilibrio.totalIngresos - totalCompromisos);
    const tolerance = equilibrio.totalIngresos * 0.01;
    const status: ValidationModuleStatus = diff <= tolerance ? "cumple" : "no_cumple";
    modules.push(moduleResult({
      id: "equilibrio",
      label: "Equilibrio Presupuestal",
      status,
      summary: `Ingresos ${formatCOP(equilibrio.totalIngresos)} vs gastos ${formatCOP(totalCompromisos)} - ${equilibrio.pctEjecucion.toFixed(1)}%`,
      inputs: hasCuipoExecutionUpload ? ["cuipo_ejec_ing", "cuipo_ejec_gas"] : ["cuipo_api"],
      metrics: [
        { label: "Total ingresos", value: formatCOP(equilibrio.totalIngresos) },
        { label: "Total compromisos", value: formatCOP(totalCompromisos) },
        { label: "Total pagos", value: formatCOP(equilibrio.totalPagos) },
        { label: "Superavit/deficit", value: formatCOP(equilibrio.superavit) },
      ],
      findings: status === "no_cumple"
        ? [
                    makeFinding(
                      "equilibrio",
                      "Brecha entre ingresos y compromisos",
                      `La diferencia absoluta es ${formatCOP(diff)}.`,
                      "high",
                      "Revisar fuentes con mayor deficit y validar si el periodo corresponde a cierre anual.",
                      { impactAmount: diff, actionTarget: "module:equilibrio" },
                    ),
          ]
        : [],
      nextAction: status === "no_cumple"
        ? "Abrir Equilibrio Presupuestal y revisar las fuentes con mayor deficit."
        : "Conservar soporte de fuentes y continuar con validaciones cruzadas.",
    }));
  }

  if (sgp) {
    const missingProg = !sgp.hasProgramacionData;
    modules.push(moduleResult({
      id: "sgp",
      label: "Evaluación SGP",
      status: sgp.status,
      summary: missingProg
        ? `Ejecutado ${sgp.pctEjecucionGlobal.toFixed(1)}% del SGP distribuido - falta presupuesto de ingresos`
        : `Ejecutado ${sgp.pctEjecucionGlobal.toFixed(1)}% del SGP distribuido (${sgp.componentes.length} componentes)`,
      inputs: ["cuipo_api", "cuipo_prog_ing"],
      metrics: sgp.componentes.map((c) => ({
        label: c.concepto,
        value: `${c.pctEjecucion.toFixed(1)}% (${c.status})`,
      })),
      findings: isStatusBad(sgp.status)
        ? [
                    makeFinding(
                      "sgp",
                      "Ejecución SGP crítica",
                      `La ejecución global SGP es ${sgp.pctEjecucionGlobal.toFixed(1)}%.`,
                      "high",
                      missingProg
                        ? "Cargar Presupuesto de ingresos (PROG_ING) para completar la lectura de programación."
                        : "Revisar componentes SGP con ejecución crítica.",
                      { priorityScore: missingProg ? 312 : 220, actionTarget: missingProg ? "input:cuipo_prog_ing" : "module:sgp" },
                    ),
          ]
        : [],
      nextAction: missingProg
        ? "Cargar Presupuesto de ingresos (PROG_ING)."
        : "Revisar componentes SGP con menor ejecución.",
    }));
  }

  if (ley617) {
    modules.push(moduleResult({
      id: "ley-617",
      label: "Ley 617 Funcionamiento",
      status: ley617.status,
      summary: `Funcionamiento ${(ley617.ratioGlobal * 100).toFixed(1)}% del ICLD (limite: ${(ley617.limiteGlobal * 100).toFixed(0)}%)`,
      inputs: ["cuipo_api"],
      metrics: [
        { label: "ICLD", value: formatCOP(ley617.icldTotal) },
        { label: "Gastos funcionamiento", value: formatCOP(ley617.gastosFuncionamientoTotal) },
        ...ley617Certifications.slice(0, 1).map((cert) => ({
          label: `Certificación CGR ${cert.vigencia}`,
          value: `${cert.indicadorLey617}% (Cat. ${cert.categoria})`,
        })),
      ],
      findings: ley617.status === "no_cumple"
        ? [
                    makeFinding(
                      "ley-617",
                      "Gastos de funcionamiento sobre el límite",
                      `El ratio global es ${(ley617.ratioGlobal * 100).toFixed(1)}%.`,
                      "high",
                      "Revisar clasificación de ICLD y gasto de funcionamiento antes de certificar.",
                      { impactAmount: ley617.gastosFuncionamientoTotal, actionTarget: "module:ley-617" },
                    ),
          ]
        : [],
      nextAction: ley617.status === "no_cumple"
        ? "Abrir Ley 617 y revisar secciones que superan el límite."
        : "Guardar evidencia de cálculo y certificaciones CGR.",
    }));
  }

  if (idf) {
    modules.push(moduleResult({
      id: "idf",
      label: "Desempeño Fiscal (IDF)",
      status: idf.status,
      summary: `${idf.ranking}: ${idf.idfTotal.toFixed(1)}/100`,
      inputs: ["cuipo_api", "cgn_saldos_iv", "cuipo_prog_ing"],
      metrics: [
        { label: "Score resultados", value: idf.scoreResultados.toFixed(1) },
        { label: "Score gestión", value: idf.scoreGestion.toFixed(1) },
        ...idf.resultadosFiscales.map((indicator) => ({
          label: indicator.name,
          value: indicator.score !== null ? `${indicator.score.toFixed(0)} pts` : "N/D",
        })),
      ],
      findings: idf.status !== "cumple"
        ? [
                    makeFinding(
                      "idf",
                      "Desempeño fiscal por debajo del rango esperado",
                      `El IDF estimado es ${idf.idfTotal.toFixed(1)} (${idf.ranking}).`,
                      idf.status === "no_cumple" ? "high" : "medium",
                      "Revisar indicadores con menor puntaje y completar insumos CGN/PROG_ING.",
                      { priorityScore: idf.status === "no_cumple" ? 205 : 120, actionTarget: "module:idf" },
                    ),
          ]
        : [],
      nextAction: "Revisar indicadores de menor puntaje en el panel IDF.",
    }));
  }

  if (cierreVsCuipo) {
    const count = diffCount(cierreVsCuipo);
    modules.push(moduleResult({
      id: "cierre-cuipo",
      label: "Cierre FUT vs CUIPO",
      status: cierreVsCuipo.status,
      summary: count === 0 ? "Todos los cruces coinciden" : `${count} diferencia(s) encontrada(s)`,
      inputs: ["fut_cierre", "cuipo_ejec_ing", "cuipo_ejec_gas"],
      metrics: [
        { label: "Diff saldo libros", value: formatCOP(cierreVsCuipo.totalDiffSaldoLibros) },
        { label: "Diff reservas", value: formatCOP(cierreVsCuipo.totalDiffReservas) },
        { label: "Diff CxP", value: formatCOP(cierreVsCuipo.totalDiffCxP) },
      ],
      findings: cierreVsCuipo.status === "no_cumple"
        ? [
                    makeFinding(
                      "cierre-cuipo",
                      "Diferencias entre FUT Cierre y CUIPO",
                      `${count} cruces presentan diferencias materiales.`,
                      "high",
                      "Revisar rubros consolidados con diferencias de saldo, reservas o CxP.",
                      {
                        impactAmount: Math.abs(cierreVsCuipo.totalDiffSaldoLibros) + Math.abs(cierreVsCuipo.totalDiffReservas) + Math.abs(cierreVsCuipo.totalDiffCxP),
                        actionTarget: "module:cierre-cuipo",
                      },
                    ),
          ]
        : [],
      nextAction: cierreVsCuipo.status === "no_cumple"
        ? "Abrir Cierre FUT vs CUIPO y priorizar las diferencias de mayor valor."
        : "Guardar cruce como soporte de consistencia.",
    }));
  } else {
    modules.push(moduleResult({
      id: "cierre-cuipo",
      label: "Cierre FUT vs CUIPO",
      status: "upload_needed",
      summary: "Falta Cierre fiscal vigencia actual (FUT Cierre)",
      inputs: ["fut_cierre", "cuipo_ejec_ing", "cuipo_ejec_gas"],
      metrics: [],
      findings: [
                makeFinding(
                  "cierre-cuipo",
                  "Cruce de cierre bloqueado",
                  "No hay archivo FUT Cierre para comparar contra CUIPO.",
                  "blocked",
                  "Cargar Cierre fiscal vigencia actual (FUT Cierre).",
                  { priorityScore: 330, actionTarget: "input:fut_cierre" },
                ),
      ],
      nextAction: "Cargar Cierre fiscal vigencia actual (FUT Cierre).",
    }));
  }

  if (cga) {
    const failCount = cga.checks.filter((c) => c.status === "no_cumple").length;
    const pendingCount = cga.checks.filter((c) => c.status === "pendiente").length;
    const status: ValidationModuleStatus =
      cga.status === "pendiente" && pendingCount > 0 ? "upload_needed" : cga.status;
    modules.push(moduleResult({
      id: "cga",
      label: "Equilibrio CGA",
      status,
      summary: failCount > 0
        ? `${failCount} chequeo(s) no cumplen`
        : pendingCount > 0
          ? `${cga.checks.length - pendingCount}/${cga.checks.length} verificados`
          : `${cga.checks.length} chequeos cumplen`,
      inputs: ["fut_cierre", "fut_cierre_anterior", "cuipo_prog_ing", "cuipo_prog_gas"],
      metrics: cga.checks.map((check) => ({
        label: check.name,
        value: check.status === "pendiente"
          ? "Pendiente"
          : check.status === "cumple"
            ? "Cumple"
            : `No cumple (${formatCOP(Math.abs(check.difference))})`,
      })),
      findings: failCount > 0
        ? [
                    makeFinding(
                      "cga",
                      "Chequeos CGA con diferencias",
                      `${failCount} chequeo(s) presentan diferencias.`,
                      "high",
                      "Revisar reservas, CxP y superavit contra FUT y CUIPO.",
                      {
                        impactAmount: cga.checks.reduce((sum, check) => sum + Math.abs(check.difference || 0), 0),
                        actionTarget: "module:cga",
                      },
                    ),
          ]
        : pendingCount > 0
          ? [
                      makeFinding(
                        "cga",
                        "Chequeos CGA pendientes",
                        `${pendingCount} chequeo(s) requieren insumos adicionales.`,
                        "blocked",
                        "Cargar FUT Cierre y presupuesto CUIPO faltante.",
                        { priorityScore: 320 + pendingCount, actionTarget: "input:cuipo_prog_gas" },
                      ),
            ]
          : [],
      nextAction: failCount > 0
        ? "Abrir Equilibrio CGA y revisar diferencias por chequeo."
        : pendingCount > 0
          ? "Cargar insumos faltantes para completar CGA."
          : "Guardar soporte CGA.",
    }));
  }

  if (eficiencia) {
    const status: ValidationModuleStatus =
      eficiencia.status === "pendiente" ? "upload_needed" : eficiencia.status;
    modules.push(moduleResult({
      id: "eficiencia",
      label: "Eficiencia Fiscal",
      status,
      summary: eficiencia.hasCGNData
        ? `${eficiencia.refrendaCount} refrendan, ${eficiencia.noRefrendaCount} no`
        : `${eficiencia.tributos.filter((t) => t.cuipoTotal > 0).length} tributos con recaudo - CGN pendiente`,
      inputs: ["cuipo_api", "cgn_saldos_iv", "cgn_saldos_i"],
      metrics: eficiencia.tributos
        .filter((t) => t.cuipoTotal > 0)
        .map((tax) => ({
          label: tax.name,
          value: tax.refrenda === null
            ? "Sin CGN"
            : tax.refrenda
              ? `SI (var ${tax.variancePct?.toFixed(1)}%)`
              : `NO (var ${tax.variancePct?.toFixed(1)}%)`,
        })),
      findings: eficiencia.status === "no_cumple"
        ? [
                    makeFinding(
                      "eficiencia",
                      "Tributos no refrendados",
                      `${eficiencia.noRefrendaCount} tributo(s) no refrendan contra CGN.`,
                      "high",
                      "Revisar diferencias CUIPO vs CGN por impuesto.",
                      { impactAmount: eficiencia.totalDifference ?? undefined, actionTarget: "module:eficiencia" },
                    ),
          ]
        : status === "upload_needed"
          ? [
                      makeFinding(
                        "eficiencia",
                        "Refrendación fiscal incompleta",
                        "Faltan saldos contables para comparar contra CUIPO.",
                        "blocked",
                        "Cargar CGN Saldos IV y, si está disponible, CGN Saldos I.",
                        { priorityScore: 315, actionTarget: "input:cgn_saldos_iv" },
                      ),
            ]
          : [],
      nextAction: eficiencia.hasCGNData
        ? "Revisar tributos con mayor variación."
        : "Cargar CGN Saldos IV y CGN Saldos I.",
    }));
  }

  if (agua) {
    modules.push(moduleResult({
      id: "agua",
      label: "Evaluación Agua Potable",
      status: agua.status,
      summary: agua.hasProgramacionData
        ? `${agua.subValidaciones.filter((s) => s.status === "cumple").length}/${agua.subValidaciones.length} sub-validaciones cumplen`
        : "Asignación de recursos pendiente hasta cargar presupuesto de ingresos",
      inputs: ["cuipo_api", "cuipo_prog_ing"],
      metrics: agua.subValidaciones.map((sub) => ({
        label: sub.nombre,
        value: sub.porcentaje !== null ? `${sub.porcentaje.toFixed(1)}% (${sub.status})` : sub.status,
      })),
      findings: agua.status !== "cumple"
        ? [
                    makeFinding(
                      "agua",
                      "Agua potable con validaciones pendientes o fallidas",
                      `${agua.subValidaciones.filter((s) => s.status !== "cumple").length} sub-validación(es) requieren revisión.`,
                      agua.status === "no_cumple" ? "high" : "medium",
                      "Revisar déficit, ejecución y programación de recursos de agua potable.",
                      { priorityScore: agua.hasProgramacionData ? 170 : 310, actionTarget: agua.hasProgramacionData ? "module:agua" : "input:cuipo_prog_ing" },
                    ),
          ]
        : [],
      nextAction: agua.hasProgramacionData
        ? "Revisar sub-validaciones que no cumplen."
        : "Cargar Presupuesto de ingresos (PROG_ING).",
    }));
  }

  if (mapaInversiones) {
    const status: ValidationModuleStatus =
      mapaInversiones.status === "pendiente" && !inputs.mapaData
        ? "upload_needed"
        : mapaInversiones.status;
    modules.push(moduleResult({
      id: "mapa",
      label: "Mapa de Inversiones (PDM)",
      status,
      summary: status === "upload_needed"
        ? `${mapaInversiones.totalBepinesCuipo} BPIN en CUIPO - falta Mapa de Inversiones`
        : `${mapaInversiones.bepinesConCruce}/${mapaInversiones.totalBepinesCuipo} BPIN cruzan (${mapaInversiones.pctCruceValor.toFixed(1)}% del valor)`,
      inputs: ["cuipo_ejec_gas", "mapa_inversiones"],
      metrics: [
        { label: "BPIN CUIPO", value: String(mapaInversiones.totalBepinesCuipo) },
        { label: "BPIN con cruce", value: String(mapaInversiones.bepinesConCruce) },
        { label: "Valor cruzado", value: `${mapaInversiones.pctCruceValor.toFixed(1)}%` },
      ],
      findings: status === "upload_needed"
        ? [
                    makeFinding(
                      "mapa",
                      "Cruce BPIN bloqueado",
                      "Falta Mapa de Inversiones para validar proyectos contra PDM.",
                      "blocked",
                      "Cargar Mapa de Inversiones DNP.",
                      { priorityScore: 325, actionTarget: "input:mapa_inversiones" },
                    ),
          ]
        : mapaInversiones.status !== "cumple"
          ? [
                      makeFinding(
                        "mapa",
                        "BPIN sin cruce completo",
                        `${mapaInversiones.totalBepinesCuipo - mapaInversiones.bepinesConCruce} BPIN no cruzan.`,
                        "medium",
                        "Revisar proyectos CUIPO sin coincidencia en Mapa de Inversiones.",
                        { priorityScore: 130, actionTarget: "module:mapa" },
                      ),
            ]
          : [],
      nextAction: status === "upload_needed"
        ? "Cargar Mapa de Inversiones DNP."
        : "Revisar BPIN sin cruce.",
    }));
  }

  const inputSources = reconcileCuipoInputSources(inputs.inputSources, {
    equilibrio,
    sgp,
    agua,
    hasCuipoUpload: Boolean(inputs.cuipoData),
    periodLabel: formatValidationPeriodLabel(effectivePeriodo),
  });
  const runMode = determineRunMode(inputSources);
  const coverage = buildCoverage(effectivePeriodo, runMode, inputSources, modules);
  const runWarnings = [...inputs.warnings];
  if (coverage.blockedModules > 0) {
    runWarnings.push(warning(
      "blocked-modules",
      "Validaciones bloqueadas por insumos",
      `${coverage.blockedModules} módulo(s) requieren insumos adicionales para cierre completo.`,
      "medium",
    ));
  }
  if (coverage.partialModules > 0) {
    runWarnings.push(warning(
      "partial-modules",
      "Cobertura parcial",
      `${coverage.partialModules} módulo(s) quedaron parciales por cobertura de datos o disponibilidad de APIs.`,
      "info",
    ));
  }

  return {
    municipio: {
      name: municipio.name,
      code: municipio.code,
      chipCode: municipio.chipCode,
      dept: municipio.dept,
    },
    periodo: effectivePeriodo,
    generatedAt: new Date().toISOString(),
    ruleVersion: RULE_VERSION,
    runMode,
    coverage,
    warnings: runWarnings,
    inputSources,
    modules,
    summary: buildSummary(modules, inputSources, runWarnings),
    data: {
      equilibrio,
      cierreVsCuipo,
      ley617,
      cga,
      agua,
      sgp,
      eficiencia,
      idf,
      mapaInversiones,
      ley617Certifications,
      futCierre: inputs.futCierre,
      futCierre2024: inputs.futCierre2024,
      cgnSaldos: inputs.cgnSaldos,
      cgnSaldosI: inputs.cgnSaldosI,
      mapaData: inputs.mapaData,
      cuipoData: inputs.cuipoData,
    },
  };
}

export function getInputSource(
  run: ValidationRun | null,
  key: string,
): ValidationInputSource | null {
  return run?.inputSources.find((input) => input.key === key) ?? null;
}
