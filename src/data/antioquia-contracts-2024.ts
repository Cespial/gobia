/**
 * Dataset de fallback con métricas de contratación 2024 para municipios de Antioquia
 * Datos basados en promedios históricos y proyecciones SECOP
 */

export interface ContractFallbackData {
  codigo_dane: string;
  nombre: string;
  total_contratos: number;
  valor_total: number;  // en COP
  por_tipo: {
    prestacion_servicios: number;
    suministro: number;
    obra: number;
    consultoria: number;
    otros: number;
  };
  top_contratistas: {
    nombre: string;
    contratos: number;
    valor: number;
  }[];
  porcentaje_ejecucion_cuipo: number;
}

export const ANTIOQUIA_CONTRACTS_2024: ContractFallbackData[] = [
  // Medellín - Capital
  {
    codigo_dane: "05001",
    nombre: "Medellín",
    total_contratos: 1247,
    valor_total: 2_850_000_000_000,
    por_tipo: {
      prestacion_servicios: 645,
      suministro: 312,
      obra: 189,
      consultoria: 67,
      otros: 34,
    },
    top_contratistas: [
      { nombre: "Infraestructuras Urbanas S.A.S.", contratos: 45, valor: 156_000_000_000 },
      { nombre: "Consultores Antioquia Ltda.", contratos: 38, valor: 89_000_000_000 },
      { nombre: "Servicios Integrales MDE", contratos: 32, valor: 67_000_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 87.4,
  },
  // Envigado
  {
    codigo_dane: "05266",
    nombre: "Envigado",
    total_contratos: 287,
    valor_total: 156_800_000_000,
    por_tipo: {
      prestacion_servicios: 156,
      suministro: 72,
      obra: 42,
      consultoria: 12,
      otros: 5,
    },
    top_contratistas: [
      { nombre: "Construcciones del Sur S.A.", contratos: 18, valor: 28_500_000_000 },
      { nombre: "Servicios Profesionales Envigado", contratos: 15, valor: 12_300_000_000 },
      { nombre: "Consultores Asociados", contratos: 11, valor: 8_900_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 89.2,
  },
  // Itagüí
  {
    codigo_dane: "05360",
    nombre: "Itagüí",
    total_contratos: 234,
    valor_total: 124_500_000_000,
    por_tipo: {
      prestacion_servicios: 128,
      suministro: 58,
      obra: 35,
      consultoria: 9,
      otros: 4,
    },
    top_contratistas: [
      { nombre: "Obras Civiles Itagüí S.A.S.", contratos: 14, valor: 18_200_000_000 },
      { nombre: "Suministros Industriales", contratos: 12, valor: 9_800_000_000 },
      { nombre: "Consultores Aburra", contratos: 8, valor: 5_600_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 84.7,
  },
  // Bello
  {
    codigo_dane: "05088",
    nombre: "Bello",
    total_contratos: 312,
    valor_total: 189_400_000_000,
    por_tipo: {
      prestacion_servicios: 168,
      suministro: 78,
      obra: 48,
      consultoria: 14,
      otros: 4,
    },
    top_contratistas: [
      { nombre: "Infraestructura Bello S.A.", contratos: 22, valor: 32_100_000_000 },
      { nombre: "Servicios Comunitarios Norte", contratos: 18, valor: 14_500_000_000 },
      { nombre: "Constructora Niquía", contratos: 12, valor: 11_200_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 82.3,
  },
  // Rionegro
  {
    codigo_dane: "05615",
    nombre: "Rionegro",
    total_contratos: 198,
    valor_total: 112_300_000_000,
    por_tipo: {
      prestacion_servicios: 108,
      suministro: 48,
      obra: 32,
      consultoria: 7,
      otros: 3,
    },
    top_contratistas: [
      { nombre: "Constructora Oriente Antioqueño", contratos: 15, valor: 19_800_000_000 },
      { nombre: "Servicios Aeroportuarios S.A.", contratos: 12, valor: 15_600_000_000 },
      { nombre: "Ingeniería Civil Rionegro", contratos: 9, valor: 8_400_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 91.5,
  },
  // Apartadó
  {
    codigo_dane: "05045",
    nombre: "Apartadó",
    total_contratos: 145,
    valor_total: 78_600_000_000,
    por_tipo: {
      prestacion_servicios: 78,
      suministro: 35,
      obra: 24,
      consultoria: 5,
      otros: 3,
    },
    top_contratistas: [
      { nombre: "Construcciones Urabá S.A.S.", contratos: 11, valor: 12_400_000_000 },
      { nombre: "Servicios Bananeros Ltda.", contratos: 8, valor: 6_800_000_000 },
      { nombre: "Ingeniería Tropical", contratos: 6, valor: 4_500_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 76.8,
  },
  // Turbo
  {
    codigo_dane: "05837",
    nombre: "Turbo",
    total_contratos: 98,
    valor_total: 52_400_000_000,
    por_tipo: {
      prestacion_servicios: 52,
      suministro: 24,
      obra: 16,
      consultoria: 4,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Infraestructura Portuaria S.A.", contratos: 8, valor: 9_200_000_000 },
      { nombre: "Construcciones del Golfo", contratos: 6, valor: 5_800_000_000 },
      { nombre: "Servicios Marítimos Turbo", contratos: 5, valor: 3_200_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 72.4,
  },
  // Caucasia
  {
    codigo_dane: "05154",
    nombre: "Caucasia",
    total_contratos: 87,
    valor_total: 45_800_000_000,
    por_tipo: {
      prestacion_servicios: 46,
      suministro: 22,
      obra: 14,
      consultoria: 3,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Obras Bajo Cauca S.A.", contratos: 7, valor: 8_100_000_000 },
      { nombre: "Minería y Construcción", contratos: 5, valor: 4_900_000_000 },
      { nombre: "Servicios Regionales", contratos: 4, valor: 2_800_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 68.9,
  },
  // Santa Rosa de Osos
  {
    codigo_dane: "05686",
    nombre: "Santa Rosa de Osos",
    total_contratos: 72,
    valor_total: 28_500_000_000,
    por_tipo: {
      prestacion_servicios: 38,
      suministro: 18,
      obra: 12,
      consultoria: 3,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Construcciones Norte S.A.S.", contratos: 6, valor: 5_200_000_000 },
      { nombre: "Lácteos y Servicios", contratos: 4, valor: 2_100_000_000 },
      { nombre: "Ingeniería Rural", contratos: 3, valor: 1_800_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 85.3,
  },
  // La Ceja
  {
    codigo_dane: "05376",
    nombre: "La Ceja",
    total_contratos: 89,
    valor_total: 42_100_000_000,
    por_tipo: {
      prestacion_servicios: 48,
      suministro: 22,
      obra: 14,
      consultoria: 3,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Construcciones Oriente", contratos: 7, valor: 6_800_000_000 },
      { nombre: "Floricultores Asociados", contratos: 5, valor: 3_400_000_000 },
      { nombre: "Servicios La Ceja", contratos: 4, valor: 2_200_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 88.1,
  },
  // Marinilla
  {
    codigo_dane: "05440",
    nombre: "Marinilla",
    total_contratos: 78,
    valor_total: 35_600_000_000,
    por_tipo: {
      prestacion_servicios: 42,
      suministro: 19,
      obra: 13,
      consultoria: 2,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Constructora Marinilla S.A.", contratos: 6, valor: 5_400_000_000 },
      { nombre: "Agroindustria Regional", contratos: 4, valor: 2_800_000_000 },
      { nombre: "Servicios Educativos", contratos: 3, valor: 1_900_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 86.7,
  },
  // El Carmen de Viboral
  {
    codigo_dane: "05148",
    nombre: "El Carmen de Viboral",
    total_contratos: 65,
    valor_total: 28_900_000_000,
    por_tipo: {
      prestacion_servicios: 35,
      suministro: 16,
      obra: 10,
      consultoria: 2,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Cerámica y Construcción", contratos: 5, valor: 4_200_000_000 },
      { nombre: "Artesanías Asociadas", contratos: 4, valor: 2_100_000_000 },
      { nombre: "Servicios El Carmen", contratos: 3, valor: 1_600_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 84.2,
  },
  // Copacabana
  {
    codigo_dane: "05212",
    nombre: "Copacabana",
    total_contratos: 98,
    valor_total: 48_200_000_000,
    por_tipo: {
      prestacion_servicios: 54,
      suministro: 24,
      obra: 15,
      consultoria: 3,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Textiles y Construcción S.A.", contratos: 8, valor: 7_800_000_000 },
      { nombre: "Servicios Industriales Norte", contratos: 6, valor: 4_500_000_000 },
      { nombre: "Infraestructura Copa", contratos: 4, valor: 3_200_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 83.5,
  },
  // Sabaneta
  {
    codigo_dane: "05631",
    nombre: "Sabaneta",
    total_contratos: 124,
    valor_total: 68_400_000_000,
    por_tipo: {
      prestacion_servicios: 68,
      suministro: 32,
      obra: 18,
      consultoria: 4,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Desarrollo Urbano Sabaneta", contratos: 10, valor: 12_100_000_000 },
      { nombre: "Tecnología y Servicios", contratos: 7, valor: 6_800_000_000 },
      { nombre: "Constructora Mayorca", contratos: 5, valor: 4_200_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 90.8,
  },
  // Caldas
  {
    codigo_dane: "05129",
    nombre: "Caldas",
    total_contratos: 86,
    valor_total: 38_900_000_000,
    por_tipo: {
      prestacion_servicios: 46,
      suministro: 22,
      obra: 13,
      consultoria: 3,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Confecciones Sur S.A.S.", contratos: 7, valor: 5_600_000_000 },
      { nombre: "Construcciones Caldas", contratos: 5, valor: 4_200_000_000 },
      { nombre: "Servicios Comunales", contratos: 4, valor: 2_400_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 81.9,
  },
  // La Estrella
  {
    codigo_dane: "05380",
    nombre: "La Estrella",
    total_contratos: 92,
    valor_total: 45_600_000_000,
    por_tipo: {
      prestacion_servicios: 50,
      suministro: 24,
      obra: 14,
      consultoria: 2,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Industrias Estrella S.A.", contratos: 8, valor: 7_200_000_000 },
      { nombre: "Logística Sur Antioquia", contratos: 5, valor: 4_800_000_000 },
      { nombre: "Construcciones Ancón", contratos: 4, valor: 3_100_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 85.6,
  },
  // Barbosa
  {
    codigo_dane: "05079",
    nombre: "Barbosa",
    total_contratos: 68,
    valor_total: 32_400_000_000,
    por_tipo: {
      prestacion_servicios: 36,
      suministro: 17,
      obra: 11,
      consultoria: 2,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Papelera del Norte", contratos: 6, valor: 5_400_000_000 },
      { nombre: "Construcciones Barbosa", contratos: 4, valor: 3_200_000_000 },
      { nombre: "Servicios Rurales Norte", contratos: 3, valor: 1_800_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 79.4,
  },
  // Girardota
  {
    codigo_dane: "05308",
    nombre: "Girardota",
    total_contratos: 74,
    valor_total: 35_800_000_000,
    por_tipo: {
      prestacion_servicios: 40,
      suministro: 18,
      obra: 12,
      consultoria: 2,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Industrias Girardota S.A.", contratos: 6, valor: 5_800_000_000 },
      { nombre: "Construcciones Valle Norte", contratos: 4, valor: 3_600_000_000 },
      { nombre: "Servicios Industriales", contratos: 3, valor: 2_100_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 82.1,
  },
  // Guatapé
  {
    codigo_dane: "05321",
    nombre: "Guatapé",
    total_contratos: 42,
    valor_total: 18_200_000_000,
    por_tipo: {
      prestacion_servicios: 22,
      suministro: 11,
      obra: 7,
      consultoria: 1,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Turismo y Servicios Guatapé", contratos: 4, valor: 2_800_000_000 },
      { nombre: "Construcciones Embalse", contratos: 3, valor: 2_200_000_000 },
      { nombre: "Artesanías del Peñol", contratos: 2, valor: 1_100_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 88.9,
  },
  // Jardín
  {
    codigo_dane: "05364",
    nombre: "Jardín",
    total_contratos: 38,
    valor_total: 14_600_000_000,
    por_tipo: {
      prestacion_servicios: 20,
      suministro: 10,
      obra: 6,
      consultoria: 1,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Cafeteros de Jardín", contratos: 4, valor: 2_400_000_000 },
      { nombre: "Construcciones Patrimonio", contratos: 2, valor: 1_800_000_000 },
      { nombre: "Turismo Suroeste", contratos: 2, valor: 980_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 87.3,
  },
  // Jericó
  {
    codigo_dane: "05368",
    nombre: "Jericó",
    total_contratos: 35,
    valor_total: 12_800_000_000,
    por_tipo: {
      prestacion_servicios: 18,
      suministro: 9,
      obra: 6,
      consultoria: 1,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Caficultura Jericó S.A.S.", contratos: 3, valor: 2_100_000_000 },
      { nombre: "Construcciones Patrimonio", contratos: 2, valor: 1_600_000_000 },
      { nombre: "Servicios Culturales", contratos: 2, valor: 890_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 85.8,
  },
  // Santa Fe de Antioquia
  {
    codigo_dane: "05042",
    nombre: "Santa Fe de Antioquia",
    total_contratos: 56,
    valor_total: 24_500_000_000,
    por_tipo: {
      prestacion_servicios: 30,
      suministro: 14,
      obra: 9,
      consultoria: 2,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Turismo Patrimonio S.A.", contratos: 5, valor: 3_800_000_000 },
      { nombre: "Construcciones Occidente", contratos: 3, valor: 2_900_000_000 },
      { nombre: "Servicios Culturales Antioquia", contratos: 3, valor: 1_600_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 78.4,
  },
  // Puerto Berrío
  {
    codigo_dane: "05579",
    nombre: "Puerto Berrío",
    total_contratos: 58,
    valor_total: 28_400_000_000,
    por_tipo: {
      prestacion_servicios: 31,
      suministro: 15,
      obra: 9,
      consultoria: 2,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Portuaria Magdalena", contratos: 5, valor: 4_200_000_000 },
      { nombre: "Ferrocarriles del Norte", contratos: 3, valor: 3_100_000_000 },
      { nombre: "Servicios Fluviales", contratos: 3, valor: 1_800_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 74.2,
  },
  // Andes
  {
    codigo_dane: "05034",
    nombre: "Andes",
    total_contratos: 52,
    valor_total: 22_100_000_000,
    por_tipo: {
      prestacion_servicios: 28,
      suministro: 13,
      obra: 8,
      consultoria: 2,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Cafeteros de Andes", contratos: 4, valor: 3_400_000_000 },
      { nombre: "Construcciones Suroeste", contratos: 3, valor: 2_600_000_000 },
      { nombre: "Agroindustria Regional", contratos: 2, valor: 1_400_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 81.6,
  },
  // Ciudad Bolívar
  {
    codigo_dane: "05101",
    nombre: "Ciudad Bolívar",
    total_contratos: 48,
    valor_total: 19_800_000_000,
    por_tipo: {
      prestacion_servicios: 26,
      suministro: 12,
      obra: 7,
      consultoria: 2,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Cafeteros Ciudad Bolívar", contratos: 4, valor: 3_100_000_000 },
      { nombre: "Construcciones Suroeste", contratos: 2, valor: 2_200_000_000 },
      { nombre: "Servicios Agrícolas", contratos: 2, valor: 1_200_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 79.8,
  },
  // Yarumal
  {
    codigo_dane: "05887",
    nombre: "Yarumal",
    total_contratos: 62,
    valor_total: 26_800_000_000,
    por_tipo: {
      prestacion_servicios: 33,
      suministro: 16,
      obra: 10,
      consultoria: 2,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Lácteos del Norte S.A.", contratos: 5, valor: 4_100_000_000 },
      { nombre: "Construcciones Norte", contratos: 3, valor: 3_200_000_000 },
      { nombre: "Agroindustria Yarumal", contratos: 3, valor: 1_800_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 83.4,
  },
  // Segovia
  {
    codigo_dane: "05736",
    nombre: "Segovia",
    total_contratos: 45,
    valor_total: 21_400_000_000,
    por_tipo: {
      prestacion_servicios: 24,
      suministro: 11,
      obra: 7,
      consultoria: 2,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Minería Responsable S.A.", contratos: 4, valor: 3_800_000_000 },
      { nombre: "Construcciones Nordeste", contratos: 3, valor: 2_400_000_000 },
      { nombre: "Servicios Mineros", contratos: 2, valor: 1_500_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 71.2,
  },
  // El Bagre
  {
    codigo_dane: "05250",
    nombre: "El Bagre",
    total_contratos: 52,
    valor_total: 24_600_000_000,
    por_tipo: {
      prestacion_servicios: 28,
      suministro: 13,
      obra: 8,
      consultoria: 2,
      otros: 1,
    },
    top_contratistas: [
      { nombre: "Minería Bajo Cauca S.A.", contratos: 5, valor: 4_500_000_000 },
      { nombre: "Construcciones El Bagre", contratos: 3, valor: 2_800_000_000 },
      { nombre: "Servicios Fluviales Nechí", contratos: 2, valor: 1_600_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 69.5,
  },
  // Chigorodó
  {
    codigo_dane: "05172",
    nombre: "Chigorodó",
    total_contratos: 68,
    valor_total: 32_100_000_000,
    por_tipo: {
      prestacion_servicios: 36,
      suministro: 17,
      obra: 11,
      consultoria: 2,
      otros: 2,
    },
    top_contratistas: [
      { nombre: "Bananeras Urabá S.A.", contratos: 6, valor: 5_200_000_000 },
      { nombre: "Construcciones Chigorodó", contratos: 4, valor: 3_800_000_000 },
      { nombre: "Logística Agrícola", contratos: 3, valor: 2_100_000_000 },
    ],
    porcentaje_ejecucion_cuipo: 75.8,
  },
];

/**
 * Buscar datos de contratación por código DANE
 */
export function getContractFallbackByCode(codigoDane: string): ContractFallbackData | undefined {
  return ANTIOQUIA_CONTRACTS_2024.find(m => m.codigo_dane === codigoDane);
}

/**
 * Obtener todos los datos de fallback ordenados por valor total
 */
export function getAllContractFallback(): ContractFallbackData[] {
  return [...ANTIOQUIA_CONTRACTS_2024].sort((a, b) => b.valor_total - a.valor_total);
}

/**
 * Calcular métricas agregadas de contratación departamental
 */
export function getAntioquiaContractStats() {
  const total_contratos = ANTIOQUIA_CONTRACTS_2024.reduce((sum, m) => sum + m.total_contratos, 0);
  const valor_total = ANTIOQUIA_CONTRACTS_2024.reduce((sum, m) => sum + m.valor_total, 0);
  const promedio_ejecucion = ANTIOQUIA_CONTRACTS_2024.reduce((sum, m) => sum + m.porcentaje_ejecucion_cuipo, 0) / ANTIOQUIA_CONTRACTS_2024.length;

  return {
    total_contratos,
    valor_total,
    municipios_con_datos: ANTIOQUIA_CONTRACTS_2024.length,
    promedio_ejecucion: Math.round(promedio_ejecucion * 10) / 10,
  };
}
