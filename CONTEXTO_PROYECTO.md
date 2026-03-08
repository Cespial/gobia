# Arquitectura técnica completa para INPLUX: sector público colombiano

**INPLUX puede construir sus seis productos de sector público sobre un monolito modular con Next.js, PostgreSQL (PostGIS + pgvector), un pipeline RAG híbrido y conexión programática a datos.gov.co como única fuente gubernamental con API real.** La mayoría de sistemas gubernamentales colombianos (CHIP, SIRECI, SICODIS, SIGEP) operan con aplicaciones de escritorio propietarias sin APIs públicas, lo que exige estrategias de ETL basadas en descarga automatizada y procesamiento de archivos planos. Este informe detalla cada fuente de datos, arquitectura por producto, stack de IA, infraestructura y esquemas de base de datos listos para implementación en Claude Code.

---

## A. Mapa completo de fuentes gubernamentales colombianas

El ecosistema de datos públicos colombianos presenta una limitación estructural crítica: **solo datos.gov.co ofrece una API REST moderna** (Socrata SODA). Los demás sistemas requieren integración mediante descarga de archivos, scraping controlado o generación de formatos propietarios.

### DNP — Departamento Nacional de Planeación

**TerriData** (`https://terridata.dnp.gov.co`) consolida indicadores socioeconómicos de los **1.122 municipios** colombianos organizados por Dimensión → Categoría → Variable. El acceso programático se realiza exclusivamente vía datos.gov.co con el dataset ID `64cq-xb2k` y endpoint SODA: `https://www.datos.gov.co/resource/64cq-xb2k.json`. Soporta SoQL para filtrado por departamento, municipio o indicador. Datos en formato JSON/CSV sin autenticación obligatoria, aunque se recomienda un app token para superar el límite de throttling compartido.

**SICODIS** (`https://sicodis.dnp.gov.co`) publica distribuciones de SGP y SGR por entidad territorial desde 2002. Acceso web con registro gratuito; las descargas son exclusivamente en Excel. No existe API. Los reportes incluyen distribución por doceavas mensuales, documentos CONPES y desglose SGP por sector (educación, salud, agua, propósito general). **CIFFIT** (`https://ciffit.dnp.gov.co`) consolida datos de FUT, CUIPO, SGR y AESGPRI con indicadores de desempeño fiscal calculados — acceso público web, sin API.

**Kit de Planeación Territorial / SisPT** (`https://sispt.dnp.gov.co`) es la plataforma digital para construir Planes de Desarrollo Territorial. Requiere credenciales institucionales. Para el período 2024-2027, SisPT reemplazó al KPT original y soporta carga masiva de indicadores de producto vinculados al PND.

### Contraloría General de la República

**SIRECI** (`https://www.contraloria.gov.co/web/sireci`) es el canal obligatorio para rendición de cuentas ante la CGR. Opera mediante **StormUser** (aplicación de escritorio para diligenciamiento) y **StormWeb** (módulo web para transmisión). Los formatos son propietarios `.FMT` procesados por la plataforma Storm — **no XML, no JSON, no API pública**. Los plazos de rendición son individuales por entidad, generalmente entre el último día hábil de febrero y el cuarto de marzo. Los soportes aceptan formatos DOC, XLS, PDF, GIF, JPG, TXT y PNG (máximo 5MB cada uno).

**SIA Contralorías** (`https://siacontralorias.auditoria.gov.co`) es administrado por la Auditoría General de la República y utilizado por contralorías departamentales y municipales. Los anexos requeridos incluyen ejecución presupuestal (ingresos/gastos), situación de tesorería, cierre fiscal por fuente de financiación y ejecución SGR. Datos en Excel y Word. **SIA Observa** (`https://siaobserva.auditoria.gov.co`) es el portal público de consulta ciudadana sin autenticación.

Para SIRECI, la automatización de INPLUX debe enfocarse en **pre-generar los datos estructurados** que luego se cargan manualmente en StormUser, generando archivos Excel/CSV compatibles con la importación de datos planos del sistema.

### Contaduría General de la Nación — CHIP

**CHIP** (`https://www.chip.gov.co`) es el Consolidador de Hacienda e Información Pública, plataforma central donde todas las entidades territoriales reportan información financiera. Funciona mediante **CHIP Local** (aplicación de escritorio, versión actual 24.6.0) que permite importar datos desde archivos planos convertidos de Excel. No existe API pública; los usuarios estratégicos (DNP, CGR, DAF) acceden vía FTP.

Las **categorías de información** clave para municipios son:

- **CGN**: Información Contable Pública Convergencia (trimestral/anual), Evaluación Control Interno Contable (anual), BDME — Boletín de Deudores Morosos del Estado (semestral, cortes mayo 31 y noviembre 30)
- **CGR**: Presupuestal, Sistema General de Regalías, Personal y Costos
- **FUT**: CUIPO (Categoría Única de Información del Presupuesto Ordinario) y categorías sectoriales (educación, salud, agua potable, propósito general, PAE)
- **Otras**: AESGPRI, CONPES, SIGUEME

La regulación vigente es la **Resolución 111 de 2025** (reemplaza la 421/2016) y la **Resolución 138/2025** para categorías administradas por CGN.

### FUT — Formulario Único Territorial

Establecido por Ley 962/2005 (Art. 31) y Decreto 1536/2016, el FUT es el formulario estandarizado para recopilar datos de ejecución presupuestal de todas las entidades territoriales. Se reporta **trimestralmente** a través de CHIP con cortes marzo 31, junio 30, septiembre 30 y diciembre 31. **SISFUT** (`http://sisfut.dnp.gov.co`) permite consulta pública de más de 200 indicadores presupuestales y fiscales. Los datos se reportan en miles de pesos.

### DIAN — Información exógena

La **información exógena** es la obligación anual de reportar datos detallados de operaciones económicas con terceros. Los municipios están obligados específicamente por el **Artículo 54 de la Resolución 000162/2023** para datos del impuesto ICA. La resolución vigente consolidada es la **000227 de septiembre 2025**, modificada por la **000233 de octubre 2025**.

Los formatos clave para sector público incluyen: **1001** (pagos/deducciones a terceros), **1003** (retenciones practicadas), **1007** (ingresos recibidos), **1008** (cuentas por cobrar), **1009** (cuentas por pagar), **2276** (certificados de ingresos empleados). Los archivos deben ser **XML con codificación ISO 8859-1**, validados contra XSD específicos por formato. La convención de nombres es de 33 caracteres: `Dmuisca_[concepto][formato][versión][año][secuencia].xml`, con máximo **5.000 registros por archivo**. Los prevalidadores (Excel) están disponibles en `https://www.dian.gov.co/impuestos/sociedades/ExogenaTributaria/Prevalidadores/`. **No existe API REST para exógena** — la presentación es exclusivamente vía portal MUISCA (`https://muisca.dian.gov.co`). Sin embargo, para facturación electrónica sí existen **Web Services SOAP** basados en UBL v2.1.

### DANE y datos abiertos

**datos.gov.co** (`https://www.datos.gov.co`) opera sobre **Socrata** (no CKAN) con la API SODA 2.0/3.0. El patrón de endpoint es `https://www.datos.gov.co/resource/{dataset-id}.json` con SoQL para filtrado. SDKs disponibles: Python (sodapy), JavaScript, R (RSocrata). Autenticación opcional pero recomendada vía app token (header `X-App-Token`) para hasta 1.000 requests/hora.

Datasets municipales clave: TerriData (`64cq-xb2k`), Departamentos y Municipios (`xdk5-pm3f`), SECOP II Contratos (`jbjy-vk9h`), SECOP I (`f789-7hwg`), entidades CHIP (`5c7g-ptic`). El **geoportal DANE** (`https://geoportal.dane.gov.co`) ofrece servicios ArcGIS REST en `https://portalgis.dane.gov.co/portal/sharing/rest/` con shapefiles y datos espaciales de todos los municipios.

### Sobre "IAS"

La investigación exhaustiva confirma que **"IAS" no corresponde a un sistema o requerimiento de reporte independiente** en el sector público colombiano. Las coincidencias más cercanas son: (1) el componente "Actividades de Supervisión" del marco COSO 2013 aplicado al control interno público, evaluado via la categoría ECIC en CHIP; (2) los reportes sectoriales de Superintendencias, que usan plataformas específicas (SuRI para SuperFinanciera, VIGIA para SuperTransporte). Para el producto "Rendición IAS" de INPLUX, se recomienda enfocarlo hacia la automatización de rendición de cuentas ante CGR (SIRECI) y contralorías territoriales (SIA).

### Tabla resumen de accesibilidad programática

| Sistema | URL | API | Formatos | Autenticación |
|---------|-----|-----|----------|---------------|
| datos.gov.co | datos.gov.co | ✅ SODA REST | JSON, CSV, GeoJSON | App token opcional |
| DANE Geoportal | geoportal.dane.gov.co | ✅ ArcGIS REST | Shapefile, JSON | Ninguna |
| SECOP II | datos.gov.co | ✅ SODA REST | JSON, CSV, XML | App token |
| DIAN Facturación | micrositios.dian.gov.co | ✅ SOAP | UBL 2.1 XML | Certificado digital |
| DIAN Exógena | muisca.dian.gov.co | ❌ Web only | XML (ISO 8859-1) | IFE + RUT |
| TerriData | terridata.dnp.gov.co | ✅ vía datos.gov.co | JSON, CSV | Opcional |
| SICODIS | sicodis.dnp.gov.co | ❌ | Excel | Registro gratuito |
| CHIP | chip.gov.co | ❌ (FTP estratégico) | Propietario, archivos planos | Credenciales CGN |
| SIRECI | contraloria.gov.co/web/sireci | ❌ | Propietario Storm, PDF | Credenciales CGR |
| SISFUT | sisfut.dnp.gov.co | ❌ | Web reports | Público |
| SIGEP II | funcionpublica.gov.co | ❌ | Web forms | Credenciales |
| SUI | sui.superservicios.gov.co | ✅ vía datos.gov.co | CSV, JSON | Varía |

---

## B. Arquitectura técnica: monolito modular con extracción a microservicios

La arquitectura recomendada es un **monolito modular** donde cada producto es un bounded context con interfaces claras, desplegado como una aplicación Next.js unificada. Esta decisión se fundamenta en tres factores: los presupuestos gubernamentales colombianos son restrictivos, un equipo menor a 30 desarrolladores no justifica la complejidad operacional de microservicios completos, y el DDD natural de los 6 productos permite extracción futura sin rediseño.

### Servicios Docker Compose

```yaml
services:
  app:          # Next.js 15 (App Router) — todos los módulos
  postgres:     # PostgreSQL 16 + PostGIS + pgvector + pg_cron
  redis:        # Redis 7 — caché, BullMQ, sesiones
  ai-service:   # Python FastAPI — RAG/LLM pipelines
  worker:       # BullMQ worker — jobs en background
  minio:        # MinIO — almacenamiento S3-compatible para documentos
```

Si algún módulo requiere escalamiento independiente (típicamente el servicio de IA), se extrae como microservicio. Los **límites de servicio recomendados** para extracción futura son: Core Data Service, Document Generation Service, AI/RAG Service, Notification/Alert Service, y Auth & Tenant Service.

### Multi-tenancy con Row-Level Security

El modelo multi-tenant usa **RLS (Row-Level Security)** con columna `municipio_id` en todas las tablas tenant, configurando `SET app.current_municipality` por sesión. Las políticas RLS garantizan aislamiento automático. Este enfoque es más simple que schema-per-tenant para la escala esperada (<1.000 municipios).

```sql
-- Política RLS ejemplo
CREATE POLICY municipio_isolation ON hacienda.presupuesto
  USING (municipio_id = current_setting('app.current_municipality')::int);
```

### Extensiones PostgreSQL requeridas

| Extensión | Propósito |
|-----------|-----------|
| **PostGIS** | Datos espaciales del Gemelo Municipal (geometrías municipales, infraestructura) |
| **pgvector** | Embeddings vectoriales para Estatuto IA y RAG |
| **pg_cron** | Jobs programados (generación reportes, ETL, alertas) |
| **pg_trgm** | Búsqueda difusa por similaridad trigrama |
| **pg_textsearch** o **ParadeDB pg_search** | BM25 ranking para búsqueda híbrida |

---

## C. Esquemas de base de datos por producto

### Gemelo Municipal — Réplica digital con PostGIS

PostGIS es la elección definitiva sobre bases espaciales dedicadas: extiende PostgreSQL sin infraestructura adicional, cumple OGC con 300+ funciones espaciales, y soporta los SRID relevantes para Colombia — **SRID 4326** (WGS 84) para almacenamiento y **EPSG:3116** (MAGNA-SIRGAS / Colombia Bogotá) para cálculos de distancia.

```sql
CREATE SCHEMA gemelo_municipal;

CREATE TABLE gemelo_municipal.municipio (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  codigo_dane VARCHAR(5) UNIQUE NOT NULL,
  departamento VARCHAR(100),
  categoria INT,
  geometry GEOMETRY(POLYGON, 4326)
);

CREATE TABLE gemelo_municipal.poblacion (
  id SERIAL PRIMARY KEY,
  municipio_id INT REFERENCES gemelo_municipal.municipio(id),
  periodo DATE,
  total BIGINT, urbana BIGINT, rural BIGINT,
  estratos JSONB, -- {"1": 5000, "2": 3000, ...}
  grupos_edad JSONB
);

CREATE TABLE gemelo_municipal.finanzas_resumen (
  id SERIAL PRIMARY KEY,
  municipio_id INT REFERENCES gemelo_municipal.municipio(id),
  vigencia INT, ingresos_totales NUMERIC(18,2),
  gastos_totales NUMERIC(18,2), deuda NUMERIC(18,2),
  idf_score NUMERIC(5,2)
);

CREATE TABLE gemelo_municipal.indicadores_sociales (
  id SERIAL PRIMARY KEY,
  municipio_id INT, dimension TEXT, indicador TEXT,
  valor NUMERIC, periodo DATE, fuente TEXT
);

CREATE TABLE gemelo_municipal.infraestructura (
  id SERIAL PRIMARY KEY,
  municipio_id INT, tipo TEXT, nombre TEXT,
  estado TEXT, geometry GEOMETRY(POINT, 4326),
  metadata JSONB
);
```

La **estrategia de fusión de datos** sigue el patrón Medallion (Bronze/Silver/Gold): los datos crudos de cada fuente gubernamental aterrizan en un schema `raw_data` (append-only, timestamped), se transforman en `clean_data` (deduplicados, normalizados con códigos DANE) y se materializan en `analytics` como vistas materializadas para dashboards.

### Seguimiento PDM — Plan de Desarrollo Municipal

Los PDM colombianos se estructuran jerárquicamente según la metodología DNP: **Líneas Estratégicas → Sectores → Programas → Subprogramas → Metas de Producto → Indicadores**. El Plan Indicativo anualiza las metas con targets por vigencia.

```sql
CREATE SCHEMA seguimiento_pdm;

CREATE TABLE seguimiento_pdm.plan_desarrollo (
  id SERIAL PRIMARY KEY,
  municipio_id INT NOT NULL,
  nombre TEXT, periodo_inicio INT, periodo_fin INT,
  estado TEXT, acuerdo_aprobacion TEXT
);

CREATE TABLE seguimiento_pdm.meta_producto (
  id SERIAL PRIMARY KEY,
  programa_id INT, codigo TEXT, descripcion TEXT,
  indicador_nombre TEXT, unidad_medida TEXT,
  linea_base NUMERIC, meta_cuatrienio NUMERIC
);

CREATE TABLE seguimiento_pdm.meta_anualizada (
  id SERIAL PRIMARY KEY,
  meta_producto_id INT, vigencia INT,
  meta_programada NUMERIC, meta_ejecutada NUMERIC,
  fecha_corte DATE, observaciones TEXT
);

CREATE TABLE seguimiento_pdm.alerta (
  id SERIAL PRIMARY KEY,
  meta_id INT, tipo_alerta TEXT,
  severidad TEXT CHECK (severidad IN ('critica','alta','media','baja')),
  mensaje TEXT, fecha_generacion TIMESTAMPTZ, resuelta BOOLEAN DEFAULT FALSE
);
```

El **sistema semáforo** calcula eficacia como `(meta_ejecutada / meta_programada) × 100`: 🟢 ≥80%, 🟡 50-79%, 🔴 <50%. Las alertas se disparan vía pg_cron + BullMQ: meta rezagada (revisión trimestral), subejecución presupuestal (>30% debajo del plan), proximidad a fecha límite con bajo avance, indicadores con ejecución cero.

### Hacienda Dashboard — Finanzas públicas municipales

Los KPIs se alinean con el **Índice de Desempeño Fiscal (IDF)** del DNP (Ley 617/2000), fórmula: `IDF = (0.8 × Resultados Fiscales) + (0.2 × Gestión Financiera)`. Los **6 indicadores de resultados fiscales** son: autofinanciamiento del funcionamiento, respaldo de la deuda, dependencia de transferencias, generación de recursos propios, magnitud de la inversión y capacidad de ahorro.

```sql
CREATE SCHEMA hacienda;

CREATE TABLE hacienda.presupuesto (
  id SERIAL PRIMARY KEY,
  municipio_id INT, vigencia INT,
  tipo TEXT CHECK (tipo IN ('ingreso','gasto')),
  rubro_codigo TEXT, rubro_nombre TEXT, nivel INT, padre_id INT,
  apropiacion_inicial NUMERIC(18,2),
  apropiacion_definitiva NUMERIC(18,2),
  recaudo_ejecutado NUMERIC(18,2), periodo DATE
);

CREATE TABLE hacienda.recaudo (
  id SERIAL PRIMARY KEY,
  municipio_id INT, vigencia INT, concepto TEXT,
  tipo_impuesto TEXT, meta_recaudo NUMERIC(18,2),
  recaudo_real NUMERIC(18,2), periodo DATE
);

CREATE TABLE hacienda.cartera (
  id SERIAL PRIMARY KEY,
  municipio_id INT, vigencia INT,
  tipo_tributo TEXT, periodo_deuda TEXT,
  saldo_inicial NUMERIC(18,2), cobrado NUMERIC(18,2),
  recaudado NUMERIC(18,2), saldo_final NUMERIC(18,2),
  edad_cartera TEXT
);

CREATE TABLE hacienda.ejecucion_presupuestal (
  id SERIAL PRIMARY KEY,
  municipio_id INT, vigencia INT, mes INT,
  tipo TEXT, apropiacion NUMERIC(18,2),
  compromiso NUMERIC(18,2), obligacion NUMERIC(18,2),
  pago NUMERIC(18,2)
);
```

Los componentes de dashboard incluyen: **waterfall de ejecución presupuestal** (apropiación → compromiso → obligación → pago), **gauge de recaudo** por tipo de impuesto (predial, ICA, otros), **perfil de deuda** con cronograma de amortización, y **scorecard IDF** con semáforo por indicador y ranking nacional.

### Estatuto Municipal IA — RAG sobre normativa tributaria

```sql
CREATE SCHEMA estatuto_ia;

CREATE TABLE estatuto_ia.estatuto (
  id SERIAL PRIMARY KEY,
  municipio_id INT, nombre TEXT, version TEXT,
  fecha_vigencia DATE, documento_original_url TEXT
);

CREATE TABLE estatuto_ia.articulo (
  id SERIAL PRIMARY KEY,
  estatuto_id INT REFERENCES estatuto_ia.estatuto(id),
  numero TEXT, titulo TEXT, libro TEXT, capitulo TEXT,
  texto_completo TEXT,
  referencias_legales TEXT[],
  vigente BOOLEAN DEFAULT TRUE
);

CREATE TABLE estatuto_ia.chunk (
  id SERIAL PRIMARY KEY,
  articulo_id INT REFERENCES estatuto_ia.articulo(id),
  municipio_id INT NOT NULL,
  contenido TEXT NOT NULL,
  metadata JSONB, -- {article_number, chapter, tax_type, effective_date}
  embedding VECTOR(1024), -- BGE-M3 dimension
  chunk_order INT
);

-- HNSW index para búsqueda vectorial aproximada
CREATE INDEX idx_chunk_embedding ON estatuto_ia.chunk
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

-- GIN index para full-text search en español
CREATE INDEX idx_articulo_fts ON estatuto_ia.articulo
  USING gin (to_tsvector('spanish', texto_completo));

-- Index de municipio para búsquedas filtradas multi-tenant
CREATE INDEX idx_chunk_municipio ON estatuto_ia.chunk (municipio_id);
```

### Exógena Sector Público — Generación XML para DIAN

```sql
CREATE SCHEMA exogena;

CREATE TABLE exogena.configuracion (
  id SERIAL PRIMARY KEY,
  municipio_id INT, vigencia INT,
  resolucion_aplicable TEXT, fecha_limite DATE, estado TEXT
);

CREATE TABLE exogena.formato (
  id SERIAL PRIMARY KEY,
  configuracion_id INT, numero_formato VARCHAR(10),
  version VARCHAR(5), descripcion TEXT,
  esquema_campos JSONB -- definición de campos según XSD de DIAN
);

CREATE TABLE exogena.registro (
  id SERIAL PRIMARY KEY,
  formato_id INT, datos JSONB,
  validado BOOLEAN DEFAULT FALSE, errores JSONB
);

CREATE TABLE exogena.archivo_xml (
  id SERIAL PRIMARY KEY,
  formato_id INT,
  nombre_archivo VARCHAR(33), -- convención DIAN: Dmuisca_[concepto][formato]...
  contenido_xml TEXT, num_registros INT,
  estado TEXT, fecha_generacion TIMESTAMPTZ
);
```

La generación XML usa **fast-xml-parser** o **xmlbuilder2** en Node.js. El pipeline es: extracción de datos contables → mapeo a especificación DIAN por formato → validación (algoritmo de dígito verificación NIT, totales, completitud) → generación XML con encoding ISO 8859-1 → splitting en archivos de máximo 5.000 registros → interfaz de revisión para contador → exportación final para carga en MUISCA.

---

## D. Stack de IA y NLP para normativa tributaria colombiana

### Estrategia de modelos LLM por niveles

**Nivel 1 — Razonamiento principal (API)**: **Claude Sonnet 4** ($3/$15 por MTok) ofrece el mejor balance entre calidad de razonamiento legal, costo y ventana de contexto de **200K tokens**. GPT-4o ($2.50/$10 por MTok) como alternativa con ecosistema amplio. Para consultas de alto volumen simples (clasificación, extracción), GPT-4o mini ($0.15/$0.60 por MTok).

**Nivel 2 — Auto-hospedado para soberanía de datos**: **Llama 4 Scout** (licencia Apache, 128K contexto) es la mejor opción open-source, desplegable via vLLM en infraestructura GPU. **Mistral Small 3 (24B)** como alternativa más eficiente con soporte nativo de español. Ambos permiten fine-tuning con corpus legal colombiano.

**Nivel 3 — Modelos encoder especializados para NER y clasificación**: **MEL (Modelo de Español Legal)** basado en XLM-RoBERTa-large, fine-tuned en documentos legales españoles (enero 2025, arXiv:2501.16011). **RoBERTalex** de PlanTL-GOB-ES (HuggingFace: `PlanTL-GOB-ES/RoBERTalex`), entrenado exclusivamente en corpus legal español. **MarIA** y **RoBERTa-BNE** para tareas generales de NLP en español.

### Modelos de embeddings recomendados

La elección primaria es **BGE-M3** (BAAI, MIT license, 1024 dimensiones, 8192 tokens máximo): multi-funcional (dense + sparse + multi-vector), soporta 100+ idiomas, ideal para búsqueda híbrida. Como complemento especializado en español: **jina-embeddings-v2-base-es** (Apache 2.0, 768 dims, 8192 tokens), que supera a BGE-M3 específicamente en benchmarks MTEB de español. Para máxima calidad con presupuesto: **Qwen3-Embedding-8B** (#1 en MTEB multilingüe con score 70.58, junio 2025). Re-ranker: **bge-reranker-v2-m3** (open-source, multilingüe).

### Base de datos vectorial: pgvector como elección definitiva

**pgvector + pgvectorscale + pg_textsearch/ParadeDB** es la recomendación primaria. La justificación es contundente: ya está en el stack PostgreSQL, no agrega infraestructura, pgvectorscale alcanza **471 QPS al 99% recall en 50M vectores** — más que suficiente para el corpus normativo de INPLUX (estimado <1M chunks). La búsqueda híbrida se implementa enteramente en PostgreSQL combinando cosine distance de pgvector con BM25 scores via CTEs y fusión RRF. Como respaldo, **Qdrant** (Rust, Apache 2.0, Docker: `docker pull qdrant/qdrant`) ofrece el mejor rendimiento puro si se necesita un servicio vectorial dedicado.

Pinecone se descarta por problemas de soberanía de datos (SaaS sin opción de auto-hospedaje). ChromaDB solo para prototipado. Weaviate y Milvus son excesivos para esta escala.

### Pipeline RAG óptimo para normativa colombiana

El pipeline sigue una arquitectura **RAG híbrida multi-etapa**:

**Ingesta**: Documentos PDF/DOCX del estatuto tributario → Extracción de texto (LlamaParse o Unstructured.io) → **Parsing estructural** detectando Libros, Títulos, Capítulos, Artículos → Chunking jerárquico con artículo como unidad primaria → Enriquecimiento de metadatos (número de artículo, capítulo, referencias legales, tipo de impuesto, fecha vigencia) → Generación de embeddings (BGE-M3) → Almacenamiento en pgvector.

**Chunking legal crítico**: Se utiliza **Summary-Augmented Chunks (SAC)** — cada chunk de artículo se prepende con un resumen de contexto de ~150 caracteres (e.g., "Estatuto Tributario, Libro Primero, Título I, Capítulo II, Art. 23 — Entidades no contribuyentes"). Tamaño óptimo: **512-1024 tokens con overlap de 100 tokens**. Para artículos largos, sliding window manteniendo metadata de boundaries.

**Consulta**: Query del usuario → Embedding → **Búsqueda híbrida** (pgvector cosine similarity + PostgreSQL full-text search español) → **Fusión RRF** (Reciprocal Rank Fusion, k=60) en top-20 resultados → **Re-ranking** con bge-reranker-v2-m3 → Ensamblaje de contexto (top-5 chunks + resúmenes) → **Generación LLM** (Claude/GPT-4o) con instrucción de citación obligatoria → **Verificación post-generación**: extraer artículos citados del output y verificar existencia en knowledge base.

**Frameworks**: LangChain + LangGraph para orquestación, LlamaIndex para parsing de documentos (especialmente LlamaParse para PDFs legales), Langfuse (open-source) o LangSmith para observabilidad.

### Knowledge graph con Neo4j para relaciones normativas

Las leyes colombianas referencian extensivamente entre sí (ET Art. 437 referencia Art. 420, que referencia Art. 437-2). Un **grafo de conocimiento** en Neo4j captura estas relaciones con nodos tipados (`:Ley`, `:Articulo`, `:Paragrafo`, `:Concepto_DIAN`, `:Sentencia`, `:Formulario`, `:Obligacion_Tributaria`, `:Tipo_Contribuyente`) y relaciones (`:CONTIENE`, `:REFERENCIA`, `:MODIFICADO_POR`, `:DEROGADO_POR`, `:INTERPRETA`). GraphRAG mejora la relevancia de retrieval en **14% NDCG** y **4.3% precisión** comparado con RAG convencional en texto legal. La integración usa **LangChain GraphCypherQAChain** para convertir lenguaje natural a consultas Cypher. Despliegue: Neo4j Community Edition (GPLv3, self-hosted) o AuraDB ($65+/mes managed).

**Alternativa pragmática**: Si la complejidad de Neo4j no se justifica inicialmente, usar CTEs recursivos en PostgreSQL con una tabla `referencia_cruzada` para consultas graph-like sin infraestructura adicional.

### Enfoque de desarrollo: RAG primero, fine-tuning selectivo después

**Fase 1 (meses 1-6)**: RAG puro sobre corpus normativo colombiano con Claude Sonnet 4 / GPT-4o como LLM de razonamiento. Construir pipeline de evaluación (precisión de respuestas, corrección de citaciones, tasa de alucinación). Recolectar queries de usuarios y respuestas validadas por expertos como datos de entrenamiento.

**Fase 2 (meses 6-12)**: Fine-tune de Llama 4 8B o Mistral Small 3 mediante LoRA/QLoRA usando LLaMA Factory o Unsloth (2x más rápido, 70% menos memoria). El fine-tuning es para **comportamiento** (terminología legal colombiana, patrones de razonamiento tributario, formato de citaciones) — el RAG sigue proveyendo el **conocimiento factual** actual.

**Fase 3 (meses 9-15)**: Fine-tune del modelo de embeddings (BGE-M3 o jina-es) con pares query-passage reales de interacciones de usuarios. Mejora esperada: **10-20% en precisión de retrieval** para consultas domain-specific.

### Agentes autónomos con LangGraph

La arquitectura de agentes usa **LangGraph** para flujos complejos con lógica condicional y **gates de aprobación humana** (crítico para submissions gubernamentales). Los agentes especializados son: Router Agent (clasifica intención), Tax Calculator Agent (cálculos IVA, retención, renta), Form Filling Agent (genera formatos DIAN), Legal Research Agent (RAG + knowledge graph), Validation Agent (verificación cruzada) y Report Generation Agent (compilación y formateo).

---

## E. ETL y orquestación de datos gubernamentales

**Apache Airflow 3.0** (liberado abril 2025) es la recomendación primaria para orquestación ETL: estándar de industria con 30M+ descargas mensuales, nuevo en v3 con versionamiento de DAGs, SDKs multi-lenguaje y scheduling event-driven. Alternativas viables: Prefect (interfaz Python más simple, mejor para equipos pequeños) y Dagster (enfoque asset-first, mejor para data quality y lineage).

El calendario de ingestión sigue el calendario fiscal colombiano: diario para resoluciones y conceptos DIAN nuevos, semanal para Diario Oficial (leyes/decretos nuevos), mensual para acuerdos municipales, trimestral para datos FUT y re-indexación completa, anual para procesamiento de reformas tributarias. Las herramientas de parsing incluyen Unstructured.io/LlamaParse (PDFs), lxml (XML), Polars/Pandas (Excel/CSV) y Great Expectations/Pydantic para validación de calidad.

**Costo mensual estimado del stack completo en producción**: $1.500-$5.000 USD — incluyendo API LLM ($500-$2.000), infraestructura GPU para modelos self-hosted ($500-$1.500), PostgreSQL managed ($100-$300), Neo4j ($65+), Airflow ($200-$500).

---

## F. Frontend, visualización y estándares de gobierno digital

### Stack de visualización recomendado

**Tremor** (`https://tremor.so`) es la elección primaria para dashboard charts — construido nativamente sobre React + Tailwind CSS + Radix UI, exactamente el stack de INPLUX. Provee componentes dashboard-first como `<BarChart>`, `<DonutChart>`, `<AreaChart>`, `<KPI Card>`. **Recharts** como complemento para charts customizados que Tremor no cubra (Recharts es el motor subyacente de Tremor, interoperan perfectamente). **Nivo** para visualizaciones especializadas como choropleth maps, Sankey diagrams (flujos presupuestales) y treemaps (distribución de gasto por sector).

Para **mapas municipales**: **react-leaflet** con GeoJSON del geoportal DANE es la opción gratuita óptima. Fuentes de GeoJSON colombiano: DANE Official Geoportal (`https://geoportal.dane.gov.co`), HDX Colombia COD-AB (`https://data.humdata.org/dataset/cod-ab-col`), y repositorios GitHub (john-guerra GeoJSON municipios). Se deben usar **códigos DIVIPOLA del DANE** como identificador estándar vinculando datos geográficos con datos fiscales/tributarios.

### Componentes UI y formularios

**shadcn/ui** (`https://ui.shadcn.com`) como sistema de componentes principal — alineado perfectamente con React 19 + Tailwind + Radix UI. **TanStack Table v8** para tablas de datos gubernamentales masivos con virtualización (100K+ filas), sorting, filtering y paginación. **React Hook Form + Zod** para formularios complejos de declaraciones tributarias con validación TypeScript.

### Cumplimiento de estándares colombianos

La **NTC 5854** (equivalente colombiano de WCAG 2.0) exige conformidad mínimo **Nivel AA**, mandado por la **Resolución 1519 de 2020** de MinTIC. Checklist de implementación: HTML5 semántico con ARIA attributes (shadcn/ui y Radix los proveen por defecto), navegación por teclado completa, contraste de color ≥4.5:1, compatibilidad con lectores de pantalla, diseño responsive. Usar `eslint-plugin-jsx-a11y` en el pipeline de desarrollo y testing con aXe/Lighthouse.

El **Manual de Gobierno Digital** (`https://gobiernodigital.mintic.gov.co`) bajo Decreto 767/2022 exige integración con el Portal Único GOV.CO, publicación de datos abiertos en datos.gov.co, cumplimiento del Marco de Referencia de Arquitectura Empresarial (MRAE), y el Modelo de Seguridad y Privacidad de la Información (MSPI) alineado con ISO 27001.

---

## G. DevOps, cloud y seguridad para datos gubernamentales

### Infraestructura cloud y soberanía de datos

**Ningún proveedor cloud mayor tiene data center en Colombia.** Las opciones más cercanas son AWS São Paulo (sa-east-1, ~4.500km), Azure Brazil South y GCP Santiago (southamerica-west1, ~4.100km). La Ley 1581/2012 Art. 26 prohíbe transferencia de datos personales a países sin protección adecuada, pero **no exige localización estricta** de datos gubernamentales en territorio colombiano. Sin embargo, el Proyecto de Ley 247/2025 podría introducir requisitos más estrictos con sanciones de hasta 10.000 SMMLV.

**Recomendación**: **AWS São Paulo (sa-east-1)** como región primaria con CloudFront edge en Bogotá para baja latencia. Para datos sensibles que deban permanecer en Colombia, considerar proveedores locales (Claro Cloud, Tigo Cloud) en modelo híbrido, o AWS Outposts para servicios AWS on-premises. Esquema: PII y datos tributarios sensibles en infraestructura colombiana, compute y CDN en AWS.

### CI/CD y orquestación

**GitHub Actions** para CI/CD: PR → Lint/Type-check → Unit Tests → Build → Deploy Staging → E2E Tests → Deploy Production. Estrategia de ramas: main (producción) ← staging ← feature branches. Para contenedores en producción: **AWS ECS Fargate** (más simple que Kubernetes) para municipios individuales, **EKS** solo si se escala a plataforma multi-municipio SaaS. Infraestructura como código con **Terraform** o AWS CDK (TypeScript-native).

### Marco legal de seguridad

La **Ley 1581 de 2012** (Habeas Data) requiere: consentimiento explícito para procesamiento de datos personales, derechos de acceso/actualización/rectificación/eliminación, registro de bases de datos ante la SIC, designación de oficial de protección de datos. Complementan: Ley 1266/2008 (habeas data financiero), Decreto 1377/2013 (reglamentación), Resolución 1519/2020 Anexo 3 (seguridad digital gobierno).

Medidas técnicas obligatorias: cifrado en reposo (AES-256) y en tránsito (TLS 1.3), RLS en PostgreSQL para aislamiento multi-municipio, MFA para usuarios administrativos, **audit logging completo** de todos los accesos a datos (requerimiento legal), backups cifrados offsite, cumplimiento OWASP Top 10 con helmet.js para headers HTTP y CSP.

### Monitoreo

**Grafana + Prometheus + Loki** como stack unificado open-source (datos no salen de Colombia). Sentry (self-hosted) para error tracking en tiempo real. pg_stat_statements para performance de queries. SLAs objetivo: **99.5% uptime** para servicios ciudadanos, **99.9%** para operaciones internas, respuesta <3s para dashboards.

---

## H. Referentes internacionales y ecosistema GovTech

### Digital twins municipales de referencia

**Singapore (Virtual Singapore)** es el referente más completo: evolucionó de mapas 3D (2014) a simulaciones en tiempo real (2018) y luego integración de IA (2022). **Helsinki** usa su digital twin para monitoreo energético hacia carbono-neutralidad 2035, con participación ciudadana via OmaStadi. **Barcelona** opera con el supercomputador MareNostrum y pioneriza el modelo de "soberanía de datos" donde los datos urbanos pertenecen a los residentes. El estándar emergente es **DIN SPEC 91607** ("Digital Twin for Cities and Municipalities") y **FIWARE NGSI-LD** para gestión de datos contextuales en ciudades inteligentes.

Para municipios colombianos, la recomendación pragmática es **comenzar con dashboards 2D** (prioridad actual) usando capas GeoJSON del DANE sobre react-leaflet como "digital twin ligero", con evolución futura a modelos 3D usando datos BIM y LiDAR.

### Plataformas GovTech comparables en LATAM

**Chile** lidera LATAM en el OECD Digital Government Index 2025 (posición #10 global), con la Ley 21.658 creando la Secretaría de Gobierno Digital y el sistema CasillaÚnica de notificaciones electrónicas. **MuniDigital** (Argentina, opera también en Colombia, Brasil y Costa Rica) es el **comparable más directo** a INPLUX para gestión municipal. **VisorUrbano** (Guadalajara, México) es referente específico para catastro municipal digital.

En el ecosistema colombiano, **Datasketch** construyó Monitor Ciudadano (plataforma anti-corrupción) con ratio costo-beneficio de 37.2x. **Nuvu** fue Partner of the Year de Microsoft Public Sector 2022 Colombia con productos de búsqueda cognitiva y seguridad predictiva. **MiLAB** (Innpulsa + CAF) es el primer laboratorio público de innovación GovTech en LATAM. **GovTech LATAM** (`https://www.govtechlatam.org`, BID Lab + IE PublicTech Lab) conecta startups con municipios.

### Herramientas open-source relevantes

**CKAN** para portales de datos abiertos (datos.gov.co usa Socrata, pero CKAN es el estándar alternativo). **Apache Superset** como alternativa BI para analytics internos. **FIWARE** (Orion Context Broker) para evolución hacia smart city con estándar NGSI-LD. **OrfeoGPL** del portal de Software Público Colombiano (`https://www.softwarepublicocolombia.gov.co`) para gestión documental.

---

## Conclusión: hoja de ruta de implementación para Claude Code

La arquitectura de INPLUX se asienta sobre tres pilares técnicos diferenciadores: **datos.gov.co como punto de entrada programático** al ecosistema gubernamental colombiano (la única fuente con API REST moderna), **PostgreSQL como plataforma unificada** (transaccional + espacial + vectorial + búsqueda BM25) que elimina la complejidad de múltiples bases de datos, y un **pipeline RAG híbrido** con embeddings BGE-M3 y fusión RRF que permite búsqueda semántica + keyword sobre normativa tributaria con citación verificable.

El insight más relevante para el roadmap de desarrollo es que **la barrera principal no es tecnológica sino de integración de datos**: la mayoría de sistemas gubernamentales colombianos (CHIP, SIRECI, SICODIS) operan con aplicaciones de escritorio propietarias sin APIs. INPLUX debe diseñar adaptadores de ETL robustos — descarga automatizada de Excel, parsing de archivos planos, generación de XML para DIAN — más que esperar integraciones API-first. La ventaja competitiva real está en convertir esta complejidad burocrática en una experiencia unificada para el funcionario público municipal.

La secuencia de implementación recomendada es: **(1)** esquema PostgreSQL multi-tenant con extensiones PostGIS/pgvector, **(2)** Hacienda Dashboard (valor inmediato, datos más accesibles via FUT/SISFUT), **(3)** Estatuto Municipal IA (pipeline RAG diferenciador), **(4)** Seguimiento PDM (alineado con ciclo de gobierno 2024-2027), **(5)** Exógena Sector Público (calendario DIAN define urgencia), **(6)** Rendición automatizada y Gemelo Municipal (requieren mayor madurez de integración de datos).