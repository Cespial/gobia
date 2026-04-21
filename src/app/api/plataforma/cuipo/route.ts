import { NextRequest, NextResponse } from "next/server";
import {
  fetchPeriodosDisponibles,
  fetchEjecucionIngresos,
  fetchEjecucionGastos,
  fetchLey617Certificacion,
  sodaCuipoQuery,
  CUIPO_DATASETS,
} from "@/lib/datos-gov-cuipo";
import { evaluateSGP } from "@/lib/validaciones/sgp";
import { evaluateLey617 } from "@/lib/validaciones/ley617";
import { calculateIDF } from "@/lib/validaciones/idf";
import { evaluateEficienciaFiscal } from "@/lib/validaciones/eficiencia-fiscal";
import { evaluateCGA } from "@/lib/validaciones/cga";
import { getConsolidacion } from "@/data/fuentes-consolidacion";

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

        // Fetch income, expenses (ALL vigencias), and programming totals in parallel
        // NOTE: PROG_INGRESOS (22ah-ddsj) has a non-standard schema where account codes
        // are in ambito_codigo, not cuenta, and monetary fields are TEXT with "NO APLICA".
        // Income programming is NOT available via API — only via file upload.
        // We use PROG_GASTOS for expense programming only.
        //
        // IMPORTANT: We fetch raw rows (with `cuenta`) instead of pre-aggregated data
        // so we can apply leaf-row detection and avoid double-counting parent+child rows.
        const [ingresosRaw, gastosRaw, progGasTotals] = await Promise.all([
          fetchEjecucionIngresos(chipCode, periodo),
          fetchEjecucionGastos(chipCode, periodo),
          sodaCuipoQuery<{ apropiacion_inicial: string; apropiacion_definitiva: string }>({
            dataset: CUIPO_DATASETS.PROG_GASTOS,
            select: "sum(apropiacion_inicial) as apropiacion_inicial, sum(apropiacion_definitiva) as apropiacion_definitiva",
            where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta='2' AND cod_vigencia_del_gasto='1'`,
            limit: 1,
          }),
        ]);

        // ---------------------------------------------------------------
        // Leaf-row detection: filter out parent/aggregation rows to
        // prevent double-counting (parent = sum of children).
        // A row is a "leaf" if no other row's cuenta starts with its cuenta + "."
        // ---------------------------------------------------------------
        const ingCuentas = new Set(ingresosRaw.map(r => (r.cuenta || "").trim()));
        const ingresos = ingresosRaw.filter(r => {
          const cuenta = (r.cuenta || "").trim();
          if (!cuenta) return true; // rows without cuenta pass through
          const prefix = cuenta + ".";
          for (const c of ingCuentas) {
            if (c.startsWith(prefix)) return false;
          }
          return true;
        });

        const gasCuentas = new Set(gastosRaw.map(r => (r.cuenta || "").trim()));
        const gastos = gastosRaw.filter(r => {
          const cuenta = (r.cuenta || "").trim();
          if (!cuenta) return true;
          const prefix = cuenta + ".";
          for (const c of gasCuentas) {
            if (c.startsWith(prefix)) return false;
          }
          return true;
        });

        // Build equilibrium by funding source, processing ALL vigencias
        const fuenteMap = new Map<
          string,
          {
            codigo: string;
            nombre: string;
            recaudo: number;
            compromisos_va: number;
            obligaciones_va: number;
            pagos_va: number;
            compromisos_res: number;
            pagos_res: number;
            compromisos_cxp: number;
            pagos_cxp: number;
          }
        >();

        const emptyFuente = (key: string, nombre: string) => ({
          codigo: key,
          nombre,
          recaudo: 0,
          compromisos_va: 0,
          obligaciones_va: 0,
          pagos_va: 0,
          compromisos_res: 0,
          pagos_res: 0,
          compromisos_cxp: 0,
          pagos_cxp: 0,
        });

        // Aggregate income by source (leaf rows only — parents already filtered)
        for (const row of ingresos) {
          const key = (row.cod_fuentes_financiacion || "").trim() || "SIN_FUENTE";
          const existing = fuenteMap.get(key) || emptyFuente(key, row.nom_fuentes_financiacion || "Sin clasificar");
          existing.recaudo += parseFloat(row.total_recaudo || "0");
          fuenteMap.set(key, existing);
        }

        // Aggregate expenses by source, classifying by vigencia type (leaf rows only)
        for (const row of gastos) {
          const key = (row.cod_fuentes_financiacion || "").trim() || "SIN_FUENTE";
          const existing = fuenteMap.get(key) || emptyFuente(key, row.nom_fuentes_financiacion || "Sin clasificar");

          const vigencia = (row.nom_vigencia_del_gasto || "").toUpperCase();
          const compromisos = parseFloat(row.compromisos || "0");
          const obligaciones = parseFloat(row.obligaciones || "0");
          const pagos = parseFloat(row.pagos || "0");

          if (vigencia === "VIGENCIA ACTUAL") {
            existing.compromisos_va += compromisos;
            existing.obligaciones_va += obligaciones;
            existing.pagos_va += pagos;
          } else if (vigencia.includes("RESERVA")) {
            existing.compromisos_res += compromisos;
            existing.pagos_res += pagos;
          } else if (vigencia.includes("CUENTAS POR PAGAR")) {
            existing.compromisos_cxp += compromisos;
            existing.pagos_cxp += pagos;
          }

          fuenteMap.set(key, existing);
        }

        // Calculate derived fields per funding source
        // Filter out aggregation rows without a real funding source (SIN_FUENTE)
        const porFuente = Array.from(fuenteMap.values())
          .filter((f) => f.codigo !== "SIN_FUENTE")
          .map((f) => {
            const reservas_va = Math.max(0, f.compromisos_va - f.obligaciones_va);
            const cxp_va = Math.max(0, f.obligaciones_va - f.pagos_va);
            const superavit = f.recaudo - f.compromisos_va;
            const reservasVigAnterior = f.compromisos_res - f.pagos_res;
            const cxpVigAnterior = f.compromisos_cxp - f.pagos_cxp;
            const saldoEnLibros = superavit + reservas_va + cxp_va + reservasVigAnterior + cxpVigAnterior;
            const validador = f.compromisos_va - f.pagos_va - reservas_va - cxp_va;

            return {
              codigo: f.codigo,
              nombre: f.nombre,
              consolidacion: getConsolidacion(f.codigo),
              recaudo: f.recaudo,
              compromisos: f.compromisos_va,
              obligaciones: f.obligaciones_va,
              pagos: f.pagos_va,
              reservas: reservas_va,
              cxp: cxp_va,
              superavit,
              validador,
              reservasVigAnterior,
              cxpVigAnterior,
              saldoEnLibros,
            };
          });

        const totalIngresos = porFuente.reduce((s, f) => s + f.recaudo, 0);
        const totalCompromisos = porFuente.reduce((s, f) => s + f.compromisos, 0);
        const totalObligaciones = porFuente.reduce((s, f) => s + f.obligaciones, 0);
        const totalPagos = porFuente.reduce((s, f) => s + f.pagos, 0);
        const totalReservas = porFuente.reduce((s, f) => s + f.reservas, 0);
        const totalCxP = porFuente.reduce((s, f) => s + f.cxp, 0);
        const superavit = totalIngresos - totalCompromisos;
        const saldoEnLibros = porFuente.reduce((s, f) => s + f.saldoEnLibros, 0);
        const pctEjecucion = totalIngresos > 0 ? (totalCompromisos / totalIngresos) * 100 : 0;
        const totalReservasVigAnterior = porFuente.reduce((s, f) => s + f.reservasVigAnterior, 0);
        const totalCxpVigAnterior = porFuente.reduce((s, f) => s + f.cxpVigAnterior, 0);
        const totalValidador = porFuente.reduce((s, f) => s + f.validador, 0);

        // Programming totals
        const pptoInicialGastos = parseFloat(progGasTotals[0]?.apropiacion_inicial || "0");
        const pptoDefinitivoGastos = parseFloat(progGasTotals[0]?.apropiacion_definitiva || "0");
        // Income programming NOT available via API (PROG_INGRESOS has broken schema)
        // These will be enriched client-side when user uploads CUIPO PROG_ING file
        const pptoInicialIngresos = 0;
        const pptoDefinitivoIngresos = 0;
        const equilibrioInicial = pptoInicialIngresos > 0 ? pptoInicialIngresos - pptoInicialGastos : 0;
        const equilibrioDefinitivo = pptoDefinitivoIngresos > 0 ? pptoDefinitivoIngresos - pptoDefinitivoGastos : 0;

        return NextResponse.json({
          ok: true,
          equilibrio: {
            totalIngresos,
            totalCompromisos,
            totalGastos: totalCompromisos, // backwards compat alias
            totalObligaciones,
            totalPagos,
            totalReservas,
            totalCxP,
            superavit,
            saldoEnLibros,
            pctEjecucion,
            totalReservasVigAnterior,
            totalCxpVigAnterior,
            totalValidador,
            pptoInicialIngresos,
            pptoInicialGastos,
            pptoDefinitivoIngresos,
            pptoDefinitivoGastos,
            equilibrioInicial,
            equilibrioDefinitivo,
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

      case "ley617oficial": {
        const certifications = await fetchLey617Certificacion(chipCode);
        return NextResponse.json({ ok: true, certifications });
      }

      case "eficiencia": {
        const periodo = searchParams.get("periodo");
        if (!periodo) return NextResponse.json({ ok: false, error: "Falta parámetro periodo" }, { status: 400 });
        const eficiencia = await evaluateEficienciaFiscal(chipCode, periodo);
        return NextResponse.json({ ok: true, eficiencia });
      }

      case "cga": {
        const periodo = searchParams.get("periodo");
        if (!periodo) return NextResponse.json({ ok: false, error: "Falta parámetro periodo" }, { status: 400 });
        const cga = await evaluateCGA(chipCode, periodo);
        return NextResponse.json({ ok: true, cga });
      }

      default:
        return NextResponse.json(
          {
            ok: false,
            error:
              "Acción no válida. Use: periodos, equilibrio, sgp, ley617, ley617oficial, idf, eficiencia, cga",
          },
          { status: 400 }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
