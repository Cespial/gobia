/**
 * Validador end-to-end: corre evaluateLey617() contra los archivos locales
 * .xlsb/.xlsx descargados (Downloads), forzando dataSource="local".
 *
 * Uso:
 *   npx tsx scripts/validar-ley617-betania.ts [DANE] [PERIODO]
 *   default: 05091 (Betania), 2025_8
 */

import { evaluateLey617 } from "@/lib/validaciones/ley617";
import {
  fetchEjecucionIngresosLocal,
  fetchGastosPorSeccionLocal,
} from "@/lib/cuipo-local-xlsb";

async function main() {
  const dane = process.argv[2] || "05091";
  const periodo = process.argv[3] || "2025_8";

  console.log(`\n=== Ley 617 — DANE ${dane} · periodo ${periodo} (LOCAL) ===\n`);

  const result = await evaluateLey617(dane, periodo, undefined, {
    dataSource: "local",
    localFetchers: {
      fetchIngresos: fetchEjecucionIngresosLocal,
      fetchGastos: fetchGastosPorSeccionLocal,
    },
  });

  const fmt = (n: number) =>
    n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  console.log(`Origen datos:                 ${result.dataSource}`);
  console.log(`ICLD Bruto:                   ${fmt(result.icldBruto)}`);
  console.log(`ICLD Validado:                ${fmt(result.icldValidado)}`);
  console.log(`Acciones de mejora:           ${fmt(result.accionesMejora)}`);
  console.log(`Deducción Reportada:          ${fmt(result.deduccionReportada)}`);
  console.log(`Deducción Calculada (%):      ${fmt(result.deduccionCalculada)}  (${(result.porcentajeFondosTotal * 100).toFixed(2)}%)`);
  console.log(`Deducción Compromisos (B):    ${fmt(result.deduccionFondosCompromisos)}`);
  console.log(`Deducción Fondos (USADA):     ${fmt(result.deduccionFondos)}`);
  console.log(`ICLD Neto:                    ${fmt(result.icldNeto)}`);
  console.log("");
  console.log(`Gastos Funcionamiento Total:  ${fmt(result.gastosFuncionamientoTotal)}`);
  console.log(`Gastos Deducidos:             ${fmt(result.gastosDeducidos)}`);
  console.log(`Gastos Funcionamiento Neto:   ${fmt(result.gastosFuncionamientoNeto)}`);
  console.log(`Ratio Global:                 ${(result.ratioGlobal * 100).toFixed(2)}% / Limite ${(result.limiteGlobal * 100).toFixed(0)}%`);
  console.log(`Status:                       ${result.status}`);
  console.log("");
  console.log("Breakdown Deducción Fondos:");
  for (const f of result.deduccionFondosBreakdown) {
    if (f.valor > 0) {
      console.log(`  ${f.fondoNombre.padEnd(50)} ${fmt(f.valor).padStart(15)}`);
      for (const d of f.detalle) {
        console.log(`     - ${d.cuenta.padEnd(22)} ${d.fuente.padEnd(12)} ${fmt(d.valor).padStart(15)}`);
      }
    }
  }

  console.log("");
  console.log("Secciones presupuestales:");
  for (const s of result.secciones) {
    console.log(`  ${s.seccion.padEnd(30)} GF=${fmt(s.gastosFuncionamiento).padStart(15)}  ratio=${(s.ratio * 100).toFixed(2)}%  ${s.status}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
