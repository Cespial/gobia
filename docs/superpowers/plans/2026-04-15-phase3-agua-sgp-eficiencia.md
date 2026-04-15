# Phase 3: Agua Potable + SGP + Eficiencia Fiscal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans

**Goal:** Implement Agua Potable standalone module (5 sub-validations), fix SGP gastos proporcionales, and correct Eficiencia Fiscal formula/threshold.

**Architecture:** Agua Potable becomes its own validation module with CUIPO account-specific queries. SGP gets real expense matching instead of proportional distribution. Eficiencia Fiscal gets the correct CGN accounting formula (CxC_I + Income_IV - Adjustments_IV - CxC_IV) and 25% variance threshold.

---

## Task 1: Create Agua Potable validation module

**Files:**
- Create: `src/lib/validaciones/agua-potable.ts`

5 sub-validations from the Excel "4. Evaluación Agua Potable" sheet:

1. **Asignación**: Presupuesto Definitivo SGP APSB ≥ Distribución SICODIS
2. **Ejecución**: Compromisos / Distribución ≥ 75% (not 70% as in generic SGP)
3. **Déficit**: Recursos Disponibles - Compromisos ≥ 0
4. **Subsidios**: Balance subsidios otorgados vs contribuciones solidaridad
5. **Pago subsidios**: Que existan pagos efectivos > 0

CUIPO accounts:
- Income: `1.1.02.06.001.05` (SGP APSB)
- Expenses subsidios: `2.3.3.01.02.004.*` and `2.3.3.01.04.004.*`
- Contribuciones: `1.1.01.02.217.*`
- Fuente: `SGP-AGUA POTABLE Y SANEAMIENTO BASICO`

## Task 2: Create AguaPotablePanel component

**Files:**
- Create: `src/components/validador/AguaPotablePanel.tsx`
- Modify: `src/components/validador/ValidadorDashboard.tsx`

Replace the current "agua" tab (derived from SGP) with the standalone Agua Potable module.

## Task 3: Fix SGP expense distribution (real vs proportional)

**Files:**
- Modify: `src/lib/validaciones/sgp.ts`

Current: distributes total SGP expenses proportionally by income share.
Fix: filter expenses by funding source name matching each SGP component.

## Task 4: Refactor Eficiencia Fiscal with correct CGN formula

**Files:**
- Modify: `src/lib/validaciones/eficiencia-fiscal.ts`
- Modify: `src/components/validador/ValidadorDashboard.tsx`

Current issues:
- Wrong formula: just compares CUIPO vs CGN directly
- Wrong threshold: 50% (should be 25%)
- Only 12 taxes (should be 19+)
- Only 1 CGN file (needs CGN_I + CGN_IV)

CGN accounting formula per tax:
```
CGN_total = CxC_saldo_final_I (from CGN Saldos I)
          + Income_account_IV (4.1.xx from CGN Saldos IV)
          - Adjustments_IV (4.1.95.xx from CGN Saldos IV, only if negative)
          - CxC_saldo_final_IV (1.3.xx from CGN Saldos IV)
```

Refrendation logic:
- Variance = |CUIPO/CGN - 1|
- If variance < 25% AND CGN ≤ CUIPO: refrendar CGN amount
- If variance < 25% AND CGN > CUIPO: refrendar CUIPO amount
- If variance ≥ 25%: refrendar 0

Expanded tax mapping with CGN accounts (each tax has 4 CGN accounts):
- CxC account (1.3.xx) — queried from both CGN_I and CGN_IV
- Income account (4.1.05.xx) — from CGN_IV
- Adjustment account (4.1.95.xx) — from CGN_IV
- CxC final (same as CxC account, from CGN_IV)

## Task 5: Add second CGN upload slot (Trimestre I)

**Files:**
- Modify: `src/components/validador/FileUploadPanel.tsx`
- Modify: `src/components/validador/ValidadorDashboard.tsx`

Add `cgnSaldosI` state and upload slot. Pass both CGN datasets to Eficiencia Fiscal.

---

## Betania Expected Values

### Agua Potable
- Distribución SICODIS: 1,644,873,639
- Presupuesto Definitivo: 1,644,873,639 → CUMPLE
- Compromisos: 902,594,047 (54.87%) → NO CUMPLE (<75%)
- Recursos Disponibles: 1,728,755,763 - Compromisos: 974,361,071 → Superávit → CUMPLE
- Subsidios otorgados: 373,666,418 (acueducto 114M + alcantarillado 64M + aseo 195M)
- Contribuciones solidaridad: 0
- Balance subsidios: 373,666,418 → CUMPLE (pagados con SGP APSB)

### Eficiencia Fiscal (selected taxes)
- Predial: CGN=2,369,151,310 vs CUIPO=1,114,567,886 → Var 52.9% → NO REFRENDA
- ICA: CGN=8,122,489,785 vs CUIPO=453,182,702 → Var 94.4% → NO REFRENDA
- Vehículos: CGN=50,873,911 vs CUIPO=39,604,652 → Var 22.2% → SI REFRENDA
- Delineación: CGN=97,683,440 vs CUIPO=84,359,997 → Var 13.6% → SI REFRENDA
