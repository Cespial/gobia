# Cierre de Brechas del Validador Fiscal — Design Spec

**Goal:** Close the 5 remaining logical gaps in gobia.co's fiscal validator so every module produces correct, traceable, and complete results regardless of data source (API, CHIP file upload, or CIFFIT consolidated DB).

**Architecture:** 5 sequential sprints, each self-contained and deployable. No new frameworks or dependencies — all changes extend existing patterns.

**Tech Stack:** TypeScript (Next.js 16), xlsx-js-style, existing SODA/CUIPO data pipeline.

---

## Sprint 1: Excel Export Completeness

### Problem
Three data groups computed by validation modules are not exported to Excel:
- `alertasICLD` (array of ICLD condition violations) — computed in ley617.ts but not in any Excel sheet
- `deduccionFondosPorNormaDetalle` (per-rubro breakdown of why each ICLD account was deducted) — computed but only the total is exported
- Trazabilidad sheet references wrong dataset ID (`e84r-mfgi` instead of `22ah-ddsj`)

### Changes

**File: `src/lib/excel-exporter.ts`**

1. **Alertas ICLD section** in the Ley 617 sheet (after the existing sections):
   - Section header: "ALERTAS ICLD"
   - Table columns: Rubro | Nombre | Condición | Motivo
   - Data source: `ley617.alertasICLD` (type `AlertaICLDRow[]`)
   - Only render section if `alertasICLD.length > 0`

2. **Deducción por Norma detail** in the Ley 617 sheet (after deduccionFondos KV pair):
   - Section header: "DETALLE DEDUCCIÓN POR CONDICIONES DE NORMA"
   - Table columns: Cuenta | Nombre | Recaudo | Motivo deducción
   - Data source: `ley617.deduccionFondosPorNormaDetalle` (type array with cuenta, nombre, monto, razon)
   - Only render section if array length > 0

3. **Fix trazabilidad dataset ID**:
   - Line ~1795: Replace `e84r-mfgi` with `22ah-ddsj` (CUIPO_DATASETS.PROG_INGRESOS)

---

## Sprint 2: Unify Leaf-Row Detection and Vigencia Classification

### Problem
Two critical algorithms differ between the API route (route.ts) and the file processor (cuipo-processor.ts):

**Leaf-row detection:**
- API: prefix-matching on `cuenta` field (`isLeaf = no other row starts with cuenta + "."`)
- File parser: presence of `fuente` field (`isLeaf = fuente.length > 0`)

**Vigencia classification:**
- API: exact `=== "VIGENCIA ACTUAL"` for VA, `.includes()` for Reservas/CxP
- Processor: `.includes("VIGENCIA ACTUAL")` OR empty string OR `.includes("ADMINISTRACION")` for VA

### Changes

**File: `src/lib/datos-gov-cuipo.ts`** — Add two canonical functions:

```typescript
export function classifyVigencia(vigencia: string): 'va' | 'reservas' | 'cxp' | null {
  const v = (vigencia || '').toUpperCase().trim();
  if (v.includes('CUENTAS POR PAGAR')) return 'cxp';
  if (v.includes('RESERVA')) return 'reservas';
  if (v === 'VIGENCIA ACTUAL' || v.includes('VIGENCIA ACTUAL') || v === '') return 'va';
  return 'va'; // default: unclassified rows treated as VA
}

export function filterLeafRows<T>(
  rows: T[],
  getCuenta: (row: T) => string
): T[] {
  const allCuentas = new Set(rows.map(r => getCuenta(r).trim()).filter(Boolean));
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

**Apply to:**
- `src/app/api/plataforma/cuipo/route.ts` — Replace inline leaf detection (lines 91-111) and vigencia check (lines 162-177) with the canonical functions
- `src/lib/cuipo-processor.ts` — Replace vigencia classification (lines 240-262) with `classifyVigencia()`
- `src/lib/validaciones/eficiencia-fiscal.ts` — Add leaf filtering after SODA query (for consistency, even though SODA pre-groups)

---

## Sprint 3: Ley 617 from Uploaded CUIPO Data

### Problem
`evaluateLey617()` always fetches from the SODA API via the route. When the user uploads fresh CHIP files (especially T4 cierre, which the API doesn't have), Ley 617 ignores them and uses stale API data.

### Changes

**File: `src/lib/validaciones/ley617.ts`**

1. Add new parameter to `Ley617Options`:
   ```typescript
   interface Ley617Options {
     localFetchers?: { ... };
     cuipoData?: {
       ejecIngresos: CuipoIngresosRow[];
       ejecGastos: CuipoGastosRow[];
     } | null;
     fondosOverride?: FondoDeduccionICLD[];
     fondosPorId?: Record<string, { porcentaje?: number; customLabel?: string }>;
   }
   ```

2. At the top of `evaluateLey617()`, when `options.cuipoData` is provided:
   - Convert `CuipoIngresosRow[]` → `CuipoEjecIngresos[]` format (the SODA API type)
   - Convert `CuipoGastosRow[]` → `CuipoEjecGastos[]` format
   - Use these instead of calling `fetchEjecucionIngresos()`/`fetchGastosPorSeccion()`
   - This enables all downstream logic (ICLD whitelist filtering, deductions, etc.) to work unchanged

3. The conversion maps CHIP fields to SODA API fields:
   - `CuipoIngresosRow.cuenta` → `CuipoEjecIngresos.cuenta`
   - `CuipoIngresosRow.totalRecaudo` → `CuipoEjecIngresos.total_recaudo` (as string)
   - `CuipoIngresosRow.codigoFuente` → `CuipoEjecIngresos.cod_fuentes_financiacion`
   - `CuipoGastosRow.cuenta` → `CuipoEjecGastos.cuenta`
   - `CuipoGastosRow.compromisos` → `CuipoEjecGastos.compromisos` (as string)
   - `CuipoGastosRow.vigencia` → `CuipoEjecGastos.nom_vigencia_del_gasto`
   - `CuipoGastosRow.seccion` → `CuipoEjecGastos.nom_seccion_presupuestal`
   - `CuipoGastosRow.codigoFuente` → `CuipoEjecGastos.cod_fuentes_financiacion`

**File: `src/lib/validation-run.ts`**

4. Replace the API fetch for Ley 617 (line 883-885) with a direct call:
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
   This makes Ley 617 run client-side when CUIPO data is available, falling back to API otherwise.

---

## Sprint 4: IDF Endeudamiento from CGN

### Problem
The "Endeudamiento LP" indicator in IDF returns `score: null` when CGN data exists but doesn't break down debt properly. Currently it uses `Pasivos/Activos` as a generic leverage ratio, which is NOT the DNP methodology (should use debt-specific accounts).

### Changes

**File: `src/lib/validaciones/idf.ts`**

1. Accept CGN Saldos rows (not just totals) so we can extract specific accounts:
   ```typescript
   // Current signature
   cgnSaldos: { activos: number; pasivos: number } | null
   // New signature
   cgnSaldos: { activos: number; pasivos: number; rows?: CGNSaldosRow[] } | null
   ```

2. Extract debt-specific accounts from CGN rows when available:
   - `2.2` (Operaciones de crédito público y financiamiento con banca central)
   - `2.3` (Préstamos por pagar)
   - Sum of these = Deuda financiera total

3. Update the endeudamiento indicator calculation:
   - When CGN rows available: `deudaFinanciera / ingresosCorrientes` (DNP methodology)
   - Fallback (no CGN rows): keep current `pasivos / activos` (generic leverage)
   - Score: `normalizeInverse(ratio)` — lower ratio = better score

4. Update interpretation text to reflect the actual formula used.

**File: `src/lib/validation-run.ts`**

5. Pass CGN rows to `calculateIDF()`:
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
   )
   ```

---

## Sprint 5: Deuda Pública Module (Ley 358)

### Problem
No validation module for Ley 358/1997 debt compliance exists. The SODA dataset `9ksa-mf4g` is dead (latest data: 2020). CGN Saldos provides the necessary balance-sheet data.

### Data Sources
- **CGN Saldos (file upload):** Balance sheet with Activos, Pasivos by account
  - `2.2` = Crédito público
  - `2.3` = Préstamos por pagar
  - `5.1.11` = Gastos financieros (intereses + comisiones = servicio deuda costos)
- **CUIPO equilibrio (already computed):** Ingresos corrientes, ahorro operacional
- **Ley 617 result (already computed):** Gastos funcionamiento, ICLD

### Calculations

1. **Saldo deuda total:** CGN `2.2` + `2.3` (saldoFinal)
2. **Servicio deuda anual:** Sum of CGN gastos financieros (`5.1.11`) + amortización (change in `2.3` saldoFinal between periods, approximated as movimiento débito)
3. **Ahorro operacional:** Ingresos corrientes (CUIPO) - Gastos funcionamiento (Ley 617) — or fallback from CGN if Ley 617 unavailable

**Checks:**

| Check | Fórmula | Umbral Ley 358 | Status |
|-------|---------|----------------|--------|
| Sostenibilidad | Saldo deuda / Ingresos corrientes | < 80% | cumple/no_cumple |
| Solvencia | Servicio deuda / Ahorro operacional | < 40% | cumple/no_cumple |
| Capacidad autónoma | Si ambos cumplen | — | Puede contratar deuda sin autorización |

**Special case:** When `saldoDeuda === 0` → all checks return `"no_aplica"` with message "El municipio no reporta deuda financiera."

### Changes

**New file: `src/lib/validaciones/deuda-publica.ts`**

```typescript
export interface DeudaPublicaResult {
  saldoDeuda: number;
  servicioDeuda: number;
  ingresosCorrientes: number;
  ahorroOperacional: number;
  ratioSostenibilidad: number | null;   // saldoDeuda / ingresosCorrientes
  ratioSolvencia: number | null;         // servicioDeuda / ahorroOperacional
  umbralSostenibilidad: number;          // 0.80
  umbralSolvencia: number;               // 0.40
  statusSostenibilidad: 'cumple' | 'no_cumple' | 'no_aplica';
  statusSolvencia: 'cumple' | 'no_cumple' | 'no_aplica';
  statusGlobal: 'cumple' | 'no_cumple' | 'no_aplica';
  capacidadAutonoma: boolean;
  detalleDeuda: { codigo: string; nombre: string; saldo: number }[];
  notas: string[];
}

export function evaluateDeudaPublica(
  cgnSaldos: CGNSaldosResult | null,
  equilibrio: { ingresosCorrientes?: number; gastosFuncionamiento?: number } | null,
): DeudaPublicaResult | null
```

**File: `src/lib/validation-run.ts`**
- Import and call `evaluateDeudaPublica()` in the Promise.all block
- Pass CGN saldos and equilibrio/ley617 data for ingresos corrientes and gastos funcionamiento

**File: `src/lib/excel-exporter.ts`**
- New sheet "9. Deuda Pública" (moves current "Mapa Inversiones" if numbered)
- KV pairs: Saldo Deuda, Servicio Deuda, Ingresos Corrientes, Ahorro Operacional
- Check table: 2 rows (Sostenibilidad, Solvencia) with ratio, umbral, status
- Detalle deuda sub-table

**File: `src/components/validador/ValidadorDashboard.tsx`**
- Add "deuda_publica" to VALIDACIONES array
- Render result in the module grid

---

## Sprint Order and Dependencies

```
Sprint 1 (Excel)       — independent, no blockers
Sprint 2 (Leaf+Vig)    — independent, no blockers
Sprint 3 (Ley617)      — depends on Sprint 2 (uses classifyVigencia)
Sprint 4 (IDF)         — independent
Sprint 5 (Deuda)       — depends on Sprint 4 (shares CGN row extraction pattern)
```

Sprints 1, 2, and 4 can run in parallel. Sprint 3 after 2. Sprint 5 after 4.

---

## Out of Scope

- CIFFIT web scraper automation (portal is ASP.NET postbacks, no API)
- SODA dataset `9ksa-mf4g` integration (dead — data only to 2020)
- Ley 819 Marco Fiscal (needs MFMP data not available in CUIPO/CHIP)
- Vigencias Futuras separate validation
- Concejo number lookup from external source (stays as category-based default)
