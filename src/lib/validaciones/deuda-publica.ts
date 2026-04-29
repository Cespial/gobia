/**
 * Deuda Pública — Ley 358/1997 compliance validation
 *
 * Uses CGN Saldos (balance sheet) to calculate debt indicators.
 * SODA dataset 9ksa-mf4g is dead (data only to 2020), so we use CGN instead.
 */

interface CGNSaldosInput {
  activos: number;
  pasivos: number;
  rows: { codigo: string; nombre: string; saldoFinal: number; movDebito?: number }[];
}

export interface DeudaPublicaResult {
  saldoDeuda: number;
  servicioDeuda: number;
  ingresosCorrientes: number;
  ahorroOperacional: number;
  ratioSostenibilidad: number | null;
  ratioSolvencia: number | null;
  umbralSostenibilidad: number;
  umbralSolvencia: number;
  statusSostenibilidad: "cumple" | "no_cumple" | "no_aplica";
  statusSolvencia: "cumple" | "no_cumple" | "no_aplica";
  statusGlobal: "cumple" | "no_cumple" | "no_aplica";
  capacidadAutonoma: boolean;
  detalleDeuda: { codigo: string; nombre: string; saldo: number }[];
  notas: string[];
}

function sumCGNAccounts(
  rows: CGNSaldosInput["rows"],
  codes: string[],
  field: "saldoFinal" | "movDebito" = "saldoFinal"
): number {
  let total = 0;
  for (const row of rows) {
    const code = (row.codigo || "").trim();
    if (codes.includes(code)) {
      total += (field === "saldoFinal" ? row.saldoFinal : row.movDebito) ?? 0;
    }
  }
  return total;
}

export function evaluateDeudaPublica(
  cgnSaldos: CGNSaldosInput | null,
  equilibrio: {
    ingresosCorrientes?: number;
    gastosFuncionamiento?: number;
  } | null,
): DeudaPublicaResult | null {
  if (!cgnSaldos || !cgnSaldos.rows || cgnSaldos.rows.length === 0) {
    return null;
  }

  const UMBRAL_SOSTENIBILIDAD = 0.80;
  const UMBRAL_SOLVENCIA = 0.40;

  // 1. Saldo deuda total: CGN 2.2 (Crédito público) + 2.3 (Préstamos por pagar)
  const saldoCredito = sumCGNAccounts(cgnSaldos.rows, ["2.2"]);
  const saldoPrestamos = sumCGNAccounts(cgnSaldos.rows, ["2.3"]);
  const saldoDeuda = saldoCredito + saldoPrestamos;

  // 2. Servicio deuda: gastos financieros (5.1.11) + amortización (movimiento débito de 2.3)
  const gastosFinancieros = sumCGNAccounts(cgnSaldos.rows, ["5.1.11"]);
  const amortizacion = sumCGNAccounts(cgnSaldos.rows, ["2.3"], "movDebito");
  const servicioDeuda = gastosFinancieros + amortizacion;

  // 3. Ingresos corrientes and ahorro operacional
  const ingresosCorrientes = equilibrio?.ingresosCorrientes ?? 0;
  const gastosFuncionamiento = equilibrio?.gastosFuncionamiento ?? 0;
  const ahorroOperacional = ingresosCorrientes - gastosFuncionamiento;

  // Detalle deuda
  const detalleDeuda: { codigo: string; nombre: string; saldo: number }[] = [];
  for (const row of cgnSaldos.rows) {
    const code = (row.codigo || "").trim();
    if ((code === "2.2" || code === "2.3") && (row.saldoFinal ?? 0) > 0) {
      detalleDeuda.push({ codigo: code, nombre: row.nombre, saldo: row.saldoFinal });
    }
  }

  const notas: string[] = [];

  // Special case: no debt
  if (saldoDeuda === 0) {
    return {
      saldoDeuda: 0,
      servicioDeuda: 0,
      ingresosCorrientes,
      ahorroOperacional,
      ratioSostenibilidad: null,
      ratioSolvencia: null,
      umbralSostenibilidad: UMBRAL_SOSTENIBILIDAD,
      umbralSolvencia: UMBRAL_SOLVENCIA,
      statusSostenibilidad: "no_aplica",
      statusSolvencia: "no_aplica",
      statusGlobal: "no_aplica",
      capacidadAutonoma: true,
      detalleDeuda,
      notas: ["El municipio no reporta deuda financiera (CGN 2.2 + 2.3 = 0)."],
    };
  }

  // Calculate ratios
  const ratioSostenibilidad = ingresosCorrientes > 0 ? saldoDeuda / ingresosCorrientes : null;
  const ratioSolvencia = ahorroOperacional > 0 ? servicioDeuda / ahorroOperacional : null;

  const statusSostenibilidad: "cumple" | "no_cumple" | "no_aplica" =
    ratioSostenibilidad === null ? "no_aplica" :
    ratioSostenibilidad <= UMBRAL_SOSTENIBILIDAD ? "cumple" : "no_cumple";

  const statusSolvencia: "cumple" | "no_cumple" | "no_aplica" =
    ratioSolvencia === null ? "no_aplica" :
    ratioSolvencia <= UMBRAL_SOLVENCIA ? "cumple" : "no_cumple";

  const statusGlobal: "cumple" | "no_cumple" | "no_aplica" =
    statusSostenibilidad === "no_aplica" && statusSolvencia === "no_aplica" ? "no_aplica" :
    statusSostenibilidad !== "no_cumple" && statusSolvencia !== "no_cumple" ? "cumple" : "no_cumple";

  const capacidadAutonoma = statusGlobal === "cumple";

  if (ingresosCorrientes === 0) {
    notas.push("Ingresos corrientes no disponibles — sostenibilidad no calculable.");
  }
  if (ahorroOperacional <= 0) {
    notas.push("Ahorro operacional negativo o cero — solvencia no calculable.");
  }
  if (amortizacion === 0 && saldoDeuda > 0) {
    notas.push("Amortizacion no detectada en CGN (movimiento debito 2.3). Servicio de deuda puede estar subestimado.");
  }

  return {
    saldoDeuda,
    servicioDeuda,
    ingresosCorrientes,
    ahorroOperacional,
    ratioSostenibilidad,
    ratioSolvencia,
    umbralSostenibilidad: UMBRAL_SOSTENIBILIDAD,
    umbralSolvencia: UMBRAL_SOLVENCIA,
    statusSostenibilidad,
    statusSolvencia,
    statusGlobal,
    capacidadAutonoma,
    detalleDeuda,
    notas,
  };
}
