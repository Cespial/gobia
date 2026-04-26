# Cierre de Brechas del Validador Fiscal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close 5 remaining logical gaps in the fiscal validator so every module produces correct, traceable, and complete results regardless of data source.

**Architecture:** 5 sequential sprints modifying existing validation modules. Sprint 1 (Excel), Sprint 2 (leaf/vigencia), and Sprint 4 (IDF) are independent. Sprint 3 depends on Sprint 2. Sprint 5 depends on Sprint 4.

**Tech Stack:** TypeScript (Next.js 16), xlsx-js-style, existing SODA/CUIPO data pipeline.

---

## File Map

| File | Sprint | Action | Responsibility |
|------|--------|--------|----------------|
| `src/lib/excel-exporter.ts` | 1, 5 | Modify | Add alertas ICLD, deduccion detail, trazabilidad fix, deuda sheet |
| `src/lib/datos-gov-cuipo.ts` | 2 | Modify | Add `classifyVigencia()` and `filterLeafRows()` |
| `src/app/api/plataforma/cuipo/route.ts` | 2 | Modify | Use canonical leaf/vigencia functions |
| `src/lib/cuipo-processor.ts` | 2 | Modify | Use `classifyVigencia()` |
| `src/lib/validaciones/ley617.ts` | 3 | Modify | Accept `cuipoData` option |
| `src/lib/validation-run.ts` | 3, 4, 5 | Modify | Pass cuipoData to ley617, CGN rows to IDF, call deuda |
| `src/lib/validaciones/idf.ts` | 4 | Modify | Use CGN rows for debt ratio |
| `src/lib/validaciones/deuda-publica.ts` | 5 | Create | New Ley 358 module |
| `src/components/validador/ValidadorDashboard.tsx` | 5 | Modify | Add deuda_publica to VALIDACIONES |

---

### Task 1: Excel — Alertas ICLD section in Ley 617 sheet

**Files:**
- Modify: `src/lib/excel-exporter.ts`

- [ ] **Step 1: Read current end of Ley 617 sheet**

Find the end of the `addLey617Sheet` function — after the ICLD detail table and before `setRange`/`!cols`. The alertas section goes right before the final `setRange`.

- [ ] **Step 2: Add alertas ICLD section**

In `src/lib/excel-exporter.ts`, locate the line with `setRange(ws, r - 1, detailCols - 1);` inside `addLey617Sheet` (after the secciones table and ICLD detail table). Insert BEFORE that line:

```typescript
  // Alertas ICLD
  if (data.alertasICLD && data.alertasICLD.length > 0) {
    writeEmptyRow(ws, r++, detailCols);
    writeSectionRow(ws, r++, "ALERTAS ICLD", detailCols);
    writeHeaderRow(ws, r++, ["Rubro", "Nombre", "Condicion", "Motivo"]);
    for (let i = 0; i < data.alertasICLD.length; i++) {
      const a = data.alertasICLD[i];
      const isAlt = i % 2 === 1;
      const ds = isAlt ? altRowStyle : dataStyle;
      writeText(ws, r, 0, a.cuenta, ds);
      writeText(ws, r, 1, a.nombre, ds);
      writeText(ws, r, 2, a.condicion, ds);
      writeText(ws, r, 3, a.motivo, ds);
      r++;
    }
  }
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/excel-exporter.ts
git commit -m "feat(excel): add alertas ICLD section to Ley 617 sheet"
```

---

### Task 2: Excel — Deduccion por Norma detail table

**Files:**
- Modify: `src/lib/excel-exporter.ts`

- [ ] **Step 1: Add deduccion detail section**

In `addLey617Sheet`, locate the line `writeKV(ws, r++, "Gastos Funcionamiento Total:", data.gastosFuncionamientoTotal, detailCols);`. Insert BEFORE that line (after `deduccionFondos` KV and before GF section):

```typescript
  // Deduccion por norma detail
  if (data.deduccionFondosPorNormaDetalle && data.deduccionFondosPorNormaDetalle.length > 0) {
    writeSectionRow(ws, r++, "DETALLE DEDUCCION POR CONDICIONES DE NORMA", detailCols);
    writeHeaderRow(ws, r++, ["Cuenta", "Nombre", "Fuente", "Recaudo", "Motivo"]);
    for (let i = 0; i < data.deduccionFondosPorNormaDetalle.length; i++) {
      const d = data.deduccionFondosPorNormaDetalle[i];
      const isAlt = i % 2 === 1;
      const ns = isAlt ? altRowNumStyle : numStyle;
      const ds = isAlt ? altRowStyle : dataStyle;
      writeText(ws, r, 0, d.cuenta, ds);
      writeText(ws, r, 1, d.nombre, ds);
      writeText(ws, r, 2, d.fuente, ds);
      writeNum(ws, r, 3, d.valor, ns);
      writeText(ws, r, 4, d.razon, ds);
      r++;
    }
    writeEmptyRow(ws, r++, detailCols);
  }
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/excel-exporter.ts
git commit -m "feat(excel): add deduccion por norma detail table in Ley 617 sheet"
```

---

### Task 3: Excel — Fix trazabilidad dataset ID

**Files:**
- Modify: `src/lib/excel-exporter.ts`

- [ ] **Step 1: Fix the wrong dataset ID**

Find the line containing `e84r-mfgi` (around line 1795) and replace with the correct CUIPO PROG_INGRESOS dataset:

```typescript
// Old:
`datos.gov.co - e84r-mfgi | WHERE c_digo_entidad='${chip}' AND vigencia='${periodo}'`,
// New:
`datos.gov.co - 22ah-ddsj | WHERE c_digo_entidad='${chip}' AND vigencia='${periodo}'`,
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/excel-exporter.ts
git commit -m "fix(excel): correct trazabilidad PROG_INGRESOS dataset ID (22ah-ddsj)"
```

---

### Task 4: Canonical `classifyVigencia()` and `filterLeafRows()`

**Files:**
- Modify: `src/lib/datos-gov-cuipo.ts`

- [ ] **Step 1: Add canonical functions**

At the end of the file (before the default export if any, or at the bottom), add:

```typescript
// ---------------------------------------------------------------------------
// Canonical vigencia classification — single source of truth
// ---------------------------------------------------------------------------

export type VigenciaType = 'va' | 'reservas' | 'cxp';

/**
 * Classify a vigencia string into one of three categories.
 * Checks CxP first (most specific), then Reservas, then VA as default.
 * Blank/empty vigencia is classified as VA (common in CHIP file fill-down gaps).
 */
export function classifyVigencia(vigencia: string): VigenciaType {
  const v = (vigencia || '').toUpperCase().trim();
  if (v.includes('CUENTAS POR PAGAR')) return 'cxp';
  if (v.includes('RESERVA')) return 'reservas';
  return 'va';
}

// ---------------------------------------------------------------------------
// Canonical leaf-row detection — prefix-matching algorithm
// ---------------------------------------------------------------------------

/**
 * Filter rows to keep only leaf-level entries (no children in the dataset).
 * A row is a leaf if no other row's cuenta starts with (this.cuenta + ".").
 * This prevents double-counting parent aggregation rows.
 */
export function filterLeafRows<T>(
  rows: T[],
  getCuenta: (row: T) => string
): T[] {
  const allCuentas = new Set(
    rows.map(r => getCuenta(r).trim()).filter(Boolean)
  );
  return rows.filter(r => {
    const cuenta = getCuenta(r).trim();
    if (!cuenta) return false;
    const prefix = cuenta + '.';
    for (const c of allCuentas) {
      if (c !== cuenta && c.startsWith(prefix)) return false;
    }
    return true;
  });
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/datos-gov-cuipo.ts
git commit -m "feat: add canonical classifyVigencia() and filterLeafRows() functions"
```

---

### Task 5: Apply canonical functions to API route

**Files:**
- Modify: `src/app/api/plataforma/cuipo/route.ts`

- [ ] **Step 1: Import canonical functions**

Add to the imports at the top of the file:

```typescript
import { classifyVigencia, filterLeafRows } from "@/lib/datos-gov-cuipo";
```

- [ ] **Step 2: Replace inline leaf detection**

Replace the two inline leaf-detection blocks (for ingresos ~lines 91-100 and gastos ~lines 102-111) with:

```typescript
const ingresos = filterLeafRows(ingresosRaw, r => r.cuenta || "");
const gastos = filterLeafRows(gastosRaw, r => r.cuenta || "");
```

Remove the `ingCuentas`, `gasCuentas` Sets and their filter blocks.

- [ ] **Step 3: Replace inline vigencia classification**

In the gastos loop where vigencia is classified (the `if (vigencia === "VIGENCIA ACTUAL")` block), replace with:

```typescript
const vig = classifyVigencia(row.nom_vigencia_del_gasto || "");

if (vig === 'va') {
  existing.compromisos_va += compromisos;
  existing.obligaciones_va += obligaciones;
  existing.pagos_va += pagos;
} else if (vig === 'reservas') {
  existing.compromisos_res += compromisos;
  existing.pagos_res += pagos;
} else if (vig === 'cxp') {
  existing.compromisos_cxp += compromisos;
  existing.pagos_cxp += pagos;
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/api/plataforma/cuipo/route.ts
git commit -m "refactor(route): use canonical classifyVigencia/filterLeafRows"
```

---

### Task 6: Apply canonical functions to cuipo-processor

**Files:**
- Modify: `src/lib/cuipo-processor.ts`

- [ ] **Step 1: Import classifyVigencia**

Add to the imports:

```typescript
import { classifyVigencia } from "@/lib/datos-gov-cuipo";
```

- [ ] **Step 2: Replace vigencia classification in gastos loop**

In `buildEquilibrioFromCuipo()`, replace the entire vigencia classification block (the `if/else if` with `vigencia.includes('VIGENCIA ACTUAL')`, `includes('RESERVA')`, `includes('CUENTAS POR PAGAR')`) with:

```typescript
    const vig = classifyVigencia(row.vigencia);

    if (vig === 'va') {
      existing.compromisos_va += row.compromisos;
      existing.obligaciones_va += row.obligaciones;
      existing.pagos_va += row.pagos;
    } else if (vig === 'reservas') {
      existing.compromisos_res += row.compromisos;
      existing.pagos_res += row.pagos;
    } else if (vig === 'cxp') {
      existing.compromisos_cxp += row.compromisos;
      existing.pagos_cxp += row.pagos;
    }
```

- [ ] **Step 3: Verify build and test**

Run: `npx tsc --noEmit`

Then verify numeric parity:
```bash
npx tsx -e "
import { parseCuipoFiles } from './src/lib/chip-parser';
import { buildEquilibrioFromCuipo } from './src/lib/cuipo-processor';
import fs from 'fs';
const toAB = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const fixtures = ['cuipo_prog_ing','cuipo_ejec_ing','cuipo_prog_gas','cuipo_ejec_gas'].map(n =>
  ({ name: n+'.xlsx', buffer: toAB(fs.readFileSync('public/fixtures/05091/'+n+'.xlsx')) }));
const eq = buildEquilibrioFromCuipo(parseCuipoFiles(fixtures));
console.log('Ingresos:', eq.totalIngresos, '(expect 26434698725)');
console.log('Compromisos:', eq.totalCompromisos, '(expect 28481892240)');
console.log('Validador:', eq.totalValidador, '(expect 0)');
"
```
Expected: values unchanged from before refactor.

- [ ] **Step 4: Commit**

```bash
git add src/lib/cuipo-processor.ts
git commit -m "refactor(processor): use canonical classifyVigencia"
```

---

### Task 7: Ley 617 — Accept uploaded CuipoData

**Files:**
- Modify: `src/lib/validaciones/ley617.ts`
- Modify: `src/lib/validation-run.ts`

- [ ] **Step 1: Add cuipoData to Ley617Options**

In `ley617.ts`, find the `Ley617Options` interface and add:

```typescript
interface Ley617Options {
  dataSource?: "auto" | "api" | "local";
  localFetchers?: {
    fetchIngresos: (dane: string, periodo: string) => Promise<CuipoEjecIngresos[]>;
    fetchGastos: (dane: string, periodo: string) => Promise<CuipoEjecGastos[]>;
  };
  cuipoData?: {
    ejecIngresos: import("@/lib/chip-parser").CuipoIngresosRow[];
    ejecGastos: import("@/lib/chip-parser").CuipoGastosRow[];
  } | null;
  fondosOverride?: FondoDeduccionICLD[];
  fondosPorId?: Record<string, { porcentaje?: number; customLabel?: string }>;
}
```

- [ ] **Step 2: Add conversion functions**

Add before `evaluateLey617()`:

```typescript
function cuipoIngToSoda(rows: import("@/lib/chip-parser").CuipoIngresosRow[]): CuipoEjecIngresos[] {
  return rows.map(r => ({
    periodo: "", codigo_entidad: "", nombre_entidad: "", ambito_codigo: "",
    cuenta: r.cuenta,
    nombre_cuenta: r.nombre,
    cod_fuentes_financiacion: r.codigoFuente,
    nom_fuentes_financiacion: r.fuente,
    total_recaudo: String(r.totalRecaudo),
    recaudo_vac_ss: String(r.recaudoVACSS ?? 0),
    recaudo_vac_cs: String(r.recaudoVACCS ?? 0),
    recaudo_van_ss: String(r.recaudoVANSS ?? 0),
    recaudo_van_cs: String(r.recaudoVANCS ?? 0),
  }));
}

function cuipoGasToSoda(rows: import("@/lib/chip-parser").CuipoGastosRow[]): CuipoEjecGastos[] {
  return rows.map(r => ({
    periodo: "", codigo_entidad: "", nombre_entidad: "", ambito_codigo: "", bpin: "",
    cuenta: r.cuenta,
    nombre_cuenta: r.nombre,
    cod_vigencia_del_gasto: "",
    nom_vigencia_del_gasto: r.vigencia,
    cod_seccion_presupuestal: "",
    nom_seccion_presupuestal: r.seccion,
    cod_fuentes_financiacion: r.codigoFuente,
    nom_fuentes_financiacion: r.fuente,
    compromisos: String(r.compromisos),
    obligaciones: String(r.obligaciones),
    pagos: String(r.pagos),
  }));
}
```

- [ ] **Step 3: Add cuipoData path in evaluateLey617**

In the data fetching section (around the `const [ingresosRows, gastosPorSeccion] = ...` block), add a third priority branch for cuipoData:

```typescript
  const useCuipo = !!options.cuipoData?.ejecIngresos.length;

  const [ingresosRows, gastosPorSeccion] = useCuipo
    ? [cuipoIngToSoda(options.cuipoData!.ejecIngresos), cuipoGasToSoda(options.cuipoData!.ejecGastos)]
    : useLocal && options.localFetchers
    ? await Promise.all([
        options.localFetchers.fetchIngresos(daneCode, periodo),
        options.localFetchers.fetchGastos(daneCode, periodo),
      ])
    : await Promise.all([
        fetchEjecucionIngresos(chipCode, periodo),
        fetchGastosPorSeccion(chipCode, periodo),
      ]);
```

Also update `dataSource` result to reflect cuipo origin:

```typescript
  const effectiveDataSource: "local" | "api" = useCuipo ? "local" : useLocal ? "local" : "api";
```

And use `effectiveDataSource` in the return object instead of the current conditional.

- [ ] **Step 4: Update validation-run.ts to call Ley 617 directly**

In `validation-run.ts`, replace the API fetch for ley617 (the `fetchApi<{ ok: true; ley617: Ley617Result }>("ley617", ...)` call) with a direct invocation:

```typescript
      evaluateLey617(
        municipio.chipCode,
        effectivePeriodo,
        municipio.category,
        {
          cuipoData: inputs.cuipoData
            ? { ejecIngresos: inputs.cuipoData.ejecIngresos, ejecGastos: inputs.cuipoData.ejecGastos }
            : undefined,
        }
      ).catch(() => null),
```

Update the result destructuring — `ley617Data` now returns `Ley617Result` directly (not wrapped in `{ ok, ley617 }`):

```typescript
const ley617 = ley617Data ?? null;
```

Remove the old `const ley617 = ley617Data?.ley617 ?? null;` line.

Add the import at the top:
```typescript
import { evaluateLey617 } from "@/lib/validaciones/ley617";
import type { Ley617Result } from "@/lib/validaciones/ley617";
```

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/validaciones/ley617.ts src/lib/validation-run.ts
git commit -m "feat(ley617): accept uploaded CuipoData, run client-side when available"
```

---

### Task 8: IDF — Endeudamiento from CGN rows

**Files:**
- Modify: `src/lib/validaciones/idf.ts`
- Modify: `src/lib/validation-run.ts`

- [ ] **Step 1: Update CGN parameter type in idf.ts**

Find the `calculateIDF` function signature. Update the `cgnSaldos` parameter type:

```typescript
export async function calculateIDF(
  chipCode: string,
  periodo: string,
  cgnSaldos: {
    activos: number;
    pasivos: number;
    rows?: { codigo: string; nombre: string; saldoFinal: number }[];
  } | null,
  progIngresosUpload?: import("@/lib/chip-parser").CuipoProgIngresosRow[] | null,
): Promise<IDFResult>
```

- [ ] **Step 2: Extract debt accounts from CGN rows**

Replace the existing endeudamiento calculation (the `hasDeuda`/`deudaRatio`/`deudaScore` block around line 341-344) with:

```typescript
  // 3. Endeudamiento LP — from CGN Saldos
  // Prefer specific debt accounts (2.2 + 2.3) over generic Pasivos/Activos
  let deudaFinanciera = 0;
  let deudaLabel = "Capacidad de endeudamiento";
  let deudaFormula = "";

  if (cgnSaldos?.rows && cgnSaldos.rows.length > 0) {
    // Extract specific debt accounts
    for (const row of cgnSaldos.rows) {
      const code = (row.codigo || "").trim();
      // 2.2 = Credito publico, 2.3 = Prestamos por pagar (top-level only)
      if (code === "2.2" || code === "2.3") {
        deudaFinanciera += row.saldoFinal ?? 0;
      }
    }
    deudaLabel = "Endeudamiento (deuda financiera / ingresos corrientes)";
    deudaFormula = "CGN (2.2 + 2.3) / Ingresos Corrientes CUIPO";
  }

  const hasDeuda = deudaFinanciera > 0 && ingresosCorrientes > 0;
  const deudaRatio = hasDeuda ? deudaFinanciera / ingresosCorrientes : 0;
  const deudaScore: number | null = cgnSaldos
    ? normalizeInverse(deudaRatio)
    : null;
```

Update the indicator object in `resultadosFiscales`:

```typescript
    {
      name: deudaLabel,
      value: Math.round(deudaRatio * 10000) / 100,
      score: deudaScore,
      interpretation: !cgnSaldos
        ? "No disponible — requiere CGN Saldos"
        : deudaFinanciera === 0
        ? "Sin deuda financiera reportada (CGN 2.2 + 2.3 = 0)"
        : deudaRatio > 0.5 ? "Alto endeudamiento relativo a ingresos"
        : deudaRatio > 0.3 ? "Endeudamiento moderado"
        : "Bajo endeudamiento, buena capacidad",
    },
```

- [ ] **Step 3: Update validation-run.ts to pass CGN rows**

Find the `calculateIDF()` call and update to pass `rows`:

```typescript
      calculateIDF(
        municipio.chipCode,
        effectivePeriodo,
        inputs.cgnSaldos ? {
          activos: inputs.cgnSaldos.activos,
          pasivos: inputs.cgnSaldos.pasivos,
          rows: inputs.cgnSaldos.rows,
        } : null,
        progIngresosUpload,
      ).catch(() => null),
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/validaciones/idf.ts src/lib/validation-run.ts
git commit -m "feat(idf): use CGN debt accounts (2.2+2.3) for endeudamiento indicator"
```

---

### Task 9: Deuda Publica module — Create evaluateDeudaPublica

**Files:**
- Create: `src/lib/validaciones/deuda-publica.ts`

- [ ] **Step 1: Create the module**

```typescript
/**
 * Deuda Pública — Ley 358/1997 compliance validation
 *
 * Uses CGN Saldos (balance sheet) to calculate debt indicators.
 * SODA dataset 9ksa-mf4g is dead (data only to 2020), so we use CGN instead.
 */

interface CGNSaldosInput {
  activos: number;
  pasivos: number;
  rows: { codigo: string; nombre: string; saldoFinal: number; movimientoDebito?: number }[];
}

export interface DeudaPublicaResult {
  saldoDeuda: number;
  servicioDeuda: number;
  ingresosCorrientes: number;
  ahorroOperacional: number;
  ratioSostenibilidad: number | null;
  ratioSolvencia: number | null;
  umbralSostenibilidad: number;
  umbralSolvencia: number;
  statusSostenibilidad: "cumple" | "no_cumple" | "no_aplica";
  statusSolvencia: "cumple" | "no_cumple" | "no_aplica";
  statusGlobal: "cumple" | "no_cumple" | "no_aplica";
  capacidadAutonoma: boolean;
  detalleDeuda: { codigo: string; nombre: string; saldo: number }[];
  notas: string[];
}

function sumCGNAccounts(
  rows: CGNSaldosInput["rows"],
  prefixes: string[],
  field: "saldoFinal" | "movimientoDebito" = "saldoFinal"
): number {
  let total = 0;
  for (const row of rows) {
    const code = (row.codigo || "").trim();
    if (prefixes.some(p => code === p)) {
      total += (field === "saldoFinal" ? row.saldoFinal : row.movimientoDebito) ?? 0;
    }
  }
  return total;
}

export function evaluateDeudaPublica(
  cgnSaldos: CGNSaldosInput | null,
  equilibrio: {
    ingresosCorrientes?: number;
    gastosFuncionamiento?: number;
  } | null,
): DeudaPublicaResult | null {
  if (!cgnSaldos || !cgnSaldos.rows || cgnSaldos.rows.length === 0) {
    return null;
  }

  const UMBRAL_SOSTENIBILIDAD = 0.80;
  const UMBRAL_SOLVENCIA = 0.40;

  // 1. Saldo deuda total: CGN 2.2 + 2.3
  const saldoCredito = sumCGNAccounts(cgnSaldos.rows, ["2.2"]);
  const saldoPrestamos = sumCGNAccounts(cgnSaldos.rows, ["2.3"]);
  const saldoDeuda = saldoCredito + saldoPrestamos;

  // 2. Servicio deuda: CGN gastos financieros 5.1.11
  const gastosFinancieros = sumCGNAccounts(cgnSaldos.rows, ["5.1.11"]);
  const amortizacion = sumCGNAccounts(cgnSaldos.rows, ["2.3"], "movimientoDebito");
  const servicioDeuda = gastosFinancieros + amortizacion;

  // 3. Ingresos corrientes and ahorro operacional
  const ingresosCorrientes = equilibrio?.ingresosCorrientes ?? 0;
  const gastosFuncionamiento = equilibrio?.gastosFuncionamiento ?? 0;
  const ahorroOperacional = ingresosCorrientes - gastosFuncionamiento;

  // Detalle deuda
  const detalleDeuda: { codigo: string; nombre: string; saldo: number }[] = [];
  for (const row of cgnSaldos.rows) {
    const code = (row.codigo || "").trim();
    if ((code === "2.2" || code === "2.3") && row.saldoFinal > 0) {
      detalleDeuda.push({ codigo: code, nombre: row.nombre, saldo: row.saldoFinal });
    }
  }

  const notas: string[] = [];

  // Special case: no debt
  if (saldoDeuda === 0) {
    return {
      saldoDeuda: 0,
      servicioDeuda: 0,
      ingresosCorrientes,
      ahorroOperacional,
      ratioSostenibilidad: null,
      ratioSolvencia: null,
      umbralSostenibilidad: UMBRAL_SOSTENIBILIDAD,
      umbralSolvencia: UMBRAL_SOLVENCIA,
      statusSostenibilidad: "no_aplica",
      statusSolvencia: "no_aplica",
      statusGlobal: "no_aplica",
      capacidadAutonoma: true,
      detalleDeuda,
      notas: ["El municipio no reporta deuda financiera (CGN 2.2 + 2.3 = 0)."],
    };
  }

  // Calculate ratios
  const ratioSostenibilidad = ingresosCorrientes > 0 ? saldoDeuda / ingresosCorrientes : null;
  const ratioSolvencia = ahorroOperacional > 0 ? servicioDeuda / ahorroOperacional : null;

  const statusSostenibilidad: "cumple" | "no_cumple" | "no_aplica" =
    ratioSostenibilidad === null ? "no_aplica" :
    ratioSostenibilidad < UMBRAL_SOSTENIBILIDAD ? "cumple" : "no_cumple";

  const statusSolvencia: "cumple" | "no_cumple" | "no_aplica" =
    ratioSolvencia === null ? "no_aplica" :
    ratioSolvencia < UMBRAL_SOLVENCIA ? "cumple" : "no_cumple";

  const statusGlobal: "cumple" | "no_cumple" | "no_aplica" =
    statusSostenibilidad === "no_aplica" && statusSolvencia === "no_aplica" ? "no_aplica" :
    statusSostenibilidad === "cumple" && statusSolvencia === "cumple" ? "cumple" : "no_cumple";

  const capacidadAutonoma = statusGlobal === "cumple";

  if (ingresosCorrientes === 0) {
    notas.push("Ingresos corrientes no disponibles — no se puede calcular sostenibilidad.");
  }
  if (ahorroOperacional <= 0) {
    notas.push("Ahorro operacional negativo o cero — ratio de solvencia no calculable.");
  }
  if (amortizacion === 0 && saldoDeuda > 0) {
    notas.push("Amortizacion no detectada en CGN (movimiento debito de 2.3). Servicio de deuda puede estar subestimado.");
  }

  return {
    saldoDeuda,
    servicioDeuda,
    ingresosCorrientes,
    ahorroOperacional,
    ratioSostenibilidad,
    ratioSolvencia,
    umbralSostenibilidad: UMBRAL_SOSTENIBILIDAD,
    umbralSolvencia: UMBRAL_SOLVENCIA,
    statusSostenibilidad,
    statusSolvencia,
    statusGlobal,
    capacidadAutonoma,
    detalleDeuda,
    notas,
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/validaciones/deuda-publica.ts
git commit -m "feat: add Deuda Publica validation module (Ley 358/1997)"
```

---

### Task 10: Integrate Deuda Publica into validation pipeline

**Files:**
- Modify: `src/lib/validation-run.ts`
- Modify: `src/components/validador/ValidadorDashboard.tsx`

- [ ] **Step 1: Add deuda to validation-run.ts**

Add import:
```typescript
import { evaluateDeudaPublica, type DeudaPublicaResult } from "@/lib/validaciones/deuda-publica";
```

In the `Promise.all` block, add a new call after `evaluateMapaInversiones`:
```typescript
      evaluateMapaInversiones(municipio.chipCode, effectivePeriodo, inputs.mapaData).catch(() => null),
```
becomes:
```typescript
      evaluateMapaInversiones(municipio.chipCode, effectivePeriodo, inputs.mapaData).catch(() => null),
```

Then after the Promise.all, compute deuda synchronously (since it doesn't need API calls):
```typescript
  const deudaPublica = inputs.cgnSaldos
    ? evaluateDeudaPublica(
        { activos: inputs.cgnSaldos.activos, pasivos: inputs.cgnSaldos.pasivos, rows: inputs.cgnSaldos.rows },
        {
          ingresosCorrientes: equilibrio?.porFuente
            ? equilibrio.porFuente.reduce((s, f) => s + f.recaudo, 0) - (equilibrio.porFuente.filter(f => f.codigo?.startsWith("1.2") || f.nombre.toUpperCase().includes("RECURSO DEL BALANCE")).reduce((s, f) => s + f.recaudo, 0))
            : 0,
          gastosFuncionamiento: ley617?.gastosFuncionamientoTotal ?? 0,
        }
      )
    : null;
```

Add `deudaPublica` to the `data` object in the returned `ValidationRun`, and add a module entry:
```typescript
{
  id: "deuda_publica",
  label: deudaPublica
    ? `${deudaPublica.statusGlobal === 'cumple' ? 'Cumple' : deudaPublica.statusGlobal === 'no_aplica' ? 'Sin deuda' : 'No cumple'} Ley 358`
    : "Pendiente — requiere CGN Saldos",
  status: !inputs.cgnSaldos ? "upload_needed" : deudaPublica ? deudaPublica.statusGlobal === "no_cumple" ? "warning" : "ok" : "error",
  summary: deudaPublica?.notas?.join("; ") ?? "",
  score: null,
},
```

- [ ] **Step 2: Add to ValidadorDashboard VALIDACIONES array**

In `ValidadorDashboard.tsx`, find the `VALIDACIONES` array and add:
```typescript
{ id: "deuda_publica", label: "Deuda Publica", icon: "Landmark" },
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/validation-run.ts src/components/validador/ValidadorDashboard.tsx
git commit -m "feat: integrate Deuda Publica module into validation pipeline"
```

---

### Task 11: Excel — Deuda Publica sheet

**Files:**
- Modify: `src/lib/excel-exporter.ts`

- [ ] **Step 1: Add Deuda Publica sheet**

Add a new function `addDeudaPublicaSheet` following the same pattern as other sheet functions. Call it in the main `exportValidacionesToExcel` function where sheets are created.

The sheet should include:
- KV pairs: Saldo Deuda, Servicio Deuda, Ingresos Corrientes, Ahorro Operacional
- Check table: 2 rows (Sostenibilidad, Solvencia) with Indicador | Ratio | Umbral | Estado
- Detalle deuda sub-table (if any)
- Notas section (if any)
- Formula annotations

The implementation follows the exact same pattern as `addAguaPotableSheet` — KV section, data table, status styling.

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/excel-exporter.ts
git commit -m "feat(excel): add Deuda Publica sheet (Ley 358)"
```

---

### Task 12: Final verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: successful build, all pages render

- [ ] **Step 2: Numeric parity test**

```bash
npx tsx -e "
import { parseCuipoFiles } from './src/lib/chip-parser';
import { buildEquilibrioFromCuipo } from './src/lib/cuipo-processor';
import fs from 'fs';
const toAB = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const fixtures = ['cuipo_prog_ing','cuipo_ejec_ing','cuipo_prog_gas','cuipo_ejec_gas'].map(n =>
  ({ name: n+'.xlsx', buffer: toAB(fs.readFileSync('public/fixtures/05091/'+n+'.xlsx')) }));
const eq = buildEquilibrioFromCuipo(parseCuipoFiles(fixtures));
const checks = [
  ['Ingresos', eq.totalIngresos, 26434698725],
  ['Compromisos', eq.totalCompromisos, 28481892240],
  ['Validador', eq.totalValidador, 0],
  ['PptoIniIng', eq.pptoInicialIngresos, 21276337596],
  ['PptoDefGas', eq.pptoDefinitivoGastos, 31331015577],
];
let ok = true;
for (const [name, got, exp] of checks) {
  if (got !== exp) { console.log('FAIL', name, got, 'vs', exp); ok = false; }
}
console.log(ok ? 'ALL PASS' : 'FAILURES DETECTED');
"
```
Expected: `ALL PASS`

- [ ] **Step 3: Push**

```bash
git push
```
