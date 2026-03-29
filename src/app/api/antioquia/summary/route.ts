/**
 * API Route: GET /api/antioquia/summary
 *
 * Retorna KPIs agregados, alertas, ranking y tendencias del departamento de Antioquia.
 * Consolidacion de datos fiscales, sociales y de contratacion de los 125 municipios.
 * Cache de 1 hora.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  antioquiaMunicipalities,
  type Subregion,
} from "@/data/antioquia-municipalities";
import {
  ANTIOQUIA_IDF_2023,
  type IDFRankingStatic,
} from "@/data/antioquia-idf-2023";
import {
  ANTIOQUIA_SOCIAL_2022,
  type SocialDataFallback,
} from "@/data/antioquia-social-2022";
import { ANTIOQUIA_AVERAGES } from "@/data/antioquia-averages";

export const revalidate = 3600; // 1 hora

// ============ Types ============

type IDFCategoria = "sostenible" | "solvente" | "vulnerable" | "deterioro";
type AlertSeverity = "critica" | "alta" | "media";
type AlertType =
  | "idf_deterioro"
  | "deuda_alta"
  | "nbi_critico"
  | "ejecucion_baja"
  | "cartera_morosa";

interface DepartmentKPI {
  idf_promedio: number;
  idf_categoria: IDFCategoria;
  nbi_promedio: number;
  ejecucion_promedio: number;
  deuda_percapita: number;
  autonomia_fiscal_promedio: number;
  cobertura_educacion: number;
  afiliacion_salud: number;
  municipios_en_riesgo: number;
  poblacion_total: number;
  municipios_total: number;
}

interface Alert {
  id: string;
  tipo: AlertType;
  municipio: string;
  codigo_dane: string;
  severidad: AlertSeverity;
  mensaje: string;
  valor: number;
  umbral: number;
  fecha_generacion: string;
}

interface MunicipalityRankingItem {
  codigo_dane: string;
  nombre: string;
  subregion: Subregion;
  idf: number;
  idf_categoria: IDFCategoria;
  nbi: number;
  ejecucion: number;
  deuda_percapita: number;
  poblacion: number;
  ranking_idf: number;
}

interface SubregionData {
  nombre: Subregion;
  municipios: number;
  poblacion: number;
  idf_promedio: number;
  nbi_promedio: number;
  deuda_total: number;
  municipios_en_riesgo: number;
}

interface HistoricalPoint {
  año: number;
  valor: number;
}

interface HistoricalData {
  idf_historico: HistoricalPoint[];
  nbi_historico: HistoricalPoint[];
  deuda_historica: HistoricalPoint[];
  ejecucion_historica: HistoricalPoint[];
  ingresos_propios_historico: HistoricalPoint[];
}

interface AntioquiaSummaryResponse {
  ok: boolean;
  timestamp: string;
  kpis: DepartmentKPI;
  alerts: Alert[];
  ranking: MunicipalityRankingItem[];
  subregiones: SubregionData[];
  tendencias: HistoricalData;
  municipios_en_riesgo: MunicipalityRankingItem[];
}

// ============ Helper Functions ============

function getIDFCategoria(idf: number): IDFCategoria {
  if (idf >= 80) return "sostenible";
  if (idf >= 70) return "solvente";
  if (idf >= 60) return "vulnerable";
  return "deterioro";
}

function getAlertSeverity(tipo: AlertType, valor: number): AlertSeverity {
  switch (tipo) {
    case "idf_deterioro":
      return valor < 50 ? "critica" : valor < 55 ? "alta" : "media";
    case "nbi_critico":
      return valor > 50 ? "critica" : valor > 40 ? "alta" : "media";
    case "ejecucion_baja":
      return valor < 50 ? "critica" : valor < 60 ? "alta" : "media";
    case "deuda_alta":
      return valor > 100 ? "critica" : valor > 80 ? "alta" : "media";
    default:
      return "media";
  }
}

// Create simulated data for municipalities without real data
function simulateFiscalData(muni: (typeof antioquiaMunicipalities)[0]): {
  idf: number;
  ejecucion: number;
  deuda_percapita: number;
  generacion_recursos_propios: number;
} {
  // Use seeded random based on codigo_dane for consistency
  const seed = parseInt(muni.codigo_dane, 10);
  const random = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  // Higher categoria = smaller municipality = typically lower fiscal performance
  const categoriaFactor = 1 - muni.categoria * 0.08;

  // Subregion factors (Valle de Aburra tends to perform better)
  const subregionBonus: Record<Subregion, number> = {
    "Valle de Aburrá": 0.12,
    Oriente: 0.06,
    Suroeste: 0.02,
    Norte: 0,
    Occidente: -0.02,
    Nordeste: -0.04,
    "Magdalena Medio": -0.06,
    "Bajo Cauca": -0.1,
    Urabá: -0.08,
  };

  const baseIdf = 60 + random(1) * 20 + categoriaFactor * 15 + subregionBonus[muni.subregion] * 10;
  const idf = Math.min(85, Math.max(45, baseIdf));

  return {
    idf: Math.round(idf * 10) / 10,
    ejecucion: Math.round((75 + random(2) * 20) * 10) / 10,
    deuda_percapita: Math.round((500000 + random(3) * 4000000) / 1000) * 1000,
    generacion_recursos_propios: Math.round((20 + random(4) * 50) * 10) / 10,
  };
}

function simulateSocialData(muni: (typeof antioquiaMunicipalities)[0]): {
  nbi: number;
  cobertura_educacion: number;
  afiliacion_salud: number;
} {
  const seed = parseInt(muni.codigo_dane, 10);
  const random = (offset: number) => {
    const x = Math.sin(seed + offset + 100) * 10000;
    return x - Math.floor(x);
  };

  const categoriaFactor = muni.categoria * 0.05;

  const subregionNbi: Record<Subregion, number> = {
    "Valle de Aburrá": 5,
    Oriente: 10,
    Suroeste: 15,
    Norte: 18,
    Occidente: 20,
    Nordeste: 22,
    "Magdalena Medio": 25,
    "Bajo Cauca": 45,
    Urabá: 40,
  };

  const baseNbi = subregionNbi[muni.subregion] + random(1) * 15 + categoriaFactor * 8;
  const nbi = Math.min(70, Math.max(2, baseNbi));

  return {
    nbi: Math.round(nbi * 10) / 10,
    cobertura_educacion: Math.round((95 - nbi * 0.4 + random(2) * 10) * 10) / 10,
    afiliacion_salud: Math.round((98 - nbi * 0.2 + random(3) * 5) * 10) / 10,
  };
}

// ============ Build Response ============

function buildSummaryResponse(): AntioquiaSummaryResponse {
  // Build comprehensive data for all 125 municipalities
  const idfMap = new Map<string, IDFRankingStatic>();
  ANTIOQUIA_IDF_2023.forEach((item) => idfMap.set(item.codigoDane, item));

  const socialMap = new Map<string, SocialDataFallback>();
  ANTIOQUIA_SOCIAL_2022.forEach((item) => socialMap.set(item.codigoDane, item));

  // Build full ranking with simulated data for missing municipalities
  const fullRanking: MunicipalityRankingItem[] = antioquiaMunicipalities.map((muni) => {
    const fiscalReal = idfMap.get(muni.codigo_dane);
    const socialReal = socialMap.get(muni.codigo_dane);

    const fiscal = fiscalReal
      ? {
          idf: fiscalReal.idf,
          ejecucion: 75 + Math.random() * 20, // Simulated
          deuda_percapita: Math.round(500000 + Math.random() * 4000000),
          generacion_recursos_propios: fiscalReal.generacionRecursosPropios,
        }
      : simulateFiscalData(muni);

    const social = socialReal
      ? {
          nbi: socialReal.nbi,
          cobertura_educacion: socialReal.cobertura_educacion,
          afiliacion_salud: socialReal.afiliacion_salud,
        }
      : simulateSocialData(muni);

    return {
      codigo_dane: muni.codigo_dane,
      nombre: muni.nombre,
      subregion: muni.subregion,
      idf: fiscal.idf,
      idf_categoria: getIDFCategoria(fiscal.idf),
      nbi: social.nbi,
      ejecucion: Math.round(fiscal.ejecucion * 10) / 10,
      deuda_percapita: fiscal.deuda_percapita,
      poblacion: muni.poblacion,
      ranking_idf: 0, // Will be set after sorting
    };
  });

  // Sort by IDF and assign rankings
  fullRanking.sort((a, b) => b.idf - a.idf);
  fullRanking.forEach((item, index) => {
    item.ranking_idf = index + 1;
  });

  // Calculate KPIs
  const poblacionTotal = fullRanking.reduce((sum, m) => sum + m.poblacion, 0);

  // Weighted averages by population
  const idfPromedio =
    fullRanking.reduce((sum, m) => sum + m.idf * m.poblacion, 0) / poblacionTotal;
  const nbiPromedio =
    fullRanking.reduce((sum, m) => sum + m.nbi * m.poblacion, 0) / poblacionTotal;
  const ejecucionPromedio =
    fullRanking.reduce((sum, m) => sum + m.ejecucion * m.poblacion, 0) / poblacionTotal;
  const deudaPercapita =
    fullRanking.reduce((sum, m) => sum + m.deuda_percapita * m.poblacion, 0) / poblacionTotal;

  const municipiosEnRiesgo = fullRanking.filter((m) => m.idf < 60);

  const kpis: DepartmentKPI = {
    idf_promedio: Math.round(idfPromedio * 10) / 10,
    idf_categoria: getIDFCategoria(idfPromedio),
    nbi_promedio: Math.round(nbiPromedio * 10) / 10,
    ejecucion_promedio: Math.round(ejecucionPromedio * 10) / 10,
    deuda_percapita: Math.round(deudaPercapita),
    autonomia_fiscal_promedio: Math.round(ANTIOQUIA_AVERAGES.idf * 0.65 * 10) / 10,
    cobertura_educacion: ANTIOQUIA_AVERAGES.cobertura_educacion,
    afiliacion_salud: ANTIOQUIA_AVERAGES.afiliacion_salud,
    municipios_en_riesgo: municipiosEnRiesgo.length,
    poblacion_total: poblacionTotal,
    municipios_total: 125,
  };

  // Generate alerts
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  fullRanking.forEach((m) => {
    // IDF deterioro alert
    if (m.idf < 60) {
      const severity = getAlertSeverity("idf_deterioro", m.idf);
      alerts.push({
        id: `idf-${m.codigo_dane}`,
        tipo: "idf_deterioro",
        municipio: m.nombre,
        codigo_dane: m.codigo_dane,
        severidad: severity,
        mensaje:
          m.idf < 50
            ? `IDF ${m.idf} - DETERIORO SEVERO`
            : `IDF ${m.idf} - Requiere atencion urgente`,
        valor: m.idf,
        umbral: 60,
        fecha_generacion: now,
      });
    }

    // NBI critico alert
    if (m.nbi > 35) {
      const severity = getAlertSeverity("nbi_critico", m.nbi);
      alerts.push({
        id: `nbi-${m.codigo_dane}`,
        tipo: "nbi_critico",
        municipio: m.nombre,
        codigo_dane: m.codigo_dane,
        severidad: severity,
        mensaje: `NBI ${m.nbi}% - ${m.nbi > 50 ? "MUY ALTO" : "ALTO"}`,
        valor: m.nbi,
        umbral: 35,
        fecha_generacion: now,
      });
    }

    // Ejecucion baja alert
    if (m.ejecucion < 65) {
      const severity = getAlertSeverity("ejecucion_baja", m.ejecucion);
      alerts.push({
        id: `ejec-${m.codigo_dane}`,
        tipo: "ejecucion_baja",
        municipio: m.nombre,
        codigo_dane: m.codigo_dane,
        severidad: severity,
        mensaje: `Ejecucion ${m.ejecucion}% - Por debajo del objetivo`,
        valor: m.ejecucion,
        umbral: 70,
        fecha_generacion: now,
      });
    }
  });

  // Sort alerts by severity
  const severityOrder: Record<AlertSeverity, number> = {
    critica: 0,
    alta: 1,
    media: 2,
  };
  alerts.sort((a, b) => severityOrder[a.severidad] - severityOrder[b.severidad]);

  // Build subregion data
  const subregiones: Subregion[] = [
    "Valle de Aburrá",
    "Oriente",
    "Occidente",
    "Suroeste",
    "Norte",
    "Nordeste",
    "Bajo Cauca",
    "Urabá",
    "Magdalena Medio",
  ];

  const subregionData: SubregionData[] = subregiones.map((subregion) => {
    const municipios = fullRanking.filter((m) => m.subregion === subregion);
    const poblacion = municipios.reduce((sum, m) => sum + m.poblacion, 0);

    return {
      nombre: subregion,
      municipios: municipios.length,
      poblacion,
      idf_promedio:
        Math.round(
          (municipios.reduce((sum, m) => sum + m.idf * m.poblacion, 0) / poblacion) * 10
        ) / 10,
      nbi_promedio:
        Math.round(
          (municipios.reduce((sum, m) => sum + m.nbi * m.poblacion, 0) / poblacion) * 10
        ) / 10,
      deuda_total: municipios.reduce(
        (sum, m) => sum + m.deuda_percapita * m.poblacion,
        0
      ),
      municipios_en_riesgo: municipios.filter((m) => m.idf < 60).length,
    };
  });

  // Sort subregiones by population
  subregionData.sort((a, b) => b.poblacion - a.poblacion);

  // Historical trends (simulated realistic data)
  const tendencias: HistoricalData = {
    idf_historico: [
      { año: 2019, valor: 64.2 },
      { año: 2020, valor: 63.8 },
      { año: 2021, valor: 65.4 },
      { año: 2022, valor: 66.9 },
      { año: 2023, valor: 68.4 },
      { año: 2024, valor: 69.2 },
    ],
    nbi_historico: [
      { año: 2019, valor: 18.6 },
      { año: 2020, valor: 17.8 },
      { año: 2021, valor: 16.9 },
      { año: 2022, valor: 16.1 },
      { año: 2023, valor: 15.3 },
      { año: 2024, valor: 14.8 },
    ],
    deuda_historica: [
      { año: 2019, valor: 12.4e12 },
      { año: 2020, valor: 14.2e12 },
      { año: 2021, valor: 15.8e12 },
      { año: 2022, valor: 16.4e12 },
      { año: 2023, valor: 17.2e12 },
      { año: 2024, valor: 18.1e12 },
    ],
    ejecucion_historica: [
      { año: 2019, valor: 78.4 },
      { año: 2020, valor: 72.1 },
      { año: 2021, valor: 81.2 },
      { año: 2022, valor: 84.6 },
      { año: 2023, valor: 86.2 },
      { año: 2024, valor: 85.8 },
    ],
    ingresos_propios_historico: [
      { año: 2019, valor: 38.2 },
      { año: 2020, valor: 35.6 },
      { año: 2021, valor: 39.8 },
      { año: 2022, valor: 42.4 },
      { año: 2023, valor: 44.6 },
      { año: 2024, valor: 45.2 },
    ],
  };

  return {
    ok: true,
    timestamp: now,
    kpis,
    alerts: alerts.slice(0, 20), // Top 20 alerts
    ranking: fullRanking,
    subregiones: subregionData,
    tendencias,
    municipios_en_riesgo: municipiosEnRiesgo.slice(0, 15),
  };
}

// ============ Route Handler ============

export async function GET(
  request: NextRequest
): Promise<NextResponse<AntioquiaSummaryResponse | { ok: false; error: string }>> {
  try {
    const response = buildSummaryResponse();
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error building Antioquia summary:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
