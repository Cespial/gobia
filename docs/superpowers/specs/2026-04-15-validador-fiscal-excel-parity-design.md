# Validador Fiscal Municipal — Excel Parity Design Spec

**Date:** 2026-04-15
**Author:** Cristian Espinal / Claude
**Status:** Draft
**Approach:** Excel-first — cada sprint replica un módulo de la plantilla Excel y valida contra Betania

---

## 1. Objetivo

Llevar el validador de gobia.co a paridad exacta con la plantilla Excel de validación de informes FUT y CUIPO 2025. La plataforma debe producir los mismos números que el Excel para cualquier municipio, con trazabilidad de cada cálculo y exportación auditable.

**Principio rector (Ricardo):** _"El éxito es la perfección. Primero exactitud, después automatización."_

**Criterio de aceptación global:** Para el municipio de Betania (DANE 05091, Antioquia), cada módulo debe producir los mismos valores que la plantilla `Plantilla validación de Informes - FUT y CUIPO 2025_Betania (1).xlsm`.

---

## 2. Arquitectura Actual vs. Objetivo

### 2.1 Estado actual

```
Fuentes:
  CUIPO (4 datasets via SODA API) ──┐
  SICODIS (SGP via REST API) ───────┤
  FUT Cierre (1 upload, parser ok) ─┤──→ 8 validaciones ──→ Dashboard + PDF
  CGN Saldos (1 upload, parser ok) ─┘
```

### 2.2 Estado objetivo

```
Fuentes:
  CUIPO (4 datasets via SODA API) ──────────┐
  SICODIS (SGP via REST API) ───────────────┤
  FUT Cierre 2025 (upload) ─────────────────┤
  FUT Cierre 2024 (upload) ─────────────────┤
  CGN Saldos I trimestre (upload) ──────────┤──→ 10 validaciones ──→ Dashboard
  CGN Saldos IV trimestre (upload) ─────────┤                       + Excel Export
  FUT Registro Presupuestal Agua (upload) ──┤                       + Trazabilidad
  Mapa de Inversiones DNP (upload) ─────────┤
  Inputs manuales (decretos, etc.) ─────────┘
```

### 2.3 Validaciones: actual vs. objetivo

| # | Módulo | Excel | Gobia actual | Sprint |
|---|--------|-------|-------------|--------|
| 0 | Equilibrio por fuentes | 85 fuentes fijas, saldo en libros, validador | Parcial (sin saldo en libros, sin validador) | S0 |
| 1 | Cierre FUT vs CUIPO | 60 filas, 3 cruces por fila, tabla mapeo | Parcial (sin tabla de mapeo) | S1 |
| 2 | SI.17 / Ley 617 (CGR) | ICLD con rubros específicos + descuentos legales | Parcial (filtro genérico, sin descuentos) | S2 |
| 3 | Equilibrio CGA (Antioquia) | 8+ chequeos, cross-vigencia, decretos | 4 chequeos, sin cross-vigencia | S3 |
| 4 | Agua Potable (Min. Vivienda) | 5 sub-validaciones, RP, subsidios | Solo derivado de SGP | S4 |
| 5 | SGP (DNP requisitos legales) | Por componente: distribución/ppto/recaudo/ejecución | Implementado (ejecución proporcional) | S5 |
| 6 | Eficiencia Fiscal (Contaduría) | 2 CGN trimestres, fórmula contable, umbral 25% | 1 CGN, varianza directa, umbral 50% | S6 |
| 7 | Mapa de Inversiones (DNP) | Cruce BEPIN+MGA con plan de desarrollo | No existe | S7 |
| 8 | Desempeño Fiscal (IDF) | 5 resultados + 5 gestión, ranking | 4 resultados + 3 gestión | S8 |
| 9 | Exportación Excel + Trazabilidad | Es el Excel mismo | No existe | S9 |

---

## 3. Prerequisito Transversal: Tabla de Mapeo CUIPO → FUT

### 3.1 Problema

La plantilla Excel tiene en la hoja `0. Equilibrio`, columna B, un **código de consolidación** (1-85) que mapea cada fuente de financiación CUIPO a una categoría del FUT Cierre Fiscal. Sin esta tabla, el cruce Cierre vs CUIPO es imposible.

### 3.2 Solución

Crear archivo `src/data/fuentes-consolidacion.ts` con la tabla de mapeo estática extraída de la plantilla:

```typescript
export interface FuenteConsolidacion {
  codigoCuipo: string;          // e.g., "1.2.1.0.00"
  codigoConsolidacion: number;  // e.g., 1
  nombreCuipo: string;          // "INGRESOS CORRIENTES DE LIBRE DESTINACION"
  codigoFUT: string;            // "C.1.2" — código en FUT Cierre
  nombreFUT: string;            // "INGRESOS TRIBUTARIOS Y NO TRIBUTARIOS..."
}

export const FUENTES_CONSOLIDACION: FuenteConsolidacion[] = [
  // 85 filas extraídas de la plantilla Excel, hoja "0. Equilibrio"
  { codigoCuipo: "1.1.0.0.00", codigoConsolidacion: 0, nombreCuipo: "DISPONIBILIDAD INICIAL", codigoFUT: "", nombreFUT: "" },
  { codigoCuipo: "1.2.1.0.00", codigoConsolidacion: 1, nombreCuipo: "INGRESOS CORRIENTES DE LIBRE DESTINACION", codigoFUT: "C.1.2", nombreFUT: "INGRESOS TRIBUTARIOS Y NO TRIBUTARIOS DE LIBRE DESTINACIÓN" },
  // ... 83 más
];
```

**Extracción:** Automatizar con script Python que lee la plantilla y genera el .ts.

### 3.3 Archivo de referencia: Rubros CUIPO

Crear `src/data/rubros-cuipo.ts` con los 1,190 rubros de la hoja `Rubros CUIPO` para validar códigos de cuenta.

---

## 4. Prerequisito: Ampliación de File Upload

### 4.1 Estado actual del FileUploadPanel

Soporta 2 uploads: 1 FUT Cierre + 1 CGN Saldos. Los parsers ya soportan múltiples años/trimestres internamente.

### 4.2 Cambios necesarios

Ampliar a 6 uploads:

| Slot | Archivo | Parser | Nuevo? |
|------|---------|--------|--------|
| FUT Cierre 2025 | FUT Cierre Fiscal vigencia actual | `parseFUTCierre()` | No (renombrar slot) |
| FUT Cierre 2024 | FUT Cierre Fiscal vigencia anterior | `parseFUTCierre()` | Slot nuevo |
| CGN Saldos I | Saldos enero-marzo | `parseCGNSaldos()` | Slot nuevo |
| CGN Saldos IV | Saldos octubre-diciembre | `parseCGNSaldos()` | No (renombrar slot) |
| FUT RP Agua | Registro Presupuestal Agua Potable | `parseFUTRegistroPresupuestal()` | Parser + slot nuevo |
| Mapa Inversiones | Reporte proyectos DNP | `parseMapaInversiones()` | Parser + slot nuevo |

### 4.3 Modelo de datos en ValidadorDashboard

```typescript
// Estado actual
const [futCierre, setFutCierre] = useState<FUTCierreData | null>(null);
const [cgnSaldos, setCgnSaldos] = useState<CGNSaldosData | null>(null);

// Estado objetivo
const [futCierre2025, setFutCierre2025] = useState<FUTCierreData | null>(null);
const [futCierre2024, setFutCierre2024] = useState<FUTCierreData | null>(null);
const [cgnSaldosI, setCgnSaldosI] = useState<CGNSaldosData | null>(null);
const [cgnSaldosIV, setCgnSaldosIV] = useState<CGNSaldosData | null>(null);
const [futRPAgua, setFutRPAgua] = useState<FUTRPAguaData | null>(null);
const [mapaInversiones, setMapaInversiones] = useState<MapaInversionesData | null>(null);
const [inputsManuales, setInputsManuales] = useState<InputsManuales | null>(null);
```

### 4.4 Inputs manuales

Formulario editable para datos documentales:

```typescript
interface InputsManuales {
  reservasDecreto2025: number | null;       // Decreto de cierre de reservas
  cxpDecreto2025: number | null;            // Decreto/soporte CxP
  reservasGestionTransparente: number | null;
  cxpGestionTransparente: number | null;
  observaciones: string;
  fuenteDocumental: string;
}
```

---

## 5. Sprint 0: Equilibrio por Fuentes (Motor Central)

### 5.1 Qué hace la plantilla (Hoja "0. Equilibrio")

263 filas × 24 columnas. Agrega por cada una de las 85 fuentes de financiación fijas:

| Col | Campo | Fórmula |
|-----|-------|---------|
| A | Código CUIPO fuente | Fijo |
| B | Código consolidación | Fijo (1-85) para mapeo a FUT |
| C | Nombre fuente | Fijo |
| D | Recaudo | `SUMIF(EJEC_ING!fuente, nombre, total_ingresos)` |
| E | Compromisos VA | `SUMIFS(EJEC_GAST!compromisos, fuente=nombre, vigencia="VIGENCIA ACTUAL")` |
| F | Obligaciones VA | `SUMIFS(EJEC_GAST!obligaciones, fuente=nombre, vigencia="VIGENCIA ACTUAL")` |
| G | Pagos VA | `SUMIFS(EJEC_GAST!pagos, fuente=nombre, vigencia="VIGENCIA ACTUAL")` |
| H | Reservas | `= E - F` (Compromisos - Obligaciones, VA) |
| I | CxP | `= F - G` (Obligaciones - Pagos, VA) |
| J | Superávit/Déficit | `= D - E` (Recaudo - Compromisos) |
| K | Validador | `= E - G - H - I` (debe ser 0) |
| L | Reservas no canceladas vig ant. | `SUMIFS(EJEC_GAST, fuente, vigencia="RESERVAS") compromisos - pagos` |
| M | CxP no canceladas vig ant. | `SUMIFS(EJEC_GAST, fuente, vigencia="CUENTAS POR PAGAR") compromisos - pagos` |
| N | Saldo en Libros | `= MAX(0, J) + H + I + L + M` |
| O | Ppto Inicial Ingresos | Desde CUIPO PROG_ING |
| P | Ppto Inicial Gastos | Desde CUIPO PROG_GAS / pivot |
| Q | Ppto Definitivo Ingresos | Desde CUIPO PROG_ING |
| R | Ppto Definitivo Gastos | Desde CUIPO PROG_GAS / pivot |
| S | Diferencia Ppto Inicial | `= O - P` |
| T | Diferencia Ppto Definitivo | `= Q - R` |

### 5.2 Brechas actuales

1. **No hay lista fija de 85 fuentes** — Gobia agrega dinámicamente desde API
2. **No calcula Saldo en Libros** (col N) — Es la base del cruce con FUT
3. **No calcula Validador** (col K) — Chequeo de consistencia interna
4. **No tiene Reservas/CxP no canceladas vig. anterior** (cols L, M) — Necesarias para Saldo en Libros
5. **Ppto Ingresos = 0** — PROG_INGRESOS API no funciona
6. **No tiene desglose por sección presupuestal** del presupuesto

### 5.3 Cambios requeridos

**Archivo: `src/app/api/plataforma/cuipo/route.ts`** (action=equilibrio)
- Agregar al response: `saldoEnLibros`, `validador`, `reservasVigAnterior`, `cxpVigAnterior` por fuente
- Calcular `reservasVigAnterior = MAX(0, compromisos_res - pagos_res)` (ya tiene compromisos_res y pagos_res en fuenteMap)
- Calcular `cxpVigAnterior = MAX(0, compromisos_cxp - pagos_cxp)` (ya tiene estos campos)
- Calcular `saldoEnLibros = MAX(0, superavit) + reservas + cxp + reservasVigAnterior + cxpVigAnterior`
- Calcular `validador = compromisos_va - pagos_va - reservas - cxp` (debe ser 0)
- Para presupuesto ingresos: parsear desde archivo upload (CUIPO PROG_ING) o usar el top-level row de EJEC_ING

**Archivo: `src/data/fuentes-consolidacion.ts`** (NUEVO)
- Tabla de 85 fuentes fijas con códigos de consolidación

**Archivo: `src/components/validador/EquilibrioPanel.tsx`**
- Agregar columnas: Saldo en Libros, Validador, Reservas vig ant., CxP vig ant.
- Resaltar filas donde Validador ≠ 0

### 5.4 Validación contra Betania

Verificar que la fila `1.2.1.0.00 ICLD` produzca:
- Recaudo: 2,255,412,686
- Compromisos VA: 1,672,616,143
- Obligaciones: 1,602,910,554
- Pagos: 1,552,590,689
- Reservas: 69,705,589
- CxP: 50,319,865
- Superávit: 582,796,543
- Saldo en Libros: 702,821,997

---

## 6. Sprint 1: Cierre FUT vs CUIPO

### 6.1 Qué hace la plantilla (Hoja "1. CIERRE vs CUIPO")

62 filas × 12 columnas. Para cada código FUT (C, C.1, C.1.1, C.1.2, C.2, C.2.1...):

| Col | Campo | Fórmula |
|-----|-------|---------|
| A | Código FUT | C, C.1, C.1.1, etc. |
| B | Código consolidación | Número 1-85 (mapea a Equilibrio col B) |
| C | Nombre | Descripción de la fuente |
| D | Saldo en Libros FUT | `VLOOKUP(código_FUT, 'FUT CIERRE 2025'!A:O, 15)` |
| E | Saldo en Libros CUIPO | `SUMIF('Equilibrio'!B:B, consolidación, 'Equilibrio'!N:N)` |
| F | Diferencia | `= E - D` |
| G | Reservas FUT | `VLOOKUP(código_FUT, 'FUT CIERRE 2025'!A:O, 13)` |
| H | Reservas CUIPO | `SUMIF('Equilibrio'!B:B, consolidación, 'Equilibrio'!H:H)` |
| I | Diferencia | `= H - G` |
| J | CxP FUT | `VLOOKUP(código_FUT, 'FUT CIERRE 2025'!A:O, 10)` |
| K | CxP CUIPO | `SUMIF('Equilibrio'!B:B, consolidación, 'Equilibrio'!I:I)` |
| L | Diferencia | `= K - J` |

### 6.2 Brechas actuales

- **No existe tabla de mapeo FUT→Equilibrio** (código consolidación)
- **CierreVsCuipoPanel.tsx** existe (17KB) pero no implementa este cruce con consolidación
- **Saldo en Libros CUIPO no se calcula** (depende de Sprint 0)

### 6.3 Cambios requeridos

**Archivo: `src/data/mapeo-fut-consolidacion.ts`** (NUEVO)
- Tabla de 60 filas que mapea códigos FUT (C, C.1, etc.) a códigos de consolidación

**Archivo: `src/lib/validaciones/cierre-vs-cuipo.ts`** (NUEVO o refactor)
- Input: FUTCierreData + EquilibrioData (con saldoEnLibros por fuente)
- Para cada fila FUT: SUMIF de Equilibrio donde consolidación = B → compara Saldo, Reservas, CxP
- Output: array de CruceRow con { fila FUT, 3 comparaciones, 3 diferencias, 3 status }

**Archivo: `src/components/validador/CierreVsCuipoPanel.tsx`** (refactor)
- Mostrar tabla de 60 filas con 3 columnas de cruce (6 valores + 3 diferencias)
- Resaltar diferencias > 0

### 6.4 Validación contra Betania

Fila C.1.1 (SGP Libre Destinación Cat 4-6):
- Saldo Libros FUT: 676,042,035 vs CUIPO: 713,461,908 → Diferencia: 37,419,873
- Reservas FUT: 38,053,325 vs CUIPO: 38,053,325 → Diferencia: 0
- CxP FUT: 166,138,183 vs CUIPO: 166,138,183 → Diferencia: 0

---

## 7. Sprint 2: SI.17 / Ley 617 (Contraloría General de la República)

### 7.1 Qué hace la plantilla (Hoja "2. Cálculo 617")

3 bloques independientes + cálculo ICLD detallado:

**Bloque ICLD (columnas O-AC):**
- Lista exhaustiva de fuentes que la CGR acepta como ICLD
- Incluye "SGP PROPOSITO GENERAL LIBRE DESTINACION" para Cat 4-6
- **Descuenta** fondos con destinación específica legal:
  - Ley 99 ambiental
  - FONPET
  - Otros descuentos por acto administrativo
- Fórmula: `ICLD_neto = ICLD_bruto - descuentos_legales`

**Bloque Gastos (3 pivots por sección):**
- Admin Central: `SUMIFS(EJEC_GAST, sección="ADMIN CENTRAL", vigencia="VIGENCIA ACTUAL", fuente∈ICLD_fuentes, cuenta starts with "2.1" or "2.4")`
- Concejo: Mismo filtro pero sección="CONCEJO"
- Personería: Mismo filtro pero sección="PERSONERIA"

**Rubros que descuentan (los "colorcitos"):**
- Ciertos rubros de gasto que la norma permite descontar del total de funcionamiento
- Solo aplican si están en los rubros correctos
- Si el municipio los clasifica mal, no descuentan

**Cálculo final:**
- Admin Central: ratio = gastos / ICLD_neto. Límite: 50-80% según categoría
- Concejo: comparación absoluta contra SMLMV × factor
- Personería: comparación absoluta contra SMLMV × factor

### 7.2 Brechas actuales

1. **ICLD calculado con filtro genérico** `isICLDSource()` que busca "LIBRE DESTINACION" en nombre — no valida rubros específicos
2. **No descuenta fondos Ley 99, FONPET**, etc.
3. **No incluye SGP Libre Dest. Cat 4-6** en ICLD para municipios de esas categorías
4. **Gastos filtrados genéricamente** por cuenta "2.1" — no incluye "2.4" (transferencias corrientes)
5. **No identifica rubros que descuentan** del gasto de funcionamiento
6. **No genera "acciones de mejora"** — cuánto $ está en rubros incorrectos

### 7.3 Cambios requeridos

**Archivo: `src/data/icld-rubros-validos.ts`** (NUEVO)
- Lista exacta de fuentes/rubros que la CGR acepta como ICLD
- Lista de descuentos legales (Ley 99, FONPET, etc.)
- Lista de rubros de gasto que descuentan

**Archivo: `src/lib/validaciones/ley617.ts`** (refactor mayor)
- Reemplazar `isICLDSource()` genérico con lookup contra tabla de rubros válidos
- Agregar cálculo de descuentos legales
- Agregar inclusión de SGP LD para Cat 4-6
- Agregar cuentas "2.4" al filtro de gastos
- Calcular "acciones de mejora": $ en rubros incorrectos
- Retornar: `icldBruto`, `descuentos[]`, `icldNeto`, `gastosDescontables[]`, `accionesMejora[]`

**Archivo: `src/components/validador/Ley617Panel.tsx`** (refactor)
- Mostrar desglose ICLD: bruto → descuentos → neto
- Mostrar acciones de mejora con $ cuantificado
- Tabla de rubros con colorcitos (verde=descuenta, rojo=no descuenta)

### 7.4 Validación contra Betania

Extraer de plantilla los valores exactos de:
- ICLD bruto, descuentos, ICLD neto
- Gastos por sección
- Indicador SI.17 para Alcaldía, Concejo, Personería

---

## 8. Sprint 3: Equilibrio CGA (Contraloría de Antioquia)

### 8.1 Qué hace la plantilla (Hoja "3. Equilibrio CGA")

8 chequeos organizados en bloques:

| # | Chequeo | Valor 1 | Valor 2 | Tolerancia |
|---|---------|---------|---------|------------|
| 1 | Ppto Inicial I = G | `Equilibrio!O3` | `Equilibrio!P3` | ≈ $100 |
| 2 | Ppto Definitivo I = G | `Equilibrio!Q3` | `Equilibrio!R3` | ≈ $100 |
| 3a | Reservas 2025: FUT = CUIPO | `FUT2025!M3` | `Equilibrio!H235` (total) | = 0 |
| 3b | Reservas 2025: Decreto | Input manual | — | — |
| 4a | CxP 2025: FUT = CUIPO | `FUT2025!J3` | `Equilibrio!I235` | = 0 |
| 4b | CxP 2025: Decreto | Input manual | — | — |
| 5 | Superávit 2025: FUT = CUIPO | `FUT2025!O3` | `Equilibrio!J235` | ±$4 |
| 6 | Reservas 2024→2025 | `FUT2024!M2` | CUIPO vigencia RESERVAS aptto def | = 0 |
| 7 | CxP 2024→2025 | `FUT2024!J2` | CUIPO vigencia CXP aptto def | = 0 |
| 8 | Superávit 2024 | `FUT2024!O2` | — | — |

### 8.2 Brechas actuales

- Solo implementa 4 chequeos genéricos (sin FUT data por defecto)
- Tolerancia de $1M (demasiado laxa)
- No soporta FUT 2024 (cross-vigencia)
- No soporta inputs manuales (decretos)
- No calcula superávit cruzado

### 8.3 Cambios requeridos

**Archivo: `src/lib/validaciones/cga.ts`** (refactor mayor)
- Recibir: `futCierre2025`, `futCierre2024`, `equilibrioData`, `inputsManuales`
- Implementar 8 chequeos con tolerancias correctas
- Agregar cross-vigencia: comparar FUT 2024 reservas/CxP vs CUIPO RESERVAS/CXP

**Archivo: `src/components/validador/CGAPanel.tsx`** (refactor)
- Mostrar 8 chequeos con semáforo individual
- Campos editables para inputs manuales (decreto reservas, decreto CxP)
- Trazabilidad: "Dato origen: FUT Cierre 2025, fila C, columna M"

---

## 9. Sprint 4: Evaluación Agua Potable (Ministerio de Vivienda)

### 9.1 Qué hace la plantilla (Hoja "4. Evaluación Agua Potable")

5 sub-validaciones para la bolsa SGP APSB (cuenta 1.1.02.06.001.05):

| # | Sub-validación | Fórmula | Umbral |
|---|---------------|---------|--------|
| 1 | Asignación | Ppto Definitivo SGP APSB vs Distribución SICODIS | Iguales |
| 2 | Ejecución | Compromisos / Distribución | ≥ 75% |
| 3 | Déficit Presupuestal | Disponible - Compromisos | ≥ 0 |
| 4 | Balance subsidios | (Subsidios acueducto+alcantarillado+aseo) - Contribuciones solidaridad | — |
| 5 | Pago subsidios | Que haya pagos efectivos de subsidios | > 0 |

Cruces adicionales:
- FUT Cierre: superávit agua 2025 vs CUIPO
- FUT Cierre 2024: reservas/CxP agua vs ejecución 2025
- FUT Registro Presupuestal: detalle vs total ejecución

### 9.2 Cuentas CUIPO específicas

**Ingresos:**
- `1.1.02.06.001.05` — SGP Agua Potable y Saneamiento Básico

**Gastos (subsidios):**
- `2.3.3.01.02.004` — Subvenciones servicios públicos APSB
  - `.01` Subsidios acueducto
  - `.02` Subsidios alcantarillado
  - `.03` Subsidios aseo
- `2.3.3.01.04.004` — Subvenciones APSB (otra clasificación)
  - `.01`, `.02`, `.03` — Mismos sub-items

**Contribuciones:**
- `1.1.01.02.217` — Sobretasa solidaridad servicios públicos
  - `.01` Acueducto, `.02` Aseo, `.03` Alcantarillado

### 9.3 Cambios requeridos

**Archivo: `src/lib/validaciones/agua-potable.ts`** (NUEVO)
- Evaluación completa con 5 sub-validaciones
- Input: chipCode, periodo, sicodisData, equilibrioData, futCierre2024/2025, futRPAgua
- Output: `AguaPotableResult` con sub-validaciones y status individual

**Archivo: `src/lib/chip-parser.ts`** (agregar)
- `parseFUTRegistroPresupuestal()` — Parser para FUT RP Agua Potable

**Archivo: `src/components/validador/AguaPotablePanel.tsx`** (NUEVO — reemplazar derivación SGP)
- Panel completo con 5 sub-validaciones
- Tabla de subsidios vs contribuciones
- Indicadores de déficit/superávit

---

## 10. Sprint 5: Evaluación SGP (DNP Requisitos Legales)

### 10.1 Brechas actuales

1. **Ejecución de gastos proporcional** — Gobia distribuye el total de gastos SGP proporcionalmente por ingreso. La plantilla tiene gastos reales por componente via la fuente de financiación
2. **Sub-componentes faltantes** — Educación no desglosa Prestación/Calidad(Gratuidad+Matrícula); Salud no desglosa RS/Salud Pública/Subsidio Oferta
3. **Recaudo debe ser 100%** — No hay alerta si ≠ 100%
4. **Ejecución > 100%** — No hay alerta de sobre-ejecución

### 10.2 Cambios requeridos

**Archivo: `src/lib/validaciones/sgp.ts`** (refactor)
- Reemplazar distribución proporcional de gastos por filtro real: `SUMIFS(EJEC_GAST, fuente LIKE '%SGP%EDUCACION%' OR fuente LIKE '%SGP%SALUD%', etc.)`
- Agregar sub-componentes con cuentas CUIPO específicas
- Agregar alertas: recaudo ≠ 100%, ejecución > 100%
- Agregar status por sub-componente

**Archivo: `src/components/validador/SGPPanel.tsx`** (refactor)
- Tabla expandible con sub-componentes
- Columna de alertas específicas
- Resaltar recaudo ≠ 100% y ejecución > 100%

---

## 11. Sprint 6: Eficiencia Fiscal (Contaduría)

### 11.1 Qué hace la plantilla (Hoja "6. Eficiencia Fiscal")

Para cada impuesto, compara CUIPO (presupuestal) vs CGN (contable):

**Fórmula contable CGN:**
```
CGN_Total = (Saldo_Final_4.x × 1000) + (Saldo_Final_1.3.x_IV - Saldo_Inicial_1.3.x_I) × 1000
```

Donde:
- `4.x` = Cuenta de ingresos contables (CGN Saldos IV)
- `1.3.x` = Cuentas por cobrar (delta entre trimestre I y IV)
- Todo × 1000 porque CGN está en miles

**Umbral:** Varianza ≤ 25% → refrendado (NO 50% como tiene Gobia actualmente)

**19 impuestos** (vs 12 actuales):
1. Circulación y tránsito
2. Vehículos automotores
3. Predial unificado
4. Industria y comercio
5. Avisos y tableros
6. Publicidad exterior visual
7. Delineación urbana
8. Espectáculos públicos nacional (deporte)
9. Espectáculos públicos municipal
10. Ganadores sorteos
11. Loterías foráneas
12. Registro
13. Consumo licores/vinos
14. Desagravación IVA licores
15. Consumo cerveza
16. Cerveza salud
17. Consumo cigarrillos/tabaco
18. Ventas por clubes
19. Apuestas mutuas

### 11.2 Brechas actuales

1. **Fórmula incorrecta** — Gobia hace comparación directa, no fórmula contable
2. **Umbral incorrecto** — 50% vs 25%
3. **Solo 12 impuestos** — Faltan 7
4. **1 CGN** — Necesita 2 (I + IV trimestre)
5. **No usa delta CxC** — Solo usa saldo final

### 11.3 Cambios requeridos

**Archivo: `src/lib/validaciones/eficiencia-fiscal.ts`** (refactor mayor)
- Recibir `cgnSaldosI` + `cgnSaldosIV`
- Implementar fórmula contable correcta: ingreso contable + delta CxC
- Cambiar umbral a 25%
- Agregar 7 impuestos faltantes con mapeo CGN

**Archivo: `src/components/validador/EficienciaFiscalPanel.tsx`** (refactor)
- Mostrar: CUIPO, CGN, Diferencia, Varianza%, Refrendación SI/NO
- Mostrar desglose fórmula contable para trazabilidad

---

## 12. Sprint 7: Mapa de Inversiones (DNP)

### 12.1 Qué hace la plantilla

Cruce de CUIPO Ejecución de Gastos vs Mapa de Inversiones:

**Nivel 1 (mínimo):** BEPIN de CUIPO ∈ Mapa de Inversiones
**Nivel 2 (ideal):** BEPIN + Producto MGA de CUIPO = BEPIN + Producto de Mapa

**Consecuencia:** Lo ejecutado en CUIPO que no cruza con Mapa de Inversiones no suma al cumplimiento del Plan de Desarrollo.

### 12.2 Cambios requeridos

**Archivo: `src/lib/chip-parser.ts`** (agregar)
- `parseMapaInversiones()` — Parser para reporte de proyectos DNP (BEPIN, producto, sector, valor)

**Archivo: `src/lib/validaciones/mapa-inversiones.ts`** (NUEVO)
- Input: CUIPO EJEC_GAST (con BEPIN y producto MGA) + MapaInversionesData
- Cruce nivel 1: BEPIN exists
- Cruce nivel 2: BEPIN + Producto MGA match
- Output: `MapaInversionesResult` con:
  - bepinesEnAmbos: number
  - bepinessoloCuipo: { bepin, producto, valor }[] — ALERTA
  - bepinesSoloMapa: { bepin, producto }[] — OK
  - totalEjecutadoSinCruce: number — $ que no suma al PDM
  - pctEjecucionPDM: number

**Archivo: `src/components/validador/MapaInversionesPanel.tsx`** (NUEVO)
- Tabla de BEPINes con status (OK / NO CRUZA)
- Resumen: $ ejecutado vs $ que suma vs $ perdido
- Impacto en evaluación del Plan de Desarrollo

---

## 13. Sprint 8: Desempeño Fiscal (IDF)

### 13.1 Brechas

- Endeudamiento LP: requiere CGN Saldos (Pasivos/Activos)
- Crecimiento recursos propios: requiere 2 vigencias
- Actualización catastral: dato manual
- Nivel de holgura: Límite Ley 617 - ratio (depende de Sprint 2)
- Crecimiento esfuerzo propio: % crecimiento tributarios + no tributarios

### 13.2 Cambios requeridos

**Archivo: `src/lib/validaciones/idf.ts`** (refactor)
- Agregar indicador 3 (endeudamiento) usando CGN Saldos
- Agregar indicador 4 de gestión (crecimiento recursos propios) usando histórico
- Agregar indicador 5 de gestión (actualización catastral) como input manual
- Corregir indicador holgura para usar Ley 617 corregida (Sprint 2)

---

## 14. Sprint 9: Exportación Excel + Trazabilidad

### 14.1 Requerimiento

Cada validación debe poder descargarse como Excel con:
- Hoja de datos de entrada (con fuente identificada)
- Hoja de cruces (con fórmulas visibles como comentarios)
- Hoja de resultados (con semáforos)
- Hoja de trazabilidad (qué archivo, qué fila, qué columna originó cada dato)

### 14.2 Implementación

**Archivo: `src/lib/excel-exporter.ts`** (NUEVO)
- Usar librería `xlsx` (ya instalada) para generar workbooks
- Función por módulo: `exportEquilibrio()`, `exportLey617()`, etc.
- Template que replica las hojas de la plantilla Excel original
- Cada celda calculada incluye comentario con fórmula/origen

**Archivo: `src/components/validador/ExportButton.tsx`** (NUEVO)
- Botón "Descargar Excel" por pestaña y global
- Genera y descarga .xlsx en el browser

---

## 15. Dependencias entre Sprints

```
S0 (Equilibrio) ──→ S1 (Cierre vs CUIPO)
      │               │
      ├───────────────→ S3 (CGA) ──→ requiere FUT 2024
      │
      ├──→ S2 (Ley 617) ──→ S8 (IDF)
      │
      ├──→ S4 (Agua Potable) ──→ requiere RP Agua
      │
      ├──→ S5 (SGP)
      │
      └──→ S6 (Eficiencia) ──→ requiere CGN I + IV

S7 (Mapa Inversiones) ── independiente
S9 (Excel Export) ── después de todos
```

**Orden de ejecución:**
1. Prerequisitos: Tabla de mapeo + Ampliación file upload
2. S0: Equilibrio (motor central, desbloquea todo)
3. S1: Cierre vs CUIPO (depende de S0)
4. S2: Ley 617 (depende de S0 para ICLD)
5. S3: CGA (depende de S0, necesita FUT 2024)
6. S4: Agua Potable (depende de S0, nuevo parser)
7. S5: SGP (mejora incremental)
8. S6: Eficiencia Fiscal (depende de 2 CGN)
9. S7: Mapa Inversiones (independiente, nuevo parser)
10. S8: IDF (depende de S2 y S6)
11. S9: Excel Export (al final)

---

## 16. Archivos nuevos vs. modificados

### Archivos nuevos (11)

| Archivo | Sprint | Propósito |
|---------|--------|-----------|
| `src/data/fuentes-consolidacion.ts` | Pre | Tabla 85 fuentes CUIPO → códigos consolidación |
| `src/data/rubros-cuipo.ts` | Pre | 1,190 rubros CUIPO para validación de códigos |
| `src/data/mapeo-fut-consolidacion.ts` | S1 | Tabla 60 filas FUT → consolidación |
| `src/data/icld-rubros-validos.ts` | S2 | Rubros ICLD válidos + descuentos legales |
| `src/lib/validaciones/cierre-vs-cuipo.ts` | S1 | Lógica de cruce FUT↔CUIPO |
| `src/lib/validaciones/agua-potable.ts` | S4 | Evaluación completa Agua Potable |
| `src/lib/validaciones/mapa-inversiones.ts` | S7 | Cruce BEPIN+MGA |
| `src/components/validador/AguaPotablePanel.tsx` | S4 | Panel Agua Potable completo |
| `src/components/validador/MapaInversionesPanel.tsx` | S7 | Panel Mapa de Inversiones |
| `src/lib/excel-exporter.ts` | S9 | Generación de Excel con trazabilidad |
| `src/components/validador/ExportButton.tsx` | S9 | Botón de descarga Excel |

### Archivos modificados (12)

| Archivo | Sprint | Cambios |
|---------|--------|---------|
| `src/app/api/plataforma/cuipo/route.ts` | S0-S6 | Agregar campos al response, nuevas actions |
| `src/lib/validaciones/ley617.ts` | S2 | ICLD con rubros específicos + descuentos |
| `src/lib/validaciones/sgp.ts` | S5 | Gastos reales, sub-componentes, alertas |
| `src/lib/validaciones/cga.ts` | S3 | 8 chequeos, cross-vigencia, tolerancias |
| `src/lib/validaciones/eficiencia-fiscal.ts` | S6 | Fórmula contable, 2 CGN, umbral 25% |
| `src/lib/validaciones/idf.ts` | S8 | Endeudamiento, crecimiento, catastral |
| `src/lib/chip-parser.ts` | S4,S7 | Nuevos parsers: RP Agua, Mapa Inversiones |
| `src/components/validador/ValidadorDashboard.tsx` | Todos | Nuevos estados, 2 tabs nuevas, file upload ampliado |
| `src/components/validador/FileUploadPanel.tsx` | Pre | 6 slots de upload + inputs manuales |
| `src/components/validador/EquilibrioPanel.tsx` | S0 | Cols nuevas: saldo libros, validador |
| `src/components/validador/Ley617Panel.tsx` | S2 | Desglose ICLD, acciones de mejora |
| `src/components/validador/CGAPanel.tsx` | S3 | 8 chequeos, inputs manuales |

---

## 17. Testing y Validación

### 17.1 Test fixture: Betania

Para cada sprint, crear test con datos de Betania (DANE 05091):
- Extraer valores esperados de la plantilla Excel diligenciada
- Comparar output del módulo contra valores esperados
- Tolerancia: $1 (un peso) para valores monetarios, 0.01% para porcentajes

### 17.2 Segundo municipio de validación

Después de Betania, validar contra otro municipio (idealmente uno grande como Cañasgordas que aparece en la plantilla template).

### 17.3 Script de extracción

Crear `scripts/extract-betania-expected.py`:
- Lee la plantilla Betania con openpyxl (data_only=True)
- Extrae valores esperados por módulo
- Genera JSON fixtures para tests

---

## 18. Infraestructura

### 18.1 Repositorio

- **GitHub:** https://github.com/Cespial/gobia
- **Branch strategy:** `main` + feature branches por sprint (`sprint/s0-equilibrio`, etc.)
- **Deploy:** Vercel → https://gobia.co

### 18.2 Variables de entorno

No se requieren nuevas variables. Los tokens de API son:
- datos.gov.co: anónimo (< 1000 req/hr)
- SICODIS: público, sin auth

### 18.3 Performance

- CUIPO API queries se cachean 24h (datos trimestrales)
- Parseo de Excel es client-side (browser)
- Cálculos de validación son server-side (API route)
- Archivos upload se procesan en browser, datos procesados se envían al API

---

## 19. Fuera de alcance (Fase 2+)

- Seguimiento intra-anual (mensual/trimestral)
- Refrendación histórica (3 años de Contaduría)
- Simulador prospectivo ("si quiere llegar a X indicador...")
- Ranking municipal (posicionamiento relativo)
- Modelos predictivos de ingresos
- Multi-tenant / multi-usuario
- Base de datos persistente (hoy todo es stateless API + browser state)
