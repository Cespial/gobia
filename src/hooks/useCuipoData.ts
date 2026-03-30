"use client";

import { useState, useEffect, useCallback } from "react";
import type { CuipoSummary } from "@/lib/cuipo-client";

// ============================================================================
// Types
// ============================================================================

interface UseCuipoDataResult {
  data: CuipoSummary | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface CuipoApiResponse {
  success: boolean;
  source: "api" | "fallback";
  data: CuipoSummary | null;
  error?: string;
}

export interface CuipoMunicipioResumen {
  codigo_dane: string;
  municipio: string;
  porcentaje_ejecucion: number;
  total_gasto: number;
}

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

interface UseAntioquiaCuipoResult {
  data: CuipoMunicipioResumen[];
  loading: boolean;
  error: Error | null;
  averages: CuipoAntioquiaResponse["averages"] | null;
  source: "api" | "fallback" | null;
  refetch: () => void;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook para obtener datos CUIPO de ejecución presupuestal de un municipio
 */
export function useCuipoData(
  codigoDane: string | null,
  vigencia: number = 2024
): UseCuipoDataResult {
  const [data, setData] = useState<CuipoSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!codigoDane) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/cuipo/${codigoDane}?vigencia=${vigencia}`
      );
      const result: CuipoApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || `Failed to fetch CUIPO data for ${codigoDane}`
        );
      }

      setData(result.data);
    } catch (err) {
      console.error(`Error fetching CUIPO data for ${codigoDane}:`, err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [codigoDane, vigencia]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para obtener datos CUIPO de todos los municipios de Antioquia
 */
export function useAntioquiaCuipo(
  vigencia: number = 2024
): UseAntioquiaCuipoResult {
  const [data, setData] = useState<CuipoMunicipioResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [averages, setAverages] =
    useState<CuipoAntioquiaResponse["averages"] | null>(null);
  const [source, setSource] = useState<"api" | "fallback" | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/cuipo/antioquia?vigencia=${vigencia}`
      );
      const result: CuipoAntioquiaResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Failed to fetch Antioquia CUIPO data");
      }

      setData(result.data);
      setAverages(result.averages);
      setSource(result.source);
    } catch (err) {
      console.error("Error fetching Antioquia CUIPO:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setData([]);
      setAverages(null);
      setSource(null);
    } finally {
      setLoading(false);
    }
  }, [vigencia]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, averages, source, refetch: fetchData };
}
