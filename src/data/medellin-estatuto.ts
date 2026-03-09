/**
 * Datos reales del Estatuto Tributario de Medellín
 * Fuente: Acuerdo 093 de 2023 — Norma Sustantiva Tributaria del
 * Distrito Especial de Ciencia, Tecnología e Innovación de Medellín.
 *
 * Sancionado el 11 de diciembre de 2023.
 * Este archivo alimenta el demo de la plataforma Gobia.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface EstatutoMeta {
  municipio: string;
  departamento: string;
  codDane: string;
  acuerdo: string;
  nombre: string;
  sancionado: string;
  totalArticulos: number;
  totalTitulos: number;
  totalCapitulos?: number;
  vigente: boolean;
}

export interface Articulo {
  numero: number;
  titulo: string;
  descripcion?: string;
}

export interface Capitulo {
  nombre: string;
  articulos: Articulo[];
}

export interface TituloEstatuto {
  titulo: string;
  nombre: string;
  capitulos?: Capitulo[];
  articulos?: Articulo[];
}

export interface TarifaPredialResidencial {
  estrato: number;
  rangoAvaluo: string;
  tarifaXMil: number;
}

export interface TarifaPredialNoResidencial {
  categoria: string;
  tarifaXMil: number;
}

export interface TarifaICA {
  codigoCIIU: string;
  actividad: string;
  tipo: "Industrial" | "Comercial" | "Servicios" | "Financiero" | "Otro";
  tarifaXMil: number;
  nota?: string;
}

export interface TarifaRST {
  tipo: string;
  tarifaConsolidadaXMil: number;
}

export interface TarifaFinancieraProgresion {
  year: number;
  tarifaXMil: number;
  nota?: string;
}

export interface RetencionICAData {
  tarifaGeneral: number;
  baseMinima: number;
  periodicidad: string;
  autorretentoresNombrados: string;
}

// ---------------------------------------------------------------------------
// 1. Metadata del Estatuto
// ---------------------------------------------------------------------------

/** Información general del Acuerdo 093 de 2023. */
export const estatutoMeta = {
  municipio: "Medellín",
  departamento: "Antioquia",
  codDane: "05001",
  acuerdo: "Acuerdo 093 de 2023",
  nombre:
    "Norma Sustantiva Tributaria del Distrito Especial de Ciencia, Tecnología e Innovación de Medellín",
  sancionado: "2023-12-11",
  totalArticulos: 318,
  totalTitulos: 2,
  totalCapitulos: 22,
  vigente: true,
} as const satisfies EstatutoMeta;

// ---------------------------------------------------------------------------
// 2. Estructura del Estatuto — Títulos, Capítulos y Artículos
// ---------------------------------------------------------------------------

/** Estructura completa de títulos, capítulos y artículos del Acuerdo 093 de 2023. */
export const estatutoStructure: readonly TituloEstatuto[] = [
  // ── TÍTULO I ─────────────────────────────────────────────────────────────
  {
    titulo: "TÍTULO I",
    nombre: "Disposiciones Generales",
    articulos: [
      { numero: 1, titulo: "Objeto" },
      { numero: 2, titulo: "Deber ciudadano" },
      { numero: 3, titulo: "Principios del sistema tributario" },
      { numero: 4, titulo: "Autonomía tributaria" },
      { numero: 5, titulo: "Imposición de tributos" },
      { numero: 6, titulo: "Competencia normativa" },
      {
        numero: 7,
        titulo: "Tributos distritales",
        descripcion:
          "Enumeración de los 25 tributos autorizados para el Distrito de Medellín.",
      },
      { numero: 8, titulo: "Elementos de la obligación tributaria" },
      { numero: 9, titulo: "Exenciones y tratamientos preferenciales" },
      { numero: 10, titulo: "Identificación tributaria" },
      { numero: 11, titulo: "Justicia y equidad tributaria" },
      { numero: 12, titulo: "Remisión normativa" },
    ],
  },

  // ── TÍTULO II ────────────────────────────────────────────────────────────
  {
    titulo: "TÍTULO II",
    nombre: "Tributos Distritales",
    capitulos: [
      // Cap I — Impuesto Predial Unificado
      {
        nombre: "Impuesto Predial Unificado",
        articulos: [
          { numero: 13, titulo: "Autorización legal" },
          { numero: 14, titulo: "Carácter real del impuesto" },
          { numero: 15, titulo: "Procedimientos catastrales" },
          { numero: 16, titulo: "Sujeto activo" },
          { numero: 17, titulo: "Sujetos pasivos" },
          { numero: 18, titulo: "Agentes de retención" },
          { numero: 19, titulo: "Responsabilidad solidaria" },
          { numero: 20, titulo: "Información exógena catastral" },
          { numero: 21, titulo: "Hecho generador" },
          {
            numero: 22,
            titulo: "Período de causación",
            descripcion:
              "Se causa el 1 de enero de cada vigencia fiscal sobre predios existentes.",
          },
          {
            numero: 23,
            titulo: "Base gravable",
            descripcion:
              "Avalúo catastral vigente al 1 de enero del respectivo año gravable.",
          },
          {
            numero: 24,
            titulo: "Tarifas del impuesto predial",
            descripcion:
              "Tarifas diferenciales por estrato, uso y rango de avalúo. Rango legal: 5 a 33 por mil.",
          },
          { numero: 25, titulo: "Reajuste de avalúos" },
          { numero: 26, titulo: "Modificaciones de estrato" },
          { numero: 27, titulo: "No liquidación" },
          { numero: 28, titulo: "Liquidación y facturación" },
          { numero: 29, titulo: "Cobro del impuesto" },
          { numero: 30, titulo: "Cobro estando en discusión" },
          {
            numero: 31,
            titulo: "Sobretasa ambiental",
            descripcion:
              "Sobretasa del 1.5 por mil sobre el avalúo catastral con destino al Área Metropolitana.",
          },
          { numero: 32, titulo: "Paz y salvo predial" },
          { numero: 33, titulo: "Actualización de rangos" },
          { numero: 34, titulo: "Mutaciones catastrales" },
          { numero: 35, titulo: "Vigencia de exenciones" },
        ],
      },

      // Cap II — Impuesto de Industria y Comercio
      {
        nombre: "Impuesto de Industria y Comercio",
        articulos: [
          { numero: 36, titulo: "Autorización legal" },
          {
            numero: 37,
            titulo: "Hecho generador",
            descripcion:
              "Realización de actividades industriales, comerciales o de servicios en la jurisdicción del Distrito.",
          },
          { numero: 38, titulo: "Sujeto activo" },
          { numero: 39, titulo: "Sujetos pasivos" },
          {
            numero: 40,
            titulo: "Base gravable general",
            descripcion:
              "Totalidad de ingresos brutos ordinarios y extraordinarios obtenidos en el período gravable.",
          },
          { numero: 41, titulo: "Bases gravables especiales" },
          { numero: 42, titulo: "Tarifa" },
          {
            numero: 43,
            titulo: "Período gravable",
            descripcion: "Del 1 de enero al 31 de diciembre de cada año.",
          },
          { numero: 44, titulo: "Causación" },
          {
            numero: 45,
            titulo: "Actividad industrial",
            descripcion:
              "Producción, extracción, fabricación, confección, preparación, transformación, manufactura y ensamblaje.",
          },
          {
            numero: 46,
            titulo: "Actividad comercial",
            descripcion:
              "Adquisición de bienes a título oneroso con destino a su enajenación.",
          },
          {
            numero: 47,
            titulo: "Actividad de servicios",
            descripcion:
              "Toda tarea, labor o trabajo ejecutado por persona natural o jurídica sin relación laboral.",
          },
          {
            numero: 48,
            titulo: "Economía digital",
            descripcion:
              "Plataformas digitales y operadores de economía colaborativa.",
          },
          { numero: 49, titulo: "Concurrencia de actividades" },
          { numero: 50, titulo: "Actividades excluidas" },
          {
            numero: 51,
            titulo: "Actividades no sujetas",
            descripcion:
              "Artículos de primera necesidad y otras actividades cuyo gravamen está legalmente prohibido.",
          },
          { numero: 52, titulo: "Prueba de disminución de base gravable" },
          { numero: 53, titulo: "Gravamen actividades ocasionales" },
          {
            numero: 54,
            titulo: "ICA sector financiero",
            descripcion:
              "Régimen especial de tarifas progresivas para entidades vigiladas por la Superintendencia Financiera.",
          },
          { numero: 55, titulo: "Base impositiva sector financiero" },
          {
            numero: 56,
            titulo: "Impuesto por oficina adicional",
            descripcion:
              "27.8 UVT por cada oficina adicional de entidades financieras.",
          },
          {
            numero: 57,
            titulo: "Ingresos operacionales generados en Medellín",
          },
          {
            numero: 58,
            titulo: "Suministro de información Superintendencia Financiera",
          },
          {
            numero: 59,
            titulo: "Adopción Régimen Simple de Tributación (RST)",
          },
          { numero: 60, titulo: "Tarifas ICA para RST" },
          { numero: 61, titulo: "Definición régimen simplificado" },
          { numero: 62, titulo: "Requisitos régimen simplificado" },
          {
            numero: 63,
            titulo: "Ingreso de oficio al régimen simplificado",
          },
          {
            numero: 64,
            titulo: "Ingreso por solicitud del contribuyente",
          },
          { numero: 65, titulo: "Efectos de inclusión" },
          { numero: 66, titulo: "Retiro del régimen simplificado" },
          { numero: 67, titulo: "Tarifas del régimen simplificado" },
          { numero: 68, titulo: "Liquidación y cobro" },
          { numero: 69, titulo: "Unificación del régimen simplificado" },
          {
            numero: 70,
            titulo: "Reglas de territorialidad",
            descripcion:
              "Criterios para determinar la sede efectiva de la actividad gravable.",
          },
          {
            numero: 71,
            titulo: "Códigos de actividad y tarifas ICA",
            descripcion:
              "Tabla de códigos CIIU Rev. 4 con las tarifas por mil aplicables a cada actividad.",
          },
          {
            numero: 72,
            titulo: "Sistema de retención y autorretención ICA",
          },
          { numero: 73, titulo: "Contribuyentes objeto de retención" },
          {
            numero: 74,
            titulo: "Aplicación retenciones y autorretenciones",
          },
          { numero: 75, titulo: "Causación de retención" },
          { numero: 76, titulo: "Declaración retención" },
          { numero: 77, titulo: "Agentes de autorretención" },
          { numero: 78, titulo: "Base y tarifa autorretención" },
          { numero: 79, titulo: "Cancelación por autorretención" },
          { numero: 80, titulo: "Obligaciones del agente autorretenedor" },
          { numero: 81, titulo: "Agentes de retención ICA" },
          { numero: 82, titulo: "Contribuyentes no objeto de retención" },
          {
            numero: 83,
            titulo: "Base y tarifa para retención ICA",
            descripcion:
              "Tarifa general de retención de 1.8 por mil sobre pagos o abonos iguales o superiores a 15 UVT.",
          },
        ],
      },

      // Cap III — Avisos y Tableros
      {
        nombre: "Impuesto de Avisos y Tableros",
        articulos: [
          { numero: 91, titulo: "Autorización legal" },
          { numero: 92, titulo: "Hecho generador" },
          { numero: 93, titulo: "Sujeto activo" },
          { numero: 94, titulo: "Sujeto pasivo" },
          { numero: 95, titulo: "Base gravable" },
          { numero: 96, titulo: "Tarifa" },
          { numero: 97, titulo: "Período gravable" },
          { numero: 98, titulo: "Declaración y pago" },
          { numero: 99, titulo: "Obligaciones formales y sustanciales" },
        ],
      },

      // Cap IV — Sobretasa Bomberil
      {
        nombre: "Sobretasa Bomberil",
        articulos: [
          { numero: 100, titulo: "Autorización legal" },
          { numero: 101, titulo: "Definición" },
          { numero: 102, titulo: "Sujeto activo" },
          { numero: 103, titulo: "Sujeto pasivo" },
          { numero: 104, titulo: "Hecho generador" },
          { numero: 105, titulo: "Base gravable" },
          { numero: 106, titulo: "Tarifa" },
          { numero: 107, titulo: "Declaración y pago" },
        ],
      },

      // Cap V — Publicidad Exterior Visual
      {
        nombre: "Impuesto de Publicidad Exterior Visual",
        articulos: [
          { numero: 108, titulo: "Autorización legal" },
          { numero: 109, titulo: "Definición" },
          { numero: 114, titulo: "Tarifa" },
          { numero: 116, titulo: "Exclusiones" },
          { numero: 117, titulo: "Declaración y pago" },
        ],
      },

      // Cap VI — Espectáculos Públicos
      {
        nombre: "Impuesto de Espectáculos Públicos",
        articulos: [
          { numero: 118, titulo: "Autorización legal" },
          { numero: 122, titulo: "Hecho generador" },
          { numero: 124, titulo: "Tarifa" },
          { numero: 130, titulo: "Espectáculos de artes escénicas" },
        ],
      },

      // Cap VII — Alumbrado Público
      {
        nombre: "Impuesto de Alumbrado Público",
        articulos: [
          { numero: 131, titulo: "Autorización legal" },
          { numero: 135, titulo: "Hecho generador" },
          { numero: 137, titulo: "Tarifa" },
          { numero: 142, titulo: "Responsabilidad del prestador" },
        ],
      },

      // Cap VIII — Telefonía Fija
      {
        nombre: "Impuesto de Telefonía Fija Conmutada",
        articulos: [
          { numero: 143, titulo: "Autorización legal" },
          { numero: 147, titulo: "Hecho generador" },
          { numero: 149, titulo: "Tarifa" },
        ],
      },

      // Cap IX — Delineación Urbana
      {
        nombre: "Impuesto de Delineación Urbana",
        articulos: [
          { numero: 153, titulo: "Autorización legal" },
          { numero: 157, titulo: "Hecho generador" },
          { numero: 159, titulo: "Tarifa" },
          { numero: 165, titulo: "Obligaciones de las curadurías" },
        ],
      },

      // Cap X — Degüello Ganado Menor
      {
        nombre: "Impuesto de Degüello de Ganado Menor",
        articulos: [
          { numero: 166, titulo: "Autorización legal" },
          { numero: 170, titulo: "Hecho generador" },
          { numero: 172, titulo: "Tarifa" },
        ],
      },

      // Cap XI — Circulación y Tránsito
      {
        nombre: "Circulación y Tránsito Vehículos Servicio Público",
        articulos: [
          { numero: 177, titulo: "Autorización legal" },
          { numero: 181, titulo: "Hecho generador" },
          { numero: 183, titulo: "Tarifa" },
        ],
      },

      // Cap XII — Sobretasa a la Gasolina
      {
        nombre: "Sobretasa a la Gasolina",
        articulos: [
          { numero: 187, titulo: "Autorización legal" },
          { numero: 191, titulo: "Hecho generador" },
          { numero: 193, titulo: "Tarifa" },
          { numero: 196, titulo: "Solidaridad en el pago" },
        ],
      },

      // Cap XIII — Tasa Pro Deporte
      {
        nombre: "Tasa Pro Deporte y Recreación",
        articulos: [
          { numero: 199, titulo: "Autorización legal" },
          { numero: 203, titulo: "Hecho generador" },
          { numero: 205, titulo: "Tarifa" },
        ],
      },

      // Cap XIV-XVI — Estacionamiento, Contribuciones
      {
        nombre: "Contribuciones Especiales",
        articulos: [
          { numero: 210, titulo: "Tasa estacionamiento en vía pública" },
          { numero: 217, titulo: "Contribución especial por obra pública" },
          { numero: 229, titulo: "Contribución por parqueadero" },
        ],
      },

      // Cap XVII — Participación en Plusvalía
      {
        nombre: "Participación en Plusvalía",
        articulos: [
          { numero: 242, titulo: "Autorización legal" },
          { numero: 245, titulo: "Hechos generadores" },
          { numero: 246, titulo: "Monto de la participación" },
          { numero: 247, titulo: "Exigibilidad y cobro" },
        ],
      },

      // Cap XVIII-XXII — Estampillas
      {
        nombre: "Estampillas Distritales",
        articulos: [
          { numero: 248, titulo: "Estampilla Pro Cultura" },
          { numero: 267, titulo: "Estampilla Bienestar Adulto Mayor" },
          { numero: 282, titulo: "Estampilla Universidad de Antioquia" },
          { numero: 297, titulo: "Estampilla Pro-Innovación" },
          { numero: 307, titulo: "Estampilla para la Justicia Familiar" },
          { numero: 318, titulo: "Declaración y pago Estampilla Justicia Familiar" },
        ],
      },
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// 3. Tarifas del Impuesto Predial Unificado (Art 24)
// ---------------------------------------------------------------------------

/** Tarifas del impuesto predial unificado — Art 24, Acuerdo 093 de 2023. */
export const tarifasPredial = {
  residencial: [
    { estrato: 1, rangoAvaluo: "Hasta 135 SMLMV", tarifaXMil: 5 },
    { estrato: 1, rangoAvaluo: "Más de 135 SMLMV", tarifaXMil: 6 },
    { estrato: 2, rangoAvaluo: "Hasta 135 SMLMV", tarifaXMil: 5.5 },
    { estrato: 2, rangoAvaluo: "Más de 135 SMLMV", tarifaXMil: 7 },
    { estrato: 3, rangoAvaluo: "Hasta 135 SMLMV", tarifaXMil: 6.5 },
    { estrato: 3, rangoAvaluo: "Más de 135 SMLMV", tarifaXMil: 7.5 },
    { estrato: 4, rangoAvaluo: "Hasta 135 SMLMV", tarifaXMil: 7 },
    { estrato: 4, rangoAvaluo: "Más de 135 SMLMV", tarifaXMil: 9 },
    { estrato: 5, rangoAvaluo: "Hasta 135 SMLMV", tarifaXMil: 8 },
    { estrato: 5, rangoAvaluo: "Más de 135 SMLMV", tarifaXMil: 11 },
    { estrato: 6, rangoAvaluo: "Hasta 135 SMLMV", tarifaXMil: 9.5 },
    { estrato: 6, rangoAvaluo: "Más de 135 SMLMV", tarifaXMil: 15 },
  ] as const satisfies readonly TarifaPredialResidencial[],

  noResidencial: [
    { categoria: "Comercial", tarifaXMil: 9 },
    { categoria: "Industrial", tarifaXMil: 10 },
    { categoria: "Lote urbanizable no urbanizado", tarifaXMil: 33 },
    { categoria: "Lote urbanizado no edificado", tarifaXMil: 33 },
    { categoria: "Fincas de recreo", tarifaXMil: 12 },
    { categoria: "Rural", tarifaXMil: 5 },
  ] as const satisfies readonly TarifaPredialNoResidencial[],
} as const;

// ---------------------------------------------------------------------------
// 4. Tarifas ICA por código CIIU (Art 71) — muestra representativa
// ---------------------------------------------------------------------------

/** Muestra representativa de tarifas ICA por código CIIU — Art 71, Acuerdo 093 de 2023. */
export const tarifasICA: readonly TarifaICA[] = [
  // ── Industriales ─────────────────────────────────────────────────────────
  {
    codigoCIIU: "0510",
    actividad: "Extracción de hulla (carbón de piedra)",
    tipo: "Industrial",
    tarifaXMil: 7,
  },
  {
    codigoCIIU: "1011",
    actividad: "Procesamiento y conservación de carne y productos cárnicos",
    tipo: "Industrial",
    tarifaXMil: 4,
  },
  {
    codigoCIIU: "1311",
    actividad: "Preparación e hilatura de fibras textiles",
    tipo: "Industrial",
    tarifaXMil: 3,
  },
  {
    codigoCIIU: "1410",
    actividad: "Confección de prendas de vestir, excepto prendas de piel",
    tipo: "Industrial",
    tarifaXMil: 3,
  },
  {
    codigoCIIU: "2100",
    actividad:
      "Fabricación de productos farmacéuticos, sustancias químicas medicinales",
    tipo: "Industrial",
    tarifaXMil: 5,
  },
  {
    codigoCIIU: "2610",
    actividad: "Fabricación de componentes y tableros electrónicos",
    tipo: "Industrial",
    tarifaXMil: 7,
  },
  {
    codigoCIIU: "5811",
    actividad: "Edición de libros",
    tipo: "Industrial",
    tarifaXMil: 7,
  },

  // ── Comerciales ──────────────────────────────────────────────────────────
  {
    codigoCIIU: "4511A",
    actividad: "Comercio de vehículos automotores nuevos — nacionales",
    tipo: "Comercial",
    tarifaXMil: 6,
  },
  {
    codigoCIIU: "4511B",
    actividad: "Comercio de vehículos automotores nuevos — extranjeros",
    tipo: "Comercial",
    tarifaXMil: 10,
  },
  {
    codigoCIIU: "4631A",
    actividad: "Comercio al por mayor de productos lácteos — distribuidores",
    tipo: "Comercial",
    tarifaXMil: 2,
  },
  {
    codigoCIIU: "4632",
    actividad: "Comercio al por mayor de bebidas y tabaco",
    tipo: "Comercial",
    tarifaXMil: 10,
  },
  {
    codigoCIIU: "4651",
    actividad:
      "Comercio al por mayor de computadores, equipo periférico y programas de informática",
    tipo: "Comercial",
    tarifaXMil: 8,
  },
  {
    codigoCIIU: "4773",
    actividad:
      "Comercio al por menor de productos farmacéuticos y medicinales",
    tipo: "Comercial",
    tarifaXMil: 5,
  },

  // ── Servicios ────────────────────────────────────────────────────────────
  {
    codigoCIIU: "4111",
    actividad: "Construcción de edificios residenciales",
    tipo: "Servicios",
    tarifaXMil: 5,
  },
  {
    codigoCIIU: "4520",
    actividad:
      "Mantenimiento y reparación de vehículos automotores",
    tipo: "Servicios",
    tarifaXMil: 10,
  },
  {
    codigoCIIU: "5611",
    actividad: "Expendio a la mesa de comidas preparadas — restaurantes",
    tipo: "Servicios",
    tarifaXMil: 10,
  },
  {
    codigoCIIU: "5820",
    actividad: "Edición de programas de informática (software)",
    tipo: "Servicios",
    tarifaXMil: 10,
  },
  {
    codigoCIIU: "6201",
    actividad:
      "Actividades de desarrollo de sistemas informáticos (planificación, análisis, diseño, programación, pruebas)",
    tipo: "Servicios",
    tarifaXMil: 10,
  },
  {
    codigoCIIU: "6910",
    actividad: "Actividades jurídicas",
    tipo: "Servicios",
    tarifaXMil: 10,
  },
  {
    codigoCIIU: "6920",
    actividad:
      "Actividades de contabilidad, teneduría de libros, auditoría financiera y asesoría tributaria",
    tipo: "Servicios",
    tarifaXMil: 10,
  },
  {
    codigoCIIU: "7020",
    actividad: "Actividades de consultoría de gestión",
    tipo: "Servicios",
    tarifaXMil: 10,
  },
  {
    codigoCIIU: "8220",
    actividad: "Actividades de centros de llamadas (call center)",
    tipo: "Servicios",
    tarifaXMil: 3,
  },

  // ── Financiero ───────────────────────────────────────────────────────────
  {
    codigoCIIU: "6412",
    actividad: "Bancos comerciales",
    tipo: "Financiero",
    tarifaXMil: 11,
    nota: "Tarifa vigente a partir de 2025 y siguientes",
  },
  {
    codigoCIIU: "6511",
    actividad: "Seguros generales",
    tipo: "Financiero",
    tarifaXMil: 11,
    nota: "Tarifa vigente a partir de 2025 y siguientes",
  },

  // ── Otro ─────────────────────────────────────────────────────────────────
  {
    codigoCIIU: "0090A",
    actividad:
      "Dividendos y participaciones de entidades no vigiladas por la Superintendencia Financiera",
    tipo: "Otro",
    tarifaXMil: 5,
  },
] as const;

/** Tarifas consolidadas del ICA dentro del Régimen Simple de Tributación (RST) — Art 60. */
export const tarifasRST: readonly TarifaRST[] = [
  { tipo: "Industrial", tarifaConsolidadaXMil: 8.05 },
  { tipo: "Comercial", tarifaConsolidadaXMil: 11.5 },
  { tipo: "Servicios", tarifaConsolidadaXMil: 11.5 },
] as const;

// ---------------------------------------------------------------------------
// 5. Tarifas sector financiero — progresión anual (Art 54)
// ---------------------------------------------------------------------------

/** Progresión de tarifas ICA para el sector financiero — Art 54, Acuerdo 093 de 2023. */
export const tarifasFinancieras = {
  progresion: [
    { year: 2022, tarifaXMil: 8 },
    { year: 2023, tarifaXMil: 9 },
    { year: 2024, tarifaXMil: 10 },
    { year: 2025, tarifaXMil: 11, nota: "y siguientes" },
  ] as const satisfies readonly TarifaFinancieraProgresion[],

  actividades: [
    "6411 Banca Central",
    "6412 Bancos comerciales",
    "6421 Corporaciones financieras",
    "6422 Compañías de financiamiento",
    "6423 Banca de segundo piso",
    "6424 Cooperativas financieras",
    "6431 Fideicomisos",
    "6432 Fondos de cesantías",
    "6491 Leasing financiero",
    "6511 Seguros generales",
    "6512 Seguros de vida",
    "6513 Reaseguros",
  ] as const,
} as const;

// ---------------------------------------------------------------------------
// 6. Tributos Distritales (Art 7)
// ---------------------------------------------------------------------------

/** Los 25 tributos autorizados para el Distrito de Medellín — Art 7, Acuerdo 093 de 2023. */
export const tributosDistritales = [
  "Impuesto Predial Unificado",
  "Impuesto de Industria y Comercio",
  "Impuesto de Avisos y Tableros",
  "Impuesto de Publicidad Exterior Visual",
  "Impuesto de Espectáculos Públicos",
  "Impuesto de Alumbrado Público",
  "Impuesto de Teléfonos",
  "Impuesto de Delineación Urbana",
  "Sobretasa Bomberil",
  "Sobretasa a la Gasolina",
  "Contribución de Valorización",
  "Participación en Plusvalía",
  "Estampilla Pro-cultura",
  "Estampilla Pro-dotación",
  "Estampilla Pro-bienestar del adulto mayor",
  "Contribución Contratos de Obra Pública",
  "Impuesto de Transporte",
  "Impuesto de Degüello",
  "Impuesto de Rifas y Juegos",
  "Tasa Pro-deporte",
  "Tasa Pro-seguridad",
  "Impuesto sobre Vehículos Automotores",
  "Impuesto de Ocupación de Vías",
  "Contribución por Parqueaderos",
  "Demás tributos que autorice la ley",
] as const;

// ---------------------------------------------------------------------------
// 7. Retención de ICA (Arts 72-83)
// ---------------------------------------------------------------------------

/** Parámetros del sistema de retención del ICA — Arts 72-83, Acuerdo 093 de 2023. */
export const retencionICA = {
  /** Tarifa general de retención en la fuente por ICA (por mil). */
  tarifaGeneral: 1.8,
  /** Base mínima en UVT a partir de la cual se practica retención. */
  baseMinima: 15,
  /** Periodicidad de declaración de retenciones. */
  periodicidad: "Bimestral",
  /** Mecanismo de designación de agentes autorretenedores. */
  autorretentoresNombrados:
    "Por Resolución de la Subsecretaría de Ingresos",
} as const satisfies RetencionICAData;
