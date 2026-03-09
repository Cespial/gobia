export interface ComunaData {
  nombre: string;
  lat: number;
  lon: number;
  poblacion: number;
  predial: number;
  ica: number;
  estrato: number;
}

export const comunasData: Record<string, ComunaData> = {
  "01": { nombre: "Popular", lat: 6.2855, lon: -75.5481, poblacion: 131_100, predial: 8_200, ica: 3_100, estrato: 1.8 },
  "02": { nombre: "Santa Cruz", lat: 6.2805, lon: -75.5567, poblacion: 111_400, predial: 6_900, ica: 2_800, estrato: 2.1 },
  "03": { nombre: "Manrique", lat: 6.2720, lon: -75.5390, poblacion: 161_200, predial: 10_400, ica: 4_200, estrato: 2.3 },
  "04": { nombre: "Aranjuez", lat: 6.2716, lon: -75.5553, poblacion: 162_800, predial: 12_100, ica: 5_600, estrato: 2.8 },
  "05": { nombre: "Castilla", lat: 6.2837, lon: -75.5751, poblacion: 149_800, predial: 14_300, ica: 7_800, estrato: 3.2 },
  "06": { nombre: "Doce de Octubre", lat: 6.2905, lon: -75.5830, poblacion: 192_700, predial: 11_200, ica: 4_500, estrato: 2.4 },
  "07": { nombre: "Robledo", lat: 6.2778, lon: -75.5910, poblacion: 172_500, predial: 16_800, ica: 8_900, estrato: 3.1 },
  "08": { nombre: "Villa Hermosa", lat: 6.2570, lon: -75.5450, poblacion: 139_400, predial: 9_100, ica: 3_800, estrato: 2.2 },
  "09": { nombre: "Buenos Aires", lat: 6.2415, lon: -75.5500, poblacion: 138_600, predial: 11_500, ica: 5_200, estrato: 2.9 },
  "10": { nombre: "La Candelaria", lat: 6.2510, lon: -75.5663, poblacion: 85_700, predial: 18_900, ica: 45_600, estrato: 3.8 },
  "11": { nombre: "Laureles-Estadio", lat: 6.2480, lon: -75.5870, poblacion: 122_600, predial: 42_300, ica: 28_700, estrato: 5.1 },
  "12": { nombre: "La América", lat: 6.2515, lon: -75.5985, poblacion: 96_200, predial: 22_100, ica: 12_400, estrato: 4.2 },
  "13": { nombre: "San Javier", lat: 6.2580, lon: -75.6120, poblacion: 138_200, predial: 8_600, ica: 3_200, estrato: 2.1 },
  "14": { nombre: "El Poblado", lat: 6.2095, lon: -75.5710, poblacion: 130_300, predial: 89_700, ica: 67_400, estrato: 5.8 },
  "15": { nombre: "Guayabal", lat: 6.2225, lon: -75.5915, poblacion: 97_500, predial: 19_400, ica: 15_600, estrato: 3.5 },
  "16": { nombre: "Belén", lat: 6.2310, lon: -75.6055, poblacion: 196_800, predial: 34_200, ica: 18_900, estrato: 4.0 },
};
