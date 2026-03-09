/**
 * Plan de Desarrollo Municipal (PDM) 2024-2027 — Medellín
 * "Medellín, Futuro Presente"
 *
 * Datos de indicadores basados en TerriData (DNP) — valores reales 2022-2024.
 * Metas cuatrienales y avances simulados para el ciclo 2024-2027
 * (~50% del cuatrienio transcurrido, ejecución global ~68%).
 *
 * Fuentes: TerriData / DNP, MinEducación, MinSalud, DANE, ICFES,
 *          Función Pública, Medicina Legal, MinDefensa.
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export type StatusColor = "verde" | "amarillo" | "rojo";

export interface PDMIndicator {
  /** Nombre del indicador */
  nombre: string;
  /** Unidad de medida */
  unidad: string;
  /** Línea base (valor al inicio del cuatrienio, típicamente 2023) */
  lineaBase: number;
  /** Meta cuatrienal (2027) */
  meta: number;
  /** Valor actual más reciente */
  actual: number;
  /** Año del dato actual */
  anioActual: number;
  /** Porcentaje de avance hacia la meta (0-100) */
  avance: number;
  /** Fuente del dato */
  fuente: string;
  /** Si la dirección deseada es a la baja (ej. homicidios, pobreza) */
  inverso?: boolean;
}

export interface PDMGoal {
  /** Nombre de la meta / programa */
  nombre: string;
  /** Indicadores asociados */
  indicadores: PDMIndicator[];
}

export interface PDMStrategicLine {
  /** Número de la línea (1-5) */
  numero: number;
  /** Nombre de la línea estratégica */
  nombre: string;
  /** Descripción breve */
  descripcion: string;
  /** Icono identificador (nombre lucide-react) */
  icono: string;
  /** Color de acento */
  color: string;
  /** Porcentaje de avance global de la línea */
  avanceGlobal: number;
  /** Metas / programas */
  metas: PDMGoal[];
}

export interface PDMOverview {
  /** Nombre del PDM */
  nombre: string;
  /** Periodo */
  periodo: string;
  /** Alcalde */
  alcalde: string;
  /** Porcentaje global de ejecución */
  ejecucionGlobal: number;
  /** Total de metas */
  totalMetas: number;
  /** Total de indicadores */
  totalIndicadores: number;
  /** Metas en verde */
  metasVerde: number;
  /** Metas en amarillo */
  metasAmarillo: number;
  /** Metas en rojo */
  metasRojo: number;
  /** MDM - Componente de gestión 2022 */
  mdmGestion: number;
  /** MDM - Componente de resultados 2022 */
  mdmResultados: number;
  /** Líneas estratégicas */
  lineas: PDMStrategicLine[];
}

// ---------------------------------------------------------------------------
// Helper: calcular avance
// ---------------------------------------------------------------------------

function calcAvance(
  base: number,
  meta: number,
  actual: number,
  inverso = false
): number {
  if (inverso) {
    // Para indicadores que deben bajar (ej. pobreza, homicidios)
    const mejoraNecesaria = base - meta;
    if (mejoraNecesaria <= 0) return 100;
    const mejoraLograda = base - actual;
    return Math.max(0, Math.min(100, (mejoraLograda / mejoraNecesaria) * 100));
  }
  const delta = meta - base;
  if (delta <= 0) return actual >= meta ? 100 : 0;
  return Math.max(0, Math.min(100, ((actual - base) / delta) * 100));
}

// ---------------------------------------------------------------------------
// Línea 1 — Territorio de vida (Educación, Salud, Cultura)
// ---------------------------------------------------------------------------

const linea1: PDMStrategicLine = {
  numero: 1,
  nombre: "Medellín, territorio de vida",
  descripcion:
    "Educación de calidad, salud pública, primera infancia y acceso cultural para cerrar brechas sociales.",
  icono: "GraduationCap",
  color: "#5B7BA5",
  avanceGlobal: 72,
  metas: [
    {
      nombre: "Educación con calidad y cobertura",
      indicadores: [
        {
          nombre: "Cobertura neta en educación primaria",
          unidad: "%",
          lineaBase: 93.48,
          meta: 96.0,
          actual: 94.01,
          anioActual: 2023,
          avance: calcAvance(93.48, 96.0, 94.01),
          fuente: "MinEducación — TerriData",
        },
        {
          nombre: "Cobertura neta en educación media",
          unidad: "%",
          lineaBase: 56.18,
          meta: 65.0,
          actual: 57.69,
          anioActual: 2023,
          avance: calcAvance(56.18, 65.0, 57.69),
          fuente: "MinEducación — TerriData",
        },
        {
          nombre: "Tasa de tránsito inmediato a educación superior",
          unidad: "%",
          lineaBase: 45.54,
          meta: 52.0,
          actual: 47.24,
          anioActual: 2023,
          avance: calcAvance(45.54, 52.0, 47.24),
          fuente: "MinEducación (MEN) — TerriData",
        },
        {
          nombre: "Puntaje promedio Saber 11 - Matemáticas",
          unidad: "puntos",
          lineaBase: 50.12,
          meta: 54.0,
          actual: 51.3,
          anioActual: 2023,
          avance: calcAvance(50.12, 54.0, 51.3),
          fuente: "ICFES — TerriData",
        },
        {
          nombre: "Puntaje promedio Saber 11 - Lectura Crítica",
          unidad: "puntos",
          lineaBase: 53.58,
          meta: 56.0,
          actual: 54.2,
          anioActual: 2023,
          avance: calcAvance(53.58, 56.0, 54.2),
          fuente: "ICFES — TerriData",
        },
        {
          nombre: "Tasa de deserción intra-anual (básica y media, oficial)",
          unidad: "%",
          lineaBase: 4.91,
          meta: 3.5,
          actual: 5.4,
          anioActual: 2023,
          avance: calcAvance(4.91, 3.5, 5.4, true),
          fuente: "MinEducación — TerriData",
          inverso: true,
        },
      ],
    },
    {
      nombre: "Salud pública y bienestar",
      indicadores: [
        {
          nombre: "Razón de mortalidad materna a 42 días",
          unidad: "por 100k NV",
          lineaBase: 27.7,
          meta: 20.0,
          actual: 25.45,
          anioActual: 2023,
          avance: calcAvance(27.7, 20.0, 25.45, true),
          fuente: "MinSalud — TerriData",
          inverso: true,
        },
        {
          nombre: "Tasa de fecundidad en mujeres 15-19 años",
          unidad: "por 1.000",
          lineaBase: 26.79,
          meta: 18.0,
          actual: 19.04,
          anioActual: 2024,
          avance: calcAvance(26.79, 18.0, 19.04, true),
          fuente: "MinSalud — TerriData",
          inverso: true,
        },
        {
          nombre: "Tasa de fecundidad en mujeres 10-14 años",
          unidad: "por 1.000",
          lineaBase: 1.07,
          meta: 0.5,
          actual: 0.76,
          anioActual: 2024,
          avance: calcAvance(1.07, 0.5, 0.76, true),
          fuente: "MinSalud — TerriData",
          inverso: true,
        },
      ],
    },
    {
      nombre: "Primera infancia y atención integral",
      indicadores: [
        {
          nombre:
            "Niños con educación inicial en atención integral",
          unidad: "número",
          lineaBase: 71061,
          meta: 80000,
          actual: 74500,
          anioActual: 2024,
          avance: calcAvance(71061, 80000, 74500),
          fuente: "MinEducación — TerriData",
        },
        {
          nombre: "Niños en servicios de educación inicial con 6+ atenciones",
          unidad: "%",
          lineaBase: 84.1,
          meta: 92.0,
          actual: 87.5,
          anioActual: 2024,
          avance: calcAvance(84.1, 92.0, 87.5),
          fuente: "MinEducación — TerriData",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Línea 2 — Transformación ecológica y climática
// ---------------------------------------------------------------------------

const linea2: PDMStrategicLine = {
  numero: 2,
  nombre: "Transformación ecológica y climática",
  descripcion:
    "Gestión ambiental, biodiversidad, riesgo climático y crecimiento verde para la sostenibilidad territorial.",
  icono: "Leaf",
  color: "#6B8E4E",
  avanceGlobal: 58,
  metas: [
    {
      nombre: "Biodiversidad y servicios ecosistémicos",
      indicadores: [
        {
          nombre: "Área en el SINAP (hectáreas protegidas)",
          unidad: "ha",
          lineaBase: 16681.15,
          meta: 18000,
          actual: 17200,
          anioActual: 2024,
          avance: calcAvance(16681.15, 18000, 17200),
          fuente: "Parques Nacionales — TerriData",
        },
        {
          nombre: "% del área territorial en SINAP",
          unidad: "%",
          lineaBase: 44.63,
          meta: 48.0,
          actual: 46.0,
          anioActual: 2024,
          avance: calcAvance(44.63, 48.0, 46.0),
          fuente: "DNP / Parques Nacionales — TerriData",
        },
        {
          nombre: "Negocios verdes registrados",
          unidad: "número",
          lineaBase: 8,
          meta: 25,
          actual: 14,
          anioActual: 2024,
          avance: calcAvance(8, 25, 14),
          fuente: "MinAmbiente — TerriData",
        },
      ],
    },
    {
      nombre: "Gestión del riesgo y resiliencia climática",
      indicadores: [
        {
          nombre: "Índice de riesgo ajustado por capacidades",
          unidad: "puntos",
          lineaBase: 31.89,
          meta: 25.0,
          actual: 29.5,
          anioActual: 2024,
          avance: calcAvance(31.89, 25.0, 29.5, true),
          fuente: "DNP — TerriData",
          inverso: true,
        },
        {
          nombre:
            "Tasa de personas afectadas por eventos recurrentes",
          unidad: "por 100k",
          lineaBase: 2.44,
          meta: 1.5,
          actual: 2.1,
          anioActual: 2024,
          avance: calcAvance(2.44, 1.5, 2.1, true),
          fuente: "UNGRD — TerriData",
          inverso: true,
        },
      ],
    },
    {
      nombre: "Servicios públicos sostenibles",
      indicadores: [
        {
          nombre: "Cobertura de acueducto (REC)",
          unidad: "%",
          lineaBase: 97.32,
          meta: 98.5,
          actual: 96.75,
          anioActual: 2024,
          avance: calcAvance(97.32, 98.5, 96.75),
          fuente: "SSPD / DNP — TerriData",
        },
        {
          nombre: "Cobertura de alcantarillado (REC)",
          unidad: "%",
          lineaBase: 96.51,
          meta: 97.5,
          actual: 96.05,
          anioActual: 2024,
          avance: calcAvance(96.51, 97.5, 96.05),
          fuente: "SSPD / DNP — TerriData",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Línea 3 — Medellín me cuida (Seguridad, Protección social)
// ---------------------------------------------------------------------------

const linea3: PDMStrategicLine = {
  numero: 3,
  nombre: "Medellín me cuida",
  descripcion:
    "Seguridad ciudadana, convivencia, protección social e inclusión para la población vulnerable.",
  icono: "Shield",
  color: "#A0616A",
  avanceGlobal: 62,
  metas: [
    {
      nombre: "Seguridad y reducción de violencia",
      indicadores: [
        {
          nombre: "Tasa de homicidio intencional",
          unidad: "por 100k",
          lineaBase: 13.7,
          meta: 10.0,
          actual: 13.8,
          anioActual: 2023,
          avance: calcAvance(13.7, 10.0, 13.8, true),
          fuente: "MinDefensa / DANE — TerriData",
          inverso: true,
        },
        {
          nombre: "Tasa de hurto a personas",
          unidad: "por 100k",
          lineaBase: 1097.8,
          meta: 850.0,
          actual: 1188.3,
          anioActual: 2023,
          avance: calcAvance(1097.8, 850.0, 1188.3, true),
          fuente: "MinDefensa / DANE — TerriData",
          inverso: true,
        },
        {
          nombre: "Tasa de extorsión",
          unidad: "por 100k",
          lineaBase: 26.2,
          meta: 18.0,
          actual: 33.1,
          anioActual: 2023,
          avance: calcAvance(26.2, 18.0, 33.1, true),
          fuente: "MinDefensa / DANE — TerriData",
          inverso: true,
        },
        {
          nombre: "Tasa de secuestro",
          unidad: "por 100k",
          lineaBase: 0.7,
          meta: 0.3,
          actual: 0.7,
          anioActual: 2023,
          avance: calcAvance(0.7, 0.3, 0.7, true),
          fuente: "MinDefensa / DANE — TerriData",
          inverso: true,
        },
      ],
    },
    {
      nombre: "Convivencia y no violencia",
      indicadores: [
        {
          nombre: "Tasa de violencia intrafamiliar",
          unidad: "por 100k",
          lineaBase: 324.31,
          meta: 250.0,
          actual: 307.6,
          anioActual: 2023,
          avance: calcAvance(324.31, 250.0, 307.6, true),
          fuente: "Medicina Legal / DANE — TerriData",
          inverso: true,
        },
        {
          nombre: "Tasa de violencia interpersonal",
          unidad: "por 100k",
          lineaBase: 184.2,
          meta: 150.0,
          actual: 184.2,
          anioActual: 2023,
          avance: calcAvance(184.2, 150.0, 184.2, true),
          fuente: "Medicina Legal / DANE — TerriData",
          inverso: true,
        },
        {
          nombre: "Fallecidos por siniestros viales",
          unidad: "número",
          lineaBase: 250,
          meta: 180,
          actual: 235,
          anioActual: 2024,
          avance: calcAvance(250, 180, 235, true),
          fuente: "MinDefensa — TerriData",
          inverso: true,
        },
      ],
    },
    {
      nombre: "Reducción de la pobreza",
      indicadores: [
        {
          nombre: "Pobreza monetaria (incidencia)",
          unidad: "%",
          lineaBase: 13.9,
          meta: 11.0,
          actual: 12.8,
          anioActual: 2024,
          avance: calcAvance(13.9, 11.0, 12.8, true),
          fuente: "DANE — TerriData",
          inverso: true,
        },
        {
          nombre: "Pobreza monetaria extrema",
          unidad: "%",
          lineaBase: 2.7,
          meta: 1.8,
          actual: 2.3,
          anioActual: 2024,
          avance: calcAvance(2.7, 1.8, 2.3, true),
          fuente: "DANE — TerriData",
          inverso: true,
        },
        {
          nombre: "Pobreza en NNA (proxy)",
          unidad: "%",
          lineaBase: 49.84,
          meta: 40.0,
          actual: 47.2,
          anioActual: 2024,
          avance: calcAvance(49.84, 40.0, 47.2, true),
          fuente: "DANE — TerriData",
          inverso: true,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Línea 4 — Economía para la vida (Empleo, Desarrollo económico)
// ---------------------------------------------------------------------------

const linea4: PDMStrategicLine = {
  numero: 4,
  nombre: "Economía para la vida",
  descripcion:
    "Empleo digno, formalización, emprendimiento, economía popular y desarrollo productivo sostenible.",
  icono: "Briefcase",
  color: "#B8956A",
  avanceGlobal: 65,
  metas: [
    {
      nombre: "Empleo y formalización laboral",
      indicadores: [
        {
          nombre: "Trabajadores cotizantes SGSS (promedio mensual)",
          unidad: "personas",
          lineaBase: 1017935,
          meta: 1150000,
          actual: 1068000,
          anioActual: 2024,
          avance: calcAvance(1017935, 1150000, 1068000),
          fuente: "FILCO / MinTrabajo — TerriData",
        },
        {
          nombre: "Índice de Ciudades Modernas (ICM)",
          unidad: "de 0 a 100",
          lineaBase: 68.5,
          meta: 73.0,
          actual: 70.2,
          anioActual: 2024,
          avance: calcAvance(68.5, 73.0, 70.2),
          fuente: "Observatorio de Ciudades Modernas — TerriData",
        },
      ],
    },
    {
      nombre: "Economía popular y emprendimiento",
      indicadores: [
        {
          nombre: "Unidades productivas apoyadas",
          unidad: "número",
          lineaBase: 0,
          meta: 12000,
          actual: 7800,
          anioActual: 2025,
          avance: calcAvance(0, 12000, 7800),
          fuente: "Secretaría de Desarrollo Económico",
        },
        {
          nombre: "Beneficiarios de programas de empleo",
          unidad: "personas",
          lineaBase: 0,
          meta: 45000,
          actual: 28500,
          anioActual: 2025,
          avance: calcAvance(0, 45000, 28500),
          fuente: "Secretaría de Desarrollo Económico",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Línea 5 — Gobernanza y gobierno (Admin pública, Transparencia)
// ---------------------------------------------------------------------------

const linea5: PDMStrategicLine = {
  numero: 5,
  nombre: "Gobernanza y gobierno",
  descripcion:
    "Gestión pública moderna, transparencia, gobierno digital, participación ciudadana y fortalecimiento institucional.",
  icono: "Landmark",
  color: "#7B6BA5",
  avanceGlobal: 78,
  metas: [
    {
      nombre: "Desempeño institucional",
      indicadores: [
        {
          nombre: "Índice de Desempeño Institucional",
          unidad: "puntos",
          lineaBase: 85.96,
          meta: 90.0,
          actual: 87.5,
          anioActual: 2024,
          avance: calcAvance(85.96, 90.0, 87.5),
          fuente: "Función Pública — TerriData",
        },
        {
          nombre: "Dimensión: Direccionamiento Estratégico y Planeación",
          unidad: "puntos",
          lineaBase: 94.59,
          meta: 96.0,
          actual: 95.2,
          anioActual: 2024,
          avance: calcAvance(94.59, 96.0, 95.2),
          fuente: "Función Pública — TerriData",
        },
        {
          nombre: "Dimensión: Evaluación de Resultados",
          unidad: "puntos",
          lineaBase: 90.82,
          meta: 93.0,
          actual: 91.8,
          anioActual: 2024,
          avance: calcAvance(90.82, 93.0, 91.8),
          fuente: "Función Pública — TerriData",
        },
        {
          nombre: "Política: Gobierno Digital",
          unidad: "puntos",
          lineaBase: 84.81,
          meta: 92.0,
          actual: 88.0,
          anioActual: 2024,
          avance: calcAvance(84.81, 92.0, 88.0),
          fuente: "Función Pública — TerriData",
        },
        {
          nombre: "Política: Transparencia y lucha contra corrupción",
          unidad: "puntos",
          lineaBase: 78.04,
          meta: 85.0,
          actual: 81.5,
          anioActual: 2024,
          avance: calcAvance(78.04, 85.0, 81.5),
          fuente: "Función Pública — TerriData",
        },
      ],
    },
    {
      nombre: "Desempeño municipal (MDM)",
      indicadores: [
        {
          nombre: "MDM - Componente de gestión",
          unidad: "puntos",
          lineaBase: 83.36,
          meta: 88.0,
          actual: 85.0,
          anioActual: 2024,
          avance: calcAvance(83.36, 88.0, 85.0),
          fuente: "DNP - SPT — TerriData",
        },
        {
          nombre: "MDM - Componente de resultados",
          unidad: "puntos",
          lineaBase: 74.56,
          meta: 80.0,
          actual: 76.8,
          anioActual: 2024,
          avance: calcAvance(74.56, 80.0, 76.8),
          fuente: "DNP - SPT — TerriData",
        },
        {
          nombre: "Participación ciudadana en gestión pública",
          unidad: "puntos",
          lineaBase: 95.95,
          meta: 97.0,
          actual: 96.5,
          anioActual: 2024,
          avance: calcAvance(95.95, 97.0, 96.5),
          fuente: "Función Pública — TerriData",
        },
        {
          nombre: "Servicio al ciudadano",
          unidad: "puntos",
          lineaBase: 95.83,
          meta: 97.0,
          actual: 96.3,
          anioActual: 2024,
          avance: calcAvance(95.83, 97.0, 96.3),
          fuente: "Función Pública — TerriData",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Consolidado
// ---------------------------------------------------------------------------

function countByStatus(lineas: PDMStrategicLine[]): {
  verde: number;
  amarillo: number;
  rojo: number;
  total: number;
} {
  let verde = 0;
  let amarillo = 0;
  let rojo = 0;
  let total = 0;
  for (const l of lineas) {
    for (const m of l.metas) {
      for (const ind of m.indicadores) {
        total++;
        if (ind.avance >= 80) verde++;
        else if (ind.avance >= 50) amarillo++;
        else rojo++;
      }
    }
  }
  return { verde, amarillo, rojo, total };
}

const lineas: PDMStrategicLine[] = [linea1, linea2, linea3, linea4, linea5];
const counts = countByStatus(lineas);

export const pdmMedellin: PDMOverview = {
  nombre: "Medellín, Futuro Presente",
  periodo: "2024 – 2027",
  alcalde: "Federico Gutiérrez Zuluaga",
  ejecucionGlobal: 68,
  totalMetas: lineas.reduce((s, l) => s + l.metas.length, 0),
  totalIndicadores: counts.total,
  metasVerde: counts.verde,
  metasAmarillo: counts.amarillo,
  metasRojo: counts.rojo,
  mdmGestion: 83.36,
  mdmResultados: 74.56,
  lineas,
};

/** Utilidad: obtener el color de semáforo dado un porcentaje de avance */
export function getStatusColor(avance: number): StatusColor {
  if (avance >= 80) return "verde";
  if (avance >= 50) return "amarillo";
  return "rojo";
}

/** Utilidad: label para el status */
export function getStatusLabel(status: StatusColor): string {
  switch (status) {
    case "verde":
      return "En meta";
    case "amarillo":
      return "En progreso";
    case "rojo":
      return "Rezagado";
  }
}
