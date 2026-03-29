/**
 * API Route: GET /api/fiscal/antioquia
 *
 * Retorna IDF y datos fiscales de los 125 municipios de Antioquia.
 * Usa el dataset MDM (nkjx-rsq7) filtrado por departamento Antioquia.
 * Cache de 24h. Si la API falla, retorna datos de fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAntioquiaIDFRanking, type IDFRanking } from "@/lib/fut-client";
import {
  ANTIOQUIA_IDF_2023,
  type IDFRankingStatic,
} from "@/data/antioquia-idf-2023";

export const revalidate = 86400; // 24 hours

interface AntioquiaFiscalResponse {
  success: boolean;
  vigencia: number;
  total: number;
  source: "api" | "fallback";
  data: IDFRanking[];
  averages: {
    idf: number;
    minIdf: number;
    maxIdf: number;
  };
}

function staticToIDFRanking(item: IDFRankingStatic): IDFRanking {
  return {
    codigoDane: item.codigoDane,
    nombre: item.nombre,
    idf: item.idf,
    categoria: item.categoria,
    ranking: item.ranking,
  };
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<AntioquiaFiscalResponse>> {
  const { searchParams } = new URL(request.url);
  const vigencia = parseInt(searchParams.get("vigencia") || "2023", 10);

  try {
    // Try to fetch from datos.gov.co
    const rankings = await getAntioquiaIDFRanking(vigencia);

    if (rankings.length > 0) {
      // Calculate averages
      const idfValues = rankings.map((r) => r.idf);
      const avgIdf =
        Math.round((idfValues.reduce((a, b) => a + b, 0) / rankings.length) * 10) /
        10;
      const minIdf = Math.min(...idfValues);
      const maxIdf = Math.max(...idfValues);

      return NextResponse.json({
        success: true,
        vigencia,
        total: rankings.length,
        source: "api",
        data: rankings,
        averages: {
          idf: avgIdf,
          minIdf,
          maxIdf,
        },
      });
    }

    // No data from API, use fallback
    throw new Error("No data returned from API");
  } catch (error) {
    console.warn(
      "Falling back to static IDF data:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Use static fallback data
    const fallbackData = ANTIOQUIA_IDF_2023.map(staticToIDFRanking);
    const idfValues = fallbackData.map((r) => r.idf);
    const avgIdf =
      Math.round(
        (idfValues.reduce((a, b) => a + b, 0) / fallbackData.length) * 10
      ) / 10;

    return NextResponse.json({
      success: true,
      vigencia: 2023, // Fallback is always 2023
      total: fallbackData.length,
      source: "fallback",
      data: fallbackData,
      averages: {
        idf: avgIdf,
        minIdf: Math.min(...idfValues),
        maxIdf: Math.max(...idfValues),
      },
    });
  }
}
