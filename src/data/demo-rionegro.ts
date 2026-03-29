/**
 * Datos de ejemplo para Rionegro (05615) - Municipio piloto
 * Fuentes: TerriData, FUT 2023, SECOP II, PDM 2024-2027
 */

export interface TerriDataIndicators {
  nbi: number;                    // Necesidades Básicas Insatisfechas (%)
  cobertura_educacion: number;    // Cobertura neta educación (%)
  afiliacion_salud: number;       // Afiliación régimen salud (%)
  ipm: number;                    // Índice Pobreza Multidimensional (%)
  tasa_desempleo: number;         // Tasa de desempleo (%)
  cobertura_acueducto: number;    // Cobertura acueducto (%)
  cobertura_alcantarillado: number; // Cobertura alcantarillado (%)
  año: number;
}

export interface FiscalData {
  idf: number;                    // Índice de Desempeño Fiscal (0-100)
  vigencia: number;
  ingresos_totales: number;       // En pesos
  gastos_totales: number;         // En pesos
  recaudo_predial: number;        // Recaudo predial en pesos
  recaudo_ica: number;            // Recaudo ICA en pesos
  ejecucion_gastos: number;       // % ejecución de gastos
  dependencia_transferencias: number; // % dependencia SGP
  capacidad_ahorro: number;       // % capacidad de ahorro
  magnitud_deuda: number;         // % magnitud de la deuda
}

export interface ContractSummary {
  total_count: number;            // Total contratos
  total_value: number;            // Valor total en pesos
  active: number;                 // Contratos activos
  by_type: {
    obra: number;
    prestacion_servicios: number;
    suministro: number;
    consultoria: number;
    otros: number;
  };
  top_sectores: Array<{
    sector: string;
    count: number;
    value: number;
  }>;
}

export interface PDMData {
  periodo: string;
  nombre_plan: string;
  lineas_estrategicas: number;
  programas: number;
  proyectos: number;
  metas_producto: number;
  avance_general: number;         // % avance
  ejes: Array<{
    nombre: string;
    avance: number;
    inversion: number;
  }>;
}

export interface MunicipalityFullData {
  codigo_dane: string;
  nombre: string;
  departamento: string;
  subregion: string;
  categoria: number;
  poblacion: number;
  area_km2: number;
  terridata: TerriDataIndicators;
  fiscal: FiscalData;
  contracts: ContractSummary;
  pdm: PDMData;
}

/**
 * Datos demo para Rionegro - Valores aproximados reales
 * Rionegro es el municipio más importante del Oriente antioqueño
 * Categoría 2, aeropuerto internacional, zona franca
 */
export const RIONEGRO_DEMO_DATA: MunicipalityFullData = {
  codigo_dane: "05615",
  nombre: "Rionegro",
  departamento: "Antioquia",
  subregion: "Oriente",
  categoria: 2,
  poblacion: 146000,
  area_km2: 196,

  terridata: {
    nbi: 8.2,
    cobertura_educacion: 91.4,
    afiliacion_salud: 96.8,
    ipm: 12.3,
    tasa_desempleo: 7.8,
    cobertura_acueducto: 94.2,
    cobertura_alcantarillado: 88.6,
    año: 2023,
  },

  fiscal: {
    idf: 75.2,
    vigencia: 2023,
    ingresos_totales: 428_000_000_000,    // 428 mil millones
    gastos_totales: 398_000_000_000,       // 398 mil millones
    recaudo_predial: 85_600_000_000,       // 85.6 mil millones
    recaudo_ica: 62_400_000_000,           // 62.4 mil millones
    ejecucion_gastos: 94.3,
    dependencia_transferencias: 24.8,
    capacidad_ahorro: 18.2,
    magnitud_deuda: 3.4,
  },

  contracts: {
    total_count: 287,
    total_value: 156_800_000_000,          // 156.8 mil millones
    active: 45,
    by_type: {
      obra: 42,
      prestacion_servicios: 168,
      suministro: 35,
      consultoria: 22,
      otros: 20,
    },
    top_sectores: [
      { sector: "Infraestructura vial", count: 28, value: 45_200_000_000 },
      { sector: "Educación", count: 34, value: 28_600_000_000 },
      { sector: "Salud", count: 22, value: 24_800_000_000 },
      { sector: "Tecnología", count: 18, value: 12_400_000_000 },
      { sector: "Cultura y deporte", count: 15, value: 8_600_000_000 },
    ],
  },

  pdm: {
    periodo: "2024-2027",
    nombre_plan: "Rionegro Avanza",
    lineas_estrategicas: 5,
    programas: 24,
    proyectos: 142,
    metas_producto: 386,
    avance_general: 18.4,  // Primer año de ejecución
    ejes: [
      { nombre: "Rionegro Equitativo", avance: 22.1, inversion: 85_000_000_000 },
      { nombre: "Rionegro Competitivo", avance: 16.8, inversion: 62_000_000_000 },
      { nombre: "Rionegro Sostenible", avance: 19.2, inversion: 48_000_000_000 },
      { nombre: "Rionegro Seguro", avance: 14.5, inversion: 32_000_000_000 },
      { nombre: "Rionegro Conectado", avance: 21.3, inversion: 28_000_000_000 },
    ],
  },
};

/**
 * Datos demo simplificados para otros municipios de Antioquia
 * Se usan como fallback cuando la API no retorna datos
 */
export function generateDemoDataForMunicipality(
  codigo: string,
  nombre: string,
  categoria: number,
  poblacion: number
): Partial<MunicipalityFullData> {
  // Escalar valores según categoría y población
  const categoriaFactor = Math.max(0.3, 1 - (categoria * 0.12));
  const poblacionFactor = Math.min(1, poblacion / 100000);

  const baseIDF = 45 + (categoriaFactor * 35);
  const baseNBI = 25 - (categoriaFactor * 15);

  return {
    codigo_dane: codigo,
    nombre,
    categoria,
    poblacion,
    terridata: {
      nbi: Math.max(5, baseNBI + (Math.random() * 10 - 5)),
      cobertura_educacion: Math.min(98, 70 + (categoriaFactor * 25)),
      afiliacion_salud: Math.min(99, 85 + (categoriaFactor * 12)),
      ipm: Math.max(8, baseNBI * 1.3 + (Math.random() * 5)),
      tasa_desempleo: Math.max(5, 12 - (categoriaFactor * 5)),
      cobertura_acueducto: Math.min(98, 60 + (categoriaFactor * 35)),
      cobertura_alcantarillado: Math.min(95, 50 + (categoriaFactor * 40)),
      año: 2023,
    },
    fiscal: {
      idf: Math.min(85, baseIDF + (Math.random() * 10 - 5)),
      vigencia: 2023,
      ingresos_totales: poblacion * 2_500_000 * categoriaFactor,
      gastos_totales: poblacion * 2_300_000 * categoriaFactor,
      recaudo_predial: poblacion * 450_000 * categoriaFactor,
      recaudo_ica: poblacion * 280_000 * categoriaFactor * poblacionFactor,
      ejecucion_gastos: 75 + (categoriaFactor * 20),
      dependencia_transferencias: Math.max(15, 70 - (categoriaFactor * 45)),
      capacidad_ahorro: 5 + (categoriaFactor * 15),
      magnitud_deuda: Math.max(0, 15 - (categoriaFactor * 10)),
    },
    contracts: {
      total_count: Math.round(20 + (poblacion / 5000) * categoriaFactor),
      total_value: poblacion * 800_000 * categoriaFactor,
      active: Math.round(5 + (poblacion / 15000)),
      by_type: {
        obra: Math.round(8 + (poblacion / 20000)),
        prestacion_servicios: Math.round(15 + (poblacion / 8000)),
        suministro: Math.round(5 + (poblacion / 25000)),
        consultoria: Math.round(3 + (poblacion / 40000)),
        otros: Math.round(4 + (poblacion / 30000)),
      },
      top_sectores: [
        { sector: "Infraestructura", count: 8, value: poblacion * 250_000 },
        { sector: "Educación", count: 6, value: poblacion * 150_000 },
        { sector: "Salud", count: 5, value: poblacion * 120_000 },
      ],
    },
  };
}

export default RIONEGRO_DEMO_DATA;
