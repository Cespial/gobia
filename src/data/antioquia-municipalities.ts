/**
 * Dataset estático de los 125 municipios de Antioquia
 * Fuente: DIVIPOLA (datos.gov.co) + DANE 2024
 */

export type Subregion =
  | "Valle de Aburrá"
  | "Oriente"
  | "Occidente"
  | "Suroeste"
  | "Norte"
  | "Nordeste"
  | "Bajo Cauca"
  | "Urabá"
  | "Magdalena Medio";

export type CategoríaMunicipal = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface AntioquiaMunicipality {
  codigo_dane: string;
  nombre: string;
  departamento: "Antioquia";
  subregion: Subregion;
  categoria: CategoríaMunicipal;
  poblacion: number;
  area_km2: number;
  lat: number;
  lng: number;
}

export const SUBREGION_COLORS: Record<Subregion, string> = {
  "Valle de Aburrá": "#B8956A",
  "Oriente": "#7BA38C",
  "Occidente": "#8B7355",
  "Suroeste": "#A0616A",
  "Norte": "#6B8E4E",
  "Nordeste": "#5B7BA5",
  "Bajo Cauca": "#C4A882",
  "Urabá": "#9B8A6E",
  "Magdalena Medio": "#7B6BA5",
};

export const CATEGORIA_LABELS: Record<CategoríaMunicipal, string> = {
  0: "Especial",
  1: "Primera",
  2: "Segunda",
  3: "Tercera",
  4: "Cuarta",
  5: "Quinta",
  6: "Sexta",
};

export const CATEGORIA_COLORS: Record<CategoríaMunicipal, string> = {
  0: "#B8956A", // Especial - ochre
  1: "#8B7355", // Primera
  2: "#6B5840", // Segunda
  3: "#9B8A6E", // Tercera
  4: "#C4A882", // Cuarta
  5: "#D4BC9C", // Quinta
  6: "#E8D8C0", // Sexta
};

export const antioquiaMunicipalities: AntioquiaMunicipality[] = [
  { codigo_dane: "05001", nombre: "Medellín", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 0, poblacion: 2612000, area_km2: 380, lat: 6.246631, lng: -75.581775 },
  { codigo_dane: "05002", nombre: "Abejorral", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 19200, area_km2: 491, lat: 5.789315, lng: -75.428739 },
  { codigo_dane: "05004", nombre: "Abriaquí", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 2400, area_km2: 279, lat: 6.632282, lng: -76.064304 },
  { codigo_dane: "05021", nombre: "Alejandría", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 3600, area_km2: 149, lat: 6.376061, lng: -75.141346 },
  { codigo_dane: "05030", nombre: "Amagá", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 31800, area_km2: 84, lat: 6.038708, lng: -75.702188 },
  { codigo_dane: "05031", nombre: "Amalfi", departamento: "Antioquia", subregion: "Nordeste", categoria: 6, poblacion: 24100, area_km2: 1210, lat: 6.909655, lng: -75.077501 },
  { codigo_dane: "05034", nombre: "Andes", departamento: "Antioquia", subregion: "Suroeste", categoria: 5, poblacion: 47500, area_km2: 444, lat: 5.657194, lng: -75.878828 },
  { codigo_dane: "05036", nombre: "Angelópolis", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 5200, area_km2: 79, lat: 6.109719, lng: -75.711389 },
  { codigo_dane: "05038", nombre: "Angostura", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 10800, area_km2: 387, lat: 6.885175, lng: -75.335116 },
  { codigo_dane: "05040", nombre: "Anorí", departamento: "Antioquia", subregion: "Nordeste", categoria: 6, poblacion: 17200, area_km2: 1430, lat: 7.074703, lng: -75.148355 },
  { codigo_dane: "05042", nombre: "Santa Fe de Antioquia", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 27000, area_km2: 493, lat: 6.556484, lng: -75.826648 },
  { codigo_dane: "05044", nombre: "Anzá", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 7500, area_km2: 229, lat: 6.302641, lng: -75.854442 },
  { codigo_dane: "05045", nombre: "Apartadó", departamento: "Antioquia", subregion: "Urabá", categoria: 3, poblacion: 214000, area_km2: 607, lat: 7.882968, lng: -76.625279 },
  { codigo_dane: "05051", nombre: "Arboletes", departamento: "Antioquia", subregion: "Urabá", categoria: 6, poblacion: 44500, area_km2: 710, lat: 8.849317, lng: -76.426708 },
  { codigo_dane: "05055", nombre: "Argelia", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 8900, area_km2: 256, lat: 5.731474, lng: -75.14107 },
  { codigo_dane: "05059", nombre: "Armenia", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 4200, area_km2: 109, lat: 6.155667, lng: -75.786647 },
  { codigo_dane: "05079", nombre: "Barbosa", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 4, poblacion: 55000, area_km2: 206, lat: 6.439195, lng: -75.331627 },
  { codigo_dane: "05086", nombre: "Belmira", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 6800, area_km2: 279, lat: 6.606319, lng: -75.667779 },
  { codigo_dane: "05088", nombre: "Bello", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 1, poblacion: 582000, area_km2: 149, lat: 6.333587, lng: -75.555245 },
  { codigo_dane: "05091", nombre: "Betania", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 9100, area_km2: 147, lat: 5.74615, lng: -75.97679 },
  { codigo_dane: "05093", nombre: "Betulia", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 17800, area_km2: 218, lat: 6.115208, lng: -75.984452 },
  { codigo_dane: "05101", nombre: "Ciudad Bolívar", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 27500, area_km2: 282, lat: 5.850273, lng: -76.021509 },
  { codigo_dane: "05107", nombre: "Briceño", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 8500, area_km2: 404, lat: 7.112803, lng: -75.55036 },
  { codigo_dane: "05113", nombre: "Buriticá", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 7200, area_km2: 363, lat: 6.720759, lng: -75.907 },
  { codigo_dane: "05120", nombre: "Cáceres", departamento: "Antioquia", subregion: "Bajo Cauca", categoria: 6, poblacion: 44000, area_km2: 1973, lat: 7.578366, lng: -75.35205 },
  { codigo_dane: "05125", nombre: "Caicedo", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 8100, area_km2: 224, lat: 6.405607, lng: -75.98293 },
  { codigo_dane: "05129", nombre: "Caldas", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 3, poblacion: 86000, area_km2: 133, lat: 6.091077, lng: -75.633673 },
  { codigo_dane: "05134", nombre: "Campamento", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 9200, area_km2: 235, lat: 6.979771, lng: -75.298091 },
  { codigo_dane: "05138", nombre: "Cañasgordas", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 16800, area_km2: 391, lat: 6.753859, lng: -76.028228 },
  { codigo_dane: "05142", nombre: "Caracolí", departamento: "Antioquia", subregion: "Magdalena Medio", categoria: 6, poblacion: 4600, area_km2: 252, lat: 6.409829, lng: -74.757421 },
  { codigo_dane: "05145", nombre: "Caramanta", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 5100, area_km2: 86, lat: 5.54853, lng: -75.643868 },
  { codigo_dane: "05147", nombre: "Carepa", departamento: "Antioquia", subregion: "Urabá", categoria: 5, poblacion: 63000, area_km2: 380, lat: 7.755148, lng: -76.652652 },
  { codigo_dane: "05148", nombre: "El Carmen de Viboral", departamento: "Antioquia", subregion: "Oriente", categoria: 5, poblacion: 52000, area_km2: 448, lat: 6.082885, lng: -75.333901 },
  { codigo_dane: "05150", nombre: "Carolina del Príncipe", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 3900, area_km2: 167, lat: 6.725995, lng: -75.283192 },
  { codigo_dane: "05154", nombre: "Caucasia", departamento: "Antioquia", subregion: "Bajo Cauca", categoria: 4, poblacion: 123000, area_km2: 1411, lat: 7.977278, lng: -75.197996 },
  { codigo_dane: "05172", nombre: "Chigorodó", departamento: "Antioquia", subregion: "Urabá", categoria: 4, poblacion: 89000, area_km2: 608, lat: 7.666147, lng: -76.681531 },
  { codigo_dane: "05190", nombre: "Cisneros", departamento: "Antioquia", subregion: "Nordeste", categoria: 6, poblacion: 9800, area_km2: 46, lat: 6.537829, lng: -75.087047 },
  { codigo_dane: "05197", nombre: "Cocorná", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 14600, area_km2: 210, lat: 6.058295, lng: -75.185483 },
  { codigo_dane: "05206", nombre: "Concepción", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 3300, area_km2: 167, lat: 6.394348, lng: -75.257587 },
  { codigo_dane: "05209", nombre: "Concordia", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 20500, area_km2: 233, lat: 6.045738, lng: -75.908448 },
  { codigo_dane: "05212", nombre: "Copacabana", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 3, poblacion: 78000, area_km2: 70, lat: 6.348557, lng: -75.509384 },
  { codigo_dane: "05234", nombre: "Dabeiba", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 23000, area_km2: 1882, lat: 6.998112, lng: -76.261614 },
  { codigo_dane: "05237", nombre: "Donmatías", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 24500, area_km2: 181, lat: 6.485603, lng: -75.39263 },
  { codigo_dane: "05240", nombre: "Ebéjico", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 12000, area_km2: 240, lat: 6.325615, lng: -75.766413 },
  { codigo_dane: "05250", nombre: "El Bagre", departamento: "Antioquia", subregion: "Bajo Cauca", categoria: 5, poblacion: 54000, area_km2: 1563, lat: 7.5975, lng: -74.799097 },
  { codigo_dane: "05264", nombre: "Entrerríos", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 11500, area_km2: 219, lat: 6.566273, lng: -75.517685 },
  { codigo_dane: "05266", nombre: "Envigado", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 1, poblacion: 264000, area_km2: 78, lat: 6.166695, lng: -75.582192 },
  { codigo_dane: "05282", nombre: "Fredonia", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 21800, area_km2: 247, lat: 5.928039, lng: -75.675072 },
  { codigo_dane: "05284", nombre: "Frontino", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 17200, area_km2: 1266, lat: 6.776066, lng: -76.130765 },
  { codigo_dane: "05306", nombre: "Giraldo", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 3500, area_km2: 131, lat: 6.680808, lng: -75.952158 },
  { codigo_dane: "05308", nombre: "Girardota", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 4, poblacion: 58000, area_km2: 82, lat: 6.379472, lng: -75.444238 },
  { codigo_dane: "05310", nombre: "Gómez Plata", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 13200, area_km2: 362, lat: 6.683269, lng: -75.220018 },
  { codigo_dane: "05313", nombre: "Granada", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 10500, area_km2: 183, lat: 6.142892, lng: -75.184446 },
  { codigo_dane: "05315", nombre: "Guadalupe", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 6200, area_km2: 91, lat: 6.815069, lng: -75.239862 },
  { codigo_dane: "05318", nombre: "Guarne", departamento: "Antioquia", subregion: "Oriente", categoria: 5, poblacion: 54000, area_km2: 151, lat: 6.27787, lng: -75.441612 },
  { codigo_dane: "05321", nombre: "Guatapé", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 5800, area_km2: 69, lat: 6.232461, lng: -75.160041 },
  { codigo_dane: "05347", nombre: "Heliconia", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 6300, area_km2: 117, lat: 6.206757, lng: -75.734322 },
  { codigo_dane: "05353", nombre: "Hispania", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 4800, area_km2: 75, lat: 5.799461, lng: -75.906587 },
  { codigo_dane: "05360", nombre: "Itagüí", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 1, poblacion: 289000, area_km2: 21, lat: 6.175079, lng: -75.612056 },
  { codigo_dane: "05361", nombre: "Ituango", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 21000, area_km2: 2347, lat: 7.171629, lng: -75.764673 },
  { codigo_dane: "05364", nombre: "Jardín", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 13800, area_km2: 224, lat: 5.597542, lng: -75.818982 },
  { codigo_dane: "05368", nombre: "Jericó", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 12000, area_km2: 192, lat: 5.789748, lng: -75.785499 },
  { codigo_dane: "05376", nombre: "La Ceja", departamento: "Antioquia", subregion: "Oriente", categoria: 4, poblacion: 59000, area_km2: 131, lat: 6.028062, lng: -75.429433 },
  { codigo_dane: "05380", nombre: "La Estrella", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 3, poblacion: 70000, area_km2: 35, lat: 6.145238, lng: -75.637708 },
  { codigo_dane: "05390", nombre: "La Pintada", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 8500, area_km2: 55, lat: 5.743808, lng: -75.60781 },
  { codigo_dane: "05400", nombre: "La Unión", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 20500, area_km2: 198, lat: 5.973845, lng: -75.360874 },
  { codigo_dane: "05411", nombre: "Liborina", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 9500, area_km2: 218, lat: 6.677316, lng: -75.812838 },
  { codigo_dane: "05425", nombre: "Maceo", departamento: "Antioquia", subregion: "Magdalena Medio", categoria: 6, poblacion: 7200, area_km2: 449, lat: 6.552116, lng: -74.78716 },
  { codigo_dane: "05440", nombre: "Marinilla", departamento: "Antioquia", subregion: "Oriente", categoria: 4, poblacion: 60000, area_km2: 115, lat: 6.173995, lng: -75.339345 },
  { codigo_dane: "05467", nombre: "Montebello", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 6200, area_km2: 85, lat: 5.946313, lng: -75.523455 },
  { codigo_dane: "05475", nombre: "Murindó", departamento: "Antioquia", subregion: "Urabá", categoria: 6, poblacion: 5200, area_km2: 1349, lat: 6.97771, lng: -76.817485 },
  { codigo_dane: "05480", nombre: "Mutatá", departamento: "Antioquia", subregion: "Urabá", categoria: 6, poblacion: 24000, area_km2: 1106, lat: 7.242875, lng: -76.435875 },
  { codigo_dane: "05483", nombre: "Nariño", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 17500, area_km2: 313, lat: 5.610777, lng: -75.176262 },
  { codigo_dane: "05490", nombre: "Necoclí", departamento: "Antioquia", subregion: "Urabá", categoria: 5, poblacion: 72000, area_km2: 1361, lat: 8.434526, lng: -76.787271 },
  { codigo_dane: "05495", nombre: "Nechí", departamento: "Antioquia", subregion: "Bajo Cauca", categoria: 6, poblacion: 32000, area_km2: 914, lat: 8.094129, lng: -74.77647 },
  { codigo_dane: "05501", nombre: "Olaya", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 3400, area_km2: 85, lat: 6.626492, lng: -75.811773 },
  { codigo_dane: "05541", nombre: "Peñol", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 16800, area_km2: 143, lat: 6.219349, lng: -75.242693 },
  { codigo_dane: "05543", nombre: "Peque", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 10500, area_km2: 407, lat: 7.021029, lng: -75.910357 },
  { codigo_dane: "05576", nombre: "Pueblorrico", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 6800, area_km2: 106, lat: 5.79158, lng: -75.839903 },
  { codigo_dane: "05579", nombre: "Puerto Berrío", departamento: "Antioquia", subregion: "Magdalena Medio", categoria: 5, poblacion: 49000, area_km2: 1184, lat: 6.487028, lng: -74.410016 },
  { codigo_dane: "05585", nombre: "Puerto Nare", departamento: "Antioquia", subregion: "Magdalena Medio", categoria: 6, poblacion: 19500, area_km2: 472, lat: 6.186025, lng: -74.583012 },
  { codigo_dane: "05591", nombre: "Puerto Triunfo", departamento: "Antioquia", subregion: "Magdalena Medio", categoria: 6, poblacion: 20500, area_km2: 362, lat: 5.871318, lng: -74.64119 },
  { codigo_dane: "05604", nombre: "Remedios", departamento: "Antioquia", subregion: "Nordeste", categoria: 6, poblacion: 30000, area_km2: 1986, lat: 7.029424, lng: -74.698135 },
  { codigo_dane: "05607", nombre: "Retiro", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 21000, area_km2: 273, lat: 6.062454, lng: -75.501301 },
  { codigo_dane: "05615", nombre: "Rionegro", departamento: "Antioquia", subregion: "Oriente", categoria: 2, poblacion: 146000, area_km2: 196, lat: 6.147148, lng: -75.377316 },
  { codigo_dane: "05628", nombre: "Sabanalarga", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 8200, area_km2: 418, lat: 6.850028, lng: -75.816645 },
  { codigo_dane: "05631", nombre: "Sabaneta", departamento: "Antioquia", subregion: "Valle de Aburrá", categoria: 2, poblacion: 55000, area_km2: 15, lat: 6.149903, lng: -75.615479 },
  { codigo_dane: "05642", nombre: "Salgar", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 17000, area_km2: 418, lat: 5.964198, lng: -75.976807 },
  { codigo_dane: "05647", nombre: "San Andrés de Cuerquia", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 6000, area_km2: 180, lat: 6.916676, lng: -75.674564 },
  { codigo_dane: "05649", nombre: "San Carlos", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 16500, area_km2: 702, lat: 6.187746, lng: -74.988097 },
  { codigo_dane: "05652", nombre: "San Francisco", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 5200, area_km2: 372, lat: 5.963476, lng: -75.101562 },
  { codigo_dane: "05656", nombre: "San Jerónimo", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 14500, area_km2: 155, lat: 6.44809, lng: -75.726975 },
  { codigo_dane: "05658", nombre: "San José de la Montaña", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 3100, area_km2: 127, lat: 6.85009, lng: -75.683352 },
  { codigo_dane: "05659", nombre: "San Juan de Urabá", departamento: "Antioquia", subregion: "Urabá", categoria: 6, poblacion: 26000, area_km2: 239, lat: 8.758964, lng: -76.52857 },
  { codigo_dane: "05660", nombre: "San Luis", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 11500, area_km2: 454, lat: 6.043017, lng: -74.993619 },
  { codigo_dane: "05664", nombre: "San Pedro de los Milagros", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 28000, area_km2: 229, lat: 6.46012, lng: -75.556743 },
  { codigo_dane: "05665", nombre: "San Pedro de Urabá", departamento: "Antioquia", subregion: "Urabá", categoria: 6, poblacion: 33000, area_km2: 476, lat: 8.276884, lng: -76.380567 },
  { codigo_dane: "05667", nombre: "San Rafael", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 13500, area_km2: 362, lat: 6.293759, lng: -75.02849 },
  { codigo_dane: "05670", nombre: "San Roque", departamento: "Antioquia", subregion: "Nordeste", categoria: 6, poblacion: 16800, area_km2: 441, lat: 6.485939, lng: -75.019109 },
  { codigo_dane: "05674", nombre: "San Vicente Ferrer", departamento: "Antioquia", subregion: "Oriente", categoria: 6, poblacion: 17200, area_km2: 243, lat: 6.282164, lng: -75.332616 },
  { codigo_dane: "05679", nombre: "Santa Bárbara", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 22500, area_km2: 493, lat: 5.875527, lng: -75.567351 },
  { codigo_dane: "05686", nombre: "Santa Rosa de Osos", departamento: "Antioquia", subregion: "Norte", categoria: 5, poblacion: 37000, area_km2: 812, lat: 6.643366, lng: -75.460723 },
  { codigo_dane: "05690", nombre: "Santo Domingo", departamento: "Antioquia", subregion: "Nordeste", categoria: 6, poblacion: 10500, area_km2: 271, lat: 6.473032, lng: -75.164903 },
  { codigo_dane: "05697", nombre: "El Santuario", departamento: "Antioquia", subregion: "Oriente", categoria: 5, poblacion: 29000, area_km2: 75, lat: 6.136871, lng: -75.265465 },
  { codigo_dane: "05736", nombre: "Segovia", departamento: "Antioquia", subregion: "Nordeste", categoria: 5, poblacion: 43000, area_km2: 1236, lat: 7.079648, lng: -74.701596 },
  { codigo_dane: "05756", nombre: "Sonsón", departamento: "Antioquia", subregion: "Oriente", categoria: 5, poblacion: 35000, area_km2: 1323, lat: 5.714851, lng: -75.309596 },
  { codigo_dane: "05761", nombre: "Sopetrán", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 15000, area_km2: 223, lat: 6.500745, lng: -75.747378 },
  { codigo_dane: "05789", nombre: "Támesis", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 14500, area_km2: 245, lat: 5.664645, lng: -75.714429 },
  { codigo_dane: "05790", nombre: "Tarazá", departamento: "Antioquia", subregion: "Bajo Cauca", categoria: 6, poblacion: 48000, area_km2: 1573, lat: 7.580127, lng: -75.401407 },
  { codigo_dane: "05792", nombre: "Tarso", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 7200, area_km2: 111, lat: 5.864542, lng: -75.822956 },
  { codigo_dane: "05809", nombre: "Titiribí", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 9500, area_km2: 142, lat: 6.062391, lng: -75.791887 },
  { codigo_dane: "05819", nombre: "Toledo", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 5800, area_km2: 137, lat: 7.010328, lng: -75.692281 },
  { codigo_dane: "05837", nombre: "Turbo", departamento: "Antioquia", subregion: "Urabá", categoria: 4, poblacion: 180000, area_km2: 3055, lat: 8.089929, lng: -76.728858 },
  { codigo_dane: "05842", nombre: "Uramita", departamento: "Antioquia", subregion: "Occidente", categoria: 6, poblacion: 8500, area_km2: 263, lat: 6.898393, lng: -76.173284 },
  { codigo_dane: "05847", nombre: "Urrao", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 42000, area_km2: 2556, lat: 6.317343, lng: -76.133951 },
  { codigo_dane: "05854", nombre: "Valdivia", departamento: "Antioquia", subregion: "Norte", categoria: 6, poblacion: 22000, area_km2: 569, lat: 7.1652, lng: -75.439274 },
  { codigo_dane: "05856", nombre: "Valparaíso", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 5500, area_km2: 123, lat: 5.614555, lng: -75.624452 },
  { codigo_dane: "05858", nombre: "Vegachí", departamento: "Antioquia", subregion: "Nordeste", categoria: 6, poblacion: 10500, area_km2: 526, lat: 6.773525, lng: -74.798714 },
  { codigo_dane: "05861", nombre: "Venecia", departamento: "Antioquia", subregion: "Suroeste", categoria: 6, poblacion: 12500, area_km2: 141, lat: 5.964693, lng: -75.735544 },
  { codigo_dane: "05873", nombre: "Vigía del Fuerte", departamento: "Antioquia", subregion: "Urabá", categoria: 6, poblacion: 6000, area_km2: 1781, lat: 6.588164, lng: -76.896004 },
  { codigo_dane: "05885", nombre: "Yalí", departamento: "Antioquia", subregion: "Nordeste", categoria: 6, poblacion: 8200, area_km2: 514, lat: 6.676554, lng: -74.840059 },
  { codigo_dane: "05887", nombre: "Yarumal", departamento: "Antioquia", subregion: "Norte", categoria: 5, poblacion: 48000, area_km2: 732, lat: 6.963832, lng: -75.418828 },
  { codigo_dane: "05890", nombre: "Yolombó", departamento: "Antioquia", subregion: "Nordeste", categoria: 6, poblacion: 22000, area_km2: 956, lat: 6.594511, lng: -75.013385 },
  { codigo_dane: "05893", nombre: "Yondó", departamento: "Antioquia", subregion: "Magdalena Medio", categoria: 6, poblacion: 21000, area_km2: 1881, lat: 7.00396, lng: -73.912445 },
  { codigo_dane: "05895", nombre: "Zaragoza", departamento: "Antioquia", subregion: "Bajo Cauca", categoria: 6, poblacion: 33000, area_km2: 1064, lat: 7.488583, lng: -74.867075 },
];

/** Lookup rápido por código DANE */
export const municipalitiesByCode = new Map(
  antioquiaMunicipalities.map((m) => [m.codigo_dane, m])
);

/** Municipios agrupados por subregión */
export const municipalitiesBySubregion = antioquiaMunicipalities.reduce(
  (acc, m) => {
    if (!acc[m.subregion]) acc[m.subregion] = [];
    acc[m.subregion].push(m);
    return acc;
  },
  {} as Record<Subregion, AntioquiaMunicipality[]>
);

/** Total de municipios */
export const TOTAL_MUNICIPIOS = antioquiaMunicipalities.length;

/** Población total del departamento */
export const POBLACION_TOTAL = antioquiaMunicipalities.reduce(
  (sum, m) => sum + m.poblacion,
  0
);

/** Centro geográfico de Antioquia (para zoom inicial) */
export const ANTIOQUIA_CENTER: [number, number] = [-75.6, 6.9];
export const ANTIOQUIA_ZOOM = 7;
