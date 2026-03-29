/**
 * API Route: GET /api/fiscal/[code]
 *
 * Retorna datos fiscales completos de un municipio especifico.
 * Combina: MDM dataset + FUT ingresos dataset.
 * Fallback: datos de demo-rionegro.ts si no hay datos reales.
 *
 * Ejemplo: GET /api/fiscal/05615?vigencia=2023
 */

import { NextRequest, NextResponse } from "next/server";
import { getMunicipalFiscalData, type FiscalData } from "@/lib/fut-client";
import { getIDFByCode, ANTIOQUIA_IDF_2023 } from "@/data/antioquia-idf-2023";
import { RIONEGRO_DEMO_DATA, generateDemoDataForMunicipality } from "@/data/demo-rionegro";
import { antioquiaMunicipalities } from "@/data/antioquia-municipalities";

export const revalidate = 86400; // 24 hours

interface FiscalApiResponse {
  success: boolean;
  source: "api" | "fallback" | "demo";
  data: FiscalData | null;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
): Promise<NextResponse<FiscalApiResponse>> {
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const vigencia = parseInt(searchParams.get("vigencia") || "2023", 10);

  // Validate code format (5 digits)
  if (!/^\d{5}$/.test(code)) {
    return NextResponse.json(
      {
        success: false,
        source: "api",
        data: null,
        error: "Invalid DANE code format. Expected 5 digits.",
      },
      { status: 400 }
    );
  }

  try {
    // Try to fetch from datos.gov.co
    const fiscalData = await getMunicipalFiscalData(code, vigencia);

    if (fiscalData) {
      return NextResponse.json({
        success: true,
        source: "api",
        data: fiscalData,
      });
    }

    // No data from API, try static fallback
    throw new Error("No data returned from API");
  } catch (error) {
    console.warn(
      `API failed for ${code}, using fallback:`,
      error instanceof Error ? error.message : "Unknown error"
    );

    // Try static IDF data first
    const staticIdf = getIDFByCode(code);
    if (staticIdf) {
      // Build FiscalData from static IDF
      const municipality = antioquiaMunicipalities.find(
        (m) => m.codigo_dane === code
      );

      const fiscalData: FiscalData = {
        codigoDane: code,
        municipio: staticIdf.nombre,
        vigencia: 2023,
        ingresos: {
          total: staticIdf.poblacion * 2_500_000,
          propios: staticIdf.poblacion * 2_500_000 * (staticIdf.generacionRecursosPropios / 100),
          transferencias: staticIdf.poblacion * 2_500_000 * (staticIdf.dependenciaTransferencias / 100),
          regalias: staticIdf.poblacion * 50_000,
          predial: staticIdf.poblacion * 450_000,
          ica: staticIdf.poblacion * 280_000,
        },
        gastos: {
          total: staticIdf.poblacion * 2_300_000,
          funcionamiento: staticIdf.poblacion * 2_300_000 * 0.18,
          inversion: staticIdf.poblacion * 2_300_000 * (staticIdf.magnitudInversion / 100),
          deuda: staticIdf.poblacion * 2_300_000 * 0.02,
          ejecucion_pct: 85 + Math.random() * 10,
        },
        idf: {
          score: staticIdf.idf,
          categoria: staticIdf.categoria,
          ranking_dpto: staticIdf.ranking,
          indicadores: {
            autofinanciamiento_funcionamiento: 100 - staticIdf.generacionRecursosPropios * 0.3,
            respaldo_deuda: 5 + Math.random() * 10,
            dependencia_transferencias: staticIdf.dependenciaTransferencias,
            generacion_recursos_propios: staticIdf.generacionRecursosPropios,
            magnitud_inversion: staticIdf.magnitudInversion,
            capacidad_ahorro: staticIdf.capacidadAhorro,
          },
        },
        cartera: {
          total: staticIdf.poblacion * 200_000,
          predial: staticIdf.poblacion * 130_000,
          ica: staticIdf.poblacion * 70_000,
          edad_promedio_dias: 180 + Math.floor(Math.random() * 180),
        },
      };

      return NextResponse.json({
        success: true,
        source: "fallback",
        data: fiscalData,
      });
    }

    // For Rionegro specifically, use detailed demo data
    if (code === "05615") {
      const demo = RIONEGRO_DEMO_DATA;
      const fiscalData: FiscalData = {
        codigoDane: code,
        municipio: demo.nombre,
        vigencia: demo.fiscal.vigencia,
        ingresos: {
          total: demo.fiscal.ingresos_totales,
          propios: demo.fiscal.ingresos_totales * 0.68,
          transferencias: demo.fiscal.ingresos_totales * (demo.fiscal.dependencia_transferencias / 100),
          regalias: demo.fiscal.ingresos_totales * 0.02,
          predial: demo.fiscal.recaudo_predial,
          ica: demo.fiscal.recaudo_ica,
        },
        gastos: {
          total: demo.fiscal.gastos_totales,
          funcionamiento: demo.fiscal.gastos_totales * 0.15,
          inversion: demo.fiscal.gastos_totales * 0.82,
          deuda: demo.fiscal.gastos_totales * (demo.fiscal.magnitud_deuda / 100),
          ejecucion_pct: demo.fiscal.ejecucion_gastos,
        },
        idf: {
          score: demo.fiscal.idf,
          categoria: "solvente",
          ranking_dpto: 5,
          indicadores: {
            autofinanciamiento_funcionamiento: 18.4,
            respaldo_deuda: demo.fiscal.magnitud_deuda,
            dependencia_transferencias: demo.fiscal.dependencia_transferencias,
            generacion_recursos_propios: 68.6,
            magnitud_inversion: 82.1,
            capacidad_ahorro: demo.fiscal.capacidad_ahorro,
          },
        },
        cartera: {
          total: 12_400_000_000,
          predial: 8_200_000_000,
          ica: 4_200_000_000,
          edad_promedio_dias: 245,
        },
      };

      return NextResponse.json({
        success: true,
        source: "demo",
        data: fiscalData,
      });
    }

    // For other municipalities, generate demo data
    const municipality = antioquiaMunicipalities.find(
      (m) => m.codigo_dane === code
    );

    if (municipality) {
      const demo = generateDemoDataForMunicipality(
        code,
        municipality.nombre,
        municipality.categoria,
        municipality.poblacion
      );

      if (demo.fiscal) {
        const fiscalData: FiscalData = {
          codigoDane: code,
          municipio: municipality.nombre,
          vigencia: 2023,
          ingresos: {
            total: demo.fiscal.ingresos_totales,
            propios: demo.fiscal.ingresos_totales * (1 - demo.fiscal.dependencia_transferencias / 100),
            transferencias: demo.fiscal.ingresos_totales * (demo.fiscal.dependencia_transferencias / 100),
            regalias: demo.fiscal.ingresos_totales * 0.02,
            predial: demo.fiscal.recaudo_predial,
            ica: demo.fiscal.recaudo_ica,
          },
          gastos: {
            total: demo.fiscal.gastos_totales,
            funcionamiento: demo.fiscal.gastos_totales * 0.18,
            inversion: demo.fiscal.gastos_totales * 0.78,
            deuda: demo.fiscal.gastos_totales * (demo.fiscal.magnitud_deuda / 100),
            ejecucion_pct: demo.fiscal.ejecucion_gastos,
          },
          idf: {
            score: demo.fiscal.idf,
            categoria: demo.fiscal.idf >= 80 ? "sostenible" :
                       demo.fiscal.idf >= 70 ? "solvente" :
                       demo.fiscal.idf >= 60 ? "vulnerable" : "deterioro",
            ranking_dpto: Math.round(125 - (demo.fiscal.idf - 45) * 2.5),
            indicadores: {
              autofinanciamiento_funcionamiento: 100 - demo.fiscal.capacidad_ahorro * 2,
              respaldo_deuda: demo.fiscal.magnitud_deuda,
              dependencia_transferencias: demo.fiscal.dependencia_transferencias,
              generacion_recursos_propios: 100 - demo.fiscal.dependencia_transferencias,
              magnitud_inversion: 75 + Math.random() * 15,
              capacidad_ahorro: demo.fiscal.capacidad_ahorro,
            },
          },
          cartera: {
            total: demo.fiscal.recaudo_predial * 0.15,
            predial: demo.fiscal.recaudo_predial * 0.1,
            ica: demo.fiscal.recaudo_ica * 0.08,
            edad_promedio_dias: 180 + Math.floor(Math.random() * 180),
          },
        };

        return NextResponse.json({
          success: true,
          source: "demo",
          data: fiscalData,
        });
      }
    }

    // No data found at all
    return NextResponse.json(
      {
        success: false,
        source: "api",
        data: null,
        error: `No fiscal data found for municipality ${code}`,
      },
      { status: 404 }
    );
  }
}
