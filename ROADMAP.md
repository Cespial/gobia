# ROADMAP — publia.co

## 1. Ruta crítica (dependencias bloqueantes)

```
Landing page (ACTUAL)
  └─→ Dominio publia.co configurado en Vercel
  └─→ Formulario de leads conectado a Supabase
        └─→ Email de confirmación via Resend
              └─→ CRM / pipeline de ventas

Backend multi-tenant
  └─→ PostgreSQL con PostGIS + pgvector + RLS
  └─→ Auth (Supabase Auth o NextAuth)
        └─→ Dashboard Hacienda (primer módulo)
              └─→ ETL de datos FUT/SISFUT via datos.gov.co
              └─→ Seguimiento PDM
                    └─→ Estatuto Municipal IA (RAG pipeline)
                          └─→ Exógena Automatizada
                                └─→ Rendición Automatizada
                                      └─→ Gemelo Municipal
```

### Hitos críticos

| Hito | Bloquea | Estimación |
|------|---------|------------|
| Landing + formulario funcional | Validación de mercado | Sprint 1 |
| Supabase + auth multi-tenant | Todo el producto | Sprint 2 |
| ETL datos.gov.co (TerriData, SISFUT) | Dashboard Hacienda | Sprint 3 |
| Pipeline RAG (pgvector + Claude) | Estatuto IA | Sprint 4-5 |
| Generador XML (fast-xml-parser) | Exógena | Sprint 6 |

## 2. APIs externas necesarias

### datos.gov.co (Socrata SODA API)

- **TerriData**: `https://www.datos.gov.co/resource/64cq-xb2k.json`
- **Departamentos/Municipios**: `https://www.datos.gov.co/resource/xdk5-pm3f.json`
- **SECOP II Contratos**: `https://www.datos.gov.co/resource/jbjy-vk9h.json`
- **SECOP I**: `https://www.datos.gov.co/resource/f789-7hwg.json`
- Autenticación: App token (header `X-App-Token`), hasta 1,000 req/hora

### Supabase (base de datos + auth + storage)

- PostgreSQL con extensiones: PostGIS, pgvector, pg_cron, pg_trgm
- Row-Level Security para multi-tenancy por `municipio_id`
- Storage para documentos PDF de estatutos
- Auth para login de funcionarios

### Resend (emails transaccionales)

- Confirmación de solicitud de demo
- Notificaciones de alertas del sistema
- Reportes periódicos por email

### Claude API (Anthropic)

- Modelo: Claude Sonnet para RAG sobre estatutos tributarios
- Embeddings: BGE-M3 (self-hosted) para búsqueda vectorial
- Re-ranker: bge-reranker-v2-m3

### DANE Geoportal (ArcGIS REST)

- Endpoint: `https://portalgis.dane.gov.co/portal/sharing/rest/`
- GeoJSON de municipios colombianos
- SRID 4326 (WGS 84)

## 3. Integraciones pendientes

### Analytics y seguimiento

- [ ] Google Analytics 4 (o Plausible para privacy-first)
- [ ] Meta Pixel (para campañas hacia sector público)
- [ ] Hotjar o similar (mapas de calor en landing)

### CRM y ventas

- [ ] HubSpot o Pipedrive (pipeline de demos)
- [ ] Calendly (agendar demos directamente)
- [ ] WhatsApp Business API (canal directo con funcionarios)

### Monitoreo técnico

- [ ] Sentry (error tracking)
- [ ] Vercel Analytics (Web Vitals)
- [ ] Uptime monitoring (BetterUptime o similar)

### Cumplimiento

- [ ] Política de privacidad (Ley 1581/2012)
- [ ] Aviso de tratamiento de datos personales
- [ ] Registro de bases de datos ante SIC

## 4. Siguiente sprint (post-landing)

### Sprint 2: Backend foundation

1. **Configurar Supabase**
   - Crear proyecto
   - Habilitar extensiones (PostGIS, pgvector)
   - Diseñar schema multi-tenant con RLS
   - Tabla `leads` para formulario de contacto

2. **Conectar formulario**
   - Server Action en Next.js para procesar el form
   - Insertar lead en Supabase
   - Enviar email de confirmación via Resend
   - Notificar al equipo comercial

3. **Auth básica**
   - Login para equipo interno (admin dashboard)
   - Gestión de leads y pipeline

### Sprint 3: Primer módulo — Hacienda Dashboard

1. **ETL inicial**
   - Conectar datos.gov.co SODA API
   - Importar datos FUT/SISFUT del municipio piloto
   - Transformar a schema normalizado

2. **Dashboard MVP**
   - Ejecución presupuestal (ingresos vs gastos)
   - Recaudo por tipo de impuesto
   - Indicadores IDF con semáforo
   - Comparativo con municipios similares

3. **Visualización**
   - Integrar Tremor para charts
   - Mapa municipal con react-leaflet
   - Exportación PDF de reportes

### Sprint 4-5: Estatuto Municipal IA

1. **Pipeline RAG**
   - Parsing de PDFs de estatutos (LlamaParse)
   - Chunking jerárquico por artículo
   - Embeddings BGE-M3 en pgvector
   - Búsqueda híbrida (vectorial + full-text)

2. **Interfaz conversacional**
   - Chat con citación de artículos
   - Verificación post-generación
   - Historial de consultas

---

*Última actualización: Marzo 2026*
*Proyecto de inplux.co — Producto hermano: tribai.co*
