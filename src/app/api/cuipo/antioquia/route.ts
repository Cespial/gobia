/**
 * API Route: GET /api/cuipo/antioquia?vigencia=2024
 *
 * Retorna ejecución presupuestal CUIPO para todos los municipios de Antioquia.
 * Fuente: datos.gov.co dataset 9axr-9gnb (gastos por función).
 * Cache 24h. Fallback a datos estáticos si la API falla.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAntioquiaCuipoComparison, type CuipoData } from "@/lib/cuipo-client";
import {
  ANTIOQUIA_CUIPO_2024,
  type CuipoFallbackEntry,
} from "@/data/antioquia-cuipo-2024";

export const revalidate = 86400; // 24 hours

interface CuipoAntioquiaResponse {
  success: boolean;
  vigencia: number;
  total: number;
  source: "api" | "fallback";
  data: CuipoMunicipioResumen[];
  averages: {
    ejecucion_pct: number;
    total_presupuesto: number;
    total_ejecutado: number;
  };
}

export interface CuipoMunicipioResumen {
  codigo_dane: string;
  municipio: string;
  porcentaje_ejecucion: number;
  total_gasto: number;
}

function cuipoDataToResumen(d: CuipoData): CuipoMunicipioResumen {
  return {
    codigo_dane: d.codigo_dane,
    municipio: d.municipio,
    porcentaje_ejecucion: d.porcentaje_ejecucion,
    total_gasto: d.total_gasto,
  };
}

function fallbackToResumen(d: CuipoFallbackEntry): CuipoMunicipioResumen {
  return {
    codigo_dane: d.codigo_dane,
    municipio: d.municipio,
    porcentaje_ejecucion: d.porcentaje_ejecucion,
    total_gasto: d.total_ejecutado,
  };
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<CuipoAntioquiaResponse>> {
  const { searchParams } = new URL(request.url);
  const vigencia = parseInt(searchParams.get("vigencia") || "2024", 10);

  try {
    const apiData = await getAntioquiaCuipoComparison(vigencia);

    if (apiData.length > 0) {
      const resumen = apiData.map(cuipoDataToResumen);
      const totalPres = apiData.reduce((s, d) => s + d.total_gasto, 0);
      const avgEjec =
        Math.round(
          (apiData.reduce((s, d) => s + d.porcentaje_ejecucion, 0) /
            apiData.length) *
            10
        ) / 10;

      return NextResponse.json({
        success: true,
        vigencia,
        total: resumen.length,
        source: "api",
        data: resumen,
        averages: {
          ejecucion_pct: avgEjec,
          total_presupuesto: totalPres,
          total_ejecutado: totalPres,
        },
      });
    }

    throw new Error("No data from CUIPO API");
  } catch (error) {
    console.warn(
      "Falling back to static CUIPO data:",
      error instanceof Error ? error.message : "Unknown error"
    );

    const fallbackData = ANTIOQUIA_CUIPO_2024.map(fallbackToResumen);
    const totalPres = ANTIOQUIA_CUIPO_2024.reduce(
      (s, d) => s + d.total_presupuesto,
      0
    );
    const totalEjec = ANTIOQUIA_CUIPO_2024.reduce(
      (s, d) => s + d.total_ejecutado,
      0
    );
    const avgEjec =
      Math.round(
        (ANTIOQUIA_CUIPO_2024.reduce(
          (s, d) => s + d.porcentaje_ejecucion,
          0
        ) /
          ANTIOQUIA_CUIPO_2024.length) *
          10
      ) / 10;

    return NextResponse.json({
      success: true,
      vigencia: 2024,
      total: fallbackData.length,
      source: "fallback",
      data: fallbackData,
      averages: {
        ejecucion_pct: avgEjec,
        total_presupuesto: totalPres,
        total_ejecutado: totalEjec,
      },
    });
  }
}
