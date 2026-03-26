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
}

export function parseCGNSaldos(buffer: ArrayBuffer): CGNSaldosData {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames.find(n =>
    n.toUpperCase().includes('SALDO') || n.toUpperCase().includes('CGN')
  ) || workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  // Find header row
  let headerIdx = 0;
  for (let i = 0; i < Math.min(jsonData.length, 5); i++) {
    const row = jsonData[i];
    if (row && Array.isArray(row) && row.some(cell => String(cell).toUpperCase().includes('CODIGO'))) {
      headerIdx = i;
      break;
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

  return { rows, activos, pasivos, patrimonio, ingresos, gastos, trimestre };
}

function toNum(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}
