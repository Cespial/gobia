/**
 * API Route: GET /api/social/antioquia
 *
 * Retorna indicadores sociales de los municipios de Antioquia.
 * Usa TerriData (64cq-xb2k) filtrado por departamento Antioquia.
 * Cache de 24h. Si la API falla, retorna datos de fallback.
 *
 * Query params:
 * - dimension: "educacion" | "salud" | "servicios" | "nbi" | "ipm" (default: "nbi")
 * - vigencia: año (default: 2022)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAntioquiaSocialRanking,
  type SocialRanking,
  type TerriDataDimension,
} from "@/lib/terridata-client";
import {
  ANTIOQUIA_SOCIAL_2022,
  ANTIOQUIA_SOCIAL_AVERAGES,
  type SocialDataFallback,
} from "@/data/antioquia-social-2022";

export const revalidate = 86400; // 24 hours

type SocialDimensionShort = "educacion" | "salud" | "servicios" | "nbi" | "ipm" | "internet";

interface AntioquiaSocialResponse {
  success: boolean;
  vigencia: number;
  dimension: string;
  total: number;
  source: "api" | "fallback";
  data: SocialRanking[];
  averages: {
    valor: number;
    minValor: number;
    maxValor: number;
  };
}

const DIMENSION_MAP: Record<SocialDimensionShort, TerriDataDimension> = {
  educacion: "Educación",
  salud: "Salud",
  servicios: "Servicios Públicos",
  nbi: "Pobreza y Desigualdad",
  ipm: "Pobreza y Desigualdad",
  internet: "Servicios Públicos",
};

const INDICATOR_FIELD_MAP: Record<SocialDimensionShort, keyof SocialDataFallback> = {
  educacion: "cobertura_educacion",
  salud: "afiliacion_salud",
  servicios: "cobertura_acueducto",
  nbi: "nbi",
  ipm: "ipm",
  internet: "cobertura_internet",
};

function fallbackToRanking(
  data: SocialDataFallback[],
  dimension: SocialDimensionShort
): SocialRanking[] {
  const field = INDICATOR_FIELD_MAP[dimension];
  const lowerIsBetter = dimension === "nbi" || dimension === "ipm";

  const rankings = data.map((m) => ({
    codigoDane: m.codigoDane,
    nombre: m.municipio,
    valor: m[field] as number,
    ranking: 0,
    dimension: DIMENSION_MAP[dimension],
    indicador: dimension,
  }));

  rankings.sort((a, b) =>
    lowerIsBetter ? a.valor - b.valor : b.valor - a.valor
  );

  return rankings.map((r, idx) => ({
    ...r,
    ranking: idx + 1,
  }));
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<AntioquiaSocialResponse>> {
  const { searchParams } = new URL(request.url);
  const dimensionParam = (searchParams.get("dimension") || "nbi") as SocialDimensionShort;
  const vigencia = parseInt(searchParams.get("vigencia") || "2022", 10);

  const dimension = DIMENSION_MAP[dimensionParam] || "Pobreza y Desigualdad";

  try {
    // Try to fetch from datos.gov.co
    const rankings = await getAntioquiaSocialRanking(dimension, vigencia);

    if (rankings.length > 0) {
      // Calculate averages
      const values = rankings.map((r) => r.valor);
      const avgValor =
        Math.round((values.reduce((a, b) => a + b, 0) / rankings.length) * 10) / 10;

      return NextResponse.json({
        success: true,
        vigencia,
        dimension: dimensionParam,
        total: rankings.length,
        source: "api",
        data: rankings,
        averages: {
          valor: avgValor,
          minValor: Math.min(...values),
          maxValor: Math.max(...values),
        },
      });
    }

    // No data from API, use fallback
    throw new Error("No data returned from TerriData API");
  } catch (error) {
    console.warn(
      "Falling back to static social data:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Use static fallback data
    const fallbackData = fallbackToRanking(ANTIOQUIA_SOCIAL_2022, dimensionParam);
    const values = fallbackData.map((r) => r.valor);

    // Get average from our static averages
    const avgField = INDICATOR_FIELD_MAP[dimensionParam];
    const avgValor = (ANTIOQUIA_SOCIAL_AVERAGES as Record<string, number>)[avgField] ??
      (values.reduce((a, b) => a + b, 0) / values.length);

    return NextResponse.json({
      success: true,
      vigencia: 2022, // Fallback is always 2022
      dimension: dimensionParam,
      total: fallbackData.length,
      source: "fallback",
      data: fallbackData,
      averages: {
        valor: avgValor,
        minValor: Math.min(...values),
        maxValor: Math.max(...values),
      },
    });
  }
}
