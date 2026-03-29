"use client";

import { useState, useEffect, useCallback } from "react";
import type { Subregion } from "@/data/antioquia-municipalities";

// ============ Types ============

type IDFCategoria = "sostenible" | "solvente" | "vulnerable" | "deterioro";
type AlertSeverity = "critica" | "alta" | "media";
type AlertType =
  | "idf_deterioro"
  | "deuda_alta"
  | "nbi_critico"
  | "ejecucion_baja"
  | "cartera_morosa";

export interface DepartmentKPI {
  idf_promedio: number;
  idf_categoria: IDFCategoria;
  nbi_promedio: number;
  ejecucion_promedio: number;
  deuda_percapita: number;
  autonomia_fiscal_promedio: number;
  cobertura_educacion: number;
  afiliacion_salud: number;
  municipios_en_riesgo: number;
  poblacion_total: number;
  municipios_total: number;
}

export interface Alert {
  id: string;
  tipo: AlertType;
  municipio: string;
  codigo_dane: string;
  severidad: AlertSeverity;
  mensaje: string;
  valor: number;
  umbral: number;
  fecha_generacion: string;
}

export interface MunicipalityRankingItem {
  codigo_dane: string;
  nombre: string;
  subregion: Subregion;
  idf: number;
  idf_categoria: IDFCategoria;
  nbi: number;
  ejecucion: number;
  deuda_percapita: number;
  poblacion: number;
  ranking_idf: number;
}

export interface SubregionData {
  nombre: Subregion;
  municipios: number;
  poblacion: number;
  idf_promedio: number;
  nbi_promedio: number;
  deuda_total: number;
  municipios_en_riesgo: number;
}

export interface HistoricalPoint {
  año: number;
  valor: number;
}

export interface HistoricalData {
  idf_historico: HistoricalPoint[];
  nbi_historico: HistoricalPoint[];
  deuda_historica: HistoricalPoint[];
  ejecucion_historica: HistoricalPoint[];
  ingresos_propios_historico: HistoricalPoint[];
}

export interface DepartmentData {
  kpis: DepartmentKPI;
  alerts: Alert[];
  ranking: MunicipalityRankingItem[];
  subregiones: SubregionData[];
  tendencias: HistoricalData;
  municipios_en_riesgo: MunicipalityRankingItem[];
  timestamp: string;
}

interface UseDepartmentDataResult {
  data: DepartmentData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar datos consolidados del departamento de Antioquia
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useDepartmentData();
 *
 * if (loading) return <DashboardSkeleton />;
 * if (error) return <ErrorMessage error={error} />;
 * return <DepartmentDashboard data={data} />;
 * ```
 */
export function useDepartmentData(): UseDepartmentDataResult {
  const [data, setData] = useState<DepartmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/antioquia/summary");

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
        kpis: result.kpis,
        alerts: result.alerts,
        ranking: result.ranking,
        subregiones: result.subregiones,
        tendencias: result.tendencias,
        municipios_en_riesgo: result.municipios_en_riesgo,
        timestamp: result.timestamp,
      });
    } catch (err) {
      console.error("Error fetching department data:", err);
      setError(err instanceof Error ? err : new Error("Error desconocido"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

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

// ============ Helper Functions ============

/**
 * Get color class for IDF category
 */
export function getIDFColorClass(categoria: IDFCategoria): string {
  switch (categoria) {
    case "sostenible":
      return "text-green-600 bg-green-50";
    case "solvente":
      return "text-yellow-600 bg-yellow-50";
    case "vulnerable":
      return "text-orange-600 bg-orange-50";
    case "deterioro":
      return "text-red-600 bg-red-50";
  }
}

/**
 * Get badge color for alert severity
 */
export function getAlertColorClass(severidad: AlertSeverity): string {
  switch (severidad) {
    case "critica":
      return "bg-red-100 text-red-700 border-red-200";
    case "alta":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "media":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
}

/**
 * Format currency in COP
 */
export function formatCurrency(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(0)}K`;
  }
  return `$${value.toLocaleString("es-CO")}`;
}

/**
 * Format population number
 */
export function formatPopulation(value: number): string {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(0)}K`;
  }
  return value.toLocaleString("es-CO");
}

export default useDepartmentData;
