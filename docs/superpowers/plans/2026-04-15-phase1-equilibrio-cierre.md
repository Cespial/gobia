# Phase 1: Equilibrio + Cierre vs CUIPO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Equilibrio and Cierre FUT vs CUIPO modules to exact parity with the Excel template, validated against Betania (DANE 05091).

**Architecture:** The Excel template has a static list of 85+ funding sources (fuentes) in its Equilibrio sheet. Each fuente has a consolidation code that maps to FUT Cierre categories. The API already aggregates by funding source dynamically, so we add the consolidation mapping as a static lookup, enrich the equilibrio response with missing fields (validador, presupuesto ingresos), and build the Cierre vs CUIPO cross-reference using that mapping. File uploads are expanded to support FUT Cierre for two years (2024 + 2025).

**Tech Stack:** Next.js 16 App Router, TypeScript, SODA API (datos.gov.co), xlsx parser (client-side)

**Spec:** `docs/superpowers/specs/2026-04-15-validador-fiscal-excel-parity-design.md`

**Test municipality:** Betania, Antioquia — DANE 05091, CHIP code resolved at runtime

---

## File Structure

### New files

| File | Responsibility |
|------|---------------|
| `src/data/fuentes-consolidacion.ts` | Static table: 85 CUIPO fuente codes → consolidation code (1-55) + FUT code mapping |
| `src/data/mapeo-fut-consolidacion.ts` | Static table: 60 FUT codes (C, C.1, ...) → consolidation codes for cross-reference |
| `src/lib/validaciones/cierre-vs-cuipo.ts` | Pure logic: cross-reference FUT Cierre data against equilibrio data using consolidation codes |

### Modified files

| File | Changes |
|------|---------|
| `src/app/api/plataforma/cuipo/route.ts` | Add `validador`, `reservasVigAnterior`, `cxpVigAnterior` to porFuente response; add `consolidacion` field; fix presupuesto ingresos from EJEC_ING top-level row |
| `src/components/validador/ValidadorDashboard.tsx` | Add `futCierre2024` state; expand `EquilibrioData.porFuente` type with new fields; wire Cierre vs CUIPO to use new validation logic |
| `src/components/validador/FileUploadPanel.tsx` | Add second FUT upload slot for vigencia anterior (2024) |
| `src/components/validador/EquilibrioPanel.tsx` | Display new columns: validador, reservas vig ant, CxP vig ant; highlight validador ≠ 0 |
| `src/components/validador/CierreVsCuipoPanel.tsx` | Replace current content with cross-reference table using consolidation mapping |
| `src/components/validador/CGAPanel.tsx` | Wire presupuesto ingresos (now non-zero) into CGA checks 1-2 |

---

## Task 1: Create fuentes-consolidacion static data

**Files:**
- Create: `src/data/fuentes-consolidacion.ts`

This table maps each CUIPO funding source code to a consolidation number. The consolidation number groups multiple CUIPO sources into a single FUT Cierre category (e.g., CUIPO `1.2.1.0.00` + `1.3.3.1.00` both map to consolidation `1`, which is FUT code `C.1.2`).

- [ ] **Step 1: Create the data file**

Create `src/data/fuentes-consolidacion.ts` with the complete mapping extracted from the Excel template. Sources without a consolidation code (empty in Excel) get `null` — they still appear in Equilibrio but don't map to any FUT Cierre row.

```typescript
/**
 * Static mapping: CUIPO funding source codes → consolidation codes
 *
 * Extracted from the Excel template "0. Equilibrio" sheet, columns A-B.
 * The consolidation code groups multiple CUIPO sources into single
 * FUT Cierre categories for cross-referencing.
 *
 * Sources with consolidacion=null appear in Equilibrio but don't
 * map to any FUT Cierre row (typically zero-value sources).
 */

export interface FuenteConsolidacion {
  /** CUIPO funding source code, e.g. "1.2.1.0.00" */
  codigoCuipo: string;
  /** Consolidation group number (1-55), null if not mapped to FUT */
  consolidacion: number | null;
  /** Canonical name from CUIPO */
  nombre: string;
}

export const FUENTES_CONSOLIDACION: FuenteConsolidacion[] = [
  { codigoCuipo: "1.1.0.0.00", consolidacion: null, nombre: "DISPONIBILIDAD INICIAL" },
  { codigoCuipo: "1.2.1.0.00", consolidacion: 1, nombre: "INGRESOS CORRIENTES DE LIBRE DESTINACION" },
  { codigoCuipo: "1.2.2.0.00", consolidacion: 2, nombre: "INGRESOS CORRIENTES DE DESTINACION ESPECIFICA POR ACTO ADMINISTRATIVO" },
  { codigoCuipo: "1.2.3.1.01", consolidacion: 3, nombre: "SOBRETASA - PARTICIPACION AMBIENTAL - CORPORACIONES AUTONOMAS REGIONALES" },
  { codigoCuipo: "1.2.3.1.02", consolidacion: null, nombre: "SOBRETASA AMBIENTAL AREAS METROPOLITANAS" },
  { codigoCuipo: "1.2.3.1.03", consolidacion: null, nombre: "IMPUESTO SOBRE VEHICULOS AUTOMOTORES CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.1.04", consolidacion: null, nombre: "IMPUESTO A GANADORES DE SORTEOS ORDINARIOS Y EXTRAORDINARIOS" },
  { codigoCuipo: "1.2.3.1.05", consolidacion: 4, nombre: "IMPUESTO - SOBRETASA POR EL ALUMBRADO PUBLICO" },
  { codigoCuipo: "1.2.3.1.06", consolidacion: null, nombre: "IMPUESTO DE REGISTRO" },
  { codigoCuipo: "1.2.3.1.07", consolidacion: null, nombre: "IMPUESTO DE LOTERIAS FORANEAS" },
  { codigoCuipo: "1.2.3.1.08", consolidacion: null, nombre: "IMPUESTO AL CONSUMO DE LICORES, VINOS, APERITIVOS Y SIMILARES" },
  { codigoCuipo: "1.2.3.1.09", consolidacion: null, nombre: "IMPUESTO AL CONSUMO DE CERVEZAS, SIFONES, REFAJOS Y MEZCLAS" },
  { codigoCuipo: "1.2.3.1.10", consolidacion: null, nombre: "IMPUESTO AL CONSUMO DE CIGARRILLOS Y TABACO" },
  { codigoCuipo: "1.2.3.1.11", consolidacion: null, nombre: "SOBRETASA FONDO DEPARTAMENTAL DE BOMBEROS" },
  { codigoCuipo: "1.2.3.1.12", consolidacion: 5, nombre: "IMPUESTO DE ESPECTACULOS PUBLICOS NACIONAL CON DESTINO AL DEPORTE" },
  { codigoCuipo: "1.2.3.1.13", consolidacion: null, nombre: "IMPUESTO SOBRE APUESTAS MUTUAS" },
  { codigoCuipo: "1.2.3.1.14", consolidacion: 6, nombre: "SOBRETASA BOMBERIL" },
  { codigoCuipo: "1.2.3.1.15", consolidacion: 7, nombre: "SOBRETASA FONDO DE SEGURIDAD" },
  { codigoCuipo: "1.2.3.1.16", consolidacion: 8, nombre: "IMPUESTO DE TRANSPORTE POR OLEODUCTOS Y GASODUCTOS" },
  { codigoCuipo: "1.2.3.1.17", consolidacion: 9, nombre: "SOBRETASA DE SOLIDARIDAD SERVICIOS PUBLICOS ACUEDUCTO, ASEO Y ALCANTARILLADO" },
  { codigoCuipo: "1.2.3.1.18", consolidacion: 10, nombre: "TASA PRODEPORTE Y RECREACION" },
  { codigoCuipo: "1.2.3.1.19", consolidacion: 11, nombre: "ESTAMPILLAS" },
  { codigoCuipo: "1.2.3.2.01", consolidacion: null, nombre: "CONTRIBUCIONES SOCIALES - SALUD" },
  { codigoCuipo: "1.2.3.2.02", consolidacion: null, nombre: "CONTRIBUCIONES SOCIALES - PENSION" },
  { codigoCuipo: "1.2.3.2.03", consolidacion: null, nombre: "CONTRIBUCIONES SOCIALES - RIESGOS LABORALES" },
  { codigoCuipo: "1.2.3.2.04", consolidacion: null, nombre: "CONTRIBUCIONES SOCIALES - SUBSIDIO FAMILIAR" },
  { codigoCuipo: "1.2.3.2.05", consolidacion: null, nombre: "CONTRIBUCIONES AGROPECUARIAS Y PESQUERAS" },
  { codigoCuipo: "1.2.3.2.06", consolidacion: 12, nombre: "CONTRIBUCION SOBRE CONTRATOS DE OBRA PUBLICA" },
  { codigoCuipo: "1.2.3.2.07", consolidacion: 13, nombre: "CONTRIBUCION DEL SECTOR ELECTRICO" },
  { codigoCuipo: "1.2.3.2.08", consolidacion: null, nombre: "COPAGOS Y CUOTAS MODERADORAS" },
  { codigoCuipo: "1.2.3.2.09", consolidacion: 14, nombre: "OTRAS CONTRIBUCIONES CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.2.10", consolidacion: null, nombre: "TASAS RETRIBUTIVAS" },
  { codigoCuipo: "1.2.3.2.11", consolidacion: null, nombre: "TASAS COMPENSATORIAS" },
  { codigoCuipo: "1.2.3.2.12", consolidacion: null, nombre: "EVALUACION DE LICENCIAS Y TRAMITES AMBIENTALES" },
  { codigoCuipo: "1.2.3.2.13", consolidacion: null, nombre: "SEGUIMIENTO A LICENCIAS Y TRAMITES AMBIENTALES" },
  { codigoCuipo: "1.2.3.2.14", consolidacion: null, nombre: "DERECHO DE INGRESO AREAS PROTEGIDAS" },
  { codigoCuipo: "1.2.3.2.15", consolidacion: null, nombre: "TASA POR EL USO DEL AGUA" },
  { codigoCuipo: "1.2.3.2.16", consolidacion: null, nombre: "TASA POR APROVECHAMIENTO FORESTAL" },
  { codigoCuipo: "1.2.3.2.17", consolidacion: null, nombre: "TASA COMPENSATORIA POR CAZA DE FAUNA SILVESTRE" },
  { codigoCuipo: "1.2.3.2.18", consolidacion: null, nombre: "SOBRETASA AMBIENTAL - PEAJES" },
  { codigoCuipo: "1.2.3.2.19", consolidacion: null, nombre: "TASA COMPENSATORIA POR LA UTILIZACION PERMANENTE DE LA RESERVA FORESTAL PROTECTORA BOSQUE ORIENTAL DE BOGOTA" },
  { codigoCuipo: "1.2.3.2.20", consolidacion: null, nombre: "SALVOCONDUCTO UNICO NACIONAL" },
  { codigoCuipo: "1.2.3.2.21", consolidacion: 15, nombre: "DERECHOS DE TRANSITO" },
  { codigoCuipo: "1.2.3.2.22", consolidacion: 16, nombre: "OTRAS TASAS Y DERECHOS ADMINISTRATIVOS CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.2.23", consolidacion: null, nombre: "MULTAS AMBIENTALES" },
  { codigoCuipo: "1.2.3.2.24", consolidacion: 17, nombre: "MULTAS CODIGO NACIONAL DE POLICIA Y CONVIVENCIA" },
  { codigoCuipo: "1.2.3.2.25", consolidacion: 18, nombre: "OTRAS MULTAS, SANCIONES E INTERESES DE MORA CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.2.26", consolidacion: null, nombre: "DERECHOS ECONOMICOS POR USO DE RECURSOS NATURALES CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.2.27", consolidacion: 19, nombre: "VENTA DE BIENES Y SERVICIOS CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.2.28", consolidacion: 20, nombre: "DERECHOS POR LA EXPLOTACION JUEGOS DE SUERTE Y AZAR" },
  { codigoCuipo: "1.2.3.2.29", consolidacion: null, nombre: "PARTICIPACION Y DERECHOS DE EXPLOTACION DEL EJERCICIO DEL MONOPOLIO DE LICORES DESTILADOS Y ALCOHOLES POTABLES" },
  { codigoCuipo: "1.2.3.3.01", consolidacion: 21, nombre: "PARTICIPACIONES DISTINTAS DEL SGP CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.3.02", consolidacion: 22, nombre: "COMPENSACIONES DE INGRESOS TRIBUTARIOS Y NO TRIBUTARIOS CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.3.03", consolidacion: null, nombre: "APORTES NACION - ALIMENTACION ESCOLAR" },
  { codigoCuipo: "1.2.3.3.04", consolidacion: 23, nombre: "OTRAS TRANSFERENCIAS CORRIENTES DE OTRAS ENTIDADES CON DESTINACION ESPECIFICA LEGAL DEL GOBIERNO GENERAL" },
  { codigoCuipo: "1.2.3.3.05", consolidacion: 24, nombre: "SUBVENCIONES CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.3.06", consolidacion: 25, nombre: "DIFERENTES DE SUBVENCIONES CON DESTINACION ESPECIFICA LEGAL" },
  { codigoCuipo: "1.2.3.3.07", consolidacion: null, nombre: "SISTEMA GENERAL DE SEGURIDAD SOCIAL EN SALUD - OTROS RECURSOS ADMINISTRADOS POR ADRES" },
  { codigoCuipo: "1.2.3.3.08", consolidacion: null, nombre: "SISTEMA GENERAL DE SEGURIDAD SOCIAL EN SALUD - RECURSOS DE ENTIDADES TERRITORIALES" },
  { codigoCuipo: "1.2.3.3.09", consolidacion: null, nombre: "SISTEMA GENERAL DE SEGURIDAD SOCIAL EN SALUD - RECURSOS DE CAJAS DE COMPENSACION" },
  { codigoCuipo: "1.2.3.3.10", consolidacion: null, nombre: "SISTEMA GENERAL DE SEGURIDAD SOCIAL EN SALUD - FONDOS ESPECIALES DEL MINISTERIO DE SALUD Y PROTECCION SOCIAL" },
  { codigoCuipo: "1.2.3.3.11", consolidacion: null, nombre: "SISTEMA GENERAL DE SEGURIDAD SOCIAL EN SALUD - RECURSOS DE LA COMPENSACION DEL RC" },
  { codigoCuipo: "1.2.3.3.12", consolidacion: 26, nombre: "SISTEMA GENERAL DE SEGURIDAD SOCIAL EN SALUD - RECURSOS DE LA UPC RS" },
  { codigoCuipo: "1.2.3.3.13", consolidacion: null, nombre: "SISTEMA GENERAL DE SEGURIDAD SOCIAL EN SALUD - SERVICIOS Y TECNOLOGIAS NO FINANCIADOS CON UPC" },
  { codigoCuipo: "1.2.3.3.14", consolidacion: null, nombre: "SISTEMA GENERAL DE PENSIONES - CUOTAS PARTES PENSIONALES" },
  { codigoCuipo: "1.2.3.3.15", consolidacion: null, nombre: "SISTEMA GENERAL DE PENSIONES - OTROS" },
  { codigoCuipo: "1.2.3.3.16", consolidacion: null, nombre: "SISTEMA GENERAL DE RIESGOS LABORALES" },
  { codigoCuipo: "1.2.3.3.17", consolidacion: 27, nombre: "SENTENCIAS Y CONCILIACIONES" },
  { codigoCuipo: "1.2.3.3.18", consolidacion: 28, nombre: "INDEMNIZACIONES RELACIONADAS CON SEGUROS NO DE VIDA" },
  { codigoCuipo: "1.2.3.4.01", consolidacion: null, nombre: "ICLD DEPARTAMENTOS PARA FONPET" },
  { codigoCuipo: "1.2.3.4.02", consolidacion: 29, nombre: "ICLD LEY 99 - DESTINO AMBIENTAL" },
  { codigoCuipo: "1.2.3.4.03", consolidacion: null, nombre: "SAN ANDRES CON DESTINO A PROVIDENCIA" },
  // SGP sources
  { codigoCuipo: "1.2.4.1.01", consolidacion: null, nombre: "SGP-EDUCACION-PRESTACION DE SERVICIOS" },
  { codigoCuipo: "1.2.4.1.02", consolidacion: null, nombre: "SGP-EDUCACION-CANCELACION DE PRESTACIONES SOCIALES DEL MAGISTERIO" },
  { codigoCuipo: "1.2.4.1.03", consolidacion: 30, nombre: "SGP-EDUCACION-CALIDAD POR MATRICULA OFICIAL" },
  { codigoCuipo: "1.2.4.1.04", consolidacion: 31, nombre: "SGP-EDUCACION-CALIDAD POR GRATUIDAD" },
  { codigoCuipo: "1.2.4.2.01", consolidacion: 32, nombre: "SGP-SALUD-REGIMEN SUBSIDIADO" },
  { codigoCuipo: "1.2.4.2.02", consolidacion: 33, nombre: "SGP-SALUD-SALUD PUBLICA" },
  { codigoCuipo: "1.2.4.2.03", consolidacion: 34, nombre: "SGP-SALUD-PRESTACION DEL SERVICIO DE SALUD" },
  { codigoCuipo: "1.2.4.2.04", consolidacion: 35, nombre: "SGP-SALUD-SUBSIDIO A LA OFERTA" },
  { codigoCuipo: "1.2.4.3.01", consolidacion: 36, nombre: "SGP-PROPOSITO GENERAL-DEPORTE Y RECREACION" },
  { codigoCuipo: "1.2.4.3.02", consolidacion: 37, nombre: "SGP-PROPOSITO GENERAL-CULTURA" },
  { codigoCuipo: "1.2.4.3.03", consolidacion: 38, nombre: "SGP-PROPOSITO GENERAL-PROPOSITO GENERAL LIBRE INVERSION" },
  { codigoCuipo: "1.2.4.3.04", consolidacion: 55, nombre: "SGP-PROPOSITO GENERAL-LIBRE DESTINACION MUNICIPIOS CATEGORIAS 4, 5 Y 6" },
  { codigoCuipo: "1.2.4.4.01", consolidacion: 40, nombre: "SGP-ASIGNACION ESPECIAL-PROGRAMAS DE ALIMENTACION ESCOLAR" },
  { codigoCuipo: "1.2.4.4.02", consolidacion: 41, nombre: "SGP-ASIGNACION ESPECIAL-MUNICIPIOS DE LA RIBERA DEL RIO MAGDALENA" },
  { codigoCuipo: "1.2.4.4.03", consolidacion: 42, nombre: "SGP-ASIGNACION-ATENCION INTEGRAL DE LA PRIMERA INFANCIA" },
  { codigoCuipo: "1.2.4.6.00", consolidacion: 43, nombre: "SGP-AGUA POTABLE Y SANEAMIENTO BASICO" },
  { codigoCuipo: "1.2.5.1.00", consolidacion: null, nombre: "RECURSOS PROPIOS DE ESTABLECIMIENTOS PUBLICOS O UNIDADES ADMINISTRATIVAS ESPECIALES" },
  // Capital resources
  { codigoCuipo: "1.3.1.1.01", consolidacion: 44, nombre: "DISPOSICION DE ACTIVOS" },
  { codigoCuipo: "1.3.1.1.02", consolidacion: 45, nombre: "EXCEDENTES FINANCIEROS" },
  { codigoCuipo: "1.3.1.1.03", consolidacion: 46, nombre: "DIVIDENDOS Y UTILIDADES POR OTRAS INVERSIONES DE CAPITAL" },
  { codigoCuipo: "1.3.1.1.04", consolidacion: null, nombre: "RECURSOS DE CREDITO EXTERNO" },
  { codigoCuipo: "1.3.1.1.05", consolidacion: 47, nombre: "RECURSOS DE CREDITO INTERNO" },
  { codigoCuipo: "1.3.1.1.06", consolidacion: 48, nombre: "DONACIONES" },
  { codigoCuipo: "1.3.1.1.07", consolidacion: 49, nombre: "TRANSFERENCIAS DE CAPITAL DE OTRAS ENTIDADES DEL GOBIERNO GENERAL" },
  { codigoCuipo: "1.3.1.1.08", consolidacion: 50, nombre: "OTRAS TRANSFERENCIAS DE CAPITAL" },
  { codigoCuipo: "1.3.1.1.09", consolidacion: 51, nombre: "RECUPERACION DE CARTERA - PRESTAMOS" },
  { codigoCuipo: "1.3.1.1.10", consolidacion: 52, nombre: "RETIROS FONPET" },
  { codigoCuipo: "1.3.1.1.11", consolidacion: 53, nombre: "REINTEGROS Y OTROS RECURSOS NO APROPIADOS" },
  { codigoCuipo: "1.3.1.1.12", consolidacion: 54, nombre: "RECURSOS DE TERCEROS" },
  { codigoCuipo: "1.3.1.1.13", consolidacion: null, nombre: "CAPITALIZACIONES" },
  // Rendimientos financieros (R.F.) — map to same consolidation as their parent source
  { codigoCuipo: "1.3.2.1.01", consolidacion: 3, nombre: "R.F. SOBRETASA - PARTICIPACION AMBIENTAL" },
  { codigoCuipo: "1.3.2.1.07", consolidacion: 13, nombre: "R.F. CONTRIBUCION DEL SECTOR ELECTRICO" },
  { codigoCuipo: "1.3.2.1.09", consolidacion: 14, nombre: "R.F. DE OTRAS CONTRIBUCIONES" },
  { codigoCuipo: "1.3.2.1.21", consolidacion: 15, nombre: "R.F. DERECHOS DE TRANSITO" },
  { codigoCuipo: "1.3.2.1.22", consolidacion: 16, nombre: "R.F. DE OTRAS TASAS Y DERECHOS ADMINISTRATIVOS" },
  { codigoCuipo: "1.3.2.2.03", consolidacion: 30, nombre: "R.F. SGP - EDUCACION-CALIDAD POR MATRICULA OFICIAL" },
  { codigoCuipo: "1.3.2.2.04", consolidacion: 31, nombre: "R.F. SGP - EDUCACION-CALIDAD POR GRATUIDAD" },
  { codigoCuipo: "1.3.2.2.05", consolidacion: 32, nombre: "R.F. SGP - SALUD-REGIMEN SUBSIDIADO" },
  { codigoCuipo: "1.3.2.2.06", consolidacion: 33, nombre: "R.F. SGP - SALUD-SALUD PUBLICA" },
  { codigoCuipo: "1.3.2.2.07", consolidacion: 34, nombre: "R.F. SGP - SALUD-PRESTACION DEL SERVICIO DE SALUD" },
  { codigoCuipo: "1.3.2.2.09", consolidacion: 40, nombre: "R.F. SGP - ASIGNACION ESPECIAL-PROGRAMAS DE ALIMENTACION ESCOLAR" },
  { codigoCuipo: "1.3.2.2.10", consolidacion: 41, nombre: "R.F. SGP - ASIGNACION ESPECIAL-MUNICIPIOS RIBERA RIO MAGDALENA" },
  { codigoCuipo: "1.3.2.2.11", consolidacion: 42, nombre: "R.F. SGP - ASIGNACION-ATENCION INTEGRAL PRIMERA INFANCIA" },
  { codigoCuipo: "1.3.2.2.13", consolidacion: 43, nombre: "R.F. SGP - AGUA POTABLE Y SANEAMIENTO BASICO" },
  { codigoCuipo: "1.3.2.3.01", consolidacion: 21, nombre: "R.F. DISTINTOS AL SGP" },
  // Recursos del balance (R.B.) — same consolidation as parent
  { codigoCuipo: "1.3.3.1.00", consolidacion: 1, nombre: "RECURSOS DEL BALANCE DE LIBRE DESTINACION" },
  { codigoCuipo: "1.3.3.2.00", consolidacion: 2, nombre: "RECURSOS DEL BALANCE DE DESTINACION ESPECIFICA POR ACTO ADMINISTRATIVO" },
  { codigoCuipo: "1.3.3.3.01", consolidacion: 3, nombre: "R.B. SOBRETASA - PARTICIPACION AMBIENTAL" },
  { codigoCuipo: "1.3.3.3.05", consolidacion: 4, nombre: "R.B. SOBRETASA POR EL ALUMBRADO PUBLICO" },
  { codigoCuipo: "1.3.3.3.12", consolidacion: 5, nombre: "R.B. IMPUESTO DE ESPECTACULOS PUBLICOS NACIONAL" },
  { codigoCuipo: "1.3.3.3.14", consolidacion: 4, nombre: "R.B. IMPUESTO DE ALUMBRADO PUBLICO" },
  { codigoCuipo: "1.3.3.3.15", consolidacion: 6, nombre: "R.B. SOBRETASA BOMBERIL" },
  { codigoCuipo: "1.3.3.3.16", consolidacion: 7, nombre: "R.B. SOBRETASA FONDO DE SEGURIDAD" },
  { codigoCuipo: "1.3.3.3.17", consolidacion: 8, nombre: "R.B. IMPUESTO DE TRANSPORTE POR OLEODUCTOS Y GASODUCTOS" },
  { codigoCuipo: "1.3.3.3.18", consolidacion: 9, nombre: "R.B. SOBRETASA DE SOLIDARIDAD SERVICIOS PUBLICOS" },
  { codigoCuipo: "1.3.3.3.19", consolidacion: 10, nombre: "R.B. TASA PRO DEPORTE" },
  { codigoCuipo: "1.3.3.3.20", consolidacion: 11, nombre: "R.B. ESTAMPILLAS" },
  { codigoCuipo: "1.3.3.4.01", consolidacion: 12, nombre: "R.B. CONTRIBUCION SOBRE CONTRATOS DE OBRA PUBLICA" },
  { codigoCuipo: "1.3.3.4.02", consolidacion: 13, nombre: "R.B. CONTRIBUCION DEL SECTOR ELECTRICO" },
  { codigoCuipo: "1.3.3.4.03", consolidacion: 14, nombre: "R.B. OTRAS CONTRIBUCIONES" },
  { codigoCuipo: "1.3.3.4.15", consolidacion: 15, nombre: "R.B. DERECHOS DE TRANSITO" },
  { codigoCuipo: "1.3.3.4.16", consolidacion: 16, nombre: "R.B. OTRAS TASAS Y DERECHOS ADMINISTRATIVOS" },
  { codigoCuipo: "1.3.3.4.17", consolidacion: 17, nombre: "R.B. MULTAS CODIGO NACIONAL DE POLICIA Y CONVIVENCIA" },
  { codigoCuipo: "1.3.3.4.19", consolidacion: 18, nombre: "R.B. OTRAS MULTAS, SANCIONES E INTERESES DE MORA" },
  { codigoCuipo: "1.3.3.4.21", consolidacion: 19, nombre: "R.B. VENTA DE BIENES Y SERVICIOS" },
  { codigoCuipo: "1.3.3.4.22", consolidacion: 20, nombre: "R.B. DERECHOS POR LA EXPLOTACION JUEGOS DE SUERTE Y AZAR" },
  { codigoCuipo: "1.3.3.5.01", consolidacion: 21, nombre: "R.B. PARTICIPACIONES DISTINTAS DEL SGP" },
  { codigoCuipo: "1.3.3.5.02", consolidacion: 22, nombre: "R.B. COMPENSACIONES DE INGRESOS TRIBUTARIOS Y NO TRIBUTARIOS" },
  { codigoCuipo: "1.3.3.5.04", consolidacion: 23, nombre: "R.B. OTRAS TRANSFERENCIAS CORRIENTES DEL GOBIERNO GENERAL" },
  { codigoCuipo: "1.3.3.5.05", consolidacion: 24, nombre: "R.B. SUBVENCIONES" },
  { codigoCuipo: "1.3.3.5.06", consolidacion: 25, nombre: "R.B. DIFERENTES DE SUBVENCIONES" },
  { codigoCuipo: "1.3.3.5.10", consolidacion: 27, nombre: "R.B. SENTENCIAS Y CONCILIACIONES" },
  { codigoCuipo: "1.3.3.6.03", consolidacion: 30, nombre: "R.B. SGP-EDUCACION-CALIDAD POR MATRICULA OFICIAL" },
  { codigoCuipo: "1.3.3.6.04", consolidacion: 31, nombre: "R.B. SGP-EDUCACION-CALIDAD POR GRATUIDAD" },
  { codigoCuipo: "1.3.3.7.01", consolidacion: 32, nombre: "R.B. SGP-SALUD-REGIMEN SUBSIDIADO" },
  { codigoCuipo: "1.3.3.7.02", consolidacion: 33, nombre: "R.B. SGP-SALUD-SALUD PUBLICA" },
  { codigoCuipo: "1.3.3.7.03", consolidacion: 34, nombre: "R.B. SGP-SALUD-PRESTACION DEL SERVICIO DE SALUD" },
  { codigoCuipo: "1.3.3.7.04", consolidacion: 35, nombre: "R.B. SGP-SALUD-SUBSIDIO A LA OFERTA" },
  { codigoCuipo: "1.3.3.8.01", consolidacion: 36, nombre: "R.B. SGP-PROPOSITO GENERAL-DEPORTE Y RECREACION" },
  { codigoCuipo: "1.3.3.8.02", consolidacion: 37, nombre: "R.B. SGP-PROPOSITO GENERAL-CULTURA" },
  { codigoCuipo: "1.3.3.8.03", consolidacion: 38, nombre: "R.B. SGP-PROPOSITO GENERAL-LIBRE INVERSION" },
  { codigoCuipo: "1.3.3.8.04", consolidacion: 55, nombre: "R.B. SGP-PROPOSITO GENERAL-LIBRE DESTINACION MUNICIPIOS CATEGORIAS 4, 5 Y 6" },
  { codigoCuipo: "1.3.3.9.01", consolidacion: 40, nombre: "R.B. SGP-ASIGNACION ESPECIAL-PROGRAMAS DE ALIMENTACION ESCOLAR" },
  { codigoCuipo: "1.3.3.9.02", consolidacion: 41, nombre: "R.B. SGP-ASIGNACION ESPECIAL-MUNICIPIOS RIBERA RIO MAGDALENA" },
  { codigoCuipo: "1.3.3.9.03", consolidacion: 42, nombre: "R.B. SGP-ASIGNACION-ATENCION INTEGRAL PRIMERA INFANCIA" },
  { codigoCuipo: "1.3.3.10.00", consolidacion: 43, nombre: "R.B. SGP-AGUA POTABLE Y SANEAMIENTO BASICO" },
  { codigoCuipo: "1.3.3.11.01", consolidacion: 44, nombre: "R.B. DISPOSICION DE ACTIVOS" },
  { codigoCuipo: "1.3.3.11.02", consolidacion: 45, nombre: "R.B. EXCEDENTES FINANCIEROS" },
  { codigoCuipo: "1.3.3.11.03", consolidacion: 46, nombre: "R.B. DIVIDENDOS Y UTILIDADES" },
  { codigoCuipo: "1.3.3.11.05", consolidacion: 47, nombre: "R.B. RECURSOS DE CREDITO INTERNO" },
  { codigoCuipo: "1.3.3.11.06", consolidacion: 48, nombre: "R.B. DONACIONES" },
  { codigoCuipo: "1.3.3.11.07", consolidacion: 49, nombre: "R.B. TRANSFERENCIAS DE CAPITAL DEL GOBIERNO GENERAL" },
  { codigoCuipo: "1.3.3.11.08", consolidacion: 50, nombre: "R.B. OTRAS TRANSFERENCIAS DE CAPITAL" },
  { codigoCuipo: "1.3.3.11.09", consolidacion: 51, nombre: "R.B. RECUPERACION DE CARTERA - PRESTAMOS" },
  { codigoCuipo: "1.3.3.11.10", consolidacion: 52, nombre: "R.B. RETIROS FONPET" },
  { codigoCuipo: "1.3.3.11.11", consolidacion: 53, nombre: "R.B. REINTEGROS Y OTROS RECURSOS NO APROPIADOS" },
];

/** Lookup consolidacion code by CUIPO funding source code */
const consolidacionByCuipo = new Map(
  FUENTES_CONSOLIDACION
    .filter((f) => f.consolidacion !== null)
    .map((f) => [f.codigoCuipo, f.consolidacion as number])
);

/** Returns the consolidation code for a CUIPO funding source code, or null */
export function getConsolidacion(codigoCuipo: string): number | null {
  return consolidacionByCuipo.get(codigoCuipo.trim()) ?? null;
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd '/Users/cristianespinal/Claude Code/Projects/gobia.co' && npx tsc --noEmit src/data/fuentes-consolidacion.ts 2>&1 | head -20`

Expected: No errors (or only unrelated errors from other files). If `tsc --noEmit` on a single file doesn't work, run `npm run build` and check for errors in the new file.

- [ ] **Step 3: Commit**

```bash
git add src/data/fuentes-consolidacion.ts
git commit -m "feat: add CUIPO→consolidation static mapping (85 sources)"
```

---

## Task 2: Create FUT-to-consolidation mapping table

**Files:**
- Create: `src/data/mapeo-fut-consolidacion.ts`

This table maps FUT Cierre Fiscal codes (C, C.1, C.1.1, etc.) to consolidation group numbers, enabling the cross-reference between FUT and Equilibrio data.

- [ ] **Step 1: Create the mapping file**

```typescript
/**
 * Maps FUT Cierre Fiscal codes to consolidation group numbers.
 *
 * Used by Cierre vs CUIPO validation: for each FUT row, SUMIF
 * the Equilibrio data where consolidacion matches this mapping.
 *
 * FUT rows with consolidacion=null are parent/summary rows
 * that don't directly map to equilibrio data (e.g., "C.2" is
 * a heading for "RECURSOS CON DESTINACIÓN ESPECÍFICA").
 */

export interface MapeoFUT {
  /** FUT Cierre code, e.g. "C.1.2" */
  codigoFUT: string;
  /** Consolidation group number(s) to sum from Equilibrio */
  consolidacion: number | number[] | null;
  /** Description from FUT */
  nombre: string;
  /** Indentation level for display (0=total, 1=section, 2=subsection, etc.) */
  nivel: number;
}

export const MAPEO_FUT: MapeoFUT[] = [
  { codigoFUT: "C", consolidacion: null, nombre: "TOTAL", nivel: 0 },
  { codigoFUT: "C.1", consolidacion: null, nombre: "RECURSOS CORRIENTES DE LIBRE DESTINACIÓN", nivel: 1 },
  { codigoFUT: "C.1.1", consolidacion: 55, nombre: "SGP-PROPÓSITO GENERAL-LIBRE DESTINACIÓN MUNICIPIOS CATEGORÍAS 4, 5 Y 6", nivel: 2 },
  { codigoFUT: "C.1.2", consolidacion: 1, nombre: "INGRESOS TRIBUTARIOS Y NO TRIBUTARIOS DE LIBRE DESTINACIÓN", nivel: 2 },
  { codigoFUT: "C.2", consolidacion: null, nombre: "RECURSOS CON DESTINACIÓN ESPECÍFICA", nivel: 1 },
  { codigoFUT: "C.2.1", consolidacion: 29, nombre: "RECURSOS TRIBUTARIOS Y NO TRIBUTARIOS CON DESTINACIÓN ESPECÍFICA POR ACTO ADMON", nivel: 2 },
  { codigoFUT: "C.2.2", consolidacion: null, nombre: "RECURSOS TRIBUTARIOS Y NO TRIBUTARIOS CON DESTINACIÓN ESPECÍFICA CONSTITUCIONAL LEGAL", nivel: 2 },
  { codigoFUT: "C.2.2.1", consolidacion: 3, nombre: "SOBRETASA AMBIENTAL / PARTICIPACIÓN AMBIENTAL", nivel: 3 },
  { codigoFUT: "C.2.2.2", consolidacion: 11, nombre: "ESTAMPILLAS", nivel: 3 },
  { codigoFUT: "C.2.2.3", consolidacion: 13, nombre: "CONTRIBUCIONES", nivel: 3 },
  { codigoFUT: "C.2.2.4", consolidacion: null, nombre: "TASAS Y DERECHOS ADMINISTRATIVOS CON DESTINACIÓN ESPECÍFICA LEGAL", nivel: 3 },
  { codigoFUT: "C.2.2.5", consolidacion: null, nombre: "MULTAS, SANCIONES E INTERESES DE MORA CON DESTINACIÓN ESPECÍFICA LEGAL", nivel: 3 },
  { codigoFUT: "C.2.2.6", consolidacion: 19, nombre: "VENTA DE BIENES Y SERVICIOS CON DESTINACIÓN ESPECÍFICA LEGAL", nivel: 3 },
  { codigoFUT: "C.2.3", consolidacion: null, nombre: "TRANSFERENCIAS CORRIENTES DIFERENTES AL SGP CON DESTINACIÓN ESPECÍFICA", nivel: 2 },
  { codigoFUT: "C.2.3.1", consolidacion: 21, nombre: "PARTICIPACIONES DISTINTAS DEL SGP", nivel: 3 },
  { codigoFUT: "C.2.3.2", consolidacion: null, nombre: "APORTES NACIÓN - ALIMENTACIÓN ESCOLAR", nivel: 3 },
  { codigoFUT: "C.2.3.3", consolidacion: 23, nombre: "DEMÁS TRANSFERENCIAS CORRIENTES DE OTRAS ENTIDADES DEL GOBIERNO GENERAL", nivel: 3 },
  { codigoFUT: "C.2.4", consolidacion: null, nombre: "SISTEMA GENERAL DE PARTICIPACIONES - CUENTAS MAESTRAS", nivel: 2 },
  { codigoFUT: "C.2.4.1", consolidacion: null, nombre: "SGP-EDUCACIÓN-PRESTACIÓN DE SERVICIOS", nivel: 3 },
  { codigoFUT: "C.2.4.2", consolidacion: null, nombre: "SGP-EDUCACIÓN-CANCELACIÓN DE PRESTACIONES SOCIALES DEL MAGISTERIO", nivel: 3 },
  { codigoFUT: "C.2.4.3", consolidacion: 30, nombre: "SGP-EDUCACIÓN-CALIDAD POR MATRÍCULA OFICIAL", nivel: 3 },
  { codigoFUT: "C.2.4.4", consolidacion: 36, nombre: "SGP-PROPÓSITO GENERAL-DEPORTE Y RECREACIÓN", nivel: 3 },
  { codigoFUT: "C.2.4.5", consolidacion: 37, nombre: "SGP-PROPÓSITO GENERAL-CULTURA", nivel: 3 },
  { codigoFUT: "C.2.4.6", consolidacion: 38, nombre: "SGP-PROPÓSITO GENERAL-LIBRE INVERSIÓN", nivel: 3 },
  { codigoFUT: "C.2.4.7", consolidacion: 40, nombre: "SGP-ASIGNACIÓN ESPECIAL-PROGRAMAS DE ALIMENTACIÓN ESCOLAR", nivel: 3 },
  { codigoFUT: "C.2.4.8", consolidacion: 41, nombre: "SGP-ASIGNACIÓN ESPECIAL-MUNICIPIOS RIBERA RÍO MAGDALENA", nivel: 3 },
  { codigoFUT: "C.2.4.9", consolidacion: 42, nombre: "SGP-ASIGNACIÓN-ATENCIÓN INTEGRAL PRIMERA INFANCIA", nivel: 3 },
  { codigoFUT: "C.2.4.10", consolidacion: 43, nombre: "SGP-AGUA POTABLE Y SANEAMIENTO BÁSICO", nivel: 3 },
  { codigoFUT: "C.2.5", consolidacion: null, nombre: "RECURSOS DE CAPITAL", nivel: 2 },
  { codigoFUT: "C.2.5.1", consolidacion: null, nombre: "RECURSOS DE CRÉDITO EXTERNO", nivel: 3 },
  { codigoFUT: "C.2.5.2", consolidacion: 47, nombre: "RECURSOS DE CRÉDITO INTERNO", nivel: 3 },
  { codigoFUT: "C.2.5.3", consolidacion: 48, nombre: "DONACIONES", nivel: 3 },
  { codigoFUT: "C.2.5.4", consolidacion: 52, nombre: "RETIROS FONPET", nivel: 3 },
  { codigoFUT: "C.2.5.5", consolidacion: null, nombre: "TRANSFERENCIAS DE CAPITAL", nivel: 3 },
  { codigoFUT: "C.2.5.6", consolidacion: null, nombre: "DEMÁS RECURSOS DE CAPITAL", nivel: 3 },
  { codigoFUT: "C.3", consolidacion: null, nombre: "FONDOS ESPECIALES", nivel: 1 },
  { codigoFUT: "C.3.1", consolidacion: null, nombre: "FONDO LOCAL DE SALUD", nivel: 2 },
  { codigoFUT: "C.3.1.1", consolidacion: 32, nombre: "CUENTA MAESTRA RÉGIMEN SUBSIDIADO", nivel: 3 },
  { codigoFUT: "C.3.1.2", consolidacion: 33, nombre: "CUENTA MAESTRA SALUD PÚBLICA COLECTIVA", nivel: 3 },
  { codigoFUT: "C.3.1.3", consolidacion: null, nombre: "CUENTA MAESTRA PRESTACIÓN DEL SERVICIO OFERTA", nivel: 3 },
  { codigoFUT: "C.3.1.4", consolidacion: null, nombre: "CUENTA MAESTRA OTROS GASTOS EN SALUD INVERSIÓN", nivel: 3 },
  { codigoFUT: "C.3.1.5", consolidacion: 20, nombre: "CUENTA OTROS GASTOS SALUD FUNCIONAMIENTO", nivel: 3 },
  { codigoFUT: "C.3.3", consolidacion: 12, nombre: "FONDO DE SEGURIDAD Y CONVIVENCIA CIUDADANA", nivel: 2 },
  { codigoFUT: "C.3.4", consolidacion: 2, nombre: "FONDO DE GESTIÓN DEL RIESGO", nivel: 2 },
  { codigoFUT: "C.4", consolidacion: null, nombre: "SALDOS EN PATRIMONIOS AUTONOMOS Y/O ENCARGOS FIDUCIARIOS PASIVO PENSIONAL", nivel: 1 },
];

/** Build a lookup: consolidation code → FUT code */
const futByConsolidacion = new Map<number, string>();
for (const m of MAPEO_FUT) {
  if (m.consolidacion !== null) {
    const codes = Array.isArray(m.consolidacion) ? m.consolidacion : [m.consolidacion];
    for (const c of codes) {
      futByConsolidacion.set(c, m.codigoFUT);
    }
  }
}

export function getFUTCode(consolidacion: number): string | null {
  return futByConsolidacion.get(consolidacion) ?? null;
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd '/Users/cristianespinal/Claude Code/Projects/gobia.co' && npm run build 2>&1 | tail -5`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/data/mapeo-fut-consolidacion.ts
git commit -m "feat: add FUT→consolidation mapping table (60 FUT codes)"
```

---

## Task 3: Enrich equilibrio API response with consolidacion + validador + presupuesto ingresos

**Files:**
- Modify: `src/app/api/plataforma/cuipo/route.ts` (lines 58-175, equilibrio action)

The API already calculates `saldoEnLibros`, `reservas`, `cxp` per fuente. We need to:
1. Add `consolidacion` code to each fuente (from the static mapping)
2. Add `validador` field (compromisos - pagos - reservas - cxp, should be 0)
3. Add `reservasVigAnterior` and `cxpVigAnterior` (already computed internally but not exposed)
4. Fix presupuesto ingresos by fetching from the EJEC_ING top-level row (cuenta='1')

- [ ] **Step 1: Add import for consolidation lookup**

At the top of `src/app/api/plataforma/cuipo/route.ts`, add:

```typescript
import { getConsolidacion } from "@/data/fuentes-consolidacion";
```

- [ ] **Step 2: Add presupuesto ingresos fetch**

In the equilibrio case (around line 46), add a 4th parallel fetch for income programming from the EJEC_ING top-level row:

Replace the existing `Promise.all` (lines 46-55) with:

```typescript
        const [ingresos, gastos, progGasTotals, progIngTotals] = await Promise.all([
          fetchIngresosPorFuente(chipCode, periodo),
          fetchGastosPorFuente(chipCode, periodo),
          sodaCuipoQuery<{ apropiacion_inicial: string; apropiacion_definitiva: string }>({
            dataset: CUIPO_DATASETS.PROG_GASTOS,
            select: "sum(apropiacion_inicial) as apropiacion_inicial, sum(apropiacion_definitiva) as apropiacion_definitiva",
            where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta='2' AND cod_vigencia_del_gasto='1'`,
            limit: 1,
          }),
          // Fetch income programming from EJEC_ING top-level row (cuenta='1')
          // which has presupuesto_inicial and presupuesto_definitivo
          sodaCuipoQuery<{ presupuesto_inicial: string; presupuesto_definitivo: string }>({
            dataset: CUIPO_DATASETS.EJEC_INGRESOS,
            select: "presupuesto_inicial, presupuesto_definitivo",
            where: `codigo_entidad='${chipCode}' AND periodo='${periodo}' AND cuenta='1'`,
            limit: 1,
          }),
        ]);
```

- [ ] **Step 3: Enrich porFuente with consolidacion, validador, vig anterior fields**

Replace the porFuente mapping (lines 121-141) with:

```typescript
        const porFuente = Array.from(fuenteMap.values()).map((f) => {
          const reservas_va = Math.max(0, f.compromisos_va - f.obligaciones_va);
          const cxp_va = Math.max(0, f.obligaciones_va - f.pagos_va);
          const superavit = f.recaudo - f.compromisos_va;
          const reservasVigAnterior = Math.max(0, f.compromisos_res - f.pagos_res);
          const cxpVigAnterior = Math.max(0, f.compromisos_cxp - f.pagos_cxp);
          const saldoEnLibros = Math.max(0, superavit) + reservas_va + cxp_va + reservasVigAnterior + cxpVigAnterior;
          // Validador: should be 0 if data is consistent
          const validador = f.compromisos_va - f.pagos_va - reservas_va - cxp_va;

          return {
            codigo: f.codigo,
            nombre: f.nombre,
            consolidacion: getConsolidacion(f.codigo),
            recaudo: f.recaudo,
            compromisos: f.compromisos_va,
            obligaciones: f.obligaciones_va,
            pagos: f.pagos_va,
            reservas: reservas_va,
            cxp: cxp_va,
            superavit,
            validador,
            reservasVigAnterior,
            cxpVigAnterior,
            saldoEnLibros,
          };
        });
```

- [ ] **Step 4: Fix presupuesto ingresos in the response**

Replace the presupuesto section (lines 153-161) with:

```typescript
        const pptoInicialGastos = parseFloat(progGasTotals[0]?.apropiacion_inicial || "0");
        const pptoDefinitivoGastos = parseFloat(progGasTotals[0]?.apropiacion_definitiva || "0");
        const pptoInicialIngresos = parseFloat(progIngTotals[0]?.presupuesto_inicial || "0");
        const pptoDefinitivoIngresos = parseFloat(progIngTotals[0]?.presupuesto_definitivo || "0");
        const equilibrioInicial = pptoInicialIngresos - pptoInicialGastos;
        const equilibrioDefinitivo = pptoDefinitivoIngresos - pptoDefinitivoGastos;
```

- [ ] **Step 5: Add totalReservasVigAnterior and totalCxpVigAnterior to response**

After the existing totals (around line 151), add:

```typescript
        const totalReservasVigAnterior = porFuente.reduce((s, f) => s + f.reservasVigAnterior, 0);
        const totalCxpVigAnterior = porFuente.reduce((s, f) => s + f.cxpVigAnterior, 0);
        const totalValidador = porFuente.reduce((s, f) => s + f.validador, 0);
```

Then add these to the JSON response object:

```typescript
            totalReservasVigAnterior,
            totalCxpVigAnterior,
            totalValidador,
```

- [ ] **Step 6: Verify build**

Run: `cd '/Users/cristianespinal/Claude Code/Projects/gobia.co' && npm run build 2>&1 | tail -10`

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/plataforma/cuipo/route.ts
git commit -m "feat: enrich equilibrio response with consolidacion, validador, presupuesto ingresos"
```

---

## Task 4: Update EquilibrioPanel to show new fields

**Files:**
- Modify: `src/components/validador/ValidadorDashboard.tsx` (EquilibrioData type)
- Modify: `src/components/validador/EquilibrioPanel.tsx`

- [ ] **Step 1: Update EquilibrioData type in ValidadorDashboard.tsx**

Find the `EquilibrioData` interface (around line 45) and update the `porFuente` type to include new fields:

```typescript
  porFuente: {
    codigo: string;
    nombre: string;
    consolidacion: number | null;
    recaudo: number;
    compromisos: number;
    obligaciones: number;
    pagos: number;
    reservas: number;
    cxp: number;
    superavit: number;
    validador: number;
    reservasVigAnterior: number;
    cxpVigAnterior: number;
    saldoEnLibros: number;
  }[];
```

Also add to the top-level fields:

```typescript
  totalReservasVigAnterior?: number;
  totalCxpVigAnterior?: number;
  totalValidador?: number;
```

- [ ] **Step 2: Add new columns to EquilibrioPanel table**

In `src/components/validador/EquilibrioPanel.tsx`, add columns for:
- `Validador` — highlight red if ≠ 0
- `Reservas Vig. Ant.` — from reservasVigAnterior
- `CxP Vig. Ant.` — from cxpVigAnterior
- `Saldo en Libros` — already exists but verify it's shown

Add to the table header:

```tsx
<th className="...">Validador</th>
<th className="...">Res. Vig. Ant.</th>
<th className="...">CxP Vig. Ant.</th>
```

And corresponding cells in the row:

```tsx
<td className={`... ${f.validador !== 0 ? 'text-red-400 font-bold' : 'text-[var(--gray-400)]'}`}>
  {formatCOP(f.validador)}
</td>
<td className="...">{formatCOP(f.reservasVigAnterior)}</td>
<td className="...">{formatCOP(f.cxpVigAnterior)}</td>
```

- [ ] **Step 3: Verify build and visual check**

Run: `cd '/Users/cristianespinal/Claude Code/Projects/gobia.co' && npm run build 2>&1 | tail -5`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/validador/ValidadorDashboard.tsx src/components/validador/EquilibrioPanel.tsx
git commit -m "feat: display validador, reservas vig ant, CxP vig ant in EquilibrioPanel"
```

---

## Task 5: Expand FileUploadPanel for 2 FUT years

**Files:**
- Modify: `src/components/validador/FileUploadPanel.tsx`
- Modify: `src/components/validador/ValidadorDashboard.tsx`

- [ ] **Step 1: Add futCierre2024 state to ValidadorDashboard**

In ValidadorDashboard.tsx, add state:

```typescript
const [futCierre2024, setFutCierre2024] = useState<FUTCierreData | null>(null);
```

Update FileUploadPanel props to include the new callback:

```tsx
<FileUploadPanel
  onFUTCierreLoaded={setFutCierre}
  onFUTCierre2024Loaded={setFutCierre2024}
  onCGNSaldosLoaded={setCgnSaldos}
  futCierre={futCierre}
  futCierre2024={futCierre2024}
  cgnSaldos={cgnSaldos}
/>
```

- [ ] **Step 2: Add second FUT upload slot to FileUploadPanel**

In `src/components/validador/FileUploadPanel.tsx`, update the interface:

```typescript
interface FileUploadPanelProps {
  onFUTCierreLoaded: (data: FUTCierreData | null) => void;
  onFUTCierre2024Loaded: (data: FUTCierreData | null) => void;
  onCGNSaldosLoaded: (data: CGNSaldosData | null) => void;
  futCierre: FUTCierreData | null;
  futCierre2024: FUTCierreData | null;
  cgnSaldos: CGNSaldosData | null;
}
```

Add a second FUT upload section after the existing one, with label "FUT Cierre Fiscal Vigencia Anterior (2024)". Clone the existing FUT upload handler with state variables `fut2024FileName`, `fut2024Error`, `fut2024Loading`, and call `onFUTCierre2024Loaded`.

- [ ] **Step 3: Verify build**

Run: `cd '/Users/cristianespinal/Claude Code/Projects/gobia.co' && npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add src/components/validador/FileUploadPanel.tsx src/components/validador/ValidadorDashboard.tsx
git commit -m "feat: add second FUT upload slot for vigencia anterior (2024)"
```

---

## Task 6: Create Cierre vs CUIPO validation logic

**Files:**
- Create: `src/lib/validaciones/cierre-vs-cuipo.ts`

This is the core cross-reference logic. For each FUT row that has a consolidation code, it sums the equilibrio data for that consolidation and compares against the FUT values.

- [ ] **Step 1: Create the validation module**

```typescript
/**
 * Cierre FUT vs CUIPO cross-reference
 *
 * For each FUT Cierre row, compares three values against CUIPO Equilibrio:
 * 1. Saldo en Libros: FUT col O (superávit) vs Equilibrio saldoEnLibros
 * 2. Reservas: FUT col M vs Equilibrio reservas
 * 3. CxP: FUT col J vs Equilibrio cxp
 *
 * The link between FUT and Equilibrio is the consolidation code:
 * - FUT row "C.1.2" has consolidacion=1
 * - Equilibrio fuentes with consolidacion=1 are summed
 */

import { MAPEO_FUT, type MapeoFUT } from "@/data/mapeo-fut-consolidacion";
import type { FUTCierreData } from "@/lib/chip-parser";

export interface CruceRow {
  codigoFUT: string;
  nombre: string;
  nivel: number;
  consolidacion: number | number[] | null;
  // Saldo en Libros
  saldoLibrosFUT: number;
  saldoLibrosCUIPO: number;
  diffSaldoLibros: number;
  // Reservas
  reservasFUT: number;
  reservasCUIPO: number;
  diffReservas: number;
  // Cuentas por Pagar
  cxpFUT: number;
  cxpCUIPO: number;
  diffCxP: number;
  // Status
  hasData: boolean;
}

export interface CierreVsCuipoResult {
  cruces: CruceRow[];
  totalDiffSaldoLibros: number;
  totalDiffReservas: number;
  totalDiffCxP: number;
  status: "cumple" | "no_cumple";
}

interface EquilibrioFuente {
  consolidacion: number | null;
  saldoEnLibros: number;
  reservas: number;
  cxp: number;
}

/**
 * Cross-reference FUT Cierre data against Equilibrio data.
 *
 * @param futCierre - Parsed FUT Cierre Fiscal data
 * @param equilibrioPorFuente - Equilibrio per-fuente data with consolidacion codes
 */
export function evaluateCierreVsCuipo(
  futCierre: FUTCierreData,
  equilibrioPorFuente: EquilibrioFuente[]
): CierreVsCuipoResult {
  // Build consolidation aggregates from equilibrio
  const eqByConsolidacion = new Map<number, { saldoEnLibros: number; reservas: number; cxp: number }>();

  for (const f of equilibrioPorFuente) {
    if (f.consolidacion === null) continue;
    const existing = eqByConsolidacion.get(f.consolidacion) || { saldoEnLibros: 0, reservas: 0, cxp: 0 };
    existing.saldoEnLibros += f.saldoEnLibros;
    existing.reservas += f.reservas;
    existing.cxp += f.cxp;
    eqByConsolidacion.set(f.consolidacion, existing);
  }

  // Build FUT lookup by code
  const futByCode = new Map<string, { saldoEnLibros: number; reservas: number; cxp: number }>();
  for (const row of futCierre.rows) {
    futByCode.set(row.codigo.trim(), {
      saldoEnLibros: row.saldoEnLibros,
      reservas: row.reservasPresupuestales,
      cxp: row.cuentasPorPagarVigencia,
    });
  }
  // Also check the total row
  if (futCierre.total) {
    futByCode.set(futCierre.total.codigo.trim(), {
      saldoEnLibros: futCierre.total.saldoEnLibros,
      reservas: futCierre.total.reservasPresupuestales,
      cxp: futCierre.total.cuentasPorPagarVigencia,
    });
  }

  // Build cross-reference rows
  const cruces: CruceRow[] = [];

  for (const mapeo of MAPEO_FUT) {
    const futData = futByCode.get(mapeo.codigoFUT.trim());
    const saldoLibrosFUT = futData?.saldoEnLibros ?? 0;
    const reservasFUT = futData?.reservas ?? 0;
    const cxpFUT = futData?.cxp ?? 0;

    // Sum equilibrio for this consolidation
    let saldoLibrosCUIPO = 0;
    let reservasCUIPO = 0;
    let cxpCUIPO = 0;

    if (mapeo.consolidacion !== null) {
      const codes = Array.isArray(mapeo.consolidacion) ? mapeo.consolidacion : [mapeo.consolidacion];
      for (const code of codes) {
        const eq = eqByConsolidacion.get(code);
        if (eq) {
          saldoLibrosCUIPO += eq.saldoEnLibros;
          reservasCUIPO += eq.reservas;
          cxpCUIPO += eq.cxp;
        }
      }
    }

    const hasData = futData !== undefined || mapeo.consolidacion !== null;

    cruces.push({
      codigoFUT: mapeo.codigoFUT,
      nombre: mapeo.nombre,
      nivel: mapeo.nivel,
      consolidacion: mapeo.consolidacion,
      saldoLibrosFUT,
      saldoLibrosCUIPO,
      diffSaldoLibros: saldoLibrosCUIPO - saldoLibrosFUT,
      reservasFUT,
      reservasCUIPO,
      diffReservas: reservasCUIPO - reservasFUT,
      cxpFUT,
      cxpCUIPO,
      diffCxP: cxpCUIPO - cxpFUT,
      hasData,
    });
  }

  // Totals (from rows with consolidacion != null only)
  const withData = cruces.filter((c) => c.consolidacion !== null);
  const totalDiffSaldoLibros = withData.reduce((s, c) => s + Math.abs(c.diffSaldoLibros), 0);
  const totalDiffReservas = withData.reduce((s, c) => s + Math.abs(c.diffReservas), 0);
  const totalDiffCxP = withData.reduce((s, c) => s + Math.abs(c.diffCxP), 0);

  // Status: cumple if all diffs are within $1
  const tolerance = 1;
  const allOk = withData.every(
    (c) =>
      Math.abs(c.diffSaldoLibros) <= tolerance &&
      Math.abs(c.diffReservas) <= tolerance &&
      Math.abs(c.diffCxP) <= tolerance
  );

  return {
    cruces,
    totalDiffSaldoLibros,
    totalDiffReservas,
    totalDiffCxP,
    status: allOk ? "cumple" : "no_cumple",
  };
}
```

- [ ] **Step 2: Verify build**

Run: `cd '/Users/cristianespinal/Claude Code/Projects/gobia.co' && npm run build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add src/lib/validaciones/cierre-vs-cuipo.ts
git commit -m "feat: implement Cierre FUT vs CUIPO cross-reference validation"
```

---

## Task 7: Wire Cierre vs CUIPO into the Dashboard

**Files:**
- Modify: `src/components/validador/ValidadorDashboard.tsx`
- Modify: `src/components/validador/CierreVsCuipoPanel.tsx`

- [ ] **Step 1: Import and wire the validation in ValidadorDashboard**

Add import at top of ValidadorDashboard.tsx:

```typescript
import { evaluateCierreVsCuipo, type CierreVsCuipoResult } from "@/lib/validaciones/cierre-vs-cuipo";
```

Add state:

```typescript
const [cierreVsCuipoData, setCierreVsCuipoData] = useState<CierreVsCuipoResult | null>(null);
```

In the `runAll` function, after equilibrio data is loaded and when FUT is available, add:

```typescript
    // 5. Cierre vs CUIPO (when both equilibrio and FUT are available)
    if (futCierre && equilibrioData) {
      const cierreResult = evaluateCierreVsCuipo(futCierre, equilibrioData.porFuente);
      setCierreVsCuipoData(cierreResult);
      const diffCount = cierreResult.cruces.filter(
        (c) => c.consolidacion !== null && (Math.abs(c.diffSaldoLibros) > 1 || Math.abs(c.diffReservas) > 1 || Math.abs(c.diffCxP) > 1)
      ).length;
      setResults((prev) => ({
        ...prev,
        "cierre-cuipo": {
          status: cierreResult.status,
          label: "Cierre FUT vs CUIPO",
          detail: diffCount === 0
            ? "Todos los cruces coinciden"
            : `${diffCount} diferencia(s) encontrada(s)`,
        },
      }));
    }
```

Pass the data to CierreVsCuipoPanel:

```tsx
{activePanel === "cierre-cuipo" && (
  <CierreVsCuipoPanel data={cierreVsCuipoData} />
)}
```

- [ ] **Step 2: Rewrite CierreVsCuipoPanel to use cross-reference data**

Replace the content of `src/components/validador/CierreVsCuipoPanel.tsx` with a table that shows:
- Column 1: Código FUT (indented by nivel)
- Column 2: Nombre
- Columns 3-5: Saldo en Libros (FUT | CUIPO | Diferencia)
- Columns 6-8: Reservas (FUT | CUIPO | Diferencia)
- Columns 9-11: CxP (FUT | CUIPO | Diferencia)
- Highlight rows with non-zero differences in red

The panel receives `CierreVsCuipoResult | null` as props. If null, show "Requiere FUT Cierre" message.

- [ ] **Step 3: Verify build**

Run: `cd '/Users/cristianespinal/Claude Code/Projects/gobia.co' && npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add src/components/validador/ValidadorDashboard.tsx src/components/validador/CierreVsCuipoPanel.tsx
git commit -m "feat: wire Cierre vs CUIPO validation with cross-reference table"
```

---

## Task 8: Fix CGA checks 1-2 with presupuesto ingresos

**Files:**
- Modify: `src/components/validador/CGAPanel.tsx`

The CGA checks for presupuesto equilibrium (initial and definitivo) currently show 0 for income because the API wasn't fetching that data. After Task 3, the API now returns `pptoInicialIngresos` and `pptoDefinitivoIngresos` from EJEC_ING. The CGA panel needs to use these.

- [ ] **Step 1: Update CGA validation call in ValidadorDashboard**

In the runAll function where CGA is called, the equilibrioData now contains presupuesto ingresos. Pass these values to the CGA API call or compute CGA checks client-side using the available data.

Since CGA checks 1-2 (presupuesto equilibrium) can now be computed from the equilibrio response data directly:

```typescript
    // 6. CGA (enriched with presupuesto data from equilibrio)
    if (equilibrioData) {
      const cgaResult = await runValidation("cga", "cga");
      if (cgaResult) {
        // Enrich CGA checks 1-2 with equilibrio presupuesto data
        if (cgaResult.cga?.checks) {
          const checks = cgaResult.cga.checks;
          if (checks[0] && equilibrioData.pptoInicialIngresos) {
            checks[0].value1 = equilibrioData.pptoInicialIngresos;
            checks[0].difference = equilibrioData.pptoInicialIngresos - checks[0].value2;
            checks[0].status = Math.abs(checks[0].difference) <= 1_000_000 ? 'cumple' : 'no_cumple';
          }
          if (checks[1] && equilibrioData.pptoDefinitivoIngresos) {
            checks[1].value1 = equilibrioData.pptoDefinitivoIngresos;
            checks[1].difference = equilibrioData.pptoDefinitivoIngresos - checks[1].value2;
            checks[1].status = Math.abs(checks[1].difference) <= 1_000_000 ? 'cumple' : 'no_cumple';
          }
        }
        setCgaData(cgaResult.cga);
        // ... existing status logic
      }
    }
```

- [ ] **Step 2: Verify build**

Run: `cd '/Users/cristianespinal/Claude Code/Projects/gobia.co' && npm run build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add src/components/validador/ValidadorDashboard.tsx
git commit -m "fix: CGA checks 1-2 now use presupuesto ingresos from equilibrio"
```

---

## Task 9: Validate against Betania

**Files:**
- No code changes — manual validation

- [ ] **Step 1: Start dev server**

Run: `cd '/Users/cristianespinal/Claude Code/Projects/gobia.co' && npm run dev`

- [ ] **Step 2: Navigate to Betania**

Open https://gobia.co/plataforma/validador or localhost:3000/plataforma/validador, select Betania (DANE 05091, Antioquia).

- [ ] **Step 3: Verify Equilibrio values**

For ICLD row (1.2.1.0.00, consolidacion=1), verify:
- Recaudo: 2,255,412,686
- Compromisos VA: 1,672,616,143
- Obligaciones: 1,602,910,554
- Pagos: 1,552,590,689
- Reservas: 69,705,589
- CxP: 50,319,865
- Superávit: 582,796,543
- Validador: 0
- Saldo en Libros: 702,821,997

Verify totals (row 235):
- Total Ingresos: 26,712,297,468
- Total Compromisos: 28,481,892,240
- Total Reservas: 6,118,157,471
- Total CxP: 440,119,542
- Total Saldo en Libros: 10,312,515,698

Verify presupuesto:
- Ppto Inicial Ingresos: 21,276,337,596
- Ppto Inicial Gastos: 21,045,256,040
- Ppto Definitivo Ingresos: 31,331,015,576
- Ppto Definitivo Gastos: 31,099,934,021

- [ ] **Step 4: Upload FUT Cierre and verify Cierre vs CUIPO**

Upload the Betania FUT Cierre 2025 file. Verify:

Row C.1.1 (SGP Libre Dest Cat 4-6, consolidacion=55):
- Saldo Libros FUT: 676,042,035 vs CUIPO: (sum of consolid 55)
- Reservas FUT: 38,053,325 vs CUIPO: (sum of consolid 55 reservas)
- CxP FUT: 166,138,183 vs CUIPO: (sum of consolid 55 cxp)

Row C.1.2 (ICLD, consolidacion=1):
- Saldo Libros FUT: 926,459,097 vs CUIPO: (sum of consolid 1)

- [ ] **Step 5: Document any discrepancies**

If any values don't match the Excel, document the specific field, expected value, actual value, and the likely cause. These discrepancies will be addressed before moving to Sprint 2.

- [ ] **Step 6: Final commit with any fixes**

```bash
git add -A
git commit -m "fix: Betania validation adjustments for Excel parity"
```

---

## Betania Expected Values Reference

### Equilibrio Totals (Row 235)

| Field | Expected Value |
|-------|---------------|
| Total Recaudo (Ingresos) | 26,712,297,468 |
| Total Compromisos VA | 28,481,892,240 |
| Total Obligaciones VA | 22,363,734,769 |
| Total Pagos VA | 21,923,615,227 |
| Total Reservas VA | 6,118,157,471 |
| Total CxP VA | 440,119,542 |
| Total Superávit | -1,769,594,772 |
| Total Saldo en Libros | 10,312,515,698 |
| Ppto Inicial Ingresos | 21,276,337,596 |
| Ppto Inicial Gastos | 21,045,256,040 |
| Ppto Definitivo Ingresos | 31,331,015,576 |
| Ppto Definitivo Gastos | 31,099,934,021 |

### CGA Expected Values

| Check | Value 1 | Value 2 | Diff | Status |
|-------|---------|---------|------|--------|
| Ppto Inicial I vs G | 21,276,337,596 | 21,045,256,040 | -1 | CUMPLE |
| Ppto Definitivo I vs G | 31,331,015,576 | 31,099,934,021 | -1 | CUMPLE |
| Reservas 2025: FUT vs CUIPO | 842,975,777 | 6,118,157,471 | — | NO CUMPLE |
| CxP 2025: FUT vs CUIPO | 409,097,422 | 440,119,542 | — | NO CUMPLE |
| Superávit 2025: FUT vs CUIPO | 2,116,086,401 | -1,769,594,772 | 3,885,681,173 | NO CUMPLE |
| Reservas 2024→2025 | 2,294,953,453 | 2,325,840,240 | -30,886,787 | NO CUMPLE |
| CxP 2024→2025 | 88,780,170 | 88,780,170 | 0 | CUMPLE |

### Cierre vs CUIPO (Selected Rows)

| FUT Code | Consol | Saldo FUT | Reservas FUT | CxP FUT |
|----------|--------|-----------|-------------|---------|
| C (Total) | — | 4,086,653,097 | 842,975,775 | 409,097,422 |
| C.1.1 | 55 | 676,042,035 | 38,053,325 | 166,138,183 |
| C.1.2 | 1 | 926,459,097 | 99,705,589 | 50,319,865 |
| C.2.4.10 | 43 | — | — | — |
