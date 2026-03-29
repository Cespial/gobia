"use client";

import { useState, useEffect, useCallback } from "react";
import type { SocialData, SocialRanking, TerriDataDimension } from "@/lib/terridata-client";
import { ANTIOQUIA_SOCIAL_AVERAGES } from "@/data/antioquia-social-2022";

// ============================================================================
// Types
// ============================================================================

type SocialDimensionShort = "educacion" | "salud" | "servicios" | "nbi" | "ipm" | "internet";

interface UseSocialDataResult {
  data: SocialData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseAntioquiaSocialRankingResult {
  data: SocialRanking[];
  loading: boolean;
  error: Error | null;
  averages: {
    valor: number;
    minValor: number;
    maxValor: number;
  } | null;
  source: "api" | "fallback" | null;
  refetch: () => void;
}

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

interface SocialApiResponse {
  success: boolean;
  source: "api" | "fallback" | "not_found";
  vigencia: number;
  data: SocialData | null;
  averages: typeof ANTIOQUIA_SOCIAL_AVERAGES;
  error?: string;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook para obtener datos sociales de un municipio específico
 */
export function useSocialData(codigoDane: string | null): UseSocialDataResult {
  const [data, setData] = useState<SocialData | null>(null);
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
      const response = await fetch(`/api/social/${codigoDane}`);
      const result: SocialApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to fetch social data for ${codigoDane}`);
      }

      setData(result.data);
    } catch (err) {
      console.error(`Error fetching social data for ${codigoDane}:`, err);
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
 * Hook para obtener ranking social de todos los municipios de Antioquia
 */
export function useAntioquiaSocialRanking(
  dimension: SocialDimensionShort = "nbi",
  vigencia: number = 2022
): UseAntioquiaSocialRankingResult {
  const [data, setData] = useState<SocialRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [averages, setAverages] = useState<{
    valor: number;
    minValor: number;
    maxValor: number;
  } | null>(null);
  const [source, setSource] = useState<"api" | "fallback" | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/social/antioquia?dimension=${dimension}&vigencia=${vigencia}`
      );
      const result: AntioquiaSocialResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Failed to fetch Antioquia social ranking");
      }

      setData(result.data);
      setAverages(result.averages);
      setSource(result.source);
    } catch (err) {
      console.error("Error fetching Antioquia social ranking:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setData([]);
      setAverages(null);
      setSource(null);
    } finally {
      setLoading(false);
    }
  }, [dimension, vigencia]);

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
 * Hook para obtener NBI de un municipio específico del ranking
 */
export function useMunicipalityNBI(codigoDane: string | null): {
  nbi: number | null;
  ranking: number | null;
  loading: boolean;
} {
  const { data, loading } = useAntioquiaSocialRanking("nbi");

  if (!codigoDane || loading) {
    return { nbi: null, ranking: null, loading };
  }

  const municipality = data.find((m) => m.codigoDane === codigoDane);

  return {
    nbi: municipality?.valor ?? null,
    ranking: municipality?.ranking ?? null,
    loading: false,
  };
}

/**
 * Hook para obtener IPM de un municipio específico del ranking
 */
export function useMunicipalityIPM(codigoDane: string | null): {
  ipm: number | null;
  ranking: number | null;
  loading: boolean;
} {
  const { data, loading } = useAntioquiaSocialRanking("ipm");

  if (!codigoDane || loading) {
    return { ipm: null, ranking: null, loading };
  }

  const municipality = data.find((m) => m.codigoDane === codigoDane);

  return {
    ipm: municipality?.valor ?? null,
    ranking: municipality?.ranking ?? null,
    loading: false,
  };
}

// Re-export TerriDataDimension for convenience
export type { TerriDataDimension, SocialDimensionShort };
