/**
 * CLI script to scrape fiscal data for a municipality
 *
 * Usage:
 *   npx tsx scripts/scrape-fiscal-data.ts --dane 05091 --year 2024
 *   npx tsx scripts/scrape-fiscal-data.ts --dane 05001 --year 2024 --headful
 *   npx tsx scripts/scrape-fiscal-data.ts --dane 05091 --chip 210105091 --year 2024
 *
 * Flags:
 *   --dane <code>     DANE municipality code (default: 05091)
 *   --chip <code>     CHIP entity code for CGN/Cognos scraper
 *   --year <year>     Fiscal year (default: 2024)
 *   --headful         Run browser in visible mode (for debugging)
 *   --skip-ciffit     Skip the CIFFIT/FUT scraper
 *   --skip-cognos     Skip the Cognos/CGN scraper
 *
 * Output: saves JSON files to data/scraped/{daneCode}/
 */

import { scrapeFUTCierre } from '../src/lib/scrapers/ciffit-scraper';
import { scrapeCGNSaldos } from '../src/lib/scrapers/cognos-scraper';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const daneCode = getArg(args, '--dane') || '05091';
  const year = parseInt(getArg(args, '--year') || '2024');
  const headless = !args.includes('--headful');
  const skipCiffit = args.includes('--skip-ciffit');
  const skipCognos = args.includes('--skip-cognos');

  // CHIP code — needed for Cognos/CGN scraper
  const chipCode = getArg(args, '--chip') || '';

  const outDir = path.join(process.cwd(), 'data', 'scraped', daneCode);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\nScraping fiscal data for DANE ${daneCode}, year ${year}`);
  console.log(`  Output: ${outDir}`);
  console.log(`  Headless: ${headless}\n`);

  // ── CIFFIT — FUT Cierre Fiscal ──────────────────────────────────
  if (!skipCiffit) {
    console.log('[1/2] Scraping FUT Cierre Fiscal from CIFFIT...');
    try {
      const futData = await scrapeFUTCierre(daneCode, year, { headless });
      const futPath = path.join(outDir, `fut-cierre-${year}.json`);
      fs.writeFileSync(futPath, JSON.stringify(futData, null, 2));
      console.log(
        `  OK — FUT Cierre: ${futData.rows.length} rows saved to ${futPath}`
      );
    } catch (err) {
      console.error(
        `  FAIL — FUT Cierre:`,
        err instanceof Error ? err.message : err
      );
    }
  } else {
    console.log('[1/2] Skipping CIFFIT (--skip-ciffit)');
  }

  // ── Cognos — CGN Saldos ─────────────────────────────────────────
  if (!skipCognos && chipCode) {
    console.log('[2/2] Scraping CGN Saldos from Cognos...');
    try {
      const cgnData = await scrapeCGNSaldos(chipCode, year, 4, { headless });
      const cgnPath = path.join(outDir, `cgn-saldos-${year}-T4.json`);
      fs.writeFileSync(cgnPath, JSON.stringify(cgnData, null, 2));
      console.log(
        `  OK — CGN Saldos: ${cgnData.rows.length} rows saved to ${cgnPath}`
      );
      console.log(
        `       Activos: ${cgnData.activos}, Pasivos: ${cgnData.pasivos}, Patrimonio: ${cgnData.patrimonio}`
      );
    } catch (err) {
      console.error(
        `  FAIL — CGN Saldos:`,
        err instanceof Error ? err.message : err
      );
    }
  } else if (!chipCode && !skipCognos) {
    console.log(
      '[2/2] Skipping CGN Saldos — no --chip code provided. Use --chip <code> to enable.'
    );
  } else {
    console.log('[2/2] Skipping Cognos (--skip-cognos)');
  }

  console.log('\nDone.\n');
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

main().catch(console.error);
