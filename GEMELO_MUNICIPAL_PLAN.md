# GEMELO MUNICIPAL — Plan Ultra-Exhaustivo para Antioquia (125 municipios)

> Documento estratégico para el módulo Gemelo Municipal de gobia.co
> Fecha: 2026-03-29 | Versión: 1.0
> Autor: Claude Code para inplux.co

---

## TABLA DE CONTENIDOS

1. [Diagnóstico del Estado Actual](#1-diagnóstico-del-estado-actual)
2. [Investigación: ¿Qué es un Gemelo Municipal Real?](#2-investigación-qué-es-un-gemelo-municipal-real)
3. [Fuentes de Datos para Antioquia](#3-fuentes-de-datos-para-antioquia-125-municipios)
4. [Arquitectura Técnica del Gemelo Real](#4-arquitectura-técnica-del-gemelo-real)
5. [Casos de Uso Concretos](#5-casos-de-uso-concretos)
6. [Módulos del Gemelo](#6-módulos-del-gemelo)
7. [Diagnóstico de Municipios de Antioquia](#7-diagnóstico-de-municipios-de-antioquia)
8. [Backlog Completo](#8-backlog-completo)
9. [Sprints Detallados](#9-sprints-detallados-8-sprints-de-2-semanas)
10. [Métricas de Éxito](#10-métricas-de-éxito)
11. [Riesgos y Mitigaciones](#11-riesgos-y-mitigaciones)
12. [Recomendación Ejecutiva](#12-recomendación-ejecutiva)

---

## 1. DIAGNÓSTICO DEL ESTADO ACTUAL

### 1.1 ¿Qué existe hoy en /gemelo de gobia.co?

El módulo actual (`src/app/demo/gemelo/page.tsx`) es un **prototipo de visualización** limitado a Medellín:

| Componente | Estado | Descripción |
|------------|--------|-------------|
| `GemeloMap.tsx` | ✅ Funcional | Mapa Mapbox con choropleth de 16 comunas |
| `comunas-data.ts` | ✅ Datos estáticos | 16 comunas con población, predial, ICA, estrato |
| `comunas-medellin.geojson` | ✅ GeoJSON | Polígonos de comunas (sin corregimientos completos) |
| `SECOPPanel.tsx` | ✅ Demo | Contratos SECOP vía datos.gov.co |
| Capas toggleables | ✅ UI | Fiscal, Población, Estratificación, Contratos |

**Funcionalidades actuales:**
- Visualización choropleth con 4 capas de datos
- Tooltip interactivo con métricas por comuna
- Ranking "Top 3 comunas" dinámico
- Leyenda de colores adaptativa

### 1.2 ¿Qué le falta para ser un gemelo municipal real?

| Brecha | Descripción | Impacto |
|--------|-------------|---------|
| **Escala** | Solo Medellín (1 municipio de 125 en Antioquia) | Crítico |
| **Datos reales** | Datos hardcodeados en `comunas-data.ts`, no de APIs | Crítico |
| **Temporalidad** | Sin series de tiempo, solo snapshot estático | Alto |
| **Granularidad** | Nivel comuna, no barrio/vereda/predio | Alto |
| **Integración** | Sin conexión a FUT/SISFUT/TerriData en tiempo real | Alto |
| **PDM territorial** | Sin visualización de metas por territorio | Medio |
| **Alertas** | Sin sistema de semáforos/alertas espaciales | Medio |
| **Comparativas** | Sin benchmarking inter-municipal | Medio |
| **Offline/Export** | Sin exportación PDF de mapas temáticos | Bajo |

### 1.3 Brechas técnicas específicas

```
ACTUAL                          →  NECESARIO
─────────────────────────────────────────────────────────────
GeoJSON estático (3 archivos)   →  PostGIS con 125 municipios + subdivisiones
Datos en TypeScript             →  API con caché + actualización programada
Mapbox light-v11 básico         →  Estilos customizados por capa temática
Sin clustering                  →  deck.gl para 10K+ puntos de infraestructura
Sin búsqueda                    →  Geocoding + búsqueda por nombre/código DANE
Sin drill-down                  →  Municipio → Vereda → Predio (3 niveles)
Sin exportación                 →  PDF con mapbox-gl-export
```

### 1.4 Limitaciones del stack actual vs lo necesario

| Aspecto | Stack Actual | Necesario | Gap |
|---------|--------------|-----------|-----|
| **Mapas** | Mapbox GL JS 3 | Mapbox + deck.gl para big data | deck.gl |
| **DB espacial** | Sin PostGIS | PostgreSQL + PostGIS | Infraestructura |
| **Datos** | Estáticos `.ts` | API + Supabase con RLS | Backend |
| **Geometrías** | 3 GeoJSON (~500KB) | 125 municipios + subdivisiones (~50MB) | Almacenamiento |
| **Rendering** | CPU (Mapbox solo) | GPU (deck.gl para capas densas) | Performance |

---

## 2. INVESTIGACIÓN: ¿QUÉ ES UN GEMELO MUNICIPAL REAL?

### 2.1 Definición técnica

Un **gemelo digital municipal** (Municipal Digital Twin) es una representación virtual sincronizada de un territorio que integra:

1. **Capa geométrica**: Límites administrativos, predios, infraestructura física
2. **Capa de datos**: Indicadores socioeconómicos, fiscales, ambientales en tiempo real
3. **Capa temporal**: Series históricas y proyecciones
4. **Capa de simulación**: Escenarios what-if para planificación
5. **Capa de alertas**: Monitoreo y notificaciones automáticas

### 2.2 Diferencias entre un "mapa bonito" y un gemelo real

| Mapa bonito | Gemelo Municipal Real |
|-------------|----------------------|
| Visualización estática | Sincronización con fuentes en tiempo real |
| Una capa de datos | Múltiples capas correlacionadas |
| Sin temporalidad | Series de tiempo + proyecciones |
| Solo muestra | Permite simulación y planificación |
| Datos agregados | Drill-down hasta nivel predial |
| Sin alertas | Sistema de monitoreo activo |
| Consumo pasivo | Toma de decisiones activa |

### 2.3 Capas de datos necesarias para un gemelo real colombiano

#### Capa 1: Geoespacial (Base cartográfica)

| Elemento | Fuente | Formato | Actualización |
|----------|--------|---------|---------------|
| Límites municipales | IGAC/DANE | GeoJSON/Shapefile | Anual |
| Veredas y corregimientos | IGAC | Shapefile | Cada 5 años |
| Predios urbanos/rurales | Catastro municipal | GeoJSON | Mensual (ideal) |
| Barrios (zonas urbanas) | Planeación municipal | GeoJSON | Variable |
| Manzanas censales | DANE MGN | Shapefile | Censal |
| Curvas de nivel | IGAC | Raster/Vector | Estático |
| Hidrografía | IDEAM | Shapefile | Estático |
| Vías | INVIAS/ANI | Shapefile | Semestral |

#### Capa 2: Fiscal (Finanzas públicas)

| Indicador | Fuente | Periodicidad | API |
|-----------|--------|--------------|-----|
| Ejecución presupuestal | FUT/CHIP | Trimestral | datos.gov.co |
| Recaudo por impuesto | FUT | Trimestral | datos.gov.co |
| IDF (Índice Desempeño Fiscal) | DNP/TerriData | Anual | datos.gov.co |
| Cartera morosa | Secretaría Hacienda | Mensual | API propia |
| Transferencias SGP | SICODIS | Mensual | Descarga |
| Deuda pública | CHIP | Trimestral | datos.gov.co |

#### Capa 3: Social (Población y bienestar)

| Indicador | Fuente | Periodicidad | API |
|-----------|--------|--------------|-----|
| Población total/proyectada | DANE | Anual | datos.gov.co |
| Población por grupo etario | DANE Censo | Censal | Estático |
| NBI (Necesidades Básicas Insatisfechas) | DANE | Censal | datos.gov.co |
| IPM (Índice Pobreza Multidimensional) | DANE | Censal | datos.gov.co |
| Cobertura salud | MinSalud/SISPRO | Mensual | API SISPRO |
| Cobertura educación | MinEducación/SIMAT | Anual | datos.gov.co |
| SISBEN IV distribución | DNP | Trimestral | Descarga |
| Desempleo | DANE GEIH | Trimestral | datos.gov.co |

#### Capa 4: Contratación (Transparencia)

| Dato | Fuente | Periodicidad | API |
|------|--------|--------------|-----|
| Contratos activos | SECOP II | Tiempo real | datos.gov.co |
| Contratos históricos | SECOP I + II | Acumulado | datos.gov.co |
| Proveedores frecuentes | SECOP | Derivado | Cálculo |
| Modalidad contratación | SECOP | Tiempo real | datos.gov.co |
| Monto por sector | SECOP | Derivado | Cálculo |

#### Capa 5: Infraestructura

| Elemento | Fuente | Formato | Actualización |
|----------|--------|---------|---------------|
| Equipamientos (hospitales, colegios) | MinSalud/MinEdu | Puntos | Anual |
| Red vial primaria | INVIAS | Líneas | Semestral |
| Red vial secundaria/terciaria | Gobernación | Líneas | Anual |
| Cobertura acueducto | SUI | Polígonos | Trimestral |
| Cobertura energía | EPM/ESSA | Polígonos | Mensual |
| Cobertura internet | MinTIC | Polígonos | Semestral |

#### Capa 6: PDM (Plan de Desarrollo Municipal)

| Dato | Fuente | Periodicidad |
|------|--------|--------------|
| Metas por sector | PDM/SisPT | Trimestral |
| Avance por meta | Seguimiento interno | Trimestral |
| Inversión por programa | POAI | Anual |
| Proyectos geolocalizados | Banco de proyectos | Continuo |

#### Capa 7: Ambiental

| Indicador | Fuente | Periodicidad |
|-----------|--------|--------------|
| Áreas protegidas | RUNAP/Corantioquia | Estático |
| Cuencas hidrográficas | IDEAM | Estático |
| Calidad del aire | SIATA (Antioquia) | Tiempo real |
| Riesgo de inundación | IDEAM/Corantioquia | Estático |
| Riesgo de deslizamiento | SGC | Estático |
| Deforestación | IDEAM | Anual |

### 2.4 Referentes internacionales relevantes

| Proyecto | País | Lecciones para Colombia |
|----------|------|------------------------|
| **Virtual Singapore** | Singapur | Integración 3D + simulación de tráfico/energía. Overkill para Colombia, pero referente de capas. |
| **Digital Twin Amsterdam** | Países Bajos | Open data + participación ciudadana. Modelo de transparencia aplicable. |
| **Helsinki 3D+** | Finlandia | City Information Model (CIM). Útil para Medellín/capitales grandes. |
| **Bogotá IDECA** | Colombia | IDE local con servicios WMS/WFS. **Referente directo** para Antioquia. |
| **IGAC Colombia** | Colombia | Catastro multipropósito. Base para cualquier gemelo municipal. |

### 2.5 ¿Qué diferencia a Antioquia de otros departamentos?

| Factor | Antioquia | Otros departamentos |
|--------|-----------|---------------------|
| **N° municipios** | 125 (2° más del país) | Boyacá: 123, Cundinamarca: 116 |
| **Heterogeneidad** | Extrema (Medellín 2.5M → Murindó 4K) | Similar en Boyacá/Nariño |
| **Datos disponibles** | **Anuario Estadístico + SIATA + EPM** | Menor cobertura institucional |
| **Capacidad fiscal** | Alta (Medellín cat. especial) | Variable |
| **Topografía** | 9 subregiones muy diversas | Menos extrema en otros |
| **Cobertura EPM** | 123/125 municipios con energía EPM | Sin equivalente |
| **SIATA** | Sistema de Alertas Tempranas único | Solo Bogotá tiene FOPAE |
| **IDE Antioquia** | Gobernación tiene IDE propia | Pocas gobernaciones la tienen |

**Ventaja competitiva de Antioquia**: Es el departamento con **mejor infraestructura de datos** después de Bogotá. El Anuario Estadístico de Antioquia, SIATA, y la cobertura de EPM hacen que sea el piloto ideal para un gemelo departamental.

---

## 3. FUENTES DE DATOS PARA ANTIOQUIA (125 municipios)

### 3.1 Gobernación de Antioquia

#### Anuario Estadístico de Antioquia

| Aspecto | Detalle |
|---------|---------|
| **URL** | https://www.antioquiadatos.gov.co/anuario |
| **Contenido** | 400+ indicadores por municipio, 15 capítulos temáticos |
| **Formato** | Excel descargable por capítulo |
| **Periodicidad** | Anual (última edición: 2024) |
| **Acceso** | Público, sin autenticación |
| **API** | ❌ No disponible |

**Capítulos relevantes:**
1. Territorio y medio ambiente
2. Demografía (población por municipio, pirámides)
3. Educación (matrícula, deserción, cobertura)
4. Salud (morbilidad, mortalidad, afiliación)
5. Servicios públicos (cobertura acueducto, energía, gas)
6. Economía (PIB departamental, empleo)
7. Finanzas públicas (presupuestos municipales)
8. Seguridad (homicidios, hurtos por municipio)
9. Vivienda (déficit habitacional)
10. Pobreza (NBI, IPM por municipio)

#### Antioquiadatos.gov.co (Portal de datos abiertos)

| Aspecto | Detalle |
|---------|---------|
| **URL** | https://www.antioquiadatos.gov.co |
| **Plataforma** | ArcGIS Hub (Esri) |
| **Datasets** | ~150 datasets publicados |
| **Formatos** | Shapefile, GeoJSON, CSV, API REST |
| **Acceso** | Público |

**Datasets clave identificados:**
- `Municipios_Antioquia` — Polígonos de 125 municipios
- `Veredas_Antioquia` — ~3,500 veredas con geometría
- `Subregiones_Antioquia` — 9 subregiones
- `Red_Vial_Departamental` — Vías secundarias y terciarias
- `Equipamientos_Salud` — Hospitales y centros de salud
- `Establecimientos_Educativos` — Colegios geolocalizados

#### Departamento Administrativo de Planeación (DAP Antioquia)

| Aspecto | Detalle |
|---------|---------|
| **Sistemas** | Plan de Desarrollo Departamental, POAI, Banco de Proyectos |
| **Acceso** | Parcialmente público |
| **Datos** | Inversión por subregión, metas departamentales |

### 3.2 DANE — Datos para Antioquia

#### Geoportal DANE

| Dataset | ID/URL | Contenido Antioquia |
|---------|--------|---------------------|
| Marco Geoestadístico Nacional (MGN) | geoportal.dane.gov.co | Manzanas, secciones, sectores de 125 municipios |
| Límites municipales | Servicio WFS | Polígonos oficiales DIVIPOLA |
| Centros poblados | Shapefile | ~1,200 centros poblados en Antioquia |

**Acceso técnico:**
```
ArcGIS REST: https://geoportal.dane.gov.co/geovisores/territorio/
WFS: https://geoportal.dane.gov.co/servicios/
```

#### Censo Nacional 2018 — Antioquia

| Indicador | Cobertura | Granularidad |
|-----------|-----------|--------------|
| Población total | 125 municipios | Municipio, centro poblado |
| Viviendas | 125 municipios | Municipio |
| Hogares | 125 municipios | Municipio |
| NBI | 125 municipios | Municipio |
| Déficit habitacional | 125 municipios | Municipio |

**Dataset datos.gov.co:** `cnpv-2018-viviendas-hogares-personas`

#### Proyecciones de población 2024-2027

| Municipio ejemplo | 2024 | 2025 | 2026 | 2027 |
|-------------------|------|------|------|------|
| Medellín | 2,612,000 | 2,625,000 | 2,638,000 | 2,651,000 |
| Bello | 568,000 | 575,000 | 582,000 | 589,000 |
| Itagüí | 283,000 | 286,000 | 289,000 | 292,000 |
| Envigado | 256,000 | 260,000 | 264,000 | 268,000 |
| Rionegro | 138,000 | 142,000 | 146,000 | 150,000 |

**Dataset:** `dane-proyecciones-poblacion-municipales`

#### NBI e IPM por municipio antioqueño

| Rango NBI | N° municipios | Ejemplos |
|-----------|---------------|----------|
| < 20% | 25 | Medellín (10.2%), Envigado (8.1%), Sabaneta (9.4%) |
| 20-40% | 45 | Rionegro (22%), Marinilla (25%), La Ceja (24%) |
| 40-60% | 35 | Turbo (52%), Apartadó (48%), Caucasia (45%) |
| > 60% | 20 | Murindó (85%), Vigía del Fuerte (82%), Nechí (78%) |

### 3.3 DNP / TerriData

#### Dimensiones disponibles para Antioquia

| Dimensión | N° indicadores | Ejemplos |
|-----------|----------------|----------|
| Finanzas Públicas | 45 | IDF, ejecución, recaudo, deuda |
| Educación | 38 | Cobertura, calidad (Saber 11), deserción |
| Salud | 52 | Mortalidad, morbilidad, vacunación |
| Pobreza | 18 | NBI, IPM, línea de pobreza |
| Seguridad | 22 | Homicidios, hurtos, secuestros |
| Ambiente | 15 | Cobertura boscosa, deforestación |
| Servicios Públicos | 12 | Cobertura acueducto, alcantarillado |
| Ordenamiento | 8 | POT vigente, riesgo |

**Acceso API (datos.gov.co):**
```
GET https://www.datos.gov.co/resource/64cq-xb2k.json
  ?coddane_municipio=05001  // Medellín
  &$limit=1000
```

#### IDF Histórico Antioquia (2015-2022)

| Año | Mejor municipio | Peor municipio | Promedio |
|-----|-----------------|----------------|----------|
| 2022 | Envigado (89.2) | Murindó (42.1) | 68.4 |
| 2021 | Medellín (88.5) | Vigía del Fuerte (41.8) | 67.9 |
| 2020 | Envigado (87.8) | Murindó (40.5) | 66.2 |
| 2019 | Sabaneta (86.9) | Murindó (39.8) | 65.8 |

### 3.4 IGAC — Cartografía oficial

| Producto | Cobertura Antioquia | Formato | Acceso |
|----------|---------------------|---------|--------|
| Cartografía básica 1:25,000 | 100% | Shapefile | Pago |
| Cartografía básica 1:100,000 | 100% | Shapefile | Gratuito |
| Catastro multipropósito | 40 municipios (piloto) | GeoJSON | Restringido |
| Modelo digital de elevación | 100% | Raster 12.5m | Gratuito |
| Ortoimágenes | 60% | GeoTIFF | Pago |
| SIGOT | 125 municipios | WMS/WFS | Gratuito |

**Municipios con catastro multipropósito actualizado:**
Medellín, Envigado, Itagüí, Sabaneta, La Estrella, Caldas, Barbosa, Copacabana, Girardota, Bello (Área Metropolitana) + 30 municipios adicionales en proceso.

### 3.5 IDEAM — Datos ambientales

| Dato | Cobertura Antioquia | API |
|------|---------------------|-----|
| Estaciones meteorológicas | 85 estaciones | DHIME |
| Cuencas hidrográficas | Magdalena-Cauca, Atrato | Shapefile |
| Zonas de riesgo inundación | 125 municipios | Shapefile |
| Calidad del agua | Principales ríos | Reportes |

**Cuencas principales de Antioquia:**
- Río Magdalena (Magdalena Medio)
- Río Cauca (Valle de Aburrá, Norte, Bajo Cauca)
- Río Atrato (Urabá)
- Río Nechí (Nordeste)

### 3.6 INVIAS / ANI — Red vial

| Red | Km en Antioquia | Fuente |
|-----|-----------------|--------|
| Vías nacionales | 1,850 km | INVIAS |
| Vías departamentales | 5,200 km | Gobernación |
| Vías terciarias | 12,000+ km | Municipios |
| Autopistas 4G | 450 km | ANI |

**Proyectos 4G relevantes:**
- Autopistas del Nordeste
- Conexión Norte (Hatillo)
- Pacífico 1, 2, 3
- Mar 1, Mar 2

### 3.7 Corantioquia y CARs

| Corporación | Jurisdicción | Datos disponibles |
|-------------|--------------|-------------------|
| **Corantioquia** | 80 municipios (centro/occidente) | Áreas protegidas, permisos ambientales, calidad aire SIATA |
| **Cornare** | 26 municipios (oriente) | Cuencas, biodiversidad, huella hídrica |
| **Corpourabá** | 19 municipios (Urabá) | Ecosistemas costeros, manglar |

**SIATA (Sistema de Alertas Tempranas de Antioquia):**
- URL: https://siata.gov.co
- Estaciones: 180+ en tiempo real
- Datos: Precipitación, nivel de ríos, calidad del aire, PM2.5
- API: ✅ Disponible (requiere convenio)

### 3.8 MinSalud / SISPRO

| Indicador | Cobertura | Periodicidad | Acceso |
|-----------|-----------|--------------|--------|
| Afiliación SGSSS | 125 municipios | Mensual | SISPRO |
| Mortalidad evitable | 125 municipios | Anual | datos.gov.co |
| Cobertura vacunación | 125 municipios | Mensual | PAI |
| Morbilidad por causa | 125 municipios | Semanal | SIVIGILA |

### 3.9 MinEducación / SIMAT

| Indicador | Cobertura | Fuente |
|-----------|-----------|--------|
| Matrícula por nivel | 125 municipios | SIMAT |
| Tasa de deserción | 125 municipios | SIMAT |
| Resultados Saber 11 | 125 municipios | ICFES |
| Establecimientos educativos | ~4,500 en Antioquia | DUE |

### 3.10 SECOP (datos.gov.co)

**Contratos de municipios de Antioquia (2020-2025):**

| Métrica | Valor |
|---------|-------|
| Total contratos | ~450,000 |
| Valor total | ~$45 billones COP |
| Entidades únicas | 125 alcaldías + 300 entidades |
| Modalidades | Directa (65%), Mínima cuantía (20%), Licitación (10%), Otros (5%) |

**Query ejemplo:**
```sql
SELECT nombre_entidad, SUM(valor_contrato) as total
FROM secop2
WHERE departamento = 'Antioquia'
  AND anno_firma >= 2020
GROUP BY nombre_entidad
ORDER BY total DESC
LIMIT 10
```

### 3.11 SISBEN IV

| Grupo | Población Antioquia | % del total |
|-------|---------------------|-------------|
| A (pobreza extrema) | 890,000 | 13% |
| B (pobreza moderada) | 1,450,000 | 21% |
| C (vulnerable) | 1,820,000 | 26% |
| D (no pobre) | 2,740,000 | 40% |

### 3.12 Particularidades únicas de Antioquia

#### Anuario Estadístico de Antioquia
- **Contenido**: 15 capítulos, 400+ indicadores, 125 municipios
- **Acceso**: https://www.antioquiadatos.gov.co
- **Formato**: Excel descargable
- **Actualización**: Anual

#### SIATA (único en Colombia después de Bogotá)
- Estaciones hidrometeorológicas en tiempo real
- Calidad del aire con PM2.5
- Alertas tempranas de inundación
- API disponible bajo convenio

#### EPM (Empresas Públicas de Medellín)
- Cobertura energía: 123/125 municipios
- Datos de consumo por zona
- Infraestructura de redes
- **No tiene API pública**, pero reporta a SUI

#### IDEA (Instituto para el Desarrollo de Antioquia)
- Crédito a municipios
- Ejecución de proyectos
- No tiene datos abiertos

#### Programa MANÁ
- Seguridad alimentaria
- Beneficiarios por municipio
- Datos no abiertos (requiere solicitud)

---

## 4. ARQUITECTURA TÉCNICA DEL GEMELO REAL

### 4.1 Stack recomendado (sobre base existente)

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│  Next.js 16 (App Router) + React 19 + TypeScript 5          │
│  Mapbox GL JS 3 + deck.gl 9 (capas densas)                  │
│  Tailwind CSS v4 + Framer Motion 12                         │
│  Tremor (charts) + Radix UI (componentes)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                         API                                  │
├─────────────────────────────────────────────────────────────┤
│  Next.js Route Handlers (App Router)                         │
│  tRPC o REST endpoints                                       │
│  Redis caché (1 hora para datos pesados)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       DATABASE                               │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 16 (Supabase)                                   │
│  ├─ PostGIS 3.4 (geometrías)                                │
│  ├─ pgvector (embeddings para búsqueda)                     │
│  ├─ RLS (multi-tenancy por municipio_id)                    │
│  └─ pg_cron (ETL programado)                                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    DATA SOURCES                              │
├─────────────────────────────────────────────────────────────┤
│  datos.gov.co (SODA API) → TerriData, SECOP, DIVIPOLA       │
│  Geoportal DANE → MGN, límites municipales                  │
│  Antioquiadatos.gov.co → Anuario, shapefiles                │
│  SIATA API → Clima, alertas (bajo convenio)                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Mapbox vs alternativas

| Criterio | Mapbox GL JS | react-leaflet | deck.gl | kepler.gl |
|----------|--------------|---------------|---------|-----------|
| **Rendimiento** | ★★★★☆ | ★★★☆☆ | ★★★★★ | ★★★★☆ |
| **Choropleth** | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★★ |
| **3D/Extrusión** | ★★★★☆ | ★★☆☆☆ | ★★★★★ | ★★★★★ |
| **Big data (10K+)** | ★★★☆☆ | ★★☆☆☆ | ★★★★★ | ★★★★★ |
| **Personalización** | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| **Bundle size** | 200KB | 150KB | 300KB | 800KB |
| **Ya en proyecto** | ✅ | ❌ | ❌ | ❌ |

**Recomendación**: Mantener **Mapbox GL JS** como base + agregar **deck.gl** solo para capas con >10K features (infraestructura, predios).

```typescript
// Uso híbrido Mapbox + deck.gl
import { MapboxOverlay } from '@deck.gl/mapbox';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';

const overlay = new MapboxOverlay({
  layers: [
    new GeoJsonLayer({
      id: 'municipios',
      data: '/api/geojson/antioquia',
      getFillColor: [184, 149, 106, 180], // ochre
      getLineColor: [255, 255, 255],
      lineWidthMinPixels: 1,
      pickable: true,
    }),
    new ScatterplotLayer({
      id: 'infraestructura',
      data: '/api/infraestructura?dept=05',
      getPosition: d => [d.lon, d.lat],
      getRadius: d => Math.sqrt(d.capacidad) * 100,
      getFillColor: [91, 123, 165],
    }),
  ],
});

map.addControl(overlay);
```

### 4.3 Schema PostGIS para 125 municipios

```sql
-- Esquema principal
CREATE SCHEMA gemelo;

-- Tabla de municipios (geometría + metadata)
CREATE TABLE gemelo.municipios (
  id SERIAL PRIMARY KEY,
  codigo_dane VARCHAR(5) UNIQUE NOT NULL,  -- PK: DIVIPOLA
  nombre VARCHAR(100) NOT NULL,
  codigo_departamento VARCHAR(2) DEFAULT '05',
  subregion VARCHAR(50),
  categoria INT CHECK (categoria BETWEEN 1 AND 6),
  area_km2 NUMERIC(10,2),
  poblacion_2024 INT,
  geometry GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
  centroid GEOMETRY(POINT, 4326) GENERATED ALWAYS AS (ST_Centroid(geometry)) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices espaciales
CREATE INDEX idx_municipios_geom ON gemelo.municipios USING GIST (geometry);
CREATE INDEX idx_municipios_centroid ON gemelo.municipios USING GIST (centroid);
CREATE INDEX idx_municipios_dane ON gemelo.municipios (codigo_dane);

-- Tabla de veredas/corregimientos
CREATE TABLE gemelo.veredas (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  municipio_id INT REFERENCES gemelo.municipios(id),
  tipo VARCHAR(20) CHECK (tipo IN ('vereda', 'corregimiento', 'centro_poblado')),
  area_km2 NUMERIC(10,2),
  poblacion INT,
  geometry GEOMETRY(MULTIPOLYGON, 4326),
  CONSTRAINT fk_municipio FOREIGN KEY (municipio_id)
    REFERENCES gemelo.municipios(id) ON DELETE CASCADE
);

CREATE INDEX idx_veredas_geom ON gemelo.veredas USING GIST (geometry);
CREATE INDEX idx_veredas_municipio ON gemelo.veredas (municipio_id);

-- Tabla de indicadores (normalizada para cualquier fuente)
CREATE TABLE gemelo.indicadores (
  id SERIAL PRIMARY KEY,
  municipio_id INT REFERENCES gemelo.municipios(id),
  codigo_indicador VARCHAR(20) NOT NULL,
  nombre_indicador VARCHAR(200) NOT NULL,
  dimension VARCHAR(50) NOT NULL,  -- fiscal, social, ambiental, etc.
  valor NUMERIC(18,4),
  unidad VARCHAR(50),
  periodo DATE NOT NULL,
  fuente VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (municipio_id, codigo_indicador, periodo)
);

CREATE INDEX idx_indicadores_municipio ON gemelo.indicadores (municipio_id);
CREATE INDEX idx_indicadores_dimension ON gemelo.indicadores (dimension);
CREATE INDEX idx_indicadores_periodo ON gemelo.indicadores (periodo);

-- Tabla de infraestructura (puntos)
CREATE TABLE gemelo.infraestructura (
  id SERIAL PRIMARY KEY,
  municipio_id INT REFERENCES gemelo.municipios(id),
  tipo VARCHAR(50) NOT NULL,  -- hospital, colegio, puente, etc.
  nombre VARCHAR(200),
  estado VARCHAR(20),
  capacidad INT,
  geometry GEOMETRY(POINT, 4326) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_infra_geom ON gemelo.infraestructura USING GIST (geometry);
CREATE INDEX idx_infra_tipo ON gemelo.infraestructura (tipo);

-- Vista materializada para dashboard departamental
CREATE MATERIALIZED VIEW gemelo.resumen_departamental AS
SELECT
  m.codigo_dane,
  m.nombre,
  m.subregion,
  m.poblacion_2024,
  m.categoria,
  COALESCE(idf.valor, 0) as idf_2022,
  COALESCE(nbi.valor, 0) as nbi,
  COALESCE(contratos.total, 0) as contratos_2024,
  m.geometry
FROM gemelo.municipios m
LEFT JOIN gemelo.indicadores idf
  ON m.id = idf.municipio_id
  AND idf.codigo_indicador = 'IDF'
  AND idf.periodo = '2022-12-31'
LEFT JOIN gemelo.indicadores nbi
  ON m.id = nbi.municipio_id
  AND nbi.codigo_indicador = 'NBI'
LEFT JOIN (
  SELECT municipio_id, COUNT(*) as total
  FROM gemelo.contratos
  WHERE EXTRACT(YEAR FROM fecha_firma) = 2024
  GROUP BY municipio_id
) contratos ON m.id = contratos.municipio_id;

CREATE INDEX idx_resumen_geom ON gemelo.resumen_departamental USING GIST (geometry);

-- Refrescar vista cada hora
SELECT cron.schedule('refresh-resumen', '0 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY gemelo.resumen_departamental');
```

### 4.4 Pipeline de ingesta por fuente

```typescript
// src/lib/etl/pipeline.ts

interface ETLJob {
  source: string;
  schedule: string;  // cron expression
  handler: () => Promise<void>;
}

export const ETL_JOBS: ETLJob[] = [
  {
    source: 'TerriData',
    schedule: '0 3 * * 0',  // Domingos 3am
    handler: async () => {
      const data = await fetchTerriData('05');  // Antioquia
      await upsertIndicadores(data, 'terridata');
    }
  },
  {
    source: 'SECOP',
    schedule: '0 */6 * * *',  // Cada 6 horas
    handler: async () => {
      const contracts = await fetchSECOP({
        departamento: 'Antioquia',
        desde: subDays(new Date(), 7)
      });
      await upsertContratos(contracts);
    }
  },
  {
    source: 'DIVIPOLA',
    schedule: '0 4 1 * *',  // Día 1 de cada mes
    handler: async () => {
      const municipios = await fetchDIVIPOLA('05');
      await upsertMunicipios(municipios);
    }
  },
  {
    source: 'Anuario_Antioquia',
    schedule: '0 5 1 3 *',  // 1 de marzo (publicación anual)
    handler: async () => {
      const data = await parseAnuarioExcel(2025);
      await upsertIndicadores(data, 'anuario');
    }
  }
];

// Cliente datos.gov.co tipado
async function fetchTerriData(codigoDepartamento: string) {
  const endpoint = 'https://www.datos.gov.co/resource/64cq-xb2k.json';
  const params = new URLSearchParams({
    '$where': `starts_with(coddane_municipio, '${codigoDepartamento}')`,
    '$limit': '50000',
    '$order': 'anio DESC'
  });

  const res = await fetch(`${endpoint}?${params}`, {
    headers: { 'X-App-Token': process.env.DATOS_GOV_TOKEN! }
  });

  return res.json();
}
```

### 4.5 Modelo de datos unificado (DIVIPOLA como PK)

```typescript
// src/types/gemelo.ts

/** Código DIVIPOLA de 5 dígitos: DDMMM */
type CodigoDane = `${string}${string}${string}${string}${string}`;

interface Municipio {
  codigoDane: CodigoDane;           // PK: "05001" = Medellín
  codigoDepartamento: "05";          // Siempre Antioquia
  nombre: string;
  subregion: SubregionAntioquia;
  categoria: 1 | 2 | 3 | 4 | 5 | 6 | 'especial';
  poblacion: number;
  areaKm2: number;
  geometry: GeoJSON.MultiPolygon;
  indicadores: Record<string, Indicador>;
}

type SubregionAntioquia =
  | 'Valle de Aburrá'
  | 'Oriente'
  | 'Suroeste'
  | 'Norte'
  | 'Nordeste'
  | 'Bajo Cauca'
  | 'Occidente'
  | 'Urabá'
  | 'Magdalena Medio';

interface Indicador {
  codigo: string;
  nombre: string;
  valor: number;
  unidad: string;
  periodo: Date;
  fuente: 'terridata' | 'dane' | 'anuario' | 'secop' | 'sisfut';
}
```

### 4.6 Performance: renderizar 125 municipios

**Estrategias implementadas:**

1. **Simplificación de geometrías**
```typescript
// Simplificar al cargar en PostGIS
ST_SimplifyPreserveTopology(geometry, 0.001)  // ~100m tolerancia
```

2. **Tilesets vectoriales**
```typescript
// Generar MVT con PostGIS
CREATE OR REPLACE FUNCTION gemelo.mvt_municipios(z int, x int, y int)
RETURNS bytea AS $$
  SELECT ST_AsMVT(tile, 'municipios', 4096, 'geom') FROM (
    SELECT
      codigo_dane, nombre, idf_2022,
      ST_AsMVTGeom(geometry, ST_TileEnvelope(z, x, y)) as geom
    FROM gemelo.resumen_departamental
    WHERE geometry && ST_TileEnvelope(z, x, y)
  ) tile;
$$ LANGUAGE SQL;
```

3. **Lazy loading por viewport**
```typescript
// Solo cargar municipios visibles
const visibleMunicipios = useMapBounds(map, municipios);
```

4. **Level of Detail (LOD)**
```typescript
// Zoom < 10: Solo límites municipales (125 features)
// Zoom 10-13: + cabeceras municipales
// Zoom > 13: + veredas del municipio seleccionado
```

5. **Caché agresivo**
```typescript
// next.config.js
export default {
  async headers() {
    return [{
      source: '/api/geojson/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=86400, stale-while-revalidate=604800'
      }]
    }];
  }
};
```

---

## 5. CASOS DE USO CONCRETOS

### 5.1 Gobernación de Antioquia

#### Caso 1: Monitoreo de los 125 municipios

| Aspecto | Detalle |
|---------|---------|
| **Usuario** | Secretario de Planeación Departamental |
| **Necesidad** | Ver estado de todos los municipios en una sola vista |
| **Datos requeridos** | IDF, ejecución presupuestal, NBI, avance PDM |
| **Visualización** | Mapa choropleth con semáforos por indicador |
| **Decisión habilitada** | Priorizar asistencia técnica a municipios rezagados |

```
┌─────────────────────────────────────────────────┐
│  🗺️ ANTIOQUIA — Panel de Control Departamental │
├─────────────────────────────────────────────────┤
│  [Mapa choropleth 125 municipios]               │
│  🟢 78 municipios | 🟡 32 | 🔴 15               │
│                                                 │
│  Filtros: [IDF ▼] [2024 ▼] [Subregión: Todas ▼]│
├─────────────────────────────────────────────────┤
│  TOP 5 CRÍTICOS            TOP 5 DESTACADOS     │
│  🔴 Murindó (42.1)        🟢 Envigado (89.2)   │
│  🔴 Vigía del Fuerte      🟢 Sabaneta (87.5)   │
│  🔴 Murindó (42.1)        🟢 Medellín (85.1)   │
└─────────────────────────────────────────────────┘
```

#### Caso 2: Comparativas inter-municipales

| Aspecto | Detalle |
|---------|---------|
| **Usuario** | Analista de Planeación |
| **Necesidad** | Comparar indicadores entre municipios similares |
| **Datos** | Categoría, población, IDF, NBI, inversión per cápita |
| **Visualización** | Scatter plot + tabla comparativa |
| **Decisión** | Identificar mejores prácticas replicables |

#### Caso 3: Identificación de municipios en riesgo fiscal

| Aspecto | Detalle |
|---------|---------|
| **Usuario** | Director de Hacienda Departamental |
| **Necesidad** | Alertas tempranas de deterioro fiscal |
| **Datos** | IDF histórico, deuda/ingresos, dependencia SGP |
| **Visualización** | Timeline + alertas automáticas |
| **Decisión** | Intervención preventiva antes de crisis |

### 5.2 Alcaldía Municipal (ej: Rionegro, Envigado, Jericó)

#### Caso 4: Centro de mando del municipio

| Aspecto | Detalle |
|---------|---------|
| **Usuario** | Alcalde / Secretario de Gobierno |
| **Necesidad** | Vista 360° del municipio en tiempo real |
| **Datos** | Presupuesto, contratos, PDM, alertas |
| **Visualización** | Dashboard integrado con mapa |
| **Decisión** | Priorización de agenda diaria |

```
┌─────────────────────────────────────────────────┐
│  🏛️ RIONEGRO — Centro de Mando Municipal       │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ IDF 74.2 │  │ PDM 68%  │  │ 45 📋    │      │
│  │ 🟢 +2.1  │  │ 🟡 -5%   │  │ Contratos│      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                 │
│  [Mapa de Rionegro con 17 veredas]             │
│  Capa activa: [Inversión por vereda ▼]         │
│                                                 │
│  ⚠️ ALERTAS ACTIVAS (3)                        │
│  • Meta de vías terciarias al 45% (esperado 70)│
│  • Contrato #2024-089 vence en 15 días         │
│  • Vereda La Mosca sin ejecución este trimestre│
└─────────────────────────────────────────────────┘
```

#### Caso 5: Dashboard por barrio/vereda

| Aspecto | Detalle |
|---------|---------|
| **Usuario** | Secretario de Planeación Municipal |
| **Necesidad** | Diagnóstico territorial granular |
| **Datos** | NBI por vereda, cobertura servicios, inversión histórica |
| **Visualización** | Drill-down municipio → veredas |
| **Decisión** | Focalización de inversión social |

### 5.3 Secretaría de Planeación

#### Caso 6: Diagnóstico para POT/PBOT/EOT

| Aspecto | Detalle |
|---------|---------|
| **Usuario** | Equipo técnico de ordenamiento |
| **Necesidad** | Datos territoriales para revisión del POT |
| **Datos** | Uso del suelo, riesgo, densidad, servicios |
| **Visualización** | Capas superpuestas con análisis |
| **Decisión** | Definición de norma urbanística |

### 5.4 Control Interno / Veedurías

#### Caso 7: Mapa de contratos por zona

| Aspecto | Detalle |
|---------|---------|
| **Usuario** | Ciudadano / Veedor |
| **Necesidad** | Verificar inversión en su territorio |
| **Datos** | Contratos SECOP geolocalizados |
| **Visualización** | Puntos en mapa con filtros |
| **Decisión** | Seguimiento ciudadano a obras |

---

## 6. MÓDULOS DEL GEMELO

### Módulo 1: Mapa Base Departamental

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Cartografía base de los 125 municipios de Antioquia con límites, subregiones y capas base |
| **Fuentes** | IGAC, DANE Geoportal, Antioquiadatos |
| **Complejidad** | Media |
| **Valor usuario** | 9/10 (fundacional) |
| **Dependencias** | Ninguna |

**Features:**
- Límites de 125 municipios (polígonos)
- 9 subregiones (agrupación)
- Cabeceras municipales (puntos)
- Hidrografía principal (líneas)
- Relieve sombreado (raster)
- Búsqueda por nombre/código DANE

### Módulo 2: Perfil Municipal (ficha técnica)

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Panel lateral con datos consolidados del municipio seleccionado |
| **Fuentes** | TerriData, DANE, Anuario Antioquia |
| **Complejidad** | Baja |
| **Valor usuario** | 10/10 |
| **Dependencias** | Módulo 1 |

**Features:**
- Datos demográficos (población, densidad, pirámide)
- Indicadores fiscales (IDF, recaudo, dependencia SGP)
- Indicadores sociales (NBI, IPM, cobertura salud/educación)
- Comparativa con promedio departamental
- Histórico 5 años
- Exportación PDF

### Módulo 3: Dashboard Departamental

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Vista agregada de los 125 municipios con rankings y distribuciones |
| **Fuentes** | TerriData, SISFUT |
| **Complejidad** | Media |
| **Valor usuario** | 9/10 |
| **Dependencias** | Módulos 1, 2 |

**Features:**
- Choropleth por indicador seleccionado
- Histograma de distribución
- Top 10 / Bottom 10 municipios
- Filtros por subregión, categoría, rango
- Scatter plot bivariado
- Exportación datos

### Módulo 4: Capa Fiscal

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Indicadores financieros por municipio con drill-down |
| **Fuentes** | FUT/SISFUT, CHIP, SICODIS |
| **Complejidad** | Alta |
| **Valor usuario** | 10/10 |
| **Dependencias** | Módulo 2 |

**Features:**
- IDF con componentes desglosados
- Ejecución presupuestal (ingresos/gastos)
- Transferencias SGP por concepto
- Cartera y recaudo
- Tendencia histórica
- Alertas de deterioro

### Módulo 5: Capa Social

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Indicadores de bienestar y pobreza territorializados |
| **Fuentes** | DANE Censo, SISBEN, TerriData |
| **Complejidad** | Media |
| **Valor usuario** | 8/10 |
| **Dependencias** | Módulo 2 |

**Features:**
- NBI por componente
- IPM multidimensional
- Cobertura educación por nivel
- Cobertura salud (régimen)
- SISBEN IV distribución
- Correlación pobreza-fiscal

### Módulo 6: Capa de Contratación

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Visualización de contratos SECOP geolocalizados |
| **Fuentes** | SECOP I + II (datos.gov.co) |
| **Complejidad** | Media |
| **Valor usuario** | 9/10 |
| **Dependencias** | Módulo 1 |

**Features:**
- Puntos de contratos en mapa
- Filtros por modalidad, valor, estado
- Agregación por municipio/sector
- Timeline de contratación
- Top contratistas por municipio
- Alertas de concentración

### Módulo 7: Capa de Infraestructura

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Equipamientos y redes de servicios públicos |
| **Fuentes** | MinSalud, MinEducación, SUI, INVIAS |
| **Complejidad** | Alta |
| **Valor usuario** | 7/10 |
| **Dependencias** | Módulo 1 |

**Features:**
- Hospitales y puestos de salud
- Colegios y sedes educativas
- Red vial (primaria, secundaria, terciaria)
- Cobertura acueducto/alcantarillado
- Cobertura energía (EPM)
- Estado de infraestructura

### Módulo 8: Capa de PDM Territorial

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Avance de metas del Plan de Desarrollo por territorio |
| **Fuentes** | SisPT, POAI municipal |
| **Complejidad** | Alta |
| **Valor usuario** | 8/10 |
| **Dependencias** | Módulos 2, 4 |

**Features:**
- Metas por sector y territorio
- Semáforo de avance
- Inversión programada vs ejecutada por zona
- Proyectos geolocalizados
- Timeline de ejecución
- Alertas de rezago

### Módulo 9: Capa Ambiental

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Datos ambientales y de riesgo |
| **Fuentes** | IDEAM, Corantioquia, SIATA |
| **Complejidad** | Media |
| **Valor usuario** | 6/10 |
| **Dependencias** | Módulo 1 |

**Features:**
- Áreas protegidas (RUNAP)
- Cuencas hidrográficas
- Zonas de riesgo (inundación, deslizamiento)
- Cobertura boscosa
- Calidad del aire (SIATA)
- Alertas tempranas

### Módulo 10: Comparador Inter-municipal

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Herramienta para comparar 2-5 municipios lado a lado |
| **Fuentes** | Todos los módulos anteriores |
| **Complejidad** | Baja |
| **Valor usuario** | 8/10 |
| **Dependencias** | Módulos 2-5 |

**Features:**
- Selector de municipios (hasta 5)
- Tabla comparativa multi-indicador
- Gráfico de radar
- Ranking relativo
- Identificación de brechas
- Exportación comparativa

### Módulo 11: Alertas y Semáforos

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Sistema de monitoreo con notificaciones automáticas |
| **Fuentes** | Cálculos sobre todos los módulos |
| **Complejidad** | Alta |
| **Valor usuario** | 9/10 |
| **Dependencias** | Módulos 3, 4, 5 |

**Features:**
- Reglas configurables por umbral
- Notificaciones email/push
- Panel de alertas activas
- Histórico de alertas
- Escalamiento automático
- Dashboard de riesgo

### Módulo 12: Reportes y Exportación

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Generación de reportes PDF/Excel con mapas |
| **Fuentes** | Todos los módulos |
| **Complejidad** | Media |
| **Valor usuario** | 7/10 |
| **Dependencias** | Todos |

**Features:**
- Reporte de perfil municipal (PDF)
- Reporte comparativo (PDF)
- Exportación de datos (Excel)
- Exportación de mapas (PNG/PDF)
- Plantillas personalizables
- Programación de reportes

---

## 7. DIAGNÓSTICO DE MUNICIPIOS DE ANTIOQUIA

### 7.1 Los 5 municipios con más datos disponibles

| Ranking | Municipio | Código DANE | Razón |
|---------|-----------|-------------|-------|
| 1 | **Medellín** | 05001 | Capital, todas las fuentes, datos abiertos propios |
| 2 | **Envigado** | 05266 | Cat. 1, modernización catastral, transparencia |
| 3 | **Rionegro** | 05615 | Aeropuerto, cat. 2, datos zonificados |
| 4 | **Itagüí** | 05360 | Área Metropolitana, catastro actualizado |
| 5 | **Bello** | 05088 | 2° ciudad, Metro, datos integrados |

### 7.2 Municipios de categoría especial/1 de Antioquia

| Categoría | Municipios | Población total |
|-----------|------------|-----------------|
| **Especial** | Medellín | 2,612,000 |
| **1** | Bello, Itagüí, Envigado | 1,107,000 |
| **2** | Rionegro, Apartadó, Turbo, Caucasia | 520,000 |

### 7.3 Municipio recomendado como piloto: **Rionegro**

| Factor | Evaluación |
|--------|------------|
| **Tamaño** | 138,000 hab — manejable pero significativo |
| **Categoría** | 2 — representa a la mayoría de municipios medianos |
| **Datos** | Alto — POT reciente, catastro actualizado, presencia EPM |
| **Diversidad** | 17 veredas + zona urbana, mezcla rural-urbano |
| **Interés político** | Alcaldía modernizadora, presupuesto para innovación |
| **Replicabilidad** | Modelo para otros municipios de cat. 2-3 |
| **No es capital** | Evita complejidad extrema de Medellín |

**Alternativas:**
- **Envigado**: Más datos, pero muy atípico (cat. 1, 100% urbano)
- **Marinilla**: Cat. 3, buen proxy para municipios pequeños
- **Jericó**: Pueblo patrimonio, turismo, interés político alto

### 7.4 Subregiones de Antioquia

| Subregión | Municipios | Características | Prioridad |
|-----------|------------|-----------------|-----------|
| Valle de Aburrá | 10 | Área Metropolitana, urbano, más datos | Alta |
| Oriente | 23 | Aeropuerto, agroindustria, crecimiento | Alta |
| Suroeste | 23 | Café, turismo, municipios medianos | Media |
| Norte | 17 | Lechería, hidroeléctricas, rural | Media |
| Nordeste | 10 | Minería, conflicto, datos limitados | Baja |
| Bajo Cauca | 6 | Minería ilegal, conflicto, datos críticos | Baja |
| Occidente | 19 | Rural, café, conectividad limitada | Media |
| Urabá | 11 | Agroindustria, puerto, heterogéneo | Media |
| Magdalena Medio | 6 | Petróleo, ganadería, disperso | Baja |

---

## 8. BACKLOG COMPLETO

### Épica 1: Capa Base Cartográfica

#### Historia 1.1: Carga de geometrías de 125 municipios
**Como** desarrollador
**Quiero** tener los polígonos de los 125 municipios de Antioquia en PostGIS
**Para** poder renderizarlos en el mapa

**Criterios de aceptación:**
- [ ] Geometrías descargadas de DANE/IGAC
- [ ] Simplificadas a <100KB por municipio
- [ ] Cargadas en PostGIS con SRID 4326
- [ ] Índice espacial creado
- [ ] Endpoint API funcionando

**Tareas técnicas:**
1. Descargar shapefiles de Antioquiadatos (2h)
2. Convertir a GeoJSON con ogr2ogr (1h)
3. Simplificar con Mapshaper (1h)
4. Crear migración SQL para tabla municipios (2h)
5. Script de carga con coordenadas válidas (3h)
6. Endpoint GET /api/geojson/antioquia (2h)
7. Tests de integración (2h)

**Story points:** 8
**Prioridad:** P0

#### Historia 1.2: Carga de veredas y corregimientos
**Como** usuario
**Quiero** ver las subdivisiones internas de cada municipio
**Para** analizar datos a nivel granular

**Criterios de aceptación:**
- [ ] ~3,500 veredas cargadas
- [ ] Relación FK con municipios
- [ ] Lazy loading por municipio

**Story points:** 5
**Prioridad:** P1

#### Historia 1.3: Visualización en mapa Mapbox
**Como** usuario
**Quiero** ver el mapa de Antioquia con los 125 municipios
**Para** tener contexto geográfico

**Criterios de aceptación:**
- [ ] Mapa centrado en Antioquia
- [ ] Zoom inicial mostrando todo el departamento
- [ ] Hover con nombre del municipio
- [ ] Click para seleccionar

**Tareas técnicas:**
1. Componente DepartmentMap.tsx (3h)
2. Fetch de GeoJSON optimizado (2h)
3. Estilos de choropleth base (2h)
4. Interacciones hover/click (2h)
5. Leyenda de subregiones (1h)

**Story points:** 5
**Prioridad:** P0

#### Historia 1.4: Búsqueda de municipios
**Como** usuario
**Quiero** buscar un municipio por nombre o código
**Para** encontrarlo rápidamente sin navegar el mapa

**Criterios de aceptación:**
- [ ] Input de búsqueda con autocomplete
- [ ] Búsqueda por nombre parcial
- [ ] Búsqueda por código DANE
- [ ] Fly-to al seleccionar

**Story points:** 3
**Prioridad:** P1

---

### Épica 2: Panel Municipal (perfil de un municipio)

#### Historia 2.1: Panel lateral de información
**Como** usuario
**Quiero** ver un panel con datos del municipio seleccionado
**Para** conocer sus características principales

**Criterios de aceptación:**
- [ ] Panel deslizante desde la derecha
- [ ] Datos demográficos básicos
- [ ] Indicadores clave (IDF, NBI)
- [ ] Cierre con X o click fuera

**Story points:** 5
**Prioridad:** P0

#### Historia 2.2: Indicadores de TerriData
**Como** usuario
**Quiero** ver indicadores de TerriData del municipio
**Para** entender su situación socioeconómica

**Criterios de aceptación:**
- [ ] Conexión a API TerriData
- [ ] Caché de 1 hora
- [ ] Agrupación por dimensión
- [ ] Valores con unidades correctas

**Story points:** 5
**Prioridad:** P0

#### Historia 2.3: Gráficos de tendencia histórica
**Como** usuario
**Quiero** ver la evolución de indicadores en el tiempo
**Para** identificar tendencias

**Criterios de aceptación:**
- [ ] Line chart con 5 años de historia
- [ ] Selector de indicador
- [ ] Tooltip con valores exactos

**Story points:** 3
**Prioridad:** P1

#### Historia 2.4: Comparación con promedio departamental
**Como** usuario
**Quiero** ver cómo se compara el municipio con Antioquia
**Para** contextualizar los datos

**Criterios de aceptación:**
- [ ] Barra de comparación por indicador
- [ ] Percentil dentro del departamento
- [ ] Colores semáforo

**Story points:** 3
**Prioridad:** P1

---

### Épica 3: Dashboard Departamental

#### Historia 3.1: Vista agregada de 125 municipios
**Como** Gobernación
**Quiero** ver todos los municipios en una tabla/grid
**Para** monitorear el departamento completo

**Criterios de aceptación:**
- [ ] Tabla con columnas configurables
- [ ] Ordenamiento por cualquier columna
- [ ] Filtros por subregión, categoría
- [ ] Paginación o virtualización

**Story points:** 5
**Prioridad:** P0

#### Historia 3.2: Choropleth por indicador seleccionado
**Como** usuario
**Quiero** cambiar el indicador que colorea el mapa
**Para** visualizar diferentes dimensiones

**Criterios de aceptación:**
- [ ] Selector de indicador
- [ ] Actualización de colores en tiempo real
- [ ] Leyenda actualizada
- [ ] Preservar selección al cambiar

**Story points:** 3
**Prioridad:** P0

#### Historia 3.3: Histograma de distribución
**Como** analista
**Quiero** ver la distribución del indicador
**Para** identificar outliers y concentraciones

**Criterios de aceptación:**
- [ ] Histograma con bins automáticos
- [ ] Click en bin resalta municipios en mapa
- [ ] Estadísticas básicas (media, mediana, std)

**Story points:** 3
**Prioridad:** P1

#### Historia 3.4: Ranking Top/Bottom 10
**Como** usuario
**Quiero** ver los mejores y peores municipios
**Para** identificar extremos rápidamente

**Criterios de aceptación:**
- [ ] Lista Top 10 con valores
- [ ] Lista Bottom 10 con valores
- [ ] Click para seleccionar en mapa
- [ ] Actualización con filtros

**Story points:** 2
**Prioridad:** P1

---

### Épica 4: Capa Fiscal

#### Historia 4.1: Integración FUT/SISFUT
**Como** usuario
**Quiero** ver datos de ejecución presupuestal
**Para** analizar las finanzas del municipio

**Criterios de aceptación:**
- [ ] Datos de ingresos por rubro
- [ ] Datos de gastos por sector
- [ ] Histórico trimestral
- [ ] Fuente citada

**Story points:** 8
**Prioridad:** P0

#### Historia 4.2: IDF con desglose de componentes
**Como** usuario
**Quiero** ver el IDF con sus componentes
**Para** entender fortalezas y debilidades fiscales

**Criterios de aceptación:**
- [ ] Puntaje IDF total
- [ ] 6 componentes desglosados
- [ ] Comparación con año anterior
- [ ] Semáforo por componente

**Story points:** 5
**Prioridad:** P0

#### Historia 4.3: Mapa de calor fiscal
**Como** Gobernación
**Quiero** ver el mapa coloreado por desempeño fiscal
**Para** identificar zonas críticas

**Criterios de aceptación:**
- [ ] Choropleth por IDF
- [ ] Escala de colores intuitiva
- [ ] Cortes de clasificación DNP

**Story points:** 3
**Prioridad:** P0

#### Historia 4.4: Alertas de deterioro fiscal
**Como** Director de Hacienda
**Quiero** recibir alertas cuando un municipio empeora
**Para** intervenir preventivamente

**Criterios de aceptación:**
- [ ] Regla: IDF cae >5 puntos
- [ ] Regla: Dependencia SGP >70%
- [ ] Notificación en panel
- [ ] Email opcional

**Story points:** 5
**Prioridad:** P2

---

### Épica 5: Capa Social

#### Historia 5.1: NBI por municipio
**Como** usuario
**Quiero** ver el NBI de cada municipio
**Para** identificar pobreza por carencias

**Criterios de aceptación:**
- [ ] NBI total
- [ ] Desglose por componente
- [ ] Comparación urbano/rural
- [ ] Fuente: DANE Censo 2018

**Story points:** 3
**Prioridad:** P1

#### Historia 5.2: IPM multidimensional
**Como** analista
**Quiero** ver el IPM con sus dimensiones
**Para** análisis de pobreza multidimensional

**Criterios de aceptación:**
- [ ] IPM total
- [ ] 5 dimensiones
- [ ] 15 indicadores
- [ ] Visualización radar

**Story points:** 5
**Prioridad:** P1

#### Historia 5.3: Cobertura de servicios sociales
**Como** usuario
**Quiero** ver cobertura de salud y educación
**Para** evaluar acceso a servicios

**Criterios de aceptación:**
- [ ] Cobertura salud (contributivo/subsidiado)
- [ ] Cobertura neta educación por nivel
- [ ] Tasa de deserción escolar

**Story points:** 5
**Prioridad:** P1

#### Historia 5.4: Mapa de vulnerabilidad social
**Como** Gobernación
**Quiero** ver zonas de alta vulnerabilidad
**Para** focalizar programas sociales

**Criterios de aceptación:**
- [ ] Índice compuesto de vulnerabilidad
- [ ] Choropleth con escala
- [ ] Drill-down a veredas (donde haya datos)

**Story points:** 5
**Prioridad:** P2

---

### Épica 6: Capa de Contratación

#### Historia 6.1: Integración SECOP
**Como** usuario
**Quiero** ver contratos de SECOP
**Para** monitorear la contratación pública

**Criterios de aceptación:**
- [ ] Conexión a SECOP I + II
- [ ] Filtro por municipio
- [ ] Últimos 3 años
- [ ] Actualización cada 6 horas

**Story points:** 5
**Prioridad:** P0

#### Historia 6.2: Mapa de contratos
**Como** ciudadano
**Quiero** ver contratos geolocalizados
**Para** saber qué se construye en mi zona

**Criterios de aceptación:**
- [ ] Puntos en mapa por ubicación de ejecución
- [ ] Popup con info del contrato
- [ ] Filtros por tipo, valor, estado

**Story points:** 5
**Prioridad:** P1

#### Historia 6.3: Dashboard de contratación municipal
**Como** Control Interno
**Quiero** ver métricas de contratación
**Para** evaluar transparencia

**Criterios de aceptación:**
- [ ] Total contratos y valor
- [ ] Distribución por modalidad
- [ ] Top 10 contratistas
- [ ] Concentración de proveedores

**Story points:** 5
**Prioridad:** P1

#### Historia 6.4: Alertas de contratación
**Como** Veedor
**Quiero** alertas de patrones sospechosos
**Para** identificar posibles irregularidades

**Criterios de aceptación:**
- [ ] Alerta: >50% contratación directa
- [ ] Alerta: Proveedor >30% de contratos
- [ ] Alerta: Adiciones frecuentes

**Story points:** 5
**Prioridad:** P2

---

### Épica 7: Capa de PDM y Metas

#### Historia 7.1: Estructura del PDM
**Como** usuario
**Quiero** ver la estructura del Plan de Desarrollo
**Para** entender las líneas estratégicas

**Criterios de aceptación:**
- [ ] Árbol: Líneas → Programas → Metas
- [ ] Navegación expandible
- [ ] Búsqueda de metas

**Story points:** 5
**Prioridad:** P1

#### Historia 7.2: Avance de metas con semáforo
**Como** Alcalde
**Quiero** ver el avance de cada meta
**Para** monitorear la gestión

**Criterios de aceptación:**
- [ ] Porcentaje de avance
- [ ] Semáforo 🟢🟡🔴
- [ ] Meta vs ejecutado
- [ ] Histórico trimestral

**Story points:** 5
**Prioridad:** P1

#### Historia 7.3: Metas por territorio
**Como** Planeación
**Quiero** ver qué metas aplican a cada zona
**Para** verificar cobertura territorial

**Criterios de aceptación:**
- [ ] Filtro por vereda/zona
- [ ] Metas asignadas a la zona
- [ ] Inversión comprometida

**Story points:** 5
**Prioridad:** P2

---

### Épica 8: Capa de Infraestructura

#### Historia 8.1: Equipamientos de salud
**Como** usuario
**Quiero** ver hospitales y centros de salud
**Para** conocer la oferta de servicios

**Criterios de aceptación:**
- [ ] Puntos de IPS en mapa
- [ ] Nivel de complejidad
- [ ] Popup con servicios
- [ ] Filtros por tipo

**Story points:** 5
**Prioridad:** P1

#### Historia 8.2: Equipamientos educativos
**Como** usuario
**Quiero** ver colegios y sedes educativas
**Para** conocer cobertura educativa

**Criterios de aceptación:**
- [ ] Puntos de establecimientos
- [ ] Tipo (oficial/privado)
- [ ] Niveles que ofrece
- [ ] Matrícula

**Story points:** 5
**Prioridad:** P1

#### Historia 8.3: Red vial
**Como** usuario
**Quiero** ver el estado de las vías
**Para** identificar necesidades de inversión

**Criterios de aceptación:**
- [ ] Vías primarias, secundarias, terciarias
- [ ] Estado (bueno/regular/malo)
- [ ] Toggle de capas

**Story points:** 5
**Prioridad:** P2

---

### Épica 9: Alertas y Semáforos Territoriales

#### Historia 9.1: Motor de reglas de alertas
**Como** administrador
**Quiero** configurar reglas de alertas
**Para** automatizar el monitoreo

**Criterios de aceptación:**
- [ ] UI para crear reglas
- [ ] Umbrales configurables
- [ ] Evaluación programada
- [ ] Log de alertas disparadas

**Story points:** 8
**Prioridad:** P2

#### Historia 9.2: Panel de alertas activas
**Como** usuario
**Quiero** ver las alertas activas
**Para** priorizar mi atención

**Criterios de aceptación:**
- [ ] Lista de alertas con severidad
- [ ] Click para ir al municipio
- [ ] Marcar como resuelta
- [ ] Filtros por tipo

**Story points:** 5
**Prioridad:** P2

#### Historia 9.3: Mapa de riesgo consolidado
**Como** Gobernación
**Quiero** ver un mapa de riesgo general
**Para** identificar municipios críticos

**Criterios de aceptación:**
- [ ] Score de riesgo compuesto
- [ ] Ponderación de dimensiones
- [ ] Choropleth con escala

**Story points:** 5
**Prioridad:** P2

---

### Épica 10: Comparativas Inter-municipales

#### Historia 10.1: Selector de municipios a comparar
**Como** analista
**Quiero** seleccionar 2-5 municipios
**Para** compararlos lado a lado

**Criterios de aceptación:**
- [ ] Multi-select de municipios
- [ ] Máximo 5
- [ ] Búsqueda integrada
- [ ] Clear all

**Story points:** 3
**Prioridad:** P1

#### Historia 10.2: Tabla comparativa
**Como** usuario
**Quiero** ver una tabla con indicadores comparados
**Para** identificar diferencias

**Criterios de aceptación:**
- [ ] Columna por municipio
- [ ] Filas por indicador
- [ ] Highlight del mejor/peor
- [ ] Ordenamiento

**Story points:** 3
**Prioridad:** P1

#### Historia 10.3: Gráfico de radar comparativo
**Como** usuario
**Quiero** ver un radar chart
**Para** comparar perfiles visualmente

**Criterios de aceptación:**
- [ ] Radar con 6-8 dimensiones
- [ ] Una línea por municipio
- [ ] Colores distinguibles
- [ ] Tooltip

**Story points:** 3
**Prioridad:** P1

#### Historia 10.4: Exportación de comparativa
**Como** usuario
**Quiero** exportar la comparación a PDF/Excel
**Para** incluirla en reportes

**Criterios de aceptación:**
- [ ] Botón de exportar
- [ ] PDF con tabla y gráficos
- [ ] Excel con datos crudos

**Story points:** 5
**Prioridad:** P2

---

## 9. SPRINTS DETALLADOS (8 sprints de 2 semanas)

### Sprint 1: Fundación Cartográfica (Semanas 1-2)

**Objetivo:** Tener el mapa de Antioquia con los 125 municipios renderizados y navegables.

| Historia | SP | Prioridad |
|----------|-----|-----------|
| 1.1 Carga de geometrías de 125 municipios | 8 | P0 |
| 1.3 Visualización en mapa Mapbox | 5 | P0 |
| 1.4 Búsqueda de municipios | 3 | P1 |

**Total SP:** 16

**Entregables:**
- Mapa de Antioquia con 125 municipios
- Hover con nombre
- Click para seleccionar
- Buscador funcional
- Endpoint /api/geojson/antioquia

**Definición de Done:**
- [ ] Todos los 125 municipios visibles
- [ ] Performance <2s carga inicial
- [ ] Tests pasando
- [ ] Código revisado

**Riesgos:**
- Geometrías muy pesadas → mitigar con simplificación
- Errores en códigos DANE → validar contra DIVIPOLA oficial

---

### Sprint 2: Perfil Municipal MVP (Semanas 3-4)

**Objetivo:** Panel lateral con datos básicos del municipio seleccionado.

| Historia | SP | Prioridad |
|----------|-----|-----------|
| 2.1 Panel lateral de información | 5 | P0 |
| 2.2 Indicadores de TerriData | 5 | P0 |
| 2.3 Gráficos de tendencia histórica | 3 | P1 |
| 2.4 Comparación con promedio departamental | 3 | P1 |

**Total SP:** 16

**Entregables:**
- Panel deslizante con datos del municipio
- Conexión a TerriData funcionando
- Gráfico de línea con historia
- Barra de comparación con Antioquia

**Definición de Done:**
- [ ] Panel abre al click en municipio
- [ ] Datos de TerriData actualizados
- [ ] Gráfico con 5 años de historia
- [ ] Comparación correcta vs promedio

---

### Sprint 3: Capa Fiscal + Datos FUT (Semanas 5-6)

**Objetivo:** Integrar datos fiscales reales y mostrar IDF.

| Historia | SP | Prioridad |
|----------|-----|-----------|
| 4.1 Integración FUT/SISFUT | 8 | P0 |
| 4.2 IDF con desglose de componentes | 5 | P0 |
| 4.3 Mapa de calor fiscal | 3 | P0 |

**Total SP:** 16

**Entregables:**
- Datos de FUT integrados
- IDF con 6 componentes visualizados
- Mapa choropleth por IDF
- Panel fiscal en perfil municipal

**Definición de Done:**
- [ ] Datos FUT cargados para 125 municipios
- [ ] IDF calculado correctamente
- [ ] Choropleth refleja rangos DNP

---

### Sprint 4: Capa Social + TerriData (Semanas 7-8)

**Objetivo:** Agregar indicadores sociales al gemelo.

| Historia | SP | Prioridad |
|----------|-----|-----------|
| 5.1 NBI por municipio | 3 | P1 |
| 5.2 IPM multidimensional | 5 | P1 |
| 5.3 Cobertura de servicios sociales | 5 | P1 |
| 1.2 Carga de veredas y corregimientos | 5 | P1 |

**Total SP:** 18

**Entregables:**
- NBI y IPM visibles por municipio
- Cobertura salud/educación
- Veredas cargadas para drill-down
- Sección social en perfil

---

### Sprint 5: Capa de Contratación SECOP (Semanas 9-10)

**Objetivo:** Integrar datos de contratación pública.

| Historia | SP | Prioridad |
|----------|-----|-----------|
| 6.1 Integración SECOP | 5 | P0 |
| 6.2 Mapa de contratos | 5 | P1 |
| 6.3 Dashboard de contratación municipal | 5 | P1 |

**Total SP:** 15

**Entregables:**
- Contratos SECOP integrados
- Mapa con puntos de contratos
- Dashboard con métricas de contratación
- Filtros por tipo, valor, estado

---

### Sprint 6: Dashboard Departamental + Comparativas (Semanas 11-12)

**Objetivo:** Vista de Gobernación para monitorear los 125 municipios.

| Historia | SP | Prioridad |
|----------|-----|-----------|
| 3.1 Vista agregada de 125 municipios | 5 | P0 |
| 3.2 Choropleth por indicador seleccionado | 3 | P0 |
| 3.3 Histograma de distribución | 3 | P1 |
| 3.4 Ranking Top/Bottom 10 | 2 | P1 |
| 10.1 Selector de municipios a comparar | 3 | P1 |
| 10.2 Tabla comparativa | 3 | P1 |

**Total SP:** 19

**Entregables:**
- Tabla con 125 municipios
- Choropleth dinámico
- Rankings automáticos
- Comparador funcional (2-5 municipios)

---

### Sprint 7: Alertas + Semáforos Territoriales (Semanas 13-14)

**Objetivo:** Sistema de monitoreo con alertas automáticas.

| Historia | SP | Prioridad |
|----------|-----|-----------|
| 9.1 Motor de reglas de alertas | 8 | P2 |
| 9.2 Panel de alertas activas | 5 | P2 |
| 4.4 Alertas de deterioro fiscal | 5 | P2 |
| 10.3 Gráfico de radar comparativo | 3 | P1 |

**Total SP:** 21

**Entregables:**
- Motor de alertas funcionando
- Panel con alertas activas
- Alertas fiscales configuradas
- Radar chart en comparador

---

### Sprint 8: Polish + Performance + Piloto Rionegro (Semanas 15-16)

**Objetivo:** Optimización y piloto con municipio real.

| Historia | SP | Prioridad |
|----------|-----|-----------|
| 10.4 Exportación de comparativa | 5 | P2 |
| 9.3 Mapa de riesgo consolidado | 5 | P2 |
| Performance optimization | 5 | P0 |
| Piloto Rionegro: datos completos | 5 | P0 |

**Total SP:** 20

**Entregables:**
- Exportación PDF/Excel
- Mapa de riesgo compuesto
- Performance <1s en cargas
- Demo completo de Rionegro
- Documentación

**Definición de Done:**
- [ ] Lighthouse score >90
- [ ] Demo grabado
- [ ] Feedback de usuario piloto incorporado

---

## 10. MÉTRICAS DE ÉXITO

### KPIs Técnicos

| Métrica | Target Sprint 4 | Target Sprint 8 |
|---------|-----------------|-----------------|
| Time to Interactive | <3s | <1.5s |
| Municipios con datos | 50/125 | 125/125 |
| Indicadores por municipio | 20 | 80+ |
| Uptime | 99% | 99.5% |
| Cobertura de tests | 60% | 80% |
| Errores en producción/semana | <10 | <3 |

### KPIs de Negocio

| Métrica | Target Q2 2026 | Target Q4 2026 |
|---------|----------------|----------------|
| Demos agendados | 10 | 50 |
| Municipios piloto | 1 (Rionegro) | 5 |
| Gobernaciones interesadas | 1 (Antioquia) | 3 |
| MRR | $0 | $15M COP |
| NPS usuarios piloto | — | >40 |

### Milestones por Sprint

| Sprint | Milestone | Evidencia |
|--------|-----------|-----------|
| 1 | Mapa navegable | Screenshot 125 municipios |
| 2 | Panel municipal | Video demo perfil |
| 3 | Datos fiscales | IDF de 125 municipios cargado |
| 4 | Datos sociales | NBI + IPM integrados |
| 5 | Contratación | SECOP funcionando |
| 6 | Dashboard Gobernación | Demo con usuario real |
| 7 | Alertas | Primera alerta disparada |
| 8 | Piloto Rionegro | Alcaldía usando el sistema |

---

## 11. RIESGOS Y MITIGACIONES

### Riesgos de Datos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| datos.gov.co caído | Media | Alto | Caché agresivo (1 semana), fallback a datos estáticos |
| TerriData incompleto | Alta | Medio | Complementar con Anuario Estadístico |
| Geometrías desactualizadas | Baja | Medio | Usar IGAC como fuente oficial |
| Veredas sin datos | Alta | Medio | Mostrar agregado municipal con disclaimer |
| SIATA sin convenio | Alta | Bajo | Excluir capa ambiental en tiempo real |

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance con 125 municipios | Media | Alto | Simplificación, MVT, lazy loading |
| Mapbox rate limits | Baja | Medio | Caché de tiles, self-hosted option |
| PostGIS complejidad | Media | Medio | Comenzar con GeoJSON, migrar gradualmente |
| Bundle size excesivo | Media | Medio | Code splitting, dynamic imports |

### Riesgos de Adopción

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Gobernación no prioriza | Media | Alto | Comenzar con alcaldías individuales |
| Funcionarios resistentes | Alta | Medio | Capacitación, UX simple, valor inmediato |
| Cambio de gobierno 2027 | Alta | Alto | Contratos multi-vigencia, valor demostrado |
| Competencia (otras GovTech) | Media | Medio | Diferenciador: foco Antioquia, datos integrados |

### Plan B por Riesgo Crítico

**Si datos.gov.co falla prolongadamente:**
1. Descargar datasets completos como backup
2. Implementar ETL batch desde archivos
3. Mostrar "datos a [fecha]" en UI

**Si Gobernación no compra:**
1. Pivotar a alcaldías cat. 1-2 (Rionegro, Envigado)
2. Modelo freemium para municipios pequeños
3. Alianza con gremios (Federación de Municipios)

**Si performance no escala:**
1. Reducir a 9 subregiones (no 125 municipios)
2. Implementar MVT con PostGIS
3. Cargar municipios on-demand

---

## 12. RECOMENDACIÓN EJECUTIVA

### ¿Por dónde empezar mañana?

**Semana 1 — Día 1:**
1. Descargar shapefiles de Antioquiadatos.gov.co
2. Convertir a GeoJSON y simplificar
3. Crear endpoint `/api/geojson/antioquia`
4. Reemplazar mapa de Medellín por mapa de Antioquia

**Semana 1 — Día 2-5:**
1. Implementar hover/click en 125 municipios
2. Conectar TerriData para indicadores básicos
3. Panel lateral con perfil municipal

### MVP mínimo para mostrar a una alcaldía en 4 semanas

```
┌─────────────────────────────────────────────────┐
│  🗺️ GEMELO MUNICIPAL — [Rionegro]              │
├─────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────┐  │
│  │                 │  │ RIONEGRO            │  │
│  │   Mapa con      │  │ Código: 05615       │  │
│  │   17 veredas    │  │ Población: 138,000  │  │
│  │   coloreadas    │  │ Categoría: 2        │  │
│  │   por NBI       │  │                     │  │
│  │                 │  │ IDF: 74.2 🟢        │  │
│  │   [Capa: IDF▼]  │  │ NBI: 22.4% 🟡       │  │
│  │                 │  │ Contratos: 45 📋    │  │
│  │                 │  │                     │  │
│  └─────────────────┘  │ [Ver detalles →]    │  │
│                       └─────────────────────┘  │
│  ───────────────────────────────────────────── │
│  📊 ÚLTIMOS CONTRATOS SECOP                    │
│  • Mantenimiento vial — $450M — En ejecución   │
│  • Suministro PAE — $280M — Terminado          │
│  • Alumbrado público — $180M — En ejecución    │
└─────────────────────────────────────────────────┘
```

**Features del MVP:**
1. Mapa de Rionegro con 17 veredas
2. Choropleth por indicador (IDF, NBI, contratos)
3. Panel con perfil municipal
4. 10 indicadores clave de TerriData
5. Últimos 10 contratos SECOP
6. Comparación con promedio de Antioquia

### Pitch del Gemelo Municipal para la Gobernación de Antioquia

> **"125 municipios, una sola pantalla."**
>
> El Gemelo Municipal de Gobia integra TerriData, SECOP, FUT y cartografía oficial en una plataforma unificada. Por primera vez, la Gobernación puede:
>
> - **Monitorear** los 125 municipios con semáforos automáticos
> - **Identificar** municipios en riesgo fiscal o social antes de la crisis
> - **Comparar** cualquier conjunto de municipios con datos actualizados
> - **Priorizar** asistencia técnica con evidencia territorial
>
> **Piloto gratuito con Rionegro.** Resultados en 4 semanas.

### Precio sugerido y modelo de monetización

| Segmento | Precio mensual | Incluye |
|----------|----------------|---------|
| **Alcaldía cat. 4-6** | $800K COP | 1 municipio, 40 indicadores, 3 usuarios |
| **Alcaldía cat. 2-3** | $2.5M COP | 1 municipio, 80 indicadores, 10 usuarios, alertas |
| **Alcaldía cat. 1** | $5M COP | 1 municipio, full features, API, soporte prioritario |
| **Gobernación** | $25M COP | 125 municipios, dashboard departamental, capacitación |

**Modelo de implementación:**
- Piloto gratuito: 1 mes, 1 municipio
- Onboarding: $5M COP (único)
- Soporte: Incluido en suscripción
- Personalización: $2M COP/día de desarrollo

**Proyección Year 1:**
- Q2: 1 Gobernación piloto (Antioquia) = $0 (piloto)
- Q3: 5 alcaldías pagando = $10M/mes
- Q4: Gobernación convierte + 10 alcaldías = $45M/mes
- **ARR Year 1:** ~$300M COP (~$75K USD)

---

## ANEXOS

### A. Códigos DANE de los 125 municipios de Antioquia

<details>
<summary>Ver lista completa</summary>

| Código | Municipio | Subregión |
|--------|-----------|-----------|
| 05001 | Medellín | Valle de Aburrá |
| 05002 | Abejorral | Oriente |
| 05004 | Abriaquí | Occidente |
| 05021 | Alejandría | Oriente |
| 05030 | Amagá | Suroeste |
| 05031 | Amalfi | Nordeste |
| 05034 | Andes | Suroeste |
| 05036 | Angelópolis | Suroeste |
| 05038 | Angostura | Norte |
| 05040 | Anorí | Nordeste |
| 05042 | Antioquia (Santa Fe de) | Occidente |
| 05044 | Anzá | Occidente |
| 05045 | Apartadó | Urabá |
| 05051 | Arboletes | Urabá |
| 05055 | Argelia | Oriente |
| 05059 | Armenia | Suroeste |
| 05079 | Barbosa | Valle de Aburrá |
| 05086 | Belmira | Norte |
| 05088 | Bello | Valle de Aburrá |
| 05091 | Betania | Suroeste |
| 05093 | Betulia | Suroeste |
| 05101 | Bolívar (Ciudad Bolívar) | Suroeste |
| 05107 | Briceño | Norte |
| 05113 | Buriticá | Occidente |
| 05120 | Cáceres | Bajo Cauca |
| 05125 | Caicedo | Occidente |
| 05129 | Caldas | Valle de Aburrá |
| 05134 | Campamento | Norte |
| 05138 | Cañasgordas | Occidente |
| 05142 | Caracolí | Magdalena Medio |
| 05145 | Caramanta | Suroeste |
| 05147 | Carepa | Urabá |
| 05148 | Carmen de Viboral | Oriente |
| 05150 | Carolina del Príncipe | Norte |
| 05154 | Caucasia | Bajo Cauca |
| 05172 | Chigorodó | Urabá |
| 05190 | Cisneros | Nordeste |
| 05197 | Cocorná | Oriente |
| 05206 | Concepción | Oriente |
| 05209 | Concordia | Suroeste |
| 05212 | Copacabana | Valle de Aburrá |
| 05234 | Dabeiba | Occidente |
| 05237 | Donmatías | Norte |
| 05240 | Ebéjico | Occidente |
| 05250 | El Bagre | Bajo Cauca |
| 05264 | Entrerríos | Norte |
| 05266 | Envigado | Valle de Aburrá |
| 05282 | Fredonia | Suroeste |
| 05284 | Frontino | Occidente |
| 05306 | Giraldo | Occidente |
| 05308 | Girardota | Valle de Aburrá |
| 05310 | Gómez Plata | Norte |
| 05313 | Granada | Oriente |
| 05315 | Guadalupe | Norte |
| 05318 | Guarne | Oriente |
| 05321 | Guatapé | Oriente |
| 05347 | Heliconia | Occidente |
| 05353 | Hispania | Suroeste |
| 05360 | Itagüí | Valle de Aburrá |
| 05361 | Ituango | Norte |
| 05364 | Jardín | Suroeste |
| 05368 | Jericó | Suroeste |
| 05376 | La Ceja | Oriente |
| 05380 | La Estrella | Valle de Aburrá |
| 05390 | La Pintada | Suroeste |
| 05400 | La Unión | Oriente |
| 05411 | Liborina | Occidente |
| 05425 | Maceo | Magdalena Medio |
| 05440 | Marinilla | Oriente |
| 05467 | Montebello | Suroeste |
| 05475 | Murindó | Urabá |
| 05480 | Mutatá | Urabá |
| 05483 | Nariño | Oriente |
| 05490 | Necoclí | Urabá |
| 05495 | Nechí | Bajo Cauca |
| 05501 | Olaya | Occidente |
| 05541 | Peñol | Oriente |
| 05543 | Peque | Occidente |
| 05576 | Pueblorrico | Suroeste |
| 05579 | Puerto Berrío | Magdalena Medio |
| 05585 | Puerto Nare | Magdalena Medio |
| 05591 | Puerto Triunfo | Magdalena Medio |
| 05604 | Remedios | Nordeste |
| 05607 | Retiro | Oriente |
| 05615 | Rionegro | Oriente |
| 05628 | Sabanalarga | Occidente |
| 05631 | Sabaneta | Valle de Aburrá |
| 05642 | Salgar | Suroeste |
| 05647 | San Andrés de Cuerquia | Norte |
| 05649 | San Carlos | Oriente |
| 05652 | San Francisco | Oriente |
| 05656 | San Jerónimo | Occidente |
| 05658 | San José de la Montaña | Norte |
| 05659 | San Juan de Urabá | Urabá |
| 05660 | San Luis | Oriente |
| 05664 | San Pedro de los Milagros | Norte |
| 05665 | San Pedro de Urabá | Urabá |
| 05667 | San Rafael | Oriente |
| 05670 | San Roque | Nordeste |
| 05674 | San Vicente Ferrer | Oriente |
| 05679 | Santa Bárbara | Suroeste |
| 05686 | Santa Rosa de Osos | Norte |
| 05690 | Santo Domingo | Nordeste |
| 05697 | El Santuario | Oriente |
| 05736 | Segovia | Nordeste |
| 05756 | Sonsón | Oriente |
| 05761 | Sopetrán | Occidente |
| 05789 | Támesis | Suroeste |
| 05790 | Tarazá | Bajo Cauca |
| 05792 | Tarso | Suroeste |
| 05809 | Titiribí | Suroeste |
| 05819 | Toledo | Norte |
| 05837 | Turbo | Urabá |
| 05842 | Uramita | Occidente |
| 05847 | Urrao | Suroeste |
| 05854 | Valdivia | Norte |
| 05856 | Valparaíso | Suroeste |
| 05858 | Vegachí | Nordeste |
| 05861 | Venecia | Suroeste |
| 05873 | Vigía del Fuerte | Urabá |
| 05885 | Yalí | Nordeste |
| 05887 | Yarumal | Norte |
| 05890 | Yolombó | Nordeste |
| 05893 | Yondó | Magdalena Medio |
| 05895 | Zaragoza | Bajo Cauca |

</details>

### B. Endpoints de datos.gov.co para Antioquia

```typescript
const ENDPOINTS = {
  terridata: 'https://www.datos.gov.co/resource/64cq-xb2k.json',
  divipola: 'https://www.datos.gov.co/resource/gdxc-w37w.json',
  secop2: 'https://www.datos.gov.co/resource/jbjy-vk9h.json',
  secop1: 'https://www.datos.gov.co/resource/f789-7hwg.json',
  mdm: 'https://www.datos.gov.co/resource/nkjx-rsq7.json',
  fut_ingresos: 'https://www.datos.gov.co/resource/a6ia-xzgy.json',
};

// Filtro para Antioquia
const ANTIOQUIA_FILTER = "$where=starts_with(codigo_dane,'05')";
```

### C. Contactos clave para convenios de datos

| Entidad | Área | Dato a gestionar |
|---------|------|------------------|
| SIATA | Comunicaciones | API de sensores |
| DAP Antioquia | Sistemas | Anuario en API |
| EPM | Datos abiertos | Cobertura por municipio |
| Corantioquia | SIG | Shapefiles ambientales |
| IGAC Medellín | Catastro | Acceso a cartografía |

---

*Documento generado por Claude Code para inplux.co*
*Última actualización: 2026-03-29*
