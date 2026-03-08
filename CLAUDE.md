# gobia.co — GovTech para el sector público colombiano

## Descripción del producto

Gobia es una plataforma GovTech que transforma la gestión pública colombiana. Es el piloto web de **inplux.co** (empresa matriz) para sector público, con **tribai.co** como producto hermano enfocado en el sector tributario privado.

La plataforma integra 6 módulos: Hacienda Dashboard, Seguimiento PDM, Estatuto Municipal IA, Exógena Automatizada, Gemelo Municipal y Rendición Automatizada.

## Stack técnico

- **Framework**: Next.js 16 (App Router), React 19
- **Lenguaje**: TypeScript 5 (strict mode)
- **Estilos**: Tailwind CSS v4 (CSS-first con `@theme inline`)
- **Animaciones**: Framer Motion 12+
- **Iconos**: Lucide React
- **Componentes**: Radix UI primitives
- **Utilidades**: clsx + tailwind-merge (helper `cn()` en `src/lib/utils.ts`)
- **Deploy**: Vercel

## Design tokens — Monochromatic + single accent

### Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--ink` | #2C2418 | Texto primario, fondos oscuros (SolidezTecnica, Footer) |
| `--sepia` | #8B7355 | Texto secundario sutil |
| `--ochre` | #B8956A | **Único acento** — badges, enlaces, highlights |
| `--ochre-soft` | #F5EDDF | Fondos suaves de acento |
| `--background` | #FAF6F0 | Fondo principal (cream) |
| `--paper` | #FFFDF8 | Fondos de sección claros |
| `--cream` | #F5EFE6 | Fondos alternos |
| `--border` | #DDD4C4 | Bordes principales |
| `--border-light` | #EDE6DA | Bordes sutiles |
| Warm grays | #EDE6DA → #2C2418 | Escala 100-900 |

### Tipografía

- **Body**: Plus Jakarta Sans (300-800) — variable `--font-jakarta`
- **Display/headings**: DM Serif Display (400) — variable `--font-dm-serif`
- **Heading sizes**: 2rem (section) → 4.25rem (hero), line-height 1.08-1.1
- **Body sizes**: 0.75rem (meta) → 1.1875rem (lg body), line-height 1.6
- **Letter spacing**: -0.02em (headings), 0.01em (buttons), 0.1em (eyebrows)

### Componentes base (en globals.css)

- `.btn-primary`: ink bg, paper text, hover → ochre bg, 8px radius
- `.btn-secondary`: transparent, ink border, hover → cream bg
- `.card`: paper bg, border, 14px radius, hover → gray-300 border + lift
- `.form-input`: paper bg, border, 8px radius, focus → ink border
- `.fine-rule`: 1px border-light separator

## Arquitectura de carpetas

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Landing page (compone secciones)
│   └── globals.css         # Design tokens, component classes
├── components/
│   ├── ui/                 # Navbar, Button, etc.
│   └── sections/           # Hero, ProblemaSection, SolucionSection, etc.
└── lib/
    └── utils.ts            # cn() helper
```

## Comandos

```bash
npm run dev     # Desarrollo local (Turbopack)
npm run build   # Build de producción
npm run lint    # ESLint
npx vercel      # Deploy a Vercel
```

## Principios de UX/UI

1. **Storytelling narrativo**: Problema → Solución → Evidencia → CTA
2. **Above the fold**: Headline + propuesta de valor + CTA inmediato
3. **Solidez técnica visible**: Stack y arquitectura como señal de confianza
4. **Micro-interactions**: Framer Motion para reveals, hovers, transiciones
5. **Mobile-first**: Todos los breakpoints parten de mobile

## Reglas de código

- Componentes: PascalCase (`Hero.tsx`, `CTAFinal.tsx`)
- Hooks y utilidades: camelCase
- No magic numbers: usar variables CSS o constantes
- Mobile-first: estilos base son mobile, md:/lg: para responsive
- Imports: usar alias `@/*` (mapea a `src/*`)
- Animaciones: Framer Motion con `useInView` para scroll reveals
- Respetar `prefers-reduced-motion: reduce`

## Contexto de negocio

- **Público objetivo**: Tomadores de decisión en entidades públicas colombianas
  - Secretarios de hacienda
  - Directores de planeación
  - Alcaldes y gobernadores
  - Funcionarios de control interno
- **Entidades**: Alcaldías, gobernaciones, secretarías, entidades descentralizadas
- **Marco normativo**: Ley 962/2005, Res. 111/2025, NTC 5854, Ley 1581/2012
- **Diferenciador**: Integración de datos gubernamentales fragmentados en una sola plataforma con IA
