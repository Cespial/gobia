import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const revalidate = 86400; // 24 hours cache

interface GeoJSONFeature {
  type: "Feature";
  properties: {
    codigo_dane: string;
    nombre: string;
    subregion: string;
    categoria: number;
    poblacion: number;
    area_km2: number;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  name: string;
  crs?: {
    type: string;
    properties: { name: string };
  };
  features: GeoJSONFeature[];
}

/**
 * GET /api/geojson/antioquia
 *
 * Retorna GeoJSON de los 125 municipios de Antioquia
 *
 * Query params:
 *   - format: "centroids" (solo puntos) | "full" (polígonos si disponibles)
 *   - municipio: código DANE (ej: "05001") para filtrar un municipio específico
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format") || "centroids";
  const municipioFilter = searchParams.get("municipio");

  try {
    // Leer GeoJSON desde public/data
    const filePath = join(process.cwd(), "public", "data", "antioquia-municipios.geojson");
    const fileContents = await readFile(filePath, "utf-8");
    const geojson: GeoJSONFeatureCollection = JSON.parse(fileContents);

    // Filtrar por municipio si se especifica
    if (municipioFilter) {
      const filtered = geojson.features.filter(
        (f) => f.properties.codigo_dane === municipioFilter
      );

      if (filtered.length === 0) {
        return NextResponse.json(
          { ok: false, error: `Municipio ${municipioFilter} no encontrado` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          type: "FeatureCollection",
          features: filtered,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
            "Content-Type": "application/geo+json",
          },
        }
      );
    }

    // Formato: actualmente solo soportamos centroids (puntos)
    // En sprints futuros agregaremos polígonos completos
    if (format === "full") {
      // Por ahora retorna lo mismo que centroids
      // Cuando tengamos polígonos, aquí cargaríamos otro archivo
    }

    return NextResponse.json(geojson, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        "Content-Type": "application/geo+json",
      },
    });
  } catch (error) {
    console.error("Error loading Antioquia GeoJSON:", error);

    // Fallback: construir GeoJSON desde el dataset estático
    try {
      const { antioquiaMunicipalities } = await import("@/data/antioquia-municipalities");

      const fallbackGeojson: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        name: "Municipios de Antioquia (fallback)",
        features: antioquiaMunicipalities.map((m) => ({
          type: "Feature" as const,
          properties: {
            codigo_dane: m.codigo_dane,
            nombre: m.nombre,
            subregion: m.subregion,
            categoria: m.categoria,
            poblacion: m.poblacion,
            area_km2: m.area_km2,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [m.lng, m.lat] as [number, number],
          },
        })),
      };

      // Filtrar si es necesario
      if (municipioFilter) {
        fallbackGeojson.features = fallbackGeojson.features.filter(
          (f) => f.properties.codigo_dane === municipioFilter
        );
      }

      return NextResponse.json(fallbackGeojson, {
        headers: {
          "Cache-Control": "public, s-maxage=3600",
          "Content-Type": "application/geo+json",
        },
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { ok: false, error: "Error cargando datos de Antioquia" },
        { status: 500 }
      );
    }
  }
}
