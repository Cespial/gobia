/**
 * CIFFIT Scraper — extracts FUT Cierre Fiscal from ciffit.dnp.gov.co
 *
 * CIFFIT uses DataTables with server-side rendering. The flow is:
 * 1. Navigate to https://ciffit.dnp.gov.co/ciffit/
 * 2. The page loads an Angular SPA
 * 3. Navigate to the FUT section
 * 4. Select filters: year, department, municipality
 * 5. Wait for DataTable to load
 * 6. Extract data from the table or trigger CSV export
 *
 * Since CIFFIT is JavaScript-heavy, we need a real browser.
 * This scraper is designed to run locally or in CI (GitHub Actions).
 */

import { chromium, type Browser, type Page } from 'playwright-core';

export interface FUTCierreScraped {
  codigo: string;
  nombre: string;
  saldoCaja: number;
  totalDisponibilidades: number;
  recursosTerceros: number;
  cuentasPorPagar: number;
  reservas: number;
  saldoEnLibros: number;
}

export interface FUTCierreResult {
  municipio: string;
  vigencia: string;
  rows: FUTCierreScraped[];
  scrapedAt: string;
}

export async function scrapeFUTCierre(
  daneCode: string,
  year: number = 2024,
  options?: { headless?: boolean; executablePath?: string }
): Promise<FUTCierreResult> {
  const browser = await chromium.launch({
    headless: options?.headless ?? true,
    executablePath: options?.executablePath,
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // Step 1: Navigate to CIFFIT
    console.log('  [ciffit] Navigating to CIFFIT portal...');
    await page.goto('https://ciffit.dnp.gov.co/ciffit/', {
      waitUntil: 'networkidle',
    });

    // Wait for the Angular app to bootstrap
    console.log('  [ciffit] Waiting for Angular SPA to load...');
    await page.waitForTimeout(3000);

    // Step 2: Look for FUT navigation link
    console.log('  [ciffit] Looking for FUT navigation...');
    try {
      const futLink = await page.$(
        'a[href*="FUT"], a:has-text("FUT"), button:has-text("FUT")'
      );
      if (futLink) {
        await futLink.click();
        await page.waitForTimeout(2000);
        console.log('  [ciffit] Clicked FUT link.');
      } else {
        console.log('  [ciffit] No FUT link found — may already be on the right page.');
      }
    } catch (err) {
      console.log('  [ciffit] Could not click FUT link:', err instanceof Error ? err.message : err);
    }

    // Step 3: Look for Cierre Fiscal option
    console.log('  [ciffit] Looking for Cierre Fiscal option...');
    try {
      const cierreLink = await page.$(
        'a:has-text("Cierre"), button:has-text("Cierre"), option:has-text("Cierre")'
      );
      if (cierreLink) {
        await cierreLink.click();
        await page.waitForTimeout(2000);
        console.log('  [ciffit] Clicked Cierre Fiscal option.');
      } else {
        console.log('  [ciffit] No Cierre Fiscal option found.');
      }
    } catch (err) {
      console.log('  [ciffit] Could not click Cierre link:', err instanceof Error ? err.message : err);
    }

    // Step 4: Try to find and fill year selector
    console.log(`  [ciffit] Setting year to ${year}...`);
    try {
      const yearSelect = await page.$(
        'select[id*="year"], select[id*="vigencia"], select[name*="year"]'
      );
      if (yearSelect) {
        await yearSelect.selectOption(String(year));
        await page.waitForTimeout(1000);
        console.log(`  [ciffit] Year set to ${year}.`);
      } else {
        console.log('  [ciffit] No year selector found.');
      }
    } catch (err) {
      console.log('  [ciffit] Could not set year:', err instanceof Error ? err.message : err);
    }

    // Step 5: Try to find department selector (derive dept from DANE code)
    const deptCode = daneCode.slice(0, 2);
    console.log(`  [ciffit] Setting department (code ${deptCode})...`);
    try {
      const deptSelect = await page.$('select[id*="depart"], select[id*="dept"]');
      if (deptSelect) {
        const deptOptions = await deptSelect.$$('option');
        for (const opt of deptOptions) {
          const val = await opt.getAttribute('value');
          if (val && val.includes(deptCode)) {
            await deptSelect.selectOption(val);
            await page.waitForTimeout(1000);
            console.log(`  [ciffit] Department selected: ${val}`);
            break;
          }
        }
      } else {
        console.log('  [ciffit] No department selector found.');
      }
    } catch (err) {
      console.log('  [ciffit] Could not set department:', err instanceof Error ? err.message : err);
    }

    // Step 6: Try to find municipality selector
    console.log(`  [ciffit] Setting municipality (DANE ${daneCode})...`);
    try {
      const muniSelect = await page.$('select[id*="munic"], select[id*="entity"]');
      if (muniSelect) {
        await page.waitForTimeout(1000);
        const muniOptions = await muniSelect.$$('option');
        for (const opt of muniOptions) {
          const val = await opt.getAttribute('value');
          if (val && val.includes(daneCode)) {
            await muniSelect.selectOption(val);
            await page.waitForTimeout(1000);
            console.log(`  [ciffit] Municipality selected: ${val}`);
            break;
          }
        }
      } else {
        console.log('  [ciffit] No municipality selector found.');
      }
    } catch (err) {
      console.log('  [ciffit] Could not set municipality:', err instanceof Error ? err.message : err);
    }

    // Step 7: Click search/consultar button
    console.log('  [ciffit] Clicking search button...');
    try {
      const searchBtn = await page.$(
        'button:has-text("Consultar"), button:has-text("Buscar"), button[type="submit"]'
      );
      if (searchBtn) {
        await searchBtn.click();
        await page.waitForTimeout(5000);
        console.log('  [ciffit] Search button clicked, waiting for results...');
      } else {
        console.log('  [ciffit] No search button found.');
      }
    } catch (err) {
      console.log('  [ciffit] Could not click search:', err instanceof Error ? err.message : err);
    }

    // Step 8: Extract data from table
    console.log('  [ciffit] Extracting table data...');
    const rows: FUTCierreScraped[] = [];

    try {
      const tableRows = await page.$$('table tbody tr');
      console.log(`  [ciffit] Found ${tableRows.length} table rows.`);

      for (const row of tableRows) {
        const cells = await row.$$('td');
        if (cells.length >= 6) {
          const texts = await Promise.all(cells.map((c) => c.textContent()));
          const clean = texts.map((t) => (t || '').trim());

          rows.push({
            codigo: clean[0],
            nombre: clean[1],
            saldoCaja: parseFloat(
              clean[2]?.replace(/[,.$]/g, '').replace(',', '.') || '0'
            ),
            totalDisponibilidades: parseFloat(
              clean[3]?.replace(/[,.$]/g, '').replace(',', '.') || '0'
            ),
            recursosTerceros: parseFloat(
              clean[4]?.replace(/[,.$]/g, '').replace(',', '.') || '0'
            ),
            cuentasPorPagar: parseFloat(
              clean[5]?.replace(/[,.$]/g, '').replace(',', '.') || '0'
            ),
            reservas: parseFloat(
              clean[6]?.replace(/[,.$]/g, '').replace(',', '.') || '0'
            ),
            saldoEnLibros: parseFloat(
              clean[7]?.replace(/[,.$]/g, '').replace(',', '.') || '0'
            ),
          });
        }
      }
    } catch (err) {
      console.log('  [ciffit] Error extracting table:', err instanceof Error ? err.message : err);
    }

    // Get municipality name from page
    let municipioName = daneCode;
    try {
      municipioName = await page.$eval(
        'h1, h2, .title, .municipality-name',
        (el) => el.textContent?.trim() || ''
      );
    } catch {
      console.log('  [ciffit] Could not extract municipality name from page.');
    }

    console.log(`  [ciffit] Extraction complete: ${rows.length} rows.`);

    return {
      municipio: municipioName || daneCode,
      vigencia: String(year),
      rows,
      scrapedAt: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}
