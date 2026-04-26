/**
 * Excel Exporter — Generates a professionally styled .xlsx workbook
 *
 * Produces one sheet per validation module plus a summary (Resumen) and
 * a Trazabilidad sheet listing data sources.
 *
 * Uses `xlsx-js-style` (drop-in replacement for SheetJS) which supports
 * cell-level styling: fonts, fills, borders, number formats, alignment.
 */

import * as XLSX from "xlsx-js-style";

import type { Ley617Result } from "@/lib/validaciones/ley617";
import type { CGAResult } from "@/lib/validaciones/cga";
import type { SGPEvaluationResult } from "@/lib/validaciones/sgp";
import type { IDFResult } from "@/lib/validaciones/idf";
import type { AguaPotableResult } from "@/lib/validaciones/agua-potable";
import type { EficienciaFiscalResult } from "@/lib/validaciones/eficiencia-fiscal";
import type { CierreVsCuipoResult } from "@/lib/validaciones/cierre-vs-cuipo";
import type { MapaInversionesResult } from "@/lib/validaciones/mapa-inversiones";
import type { ValidationInputSource, ValidationRun, ValidationModuleStatus } from "@/lib/validation-run";

// ---------------------------------------------------------------------------
// Local type mirroring ValidadorDashboard's EquilibrioData
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Design system — gobia.co brand colors
// ---------------------------------------------------------------------------

const INK = "1A1A1A";
const OCHRE = "B8956A";
const SEPIA = "6B6B6B";
const WHITE = "FFFFFF";
const GREEN_BG = "DCFCE7";
const GREEN_TEXT = "166534";
const RED_BG = "FEE2E2";
const RED_TEXT = "991B1B";
const AMBER_BG = "FEF3C7";
const AMBER_TEXT = "92400E";
const TOTAL_BG = "E5E7EB";
const GRAY_BG = "F5F5F5";
const BORDER_COLOR = "D4D4D4";

// ---------------------------------------------------------------------------
// Reusable border definition
// ---------------------------------------------------------------------------

const thinBorder = {
  top: { style: "thin", color: { rgb: BORDER_COLOR } },
  bottom: { style: "thin", color: { rgb: BORDER_COLOR } },
  left: { style: "thin", color: { rgb: BORDER_COLOR } },
  right: { style: "thin", color: { rgb: BORDER_COLOR } },
};

// ---------------------------------------------------------------------------
// Reusable style objects
// ---------------------------------------------------------------------------

/** Dark header row — INK background, white bold text, centered + wrapped */
const headerStyle = {
  font: { bold: true, color: { rgb: WHITE }, sz: 10, name: "Calibri" },
  fill: { fgColor: { rgb: INK } },
  alignment: {
    horizontal: "center" as const,
    vertical: "center" as const,
    wrapText: true,
  },
  border: thinBorder,
};

/** Section title rows — Ochre background, white bold */
const sectionStyle = {
  font: { bold: true, color: { rgb: WHITE }, sz: 11, name: "Calibri" },
  fill: { fgColor: { rgb: OCHRE } },
  alignment: { horizontal: "left" as const },
  border: thinBorder,
};

/** Total/summary rows — gray background, bold */
const totalStyle = {
  font: { bold: true, sz: 10, name: "Calibri" },
  fill: { fgColor: { rgb: TOTAL_BG } },
  border: thinBorder,
};

/** Total row with number format */
const totalNumStyle = {
  ...totalStyle,
  numFmt: "#,##0.00",
  alignment: { horizontal: "right" as const },
};

/** Total row with percentage format */
const totalPctStyle = {
  ...totalStyle,
  numFmt: "0.00%",
  alignment: { horizontal: "right" as const },
};

/** Regular number cells — thin border, #,##0.00 format (full precision) */
const numStyle = {
  numFmt: "#,##0.00",
  border: thinBorder,
  font: { sz: 9, name: "Calibri" },
  alignment: { horizontal: "right" as const },
};

/** Percentage cells — thin border, 0.00% format */
const pctStyle = {
  numFmt: "0.00%",
  border: thinBorder,
  font: { sz: 9, name: "Calibri" },
  alignment: { horizontal: "right" as const },
};

/** Code cells (CUIPO codes, DANE codes) — Consolas mono font */
const codeStyle = {
  font: { name: "Consolas", sz: 9 },
  border: thinBorder,
  alignment: { horizontal: "left" as const },
};

/** Default data cell — thin border, 9pt */
const dataStyle = {
  font: { sz: 9, name: "Calibri" },
  border: thinBorder,
  alignment: { horizontal: "left" as const },
};

/** Data cell centered */
const dataCenterStyle = {
  font: { sz: 9, name: "Calibri" },
  border: thinBorder,
  alignment: { horizontal: "center" as const },
};

/** Label cell in key-value pairs */
const labelStyle = {
  font: { bold: true, sz: 10, color: { rgb: INK }, name: "Calibri" },
  border: thinBorder,
  alignment: { horizontal: "left" as const },
};

/** Value cell in key-value pairs (number) */
const valueNumStyle = {
  font: { sz: 10, name: "Calibri" },
  border: thinBorder,
  numFmt: "#,##0.00",
  alignment: { horizontal: "right" as const },
};

/** Value cell in key-value pairs (text) */
const valueTextStyle = {
  font: { sz: 10, name: "Calibri" },
  border: thinBorder,
  alignment: { horizontal: "left" as const },
};

/** Big title row — Ochre accent, large bold font */
const titleStyle = {
  font: { bold: true, color: { rgb: INK }, sz: 14, name: "Calibri" },
  fill: { fgColor: { rgb: "F5F0E8" } },
  alignment: { horizontal: "left" as const, vertical: "center" as const },
  border: {
    bottom: { style: "medium", color: { rgb: OCHRE } },
    top: { style: "thin", color: { rgb: BORDER_COLOR } },
    left: { style: "thin", color: { rgb: BORDER_COLOR } },
    right: { style: "thin", color: { rgb: BORDER_COLOR } },
  },
};

/** Alternate row background for zebra striping */
const altRowStyle = {
  font: { sz: 9, name: "Calibri" },
  border: thinBorder,
  fill: { fgColor: { rgb: GRAY_BG } },
  alignment: { horizontal: "left" as const },
};

const altRowNumStyle = {
  ...altRowStyle,
  numFmt: "#,##0.00",
  alignment: { horizontal: "right" as const },
};

const altRowPctStyle = {
  ...altRowStyle,
  numFmt: "0.00%",
  alignment: { horizontal: "right" as const },
};

const altRowCodeStyle = {
  font: { name: "Consolas", sz: 9 },
  border: thinBorder,
  fill: { fgColor: { rgb: GRAY_BG } },
  alignment: { horizontal: "left" as const },
};

const altRowCenterStyle = {
  ...altRowStyle,
  alignment: { horizontal: "center" as const },
};

// ---------------------------------------------------------------------------
// Status semaphore helper
// ---------------------------------------------------------------------------

function statusStyle(status: string) {
  const s = (status || "").toUpperCase().trim();
  if (["CUMPLE", "SI", "OK", "CORRECTO", "USADO"].includes(s)) {
    return {
      font: { bold: true, color: { rgb: GREEN_TEXT }, sz: 9, name: "Calibri" },
      fill: { fgColor: { rgb: GREEN_BG } },
      alignment: { horizontal: "center" as const },
      border: thinBorder,
    };
  }
  if (["NO CUMPLE", "NO", "NO_CUMPLE", "SIN_CRUCE", "CRITICO"].includes(s)) {
    return {
      font: { bold: true, color: { rgb: RED_TEXT }, sz: 9, name: "Calibri" },
      fill: { fgColor: { rgb: RED_BG } },
      alignment: { horizontal: "center" as const },
      border: thinBorder,
    };
  }
  if (["PARCIAL", "ALERTA", "PENDIENTE", "REQUIERE INSUMO", "EXCLUIDO", "FALTANTE"].includes(s)) {
    return {
      font: {
        bold: true,
        color: { rgb: AMBER_TEXT },
        sz: 9,
        name: "Calibri",
      },
      fill: { fgColor: { rgb: AMBER_BG } },
      alignment: { horizontal: "center" as const },
      border: thinBorder,
    };
  }
  return {
    font: { sz: 9, name: "Calibri" },
    border: thinBorder,
    alignment: { horizontal: "center" as const },
  };
}

// ---------------------------------------------------------------------------
// Cell helper utilities
// ---------------------------------------------------------------------------

/** Encode a cell reference from row, col indices */
function cellRef(r: number, c: number): string {
  return XLSX.utils.encode_cell({ r, c });
}

/** Write a styled text cell */
function writeText(
  ws: XLSX.WorkSheet,
  r: number,
  c: number,
  value: string,
  style: Record<string, unknown>,
): void {
  ws[cellRef(r, c)] = { v: value, t: "s", s: style };
}

/** Write a styled number cell */
function writeNum(
  ws: XLSX.WorkSheet,
  r: number,
  c: number,
  value: number,
  style: Record<string, unknown>,
): void {
  ws[cellRef(r, c)] = { v: value, t: "n", s: style };
}

/** Write a cell that could be string, number, or empty */
function writeCell(
  ws: XLSX.WorkSheet,
  r: number,
  c: number,
  value: unknown,
  style: Record<string, unknown>,
): void {
  if (value === null || value === undefined || value === "") {
    ws[cellRef(r, c)] = { v: "", t: "s", s: style };
  } else if (typeof value === "number") {
    ws[cellRef(r, c)] = { v: value, t: "n", s: style };
  } else if (typeof value === "boolean") {
    ws[cellRef(r, c)] = { v: value ? "Si" : "No", t: "s", s: style };
  } else {
    ws[cellRef(r, c)] = { v: String(value), t: "s", s: style };
  }
}

/** Set the sheet range */
function setRange(
  ws: XLSX.WorkSheet,
  maxRow: number,
  maxCol: number,
): void {
  ws["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxRow, c: maxCol },
  });
}

/** Apply freeze panes (freeze rows above ySplit) */
function freezeRows(ws: XLSX.WorkSheet, ySplit: number): void {
  /* xlsx-js-style uses !freeze for freeze panes */
  (ws as Record<string, unknown>)["!freeze"] = {
    xSplit: 0,
    ySplit,
    topLeftCell: cellRef(ySplit, 0),
    state: "frozen",
  };
}

/** Write a title row spanning multiple columns */
function writeTitle(
  ws: XLSX.WorkSheet,
  row: number,
  text: string,
  colSpan: number,
): void {
  writeText(ws, row, 0, text, titleStyle);
  for (let c = 1; c < colSpan; c++) {
    writeText(ws, row, c, "", titleStyle);
  }
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: colSpan - 1 } });
}

/** Write a section header row spanning multiple columns */
function writeSectionRow(
  ws: XLSX.WorkSheet,
  row: number,
  text: string,
  colSpan: number,
): void {
  writeText(ws, row, 0, text, sectionStyle);
  for (let c = 1; c < colSpan; c++) {
    writeText(ws, row, c, "", sectionStyle);
  }
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: row, c: 0 }, e: { r: row, c: colSpan - 1 } });
}

/** Write a header row with headerStyle */
function writeHeaderRow(
  ws: XLSX.WorkSheet,
  row: number,
  headers: string[],
): void {
  for (let c = 0; c < headers.length; c++) {
    writeText(ws, row, c, headers[c], headerStyle);
  }
}

/** Write a key-value pair row (label in col 0, value in col 1) */
function writeKV(
  ws: XLSX.WorkSheet,
  row: number,
  label: string,
  value: unknown,
  colSpan: number = 2,
): void {
  writeText(ws, row, 0, label, labelStyle);
  if (typeof value === "number") {
    writeNum(ws, row, 1, value, valueNumStyle);
  } else {
    writeText(ws, row, 1, String(value ?? ""), valueTextStyle);
  }
  // Fill remaining columns with empty border cells
  for (let c = 2; c < colSpan; c++) {
    writeText(ws, row, c, "", dataStyle);
  }
}

function writeKVNullableNumber(
  ws: XLSX.WorkSheet,
  row: number,
  label: string,
  value: number | null | undefined,
  colSpan: number = 2,
  emptyLabel: string = "N/D"
): void {
  writeText(ws, row, 0, label, labelStyle);
  if (typeof value === "number") {
    writeNum(ws, row, 1, value, valueNumStyle);
  } else {
    writeText(ws, row, 1, emptyLabel, valueTextStyle);
  }
  for (let c = 2; c < colSpan; c++) {
    writeText(ws, row, c, "", dataStyle);
  }
}

function writeNullableNumCell(
  ws: XLSX.WorkSheet,
  r: number,
  c: number,
  value: number | null | undefined,
  numCellStyle: Record<string, unknown>,
  textCellStyle: Record<string, unknown>,
  emptyLabel: string = "N/D"
): void {
  if (typeof value === "number") {
    writeNum(ws, r, c, value, numCellStyle);
  } else {
    writeText(ws, r, c, emptyLabel, textCellStyle);
  }
}

/** Write a key-value pair where the value is a percentage */
function writeKVPct(
  ws: XLSX.WorkSheet,
  row: number,
  label: string,
  value: number,
  colSpan: number = 2,
): void {
  writeText(ws, row, 0, label, labelStyle);
  // Excel % format auto-multiplies by 100.
  // Caller must pass value in 0-1 format (e.g., 0.9147 for 91.47%)
  writeNum(ws, row, 1, value, { ...valueNumStyle, numFmt: "0.00%" });
  for (let c = 2; c < colSpan; c++) {
    writeText(ws, row, c, "", dataStyle);
  }
}

/** Write an empty row with borders */
function writeEmptyRow(
  ws: XLSX.WorkSheet,
  row: number,
  colSpan: number,
): void {
  for (let c = 0; c < colSpan; c++) {
    writeText(ws, row, c, "", dataStyle);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ExportData {
  municipio: { name: string; code: string; chipCode: string };
  periodo: string;
  validationRun?: ValidationRun | null;
  equilibrio?: EquilibrioData | null;
  cierreVsCuipo?: CierreVsCuipoResult | null;
  ley617?: Ley617Result | null;
  cga?: CGAResult | null;
  agua?: AguaPotableResult | null;
  sgp?: SGPEvaluationResult | null;
  eficiencia?: EficienciaFiscalResult | null;
  idf?: IDFResult | null;
  mapaInversiones?: MapaInversionesResult | null;
}

function validationStatusLabel(status: ValidationModuleStatus): string {
  if (status === "cumple") return "CUMPLE";
  if (status === "no_cumple") return "NO CUMPLE";
  if (status === "upload_needed") return "REQUIERE INSUMO";
  if (status === "pendiente") return "PENDIENTE";
  if (status === "error") return "ERROR";
  if (status === "loading") return "CALCULANDO";
  return "PARCIAL";
}

function traceSourceLabel(source: string): string {
  if (source === "api") return "API publica";
  if (source === "fixture") return "Demo precargado";
  if (source === "uploaded") return "Archivo cargado";
  return "Faltante";
}

function traceRunModeLabel(mode: ValidationRun["runMode"]): string {
  if (mode === "demo_fixture") return "Demo precargado";
  if (mode === "mixed") return "Mixta";
  return "API publica";
}

function traceInputStatusLabel(status: ValidationInputSource["status"]): string {
  if (status === "available") return "USADO";
  if (status === "partial") return "PARCIAL";
  if (status === "excluded") return "EXCLUIDO";
  return "FALTANTE";
}

function tracePeriodLabel(periodo: string): string {
  if (periodo === "20251201") return "T4 2025 Demo / Cierre anual";
  const trimester = ({ "03": "T1", "06": "T2", "09": "T3", "12": "T4" } as Record<string, string>)[periodo.slice(4, 6)];
  return trimester ? `${trimester} ${periodo.slice(0, 4)}` : periodo;
}

function traceInputDetail(input: ValidationInputSource): string {
  const details = [
    input.excludedReason ?? input.detail,
    input.expectedPeriod ? `Esperado: ${input.expectedPeriod}` : "",
    input.actualPeriod ? `Detectado: ${input.actualPeriod}` : "",
    input.rows !== undefined ? `Filas: ${input.rows}` : "",
  ].filter(Boolean);
  return details.join(" | ");
}

export function exportValidacionesToExcel(data: ExportData): void {
  const wb = XLSX.utils.book_new();

  addResumenSheet(wb, data);
  if (data.equilibrio) addEquilibrioSheet(wb, data.equilibrio);
  if (data.cierreVsCuipo) addCierreSheet(wb, data.cierreVsCuipo);
  if (data.ley617) addLey617Sheet(wb, data.ley617);
  if (data.cga) addCGASheet(wb, data.cga);
  if (data.agua) addAguaSheet(wb, data.agua);
  if (data.sgp) addSGPSheet(wb, data.sgp);
  if (data.eficiencia) addEficienciaSheet(wb, data.eficiencia);
  if (data.idf) addIDFSheet(wb, data.idf);
  if (data.mapaInversiones) addMapaSheet(wb, data.mapaInversiones);
  addTrazabilidadSheet(wb, data);

  const fileName = `validador-${data.municipio.code}-${data.periodo}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ---------------------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------------------

function addResumenSheet(wb: XLSX.WorkBook, data: ExportData): void {
  const ws: XLSX.WorkSheet = {};
  const run = data.validationRun ?? null;
  const periodLabel = run?.coverage.periodLabel ?? tracePeriodLabel(data.periodo);
  const cols = 3;
  let r = 0;

  // Title
  writeTitle(ws, r++, "VALIDADOR FISCAL MUNICIPAL \u2014 RESUMEN EJECUTIVO", cols);
  writeEmptyRow(ws, r++, cols);

  // Metadata
  writeKV(ws, r++, "Municipio:", data.municipio.name, cols);
  writeText(ws, r, 0, "Codigo DANE:", labelStyle);
  writeText(ws, r, 1, data.municipio.code, { ...codeStyle, font: { ...codeStyle.font, sz: 10 } });
  writeText(ws, r++, 2, "", dataStyle);
  writeText(ws, r, 0, "Codigo CHIP:", labelStyle);
  writeText(ws, r, 1, data.municipio.chipCode, { ...codeStyle, font: { ...codeStyle.font, sz: 10 } });
  writeText(ws, r++, 2, "", dataStyle);
  writeKV(ws, r++, "Periodo:", `${periodLabel} (${data.periodo})`, cols);
  if (run) {
    writeKV(ws, r++, "Modo de corrida:", traceRunModeLabel(run.runMode), cols);
  }
  writeKV(ws, r++, "Fecha de exportacion:", new Date().toISOString().split("T")[0], cols);
  writeEmptyRow(ws, r++, cols);

  // Period note
  const periodNoteStyle = {
    font: { sz: 9, name: "Calibri", italic: true, color: { rgb: SEPIA } },
    border: thinBorder,
    alignment: { horizontal: "left" as const, wrapText: true },
  };
  writeText(
    ws,
    r,
    0,
    run
      ? `Nota: ${run.coverage.dataSourcesSummary} Los insumos excluidos o faltantes no se mezclan silenciosamente con el calculo.`
      : `Nota: Datos del periodo ${periodLabel}. Para cierre anual (T4/Dic), cargar archivos CUIPO desde CHIP.`,
    periodNoteStyle,
  );
  for (let c = 1; c < cols; c++) writeText(ws, r, c, "", dataStyle);
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: cols - 1 } });
  r++;
  writeEmptyRow(ws, r++, cols);

  if (run) {
    writeSectionRow(ws, r++, "COBERTURA DE LA CORRIDA", cols);
    writeKV(ws, r++, "Estado global:", `${run.summary.label} - ${run.summary.detail}`, cols);
    writeKV(ws, r++, "Insumos:", `${run.coverage.availableInputs} usados, ${run.coverage.missingInputs} faltantes, ${run.coverage.excludedInputs} excluidos`, cols);
    writeKV(ws, r++, "Validaciones:", `${run.coverage.completeModules} completas, ${run.coverage.partialModules} parciales, ${run.coverage.blockedModules} bloqueadas`, cols);
    writeEmptyRow(ws, r++, cols);

    if (run.warnings.length > 0) {
      writeSectionRow(ws, r++, "ADVERTENCIAS AUDITABLES", cols);
      writeHeaderRow(ws, r++, ["ADVERTENCIA", "SEVERIDAD", "DETALLE"]);
      for (let i = 0; i < run.warnings.length; i++) {
        const item = run.warnings[i];
        const ds = i % 2 === 1 ? altRowStyle : dataStyle;
        writeText(ws, r, 0, item.title, ds);
        writeText(ws, r, 1, item.severity.toUpperCase(), statusStyle(item.severity === "info" ? "PENDIENTE" : "ALERTA"));
        writeText(ws, r, 2, item.detail, ds);
        r++;
      }
      writeEmptyRow(ws, r++, cols);
    }
  }

  // Module summary table header
  writeHeaderRow(ws, r++, ["MODULO", "ESTADO", "OBSERVACION"]);

  // Module rows
  const modules: [string, string, string][] = run
    ? run.modules.map((module) => [
        module.label,
        validationStatusLabel(module.status),
        module.summary,
      ])
    : [];

  if (!data.validationRun && data.equilibrio) {
    const diff = Math.abs(
      data.equilibrio.totalIngresos - (data.equilibrio.totalCompromisos || 0),
    );
    modules.push([
      "Equilibrio Presupuestal",
      diff < 1_000_000 ? "CUMPLE" : "NO CUMPLE",
      `Diferencia: $${diff.toLocaleString("es-CO")}`,
    ]);
  }
  if (!data.validationRun && data.cierreVsCuipo) {
    modules.push([
      "Cierre FUT vs CUIPO",
      data.cierreVsCuipo.status.toUpperCase(),
      `${data.cierreVsCuipo.cruces.length} cruces`,
    ]);
  }
  if (!data.validationRun && data.ley617) {
    modules.push([
      "Ley 617 / SI.17",
      data.ley617.status.toUpperCase(),
      `Ratio: ${(data.ley617.ratioGlobal * 100).toFixed(2)}% / Limite: ${(data.ley617.limiteGlobal * 100).toFixed(0)}%`,
    ]);
  }
  if (!data.validationRun && data.cga) {
    modules.push([
      "Equilibrio CGA",
      data.cga.status.toUpperCase(),
      `${data.cga.checks.length} chequeos`,
    ]);
  }
  if (!data.validationRun && data.agua) {
    modules.push([
      "Agua Potable",
      data.agua.status.toUpperCase(),
      `${data.agua.subValidaciones.length} sub-validaciones`,
    ]);
  }
  if (!data.validationRun && data.sgp) {
    modules.push([
      "SGP",
      data.sgp.status.toUpperCase(),
      `${data.sgp.componentes.length} componentes`,
    ]);
  }
  if (!data.validationRun && data.eficiencia) {
    modules.push([
      "Eficiencia Fiscal",
      data.eficiencia.status.toUpperCase(),
      `${data.eficiencia.refrendaCount || 0} impuestos refrendados`,
    ]);
  }
  if (!data.validationRun && data.idf) {
    modules.push([
      "Desempeno Fiscal IDF",
      data.idf.status.toUpperCase(),
      `Score: ${data.idf.idfTotal.toFixed(1)} (${data.idf.ranking})`,
    ]);
  }
  if (!data.validationRun && data.mapaInversiones) {
    modules.push([
      "Mapa de Inversiones",
      data.mapaInversiones.status.toUpperCase(),
      `${data.mapaInversiones.pctCruceBepin.toFixed(1)}% BEPIN cruzan`,
    ]);
  }

  for (let i = 0; i < modules.length; i++) {
    const [mod, estado, obs] = modules[i];
    const isAlt = i % 2 === 1;
    writeText(ws, r, 0, mod, isAlt ? altRowStyle : dataStyle);
    writeText(ws, r, 1, estado, statusStyle(estado));
    writeText(ws, r, 2, obs, isAlt ? altRowStyle : dataStyle);
    r++;
  }

  setRange(ws, r - 1, cols - 1);
  ws["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 45 }];
  freezeRows(ws, 9); // Freeze above the header row
  XLSX.utils.book_append_sheet(wb, ws, "Resumen");
}

// ---------------------------------------------------------------------------
// 0. Equilibrio
// ---------------------------------------------------------------------------

function addEquilibrioSheet(wb: XLSX.WorkBook, data: EquilibrioData): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 13; // +2 columns: Formula, Verificacion
  let r = 0;

  writeTitle(ws, r++, "EQUILIBRIO PRESUPUESTAL POR FUENTE DE FINANCIACION", detailCols);
  writeEmptyRow(ws, r++, detailCols);

  // Summary KV pairs
  writeKV(ws, r++, "Total Ingresos:", data.totalIngresos, detailCols);
  writeKV(ws, r++, "Total Compromisos:", data.totalCompromisos ?? 0, detailCols);
  writeKV(ws, r++, "Total Obligaciones:", data.totalObligaciones ?? 0, detailCols);
  writeKV(ws, r++, "Total Pagos:", data.totalPagos, detailCols);
  writeKV(ws, r++, "Total Reservas:", data.totalReservas ?? 0, detailCols);
  writeKV(ws, r++, "Total CxP:", data.totalCxP ?? 0, detailCols);
  writeKV(ws, r++, "Superavit/Deficit:", data.superavit, detailCols);
  writeKV(ws, r++, "Saldo en Libros:", data.saldoEnLibros ?? 0, detailCols);
  writeKVPct(ws, r++, "% Ejecucion:", data.pctEjecucion / 100, detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeKV(ws, r++, "Ppto Inicial Ingresos:", data.pptoInicialIngresos ?? 0, detailCols);
  writeKV(ws, r++, "Ppto Inicial Gastos:", data.pptoInicialGastos ?? 0, detailCols);
  writeKV(ws, r++, "Ppto Definitivo Ingresos:", data.pptoDefinitivoIngresos ?? 0, detailCols);
  writeKV(ws, r++, "Ppto Definitivo Gastos:", data.pptoDefinitivoGastos ?? 0, detailCols);
  writeEmptyRow(ws, r++, detailCols);

  // Detail table
  writeSectionRow(ws, r++, "DETALLE POR FUENTE", detailCols);
  const headers = [
    "Codigo",
    "Nombre",
    "Recaudo",
    "Compromisos",
    "Obligaciones",
    "Pagos",
    "Reservas",
    "CxP",
    "Superavit",
    "Validador",
    "Saldo Libros",
    "Formula",
    "Verificacion",
  ];
  writeHeaderRow(ws, r++, headers);
  const freezeRow = r;

  for (let i = 0; i < data.porFuente.length; i++) {
    const f = data.porFuente[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const cs = isAlt ? altRowCodeStyle : codeStyle;
    const ds = isAlt ? altRowStyle : dataStyle;

    writeText(ws, r, 0, f.codigo, cs);
    writeText(ws, r, 1, f.nombre, ds);
    writeNum(ws, r, 2, f.recaudo, ns);
    writeNum(ws, r, 3, f.compromisos, ns);
    writeNum(ws, r, 4, f.obligaciones ?? 0, ns);
    writeNum(ws, r, 5, f.pagos, ns);
    writeNum(ws, r, 6, f.reservas ?? 0, ns);
    writeNum(ws, r, 7, f.cxp ?? 0, ns);
    writeNum(ws, r, 8, f.superavit, ns);
    writeNum(ws, r, 9, f.validador ?? 0, ns);
    writeNum(ws, r, 10, f.saldoEnLibros ?? 0, ns);

    // Formula column — describes how each derived field was calculated
    const reservas = f.reservas ?? 0;
    const cxp = f.cxp ?? 0;
    const obligaciones = f.obligaciones ?? 0;
    const resAnt = f.reservasVigAnterior ?? 0;
    const cxpAnt = f.cxpVigAnterior ?? 0;
    const formulaText = [
      "Reservas= Compromisos - Obligaciones",
      "CxP= Obligaciones - Pagos",
      "Superavit= Recaudo - Compromisos",
      "SaldoLibros= Superavit + Reservas + CxP + Res.Ant + CxP.Ant",
    ].join(" | ");
    writeText(ws, r, 11, formulaText, ds);

    // Verification column — recalculate and confirm within $1 tolerance
    const checks: string[] = [];
    const expectedReservas = f.compromisos - obligaciones;
    if (Math.abs(reservas - expectedReservas) > 1) {
      checks.push(`Reservas DIFF=$${(reservas - expectedReservas).toFixed(2)}`);
    }
    const expectedCxP = obligaciones - f.pagos;
    if (Math.abs(cxp - expectedCxP) > 1) {
      checks.push(`CxP DIFF=$${(cxp - expectedCxP).toFixed(2)}`);
    }
    const validador = f.validador ?? 0;
    if (Math.abs(validador) > 1) {
      checks.push(`Validador DIFF=$${validador.toFixed(2)}`);
    }
    const expectedSaldo = f.superavit + reservas + cxp + resAnt + cxpAnt;
    const saldoLibros = f.saldoEnLibros ?? 0;
    if (Math.abs(saldoLibros - expectedSaldo) > 1) {
      checks.push(`SaldoLibros DIFF=$${(saldoLibros - expectedSaldo).toFixed(2)}`);
    }
    const verificationText = checks.length === 0 ? "\u2713" : `\u2717 ${checks.join("; ")}`;
    const verStyle = checks.length === 0
      ? statusStyle("CUMPLE")
      : statusStyle("NO CUMPLE");
    writeText(ws, r, 12, verificationText, verStyle);

    r++;
  }

  // Note about Presupuesto de Ingresos
  writeEmptyRow(ws, r++, detailCols);
  const eqNoteStyle = {
    font: { sz: 9, name: "Calibri", italic: true, color: { rgb: SEPIA } },
    border: thinBorder,
    alignment: { horizontal: "left" as const, wrapText: true },
  };
  writeText(ws, r, 0, "NOTA: Presupuesto de Ingresos = 0 porque el dataset PROG_INGRESOS de datos.gov.co tiene schema no estandar. Con upload CUIPO CHIP, estos valores se completan.", eqNoteStyle);
  for (let c = 1; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: detailCols - 1 } });
  r++;

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 18 }, // Codigo
    { wch: 35 }, // Nombre
    { wch: 16 }, // Recaudo
    { wch: 16 }, // Compromisos
    { wch: 16 }, // Obligaciones
    { wch: 16 }, // Pagos
    { wch: 14 }, // Reservas
    { wch: 14 }, // CxP
    { wch: 16 }, // Superavit
    { wch: 14 }, // Validador
    { wch: 16 }, // Saldo Libros
    { wch: 55 }, // Formula
    { wch: 40 }, // Verificacion
  ];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "0. Equilibrio");
}

// ---------------------------------------------------------------------------
// 1. Cierre vs CUIPO
// ---------------------------------------------------------------------------

function addCierreSheet(wb: XLSX.WorkBook, data: CierreVsCuipoResult): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 14;
  let r = 0;

  writeTitle(ws, r++, "CIERRE FUT vs CUIPO", detailCols);
  writeEmptyRow(ws, r++, detailCols);

  // Status with semaphore
  writeText(ws, r, 0, "Estado:", labelStyle);
  writeText(ws, r, 1, data.status.toUpperCase(), statusStyle(data.status.toUpperCase()));
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;

  writeKV(ws, r++, "Diff total Saldo en Libros:", data.totalDiffSaldoLibros, detailCols);
  writeKV(ws, r++, "Diff total Reservas:", data.totalDiffReservas, detailCols);
  writeKV(ws, r++, "Diff total CxP:", data.totalDiffCxP, detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeSectionRow(ws, r++, "DETALLE POR CODIGO FUT", detailCols);
  writeHeaderRow(ws, r++, [
    "Codigo FUT",
    "Nombre",
    "Nivel",
    "Consolidacion",
    "Saldo Libros FUT",
    "Saldo Libros CUIPO",
    "Diff Saldo Libros",
    "Reservas FUT",
    "Reservas CUIPO",
    "Diff Reservas",
    "CxP FUT",
    "CxP CUIPO",
    "Diff CxP",
    "Con datos",
  ]);
  const freezeRow = r;

  for (let i = 0; i < data.cruces.length; i++) {
    const c = data.cruces[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const cs = isAlt ? altRowCodeStyle : codeStyle;
    const ds = isAlt ? altRowStyle : dataStyle;
    const dc = isAlt ? altRowCenterStyle : dataCenterStyle;

    writeText(ws, r, 0, c.codigoFUT, cs);
    writeText(ws, r, 1, c.nombre, ds);
    writeNum(ws, r, 2, c.nivel, { ...ns, alignment: { horizontal: "center" as const } });
    writeCell(ws, r, 3, c.consolidacion ?? "", dc);
    writeNum(ws, r, 4, c.saldoLibrosFUT, ns);
    writeNum(ws, r, 5, c.saldoLibrosCUIPO, ns);
    writeNum(ws, r, 6, c.diffSaldoLibros, ns);
    writeNum(ws, r, 7, c.reservasFUT, ns);
    writeNum(ws, r, 8, c.reservasCUIPO, ns);
    writeNum(ws, r, 9, c.diffReservas, ns);
    writeNum(ws, r, 10, c.cxpFUT, ns);
    writeNum(ws, r, 11, c.cxpCUIPO, ns);
    writeNum(ws, r, 12, c.diffCxP, ns);
    writeText(ws, r, 13, c.hasData ? "Si" : "No", statusStyle(c.hasData ? "SI" : "NO"));
    r++;
  }

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 14 }, { wch: 30 }, { wch: 8 }, { wch: 14 },
    { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
  ];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "1. Cierre vs CUIPO");
}

// ---------------------------------------------------------------------------
// 2. Ley 617
// ---------------------------------------------------------------------------

function addLey617Sheet(wb: XLSX.WorkBook, data: Ley617Result): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 9;
  let r = 0;

  writeTitle(ws, r++, "LEY 617 / SI.17 \u2014 LIMITE DE GASTOS DE FUNCIONAMIENTO", detailCols);
  writeEmptyRow(ws, r++, detailCols);

  // Status
  writeText(ws, r, 0, "Estado:", labelStyle);
  writeText(ws, r, 1, data.status.toUpperCase(), statusStyle(data.status.toUpperCase()));
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;

  writeKVPct(ws, r++, "Ratio Global:", data.ratioGlobal, detailCols);
  writeKVPct(ws, r++, "Limite Global:", data.limiteGlobal, detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeKV(ws, r++, "ICLD Bruto:", data.icldBruto, detailCols);
  // Capturamos la fila del ICLD Validado para referenciarla en las fórmulas
  // de la tabla editable de fondos (más abajo). Cada celda valor se calcula
  // como `% × ICLD_Validado` y Excel la recompone cuando el usuario edita el %.
  const icldValidadoRow = r;
  writeKV(ws, r++, "ICLD Validado:", data.icldValidado, detailCols);
  writeKV(ws, r++, "Deduccion Fondos (usada):", data.deduccionFondos, detailCols);
  writeKV(ws, r++, "ICLD Neto:", data.icldNeto, detailCols);
  writeKV(ws, r++, "Acciones de Mejora:", data.accionesMejora, detailCols);
  writeEmptyRow(ws, r++, detailCols);

  // -------------------------------------------------------------------------
  // Tabla editable: Deducción Calculada (Fondos)
  // El usuario edita los porcentajes en la columna B y la columna C se
  // recalcula automáticamente con la fórmula `=Bn*B{icldValidadoRow}`.
  // El total de la fila inferior suma tanto los % como los valores.
  // -------------------------------------------------------------------------
  if (data.fondosDeduccion && data.fondosDeduccion.length > 0) {
    writeSectionRow(ws, r++, "DEDUCCION CALCULADA — TABLA EDITABLE DE FONDOS", detailCols);
    writeHeaderRow(ws, r++, [
      "Destinacion especifica",
      "% ICLD",
      "Valor",
      "", "", "", "", "", "",
    ]);

    const icldValidadoCellRef = cellRef(icldValidadoRow, 1); // p.ej. "B7"
    const fondoFirstRow = r;

    for (let i = 0; i < data.fondosDeduccion.length; i++) {
      const f = data.fondosDeduccion[i];
      const isAlt = i % 2 === 1;
      const ns = isAlt ? altRowNumStyle : numStyle;
      const ds = isAlt ? altRowStyle : dataStyle;
      const pctEditableStyle = {
        ...(isAlt ? altRowNumStyle : numStyle),
        numFmt: "0.00%",
        // Resaltado sutil para que se note que es editable
        fill: { patternType: "solid", fgColor: { rgb: "FFFCEB" } },
      };

      // Nombre del fondo (con label custom para "Otros, ¿cuál?")
      const labelText = f.custom && f.customLabel
        ? `${f.nombre} — ${f.customLabel}`
        : f.nombre;
      writeText(ws, r, 0, labelText, ds);

      // Celda editable de porcentaje (default 0 o porcentaje del catálogo)
      writeNum(ws, r, 1, f.porcentaje ?? 0, pctEditableStyle);

      // Valor = % × ICLD Validado (fórmula Excel)
      const pctRef = cellRef(r, 1);
      ws[cellRef(r, 2)] = {
        t: "n",
        f: `${pctRef}*${icldValidadoCellRef}`,
        v: (f.porcentaje ?? 0) * data.icldValidado,
        s: ns,
      };

      // Resto de columnas en blanco para mantener el grid
      for (let c = 3; c < detailCols; c++) writeText(ws, r, c, "", ds);
      r++;
    }

    // Fila total
    const fondoLastRow = r - 1;
    const totalLabelStyle = { ...labelStyle, font: { ...labelStyle.font, bold: true } };
    const totalNumStyle = { ...numStyle, font: { ...numStyle.font, bold: true } };
    const totalPctStyle = { ...numStyle, font: { ...numStyle.font, bold: true }, numFmt: "0.00%" };

    writeText(ws, r, 0, "TOTAL DEDUCCION CALCULADA", totalLabelStyle);
    ws[cellRef(r, 1)] = {
      t: "n",
      f: `SUM(${cellRef(fondoFirstRow, 1)}:${cellRef(fondoLastRow, 1)})`,
      v: 0,
      s: totalPctStyle,
    };
    ws[cellRef(r, 2)] = {
      t: "n",
      f: `SUM(${cellRef(fondoFirstRow, 2)}:${cellRef(fondoLastRow, 2)})`,
      v: 0,
      s: totalNumStyle,
    };
    for (let c = 3; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
    r++;

    writeText(
      ws,
      r,
      0,
      "Edita los porcentajes en la columna B; los valores se recalculan automaticamente.",
      { font: { sz: 8, italic: true, color: { rgb: SEPIA } }, border: thinBorder },
    );
    for (let c = 1; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
    r++;
    writeEmptyRow(ws, r++, detailCols);
  }

  // Deduccion por norma detail
  if (data.deduccionFondosPorNormaDetalle && data.deduccionFondosPorNormaDetalle.length > 0) {
    writeSectionRow(ws, r++, "DETALLE DEDUCCION POR CONDICIONES DE NORMA", detailCols);
    writeHeaderRow(ws, r++, ["Cuenta", "Nombre", "Fuente", "Recaudo", "Motivo"]);
    for (let i = 0; i < data.deduccionFondosPorNormaDetalle.length; i++) {
      const d = data.deduccionFondosPorNormaDetalle[i];
      const isAlt = i % 2 === 1;
      const ns = isAlt ? altRowNumStyle : numStyle;
      const ds = isAlt ? altRowStyle : dataStyle;
      writeText(ws, r, 0, d.cuenta, ds);
      writeText(ws, r, 1, d.nombre, ds);
      writeText(ws, r, 2, d.fuente, ds);
      writeNum(ws, r, 3, d.valor, ns);
      writeText(ws, r, 4, d.razon, ds);
      r++;
    }
    writeEmptyRow(ws, r++, detailCols);
  }

  writeKV(ws, r++, "Gastos Funcionamiento Total:", data.gastosFuncionamientoTotal, detailCols);
  writeKV(ws, r++, "Gastos Deducidos:", data.gastosDeducidos, detailCols);
  writeKV(ws, r++, "Gastos Funcionamiento Neto:", data.gastosFuncionamientoNeto, detailCols);
  writeEmptyRow(ws, r++, detailCols);

  // Formula annotations for auditability
  writeSectionRow(ws, r++, "FORMULAS DE CALCULO", detailCols);
  const formulaAnnotationStyle = {
    font: { sz: 8, name: "Consolas", color: { rgb: SEPIA } },
    border: thinBorder,
    alignment: { horizontal: "left" as const, wrapText: true },
  };
  const ley617Formulas = [
    "ICLD Bruto = \u03A3 recaudo donde fuente \u2208 {1.2.1.0.00, 1.2.4.3.04} (solo vigencia, sin RF/RB)",
    "ICLD Validado = \u03A3 recaudo donde cuenta \u2208 ICLD_CUENTAS_VALIDAS (55 cuentas CGR)",
    "Deduccion = dato reportado en fuente 1.2.3.4.02 (Ley 99 Ambiental)",
    "ICLD Neto = ICLD Validado - Deduccion",
    "GF Neto = GF Total (2.1, fuente ICLD/SGP-LD, vig actual+futuras) - Gastos Deducidos",
    "Ratio = GF Neto / ICLD Neto",
  ];
  for (const formula of ley617Formulas) {
    writeText(ws, r, 0, formula, formulaAnnotationStyle);
    for (let c = 1; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: detailCols - 1 } });
    r++;
  }
  writeEmptyRow(ws, r++, detailCols);

  // Secciones table
  writeSectionRow(ws, r++, "DETALLE POR SECCION", detailCols);
  writeHeaderRow(ws, r++, [
    "Seccion",
    "Gastos Func.",
    "ICLD",
    "Ratio",
    "Limite %",
    "Limite Absoluto",
    "Limite SMLMV",
    "Tipo Limite",
    "Estado",
  ]);
  const freezeRow = r;

  for (let i = 0; i < data.secciones.length; i++) {
    const s = data.secciones[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const ps = isAlt ? altRowPctStyle : pctStyle;
    const ds = isAlt ? altRowStyle : dataStyle;
    const dc = isAlt ? altRowCenterStyle : dataCenterStyle;

    writeText(ws, r, 0, s.seccion, ds);
    writeNum(ws, r, 1, s.gastosFuncionamiento, ns);
    writeNum(ws, r, 2, s.icld, ns);
    writeNum(ws, r, 3, s.ratio, ps);
    writeNum(ws, r, 4, s.limite, ps);
    writeCell(ws, r, 5, s.limiteAbsoluto ?? "", ns);
    writeCell(ws, r, 6, s.limiteSMLMV ?? "", dc);
    writeText(ws, r, 7, s.tipoLimite, dc);
    writeText(ws, r, 8, s.status.toUpperCase(), statusStyle(s.status.toUpperCase()));
    r++;
  }

  // Gastos deducidos detail
  if (data.gastosDeducidosDetalle.length > 0) {
    writeEmptyRow(ws, r++, detailCols);
    writeSectionRow(ws, r++, "DETALLE DE GASTOS DEDUCIDOS", detailCols);
    writeHeaderRow(ws, r++, ["Codigo", "Nombre", "Valor", "", "", "", "", "", ""]);

    for (let i = 0; i < data.gastosDeducidosDetalle.length; i++) {
      const g = data.gastosDeducidosDetalle[i];
      const isAlt = i % 2 === 1;
      writeText(ws, r, 0, g.codigo, isAlt ? altRowCodeStyle : codeStyle);
      writeText(ws, r, 1, g.nombre, isAlt ? altRowStyle : dataStyle);
      writeNum(ws, r, 2, g.valor, isAlt ? altRowNumStyle : numStyle);
      for (let c = 3; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
      r++;
    }
  }

  // ICLD detail (per-rubro breakdown)
  if (data.icldDetalle && data.icldDetalle.length > 0) {
    writeEmptyRow(ws, r++, detailCols);
    writeSectionRow(ws, r++, "DETALLE RUBROS ICLD", detailCols);
    writeHeaderRow(ws, r++, [
      "Codigo",
      "Nombre",
      "Recaudo",
      "Valido?",
      "Observacion",
      "",
      "",
      "",
      "",
    ]);

    const greenRowStyle = {
      font: { sz: 9, name: "Calibri" },
      border: thinBorder,
      fill: { fgColor: { rgb: GREEN_BG } },
      alignment: { horizontal: "left" as const },
    };
    const greenRowNumStyle = {
      ...greenRowStyle,
      numFmt: "#,##0.00",
      alignment: { horizontal: "right" as const },
    };
    const greenRowCenterStyle = {
      ...greenRowStyle,
      alignment: { horizontal: "center" as const },
    };
    const greenRowCodeStyle = {
      font: { name: "Consolas", sz: 9 },
      border: thinBorder,
      fill: { fgColor: { rgb: GREEN_BG } },
      alignment: { horizontal: "left" as const },
    };
    const amberRowStyle = {
      font: { sz: 9, name: "Calibri" },
      border: thinBorder,
      fill: { fgColor: { rgb: AMBER_BG } },
      alignment: { horizontal: "left" as const },
    };
    const amberRowNumStyle = {
      ...amberRowStyle,
      numFmt: "#,##0.00",
      alignment: { horizontal: "right" as const },
    };
    const amberRowCenterStyle = {
      ...amberRowStyle,
      alignment: { horizontal: "center" as const },
    };
    const amberRowCodeStyle = {
      font: { name: "Consolas", sz: 9 },
      border: thinBorder,
      fill: { fgColor: { rgb: AMBER_BG } },
      alignment: { horizontal: "left" as const },
    };

    for (let i = 0; i < data.icldDetalle.length; i++) {
      const d = data.icldDetalle[i];
      const cs = d.esValido ? greenRowCodeStyle : amberRowCodeStyle;
      const ds = d.esValido ? greenRowStyle : amberRowStyle;
      const ns = d.esValido ? greenRowNumStyle : amberRowNumStyle;
      const dc = d.esValido ? greenRowCenterStyle : amberRowCenterStyle;

      writeText(ws, r, 0, d.cuenta, cs);
      writeText(ws, r, 1, d.nombre, ds);
      writeNum(ws, r, 2, d.recaudo, ns);
      writeText(ws, r, 3, d.esValido ? "SI" : "NO", dc);
      writeText(ws, r, 4, d.esValido ? "" : "ACCION DE MEJORA", ds);
      for (let c = 5; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
      r++;
    }
  }

  // Alertas ICLD
  if (data.alertasICLD && data.alertasICLD.length > 0) {
    writeEmptyRow(ws, r++, detailCols);
    writeSectionRow(ws, r++, "ALERTAS ICLD", detailCols);
    writeHeaderRow(ws, r++, ["Rubro", "Nombre", "Fuente", "Alerta", "Valor"]);
    for (let i = 0; i < data.alertasICLD.length; i++) {
      const a = data.alertasICLD[i];
      const isAlt = i % 2 === 1;
      const ds = isAlt ? altRowStyle : dataStyle;
      const ns = isAlt ? altRowNumStyle : numStyle;
      writeText(ws, r, 0, a.cuenta, ds);
      writeText(ws, r, 1, a.nombre, ds);
      writeText(ws, r, 2, a.fuente, ds);
      writeText(ws, r, 3, a.alerta, ds);
      writeNum(ws, r, 4, a.valor, ns);
      r++;
    }
  }

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 22 }, { wch: 30 }, { wch: 18 }, { wch: 12 },
    { wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
  ];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "2. Ley 617");
}

// ---------------------------------------------------------------------------
// 3. CGA
// ---------------------------------------------------------------------------

function addCGASheet(wb: XLSX.WorkBook, data: CGAResult): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 10; // +1 column: Formula
  let r = 0;

  writeTitle(ws, r++, "EQUILIBRIO CGA \u2014 CONTRALORIA GENERAL DE LA REPUBLICA", detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeText(ws, r, 0, "Estado:", labelStyle);
  writeText(ws, r, 1, data.status.toUpperCase(), statusStyle(data.status.toUpperCase()));
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;
  writeEmptyRow(ws, r++, detailCols);

  writeHeaderRow(ws, r++, [
    "Chequeo",
    "Grupo",
    "Valor 1 Label",
    "Valor 1",
    "Valor 2 Label",
    "Valor 2",
    "Diferencia",
    "Tolerancia",
    "Estado",
    "Formula",
  ]);
  const freezeRow = r;

  // CGA formula annotations per check name pattern
  const cgaFormulaMap: Record<string, string> = {
    "ppto_ini": "Ppto Ini Ing (PROG_ING cuenta=1) vs Ppto Ini Gas (PROG_GAS cuenta=2, vigencia=1)",
    "ppto_def": "Ppto Def Ing (PROG_ING cuenta=1, def) vs Ppto Def Gas (PROG_GAS cuenta=2, def, vigencia=1)",
    "reservas": "Reservas FUT (FUT_CIERRE col M, fila C) vs Reservas CUIPO (\u03A3 compromisos_VA - obligaciones_VA)",
    "cxp": "CxP FUT (FUT_CIERRE col N, fila C) vs CxP CUIPO (\u03A3 obligaciones_VA - pagos_VA)",
    "saldo": "Saldo Libros FUT vs Saldo CUIPO (Superavit + Reservas + CxP + Res.Ant + CxP.Ant)",
    "recaudo": "Recaudo CUIPO (EJE_ING) vs Recaudo FUT (FUT_CIERRE col L)",
    "compromisos": "Compromisos CUIPO (EJE_GAS) vs Compromisos FUT (FUT_CIERRE col G)",
    "obligaciones": "Obligaciones CUIPO (EJE_GAS) vs Obligaciones FUT (FUT_CIERRE col H)",
    "pagos": "Pagos CUIPO (EJE_GAS) vs Pagos FUT (FUT_CIERRE col I)",
  };

  for (let i = 0; i < data.checks.length; i++) {
    const c = data.checks[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const ds = isAlt ? altRowStyle : dataStyle;

    writeText(ws, r, 0, c.name, ds);
    writeText(ws, r, 1, c.group, ds);
    writeText(ws, r, 2, c.value1Label, ds);
    writeNum(ws, r, 3, c.value1, ns);
    writeText(ws, r, 4, c.value2Label, ds);
    writeNum(ws, r, 5, c.value2, ns);
    writeNum(ws, r, 6, c.difference, ns);
    writeNum(ws, r, 7, c.tolerance, ns);
    writeText(ws, r, 8, c.status.toUpperCase(), statusStyle(c.status.toUpperCase()));

    // Formula column — match check name to known formula patterns
    const nameLower = c.name.toLowerCase();
    let formulaText = `${c.value1Label} vs ${c.value2Label}`;
    for (const [key, formula] of Object.entries(cgaFormulaMap)) {
      if (nameLower.includes(key)) {
        formulaText = formula;
        break;
      }
    }
    writeText(ws, r, 9, formulaText, ds);
    r++;
  }

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 30 }, { wch: 18 }, { wch: 20 }, { wch: 16 },
    { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
    { wch: 55 }, // Formula
  ];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "3. CGA");
}

// ---------------------------------------------------------------------------
// 4. Agua Potable
// ---------------------------------------------------------------------------

function addAguaSheet(wb: XLSX.WorkBook, data: AguaPotableResult): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 8;
  let r = 0;

  writeTitle(ws, r++, "AGUA POTABLE Y SANEAMIENTO BASICO", detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeKV(ws, r++, "Municipio:", data.municipio, detailCols);
  writeText(ws, r, 0, "Codigo DANE:", labelStyle);
  writeText(ws, r, 1, data.codigoDane, { ...codeStyle, font: { ...codeStyle.font, sz: 10 } });
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;

  writeText(ws, r, 0, "Estado:", labelStyle);
  writeText(ws, r, 1, data.status.toUpperCase(), statusStyle(data.status.toUpperCase()));
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;

  writeKV(ws, r++, "Distribucion SICODIS:", data.distribucionSICODIS, detailCols);
  writeKVNullableNumber(ws, r++, "Presupuesto Definitivo:", data.presupuestoDefinitivo, detailCols);
  writeKV(
    ws,
    r++,
    "Nota presupuesto:",
    data.hasProgramacionData
      ? "Presupuesto calculado desde el archivo CHIP PROG_ING cargado."
      : "Presupuesto N/D: la API PROG_INGRESOS no se usa como fuente monetaria; cargue el archivo CHIP PROG_ING.",
    detailCols
  );
  writeEmptyRow(ws, r++, detailCols);

  // Sub-validaciones table
  writeSectionRow(ws, r++, "SUB-VALIDACIONES", detailCols);
  writeHeaderRow(ws, r++, [
    "Nombre",
    "Valor 1 Label",
    "Valor 1",
    "Valor 2 Label",
    "Valor 2",
    "Porcentaje",
    "Umbral",
    "Estado",
  ]);
  const freezeRow = r;

  for (let i = 0; i < data.subValidaciones.length; i++) {
    const s = data.subValidaciones[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const ps = isAlt ? altRowPctStyle : pctStyle;
    const ds = isAlt ? altRowStyle : dataStyle;

    writeText(ws, r, 0, s.nombre, ds);
    writeText(ws, r, 1, s.valor1Label, ds);
    writeNullableNumCell(ws, r, 2, s.valor1, ns, ds);
    writeText(ws, r, 3, s.valor2Label, ds);
    writeNullableNumCell(ws, r, 4, s.valor2, ns, ds);
    writeCell(ws, r, 5, s.porcentaje !== null ? s.porcentaje / 100 : "", s.porcentaje !== null ? ps : ds);
    writeCell(ws, r, 6, s.umbral ?? "", s.umbral !== null ? ps : ds);
    writeText(ws, r, 7, s.status.toUpperCase(), statusStyle(s.status.toUpperCase()));
    r++;
  }

  // Subsidios detail
  writeEmptyRow(ws, r++, detailCols);
  writeSectionRow(ws, r++, "DETALLE SUBSIDIOS", detailCols);
  writeKV(ws, r++, "Acueducto:", data.subsidiosDetalle.acueducto, detailCols);
  writeKV(ws, r++, "Alcantarillado:", data.subsidiosDetalle.alcantarillado, detailCols);
  writeKV(ws, r++, "Aseo:", data.subsidiosDetalle.aseo, detailCols);

  // Total row with totalStyle
  writeText(ws, r, 0, "Total Subsidios:", totalStyle);
  writeNum(ws, r, 1, data.subsidiosDetalle.totalSubsidios, totalNumStyle);
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", totalStyle);
  r++;

  writeKV(ws, r++, "Contribuciones Solidaridad:", data.subsidiosDetalle.contribucionesSolidaridad, detailCols);

  // Balance total row
  writeText(ws, r, 0, "Balance:", totalStyle);
  writeNum(ws, r, 1, data.subsidiosDetalle.balance, totalNumStyle);
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", totalStyle);
  r++;

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 25 }, { wch: 20 }, { wch: 16 }, { wch: 20 },
    { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
  ];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "4. Agua Potable");
}

// ---------------------------------------------------------------------------
// 5. SGP
// ---------------------------------------------------------------------------

function addSGPSheet(wb: XLSX.WorkBook, data: SGPEvaluationResult): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 9;
  let r = 0;

  writeTitle(ws, r++, "SISTEMA GENERAL DE PARTICIPACIONES (SGP)", detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeText(ws, r, 0, "Estado:", labelStyle);
  writeText(ws, r, 1, data.status.toUpperCase(), statusStyle(data.status.toUpperCase()));
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;

  writeKV(ws, r++, "Total Distribuido (DNP):", data.totalDistribuido, detailCols);
  writeKVNullableNumber(ws, r++, "Total Presupuestado:", data.totalPresupuestado, detailCols);
  writeKV(ws, r++, "Total Recaudado:", data.totalRecaudado, detailCols);
  writeKV(ws, r++, "Total Ejecutado:", data.totalEjecutado, detailCols);
  writeKVPct(ws, r++, "% Ejecucion Global:", data.pctEjecucionGlobal / 100, detailCols);
  writeKV(
    ws,
    r++,
    "Nota presupuesto:",
    data.hasProgramacionData
      ? "Presupuesto calculado desde el archivo CHIP PROG_ING cargado."
      : "Presupuesto N/D: la API PROG_INGRESOS no se usa como fuente monetaria; cargue el archivo CHIP PROG_ING.",
    detailCols
  );
  writeEmptyRow(ws, r++, detailCols);

  // Componentes table
  writeSectionRow(ws, r++, "COMPONENTES", detailCols);
  writeHeaderRow(ws, r++, [
    "Concepto",
    "Distribucion DNP",
    "Presupuestado",
    "Recaudado",
    "Ejecutado",
    "% Presupuesto",
    "% Recaudo",
    "% Ejecucion",
    "Estado",
  ]);
  const freezeRow = r;

  for (let i = 0; i < data.componentes.length; i++) {
    const c = data.componentes[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const ps = isAlt ? altRowPctStyle : pctStyle;
    const ds = isAlt ? altRowStyle : dataStyle;

    writeText(ws, r, 0, c.concepto, ds);
    writeNum(ws, r, 1, c.distribucionDNP, ns);
    writeNullableNumCell(ws, r, 2, c.presupuestado, ns, ds);
    writeNum(ws, r, 3, c.recaudado, ns);
    writeNum(ws, r, 4, c.ejecutado, ns);
    writeCell(
      ws,
      r,
      5,
      c.pctPresupuesto !== null ? c.pctPresupuesto / 100 : "",
      c.pctPresupuesto !== null ? ps : ds
    );
    writeNum(ws, r, 6, c.pctRecaudo / 100, ps);
    writeNum(ws, r, 7, c.pctEjecucion / 100, ps);
    writeText(ws, r, 8, c.status.toUpperCase(), statusStyle(c.status.toUpperCase()));
    r++;
  }

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
    { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
  ];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "5. SGP");
}

// ---------------------------------------------------------------------------
// 6. Eficiencia Fiscal
// ---------------------------------------------------------------------------

function addEficienciaSheet(
  wb: XLSX.WorkBook,
  data: EficienciaFiscalResult,
): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 9;
  let r = 0;

  writeTitle(ws, r++, "EFICIENCIA FISCAL \u2014 REFRENDACION CGN", detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeText(ws, r, 0, "Estado:", labelStyle);
  writeText(ws, r, 1, data.status.toUpperCase(), statusStyle(data.status.toUpperCase()));
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;

  writeText(ws, r, 0, "CGN Disponible:", labelStyle);
  writeText(ws, r, 1, data.hasCGNData ? "Si" : "No", statusStyle(data.hasCGNData ? "SI" : "NO"));
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;

  writeKV(ws, r++, "Total CUIPO:", data.totalCuipo, detailCols);
  writeKV(ws, r++, "Total CGN:", data.totalCGN ?? "", detailCols);
  writeKV(ws, r++, "Diferencia Total:", data.totalDifference ?? "", detailCols);
  writeKV(ws, r++, "Impuestos Refrendados:", data.refrendaCount, detailCols);
  writeKV(ws, r++, "Impuestos No Refrendados:", data.noRefrendaCount, detailCols);
  writeEmptyRow(ws, r++, detailCols);

  // Detail table
  writeSectionRow(ws, r++, "DETALLE POR IMPUESTO", detailCols);
  writeHeaderRow(ws, r++, [
    "Impuesto",
    "Cuenta CUIPO",
    "Total CUIPO",
    "Total CGN",
    "Formula CGN",
    "Diferencia",
    "Variance %",
    "Valor Refrendado",
    "Refrenda",
  ]);
  const freezeRow = r;

  for (let i = 0; i < data.tributos.length; i++) {
    const t = data.tributos[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const cs = isAlt ? altRowCodeStyle : codeStyle;
    const ds = isAlt ? altRowStyle : dataStyle;
    const ps = isAlt ? altRowPctStyle : pctStyle;

    writeText(ws, r, 0, t.name, ds);
    writeText(ws, r, 1, t.cuipoAccount, cs);
    writeNum(ws, r, 2, t.cuipoTotal, ns);
    writeCell(ws, r, 3, t.cgnTotal ?? "", ns);
    writeText(ws, r, 4, t.cgnFormula ?? "", ds);
    writeCell(ws, r, 5, t.difference ?? "", ns);
    writeCell(ws, r, 6, t.variancePct !== null ? t.variancePct / 100 : "", t.variancePct !== null ? ps : ds);
    writeCell(ws, r, 7, t.valorRefrendado ?? "", ns);
    const refrendaText =
      t.refrenda === null ? "N/D" : t.refrenda ? "SI" : "NO";
    writeText(ws, r, 8, refrendaText, statusStyle(refrendaText));
    r++;
  }

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 25 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
    { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 12 },
  ];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "6. Eficiencia Fiscal");
}

// ---------------------------------------------------------------------------
// 7. IDF
// ---------------------------------------------------------------------------

function addIDFSheet(wb: XLSX.WorkBook, data: IDFResult): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 4;
  let r = 0;

  writeTitle(ws, r++, "INDICE DE DESEMPENO FISCAL (IDF)", detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeText(ws, r, 0, "Estado:", labelStyle);
  writeText(ws, r, 1, data.status.toUpperCase(), statusStyle(data.status.toUpperCase()));
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;

  writeKV(ws, r++, "IDF Total:", data.idfTotal, detailCols);
  writeKV(ws, r++, "Ranking:", data.ranking, detailCols);
  writeKV(ws, r++, "Score Resultados Fiscales (80%):", data.scoreResultados, detailCols);
  writeKV(ws, r++, "Score Gestion Financiera (20%):", data.scoreGestion, detailCols);
  writeKV(
    ws,
    r++,
    "Nota programacion:",
    "La capacidad de programacion de ingresos solo usa el archivo CHIP PROG_ING; la API PROG_INGRESOS no se usa como fuente monetaria.",
    detailCols
  );
  writeEmptyRow(ws, r++, detailCols);

  // Resultados Fiscales
  writeSectionRow(ws, r++, "RESULTADOS FISCALES", detailCols);
  writeHeaderRow(ws, r++, ["Indicador", "Valor (%)", "Score", "Interpretacion"]);
  const freezeRow = r;

  for (let i = 0; i < data.resultadosFiscales.length; i++) {
    const ind = data.resultadosFiscales[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const ds = isAlt ? altRowStyle : dataStyle;

    writeText(ws, r, 0, ind.name, ds);
    writeNum(ws, r, 1, ind.value, { ...ns, numFmt: "0.00" });
    writeCell(ws, r, 2, ind.score ?? "N/D", ind.score !== null ? ns : ds);
    writeText(ws, r, 3, ind.interpretation, ds);
    r++;
  }

  writeEmptyRow(ws, r++, detailCols);

  // Gestion Financiera
  writeSectionRow(ws, r++, "GESTION FINANCIERA", detailCols);
  writeHeaderRow(ws, r++, ["Indicador", "Valor (%)", "Score", "Interpretacion"]);

  for (let i = 0; i < data.gestionFinanciera.length; i++) {
    const ind = data.gestionFinanciera[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const ds = isAlt ? altRowStyle : dataStyle;

    writeText(ws, r, 0, ind.name, ds);
    writeNum(ws, r, 1, ind.value, { ...ns, numFmt: "0.00" });
    writeCell(ws, r, 2, ind.score ?? "N/D", ind.score !== null ? ns : ds);
    writeText(ws, r, 3, ind.interpretation, ds);
    r++;
  }

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [{ wch: 35 }, { wch: 14 }, { wch: 12 }, { wch: 40 }];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "7. IDF");
}

// ---------------------------------------------------------------------------
// 8. Mapa de Inversiones
// ---------------------------------------------------------------------------

function addMapaSheet(wb: XLSX.WorkBook, data: MapaInversionesResult): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 7;
  let r = 0;

  writeTitle(ws, r++, "MAPA DE INVERSIONES \u2014 CRUCE CUIPO vs PDM", detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeText(ws, r, 0, "Estado:", labelStyle);
  writeText(ws, r, 1, data.status.toUpperCase(), statusStyle(data.status.toUpperCase()));
  for (let c = 2; c < detailCols; c++) writeText(ws, r, c, "", dataStyle);
  r++;

  writeKV(ws, r++, "Total BEPINes CUIPO:", data.totalBepinesCuipo, detailCols);
  writeKV(ws, r++, "BEPINes Con Cruce:", data.bepinesConCruce, detailCols);
  writeKV(ws, r++, "BEPINes Sin Cruce:", data.bepinesSinCruce, detailCols);
  writeKV(ws, r++, "Valor Ejecutado Total:", data.valorEjecutadoTotal, detailCols);
  writeKV(ws, r++, "Valor Con Cruce:", data.valorConCruce, detailCols);
  writeKV(ws, r++, "Valor Sin Cruce:", data.valorSinCruce, detailCols);
  writeKVPct(ws, r++, "% Cruce BEPIN:", data.pctCruceBepin / 100, detailCols);
  writeKVPct(ws, r++, "% Cruce Valor:", data.pctCruceValor / 100, detailCols);
  writeEmptyRow(ws, r++, detailCols);

  // Detail table
  writeSectionRow(ws, r++, "DETALLE POR BEPIN", detailCols);
  writeHeaderRow(ws, r++, [
    "BEPIN",
    "Producto MGA",
    "Nombre Producto",
    "Valor CUIPO",
    "Existe en Mapa",
    "Valor Mapa",
    "Estado",
  ]);
  const freezeRow = r;

  for (let i = 0; i < data.cruces.length; i++) {
    const c = data.cruces[i];
    const isAlt = i % 2 === 1;
    const ns = isAlt ? altRowNumStyle : numStyle;
    const cs = isAlt ? altRowCodeStyle : codeStyle;
    const ds = isAlt ? altRowStyle : dataStyle;

    writeText(ws, r, 0, c.bepin, cs);
    writeText(ws, r, 1, c.productoMGA, cs);
    writeText(ws, r, 2, c.nombreProducto, ds);
    writeNum(ws, r, 3, c.valorCuipo, ns);
    writeText(
      ws,
      r,
      4,
      c.existeEnMapa ? "Si" : "No",
      statusStyle(c.existeEnMapa ? "SI" : "NO"),
    );
    writeNum(ws, r, 5, c.valorMapa, ns);
    writeText(ws, r, 6, c.status.toUpperCase(), statusStyle(c.status.toUpperCase()));
    r++;
  }

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 20 }, { wch: 18 }, { wch: 35 }, { wch: 16 },
    { wch: 14 }, { wch: 16 }, { wch: 14 },
  ];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "8. Mapa Inversiones");
}

// ---------------------------------------------------------------------------
// Trazabilidad
// ---------------------------------------------------------------------------

function addTrazabilidadSheet(wb: XLSX.WorkBook, data: ExportData): void {
  const ws: XLSX.WorkSheet = {};
  const run = data.validationRun ?? null;
  const cols = 5;
  let r = 0;

  writeTitle(ws, r++, "TRAZABILIDAD DE FUENTES DE DATOS", cols);
  writeEmptyRow(ws, r++, cols);

  writeKV(ws, r++, "Municipio:", data.municipio.name, cols);
  writeText(ws, r, 0, "Codigo DANE:", labelStyle);
  writeText(ws, r, 1, data.municipio.code, { ...codeStyle, font: { ...codeStyle.font, sz: 10 } });
  for (let c = 2; c < cols; c++) writeText(ws, r, c, "", dataStyle);
  r++;
  writeText(ws, r, 0, "Codigo CHIP:", labelStyle);
  writeText(ws, r, 1, data.municipio.chipCode, { ...codeStyle, font: { ...codeStyle.font, sz: 10 } });
  for (let c = 2; c < cols; c++) writeText(ws, r, c, "", dataStyle);
  r++;
  writeKV(ws, r++, "Periodo:", `${run?.coverage.periodLabel ?? tracePeriodLabel(data.periodo)} (${data.periodo})`, cols);
  if (run) {
    writeKV(ws, r++, "Modo de corrida:", traceRunModeLabel(run.runMode), cols);
  }
  writeKV(ws, r++, "Fecha de exportacion:", new Date().toISOString().split("T")[0], cols);
  writeKV(ws, r++, "Hora de exportacion (UTC):", new Date().toISOString(), cols);
  writeEmptyRow(ws, r++, cols);

  // Data sources table
  writeSectionRow(ws, r++, "FUENTES, COMPATIBILIDAD Y EXCLUSIONES", cols);
  writeHeaderRow(ws, r++, ["INSUMO", "ESTADO", "ORIGEN", "PERIODO", "DETALLE / RAZON"]);
  const freezeRow = r;

  const dane = data.municipio.code;
  const chip = data.municipio.chipCode;
  const periodo = data.periodo;

  const sources: [string, string, string, string, string][] = run
    ? run.inputSources.map((input) => [
        input.label,
        traceInputStatusLabel(input.status),
        traceSourceLabel(input.source),
        input.actualPeriod || input.period || input.expectedPeriod || run.coverage.periodLabel,
        traceInputDetail(input),
      ])
    : [
        [
          "CUIPO Ejecucion Ingresos",
          "USADO",
          "API publica",
          tracePeriodLabel(periodo),
          `datos.gov.co - 9axr-9gnb | WHERE c_digo_entidad='${chip}' AND vigencia='${periodo}'`,
        ],
        [
          "CUIPO Ejecucion Gastos",
          "USADO",
          "API publica",
          tracePeriodLabel(periodo),
          `datos.gov.co - 4f7r-epif | WHERE c_digo_entidad='${chip}' AND vigencia='${periodo}'`,
        ],
        [
          "CUIPO Programacion Ingresos",
          "USADO",
          "API publica",
          tracePeriodLabel(periodo),
          `datos.gov.co - 22ah-ddsj | WHERE c_digo_entidad='${chip}' AND vigencia='${periodo}'`,
        ],
        [
          "CUIPO Programacion Gastos",
          "USADO",
          "API publica",
          tracePeriodLabel(periodo),
          `datos.gov.co - d9mu-h6ar | WHERE c_digo_entidad='${chip}' AND vigencia='${periodo}'`,
        ],
        [
          "SICODIS SGP",
          "USADO",
          "API publica",
          tracePeriodLabel(periodo),
          `DNP API | codigo_dane='${dane}' periodo='${periodo}'`,
        ],
        [
          "FUT Cierre Fiscal",
          "FALTANTE",
          "Archivo cargado",
          tracePeriodLabel(periodo),
          `CHIP upload | entidad='${chip}' vigencia='${periodo}'`,
        ],
        [
          "CGN Saldos",
          "FALTANTE",
          "Archivo cargado",
          tracePeriodLabel(periodo),
          `CHIP upload | entidad='${chip}' vigencia='${periodo}'`,
        ],
      ];

  for (let i = 0; i < sources.length; i++) {
    const [fuente, estado, origen, periodoFuente, detalle] = sources[i];
    const isAlt = i % 2 === 1;
    const ds = isAlt ? altRowStyle : dataStyle;

    writeText(ws, r, 0, fuente, { ...ds, font: { ...ds.font, bold: true } });
    writeText(ws, r, 1, estado, statusStyle(estado));
    writeText(ws, r, 2, origen, ds);
    writeText(ws, r, 3, periodoFuente, ds);
    writeText(ws, r, 4, detalle, ds);
    r++;
  }

  writeEmptyRow(ws, r++, cols);

  if (run?.warnings.length) {
    writeSectionRow(ws, r++, "ADVERTENCIAS Y COBERTURA", cols);
    writeHeaderRow(ws, r++, ["ADVERTENCIA", "SEVERIDAD", "REFERENCIA", "PERIODO", "DETALLE"]);
    for (let i = 0; i < run.warnings.length; i++) {
      const item = run.warnings[i];
      const ds = i % 2 === 1 ? altRowStyle : dataStyle;
      writeText(ws, r, 0, item.title, ds);
      writeText(ws, r, 1, item.severity.toUpperCase(), statusStyle(item.severity === "info" ? "PENDIENTE" : "ALERTA"));
      writeText(ws, r, 2, item.inputKey || item.moduleId || "corrida", ds);
      writeText(ws, r, 3, run.coverage.periodLabel, ds);
      writeText(ws, r, 4, item.detail, ds);
      r++;
    }
    writeEmptyRow(ws, r++, cols);
  }

  // Leaf-row detection note
  writeSectionRow(ws, r++, "NOTAS DE PROCESAMIENTO", cols);
  const noteStyle = {
    font: { sz: 9, name: "Calibri", italic: true, color: { rgb: SEPIA } },
    border: thinBorder,
    alignment: { horizontal: "left" as const, wrapText: true },
  };
  const processingNotes = [
    "Solo filas con fuente asignada (leaf rows). Filas de agregacion excluidas.",
    `Periodo de datos: ${run?.coverage.periodLabel ?? tracePeriodLabel(periodo)}.`,
    run ? run.coverage.dataSourcesSummary : "",
    "Precision numerica: todos los valores con 2 decimales (#,##0.00) para auditabilidad.",
    "Los campos derivados (Reservas, CxP, Superavit, Saldo en Libros) se recalculan y verifican en la hoja Equilibrio.",
  ].filter(Boolean);
  for (const note of processingNotes) {
    writeText(ws, r, 0, note, noteStyle);
    writeText(ws, r, 1, "", dataStyle);
    writeText(ws, r, 2, "", dataStyle);
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: cols - 1 } });
    r++;
  }

  writeEmptyRow(ws, r++, cols);

  // Formula reference section
  writeSectionRow(ws, r++, "FORMULAS UTILIZADAS", cols);
  const formulaRefStyle = {
    font: { sz: 8, name: "Consolas", color: { rgb: INK } },
    border: thinBorder,
    alignment: { horizontal: "left" as const, wrapText: true },
  };
  const allFormulas = [
    "Reservas = MAX(0, Compromisos - Obligaciones)",
    "CxP = MAX(0, Obligaciones - Pagos)",
    "Superavit = Recaudo - Compromisos",
    "Saldo en Libros = Superavit + Reservas + CxP + Res.Vig.Ant + CxP.Vig.Ant",
    "ICLD Bruto = \u03A3 recaudo (fuente ICLD/SGP-LD, sin RF/RB, solo leaf rows)",
    "ICLD Validado = \u03A3 recaudo (ICLD Bruto \u2229 cuenta \u2208 55 cuentas validas CGR)",
    "GF Neto = \u03A3 compromisos 2.1 (fuente ICLD/SGP-LD, vig 1+4) - Gastos Deducidos",
    "Ratio SI.17 = GF Neto / ICLD Neto",
    "CGN Total = CxC_saldo_final_I + Income_IV - Adj_IV - CxC_saldo_final_IV",
    "% Ejecucion = (Compromisos / Ppto Definitivo Gastos) * 100",
    "Equilibrio Inicial = Ppto Inicial Ingresos - Ppto Inicial Gastos",
    "Equilibrio Definitivo = Ppto Definitivo Ingresos - Ppto Definitivo Gastos",
  ];
  for (const formula of allFormulas) {
    writeText(ws, r, 0, formula, formulaRefStyle);
    writeText(ws, r, 1, "", dataStyle);
    writeText(ws, r, 2, "", dataStyle);
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: cols - 1 } });
    r++;
  }

  writeEmptyRow(ws, r++, cols);

  // Supuestos y Limitaciones section
  writeSectionRow(ws, r++, "SUPUESTOS Y LIMITACIONES", cols);
  const supuestosStyle = {
    font: { sz: 9, name: "Calibri", color: { rgb: INK } },
    border: thinBorder,
    alignment: { horizontal: "left" as const, wrapText: true },
  };
  const supuestos = [
    run
      ? `1. Periodo: La corrida usa ${run.coverage.periodLabel}. Las fuentes incompatibles se listan como excluidas y no entran al calculo.`
      : "1. Periodo: Los datos corresponden al periodo reportado en datos.gov.co. Para datos de cierre anual (T4/Dic), cargar archivos CUIPO directamente desde CHIP.",
    "2. Presupuesto de Ingresos: El dataset PROG_INGRESOS de datos.gov.co tiene schema no estandar. Los valores de presupuesto inicial y definitivo de ingresos solo estan disponibles cuando se cargan archivos CUIPO CHIP.",
    "3. Deduccion de fondos: Se usa la deduccion REPORTADA por el municipio (fuente 1.2.3.4.02). Si no se reporta, se calcula automaticamente como 3% del ICLD. La diferencia entre reportada y calculada es un hallazgo para el municipio.",
    "4. Leaf rows: Solo se suman filas con fuente de financiacion asignada (leaf rows). Las filas de agregacion (parent rows) se excluyen para evitar doble conteo.",
    "5. CGA y Eficiencia Fiscal: Requieren carga de archivos FUT Cierre y CGN Saldos respectivamente. Sin estos archivos, los modulos aparecen como PENDIENTE.",
    "6. IDF Endeudamiento y Programacion: Indicadores que requieren datos no disponibles via API se excluyen del promedio (score = N/D), no afectando el calculo total.",
  ];
  for (const supuesto of supuestos) {
    writeText(ws, r, 0, supuesto, supuestosStyle);
    writeText(ws, r, 1, "", dataStyle);
    writeText(ws, r, 2, "", dataStyle);
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: cols - 1 } });
    r++;
  }

  setRange(ws, r - 1, cols - 1);
  ws["!cols"] = [{ wch: 34 }, { wch: 18 }, { wch: 20 }, { wch: 24 }, { wch: 70 }];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "Trazabilidad");
}
