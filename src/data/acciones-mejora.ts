/**
 * Acciones de Mejora — Typology of corrective actions for CUIPO validation
 *
 * From Johan's TAREAS.xlsx — 4 categories with improvement action items
 * that municipalities can take when validation issues are detected.
 *
 * Sprint A (2026-04-15)
 */

export interface AccionMejora {
  categoria: string;
  items: string[];
}

/**
 * 4 categories of improvement actions from Johan's typology.
 *
 * Note: The original categories in Johan's Excel have minor typos
 * (e.g., "Corección" instead of "Corrección") which we preserve
 * in the data but normalize in the category field.
 */
export const ACCIONES_MEJORA: AccionMejora[] = [
  {
    categoria: "Corrección de errores aritméticos",
    items: [
      "Suma por destinaciones no corresponden con el porcentaje dado en el acto administrativo",
      "Compromisos mayores a presupuesto definitivo",
      "Obligaciones mayores a los compromisos",
      "Pagos mayores a las obligaciones",
      "Desequilibrio presupuestal entre el presupuesto de ingresos y el presupuesto de gastos",
    ],
  },
  {
    categoria: "Corrección en la utilización de clasificadores presupuestales",
    items: [
      "Uso de fuentes en rubros no permitidos",
      "No reporte de las destinaciones específicas de la forma correcta",
      "Uso de fuentes en secciones presupuestales no permitidas",
    ],
  },
  {
    categoria: "Corrección en el uso de rubros presupuestales",
    items: [
      "Utilización de rubros no habilitados para la ET",
      "Utilización de rubros no habilitados para la sección presupuestal",
    ],
  },
  {
    categoria: "Corrección de situaciones observadas para cálculo del indicador de Ley 617 de 2000",
    items: [
      "Utilización de rubros que no suman para el indicador de Ley 617",
      "Reporte de combinaciones que no suman para el indicador de Ley 617",
      "Reporte deficiente de combinación que aumentan los gastos de funcionamiento",
    ],
  },
];

/** Total count of improvement action items across all categories */
export const TOTAL_ACCIONES_MEJORA = ACCIONES_MEJORA.reduce(
  (sum, cat) => sum + cat.items.length,
  0
);

/**
 * Find the category that an improvement action item belongs to.
 * Returns null if the item is not found.
 */
export function getCategoriaAccion(item: string): string | null {
  const lower = item.toLowerCase().trim();
  for (const cat of ACCIONES_MEJORA) {
    if (cat.items.some((i) => i.toLowerCase().trim() === lower)) {
      return cat.categoria;
    }
  }
  return null;
}
