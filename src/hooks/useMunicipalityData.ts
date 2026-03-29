"use client";

import { useState, useEffect, useCallback } from "react";
import type { AntioquiaMunicipality } from "@/data/antioquia-municipalities";
import type {
  TerriDataIndicators,
  FiscalData,
  ContractSummary,
} from "@/data/demo-rionegro";

export interface MunicipalityFullData {
  profile: {
    codigo_dane: string;
    nombre: string;
    departamento: string;
    subregion: string;
    categoria: number;
    poblacion: number;
    area_km2: number;
  };
  terridata: TerriDataIndicators;
  fiscal: FiscalData;
  contracts: ContractSummary;
  comparison: {
    idf_vs_avg: number;
    nbi_vs_avg: number;
    ranking_idf: number;
    ranking_nbi: number;
  };
}

interface UseMunicipalityDataResult {
  data: MunicipalityFullData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar datos completos de un municipio
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useMunicipalityData("05615");
 *
 * if (loading) return <Skeleton />;
 * if (error) return <ErrorMessage />;
 * return <MunicipalityProfile data={data} />;
 * ```
 */
export function useMunicipalityData(
  codigoDane: string | null
): UseMunicipalityDataResult {
  const [data, setData] = useState<MunicipalityFullData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!codigoDane) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/municipality/${codigoDane}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || "Error desconocido al cargar datos");
      }

      setData({
        profile: result.profile,
        terridata: result.terridata,
        fiscal: result.fiscal,
        contracts: result.contracts,
        comparison: result.comparison,
      });
    } catch (err) {
      console.error(`Error fetching municipality data for ${codigoDane}:`, err);
      setError(err instanceof Error ? err : new Error("Error desconocido"));
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
 * Hook simplificado que acepta un objeto municipio en lugar de código
 */
export function useMunicipalityDataFromProfile(
  municipality: AntioquiaMunicipality | null
): UseMunicipalityDataResult {
  return useMunicipalityData(municipality?.codigo_dane ?? null);
}

export type { TerriDataIndicators, FiscalData, ContractSummary };
