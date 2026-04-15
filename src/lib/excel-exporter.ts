/**
 * Excel Exporter — Generates an .xlsx workbook with all validation results
 *
 * Produces one sheet per validation module plus a summary (Resumen) and
 * a Trazabilidad sheet listing data sources.
 *
 * Note: the `xlsx` library does not support styling/colors without a paid
 * extension, so this exporter writes raw typed cells only.
 */

import * as XLSX from "xlsx";

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
  const rows: unknown[][] = [
    ["VALIDADOR FISCAL MUNICIPAL — RESUMEN EJECUTIVO"],
    [],
    ["Municipio:", data.municipio.name],
    ["Codigo DANE:", data.municipio.code],
    ["Codigo CHIP:", data.municipio.chipCode],
    ["Periodo:", data.periodo],
    ["Fecha de exportacion:", new Date().toISOString().split("T")[0]],
    [],
    ["MODULO", "ESTADO", "OBSERVACION"],
  ];

  if (data.equilibrio) {
    const diff = Math.abs(
      data.equilibrio.totalIngresos - (data.equilibrio.totalCompromisos || 0),
    );
    rows.push([
      "Equilibrio Presupuestal",
      diff < 1_000_000 ? "CUMPLE" : "NO CUMPLE",
      `Diferencia: $${diff.toLocaleString("es-CO")}`,
    ]);
  }
  if (data.cierreVsCuipo) {
    rows.push([
      "Cierre FUT vs CUIPO",
      data.cierreVsCuipo.status.toUpperCase(),
      `${data.cierreVsCuipo.cruces.length} cruces`,
    ]);
  }
  if (data.ley617) {
    rows.push([
      "Ley 617 / SI.17",
      data.ley617.status.toUpperCase(),
      `Ratio: ${(data.ley617.ratioGlobal * 100).toFixed(2)}% / Límite: ${(data.ley617.limiteGlobal * 100).toFixed(0)}%`,
    ]);
  }
  if (data.cga) {
    rows.push([
      "Equilibrio CGA",
      data.cga.status.toUpperCase(),
      `${data.cga.checks.length} chequeos`,
    ]);
  }
  if (data.agua) {
    rows.push([
      "Agua Potable",
      data.agua.status.toUpperCase(),
      `${data.agua.subValidaciones.length} sub-validaciones`,
    ]);
  }
  if (data.sgp) {
    rows.push([
      "SGP",
      data.sgp.status.toUpperCase(),
      `${data.sgp.componentes.length} componentes`,
    ]);
  }
  if (data.eficiencia) {
    rows.push([
      "Eficiencia Fiscal",
      data.eficiencia.status.toUpperCase(),
      `${data.eficiencia.refrendaCount || 0} impuestos refrendados`,
    ]);
  }
  if (data.idf) {
    rows.push([
      "Desempeño Fiscal IDF",
      data.idf.status.toUpperCase(),
      `Score: ${data.idf.idfTotal.toFixed(1)} (${data.idf.ranking})`,
    ]);
  }
  if (data.mapaInversiones) {
    rows.push([
      "Mapa de Inversiones",
      data.mapaInversiones.status.toUpperCase(),
      `${data.mapaInversiones.pctCruceBepin.toFixed(1)}% BEPIN cruzan`,
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Resumen");
}

// ---------------------------------------------------------------------------
// 0. Equilibrio
// ---------------------------------------------------------------------------

function addEquilibrioSheet(wb: XLSX.WorkBook, data: EquilibrioData): void {
  const rows: unknown[][] = [
    ["EQUILIBRIO PRESUPUESTAL POR FUENTE DE FINANCIACION"],
    [],
    ["Total Ingresos:", data.totalIngresos],
    ["Total Compromisos:", data.totalCompromisos ?? 0],
    ["Total Obligaciones:", data.totalObligaciones ?? 0],
    ["Total Pagos:", data.totalPagos],
    ["Total Reservas:", data.totalReservas ?? 0],
    ["Total CxP:", data.totalCxP ?? 0],
    ["Superavit/Deficit:", data.superavit],
    ["Saldo en Libros:", data.saldoEnLibros ?? 0],
    ["% Ejecucion:", data.pctEjecucion],
    [],
    ["Ppto Inicial Ingresos:", data.pptoInicialIngresos ?? 0],
    ["Ppto Inicial Gastos:", data.pptoInicialGastos ?? 0],
    ["Ppto Definitivo Ingresos:", data.pptoDefinitivoIngresos ?? 0],
    ["Ppto Definitivo Gastos:", data.pptoDefinitivoGastos ?? 0],
    [],
    ["DETALLE POR FUENTE"],
    [
      "Codigo",
      "Consolidacion",
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
    ],
  ];

  for (const f of data.porFuente) {
    rows.push([
      f.codigo,
      f.consolidacion ?? "",
      f.nombre,
      f.recaudo,
      f.compromisos,
      f.obligaciones ?? 0,
      f.pagos,
      f.reservas ?? 0,
      f.cxp ?? 0,
      f.superavit,
      f.validador ?? 0,
      f.saldoEnLibros ?? 0,
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "0. Equilibrio");
}

// ---------------------------------------------------------------------------
// 1. Cierre vs CUIPO
// ---------------------------------------------------------------------------

function addCierreSheet(wb: XLSX.WorkBook, data: CierreVsCuipoResult): void {
  const rows: unknown[][] = [
    ["CIERRE FUT vs CUIPO"],
    [],
    ["Estado:", data.status.toUpperCase()],
    ["Diff total Saldo en Libros:", data.totalDiffSaldoLibros],
    ["Diff total Reservas:", data.totalDiffReservas],
    ["Diff total CxP:", data.totalDiffCxP],
    [],
    ["DETALLE POR CODIGO FUT"],
    [
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
    ],
  ];

  for (const c of data.cruces) {
    rows.push([
      c.codigoFUT,
      c.nombre,
      c.nivel,
      c.consolidacion ?? "",
      c.saldoLibrosFUT,
      c.saldoLibrosCUIPO,
      c.diffSaldoLibros,
      c.reservasFUT,
      c.reservasCUIPO,
      c.diffReservas,
      c.cxpFUT,
      c.cxpCUIPO,
      c.diffCxP,
      c.hasData ? "Si" : "No",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "1. Cierre vs CUIPO");
}

// ---------------------------------------------------------------------------
// 2. Ley 617
// ---------------------------------------------------------------------------

function addLey617Sheet(wb: XLSX.WorkBook, data: Ley617Result): void {
  const rows: unknown[][] = [
    ["LEY 617 / SI.17 — LIMITE DE GASTOS DE FUNCIONAMIENTO"],
    [],
    ["Estado:", data.status.toUpperCase()],
    ["Ratio Global:", data.ratioGlobal],
    ["Limite Global:", data.limiteGlobal],
    [],
    ["ICLD Bruto:", data.icldBruto],
    ["ICLD Validado:", data.icldValidado],
    ["Deduccion Fondos (3%):", data.deduccionFondos],
    ["ICLD Neto:", data.icldNeto],
    ["Acciones de Mejora:", data.accionesMejora],
    [],
    ["Gastos Funcionamiento Total:", data.gastosFuncionamientoTotal],
    ["Gastos Deducidos:", data.gastosDeducidos],
    ["Gastos Funcionamiento Neto:", data.gastosFuncionamientoNeto],
    [],
    ["DETALLE POR SECCION"],
    [
      "Seccion",
      "Gastos Funcionamiento",
      "ICLD",
      "Ratio",
      "Limite %",
      "Limite Absoluto",
      "Limite SMLMV",
      "Tipo Limite",
      "Estado",
    ],
  ];

  for (const s of data.secciones) {
    rows.push([
      s.seccion,
      s.gastosFuncionamiento,
      s.icld,
      s.ratio,
      s.limite,
      s.limiteAbsoluto ?? "",
      s.limiteSMLMV ?? "",
      s.tipoLimite,
      s.status.toUpperCase(),
    ]);
  }

  if (data.gastosDeducidosDetalle.length > 0) {
    rows.push([]);
    rows.push(["DETALLE DE GASTOS DEDUCIDOS"]);
    rows.push(["Codigo", "Nombre", "Valor"]);
    for (const g of data.gastosDeducidosDetalle) {
      rows.push([g.codigo, g.nombre, g.valor]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "2. Ley 617");
}

// ---------------------------------------------------------------------------
// 3. CGA
// ---------------------------------------------------------------------------

function addCGASheet(wb: XLSX.WorkBook, data: CGAResult): void {
  const rows: unknown[][] = [
    ["EQUILIBRIO CGA — CONTRALORIA GENERAL DE LA REPUBLICA"],
    [],
    ["Estado:", data.status.toUpperCase()],
    [],
    [
      "Chequeo",
      "Grupo",
      "Valor 1 Label",
      "Valor 1",
      "Valor 2 Label",
      "Valor 2",
      "Diferencia",
      "Tolerancia",
      "Estado",
    ],
  ];

  for (const c of data.checks) {
    rows.push([
      c.name,
      c.group,
      c.value1Label,
      c.value1,
      c.value2Label,
      c.value2,
      c.difference,
      c.tolerance,
      c.status.toUpperCase(),
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "3. CGA");
}

// ---------------------------------------------------------------------------
// 4. Agua Potable
// ---------------------------------------------------------------------------

function addAguaSheet(wb: XLSX.WorkBook, data: AguaPotableResult): void {
  const rows: unknown[][] = [
    ["AGUA POTABLE Y SANEAMIENTO BASICO"],
    [],
    ["Municipio:", data.municipio],
    ["Codigo DANE:", data.codigoDane],
    ["Estado:", data.status.toUpperCase()],
    ["Distribucion SICODIS:", data.distribucionSICODIS],
    ["Presupuesto Definitivo:", data.presupuestoDefinitivo],
    [],
    ["SUB-VALIDACIONES"],
    [
      "Nombre",
      "Valor 1 Label",
      "Valor 1",
      "Valor 2 Label",
      "Valor 2",
      "Porcentaje",
      "Umbral",
      "Estado",
    ],
  ];

  for (const s of data.subValidaciones) {
    rows.push([
      s.nombre,
      s.valor1Label,
      s.valor1,
      s.valor2Label,
      s.valor2,
      s.porcentaje ?? "",
      s.umbral ?? "",
      s.status.toUpperCase(),
    ]);
  }

  rows.push([]);
  rows.push(["DETALLE SUBSIDIOS"]);
  rows.push(["Acueducto:", data.subsidiosDetalle.acueducto]);
  rows.push(["Alcantarillado:", data.subsidiosDetalle.alcantarillado]);
  rows.push(["Aseo:", data.subsidiosDetalle.aseo]);
  rows.push(["Total Subsidios:", data.subsidiosDetalle.totalSubsidios]);
  rows.push([
    "Contribuciones Solidaridad:",
    data.subsidiosDetalle.contribucionesSolidaridad,
  ]);
  rows.push(["Balance:", data.subsidiosDetalle.balance]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "4. Agua Potable");
}

// ---------------------------------------------------------------------------
// 5. SGP
// ---------------------------------------------------------------------------

function addSGPSheet(wb: XLSX.WorkBook, data: SGPEvaluationResult): void {
  const rows: unknown[][] = [
    ["SISTEMA GENERAL DE PARTICIPACIONES (SGP)"],
    [],
    ["Estado:", data.status.toUpperCase()],
    ["Total Distribuido (DNP):", data.totalDistribuido],
    ["Total Presupuestado:", data.totalPresupuestado],
    ["Total Recaudado:", data.totalRecaudado],
    ["Total Ejecutado:", data.totalEjecutado],
    ["% Ejecucion Global:", data.pctEjecucionGlobal],
    [],
    ["COMPONENTES"],
    [
      "Concepto",
      "Distribucion DNP",
      "Presupuestado",
      "Recaudado",
      "Ejecutado",
      "% Presupuesto",
      "% Recaudo",
      "% Ejecucion",
      "Estado",
    ],
  ];

  for (const c of data.componentes) {
    rows.push([
      c.concepto,
      c.distribucionDNP,
      c.presupuestado,
      c.recaudado,
      c.ejecutado,
      c.pctPresupuesto,
      c.pctRecaudo,
      c.pctEjecucion,
      c.status.toUpperCase(),
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "5. SGP");
}

// ---------------------------------------------------------------------------
// 6. Eficiencia Fiscal
// ---------------------------------------------------------------------------

function addEficienciaSheet(
  wb: XLSX.WorkBook,
  data: EficienciaFiscalResult,
): void {
  const rows: unknown[][] = [
    ["EFICIENCIA FISCAL — REFRENDACION CGN"],
    [],
    ["Estado:", data.status.toUpperCase()],
    ["CGN Disponible:", data.hasCGNData ? "Si" : "No"],
    ["Total CUIPO:", data.totalCuipo],
    ["Total CGN:", data.totalCGN ?? ""],
    ["Diferencia Total:", data.totalDifference ?? ""],
    ["Impuestos Refrendados:", data.refrendaCount],
    ["Impuestos No Refrendados:", data.noRefrendaCount],
    [],
    ["DETALLE POR IMPUESTO"],
    [
      "Impuesto",
      "Cuenta CUIPO",
      "Total CUIPO",
      "Total CGN",
      "Formula CGN",
      "Diferencia",
      "Variance %",
      "Valor Refrendado",
      "Refrenda",
    ],
  ];

  for (const t of data.tributos) {
    rows.push([
      t.name,
      t.cuipoAccount,
      t.cuipoTotal,
      t.cgnTotal ?? "",
      t.cgnFormula ?? "",
      t.difference ?? "",
      t.variancePct ?? "",
      t.valorRefrendado ?? "",
      t.refrenda === null ? "N/D" : t.refrenda ? "SI" : "NO",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "6. Eficiencia Fiscal");
}

// ---------------------------------------------------------------------------
// 7. IDF
// ---------------------------------------------------------------------------

function addIDFSheet(wb: XLSX.WorkBook, data: IDFResult): void {
  const rows: unknown[][] = [
    ["INDICE DE DESEMPEÑO FISCAL (IDF)"],
    [],
    ["Estado:", data.status.toUpperCase()],
    ["IDF Total:", data.idfTotal],
    ["Ranking:", data.ranking],
    ["Score Resultados Fiscales (80%):", data.scoreResultados],
    ["Score Gestion Financiera (20%):", data.scoreGestion],
    [],
    ["RESULTADOS FISCALES"],
    ["Indicador", "Valor (%)", "Score", "Interpretacion"],
  ];

  for (const i of data.resultadosFiscales) {
    rows.push([i.name, i.value, i.score ?? "N/D", i.interpretation]);
  }

  rows.push([]);
  rows.push(["GESTION FINANCIERA"]);
  rows.push(["Indicador", "Valor (%)", "Score", "Interpretacion"]);

  for (const i of data.gestionFinanciera) {
    rows.push([i.name, i.value, i.score ?? "N/D", i.interpretation]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "7. IDF");
}

// ---------------------------------------------------------------------------
// 8. Mapa de Inversiones
// ---------------------------------------------------------------------------

function addMapaSheet(wb: XLSX.WorkBook, data: MapaInversionesResult): void {
  const rows: unknown[][] = [
    ["MAPA DE INVERSIONES — CRUCE CUIPO vs PDM"],
    [],
    ["Estado:", data.status.toUpperCase()],
    ["Total BEPINes CUIPO:", data.totalBepinesCuipo],
    ["BEPINes Con Cruce:", data.bepinesConCruce],
    ["BEPINes Sin Cruce:", data.bepinesSinCruce],
    ["Valor Ejecutado Total:", data.valorEjecutadoTotal],
    ["Valor Con Cruce:", data.valorConCruce],
    ["Valor Sin Cruce:", data.valorSinCruce],
    ["% Cruce BEPIN:", data.pctCruceBepin],
    ["% Cruce Valor:", data.pctCruceValor],
    [],
    ["DETALLE POR BEPIN"],
    [
      "BEPIN",
      "Producto MGA",
      "Nombre Producto",
      "Valor CUIPO",
      "Existe en Mapa",
      "Valor Mapa",
      "Estado",
    ],
  ];

  for (const c of data.cruces) {
    rows.push([
      c.bepin,
      c.productoMGA,
      c.nombreProducto,
      c.valorCuipo,
      c.existeEnMapa ? "Si" : "No",
      c.valorMapa,
      c.status.toUpperCase(),
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "8. Mapa Inversiones");
}

// ---------------------------------------------------------------------------
// Trazabilidad
// ---------------------------------------------------------------------------

function addTrazabilidadSheet(wb: XLSX.WorkBook, data: ExportData): void {
  const rows: unknown[][] = [
    ["TRAZABILIDAD DE FUENTES DE DATOS"],
    [],
    ["Municipio:", data.municipio.name],
    ["Codigo DANE:", data.municipio.code],
    ["Codigo CHIP:", data.municipio.chipCode],
    ["Periodo:", data.periodo],
    ["Fecha de exportacion:", new Date().toISOString().split("T")[0]],
    [],
    ["FUENTE", "DESCRIPCION", "URL"],
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

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Trazabilidad");
}
