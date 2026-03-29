import { NextRequest, NextResponse } from "next/server";
import { getAntioquiaSecopMetrics } from "@/lib/secop-client";
import { getAntioquiaCuipoComparison } from "@/lib/cuipo-client";
import { ANTIOQUIA_CONTRACTS_2024 } from "@/data/antioquia-contracts-2024";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // 24 hours

interface ContractMetrics {
  codigo_dane: string;
  municipio: string;
  total_contratos: number;
  valor_total: number;
  tipo_predominante: string;
  porcentaje_ejecucion: number;
}

/**
 * GET /api/contracts/antioquia
 *
 * Retorna métricas de contratación de los 125 municipios de Antioquia
 *
 * Query params:
 * - vigencia: año fiscal (default: 2024)
 * - type: tipo de métrica (cantidad | valor | ejecucion) para ordenar
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const vigencia = parseInt(searchParams.get("vigencia") || "2024");
  const sortType = searchParams.get("type") || "cantidad";

  try {
    // Try to fetch real data from APIs
    const [secopMetrics, cuipoData] = await Promise.allSettled([
      getAntioquiaSecopMetrics(vigencia),
      getAntioquiaCuipoComparison(vigencia),
    ]);

    // Process SECOP data
    const secopMap = new Map<string, { total: number; valor: number; tipo: string }>();
    if (secopMetrics.status === "fulfilled" && secopMetrics.value.length > 0) {
      secopMetrics.value.forEach((item) => {
        if (item.codigo_dane) {
          secopMap.set(item.codigo_dane, {
            total: item.total_contratos,
            valor: item.valor_total,
            tipo: item.tipo_predominante,
          });
        }
      });
    }

    // Process CUIPO data
    const cuipoMap = new Map<string, number>();
    if (cuipoData.status === "fulfilled" && cuipoData.value.length > 0) {
      cuipoData.value.forEach((item) => {
        cuipoMap.set(item.codigo_dane, item.porcentaje_ejecucion);
      });
    }

    // Merge with fallback data
    const metrics: ContractMetrics[] = ANTIOQUIA_CONTRACTS_2024.map((fallback) => {
      const secop = secopMap.get(fallback.codigo_dane);
      const cuipo = cuipoMap.get(fallback.codigo_dane);

      // Determine predominant type from fallback
      const tipos = fallback.por_tipo;
      const maxTipo = Object.entries(tipos).reduce((max, [key, val]) =>
        val > max[1] ? [key, val] : max, ["otros", 0]
      )[0];

      const tipoLabels: Record<string, string> = {
        prestacion_servicios: "Prestación de servicios",
        suministro: "Suministro",
        obra: "Obra",
        consultoria: "Consultoría",
        otros: "Otros",
      };

      return {
        codigo_dane: fallback.codigo_dane,
        municipio: fallback.nombre,
        total_contratos: secop?.total || fallback.total_contratos,
        valor_total: secop?.valor || fallback.valor_total,
        tipo_predominante: secop?.tipo || tipoLabels[maxTipo] || "Prestación de servicios",
        porcentaje_ejecucion: cuipo ?? fallback.porcentaje_ejecucion_cuipo,
      };
    });

    // Sort based on requested type
    let sortedMetrics = [...metrics];
    switch (sortType) {
      case "valor":
        sortedMetrics.sort((a, b) => b.valor_total - a.valor_total);
        break;
      case "ejecucion":
        sortedMetrics.sort((a, b) => b.porcentaje_ejecucion - a.porcentaje_ejecucion);
        break;
      case "cantidad":
      default:
        sortedMetrics.sort((a, b) => b.total_contratos - a.total_contratos);
    }

    // Calculate aggregate stats
    const totalContratos = metrics.reduce((sum, m) => sum + m.total_contratos, 0);
    const totalValor = metrics.reduce((sum, m) => sum + m.valor_total, 0);
    const promedioEjecucion = metrics.reduce((sum, m) => sum + m.porcentaje_ejecucion, 0) / metrics.length;

    return NextResponse.json({
      ok: true,
      data: sortedMetrics,
      stats: {
        total_municipios: metrics.length,
        total_contratos: totalContratos,
        valor_total: totalValor,
        promedio_ejecucion: Math.round(promedioEjecucion * 10) / 10,
      },
      vigencia,
      sources: {
        secop: secopMetrics.status === "fulfilled" && secopMetrics.value.length > 0,
        cuipo: cuipoData.status === "fulfilled" && cuipoData.value.length > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching Antioquia contract metrics:", error);

    // Return fallback data
    const fallbackMetrics: ContractMetrics[] = ANTIOQUIA_CONTRACTS_2024.map((m) => ({
      codigo_dane: m.codigo_dane,
      municipio: m.nombre,
      total_contratos: m.total_contratos,
      valor_total: m.valor_total,
      tipo_predominante: "Prestación de servicios",
      porcentaje_ejecucion: m.porcentaje_ejecucion_cuipo,
    }));

    return NextResponse.json({
      ok: true,
      data: fallbackMetrics,
      stats: {
        total_municipios: fallbackMetrics.length,
        total_contratos: fallbackMetrics.reduce((s, m) => s + m.total_contratos, 0),
        valor_total: fallbackMetrics.reduce((s, m) => s + m.valor_total, 0),
        promedio_ejecucion: Math.round(
          fallbackMetrics.reduce((s, m) => s + m.porcentaje_ejecucion, 0) / fallbackMetrics.length * 10
        ) / 10,
      },
      vigencia,
      sources: { secop: false, cuipo: false },
      fallback: true,
    });
  }
}
