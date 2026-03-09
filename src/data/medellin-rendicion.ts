/**
 * Datos de rendición de cuentas — Demo Gobia (Medellín)
 * Reportes obligatorios del sector público colombiano y calendario de entregas.
 * Fuentes: CGN, CGR, DNP, DAFP, MinHacienda, Colombia Compra Eficiente
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface ReporteObligatorio {
  id: string;
  nombre: string;
  entidad: string;
  periodicidad: "Mensual" | "Trimestral" | "Anual" | "Semestral";
  proximaFecha: string;
  estado: "completado" | "en_proceso" | "pendiente" | "atrasado";
  progreso: number;
  formatos: number;
  formatosCompletados: number;
  descripcion: string;
}

export interface CalendarioReporte {
  mes: string;
  reportes: { nombre: string; dia: number; estado: "completado" | "pendiente" }[];
}

// ---------------------------------------------------------------------------
// Reportes obligatorios
// ---------------------------------------------------------------------------

export const reportesObligatorios: ReporteObligatorio[] = [
  {
    id: "fut",
    nombre: "FUT — Formulario Único Territorial",
    entidad: "CHIP — Contaduría General de la Nación",
    periodicidad: "Trimestral",
    proximaFecha: "2026-03-31",
    estado: "en_proceso",
    progreso: 72,
    formatos: 18,
    formatosCompletados: 13,
    descripcion: "Información financiera, económica y social de la entidad territorial.",
  },
  {
    id: "chip-cgn",
    nombre: "CHIP Categorías — CGN",
    entidad: "Contaduría General de la Nación",
    periodicidad: "Trimestral",
    proximaFecha: "2026-03-31",
    estado: "en_proceso",
    progreso: 65,
    formatos: 12,
    formatosCompletados: 8,
    descripcion: "Información contable pública bajo las categorías del CHIP.",
  },
  {
    id: "sia-contraloria",
    nombre: "SIA — Sistema de Información de Auditoría",
    entidad: "Contraloría General de la República",
    periodicidad: "Anual",
    proximaFecha: "2026-04-15",
    estado: "pendiente",
    progreso: 30,
    formatos: 8,
    formatosCompletados: 2,
    descripcion: "Reportes de auditoría e información para el control fiscal.",
  },
  {
    id: "sireci",
    nombre: "SIRECI — Sistema de Rendición Electrónica",
    entidad: "Contraloría General de la República",
    periodicidad: "Anual",
    proximaFecha: "2026-02-28",
    estado: "completado",
    progreso: 100,
    formatos: 14,
    formatosCompletados: 14,
    descripcion: "Cuenta e informe de gestión fiscal rendido electrónicamente.",
  },
  {
    id: "spi-dnp",
    nombre: "SPI — Seguimiento de Proyectos de Inversión",
    entidad: "Departamento Nacional de Planeación",
    periodicidad: "Trimestral",
    proximaFecha: "2026-04-10",
    estado: "pendiente",
    progreso: 15,
    formatos: 6,
    formatosCompletados: 1,
    descripcion: "Seguimiento a la ejecución de proyectos del banco de inversión.",
  },
  {
    id: "siho",
    nombre: "SIHO — Sistema de Información Hospitalaria",
    entidad: "Ministerio de Salud y Protección Social",
    periodicidad: "Mensual",
    proximaFecha: "2026-03-15",
    estado: "en_proceso",
    progreso: 85,
    formatos: 4,
    formatosCompletados: 3,
    descripcion: "Información financiera y de gestión de las ESE del municipio.",
  },
  {
    id: "simat",
    nombre: "SIMAT — Sistema Integrado de Matrícula",
    entidad: "Ministerio de Educación Nacional",
    periodicidad: "Trimestral",
    proximaFecha: "2026-03-20",
    estado: "completado",
    progreso: 100,
    formatos: 5,
    formatosCompletados: 5,
    descripcion: "Gestión de matrícula escolar y cobertura educativa.",
  },
  {
    id: "suit",
    nombre: "SUIT — Sistema Único de Información de Trámites",
    entidad: "DAFP — Función Pública",
    periodicidad: "Semestral",
    proximaFecha: "2026-06-30",
    estado: "pendiente",
    progreso: 10,
    formatos: 3,
    formatosCompletados: 0,
    descripcion: "Racionalización de trámites y registro en el inventario nacional.",
  },
  {
    id: "secop",
    nombre: "SECOP I / II — Contratación Pública",
    entidad: "Colombia Compra Eficiente",
    periodicidad: "Mensual",
    proximaFecha: "2026-03-10",
    estado: "completado",
    progreso: 100,
    formatos: 7,
    formatosCompletados: 7,
    descripcion: "Publicación de procesos de contratación y contratos celebrados.",
  },
  {
    id: "informe-concejo",
    nombre: "Informe de Gestión — Concejo Municipal",
    entidad: "Concejo de Medellín",
    periodicidad: "Anual",
    proximaFecha: "2026-03-01",
    estado: "completado",
    progreso: 100,
    formatos: 10,
    formatosCompletados: 10,
    descripcion: "Rendición de cuentas al órgano legislativo municipal.",
  },
  {
    id: "cgr-presupuestal",
    nombre: "CGR Presupuestal — Ejecución Presupuestal",
    entidad: "Contraloría General de la República",
    periodicidad: "Trimestral",
    proximaFecha: "2026-04-15",
    estado: "atrasado",
    progreso: 45,
    formatos: 9,
    formatosCompletados: 4,
    descripcion: "Informe de ejecución presupuestal de ingresos y gastos.",
  },
];

// ---------------------------------------------------------------------------
// Calendario de reportes — próximos 6 meses (Mar 2026 – Ago 2026)
// ---------------------------------------------------------------------------

export const calendarioReportes: CalendarioReporte[] = [
  {
    mes: "Mar 2026",
    reportes: [
      { nombre: "Informe Gestión", dia: 1, estado: "completado" },
      { nombre: "SECOP I/II", dia: 10, estado: "completado" },
      { nombre: "SIHO", dia: 15, estado: "pendiente" },
      { nombre: "SIMAT", dia: 20, estado: "completado" },
      { nombre: "SIRECI", dia: 28, estado: "completado" },
      { nombre: "FUT / CHIP", dia: 31, estado: "pendiente" },
    ],
  },
  {
    mes: "Abr 2026",
    reportes: [
      { nombre: "SPI — DNP", dia: 10, estado: "pendiente" },
      { nombre: "SECOP I/II", dia: 10, estado: "pendiente" },
      { nombre: "SIA Contraloría", dia: 15, estado: "pendiente" },
      { nombre: "CGR Presupuestal", dia: 15, estado: "pendiente" },
      { nombre: "SIHO", dia: 15, estado: "pendiente" },
    ],
  },
  {
    mes: "May 2026",
    reportes: [
      { nombre: "SECOP I/II", dia: 10, estado: "pendiente" },
      { nombre: "SIHO", dia: 15, estado: "pendiente" },
    ],
  },
  {
    mes: "Jun 2026",
    reportes: [
      { nombre: "SECOP I/II", dia: 10, estado: "pendiente" },
      { nombre: "SIHO", dia: 15, estado: "pendiente" },
      { nombre: "SUIT — DAFP", dia: 30, estado: "pendiente" },
      { nombre: "FUT / CHIP", dia: 30, estado: "pendiente" },
      { nombre: "CHIP Categorías", dia: 30, estado: "pendiente" },
      { nombre: "SPI — DNP", dia: 30, estado: "pendiente" },
      { nombre: "CGR Presupuestal", dia: 30, estado: "pendiente" },
    ],
  },
  {
    mes: "Jul 2026",
    reportes: [
      { nombre: "SECOP I/II", dia: 10, estado: "pendiente" },
      { nombre: "SIHO", dia: 15, estado: "pendiente" },
    ],
  },
  {
    mes: "Ago 2026",
    reportes: [
      { nombre: "SECOP I/II", dia: 10, estado: "pendiente" },
      { nombre: "SIHO", dia: 15, estado: "pendiente" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Resumen de cumplimiento (para KPIs)
// ---------------------------------------------------------------------------

export const resumenCumplimiento = {
  totalReportes: reportesObligatorios.length,
  completados: reportesObligatorios.filter((r) => r.estado === "completado").length,
  enProceso: reportesObligatorios.filter((r) => r.estado === "en_proceso").length,
  pendientes: reportesObligatorios.filter((r) => r.estado === "pendiente").length,
  atrasados: reportesObligatorios.filter((r) => r.estado === "atrasado").length,
  tasaCumplimiento: Math.round(
    (reportesObligatorios.filter((r) => r.estado === "completado").length /
      reportesObligatorios.length) *
      100
  ),
  totalFormatos: reportesObligatorios.reduce((s, r) => s + r.formatos, 0),
  formatosCompletados: reportesObligatorios.reduce((s, r) => s + r.formatosCompletados, 0),
};
