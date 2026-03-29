/**
 * Promedios departamentales de Antioquia para comparación
 * Fuentes: TerriData 2023, DNP, DANE
 */

export interface DepartmentAverages {
  // Indicadores sociales (TerriData)
  nbi: number;                    // Promedio NBI departamental
  cobertura_educacion: number;    // Promedio cobertura educación
  afiliacion_salud: number;       // Promedio afiliación salud
  ipm: number;                    // Promedio IPM
  tasa_desempleo: number;         // Promedio desempleo
  cobertura_acueducto: number;    // Promedio cobertura acueducto
  cobertura_alcantarillado: number;
  cobertura_energia: number;      // Promedio cobertura energía
  cobertura_internet: number;     // Promedio cobertura internet

  // Indicadores fiscales (DNP/FUT)
  idf: number;                    // Promedio IDF departamental
  ejecucion_gastos: number;       // Promedio ejecución
  dependencia_transferencias: number;
  capacidad_ahorro: number;

  // Metadatos
  año: number;
  municipios_analizados: number;
}

/**
 * Promedios de Antioquia 2023
 * Calculados sobre los 125 municipios del departamento
 */
export const ANTIOQUIA_AVERAGES: DepartmentAverages = {
  // Indicadores sociales
  nbi: 15.3,
  cobertura_educacion: 82.6,
  afiliacion_salud: 94.2,
  ipm: 18.7,
  tasa_desempleo: 10.2,
  cobertura_acueducto: 78.4,
  cobertura_alcantarillado: 68.9,
  cobertura_energia: 91.2,
  cobertura_internet: 42.6,

  // Indicadores fiscales
  idf: 68.4,
  ejecucion_gastos: 86.2,
  dependencia_transferencias: 52.8,
  capacidad_ahorro: 12.4,

  // Metadatos
  año: 2023,
  municipios_analizados: 125,
};

/**
 * Rankings de percentiles para contextualizar indicadores
 * Un municipio en el percentil 80 está mejor que el 80% de municipios
 */
export interface PercentileThresholds {
  p25: number;  // Percentil 25
  p50: number;  // Mediana
  p75: number;  // Percentil 75
  p90: number;  // Percentil 90
}

export const IDF_PERCENTILES: PercentileThresholds = {
  p25: 55.2,
  p50: 65.8,
  p75: 74.3,
  p90: 79.6,
};

export const NBI_PERCENTILES: PercentileThresholds = {
  p25: 8.4,   // Mejor (menor NBI)
  p50: 14.2,
  p75: 22.8,
  p90: 35.6,  // Peor (mayor NBI)
};

export const EJECUCION_PERCENTILES: PercentileThresholds = {
  p25: 78.4,
  p50: 85.2,
  p75: 91.8,
  p90: 96.2,
};

/**
 * Calcula el ranking departamental de un municipio dado un valor e indicador
 * @returns Posición estimada de 1 a 125 (1 = mejor)
 */
export function calculateDepartmentRanking(
  value: number,
  indicator: "idf" | "nbi" | "ejecucion"
): number {
  const thresholds =
    indicator === "idf"
      ? IDF_PERCENTILES
      : indicator === "nbi"
        ? NBI_PERCENTILES
        : EJECUCION_PERCENTILES;

  // Para NBI menor es mejor, para otros mayor es mejor
  const isLowerBetter = indicator === "nbi";

  let percentile: number;

  if (isLowerBetter) {
    // NBI: menor valor = mejor ranking
    if (value <= thresholds.p25) percentile = 90;
    else if (value <= thresholds.p50) percentile = 70;
    else if (value <= thresholds.p75) percentile = 40;
    else if (value <= thresholds.p90) percentile = 15;
    else percentile = 5;
  } else {
    // IDF/Ejecución: mayor valor = mejor ranking
    if (value >= thresholds.p90) percentile = 95;
    else if (value >= thresholds.p75) percentile = 80;
    else if (value >= thresholds.p50) percentile = 55;
    else if (value >= thresholds.p25) percentile = 30;
    else percentile = 10;
  }

  // Convertir percentil a ranking (1-125)
  return Math.round(125 * (1 - percentile / 100));
}

/**
 * Obtiene el color de semáforo según el valor y el indicador
 */
export function getIndicatorStatus(
  value: number,
  indicator: "idf" | "nbi" | "ejecucion" | "cobertura"
): "green" | "yellow" | "red" {
  switch (indicator) {
    case "idf":
      if (value >= 75) return "green";
      if (value >= 60) return "yellow";
      return "red";

    case "nbi":
      if (value <= 10) return "green";
      if (value <= 20) return "yellow";
      return "red";

    case "ejecucion":
      if (value >= 90) return "green";
      if (value >= 75) return "yellow";
      return "red";

    case "cobertura":
      if (value >= 90) return "green";
      if (value >= 70) return "yellow";
      return "red";

    default:
      return "yellow";
  }
}

/**
 * Compara un valor municipal contra el promedio departamental
 * @returns Objeto con diferencia porcentual y si es favorable
 */
export function compareToAverage(
  municipalValue: number,
  indicator: keyof Omit<DepartmentAverages, "año" | "municipios_analizados">
): { difference: number; isBetter: boolean; percentDiff: number } {
  const avgValue = ANTIOQUIA_AVERAGES[indicator];
  const difference = municipalValue - avgValue;

  // Para NBI/IPM/desempleo/dependencia menor es mejor
  const lowerIsBetter = ["nbi", "ipm", "tasa_desempleo", "dependencia_transferencias"].includes(
    indicator
  );

  const isBetter = lowerIsBetter ? difference < 0 : difference > 0;
  const percentDiff = ((municipalValue - avgValue) / avgValue) * 100;

  return {
    difference,
    isBetter,
    percentDiff: Math.round(percentDiff * 10) / 10,
  };
}

export default ANTIOQUIA_AVERAGES;
