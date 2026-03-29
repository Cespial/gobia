import { NextRequest, NextResponse } from "next/server";
import {
  getSecopContractsByMunicipality,
  getSecopContractSummary,
  getSecopTopContracts,
} from "@/lib/secop-client";
import { getCuipoSummary } from "@/lib/cuipo-client";
import { getContractFallbackByCode } from "@/data/antioquia-contracts-2024";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // 24 hours

interface RouteParams {
  params: Promise<{ code: string }>;
}

/**
 * GET /api/contracts/[code]
 *
 * Retorna todos los contratos SECOP II + datos CUIPO del municipio
 *
 * Query params:
 * - vigencia: año fiscal (default: 2024)
 * - limit: número máximo de contratos a retornar (default: 50)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { code: codigoDane } = await params;
  const searchParams = request.nextUrl.searchParams;
  const vigencia = parseInt(searchParams.get("vigencia") || "2024");
  const limit = parseInt(searchParams.get("limit") || "50");

  // Validate codigo DANE
  if (!codigoDane || codigoDane.length < 5) {
    return NextResponse.json(
      { ok: false, error: "Código DANE inválido" },
      { status: 400 }
    );
  }

  try {
    // Fetch data from all sources in parallel
    const [contracts, summary, topContracts, cuipo] = await Promise.allSettled([
      getSecopContractsByMunicipality(codigoDane, vigencia, limit),
      getSecopContractSummary(codigoDane, vigencia),
      getSecopTopContracts(codigoDane, vigencia, 5),
      getCuipoSummary(codigoDane, vigencia),
    ]);

    // Extract results or use defaults
    const contractsList = contracts.status === "fulfilled" ? contracts.value : [];
    const summaryData = summary.status === "fulfilled" ? summary.value : null;
    const topContractsList = topContracts.status === "fulfilled" ? topContracts.value : [];
    const cuipoData = cuipo.status === "fulfilled" ? cuipo.value : null;

    // Check if we got any real data
    const hasRealData = contractsList.length > 0 || (summaryData && summaryData.total_contratos > 0);

    // If no real data, try fallback
    if (!hasRealData) {
      const fallback = getContractFallbackByCode(codigoDane);

      if (fallback) {
        return NextResponse.json({
          ok: true,
          data: {
            secop: {
              contracts: [],
              summary: {
                total_contratos: fallback.total_contratos,
                valor_total: fallback.valor_total,
                valor_promedio: Math.round(fallback.valor_total / fallback.total_contratos),
                por_estado: {
                  "Celebrado": Math.round(fallback.total_contratos * 0.75),
                  "En ejecución": Math.round(fallback.total_contratos * 0.15),
                  "Liquidado": Math.round(fallback.total_contratos * 0.10),
                },
                por_tipo: {
                  "Prestación de servicios": {
                    cantidad: fallback.por_tipo.prestacion_servicios,
                    valor: Math.round(fallback.valor_total * 0.35),
                  },
                  "Suministro": {
                    cantidad: fallback.por_tipo.suministro,
                    valor: Math.round(fallback.valor_total * 0.25),
                  },
                  "Obra": {
                    cantidad: fallback.por_tipo.obra,
                    valor: Math.round(fallback.valor_total * 0.30),
                  },
                  "Consultoría": {
                    cantidad: fallback.por_tipo.consultoria,
                    valor: Math.round(fallback.valor_total * 0.07),
                  },
                  "Otros": {
                    cantidad: fallback.por_tipo.otros,
                    valor: Math.round(fallback.valor_total * 0.03),
                  },
                },
                top_contratistas: fallback.top_contratistas.map((c) => ({
                  nombre: c.nombre,
                  nit: "",
                  contratos: c.contratos,
                  valor: c.valor,
                })),
              },
              top_por_valor: [],
            },
            cuipo: {
              codigo_dane: codigoDane,
              municipio: fallback.nombre,
              vigencia,
              total_presupuesto: fallback.valor_total * 1.2,
              total_ejecutado: fallback.valor_total * (fallback.porcentaje_ejecucion_cuipo / 100),
              porcentaje_ejecucion: fallback.porcentaje_ejecucion_cuipo,
              ejecucion_por_categoria: [
                { categoria: "Educación", presupuesto: fallback.valor_total * 0.25, ejecutado: fallback.valor_total * 0.22, porcentaje: 88 },
                { categoria: "Salud", presupuesto: fallback.valor_total * 0.20, ejecutado: fallback.valor_total * 0.18, porcentaje: 90 },
                { categoria: "Agua/Saneamiento", presupuesto: fallback.valor_total * 0.12, ejecutado: fallback.valor_total * 0.09, porcentaje: 75 },
                { categoria: "Vivienda", presupuesto: fallback.valor_total * 0.08, ejecutado: fallback.valor_total * 0.05, porcentaje: 62 },
                { categoria: "Cultura/Deporte", presupuesto: fallback.valor_total * 0.05, ejecutado: fallback.valor_total * 0.04, porcentaje: 80 },
                { categoria: "Otros", presupuesto: fallback.valor_total * 0.30, ejecutado: fallback.valor_total * 0.25, porcentaje: 83 },
              ],
            },
          },
          vigencia,
          sources: { secop: false, cuipo: false },
          fallback: true,
        });
      }

      return NextResponse.json(
        { ok: false, error: "No se encontraron datos para este municipio" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        secop: {
          contracts: contractsList,
          summary: summaryData || {
            total_contratos: contractsList.length,
            valor_total: contractsList.reduce((s, c) => s + c.valor_contrato, 0),
            valor_promedio: 0,
            por_estado: {},
            por_tipo: {},
            top_contratistas: [],
          },
          top_por_valor: topContractsList,
        },
        cuipo: cuipoData,
      },
      vigencia,
      sources: {
        secop: contractsList.length > 0,
        cuipo: cuipoData !== null,
      },
    });
  } catch (error) {
    console.error(`Error fetching contract data for ${codigoDane}:`, error);

    // Try fallback
    const fallback = getContractFallbackByCode(codigoDane);

    if (fallback) {
      return NextResponse.json({
        ok: true,
        data: {
          secop: {
            contracts: [],
            summary: {
              total_contratos: fallback.total_contratos,
              valor_total: fallback.valor_total,
              valor_promedio: Math.round(fallback.valor_total / fallback.total_contratos),
              por_estado: {},
              por_tipo: {},
              top_contratistas: fallback.top_contratistas.map((c) => ({
                nombre: c.nombre,
                nit: "",
                contratos: c.contratos,
                valor: c.valor,
              })),
            },
            top_por_valor: [],
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
        },
        vigencia,
        sources: { secop: false, cuipo: false },
        fallback: true,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
