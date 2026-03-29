/**
 * Cliente TypeScript para consumir datos TerriData de datos.gov.co
 * TerriData consolida indicadores socioeconómicos de 1,122 municipios colombianos
 *
 * Dataset: 64cq-xb2k (TerriData consolidado)
 * Filtro Antioquia: $where=departamento='Antioquia'
 */

const TERRIDATA_DATASET = "64cq-xb2k";
const DATOS_GOV_BASE = "https://www.datos.gov.co/resource";
const ANTIOQUIA_DEPT = "Antioquia";
const DEFAULT_VIGENCIA = 2022;

// ============================================================================
// TYPES
// ============================================================================

export type TerriDataDimension =
  | "Educación"
  | "Salud"
  | "Servicios Públicos"
  | "Pobreza y Desigualdad"
  | "Demografía"
  | "Mercado Laboral";

export interface SocialData {
  codigoDane: string;
  municipio: string;
  vigencia: number;
  educacion: {
    cobertura_neta_basica: number;      // %
    cobertura_neta_media: number;       // %
    tasa_desercion: number;             // %
    puntaje_pruebas_saber: number;      // promedio
    docentes_por_1000hab: number;
  };
  salud: {
    afiliacion_salud: number;           // %
    mortalidad_infantil: number;        // por 1000 NV
    cobertura_vacunacion: number;       // %
    camas_por_1000hab: number;
  };
  pobreza: {
    nbi: number;                        // % con NBI
    ipm: number;                        // Índice Pobreza Multidimensional %
    gini: number;                       // coeficiente
    hogares_con_nbi: number;
  };
  servicios: {
    cobertura_acueducto: number;        // %
    cobertura_alcantarillado: number;   // %
    cobertura_energia: number;          // %
    cobertura_internet: number;         // %
  };
  demografia: {
    poblacion_total: number;
    poblacion_urbana: number;
    poblacion_rural: number;
    tasa_crecimiento: number;
    densidad_hab_km2: number;
  };
}

export interface SocialRanking {
  codigoDane: string;
  nombre: string;
  valor: number;
  ranking: number;
  dimension: TerriDataDimension;
  indicador: string;
}

// Raw types from datos.gov.co TerriData
interface TerriDataRawRecord {
  codigo_municipio?: string;
  municipio?: string;
  departamento?: string;
  anno?: string;
  indicador?: string;
  dimension?: string;
  valor?: string;
  fuente?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/[,$%]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
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
// INDICATOR MAPPING
// ============================================================================

// Map TerriData indicator names to our structure
const INDICATOR_MAPPING: Record<string, { category: keyof SocialData; field: string }> = {
  // Educación
  "Cobertura neta en educación básica": { category: "educacion", field: "cobertura_neta_basica" },
  "Cobertura neta en educación media": { category: "educacion", field: "cobertura_neta_media" },
  "Tasa de deserción intra-anual": { category: "educacion", field: "tasa_desercion" },
  "Puntaje promedio pruebas Saber 11": { category: "educacion", field: "puntaje_pruebas_saber" },
  "Docentes por cada 1.000 habitantes": { category: "educacion", field: "docentes_por_1000hab" },

  // Salud
  "Cobertura de afiliación en salud": { category: "salud", field: "afiliacion_salud" },
  "Tasa de mortalidad infantil": { category: "salud", field: "mortalidad_infantil" },
  "Cobertura de vacunación DPT": { category: "salud", field: "cobertura_vacunacion" },
  "Camas hospitalarias por cada 1.000 habitantes": { category: "salud", field: "camas_por_1000hab" },

  // Pobreza
  "Índice de Necesidades Básicas Insatisfechas": { category: "pobreza", field: "nbi" },
  "Índice de Pobreza Multidimensional": { category: "pobreza", field: "ipm" },
  "Coeficiente de Gini": { category: "pobreza", field: "gini" },
  "Hogares con NBI": { category: "pobreza", field: "hogares_con_nbi" },

  // Servicios
  "Cobertura de acueducto": { category: "servicios", field: "cobertura_acueducto" },
  "Cobertura de alcantarillado": { category: "servicios", field: "cobertura_alcantarillado" },
  "Cobertura de energía eléctrica": { category: "servicios", field: "cobertura_energia" },
  "Cobertura de internet": { category: "servicios", field: "cobertura_internet" },

  // Demografía
  "Población total": { category: "demografia", field: "poblacion_total" },
  "Población urbana": { category: "demografia", field: "poblacion_urbana" },
  "Población rural": { category: "demografia", field: "poblacion_rural" },
  "Tasa de crecimiento poblacional": { category: "demografia", field: "tasa_crecimiento" },
  "Densidad poblacional": { category: "demografia", field: "densidad_hab_km2" },
};

// Dimension to indicator mapping for rankings
const DIMENSION_INDICATORS: Record<TerriDataDimension, string[]> = {
  "Educación": [
    "Cobertura neta en educación básica",
    "Cobertura neta en educación media",
    "Tasa de deserción intra-anual",
    "Puntaje promedio pruebas Saber 11",
  ],
  "Salud": [
    "Cobertura de afiliación en salud",
    "Tasa de mortalidad infantil",
    "Cobertura de vacunación DPT",
  ],
  "Servicios Públicos": [
    "Cobertura de acueducto",
    "Cobertura de alcantarillado",
    "Cobertura de energía eléctrica",
    "Cobertura de internet",
  ],
  "Pobreza y Desigualdad": [
    "Índice de Necesidades Básicas Insatisfechas",
    "Índice de Pobreza Multidimensional",
    "Coeficiente de Gini",
  ],
  "Demografía": [
    "Población total",
    "Densidad poblacional",
  ],
  "Mercado Laboral": [
    "Tasa de desempleo",
    "Tasa de ocupación",
  ],
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Obtener todos los indicadores sociales de un municipio
 */
export async function getMunicipalSocialData(
  codigoDane: string,
  vigencia: number = DEFAULT_VIGENCIA
): Promise<SocialData | null> {
  try {
    const rawData = await fetchFromDatosGov<TerriDataRawRecord>(TERRIDATA_DATASET, {
      codigo_municipio: codigoDane,
      anno: vigencia.toString(),
      $limit: "100",
    });

    if (!rawData.length) {
      return null;
    }

    // Initialize structure with defaults
    const socialData: SocialData = {
      codigoDane,
      municipio: rawData[0].municipio || "",
      vigencia,
      educacion: {
        cobertura_neta_basica: 0,
        cobertura_neta_media: 0,
        tasa_desercion: 0,
        puntaje_pruebas_saber: 0,
        docentes_por_1000hab: 0,
      },
      salud: {
        afiliacion_salud: 0,
        mortalidad_infantil: 0,
        cobertura_vacunacion: 0,
        camas_por_1000hab: 0,
      },
      pobreza: {
        nbi: 0,
        ipm: 0,
        gini: 0,
        hogares_con_nbi: 0,
      },
      servicios: {
        cobertura_acueducto: 0,
        cobertura_alcantarillado: 0,
        cobertura_energia: 0,
        cobertura_internet: 0,
      },
      demografia: {
        poblacion_total: 0,
        poblacion_urbana: 0,
        poblacion_rural: 0,
        tasa_crecimiento: 0,
        densidad_hab_km2: 0,
      },
    };

    // Map raw data to structure
    for (const record of rawData) {
      const indicador = record.indicador;
      if (!indicador) continue;

      const mapping = INDICATOR_MAPPING[indicador];
      if (mapping) {
        const category = socialData[mapping.category];
        if (category && typeof category === "object") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (category as any)[mapping.field] = parseNumber(record.valor);
        }
      }
    }

    return socialData;
  } catch (error) {
    console.error(`Error fetching social data for ${codigoDane}:`, error);
    return null;
  }
}

/**
 * Obtener ranking de indicadores sociales para Antioquia
 */
export async function getAntioquiaSocialRanking(
  dimension: TerriDataDimension,
  vigencia: number = DEFAULT_VIGENCIA
): Promise<SocialRanking[]> {
  try {
    // Get primary indicator for dimension
    const indicators = DIMENSION_INDICATORS[dimension];
    const primaryIndicator = indicators[0];

    const rawData = await fetchFromDatosGov<TerriDataRawRecord>(TERRIDATA_DATASET, {
      departamento: ANTIOQUIA_DEPT,
      anno: vigencia.toString(),
      indicador: primaryIndicator,
      $limit: "150",
    });

    if (!rawData.length) {
      return [];
    }

    // Parse and sort
    const rankings: SocialRanking[] = rawData
      .filter((r) => r.codigo_municipio && r.municipio && r.valor)
      .map((r) => ({
        codigoDane: r.codigo_municipio!,
        nombre: r.municipio!,
        valor: parseNumber(r.valor),
        ranking: 0,
        dimension,
        indicador: primaryIndicator,
      }));

    // Determine sort order (lower is better for NBI, IPM, mortality, desertion)
    const lowerIsBetter = [
      "Índice de Necesidades Básicas Insatisfechas",
      "Índice de Pobreza Multidimensional",
      "Tasa de mortalidad infantil",
      "Tasa de deserción intra-anual",
      "Coeficiente de Gini",
    ].includes(primaryIndicator);

    rankings.sort((a, b) =>
      lowerIsBetter ? a.valor - b.valor : b.valor - a.valor
    );

    // Assign rankings
    return rankings.map((r, idx) => ({
      ...r,
      ranking: idx + 1,
    }));
  } catch (error) {
    console.error(`Error fetching Antioquia social ranking for ${dimension}:`, error);
    return [];
  }
}

/**
 * Obtener indicadores específicos de NBI para todos los municipios de Antioquia
 */
export async function getAntioquiaNBIRanking(
  vigencia: number = DEFAULT_VIGENCIA
): Promise<SocialRanking[]> {
  return getAntioquiaSocialRanking("Pobreza y Desigualdad", vigencia);
}

/**
 * Obtener cobertura educación para todos los municipios de Antioquia
 */
export async function getAntioquiaEducacionRanking(
  vigencia: number = DEFAULT_VIGENCIA
): Promise<SocialRanking[]> {
  return getAntioquiaSocialRanking("Educación", vigencia);
}

/**
 * Obtener cobertura salud para todos los municipios de Antioquia
 */
export async function getAntioquiaSaludRanking(
  vigencia: number = DEFAULT_VIGENCIA
): Promise<SocialRanking[]> {
  return getAntioquiaSocialRanking("Salud", vigencia);
}

/**
 * Obtener cobertura servicios públicos para todos los municipios de Antioquia
 */
export async function getAntioquiaServiciosRanking(
  vigencia: number = DEFAULT_VIGENCIA
): Promise<SocialRanking[]> {
  return getAntioquiaSocialRanking("Servicios Públicos", vigencia);
}

export default {
  getMunicipalSocialData,
  getAntioquiaSocialRanking,
  getAntioquiaNBIRanking,
  getAntioquiaEducacionRanking,
  getAntioquiaSaludRanking,
  getAntioquiaServiciosRanking,
};
