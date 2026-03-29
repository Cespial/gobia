import { NextRequest, NextResponse } from "next/server";

export const revalidate = 86400; // 24 hours cache

interface DIVIPOLAMunicipio {
  cod_dpto: string;
  dpto: string;
  cod_mpio: string;
  nom_mpio: string;
  tipo_municipio: string;
  longitud: string;
  latitud: string;
}

interface NormalizedMunicipio {
  codigo_dane: string;
  nombre: string;
  departamento: string;
  codigo_departamento: string;
  tipo: string;
  lat: number;
  lng: number;
}

/**
 * GET /api/datos-gov/municipios
 *
 * Consume DIVIPOLA de datos.gov.co y retorna lista normalizada de municipios
 *
 * Query params:
 *   - departamento: código DANE del departamento (ej: "05" para Antioquia)
 *   - limit: máximo de resultados (default: 200)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const departamento = searchParams.get("departamento") || "05";
  const limit = parseInt(searchParams.get("limit") || "200", 10);

  const DIVIPOLA_DATASET_ID = "gdxc-w37w";
  const API_URL = `https://www.datos.gov.co/resource/${DIVIPOLA_DATASET_ID}.json`;

  try {
    const params = new URLSearchParams({
      cod_dpto: departamento,
      $limit: String(limit),
    });

    const response = await fetch(`${API_URL}?${params}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`datos.gov.co API error: ${response.status}`);
    }

    const rawData: DIVIPOLAMunicipio[] = await response.json();

    // Normalizar datos (convertir coordenadas de formato colombiano a números)
    const normalized: NormalizedMunicipio[] = rawData.map((m) => ({
      codigo_dane: m.cod_mpio,
      nombre: normalizeName(m.nom_mpio),
      departamento: normalizeName(m.dpto),
      codigo_departamento: m.cod_dpto,
      tipo: m.tipo_municipio,
      lat: parseColombianCoord(m.latitud),
      lng: parseColombianCoord(m.longitud),
    }));

    return NextResponse.json(
      {
        ok: true,
        count: normalized.length,
        departamento: normalized[0]?.departamento || "Antioquia",
        data: normalized,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching DIVIPOLA data:", error);

    // Fallback: usar datos estáticos locales
    try {
      const { antioquiaMunicipalities } = await import("@/data/antioquia-municipalities");

      const fallbackData: NormalizedMunicipio[] = antioquiaMunicipalities
        .filter((m) => m.codigo_dane.startsWith(departamento))
        .map((m) => ({
          codigo_dane: m.codigo_dane,
          nombre: m.nombre,
          departamento: m.departamento,
          codigo_departamento: departamento,
          tipo: "Municipio",
          lat: m.lat,
          lng: m.lng,
        }));

      return NextResponse.json(
        {
          ok: true,
          count: fallbackData.length,
          departamento: "Antioquia",
          source: "fallback",
          data: fallbackData,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=3600",
          },
        }
      );
    } catch (fallbackError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Error obteniendo datos de DIVIPOLA",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
}

/**
 * Convierte coordenadas en formato colombiano (coma decimal) a número
 * Ej: "-75,581775" -> -75.581775
 */
function parseColombianCoord(coord: string): number {
  if (!coord) return 0;
  return parseFloat(coord.replace(",", "."));
}

/**
 * Normaliza nombres de municipios (Title Case)
 */
function normalizeName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => {
      // Mantener minúsculas para artículos y preposiciones cortas
      if (["de", "del", "la", "el", "los", "las", "y"].includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
