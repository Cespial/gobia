"use client";

import { useState, useEffect, useCallback } from "react";
import type { SecopContract, SecopContractSummary } from "@/lib/secop-client";
import type { CuipoSummary, CuipoEjecucionByCategoria } from "@/lib/cuipo-client";
import { getContractFallbackByCode } from "@/data/antioquia-contracts-2024";

// ============================================================================
// TYPES
// ============================================================================

export interface ContractData {
  secop: {
    contracts: SecopContract[];
    summary: SecopContractSummary;
  };
  cuipo: CuipoSummary | null;
}

export interface ContractMetrics {
  codigo_dane: string;
  municipio: string;
  total_contratos: number;
  valor_total: number;
  tipo_predominante: string;
  porcentaje_ejecucion: number;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook para obtener datos de contratación de un municipio
 */
export function useContractData(
  codigoDane: string | null,
  vigencia: number = 2024
): {
  data: ContractData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!codigoDane) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contracts/${codigoDane}?vigencia=${vigencia}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();

      if (json.ok) {
        setData(json.data);
      } else {
        // Use fallback data
        const fallback = getContractFallbackByCode(codigoDane);
        if (fallback) {
          setData({
            secop: {
              contracts: [],
              summary: {
                total_contratos: fallback.total_contratos,
                valor_total: fallback.valor_total,
                valor_promedio: Math.round(fallback.valor_total / fallback.total_contratos),
                por_estado: {},
                por_tipo: {
                  "Prestación de servicios": { cantidad: fallback.por_tipo.prestacion_servicios, valor: 0 },
                  "Suministro": { cantidad: fallback.por_tipo.suministro, valor: 0 },
                  "Obra": { cantidad: fallback.por_tipo.obra, valor: 0 },
                  "Consultoría": { cantidad: fallback.por_tipo.consultoria, valor: 0 },
                  "Otros": { cantidad: fallback.por_tipo.otros, valor: 0 },
                },
                top_contratistas: fallback.top_contratistas.map(c => ({
                  nombre: c.nombre,
                  nit: "",
                  contratos: c.contratos,
                  valor: c.valor,
                })),
              },
            },
            cuipo: {
              codigo_dane: codigoDane,
              municipio: fallback.nombre,
              vigencia,
              total_presupuesto: 0,
              total_ejecutado: 0,
              porcentaje_ejecucion: fallback.porcentaje_ejecucion_cuipo,
              ejecucion_por_categoria: [],
            },
          });
        } else {
          throw new Error(json.error || "Error cargando datos de contratación");
        }
      }
    } catch (err) {
      // Use fallback data on error
      const fallback = getContractFallbackByCode(codigoDane);
      if (fallback) {
        setData({
          secop: {
            contracts: [],
            summary: {
              total_contratos: fallback.total_contratos,
              valor_total: fallback.valor_total,
              valor_promedio: Math.round(fallback.valor_total / fallback.total_contratos),
              por_estado: {},
              por_tipo: {
                "Prestación de servicios": { cantidad: fallback.por_tipo.prestacion_servicios, valor: 0 },
                "Suministro": { cantidad: fallback.por_tipo.suministro, valor: 0 },
                "Obra": { cantidad: fallback.por_tipo.obra, valor: 0 },
                "Consultoría": { cantidad: fallback.por_tipo.consultoria, valor: 0 },
                "Otros": { cantidad: fallback.por_tipo.otros, valor: 0 },
              },
              top_contratistas: fallback.top_contratistas.map(c => ({
                nombre: c.nombre,
                nit: "",
                contratos: c.contratos,
                valor: c.valor,
              })),
            },
          },
          cuipo: {
            codigo_dane: codigoDane,
            municipio: fallback.nombre,
            vigencia,
            total_presupuesto: 0,
            total_ejecutado: 0,
            porcentaje_ejecucion: fallback.porcentaje_ejecucion_cuipo,
            ejecucion_por_categoria: [],
          },
        });
      } else {
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      }
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
 * Hook para obtener métricas resumidas de contratación
 */
export function useContractMetrics(
  codigoDane: string | null,
  vigencia: number = 2024
): {
  totalContracts: number;
  totalValue: number;
  byType: Record<string, { cantidad: number; valor: number }>;
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = useContractData(codigoDane, vigencia);

  return {
    totalContracts: data?.secop.summary.total_contratos || 0,
    totalValue: data?.secop.summary.valor_total || 0,
    byType: data?.secop.summary.por_tipo || {},
    loading,
    error,
  };
}

/**
 * Hook para obtener métricas de contratación de Antioquia
 */
export function useAntioquiaContractMetrics(
  vigencia: number = 2024
): {
  data: ContractMetrics[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ContractMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contracts/antioquia?vigencia=${vigencia}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();

      if (json.ok) {
        setData(json.data);
      } else {
        throw new Error(json.error || "Error cargando métricas de Antioquia");
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"));
    } finally {
      setLoading(false);
    }
  }, [vigencia]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para obtener ejecución CUIPO por categoría
 */
export function useCuipoByCategoria(
  codigoDane: string | null,
  vigencia: number = 2024
): {
  data: CuipoEjecucionByCategoria[];
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = useContractData(codigoDane, vigencia);

  return {
    data: data?.cuipo?.ejecucion_por_categoria || [],
    loading,
    error,
  };
}
