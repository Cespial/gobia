import { NextRequest, NextResponse } from "next/server";
import { municipalitiesByCode } from "@/data/antioquia-municipalities";
import {
  RIONEGRO_DEMO_DATA,
  generateDemoDataForMunicipality,
  type TerriDataIndicators,
  type FiscalData,
  type ContractSummary,
} from "@/data/demo-rionegro";
import { ANTIOQUIA_AVERAGES, calculateDepartmentRanking } from "@/data/antioquia-averages";

export const revalidate = 3600; // 1 hour cache

interface MunicipalityAPIResponse {
  ok: boolean;
  profile: {
    codigo_dane: string;
    nombre: string;
    departamento: string;
    subregion: string;
    categoria: number;
    poblacion: number;
    area_km2: number;
  };
  terridata: TerriDataIndicators;
  fiscal: FiscalData;
  contracts: ContractSummary;
  comparison: {
    idf_vs_avg: number;
    nbi_vs_avg: number;
    ranking_idf: number;
    ranking_nbi: number;
  };
}

/**
 * GET /api/municipality/[code]
 *
 * Retorna datos consolidados de un municipio específico
 * Combina: perfil estático + TerriData + MDM/IDF + SECOP
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Validar código DANE
  const municipality = municipalitiesByCode.get(code);
  if (!municipality) {
    return NextResponse.json(
      { ok: false, error: `Municipio con código ${code} no encontrado` },
      { status: 404 }
    );
  }

  // Si es Rionegro, usar datos demo detallados
  if (code === "05615") {
    const data = RIONEGRO_DEMO_DATA;
    const response: MunicipalityAPIResponse = {
      ok: true,
      profile: {
        codigo_dane: data.codigo_dane,
        nombre: data.nombre,
        departamento: data.departamento,
        subregion: data.subregion,
        categoria: data.categoria,
        poblacion: data.poblacion,
        area_km2: data.area_km2,
      },
      terridata: data.terridata,
      fiscal: data.fiscal,
      contracts: data.contracts,
      comparison: {
        idf_vs_avg: Math.round((data.fiscal.idf - ANTIOQUIA_AVERAGES.idf) * 10) / 10,
        nbi_vs_avg: Math.round((data.terridata.nbi - ANTIOQUIA_AVERAGES.nbi) * 10) / 10,
        ranking_idf: calculateDepartmentRanking(data.fiscal.idf, "idf"),
        ranking_nbi: calculateDepartmentRanking(data.terridata.nbi, "nbi"),
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  }

  // Para otros municipios, intentar cargar datos de APIs externas
  try {
    const [terridataResult, fiscalResult, contractsResult] = await Promise.allSettled([
      fetchTerriData(code),
      fetchFiscalData(code),
      fetchContractsData(code),
    ]);

    // Extraer datos o usar fallbacks
    const terridata =
      terridataResult.status === "fulfilled" && terridataResult.value
        ? terridataResult.value
        : generateFallbackTerriData(municipality.categoria);

    const fiscal =
      fiscalResult.status === "fulfilled" && fiscalResult.value
        ? fiscalResult.value
        : generateFallbackFiscalData(municipality.categoria, municipality.poblacion);

    const contracts =
      contractsResult.status === "fulfilled" && contractsResult.value
        ? contractsResult.value
        : generateFallbackContracts(municipality.poblacion);

    const response: MunicipalityAPIResponse = {
      ok: true,
      profile: {
        codigo_dane: municipality.codigo_dane,
        nombre: municipality.nombre,
        departamento: municipality.departamento,
        subregion: municipality.subregion,
        categoria: municipality.categoria,
        poblacion: municipality.poblacion,
        area_km2: municipality.area_km2,
      },
      terridata,
      fiscal,
      contracts,
      comparison: {
        idf_vs_avg: Math.round((fiscal.idf - ANTIOQUIA_AVERAGES.idf) * 10) / 10,
        nbi_vs_avg: Math.round((terridata.nbi - ANTIOQUIA_AVERAGES.nbi) * 10) / 10,
        ranking_idf: calculateDepartmentRanking(fiscal.idf, "idf"),
        ranking_nbi: calculateDepartmentRanking(terridata.nbi, "nbi"),
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error(`Error fetching data for municipality ${code}:`, error);

    // Fallback completo con datos generados
    const demoData = generateDemoDataForMunicipality(
      code,
      municipality.nombre,
      municipality.categoria,
      municipality.poblacion
    );

    const response: MunicipalityAPIResponse = {
      ok: true,
      profile: {
        codigo_dane: municipality.codigo_dane,
        nombre: municipality.nombre,
        departamento: municipality.departamento,
        subregion: municipality.subregion,
        categoria: municipality.categoria,
        poblacion: municipality.poblacion,
        area_km2: municipality.area_km2,
      },
      terridata: demoData.terridata!,
      fiscal: demoData.fiscal!,
      contracts: demoData.contracts!,
      comparison: {
        idf_vs_avg: Math.round((demoData.fiscal!.idf - ANTIOQUIA_AVERAGES.idf) * 10) / 10,
        nbi_vs_avg: Math.round((demoData.terridata!.nbi - ANTIOQUIA_AVERAGES.nbi) * 10) / 10,
        ranking_idf: calculateDepartmentRanking(demoData.fiscal!.idf, "idf"),
        ranking_nbi: calculateDepartmentRanking(demoData.terridata!.nbi, "nbi"),
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=1800",
      },
    });
  }
}

/**
 * Fetch TerriData indicators from datos.gov.co
 */
async function fetchTerriData(codigoDane: string): Promise<TerriDataIndicators | null> {
  try {
    const url = `https://www.datos.gov.co/resource/64cq-xb2k.json?$where=codigo_divipola='${codigoDane}'&$limit=50`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // 24h cache
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    // TerriData tiene múltiples registros por indicador
    // Aquí procesaríamos los datos reales
    // Por ahora retornamos null para usar fallback
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch fiscal data (IDF) from datos.gov.co MDM
 */
async function fetchFiscalData(codigoDane: string): Promise<FiscalData | null> {
  try {
    const url = `https://www.datos.gov.co/resource/nkjx-rsq7.json?$where=divipola='${codigoDane}'&$limit=10&$order=vigencia DESC`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    // Procesar datos del MDM
    // Por ahora retornamos null
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch contracts summary from SECOP II
 */
async function fetchContractsData(codigoDane: string): Promise<ContractSummary | null> {
  try {
    const url = `https://www.datos.gov.co/resource/jbjy-vk9h.json?$where=codigo_entidad='${codigoDane}'&$limit=100`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    // Agregar datos de contratos
    // Por ahora retornamos null
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate fallback TerriData based on category
 */
function generateFallbackTerriData(categoria: number): TerriDataIndicators {
  const factor = Math.max(0.3, 1 - categoria * 0.12);
  const baseNBI = 25 - factor * 15;

  return {
    nbi: Math.round((baseNBI + Math.random() * 8 - 4) * 10) / 10,
    cobertura_educacion: Math.round((70 + factor * 25) * 10) / 10,
    afiliacion_salud: Math.round((85 + factor * 12) * 10) / 10,
    ipm: Math.round((baseNBI * 1.3 + Math.random() * 5) * 10) / 10,
    tasa_desempleo: Math.round((12 - factor * 5 + Math.random() * 2) * 10) / 10,
    cobertura_acueducto: Math.round((60 + factor * 35) * 10) / 10,
    cobertura_alcantarillado: Math.round((50 + factor * 40) * 10) / 10,
    año: 2023,
  };
}

/**
 * Generate fallback fiscal data
 */
function generateFallbackFiscalData(categoria: number, poblacion: number): FiscalData {
  const factor = Math.max(0.3, 1 - categoria * 0.12);
  const baseIDF = 45 + factor * 35;

  return {
    idf: Math.round((baseIDF + Math.random() * 8 - 4) * 10) / 10,
    vigencia: 2023,
    ingresos_totales: Math.round(poblacion * 2_500_000 * factor),
    gastos_totales: Math.round(poblacion * 2_300_000 * factor),
    recaudo_predial: Math.round(poblacion * 450_000 * factor),
    recaudo_ica: Math.round(poblacion * 280_000 * factor * Math.min(1, poblacion / 100000)),
    ejecucion_gastos: Math.round((75 + factor * 20) * 10) / 10,
    dependencia_transferencias: Math.round((70 - factor * 45) * 10) / 10,
    capacidad_ahorro: Math.round((5 + factor * 15) * 10) / 10,
    magnitud_deuda: Math.round((15 - factor * 10) * 10) / 10,
  };
}

/**
 * Generate fallback contracts data
 */
function generateFallbackContracts(poblacion: number): ContractSummary {
  const base = Math.round(20 + poblacion / 5000);

  return {
    total_count: base,
    total_value: Math.round(poblacion * 800_000),
    active: Math.round(base * 0.15),
    by_type: {
      obra: Math.round(base * 0.15),
      prestacion_servicios: Math.round(base * 0.55),
      suministro: Math.round(base * 0.12),
      consultoria: Math.round(base * 0.08),
      otros: Math.round(base * 0.1),
    },
    top_sectores: [
      { sector: "Infraestructura", count: Math.round(base * 0.2), value: poblacion * 250_000 },
      { sector: "Educación", count: Math.round(base * 0.15), value: poblacion * 150_000 },
      { sector: "Salud", count: Math.round(base * 0.12), value: poblacion * 120_000 },
    ],
  };
}
