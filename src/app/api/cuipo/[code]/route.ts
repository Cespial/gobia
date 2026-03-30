/**
 * API Route: GET /api/cuipo/[code]
 *
 * Retorna ejecución presupuestal CUIPO de un municipio por código DANE.
 * Fuente: datos.gov.co dataset 9axr-9gnb.
 * Cache 24h. Fallback a datos estáticos.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getCuipoSummary,
  type CuipoSummary,
} from "@/lib/cuipo-client";
import {
  getCuipoFallback,
  fallbackToSummary,
} from "@/data/antioquia-cuipo-2024";

export const revalidate = 86400; // 24 hours

interface CuipoResponse {
  success: boolean;
  source: "api" | "fallback";
  data: CuipoSummary | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
): Promise<NextResponse<CuipoResponse>> {
  const { code } = await params;

  if (!code || code.length < 5) {
    return NextResponse.json(
      { success: false, source: "api", data: null, error: "Invalid DANE code" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const vigencia = parseInt(searchParams.get("vigencia") || "2024", 10);

  try {
    const summary = await getCuipoSummary(code, vigencia);

    if (summary) {
      return NextResponse.json({
        success: true,
        source: "api",
        data: summary,
      });
    }

    throw new Error("No CUIPO data from API");
  } catch (error) {
    console.warn(
      `CUIPO fallback for ${code}:`,
      error instanceof Error ? error.message : "Unknown"
    );

    const fallback = getCuipoFallback(code);
    if (fallback) {
      return NextResponse.json({
        success: true,
        source: "fallback",
        data: fallbackToSummary(fallback),
      });
    }

    return NextResponse.json({
      success: false,
      source: "fallback",
      data: null,
      error: `No CUIPO data available for municipality ${code}`,
    });
  }
}
