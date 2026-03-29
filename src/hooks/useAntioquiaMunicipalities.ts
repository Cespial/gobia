"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  antioquiaMunicipalities,
  municipalitiesByCode,
  municipalitiesBySubregion,
  type AntioquiaMunicipality,
  type Subregion,
  type CategoríaMunicipal,
  ANTIOQUIA_CENTER,
  ANTIOQUIA_ZOOM,
  TOTAL_MUNICIPIOS,
  POBLACION_TOTAL,
} from "@/data/antioquia-municipalities";

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
  features: GeoJSONFeature[];
}

interface UseAntioquiaMunicipalitiesOptions {
  /** Cargar GeoJSON desde API (default: false, usa datos estáticos) */
  fetchGeoJSON?: boolean;
  /** Filtrar por subregión */
  subregion?: Subregion;
  /** Filtrar por categoría municipal */
  categoria?: CategoríaMunicipal;
}

interface UseAntioquiaMunicipalitiesResult {
  /** Lista de municipios (filtrada si se especificaron opciones) */
  municipalities: AntioquiaMunicipality[];
  /** GeoJSON para Mapbox (si fetchGeoJSON=true) */
  geojson: GeoJSONFeatureCollection | null;
  /** Estado de carga del GeoJSON */
  loading: boolean;
  /** Error si falló la carga */
  error: Error | null;
  /** Buscar municipio por código DANE */
  getMunicipality: (codigoDane: string) => AntioquiaMunicipality | undefined;
  /** Obtener municipios por subregión */
  getBySubregion: (subregion: Subregion) => AntioquiaMunicipality[];
  /** Estadísticas agregadas */
  stats: {
    total: number;
    poblacionTotal: number;
    porCategoria: Record<CategoríaMunicipal, number>;
    porSubregion: Record<Subregion, number>;
  };
  /** Configuración del mapa */
  mapConfig: {
    center: [number, number];
    zoom: number;
  };
  /** Refrescar datos desde API */
  refresh: () => Promise<void>;
}

/**
 * Hook para acceder a datos de los 125 municipios de Antioquia
 *
 * @example
 * ```tsx
 * // Uso básico - datos estáticos
 * const { municipalities, getMunicipality } = useAntioquiaMunicipalities();
 *
 * // Con GeoJSON para Mapbox
 * const { geojson, loading, error } = useAntioquiaMunicipalities({ fetchGeoJSON: true });
 *
 * // Filtrado por subregión
 * const { municipalities } = useAntioquiaMunicipalities({ subregion: "Valle de Aburrá" });
 * ```
 */
export function useAntioquiaMunicipalities(
  options: UseAntioquiaMunicipalitiesOptions = {}
): UseAntioquiaMunicipalitiesResult {
  const { fetchGeoJSON = false, subregion, categoria } = options;

  const [geojson, setGeojson] = useState<GeoJSONFeatureCollection | null>(null);
  const [loading, setLoading] = useState(fetchGeoJSON);
  const [error, setError] = useState<Error | null>(null);

  // Filtrar municipios según opciones
  const municipalities = useMemo(() => {
    let result = antioquiaMunicipalities;

    if (subregion) {
      result = result.filter((m) => m.subregion === subregion);
    }

    if (categoria !== undefined) {
      result = result.filter((m) => m.categoria === categoria);
    }

    return result;
  }, [subregion, categoria]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const porCategoria = antioquiaMunicipalities.reduce(
      (acc, m) => {
        acc[m.categoria] = (acc[m.categoria] || 0) + 1;
        return acc;
      },
      {} as Record<CategoríaMunicipal, number>
    );

    const porSubregion = antioquiaMunicipalities.reduce(
      (acc, m) => {
        acc[m.subregion] = (acc[m.subregion] || 0) + 1;
        return acc;
      },
      {} as Record<Subregion, number>
    );

    return {
      total: TOTAL_MUNICIPIOS,
      poblacionTotal: POBLACION_TOTAL,
      porCategoria,
      porSubregion,
    };
  }, []);

  // Función para cargar GeoJSON
  const loadGeoJSON = useCallback(async () => {
    if (!fetchGeoJSON) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/geojson/antioquia");

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: GeoJSONFeatureCollection = await response.json();
      setGeojson(data);
    } catch (err) {
      console.error("Error loading Antioquia GeoJSON:", err);
      setError(err instanceof Error ? err : new Error("Error desconocido"));

      // Fallback: construir GeoJSON desde datos estáticos
      const fallbackGeojson: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: antioquiaMunicipalities.map((m) => ({
          type: "Feature",
          properties: {
            codigo_dane: m.codigo_dane,
            nombre: m.nombre,
            subregion: m.subregion,
            categoria: m.categoria,
            poblacion: m.poblacion,
            area_km2: m.area_km2,
          },
          geometry: {
            type: "Point",
            coordinates: [m.lng, m.lat],
          },
        })),
      };
      setGeojson(fallbackGeojson);
    } finally {
      setLoading(false);
    }
  }, [fetchGeoJSON]);

  // Cargar GeoJSON al montar si se solicita
  useEffect(() => {
    if (fetchGeoJSON) {
      loadGeoJSON();
    }
  }, [fetchGeoJSON, loadGeoJSON]);

  // Helpers
  const getMunicipality = useCallback((codigoDane: string) => {
    return municipalitiesByCode.get(codigoDane);
  }, []);

  const getBySubregion = useCallback((sub: Subregion) => {
    return municipalitiesBySubregion[sub] || [];
  }, []);

  return {
    municipalities,
    geojson,
    loading,
    error,
    getMunicipality,
    getBySubregion,
    stats,
    mapConfig: {
      center: ANTIOQUIA_CENTER,
      zoom: ANTIOQUIA_ZOOM,
    },
    refresh: loadGeoJSON,
  };
}

export type { AntioquiaMunicipality, Subregion, CategoríaMunicipal };
export {
  ANTIOQUIA_CENTER,
  ANTIOQUIA_ZOOM,
  TOTAL_MUNICIPIOS,
  POBLACION_TOTAL,
};
