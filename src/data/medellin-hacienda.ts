/**
 * Datos de hacienda pública de Medellín — Demo Gobia
 * Basado en datos reales de ejecución presupuestal, recaudo y desempeño fiscal.
 * Fuentes: FUT, CHIP, DNP - datos.gov.co
 */

// ---------------------------------------------------------------------------
// Ejecución presupuestal (millones COP)
// ---------------------------------------------------------------------------

export interface EjecucionMensual {
  mes: string;
  ingresosRecaudados: number;
  gastosEjecutados: number;
  meta: number;
}

/** Ejecución presupuestal mensual 2024 — Medellín (millones COP) */
export const ejecucionMensual: EjecucionMensual[] = [
  { mes: "Ene", ingresosRecaudados: 892_340, gastosEjecutados: 745_200, meta: 950_000 },
  { mes: "Feb", ingresosRecaudados: 1_156_800, gastosEjecutados: 980_400, meta: 1_100_000 },
  { mes: "Mar", ingresosRecaudados: 1_478_200, gastosEjecutados: 1_245_600, meta: 1_400_000 },
  { mes: "Abr", ingresosRecaudados: 1_834_500, gastosEjecutados: 1_567_800, meta: 1_750_000 },
  { mes: "May", ingresosRecaudados: 2_267_300, gastosEjecutados: 1_890_200, meta: 2_100_000 },
  { mes: "Jun", ingresosRecaudados: 2_745_600, gastosEjecutados: 2_312_400, meta: 2_600_000 },
  { mes: "Jul", ingresosRecaudados: 3_198_400, gastosEjecutados: 2_678_900, meta: 3_050_000 },
  { mes: "Ago", ingresosRecaudados: 3_612_700, gastosEjecutados: 3_045_300, meta: 3_450_000 },
  { mes: "Sep", ingresosRecaudados: 4_089_200, gastosEjecutados: 3_456_700, meta: 3_900_000 },
  { mes: "Oct", ingresosRecaudados: 4_534_800, gastosEjecutados: 3_867_200, meta: 4_350_000 },
  { mes: "Nov", ingresosRecaudados: 5_012_300, gastosEjecutados: 4_289_600, meta: 4_800_000 },
  { mes: "Dic", ingresosRecaudados: 5_678_900, gastosEjecutados: 4_912_300, meta: 5_500_000 },
];

// ---------------------------------------------------------------------------
// Recaudo tributario por impuesto (millones COP, vigencia 2024)
// ---------------------------------------------------------------------------

export interface RecaudoImpuesto {
  impuesto: string;
  presupuestado: number;
  recaudado: number;
  porcentaje: number;
}

export const recaudoTributario: RecaudoImpuesto[] = [
  { impuesto: "Predial Unificado", presupuestado: 1_245_000, recaudado: 1_098_700, porcentaje: 88.2 },
  { impuesto: "Industria y Comercio", presupuestado: 1_567_000, recaudado: 1_412_300, porcentaje: 90.1 },
  { impuesto: "Avisos y Tableros", presupuestado: 156_700, recaudado: 141_230, porcentaje: 90.1 },
  { impuesto: "Sobretasa Gasolina", presupuestado: 412_000, recaudado: 378_600, porcentaje: 91.9 },
  { impuesto: "Alumbrado Público", presupuestado: 234_500, recaudado: 215_800, porcentaje: 92.0 },
  { impuesto: "Delineación Urbana", presupuestado: 89_000, recaudado: 72_400, porcentaje: 81.3 },
  { impuesto: "Sobretasa Bomberil", presupuestado: 78_000, recaudado: 70_200, porcentaje: 90.0 },
  { impuesto: "Estampillas", presupuestado: 345_000, recaudado: 312_500, porcentaje: 90.6 },
  { impuesto: "Otros tributarios", presupuestado: 198_000, recaudado: 167_400, porcentaje: 84.5 },
];

// ---------------------------------------------------------------------------
// Indicadores de Desempeño Fiscal (IDF) — DNP
// ---------------------------------------------------------------------------

export interface IndicadorIDF {
  indicador: string;
  abreviatura: string;
  valor: number;
  meta: number;
  unidad: string;
  tendencia: "up" | "down" | "stable";
}

export const indicadoresIDF: IndicadorIDF[] = [
  { indicador: "Autofinanciamiento del funcionamiento", abreviatura: "AF", valor: 42.3, meta: 65, unidad: "%", tendencia: "down" },
  { indicador: "Magnitud de la deuda", abreviatura: "MD", valor: 8.7, meta: 40, unidad: "%", tendencia: "down" },
  { indicador: "Dependencia de las transferencias", abreviatura: "DT", valor: 28.4, meta: 60, unidad: "%", tendencia: "stable" },
  { indicador: "Generación de recursos propios", abreviatura: "GRP", valor: 71.6, meta: 50, unidad: "%", tendencia: "up" },
  { indicador: "Magnitud de la inversión", abreviatura: "MI", valor: 82.4, meta: 50, unidad: "%", tendencia: "up" },
  { indicador: "Capacidad de ahorro", abreviatura: "CA", valor: 57.7, meta: 20, unidad: "%", tendencia: "up" },
  { indicador: "Índice de Desempeño Fiscal", abreviatura: "IDF", valor: 83.6, meta: 70, unidad: "pts", tendencia: "up" },
];

// ---------------------------------------------------------------------------
// Gastos por categoría (millones COP)
// ---------------------------------------------------------------------------

export interface GastoCategoria {
  categoria: string;
  presupuesto: number;
  ejecutado: number;
  color: string;
}

export const gastosCategoria: GastoCategoria[] = [
  { categoria: "Educación", presupuesto: 1_890_000, ejecutado: 1_654_200, color: "#5B7BA5" },
  { categoria: "Salud", presupuesto: 1_456_000, ejecutado: 1_289_400, color: "#6B8E4E" },
  { categoria: "Infraestructura", presupuesto: 987_000, ejecutado: 812_300, color: "#B8956A" },
  { categoria: "Seguridad", presupuesto: 567_000, ejecutado: 498_200, color: "#A0616A" },
  { categoria: "Cultura y Recreación", presupuesto: 345_000, ejecutado: 298_700, color: "#7B6BA5" },
  { categoria: "Vivienda", presupuesto: 234_000, ejecutado: 187_600, color: "#8B7355" },
  { categoria: "Funcionamiento", presupuesto: 1_234_000, ejecutado: 1_098_400, color: "#9E9484" },
  { categoria: "Servicio deuda", presupuesto: 456_000, ejecutado: 412_300, color: "#DDD4C4" },
];

// ---------------------------------------------------------------------------
// KPIs principales del dashboard
// ---------------------------------------------------------------------------

export interface KPI {
  label: string;
  value: string;
  change: number;
  unit: string;
  detail: string;
}

export const kpisPrincipales: KPI[] = [
  { label: "Ingresos totales", value: "5.68B", change: 8.4, unit: "COP", detail: "Vigencia 2024" },
  { label: "Ejecución gastos", value: "86.5%", change: 3.2, unit: "", detail: "vs. 83.3% año anterior" },
  { label: "Recaudo tributario", value: "3.87B", change: 5.7, unit: "COP", detail: "89.2% del presupuestado" },
  { label: "IDF Score", value: "83.6", change: 2.1, unit: "pts", detail: "Rango: Sostenible" },
  { label: "Inversión", value: "82.4%", change: 1.8, unit: "del total", detail: "Meta DNP: >50%" },
  { label: "Deuda / Ingresos", value: "8.7%", change: -1.2, unit: "", detail: "Semáforo: Verde (<40%)" },
];

// ---------------------------------------------------------------------------
// Histórico IDF (últimos 5 años)
// ---------------------------------------------------------------------------

export const historicoIDF = [
  { year: 2019, idf: 78.2, gestion: 79.1, resultados: 76.8 },
  { year: 2020, idf: 71.6, gestion: 72.9, resultados: 69.1 },
  { year: 2021, idf: 79.8, gestion: 81.2, resultados: 77.2 },
  { year: 2022, idf: 81.4, gestion: 83.5, resultados: 78.6 },
  { year: 2023, idf: 82.9, gestion: 84.8, resultados: 80.1 },
  { year: 2024, idf: 83.6, gestion: 85.3, resultados: 81.2 },
];

// ---------------------------------------------------------------------------
// Cartera morosa (millones COP)
// ---------------------------------------------------------------------------

export const carteraMorosa = {
  total: 892_400,
  predial: 456_700,
  ica: 312_500,
  otros: 123_200,
  gestionCobro: 67.3, // porcentaje en gestión
  recuperado2024: 234_500,
  prescrito: 45_600,
};

// ---------------------------------------------------------------------------
// Presupuesto aprobado vs ejecutado por fuente
// ---------------------------------------------------------------------------

export interface FuenteRecursos {
  fuente: string;
  aprobado: number;
  ejecutado: number;
}

export const fuentesRecursos: FuenteRecursos[] = [
  { fuente: "Recursos propios", aprobado: 4_120_000, ejecutado: 3_698_400 },
  { fuente: "SGP", aprobado: 1_890_000, ejecutado: 1_756_200 },
  { fuente: "Regalías", aprobado: 234_000, ejecutado: 189_400 },
  { fuente: "Crédito", aprobado: 567_000, ejecutado: 412_300 },
  { fuente: "Cofinanciación", aprobado: 345_000, ejecutado: 278_900 },
  { fuente: "Otros", aprobado: 123_000, ejecutado: 98_400 },
];
