/**
 * Equilibrio CGA — Evaluation for Contraloria General de la Republica
 *
 * 8 checks:
 * 1. Equilibrio Presupuestal Inicial (Ingresos = Gastos)
 * 2. Equilibrio Presupuestal Definitivo (Ingresos = Gastos)
 * 3. Reservas 2025: FUT Cierre vs CUIPO calculated
 * 4. CxP 2025: FUT Cierre vs CUIPO calculated
 * 5. Superavit 2025: FUT Cierre vs CUIPO calculated
 * 6. Reservas 2024 → Ejecucion 2025 (cross-vigencia)
 * 7. CxP 2024 → Ejecucion 2025 (cross-vigencia)
 * 8. Superavit 2024 (informational from FUT)
 */

import { sodaCuipoQuery, CUIPO_DATASETS } from "@/lib/datos-gov-cuipo";
import type { FUTCierreData } from "@/lib/chip-parser";

export interface CGACheck {
  name: string;
  group: "equilibrio" | "vigencia_2025" | "cross_vigencia" | "superavit";
  value1: number;
  value1Label: string;
  value2: number;
  value2Label: string;
  difference: number;
  tolerance: number;
  status: "cumple" | "no_cumple" | "pendiente";
}

export interface CGAResult {
  checks: CGACheck[];
  status: "cumple" | "no_cumple" | "pendiente";
}

export async function evaluateCGA(
  chipCode: string,
  periodo: string,
  futCierre2025?: FUTCierreData | null,
  futCierre2024?: FUTCierreData | null,
  equilibrioData?: {
    pptoInicialIngresos: number;
    pptoInicialGastos: number;
    pptoDefinitivoIngresos: number;
    pptoDefinitivoGastos: number;
    totalReservas: number;
    totalCxP: number;
    superavit: number;
  } | null,
): Promise<CGAResult> {
  // Fetch programming totals for expenses (VIGENCIA ACTUAL)
  const progGas = await sodaCuipoQuery<{
    apropiacion_inicial: string;
    apropiacion_definitiva: string;
  }>({
    dataset: CUIPO_DATASETS.PROG_GASTOS,
    select:
      "sum(apropiacion_inicial) as apropiacion_inicial, sum(apropiacion_definitiva) as apropiacion_definitiva",
    where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta='2' AND cod_vigencia_del_gasto='1'`,
    limit: 1,
  });

  const pptoInicialGasAPI = parseFloat(
    progGas[0]?.apropiacion_inicial || "0",
  );
  const pptoDefinitivoGasAPI = parseFloat(
    progGas[0]?.apropiacion_definitiva || "0",
  );

  // Fetch execution totals (for reserves, CxP, superavit calculations)
  const [ejecIng, ejecGas] = await Promise.all([
    sodaCuipoQuery<{ total_recaudo: string }>({
      dataset: CUIPO_DATASETS.EJEC_INGRESOS,
      select: "sum(total_recaudo) as total_recaudo",
      where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta='1'`,
      limit: 1,
    }),
    sodaCuipoQuery<{
      compromisos: string;
      obligaciones: string;
      pagos: string;
    }>({
      dataset: CUIPO_DATASETS.EJEC_GASTOS,
      select:
        "sum(compromisos) as compromisos, sum(obligaciones) as obligaciones, sum(pagos) as pagos",
      where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta='2' AND nom_vigencia_del_gasto='VIGENCIA ACTUAL'`,
      limit: 1,
    }),
  ]);

  const totalRecaudo = parseFloat(ejecIng[0]?.total_recaudo || "0");
  const totalCompromisos = parseFloat(ejecGas[0]?.compromisos || "0");
  const totalObligaciones = parseFloat(ejecGas[0]?.obligaciones || "0");
  const totalPagos = parseFloat(ejecGas[0]?.pagos || "0");

  const reservasCalc = Math.max(0, totalCompromisos - totalObligaciones);
  const cxpCalc = Math.max(0, totalObligaciones - totalPagos);

  // Fetch cross-vigencia programming (RESERVAS and CxP vigencias from CUIPO)
  const [progReservas, progCxP] = await Promise.all([
    sodaCuipoQuery<{ total: string }>({
      dataset: CUIPO_DATASETS.PROG_GASTOS,
      select: "sum(apropiacion_definitiva) as total",
      where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta='2' AND nom_vigencia_del_gasto='RESERVAS'`,
      limit: 1,
    }),
    sodaCuipoQuery<{ total: string }>({
      dataset: CUIPO_DATASETS.PROG_GASTOS,
      select: "sum(apropiacion_definitiva) as total",
      where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta='2' AND nom_vigencia_del_gasto='CUENTAS POR PAGAR'`,
      limit: 1,
    }),
  ]);

  const reservas2025CUIPO = parseFloat(progReservas[0]?.total || "0");
  const cxp2025CUIPO = parseFloat(progCxP[0]?.total || "0");

  // --- Build checks ---
  const checks: CGACheck[] = [];

  // ---- Group: Equilibrio Presupuestal ----

  // Check 1: Presupuesto Inicial I = G
  const pptoIniIng = equilibrioData?.pptoInicialIngresos ?? 0;
  const pptoIniGas =
    equilibrioData?.pptoInicialGastos ?? pptoInicialGasAPI;
  const diffIni = pptoIniIng - pptoIniGas;
  checks.push({
    name: "Equilibrio Presupuestal Inicial",
    group: "equilibrio",
    value1: pptoIniIng,
    value1Label: "Ppto Inicial Ingresos",
    value2: pptoIniGas,
    value2Label: "Ppto Inicial Gastos",
    difference: diffIni,
    tolerance: 1_000_000,
    status:
      pptoIniIng === 0
        ? "pendiente"
        : Math.abs(diffIni) <= 1_000_000
          ? "cumple"
          : "no_cumple",
  });

  // Check 2: Presupuesto Definitivo I = G
  const pptoDefIng = equilibrioData?.pptoDefinitivoIngresos ?? 0;
  const pptoDefGas =
    equilibrioData?.pptoDefinitivoGastos ?? pptoDefinitivoGasAPI;
  const diffDef = pptoDefIng - pptoDefGas;
  checks.push({
    name: "Equilibrio Presupuestal Definitivo",
    group: "equilibrio",
    value1: pptoDefIng,
    value1Label: "Ppto Definitivo Ingresos",
    value2: pptoDefGas,
    value2Label: "Ppto Definitivo Gastos",
    difference: diffDef,
    tolerance: 1_000_000,
    status:
      pptoDefIng === 0
        ? "pendiente"
        : Math.abs(diffDef) <= 1_000_000
          ? "cumple"
          : "no_cumple",
  });

  // ---- Group: Vigencia 2025 ----

  // Check 3: Reservas 2025 FUT vs CUIPO
  const reservasFUT = futCierre2025?.total?.reservasPresupuestales ?? 0;
  const reservasCUIPO = equilibrioData?.totalReservas ?? reservasCalc;
  const diffReservas = reservasCUIPO - reservasFUT;
  checks.push({
    name: "Reservas Presupuestales 2025",
    group: "vigencia_2025",
    value1: reservasFUT,
    value1Label: "Reservas FUT Cierre 2025",
    value2: reservasCUIPO,
    value2Label: "Reservas calculadas CUIPO",
    difference: diffReservas,
    tolerance: 0,
    status: !futCierre2025
      ? "pendiente"
      : Math.abs(diffReservas) <= 1
        ? "cumple"
        : "no_cumple",
  });

  // Check 4: CxP 2025 FUT vs CUIPO
  const cxpFUT = futCierre2025?.total?.cuentasPorPagarVigencia ?? 0;
  const cxpCUIPO = equilibrioData?.totalCxP ?? cxpCalc;
  const diffCxP = cxpCUIPO - cxpFUT;
  checks.push({
    name: "Cuentas por Pagar 2025",
    group: "vigencia_2025",
    value1: cxpFUT,
    value1Label: "CxP FUT Cierre 2025",
    value2: cxpCUIPO,
    value2Label: "CxP calculadas CUIPO",
    difference: diffCxP,
    tolerance: 0,
    status: !futCierre2025
      ? "pendiente"
      : Math.abs(diffCxP) <= 1
        ? "cumple"
        : "no_cumple",
  });

  // ---- Group: Superavit ----

  // Check 5: Superavit 2025 FUT vs CUIPO
  const superavitFUT = futCierre2025?.total?.saldoEnLibros ?? 0;
  const superavitCUIPO =
    equilibrioData?.superavit ?? totalRecaudo - totalCompromisos;
  const diffSuperavit = superavitCUIPO - superavitFUT;
  checks.push({
    name: "Superávit Fiscal 2025",
    group: "superavit",
    value1: superavitFUT,
    value1Label: "Superávit FUT Cierre 2025",
    value2: superavitCUIPO,
    value2Label: "Superávit calculado CUIPO",
    difference: diffSuperavit,
    tolerance: 4,
    status: !futCierre2025
      ? "pendiente"
      : Math.abs(diffSuperavit) <= 4
        ? "cumple"
        : "no_cumple",
  });

  // ---- Group: Cross-vigencia 2024 → 2025 ----

  // Check 6: Reservas 2024 → Ejecucion 2025
  const reservas2024FUT =
    futCierre2024?.total?.reservasPresupuestales ?? 0;
  const diffReservasCross = reservas2025CUIPO - reservas2024FUT;
  checks.push({
    name: "Reservas 2024 → Ejecución 2025",
    group: "cross_vigencia",
    value1: reservas2024FUT,
    value1Label: "Reservas FUT Cierre 2024",
    value2: reservas2025CUIPO,
    value2Label: "Reservas CUIPO 2025 (vigencia RESERVAS)",
    difference: diffReservasCross,
    tolerance: 0,
    status: !futCierre2024
      ? "pendiente"
      : Math.abs(diffReservasCross) <= 1
        ? "cumple"
        : "no_cumple",
  });

  // Check 7: CxP 2024 → Ejecucion 2025
  const cxp2024FUT =
    futCierre2024?.total?.cuentasPorPagarVigencia ?? 0;
  const diffCxPCross = cxp2025CUIPO - cxp2024FUT;
  checks.push({
    name: "CxP 2024 → Ejecución 2025",
    group: "cross_vigencia",
    value1: cxp2024FUT,
    value1Label: "CxP FUT Cierre 2024",
    value2: cxp2025CUIPO,
    value2Label: "CxP CUIPO 2025 (vigencia CXP)",
    difference: diffCxPCross,
    tolerance: 0,
    status: !futCierre2024
      ? "pendiente"
      : Math.abs(diffCxPCross) <= 1
        ? "cumple"
        : "no_cumple",
  });

  // Check 8: Superavit 2024 (informational — no CUIPO comparison)
  const superavit2024FUT = futCierre2024?.total?.saldoEnLibros ?? 0;
  checks.push({
    name: "Superávit Fiscal 2024",
    group: "cross_vigencia",
    value1: superavit2024FUT,
    value1Label: "Superávit FUT Cierre 2024",
    value2: 0,
    value2Label: "Sin comparación CUIPO",
    difference: 0,
    tolerance: 0,
    status: !futCierre2024 ? "pendiente" : "cumple",
  });

  // Determine global status
  const hasPendiente = checks.some((c) => c.status === "pendiente");
  const hasNoCumple = checks.some((c) => c.status === "no_cumple");
  const globalStatus: CGAResult["status"] = hasNoCumple
    ? "no_cumple"
    : hasPendiente
      ? "pendiente"
      : "cumple";

  return {
    checks,
    status: globalStatus,
  };
}
