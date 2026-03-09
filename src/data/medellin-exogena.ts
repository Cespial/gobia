/**
 * Datos de información exógena tributaria — Demo Gobia Medellín
 * Formatos de reporte a la DIAN según Resolución 000124 de 2021 y actualizaciones.
 * Fuentes: DIAN, Secretaría de Hacienda de Medellín
 */

// ---------------------------------------------------------------------------
// Formato de reporte exógeno a la DIAN
// ---------------------------------------------------------------------------

export interface FormatoExogena {
  formato: string;
  nombre: string;
  descripcion: string;
  registros: number;
  estado: "validado" | "en_revision" | "pendiente" | "error";
  errores: number;
  ultimaActualizacion: string;
}

/** Formatos exógenos reales para el Municipio de Medellín — Vigencia 2025 */
export const formatosExogena: FormatoExogena[] = [
  {
    formato: "1001",
    nombre: "Pagos y retenciones",
    descripcion: "Pagos o abonos en cuenta y retenciones practicadas — Rte. Fuente, Rte. IVA, Rte. ICA",
    registros: 147_832,
    estado: "validado",
    errores: 0,
    ultimaActualizacion: "2026-02-28",
  },
  {
    formato: "1003",
    nombre: "Retenciones en la fuente",
    descripcion: "Retenciones en la fuente practicadas por concepto de renta, IVA y timbre",
    registros: 89_456,
    estado: "validado",
    errores: 0,
    ultimaActualizacion: "2026-02-27",
  },
  {
    formato: "1005",
    nombre: "IVA descontable",
    descripcion: "Impuesto sobre las ventas descontable — compras y servicios gravados",
    registros: 62_318,
    estado: "en_revision",
    errores: 14,
    ultimaActualizacion: "2026-03-05",
  },
  {
    formato: "1006",
    nombre: "IVA generado",
    descripcion: "Impuesto sobre las ventas generado en operaciones gravadas",
    registros: 54_201,
    estado: "validado",
    errores: 0,
    ultimaActualizacion: "2026-02-26",
  },
  {
    formato: "1007",
    nombre: "Ingresos recibidos",
    descripcion: "Ingresos recibidos durante el año gravable por concepto y tercero",
    registros: 198_745,
    estado: "en_revision",
    errores: 23,
    ultimaActualizacion: "2026-03-06",
  },
  {
    formato: "1008",
    nombre: "Cuentas por cobrar",
    descripcion: "Saldo de cuentas por cobrar al 31 de diciembre del año gravable",
    registros: 34_567,
    estado: "validado",
    errores: 0,
    ultimaActualizacion: "2026-02-25",
  },
  {
    formato: "1009",
    nombre: "Cuentas por pagar",
    descripcion: "Saldo de cuentas por pagar al 31 de diciembre del año gravable",
    registros: 28_934,
    estado: "pendiente",
    errores: 0,
    ultimaActualizacion: "2026-03-01",
  },
  {
    formato: "1010",
    nombre: "Socios y accionistas",
    descripcion: "Información de socios, accionistas, comuneros y/o cooperados",
    registros: 1_245,
    estado: "validado",
    errores: 0,
    ultimaActualizacion: "2026-02-20",
  },
  {
    formato: "1011",
    nombre: "Declaraciones tributarias",
    descripcion: "Información de las declaraciones tributarias — renta, IVA, retención",
    registros: 12_890,
    estado: "error",
    errores: 47,
    ultimaActualizacion: "2026-03-07",
  },
  {
    formato: "1012",
    nombre: "Contratos",
    descripcion: "Información de contratos celebrados durante el año gravable",
    registros: 8_456,
    estado: "pendiente",
    errores: 0,
    ultimaActualizacion: "2026-03-02",
  },
];

// ---------------------------------------------------------------------------
// Resumen general de la exógena
// ---------------------------------------------------------------------------

export interface ResumenExogena {
  vigencia: number;
  totalFormatos: number;
  formatosValidados: number;
  totalRegistros: number;
  registrosConError: number;
  fechaLimite: string;
  diasRestantes: number;
}

export const resumenExogena: ResumenExogena = {
  vigencia: 2025,
  totalFormatos: formatosExogena.length,
  formatosValidados: formatosExogena.filter((f) => f.estado === "validado").length,
  totalRegistros: formatosExogena.reduce((sum, f) => sum + f.registros, 0),
  registrosConError: formatosExogena.reduce((sum, f) => sum + f.errores, 0),
  fechaLimite: "2026-03-31",
  diasRestantes: 23,
};

// ---------------------------------------------------------------------------
// Errores de validación detectados
// ---------------------------------------------------------------------------

export interface ValidacionError {
  formato: string;
  tipo: string;
  registrosAfectados: number;
  severidad: "critico" | "advertencia" | "info";
}

export const erroresValidacion: ValidacionError[] = [
  {
    formato: "1011",
    tipo: "NIT inválido",
    registrosAfectados: 18,
    severidad: "critico",
  },
  {
    formato: "1011",
    tipo: "Valor negativo en base gravable",
    registrosAfectados: 12,
    severidad: "critico",
  },
  {
    formato: "1011",
    tipo: "Código de concepto no vigente",
    registrosAfectados: 17,
    severidad: "advertencia",
  },
  {
    formato: "1007",
    tipo: "Registros duplicados por tercero",
    registrosAfectados: 9,
    severidad: "advertencia",
  },
  {
    formato: "1007",
    tipo: "Valor inconsistente con formato 1001",
    registrosAfectados: 8,
    severidad: "advertencia",
  },
  {
    formato: "1007",
    tipo: "Dirección incompleta del tercero",
    registrosAfectados: 6,
    severidad: "info",
  },
  {
    formato: "1005",
    tipo: "Fecha de factura fuera de vigencia",
    registrosAfectados: 8,
    severidad: "advertencia",
  },
  {
    formato: "1005",
    tipo: "Código de ciudad inválido",
    registrosAfectados: 6,
    severidad: "info",
  },
];

// ---------------------------------------------------------------------------
// Pipeline de validación y envío
// ---------------------------------------------------------------------------

export interface EtapaPipeline {
  etapa: string;
  descripcion: string;
  estado: "completado" | "en_proceso" | "pendiente" | "error";
  progreso: number; // 0-100
  registrosProcesados: number;
  registrosTotales: number;
}

export const pipelineExogena: EtapaPipeline[] = [
  {
    etapa: "Extraccion",
    descripcion: "Extracción de datos contables y tributarios del ERP",
    estado: "completado",
    progreso: 100,
    registrosProcesados: 638_644,
    registrosTotales: 638_644,
  },
  {
    etapa: "Validacion",
    descripcion: "Validación de NITs, valores, conceptos y cruces entre formatos",
    estado: "en_proceso",
    progreso: 87,
    registrosProcesados: 555_620,
    registrosTotales: 638_644,
  },
  {
    etapa: "Formato XML",
    descripcion: "Generación de archivos XML según especificaciones DIAN",
    estado: "en_proceso",
    progreso: 60,
    registrosProcesados: 383_186,
    registrosTotales: 638_644,
  },
  {
    etapa: "Envio DIAN",
    descripcion: "Carga y radicación en el portal MUISCA de la DIAN",
    estado: "pendiente",
    progreso: 0,
    registrosProcesados: 0,
    registrosTotales: 638_644,
  },
];
