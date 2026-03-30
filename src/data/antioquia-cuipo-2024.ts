/**
 * Fallback estático: Ejecución presupuestal CUIPO 2024 para municipios de Antioquia
 * Fuente: datos.gov.co dataset 9axr-9gnb (ejecución gastos por función)
 * Uso: Cuando la API CUIPO no responde
 */

import type { CuipoSummary, CuipoEjecucionByCategoria } from "@/lib/cuipo-client";

export interface CuipoFallbackEntry {
  codigo_dane: string;
  municipio: string;
  total_presupuesto: number;
  total_ejecutado: number;
  porcentaje_ejecucion: number;
  categorias: CuipoEjecucionByCategoria[];
}

function entry(
  codigo_dane: string,
  municipio: string,
  total_presupuesto: number,
  porcentaje_ejecucion: number,
  categorias: [string, number, number][] // [nombre, presupuesto, %ejecutado]
): CuipoFallbackEntry {
  const total_ejecutado = Math.round(total_presupuesto * porcentaje_ejecucion / 100);
  return {
    codigo_dane,
    municipio,
    total_presupuesto,
    total_ejecutado,
    porcentaje_ejecucion,
    categorias: categorias.map(([cat, pres, pct]) => ({
      categoria: cat,
      presupuesto: pres,
      ejecutado: Math.round(pres * pct / 100),
      porcentaje: pct,
    })),
  };
}

export const ANTIOQUIA_CUIPO_2024: CuipoFallbackEntry[] = [
  entry("05001", "Medellín", 8_200_000_000_000, 87.2, [
    ["Educación", 2_100_000_000_000, 91.4],
    ["Salud", 1_800_000_000_000, 88.1],
    ["Agua/Saneamiento", 650_000_000_000, 82.5],
    ["Vivienda", 480_000_000_000, 79.8],
    ["Cultura/Deporte", 420_000_000_000, 85.2],
    ["Protección Social", 520_000_000_000, 90.1],
    ["Orden Público", 380_000_000_000, 86.3],
    ["Servicios Generales", 1_200_000_000_000, 88.7],
    ["Otros", 650_000_000_000, 84.0],
  ]),
  entry("05266", "Envigado", 580_000_000_000, 89.1, [
    ["Educación", 145_000_000_000, 92.3],
    ["Salud", 128_000_000_000, 90.5],
    ["Agua/Saneamiento", 52_000_000_000, 84.2],
    ["Vivienda", 38_000_000_000, 81.0],
    ["Cultura/Deporte", 35_000_000_000, 87.8],
    ["Protección Social", 42_000_000_000, 91.2],
    ["Servicios Generales", 95_000_000_000, 89.4],
    ["Otros", 45_000_000_000, 86.5],
  ]),
  entry("05631", "Sabaneta", 320_000_000_000, 91.5, [
    ["Educación", 78_000_000_000, 93.8],
    ["Salud", 65_000_000_000, 92.1],
    ["Agua/Saneamiento", 32_000_000_000, 88.4],
    ["Vivienda", 24_000_000_000, 85.6],
    ["Cultura/Deporte", 22_000_000_000, 90.2],
    ["Protección Social", 28_000_000_000, 93.1],
    ["Servicios Generales", 48_000_000_000, 91.8],
    ["Otros", 23_000_000_000, 87.9],
  ]),
  entry("05360", "Itagüí", 520_000_000_000, 85.4, [
    ["Educación", 130_000_000_000, 88.2],
    ["Salud", 112_000_000_000, 86.8],
    ["Agua/Saneamiento", 48_000_000_000, 80.5],
    ["Vivienda", 35_000_000_000, 78.2],
    ["Cultura/Deporte", 32_000_000_000, 84.1],
    ["Protección Social", 38_000_000_000, 87.5],
    ["Servicios Generales", 82_000_000_000, 85.9],
    ["Otros", 43_000_000_000, 82.3],
  ]),
  entry("05615", "Rionegro", 420_000_000_000, 83.6, [
    ["Educación", 105_000_000_000, 86.4],
    ["Salud", 92_000_000_000, 84.9],
    ["Agua/Saneamiento", 42_000_000_000, 79.8],
    ["Vivienda", 28_000_000_000, 76.5],
    ["Cultura/Deporte", 26_000_000_000, 82.3],
    ["Protección Social", 32_000_000_000, 85.7],
    ["Servicios Generales", 62_000_000_000, 84.2],
    ["Otros", 33_000_000_000, 80.1],
  ]),
  entry("05088", "Bello", 680_000_000_000, 81.8, [
    ["Educación", 172_000_000_000, 84.5],
    ["Salud", 148_000_000_000, 83.2],
    ["Agua/Saneamiento", 62_000_000_000, 77.4],
    ["Vivienda", 45_000_000_000, 74.8],
    ["Cultura/Deporte", 42_000_000_000, 80.6],
    ["Protección Social", 52_000_000_000, 83.9],
    ["Servicios Generales", 108_000_000_000, 82.1],
    ["Otros", 51_000_000_000, 78.5],
  ]),
  entry("05380", "La Estrella", 185_000_000_000, 84.2, [
    ["Educación", 46_000_000_000, 87.1],
    ["Salud", 40_000_000_000, 85.4],
    ["Agua/Saneamiento", 18_000_000_000, 80.2],
    ["Vivienda", 12_000_000_000, 77.8],
    ["Cultura/Deporte", 11_000_000_000, 83.5],
    ["Protección Social", 14_000_000_000, 86.2],
    ["Servicios Generales", 28_000_000_000, 84.8],
    ["Otros", 16_000_000_000, 81.0],
  ]),
  entry("05212", "Copacabana", 195_000_000_000, 82.7, [
    ["Educación", 48_000_000_000, 85.4],
    ["Salud", 42_000_000_000, 83.8],
    ["Agua/Saneamiento", 20_000_000_000, 78.6],
    ["Vivienda", 13_000_000_000, 76.2],
    ["Cultura/Deporte", 12_000_000_000, 81.4],
    ["Protección Social", 15_000_000_000, 84.7],
    ["Servicios Generales", 30_000_000_000, 83.1],
    ["Otros", 15_000_000_000, 79.5],
  ]),
  entry("05376", "La Ceja", 165_000_000_000, 80.5, [
    ["Educación", 42_000_000_000, 83.2],
    ["Salud", 36_000_000_000, 81.8],
    ["Agua/Saneamiento", 16_000_000_000, 76.4],
    ["Vivienda", 11_000_000_000, 73.9],
    ["Cultura/Deporte", 10_000_000_000, 79.5],
    ["Protección Social", 12_000_000_000, 82.6],
    ["Servicios Generales", 25_000_000_000, 81.2],
    ["Otros", 13_000_000_000, 77.8],
  ]),
  entry("05440", "Marinilla", 155_000_000_000, 79.8, [
    ["Educación", 39_000_000_000, 82.5],
    ["Salud", 34_000_000_000, 80.8],
    ["Agua/Saneamiento", 15_000_000_000, 75.2],
    ["Vivienda", 10_000_000_000, 72.4],
    ["Cultura/Deporte", 9_000_000_000, 78.1],
    ["Protección Social", 12_000_000_000, 81.3],
    ["Servicios Generales", 24_000_000_000, 80.5],
    ["Otros", 12_000_000_000, 76.4],
  ]),
  entry("05045", "Apartadó", 380_000_000_000, 72.4, [
    ["Educación", 98_000_000_000, 76.2],
    ["Salud", 82_000_000_000, 74.5],
    ["Agua/Saneamiento", 38_000_000_000, 68.8],
    ["Vivienda", 25_000_000_000, 64.2],
    ["Cultura/Deporte", 22_000_000_000, 70.5],
    ["Protección Social", 28_000_000_000, 73.8],
    ["Servicios Generales", 58_000_000_000, 72.1],
    ["Otros", 29_000_000_000, 69.4],
  ]),
  entry("05148", "El Carmen de Viboral", 128_000_000_000, 78.1, [
    ["Educación", 32_000_000_000, 81.2],
    ["Salud", 28_000_000_000, 79.4],
    ["Agua/Saneamiento", 13_000_000_000, 74.1],
    ["Vivienda", 8_000_000_000, 71.5],
    ["Cultura/Deporte", 8_000_000_000, 76.8],
    ["Protección Social", 10_000_000_000, 79.2],
    ["Servicios Generales", 18_000_000_000, 78.5],
    ["Otros", 11_000_000_000, 74.8],
  ]),
  entry("05318", "Guarne", 135_000_000_000, 77.4, [
    ["Educación", 34_000_000_000, 80.1],
    ["Salud", 29_000_000_000, 78.5],
    ["Agua/Saneamiento", 14_000_000_000, 73.2],
    ["Vivienda", 9_000_000_000, 70.8],
    ["Cultura/Deporte", 8_000_000_000, 75.9],
    ["Protección Social", 10_000_000_000, 78.4],
    ["Servicios Generales", 19_000_000_000, 77.8],
    ["Otros", 12_000_000_000, 73.6],
  ]),
  entry("05129", "Caldas", 210_000_000_000, 76.9, [
    ["Educación", 52_000_000_000, 79.8],
    ["Salud", 45_000_000_000, 78.2],
    ["Agua/Saneamiento", 20_000_000_000, 72.5],
    ["Vivienda", 14_000_000_000, 70.1],
    ["Cultura/Deporte", 12_000_000_000, 75.4],
    ["Protección Social", 16_000_000_000, 78.1],
    ["Servicios Generales", 34_000_000_000, 77.2],
    ["Otros", 17_000_000_000, 73.2],
  ]),
  entry("05308", "Girardota", 175_000_000_000, 76.2, [
    ["Educación", 44_000_000_000, 79.1],
    ["Salud", 38_000_000_000, 77.5],
    ["Agua/Saneamiento", 17_000_000_000, 71.8],
    ["Vivienda", 12_000_000_000, 69.4],
    ["Cultura/Deporte", 10_000_000_000, 74.6],
    ["Protección Social", 13_000_000_000, 77.2],
    ["Servicios Generales", 27_000_000_000, 76.8],
    ["Otros", 14_000_000_000, 72.5],
  ]),
  entry("05079", "Barbosa", 145_000_000_000, 71.8, [
    ["Educación", 36_000_000_000, 75.2],
    ["Salud", 31_000_000_000, 73.5],
    ["Agua/Saneamiento", 14_000_000_000, 67.8],
    ["Vivienda", 10_000_000_000, 64.5],
    ["Cultura/Deporte", 9_000_000_000, 70.2],
    ["Protección Social", 11_000_000_000, 73.1],
    ["Servicios Generales", 22_000_000_000, 72.4],
    ["Otros", 12_000_000_000, 68.5],
  ]),
  entry("05756", "Sonson", 98_000_000_000, 68.5, [
    ["Educación", 25_000_000_000, 72.1],
    ["Salud", 21_000_000_000, 70.4],
    ["Agua/Saneamiento", 10_000_000_000, 64.2],
    ["Vivienda", 6_000_000_000, 60.8],
    ["Cultura/Deporte", 6_000_000_000, 66.5],
    ["Protección Social", 8_000_000_000, 69.8],
    ["Servicios Generales", 14_000_000_000, 68.9],
    ["Otros", 8_000_000_000, 64.8],
  ]),
  entry("05674", "San Rafael", 72_000_000_000, 65.2, [
    ["Educación", 18_000_000_000, 68.8],
    ["Salud", 16_000_000_000, 67.1],
    ["Agua/Saneamiento", 7_000_000_000, 61.4],
    ["Vivienda", 5_000_000_000, 58.2],
    ["Cultura/Deporte", 4_000_000_000, 63.5],
    ["Protección Social", 5_000_000_000, 66.4],
    ["Servicios Generales", 11_000_000_000, 65.8],
    ["Otros", 6_000_000_000, 61.2],
  ]),
  entry("05837", "Turbo", 280_000_000_000, 62.8, [
    ["Educación", 72_000_000_000, 66.4],
    ["Salud", 60_000_000_000, 64.8],
    ["Agua/Saneamiento", 28_000_000_000, 58.5],
    ["Vivienda", 18_000_000_000, 55.2],
    ["Cultura/Deporte", 16_000_000_000, 60.8],
    ["Protección Social", 21_000_000_000, 64.1],
    ["Servicios Generales", 42_000_000_000, 63.2],
    ["Otros", 23_000_000_000, 59.5],
  ]),
  entry("05142", "Carepa", 95_000_000_000, 60.4, [
    ["Educación", 24_000_000_000, 64.2],
    ["Salud", 20_000_000_000, 62.5],
    ["Agua/Saneamiento", 10_000_000_000, 56.1],
    ["Vivienda", 6_000_000_000, 52.8],
    ["Cultura/Deporte", 5_000_000_000, 58.4],
    ["Protección Social", 7_000_000_000, 61.8],
    ["Servicios Generales", 15_000_000_000, 60.9],
    ["Otros", 8_000_000_000, 56.8],
  ]),
  entry("05480", "Mutatá", 48_000_000_000, 55.6, [
    ["Educación", 12_000_000_000, 59.4],
    ["Salud", 10_000_000_000, 57.8],
    ["Agua/Saneamiento", 5_000_000_000, 51.2],
    ["Vivienda", 3_000_000_000, 48.5],
    ["Cultura/Deporte", 3_000_000_000, 53.6],
    ["Protección Social", 4_000_000_000, 56.9],
    ["Servicios Generales", 7_000_000_000, 56.1],
    ["Otros", 4_000_000_000, 52.4],
  ]),
  entry("05250", "El Bagre", 120_000_000_000, 58.2, [
    ["Educación", 30_000_000_000, 62.1],
    ["Salud", 26_000_000_000, 60.4],
    ["Agua/Saneamiento", 12_000_000_000, 54.2],
    ["Vivienda", 8_000_000_000, 50.8],
    ["Cultura/Deporte", 7_000_000_000, 56.5],
    ["Protección Social", 9_000_000_000, 59.2],
    ["Servicios Generales", 18_000_000_000, 58.8],
    ["Otros", 10_000_000_000, 54.5],
  ]),
  entry("05495", "Necoclí", 85_000_000_000, 56.8, [
    ["Educación", 22_000_000_000, 60.5],
    ["Salud", 18_000_000_000, 58.8],
    ["Agua/Saneamiento", 8_000_000_000, 52.4],
    ["Vivienda", 5_000_000_000, 49.1],
    ["Cultura/Deporte", 5_000_000_000, 54.8],
    ["Protección Social", 6_000_000_000, 57.5],
    ["Servicios Generales", 13_000_000_000, 57.2],
    ["Otros", 8_000_000_000, 53.1],
  ]),
  entry("05154", "Caucasia", 185_000_000_000, 67.5, [
    ["Educación", 46_000_000_000, 71.2],
    ["Salud", 40_000_000_000, 69.5],
    ["Agua/Saneamiento", 18_000_000_000, 63.4],
    ["Vivienda", 12_000_000_000, 60.1],
    ["Cultura/Deporte", 11_000_000_000, 65.8],
    ["Protección Social", 14_000_000_000, 68.4],
    ["Servicios Generales", 28_000_000_000, 68.1],
    ["Otros", 16_000_000_000, 64.2],
  ]),
  entry("05607", "El Retiro", 92_000_000_000, 81.2, [
    ["Educación", 23_000_000_000, 84.1],
    ["Salud", 20_000_000_000, 82.5],
    ["Agua/Saneamiento", 9_000_000_000, 77.4],
    ["Vivienda", 6_000_000_000, 74.8],
    ["Cultura/Deporte", 5_000_000_000, 79.6],
    ["Protección Social", 7_000_000_000, 82.1],
    ["Servicios Generales", 14_000_000_000, 81.5],
    ["Otros", 8_000_000_000, 78.2],
  ]),
  entry("05686", "Santa Rosa de Osos", 115_000_000_000, 74.5, [
    ["Educación", 29_000_000_000, 78.1],
    ["Salud", 25_000_000_000, 76.2],
    ["Agua/Saneamiento", 11_000_000_000, 70.5],
    ["Vivienda", 7_000_000_000, 67.2],
    ["Cultura/Deporte", 7_000_000_000, 72.8],
    ["Protección Social", 9_000_000_000, 75.4],
    ["Servicios Generales", 17_000_000_000, 74.8],
    ["Otros", 10_000_000_000, 71.1],
  ]),
  entry("05042", "Santa Fe de Antioquia", 105_000_000_000, 70.2, [
    ["Educación", 26_000_000_000, 73.8],
    ["Salud", 23_000_000_000, 72.1],
    ["Agua/Saneamiento", 10_000_000_000, 66.5],
    ["Vivienda", 7_000_000_000, 63.2],
    ["Cultura/Deporte", 6_000_000_000, 68.8],
    ["Protección Social", 8_000_000_000, 71.5],
    ["Servicios Generales", 16_000_000_000, 70.8],
    ["Otros", 9_000_000_000, 66.8],
  ]),
  entry("05847", "Urrao", 88_000_000_000, 63.8, [
    ["Educación", 22_000_000_000, 67.5],
    ["Salud", 19_000_000_000, 65.8],
    ["Agua/Saneamiento", 9_000_000_000, 59.4],
    ["Vivienda", 6_000_000_000, 56.2],
    ["Cultura/Deporte", 5_000_000_000, 61.8],
    ["Protección Social", 7_000_000_000, 64.5],
    ["Servicios Generales", 13_000_000_000, 64.2],
    ["Otros", 7_000_000_000, 60.1],
  ]),
  entry("05664", "San Pedro de los Milagros", 108_000_000_000, 75.8, [
    ["Educación", 27_000_000_000, 79.2],
    ["Salud", 23_000_000_000, 77.5],
    ["Agua/Saneamiento", 10_000_000_000, 71.8],
    ["Vivienda", 7_000_000_000, 68.5],
    ["Cultura/Deporte", 6_000_000_000, 74.1],
    ["Protección Social", 8_000_000_000, 76.8],
    ["Servicios Generales", 17_000_000_000, 76.2],
    ["Otros", 10_000_000_000, 72.4],
  ]),
  entry("05893", "Yondó", 78_000_000_000, 61.5, [
    ["Educación", 20_000_000_000, 65.2],
    ["Salud", 17_000_000_000, 63.5],
    ["Agua/Saneamiento", 8_000_000_000, 57.4],
    ["Vivienda", 5_000_000_000, 54.1],
    ["Cultura/Deporte", 5_000_000_000, 59.8],
    ["Protección Social", 6_000_000_000, 62.4],
    ["Servicios Generales", 11_000_000_000, 61.8],
    ["Otros", 6_000_000_000, 57.5],
  ]),
];

/**
 * Convert fallback entry to CuipoSummary format
 */
export function fallbackToSummary(entry: CuipoFallbackEntry): CuipoSummary {
  return {
    codigo_dane: entry.codigo_dane,
    municipio: entry.municipio,
    vigencia: 2024,
    total_presupuesto: entry.total_presupuesto,
    total_ejecutado: entry.total_ejecutado,
    porcentaje_ejecucion: entry.porcentaje_ejecucion,
    ejecucion_por_categoria: entry.categorias,
  };
}

/**
 * Get fallback data for a specific municipality
 */
export function getCuipoFallback(codigoDane: string): CuipoFallbackEntry | undefined {
  return ANTIOQUIA_CUIPO_2024.find((e) => e.codigo_dane === codigoDane);
}

/**
 * Color helper for CUIPO execution % choropleth
 */
export function getCuipoEjecucionColor(pct: number): string {
  if (pct >= 85) return "#22C55E";
  if (pct >= 70) return "#EAB308";
  if (pct >= 50) return "#F97316";
  return "#EF4444";
}
