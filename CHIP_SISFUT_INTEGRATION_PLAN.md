# Plan de Integracion CHIP + SISFUT para Gemelo Municipal Antioquia

> **Objetivo**: Integrar datos fiscales REALES de CHIP y SISFUT para los 125 municipios de Antioquia en gobia.co
> **Fecha**: 2026-03-29
> **Estado**: Plan de ejecucion

---

## PARTE 1: INVENTARIO COMPLETO DE DATOS DISPONIBLES

### 1.1 SISFUT (sisfut.dnp.gov.co)

**Sistema de Informacion del Formulario Unico Territorial**

| Caracteristica | Detalle |
|----------------|---------|
| **URL** | http://sisfut.dnp.gov.co/ |
| **Administrador** | DNP (Departamento Nacional de Planeacion) |
| **Acceso** | Publico con login como invitado |
| **API** | NO DISPONIBLE - Solo interfaz web |

#### Modulos disponibles:

1. **FUT Report** - Formulario Unico Territorial
   - FUT Ingresos: Rubros A-Z completos
   - FUT Gastos: Funcionamiento, Inversion, Deuda
   - FUT Deuda Publica
   - FUT Personal y Costos
   - FUT PAE (Programa Alimentacion Escolar)
   - FUT Agua Potable y Saneamiento Basico

2. **Operaciones Efectivas de Caja (OEC)**
   - Flujo de caja real vs presupuestado
   - Disponibilidad final de caja

3. **IDF Historico**
   - Indice de Desempeno Fiscal por vigencia
   - Serie historica 2000-2024

#### Filtros disponibles:
- Departamento (seleccion unica)
- Municipio (seleccion multiple o individual)
- Vigencia (2015-2024)
- Trimestre (Q1, Q2, Q3, Q4)
- Categoria FUT/CUIPO/AESGPRI

#### Formatos de descarga:
- Excel (.xlsx)
- PDF (reportes consolidados)

#### Categorias del FUT disponibles:

**FUT Ingresos (~50 rubros principales):**
```
1. INGRESOS CORRIENTES
   1.1 Tributarios
       1.1.1 Predial unificado
       1.1.2 Industria y comercio
       1.1.3 Sobretasa a la gasolina
       1.1.4 Otros impuestos
   1.2 No tributarios
       1.2.1 Tasas y derechos
       1.2.2 Multas y sanciones
       1.2.3 Contribuciones
   1.3 Transferencias
       1.3.1 SGP Educacion
       1.3.2 SGP Salud
       1.3.3 SGP Agua Potable
       1.3.4 SGP Proposito General
       1.3.5 Regalias
2. RECURSOS DE CAPITAL
   2.1 Credito interno
   2.2 Credito externo
   2.3 Recursos del balance
   2.4 Rendimientos financieros
```

**FUT Gastos (~80 rubros principales):**
```
2. GASTOS
   2.1 Funcionamiento
       2.1.1 Servicios personales
       2.1.2 Gastos generales
       2.1.3 Transferencias corrientes
   2.2 Servicio de la deuda
       2.2.1 Deuda interna
       2.2.2 Deuda externa
   2.3 Inversion
       2.3.1 Formacion bruta capital fijo
       2.3.2 Otros gastos de inversion
```

#### Vigencias disponibles:
- 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024

#### URLs especificas:
- Consulta FUT: `http://sisfut.dnp.gov.co/app/descargas/fuentes.aspx`
- IDF Historico: `http://sisfut.dnp.gov.co/app/indicadores/idf.aspx`
- OEC: `http://sisfut.dnp.gov.co/app/consultas/oec.aspx`

---

### 1.2 CHIP (chip.gov.co)

**Consolidador de Hacienda e Informacion Publica**

| Caracteristica | Detalle |
|----------------|---------|
| **URL** | https://www.chip.gov.co/ |
| **Administrador** | Contaduria General de la Nacion (CGN) |
| **Acceso publico** | "Informacion al Ciudadano" |
| **Acceso entidad** | Requiere credenciales institucionales |
| **API** | NO DISPONIBLE |

#### Modulos de consulta publica:

1. **CGN - Informacion Contable Publica Convergencia**
   - Balance General
   - Estado de Resultados
   - Estado de Cambios en el Patrimonio
   - Notas a los Estados Financieros
   - Periodicidad: Trimestral y Anual

2. **CGN - BDME (Boletin Deudores Morosos del Estado)**
   - Cartera morosa por entidad
   - Periodicidad: Semestral

3. **CGR - Presupuestal**
   - Ejecucion de ingresos y gastos
   - Programacion presupuestal
   - Modificaciones al presupuesto

4. **CGR - SGR (Sistema General de Regalias)**
   - Distribucion de regalias
   - Ejecucion de proyectos SGR

5. **CGR - Personal y Costos**
   - Planta de personal
   - Gastos de nomina

6. **FUT - CUIPO (Categoria Unica de Informacion Presupuesto Ordinario)**
   - Ejecucion presupuestal detallada
   - Por fuente de financiacion
   - Por seccion presupuestal

#### Informacion accesible SIN credenciales:
- Consulta de entidades registradas
- Estados financieros publicados
- Informes de auditoria
- Directorio de entidades

#### Informacion que REQUIERE login institucional:
- Carga de informacion (CHIP Local)
- Reportes detallados de entidad propia
- Certificaciones oficiales

#### Diferencia CHIP Web vs CHIP Local:
- **CHIP Web**: Consulta publica de informacion consolidada
- **CHIP Local**: Software de escritorio para carga de informacion (solo entidades)

#### URLs de acceso:
- Portal principal: `https://www.chip.gov.co/`
- Consulta ciudadano: `https://www.chip.gov.co/schip_rt/index.jsf`
- Directorio entidades: `https://www.chip.gov.co/schip_rt/Entidad/entidadConsulta.faces`

---

### 1.3 Otras fuentes complementarias SIN API

#### SICODIS (sicodis.dnp.gov.co)
| Campo | Valor |
|-------|-------|
| **URL** | https://sicodis.dnp.gov.co/ |
| **Contenido** | Distribucion SGP por doceavas, SGR |
| **Exportacion** | Solo Excel |
| **API** | NO - Solo web |

**Consultas disponibles:**
- SGP por grupo de entidades
- SGP por entidad individual
- SGR a nivel presupuestal
- Instrucciones de giro mensual

#### CIFFIT (ciffit.dnp.gov.co)
| Campo | Valor |
|-------|-------|
| **URL** | https://ciffit.dnp.gov.co/ |
| **Contenido** | Consolidado FUT + CUIPO + SGR |
| **Formato** | Web + Excel |
| **Uso** | Cierre fiscal anual |

#### Anuario Estadistico de Antioquia
| Campo | Valor |
|-------|-------|
| **Publicador** | Gobernacion de Antioquia |
| **Contenido** | Indicadores socioeconomicos, fiscales, demograficos |
| **Formato** | PDF + Excel |
| **Periodicidad** | Anual |

#### IDF Publicado por DNP
| Campo | Valor |
|-------|-------|
| **URL** | https://www.dnp.gov.co/programas/desarrollo-territorial/Paginas/desempeno-fiscal.aspx |
| **Contenido** | Rankings IDF oficiales por vigencia |
| **Formato** | Excel descargable |
| **Periodicidad** | Anual (julio-agosto) |

---

## PARTE 2: MATRIZ DE DESCARGA

### Prioridad P0 - Critico (Datos fiscales core)

| Sistema | Modulo | Filtros | Formato | Archivos | Tamano Est. |
|---------|--------|---------|---------|----------|-------------|
| SISFUT | FUT Ingresos | Antioquia, 125 mun, 2019-2024 | Excel | 750 | ~150 MB |
| SISFUT | FUT Gastos | Antioquia, 125 mun, 2019-2024 | Excel | 750 | ~200 MB |
| SISFUT | IDF Historico | Antioquia, 2019-2024 | Excel | 6 | ~5 MB |
| datos.gov.co | CUIPO Ingresos (9axr-9gnb) | Antioquia, 2019-2024 | API JSON | N/A | ~50 MB |
| datos.gov.co | CUIPO Gastos (4f7r-epif) | Antioquia, 2019-2024 | API JSON | N/A | ~200 MB |
| datos.gov.co | MDM/IDF (nkjx-rsq7) | Antioquia, 2019-2024 | API JSON | N/A | ~5 MB |

### Prioridad P1 - Alta (Contabilidad publica)

| Sistema | Modulo | Filtros | Formato | Archivos | Tamano Est. |
|---------|--------|---------|---------|----------|-------------|
| CHIP | Balance General | Antioquia, 125 mun, 2022-2024 | Web/Excel | 375 | ~75 MB |
| CHIP | Estado Resultados | Antioquia, 125 mun, 2022-2024 | Web/Excel | 375 | ~50 MB |
| datos.gov.co | Entidades CHIP (5c7g-ptic) | Nacional | API JSON | N/A | ~10 MB |
| datos.gov.co | Ley 617 ICLD (vztn-viv4) | Antioquia | API JSON | N/A | ~2 MB |

### Prioridad P2 - Media (Transferencias y regalias)

| Sistema | Modulo | Filtros | Formato | Archivos | Tamano Est. |
|---------|--------|---------|---------|----------|-------------|
| SICODIS | SGP Distribucion | Antioquia, 125 mun, 2019-2024 | Excel | 750 | ~100 MB |
| SICODIS | SGR Regalias | Antioquia, 2019-2024 | Excel | 6 | ~10 MB |
| datos.gov.co | TerriData (64cq-xb2k) | Antioquia | API JSON | N/A | ~100 MB |

### Prioridad P3 - Baja (Complementarios)

| Sistema | Modulo | Filtros | Formato | Archivos | Tamano Est. |
|---------|--------|---------|---------|----------|-------------|
| SISFUT | FUT Personal | Antioquia, 125 mun, 2022-2024 | Excel | 375 | ~50 MB |
| SISFUT | FUT PAE | Antioquia, 125 mun, 2022-2024 | Excel | 375 | ~30 MB |
| SISFUT | FUT Agua | Antioquia, 125 mun, 2022-2024 | Excel | 375 | ~30 MB |
| Anuario Antioquia | Todos | 2022-2024 | Excel/PDF | 3 | ~50 MB |

### Resumen total estimado:
- **Archivos a descargar**: ~4,100 archivos
- **Tamano total**: ~1.1 GB
- **Tiempo estimado descarga manual**: 40-60 horas
- **Tiempo con automatizacion**: 8-12 horas

---

## PARTE 3: ESTRATEGIA DE DESCARGA

### 3.1 Quick Win - API SODA (datos.gov.co) - YA DISPONIBLE

**Estos datasets tienen API y se pueden consumir HOY sin scraping:**

| Dataset | ID SODA | Endpoint | Registros |
|---------|---------|----------|-----------|
| CUIPO Ejecucion Ingresos | `9axr-9gnb` | `/resource/9axr-9gnb.json` | 3.1M |
| CUIPO Ejecucion Gastos | `4f7r-epif` | `/resource/4f7r-epif.json` | 11M+ |
| CUIPO Programacion Ingresos | `22ah-ddsj` | `/resource/22ah-ddsj.json` | 2.5M |
| CUIPO Programacion Gastos | `d9mu-h6ar` | `/resource/d9mu-h6ar.json` | 9M |
| MDM/IDF Municipal | `nkjx-rsq7` | `/resource/nkjx-rsq7.json` | ~6K |
| IDF Nuevo (m7gv-v3kk) | `m7gv-v3kk` | `/resource/m7gv-v3kk.json` | ~6K |
| TerriData DNP | `64cq-xb2k` | `/resource/64cq-xb2k.json` | 1.4M+ |
| Entidades CHIP | `5c7g-ptic` | `/resource/5c7g-ptic.json` | ~5K |
| Ley 617 ICLD (CGR) | `vztn-viv4` | `/resource/vztn-viv4.json` | ~11K |
| Presupuesto Historico | `i4a7-qxuj` | `/resource/i4a7-qxuj.json` | 26.5M |

**El proyecto YA tiene clientes implementados para estos datasets:**
- `src/lib/fut-client.ts` - FUT/IDF
- `src/lib/datos-gov-cuipo.ts` - CUIPO completo
- `src/lib/terridata-client.ts` - TerriData

### 3.2 Automatizable con Playwright

**SISFUT** es automatizable porque:
- No tiene CAPTCHA
- Los selectores son HTML estandar
- La descarga genera archivos Excel directos
- Permite login como invitado

**Flujo a automatizar:**
1. Navegar a sisfut.dnp.gov.co
2. Login como invitado
3. Seleccionar modulo (FUT Ingresos/Gastos)
4. Seleccionar Departamento: Antioquia
5. Iterar: para cada municipio (125)
6. Iterar: para cada vigencia (2019-2024)
7. Descargar Excel
8. Guardar con convencion de nombre

### 3.3 Requiere descarga manual

**CHIP** requiere descarga manual porque:
- Interfaz compleja con frames anidados
- Posible CAPTCHA en consultas masivas
- Estados financieros en formato PDF/HTML no estandar

**Protocolo optimizado para descarga manual CHIP:**

1. Preparar lista de codigos CHIP de los 125 municipios
2. Abrir multiples pestanas (5-10 simultaneas)
3. Consultar por lotes de 10 municipios
4. Descargar y renombrar inmediatamente
5. Tiempo estimado: 3-4 horas para 125 municipios x 3 vigencias

### 3.4 Convencion de nombres para archivos

```
{sistema}_{codigo_dane}_{modulo}_{vigencia}_{trimestre}.xlsx

Ejemplos:
sisfut_05001_ingresos_2024_Q4.xlsx
sisfut_05615_gastos_2023_Q4.xlsx
chip_05001_balance_2024_Q4.xlsx
sicodis_05001_sgp_2024_12.xlsx
```

### 3.5 Plan de descarga en 3 dias

**Dia 1 (4h): API + Automatizacion SISFUT**
- [ ] 1h: Ejecutar scripts de descarga API SODA (CUIPO, TerriData, IDF)
- [ ] 3h: Ejecutar Playwright para SISFUT FUT Ingresos/Gastos

**Dia 2 (4h): CHIP + SICODIS**
- [ ] 2h: Descarga manual CHIP Balance General (prioridad: 30 municipios grandes)
- [ ] 2h: Descarga manual SICODIS SGP (todos los 125)

**Dia 3 (4h): ETL + Integracion**
- [ ] 2h: Parseo y normalizacion de archivos descargados
- [ ] 2h: Carga en estructura JSON por municipio

---

## PARTE 4: PIPELINE DE PROCESAMIENTO (ETL)

### 4.1 Estructura de carpetas para datos crudos

```
gobia/
├── data/
│   ├── raw/
│   │   ├── sisfut/
│   │   │   ├── ingresos/
│   │   │   │   ├── 05001_ingresos_2024_Q4.xlsx
│   │   │   │   ├── 05001_ingresos_2023_Q4.xlsx
│   │   │   │   └── ... (750 archivos)
│   │   │   ├── gastos/
│   │   │   │   └── ... (750 archivos)
│   │   │   ├── deuda/
│   │   │   └── personal/
│   │   ├── chip/
│   │   │   ├── balance/
│   │   │   │   └── ... (375 archivos)
│   │   │   ├── resultados/
│   │   │   └── cuipo/
│   │   ├── sicodis/
│   │   │   ├── sgp/
│   │   │   └── sgr/
│   │   └── complementarios/
│   │       └── anuario-antioquia/
│   ├── processed/
│   │   ├── municipios/
│   │   │   ├── 05001.json  # Perfil completo Medellin
│   │   │   ├── 05002.json  # Abejorral
│   │   │   ├── 05004.json  # Abriaqui
│   │   │   └── ... (125 archivos)
│   │   ├── rankings/
│   │   │   ├── idf_2024.json
│   │   │   ├── idf_2023.json
│   │   │   └── ...
│   │   └── antioquia-summary.json
│   └── cache/
│       └── api-responses/
└── scripts/
    └── etl/
        ├── download-soda.ts
        ├── download-sisfut.ts
        ├── parse-sisfut-ingresos.ts
        ├── parse-sisfut-gastos.ts
        ├── parse-chip-balance.ts
        ├── consolidate-municipality.ts
        ├── validate-data.ts
        └── generate-rankings.ts
```

### 4.2 Scripts ETL a crear

#### Script 1: download-soda.ts
```typescript
/**
 * Descarga datos de API SODA para todos los municipios de Antioquia
 * Usa los clientes existentes en src/lib/
 */

import fs from "fs/promises";
import path from "path";

const ANTIOQUIA_CODES = [
  "05001", "05002", "05004", "05021", "05030", "05031", "05034", "05036",
  "05038", "05040", "05042", "05044", "05045", "05051", "05055", "05059",
  "05079", "05086", "05088", "05091", "05093", "05101", "05107", "05113",
  "05120", "05125", "05129", "05134", "05138", "05142", "05145", "05147",
  "05148", "05150", "05154", "05172", "05190", "05197", "05206", "05209",
  "05212", "05234", "05237", "05240", "05250", "05264", "05266", "05282",
  "05284", "05306", "05308", "05310", "05313", "05315", "05318", "05321",
  "05347", "05353", "05360", "05361", "05364", "05368", "05376", "05380",
  "05390", "05400", "05411", "05425", "05440", "05467", "05475", "05480",
  "05483", "05490", "05495", "05501", "05541", "05543", "05576", "05579",
  "05585", "05591", "05604", "05607", "05615", "05628", "05631", "05642",
  "05647", "05649", "05652", "05656", "05658", "05659", "05660", "05664",
  "05665", "05667", "05670", "05674", "05679", "05686", "05690", "05697",
  "05736", "05756", "05761", "05789", "05790", "05792", "05809", "05819",
  "05837", "05842", "05847", "05854", "05856", "05858", "05861", "05873",
  "05885", "05887", "05890", "05893", "05895"
];

const VIGENCIAS = [2019, 2020, 2021, 2022, 2023, 2024];
const OUTPUT_DIR = "./data/raw/api-soda";

interface CuipoRecord {
  periodo: string;
  codigo_entidad: string;
  nombre_entidad: string;
  cuenta: string;
  nombre_cuenta: string;
  total_recaudo?: string;
  compromisos?: string;
  obligaciones?: string;
  pagos?: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<unknown[]> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return [];
}

async function downloadCuipoIngresos() {
  console.log("Descargando CUIPO Ingresos...");
  const baseUrl = "https://www.datos.gov.co/resource/9axr-9gnb.json";

  for (const vigencia of VIGENCIAS) {
    const periodo = `${vigencia}1201`; // Q4 de cada ano
    const params = new URLSearchParams({
      $where: `periodo='${periodo}' AND codigo_entidad LIKE '21005%'`,
      $limit: "50000",
    });

    const data = await fetchWithRetry(`${baseUrl}?${params}`);
    const outputPath = path.join(OUTPUT_DIR, "cuipo-ingresos", `${vigencia}_Q4.json`);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`  - ${vigencia} Q4: ${(data as unknown[]).length} registros`);
  }
}

async function downloadIDF() {
  console.log("Descargando IDF/MDM...");
  const baseUrl = "https://www.datos.gov.co/resource/nkjx-rsq7.json";

  for (const vigencia of VIGENCIAS) {
    const params = new URLSearchParams({
      $where: `c_digo_dane_del_departamento='05' AND vigencia='${vigencia}'`,
      $limit: "150",
    });

    const data = await fetchWithRetry(`${baseUrl}?${params}`);
    const outputPath = path.join(OUTPUT_DIR, "idf", `${vigencia}.json`);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`  - ${vigencia}: ${(data as unknown[]).length} municipios`);
  }
}

async function downloadTerriData() {
  console.log("Descargando TerriData...");
  const baseUrl = "https://www.datos.gov.co/resource/64cq-xb2k.json";

  // TerriData tiene muchos indicadores, descargamos por dimension
  const dimensiones = [
    "Educacion", "Salud", "Pobreza", "Servicios publicos", "Economia"
  ];

  for (const dim of dimensiones) {
    const params = new URLSearchParams({
      $where: `departamento='Antioquia' AND dimension='${dim}'`,
      $limit: "50000",
    });

    const data = await fetchWithRetry(`${baseUrl}?${params}`);
    const outputPath = path.join(OUTPUT_DIR, "terridata", `${dim.toLowerCase().replace(/ /g, "-")}.json`);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`  - ${dim}: ${(data as unknown[]).length} registros`);
  }
}

async function main() {
  console.log("=== Descarga de datos API SODA ===\n");

  await downloadCuipoIngresos();
  await downloadIDF();
  await downloadTerriData();

  console.log("\n=== Descarga completada ===");
}

main().catch(console.error);
```

#### Script 2: parse-sisfut-ingresos.ts
```typescript
/**
 * Parsea archivos Excel de SISFUT FUT Ingresos
 * Extrae rubros presupuestales y los normaliza
 */

import * as XLSX from "xlsx";
import fs from "fs/promises";
import path from "path";

interface RubroIngreso {
  codigo: string;
  nombre: string;
  nivel: number;
  padre_codigo: string | null;
  presupuesto_inicial: number;
  presupuesto_definitivo: number;
  recaudo: number;
  porcentaje_ejecucion: number;
}

interface SisfutIngresos {
  codigo_dane: string;
  municipio: string;
  vigencia: number;
  trimestre: number;
  fecha_proceso: string;
  rubros: RubroIngreso[];
  totales: {
    ingresos_corrientes: number;
    tributarios: number;
    no_tributarios: number;
    transferencias: number;
    recursos_capital: number;
    total_ingresos: number;
  };
}

function parseExcelSisfut(filePath: string): SisfutIngresos | null {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1 });

  // Extraer metadatos del nombre del archivo
  const fileName = path.basename(filePath, ".xlsx");
  const [codigoDane, , vigenciaStr, trimestreStr] = fileName.split("_");

  const rubros: RubroIngreso[] = [];
  let currentSection = "";

  // El formato SISFUT tipicamente tiene:
  // Fila 1-5: Encabezados
  // Fila 6+: Datos de rubros

  for (let i = 5; i < data.length; i++) {
    const row = data[i] as unknown[];
    if (!row || row.length < 5) continue;

    const codigo = String(row[0] || "").trim();
    const nombre = String(row[1] || "").trim();
    const presIni = parseFloat(String(row[2] || "0").replace(/,/g, "")) || 0;
    const presDef = parseFloat(String(row[3] || "0").replace(/,/g, "")) || 0;
    const recaudo = parseFloat(String(row[4] || "0").replace(/,/g, "")) || 0;

    if (!codigo || !nombre) continue;

    // Determinar nivel por longitud del codigo
    const nivel = codigo.split(".").length;
    const partes = codigo.split(".");
    const padreCodigo = partes.length > 1 ? partes.slice(0, -1).join(".") : null;

    rubros.push({
      codigo,
      nombre,
      nivel,
      padre_codigo: padreCodigo,
      presupuesto_inicial: presIni,
      presupuesto_definitivo: presDef,
      recaudo,
      porcentaje_ejecucion: presDef > 0 ? (recaudo / presDef) * 100 : 0,
    });
  }

  // Calcular totales
  const totalIngresos = rubros.find(r => r.codigo === "1")?.recaudo || 0;
  const ingresosCorrientes = rubros.find(r => r.codigo === "1.1")?.recaudo || 0;
  const tributarios = rubros.find(r => r.codigo === "1.1.1")?.recaudo || 0;
  const noTributarios = rubros.find(r => r.codigo === "1.1.2")?.recaudo || 0;
  const transferencias = rubros.find(r => r.codigo === "1.1.3")?.recaudo || 0;
  const recursosCapital = rubros.find(r => r.codigo === "1.2")?.recaudo || 0;

  return {
    codigo_dane: codigoDane,
    municipio: "", // Se llena despues con el catalogo
    vigencia: parseInt(vigenciaStr),
    trimestre: parseInt(trimestreStr.replace("Q", "")),
    fecha_proceso: new Date().toISOString(),
    rubros,
    totales: {
      ingresos_corrientes: ingresosCorrientes,
      tributarios,
      no_tributarios: noTributarios,
      transferencias,
      recursos_capital: recursosCapital,
      total_ingresos: totalIngresos,
    },
  };
}

async function processAllFiles() {
  const inputDir = "./data/raw/sisfut/ingresos";
  const outputDir = "./data/processed/sisfut-ingresos";

  await fs.mkdir(outputDir, { recursive: true });

  const files = await fs.readdir(inputDir);
  const excelFiles = files.filter(f => f.endsWith(".xlsx"));

  console.log(`Procesando ${excelFiles.length} archivos...`);

  const resultsByMunicipio: Record<string, SisfutIngresos[]> = {};

  for (const file of excelFiles) {
    const filePath = path.join(inputDir, file);
    const parsed = parseExcelSisfut(filePath);

    if (parsed) {
      if (!resultsByMunicipio[parsed.codigo_dane]) {
        resultsByMunicipio[parsed.codigo_dane] = [];
      }
      resultsByMunicipio[parsed.codigo_dane].push(parsed);
    }
  }

  // Guardar por municipio
  for (const [codigo, datos] of Object.entries(resultsByMunicipio)) {
    const outputPath = path.join(outputDir, `${codigo}.json`);
    await fs.writeFile(outputPath, JSON.stringify(datos, null, 2));
    console.log(`  - ${codigo}: ${datos.length} periodos`);
  }
}

processAllFiles().catch(console.error);
```

#### Script 3: consolidate-municipality.ts
```typescript
/**
 * Consolida todos los datos de un municipio en un JSON unificado
 * Une: SISFUT + CUIPO + TerriData + IDF
 */

import fs from "fs/promises";
import path from "path";

interface MunicipalityProfile {
  codigo_dane: string;
  nombre: string;
  departamento: string;
  subregion: string;
  categoria: number;
  poblacion: number;
  area_km2: number;
  coordenadas: { lat: number; lng: number };
}

interface FiscalDataYear {
  vigencia: number;
  ingresos: {
    total: number;
    propios: number;
    tributarios: number;
    no_tributarios: number;
    transferencias: number;
    sgp: number;
    regalias: number;
    predial: number;
    ica: number;
  };
  gastos: {
    total: number;
    funcionamiento: number;
    inversion: number;
    deuda: number;
  };
  idf: {
    score: number;
    ranking_departamental: number;
    indicadores: {
      autofinanciamiento: number;
      respaldo_deuda: number;
      dependencia_transferencias: number;
      generacion_recursos: number;
      magnitud_inversion: number;
      capacidad_ahorro: number;
    };
  };
  balance?: {
    activos: number;
    pasivos: number;
    patrimonio: number;
  };
}

interface SocialData {
  vigencia: number;
  nbi: number;
  ipm: number;
  cobertura_educacion: number;
  cobertura_salud: number;
  cobertura_acueducto: number;
  cobertura_alcantarillado: number;
  tasa_desempleo: number;
}

interface MunicipalityFullData {
  perfil: MunicipalityProfile;
  fiscal: FiscalDataYear[];
  social: SocialData[];
  metadata: {
    fuentes: string[];
    ultima_actualizacion: string;
    cobertura_temporal: { desde: number; hasta: number };
  };
}

async function loadJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function consolidateMunicipality(codigoDane: string): Promise<MunicipalityFullData | null> {
  // Cargar datos de diferentes fuentes
  const sisfutIngresos = await loadJson<unknown[]>(
    `./data/processed/sisfut-ingresos/${codigoDane}.json`
  );
  const sisfutGastos = await loadJson<unknown[]>(
    `./data/processed/sisfut-gastos/${codigoDane}.json`
  );
  const idfData = await loadJson<unknown[]>(
    `./data/processed/idf/${codigoDane}.json`
  );
  const terridata = await loadJson<unknown[]>(
    `./data/processed/terridata/${codigoDane}.json`
  );

  // TODO: Cargar perfil del catalogo de municipios
  const perfil: MunicipalityProfile = {
    codigo_dane: codigoDane,
    nombre: "", // Cargar de antioquia-municipalities.ts
    departamento: "Antioquia",
    subregion: "",
    categoria: 6,
    poblacion: 0,
    area_km2: 0,
    coordenadas: { lat: 0, lng: 0 },
  };

  // Consolidar datos fiscales por vigencia
  const fiscal: FiscalDataYear[] = [];
  const vigencias = [2019, 2020, 2021, 2022, 2023, 2024];

  for (const vigencia of vigencias) {
    // Buscar datos de cada fuente para esta vigencia
    // ... logica de consolidacion
  }

  // Consolidar datos sociales
  const social: SocialData[] = [];

  return {
    perfil,
    fiscal,
    social,
    metadata: {
      fuentes: ["SISFUT", "CUIPO", "TerriData", "IDF"],
      ultima_actualizacion: new Date().toISOString(),
      cobertura_temporal: { desde: 2019, hasta: 2024 },
    },
  };
}

async function consolidateAll() {
  const ANTIOQUIA_CODES = [
    "05001", "05002", "05004", "05021", "05030", "05031", "05034", "05036",
    "05038", "05040", "05042", "05044", "05045", "05051", "05055", "05059",
    "05079", "05086", "05088", "05091", "05093", "05101", "05107", "05113",
    "05120", "05125", "05129", "05134", "05138", "05142", "05145", "05147",
    "05148", "05150", "05154", "05172", "05190", "05197", "05206", "05209",
    "05212", "05234", "05237", "05240", "05250", "05264", "05266", "05282",
    "05284", "05306", "05308", "05310", "05313", "05315", "05318", "05321",
    "05347", "05353", "05360", "05361", "05364", "05368", "05376", "05380",
    "05390", "05400", "05411", "05425", "05440", "05467", "05475", "05480",
    "05483", "05490", "05495", "05501", "05541", "05543", "05576", "05579",
    "05585", "05591", "05604", "05607", "05615", "05628", "05631", "05642",
    "05647", "05649", "05652", "05656", "05658", "05659", "05660", "05664",
    "05665", "05667", "05670", "05674", "05679", "05686", "05690", "05697",
    "05736", "05756", "05761", "05789", "05790", "05792", "05809", "05819",
    "05837", "05842", "05847", "05854", "05856", "05858", "05861", "05873",
    "05885", "05887", "05890", "05893", "05895"
  ];

  const outputDir = "./data/processed/municipios";
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`Consolidando ${ANTIOQUIA_CODES.length} municipios...`);

  for (const codigo of ANTIOQUIA_CODES) {
    const data = await consolidateMunicipality(codigo);
    if (data) {
      const outputPath = path.join(outputDir, `${codigo}.json`);
      await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
      console.log(`  - ${codigo}: OK`);
    }
  }
}

consolidateAll().catch(console.error);
```

### 4.3 Dependencias para ETL

```json
{
  "devDependencies": {
    "xlsx": "^0.18.5",
    "csv-parse": "^5.5.3",
    "playwright": "^1.40.0",
    "zod": "^3.22.4",
    "tsx": "^4.7.0"
  }
}
```

---

## PARTE 5: ESQUEMA DE BASE DE DATOS

```sql
-- ============================================================================
-- ESQUEMA PARA DATOS FUT (SISFUT)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS fut;

-- Tabla de periodos por municipio
CREATE TABLE fut.municipio_periodo (
  id SERIAL PRIMARY KEY,
  codigo_dane VARCHAR(5) NOT NULL,
  vigencia INT NOT NULL,
  trimestre INT CHECK (trimestre BETWEEN 1 AND 4),
  fecha_corte DATE,
  fuente VARCHAR(20) NOT NULL, -- 'sisfut', 'cuipo', 'datos_gov'
  procesado_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(codigo_dane, vigencia, trimestre, fuente)
);

CREATE INDEX idx_fut_periodo_dane ON fut.municipio_periodo(codigo_dane);
CREATE INDEX idx_fut_periodo_vigencia ON fut.municipio_periodo(vigencia);

-- Tabla de rubros de ingresos
CREATE TABLE fut.ingresos (
  id SERIAL PRIMARY KEY,
  periodo_id INT REFERENCES fut.municipio_periodo(id) ON DELETE CASCADE,
  rubro_codigo VARCHAR(20) NOT NULL,
  rubro_nombre TEXT NOT NULL,
  nivel INT NOT NULL, -- 1=total, 2=grupo, 3=subgrupo, 4=cuenta
  padre_codigo VARCHAR(20),
  presupuesto_inicial NUMERIC(18,2) DEFAULT 0,
  presupuesto_definitivo NUMERIC(18,2) DEFAULT 0,
  recaudo_acumulado NUMERIC(18,2) DEFAULT 0,
  porcentaje_ejecucion NUMERIC(5,2) DEFAULT 0
);

CREATE INDEX idx_fut_ingresos_periodo ON fut.ingresos(periodo_id);
CREATE INDEX idx_fut_ingresos_rubro ON fut.ingresos(rubro_codigo);

-- Tabla de rubros de gastos
CREATE TABLE fut.gastos (
  id SERIAL PRIMARY KEY,
  periodo_id INT REFERENCES fut.municipio_periodo(id) ON DELETE CASCADE,
  rubro_codigo VARCHAR(20) NOT NULL,
  rubro_nombre TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('funcionamiento', 'inversion', 'deuda', 'total')),
  seccion_presupuestal VARCHAR(50), -- 'Administracion Central', 'Concejo', 'Personeria'
  nivel INT NOT NULL,
  padre_codigo VARCHAR(20),
  apropiacion_inicial NUMERIC(18,2) DEFAULT 0,
  apropiacion_definitiva NUMERIC(18,2) DEFAULT 0,
  compromisos NUMERIC(18,2) DEFAULT 0,
  obligaciones NUMERIC(18,2) DEFAULT 0,
  pagos NUMERIC(18,2) DEFAULT 0
);

CREATE INDEX idx_fut_gastos_periodo ON fut.gastos(periodo_id);
CREATE INDEX idx_fut_gastos_tipo ON fut.gastos(tipo);

-- ============================================================================
-- ESQUEMA PARA DATOS CHIP (CONTADURIA)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS chip;

-- Catalogo de entidades CHIP
CREATE TABLE chip.entidades (
  id SERIAL PRIMARY KEY,
  codigo_chip VARCHAR(15) NOT NULL UNIQUE,
  codigo_dane VARCHAR(5),
  nombre TEXT NOT NULL,
  tipo_entidad VARCHAR(50),
  ambito VARCHAR(10),
  estado VARCHAR(20)
);

CREATE INDEX idx_chip_entidades_dane ON chip.entidades(codigo_dane);

-- Balance General
CREATE TABLE chip.balance_general (
  id SERIAL PRIMARY KEY,
  codigo_dane VARCHAR(5) NOT NULL,
  vigencia INT NOT NULL,
  trimestre INT,
  -- Activos
  activo_total NUMERIC(18,2),
  activo_corriente NUMERIC(18,2),
  activo_no_corriente NUMERIC(18,2),
  efectivo_equivalentes NUMERIC(18,2),
  inversiones NUMERIC(18,2),
  cuentas_por_cobrar NUMERIC(18,2),
  propiedades_planta_equipo NUMERIC(18,2),
  -- Pasivos
  pasivo_total NUMERIC(18,2),
  pasivo_corriente NUMERIC(18,2),
  pasivo_no_corriente NUMERIC(18,2),
  cuentas_por_pagar NUMERIC(18,2),
  obligaciones_financieras NUMERIC(18,2),
  deuda_publica NUMERIC(18,2),
  -- Patrimonio
  patrimonio NUMERIC(18,2),
  capital_fiscal NUMERIC(18,2),
  resultados_ejercicio NUMERIC(18,2),
  resultados_acumulados NUMERIC(18,2),
  -- Metadata
  fecha_corte DATE,
  procesado_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(codigo_dane, vigencia, trimestre)
);

CREATE INDEX idx_chip_balance_dane ON chip.balance_general(codigo_dane);

-- Estado de Resultados
CREATE TABLE chip.estado_resultados (
  id SERIAL PRIMARY KEY,
  codigo_dane VARCHAR(5) NOT NULL,
  vigencia INT NOT NULL,
  trimestre INT,
  ingresos_operacionales NUMERIC(18,2),
  ingresos_fiscales NUMERIC(18,2),
  ingresos_transferencias NUMERIC(18,2),
  otros_ingresos NUMERIC(18,2),
  gastos_operacionales NUMERIC(18,2),
  gastos_administracion NUMERIC(18,2),
  gastos_deterioro NUMERIC(18,2),
  otros_gastos NUMERIC(18,2),
  resultado_operacional NUMERIC(18,2),
  resultado_neto NUMERIC(18,2),
  fecha_corte DATE,
  procesado_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(codigo_dane, vigencia, trimestre)
);

-- ============================================================================
-- ESQUEMA PARA INDICADORES CALCULADOS
-- ============================================================================

CREATE TABLE public.indicadores_fiscales (
  id SERIAL PRIMARY KEY,
  codigo_dane VARCHAR(5) NOT NULL,
  vigencia INT NOT NULL,

  -- IDF (Indice de Desempeno Fiscal)
  idf_score NUMERIC(5,2),
  idf_ranking_departamental INT,
  idf_ranking_nacional INT,
  idf_categoria VARCHAR(20), -- 'sostenible', 'solvente', 'vulnerable', 'deterioro'

  -- Componentes IDF
  autofinanciamiento_gf NUMERIC(5,2), -- Gastos funcionamiento / ICLD
  respaldo_deuda NUMERIC(5,2), -- Deuda / Ingresos totales
  dependencia_transferencias NUMERIC(5,2), -- Transferencias / Ingresos totales
  generacion_recursos_propios NUMERIC(5,2), -- Ingresos propios / Ingresos totales
  magnitud_inversion NUMERIC(5,2), -- Inversion / Gastos totales
  capacidad_ahorro NUMERIC(5,2), -- Ahorro corriente / Ingresos corrientes

  -- Indicadores Ley 617
  limite_gf_ley617 NUMERIC(5,2), -- Limite legal segun categoria
  indicador_gf_icld NUMERIC(5,2), -- GF / ICLD real
  cumple_ley617 BOOLEAN,

  -- Autonomia fiscal
  autonomia_fiscal NUMERIC(5,2), -- Ingresos propios / Gastos totales
  ingresos_propios_percapita NUMERIC(12,2),
  gasto_inversion_percapita NUMERIC(12,2),

  -- Ejecucion presupuestal
  ejecucion_ingresos_pct NUMERIC(5,2),
  ejecucion_gastos_pct NUMERIC(5,2),

  -- Metadata
  fuentes_datos TEXT[],
  calculado_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(codigo_dane, vigencia)
);

CREATE INDEX idx_indicadores_dane ON public.indicadores_fiscales(codigo_dane);
CREATE INDEX idx_indicadores_vigencia ON public.indicadores_fiscales(vigencia);
CREATE INDEX idx_indicadores_idf ON public.indicadores_fiscales(idf_score DESC);

-- ============================================================================
-- VISTAS UTILES
-- ============================================================================

-- Ranking IDF por vigencia
CREATE VIEW public.v_ranking_idf AS
SELECT
  codigo_dane,
  vigencia,
  idf_score,
  idf_categoria,
  RANK() OVER (PARTITION BY vigencia ORDER BY idf_score DESC) as ranking
FROM public.indicadores_fiscales
WHERE idf_score IS NOT NULL;

-- Resumen fiscal por municipio (ultima vigencia disponible)
CREATE VIEW public.v_resumen_fiscal_actual AS
SELECT DISTINCT ON (codigo_dane)
  codigo_dane,
  vigencia,
  idf_score,
  idf_categoria,
  autonomia_fiscal,
  dependencia_transferencias,
  cumple_ley617,
  ejecucion_ingresos_pct,
  ejecucion_gastos_pct
FROM public.indicadores_fiscales
ORDER BY codigo_dane, vigencia DESC;

-- Serie historica IDF por municipio
CREATE VIEW public.v_serie_idf AS
SELECT
  codigo_dane,
  vigencia,
  idf_score,
  idf_score - LAG(idf_score) OVER (PARTITION BY codigo_dane ORDER BY vigencia) as variacion_yoy
FROM public.indicadores_fiscales
ORDER BY codigo_dane, vigencia;
```

---

## PARTE 6: INTEGRACION AL GEMELO MUNICIPAL

### 6.1 Nuevos endpoints API

```typescript
// src/app/api/v2/municipality/[code]/fiscal/detail/route.ts
// Datos fiscales completos con serie historica

// src/app/api/v2/municipality/[code]/fiscal/budget-tree/route.ts
// Arbol de rubros presupuestales (ingresos + gastos)

// src/app/api/v2/antioquia/fiscal/ranking/route.ts
// Ranking IDF de 125 municipios con filtros

// src/app/api/v2/antioquia/fiscal/comparison/route.ts
// Comparativa de hasta 5 municipios
```

### 6.2 Componentes nuevos

```
src/components/dashboard/
├── BudgetTreePanel.tsx      # Arbol interactivo de rubros
├── HistoricalTrendChart.tsx # Serie historica 2019-2024
├── DepartmentRanking.tsx    # Tabla ranking 125 municipios
└── FiscalComparison.tsx     # Comparativa multi-municipio
```

### 6.3 Enriquecimiento del mapa choropleth

Con datos reales, el mapa puede mostrar:
- IDF real calculado desde FUT (no estimado)
- Ejecucion presupuestal real
- Autonomia fiscal real
- Deuda publica per capita
- Gasto de inversion per capita
- Cumplimiento Ley 617

---

## PARTE 7: SCRIPT PLAYWRIGHT COMPLETO

```typescript
/**
 * scripts/download/sisfut-downloader.ts
 * Descarga automatica de datos SISFUT para todos los municipios de Antioquia
 *
 * Uso: npx tsx scripts/download/sisfut-downloader.ts
 */

import { chromium, Browser, Page } from "playwright";
import path from "path";
import fs from "fs/promises";

// ============================================================================
// CONFIGURACION
// ============================================================================

const SISFUT_URL = "http://sisfut.dnp.gov.co/";
const OUTPUT_DIR = path.join(process.cwd(), "data/raw/sisfut");

const VIGENCIAS = [2024, 2023, 2022, 2021, 2020, 2019];
const TRIMESTRES = [4, 3, 2, 1]; // Empezar por Q4 (datos mas completos)

// 125 municipios de Antioquia con codigos DANE
const MUNICIPIOS_ANTIOQUIA: { codigo: string; nombre: string }[] = [
  { codigo: "05001", nombre: "Medellin" },
  { codigo: "05002", nombre: "Abejorral" },
  { codigo: "05004", nombre: "Abriaqui" },
  { codigo: "05021", nombre: "Alejandria" },
  { codigo: "05030", nombre: "Amaga" },
  { codigo: "05031", nombre: "Amalfi" },
  { codigo: "05034", nombre: "Andes" },
  { codigo: "05036", nombre: "Angelopolis" },
  { codigo: "05038", nombre: "Angostura" },
  { codigo: "05040", nombre: "Anori" },
  { codigo: "05042", nombre: "Santa Fe de Antioquia" },
  { codigo: "05044", nombre: "Anza" },
  { codigo: "05045", nombre: "Apartado" },
  { codigo: "05051", nombre: "Arboletes" },
  { codigo: "05055", nombre: "Argelia" },
  { codigo: "05059", nombre: "Armenia" },
  { codigo: "05079", nombre: "Barbosa" },
  { codigo: "05086", nombre: "Belmira" },
  { codigo: "05088", nombre: "Bello" },
  { codigo: "05091", nombre: "Betania" },
  { codigo: "05093", nombre: "Betulia" },
  { codigo: "05101", nombre: "Ciudad Bolivar" },
  { codigo: "05107", nombre: "Briceno" },
  { codigo: "05113", nombre: "Buritica" },
  { codigo: "05120", nombre: "Caceres" },
  { codigo: "05125", nombre: "Caicedo" },
  { codigo: "05129", nombre: "Caldas" },
  { codigo: "05134", nombre: "Campamento" },
  { codigo: "05138", nombre: "Canasgordas" },
  { codigo: "05142", nombre: "Caracoli" },
  { codigo: "05145", nombre: "Caramanta" },
  { codigo: "05147", nombre: "Carepa" },
  { codigo: "05148", nombre: "El Carmen de Viboral" },
  { codigo: "05150", nombre: "Carolina del Principe" },
  { codigo: "05154", nombre: "Caucasia" },
  { codigo: "05172", nombre: "Chigorodo" },
  { codigo: "05190", nombre: "Cisneros" },
  { codigo: "05197", nombre: "Cocorna" },
  { codigo: "05206", nombre: "Concepcion" },
  { codigo: "05209", nombre: "Concordia" },
  { codigo: "05212", nombre: "Copacabana" },
  { codigo: "05234", nombre: "Dabeiba" },
  { codigo: "05237", nombre: "Donmatias" },
  { codigo: "05240", nombre: "Ebejico" },
  { codigo: "05250", nombre: "El Bagre" },
  { codigo: "05264", nombre: "Entrerrios" },
  { codigo: "05266", nombre: "Envigado" },
  { codigo: "05282", nombre: "Fredonia" },
  { codigo: "05284", nombre: "Frontino" },
  { codigo: "05306", nombre: "Giraldo" },
  { codigo: "05308", nombre: "Girardota" },
  { codigo: "05310", nombre: "Gomez Plata" },
  { codigo: "05313", nombre: "Granada" },
  { codigo: "05315", nombre: "Guadalupe" },
  { codigo: "05318", nombre: "Guarne" },
  { codigo: "05321", nombre: "Guatape" },
  { codigo: "05347", nombre: "Heliconia" },
  { codigo: "05353", nombre: "Hispania" },
  { codigo: "05360", nombre: "Itagui" },
  { codigo: "05361", nombre: "Ituango" },
  { codigo: "05364", nombre: "Jardin" },
  { codigo: "05368", nombre: "Jerico" },
  { codigo: "05376", nombre: "La Ceja" },
  { codigo: "05380", nombre: "La Estrella" },
  { codigo: "05390", nombre: "La Pintada" },
  { codigo: "05400", nombre: "La Union" },
  { codigo: "05411", nombre: "Liborina" },
  { codigo: "05425", nombre: "Maceo" },
  { codigo: "05440", nombre: "Marinilla" },
  { codigo: "05467", nombre: "Montebello" },
  { codigo: "05475", nombre: "Murindo" },
  { codigo: "05480", nombre: "Mutata" },
  { codigo: "05483", nombre: "Nariño" },
  { codigo: "05490", nombre: "Necocli" },
  { codigo: "05495", nombre: "Nechi" },
  { codigo: "05501", nombre: "Olaya" },
  { codigo: "05541", nombre: "Peñol" },
  { codigo: "05543", nombre: "Peque" },
  { codigo: "05576", nombre: "Pueblorrico" },
  { codigo: "05579", nombre: "Puerto Berrio" },
  { codigo: "05585", nombre: "Puerto Nare" },
  { codigo: "05591", nombre: "Puerto Triunfo" },
  { codigo: "05604", nombre: "Remedios" },
  { codigo: "05607", nombre: "Retiro" },
  { codigo: "05615", nombre: "Rionegro" },
  { codigo: "05628", nombre: "Sabanalarga" },
  { codigo: "05631", nombre: "Sabaneta" },
  { codigo: "05642", nombre: "Salgar" },
  { codigo: "05647", nombre: "San Andres de Cuerquia" },
  { codigo: "05649", nombre: "San Carlos" },
  { codigo: "05652", nombre: "San Francisco" },
  { codigo: "05656", nombre: "San Jeronimo" },
  { codigo: "05658", nombre: "San Jose de la Montana" },
  { codigo: "05659", nombre: "San Juan de Uraba" },
  { codigo: "05660", nombre: "San Luis" },
  { codigo: "05664", nombre: "San Pedro de los Milagros" },
  { codigo: "05665", nombre: "San Pedro de Uraba" },
  { codigo: "05667", nombre: "San Rafael" },
  { codigo: "05670", nombre: "San Roque" },
  { codigo: "05674", nombre: "San Vicente Ferrer" },
  { codigo: "05679", nombre: "Santa Barbara" },
  { codigo: "05686", nombre: "Santa Rosa de Osos" },
  { codigo: "05690", nombre: "Santo Domingo" },
  { codigo: "05697", nombre: "El Santuario" },
  { codigo: "05736", nombre: "Segovia" },
  { codigo: "05756", nombre: "Sonson" },
  { codigo: "05761", nombre: "Sopetran" },
  { codigo: "05789", nombre: "Tamesis" },
  { codigo: "05790", nombre: "Taraza" },
  { codigo: "05792", nombre: "Tarso" },
  { codigo: "05809", nombre: "Titiribi" },
  { codigo: "05819", nombre: "Toledo" },
  { codigo: "05837", nombre: "Turbo" },
  { codigo: "05842", nombre: "Uramita" },
  { codigo: "05847", nombre: "Urrao" },
  { codigo: "05854", nombre: "Valdivia" },
  { codigo: "05856", nombre: "Valparaiso" },
  { codigo: "05858", nombre: "Vegachi" },
  { codigo: "05861", nombre: "Venecia" },
  { codigo: "05873", nombre: "Vigia del Fuerte" },
  { codigo: "05885", nombre: "Yali" },
  { codigo: "05887", nombre: "Yarumal" },
  { codigo: "05890", nombre: "Yolombo" },
  { codigo: "05893", nombre: "Yondo" },
  { codigo: "05895", nombre: "Zaragoza" },
];

// ============================================================================
// TIPOS
// ============================================================================

interface DownloadResult {
  municipio: string;
  codigo: string;
  vigencia: number;
  trimestre: number;
  modulo: "ingresos" | "gastos";
  success: boolean;
  filePath?: string;
  error?: string;
}

interface DownloadProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  startTime: Date;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatProgress(progress: DownloadProgress): string {
  const elapsed = (Date.now() - progress.startTime.getTime()) / 1000;
  const rate = progress.completed / elapsed;
  const remaining = (progress.total - progress.completed) / rate;

  return `[${progress.completed}/${progress.total}] ` +
    `OK: ${progress.successful} | FAIL: ${progress.failed} | ` +
    `ETA: ${Math.round(remaining / 60)}min`;
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

// ============================================================================
// SISFUT SCRAPER
// ============================================================================

class SisfutDownloader {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private progress: DownloadProgress;
  private results: DownloadResult[] = [];

  constructor() {
    this.progress = {
      total: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      startTime: new Date(),
    };
  }

  async initialize(): Promise<void> {
    console.log("Inicializando navegador...");

    this.browser = await chromium.launch({
      headless: true, // Cambiar a false para debug
      slowMo: 100,
    });

    this.page = await this.browser.newPage();

    // Configurar directorio de descargas
    const downloadPath = path.join(OUTPUT_DIR, "temp");
    await ensureDir(downloadPath);

    // Configurar cliente para descargas
    const client = await this.page.context().newCDPSession(this.page);
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath,
    });

    console.log("Navegador inicializado.");
  }

  async login(): Promise<void> {
    if (!this.page) throw new Error("Navegador no inicializado");

    console.log("Navegando a SISFUT...");
    await this.page.goto(SISFUT_URL, { waitUntil: "networkidle" });

    // Buscar boton de login como invitado
    // NOTA: Los selectores exactos dependen de la interfaz actual de SISFUT
    // Estos son aproximaciones que deben verificarse

    try {
      // Intentar login como invitado
      const guestButton = await this.page.$('text="Invitado"');
      if (guestButton) {
        await guestButton.click();
        await this.page.waitForNavigation({ waitUntil: "networkidle" });
      }

      console.log("Login completado.");
    } catch (error) {
      console.warn("No se pudo hacer login automatico, continuando...");
    }
  }

  async navigateToModule(modulo: "ingresos" | "gastos"): Promise<void> {
    if (!this.page) throw new Error("Navegador no inicializado");

    // Navegar al modulo FUT correspondiente
    // NOTA: URLs y selectores deben verificarse en la interfaz real

    const moduleUrls: Record<string, string> = {
      ingresos: "http://sisfut.dnp.gov.co/app/descargas/ingresos.aspx",
      gastos: "http://sisfut.dnp.gov.co/app/descargas/gastos.aspx",
    };

    await this.page.goto(moduleUrls[modulo], { waitUntil: "networkidle" });
    await delay(1000);
  }

  async selectDepartamento(): Promise<void> {
    if (!this.page) throw new Error("Navegador no inicializado");

    // Seleccionar Antioquia en el dropdown de departamento
    // NOTA: El selector exacto depende de la interfaz

    try {
      await this.page.selectOption('select[name*="departamento"]', "05");
      await delay(500);
    } catch {
      // Intentar con otro selector comun
      await this.page.selectOption("#ddlDepartamento", "05");
    }
  }

  async downloadForMunicipality(
    municipio: { codigo: string; nombre: string },
    vigencia: number,
    trimestre: number,
    modulo: "ingresos" | "gastos"
  ): Promise<DownloadResult> {
    if (!this.page) throw new Error("Navegador no inicializado");

    const result: DownloadResult = {
      municipio: municipio.nombre,
      codigo: municipio.codigo,
      vigencia,
      trimestre,
      modulo,
      success: false,
    };

    try {
      // 1. Seleccionar municipio
      await this.page.selectOption('select[name*="municipio"]', municipio.codigo);
      await delay(300);

      // 2. Seleccionar vigencia
      await this.page.selectOption('select[name*="vigencia"]', vigencia.toString());
      await delay(300);

      // 3. Seleccionar trimestre
      await this.page.selectOption('select[name*="trimestre"]', trimestre.toString());
      await delay(300);

      // 4. Click en boton de consulta/descarga
      const downloadButton = await this.page.$('input[value*="Excel"]')
        || await this.page.$('button:has-text("Descargar")')
        || await this.page.$('input[type="submit"]');

      if (!downloadButton) {
        throw new Error("No se encontro boton de descarga");
      }

      // 5. Configurar espera de descarga
      const [download] = await Promise.all([
        this.page.waitForEvent("download", { timeout: 30000 }),
        downloadButton.click(),
      ]);

      // 6. Guardar archivo con nombre estandarizado
      const fileName = `${municipio.codigo}_${modulo}_${vigencia}_Q${trimestre}.xlsx`;
      const outputPath = path.join(OUTPUT_DIR, modulo, fileName);
      await ensureDir(path.dirname(outputPath));

      await download.saveAs(outputPath);

      result.success = true;
      result.filePath = outputPath;

    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }

  async downloadAll(): Promise<void> {
    // Calcular total de descargas
    this.progress.total =
      MUNICIPIOS_ANTIOQUIA.length * VIGENCIAS.length * TRIMESTRES.length * 2; // x2 por ingresos y gastos

    console.log(`\nTotal de descargas planificadas: ${this.progress.total}`);
    console.log("Iniciando descarga...\n");

    for (const modulo of ["ingresos", "gastos"] as const) {
      console.log(`\n=== MODULO: ${modulo.toUpperCase()} ===\n`);

      await this.navigateToModule(modulo);
      await this.selectDepartamento();

      for (const vigencia of VIGENCIAS) {
        for (const trimestre of TRIMESTRES) {
          for (const municipio of MUNICIPIOS_ANTIOQUIA) {
            const result = await this.downloadForMunicipality(
              municipio,
              vigencia,
              trimestre,
              modulo
            );

            this.results.push(result);
            this.progress.completed++;

            if (result.success) {
              this.progress.successful++;
              console.log(`OK: ${municipio.nombre} ${vigencia} Q${trimestre}`);
            } else {
              this.progress.failed++;
              console.log(`FAIL: ${municipio.nombre} ${vigencia} Q${trimestre} - ${result.error}`);
            }

            // Mostrar progreso cada 10 descargas
            if (this.progress.completed % 10 === 0) {
              console.log(formatProgress(this.progress));
            }

            // Pausa para no sobrecargar el servidor
            await delay(500);
          }
        }
      }
    }
  }

  async saveReport(): Promise<void> {
    const reportPath = path.join(OUTPUT_DIR, "download-report.json");
    await fs.writeFile(reportPath, JSON.stringify({
      progress: this.progress,
      results: this.results,
      summary: {
        total: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        failedItems: this.results.filter(r => !r.success).map(r => ({
          municipio: r.municipio,
          vigencia: r.vigencia,
          trimestre: r.trimestre,
          modulo: r.modulo,
          error: r.error,
        })),
      },
    }, null, 2));

    console.log(`\nReporte guardado en: ${reportPath}`);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       SISFUT Downloader - Antioquia (125 municipios)       ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const downloader = new SisfutDownloader();

  try {
    await downloader.initialize();
    await downloader.login();
    await downloader.downloadAll();
    await downloader.saveReport();
  } catch (error) {
    console.error("Error fatal:", error);
  } finally {
    await downloader.close();
  }

  console.log("\n=== Descarga completada ===");
}

main().catch(console.error);
```

---

## PARTE 8: CRONOGRAMA DE EJECUCION

### Fase 0: Preparacion (Hoy - 2h)

- [ ] Instalar dependencias: `npm i -D xlsx csv-parse playwright tsx`
- [ ] Crear estructura de carpetas `data/raw/`
- [ ] Configurar Playwright: `npx playwright install chromium`
- [ ] Verificar acceso a SISFUT y CHIP manualmente

### Fase 1: Descarga API SODA (Dia 1 - 1h)

- [ ] Ejecutar `scripts/etl/download-soda.ts`
- [ ] Verificar archivos descargados en `data/raw/api-soda/`
- [ ] Validar estructura de datos JSON

### Fase 2: Descarga SISFUT automatizada (Dia 1 - 3h)

- [ ] Ejecutar `scripts/download/sisfut-downloader.ts`
- [ ] Monitorear progreso y errores
- [ ] Re-intentar descargas fallidas manualmente

### Fase 3: Descarga CHIP manual (Dia 2 - 3h)

- [ ] Descargar Balance General para 30 municipios prioritarios
- [ ] Descargar Estado de Resultados
- [ ] Guardar con convencion de nombres

### Fase 4: ETL y normalizacion (Dia 2-3 - 4h)

- [ ] Ejecutar parsers de Excel SISFUT
- [ ] Ejecutar consolidador por municipio
- [ ] Validar datos procesados
- [ ] Generar `antioquia-summary.json`

### Fase 5: Integracion al gemelo (Dia 3 - 4h)

- [ ] Actualizar endpoints API existentes
- [ ] Crear nuevos componentes
- [ ] Probar mapa choropleth con datos reales
- [ ] Deploy a Vercel

---

## PARTE 9: VALIDACION Y CALIDAD DE DATOS

### Checks de integridad

```typescript
// scripts/etl/validate-data.ts

const VALIDATIONS = [
  // Codigos DANE validos
  (data) => /^05\d{3}$/.test(data.codigo_dane),

  // Vigencias en rango
  (data) => data.vigencia >= 2015 && data.vigencia <= 2024,

  // Totales coherentes
  (data) => data.ingresos.total >= data.ingresos.propios,

  // IDF en rango
  (data) => data.idf.score >= 0 && data.idf.score <= 100,

  // Ejecucion no mayor a 100%
  (data) => data.ejecucion_pct <= 100,
];
```

### Reporte de cobertura

```
| Municipio | Ingresos | Gastos | IDF | Balance | Cobertura |
|-----------|----------|--------|-----|---------|-----------|
| 05001     | 6/6      | 6/6    | 6/6 | 3/3     | 100%      |
| 05002     | 6/6      | 5/6    | 6/6 | 0/3     | 85%       |
| ...       | ...      | ...    | ... | ...     | ...       |
```

---

## PARTE 10: NOTAS IMPORTANTES

### Limitaciones conocidas

1. **SISFUT puede tener downtime** - El servidor DNP a veces es lento o inaccesible
2. **CHIP requiere credenciales para algunos datos** - Balance detallado puede requerir login
3. **Datos pueden tener rezago** - Q4 2024 puede no estar disponible hasta marzo 2025
4. **Formatos Excel varian** - Diferentes vigencias pueden tener estructuras diferentes

### Alternativas si el scraping falla

1. **Solicitud formal al DNP** - Pedir acceso a base de datos directa
2. **CIFFIT consolidado** - Usar como fuente unica si SISFUT falla
3. **datos.gov.co como backup** - Priorizar datasets con API SODA

### Mantenimiento futuro

- Ejecutar descarga trimestral (Q1: abril, Q2: julio, Q3: octubre, Q4: enero)
- Monitorear cambios en interfaz de SISFUT/CHIP
- Actualizar selectores Playwright si cambian

---

**Documento generado el 2026-03-29**
**Proyecto: gobia.co - Gemelo Municipal Antioquia**
