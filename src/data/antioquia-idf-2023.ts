/**
 * Dataset estatico con IDF 2023 de los 30 municipios mas grandes de Antioquia
 * Fuente: DNP - Medicion de Desempeno Municipal (MDM)
 * Uso: Fallback cuando la API de datos.gov.co no esta disponible
 */

import type { IDFCategoria } from "@/lib/fut-client";

export interface IDFRankingStatic {
  codigoDane: string;
  nombre: string;
  idf: number;
  categoria: IDFCategoria;
  ranking: number;
  poblacion: number;
  dependenciaTransferencias: number;
  generacionRecursosPropios: number;
  magnitudInversion: number;
  capacidadAhorro: number;
}

export const ANTIOQUIA_IDF_2023: IDFRankingStatic[] = [
  {
    codigoDane: "05001",
    nombre: "Medellin",
    idf: 82.3,
    categoria: "sostenible",
    ranking: 1,
    poblacion: 2612000,
    dependenciaTransferencias: 18.2,
    generacionRecursosPropios: 78.4,
    magnitudInversion: 82.1,
    capacidadAhorro: 45.2,
  },
  {
    codigoDane: "05266",
    nombre: "Envigado",
    idf: 80.1,
    categoria: "sostenible",
    ranking: 2,
    poblacion: 256000,
    dependenciaTransferencias: 15.8,
    generacionRecursosPropios: 82.1,
    magnitudInversion: 78.5,
    capacidadAhorro: 42.8,
  },
  {
    codigoDane: "05631",
    nombre: "Sabaneta",
    idf: 79.8,
    categoria: "solvente",
    ranking: 3,
    poblacion: 68000,
    dependenciaTransferencias: 12.4,
    generacionRecursosPropios: 85.2,
    magnitudInversion: 76.9,
    capacidadAhorro: 41.5,
  },
  {
    codigoDane: "05360",
    nombre: "Itagui",
    idf: 78.6,
    categoria: "solvente",
    ranking: 4,
    poblacion: 294000,
    dependenciaTransferencias: 19.1,
    generacionRecursosPropios: 74.8,
    magnitudInversion: 79.2,
    capacidadAhorro: 38.9,
  },
  {
    codigoDane: "05615",
    nombre: "Rionegro",
    idf: 77.4,
    categoria: "solvente",
    ranking: 5,
    poblacion: 142000,
    dependenciaTransferencias: 22.3,
    generacionRecursosPropios: 72.1,
    magnitudInversion: 81.4,
    capacidadAhorro: 36.7,
  },
  {
    codigoDane: "05380",
    nombre: "La Estrella",
    idf: 76.2,
    categoria: "solvente",
    ranking: 6,
    poblacion: 72000,
    dependenciaTransferencias: 24.5,
    generacionRecursosPropios: 68.9,
    magnitudInversion: 77.8,
    capacidadAhorro: 34.2,
  },
  {
    codigoDane: "05212",
    nombre: "Copacabana",
    idf: 75.8,
    categoria: "solvente",
    ranking: 7,
    poblacion: 88000,
    dependenciaTransferencias: 26.1,
    generacionRecursosPropios: 66.4,
    magnitudInversion: 78.2,
    capacidadAhorro: 33.1,
  },
  {
    codigoDane: "05088",
    nombre: "Bello",
    idf: 74.5,
    categoria: "solvente",
    ranking: 8,
    poblacion: 582000,
    dependenciaTransferencias: 28.4,
    generacionRecursosPropios: 62.8,
    magnitudInversion: 76.5,
    capacidadAhorro: 31.4,
  },
  {
    codigoDane: "05376",
    nombre: "La Ceja",
    idf: 73.9,
    categoria: "solvente",
    ranking: 9,
    poblacion: 58000,
    dependenciaTransferencias: 31.2,
    generacionRecursosPropios: 58.6,
    magnitudInversion: 79.1,
    capacidadAhorro: 29.8,
  },
  {
    codigoDane: "05440",
    nombre: "Marinilla",
    idf: 73.2,
    categoria: "solvente",
    ranking: 10,
    poblacion: 62000,
    dependenciaTransferencias: 33.8,
    generacionRecursosPropios: 54.2,
    magnitudInversion: 80.4,
    capacidadAhorro: 28.5,
  },
  {
    codigoDane: "05148",
    nombre: "El Carmen de Viboral",
    idf: 72.1,
    categoria: "solvente",
    ranking: 11,
    poblacion: 52000,
    dependenciaTransferencias: 36.4,
    generacionRecursosPropios: 51.8,
    magnitudInversion: 78.9,
    capacidadAhorro: 26.2,
  },
  {
    codigoDane: "05318",
    nombre: "Guarne",
    idf: 71.8,
    categoria: "solvente",
    ranking: 12,
    poblacion: 54000,
    dependenciaTransferencias: 35.1,
    generacionRecursosPropios: 52.4,
    magnitudInversion: 77.6,
    capacidadAhorro: 25.8,
  },
  {
    codigoDane: "05607",
    nombre: "El Retiro",
    idf: 71.4,
    categoria: "solvente",
    ranking: 13,
    poblacion: 22000,
    dependenciaTransferencias: 29.8,
    generacionRecursosPropios: 58.1,
    magnitudInversion: 74.2,
    capacidadAhorro: 27.4,
  },
  {
    codigoDane: "05129",
    nombre: "Caldas",
    idf: 70.6,
    categoria: "solvente",
    ranking: 14,
    poblacion: 86000,
    dependenciaTransferencias: 38.2,
    generacionRecursosPropios: 48.5,
    magnitudInversion: 76.8,
    capacidadAhorro: 24.1,
  },
  {
    codigoDane: "05308",
    nombre: "Girardota",
    idf: 70.2,
    categoria: "solvente",
    ranking: 15,
    poblacion: 62000,
    dependenciaTransferencias: 37.5,
    generacionRecursosPropios: 49.8,
    magnitudInversion: 75.4,
    capacidadAhorro: 23.6,
  },
  {
    codigoDane: "05079",
    nombre: "Barbosa",
    idf: 69.4,
    categoria: "vulnerable",
    ranking: 16,
    poblacion: 55000,
    dependenciaTransferencias: 42.1,
    generacionRecursosPropios: 44.2,
    magnitudInversion: 74.8,
    capacidadAhorro: 21.9,
  },
  {
    codigoDane: "05045",
    nombre: "Apartado",
    idf: 68.8,
    categoria: "vulnerable",
    ranking: 17,
    poblacion: 214000,
    dependenciaTransferencias: 45.6,
    generacionRecursosPropios: 42.1,
    magnitudInversion: 72.5,
    capacidadAhorro: 20.4,
  },
  {
    codigoDane: "05154",
    nombre: "Caucasia",
    idf: 67.5,
    categoria: "vulnerable",
    ranking: 18,
    poblacion: 123000,
    dependenciaTransferencias: 48.2,
    generacionRecursosPropios: 38.4,
    magnitudInversion: 71.8,
    capacidadAhorro: 18.6,
  },
  {
    codigoDane: "05172",
    nombre: "Chigorodo",
    idf: 66.8,
    categoria: "vulnerable",
    ranking: 19,
    poblacion: 89000,
    dependenciaTransferencias: 51.4,
    generacionRecursosPropios: 35.2,
    magnitudInversion: 70.4,
    capacidadAhorro: 17.2,
  },
  {
    codigoDane: "05756",
    nombre: "Turbo",
    idf: 65.2,
    categoria: "vulnerable",
    ranking: 20,
    poblacion: 178000,
    dependenciaTransferencias: 54.8,
    generacionRecursosPropios: 32.1,
    magnitudInversion: 68.9,
    capacidadAhorro: 15.4,
  },
  {
    codigoDane: "05034",
    nombre: "Andes",
    idf: 64.8,
    categoria: "vulnerable",
    ranking: 21,
    poblacion: 47500,
    dependenciaTransferencias: 52.1,
    generacionRecursosPropios: 34.8,
    magnitudInversion: 69.2,
    capacidadAhorro: 16.1,
  },
  {
    codigoDane: "05042",
    nombre: "Santa Fe de Antioquia",
    idf: 64.2,
    categoria: "vulnerable",
    ranking: 22,
    poblacion: 27000,
    dependenciaTransferencias: 55.4,
    generacionRecursosPropios: 31.2,
    magnitudInversion: 68.4,
    capacidadAhorro: 14.8,
  },
  {
    codigoDane: "05147",
    nombre: "Carepa",
    idf: 63.5,
    categoria: "vulnerable",
    ranking: 23,
    poblacion: 63000,
    dependenciaTransferencias: 56.8,
    generacionRecursosPropios: 29.4,
    magnitudInversion: 67.2,
    capacidadAhorro: 13.5,
  },
  {
    codigoDane: "05664",
    nombre: "San Pedro de los Milagros",
    idf: 62.8,
    categoria: "vulnerable",
    ranking: 24,
    poblacion: 28000,
    dependenciaTransferencias: 58.2,
    generacionRecursosPropios: 28.1,
    magnitudInversion: 66.8,
    capacidadAhorro: 12.9,
  },
  {
    codigoDane: "05250",
    nombre: "El Santuario",
    idf: 62.1,
    categoria: "vulnerable",
    ranking: 25,
    poblacion: 29000,
    dependenciaTransferencias: 59.4,
    generacionRecursosPropios: 26.8,
    magnitudInversion: 65.4,
    capacidadAhorro: 11.8,
  },
  {
    codigoDane: "05686",
    nombre: "Santa Rosa de Osos",
    idf: 61.4,
    categoria: "vulnerable",
    ranking: 26,
    poblacion: 37000,
    dependenciaTransferencias: 61.2,
    generacionRecursosPropios: 24.5,
    magnitudInversion: 64.8,
    capacidadAhorro: 10.6,
  },
  {
    codigoDane: "05031",
    nombre: "Amalfi",
    idf: 60.8,
    categoria: "vulnerable",
    ranking: 27,
    poblacion: 24100,
    dependenciaTransferencias: 62.8,
    generacionRecursosPropios: 22.4,
    magnitudInversion: 63.5,
    capacidadAhorro: 9.4,
  },
  {
    codigoDane: "05120",
    nombre: "Caceres",
    idf: 59.2,
    categoria: "deterioro",
    ranking: 28,
    poblacion: 44000,
    dependenciaTransferencias: 65.4,
    generacionRecursosPropios: 19.8,
    magnitudInversion: 61.2,
    capacidadAhorro: 7.8,
  },
  {
    codigoDane: "05051",
    nombre: "Arboletes",
    idf: 58.4,
    categoria: "deterioro",
    ranking: 29,
    poblacion: 44500,
    dependenciaTransferencias: 68.2,
    generacionRecursosPropios: 17.2,
    magnitudInversion: 59.8,
    capacidadAhorro: 6.2,
  },
  {
    codigoDane: "05480",
    nombre: "Mutata",
    idf: 56.8,
    categoria: "deterioro",
    ranking: 30,
    poblacion: 22000,
    dependenciaTransferencias: 72.1,
    generacionRecursosPropios: 14.5,
    magnitudInversion: 57.4,
    capacidadAhorro: 4.1,
  },
];

/**
 * Obtener IDF por codigo DANE
 */
export function getIDFByCode(codigoDane: string): IDFRankingStatic | undefined {
  return ANTIOQUIA_IDF_2023.find((m) => m.codigoDane === codigoDane);
}

/**
 * Calcular promedios de Antioquia basado en dataset estatico
 */
export function getAntioquiaAverages(): {
  idf: number;
  dependenciaTransferencias: number;
  generacionRecursosPropios: number;
  magnitudInversion: number;
  capacidadAhorro: number;
} {
  const n = ANTIOQUIA_IDF_2023.length;
  return {
    idf:
      Math.round(
        (ANTIOQUIA_IDF_2023.reduce((sum, m) => sum + m.idf, 0) / n) * 10
      ) / 10,
    dependenciaTransferencias:
      Math.round(
        (ANTIOQUIA_IDF_2023.reduce(
          (sum, m) => sum + m.dependenciaTransferencias,
          0
        ) /
          n) *
          10
      ) / 10,
    generacionRecursosPropios:
      Math.round(
        (ANTIOQUIA_IDF_2023.reduce(
          (sum, m) => sum + m.generacionRecursosPropios,
          0
        ) /
          n) *
          10
      ) / 10,
    magnitudInversion:
      Math.round(
        (ANTIOQUIA_IDF_2023.reduce((sum, m) => sum + m.magnitudInversion, 0) /
          n) *
          10
      ) / 10,
    capacidadAhorro:
      Math.round(
        (ANTIOQUIA_IDF_2023.reduce((sum, m) => sum + m.capacidadAhorro, 0) / n) *
          10
      ) / 10,
  };
}

/**
 * Colores para categorias IDF
 */
export const IDF_CATEGORIA_COLORS: Record<IDFCategoria, string> = {
  sostenible: "#22C55E", // green-500
  solvente: "#EAB308", // yellow-500
  vulnerable: "#F97316", // orange-500
  deterioro: "#EF4444", // red-500
};

/**
 * Obtener color para un score IDF
 */
export function getIDFColor(score: number): string {
  if (score >= 80) return IDF_CATEGORIA_COLORS.sostenible;
  if (score >= 70) return IDF_CATEGORIA_COLORS.solvente;
  if (score >= 60) return IDF_CATEGORIA_COLORS.vulnerable;
  return IDF_CATEGORIA_COLORS.deterioro;
}

/**
 * Escala de colores para choropleth IDF (gradiente)
 */
export const IDF_CHOROPLETH_STOPS: [number, string][] = [
  [50, "#EF4444"], // deterioro - red
  [60, "#F97316"], // vulnerable - orange
  [70, "#EAB308"], // solvente - yellow
  [80, "#22C55E"], // sostenible - green
  [90, "#16A34A"], // very high - darker green
];
