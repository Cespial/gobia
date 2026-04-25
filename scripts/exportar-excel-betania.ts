/**
 * Exporta el Excel de validador-gobia para Betania (DANE 05091, 2025_8)
 * usando datos locales (.xlsb) y abre el archivo resultante.
 */
import { evaluateLey617 } from "@/lib/validaciones/ley617";
import { exportValidacionesToExcel } from "@/lib/excel-exporter";
import { execSync } from "child_process";
import { resolve } from "path";

async function main() {
  const dane = "05091";
  const periodo = "2025_8";

  console.log(`Calculando Ley 617 para DANE ${dane} · periodo ${periodo} (LOCAL)...`);
  const ley617 = await evaluateLey617(dane, periodo, undefined, {
    dataSource: "local",
  });

  console.log(`  ICLD Bruto:           ${ley617.icldBruto.toLocaleString("es-CO")}`);
  console.log(`  ICLD Validado:        ${ley617.icldValidado.toLocaleString("es-CO")}`);
  console.log(`  Deducción Fondos:     ${ley617.deduccionFondos.toLocaleString("es-CO")}`);
  console.log(`  Origen:               ${ley617.dataSource}`);

  console.log(`\nGenerando Excel...`);
  exportValidacionesToExcel({
    municipio: { name: "Betania", code: dane, chipCode: dane },
    periodo,
    ley617,
  });

  const fileName = `validador-${dane}-${periodo}.xlsx`;
  const fullPath = resolve(process.cwd(), fileName);
  console.log(`Excel: ${fullPath}`);
  execSync(`open "${fullPath}"`);
  console.log("Abierto en Excel/Numbers.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
