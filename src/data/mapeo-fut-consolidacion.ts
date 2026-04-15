/**
 * Maps FUT Cierre Fiscal codes to consolidation group numbers.
 *
 * Used by Cierre vs CUIPO validation: for each FUT row, SUMIF
 * the Equilibrio data where consolidacion matches this mapping.
 *
 * FUT rows with consolidacion=null are parent/summary rows
 * that don't directly map to equilibrio data.
 */

export interface MapeoFUT {
  codigoFUT: string;
  consolidacion: number | null;
  nombre: string;
  nivel: number;
}

export const MAPEO_FUT: MapeoFUT[] = [
  { codigoFUT: "C", consolidacion: null, nombre: "TOTAL", nivel: 0 },
  { codigoFUT: "C.1", consolidacion: null, nombre: "RECURSOS CORRIENTES DE LIBRE DESTINACION", nivel: 1 },
  { codigoFUT: "C.1.1", consolidacion: 55, nombre: "SGP-PROPOSITO GENERAL-LIBRE DESTINACION MUNICIPIOS CATEGORIAS 4, 5 Y 6", nivel: 2 },
  { codigoFUT: "C.1.2", consolidacion: 1, nombre: "INGRESOS TRIBUTARIOS Y NO TRIBUTARIOS DE LIBRE DESTINACION", nivel: 2 },
  { codigoFUT: "C.2", consolidacion: null, nombre: "RECURSOS CON DESTINACION ESPECIFICA", nivel: 1 },
  { codigoFUT: "C.2.1", consolidacion: 29, nombre: "RECURSOS TRIBUTARIOS Y NO TRIBUTARIOS CON DEST. ESPECIFICA POR ACTO ADMON", nivel: 2 },
  { codigoFUT: "C.2.2", consolidacion: null, nombre: "RECURSOS TRIBUTARIOS Y NO TRIBUTARIOS CON DEST. ESPECIFICA CONSTITUCIONAL LEGAL", nivel: 2 },
  { codigoFUT: "C.2.2.1", consolidacion: 3, nombre: "SOBRETASA AMBIENTAL / PARTICIPACION AMBIENTAL", nivel: 3 },
  { codigoFUT: "C.2.2.2", consolidacion: 11, nombre: "ESTAMPILLAS", nivel: 3 },
  { codigoFUT: "C.2.2.3", consolidacion: 13, nombre: "CONTRIBUCIONES", nivel: 3 },
  { codigoFUT: "C.2.2.4", consolidacion: null, nombre: "TASAS Y DERECHOS ADMINISTRATIVOS CON DEST. ESPECIFICA LEGAL", nivel: 3 },
  { codigoFUT: "C.2.2.5", consolidacion: null, nombre: "MULTAS, SANCIONES E INTERESES DE MORA CON DEST. ESPECIFICA LEGAL", nivel: 3 },
  { codigoFUT: "C.2.2.6", consolidacion: 19, nombre: "VENTA DE BIENES Y SERVICIOS CON DEST. ESPECIFICA LEGAL", nivel: 3 },
  { codigoFUT: "C.2.3", consolidacion: null, nombre: "TRANSFERENCIAS CORRIENTES DIFERENTES AL SGP CON DEST. ESPECIFICA", nivel: 2 },
  { codigoFUT: "C.2.3.1", consolidacion: 21, nombre: "PARTICIPACIONES DISTINTAS DEL SGP", nivel: 3 },
  { codigoFUT: "C.2.3.2", consolidacion: null, nombre: "APORTES NACION - ALIMENTACION ESCOLAR", nivel: 3 },
  { codigoFUT: "C.2.3.3", consolidacion: 23, nombre: "DEMAS TRANSFERENCIAS CORRIENTES DE OTRAS ENTIDADES DEL GOBIERNO GENERAL", nivel: 3 },
  { codigoFUT: "C.2.4", consolidacion: null, nombre: "SISTEMA GENERAL DE PARTICIPACIONES - CUENTAS MAESTRAS", nivel: 2 },
  { codigoFUT: "C.2.4.1", consolidacion: null, nombre: "SGP-EDUCACION-PRESTACION DE SERVICIOS", nivel: 3 },
  { codigoFUT: "C.2.4.2", consolidacion: null, nombre: "SGP-EDUCACION-CANCELACION DE PRESTACIONES SOCIALES DEL MAGISTERIO", nivel: 3 },
  { codigoFUT: "C.2.4.3", consolidacion: 30, nombre: "SGP-EDUCACION-CALIDAD POR MATRICULA OFICIAL", nivel: 3 },
  { codigoFUT: "C.2.4.4", consolidacion: 36, nombre: "SGP-PROPOSITO GENERAL-DEPORTE Y RECREACION", nivel: 3 },
  { codigoFUT: "C.2.4.5", consolidacion: 37, nombre: "SGP-PROPOSITO GENERAL-CULTURA", nivel: 3 },
  { codigoFUT: "C.2.4.6", consolidacion: 38, nombre: "SGP-PROPOSITO GENERAL-LIBRE INVERSION", nivel: 3 },
  { codigoFUT: "C.2.4.7", consolidacion: 40, nombre: "SGP-ASIGNACION ESPECIAL-PROGRAMAS DE ALIMENTACION ESCOLAR", nivel: 3 },
  { codigoFUT: "C.2.4.8", consolidacion: 41, nombre: "SGP-ASIGNACION ESPECIAL-MUNICIPIOS RIBERA RIO MAGDALENA", nivel: 3 },
  { codigoFUT: "C.2.4.9", consolidacion: 42, nombre: "SGP-ASIGNACION-ATENCION INTEGRAL PRIMERA INFANCIA", nivel: 3 },
  { codigoFUT: "C.2.4.10", consolidacion: 43, nombre: "SGP-AGUA POTABLE Y SANEAMIENTO BASICO", nivel: 3 },
  { codigoFUT: "C.2.5", consolidacion: null, nombre: "RECURSOS DE CAPITAL", nivel: 2 },
  { codigoFUT: "C.2.5.1", consolidacion: null, nombre: "RECURSOS DE CREDITO EXTERNO", nivel: 3 },
  { codigoFUT: "C.2.5.2", consolidacion: 47, nombre: "RECURSOS DE CREDITO INTERNO", nivel: 3 },
  { codigoFUT: "C.2.5.3", consolidacion: 48, nombre: "DONACIONES", nivel: 3 },
  { codigoFUT: "C.2.5.4", consolidacion: 52, nombre: "RETIROS FONPET", nivel: 3 },
  { codigoFUT: "C.2.5.5", consolidacion: null, nombre: "TRANSFERENCIAS DE CAPITAL", nivel: 3 },
  { codigoFUT: "C.2.5.6", consolidacion: null, nombre: "DEMAS RECURSOS DE CAPITAL", nivel: 3 },
  { codigoFUT: "C.3", consolidacion: null, nombre: "FONDOS ESPECIALES", nivel: 1 },
  { codigoFUT: "C.3.1", consolidacion: null, nombre: "FONDO LOCAL DE SALUD", nivel: 2 },
  { codigoFUT: "C.3.1.1", consolidacion: 32, nombre: "CUENTA MAESTRA REGIMEN SUBSIDIADO", nivel: 3 },
  { codigoFUT: "C.3.1.2", consolidacion: 33, nombre: "CUENTA MAESTRA SALUD PUBLICA COLECTIVA", nivel: 3 },
  { codigoFUT: "C.3.1.3", consolidacion: null, nombre: "CUENTA MAESTRA PRESTACION DEL SERVICIO OFERTA", nivel: 3 },
  { codigoFUT: "C.3.1.4", consolidacion: null, nombre: "CUENTA MAESTRA OTROS GASTOS EN SALUD INVERSION", nivel: 3 },
  { codigoFUT: "C.3.1.5", consolidacion: 20, nombre: "CUENTA OTROS GASTOS SALUD FUNCIONAMIENTO", nivel: 3 },
  { codigoFUT: "C.3.3", consolidacion: 12, nombre: "FONDO DE SEGURIDAD Y CONVIVENCIA CIUDADANA", nivel: 2 },
  { codigoFUT: "C.3.4", consolidacion: 2, nombre: "FONDO DE GESTION DEL RIESGO", nivel: 2 },
  { codigoFUT: "C.4", consolidacion: null, nombre: "SALDOS EN PATRIMONIOS AUTONOMOS Y/O ENCARGOS FIDUCIARIOS PASIVO PENSIONAL", nivel: 1 },
];

/** Build a lookup: consolidation code → FUT code */
const futByConsolidacion = new Map<number, string>();
for (const m of MAPEO_FUT) {
  if (m.consolidacion !== null) {
    futByConsolidacion.set(m.consolidacion, m.codigoFUT);
  }
}

export function getFUTCode(consolidacion: number): string | null {
  return futByConsolidacion.get(consolidacion) ?? null;
}
