import { NextRequest, NextResponse } from "next/server";
import {
  fetchPeriodosDisponibles,
  fetchIngresosPorFuente,
  fetchGastosPorFuente,
} from "@/lib/datos-gov-cuipo";
import { evaluateSGP } from "@/lib/validaciones/sgp";
import { evaluateLey617 } from "@/lib/validaciones/ley617";
import { calculateIDF } from "@/lib/validaciones/idf";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");
  const chipCode = searchParams.get("chip");

  if (!chipCode) {
    return NextResponse.json({ ok: false, error: "Falta parámetro chip" }, { status: 400 });
  }

  try {
    switch (action) {
      case "periodos": {
        const periodos = await fetchPeriodosDisponibles(chipCode);
        return NextResponse.json({ ok: true, periodos });
      }

      case "equilibrio": {
        const periodo = searchParams.get("periodo");
        if (!periodo) {
          return NextResponse.json(
            { ok: false, error: "Falta parámetro periodo" },
            { status: 400 }
          );
        }

        // Fetch income and expenses by funding source in parallel
        const [ingresos, gastos] = await Promise.all([
          fetchIngresosPorFuente(chipCode, periodo),
          fetchGastosPorFuente(chipCode, periodo),
        ]);

        // Build equilibrium by funding source
        const fuenteMap = new Map<
          string,
          {
            codigo: string;
            nombre: string;
            recaudo: number;
            compromisos: number;
            obligaciones: number;
            pagos: number;
          }
        >();

        // Aggregate income by source
        for (const row of ingresos) {
          const key = row.cod_fuentes_financiacion || "SIN_FUENTE";
          const existing = fuenteMap.get(key) || {
            codigo: key,
            nombre: row.nom_fuentes_financiacion || "Sin clasificar",
            recaudo: 0,
            compromisos: 0,
            obligaciones: 0,
            pagos: 0,
          };
          existing.recaudo += parseFloat(row.total_recaudo || "0");
          fuenteMap.set(key, existing);
        }

        // Aggregate expenses by source (only VIGENCIA ACTUAL)
        for (const row of gastos) {
          if (row.nom_vigencia_del_gasto !== "VIGENCIA ACTUAL") continue;

          const key = row.cod_fuentes_financiacion || "SIN_FUENTE";
          const existing = fuenteMap.get(key) || {
            codigo: key,
            nombre: row.nom_fuentes_financiacion || "Sin clasificar",
            recaudo: 0,
            compromisos: 0,
            obligaciones: 0,
            pagos: 0,
          };
          existing.compromisos += parseFloat(row.compromisos || "0");
          existing.obligaciones += parseFloat(row.obligaciones || "0");
          existing.pagos += parseFloat(row.pagos || "0");
          fuenteMap.set(key, existing);
        }

        const porFuente = Array.from(fuenteMap.values()).map((f) => ({
          ...f,
          superavit: f.recaudo - f.compromisos,
        }));

        const totalIngresos = porFuente.reduce((s, f) => s + f.recaudo, 0);
        const totalGastos = porFuente.reduce((s, f) => s + f.compromisos, 0);
        const totalPagos = porFuente.reduce((s, f) => s + f.pagos, 0);
        const superavit = totalIngresos - totalGastos;
        const pctEjecucion = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;

        return NextResponse.json({
          ok: true,
          equilibrio: {
            totalIngresos,
            totalGastos,
            totalPagos,
            superavit,
            pctEjecucion,
            porFuente: porFuente.sort((a, b) => b.recaudo - a.recaudo),
          },
        });
      }

      case "sgp": {
        const periodo = searchParams.get("periodo");
        const dane = searchParams.get("dane");
        const dept = searchParams.get("dept");
        if (!periodo || !dane || !dept) {
          return NextResponse.json(
            { ok: false, error: "Faltan parámetros: periodo, dane, dept" },
            { status: 400 }
          );
        }

        const sgp = await evaluateSGP(chipCode, dane, dept, periodo);
        return NextResponse.json({ ok: true, sgp });
      }

      case "ley617": {
        const periodo = searchParams.get("periodo");
        if (!periodo) {
          return NextResponse.json(
            { ok: false, error: "Falta parámetro periodo" },
            { status: 400 }
          );
        }

        const categoriaParam = searchParams.get("categoria");
        const categoria = categoriaParam
          ? parseInt(categoriaParam, 10)
          : undefined;

        const ley617 = await evaluateLey617(chipCode, periodo, categoria);
        return NextResponse.json({ ok: true, ley617 });
      }

      case "idf": {
        const periodo = searchParams.get("periodo");
        if (!periodo) {
          return NextResponse.json(
            { ok: false, error: "Falta parámetro periodo" },
            { status: 400 }
          );
        }

        const idf = await calculateIDF(chipCode, periodo);
        return NextResponse.json({ ok: true, idf });
      }

      default:
        return NextResponse.json(
          {
            ok: false,
            error:
              "Acción no válida. Use: periodos, equilibrio, sgp, ley617, idf",
          },
          { status: 400 }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
