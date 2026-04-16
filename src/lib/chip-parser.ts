import * as XLSX from 'xlsx';

/**
 * Parse FUT Cierre Fiscal Excel file
 *
 * The FUT Cierre Fiscal has this structure:
 * Row 1 or 2: Headers - CODIGO | NOMBRE | SALDO EN CAJA Y BANCOS(Pesos) | SALDO EN ENCARGOS FIDUCIARIOS | ...
 * Row 3+: Data rows with codes like C, C.1, C.1.1, C.2, etc.
 *
 * Key columns:
 * - CODIGO (A): C, C.1, C.1.1, C.1.2, C.2, C.2.1, etc.
 * - NOMBRE (B): Description
 * - SALDO EN CAJA Y BANCOS (C): Cash balance
 * - TOTAL DISPONIBILIDADES (G): Total available
 * - CUENTAS POR PAGAR DE LA VIGENCIA (J): Accounts payable current
 * - CXP DE VIGENCIAS ANTERIORES (K): Accounts payable previous
 * - RESERVAS PRESUPUESTALES (M or N): Budget reserves
 * - SALDO EN LIBROS (O or last column): Book balance
 */

export interface FUTCierreRow {
  codigo: string;
  nombre: string;
  saldoCaja: number;
  saldoEncargos: number;
  saldoPatrimonios: number;
  inversionesTemporales: number;
  totalDisponibilidades: number;
  recursosTerceros: number;
  chequesNoCobrados: number;
  cuentasPorPagarVigencia: number;
  cxpVigenciasAnteriores: number;
  otrasExigibilidades: number;
  reservasPresupuestales: number;
  saldoEnLibros: number;
}

export interface FUTCierreData {
  rows: FUTCierreRow[];
  total: FUTCierreRow | null;
  vigencia: string; // "2024" or "2025"
}

export function parseFUTCierre(buffer: ArrayBuffer): FUTCierreData {
  const workbook = XLSX.read(buffer, { type: 'array' });
  // Try to find the right sheet
  const sheetName = workbook.SheetNames.find(n =>
    n.toUpperCase().includes('CIERRE') || n.toUpperCase().includes('FUT')
  ) || workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  // Find the header row (contains "CODIGO" or "NOMBRE")
  let headerIdx = 0;
  for (let i = 0; i < Math.min(jsonData.length, 5); i++) {
    const row = jsonData[i];
    if (row && Array.isArray(row) && row.some(cell => String(cell).toUpperCase().includes('CODIGO'))) {
      headerIdx = i;
      break;
    }
  }

  const rows: FUTCierreRow[] = [];
  let total: FUTCierreRow | null = null;

  for (let i = headerIdx + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !row[0]) continue;

    const codigo = String(row[0]).trim();
    if (!codigo || codigo === 'None') continue;

    const parsed: FUTCierreRow = {
      codigo,
      nombre: String(row[1] || '').trim(),
      saldoCaja: toNum(row[2]),
      saldoEncargos: toNum(row[3]),
      saldoPatrimonios: toNum(row[4]),
      inversionesTemporales: toNum(row[5]),
      totalDisponibilidades: toNum(row[6]),
      recursosTerceros: toNum(row[7]),
      chequesNoCobrados: toNum(row[8]),
      cuentasPorPagarVigencia: toNum(row[9]),
      cxpVigenciasAnteriores: toNum(row[10]),
      otrasExigibilidades: toNum(row[11]),
      reservasPresupuestales: toNum(row[12]),
      saldoEnLibros: toNum(row[13]),
    };

    if (codigo === 'C' || codigo === 'VAL') {
      total = parsed;
    }

    rows.push(parsed);
  }

  // Try to detect vigencia from sheet name
  const yearMatch = sheetName.match(/(\d{4})/);
  const vigencia = yearMatch ? yearMatch[1] : 'unknown';

  return { rows, total, vigencia };
}

/**
 * Parse CGN Saldos Excel file
 *
 * Structure:
 * Row 1: Headers - CODIGO | NOMBRE | SALDO INICIAL(Miles) | MOVIMIENTO DEBITO(Miles) | MOVIMIENTO CREDITO(Miles) | SALDO FINAL(Miles) | SALDO FINAL CORRIENTE | SALDO FINAL NO CORRIENTE
 * Data starts with account codes: 1 (Activos), 2 (Pasivos), 3 (Patrimonio), 4 (Ingresos), 5 (Gastos)
 *
 * IMPORTANT: Values are in THOUSANDS (Miles)
 */

export interface CGNSaldoRow {
  codigo: string;
  nombre: string;
  saldoInicial: number;   // in thousands
  movDebito: number;
  movCredito: number;
  saldoFinal: number;
  saldoFinalCorriente: number;
  saldoFinalNoCorriente: number;
}

export interface CGNSaldosData {
  rows: CGNSaldoRow[];
  activos: number;
  pasivos: number;
  patrimonio: number;
  ingresos: number;
  gastos: number;
  trimestre: string; // "I", "II", "III", "IV"
  unidad: "miles" | "pesos"; // detected from header: "(Miles)" vs "(Pesos)"
}

export function parseCGNSaldos(buffer: ArrayBuffer): CGNSaldosData {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames.find(n =>
    n.toUpperCase().includes('SALDO') || n.toUpperCase().includes('CGN')
  ) || workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  // Find header row and detect unit (Miles vs Pesos)
  let headerIdx = 0;
  let unidad: "miles" | "pesos" = "miles"; // default assumption
  for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
    const row = jsonData[i];
    if (row && Array.isArray(row)) {
      const headerText = row.map(c => String(c).toUpperCase()).join(' ');
      if (headerText.includes('CODIGO')) {
        headerIdx = i;
        // Detect: "(Pesos)" in header means values are in pesos, not miles
        if (headerText.includes('(PESOS)')) {
          unidad = "pesos";
        }
        break;
      }
    }
  }

  const rows: CGNSaldoRow[] = [];
  let activos = 0, pasivos = 0, patrimonio = 0, ingresos = 0, gastos = 0;

  for (let i = headerIdx + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !row[0]) continue;

    const codigo = String(row[0]).trim();
    if (!codigo || codigo === 'None') continue;

    const parsed: CGNSaldoRow = {
      codigo,
      nombre: String(row[1] || '').trim(),
      saldoInicial: toNum(row[2]),
      movDebito: toNum(row[3]),
      movCredito: toNum(row[4]),
      saldoFinal: toNum(row[5]),
      saldoFinalCorriente: toNum(row[6]),
      saldoFinalNoCorriente: toNum(row[7]),
    };

    // Top-level account totals
    if (codigo === '1') activos = parsed.saldoFinal;
    if (codigo === '2') pasivos = parsed.saldoFinal;
    if (codigo === '3') patrimonio = parsed.saldoFinal;
    if (codigo === '4') ingresos = parsed.saldoFinal;
    if (codigo === '5') gastos = parsed.saldoFinal;

    rows.push(parsed);
  }

  // Detect trimester from sheet name
  const triMap: Record<string, string> = { 'I': 'I', 'II': 'II', 'III': 'III', 'IV': 'IV', '1': 'I', '2': 'II', '3': 'III', '4': 'IV' };
  const trimMatch = sheetName.match(/(\d+|I{1,3}V?)\s*$/i);
  const trimestre = trimMatch ? (triMap[trimMatch[1].toUpperCase()] || 'IV') : 'IV';

  return { rows, activos, pasivos, patrimonio, ingresos, gastos, trimestre, unidad };
}

function toNum(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

// ---------------------------------------------------------------------------
// Mapa de Inversiones (DNP) parser
// ---------------------------------------------------------------------------

export interface MapaInversionesRow {
  bepin: string;
  productoMGA: string;
  nombreProducto: string;
  sector: string;
  valorEjecutado: number;
}

export interface MapaInversionesData {
  rows: MapaInversionesRow[];
  year: string;
}

/**
 * Parse Mapa de Inversiones Excel file (DNP template).
 *
 * Flexible column detection — searches headers by keyword:
 *   BPIN / BEPIN  |  PRODUCTO  |  SECTOR  |  EJECUTADO / VALOR
 */
export function parseMapaInversiones(buffer: ArrayBuffer): MapaInversionesData {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames.find(n =>
    n.toUpperCase().includes('MAPA') ||
    n.toUpperCase().includes('INVERSION')
  ) || workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  // Find header row by scanning first 10 rows for BPIN/BEPIN keyword
  let headerIdx = -1;
  let colBepin = -1;
  let colProducto = -1;
  let colNombre = -1;
  let colSector = -1;
  let colValor = -1;

  for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;

    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || '').toUpperCase().trim();

      if (cell.includes('BPIN') || cell.includes('BEPIN')) {
        colBepin = j;
        headerIdx = i;
      }
      if ((cell.includes('COD') && cell.includes('PRODUCTO')) || cell === 'PRODUCTO MGA' || cell === 'COD_PRODUCTO_MGA') {
        colProducto = j;
      }
      if ((cell.includes('NOMBRE') && cell.includes('PRODUCTO')) || cell === 'NOM_PRODUCTO_MGA' || cell === 'NOMBRE PRODUCTO') {
        colNombre = j;
      }
      if (cell.includes('SECTOR')) {
        colSector = j;
      }
      if (cell.includes('EJECUTADO') || cell.includes('VALOR EJECUTADO') || (cell.includes('VALOR') && cell.includes('EJEC'))) {
        colValor = j;
      }
    }
    if (headerIdx >= 0) break;
  }

  // Fallback: if no BEPIN column found, try product-based headers
  if (headerIdx < 0) {
    for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
      const row = jsonData[i];
      if (!row || !Array.isArray(row)) continue;
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j] || '').toUpperCase().trim();
        if (cell.includes('PRODUCTO')) {
          headerIdx = i;
          if (colProducto < 0) colProducto = j;
          break;
        }
      }
      if (headerIdx >= 0) break;
    }
  }

  if (headerIdx < 0) {
    // Could not find headers — return empty
    return { rows: [], year: 'unknown' };
  }

  // If producto column found but nombre not, try to find a "NOMBRE" column near it
  if (colNombre < 0 && headerIdx >= 0) {
    const headerRow = jsonData[headerIdx] as unknown[];
    for (let j = 0; j < headerRow.length; j++) {
      const cell = String(headerRow[j] || '').toUpperCase().trim();
      if (cell.includes('NOMBRE') && j !== colBepin && j !== colSector && j !== colValor) {
        colNombre = j;
        break;
      }
    }
  }

  // If valor column not found, try any column with "COMPROMISO" or "OBLIGACION"
  if (colValor < 0 && headerIdx >= 0) {
    const headerRow = jsonData[headerIdx] as unknown[];
    for (let j = 0; j < headerRow.length; j++) {
      const cell = String(headerRow[j] || '').toUpperCase().trim();
      if (cell.includes('COMPROMISO') || cell.includes('OBLIGACION')) {
        colValor = j;
        break;
      }
    }
  }

  const rows: MapaInversionesRow[] = [];

  for (let i = headerIdx + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;

    const bepin = colBepin >= 0 ? String(row[colBepin] || '').trim() : '';
    const productoMGA = colProducto >= 0 ? String(row[colProducto] || '').trim() : '';
    const nombreProducto = colNombre >= 0 ? String(row[colNombre] || '').trim() : '';
    const sector = colSector >= 0 ? String(row[colSector] || '').trim() : '';
    const valorEjecutado = colValor >= 0 ? toNum(row[colValor]) : 0;

    // Skip empty rows
    if (!bepin && !productoMGA && !nombreProducto) continue;

    rows.push({ bepin, productoMGA, nombreProducto, sector, valorEjecutado });
  }

  // Detect year from sheet name or file content
  const yearMatch = sheetName.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : 'unknown';

  return { rows, year };
}

// ---------------------------------------------------------------------------
// CUIPO file parsers (CHIP Excel exports)
// ---------------------------------------------------------------------------

export interface CuipoIngresosRow {
  cuenta: string;
  nombre: string;
  fuente: string;
  codigoFuente: string;
  recaudoVACSS: number;
  recaudoVACCS: number;
  recaudoVANSS: number;
  recaudoVANCS: number;
  totalRecaudo: number;
  isLeaf: boolean;
}

export interface CuipoGastosRow {
  vigencia: string;
  seccion: string;
  cuenta: string;
  nombre: string;
  fuente: string;
  bpin: string;
  compromisos: number;
  obligaciones: number;
  pagos: number;
  isLeaf: boolean;
}

export interface CuipoProgIngresosRow {
  cuenta: string;
  nombre: string;
  presupuestoInicial: number;
  presupuestoDefinitivo: number;
}

export type CuipoFileType = 'ejec_ing' | 'ejec_gas' | 'prog_ing' | 'prog_gas' | 'unknown';

export interface CuipoData {
  ejecIngresos: CuipoIngresosRow[];
  ejecGastos: CuipoGastosRow[];
  progIngresos: CuipoProgIngresosRow[];
  progGastos: CuipoProgIngresosRow[];
  periodo: string;
  entidad: string;
}

/**
 * Parse a CUIPO number value that may be formatted as:
 * - Numeric cell: 1234567.89
 * - Text cell: "1234567,00 " (comma decimal, trailing space)
 * - Text cell: "NO APLICA" → 0
 */
function toCuipoNum(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const s = String(val).trim();
  if (!s || s.toUpperCase() === 'NO APLICA') return 0;
  // Handle "1.234.567,00" format (dots as thousands, comma decimal)
  const cleaned = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/**
 * Detect the type of a CUIPO file by scanning header row keywords.
 */
export function detectCuipoFileType(buffer: ArrayBuffer): CuipoFileType {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;
    const text = row.map(c => String(c || '').toUpperCase()).join(' ');

    if (text.includes('TOTAL RECAUDO') || text.includes('TOTAL INGRESOS') ||
        (text.includes('RECAUDO') && text.includes('VIGEN'))) {
      return 'ejec_ing';
    }
    if (text.includes('COMPROMISOS') && text.includes('OBLIGACIONES')) {
      return 'ejec_gas';
    }
    if (text.includes('PRESUPUESTO INICIAL') && text.includes('PRESUPUESTO DEFINITIVO')) {
      // Distinguish prog_ing vs prog_gas by looking for gastos-specific columns
      if (text.includes('VIGENCIA') || text.includes('SECCION') || text.includes('BPIN')) {
        return 'prog_gas';
      }
      return 'prog_ing';
    }
  }
  return 'unknown';
}

/**
 * Parse CUIPO Ejecución de Ingresos file.
 * Returns ONLY leaf rows (fuente is filled).
 */
export function parseCuipoEjecIngresos(buffer: ArrayBuffer): CuipoIngresosRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  // Find header row by scanning for "CODIGO"
  let headerIdx = -1;
  let colCuenta = -1;
  let colNombre = -1;
  let colFuente = -1;
  let colCodFuente = -1;
  let colVACSS = -1;
  let colVACCS = -1;
  let colVANSS = -1;
  let colVANCS = -1;
  let colTotal = -1;

  for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;

    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || '').toUpperCase().trim();

      if (cell === 'CODIGO' || cell === 'CÓDIGO') {
        colCuenta = j;
        headerIdx = i;
      }
      if (cell === 'NOMBRE' || cell === 'CONCEPTO') colNombre = j;
      if (cell.includes('FUENTES DE FINANC') || cell === 'FUENTE' || cell === 'FUENTES') colFuente = j;
      if (cell.includes('CODIGO DE LA FUENTE') || cell.includes('COD_FUENTE') || cell.includes('CÓDIGO FUENTE')) colCodFuente = j;
      if (cell.includes('RECAUDO') && cell.includes('ACTUAL') && cell.includes('SIN')) colVACSS = j;
      if (cell.includes('RECAUDO') && cell.includes('ACTUAL') && cell.includes('CON')) colVACCS = j;
      if (cell.includes('RECAUDO') && cell.includes('ANTERIOR') && cell.includes('SIN')) colVANSS = j;
      if (cell.includes('RECAUDO') && cell.includes('ANTERIOR') && cell.includes('CON')) colVANCS = j;
      if (cell.includes('TOTAL RECAUDO') || cell.includes('TOTAL INGRESOS')) colTotal = j;
    }
    if (headerIdx >= 0) break;
  }

  if (headerIdx < 0) return [];

  const rows: CuipoIngresosRow[] = [];

  for (let i = headerIdx + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;

    const cuenta = colCuenta >= 0 ? String(row[colCuenta] || '').trim() : '';
    if (!cuenta) continue;

    const fuente = colFuente >= 0 ? String(row[colFuente] || '').trim() : '';
    const isLeaf = fuente.length > 0;

    if (!isLeaf) continue; // Only return leaf rows

    const parsed: CuipoIngresosRow = {
      cuenta,
      nombre: colNombre >= 0 ? String(row[colNombre] || '').trim() : '',
      fuente,
      codigoFuente: colCodFuente >= 0 ? String(row[colCodFuente] || '').trim() : '',
      recaudoVACSS: colVACSS >= 0 ? toCuipoNum(row[colVACSS]) : 0,
      recaudoVACCS: colVACCS >= 0 ? toCuipoNum(row[colVACCS]) : 0,
      recaudoVANSS: colVANSS >= 0 ? toCuipoNum(row[colVANSS]) : 0,
      recaudoVANCS: colVANCS >= 0 ? toCuipoNum(row[colVANCS]) : 0,
      totalRecaudo: colTotal >= 0 ? toCuipoNum(row[colTotal]) : 0,
      isLeaf,
    };

    // If no total column, compute from sub-columns
    if (colTotal < 0) {
      parsed.totalRecaudo = parsed.recaudoVACSS + parsed.recaudoVACCS + parsed.recaudoVANSS + parsed.recaudoVANCS;
    }

    rows.push(parsed);
  }

  return rows;
}

/**
 * Parse CUIPO Ejecución de Gastos file.
 * Returns ONLY leaf rows (fuente is filled).
 * Vigencia and Seccion are fill-down from last non-empty value.
 */
export function parseCuipoEjecGastos(buffer: ArrayBuffer): CuipoGastosRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  // Find header row
  let headerIdx = -1;
  let colVigencia = -1;
  let colSeccion = -1;
  let colCuenta = -1;
  let colNombre = -1;
  let colFuente = -1;
  let colBpin = -1;
  let colCompromisos = -1;
  let colObligaciones = -1;
  let colPagos = -1;

  for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;

    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || '').toUpperCase().trim();

      if ((cell === 'CODIGO' || cell === 'CÓDIGO') && colCuenta < 0) {
        colCuenta = j;
        headerIdx = i;
      }
      if (cell.includes('VIGENCIA') && cell.includes('GASTO')) colVigencia = j;
      if (cell.includes('SECCION') || cell.includes('SECCIÓN')) colSeccion = j;
      if (cell === 'NOMBRE' || cell === 'CONCEPTO') colNombre = j;
      if (cell.includes('FUENTES DE FINANC') || cell === 'FUENTE' || cell === 'FUENTES') colFuente = j;
      if (cell === 'BPIN' || cell.includes('CODIGO BPIN')) colBpin = j;
      if (cell.includes('COMPROMISOS')) colCompromisos = j;
      if (cell.includes('OBLIGACIONES')) colObligaciones = j;
      if (cell.includes('PAGOS')) colPagos = j;
    }
    if (headerIdx >= 0) break;
  }

  if (headerIdx < 0) return [];

  const rows: CuipoGastosRow[] = [];
  let lastVigencia = '';
  let lastSeccion = '';

  for (let i = headerIdx + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;

    const cuenta = colCuenta >= 0 ? String(row[colCuenta] || '').trim() : '';
    if (!cuenta) continue;

    // Fill-down vigencia and seccion
    const rawVigencia = colVigencia >= 0 ? String(row[colVigencia] || '').trim() : '';
    const rawSeccion = colSeccion >= 0 ? String(row[colSeccion] || '').trim() : '';
    if (rawVigencia) lastVigencia = rawVigencia;
    if (rawSeccion) lastSeccion = rawSeccion;

    const fuente = colFuente >= 0 ? String(row[colFuente] || '').trim() : '';
    const isLeaf = fuente.length > 0;

    if (!isLeaf) continue; // Only return leaf rows

    rows.push({
      vigencia: lastVigencia,
      seccion: lastSeccion,
      cuenta,
      nombre: colNombre >= 0 ? String(row[colNombre] || '').trim() : '',
      fuente,
      bpin: colBpin >= 0 ? String(row[colBpin] || '').trim() : '',
      compromisos: colCompromisos >= 0 ? toCuipoNum(row[colCompromisos]) : 0,
      obligaciones: colObligaciones >= 0 ? toCuipoNum(row[colObligaciones]) : 0,
      pagos: colPagos >= 0 ? toCuipoNum(row[colPagos]) : 0,
      isLeaf,
    });
  }

  return rows;
}

/**
 * Parse CUIPO Programación de Ingresos file.
 * Returns ALL rows (both parent and leaf) since we need totals.
 */
export function parseCuipoProgIngresos(buffer: ArrayBuffer): CuipoProgIngresosRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  let headerIdx = -1;
  let colCuenta = -1;
  let colNombre = -1;
  let colInicial = -1;
  let colDefinitivo = -1;

  for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;

    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || '').toUpperCase().trim();

      if (cell === 'CODIGO' || cell === 'CÓDIGO') {
        colCuenta = j;
        headerIdx = i;
      }
      if (cell === 'NOMBRE' || cell === 'CONCEPTO') colNombre = j;
      if (cell.includes('PRESUPUESTO INICIAL') || cell.includes('APROPIACION INICIAL') || cell.includes('PPTO INICIAL')) colInicial = j;
      if (cell.includes('PRESUPUESTO DEFINITIVO') || cell.includes('APROPIACION DEFINITIVA') || cell.includes('PPTO DEFINITIVO')) colDefinitivo = j;
    }
    if (headerIdx >= 0) break;
  }

  if (headerIdx < 0) return [];

  const rows: CuipoProgIngresosRow[] = [];

  for (let i = headerIdx + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;

    const cuenta = colCuenta >= 0 ? String(row[colCuenta] || '').trim() : '';
    if (!cuenta) continue;

    rows.push({
      cuenta,
      nombre: colNombre >= 0 ? String(row[colNombre] || '').trim() : '',
      presupuestoInicial: colInicial >= 0 ? toCuipoNum(row[colInicial]) : 0,
      presupuestoDefinitivo: colDefinitivo >= 0 ? toCuipoNum(row[colDefinitivo]) : 0,
    });
  }

  return rows;
}

/**
 * Parse multiple CUIPO files, auto-detecting types and combining results.
 */
export function parseCuipoFiles(buffers: { name: string; buffer: ArrayBuffer }[]): CuipoData {
  const result: CuipoData = {
    ejecIngresos: [],
    ejecGastos: [],
    progIngresos: [],
    progGastos: [],
    periodo: '',
    entidad: '',
  };

  for (const { buffer } of buffers) {
    const fileType = detectCuipoFileType(buffer);

    switch (fileType) {
      case 'ejec_ing':
        result.ejecIngresos = parseCuipoEjecIngresos(buffer);
        break;
      case 'ejec_gas':
        // Multiple gastos files are combined
        result.ejecGastos.push(...parseCuipoEjecGastos(buffer));
        break;
      case 'prog_ing':
        result.progIngresos = parseCuipoProgIngresos(buffer);
        break;
      case 'prog_gas':
        result.progGastos = parseCuipoProgIngresos(buffer); // Same structure
        break;
    }
  }

  // Try to detect periodo from file content (scan first rows for date/period info)
  if (result.ejecIngresos.length > 0 || result.ejecGastos.length > 0) {
    result.periodo = 'T4 (Cierre Anual)';
  }

  return result;
}
