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
import type { IDFRanking } from "@/lib/fut-client";
import { IDF_CHOROPLETH_STOPS, getIDFColor } from "@/data/antioquia-idf-2023";
import {
  getContractCountColor,
  getContractValueColor,
  getEjecucionCuipoColor,
  getTipoPredominanteColor,
  type ContractLayerType,
} from "./ContractLayer";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type ColorMode = "categoria" | "subregion" | "idf" | "contratos";

export interface ContractMetrics {
  codigo_dane: string;
  municipio: string;
  total_contratos: number;
  valor_total: number;
  tipo_predominante: string;
  porcentaje_ejecucion: number;
}

interface AntioquiaMapProps {
  /** Callback cuando se selecciona un municipio */
  onMunicipalitySelect?: (municipality: AntioquiaMunicipality) => void;
  /** Callback cuando se deselecciona */
  onDeselect?: () => void;
  /** Código DANE del municipio seleccionado externamente */
  selectedCode?: string | null;
  /** Altura del mapa */
  height?: string;
  /** Modo de coloración inicial */
  initialColorMode?: ColorMode;
  /** Datos fiscales (IDF) para colorear por desempeno fiscal */
  fiscalData?: IDFRanking[];
  /** Datos de contratación para colorear por métricas de contratos */
  contractData?: ContractMetrics[];
  /** Tipo de capa de contratación activa */
  contractLayerType?: ContractLayerType;
  /** Callback cuando cambia el modo de coloracion */
  onColorModeChange?: (mode: ColorMode) => void;
}

export default function AntioquiaMap({
  onMunicipalitySelect,
  onDeselect,
  selectedCode,
  height = "560px",
  initialColorMode = "categoria",
  fiscalData = [],
  contractData = [],
  contractLayerType = "cantidad",
  onColorModeChange,
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

  // Sync external selection with internal state
  useEffect(() => {
    if (selectedCode === null || selectedCode === undefined) {
      setSelectedMunicipality(null);
    } else if (selectedCode && selectedCode !== selectedMunicipality?.codigo_dane) {
      const muni = getMunicipality(selectedCode);
      if (muni) {
        setSelectedMunicipality(muni);
      }
    }
  }, [selectedCode, selectedMunicipality?.codigo_dane, getMunicipality]);

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
        "circle-color": buildColorExpression(colorMode, fiscalData, contractData, contractLayerType),
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
      buildColorExpression(colorMode, fiscalData, contractData, contractLayerType)
    );
  }, [colorMode, mapLoaded, fiscalData, contractData, contractLayerType]);

  // Update highlight when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer("municipalities-circles")) return;

    if (selectedMunicipality) {
      // Highlight selected municipality
      map.setPaintProperty("municipalities-circles", "circle-stroke-width", [
        "case",
        ["==", ["get", "codigo_dane"], selectedMunicipality.codigo_dane],
        3.5,
        1.5,
      ]);
      map.setPaintProperty("municipalities-circles", "circle-stroke-color", [
        "case",
        ["==", ["get", "codigo_dane"], selectedMunicipality.codigo_dane],
        "#B8956A", // ochre
        "#FFFFFF",
      ]);
      map.setPaintProperty("municipalities-circles", "circle-opacity", [
        "case",
        ["==", ["get", "codigo_dane"], selectedMunicipality.codigo_dane],
        1,
        0.6,
      ]);
    } else {
      // Reset to default styles
      map.setPaintProperty("municipalities-circles", "circle-stroke-width", 1.5);
      map.setPaintProperty("municipalities-circles", "circle-stroke-color", "#FFFFFF");
      map.setPaintProperty("municipalities-circles", "circle-opacity", 0.85);
    }
  }, [selectedMunicipality, mapLoaded]);

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
    onDeselect?.();
  }, [mapConfig, onDeselect]);

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
              onClick={() => {
                setColorMode("categoria");
                onColorModeChange?.("categoria");
              }}
              className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 ${
                colorMode === "categoria"
                  ? "bg-ochre-soft text-ochre"
                  : "text-gray-400 hover:bg-cream hover:text-ink"
              }`}
            >
              Categoria Municipal
            </button>
            <button
              onClick={() => {
                setColorMode("subregion");
                onColorModeChange?.("subregion");
              }}
              className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 ${
                colorMode === "subregion"
                  ? "bg-ochre-soft text-ochre"
                  : "text-gray-400 hover:bg-cream hover:text-ink"
              }`}
            >
              Subregion
            </button>
            {fiscalData.length > 0 && (
              <button
                onClick={() => {
                  setColorMode("idf");
                  onColorModeChange?.("idf");
                }}
                className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 ${
                  colorMode === "idf"
                    ? "bg-ochre-soft text-ochre"
                    : "text-gray-400 hover:bg-cream hover:text-ink"
                }`}
              >
                Desempeno Fiscal (IDF)
              </button>
            )}
            {contractData.length > 0 && (
              <button
                onClick={() => {
                  setColorMode("contratos");
                  onColorModeChange?.("contratos");
                }}
                className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 ${
                  colorMode === "contratos"
                    ? "bg-ochre-soft text-ochre"
                    : "text-gray-400 hover:bg-cream hover:text-ink"
                }`}
              >
                Contratacion SECOP
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-16 left-3 z-10">
          <Legend colorMode={colorMode} contractLayerType={contractLayerType} />
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
function Legend({ colorMode, contractLayerType = "cantidad" }: { colorMode: ColorMode; contractLayerType?: ContractLayerType }) {
  if (colorMode === "categoria") {
    const categorias: CategoríaMunicipal[] = [0, 1, 2, 3, 4, 5, 6];
    return (
      <div className="bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg px-3 py-2">
        <div className="text-[0.5625rem] text-gray-400 mb-2 font-medium">
          Categoria Municipal
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

  if (colorMode === "idf") {
    return (
      <div className="bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg px-3 py-2">
        <div className="text-[0.5625rem] text-gray-400 mb-2 font-medium">
          Indice Desempeno Fiscal (IDF)
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22C55E" }} />
            <span className="text-[0.625rem] text-gray-600">Sostenible (80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EAB308" }} />
            <span className="text-[0.625rem] text-gray-600">Solvente (70-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F97316" }} />
            <span className="text-[0.625rem] text-gray-600">Vulnerable (60-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EF4444" }} />
            <span className="text-[0.625rem] text-gray-600">Deterioro (&lt;60)</span>
          </div>
        </div>
      </div>
    );
  }

  if (colorMode === "contratos") {
    return (
      <div className="bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg px-3 py-2">
        <div className="text-[0.5625rem] text-gray-400 mb-2 font-medium">
          {contractLayerType === "cantidad" && "Total Contratos"}
          {contractLayerType === "valor" && "Valor Contratacion"}
          {contractLayerType === "ejecucion_cuipo" && "Ejecucion CUIPO"}
          {contractLayerType === "tipo_predominante" && "Tipo Predominante"}
        </div>
        <div className="space-y-1">
          {contractLayerType === "cantidad" && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22C55E" }} />
                <span className="text-[0.625rem] text-gray-600">500+ contratos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EAB308" }} />
                <span className="text-[0.625rem] text-gray-600">100-499 contratos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F97316" }} />
                <span className="text-[0.625rem] text-gray-600">50-99 contratos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EF4444" }} />
                <span className="text-[0.625rem] text-gray-600">&lt;50 contratos</span>
              </div>
            </>
          )}
          {contractLayerType === "valor" && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22C55E" }} />
                <span className="text-[0.625rem] text-gray-600">$100B+ COP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EAB308" }} />
                <span className="text-[0.625rem] text-gray-600">$50B-$100B COP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F97316" }} />
                <span className="text-[0.625rem] text-gray-600">$20B-$50B COP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EF4444" }} />
                <span className="text-[0.625rem] text-gray-600">&lt;$20B COP</span>
              </div>
            </>
          )}
          {contractLayerType === "ejecucion_cuipo" && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22C55E" }} />
                <span className="text-[0.625rem] text-gray-600">85%+ (Excelente)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EAB308" }} />
                <span className="text-[0.625rem] text-gray-600">70-84% (Bueno)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F97316" }} />
                <span className="text-[0.625rem] text-gray-600">50-69% (Regular)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EF4444" }} />
                <span className="text-[0.625rem] text-gray-600">&lt;50% (Bajo)</span>
              </div>
            </>
          )}
          {contractLayerType === "tipo_predominante" && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3B82F6" }} />
                <span className="text-[0.625rem] text-gray-600">Prestacion servicios</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#8B5CF6" }} />
                <span className="text-[0.625rem] text-gray-600">Suministro</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F97316" }} />
                <span className="text-[0.625rem] text-gray-600">Obra publica</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EC4899" }} />
                <span className="text-[0.625rem] text-gray-600">Consultoria</span>
              </div>
            </>
          )}
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
              style={{ backgroundColor: SUBREGION_COLORS[sub as Subregion] }}
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
function buildColorExpression(
  mode: ColorMode,
  fiscalData: IDFRanking[] = [],
  contractData: ContractMetrics[] = [],
  contractLayerType: ContractLayerType = "cantidad"
): mapboxgl.Expression {
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

  if (mode === "idf" && fiscalData.length > 0) {
    // Build match expression for IDF coloring
    const matchPairs: (string | number)[] = [];
    fiscalData.forEach((item) => {
      matchPairs.push(item.codigoDane);
      matchPairs.push(getIDFColor(item.idf));
    });

    return [
      "match",
      ["get", "codigo_dane"],
      ...matchPairs,
      "#DDD4C4", // default for municipalities without IDF data
    ] as mapboxgl.Expression;
  }

  if (mode === "contratos" && contractData.length > 0) {
    // Build match expression for contract coloring
    const matchPairs: (string | number)[] = [];

    contractData.forEach((item) => {
      matchPairs.push(item.codigo_dane);

      let color: string;
      switch (contractLayerType) {
        case "cantidad":
          color = getContractCountColor(item.total_contratos);
          break;
        case "valor":
          color = getContractValueColor(item.valor_total);
          break;
        case "ejecucion_cuipo":
          color = getEjecucionCuipoColor(item.porcentaje_ejecucion);
          break;
        case "tipo_predominante":
          color = getTipoPredominanteColor(item.tipo_predominante);
          break;
        default:
          color = "#DDD4C4";
      }
      matchPairs.push(color);
    });

    return [
      "match",
      ["get", "codigo_dane"],
      ...matchPairs,
      "#DDD4C4", // default for municipalities without contract data
    ] as mapboxgl.Expression;
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
