"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Layers, Maximize2, ZoomIn, ZoomOut, Info } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { useAntioquiaMunicipalities } from "@/hooks/useAntioquiaMunicipalities";
import {
  CATEGORIA_COLORS,
  CATEGORIA_LABELS,
  SUBREGION_COLORS,
  type AntioquiaMunicipality,
  type CategoríaMunicipal,
  type Subregion,
} from "@/data/antioquia-municipalities";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type ColorMode = "categoria" | "subregion";

interface AntioquiaMapProps {
  /** Callback cuando se selecciona un municipio */
  onMunicipalitySelect?: (municipality: AntioquiaMunicipality) => void;
  /** Altura del mapa */
  height?: string;
  /** Modo de coloración inicial */
  initialColorMode?: ColorMode;
}

export default function AntioquiaMap({
  onMunicipalitySelect,
  height = "560px",
  initialColorMode = "categoria",
}: AntioquiaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>(initialColorMode);
  const [selectedMunicipality, setSelectedMunicipality] = useState<AntioquiaMunicipality | null>(null);

  const {
    geojson,
    loading,
    error,
    getMunicipality,
    stats,
    mapConfig,
  } = useAntioquiaMunicipalities({ fetchGeoJSON: true });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: mapConfig.center,
      zoom: mapConfig.zoom,
      pitch: 0,
      attributionControl: false,
    });

    // Add navigation control
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    // Create popup
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
      maxWidth: "280px",
    });
    popupRef.current = popup;

    mapRef.current = map;

    return () => {
      popup.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [mapConfig.center, mapConfig.zoom]);

  // Add GeoJSON source and layers when data loads
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !geojson) return;

    // Remove existing layers if any
    if (map.getLayer("municipalities-circles")) {
      map.removeLayer("municipalities-circles");
    }
    if (map.getLayer("municipalities-labels")) {
      map.removeLayer("municipalities-labels");
    }
    if (map.getSource("municipalities")) {
      map.removeSource("municipalities");
    }

    // Add source
    map.addSource("municipalities", {
      type: "geojson",
      data: geojson,
    });

    // Add circle layer for municipalities
    map.addLayer({
      id: "municipalities-circles",
      type: "circle",
      source: "municipalities",
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "poblacion"],
          3000, 6,
          50000, 12,
          200000, 18,
          500000, 24,
          2600000, 32,
        ],
        "circle-color": buildColorExpression(colorMode),
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#FFFFFF",
        "circle-opacity": 0.85,
      },
    });

    // Add labels for larger cities
    map.addLayer({
      id: "municipalities-labels",
      type: "symbol",
      source: "municipalities",
      filter: [">=", ["get", "poblacion"], 50000],
      layout: {
        "text-field": ["get", "nombre"],
        "text-size": 11,
        "text-offset": [0, 1.5],
        "text-anchor": "top",
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
      },
      paint: {
        "text-color": "#1A1A1A",
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 1,
      },
    });

    // Hover interaction
    map.on("mousemove", "municipalities-circles", (e) => {
      if (!e.features || e.features.length === 0) return;
      map.getCanvas().style.cursor = "pointer";

      const feature = e.features[0];
      const props = feature.properties;
      if (!props) return;

      const coords = e.lngLat;
      const categoria = props.categoria as CategoríaMunicipal;

      popupRef.current
        ?.setLngLat(coords)
        .setHTML(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px 0;">
            <strong style="font-size:14px;color:#1A1A1A;">${props.nombre}</strong>
            <div style="font-size:11px;color:#6B6B6B;margin-top:4px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                <span>Subregión:</span>
                <span style="font-weight:500;">${props.subregion}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                <span>Categoría:</span>
                <span style="font-weight:500;">${CATEGORIA_LABELS[categoria]}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                <span>Población:</span>
                <span style="font-weight:500;">${formatNumber(props.poblacion)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Área:</span>
                <span style="font-weight:500;">${formatNumber(props.area_km2)} km²</span>
              </div>
            </div>
          </div>`
        )
        .addTo(map);
    });

    map.on("mouseleave", "municipalities-circles", () => {
      map.getCanvas().style.cursor = "";
      popupRef.current?.remove();
    });

    // Click interaction
    map.on("click", "municipalities-circles", (e) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      const codigoDane = feature.properties?.codigo_dane;
      if (!codigoDane) return;

      const municipality = getMunicipality(codigoDane);
      if (municipality) {
        setSelectedMunicipality(municipality);
        onMunicipalitySelect?.(municipality);

        // Fly to selected municipality
        map.flyTo({
          center: [municipality.lng, municipality.lat],
          zoom: 10,
          duration: 1000,
        });
      }
    });
  }, [mapLoaded, geojson, colorMode, getMunicipality, onMunicipalitySelect]);

  // Update colors when mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer("municipalities-circles")) return;

    map.setPaintProperty(
      "municipalities-circles",
      "circle-color",
      buildColorExpression(colorMode)
    );
  }, [colorMode, mapLoaded]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleResetView = useCallback(() => {
    mapRef.current?.flyTo({
      center: mapConfig.center,
      zoom: mapConfig.zoom,
      duration: 1000,
    });
    setSelectedMunicipality(null);
  }, [mapConfig]);

  const toggleFullscreen = useCallback(() => {
    if (!mapContainer.current?.parentElement) return;

    if (!document.fullscreenElement) {
      mapContainer.current.parentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  if (error && !geojson) {
    return (
      <div className="rounded-2xl border border-border bg-paper p-8 text-center">
        <Info className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-sm text-gray-500">Error cargando mapa de Antioquia</p>
        <p className="text-xs text-gray-400 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-paper shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-ink text-paper">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-ochre" />
          <h3 className="text-sm font-semibold">
            Gemelo Municipal — Antioquia
          </h3>
        </div>
        <span className="text-[0.6875rem] text-gray-400">
          {stats.total} municipios · {formatNumber(stats.poblacionTotal)} hab.
        </span>
      </div>

      {/* Map */}
      <div className="relative" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-cream/80">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ochre border-t-transparent" />
              <span className="text-xs text-gray-500">Cargando mapa...</span>
            </div>
          </div>
        )}

        <div ref={mapContainer} className="w-full h-full" />

        {/* Color mode selector */}
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-paper/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-2 space-y-1">
            <div className="text-[0.5625rem] font-semibold uppercase tracking-wider text-gray-400 px-2 pb-1">
              <Layers size={10} className="inline mr-1" />
              Colorear por
            </div>
            <button
              onClick={() => setColorMode("categoria")}
              className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 ${
                colorMode === "categoria"
                  ? "bg-ochre-soft text-ochre"
                  : "text-gray-400 hover:bg-cream hover:text-ink"
              }`}
            >
              Categoría Municipal
            </button>
            <button
              onClick={() => setColorMode("subregion")}
              className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 ${
                colorMode === "subregion"
                  ? "bg-ochre-soft text-ochre"
                  : "text-gray-400 hover:bg-cream hover:text-ink"
              }`}
            >
              Subregión
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-16 left-3 z-10">
          <Legend colorMode={colorMode} />
        </div>

        {/* Custom controls */}
        <div className="absolute bottom-3 left-3 z-10 flex gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg hover:bg-cream transition-colors"
            aria-label="Acercar"
          >
            <ZoomIn size={16} className="text-ink" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg hover:bg-cream transition-colors"
            aria-label="Alejar"
          >
            <ZoomOut size={16} className="text-ink" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg hover:bg-cream transition-colors"
            aria-label="Pantalla completa"
          >
            <Maximize2 size={16} className="text-ink" />
          </button>
        </div>

        {/* Selected municipality info */}
        {selectedMunicipality && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 right-3 z-10 bg-paper/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-4 max-w-[200px]"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-ink">
                {selectedMunicipality.nombre}
              </h4>
              <button
                onClick={handleResetView}
                className="text-xs text-gray-400 hover:text-ink"
              >
                Ver todo
              </button>
            </div>
            <div className="space-y-1 text-[0.6875rem] text-gray-500">
              <div className="flex justify-between">
                <span>Subregión:</span>
                <span className="font-medium">{selectedMunicipality.subregion}</span>
              </div>
              <div className="flex justify-between">
                <span>Categoría:</span>
                <span className="font-medium">
                  {CATEGORIA_LABELS[selectedMunicipality.categoria]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Población:</span>
                <span className="font-medium">
                  {formatNumber(selectedMunicipality.poblacion)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Código DANE:</span>
                <span className="font-mono font-medium">
                  {selectedMunicipality.codigo_dane}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Legend component
function Legend({ colorMode }: { colorMode: ColorMode }) {
  if (colorMode === "categoria") {
    const categorias: CategoríaMunicipal[] = [0, 1, 2, 3, 4, 5, 6];
    return (
      <div className="bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg px-3 py-2">
        <div className="text-[0.5625rem] text-gray-400 mb-2 font-medium">
          Categoría Municipal
        </div>
        <div className="space-y-1">
          {categorias.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CATEGORIA_COLORS[cat] }}
              />
              <span className="text-[0.625rem] text-gray-600">
                {CATEGORIA_LABELS[cat]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const subregiones: Subregion[] = [
    "Valle de Aburrá",
    "Oriente",
    "Occidente",
    "Suroeste",
    "Norte",
    "Nordeste",
    "Bajo Cauca",
    "Urabá",
    "Magdalena Medio",
  ];

  return (
    <div className="bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg px-3 py-2">
      <div className="text-[0.5625rem] text-gray-400 mb-2 font-medium">
        Subregiones
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {subregiones.map((sub) => (
          <div key={sub} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: SUBREGION_COLORS[sub] }}
            />
            <span className="text-[0.5625rem] text-gray-600 truncate">
              {sub}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Build Mapbox color expression based on mode
function buildColorExpression(mode: ColorMode): mapboxgl.Expression {
  if (mode === "categoria") {
    return [
      "match",
      ["get", "categoria"],
      0, CATEGORIA_COLORS[0],
      1, CATEGORIA_COLORS[1],
      2, CATEGORIA_COLORS[2],
      3, CATEGORIA_COLORS[3],
      4, CATEGORIA_COLORS[4],
      5, CATEGORIA_COLORS[5],
      6, CATEGORIA_COLORS[6],
      "#DDD4C4", // default
    ];
  }

  // Subregion mode
  return [
    "match",
    ["get", "subregion"],
    "Valle de Aburrá", SUBREGION_COLORS["Valle de Aburrá"],
    "Oriente", SUBREGION_COLORS["Oriente"],
    "Occidente", SUBREGION_COLORS["Occidente"],
    "Suroeste", SUBREGION_COLORS["Suroeste"],
    "Norte", SUBREGION_COLORS["Norte"],
    "Nordeste", SUBREGION_COLORS["Nordeste"],
    "Bajo Cauca", SUBREGION_COLORS["Bajo Cauca"],
    "Urabá", SUBREGION_COLORS["Urabá"],
    "Magdalena Medio", SUBREGION_COLORS["Magdalena Medio"],
    "#DDD4C4", // default
  ];
}

// Format number with thousands separator
function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-CO").format(num);
}
