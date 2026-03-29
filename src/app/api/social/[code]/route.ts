/**
 * API Route: GET /api/social/[code]
 *
 * Retorna todos los indicadores sociales de un municipio.
 * Combina múltiples dimensiones de TerriData.
 * Cache de 24h. Si la API falla, retorna datos de fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { getMunicipalSocialData, type SocialData } from "@/lib/terridata-client";
import {
  getSocialDataFallback,
  fallbackToFullSocialData,
  ANTIOQUIA_SOCIAL_AVERAGES,
} from "@/data/antioquia-social-2022";

export const revalidate = 86400; // 24 hours

interface SocialApiResponse {
  success: boolean;
  source: "api" | "fallback" | "not_found";
  vigencia: number;
  data: SocialData | null;
  averages: typeof ANTIOQUIA_SOCIAL_AVERAGES;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
): Promise<NextResponse<SocialApiResponse>> {
  const { code } = await params;

  // Validate DANE code format (5 digits for municipality)
  if (!/^\d{5}$/.test(code)) {
    return NextResponse.json({
      success: false,
      source: "not_found",
      vigencia: 0,
      data: null,
      averages: ANTIOQUIA_SOCIAL_AVERAGES,
      error: "Invalid DANE code format. Expected 5 digits.",
    });
  }

  try {
    // Try to fetch from TerriData API
    const socialData = await getMunicipalSocialData(code);

    if (socialData) {
      return NextResponse.json({
        success: true,
        source: "api",
        vigencia: socialData.vigencia,
        data: socialData,
        averages: ANTIOQUIA_SOCIAL_AVERAGES,
      });
    }

    // No data from API, try fallback
    throw new Error("No data returned from TerriData API");
  } catch (error) {
    console.warn(
      `Falling back to static social data for ${code}:`,
      error instanceof Error ? error.message : "Unknown error"
    );

    // Try static fallback
    const fallbackData = getSocialDataFallback(code);

    if (fallbackData) {
      const fullData = fallbackToFullSocialData(fallbackData);

      return NextResponse.json({
        success: true,
        source: "fallback",
        vigencia: fullData.vigencia,
        data: fullData,
        averages: ANTIOQUIA_SOCIAL_AVERAGES,
      });
    }

    // Municipality not found in fallback either
    return NextResponse.json({
      success: false,
      source: "not_found",
      vigencia: 0,
      data: null,
      averages: ANTIOQUIA_SOCIAL_AVERAGES,
      error: `No social data found for municipality ${code}`,
    });
  }
}
