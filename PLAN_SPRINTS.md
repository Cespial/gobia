# PLAN DE TRABAJO — 14 Sprints para gobia.co

> Sprints 1-4 completados (landing page base, SVG illustrations, knowledge graph, visual polish).
> Este plan cubre Sprints 5-18: perfeccionamiento + funcionalidades por módulo.

---

## Visión general

```
FASE 1 — Perfeccionamiento visual (Sprints 5-6)
  └─ Landing SVG-first + páginas por módulo

FASE 2 — Datos reales + demos vivos (Sprints 7-10)
  └─ datos.gov.co → Hacienda Dashboard → Estatuto IA → PDM

FASE 3 — Módulos funcionales (Sprints 11-13)
  └─ Exógena XML → Gemelo Municipal → Rendición

FASE 4 — Plataforma + conversión (Sprints 14-18)
  └─ Auth → CRM → Analytics → SEO → Performance
```

---

## APIs y fuentes de datos validadas

### ✅ Funcionando (datos.gov.co SODA REST)

| Dataset | ID | Campos clave | Uso |
|---------|-----|-------------|-----|
| DIVIPOLA municipios | `gdxc-w37w` | cod_dpto, cod_mpio, nom_mpio, longitud, latitud | Selector de municipios, mapa |
| MDM - Desempeño Municipal | `nkjx-rsq7` | entidad, departamento, indicador, dato, anio | Dashboard IDF, comparativas |
| SECOP II Contratos | `jbjy-vk9h` | nombre_entidad, valor_contrato, tipo_contrato, estado | Transparencia, gemelo |
| FUT Ingresos | `a6ia-xzgy` | nombre, codigo, presupuesto_inicial, presupuesto_definitivo, recaudo_efectivo | Dashboard hacienda |
| IDF Boyacá | `m7gv-v3kk` | Índice de desempeño fiscal por municipio | Referencia fiscal |

### 📋 Requieren descarga/scraping (sin API)

| Sistema | Estrategia | Sprint |
|---------|-----------|--------|
| SISFUT (sisfut.dnp.gov.co) | Descargar reportes HTML, parsear tablas | Sprint 8 |
| CHIP categorías | Catálogo de categorías de información como JSON estático | Sprint 8 |
| DIAN prevalidadores | Descargar XSD de formatos exógena | Sprint 12 |
| GeoJSON municipios | DANE Geoportal o data.humdata.org/dataset/cod-ab-col | Sprint 13 |

### 🔑 APIs que necesitamos del usuario

| Servicio | Para qué | Sprint |
|----------|---------|--------|
| Resend API key | Emails del formulario de contacto | Sprint 5 |
| Supabase project | Base de datos multi-tenant + auth | Sprint 15 |
| Anthropic API key | RAG pipeline Estatuto IA | Sprint 10 |
| App token datos.gov.co | Superar rate limits (1,000 req/h) | Sprint 8 |

---

## Sprint 5 — Landing Page SVG-First Redesign

**Objetivo**: Reemplazar las cards de texto por SVG ilustrativos e interactivos en toda la landing.

### 5.1 SolucionSection → SVG Feature Showcase

**Problema actual**: Las 6 features se muestran como cards de texto genéricas. No se ven diferentes de cualquier SaaS.

**Solución**: Crear un SVG interactivo por cada módulo que muestre visualmente qué hace, reemplazando las cards.

- [ ] **`HaciendaFeatureSVG.tsx`** — Mini dashboard con 3 gauges animados (recaudo, ejecución, IDF) + sparkline de tendencia
- [ ] **`PDMFeatureSVG.tsx`** — Árbol jerárquico animado (Línea → Programa → Meta) con semáforos 🟢🟡🔴 que cambian
- [ ] **`EstatutoFeatureSVG.tsx`** — Chat bubble con artículo citado + icono de libro abierto + flujo de consulta
- [ ] **`ExogenaFeatureSVG.tsx`** — Documento XML estilizado con checkmarks de validación que van apareciendo
- [ ] **`GemeloFeatureSVG.tsx`** — Silueta de mapa municipal con puntos de datos que aparecen (estilo dot map)
- [ ] **`RendicionFeatureSVG.tsx`** — 3 documentos (SIRECI, SIA, FUT) convergiendo en uno con check final

**Layout**: Grid de 2 columnas en desktop. Cada item = SVG izquierda (60%) + texto derecho (40%). En mobile: SVG arriba, texto abajo.

### 5.2 ProblemaSection → SVG Flow Mejorado

- [ ] Rediseñar `DataSilosDiagram.tsx` para mostrar el **flujo real** del funcionario:
  - Paso 1: Funcionario frente a laptop (silueta)
  - Paso 2: 5 pestañas/ventanas abiertas (CHIP, SISFUT, Excel, SECOP, SIRECI) — iconos reconocibles
  - Paso 3: Flechas rotas entre ellas con "❌ No se comunican"
  - Paso 4: Reloj con "2 semanas" para un reporte trimestral
- [ ] Animación: cada elemento aparece en secuencia, creando una narrativa visual del dolor

### 5.3 ProductoPreview → Dashboard Interactivo

- [ ] Rediseñar `DashboardMockupSVG.tsx` como un mockup más realista:
  - Sidebar con los 6 módulos (iconos de Lucide en SVG)
  - Panel principal con charts reales (bar chart, donut, area)
  - Header con nombre de municipio + selector
  - Datos que se animan como si cargaran en tiempo real
- [ ] Agregar hover states: al pasar sobre un módulo del sidebar, el contenido del panel cambia

### 5.4 CasosDeUso → Ilustraciones por caso

- [ ] Reemplazar el panel lateral de métricas por un SVG integrado por cada caso:
  - Caso Alcaldía: Before/After dashboard side-by-side
  - Caso Gobernación: Mapa con 32 puntos municipales iluminándose
  - Caso Secretaría: Chat interface con XML generándose

### 5.5 Mobile Polish

- [ ] Auditar cada SVG con `viewBox` responsivo en pantallas < 375px
- [ ] Asegurar que todos los textos dentro de SVGs sean legibles en mobile
- [ ] Agregar `prefers-reduced-motion: reduce` a todas las animaciones nuevas

**Entregables**: 10+ nuevos SVG components, sección Solución completamente rediseñada

---

## Sprint 6 — Páginas por Módulo + Navegación

**Objetivo**: Crear una página dedicada para cada módulo con deep-dive visual.

### 6.1 Arquitectura de rutas

```
/                          → Landing (actual)
/hacienda                  → Dashboard de Hacienda (demo)
/pdm                       → Seguimiento PDM (demo)
/estatuto                  → Estatuto Municipal IA (demo)
/exogena                   → Exógena Automatizada (demo)
/gemelo                    → Gemelo Municipal (demo)
/rendicion                 → Rendición Automatizada (demo)
```

### 6.2 Template de página de módulo

Cada página sigue la misma estructura narrativa:

```
┌─────────────────────────────────┐
│  Navbar (con breadcrumb)        │
├─────────────────────────────────┤
│  Hero del módulo                │
│  - Título + subtítulo           │
│  - SVG hero illustration        │
│  - Badge de estado              │
│  - CTA "Solicitar demo"         │
├─────────────────────────────────┤
│  ¿Qué resuelve?                │
│  - Pain points específicos SVG  │
│  - Datos del problema real      │
├─────────────────────────────────┤
│  ¿Cómo funciona?               │
│  - SVG de flujo/pipeline        │
│  - Steps 1-2-3 interactivos     │
├─────────────────────────────────┤
│  Demo interactivo (live)        │
│  - Dashboard mockup / chat UI   │
│  - Datos reales si disponibles  │
├─────────────────────────────────┤
│  Especificaciones técnicas      │
│  - Stack, APIs, compliance      │
│  - SVG de arquitectura          │
├─────────────────────────────────┤
│  CTA Final                      │
│  - Formulario de contacto       │
└─────────────────────────────────┘
```

### 6.3 Componentes reutilizables

- [ ] **`ModulePageLayout.tsx`** — Layout template para páginas de módulo
- [ ] **`ModuleHero.tsx`** — Hero con props (title, subtitle, illustration, status, color)
- [ ] **`PainPointsFlow.tsx`** — Sección de dolor con SVG + texto
- [ ] **`HowItWorks.tsx`** — Steps numerados con SVG por paso
- [ ] **`TechSpecs.tsx`** — Tabla de especificaciones técnicas
- [ ] **`ModuleCTA.tsx`** — CTA reutilizable con formulario

### 6.4 Navbar actualizado

- [ ] Agregar dropdown "Módulos" con links a cada página
- [ ] Breadcrumb en páginas internas: `Gobia > Hacienda Dashboard`
- [ ] Mantener scroll-spy solo en landing page
- [ ] Mobile: drawer con secciones de módulos

### 6.5 Feature cards → Links

- [ ] En SolucionSection de la landing, cada card ahora linquea a su página: `<Link href="/hacienda">...`
- [ ] Hover effect: "Ver más →" aparece en la card
- [ ] Status badge se mantiene

**Entregables**: 6 páginas nuevas (scaffolded), Navbar con navegación, layout template reutilizable

---

## Sprint 7 — Capa de Datos: datos.gov.co + Data Layer

**Objetivo**: Construir la infraestructura para consumir datos reales del gobierno colombiano.

### 7.1 API Client para datos.gov.co

- [ ] **`src/lib/datos-gov.ts`** — Cliente SODA tipado:
  ```typescript
  // Endpoints validados
  const DATASETS = {
    divipola: "gdxc-w37w",        // Municipios + coordenadas
    mdm: "nkjx-rsq7",            // Medición Desempeño Municipal
    secop2: "jbjy-vk9h",         // SECOP II Contratos
    futIngresos: "a6ia-xzgy",    // FUT Ingresos
  } as const;

  export async function queryDataset<T>(
    datasetId: string,
    params: SoQLParams
  ): Promise<T[]>
  ```
- [ ] Rate limiting con exponential backoff
- [ ] Cache con `next/cache` (revalidate: 86400 — datos cambian trimestralmente)
- [ ] Types generados para cada dataset

### 7.2 Selector de Municipios

- [ ] **`src/components/ui/MunicipalitySelector.tsx`**:
  - Combobox con search: "Buscar municipio..."
  - Datos de DIVIPOLA (1,122 municipios)
  - Agrupado por departamento
  - Muestra: nombre + código DANE + departamento
  - Persiste selección en URL params (`?municipio=05001`)
- [ ] Cargar datos en build time con `generateStaticParams` o ISR
- [ ] **`src/data/municipalities.json`** — Cache estático de DIVIPOLA para no depender de API en cada request

### 7.3 Data Hooks

- [ ] **`src/hooks/useMunicipalData.ts`** — Hook para obtener indicadores MDM por municipio
- [ ] **`src/hooks/useBudgetData.ts`** — Hook para obtener datos FUT por municipio
- [ ] **`src/hooks/useContracts.ts`** — Hook para obtener contratos SECOP por entidad
- [ ] Server Components con `fetch` + Suspense para SSR

### 7.4 Datos estáticos de referencia

- [ ] **`src/data/idf-reference.ts`** — Fórmulas IDF (6 indicadores, pesos, rangos semáforo)
- [ ] **`src/data/fut-categories.ts`** — Catálogo de rubros presupuestales FUT
- [ ] **`src/data/department-geo.json`** — GeoJSON simplificado de departamentos colombianos
- [ ] **`src/data/chip-categories.ts`** — Categorías de información CHIP

### 7.5 API Routes (si se necesita proxy)

- [ ] **`src/app/api/datos-gov/[dataset]/route.ts`** — Proxy para evitar CORS y agregar caching:
  ```typescript
  export async function GET(req, { params }) {
    const data = await queryDataset(params.dataset, searchParams);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=86400" }
    });
  }
  ```

**Entregables**: Data layer completo, selector de municipios funcional, tipos TypeScript para todos los datasets

---

## Sprint 8 — Página /hacienda: Dashboard de Hacienda (Demo Vivo)

**Objetivo**: Construir una demo funcional del dashboard de hacienda con datos reales de datos.gov.co.

### 8.1 Hero de la página

- [ ] **`HaciendaHeroSVG.tsx`** — Ilustración: dashboard estilizado con gauges + barras + donut en paleta ochre
- [ ] Headline: "Tu hacienda pública en tiempo real"
- [ ] Subheadline: "Ejecución presupuestal, recaudo, cartera e IDF — todo en una vista."
- [ ] Badge: "En desarrollo"

### 8.2 Sección "El problema"

- [ ] **`HaciendaProblemSVG.tsx`** — SVG mostrando:
  - Funcionario con 4 ventanas: Excel de presupuesto, SISFUT web, CHIP desktop, calculadora
  - Flechas cruzadas representando el caos de consolidar datos
  - Métricas del dolor: "2 semanas", "3 personas", "cada trimestre"

### 8.3 Demo interactivo: Dashboard

- [ ] **`HaciendaDashboard.tsx`** — Dashboard funcional con datos reales:
  - **Selector de municipio** en la parte superior (DIVIPOLA)
  - **Ejecución presupuestal**: Waterfall chart (Apropiación → Compromiso → Obligación → Pago)
  - **Recaudo por impuesto**: Donut chart (Predial, ICA, Otros, Transferencias)
  - **Scorecard IDF**: 6 indicadores con semáforo (datos de MDM dataset `nkjx-rsq7`)
  - **Tendencia**: Area chart de recaudo mes a mes
  - **Comparativa**: Ranking vs municipios del mismo departamento

### 8.4 Visualizaciones (SVG + Tremor/Recharts)

**Opción A — SVG puro** (si no queremos agregar Tremor/Recharts aún):
- [ ] **`WaterfallChart.tsx`** — SVG animado con Framer Motion
- [ ] **`DonutChart.tsx`** — SVG circular con segmentos animados
- [ ] **`ScoreCard.tsx`** — Indicador con gauge + semáforo
- [ ] **`AreaSparkline.tsx`** — Mini area chart SVG

**Opción B — Recharts** (ya es dependencia de Tremor, más rápido):
- [ ] Instalar `recharts` (lightweight, React-native)
- [ ] Configurar theme con paleta ochre/ink

### 8.5 Datos FUT procesados

- [ ] **Server Component** que consume `a6ia-xzgy` (FUT Ingresos):
  ```typescript
  // Ejemplo de query
  const ingresos = await queryDataset("a6ia-xzgy", {
    $where: `codigo LIKE '05001%'`,
    $limit: 100
  });
  ```
- [ ] Transformar datos FUT a estructura normalizada para charts
- [ ] Fallback: datos de ejemplo si la API falla

### 8.6 SVG de flujo "Cómo funciona"

- [ ] **`HaciendaFlowSVG.tsx`** — Pipeline en 4 pasos:
  1. Fuentes de datos (SISFUT, CHIP, FUT) → iconos
  2. ETL automático → engranajes animados
  3. Normalización → tabla estilizada
  4. Dashboard → charts del demo

### 8.7 Especificaciones técnicas

- [ ] Tabla: APIs consumidas, frecuencia de actualización, formatos soportados
- [ ] SVG de la arquitectura de datos específica de Hacienda
- [ ] Compliance: Res. 111/2025, Ley 962/2005

**Entregables**: Página /hacienda completa con demo funcional, datos reales, 4+ SVG nuevos

---

## Sprint 9 — Página /estatuto: Estatuto Municipal IA (Demo Conversacional)

**Objetivo**: Construir una demo del módulo de IA con chat UI y conocimiento normativo.

### 9.1 Hero de la página

- [ ] **`EstatutoHeroSVG.tsx`** — Libro abierto con artículos flotando + cerebro/grafo en el fondo
- [ ] Headline: "Tu estatuto tributario, con inteligencia artificial"
- [ ] Badge: "Beta activa"

### 9.2 Knowledge Base expandida

- [ ] Expandir **`src/data/knowledge-graph-data.ts`**:
  - Agregar contenido real de artículos (resumen de 2-3 líneas por artículo)
  - Agregar 20+ cross-references adicionales
  - Agregar metadata: fecha_vigencia, norma_origen, tipo_impuesto
- [ ] **`src/data/sample-queries.ts`** — 15 preguntas frecuentes con respuestas pre-computadas:
  ```typescript
  export const sampleQueries = [
    {
      query: "¿Cuál es la tarifa del impuesto predial para estrato 3?",
      answer: "Según el Artículo 4 del Libro Predial...",
      citations: ["predial-2", "predial-3"],
      category: "Predial"
    },
    // ...
  ];
  ```

### 9.3 Demo: Chat UI

- [ ] **`EstatutoChat.tsx`** — Interfaz de chat estilo Claude/ChatGPT:
  - Input con placeholder "Pregunta sobre tu estatuto tributario..."
  - Mensajes con avatar (usuario vs Gobia IA)
  - **Citaciones clickeables**: "Art. 23, Libro Predial" → abre panel lateral con texto completo
  - Respuestas pre-computadas (sin API de LLM por ahora)
  - Animación de "typing" para simular respuesta en tiempo real
  - Sidebar: historial de consultas anteriores
- [ ] **`CitationPanel.tsx`** — Panel lateral que muestra el artículo completo citado
- [ ] **`SuggestedQueries.tsx`** — Chips clickeables con preguntas sugeridas

### 9.4 Knowledge Graph mejorado

- [ ] Reutilizar `KnowledgeGraph.tsx` pero con mejoras:
  - Filtro por libro: "Mostrar solo Predial"
  - Zoom/pan en desktop (scroll + drag)
  - Click en nodo → muestra artículo en panel lateral
  - Leyenda de colores por libro
- [ ] **`GraphExplorer.tsx`** — Versión full-page del grafo para /estatuto

### 9.5 SVG de pipeline RAG

- [ ] Mejorar **`RAGPipelineDiagram.tsx`** con más detalle:
  - Paso 1: Documento PDF del estatuto → parsing
  - Paso 2: Chunking por artículo → embeddings (vectores)
  - Paso 3: Búsqueda híbrida (vectorial + keyword)
  - Paso 4: Re-ranking → selección de contexto
  - Paso 5: LLM genera respuesta con citaciones
  - Paso 6: Verificación post-generación

### 9.6 Sección "¿Cómo garantizamos precisión?"

- [ ] **`PrecisionSVG.tsx`** — Diagrama de verificación:
  - Flujo: Respuesta → Extrae citaciones → Verifica en BD → ✅ Match / ❌ Rechaza
  - Métricas: "98% precisión en citaciones", "0 alucinaciones aceptadas"
- [ ] Comparativa visual: "ChatGPT genérico vs Gobia IA"
  - ChatGPT: "Según la normativa general..." (sin fuente)
  - Gobia: "Art. 23, Libro Predial, Acuerdo 015/2024: La tarifa es..." (con fuente)

**Entregables**: Página /estatuto con chat demo, grafo mejorado, knowledge base expandida, 5+ SVG nuevos

---

## Sprint 10 — Página /pdm: Seguimiento de Plan de Desarrollo

**Objetivo**: Demo visual del seguimiento de metas del PDM con semáforo y alertas.

### 10.1 Hero de la página

- [ ] **`PDMHeroSVG.tsx`** — Árbol jerárquico estilizado (Líneas → Programas → Metas) con hojas de colores semáforo
- [ ] Headline: "Cada meta de tu plan de desarrollo, bajo control"
- [ ] Badge: "En desarrollo"

### 10.2 Datos de ejemplo PDM

- [ ] **`src/data/sample-pdm.ts`** — Plan de desarrollo modelo (municipio ficticio):
  ```typescript
  export const samplePDM = {
    nombre: "Plan de Desarrollo 2024-2027: Municipio Modelo",
    lineas: [
      {
        nombre: "Desarrollo Social",
        programas: [
          {
            nombre: "Educación para todos",
            metas: [
              {
                indicador: "Cobertura educativa",
                lineaBase: 78,
                metaCuatrienio: 95,
                ejecutado: [80, 83, null, null], // por año
                semaforo: "verde"
              }
            ]
          }
        ]
      }
    ]
  };
  ```
- [ ] 4 líneas estratégicas, 12 programas, 30+ metas con datos realistas

### 10.3 Demo: Dashboard PDM

- [ ] **`PDMDashboard.tsx`** — Dashboard interactivo:
  - **TreeView** del plan: expandir/colapsar líneas → programas → metas
  - **Semáforo automático**: 🟢 ≥80%, 🟡 50-79%, 🔴 <50%
  - **Panel de alertas**: Metas en riesgo, subejecución, fechas próximas
  - **Chart de avance**: Barra apilada por línea estratégica
  - **Vista temporal**: Slider de trimestres para ver evolución

### 10.4 SVG interactivos

- [ ] **`PDMTreeSVG.tsx`** — Árbol orgánico del plan con:
  - Nodos coloreados por semáforo
  - Click para expandir/detallar
  - Animación de crecimiento desde raíz
- [ ] **`AlertsDiagram.tsx`** — Sistema de alertas visualizado:
  - 4 tipos: meta rezagada, subejecución, fecha límite, ejecución cero
  - Iconos distintivos con pulso
- [ ] **`SemaforoGauge.tsx`** — Componente reutilizable de semáforo + gauge de avance

### 10.5 Sección "Reportes listos"

- [ ] **`ReportPreviewSVG.tsx`** — Mockup de reporte PDF generado automáticamente:
  - Portada con escudo municipal
  - Tabla de contenido
  - Gráficos de avance
  - "Exportar PDF" CTA

**Entregables**: Página /pdm con demo completo, datos de ejemplo, 4+ SVG nuevos

---

## Sprint 11 — Página /exogena: Exógena Automatizada

**Objetivo**: Demo del generador de XML para DIAN con validación visual.

### 11.1 Hero de la página

- [ ] **`ExogenaHeroSVG.tsx`** — Flujo: Datos contables → Motor de validación → XML verificado con check de DIAN
- [ ] Headline: "Genera tu exógena en minutos, no en semanas"
- [ ] Badge: "En desarrollo"

### 11.2 Datos de referencia DIAN

- [ ] **`src/data/exogena-formats.ts`** — Catálogo de formatos obligatorios:
  ```typescript
  export const formats = [
    {
      number: "1001",
      name: "Pagos o abonos en cuenta y retenciones practicadas",
      fields: ["concepto", "nit_informado", "dv", "razon_social", "direccion", ...],
      maxRecords: 5000,
      version: "10"
    },
    // 1003, 1007, 1008, 1009, 2276
  ];
  ```
- [ ] **`src/data/exogena-validations.ts`** — Reglas de validación:
  - Dígito de verificación NIT (algoritmo módulo 11)
  - Cruces contables (1001 vs 1003, 1007 vs 1008)
  - Totales por formato
  - Encoding ISO 8859-1

### 11.3 Demo: Generador XML

- [ ] **`ExogenaGenerator.tsx`** — Demo interactivo:
  - **Step 1**: Seleccionar formatos a generar (checkboxes)
  - **Step 2**: Upload simulado de datos (o usar datos de ejemplo)
  - **Step 3**: Panel de validación en tiempo real:
    - ✅ Dígitos de verificación NIT: 100% válidos
    - ✅ Cruce 1001 vs 1003: Cuadrado
    - ⚠️ 3 registros sin dirección
    - ✅ Encoding ISO 8859-1: Correcto
  - **Step 4**: Preview del XML generado (syntax highlighted)
  - **Step 5**: Botón "Descargar XML" (genera archivo de ejemplo)

### 11.4 SVG de validación

- [ ] **`ValidationFlowSVG.tsx`** — Pipeline de validación en 6 pasos:
  1. Datos contables (tabla) → importar
  2. Mapeo a formato DIAN → columnas se reorganizan
  3. Validación NIT → check animado
  4. Cruces contables → balanza equilibrándose
  5. Generación XML → documento formándose
  6. Splitting → múltiples archivos de ≤5,000 registros

- [ ] **`NITValidatorSVG.tsx`** — Animación del algoritmo de dígito verificación:
  - Números entrando → pesos multiplicándose → módulo 11 → ✅

### 11.5 Comparativa visual

- [ ] SVG Before/After:
  - **Antes**: Prevalidadores Excel de DIAN (pantalla caótica) → semanas → errores → rechazos MUISCA
  - **Después**: Gobia → minutos → validado → 0 rechazos

**Entregables**: Página /exogena con demo de generación, validación visual, 4+ SVG nuevos

---

## Sprint 12 — Página /gemelo: Gemelo Municipal

**Objetivo**: Demo del mapa digital municipal con datos integrados.

### 12.1 Hero de la página

- [ ] **`GemeloHeroSVG.tsx`** — Mapa de Colombia estilizado con un municipio resaltado, capas de datos superpuestas
- [ ] Headline: "La réplica digital de tu municipio"
- [ ] Badge: "Próximamente"

### 12.2 Datos geográficos

- [ ] Descargar GeoJSON de municipios colombianos (HDX o DANE Geoportal)
- [ ] **`src/data/geo/colombia-departments.json`** — GeoJSON simplificado de departamentos
- [ ] **`src/data/geo/sample-municipality.json`** — GeoJSON detallado de un municipio ejemplo (Rionegro, Antioquia)
- [ ] Datos de DIVIPOLA (`gdxc-w37w`) como JSON estático

### 12.3 Demo: Mapa interactivo

**Opción A — SVG puro** (sin react-leaflet, más ligero):
- [ ] **`ColombiaMunicipalMap.tsx`** — Mapa SVG de Colombia:
  - Departamentos con hover para highlight
  - Click en departamento → zoom a municipios
  - Municipios coloreados por indicador seleccionado (IDF, población, categoría)
  - Tooltip con datos del municipio
  - Leyenda de colores

**Opción B — react-leaflet** (más funcional pero más pesado):
- [ ] Instalar `react-leaflet` + `leaflet`
- [ ] Mapa interactivo con capas GeoJSON
- [ ] Zoom, pan, popups con datos fiscales
- [ ] Choropleth por indicador

### 12.4 Panel de datos del municipio

- [ ] **`MunicipalProfile.tsx`** — Al seleccionar un municipio:
  - **Ficha general**: Nombre, departamento, categoría, población, código DANE
  - **Indicadores fiscales**: IDF, recaudo, ejecución (datos MDM)
  - **Contratación**: Top 5 contratos SECOP por valor
  - **Social**: Indicadores TerriData (si disponibles)
  - **Comparativa**: Ranking departamental

### 12.5 SVG de capas de datos

- [ ] **`DataLayersSVG.tsx`** — Diagrama de capas superpuestas:
  - Capa 1: Geografía (mapa base)
  - Capa 2: Fiscal ($ indicadores)
  - Capa 3: Social (población, salud, educación)
  - Capa 4: Infraestructura (vías, servicios)
  - Capa 5: Contratación (SECOP)
  - Animación: capas apilándose una sobre otra

### 12.6 Fuentes de datos para la demo

- [ ] Consumir DIVIPOLA para mapa base
- [ ] Consumir MDM (`nkjx-rsq7`) para indicadores por municipio
- [ ] Consumir SECOP II (`jbjy-vk9h`) para contratos del municipio seleccionado
- [ ] Datos estáticos de población del DANE

**Entregables**: Página /gemelo con mapa interactivo, perfil municipal, 3+ SVG nuevos

---

## Sprint 13 — Página /rendicion: Rendición Automatizada

**Objetivo**: Demo visual de cómo Gobia pre-genera los reportes para SIRECI, SIA y FUT.

### 13.1 Hero de la página

- [ ] **`RendicionHeroSVG.tsx`** — 3 documentos (SIRECI, SIA, FUT) siendo generados automáticamente desde un dashboard central
- [ ] Headline: "Tus reportes de rendición, sin doble digitación"
- [ ] Badge: "Próximamente"

### 13.2 Sección "El laberinto de la rendición"

- [ ] **`RendicionLazyrintSVG.tsx`** — SVG del problema:
  - 5 sistemas desconectados (SIRECI/Storm, SIA, CHIP, FUT, SECOP)
  - Flechas manuales entre ellos
  - Funcionario en el centro con expresión de frustración
  - Métricas: "15 días hábiles", "3 funcionarios dedicados", "riesgo de multa"

### 13.3 Demo: Generador de reportes

- [ ] **`RendicionDashboard.tsx`** — Demo interactivo:
  - **Timeline**: Calendario fiscal con fechas límite de cada reporte
  - **Checklist de reportes**: SIRECI ☑️, SIA ☑️, FUT ☑️, CHIP ☑️
  - **Preview de reporte**: Mockup del formato generado
  - **Progreso**: Barra de progreso por reporte
  - **Botón "Generar"**: Simula la generación con loading animation

### 13.4 SVG de flujo automatizado

- [ ] **`RendicionFlowSVG.tsx`** — Pipeline:
  1. Datos existentes en Gobia (presupuesto, ejecución, contratación)
  2. Motor de transformación (engranajes)
  3. Formatos específicos: Storm (.FMT preview), Excel (SIA), XML (CHIP)
  4. Validación automática
  5. Archivos listos para carga manual en cada sistema

### 13.5 Calendario fiscal interactivo

- [ ] **`FiscalCalendarSVG.tsx`** — SVG del calendario anual con:
  - Marcadores por mes para cada obligación
  - Colores: 🟢 cumplido, 🟡 próximo, 🔴 vencido
  - Hover: detalle de cada obligación
  - Datos reales de fechas de SIRECI (feb-mar), CHIP (trimestral), FUT (trimestral)

**Entregables**: Página /rendicion con demos, calendario fiscal, 4+ SVG nuevos

---

## Sprint 14 — Data Enrichment: Datos Reales para Demos

**Objetivo**: Enriquecer todas las demos con datos reales de múltiples fuentes gubernamentales.

### 14.1 Scraping + descarga de datos estáticos

- [ ] **SISFUT**: Script para descargar reportes de sisfut.dnp.gov.co:
  - Parsear tablas HTML con cheerio
  - Extraer indicadores presupuestales de 10 municipios ejemplo
  - Guardar como JSON en `/src/data/sisfut/`
- [ ] **DANE población**: Descargar datos poblacionales:
  - Población total, urbana, rural por municipio
  - Proyecciones 2024-2027
  - Guardar en `/src/data/dane/population.json`
- [ ] **GeoJSON municipal**: Obtener boundaries de HDX Colombia:
  - Simplificar geometrías (topojson-simplify) para < 500KB
  - Guardar en `/src/data/geo/`

### 14.2 Datasets precalculados

- [ ] **`src/data/demo-municipalities.ts`** — 10 municipios de ejemplo con datos completos:
  ```typescript
  export const demoMunicipalities = [
    {
      code: "05001", name: "Medellín", dept: "Antioquia", category: "Especial",
      population: 2569007, area_km2: 380.64,
      idf: { score: 82.3, indicators: {...} },
      budget: { ingresos: 8_200_000_000_000, gastos: 7_900_000_000_000, ejecucion: 0.963 },
      pdm: { totalMetas: 245, verde: 180, amarillo: 45, rojo: 20 },
      contracts: { total: 12500, value: 3_200_000_000_000 }
    },
    // Rionegro, Envigado, Pereira, Manizales, Bucaramanga, Pasto, Villavicencio, Santa Marta, Tunja
  ];
  ```

### 14.3 Municipio showcase

- [ ] Elegir **Rionegro, Antioquia** como municipio piloto (categoría 1, datos públicos abundantes)
- [ ] Consolidar TODOS los datos disponibles de Rionegro:
  - FUT Ingresos/Gastos
  - MDM indicadores
  - SECOP contratos
  - Datos poblacionales DANE
  - Geolocalización
- [ ] Usar como default en todos los demos

### 14.4 API endpoints enriquecidos

- [ ] **`/api/municipality/[code]`** — Endpoint que consolida datos de múltiples fuentes:
  ```json
  {
    "profile": { "name": "Rionegro", "dept": "Antioquia", ... },
    "fiscal": { "idf": 75.2, "budget": {...}, "collection": {...} },
    "social": { "population": 128120, "education": {...} },
    "contracts": { "total": 1250, "top5": [...] },
    "pdm": { "progress": 72, "alerts": 3 }
  }
  ```

**Entregables**: Base de conocimiento con datos reales de 10 municipios, GeoJSON, datos SISFUT

---

## Sprint 15 — Auth + Multi-tenant Foundation

**Objetivo**: Preparar la infraestructura para usuarios reales.

### 15.1 Supabase setup

- [ ] Crear proyecto Supabase
- [ ] Habilitar extensiones: PostGIS, pgvector, pg_trgm
- [ ] Crear schema multi-tenant:
  - `public.municipality` (datos de referencia)
  - `public.user_profile` (usuarios con municipio_id)
  - `hacienda.*` (tablas de presupuesto)
  - `pdm.*` (tablas de seguimiento)
  - `estatuto_ia.*` (chunks + embeddings)
- [ ] Configurar RLS por `municipio_id`

### 15.2 Auth

- [ ] NextAuth.js o Supabase Auth
- [ ] Login page: `/auth/login`
- [ ] Roles: admin, secretario_hacienda, planeacion, consulta
- [ ] Middleware para proteger rutas `/dashboard/*`

### 15.3 Tabla de leads

- [ ] Migrar formulario de contacto a Supabase:
  - Tabla `leads` (nombre, entidad, cargo, email, created_at, status)
  - Server action actualizado
  - Webhook a email via Resend

### 15.4 Admin panel básico

- [ ] **`/admin`** — Panel interno para equipo:
  - Lista de leads con estado (nuevo, contactado, demo, cerrado)
  - Estadísticas: leads/día, conversión, fuentes
  - Export CSV

**Entregables**: Supabase configurado, auth funcional, admin de leads

---

## Sprint 16 — CRM + Email + Integrations

**Objetivo**: Pipeline de ventas automatizado.

### 16.1 Email transaccional (Resend)

- [ ] Configurar Resend con dominio gobia.co
- [ ] Templates de email:
  - Confirmación de solicitud de demo
  - Seguimiento automático (3 días sin respuesta)
  - Resumen semanal de uso (cuando haya usuarios)
- [ ] **`src/lib/email.ts`** — Servicio de emails tipado

### 16.2 Calendly / Cal.com

- [ ] Integrar widget de agendar demo directamente en CTAFinal
- [ ] Embed de calendario en /contacto

### 16.3 WhatsApp Business

- [ ] Botón flotante de WhatsApp en la landing
- [ ] Link directo con mensaje pre-formateado:
  ```
  https://wa.me/57XXXXXXXXX?text=Hola,%20me%20interesa%20una%20demo%20de%20Gobia
  ```

### 16.4 Analytics

- [ ] Google Analytics 4 o Plausible
- [ ] Eventos de conversión: click CTA, submit form, scroll depth
- [ ] Hotjar o similar: grabaciones + mapas de calor

**Entregables**: Pipeline de ventas completo, email funcional, analytics

---

## Sprint 17 — SEO + Performance + Accessibility

**Objetivo**: Optimización técnica para posicionamiento y velocidad.

### 17.1 SEO técnico

- [ ] Metadata completa por página (title, description, OG, Twitter cards)
- [ ] **`/sitemap.xml`** generado automáticamente
- [ ] **`/robots.txt`** optimizado
- [ ] Structured data (JSON-LD): Organization, SoftwareApplication, FAQPage
- [ ] URLs canónicas
- [ ] Hreflang (es-CO)

### 17.2 Performance

- [ ] Lighthouse audit (target: 95+ en todas las categorías)
- [ ] Lazy loading de SVGs pesados (KnowledgeGraph, ColombiaMunicipalMap)
- [ ] Image optimization: hero-poster.webp + hero-poster.avif
- [ ] Font subsetting (Plus Jakarta Sans solo pesos necesarios)
- [ ] Critical CSS inlining
- [ ] Bundle analysis + tree shaking

### 17.3 Accessibility (NTC 5854)

- [ ] Auditoría aXe completa
- [ ] Contraste ≥ 4.5:1 en todos los textos (verificar ochre sobre cream)
- [ ] Navegación por teclado completa
- [ ] ARIA labels en todos los SVGs interactivos
- [ ] Skip to content link
- [ ] Focus management en modales y navegación
- [ ] Screen reader testing

### 17.4 PWA básico

- [ ] `manifest.json` con iconos de Gobia
- [ ] Service worker para offline de la landing
- [ ] Meta tags de PWA

**Entregables**: Lighthouse 95+, SEO completo, accesibilidad NTC 5854

---

## Sprint 18 — Conversion Optimization + Launch

**Objetivo**: Maximizar conversión de visitantes a leads.

### 18.1 A/B Testing foundation

- [ ] Variantes de headline del Hero:
  - A: "Gestión pública inteligente para Colombia"
  - B: "Tu hacienda pública en tiempo real"
  - C: "Deja de adivinar, gobierna con datos"
- [ ] Variantes de CTA:
  - A: "Solicitar demo"
  - B: "Ver la plataforma en acción"
  - C: "Hablar con un asesor"

### 18.2 Social proof

- [ ] Logos de entidades interesadas (con permiso)
- [ ] Testimonios de funcionarios
- [ ] Contador: "X municipios explorando Gobia"
- [ ] Press/media mentions (si los hay)

### 18.3 Content marketing

- [ ] **`/blog`** — Blog con artículos:
  - "Cómo preparar la exógena municipal 2026"
  - "Guía de rendición de cuentas SIRECI 2026"
  - "5 indicadores que todo secretario de hacienda debe monitorear"
  - "Qué es el IDF y cómo mejorarlo"
- [ ] SEO long-tail para captar búsquedas de funcionarios

### 18.4 Lead magnets

- [ ] **"Diagnóstico fiscal gratuito"**: El usuario ingresa su código DANE → Gobia muestra un reporte básico con datos públicos de su municipio
- [ ] PDF descargable: "Calendario de obligaciones fiscales 2026"
- [ ] Mini-herramienta: "Calculadora de IDF" (ingresa 6 indicadores → resultado)

### 18.5 Landing page variants

- [ ] Versión por audiencia:
  - `/para/alcaldias` — Enfocada en alcaldías pequeñas (categoría 4-6)
  - `/para/gobernaciones` — Enfocada en visión departamental
  - `/para/hacienda` — Enfocada en secretarios de hacienda

**Entregables**: Optimización de conversión, lead magnets, contenido, variantes de landing

---

## Resumen de SVGs por sprint

| Sprint | Nuevos SVGs | Total acumulado |
|--------|------------|-----------------|
| 1-4 (completados) | 8 | 8 |
| 5 | ~10 | 18 |
| 6 | ~3 templates | 21 |
| 7 | ~2 | 23 |
| 8 | ~5 | 28 |
| 9 | ~4 | 32 |
| 10 | ~5 | 37 |
| 11 | ~4 | 41 |
| 12 | ~4 | 45 |
| 13 | ~4 | 49 |
| **Total** | **~49 SVG components** | — |

## Resumen de páginas

| Ruta | Sprint | Contenido |
|------|--------|-----------|
| `/` | 5 (mejora) | Landing page SVG-first |
| `/hacienda` | 8 | Dashboard demo con datos reales |
| `/pdm` | 10 | Seguimiento PDM demo |
| `/estatuto` | 9 | Chat IA demo + grafo |
| `/exogena` | 11 | Generador XML demo |
| `/gemelo` | 12 | Mapa interactivo demo |
| `/rendicion` | 13 | Reportes + calendario fiscal |
| `/admin` | 15 | Panel de leads |
| `/blog` | 18 | Artículos de contenido |
| `/auth/login` | 15 | Login para funcionarios |

## Dependencias entre sprints

```
Sprint 5 (SVG Landing) ─────────┐
Sprint 6 (Páginas + Nav) ───────┤
Sprint 7 (Data Layer) ──────────┼── Bloquean todos los demos
                                │
Sprint 8 (Hacienda) ────────────┤
Sprint 9 (Estatuto IA) ────────┤── Pueden hacerse en paralelo
Sprint 10 (PDM) ───────────────┤   después de Sprint 7
Sprint 11 (Exógena) ───────────┤
Sprint 12 (Gemelo) ────────────┤
Sprint 13 (Rendición) ─────────┘

Sprint 14 (Data Enrichment) ────── Mejora todos los demos
Sprint 15 (Auth + DB) ─────────── Pre-requisito para backend
Sprint 16 (CRM + Email) ──────── Post auth
Sprint 17 (SEO + Perf) ────────── Independiente
Sprint 18 (Conversion) ────────── Final
```

## Datos que necesitamos del usuario

| Recurso | Para | Sprint | Prioridad |
|---------|------|--------|-----------|
| Resend API key | Emails funcionales | 5 | Alta |
| App token datos.gov.co | Rate limits en API | 7 | Media |
| Municipio piloto real | Demo con datos reales | 8 | Alta |
| Estatuto tributario PDF | Knowledge base real | 9 | Alta |
| Logo de Gobia (SVG) | Branding en todas las páginas | 5 | Alta |
| Supabase project | Base de datos | 15 | Media |
| Anthropic API key | RAG pipeline | 9 | Media |
| Dominio de email | cristian@gobia.co para Resend | 16 | Media |
| Google Analytics ID | Tracking | 16 | Baja |
| Número WhatsApp Business | Chat directo | 16 | Baja |

---

*Plan generado: Marzo 2026*
*Proyecto: gobia.co — inplux.co para sector público colombiano*
