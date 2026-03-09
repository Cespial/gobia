/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Medellín (05001) — TerriData Data Lake
 * Fuente: DNP - TerriData (TerriData.txt pipe-delimited)
 * Municipio: Medellín | Departamento: Antioquia (05)
 * Datos reales extraídos del archivo TerriData del DNP
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { colors } from "@/lib/design-tokens";

// ═══════════════════════════════════════════════════════════════════════════
//  Shared types
// ═══════════════════════════════════════════════════════════════════════════

export interface TerriDataIndicator {
  indicator: string;
  indicatorCode: string;
  value: number;
  year: number;
  source: string;
  unit: string;
}

export interface TimeSeriesPoint {
  year: number;
  value: number;
}

export interface DimensionSummary {
  dimension: string;
  color: string;
  indicatorCount: number;
  latestYear: number;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Municipality metadata
// ═══════════════════════════════════════════════════════════════════════════

export const municipioMeta = {
  deptCode: "05",
  deptName: "Antioquia",
  muniCode: "05001",
  muniName: "Medellín",
  category: "Especial",
  grupoDI: "Ciudades",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//  1. FINANZAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════

// --- 1a. Desempeño Fiscal (2020) ---

export interface DesempenoFiscalIndicator {
  indicator: string;
  code: string;
  value: number;
  year: number;
  unit: string;
}

export const desempenoFiscal: DesempenoFiscalIndicator[] = [
  { indicator: "% de ingresos corrientes destinados a funcionamiento", code: "070100001", value: 39.97, year: 2020, unit: "Puntos" },
  { indicator: "% de ingresos corrientes que corresponden a recursos propios", code: "070100004", value: 80.93, year: 2020, unit: "Puntos" },
  { indicator: "% de ingresos que corresponden a transferencias", code: "070100003", value: 30.53, year: 2020, unit: "Puntos" },
  { indicator: "% del gasto total destinado a inversión", code: "070100005", value: 85.95, year: 2020, unit: "Puntos" },
  { indicator: "Capacidad de ahorro", code: "070100006", value: 63.94, year: 2020, unit: "Puntos" },
  { indicator: "Indicador de desempeño fiscal", code: "070100007", value: 81.51, year: 2020, unit: "Puntos" },
  { indicator: "Respaldo de la deuda", code: "070100002", value: 11.22, year: 2020, unit: "Puntos" },
];

// --- 1b. Nuevo Índice de Desempeño Fiscal (2020-2022) ---

export interface NuevoIDFIndicator {
  indicator: string;
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const nuevoIDF: NuevoIDFIndicator[] = [
  { indicator: "Puntaje nuevo Índice de Desempeño Fiscal", code: "070130012", series: [{ year: 2022, value: 71.18 }, { year: 2021, value: 80.45 }, { year: 2020, value: 78.56 }], unit: "Puntos" },
  { indicator: "Componente de gestión financiera", code: "070130011", series: [{ year: 2022, value: 87.25 }, { year: 2021, value: 100.00 }, { year: 2020, value: 100.00 }], unit: "Porcentaje" },
  { indicator: "Componente de resultados fiscales", code: "070130006", series: [{ year: 2022, value: 67.15 }, { year: 2021, value: 75.56 }, { year: 2020, value: 73.19 }], unit: "Porcentaje" },
  { indicator: "Ahorro Corriente", code: "070130004", series: [{ year: 2022, value: 63.83 }, { year: 2021, value: 65.77 }, { year: 2020, value: 63.94 }], unit: "Porcentaje" },
  { indicator: "Balance Fiscal Primario", code: "070130005", series: [{ year: 2022, value: 11.98 }, { year: 2021, value: 9.47 }, { year: 2020, value: 14.25 }], unit: "Porcentaje" },
  { indicator: "Dependencia de las transferencias", code: "070130001", series: [{ year: 2022, value: 29.36 }, { year: 2021, value: 30.82 }, { year: 2020, value: 30.53 }], unit: "Porcentaje" },
  { indicator: "Endeudamiento de Largo Plazo", code: "070130003", series: [{ year: 2022, value: 38.02 }, { year: 2021, value: 32.10 }, { year: 2020, value: 29.61 }], unit: "Porcentaje" },
  { indicator: "Relevancia Formación Bruta de Capital fijo", code: "070130002", series: [{ year: 2022, value: 15.71 }, { year: 2021, value: 13.60 }, { year: 2020, value: 20.79 }], unit: "Porcentaje" },
  { indicator: "Capacidad de Ejecución de Ingresos", code: "070130007", series: [{ year: 2022, value: 108.59 }, { year: 2021, value: 103.26 }, { year: 2020, value: 10.03 }], unit: "Porcentaje" },
  { indicator: "Capacidad de Ejecución de Inversión", code: "070130008", series: [{ year: 2022, value: 94.49 }, { year: 2021, value: 97.54 }, { year: 2020, value: 94.12 }], unit: "Porcentaje" },
];

export const rangoIDF: Record<number, string> = {
  2022: "4. Solvente (>=70 y <80)",
  2021: "5. Sostenible (>=80)",
  2020: "4. Solvente (>=70 y <80)",
};

// --- 1c. Operaciones Efectivas de Caja (millones COP) ---

export interface OperacionesEfectivasCaja {
  indicator: string;
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const operacionesEfectivasCaja: OperacionesEfectivasCaja[] = [
  { indicator: "Ingresos totales", code: "070010001", series: [{ year: 2022, value: 6_894_172.15 }, { year: 2021, value: 5_976_297.00 }, { year: 2020, value: 5_668_615.80 }], unit: "Millones de pesos corrientes" },
  { indicator: "Ingresos corrientes", code: "070010002", series: [{ year: 2022, value: 2_668_045.35 }, { year: 2021, value: 2_443_479.75 }, { year: 2020, value: 2_204_221.70 }], unit: "Millones de pesos corrientes" },
  { indicator: "Ingresos tributarios", code: "070010003", series: [{ year: 2022, value: 2_293_460.41 }, { year: 2021, value: 2_116_992.75 }, { year: 2020, value: 1_783_832.54 }], unit: "Millones de pesos corrientes" },
  { indicator: "Ingresos de capital", code: "070010011", series: [{ year: 2022, value: 4_226_126.80 }, { year: 2021, value: 3_532_817.25 }, { year: 2020, value: 3_464_394.10 }], unit: "Millones de pesos corrientes" },
  { indicator: "Gastos totales", code: "070010006", series: [{ year: 2022, value: 6_871_538.34 }, { year: 2021, value: 6_249_452.50 }, { year: 2020, value: 5_657_679.80 }], unit: "Millones de pesos corrientes" },
  { indicator: "Gastos corrientes", code: "070010007", series: [{ year: 2022, value: 965_102.94 }, { year: 2021, value: 834_569.25 }, { year: 2020, value: 794_794.97 }], unit: "Millones de pesos corrientes" },
  { indicator: "Funcionamiento", code: "070010008", series: [{ year: 2022, value: 802_106.24 }, { year: 2021, value: 738_144.69 }, { year: 2020, value: 692_983.34 }], unit: "Millones de pesos corrientes" },
  { indicator: "Gastos de capital (Inversión)", code: "070010012", series: [{ year: 2022, value: 5_906_435.40 }, { year: 2021, value: 5_414_883.50 }, { year: 2020, value: 4_862_884.82 }], unit: "Millones de pesos corrientes" },
  { indicator: "Déficit o ahorro corriente", code: "070010010", series: [{ year: 2022, value: 1_702_942.41 }, { year: 2021, value: 1_608_910.50 }, { year: 2020, value: 1_409_426.73 }], unit: "Millones de pesos corrientes" },
  { indicator: "Déficit o superávit total", code: "070010013", series: [{ year: 2022, value: 22_633.81 }, { year: 2021, value: -273_155.56 }, { year: 2020, value: 10_936.00 }], unit: "Millones de pesos corrientes" },
  { indicator: "Intereses de deuda pública", code: "070010009", series: [{ year: 2022, value: 162_996.70 }, { year: 2021, value: 96_424.56 }, { year: 2020, value: 101_811.63 }], unit: "Millones de pesos corrientes" },
];

// --- 1c-2. OEC Per cápita ---

export const oecPerCapita: OperacionesEfectivasCaja[] = [
  { indicator: "Ingresos totales per cápita", code: "070010018", series: [{ year: 2022, value: 2_680_106.58 }, { year: 2021, value: 2_322_497.50 }, { year: 2020, value: 2_237_531.42 }], unit: "Pesos corrientes" },
  { indicator: "Gastos corrientes per cápita", code: "070010025", series: [{ year: 2022, value: 375_183.37 }, { year: 2021, value: 324_328.78 }, { year: 2020, value: 313_723.63 }], unit: "Pesos corrientes" },
  { indicator: "Gastos de funcionamiento per cápita", code: "070010026", series: [{ year: 2022, value: 311_818.47 }, { year: 2021, value: 286_879.85 }, { year: 2020, value: 273_598.53 }], unit: "Pesos corrientes" },
  { indicator: "Transferencias nacionales (SGP, etc.) per cápita", code: "070010029", series: [{ year: 2022, value: 783_812.79 }, { year: 2021, value: 713_717.94 }, { year: 2020, value: 1_946.69 }], unit: "Pesos corrientes" },
];

// --- 1d. Inversión por sectores (2020, pesos corrientes) ---

export interface InversionSector {
  sector: string;
  code: string;
  value: number;
  percentage: number;
  year: number;
}

export const inversionPorSectores: InversionSector[] = [
  { sector: "Educación", code: "070120001", value: 1_457_833_894_156, percentage: 0.31, year: 2020 },
  { sector: "Salud", code: "070120002", value: 1_045_769_646_402, percentage: 0.22, year: 2020 },
  { sector: "Transporte", code: "070120009", value: 501_325_318_156, percentage: 0.11, year: 2020 },
  { sector: "Atención a grupos vulnerables", code: "070120014", value: 331_675_085_622, percentage: 0.07, year: 2020 },
  { sector: "Fortalecimiento institucional", code: "070120017", value: 262_921_501_186, percentage: 0.06, year: 2020 },
  { sector: "Agua potable y saneamiento básico", code: "070120003", value: 188_931_500_627, percentage: 0.04, year: 2020 },
  { sector: "Justicia y seguridad", code: "070120018", value: 164_912_274_817, percentage: 0.03, year: 2020 },
  { sector: "Deporte y recreación", code: "070120004", value: 141_169_639_627, percentage: 0.03, year: 2020 },
  { sector: "Cultura", code: "070120005", value: 115_348_361_041, percentage: 0.02, year: 2020 },
  { sector: "Vivienda", code: "070120007", value: 104_237_456_911, percentage: 0.02, year: 2020 },
  { sector: "Servicios públicos", code: "070120006", value: 91_944_034_736, percentage: 0.02, year: 2020 },
  { sector: "Prevención y atención de desastres", code: "070120012", value: 84_833_242_463, percentage: 0.02, year: 2020 },
  { sector: "Promoción del desarrollo", code: "070120013", value: 82_593_503_972, percentage: 0.02, year: 2020 },
  { sector: "Equipamiento", code: "070120015", value: 61_511_102_404, percentage: 0.01, year: 2020 },
  { sector: "Desarrollo comunitario", code: "070120016", value: 49_930_078_063, percentage: 0.01, year: 2020 },
  { sector: "Ambiental", code: "070120010", value: 37_111_329_080, percentage: 0.01, year: 2020 },
  { sector: "Agropecuario", code: "070120008", value: 4_820_933_806, percentage: 0.00, year: 2020 },
  { sector: "Centros de reclusión", code: "070120011", value: 4_774_126_168, percentage: 0.00, year: 2020 },
];

// --- 1e. SGP Distribución por sectores (pesos corrientes) ---

export interface SGPSector {
  sector: string;
  code: string;
  series: TimeSeriesPoint[];
}

export const sgpDistribucion: SGPSector[] = [
  { sector: "Educación", code: "070070001", series: [
    { year: 2024, value: 1_425_804_316_084 }, { year: 2023, value: 1_054_359_337_409 },
    { year: 2022, value: 954_548_801_834 }, { year: 2021, value: 951_823_301_433 },
    { year: 2020, value: 899_922_052_510 },
  ]},
  { sector: "Libre Inversión", code: "070070007", series: [
    { year: 2024, value: 99_282_909_451 }, { year: 2023, value: 78_985_179_248 },
    { year: 2022, value: 70_935_783_724 }, { year: 2021, value: 67_127_163_452 },
    { year: 2020, value: 61_221_779_686 },
  ]},
  { sector: "Fonpet - Asignaciones Especiales", code: "070070012", series: [
    { year: 2024, value: 53_049_989_852 }, { year: 2023, value: 44_458_952_878 },
    { year: 2022, value: 32_055_239_324 }, { year: 2021, value: 31_457_291_161 },
    { year: 2020, value: 6_929_497_422 },
  ]},
  { sector: "Agua potable", code: "070070003", series: [
    { year: 2024, value: 39_103_015_626 }, { year: 2023, value: 31_856_034_823 },
    { year: 2022, value: 31_230_601_711 }, { year: 2021, value: 30_666_004_507 },
    { year: 2020, value: 31_228_108_106 },
  ]},
  { sector: "Fonpet - Propósito general", code: "070070008", series: [
    { year: 2024, value: 13_063_540_717 }, { year: 2023, value: 10_392_786_743 },
    { year: 2022, value: 9_333_655_754 }, { year: 2021, value: 8_832_521_507 },
    { year: 2020, value: 8_055_497_326 },
  ]},
  { sector: "Deporte", code: "070070004", series: [
    { year: 2024, value: 10_450_832_574 }, { year: 2023, value: 8_314_229_394 },
    { year: 2022, value: 7_466_924_603 }, { year: 2021, value: 7_066_017_205 },
    { year: 2020, value: 6_444_397_861 },
  ]},
  { sector: "Cultura", code: "070070005", series: [
    { year: 2024, value: 7_838_124_430 }, { year: 2023, value: 6_235_672_046 },
    { year: 2022, value: 5_600_193_453 }, { year: 2021, value: 5_299_512_904 },
    { year: 2020, value: 4_833_298_395 },
  ]},
  { sector: "Alimentación Escolar", code: "070070009", series: [
    { year: 2024, value: 5_911_365_544 }, { year: 2023, value: 4_816_806_898 },
    { year: 2022, value: 3_934_371_937 }, { year: 2021, value: 4_192_170_477 },
    { year: 2020, value: 4_032_619_109 },
  ]},
];

// SGP porcentajes por sector (2023)
export const sgpPorcentajes2023: Record<string, number> = {
  "Educación": 60.63,
  "Agua potable": 2.54,
  "Alimentación escolar": 0.38,
  "Fonpet": 0.25,
};

// ═══════════════════════════════════════════════════════════════════════════
//  2. MEDICIÓN DE DESEMPEÑO MUNICIPAL (MDM)
// ═══════════════════════════════════════════════════════════════════════════

export interface MDMIndicator {
  indicator: string;
  component: "Componente de gestión" | "Componente de resultados" | "Resumen MDM";
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const mdmIndicators: MDMIndicator[] = [
  // --- Resumen MDM ---
  { indicator: "MDM", component: "Resumen MDM", code: "080010008", series: [{ year: 2022, value: 83.19 }, { year: 2021, value: 83.69 }, { year: 2020, value: 82.32 }], unit: "Puntos" },
  { indicator: "MDM - Posición nacional", component: "Resumen MDM", code: "080010013", series: [{ year: 2022, value: 3 }, { year: 2021, value: 1 }, { year: 2020, value: 5 }], unit: "Número" },
  { indicator: "Componente de gestión", component: "Resumen MDM", code: "080010002", series: [{ year: 2022, value: 83.36 }, { year: 2021, value: 82.73 }, { year: 2020, value: 80.51 }], unit: "Puntos" },
  { indicator: "Componente de gestión - Posición grupo", component: "Resumen MDM", code: "080010003", series: [{ year: 2022, value: 2 }, { year: 2021, value: 2 }, { year: 2020, value: 3 }], unit: "Número" },
  { indicator: "Posición nacional en gestión", component: "Resumen MDM", code: "080010011", series: [{ year: 2022, value: 3 }, { year: 2021, value: 3 }, { year: 2020, value: 4 }], unit: "Número" },
  { indicator: "Componente de resultados", component: "Resumen MDM", code: "080010005", series: [{ year: 2022, value: 74.56 }, { year: 2021, value: 74.92 }, { year: 2020, value: 72.92 }], unit: "Puntos" },
  { indicator: "Componente de resultados - Posición grupo", component: "Resumen MDM", code: "080010006", series: [{ year: 2022, value: 4 }, { year: 2021, value: 3 }, { year: 2020, value: 6 }], unit: "Número" },
  { indicator: "Posición nacional en resultados", component: "Resumen MDM", code: "080010012", series: [{ year: 2022, value: 86 }, { year: 2021, value: 58 }, { year: 2020, value: 190 }], unit: "Número" },

  // --- Componente de gestión ---
  { indicator: "Movilización de recursos", component: "Componente de gestión", code: "080020001", series: [{ year: 2022, value: 82.38 }, { year: 2021, value: 81.81 }, { year: 2020, value: 85.42 }], unit: "Puntos" },
  { indicator: "Ejecución de recursos", component: "Componente de gestión", code: "080020002", series: [{ year: 2022, value: 98.57 }, { year: 2021, value: 85.21 }, { year: 2020, value: 89.49 }], unit: "Puntos" },
  { indicator: "Recaudo con instrumentos de ordenamiento territorial", component: "Componente de gestión", code: "080020003", series: [{ year: 2022, value: 52.50 }, { year: 2021, value: 63.91 }, { year: 2020, value: 63.82 }], unit: "Puntos" },
  { indicator: "Gobierno abierto y transparencia", component: "Componente de gestión", code: "080020004", series: [{ year: 2022, value: 100.00 }, { year: 2021, value: 100.00 }, { year: 2020, value: 83.33 }], unit: "Puntos" },

  // --- Componente de resultados ---
  { indicator: "Educación", component: "Componente de resultados", code: "080030001", series: [{ year: 2022, value: 63.86 }, { year: 2021, value: 62.41 }, { year: 2020, value: 62.64 }], unit: "Puntos" },
  { indicator: "Salud", component: "Componente de resultados", code: "080030002", series: [{ year: 2022, value: 89.40 }, { year: 2021, value: 94.88 }, { year: 2020, value: 95.15 }], unit: "Puntos" },
  { indicator: "Acceso a servicios públicos", component: "Componente de resultados", code: "080030003", series: [{ year: 2022, value: 75.73 }, { year: 2021, value: 74.52 }, { year: 2020, value: 63.03 }], unit: "Puntos" },
  { indicator: "Seguridad", component: "Componente de resultados", code: "080030004", series: [{ year: 2022, value: 69.26 }, { year: 2021, value: 67.87 }, { year: 2020, value: 70.87 }], unit: "Puntos" },
];

// ═══════════════════════════════════════════════════════════════════════════
//  3. DEMOGRAFÍA Y POBLACIÓN
// ═══════════════════════════════════════════════════════════════════════════

export interface PoblacionData {
  indicator: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const poblacionTotal: PoblacionData = {
  indicator: "Población total",
  series: [
    { year: 2024, value: 2_623_607 },
    { year: 2023, value: 2_602_143 },
    { year: 2022, value: 2_578_868 },
    { year: 2021, value: 2_555_027 },
    { year: 2020, value: 2_524_642 },
  ],
  unit: "Personas",
};

export const poblacionPorSexo = {
  hombres: {
    indicator: "Población total de hombres",
    series: [
      { year: 2024, value: 1_232_017 }, { year: 2023, value: 1_222_233 },
      { year: 2022, value: 1_211_299 }, { year: 2021, value: 1_200_312 },
      { year: 2020, value: 1_186_196 },
    ],
    porcentaje: 47.09,
  },
  mujeres: {
    indicator: "Población total de mujeres",
    series: [
      { year: 2024, value: 1_384_318 }, { year: 2023, value: 1_373_067 },
      { year: 2022, value: 1_361_051 }, { year: 2021, value: 1_348_696 },
      { year: 2020, value: 1_333_396 },
    ],
    porcentaje: 52.91,
  },
};

export const poblacionPorArea = {
  urbana: {
    series: [
      { year: 2024, value: 2_574_994 }, { year: 2023, value: 2_553_621 },
      { year: 2022, value: 2_530_398 }, { year: 2021, value: 2_506_656 },
      { year: 2020, value: 2_476_569 },
    ],
    porcentaje: 98.07,
  },
  rural: {
    series: [
      { year: 2024, value: 48_613 }, { year: 2023, value: 48_522 },
      { year: 2022, value: 48_470 }, { year: 2021, value: 48_371 },
      { year: 2020, value: 48_073 },
    ],
    porcentaje: 1.93,
  },
};

export interface PoblacionEdad {
  grupo: string;
  series: TimeSeriesPoint[];
  porcentaje2024: number;
}

export const poblacionPorEdad: PoblacionEdad[] = [
  { grupo: "Menores de 15 años", series: [{ year: 2024, value: 438_800 }, { year: 2023, value: 446_664 }, { year: 2022, value: 454_650 }, { year: 2021, value: 461_966 }, { year: 2020, value: 467_048 }], porcentaje2024: 17.38 },
  { grupo: "15 a 59 años", series: [{ year: 2024, value: 1_640_692 }, { year: 2023, value: 1_640_614 }, { year: 2022, value: 1_640_610 }, { year: 2021, value: 1_636_958 }, { year: 2020, value: 1_625_067 }], porcentaje2024: 64.98 },
  { grupo: "60 años y más", series: [{ year: 2024, value: 445_255 }, { year: 2023, value: 431_202 }, { year: 2022, value: 419_449 }, { year: 2021, value: 408_696 }, { year: 2020, value: 397_840 }], porcentaje2024: 17.64 },
  { grupo: "Jóvenes 14-28 años", series: [{ year: 2024, value: 584_798 }, { year: 2023, value: 597_786 }, { year: 2022, value: 610_917 }, { year: 2021, value: 621_932 }, { year: 2020, value: 627_953 }], porcentaje2024: 23.16 },
  { grupo: "Niños menores de 12 años", series: [{ year: 2024, value: 340_454 }, { year: 2023, value: 346_923 }, { year: 2022, value: 353_519 }, { year: 2021, value: 359_533 }, { year: 2020, value: 363_837 }], porcentaje2024: 13.49 },
  { grupo: "Adolescentes 12-18 años", series: [{ year: 2024, value: 237_544 }, { year: 2023, value: 240_336 }, { year: 2022, value: 242_966 }, { year: 2021, value: 245_319 }, { year: 2020, value: 247_159 }], porcentaje2024: 9.41 },
];

export const indicadoresDemograficos = {
  tasaDependencia: { series: [{ year: 2024, value: 53.88 }, { year: 2023, value: 53.51 }, { year: 2022, value: 53.28 }, { year: 2021, value: 53.19 }, { year: 2020, value: 53.22 }], unit: "Personas dependientes por cada persona 15-59" },
  indiceEnvejecimiento: { series: [{ year: 2024, value: 101.47 }, { year: 2023, value: 96.54 }, { year: 2022, value: 92.26 }, { year: 2021, value: 88.47 }, { year: 2020, value: 85.18 }], unit: "Personas 60+ por cada 100 menores de 15" },
};

// SISBEN IV (2024)
export const sisbenIV2024 = {
  totalFichas: 507_253,
  grupoA: 92_294,
  grupoB: 338_037,
  grupoC: 752_636,
  grupoD: 372_546,
};

// ═══════════════════════════════════════════════════════════════════════════
//  4. ECONOMÍA
// ═══════════════════════════════════════════════════════════════════════════

export interface ValorAgregado {
  indicator: string;
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const valorAgregadoMunicipal: ValorAgregado[] = [
  { indicator: "Valor agregado", code: "120210001", series: [
    { year: 2021, value: 66_432.28 }, { year: 2020, value: 56_986.62 },
    { year: 2019, value: 59_434.97 }, { year: 2018, value: 55_082.30 },
    { year: 2017, value: 51_394.01 }, { year: 2016, value: 49_047.76 },
  ], unit: "Miles de millones de pesos corrientes" },
  { indicator: "Valor agregado per cápita", code: "120210002", series: [
    { year: 2021, value: 26_062_012.26 }, { year: 2020, value: 22_617_400.42 },
    { year: 2019, value: 23_931_503.64 }, { year: 2018, value: 22_694_426.70 },
    { year: 2017, value: 21_548_689.24 }, { year: 2016, value: 20_861_826.91 },
  ], unit: "Pesos corrientes" },
  { indicator: "Participación en el departamental", code: "120210004", series: [
    { year: 2021, value: 41.08 }, { year: 2020, value: 42.03 },
    { year: 2019, value: 42.62 }, { year: 2018, value: 42.73 },
    { year: 2017, value: 42.66 }, { year: 2016, value: 42.55 },
  ], unit: "Porcentaje" },
];

// Composición del valor agregado por actividad económica
export interface ComposicionEconomica {
  actividad: string;
  series: TimeSeriesPoint[];
}

export const composicionValorAgregado: ComposicionEconomica[] = [
  { actividad: "Actividades primarias", series: [{ year: 2021, value: 0.18 }, { year: 2020, value: 0.29 }, { year: 2019, value: 0.27 }] },
  { actividad: "Actividades secundarias", series: [{ year: 2021, value: 20.06 }, { year: 2020, value: 18.96 }, { year: 2019, value: 21.90 }] },
  { actividad: "Actividades terciarias", series: [{ year: 2021, value: 79.76 }, { year: 2020, value: 80.75 }, { year: 2019, value: 77.83 }] },
];

// Participación municipal en el departamento por sector
export const participacionDepartamental = {
  primarias: { y2021: 0.65, y2020: 1.14 },
  secundarias: { y2021: 151.32, y2020: 163.25 },
  terciarias: { y2021: 48.86, y2020: 49.60 },
};

// ═══════════════════════════════════════════════════════════════════════════
//  5. EDUCACIÓN
// ═══════════════════════════════════════════════════════════════════════════

export interface EducacionIndicator {
  indicator: string;
  subcategory: "Acceso a la educación" | "Calidad" | "Permanencia y rezago";
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const educacionIndicators: EducacionIndicator[] = [
  // --- Cobertura bruta ---
  { indicator: "Cobertura bruta en educación - Total", subcategory: "Acceso a la educación", code: "040010006", series: [{ year: 2022, value: 109.22 }, { year: 2021, value: 109.93 }, { year: 2020, value: 111.70 }], unit: "Porcentaje" },
  { indicator: "Cobertura bruta en transición", subcategory: "Acceso a la educación", code: "040010001", series: [{ year: 2022, value: 97.77 }, { year: 2021, value: 93.43 }, { year: 2020, value: 97.59 }], unit: "Porcentaje" },
  { indicator: "Cobertura bruta en educación primaria", subcategory: "Acceso a la educación", code: "040010002", series: [{ year: 2022, value: 105.54 }, { year: 2021, value: 105.42 }, { year: 2020, value: 108.09 }], unit: "Porcentaje" },
  { indicator: "Cobertura bruta en educación secundaria", subcategory: "Acceso a la educación", code: "040010003", series: [{ year: 2022, value: 120.69 }, { year: 2021, value: 123.84 }, { year: 2020, value: 126.13 }], unit: "Porcentaje" },
  { indicator: "Cobertura bruta en educación media", subcategory: "Acceso a la educación", code: "040010004", series: [{ year: 2022, value: 100.97 }, { year: 2021, value: 101.21 }, { year: 2020, value: 98.97 }], unit: "Porcentaje" },
  { indicator: "Cobertura bruta en educación básica", subcategory: "Acceso a la educación", code: "040010005", series: [{ year: 2022, value: 111.04 }, { year: 2021, value: 111.88 }, { year: 2020, value: 114.59 }], unit: "Porcentaje" },

  // --- Cobertura neta ---
  { indicator: "Cobertura neta en educación - Total", subcategory: "Acceso a la educación", code: "040010012", series: [{ year: 2022, value: 97.06 }, { year: 2021, value: 96.94 }, { year: 2020, value: 98.15 }], unit: "Porcentaje" },
  { indicator: "Cobertura neta en transición", subcategory: "Acceso a la educación", code: "040010007", series: [{ year: 2022, value: 83.54 }, { year: 2021, value: 81.03 }, { year: 2020, value: 83.69 }], unit: "Porcentaje" },
  { indicator: "Cobertura neta en educación primaria", subcategory: "Acceso a la educación", code: "040010008", series: [{ year: 2023, value: 94.01 }, { year: 2022, value: 93.48 }, { year: 2021, value: 92.36 }, { year: 2020, value: 94.02 }], unit: "Porcentaje" },
  { indicator: "Cobertura neta en educación secundaria", subcategory: "Acceso a la educación", code: "040010009", series: [{ year: 2023, value: 83.58 }, { year: 2022, value: 86.67 }, { year: 2021, value: 88.93 }, { year: 2020, value: 89.66 }], unit: "Porcentaje" },
  { indicator: "Cobertura neta en educación media", subcategory: "Acceso a la educación", code: "040010010", series: [{ year: 2023, value: 57.69 }, { year: 2022, value: 56.18 }, { year: 2021, value: 54.38 }, { year: 2020, value: 52.21 }], unit: "Porcentaje" },
  { indicator: "Cobertura neta en educación básica", subcategory: "Acceso a la educación", code: "040010011", series: [{ year: 2022, value: 96.50 }, { year: 2021, value: 97.05 }, { year: 2020, value: 98.90 }], unit: "Porcentaje" },

  // --- Tránsito a educación superior ---
  { indicator: "Tasa de tránsito inmediato a la educación superior", subcategory: "Acceso a la educación", code: "040010028", series: [{ year: 2023, value: 47.24 }, { year: 2022, value: 45.54 }, { year: 2021, value: 45.29 }, { year: 2020, value: 51.10 }], unit: "Porcentaje" },

  // --- Calidad ---
  { indicator: "Puntaje promedio Pruebas Saber 11 - Matemáticas", subcategory: "Calidad", code: "040040001", series: [{ year: 2022, value: 50.12 }, { year: 2021, value: 49.80 }, { year: 2020, value: 50.67 }], unit: "Puntos" },
  { indicator: "Puntaje promedio Pruebas Saber 11 - Lectura crítica", subcategory: "Calidad", code: "040040002", series: [{ year: 2022, value: 53.58 }, { year: 2021, value: 53.83 }, { year: 2020, value: 53.18 }], unit: "Puntos" },
  { indicator: "Niños con educación inicial - atención integral", subcategory: "Calidad", code: "040040003", series: [{ year: 2022, value: 71_061 }, { year: 2021, value: 74_106 }, { year: 2020, value: 66_882 }], unit: "Número" },

  // --- Permanencia y rezago ---
  { indicator: "Tasa de deserción intra-anual sector oficial", subcategory: "Permanencia y rezago", code: "040020001", series: [{ year: 2023, value: 5.40 }, { year: 2022, value: 4.91 }, { year: 2021, value: 3.27 }, { year: 2020, value: 1.64 }], unit: "Porcentaje" },
  { indicator: "Tasa de repitencia sector oficial", subcategory: "Permanencia y rezago", code: "040020002", series: [{ year: 2022, value: 6.41 }, { year: 2021, value: 6.17 }, { year: 2020, value: 7.04 }], unit: "Porcentaje" },
];

// ═══════════════════════════════════════════════════════════════════════════
//  6. SALUD
// ═══════════════════════════════════════════════════════════════════════════

export interface SaludIndicator {
  indicator: string;
  subcategory: "Aseguramiento" | "Tasas y coberturas";
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const saludIndicators: SaludIndicator[] = [
  // --- Aseguramiento ---
  { indicator: "Afiliados al régimen contributivo", subcategory: "Aseguramiento", code: "050010001", series: [{ year: 2021, value: 2_191_283 }, { year: 2020, value: 2_113_809 }], unit: "Personas" },
  { indicator: "Afiliados al régimen subsidiado", subcategory: "Aseguramiento", code: "050010002", series: [{ year: 2021, value: 663_156 }, { year: 2020, value: 668_015 }], unit: "Personas" },
  { indicator: "Afiliados a regímenes especiales", subcategory: "Aseguramiento", code: "050010005", series: [{ year: 2021, value: 48_718 }, { year: 2020, value: 48_557 }], unit: "Personas" },
  { indicator: "Afiliados al SGSSS", subcategory: "Aseguramiento", code: "050010007", series: [{ year: 2020, value: 2_830_381 }], unit: "Personas" },
  { indicator: "Cobertura del régimen subsidiado", subcategory: "Aseguramiento", code: "050010004", series: [{ year: 2021, value: 99.28 }, { year: 2020, value: 99.12 }], unit: "Porcentaje" },

  // --- Tasas y coberturas ---
  { indicator: "Razón de mortalidad materna a 42 días", subcategory: "Tasas y coberturas", code: "050020002", series: [{ year: 2023, value: 25.45 }, { year: 2022, value: 27.70 }, { year: 2021, value: 26.07 }, { year: 2020, value: 19.50 }], unit: "Casos por cada 100.000 nacidos vivos" },
  { indicator: "Tasa de mortalidad infantil menores de 1 año", subcategory: "Tasas y coberturas", code: "050020003", series: [{ year: 2021, value: 8.30 }, { year: 2020, value: 9.33 }], unit: "Casos por cada 1.000 nacidos vivos" },
  { indicator: "Tasa de mortalidad infantil menores de 5 años", subcategory: "Tasas y coberturas", code: "050020014", series: [{ year: 2021, value: 9.82 }, { year: 2020, value: 7.49 }], unit: "Casos por cada 1.000 nacidos vivos" },
  { indicator: "Tasa de mortalidad neonatal", subcategory: "Tasas y coberturas", code: "050020044", series: [{ year: 2021, value: 5.65 }, { year: 2020, value: 4.60 }], unit: "Defunciones por cada 1.000 nacidos vivos" },
  { indicator: "Tasa de mortalidad (x cada 1.000 hab.)", subcategory: "Tasas y coberturas", code: "050020001", series: [{ year: 2020, value: 6.73 }], unit: "Casos por cada 1.000 habitantes" },
  { indicator: "Tasa de fecundidad en mujeres 15-19 años", subcategory: "Tasas y coberturas", code: "050020043", series: [{ year: 2024, value: 19.04 }, { year: 2023, value: 22.37 }, { year: 2022, value: 26.79 }, { year: 2021, value: 31.59 }, { year: 2020, value: 37.77 }], unit: "Nacidos vivos por cada 1.000 mujeres 15-19" },
  { indicator: "Tasa de fecundidad en mujeres 10-14 años", subcategory: "Tasas y coberturas", code: "050020012", series: [{ year: 2024, value: 0.76 }, { year: 2023, value: 0.90 }, { year: 2022, value: 1.07 }, { year: 2021, value: 1.47 }, { year: 2020, value: 1.85 }], unit: "Nacidos vivos" },
  { indicator: "Porcentaje de nacidos vivos con 4+ controles prenatales", subcategory: "Tasas y coberturas", code: "050020007", series: [{ year: 2021, value: 90.83 }, { year: 2020, value: 88.41 }], unit: "Porcentaje" },
  { indicator: "Porcentaje de partos atendidos por personal calificado", subcategory: "Tasas y coberturas", code: "050020077", series: [{ year: 2021, value: 99.67 }, { year: 2020, value: 99.73 }], unit: "Porcentaje" },
  { indicator: "Incidencia de la tuberculosis", subcategory: "Tasas y coberturas", code: "050020041", series: [{ year: 2021, value: 60.86 }, { year: 2020, value: 51.27 }], unit: "Casos por cada 100.000 hab." },
  { indicator: "Incidencia del VIH", subcategory: "Tasas y coberturas", code: "050020033", series: [{ year: 2021, value: 37.70 }, { year: 2020, value: 55.69 }], unit: "Casos por cada 100.000 hab." },
  { indicator: "Incidencia del dengue", subcategory: "Tasas y coberturas", code: "050020063", series: [{ year: 2021, value: 9.33 }, { year: 2020, value: 24.71 }], unit: "Casos por cada 100.000 hab. en riesgo" },
  { indicator: "Tasa ajustada mortalidad accidentes tránsito", subcategory: "Tasas y coberturas", code: "050020022", series: [{ year: 2020, value: 5.61 }], unit: "Defunciones por cada 100.000 hab." },
  { indicator: "Tasa ajustada mortalidad suicidio", subcategory: "Tasas y coberturas", code: "050020030", series: [{ year: 2020, value: 6.80 }], unit: "Defunciones por cada 100.000 hab." },
  { indicator: "Tasa ajustada mortalidad cáncer de mama", subcategory: "Tasas y coberturas", code: "050020027", series: [{ year: 2020, value: 13.88 }], unit: "Defunciones por cada 100.000 mujeres" },
  { indicator: "Tasa ajustada mortalidad cáncer de próstata", subcategory: "Tasas y coberturas", code: "050020029", series: [{ year: 2020, value: 16.93 }], unit: "Defunciones por cada 100.000 hombres" },
  { indicator: "Valoración integral primera infancia", subcategory: "Tasas y coberturas", code: "050020078", series: [{ year: 2022, value: 22.19 }, { year: 2021, value: 11.64 }, { year: 2020, value: 22.72 }], unit: "Porcentaje" },
  { indicator: "Cobertura vacunación pentavalente menores 1 año", subcategory: "Tasas y coberturas", code: "050020005", series: [{ year: 2020, value: 76.32 }], unit: "Porcentaje" },
  { indicator: "Cobertura vacunación triple viral", subcategory: "Tasas y coberturas", code: "050020019", series: [{ year: 2020, value: 81.21 }], unit: "Porcentaje" },
];

// ═══════════════════════════════════════════════════════════════════════════
//  7. POBREZA
// ═══════════════════════════════════════════════════════════════════════════

export interface PobrezaIndicator {
  indicator: string;
  subcategory: string;
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const pobrezaIndicators: PobrezaIndicator[] = [
  { indicator: "Incidencia de la pobreza monetaria", subcategory: "Indicadores de Pobreza - Actualización Metodológica", code: "140060001", series: [{ year: 2021, value: 27.60 }, { year: 2020, value: 32.90 }, { year: 2019, value: 24.40 }], unit: "Porcentaje" },
  { indicator: "Incidencia de la pobreza monetaria extrema", subcategory: "Indicadores de Pobreza - Actualización Metodológica", code: "140060002", series: [{ year: 2021, value: 5.10 }, { year: 2020, value: 9.10 }, { year: 2019, value: 3.70 }], unit: "Porcentaje" },
  { indicator: "Pobreza monetaria extrema en hombres", subcategory: "Incidencia según sexo", code: "140070001", series: [{ year: 2021, value: 4.70 }, { year: 2020, value: 8.70 }], unit: "Porcentaje" },
  { indicator: "Pobreza monetaria extrema en mujeres", subcategory: "Incidencia según sexo", code: "140070002", series: [{ year: 2021, value: 5.50 }, { year: 2020, value: 9.40 }], unit: "Porcentaje" },
  { indicator: "Pobreza monetaria en hombres", subcategory: "Incidencia según sexo", code: "140080001", series: [{ year: 2021, value: 26.30 }, { year: 2020, value: 32.60 }], unit: "Porcentaje" },
  { indicator: "Pobreza monetaria en mujeres", subcategory: "Incidencia según sexo", code: "140080002", series: [{ year: 2021, value: 28.70 }, { year: 2020, value: 33.20 }], unit: "Porcentaje" },
  { indicator: "Coeficiente de Gini", subcategory: "Indicadores de pobreza", code: "140010003", series: [{ year: 2021, value: 0.50 }], unit: "Puntos" },
  { indicator: "Niños, niñas y adolescentes en pobreza (proxy)", subcategory: "Indicadores de pobreza", code: "140010051", series: [{ year: 2023, value: 49.84 }], unit: "Porcentaje" },
];

// ═══════════════════════════════════════════════════════════════════════════
//  8. VIVIENDA Y ACCESO A SERVICIOS PÚBLICOS
// ═══════════════════════════════════════════════════════════════════════════

export interface ViviendaIndicator {
  indicator: string;
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const viviendaIndicators: ViviendaIndicator[] = [
  { indicator: "Cobertura de acueducto (REC)", code: "030010005", series: [
    { year: 2024, value: 96.75 }, { year: 2023, value: 97.32 }, { year: 2022, value: 97.78 },
    { year: 2021, value: 96.88 }, { year: 2020, value: 96.82 },
  ], unit: "Porcentaje" },
  { indicator: "Cobertura de alcantarillado (REC)", code: "030010007", series: [
    { year: 2024, value: 96.05 }, { year: 2023, value: 96.51 }, { year: 2022, value: 96.75 },
    { year: 2021, value: 95.61 }, { year: 2020, value: 95.54 },
  ], unit: "Porcentaje" },
  { indicator: "Cobertura de energía eléctrica rural", code: "030010002", series: [
    { year: 2021, value: 100.00 }, { year: 2020, value: 100.00 }, { year: 2019, value: 100.00 },
  ], unit: "Porcentaje" },
  { indicator: "Cobertura de acueducto (Censo 2018)", code: "030010004", series: [{ year: 2018, value: 98.39 }], unit: "Porcentaje" },
  { indicator: "Cobertura de alcantarillado (Censo 2018)", code: "030010006", series: [{ year: 2018, value: 97.15 }], unit: "Porcentaje" },
  { indicator: "Déficit cualitativo de vivienda (Censo 2018)", code: "030010008", series: [{ year: 2018, value: 12.98 }], unit: "Porcentaje" },
  { indicator: "Déficit cuantitativo de vivienda (Censo 2018)", code: "030010009", series: [{ year: 2018, value: 2.02 }], unit: "Porcentaje" },
  { indicator: "Penetración de banda ancha", code: "030010003", series: [
    { year: 2021, value: 27.31 }, { year: 2020, value: 26.38 }, { year: 2019, value: 24.27 },
  ], unit: "Porcentaje" },
];

// ═══════════════════════════════════════════════════════════════════════════
//  9. CONVIVENCIA Y SEGURIDAD CIUDADANA
// ═══════════════════════════════════════════════════════════════════════════

export interface SeguridadIndicator {
  indicator: string;
  subcategory: "Seguridad" | "Convivencia ciudadana";
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const seguridadIndicators: SeguridadIndicator[] = [
  // --- Tasas de homicidio ---
  { indicator: "Tasa de homicidio intencional por cada 100.000 hab.", subcategory: "Seguridad", code: "060010013", series: [{ year: 2023, value: 13.80 }, { year: 2022, value: 13.70 }, { year: 2021, value: 15.30 }, { year: 2020, value: 14.50 }], unit: "Tasa por cada 100.000 hab." },
  { indicator: "Tasa de homicidio intencional hombres", subcategory: "Seguridad", code: "060010014", series: [{ year: 2023, value: 26.90 }, { year: 2022, value: 26.85 }, { year: 2021, value: 29.90 }, { year: 2020, value: 28.20 }], unit: "Tasa por cada 100.000 hab." },
  { indicator: "Tasa de homicidio intencional mujeres", subcategory: "Seguridad", code: "060010015", series: [{ year: 2023, value: 2.00 }, { year: 2022, value: 1.96 }, { year: 2021, value: 2.40 }, { year: 2020, value: 2.30 }], unit: "Tasa por cada 100.000 hab." },
  { indicator: "Tasa de homicidio intencional áreas urbanas", subcategory: "Seguridad", code: "060010016", series: [{ year: 2023, value: 13.10 }, { year: 2022, value: 13.69 }, { year: 2021, value: 14.60 }, { year: 2020, value: 14.30 }], unit: "Tasa por cada 100.000 hab." },
  { indicator: "Tasa de homicidio intencional áreas rurales", subcategory: "Seguridad", code: "060010017", series: [{ year: 2023, value: 55.20 }, { year: 2022, value: 14.07 }, { year: 2021, value: 61.40 }, { year: 2020, value: 30.20 }], unit: "Tasa por cada 100.000 hab." },
  { indicator: "Tasa de homicidios por cada 100.000 hab.", subcategory: "Seguridad", code: "060010003", series: [{ year: 2022, value: 14.81 }, { year: 2021, value: 15.74 }, { year: 2020, value: 14.53 }], unit: "Tasa por cada 100.000 hab." },

  // --- Hurto ---
  { indicator: "Tasa de hurto a personas por cada 100.000 hab.", subcategory: "Seguridad", code: "060010001", series: [{ year: 2023, value: 1_188.30 }, { year: 2022, value: 1_097.80 }, { year: 2021, value: 918.11 }, { year: 2020, value: 700.91 }], unit: "Tasa por cada 100.000 hab." },
  { indicator: "Tasa de hurto común por cada 100.000 hab.", subcategory: "Seguridad", code: "060010002", series: [{ year: 2021, value: 1_109.16 }, { year: 2020, value: 938.81 }], unit: "Tasa por cada 100.000 hab." },

  // --- Extorsión ---
  { indicator: "Tasa de extorsión por cada 100.000 hab.", subcategory: "Seguridad", code: "060010010", series: [{ year: 2023, value: 33.10 }, { year: 2022, value: 26.20 }, { year: 2021, value: 23.59 }, { year: 2020, value: 19.97 }], unit: "Tasa por cada 100.000 hab." },

  // --- Tránsito ---
  { indicator: "Fallecidos por siniestros viales", subcategory: "Seguridad", code: "060010018", series: [{ year: 2022, value: 250 }, { year: 2021, value: 251 }, { year: 2020, value: 199 }], unit: "Número" },
  { indicator: "Tasa de homicidios en accidentes de tránsito", subcategory: "Seguridad", code: "060010012", series: [{ year: 2023, value: 21.20 }, { year: 2022, value: 13.47 }, { year: 2021, value: 13.72 }, { year: 2020, value: 6.83 }], unit: "Tasa por cada 100.000 hab." },
  { indicator: "Tasa de lesiones en accidentes de tránsito", subcategory: "Seguridad", code: "060010011", series: [{ year: 2023, value: 119.00 }, { year: 2022, value: 98.93 }, { year: 2021, value: 41.31 }, { year: 2020, value: 2.01 }], unit: "Tasa por cada 100.000 hab." },

  // --- Violencia y secuestro ---
  { indicator: "Tasa de violencia interpersonal", subcategory: "Seguridad", code: "060010008", series: [{ year: 2023, value: 184.20 }], unit: "Tasa por cada 100.000 hab." },
  { indicator: "Tasa de secuestro por cada 100.000 hab.", subcategory: "Seguridad", code: "060010009", series: [{ year: 2023, value: 0.70 }, { year: 2021, value: 0.31 }, { year: 2020, value: 0.00 }], unit: "Tasa por cada 100.000 hab." },

  // --- Convivencia ciudadana ---
  { indicator: "Primera medida correctiva: Porte de armas", subcategory: "Convivencia ciudadana", code: "060020002", series: [{ year: 2023, value: 37.30 }, { year: 2022, value: 36.82 }], unit: "Porcentaje" },
  { indicator: "Segunda medida correctiva: Sustancias psicoactivas", subcategory: "Convivencia ciudadana", code: "060020003", series: [{ year: 2023, value: 17.50 }, { year: 2022, value: 16.73 }], unit: "Porcentaje" },
];

// ═══════════════════════════════════════════════════════════════════════════
//  10. MERCADO LABORAL
// ═══════════════════════════════════════════════════════════════════════════

export interface MercadoLaboralIndicator {
  indicator: string;
  subcategory: string;
  code: string;
  series: TimeSeriesPoint[];
  unit: string;
}

export const mercadoLaboralIndicators: MercadoLaboralIndicator[] = [
  { indicator: "Ocupación formal (% de población total)", subcategory: "Ocupación formal", code: "160090001", series: [{ year: 2016, value: 61.52 }, { year: 2015, value: 65.87 }, { year: 2014, value: 62.36 }], unit: "Porcentaje" },
  { indicator: "Empresas generadoras de empleo formal por 10.000 hab.", subcategory: "Número de empresas", code: "160080001", series: [{ year: 2016, value: 402.03 }, { year: 2015, value: 383.62 }, { year: 2014, value: 361.08 }], unit: "Número de empresas" },
];

// Composición de cotizantes por sexo (2016)
export const cotizantesPorSexo = {
  hombres: { porcentaje: 50.76, year: 2016 },
  mujeres: { porcentaje: 49.24, year: 2016 },
};

// Composición cotizantes por edad (2016)
export const cotizantesPorEdad: Array<{ grupo: string; porcentaje: number }> = [
  { grupo: "17 años o menos", porcentaje: 0.05 },
  { grupo: "18 a 25 años", porcentaje: 15.27 },
  { grupo: "26 a 35 años", porcentaje: 32.45 },
  { grupo: "36 a 45 años", porcentaje: 23.18 },
  { grupo: "46 a 55 años", porcentaje: 17.34 },
  { grupo: "56 a 65 años", porcentaje: 9.21 },
  { grupo: "Mayor de 65 años", porcentaje: 2.50 },
];

// ═══════════════════════════════════════════════════════════════════════════
//  DIMENSION SUMMARY (for dashboard overview)
// ═══════════════════════════════════════════════════════════════════════════

export const dimensionSummary: DimensionSummary[] = [
  { dimension: "Finanzas públicas", color: colors.ochre, indicatorCount: 45, latestYear: 2024 },
  { dimension: "Desempeño municipal (MDM)", color: colors.ink, indicatorCount: 16, latestYear: 2022 },
  { dimension: "Demografía y población", color: colors.gray[500], indicatorCount: 18, latestYear: 2024 },
  { dimension: "Economía", color: colors.sepia, indicatorCount: 8, latestYear: 2021 },
  { dimension: "Educación", color: colors.gray[400], indicatorCount: 18, latestYear: 2023 },
  { dimension: "Salud", color: colors.gray[600], indicatorCount: 20, latestYear: 2024 },
  { dimension: "Pobreza", color: colors.gray[700], indicatorCount: 8, latestYear: 2023 },
  { dimension: "Vivienda y servicios públicos", color: colors.gray[300], indicatorCount: 8, latestYear: 2024 },
  { dimension: "Convivencia y seguridad", color: colors.gray[800], indicatorCount: 17, latestYear: 2023 },
  { dimension: "Mercado laboral", color: colors.gray[500], indicatorCount: 4, latestYear: 2016 },
];

// ═══════════════════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Get the most recent value from a time series */
export function getLatestValue(series: TimeSeriesPoint[]): TimeSeriesPoint | undefined {
  return series.length > 0 ? series.reduce((a, b) => (a.year > b.year ? a : b)) : undefined;
}

/** Get value for a specific year from a time series */
export function getValueForYear(series: TimeSeriesPoint[], year: number): number | undefined {
  return series.find((p) => p.year === year)?.value;
}

/** Calculate year-over-year change */
export function calcYoYChange(series: TimeSeriesPoint[]): { change: number; percentage: number } | undefined {
  if (series.length < 2) return undefined;
  const sorted = [...series].sort((a, b) => b.year - a.year);
  const latest = sorted[0].value;
  const previous = sorted[1].value;
  if (previous === 0) return undefined;
  const change = latest - previous;
  const percentage = (change / Math.abs(previous)) * 100;
  return { change, percentage };
}

/** Format number in Colombian convention (dot for thousands, comma for decimals) */
export function formatCOPNumber(value: number, decimals = 0): string {
  return value.toLocaleString("es-CO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Format as millions COP */
export function formatMillionesCOP(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} billones`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} mil millones`;
  }
  return `$${value.toLocaleString("es-CO", { maximumFractionDigits: 1 })} millones`;
}
