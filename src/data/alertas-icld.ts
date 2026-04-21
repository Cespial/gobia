/**
 * Alertas ICLD — Alert conditions and destinaciones específicas for ICLD validation
 *
 * From Johan's TAREAS.xlsx — Sprint A (2026-04-15)
 *
 * These rules define when ICLD rubros should be flagged for incorrect
 * tipo_norma, fecha_norma, or missing destinaciones específicas.
 */

// ---------------------------------------------------------------------------
// Alert Conditions
// ---------------------------------------------------------------------------

export interface AlertaICLD {
  condicion: string;
  descripcion: string;
  severidad: "error" | "warning" | "info";
}

/**
 * Alert conditions for ICLD validation from Johan's specifications.
 *
 * Key rules:
 * - ICLD rubros must have tipoNorma = "0.0 - NO APLICA" and fechaNorma = "NO APLICA"
 * - At least one destinación específica by law must be reported
 * - Destinaciones específicas must match acto administrativo values
 * - Art. 44 Ley 99/1993 (sobretasa/participación ambiental) must be reported
 */
export const ALERTAS_ICLD: AlertaICLD[] = [
  {
    condicion: "tipo_norma_invalido",
    descripcion:
      "Concepto de ingreso con fuente ICLD (1.2.1.0.00) o SGP-LD (1.2.4.3.04) tiene tipo de norma diferente a '0.0 - NO APLICA'",
    severidad: "error",
  },
  {
    condicion: "fecha_norma_invalida",
    descripcion:
      "Concepto de ingreso con fuente ICLD (1.2.1.0.00) o SGP-LD (1.2.4.3.04) tiene fecha de norma diferente a 'NO APLICA'",
    severidad: "error",
  },
  {
    condicion: "destinacion_no_reportada",
    descripcion:
      "Destinaciones específicas (combinaciones) no reportadas en el reporte CUIPO",
    severidad: "error",
  },
  {
    condicion: "destinacion_incorrecta",
    descripcion:
      "Destinaciones específicas (combinaciones) no reportadas correctamente",
    severidad: "error",
  },
  {
    condicion: "valores_destinacion_inconsistentes",
    descripcion:
      "Valores reportados por destinación específica no son consecuentes con los calculados por el sistema",
    severidad: "warning",
  },
  {
    condicion: "sin_destinacion_legal_minima",
    descripcion:
      "El cálculo de los ICLD está condicionado a que se reporte al menos una destinación específica conferida por la Ley",
    severidad: "error",
  },
  {
    condicion: "ambiental_no_reportada",
    descripcion:
      "No se reportó la destinación contemplada en el artículo 44 de la Ley 99 de 1993 (sobretasa o participación ambiental). Se debe validar como participación ambiental en el impuesto predial unificado o como sobretasa ambiental.",
    severidad: "warning",
  },
];

// ---------------------------------------------------------------------------
// Destinaciones Específicas (configurable per municipality)
// ---------------------------------------------------------------------------

export interface DestinacionEspecifica {
  nombre: string;
  /** Percentage of ICLD allocated (0-100). 0 = to be configured by municipality. */
  porcentajeICLD: number;
  /** Reference to the municipal act that established this allocation */
  actoAdministrativo: string;
}

/**
 * Default destinaciones específicas template from Johan.
 * Each municipality can have its own percentages and acto administrativo.
 * Defaults to 0% and placeholder acto — to be configured per entity.
 */
export const DESTINACIONES_ESPECIFICAS_DEFAULT: DestinacionEspecifica[] = [
  {
    nombre: "Fondo de Contingencias",
    porcentajeICLD: 0,
    actoAdministrativo: "ACUERDO 00 DE 0000",
  },
  {
    nombre: "Fondo de Gestión y Atención del Riesgo y de Desastres",
    porcentajeICLD: 0,
    actoAdministrativo: "ACUERDO 00 DE 0000",
  },
  {
    nombre: "Fondo de Emprendimiento para las Mujeres",
    porcentajeICLD: 0,
    actoAdministrativo: "ACUERDO 00 DE 0000",
  },
  {
    nombre: "Aporte Provincias o Esquemas Asociativos",
    porcentajeICLD: 0,
    actoAdministrativo: "ACUERDO 00 DE 0000",
  },
  {
    nombre: "Fondo de Pensiones Territorial",
    porcentajeICLD: 0,
    actoAdministrativo: "ACUERDO 00 DE 0000",
  },
  {
    nombre: "Otros, ¿cuál?",
    porcentajeICLD: 0,
    actoAdministrativo: "ACUERDO 00 DE 0000",
  },
];

// ---------------------------------------------------------------------------
// Alert checker functions
// ---------------------------------------------------------------------------

/**
 * Check if a CUIPO income row with ICLD/SGP-LD fuente has valid tipo_norma.
 * Returns an alert if tipo_norma is not "0.0 - NO APLICA".
 */
export function checkTipoNorma(
  tipoNorma: string,
  codigoFuente: string,
): AlertaICLD | null {
  const fCode = codigoFuente.split(" - ")[0].trim();
  const isICLDOrSGPLD = fCode === "1.2.1.0.00" || fCode === "1.2.4.3.04";

  if (isICLDOrSGPLD && tipoNorma !== "0.0 - NO APLICA") {
    return ALERTAS_ICLD.find((a) => a.condicion === "tipo_norma_invalido") ?? null;
  }
  return null;
}

/**
 * Check if a CUIPO income row with ICLD/SGP-LD fuente has valid fecha_norma.
 * Returns an alert if fecha_norma is not "NO APLICA".
 */
export function checkFechaNorma(
  fechaNorma: string,
  codigoFuente: string,
): AlertaICLD | null {
  const fCode = codigoFuente.split(" - ")[0].trim();
  const isICLDOrSGPLD = fCode === "1.2.1.0.00" || fCode === "1.2.4.3.04";

  if (isICLDOrSGPLD && fechaNorma !== "NO APLICA") {
    return ALERTAS_ICLD.find((a) => a.condicion === "fecha_norma_invalida") ?? null;
  }
  return null;
}

/**
 * Validate that a municipality's destinaciones específicas have been configured.
 * Returns alerts for any unconfigured destinaciones.
 */
export function checkDestinacionesConfiguradas(
  destinaciones: DestinacionEspecifica[],
): AlertaICLD[] {
  const alertas: AlertaICLD[] = [];

  // Check if at least one destinación has been configured (porcentaje > 0)
  const hasAtLeastOne = destinaciones.some((d) => d.porcentajeICLD > 0);
  if (!hasAtLeastOne) {
    const alerta = ALERTAS_ICLD.find((a) => a.condicion === "sin_destinacion_legal_minima");
    if (alerta) alertas.push(alerta);
  }

  return alertas;
}
