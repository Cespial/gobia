# gobia.co — Plataforma GovTech para el Sector Público Colombiano

> Centro de mando fiscal e inteligencia territorial para municipios y gobernaciones de Colombia. Dashboard de hacienda, seguimiento PDM, estatuto tributario con IA (RAG), exógena automatizada, gemelo municipal y rendición de cuentas.

[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Mapbox](https://img.shields.io/badge/Mapbox_GL-3-000?logo=mapbox&logoColor=white)](https://www.mapbox.com)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000)](https://www.pinecone.io)

**Live:** [gobia.co](https://gobia.co) · **Demo fiscal:** [gobia.co/demo](https://gobia.co/demo)

## Descripción

gobia.co es el piloto web de [inplux.co](https://inplux.co) para el sector público colombiano. Transforma la administración pública municipal mediante inteligencia de datos, automatización fiscal y asistentes IA normativos. Dirigido a secretarios de hacienda, directores de planeación, alcaldes, gobernadores y control interno.

Producto hermano de [tribai.co](https://tribai.co) (sector privado tributario).

## Módulos del producto

| # | Módulo | Descripción | Estado |
|---|--------|-------------|--------|
| 1 | **Hacienda Dashboard** | Ejecución presupuestal, recaudo, IDF, cartera morosa, inversión por sector | Demo |
| 2 | **Seguimiento PDM** | Tracking del Plan de Desarrollo Municipal con indicadores de avance | Demo |
| 3 | **Estatuto Municipal IA** | Chat RAG sobre estatutos tributarios municipales (piloto: Acuerdo 093/2023 de Medellín) | Funcional |
| 4 | **Exógena Automatizada** | Generación automática de información exógena DIAN en XML | Diseño |
| 5 | **Gemelo Municipal** | Gemelo digital del municipio con visualización geoespacial (comunas, barrios, predial, ICA) | Demo |
| 6 | **Rendición Automatizada** | Generación automática de reportes de rendición de cuentas para CGR/SIRECI | Diseño |

## Demo: Centro de Mando Fiscal — Medellín

La ruta `/demo` presenta un dashboard fiscal completo para Medellín con:

- **Mapa Mapbox persistente** (panel izquierdo, 55% en desktop) — 16 comunas y 349 barrios con selección interactiva
- **Panel de datos scrollable** con navegación por secciones sticky
- **Secciones:** Resumen Ejecutivo, Pulso Fiscal, Ejecución Presupuestal, Radiografía de Recaudo, Estructura de Gasto, Cartera Morosa, IDF Deep Dive, Autonomía Financiera, TerriData
- **Chat IA del Estatuto** — panel deslizante con RAG sobre el Acuerdo 093/2023
- **Datos en vivo** de datos.gov.co (FUT, SECOP)

## Pipeline RAG (Estatuto Tributario)

```
Pregunta → OpenAI text-embedding-3-small (1536d)
         → Pinecone query (namespace: acuerdo-093, top-k chunks)
         → GPT-4o-mini (temperature 0.1, max 1024 tokens)
         → Respuesta con citaciones de artículos
```

- **Fuente:** Estatuto Tributario de Medellín (Acuerdo 093 de 2023)
- **Chunking:** ~500 tokens con 50 tokens de overlap, split por párrafo/oración
- **Tipos de chunk:** artículo, tarifa, parámetro, listado, metadata
- **Degradación graceful:** fallback si faltan API keys (503 con detalle)

## Fuentes de datos (datos.gov.co SODA API)

| Dataset | ID | Uso |
|---------|-----|-----|
| FUT Ingresos | `a6ia-xzgy` | Ejecución presupuestal |
| SECOP Integrado | `rpmr-utcd` | Contratos públicos |
| SECOP II | `jbjy-vk9h` | Contratos electrónicos |
| DIVIPOLA Municipios | `gdxc-w37w` | Selector de municipios |
| MDM Desempeño | `nkjx-rsq7` | Dashboard IDF |

Proxy server-side en `/api/datos-gov` con caché de 1 hora (`revalidate: 3600`).

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Lenguaje | TypeScript 5 (strict) |
| Estilos | Tailwind CSS v4 (CSS-first, `@theme inline`) |
| Animaciones | Framer Motion 12+ |
| Mapas | Mapbox GL JS 3 |
| IA — Embeddings | OpenAI `text-embedding-3-small` (1536d) |
| IA — Generación | GPT-4o-mini |
| Vector DB | Pinecone |
| UI | Radix UI (Dialog) + Lucide React |
| Tipografía | Plus Jakarta Sans (body) + Space Grotesk (display) |
| Deploy | Vercel |

## Estructura del proyecto

```
gobia/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing (10 secciones con lazy loading)
│   │   ├── actions/contact.ts       # Server Action: captura de leads
│   │   ├── api/
│   │   │   ├── datos-gov/route.ts   # Proxy SODA API con caché
│   │   │   └── estatuto-rag/route.ts # Endpoint RAG
│   │   ├── demo/                    # Dashboard fiscal Medellín
│   │   │   ├── page.tsx             # Centro de mando principal
│   │   │   ├── exogena/             # Módulo exógena
│   │   │   ├── gemelo/              # Gemelo municipal
│   │   │   ├── hacienda/            # Dashboard hacienda
│   │   │   ├── pdm/                 # Seguimiento PDM
│   │   │   └── rendicion/           # Rendición de cuentas
│   │   ├── robots.ts, sitemap.ts    # SEO
│   │   └── opengraph-image.tsx      # OG dinámico
│   ├── components/
│   │   ├── sections/                # 10 secciones landing (Hero → CTA)
│   │   ├── dashboard/               # 16 componentes del dashboard fiscal
│   │   ├── demo/                    # EstatutoChat, EstatutoGraph, TarifasTable
│   │   ├── illustrations/           # 20 SVGs/ilustraciones
│   │   ├── layout/                  # Navbar
│   │   └── ui/                      # Badge, Button, Card, GradientText
│   ├── data/                        # Datos estáticos (comunas, barrios, hacienda, PDM, etc.)
│   └── lib/
│       ├── rag/                     # Pipeline RAG (embedder, Pinecone client, document processor)
│       ├── datos-gov.ts             # Cliente SODA API
│       └── design-tokens.ts         # Tokens de diseño en TS
├── scripts/
│   └── index-documents.ts          # CLI para indexar Estatuto en Pinecone
├── public/
│   ├── data/                        # GeoJSON (barrios, comunas, departamentos)
│   └── hero/                        # Video hero (mp4 + webm + poster)
└── package.json
```

## Sistema de diseño

Paleta monocromática con acento único (ocre):

| Token | Valor | Uso |
|-------|-------|-----|
| `--ink` | `#2C2418` | Texto primario, fondos oscuros |
| `--sepia` | `#8B7355` | Texto secundario |
| `--ochre` | `#B8956A` | Acento único (badges, links, highlights) |
| `--ochre-soft` | `#F5EDDF` | Fondos de acento suave |
| `--background` | `#FAF6F0` | Fondo neutro crema |
| `--paper` | `#FFFDF8` | Fondo de secciones |

## Variables de entorno

```env
OPENAI_API_KEY=            # Embeddings + RAG
PINECONE_API_KEY=          # Vector DB
NEXT_PUBLIC_MAPBOX_TOKEN=  # Mapbox GL JS
RESEND_API_KEY=            # Emails (opcional)
CONTACT_EMAIL=             # Notificaciones de leads
```

## Instalación

```bash
git clone https://github.com/Cespial/gobia.git
cd gobia
npm install
cp .env.example .env.local  # Configurar variables
npm run dev
```

### Indexar Estatuto Tributario

```bash
npm run index-docs  # Indexa Acuerdo 093/2023 en Pinecone
```

## Marco regulatorio

- Ley 962/2005 (Anti-trámites)
- Resolución 111/2025 (Estándares digitales)
- NTC 5854 (Accesibilidad web)
- Ley 1581/2012 (Protección de datos)

## Decisiones arquitectónicas

- **Lazy loading:** Secciones below-fold con `next/dynamic` + skeleton placeholders
- **SODA API proxy:** Route handler server-side con caché de 1 hora
- **Server Actions:** Formulario de contacto con `"use server"`
- **Mapbox SSR disabled:** `UnifiedMap` cargado con `ssr: false`
- **Optimización de bundles:** Framer Motion tree-shaken via `optimizePackageImports`
- **Imágenes:** AVIF + WebP configurados

## Licencia

Proyecto privado — [inplux.co](https://inplux.co)

---

Desarrollado por [Cristian Espinal Maya](https://github.com/Cespial) · [gobia.co](https://gobia.co) · [inplux.co](https://inplux.co)
