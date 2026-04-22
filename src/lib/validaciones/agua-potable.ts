/**
 * Agua Potable y Saneamiento Basico — Ministerio de Vivienda evaluation
 *
 * 5 sub-validations:
 * 1. Asignacion de Recursos: Presupuesto Definitivo SGP APSB vs Distribucion SICODIS
 * 2. Ejecucion de Recursos: Compromisos Agua Potable / Distribucion SICODIS >= 75%
 * 3. Deficit Presupuestal: Recursos Disponibles - Compromisos >= 0
 * 4. Balance subsidios vs contribuciones: desglose acueducto/alcantarillado/aseo
 * 5. Pago de subsidios: total subsidios > 0
 *
 * Data sources: CUIPO SODA API (datos.gov.co) + SICODIS DNP API
 */

import {
  sodaCuipoQuery,
  CUIPO_DATASETS,
  parsePeriodo,
  type CuipoEjecIngresos,
  type CuipoEjecGastos,
} from "@/lib/datos-gov-cuipo";
import type { CuipoProgIngresosRow } from "@/lib/chip-parser";
import { sumProgramacionUploadByPrefixes } from "@/lib/cuipo-processor";
import {
  fetchSGPResumen,
  SGP_CONCEPTOS,
  type SGPResumenParticipacion,
} from "@/lib/sicodis";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AguaPotableSubValidacion {
  nombre: string;
  valor1: number | null;
  valor1Label: string;
  valor2: number | null;
  valor2Label: string;
  porcentaje: number | null;
  umbral: number | null; // e.g., 0.75 for 75%
  status: "cumple" | "no_cumple" | "pendiente";
}

export interface AguaPotableResult {
  municipio: string;
  codigoDane: string;
  distribucionSICODIS: number;
  presupuestoDefinitivo: number | null;
  hasProgramacionData: boolean;
  subValidaciones: AguaPotableSubValidacion[];
  subsidiosDetalle: {
    acueducto: number;
    alcantarillado: number;
    aseo: number;
    totalSubsidios: number;
    contribucionesSolidaridad: number;
    balance: number;
  };
  status: "cumple" | "parcial" | "no_cumple";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safePct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 10000) / 100;
}

function safeRatio(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

// ---------------------------------------------------------------------------
// Main evaluation
// ---------------------------------------------------------------------------

export async function evaluateAguaPotable(
  chipCode: string,
  daneCode: string,
  deptCode: string,
  periodo: string,
  sgpTotal?: number,
  progIngresosUpload?: CuipoProgIngresosRow[] | null,
): Promise<AguaPotableResult> {
  const { year } = parsePeriodo(periodo);

  // -------------------------------------------------------------------------
  // 1. Fetch all data in parallel
  // -------------------------------------------------------------------------
  const [
    sicodisData,
    ejecIngresosApsb,
    ejecGastosApsb,
    ejecGastosSubsidios,
    ejecIngresosContribuciones,
    ejecGastosEquilibrio,
  ] = await Promise.all([
    // SICODIS distribution for SGP
    fetchSGPResumen(year, deptCode, daneCode).catch(
      (): SGPResumenParticipacion[] => [],
    ),

    // Income execution for SGP Agua Potable account (1.1.02.06.001.05)
    sodaCuipoQuery<CuipoEjecIngresos>({
      dataset: CUIPO_DATASETS.EJEC_INGRESOS,
      where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta='1.1.02.06.001.05'`,
      limit: 10,
      order: "cuenta ASC",
    }),

    // Expense execution for Agua Potable funding source, VIGENCIA ACTUAL
    sodaCuipoQuery<CuipoEjecGastos>({
      dataset: CUIPO_DATASETS.EJEC_GASTOS,
      select: "sum(compromisos) as compromisos, sum(obligaciones) as obligaciones, sum(pagos) as pagos",
      where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND nom_fuentes_financiacion like '%AGUA POTABLE%' AND nom_vigencia_del_gasto='VIGENCIA ACTUAL'`,
      limit: 1,
    }),

    // Subsidios: EJEC_GASTOS where cuenta starts with subsidy accounts, fuente AGUA POTABLE
    // 2.3.3.01.02.004 = subsidios agua (servicios publicos)
    // 2.3.3.01.04.004 = subsidios agua (transferencias)
    sodaCuipoQuery<CuipoEjecGastos & { cuenta: string }>({
      dataset: CUIPO_DATASETS.EJEC_GASTOS,
      select: "cuenta, sum(compromisos) as compromisos",
      where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND nom_fuentes_financiacion like '%AGUA POTABLE%' AND (cuenta like '2.3.3.01.02.004%' OR cuenta like '2.3.3.01.04.004%')`,
      group: "cuenta",
      limit: 100,
    }),

    // Contribuciones de solidaridad: EJEC_INGRESOS where cuenta starts with 1.1.01.02.217
    sodaCuipoQuery<CuipoEjecIngresos & { cuenta: string }>({
      dataset: CUIPO_DATASETS.EJEC_INGRESOS,
      select: "cuenta, sum(total_recaudo) as total_recaudo",
      where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta like '1.1.01.02.217%'`,
      group: "cuenta",
      limit: 100,
    }),

    // Equilibrio: Total recursos disponibles for Agua Potable funding source (all vigencias)
    // This gives us recaudo + compromisos to calculate deficit
    sodaCuipoQuery<{ recaudo: string; compromisos: string }>({
      dataset: CUIPO_DATASETS.EJEC_GASTOS,
      select: "sum(compromisos) as compromisos",
      where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND nom_fuentes_financiacion like '%AGUA POTABLE%'`,
      limit: 1,
    }),
  ]);

  // -------------------------------------------------------------------------
  // 2. Extract SICODIS Agua Potable distribution
  // -------------------------------------------------------------------------
  let distribucionSICODIS = 0;
  for (const row of sicodisData) {
    if (row.id_concepto === SGP_CONCEPTOS.AGUA_POTABLE && typeof row.total === "number") {
      distribucionSICODIS = row.total;
    }
  }
  // Fallback: if sgpTotal provided and no SICODIS data for water specifically
  if (distribucionSICODIS === 0 && sgpTotal && sgpTotal > 0) {
    // sgpTotal is the total SGP from municipios data, we can't derive
    // the agua potable component from it alone — leave at 0
  }

  // -------------------------------------------------------------------------
  // 3. Extract presupuesto definitivo only from uploaded CHIP PROG_ING
  // -------------------------------------------------------------------------
  const programacionApsb = sumProgramacionUploadByPrefixes(
    progIngresosUpload,
    ["1.1.02.06.001.05"],
    "presupuestoDefinitivo"
  );
  const presupuestoDefinitivo = programacionApsb.total;
  const hasProgramacionApsb = programacionApsb.hasData;

  let recaudoApsb = 0;
  for (const row of ejecIngresosApsb) {
    recaudoApsb = parseFloat(row.total_recaudo || "0");
  }

  // -------------------------------------------------------------------------
  // 4. Extract compromisos Agua Potable (VIGENCIA ACTUAL)
  // -------------------------------------------------------------------------
  const compromisosAguaPotable = parseFloat(ejecGastosApsb[0]?.compromisos || "0");

  // -------------------------------------------------------------------------
  // 5. Extract total compromisos all vigencias for deficit calculation
  // -------------------------------------------------------------------------
  const compromisosAllVigencias = parseFloat(ejecGastosEquilibrio[0]?.compromisos || "0");

  // -------------------------------------------------------------------------
  // 6. Calculate subsidies breakdown
  //    Account structure:
  //    2.3.3.01.02.004.XX or 2.3.3.01.04.004.XX
  //      .01 = acueducto
  //      .02 = alcantarillado
  //      .03 = aseo
  // -------------------------------------------------------------------------
  let subsidioAcueducto = 0;
  let subsidioAlcantarillado = 0;
  let subsidioAseo = 0;

  for (const row of ejecGastosSubsidios) {
    const cuenta = row.cuenta || "";
    const compromisos = parseFloat(row.compromisos || "0");

    if (cuenta.includes(".004.01")) {
      subsidioAcueducto += compromisos;
    } else if (cuenta.includes(".004.02")) {
      subsidioAlcantarillado += compromisos;
    } else if (cuenta.includes(".004.03")) {
      subsidioAseo += compromisos;
    } else {
      // Unclassified subsidy — add to acueducto as default
      subsidioAcueducto += compromisos;
    }
  }

  const totalSubsidios = subsidioAcueducto + subsidioAlcantarillado + subsidioAseo;

  // -------------------------------------------------------------------------
  // 7. Calculate contributions (solidaridad)
  //    Account structure:
  //    1.1.01.02.217.XX
  //      .01 = acueducto
  //      .02 = aseo
  //      .03 = alcantarillado
  // -------------------------------------------------------------------------
  let contribucionesSolidaridad = 0;
  for (const row of ejecIngresosContribuciones) {
    contribucionesSolidaridad += parseFloat(row.total_recaudo || "0");
  }

  const balanceSubsidios = totalSubsidios - contribucionesSolidaridad;

  // -------------------------------------------------------------------------
  // 8. Build sub-validations
  // -------------------------------------------------------------------------
  const subValidaciones: AguaPotableSubValidacion[] = [];

  // Sub 1: Asignacion de Recursos
  const pctAsignacion =
    presupuestoDefinitivo !== null
      ? safeRatio(presupuestoDefinitivo, distribucionSICODIS)
      : null;
  subValidaciones.push({
    nombre: "Asignacion de Recursos",
    valor1: presupuestoDefinitivo,
    valor1Label: "Presupuesto Definitivo SGP APSB",
    valor2: distribucionSICODIS,
    valor2Label: "Distribucion SICODIS",
    porcentaje:
      presupuestoDefinitivo !== null
        ? safePct(presupuestoDefinitivo, distribucionSICODIS)
        : null,
    umbral: null, // No fixed threshold — presupuesto >= distribucion
    status:
      distribucionSICODIS === 0 || !hasProgramacionApsb || presupuestoDefinitivo === null
        ? "pendiente"
        : presupuestoDefinitivo >= distribucionSICODIS
          ? "cumple"
          : "no_cumple",
  });

  // Sub 2: Ejecucion de Recursos
  const pctEjecucion = safeRatio(compromisosAguaPotable, distribucionSICODIS);
  subValidaciones.push({
    nombre: "Ejecucion de Recursos",
    valor1: compromisosAguaPotable,
    valor1Label: "Compromisos Agua Potable (Vig. Actual)",
    valor2: distribucionSICODIS,
    valor2Label: "Distribucion SICODIS",
    porcentaje: safePct(compromisosAguaPotable, distribucionSICODIS),
    umbral: 0.75,
    status:
      distribucionSICODIS === 0
        ? "pendiente"
        : pctEjecucion !== null && pctEjecucion >= 0.75
          ? "cumple"
          : "no_cumple",
  });

  // Sub 3: Deficit Presupuestal
  // Total Recursos Disponibles approximated from recaudo agua potable
  // minus compromisos all vigencias
  const recursosDisponibles = recaudoApsb;
  const deficit = recursosDisponibles - compromisosAllVigencias;
  subValidaciones.push({
    nombre: "Deficit Presupuestal",
    valor1: recursosDisponibles,
    valor1Label: "Recursos Disponibles (Recaudo APSB)",
    valor2: compromisosAllVigencias,
    valor2Label: "Compromisos (todas vigencias)",
    porcentaje: safePct(compromisosAllVigencias, recursosDisponibles),
    umbral: null,
    status:
      recursosDisponibles === 0 && compromisosAllVigencias === 0
        ? "pendiente"
        : deficit >= 0
          ? "cumple"
          : "no_cumple",
  });

  // Sub 4: Balance subsidios vs contribuciones
  subValidaciones.push({
    nombre: "Balance Subsidios vs Contribuciones",
    valor1: totalSubsidios,
    valor1Label: "Total Subsidios Otorgados",
    valor2: contribucionesSolidaridad,
    valor2Label: "Contribuciones de Solidaridad",
    porcentaje: safePct(contribucionesSolidaridad, totalSubsidios),
    umbral: null, // Informational
    status: "cumple", // Informational — always cumple unless negative contributions
  });

  // Sub 5: Pago de subsidios
  subValidaciones.push({
    nombre: "Pago de Subsidios",
    valor1: totalSubsidios,
    valor1Label: "Total Subsidios",
    valor2: 0,
    valor2Label: "Umbral minimo",
    porcentaje: null,
    umbral: null,
    status: totalSubsidios > 0 ? "cumple" : "no_cumple",
  });

  // -------------------------------------------------------------------------
  // 9. Determine global status
  // -------------------------------------------------------------------------
  const cumpleCount = subValidaciones.filter((s) => s.status === "cumple").length;
  const noCumpleCount = subValidaciones.filter((s) => s.status === "no_cumple").length;
  const pendienteCount = subValidaciones.filter((s) => s.status === "pendiente").length;

  let status: "cumple" | "parcial" | "no_cumple";
  if (noCumpleCount === 0 && pendienteCount === 0) {
    status = "cumple";
  } else if (cumpleCount === 0 && pendienteCount === 0) {
    status = "no_cumple";
  } else {
    status = "parcial";
  }

  return {
    municipio: "", // To be populated by caller with municipality name
    codigoDane: daneCode,
    distribucionSICODIS,
    presupuestoDefinitivo,
    hasProgramacionData: hasProgramacionApsb,
    subValidaciones,
    subsidiosDetalle: {
      acueducto: subsidioAcueducto,
      alcantarillado: subsidioAlcantarillado,
      aseo: subsidioAseo,
      totalSubsidios,
      contribucionesSolidaridad,
      balance: balanceSubsidios,
    },
    status,
  };
}
