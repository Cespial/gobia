/**
 * datos.gov.co SODA API client
 * Fetches real Colombian government open data
 */

const BASE_URL = "https://www.datos.gov.co/resource";

// Known dataset IDs
export const DATASETS = {
  /** FUT - Formulario Único Territorial: Ingresos */
  FUT_INGRESOS: "a6ia-xzgy",
  /** SECOP Integrado - Contratos públicos */
  SECOP: "rpmr-utcd",
  /** SECOP II - Contratos electrónicos */
  SECOP_II: "jbjy-vk9h",
} as const;

interface SodaQueryOptions {
  dataset: string;
  where?: string;
  select?: string;
  order?: string;
  limit?: number;
  offset?: number;
  group?: string;
}

export async function sodaQuery<T = Record<string, unknown>>(
  options: SodaQueryOptions
): Promise<T[]> {
  const params = new URLSearchParams();

  if (options.where) params.set("$where", options.where);
  if (options.select) params.set("$select", options.select);
  if (options.order) params.set("$order", options.order);
  if (options.limit) params.set("$limit", String(options.limit));
  if (options.offset) params.set("$offset", String(options.offset));
  if (options.group) params.set("$group", options.group);

  const url = `${BASE_URL}/${options.dataset}.json?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`SODA API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// FUT Ingresos
// ---------------------------------------------------------------------------

export interface FUTIngreso {
  codigo: string;
  nombre: string;
  presupuesto_inicial_pesos: string;
  presupuesto_definitivo_pesos: string;
  recaudo_efectivo_pesos: string;
  total_ingresos_pesos: string;
}

export async function fetchFUTIngresos(): Promise<FUTIngreso[]> {
  return sodaQuery<FUTIngreso>({
    dataset: DATASETS.FUT_INGRESOS,
    select: "codigo, nombre, presupuesto_inicial_pesos, presupuesto_definitivo_pesos, recaudo_efectivo_pesos, total_ingresos_pesos",
    where: "codigo like 'TI.A.1%'",
    limit: 50,
    order: "codigo ASC",
  });
}

// ---------------------------------------------------------------------------
// SECOP Contratos — Medellín
// ---------------------------------------------------------------------------

export interface SECOPContrato {
  nombre_de_la_entidad: string;
  estado_del_proceso: string;
  modalidad_de_contrataci_n: string;
  tipo_de_contrato: string;
  objeto_del_proceso: string;
  valor_contrato: string;
  fecha_de_firma_del_contrato?: string;
  numero_del_contrato: string;
  nom_raz_social_contratista: string;
}

export async function fetchSECOPMedellin(limit = 20): Promise<SECOPContrato[]> {
  return sodaQuery<SECOPContrato>({
    dataset: DATASETS.SECOP,
    where: "municipio_entidad='Medellín'",
    order: "fecha_de_firma_del_contrato DESC",
    limit,
  });
}

export async function fetchSECOPStats(): Promise<{
  totalContratos: number;
  valorTotal: number;
  porModalidad: { modalidad: string; count: number }[];
}> {
  const [countResult, modalidadResult] = await Promise.all([
    sodaQuery<{ cnt: string }>({
      dataset: DATASETS.SECOP,
      select: "count(*) as cnt",
      where: "municipio_entidad='Medellín'",
    }),
    sodaQuery<{ modalidad_de_contrataci_n: string; cnt: string; total: string }>({
      dataset: DATASETS.SECOP,
      select: "modalidad_de_contrataci_n, count(*) as cnt, sum(valor_contrato) as total",
      where: "municipio_entidad='Medellín'",
      group: "modalidad_de_contrataci_n",
      order: "cnt DESC",
      limit: 10,
    }),
  ]);

  return {
    totalContratos: parseInt(countResult[0]?.cnt || "0"),
    valorTotal: modalidadResult.reduce((s, m) => s + parseFloat(m.total || "0"), 0),
    porModalidad: modalidadResult.map((m) => ({
      modalidad: m.modalidad_de_contrataci_n,
      count: parseInt(m.cnt),
    })),
  };
}
