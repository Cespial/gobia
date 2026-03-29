/**
 * Cliente TypeScript para consumir datos CUIPO de datos.gov.co
 * CUIPO = Categoría Única de Información Presupuesto Ordinario
 *
 * Datasets utilizados:
 * - Ejecución presupuestal gastos: 9axr-9gnb
 * - Ejecución presupuestal ingresos: 4f7r-epif
 */

const CUIPO_DATASETS = {
  ejecucion_gastos: "9axr-9gnb",
  ejecucion_ingresos: "4f7r-epif",
} as const;

const DATOS_GOV_BASE = "https://www.datos.gov.co/resource";
const DEFAULT_VIGENCIA = 2024;
const ANTIOQUIA_DEPT_CODE = "05";

// ============================================================================
// TYPES
// ============================================================================

export interface CuipoData {
  codigo_dane: string;
  municipio: string;
  vigencia: number;
  periodo: string;
  // Gasto por función
  gasto_servicios_generales: number;
  gasto_orden_publico: number;
  gasto_proteccion_social: number;
  gasto_vivienda: number;
  gasto_educacion: number;
  gasto_salud: number;
  gasto_agua_saneamiento: number;
  gasto_cultura: number;
  gasto_otros: number;
  total_gasto: number;
  // Ejecución
  porcentaje_ejecucion: number;
  fecha_corte: Date;
}

export interface CuipoEjecucionByCategoria {
  categoria: string;
  presupuesto: number;
  ejecutado: number;
  porcentaje: number;
}

export interface CuipoSummary {
  codigo_dane: string;
  municipio: string;
  vigencia: number;
  total_presupuesto: number;
  total_ejecutado: number;
  porcentaje_ejecucion: number;
  ejecucion_por_categoria: CuipoEjecucionByCategoria[];
}

// Raw types from datos.gov.co
interface CuipoRawRecord {
  c_digo_entidad?: string;
  codigo_entidad?: string;
  nombre_entidad?: string;
  vigencia?: string;
  periodo?: string;
  concepto?: string;
  cuenta?: string;
  descripcion_cuenta?: string;
  presupuesto_definitivo?: string;
  compromisos?: string;
  obligaciones?: string;
  pagos?: string;
  porcentaje_ejecuci_n?: string;
  fecha_corte?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/[,$]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function extractCategoriaFuncional(concepto: string | undefined): string {
  if (!concepto) return "Otros";
  const c = concepto.toLowerCase();

  if (c.includes("educación") || c.includes("educacion")) return "Educación";
  if (c.includes("salud")) return "Salud";
  if (c.includes("agua") || c.includes("saneamiento") || c.includes("alcantarillado")) return "Agua/Saneamiento";
  if (c.includes("vivienda")) return "Vivienda";
  if (c.includes("orden público") || c.includes("seguridad") || c.includes("justicia")) return "Orden Público";
  if (c.includes("cultura") || c.includes("deporte") || c.includes("recreación")) return "Cultura/Deporte";
  if (c.includes("protección social") || c.includes("bienestar")) return "Protección Social";
  if (c.includes("servicios generales") || c.includes("funcionamiento")) return "Servicios Generales";

  return "Otros";
}

async function fetchFromDatosGov<T>(
  datasetId: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const url = new URL(`${DATOS_GOV_BASE}/${datasetId}.json`);

  // Add default limit
  url.searchParams.set("$limit", params.$limit || "5000");

  // Add other params
  Object.entries(params).forEach(([key, value]) => {
    if (key !== "$limit") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error(`datos.gov.co API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Obtener datos CUIPO de ejecución presupuestal de un municipio
 */
export async function getMunicipalCuipoData(
  codigoDane: string,
  vigencia: number = DEFAULT_VIGENCIA
): Promise<CuipoData | null> {
  try {
    const rawData = await fetchFromDatosGov<CuipoRawRecord>(CUIPO_DATASETS.ejecucion_gastos, {
      $where: `codigo_entidad LIKE '${codigoDane}%' OR c_digo_entidad LIKE '${codigoDane}%'`,
      vigencia: vigencia.toString(),
      $limit: "500",
    });

    if (!rawData.length) {
      return null;
    }

    // Aggregate by category
    const categoriasTotals: Record<string, { presupuesto: number; ejecutado: number }> = {};
    let totalGasto = 0;
    let totalPresupuesto = 0;

    rawData.forEach((record) => {
      const categoria = extractCategoriaFuncional(record.concepto || record.descripcion_cuenta);
      const presupuesto = parseNumber(record.presupuesto_definitivo);
      const ejecutado = parseNumber(record.pagos) || parseNumber(record.obligaciones);

      if (!categoriasTotals[categoria]) {
        categoriasTotals[categoria] = { presupuesto: 0, ejecutado: 0 };
      }
      categoriasTotals[categoria].presupuesto += presupuesto;
      categoriasTotals[categoria].ejecutado += ejecutado;

      totalGasto += ejecutado;
      totalPresupuesto += presupuesto;
    });

    const firstRecord = rawData[0];
    const municipioName = firstRecord.nombre_entidad || "";

    return {
      codigo_dane: codigoDane,
      municipio: municipioName,
      vigencia,
      periodo: firstRecord.periodo || `${vigencia}`,
      gasto_servicios_generales: categoriasTotals["Servicios Generales"]?.ejecutado || 0,
      gasto_orden_publico: categoriasTotals["Orden Público"]?.ejecutado || 0,
      gasto_proteccion_social: categoriasTotals["Protección Social"]?.ejecutado || 0,
      gasto_vivienda: categoriasTotals["Vivienda"]?.ejecutado || 0,
      gasto_educacion: categoriasTotals["Educación"]?.ejecutado || 0,
      gasto_salud: categoriasTotals["Salud"]?.ejecutado || 0,
      gasto_agua_saneamiento: categoriasTotals["Agua/Saneamiento"]?.ejecutado || 0,
      gasto_cultura: categoriasTotals["Cultura/Deporte"]?.ejecutado || 0,
      gasto_otros: categoriasTotals["Otros"]?.ejecutado || 0,
      total_gasto: totalGasto,
      porcentaje_ejecucion: totalPresupuesto > 0
        ? Math.round((totalGasto / totalPresupuesto) * 100 * 10) / 10
        : 0,
      fecha_corte: new Date(firstRecord.fecha_corte || Date.now()),
    };
  } catch (error) {
    console.error(`Error fetching CUIPO data for ${codigoDane}:`, error);
    return null;
  }
}

/**
 * Obtener resumen de ejecución CUIPO con desglose por categoría
 */
export async function getCuipoSummary(
  codigoDane: string,
  vigencia: number = DEFAULT_VIGENCIA
): Promise<CuipoSummary | null> {
  try {
    const rawData = await fetchFromDatosGov<CuipoRawRecord>(CUIPO_DATASETS.ejecucion_gastos, {
      $where: `codigo_entidad LIKE '${codigoDane}%' OR c_digo_entidad LIKE '${codigoDane}%'`,
      vigencia: vigencia.toString(),
      $limit: "500",
    });

    if (!rawData.length) {
      return null;
    }

    // Aggregate by category
    const categoriasTotals: Record<string, { presupuesto: number; ejecutado: number }> = {};
    let totalPresupuesto = 0;
    let totalEjecutado = 0;

    rawData.forEach((record) => {
      const categoria = extractCategoriaFuncional(record.concepto || record.descripcion_cuenta);
      const presupuesto = parseNumber(record.presupuesto_definitivo);
      const ejecutado = parseNumber(record.pagos) || parseNumber(record.obligaciones);

      if (!categoriasTotals[categoria]) {
        categoriasTotals[categoria] = { presupuesto: 0, ejecutado: 0 };
      }
      categoriasTotals[categoria].presupuesto += presupuesto;
      categoriasTotals[categoria].ejecutado += ejecutado;

      totalPresupuesto += presupuesto;
      totalEjecutado += ejecutado;
    });

    const ejecucionPorCategoria: CuipoEjecucionByCategoria[] = Object.entries(categoriasTotals)
      .map(([categoria, totals]) => ({
        categoria,
        presupuesto: totals.presupuesto,
        ejecutado: totals.ejecutado,
        porcentaje: totals.presupuesto > 0
          ? Math.round((totals.ejecutado / totals.presupuesto) * 100 * 10) / 10
          : 0,
      }))
      .sort((a, b) => b.ejecutado - a.ejecutado);

    const firstRecord = rawData[0];

    return {
      codigo_dane: codigoDane,
      municipio: firstRecord.nombre_entidad || "",
      vigencia,
      total_presupuesto: totalPresupuesto,
      total_ejecutado: totalEjecutado,
      porcentaje_ejecucion: totalPresupuesto > 0
        ? Math.round((totalEjecutado / totalPresupuesto) * 100 * 10) / 10
        : 0,
      ejecucion_por_categoria: ejecucionPorCategoria,
    };
  } catch (error) {
    console.error(`Error fetching CUIPO summary for ${codigoDane}:`, error);
    return null;
  }
}

/**
 * Obtener comparación de ejecución CUIPO para todos los municipios de Antioquia
 */
export async function getAntioquiaCuipoComparison(
  vigencia: number = DEFAULT_VIGENCIA
): Promise<CuipoData[]> {
  try {
    const rawData = await fetchFromDatosGov<CuipoRawRecord>(CUIPO_DATASETS.ejecucion_gastos, {
      $where: `codigo_entidad LIKE '${ANTIOQUIA_DEPT_CODE}%' OR c_digo_entidad LIKE '${ANTIOQUIA_DEPT_CODE}%'`,
      vigencia: vigencia.toString(),
      $limit: "10000",
    });

    if (!rawData.length) {
      return [];
    }

    // Group by municipality
    const municipioData: Record<string, CuipoRawRecord[]> = {};

    rawData.forEach((record) => {
      const codigo = record.codigo_entidad || record.c_digo_entidad || "";
      if (codigo.startsWith(ANTIOQUIA_DEPT_CODE)) {
        if (!municipioData[codigo]) {
          municipioData[codigo] = [];
        }
        municipioData[codigo].push(record);
      }
    });

    // Process each municipality
    const results: CuipoData[] = [];

    for (const [codigo, records] of Object.entries(municipioData)) {
      const categoriasTotals: Record<string, { presupuesto: number; ejecutado: number }> = {};
      let totalGasto = 0;
      let totalPresupuesto = 0;

      records.forEach((record) => {
        const categoria = extractCategoriaFuncional(record.concepto || record.descripcion_cuenta);
        const presupuesto = parseNumber(record.presupuesto_definitivo);
        const ejecutado = parseNumber(record.pagos) || parseNumber(record.obligaciones);

        if (!categoriasTotals[categoria]) {
          categoriasTotals[categoria] = { presupuesto: 0, ejecutado: 0 };
        }
        categoriasTotals[categoria].presupuesto += presupuesto;
        categoriasTotals[categoria].ejecutado += ejecutado;

        totalGasto += ejecutado;
        totalPresupuesto += presupuesto;
      });

      const firstRecord = records[0];

      results.push({
        codigo_dane: codigo,
        municipio: firstRecord.nombre_entidad || "",
        vigencia,
        periodo: firstRecord.periodo || `${vigencia}`,
        gasto_servicios_generales: categoriasTotals["Servicios Generales"]?.ejecutado || 0,
        gasto_orden_publico: categoriasTotals["Orden Público"]?.ejecutado || 0,
        gasto_proteccion_social: categoriasTotals["Protección Social"]?.ejecutado || 0,
        gasto_vivienda: categoriasTotals["Vivienda"]?.ejecutado || 0,
        gasto_educacion: categoriasTotals["Educación"]?.ejecutado || 0,
        gasto_salud: categoriasTotals["Salud"]?.ejecutado || 0,
        gasto_agua_saneamiento: categoriasTotals["Agua/Saneamiento"]?.ejecutado || 0,
        gasto_cultura: categoriasTotals["Cultura/Deporte"]?.ejecutado || 0,
        gasto_otros: categoriasTotals["Otros"]?.ejecutado || 0,
        total_gasto: totalGasto,
        porcentaje_ejecucion: totalPresupuesto > 0
          ? Math.round((totalGasto / totalPresupuesto) * 100 * 10) / 10
          : 0,
        fecha_corte: new Date(firstRecord.fecha_corte || Date.now()),
      });
    }

    return results.sort((a, b) => b.porcentaje_ejecucion - a.porcentaje_ejecucion);
  } catch (error) {
    console.error("Error fetching Antioquia CUIPO comparison:", error);
    return [];
  }
}

/**
 * Obtener estadísticas de ejecución por categoría para un municipio
 */
export async function getCuipoByCategoria(
  codigoDane: string,
  vigencia: number = DEFAULT_VIGENCIA
): Promise<CuipoEjecucionByCategoria[]> {
  const summary = await getCuipoSummary(codigoDane, vigencia);
  return summary?.ejecucion_por_categoria || [];
}
