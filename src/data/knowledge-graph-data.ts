export const graphBooks = [
  {
    id: "general",
    label: "Disposiciones",
    articles: [
      "Art. 1 · Objeto",
      "Art. 3 · Principios",
      "Art. 7 · 25 tributos",
      "Art. 8 · Elementos",
      "Art. 9 · Exenciones",
      "Art. 10 · NIT/RIT",
      "Art. 12 · Remisión ETN",
    ],
  },
  {
    id: "predial",
    label: "Predial",
    articles: [
      "Art. 17 · Sujetos pasivos",
      "Art. 21 · Hecho generador",
      "Art. 23 · Base gravable",
      "Art. 24 · Tarifas",
      "Art. 25 · Reajuste avalúos",
      "Art. 28 · Liquidación",
      "Art. 31 · Sobretasa amb.",
      "Art. 35 · Exenciones",
    ],
  },
  {
    id: "ica",
    label: "ICA",
    articles: [
      "Art. 37 · Hecho generador",
      "Art. 40 · Base gravable",
      "Art. 42 · Tarifa → Art.71",
      "Art. 48 · Economía digital",
      "Art. 50 · Exclusiones",
      "Art. 51 · No sujetas",
      "Art. 70 · Territorialidad",
      "Art. 71 · Códigos CIIU",
    ],
  },
  {
    id: "retencion",
    label: "Retención",
    articles: [
      "Art. 72 · Sistema RetICA",
      "Art. 77 · Autorretención",
      "Art. 78 · Base y tarifa",
      "Art. 81 · Agentes",
      "Art. 82 · No sujetos",
      "Art. 83 · 1.8‰ ≥15 UVT",
    ],
  },
  {
    id: "regimenes",
    label: "Regímenes",
    articles: [
      "Art. 59 · RST (SIMPLE)",
      "Art. 60 · Tarifas RST",
      "Art. 61 · Simplificado",
      "Art. 62 · Requisitos",
      "Art. 67 · Tarifas simpl.",
      "Art. 69 · Unificación",
    ],
  },
  {
    id: "financiero",
    label: "Financiero",
    articles: [
      "Art. 54 · ICA financiero",
      "Art. 55 · Base impositiva",
      "Art. 56 · Oficina +27.8 UVT",
      "Art. 57 · Ing. en Medellín",
      "Art. 58 · Info SuperFin.",
    ],
  },
];

export const crossReferences: [string, string][] = [
  // General → Predial
  ["general-4", "predial-7"],      // Exenciones → Exenciones predial
  ["general-3", "predial-0"],      // Elementos → Sujetos pasivos
  // General → ICA
  ["general-3", "ica-0"],          // Elementos → HG ICA
  ["general-4", "ica-4"],          // Exenciones → Exclusiones ICA
  // Predial connections
  ["predial-2", "predial-3"],      // Base gravable → Tarifas
  ["predial-3", "predial-4"],      // Tarifas → Reajuste avalúos
  // ICA connections
  ["ica-1", "ica-2"],              // Base gravable → Tarifa
  ["ica-2", "ica-7"],              // Tarifa → Códigos CIIU
  ["ica-3", "ica-6"],              // Economía digital → Territorialidad
  ["ica-4", "ica-5"],              // Exclusiones → No sujetas
  // ICA → Retención
  ["ica-0", "retencion-0"],        // HG ICA → Sistema RetICA
  ["ica-7", "retencion-2"],        // Códigos CIIU → Base y tarifa ret.
  // ICA → Regímenes
  ["ica-2", "regimenes-1"],        // Tarifa → Tarifas RST
  ["ica-1", "regimenes-3"],        // Base gravable → Requisitos simpl.
  // ICA → Financiero
  ["ica-0", "financiero-0"],       // HG ICA → ICA financiero
  ["ica-1", "financiero-1"],       // Base gravable → Base imp. financiero
  // Retención → Regímenes
  ["retencion-4", "regimenes-0"],  // No sujetos ret → RST
];
