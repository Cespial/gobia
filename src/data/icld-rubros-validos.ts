/**
 * Ley 617/2000 — ICLD rubros válidos, gastos deducibles, y fondos legales
 *
 * Updated with Johan's TAREAS.xlsx data (Sprint A, 2026-04-15).
 * Only income registered under these CUIPO account codes counts as ICLD
 * for the Contraloría General de la República SI.17 indicator.
 *
 * Each ICLD account now includes required conditions:
 * - fuente: the CUIPO funding source code it must be associated with
 * - tipoNorma: must be "0.0 - NO APLICA" for ICLD rubros
 * - fechaNorma: must be "NO APLICA" for ICLD rubros
 */

// ---------------------------------------------------------------------------
// ICLD Valid Account Codes — with conditions from Johan's TAREAS.xlsx
// ---------------------------------------------------------------------------

export interface ICLDCuentaValida {
  codigo: string;
  nombre: string;
  fuente: string;
  tipoNorma: string;
  fechaNorma: string;
}

/**
 * CUIPO account codes that CGR accepts as ICLD (55 accounts from Johan).
 * Income coded under other accounts does NOT count for SI.17.
 *
 * The formula sums: SUMIFS(EJEC_ING!total, cuenta=code, fuente="ICLD" OR fuente="SGP LD")
 */
export const ICLD_CUENTAS_VALIDAS: ICLDCuentaValida[] = [
  // Impuestos directos
  { codigo: "1.1.01.01.200.01", nombre: "Impuesto predial unificado - urbano", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.01.200.02", nombre: "Impuesto predial unificado - rural", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  // Impuestos indirectos
  { codigo: "1.1.01.02.109", nombre: "Sobretasa a la gasolina", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.200.01", nombre: "Impuesto de industria y comercio - sobre actividades comerciales", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.200.02", nombre: "Impuesto de industria y comercio - sobre actividades industriales", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.200.03", nombre: "Impuesto de industria y comercio - sobre actividades de servicios", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.201", nombre: "Impuesto complementario de avisos y tableros", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.202", nombre: "Impuesto a la publicidad exterior visual", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.203", nombre: "Impuesto de circulación y transito sobre vehículos de servicio publico", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.204", nombre: "Impuesto de delineación", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.209", nombre: "Impuesto al degüello de ganado menor", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.210", nombre: "Impuesto sobre teléfonos", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.01.02.216", nombre: "Impuesto de espectáculos públicos municipal", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  // Tasas y derechos
  { codigo: "1.1.02.02.015", nombre: "Certificados y constancias", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.02.063", nombre: "Certificados catastrales", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.02.095", nombre: "Plaza de mercado", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.02.102", nombre: "Derechos de tránsito", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.02.134", nombre: "Otros derechos administrativos", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  // Multas y sanciones
  { codigo: "1.1.02.03.001.03", nombre: "Sanciones disciplinarias", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.03.001.04", nombre: "Sanciones contractuales", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.03.001.05", nombre: "Sanciones administrativas", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.03.001.06", nombre: "Sanciones fiscales", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.03.001.11", nombre: "Sanciones tributarias", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.03.001.21", nombre: "Multa por incumplimiento en el registro de marcas y herretes", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.03.001.23", nombre: "Sanciones urbanísticas", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.03.002", nombre: "Intereses de mora", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  // Ventas de bienes y servicios (fuente ICLD)
  { codigo: "1.1.02.05.001.00", nombre: "Agricultura, silvicultura y productos de la pesca", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.001.01", nombre: "Minerales; electricidad, gas y agua", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.001.02", nombre: "Productos alimenticios, bebidas y tabaco; textiles, prendas de vestir y productos de cuero", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.001.03", nombre: "Otros bienes transportables (excepto productos metálicos, maquinaria y equipo)", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.001.04", nombre: "Productos metálicos, maquinaria y equipo", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.001.05", nombre: "Construcción y servicios de la construcción", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.001.06", nombre: "Comercio y distribución; alojamiento; servicios de suministro de comidas y bebidas; servicios de transporte; y servicios de distribución de electricidad, gas y agua", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.001.07", nombre: "Servicios financieros y servicios conexos; servicios inmobiliarios; y servicios de arrendamiento y leasing", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.001.08", nombre: "Servicios prestados a las empresas y servicios de producción", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.001.09", nombre: "Servicios para la comunidad, sociales y personales", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  // Ventas de bienes y servicios (fuente SGP LD)
  { codigo: "1.1.02.05.002.00", nombre: "Agricultura, silvicultura y productos de la pesca", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.002.01", nombre: "Minerales; electricidad, gas y agua", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.002.02", nombre: "Productos alimenticios, bebidas y tabaco; textiles, prendas de vestir y productos de cuero", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.002.03", nombre: "Otros bienes transportables (excepto productos metálicos, maquinaria y equipo)", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.002.04", nombre: "Productos metálicos, maquinaria y equipo", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.002.05", nombre: "Construcción y servicios de la construcción", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.002.06", nombre: "Comercio y distribución; alojamiento; servicios de suministro de comidas y bebidas; servicios de transporte; y servicios de distribución de electricidad, gas y agua", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.002.07", nombre: "Servicios financieros y servicios conexos; servicios inmobiliarios; y servicios de arrendamiento y leasing", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.002.08", nombre: "Servicios prestados a las empresas y servicios de producción", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.05.002.09", nombre: "Servicios para la comunidad, sociales y personales", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  // SGP Libre Destinación (Cat 4-6) — different fuente code
  { codigo: "1.1.02.06.001.03.04", nombre: "Propósito general libre destinación municipios categorías 4, 5 y 6", fuente: "1.2.4.3.04 SGP-propósito general-libre destinación municipios categorías 4, 5 y 6", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  // Participaciones de impuestos
  { codigo: "1.1.02.06.003.01.01", nombre: "Participación del impuesto nacional a la explotación de oro, plata y platino", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.06.003.01.02", nombre: "Participación del impuesto sobre vehículos automotores", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.06.003.01.03", nombre: "Participación providencia", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.06.003.01.08", nombre: "Participación del impuesto al degüello de ganado mayor (en los términos que lo defina la ordenanza)", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.06.003.03.01", nombre: "Participación de sanciones del impuesto sobre vehículos automotores", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.06.003.03.02", nombre: "Participación de intereses de mora sobre el impuesto sobre vehículos automotores", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  // Compensaciones predial
  { codigo: "1.1.02.06.004.02", nombre: "Compensación impuesto predial unificado territorios colectivos de comunidades negras", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
  { codigo: "1.1.02.06.004.03", nombre: "Compensación impuesto predial unificado resguardos indígenas", fuente: "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación", tipoNorma: "0.0 - NO APLICA", fechaNorma: "NO APLICA" },
];

/** Set for O(1) lookup — exact match only */
const iclCuentasSet = new Set(ICLD_CUENTAS_VALIDAS.map((c) => c.codigo));

/** Lookup map for ICLD account conditions */
const iclCuentasMap = new Map(
  ICLD_CUENTAS_VALIDAS.map((c) => [c.codigo, c])
);

/**
 * Check if a CUIPO account code is a valid ICLD source.
 * Uses exact match only — parent codes like "1.1" do NOT match.
 */
export function isICLDCuenta(cuenta: string): boolean {
  return iclCuentasSet.has(cuenta.trim());
}

/**
 * Check if a CUIPO account code is valid ICLD WITH conditions.
 * Validates that fuente, tipoNorma, and fechaNorma match the required values.
 */
export function isICLDCuentaConCondiciones(
  cuenta: string,
  fuente?: string,
  tipoNorma?: string,
  fechaNorma?: string,
): { valida: boolean; errores: string[] } {
  const trimmed = cuenta.trim();
  const entry = iclCuentasMap.get(trimmed);
  if (!entry) return { valida: false, errores: ["Cuenta no es ICLD válida"] };

  const errores: string[] = [];

  if (fuente !== undefined) {
    // Extract the fuente code prefix for comparison (e.g., "1.2.1.0.00")
    const expectedCode = entry.fuente.split(" - ")[0].trim();
    const actualCode = fuente.split(" - ")[0].trim();
    if (actualCode !== expectedCode) {
      errores.push(`Fuente incorrecta: esperada "${entry.fuente}", recibida "${fuente}"`);
    }
  }

  if (tipoNorma !== undefined && tipoNorma !== entry.tipoNorma) {
    errores.push(`Tipo norma incorrecto: esperado "${entry.tipoNorma}", recibido "${tipoNorma}"`);
  }

  if (fechaNorma !== undefined && fechaNorma !== entry.fechaNorma) {
    errores.push(`Fecha norma incorrecta: esperada "${entry.fechaNorma}", recibida "${fechaNorma}"`);
  }

  return { valida: errores.length === 0, errores };
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
// Updated from Johan's TAREAS.xlsx — 8 codes with conditions
// ---------------------------------------------------------------------------

export interface GastoDeducible617 {
  codigo: string;
  nombre: string;
  seccion: string;
  fuente: string;
  vigencia: string;
  /** If true, deduction is conditional (see condicionDeduccion) */
  condicional: boolean;
  condicionDeduccion?: string;
}

/**
 * Expense account codes that CGR allows to be deducted from total
 * functioning expenses when calculating the SI.17 indicator.
 *
 * From Johan's 8-entry table. Key changes vs previous 15-entry list:
 * - 2.1.2.02.02.007 ONLY deducts if fuente != ICLD (conditional)
 * - 2.1.3.07.02.002 is the parent code (covers .01 and .02)
 * - 2.1.3.05.09.060 (Transferencias a fondos de desarrollo local) is NEW
 * - 2.1.1.01.03.006 (Honorarios concejales) only deducts in sección "16.0 - Admon central"
 */
export const GASTOS_DEDUCIBLES_617: GastoDeducible617[] = [
  {
    codigo: "2.1.1.01.03.125",
    nombre: "Transporte Rural de Concejales",
    seccion: "16.0 - Admon central",
    fuente: "Independientemente de la Fuente de Financiación",
    vigencia: "1 - Vigencia Actual",
    condicional: false,
  },
  {
    codigo: "2.1.1.01.02.020.01",
    nombre: "Aportes a la Seguridad Social en Pensiones",
    seccion: "16.0 - Admon central",
    fuente: "Independientemente de la Fuente de Financiación",
    vigencia: "1 - Vigencia Actual",
    condicional: false,
  },
  {
    codigo: "2.1.1.01.02.020.02",
    nombre: "Aportes a la Seguridad Social en Salud",
    seccion: "16.0 - Admon central",
    fuente: "Independientemente de la Fuente de Financiación",
    vigencia: "1 - Vigencia Actual",
    condicional: false,
  },
  {
    codigo: "2.1.1.01.02.020.04",
    nombre: "Aportes a Cajas de Compensación Familiar",
    seccion: "16.0 - Admon central",
    fuente: "Independientemente de la Fuente de Financiación",
    vigencia: "1 - Vigencia Actual",
    condicional: false,
  },
  {
    codigo: "2.1.1.01.02.020.05",
    nombre: "Aportes Generales al Sistema de Riesgos Laborales",
    seccion: "16.0 - Admon central",
    fuente: "Independientemente de la Fuente de Financiación",
    vigencia: "1 - Vigencia Actual",
    condicional: false,
  },
  {
    codigo: "2.1.2.02.02.007",
    nombre: "Servicios Financieros y Servicios Conexos; Servicios Inmobiliarios; y Servicios de Arrendamiento y Leasing",
    seccion: "16.0 - Admon central",
    fuente: "Con Fuente diferente a 1.2.1.0.00 - Ingresos Corrientes de Libre Destinación o 1.2.4.3.04 - SGP Propósito general libre destinación municipios categorías 4, 5 y 6",
    vigencia: "1 - Vigencia Actual (+) 4 - Vigencias futuras vigencia actual",
    condicional: true,
    condicionDeduccion: "Solo deducible si fuente != ICLD (1.2.1.0.00) y fuente != SGP-LD (1.2.4.3.04)",
  },
  {
    codigo: "2.1.3.07.02.002",
    nombre: "Cuotas Partes Pensionales de Pensiones",
    seccion: "16.0 - Admon central",
    fuente: "Independientemente de la Fuente de Financiación",
    vigencia: "1 - Vigencia Actual",
    condicional: false,
  },
  {
    codigo: "2.1.3.05.09.060",
    nombre: "Transferencias a Fondos de Desarrollo Local",
    seccion: "16.0 - Admon central",
    fuente: "Independientemente de la Fuente de Financiación",
    vigencia: "1 - Vigencia Actual",
    condicional: false,
  },
];

/** Set for O(1) lookup — exact match only (unconditional deductions) */
const gastosDeduciblesSet = new Set(
  GASTOS_DEDUCIBLES_617
    .filter((g) => !g.condicional)
    .map((g) => g.codigo)
);

/** Conditional deduction codes need fuente check */
const gastosDeduciblesCondicionales = new Map(
  GASTOS_DEDUCIBLES_617
    .filter((g) => g.condicional)
    .map((g) => [g.codigo, g])
);

/**
 * Check if a gasto is unconditionally deducible (backwards compatible).
 * For conditional deductions (e.g., 2.1.2.02.02.007), use isGastoDeducible617ConCondiciones.
 */
export function isGastoDeducible617(cuenta: string): boolean {
  const trimmed = cuenta.trim();
  // Unconditional deductions
  if (gastosDeduciblesSet.has(trimmed)) return true;
  // Parent code match: 2.1.3.07.02.002 covers .01 and .02
  if (trimmed.startsWith("2.1.3.07.02.002")) return true;
  return false;
}

/**
 * Check if a gasto is deducible considering fuente conditions.
 * - 2.1.2.02.02.007 is ONLY deducible when fuente != ICLD and fuente != SGP-LD
 * - 2.1.1.01.03.006 is ONLY deducible in sección "16.0 - Admon central"
 */
export function isGastoDeducible617ConCondiciones(
  cuenta: string,
  codigoFuente?: string,
  seccion?: string,
): boolean {
  const trimmed = cuenta.trim();

  // Unconditional deductions (always deducible)
  if (gastosDeduciblesSet.has(trimmed)) return true;
  // Parent code match for cuotas partes pensionales
  if (trimmed.startsWith("2.1.3.07.02.002")) return true;

  // Conditional: 2.1.2.02.02.007 only deducts if fuente is NOT ICLD/SGP-LD
  const cond = gastosDeduciblesCondicionales.get(trimmed);
  if (cond && codigoFuente) {
    const fCode = codigoFuente.split(" - ")[0].trim();
    const isICLD = fCode === "1.2.1.0.00";
    const isSGPLD = fCode === "1.2.4.3.04";
    if (!isICLD && !isSGPLD) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Gastos de Funcionamiento Rules (GF — what COUNTS as functioning expenses)
// From Johan's TAREAS.xlsx gf_suman table
// ---------------------------------------------------------------------------

export interface GFRule {
  descripcion: string;
  secciones: string[];
  fuentes: string[];
  vigencias: string[];
}

/**
 * Rules for which gastos COUNT as functioning expenses for Ley 617.
 * Key insight from Johan: only 2.1 codes where fuente = ICLD or SGP-LD,
 * vigencia = actual + vigencias futuras.
 */
export const GF_REGLAS: GFRule[] = [
  {
    descripcion: "Gastos de Funcionamiento - Concejo",
    secciones: ["18.0 - Concejo"],
    fuentes: [
      "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación",
      "1.2.4.3.04 - SGP Propósito general libre destinación municipios categorías 4, 5 y 6",
    ],
    vigencias: ["1 - Vigencia Actual", "4 - Vigencias futuras vigencia actual"],
  },
  {
    descripcion: "Gastos de Funcionamiento - Personería",
    secciones: ["20.0 - Personería"],
    fuentes: [
      "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación",
      "1.2.4.3.04 - SGP Propósito general libre destinación municipios categorías 4, 5 y 6",
    ],
    vigencias: ["1 - Vigencia Actual", "4 - Vigencias futuras vigencia actual"],
  },
  {
    descripcion: "Gastos de Funcionamiento - Admón Central y Unidad Servicios Públicos",
    secciones: ["16.0 - Admon central", "23.0 - Unidad de servicios públicos"],
    fuentes: [
      "1.2.1.0.00 - Ingresos Corrientes de Libre Destinación",
      "1.2.4.3.04 - SGP Propósito general libre destinación municipios categorías 4, 5 y 6",
    ],
    vigencias: ["1 - Vigencia Actual", "4 - Vigencias futuras vigencia actual"],
  },
];

/** CUIPO fuente codes that count for GF calculation */
export const GF_FUENTES_VALIDAS = [
  "1.2.1.0.00",   // ICLD
  "1.2.4.3.04",   // SGP Propósito general libre destinación
];

/** Secciones presupuestales that count for GF */
export const GF_SECCIONES_VALIDAS = [
  "16.0",  // Admón central
  "18.0",  // Concejo
  "20.0",  // Personería
  "23.0",  // Unidad de servicios públicos
];

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

// ---------------------------------------------------------------------------
// Concejales por categoría (Ley 136/1994 Art. 22, Acto Legislativo 02/2002)
// Used as default when numConcejales is not provided by user.
// ---------------------------------------------------------------------------

export const CONCEJALES_POR_CATEGORIA: Record<number, number> = {
  0: 21, 1: 19, 2: 15, 3: 13, 4: 11, 5: 9, 6: 7,
};

/** Default number of ordinary sessions per year (Ley 136 Art. 23) */
export const SESIONES_ORDINARIAS_DEFECTO = 120;
