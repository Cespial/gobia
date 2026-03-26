/**
 * Cognos CGN Scraper — extracts CGN Saldos from jupiter.contaduria.gov.co
 *
 * The Cognos data warehouse uses public credentials (cgncognos2/cgncognos2).
 * The portal is JavaScript-heavy and requires a real browser.
 *
 * Report path:
 * bodegaChip_RT > reportesBodega_RT > Categoria_Contable_Publica >
 * Serie_2007_Posterior > Saldos_Reportados > Reportes > Saldos_Contables_Por_Entidad
 */

import { chromium, type Browser, type Page } from 'playwright-core';

export interface CGNSaldoScraped {
  codigo: string;
  nombre: string;
  saldoInicial: number;
  movDebito: number;
  movCredito: number;
  saldoFinal: number;
}

export interface CGNSaldosResult {
  entidad: string;
  periodo: string;
  activos: number;
  pasivos: number;
  patrimonio: number;
  ingresos: number;
  gastos: number;
  rows: CGNSaldoScraped[];
  scrapedAt: string;
}

const COGNOS_URL =
  'http://jupiter.contaduria.gov.co/ibmcognos/cgi-bin/cognos.cgi';
const COGNOS_USER = 'cgncognos2';
const COGNOS_PASS = 'cgncognos2';

export async function scrapeCGNSaldos(
  chipCode: string,
  year: number = 2024,
  trimestre: number = 4,
  options?: { headless?: boolean; executablePath?: string }
): Promise<CGNSaldosResult> {
  const browser = await chromium.launch({
    headless: options?.headless ?? true,
    executablePath: options?.executablePath,
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    // Step 1: Login to Cognos
    console.log('  [cognos] Logging in to Cognos portal...');
    const loginUrl = `${COGNOS_URL}?b_action=xts.run&m=portal/cc.xts&CAMUsername=${COGNOS_USER}&CAMPassword=${COGNOS_PASS}`;
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    console.log('  [cognos] Login page loaded.');

    // Step 2: Navigate folder structure
    const folderPath = [
      'bodegaChip_RT',
      'reportesBodega_RT',
      'Categoria_Contable_Publica',
      'Serie_2007_Posterior',
      'Saldos_Reportados',
      'Reportes',
    ];

    for (const folder of folderPath) {
      console.log(`  [cognos] Navigating to folder: ${folder}...`);
      try {
        const folderLink = await page.$(
          `a:has-text("${folder}"), td:has-text("${folder}") a`
        );
        if (folderLink) {
          await folderLink.click();
          await page.waitForTimeout(2000);
          console.log(`  [cognos] Entered folder: ${folder}`);
        } else {
          console.log(`  [cognos] Folder "${folder}" not found — page may use different layout.`);
        }
      } catch (err) {
        console.log(
          `  [cognos] Error navigating to "${folder}":`,
          err instanceof Error ? err.message : err
        );
      }
    }

    // Step 3: Click on the report
    console.log('  [cognos] Looking for Saldos_Contables_Por_Entidad report...');
    try {
      const reportLink = await page.$(
        'a:has-text("Saldos_Contables_Por_Entidad"), a:has-text("Saldos Contables Por Entidad")'
      );
      if (reportLink) {
        await reportLink.click();
        await page.waitForTimeout(5000);
        console.log('  [cognos] Report link clicked.');
      } else {
        console.log('  [cognos] Report link not found.');
      }
    } catch (err) {
      console.log('  [cognos] Error clicking report:', err instanceof Error ? err.message : err);
    }

    // Step 4: Fill report parameters — entity code
    console.log(`  [cognos] Setting entity code to ${chipCode}...`);
    try {
      const entityInput = await page.$(
        'input[name*="entidad"], input[name*="entity"], input[type="text"]'
      );
      if (entityInput) {
        await entityInput.fill(chipCode);
        console.log('  [cognos] Entity code filled.');
      } else {
        console.log('  [cognos] Entity input not found.');
      }
    } catch (err) {
      console.log('  [cognos] Error filling entity:', err instanceof Error ? err.message : err);
    }

    // Step 5: Year/period
    console.log(`  [cognos] Setting year to ${year}...`);
    try {
      const yearInput = await page.$(
        'select[name*="periodo"], select[name*="year"], input[name*="year"]'
      );
      if (yearInput) {
        const tagName = await yearInput.evaluate((el) => el.tagName);
        if (tagName === 'SELECT') {
          await yearInput.selectOption(String(year));
        } else {
          await yearInput.fill(String(year));
        }
        console.log(`  [cognos] Year set to ${year}.`);
      } else {
        console.log('  [cognos] Year input not found.');
      }
    } catch (err) {
      console.log('  [cognos] Error setting year:', err instanceof Error ? err.message : err);
    }

    // Step 6: Run report
    console.log('  [cognos] Running report...');
    try {
      const runBtn = await page.$(
        'button:has-text("Run"), button:has-text("Ejecutar"), input[value="Run"]'
      );
      if (runBtn) {
        await runBtn.click();
        await page.waitForTimeout(10000);
        console.log('  [cognos] Report submitted, waiting for results...');
      } else {
        console.log('  [cognos] Run button not found.');
      }
    } catch (err) {
      console.log('  [cognos] Error running report:', err instanceof Error ? err.message : err);
    }

    // Step 7: Extract data from the report output table
    console.log('  [cognos] Extracting report data...');
    const rows: CGNSaldoScraped[] = [];
    let activos = 0,
      pasivos = 0,
      patrimonio = 0,
      ingresos = 0,
      gastos = 0;

    try {
      const tableRows = await page.$$('table tr, .clsReportTable tr');
      console.log(`  [cognos] Found ${tableRows.length} table rows.`);

      for (const row of tableRows) {
        const cells = await row.$$('td');
        if (cells.length >= 6) {
          const texts = await Promise.all(cells.map((c) => c.textContent()));
          const clean = texts.map((t) => (t || '').trim());

          const codigo = clean[0];
          const saldoFinal = parseNum(clean[5]);

          rows.push({
            codigo,
            nombre: clean[1],
            saldoInicial: parseNum(clean[2]),
            movDebito: parseNum(clean[3]),
            movCredito: parseNum(clean[4]),
            saldoFinal,
          });

          // Capture top-level totals (PUC class codes)
          if (codigo === '1') activos = saldoFinal;
          if (codigo === '2') pasivos = saldoFinal;
          if (codigo === '3') patrimonio = saldoFinal;
          if (codigo === '4') ingresos = saldoFinal;
          if (codigo === '5') gastos = saldoFinal;
        }
      }
    } catch (err) {
      console.log('  [cognos] Error extracting table:', err instanceof Error ? err.message : err);
    }

    console.log(`  [cognos] Extraction complete: ${rows.length} rows.`);

    return {
      entidad: chipCode,
      periodo: `${year}-T${trimestre}`,
      activos,
      pasivos,
      patrimonio,
      ingresos,
      gastos,
      rows,
      scrapedAt: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}

function parseNum(val: string): number {
  if (!val) return 0;
  // Colombian number format: 1.234.567,89 → remove dots, replace comma with dot
  const cleaned = val
    .replace(/[^\d.,-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(cleaned) || 0;
}
