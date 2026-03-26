/**
 * SICODIS DNP API Client
 * Fetches SGP (Sistema General de Participaciones) distribution data
 * Base URL: https://sicodis.dnp.gov.co/apiws/ApiSicodisNew
 */

const BASE_URL = "https://sicodis.dnp.gov.co/apiws/ApiSicodisNew";

async function sicodisGet<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`SICODIS API error ${res.status}: ${url}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SGPVigencia {
  anio: string;
}

export interface SGPDepartamento {
  codigo: string;
  nombre: string;
}

export interface SGPMunicipio {
  codigo: string;
  nombre: string;
}

export interface SGPResumenParticipacion {
  annio: number;
  id_concepto: string;
  concepto: string;
  total: number;
}

export interface SGPDistribucionDetalle {
  annio: number;
  id_concepto: string;
  concepto: string;
  id_componente: string;
  componente: string;
  total: number;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/** Get available SGP years (2002-current) */
export async function fetchSGPVigencias(): Promise<SGPVigencia[]> {
  return sicodisGet<SGPVigencia[]>("/sgp/vigencias");
}

/** Get departments list */
export async function fetchDepartamentos(): Promise<SGPDepartamento[]> {
  return sicodisGet<SGPDepartamento[]>("/sgp/departamentos");
}

/** Get municipalities for a department */
export async function fetchMunicipios(
  codigoDepartamento: string
): Promise<SGPMunicipio[]> {
  return sicodisGet<SGPMunicipio[]>(
    `/sgp/municipios_departamentos/${codigoDepartamento}`
  );
}

/**
 * Get SGP distribution summary for a municipality
 * Returns: Educación, Salud, Agua Potable, Propósito General totals
 *
 * @param year - Fiscal year (e.g. 2025)
 * @param codigoDpto - Department code (e.g. "05000" for Antioquia)
 * @param codigoMunicipio - Municipality code (e.g. "05001" for Medellín)
 */
export async function fetchSGPResumen(
  year: number,
  codigoDpto: string,
  codigoMunicipio: string
): Promise<SGPResumenParticipacion[]> {
  return sicodisGet<SGPResumenParticipacion[]>(
    `/sgp/resumen_participaciones/${year}/${codigoDpto}/${codigoMunicipio}`
  );
}

/**
 * Get detailed SGP distribution (with subcomponents)
 * Returns breakdown: Calidad/Gratuidad, RS/SP/Oferta, etc.
 */
export async function fetchSGPDistribucionDetalle(
  year: number,
  codigoDpto: string,
  codigoMunicipio: string
): Promise<SGPDistribucionDetalle[]> {
  return sicodisGet<SGPDistribucionDetalle[]>(
    `/sgp/resumen_participaciones_distribucion/${year}/${codigoDpto}/${codigoMunicipio}`
  );
}

/** Get general SGP summary for a year */
export async function fetchSGPResumenGeneral(
  year: number
): Promise<Record<string, unknown>> {
  return sicodisGet(`/sgp/resumen_general/${year}`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive department code from DANE municipality code
 * Municipality code format: DDMMM (DD=department, MMM=municipality)
 * Department code format: DD000
 */
export function daneCodeToDeptCode(daneCode: string): string {
  return daneCode.slice(0, 2) + "000";
}

/** Known SGP concept IDs */
export const SGP_CONCEPTOS = {
  EDUCACION: "0101",
  SALUD: "0102",
  AGUA_POTABLE: "0103",
  PROPOSITO_GENERAL: "0104",
  ALIMENTACION_ESCOLAR: "0106",
  RIBERENHOS: "0107",
  RESGUARDOS: "0108",
  FONPET: "0105",
} as const;
