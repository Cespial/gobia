// ═══════════════════════════════════════════
//   GOBIA.CO — Design Tokens (TypeScript)
//   Single source of truth for TS components.
//   Values mirror globals.css :root variables.
//   Hereda de inplux-web + tribai.co
// ═══════════════════════════════════════════

export const colors = {
  navy: "#0F1D31",
  navyLight: "#1a2d4a",
  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  teal: "#0d7d74",
  tealSoft: "#e8f5f3",
  gold: "#C4952A",
  goldSoft: "#FEF9EC",
  foreground: "#1a1918",
  background: "#ffffff",
  offWhite: "#f8f8f7",
  warm50: "#f3f1ee",
  gray: {
    100: "#e8e6e3",
    200: "#d1cfcc",
    300: "#a8a5a0",
    400: "#8a8784",
    500: "#6e6b68",
    600: "#545250",
    700: "#3d3b39",
    800: "#282726",
    900: "#1a1918",
  },
  border: "#e5e3e0",
  borderLight: "#f0eeeb",
} as const;

export const shadows = {
  xs: "0 1px 2px rgba(0, 0, 0, 0.03)",
  sm: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
  md: "0 4px 16px rgba(0, 0, 0, 0.05)",
  lg: "0 12px 40px rgba(0, 0, 0, 0.07)",
  xl: "0 20px 60px rgba(0, 0, 0, 0.1)",
} as const;

export const easing = {
  out: "cubic-bezier(0.25, 1, 0.5, 1)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const typography = {
  heading: {
    hero: { size: "4.75rem", lineHeight: "1.05" },
    h1: { size: "3.5rem", lineHeight: "1.05" },
    h2: { size: "2.5rem", lineHeight: "1.1" },
    section: { size: "2rem", lineHeight: "1.1" },
  },
  body: {
    lg: { size: "1.25rem", lineHeight: "1.6" },
    base: { size: "1rem", lineHeight: "1.6" },
    sm: { size: "0.875rem", lineHeight: "1.6" },
    meta: { size: "0.75rem", lineHeight: "1.6" },
  },
  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
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
