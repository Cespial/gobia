"use client";

import { useState, useEffect, useCallback } from "react";
import type { FiscalData, IDFRanking } from "@/lib/fut-client";

// ============================================================================
// Types
// ============================================================================

interface UseFiscalDataResult {
  data: FiscalData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseAntioquiaFiscalRankingResult {
  data: IDFRanking[];
  loading: boolean;
  error: Error | null;
  averages: {
    idf: number;
    minIdf: number;
    maxIdf: number;
  } | null;
  source: "api" | "fallback" | null;
  refetch: () => void;
}

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

interface FiscalApiResponse {
  success: boolean;
  source: "api" | "fallback" | "demo";
  data: FiscalData | null;
  error?: string;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook para obtener datos fiscales de un municipio especifico
 */
export function useFiscalData(codigoDane: string | null): UseFiscalDataResult {
  const [data, setData] = useState<FiscalData | null>(null);
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
      const response = await fetch(`/api/fiscal/${codigoDane}`);
      const result: FiscalApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to fetch fiscal data for ${codigoDane}`);
      }

      setData(result.data);
    } catch (err) {
      console.error(`Error fetching fiscal data for ${codigoDane}:`, err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [codigoDane]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook para obtener ranking IDF de todos los municipios de Antioquia
 */
export function useAntioquiaFiscalRanking(
  vigencia: number = 2023
): UseAntioquiaFiscalRankingResult {
  const [data, setData] = useState<IDFRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [averages, setAverages] = useState<{
    idf: number;
    minIdf: number;
    maxIdf: number;
  } | null>(null);
  const [source, setSource] = useState<"api" | "fallback" | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fiscal/antioquia?vigencia=${vigencia}`);
      const result: AntioquiaFiscalResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Failed to fetch Antioquia fiscal ranking");
      }

      setData(result.data);
      setAverages(result.averages);
      setSource(result.source);
    } catch (err) {
      console.error("Error fetching Antioquia fiscal ranking:", err);
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

  return {
    data,
    loading,
    error,
    averages,
    source,
    refetch: fetchData,
  };
}

/**
 * Hook para obtener IDF de un municipio especifico del ranking
 */
export function useMunicipalityIDF(codigoDane: string | null): {
  idf: number | null;
  categoria: string | null;
  ranking: number | null;
  loading: boolean;
} {
  const { data, loading } = useAntioquiaFiscalRanking();

  if (!codigoDane || loading) {
    return { idf: null, categoria: null, ranking: null, loading };
  }

  const municipality = data.find((m) => m.codigoDane === codigoDane);

  return {
    idf: municipality?.idf ?? null,
    categoria: municipality?.categoria ?? null,
    ranking: municipality?.ranking ?? null,
    loading: false,
  };
}
