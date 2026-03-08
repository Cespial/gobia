// ═══════════════════════════════════════════
//   GOBIA.CO — Design Tokens (TypeScript)
//   Monochromatic + single accent (ochre)
//   Values mirror globals.css :root variables.
// ═══════════════════════════════════════════

export const colors = {
  ink: "#2C2418",
  sepia: "#8B7355",
  ochre: "#B8956A",
  ochreSoft: "#F5EDDF",
  foreground: "#2C2418",
  background: "#FAF6F0",
  paper: "#FFFDF8",
  cream: "#F5EFE6",
  gray: {
    100: "#EDE6DA",
    200: "#DDD4C4",
    300: "#BFB5A3",
    400: "#9E9484",
    500: "#7D7365",
    600: "#615849",
    700: "#4A4237",
    800: "#362F26",
    900: "#2C2418",
  },
  border: "#DDD4C4",
  borderLight: "#EDE6DA",
} as const;

export const shadows = {
  xs: "0 1px 2px rgba(44, 36, 24, 0.04)",
  sm: "0 1px 3px rgba(44, 36, 24, 0.05), 0 1px 2px rgba(44, 36, 24, 0.03)",
  md: "0 4px 16px rgba(44, 36, 24, 0.06)",
  lg: "0 12px 40px rgba(44, 36, 24, 0.08)",
  xl: "0 20px 60px rgba(44, 36, 24, 0.12)",
} as const;

export const easing = {
  out: "cubic-bezier(0.25, 1, 0.5, 1)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const typography = {
  heading: {
    hero: { size: "4.25rem", lineHeight: "1.08" },
    h1: { size: "3.5rem", lineHeight: "1.08" },
    h2: { size: "2.75rem", lineHeight: "1.1" },
    section: { size: "2rem", lineHeight: "1.1" },
  },
  body: {
    lg: { size: "1.1875rem", lineHeight: "1.6" },
    base: { size: "1rem", lineHeight: "1.6" },
    sm: { size: "0.875rem", lineHeight: "1.6" },
    meta: { size: "0.75rem", lineHeight: "1.6" },
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  tracking: {
    heading: "-0.02em",
    button: "0.01em",
    eyebrow: "0.1em",
  },
} as const;

export type Colors = typeof colors;
export type Shadows = typeof shadows;
export type Easing = typeof easing;
export type Typography = typeof typography;
