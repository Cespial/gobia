/**
 * Ley 617/2000 — ICLD rubros válidos, gastos deducibles, y fondos legales
 *
 * Extracted from the Excel template "2. Cálculo 617" sheet.
 * Only income registered under these CUIPO account codes counts as ICLD
 * for the Contraloría General de la República SI.17 indicator.
 */

// ---------------------------------------------------------------------------
// ICLD Valid Account Codes (columns N11:N65 from Excel)
// ---------------------------------------------------------------------------

/**
 * CUIPO account codes that CGR accepts as ICLD.
 * Income coded under other accounts does NOT count for SI.17.
 *
 * The formula sums: SUMIFS(EJEC_ING!total, cuenta=code, fuente="ICLD" OR fuente="SGP LD")
 */
export const ICLD_CUENTAS_VALIDAS: { codigo: string; nombre: string }[] = [
  // Impuestos directos
  { codigo: "1.1.01.01.200.01", nombre: "Impuesto predial unificado - urbano" },
  { codigo: "1.1.01.01.200.02", nombre: "Impuesto predial unificado - rural" },
  // Impuestos indirectos
  { codigo: "1.1.01.02.109", nombre: "Sobretasa a la gasolina" },
  { codigo: "1.1.01.02.200.01", nombre: "ICA - sobre actividades comerciales" },
  { codigo: "1.1.01.02.200.02", nombre: "ICA - sobre actividades industriales" },
  { codigo: "1.1.01.02.200.03", nombre: "ICA - sobre actividades de servicios" },
  { codigo: "1.1.01.02.201", nombre: "Impuesto complementario de avisos y tableros" },
  { codigo: "1.1.01.02.202", nombre: "Impuesto a la publicidad exterior visual" },
  { codigo: "1.1.01.02.203", nombre: "Impuesto de circulación y tránsito sobre vehículos de servicio público" },
  { codigo: "1.1.01.02.204", nombre: "Impuesto de delineación" },
  { codigo: "1.1.01.02.209", nombre: "Impuesto al degüello de ganado menor" },
  { codigo: "1.1.01.02.210", nombre: "Impuesto sobre teléfonos" },
  { codigo: "1.1.01.02.216", nombre: "Impuesto de espectáculos públicos municipal" },
  // Tasas y derechos
  { codigo: "1.1.02.02.063", nombre: "Certificados catastrales" },
  { codigo: "1.1.02.02.087", nombre: "Tasas por el derecho de parqueo sobre las vías públicas" },
  { codigo: "1.1.02.02.095", nombre: "Plaza de mercado" },
  { codigo: "1.1.02.02.102", nombre: "Derechos de tránsito" },
  { codigo: "1.1.02.02.134", nombre: "Otros derechos administrativos" },
  // Multas y sanciones
  { codigo: "1.1.02.03.001.03", nombre: "Sanciones disciplinarias" },
  { codigo: "1.1.02.03.001.04", nombre: "Sanciones contractuales" },
  { codigo: "1.1.02.03.001.05", nombre: "Sanciones administrativas" },
  { codigo: "1.1.02.03.001.06", nombre: "Sanciones fiscales" },
  { codigo: "1.1.02.03.001.11", nombre: "Sanciones tributarias" },
  { codigo: "1.1.02.03.001.21", nombre: "Multa por incumplimiento en el registro de marcas y herretes" },
  { codigo: "1.1.02.03.001.23", nombre: "Sanciones urbanísticas" },
  { codigo: "1.1.02.03.002", nombre: "Intereses de mora" },
  // Ventas de bienes y servicios (ambas fuentes)
  { codigo: "1.1.02.05.001.00", nombre: "VBS - Agricultura, silvicultura y pesca" },
  { codigo: "1.1.02.05.001.01", nombre: "VBS - Minerales; electricidad, gas y agua" },
  { codigo: "1.1.02.05.001.02", nombre: "VBS - Productos alimenticios, bebidas y tabaco" },
  { codigo: "1.1.02.05.001.03", nombre: "VBS - Otros bienes transportables" },
  { codigo: "1.1.02.05.001.04", nombre: "VBS - Productos metálicos, maquinaria y equipo" },
  { codigo: "1.1.02.05.001.05", nombre: "VBS - Construcción y servicios de la construcción" },
  { codigo: "1.1.02.05.001.06", nombre: "VBS - Comercio y distribución; alojamiento; transporte" },
  { codigo: "1.1.02.05.001.07", nombre: "VBS - Servicios financieros y conexos; inmobiliarios" },
  { codigo: "1.1.02.05.001.08", nombre: "VBS - Servicios prestados a las empresas" },
  { codigo: "1.1.02.05.001.09", nombre: "VBS - Servicios para la comunidad, sociales y personales" },
  { codigo: "1.1.02.05.002.00", nombre: "VBS SGP - Agricultura, silvicultura y pesca" },
  { codigo: "1.1.02.05.002.01", nombre: "VBS SGP - Minerales; electricidad, gas y agua" },
  { codigo: "1.1.02.05.002.02", nombre: "VBS SGP - Productos alimenticios" },
  { codigo: "1.1.02.05.002.03", nombre: "VBS SGP - Otros bienes transportables" },
  { codigo: "1.1.02.05.002.04", nombre: "VBS SGP - Productos metálicos, maquinaria" },
  { codigo: "1.1.02.05.002.05", nombre: "VBS SGP - Construcción" },
  { codigo: "1.1.02.05.002.06", nombre: "VBS SGP - Comercio y distribución" },
  { codigo: "1.1.02.05.002.07", nombre: "VBS SGP - Servicios financieros" },
  { codigo: "1.1.02.05.002.08", nombre: "VBS SGP - Servicios prestados a las empresas" },
  { codigo: "1.1.02.05.002.09", nombre: "VBS SGP - Servicios para la comunidad" },
  // SGP Libre Destinación (Cat 4-6)
  { codigo: "1.1.02.06.001.03.04", nombre: "SGP Propósito General - Libre Destinación Municipios Cat 4, 5 y 6" },
  // Participaciones de impuestos
  { codigo: "1.1.02.06.003.01.01", nombre: "Participación impuesto explotación oro, plata y platino" },
  { codigo: "1.1.02.06.003.01.02", nombre: "Participación impuesto sobre vehículos automotores" },
  { codigo: "1.1.02.06.003.01.03", nombre: "Participación providencia" },
  { codigo: "1.1.02.06.003.01.08", nombre: "Participación impuesto degüello ganado mayor" },
  { codigo: "1.1.02.06.003.03.01", nombre: "Participación sanciones impuesto vehículos" },
  { codigo: "1.1.02.06.003.03.02", nombre: "Participación intereses de mora impuesto vehículos" },
  // Compensaciones predial
  { codigo: "1.1.02.06.004.02", nombre: "Compensación predial territorios colectivos comunidades negras" },
  { codigo: "1.1.02.06.004.03", nombre: "Compensación predial resguardos indígenas" },
];

/** Set for O(1) lookup — also matches prefix (e.g., "1.1.01.02.200" matches "1.1.01.02.200.01") */
const iclCuentasSet = new Set(ICLD_CUENTAS_VALIDAS.map((c) => c.codigo));

/**
 * Check if a CUIPO account code is a valid ICLD source.
 * Matches exact code or checks if any valid code starts with the given code.
 */
export function isICLDCuenta(cuenta: string): boolean {
  const trimmed = cuenta.trim();
  if (iclCuentasSet.has(trimmed)) return true;
  // Check if any valid code starts with this cuenta (parent account)
  for (const valid of iclCuentasSet) {
    if (valid.startsWith(trimmed + ".") || valid === trimmed) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// ICLD Valid Funding Source Names
// ---------------------------------------------------------------------------

/** Funding source names in CUIPO that correspond to ICLD */
export const ICLD_FUENTES_VALIDAS = [
  "INGRESOS CORRIENTES DE LIBRE DESTINACION",
  "SGP-PROPOSITO GENERAL-LIBRE DESTINACION MUNICIPIOS CATEGORIAS 4, 5 Y 6",
  "RECURSOS DEL BALANCE DE LIBRE DESTINACION",
];

export function isICLDFuente(nombreFuente: string): boolean {
  const upper = (nombreFuente || "").toUpperCase().trim();
  return ICLD_FUENTES_VALIDAS.some((f) => upper.includes(f));
}

// ---------------------------------------------------------------------------
// Deductible Expense Codes (gastos que descuentan del GF para SI.17)
// ---------------------------------------------------------------------------

/**
 * Expense account codes that CGR allows to be deducted from total
 * functioning expenses when calculating the SI.17 indicator.
 *
 * These are specific expense items that, while reported as functioning,
 * should not count against the municipality's GF/ICLD ratio.
 */
export const GASTOS_DEDUCIBLES_617: { codigo: string; nombre: string }[] = [
  { codigo: "2.1.1.01.02.020.01", nombre: "Aportes Seguridad Social en Pensiones (Concejales)" },
  { codigo: "2.1.1.01.02.020.02", nombre: "Aportes Seguridad Social en Salud (Concejales)" },
  { codigo: "2.1.1.01.02.020.04", nombre: "Aportes Cajas de Compensación Familiar (Concejales)" },
  { codigo: "2.1.1.01.02.020.05", nombre: "Aportes Generales Sistema Riesgos Laborales (Concejales)" },
  { codigo: "2.1.1.01.03.125", nombre: "Transporte Rural de Concejales" },
  { codigo: "2.1.3.07.02.001.02", nombre: "Mesadas Pensionales a Cargo de la Entidad de Pensiones" },
  { codigo: "2.1.3.07.02.002.01", nombre: "Cuotas Partes Pensionales con Cargo a Reservas" },
  { codigo: "2.1.3.07.02.002.02", nombre: "Cuotas Partes Pensionales a Cargo de la Entidad" },
  { codigo: "2.1.3.07.02.003.01", nombre: "Bonos Pensionales con Cargo a Reservas" },
  { codigo: "2.1.3.07.02.003.02", nombre: "Bonos Pensionales a Cargo de la Entidad" },
  { codigo: "2.1.3.05.04.001.13.01", nombre: "Transferencia Sobretasa Ambiental a Corporaciones Autónomas" },
  { codigo: "2.1.3.05.01.016", nombre: "Participación en Estampillas" },
  { codigo: "2.1.3.09.16", nombre: "Sobretasa Bomberil Cuerpos de Bomberos Voluntarios" },
  { codigo: "2.1.3.13.01.001", nombre: "Sentencias" },
  { codigo: "2.1.1.01.03.006", nombre: "Honorarios Concejales (pagados por Admón Central)" },
];

const gastosDeduciblesSet = new Set(GASTOS_DEDUCIBLES_617.map((g) => g.codigo));

export function isGastoDeducible617(cuenta: string): boolean {
  return gastosDeduciblesSet.has(cuenta.trim());
}

// ---------------------------------------------------------------------------
// Legal Fund Deductions
// ---------------------------------------------------------------------------

/**
 * Legal deductions from ICLD as percentage.
 * Total: 3% deducted from (ICLD + SGP LD - cancelaciones)
 */
export const FONDOS_DEDUCCION_LEGAL = [
  { nombre: "Fondo de Gestión del Riesgo", porcentaje: 0.01 },
  { nombre: "Fondo de Conservación de los Recursos Hídricos", porcentaje: 0.01 },
  { nombre: "Fondo de Contingencias", porcentaje: 0.01 },
] as const;

export const TOTAL_DEDUCCION_FONDOS = 0.03; // 3%

// ---------------------------------------------------------------------------
// Concejo Limits (Art. 10 Ley 617/2000)
// ---------------------------------------------------------------------------

/** SMLMV 2025 */
export const SMLMV_2025 = 1_423_500;

/**
 * Concejo annual limit calculation:
 * - Honorarios: (número concejales × número sesiones × valor sesión)
 * - Gastos generales: depends on ICLD size
 *   - If ICLD < 1,000,000,000: 60 SMLMV
 *   - If ICLD >= 1,000,000,000: 1.5% of ICLD
 * - Total limit = Honorarios + Gastos generales
 */
export function calcularLimiteConcejoAnual(
  icld: number,
  numeroConcejales: number,
  numeroSesiones: number
): { honorarios: number; gastosGenerales: number; total: number; valorSesion: number } {
  // Valor de la sesión 2025 — derived from SMLMV
  // Ley 1368/2009 Art. 1: honorarios = SMLMV / (30 días / 6.25) = SMLMV * 6.25 / 30
  // Simplified: approximately SMLMV / 4.8 ≈ 296,563. Excel uses 296,314.
  const valorSesion = Math.round(SMLMV_2025 / 4.8);

  const honorarios = numeroConcejales * numeroSesiones * valorSesion;

  const gastosGenerales =
    icld < 1_000_000_000
      ? 60 * SMLMV_2025
      : icld * 0.015;

  return {
    honorarios,
    gastosGenerales,
    total: honorarios + gastosGenerales,
    valorSesion,
  };
}

// ---------------------------------------------------------------------------
// Personería Limits (Art. 11 Ley 617/2000) — same as existing in ley617.ts
// ---------------------------------------------------------------------------

export const LIMITES_PERSONERIA_SMLMV: Record<number, number> = {
  0: 500, 1: 350, 2: 280, 3: 190, 4: 150, 5: 120, 6: 100,
};

// ---------------------------------------------------------------------------
// Admin Central Limits (Art. 6 Ley 617/2000) — same as existing
// ---------------------------------------------------------------------------

export const LIMITES_ADMIN_CENTRAL: Record<number, number> = {
  0: 0.50, 1: 0.65, 2: 0.70, 3: 0.70, 4: 0.80, 5: 0.80, 6: 0.80,
};
