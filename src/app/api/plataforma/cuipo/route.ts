import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  fetchPeriodosDisponibles,
  fetchEjecucionIngresos,
  fetchEjecucionGastos,
  fetchLey617Certificacion,
  sodaCuipoQuery,
  CUIPO_DATASETS,
  classifyVigencia,
  filterLeafRows,
} from "@/lib/datos-gov-cuipo";
import { evaluateSGP } from "@/lib/validaciones/sgp";
import { evaluateLey617 } from "@/lib/validaciones/ley617";
import { calculateIDF } from "@/lib/validaciones/idf";
import { evaluateEficienciaFiscal } from "@/lib/validaciones/eficiencia-fiscal";
import { evaluateCGA } from "@/lib/validaciones/cga";
import { getConsolidacion } from "@/data/fuentes-consolidacion";
import {
  PLATAFORMA_AUTH_COOKIE_NAME,
  isPlataformaAuthConfigured,
  isValidPlataformaSessionToken,
} from "@/lib/plataforma-auth";

export async function GET(request: NextRequest) {
  if (!isPlataformaAuthConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "La autenticacion de la plataforma no esta configurada.",
      },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get(PLATAFORMA_AUTH_COOKIE_NAME)?.value;
  if (!isValidPlataformaSessionToken(authToken)) {
    return NextResponse.json(
      { ok: false, error: "No autenticado" },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");
  const chipCode = searchParams.get("chip");

  if (!chipCode || !/^\d{5,12}$/.test(chipCode)) {
    return NextResponse.json({ ok: false, error: "Parámetro chip inválido" }, { status: 400 });
  }

  // Validate periodo format if present (used by multiple actions)
  const periodo = searchParams.get("periodo");
  if (periodo && !/^\d{6,8}$/.test(periodo)) {
    return NextResponse.json({ ok: false, error: "Parámetro periodo inválido" }, { status: 400 });
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
        const ingresos = filterLeafRows(ingresosRaw, r => r.cuenta || "");
        const gastos = filterLeafRows(gastosRaw, r => r.cuenta || "");

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

          const vig = classifyVigencia(row.nom_vigencia_del_gasto || "");
          const compromisos = parseFloat(row.compromisos || "0");
          const obligaciones = parseFloat(row.obligaciones || "0");
          const pagos = parseFloat(row.pagos || "0");

          if (vig === 'va') {
            existing.compromisos_va += compromisos;
            existing.obligaciones_va += obligaciones;
            existing.pagos_va += pagos;
          } else if (vig === 'reservas') {
            existing.compromisos_res += compromisos;
            existing.pagos_res += pagos;
          } else if (vig === 'cxp') {
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

        // Overrides de porcentajes de fondos vía query string:
        //   &fondos=contingencias:0.01,gestion_riesgo:0.01,otros:0.005
        // Cada par es "<id>:<fraccion 0-1>". Los fondos no listados quedan en 0%.
        const fondosParam = searchParams.get("fondos");
        const fondosPorId: Record<string, { porcentaje: number }> = {};
        if (fondosParam) {
          for (const pair of fondosParam.split(",")) {
            const [id, val] = pair.split(":").map((s) => s.trim());
            const pct = parseFloat(val);
            if (id && Number.isFinite(pct)) {
              fondosPorId[id] = { porcentaje: pct };
            }
          }
        }

        // Origen de datos:
        //   ?source=local|api|auto (default auto: local si existe archivo, si no api)
        const sourceParam = (searchParams.get("source") || "").toLowerCase();
        const dataSource: "local" | "api" | "auto" =
          sourceParam === "local" || sourceParam === "api"
            ? sourceParam
            : "auto";

        // El lector local se carga dinámicamente (sólo server-side, fs/path/os).
        // Para "auto", primero verificamos si existe archivo del periodo.
        let localFetchers: Parameters<typeof evaluateLey617>[3] extends infer O
          ? O extends { localFetchers?: infer F }
            ? F
            : undefined
          : undefined = undefined;
        if (dataSource === "local" || dataSource === "auto") {
          try {
            const localMod = await import("@/lib/cuipo-local-xlsb");
            const hasLocal = localMod.hasLocalCuipo(periodo);
            if (hasLocal || dataSource === "local") {
              localFetchers = {
                fetchIngresos: localMod.fetchEjecucionIngresosLocal,
                fetchGastos: localMod.fetchGastosPorSeccionLocal,
              };
            }
          } catch (err) {
            // Si el módulo no carga (entorno edge/serverless sin fs), seguimos con API
            if (dataSource === "local") {
              return NextResponse.json(
                { ok: false, error: `dataSource=local no disponible: ${err}` },
                { status: 500 }
              );
            }
          }
        }

        const ley617 = await evaluateLey617(chipCode, periodo, categoria, {
          fondosPorId: Object.keys(fondosPorId).length ? fondosPorId : undefined,
          dataSource,
          localFetchers,
        });
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
