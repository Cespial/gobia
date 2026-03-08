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

## Design tokens (heredados de inplux-web + tribai.co)

### Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--navy` | #0F1D31 | Fondos hero, headings, CTA primario |
| `--navy-light` | #1a2d4a | Gradientes |
| `--blue` | #2563EB | CTA hover, links, acentos interactivos |
| `--blue-soft` | #EFF6FF | Fondos hover suaves |
| `--teal` | #0d7d74 | Acento principal (herencia inplux) |
| `--teal-soft` | #e8f5f3 | Fondos de acento |
| `--gold` | #C4952A | Acento terciario (herencia tribai) |
| `--gold-soft` | #FEF9EC | Fondos gold |
| `--foreground` | #1a1918 | Texto primario (ink) |
| `--off-white` | #f8f8f7 | Fondos alternos de sección |
| `--warm-50` | #f3f1ee | Tinte cálido sutil |
| Grays | #e8e6e3 → #0d0c0c | Escala de grises cálidos (100-950) |

### Tipografía

- **Body**: Plus Jakarta Sans (300-800) — variable `--font-jakarta`
- **Display/headings**: DM Serif Display (400) — variable `--font-dm-serif`
- **Heading sizes**: 2rem (section) → 4.75rem (hero), line-height 1.05-1.1
- **Body sizes**: 0.75rem (meta) → 1.25rem (large body), line-height 1.6
- **Letter spacing**: -0.02em (headings), 0.01em (buttons), 0.1em (eyebrows)

### Componentes base (en globals.css)

- `.btn-primary`: navy bg, white text, hover → blue, 8px radius
- `.btn-secondary`: transparent, border, hover → off-white
- `.card`: white bg, border, 14px radius, hover → lift + shadow
- `.form-input`: white bg, border, 8px radius, focus → navy border
- `.gradient-hero`: navy → navy-light diagonal gradient
- `.gradient-mesh`: multi-radial teal/blue/gold subtle overlay

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
