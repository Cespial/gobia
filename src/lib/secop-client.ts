/**
 * Cliente TypeScript para consumir datos SECOP II de datos.gov.co
 * SECOP = Sistema Electrónico de Contratación Pública
 *
 * Dataset: jbjy-vk9h (SECOP II - Contratos electrónicos)
 */

const SECOP_DATASET = "jbjy-vk9h";
const DATOS_GOV_BASE = "https://www.datos.gov.co/resource";
const ANTIOQUIA_DEPT_CODE = "05";

// ============================================================================
// TYPES
// ============================================================================

export interface SecopContract {
  id: string;
  numero_contrato: string;
  codigo_entidad: string;
  nombre_entidad: string;
  valor_contrato: number;
  tipo_contrato: string;
  estado: string;
  objeto: string;
  fecha_firma: Date;
  fecha_inicio_ejecucion: Date;
  fecha_fin_ejecucion: Date;
  empresa_contratista: string;
  nit_contratista: string;
  vigencia: number;
  modalidad: string;
}

export interface SecopContractSummary {
  total_contratos: number;
  valor_total: number;
  valor_promedio: number;
  por_estado: Record<string, number>;
  por_tipo: Record<string, { cantidad: number; valor: number }>;
  top_contratistas: { nombre: string; nit: string; contratos: number; valor: number }[];
}

export interface SecopMunicipalMetrics {
  codigo_dane: string;
  municipio: string;
  total_contratos: number;
  valor_total: number;
  tipo_predominante: string;
  porcentaje_activos: number;
}

// Raw type from datos.gov.co
interface SecopRawRecord {
  id_del_proceso?: string;
  referencia_del_contrato?: string;
  codigo_de_la_entidad?: string;
  nombre_de_la_entidad?: string;
  valor_del_contrato?: string;
  tipo_de_contrato?: string;
  estado_del_proceso?: string;
  objeto_del_proceso?: string;
  fecha_de_firma?: string;
  fecha_de_inicio_del_contrato?: string;
  fecha_de_fin_del_contrato?: string;
  nom_raz_social_contratista?: string;
  identificaci_n_del_contratista?: string;
  anno_firma?: string;
  modalidad_de_contrataci_n?: string;
  departamento_entidad?: string;
  municipio_entidad?: string;
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

function parseDate(value: string | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function normalizeContractType(tipo: string | undefined): string {
  if (!tipo) return "Otros";
  const t = tipo.toLowerCase();

  if (t.includes("prestación de servicios") || t.includes("prestacion de servicios")) {
    return "Prestación de servicios";
  }
  if (t.includes("suministro")) return "Suministro";
  if (t.includes("obra")) return "Obra";
  if (t.includes("consultoría") || t.includes("consultoria")) return "Consultoría";
  if (t.includes("interventoría") || t.includes("interventoria")) return "Interventoría";
  if (t.includes("compraventa")) return "Compraventa";
  if (t.includes("arrendamiento")) return "Arrendamiento";
  if (t.includes("concesión") || t.includes("concesion")) return "Concesión";

  return "Otros";
}

function normalizeState(estado: string | undefined): string {
  if (!estado) return "Sin información";
  const e = estado.toLowerCase();

  if (e.includes("celebrado")) return "Celebrado";
  if (e.includes("adjudicado")) return "Adjudicado";
  if (e.includes("convocado")) return "Convocado";
  if (e.includes("liquidado")) return "Liquidado";
  if (e.includes("evaluación") || e.includes("evaluacion")) return "En evaluación";
  if (e.includes("ejecución") || e.includes("ejecucion")) return "En ejecución";
  if (e.includes("terminado")) return "Terminado";
  if (e.includes("borrador")) return "Borrador";
  if (e.includes("cerrado")) return "Cerrado";

  return estado;
}

async function fetchFromDatosGov<T>(
  datasetId: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const url = new URL(`${DATOS_GOV_BASE}/${datasetId}.json`);

  // Add default limit
  url.searchParams.set("$limit", params.$limit || "1000");

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

function mapRawToContract(raw: SecopRawRecord): SecopContract {
  return {
    id: raw.id_del_proceso || "",
    numero_contrato: raw.referencia_del_contrato || "",
    codigo_entidad: raw.codigo_de_la_entidad || "",
    nombre_entidad: raw.nombre_de_la_entidad || "",
    valor_contrato: parseNumber(raw.valor_del_contrato),
    tipo_contrato: normalizeContractType(raw.tipo_de_contrato),
    estado: normalizeState(raw.estado_del_proceso),
    objeto: raw.objeto_del_proceso || "",
    fecha_firma: parseDate(raw.fecha_de_firma),
    fecha_inicio_ejecucion: parseDate(raw.fecha_de_inicio_del_contrato),
    fecha_fin_ejecucion: parseDate(raw.fecha_de_fin_del_contrato),
    empresa_contratista: raw.nom_raz_social_contratista || "",
    nit_contratista: raw.identificaci_n_del_contratista || "",
    vigencia: parseInt(raw.anno_firma || new Date().getFullYear().toString()),
    modalidad: raw.modalidad_de_contrataci_n || "",
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Obtener contratos SECOP de un municipio
 */
export async function getSecopContractsByMunicipality(
  codigoDane: string,
  vigencia?: number,
  limit: number = 50
): Promise<SecopContract[]> {
  try {
    let whereClause = `codigo_de_la_entidad LIKE '${codigoDane}%'`;

    if (vigencia) {
      whereClause += ` AND anno_firma='${vigencia}'`;
    }

    const rawData = await fetchFromDatosGov<SecopRawRecord>(SECOP_DATASET, {
      $where: whereClause,
      $order: "fecha_de_firma DESC",
      $limit: limit.toString(),
    });

    return rawData.map(mapRawToContract);
  } catch (error) {
    console.error(`Error fetching SECOP contracts for ${codigoDane}:`, error);
    return [];
  }
}

/**
 * Obtener cantidad total de contratos de un municipio
 */
export async function getSecopContractsCount(
  codigoDane: string,
  vigencia?: number
): Promise<number> {
  try {
    let whereClause = `codigo_de_la_entidad LIKE '${codigoDane}%'`;

    if (vigencia) {
      whereClause += ` AND anno_firma='${vigencia}'`;
    }

    const rawData = await fetchFromDatosGov<{ count: string }>(SECOP_DATASET, {
      $select: "count(*) as count",
      $where: whereClause,
    });

    return parseInt(rawData[0]?.count || "0");
  } catch (error) {
    console.error(`Error fetching SECOP count for ${codigoDane}:`, error);
    return 0;
  }
}

/**
 * Obtener valor total de contratación de un municipio
 */
export async function getSecopTotalValue(
  codigoDane: string,
  vigencia?: number
): Promise<number> {
  try {
    let whereClause = `codigo_de_la_entidad LIKE '${codigoDane}%'`;

    if (vigencia) {
      whereClause += ` AND anno_firma='${vigencia}'`;
    }

    const rawData = await fetchFromDatosGov<{ total: string }>(SECOP_DATASET, {
      $select: "sum(valor_del_contrato) as total",
      $where: whereClause,
    });

    return parseNumber(rawData[0]?.total);
  } catch (error) {
    console.error(`Error fetching SECOP total value for ${codigoDane}:`, error);
    return 0;
  }
}

/**
 * Obtener distribución de contratos por tipo
 */
export async function getSecopByType(
  codigoDane: string,
  vigencia?: number
): Promise<Record<string, { cantidad: number; valor: number }>> {
  try {
    let whereClause = `codigo_de_la_entidad LIKE '${codigoDane}%'`;

    if (vigencia) {
      whereClause += ` AND anno_firma='${vigencia}'`;
    }

    const rawData = await fetchFromDatosGov<SecopRawRecord>(SECOP_DATASET, {
      $where: whereClause,
      $limit: "5000",
    });

    const byType: Record<string, { cantidad: number; valor: number }> = {};

    rawData.forEach((record) => {
      const tipo = normalizeContractType(record.tipo_de_contrato);
      const valor = parseNumber(record.valor_del_contrato);

      if (!byType[tipo]) {
        byType[tipo] = { cantidad: 0, valor: 0 };
      }
      byType[tipo].cantidad += 1;
      byType[tipo].valor += valor;
    });

    return byType;
  } catch (error) {
    console.error(`Error fetching SECOP by type for ${codigoDane}:`, error);
    return {};
  }
}

/**
 * Obtener resumen completo de contratación de un municipio
 */
export async function getSecopContractSummary(
  codigoDane: string,
  vigencia?: number
): Promise<SecopContractSummary> {
  try {
    let whereClause = `codigo_de_la_entidad LIKE '${codigoDane}%'`;

    if (vigencia) {
      whereClause += ` AND anno_firma='${vigencia}'`;
    }

    const rawData = await fetchFromDatosGov<SecopRawRecord>(SECOP_DATASET, {
      $where: whereClause,
      $limit: "5000",
    });

    // Aggregate stats
    let valorTotal = 0;
    const porEstado: Record<string, number> = {};
    const porTipo: Record<string, { cantidad: number; valor: number }> = {};
    const contratistas: Record<string, { nombre: string; nit: string; contratos: number; valor: number }> = {};

    rawData.forEach((record) => {
      const valor = parseNumber(record.valor_del_contrato);
      const estado = normalizeState(record.estado_del_proceso);
      const tipo = normalizeContractType(record.tipo_de_contrato);
      const nit = record.identificaci_n_del_contratista || "";
      const nombre = record.nom_raz_social_contratista || "";

      valorTotal += valor;

      // Por estado
      porEstado[estado] = (porEstado[estado] || 0) + 1;

      // Por tipo
      if (!porTipo[tipo]) {
        porTipo[tipo] = { cantidad: 0, valor: 0 };
      }
      porTipo[tipo].cantidad += 1;
      porTipo[tipo].valor += valor;

      // Contratistas
      if (nit) {
        if (!contratistas[nit]) {
          contratistas[nit] = { nombre, nit, contratos: 0, valor: 0 };
        }
        contratistas[nit].contratos += 1;
        contratistas[nit].valor += valor;
      }
    });

    // Top 10 contratistas por valor
    const topContratistas = Object.values(contratistas)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    return {
      total_contratos: rawData.length,
      valor_total: valorTotal,
      valor_promedio: rawData.length > 0 ? Math.round(valorTotal / rawData.length) : 0,
      por_estado: porEstado,
      por_tipo: porTipo,
      top_contratistas: topContratistas,
    };
  } catch (error) {
    console.error(`Error fetching SECOP summary for ${codigoDane}:`, error);
    return {
      total_contratos: 0,
      valor_total: 0,
      valor_promedio: 0,
      por_estado: {},
      por_tipo: {},
      top_contratistas: [],
    };
  }
}

/**
 * Obtener métricas de contratación para todos los municipios de Antioquia
 */
export async function getAntioquiaSecopMetrics(
  vigencia?: number
): Promise<SecopMunicipalMetrics[]> {
  try {
    let whereClause = `departamento_entidad='Antioquia' OR codigo_de_la_entidad LIKE '${ANTIOQUIA_DEPT_CODE}%'`;

    if (vigencia) {
      whereClause = `(${whereClause}) AND anno_firma='${vigencia}'`;
    }

    const rawData = await fetchFromDatosGov<SecopRawRecord>(SECOP_DATASET, {
      $where: whereClause,
      $limit: "10000",
    });

    // Group by municipality
    const municipioData: Record<string, SecopRawRecord[]> = {};

    rawData.forEach((record) => {
      const codigo = record.codigo_de_la_entidad || "";
      const municipio = record.municipio_entidad || "";

      // Use codigo if available, otherwise municipio name
      const key = codigo.startsWith(ANTIOQUIA_DEPT_CODE) ? codigo : municipio;

      if (key) {
        if (!municipioData[key]) {
          municipioData[key] = [];
        }
        municipioData[key].push(record);
      }
    });

    // Process each municipality
    const results: SecopMunicipalMetrics[] = [];

    for (const [key, records] of Object.entries(municipioData)) {
      let valorTotal = 0;
      const porTipo: Record<string, number> = {};
      let activos = 0;

      records.forEach((record) => {
        const valor = parseNumber(record.valor_del_contrato);
        const tipo = normalizeContractType(record.tipo_de_contrato);
        const estado = normalizeState(record.estado_del_proceso);

        valorTotal += valor;
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;

        if (["Celebrado", "En ejecución", "Adjudicado"].includes(estado)) {
          activos += 1;
        }
      });

      // Find predominant type
      const tipoPredominante = Object.entries(porTipo)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      const firstRecord = records[0];

      results.push({
        codigo_dane: key.length === 5 ? key : "",
        municipio: firstRecord.municipio_entidad || firstRecord.nombre_de_la_entidad || key,
        total_contratos: records.length,
        valor_total: valorTotal,
        tipo_predominante: tipoPredominante,
        porcentaje_activos: records.length > 0
          ? Math.round((activos / records.length) * 100)
          : 0,
      });
    }

    return results.sort((a, b) => b.total_contratos - a.total_contratos);
  } catch (error) {
    console.error("Error fetching Antioquia SECOP metrics:", error);
    return [];
  }
}

/**
 * Obtener últimos contratos de un municipio ordenados por valor
 */
export async function getSecopTopContracts(
  codigoDane: string,
  vigencia?: number,
  limit: number = 5
): Promise<SecopContract[]> {
  try {
    let whereClause = `codigo_de_la_entidad LIKE '${codigoDane}%'`;

    if (vigencia) {
      whereClause += ` AND anno_firma='${vigencia}'`;
    }

    const rawData = await fetchFromDatosGov<SecopRawRecord>(SECOP_DATASET, {
      $where: whereClause,
      $order: "valor_del_contrato DESC",
      $limit: limit.toString(),
    });

    return rawData.map(mapRawToContract);
  } catch (error) {
    console.error(`Error fetching top SECOP contracts for ${codigoDane}:`, error);
    return [];
  }
}
