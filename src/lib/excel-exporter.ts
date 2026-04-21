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
  numFmt: "#,##0",
  alignment: { horizontal: "right" as const },
};

/** Total row with percentage format */
const totalPctStyle = {
  ...totalStyle,
  numFmt: "0.00%",
  alignment: { horizontal: "right" as const },
};

/** Regular number cells — thin border, #,##0 format */
const numStyle = {
  numFmt: "#,##0",
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
  numFmt: "#,##0",
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
  numFmt: "#,##0",
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
  if (["CUMPLE", "SI", "OK", "CORRECTO"].includes(s)) {
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
  if (["PARCIAL", "ALERTA", "PENDIENTE"].includes(s)) {
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

/** Write a key-value pair where the value is a percentage */
function writeKVPct(
  ws: XLSX.WorkSheet,
  row: number,
  label: string,
  value: number,
  colSpan: number = 2,
): void {
  writeText(ws, row, 0, label, labelStyle);
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
  writeKV(ws, r++, "Periodo:", data.periodo, cols);
  writeKV(ws, r++, "Fecha de exportacion:", new Date().toISOString().split("T")[0], cols);
  writeEmptyRow(ws, r++, cols);

  // Module summary table header
  writeHeaderRow(ws, r++, ["MODULO", "ESTADO", "OBSERVACION"]);

  // Module rows
  const modules: [string, string, string][] = [];

  if (data.equilibrio) {
    const diff = Math.abs(
      data.equilibrio.totalIngresos - (data.equilibrio.totalCompromisos || 0),
    );
    modules.push([
      "Equilibrio Presupuestal",
      diff < 1_000_000 ? "CUMPLE" : "NO CUMPLE",
      `Diferencia: $${diff.toLocaleString("es-CO")}`,
    ]);
  }
  if (data.cierreVsCuipo) {
    modules.push([
      "Cierre FUT vs CUIPO",
      data.cierreVsCuipo.status.toUpperCase(),
      `${data.cierreVsCuipo.cruces.length} cruces`,
    ]);
  }
  if (data.ley617) {
    modules.push([
      "Ley 617 / SI.17",
      data.ley617.status.toUpperCase(),
      `Ratio: ${(data.ley617.ratioGlobal * 100).toFixed(2)}% / Limite: ${(data.ley617.limiteGlobal * 100).toFixed(0)}%`,
    ]);
  }
  if (data.cga) {
    modules.push([
      "Equilibrio CGA",
      data.cga.status.toUpperCase(),
      `${data.cga.checks.length} chequeos`,
    ]);
  }
  if (data.agua) {
    modules.push([
      "Agua Potable",
      data.agua.status.toUpperCase(),
      `${data.agua.subValidaciones.length} sub-validaciones`,
    ]);
  }
  if (data.sgp) {
    modules.push([
      "SGP",
      data.sgp.status.toUpperCase(),
      `${data.sgp.componentes.length} componentes`,
    ]);
  }
  if (data.eficiencia) {
    modules.push([
      "Eficiencia Fiscal",
      data.eficiencia.status.toUpperCase(),
      `${data.eficiencia.refrendaCount || 0} impuestos refrendados`,
    ]);
  }
  if (data.idf) {
    modules.push([
      "Desempeno Fiscal IDF",
      data.idf.status.toUpperCase(),
      `Score: ${data.idf.idfTotal.toFixed(1)} (${data.idf.ranking})`,
    ]);
  }
  if (data.mapaInversiones) {
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
  const detailCols = 11;
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
  writeKVPct(ws, r++, "% Ejecucion:", data.pctEjecucion, detailCols);
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
    r++;
  }

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
  writeKV(ws, r++, "ICLD Validado:", data.icldValidado, detailCols);
  writeKV(ws, r++, "Deduccion Fondos (usada):", data.deduccionFondos, detailCols);
  if (data.deduccionReportada !== undefined) {
    writeKV(ws, r++, "  Deduccion Reportada (datos CUIPO):", data.deduccionReportada, detailCols);
  }
  if (data.deduccionCalculada !== undefined) {
    writeKV(ws, r++, "  Deduccion Calculada (3%):", data.deduccionCalculada, detailCols);
  }
  writeKV(ws, r++, "ICLD Neto:", data.icldNeto, detailCols);
  writeKV(ws, r++, "Acciones de Mejora:", data.accionesMejora, detailCols);
  writeEmptyRow(ws, r++, detailCols);

  writeKV(ws, r++, "Gastos Funcionamiento Total:", data.gastosFuncionamientoTotal, detailCols);
  writeKV(ws, r++, "Gastos Deducidos:", data.gastosDeducidos, detailCols);
  writeKV(ws, r++, "Gastos Funcionamiento Neto:", data.gastosFuncionamientoNeto, detailCols);
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

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 12 },
    { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
  ];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "2. Ley 617");
}

// ---------------------------------------------------------------------------
// 3. CGA
// ---------------------------------------------------------------------------

function addCGASheet(wb: XLSX.WorkBook, data: CGAResult): void {
  const ws: XLSX.WorkSheet = {};
  const detailCols = 9;
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
  ]);
  const freezeRow = r;

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
    r++;
  }

  setRange(ws, r - 1, detailCols - 1);
  ws["!cols"] = [
    { wch: 30 }, { wch: 18 }, { wch: 20 }, { wch: 16 },
    { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
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
  writeKV(ws, r++, "Presupuesto Definitivo:", data.presupuestoDefinitivo, detailCols);
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
    writeNum(ws, r, 2, s.valor1, ns);
    writeText(ws, r, 3, s.valor2Label, ds);
    writeNum(ws, r, 4, s.valor2, ns);
    writeCell(ws, r, 5, s.porcentaje ?? "", s.porcentaje !== null ? ps : ds);
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
  writeKV(ws, r++, "Total Presupuestado:", data.totalPresupuestado, detailCols);
  writeKV(ws, r++, "Total Recaudado:", data.totalRecaudado, detailCols);
  writeKV(ws, r++, "Total Ejecutado:", data.totalEjecutado, detailCols);
  writeKVPct(ws, r++, "% Ejecucion Global:", data.pctEjecucionGlobal, detailCols);
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
    writeNum(ws, r, 2, c.presupuestado, ns);
    writeNum(ws, r, 3, c.recaudado, ns);
    writeNum(ws, r, 4, c.ejecutado, ns);
    writeNum(ws, r, 5, c.pctPresupuesto, ps);
    writeNum(ws, r, 6, c.pctRecaudo, ps);
    writeNum(ws, r, 7, c.pctEjecucion, ps);
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
    writeCell(ws, r, 6, t.variancePct ?? "", t.variancePct !== null ? ps : ds);
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
  const cols = 3;
  let r = 0;

  writeTitle(ws, r++, "TRAZABILIDAD DE FUENTES DE DATOS", cols);
  writeEmptyRow(ws, r++, cols);

  writeKV(ws, r++, "Municipio:", data.municipio.name, cols);
  writeText(ws, r, 0, "Codigo DANE:", labelStyle);
  writeText(ws, r, 1, data.municipio.code, { ...codeStyle, font: { ...codeStyle.font, sz: 10 } });
  writeText(ws, r++, 2, "", dataStyle);
  writeText(ws, r, 0, "Codigo CHIP:", labelStyle);
  writeText(ws, r, 1, data.municipio.chipCode, { ...codeStyle, font: { ...codeStyle.font, sz: 10 } });
  writeText(ws, r++, 2, "", dataStyle);
  writeKV(ws, r++, "Periodo:", data.periodo, cols);
  writeKV(ws, r++, "Fecha de exportacion:", new Date().toISOString().split("T")[0], cols);
  writeEmptyRow(ws, r++, cols);

  writeHeaderRow(ws, r++, ["FUENTE", "DESCRIPCION", "URL"]);
  const freezeRow = r;

  const sources: [string, string, string][] = [
    [
      "CUIPO Ejecucion Ingresos",
      "datos.gov.co - 9axr-9gnb",
      "https://www.datos.gov.co/resource/9axr-9gnb.json",
    ],
    [
      "CUIPO Ejecucion Gastos",
      "datos.gov.co - 4f7r-epif",
      "https://www.datos.gov.co/resource/4f7r-epif.json",
    ],
    [
      "CUIPO Programacion Gastos",
      "datos.gov.co - d9mu-h6ar",
      "https://www.datos.gov.co/resource/d9mu-h6ar.json",
    ],
    ["SICODIS SGP", "DNP API", "https://sicodis.dnp.gov.co"],
    ["FUT Cierre Fiscal", "CHIP upload", "https://chip.gov.co"],
    ["CGN Saldos", "CHIP upload", "https://chip.gov.co"],
  ];

  for (let i = 0; i < sources.length; i++) {
    const [fuente, desc, url] = sources[i];
    const isAlt = i % 2 === 1;
    const ds = isAlt ? altRowStyle : dataStyle;

    writeText(ws, r, 0, fuente, { ...ds, font: { ...ds.font, bold: true } });
    writeText(ws, r, 1, desc, ds);
    writeText(ws, r, 2, url, {
      ...ds,
      font: { ...ds.font, color: { rgb: SEPIA } },
    });
    r++;
  }

  setRange(ws, r - 1, cols - 1);
  ws["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 55 }];
  freezeRows(ws, freezeRow);
  XLSX.utils.book_append_sheet(wb, ws, "Trazabilidad");
}
