"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, MapPin, Building2, Users, Briefcase, BarChart3, ZoomIn } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface DataLayer {
  id: string;
  label: string;
  icon: typeof MapPin;
  color: string;
  active: boolean;
}

import { comunasData } from "@/data/comunas-data";

const MEDELLIN_CENTER: [number, number] = [-75.5812, 6.2518];
const BARRIO_ZOOM_THRESHOLD = 13.5;

function getComunaValue(id: string, layer: string): number {
  const c = comunasData[id];
  if (!c) return 0;
  switch (layer) {
    case "fiscal": return c.predial + c.ica;
    case "poblacion": return c.poblacion;
    case "estrato": return c.estrato;
    case "contratos": return Math.round(c.ica * 0.3);
    default: return 0;
  }
}

function getLayerColorScale(layer: string): [string, string] {
  switch (layer) {
    case "fiscal": return ["#F5EDDF", "#B8956A"];
    case "poblacion": return ["#D6E4F0", "#3B6A9E"];
    case "estrato": return ["#A0616A", "#6B8E4E"];
    case "contratos": return ["#E8E0F0", "#5B3E8A"];
    default: return ["#F5EDDF", "#B8956A"];
  }
}

function interpolateColor(low: string, high: string, t: number): string {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  const [r1, g1, b1] = hexToRgb(low);
  const [r2, g2, b2] = hexToRgb(high);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

interface UnifiedMapProps {
  selectedComuna: string | null;
  onComunaSelect: (id: string | null) => void;
  className?: string;
}

export default function UnifiedMap({ selectedComuna, onComunaSelect, className }: UnifiedMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [hoveredBarrio, setHoveredBarrio] = useState<string | null>(null);
  const [layers, setLayers] = useState<DataLayer[]>([
    { id: "fiscal", label: "Recaudo Fiscal", icon: BarChart3, color: "#B8956A", active: true },
    { id: "poblacion", label: "Población", icon: Users, color: "#5B7BA5", active: false },
    { id: "estrato", label: "Estratificación", icon: Building2, color: "#6B8E4E", active: false },
    { id: "contratos", label: "Contratos SECOP", icon: Briefcase, color: "#7B6BA5", active: false },
  ]);

  const activeLayer = layers.find((l) => l.active)?.id || "fiscal";
  const showBarrios = zoomLevel >= BARRIO_ZOOM_THRESHOLD;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: MEDELLIN_CENTER,
      zoom: 12,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    // Track zoom level
    map.on("zoom", () => {
      setZoomLevel(map.getZoom());
    });

    map.on("load", () => {
      // Load both GeoJSON sources in parallel
      Promise.all([
        fetch("/data/comunas-medellin.geojson").then((r) => { if (!r.ok) throw new Error("comunas"); return r.json(); }),
        fetch("/data/barrios-medellin.geojson").then((r) => { if (!r.ok) throw new Error("barrios"); return r.json(); }),
      ]).catch(() => null).then((result) => {
        if (!result) return;
        const [comunasGeo, barriosGeo] = result;
        // ── Comunas source + layers ──
        map.addSource("comunas", { type: "geojson", data: comunasGeo });

        map.addLayer({
          id: "comunas-fill",
          type: "fill",
          source: "comunas",
          paint: {
            "fill-color": "#B8956A",
            "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0.5, 14, 0.15],
          },
        });

        map.addLayer({
          id: "comunas-border",
          type: "line",
          source: "comunas",
          paint: {
            "line-color": "#FFFDF8",
            "line-width": ["interpolate", ["linear"], ["zoom"], 13, 1.5, 14, 2.5],
            "line-opacity": 0.9,
          },
        });

        map.addLayer({
          id: "comunas-highlight",
          type: "line",
          source: "comunas",
          paint: { "line-color": "#2C2418", "line-width": 2.5, "line-opacity": 0 },
        });

        map.addLayer({
          id: "comunas-selected",
          type: "line",
          source: "comunas",
          paint: { "line-color": "#B8956A", "line-width": 3.5, "line-opacity": 0 },
        });

        // Comuna labels (centroid)
        map.addLayer({
          id: "comunas-labels",
          type: "symbol",
          source: "comunas",
          layout: {
            "text-field": ["get", "nombre"],
            "text-size": ["interpolate", ["linear"], ["zoom"], 11, 9, 13, 11, 15, 0],
            "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
            "text-anchor": "center",
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": "#2C2418",
            "text-halo-color": "#FFFDF8",
            "text-halo-width": 1.5,
            "text-opacity": ["interpolate", ["linear"], ["zoom"], 13.5, 1, 14.5, 0],
          },
        });

        // ── Barrios source + layers ──
        map.addSource("barrios", { type: "geojson", data: barriosGeo });

        map.addLayer({
          id: "barrios-fill",
          type: "fill",
          source: "barrios",
          minzoom: 13,
          paint: {
            "fill-color": "#B8956A",
            "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 0.45],
          },
        });

        map.addLayer({
          id: "barrios-border",
          type: "line",
          source: "barrios",
          minzoom: 13,
          paint: {
            "line-color": "#FFFDF8",
            "line-width": 0.8,
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 0.7],
          },
        });

        map.addLayer({
          id: "barrios-highlight",
          type: "line",
          source: "barrios",
          minzoom: 13,
          paint: { "line-color": "#2C2418", "line-width": 2, "line-opacity": 0 },
        });

        // Barrio labels
        map.addLayer({
          id: "barrios-labels",
          type: "symbol",
          source: "barrios",
          minzoom: 14.5,
          layout: {
            "text-field": ["get", "nombre"],
            "text-size": ["interpolate", ["linear"], ["zoom"], 14.5, 8, 16, 11],
            "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
            "text-anchor": "center",
            "text-allow-overlap": false,
            "text-max-width": 8,
          },
          paint: {
            "text-color": "#4A4237",
            "text-halo-color": "#FFFDF8",
            "text-halo-width": 1,
          },
        });

        setMapLoaded(true);
      });
    });

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 15 });
    popupRef.current = popup;

    // ── Comunas hover ──
    map.on("mousemove", "comunas-fill", (e) => {
      if (map.getZoom() >= BARRIO_ZOOM_THRESHOLD) return; // defer to barrios at high zoom
      if (!e.features || e.features.length === 0) return;
      map.getCanvas().style.cursor = "pointer";
      const feat = e.features[0];
      const id = feat.properties?.id;
      const c = comunasData[id];
      if (!c) return;

      map.setPaintProperty("comunas-highlight", "line-opacity", [
        "case", ["==", ["get", "id"], id], 1, 0,
      ]);

      popup
        .setLngLat(e.lngLat)
        .setHTML(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px 0;">
            <strong style="font-size:13px;color:#2C2418;">${c.nombre}</strong>
            <span style="font-size:10px;color:#9E9484;margin-left:4px;">Comuna ${id}</span><br/>
            <span style="font-size:11px;color:#9E9484;">
              Población: ${(c.poblacion / 1000).toFixed(0)}K · Estrato ~${c.estrato}<br/>
              Predial: $${(c.predial / 1000).toFixed(1)}M · ICA: $${(c.ica / 1000).toFixed(1)}M
            </span>
          </div>`
        )
        .addTo(map);
    });

    map.on("mouseleave", "comunas-fill", () => {
      if (map.getZoom() >= BARRIO_ZOOM_THRESHOLD) return;
      map.getCanvas().style.cursor = "";
      map.setPaintProperty("comunas-highlight", "line-opacity", 0);
      popup.remove();
    });

    // ── Barrios hover ──
    map.on("mousemove", "barrios-fill", (e) => {
      if (map.getZoom() < BARRIO_ZOOM_THRESHOLD) return;
      if (!e.features || e.features.length === 0) return;
      map.getCanvas().style.cursor = "pointer";
      const feat = e.features[0];
      const nombre = feat.properties?.nombre;
      const comuna = feat.properties?.comuna;
      const area = feat.properties?.area;
      const comunaInfo = comunasData[comuna];

      setHoveredBarrio(nombre);

      map.setPaintProperty("barrios-highlight", "line-opacity", [
        "case", ["==", ["get", "nombre"], nombre], 1, 0,
      ]);

      const areaHa = area ? (area / 10000).toFixed(1) : "—";
      const comunaNombre = comunaInfo?.nombre || `Comuna ${comuna}`;

      popup
        .setLngLat(e.lngLat)
        .setHTML(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px 0;">
            <strong style="font-size:13px;color:#2C2418;">${nombre}</strong><br/>
            <span style="font-size:11px;color:#9E9484;">
              ${comunaNombre} · ${areaHa} ha<br/>
              Estrato ~${comunaInfo?.estrato || "—"}
            </span>
          </div>`
        )
        .addTo(map);
    });

    map.on("mouseleave", "barrios-fill", () => {
      if (map.getZoom() < BARRIO_ZOOM_THRESHOLD) return;
      map.getCanvas().style.cursor = "";
      map.setPaintProperty("barrios-highlight", "line-opacity", 0);
      setHoveredBarrio(null);
      popup.remove();
    });

    // ── Click handlers ──
    map.on("click", "comunas-fill", (e) => {
      if (!e.features || e.features.length === 0) return;
      const id = e.features[0].properties?.id;
      if (id) {
        onComunaSelect(id === selectedComuna ? null : id);
        // Zoom into comuna when selected
        if (id !== selectedComuna && comunasData[id]) {
          map.flyTo({
            center: [comunasData[id].lon, comunasData[id].lat],
            zoom: 14.5,
            duration: 1200,
          });
        }
      }
    });

    map.on("click", (e) => {
      const comunaFeats = map.queryRenderedFeatures(e.point, { layers: ["comunas-fill"] });
      const barrioFeats = map.queryRenderedFeatures(e.point, { layers: ["barrios-fill"] });
      if (comunaFeats.length === 0 && barrioFeats.length === 0) {
        onComunaSelect(null);
      }
    });

    // Click barrio → select its comuna
    map.on("click", "barrios-fill", (e) => {
      if (!e.features || e.features.length === 0) return;
      const comuna = e.features[0].properties?.comuna;
      if (comuna && comunasData[comuna]) {
        onComunaSelect(comuna);
      }
    });

    mapRef.current = map;

    return () => {
      popup.remove();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selected comuna highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (selectedComuna) {
      map.setPaintProperty("comunas-selected", "line-opacity", [
        "case", ["==", ["get", "id"], selectedComuna], 1, 0,
      ]);
    } else {
      map.setPaintProperty("comunas-selected", "line-opacity", 0);
    }
  }, [selectedComuna, mapLoaded]);

  // Update choropleth colors when layer changes — both comunas and barrios
  const updateChoropleth = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const [lowColor, highColor] = getLayerColorScale(activeLayer);
    const ids = Object.keys(comunasData);
    const values = ids.map((id) => getComunaValue(id, activeLayer));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    // Comunas choropleth
    const colorExpr: mapboxgl.Expression = [
      "match",
      ["get", "id"],
      ...ids.flatMap((id) => {
        const t = (getComunaValue(id, activeLayer) - minVal) / range;
        return [id, interpolateColor(lowColor, highColor, t)];
      }),
      "#DDD4C4",
    ];
    map.setPaintProperty("comunas-fill", "fill-color", colorExpr);

    // Barrios choropleth — inherit from parent comuna
    const barrioColorExpr: mapboxgl.Expression = [
      "match",
      ["get", "comuna"],
      ...ids.flatMap((id) => {
        const t = (getComunaValue(id, activeLayer) - minVal) / range;
        return [id, interpolateColor(lowColor, highColor, t)];
      }),
      "#DDD4C4",
    ];
    map.setPaintProperty("barrios-fill", "fill-color", barrioColorExpr);
  }, [activeLayer, mapLoaded]);

  useEffect(() => {
    updateChoropleth();
  }, [updateChoropleth]);

  const toggleLayer = (id: string) => {
    setLayers((prev) => prev.map((l) => ({ ...l, active: l.id === id })));
  };

  const sortedComunas = Object.entries(comunasData)
    .map(([id, c]) => ({ id, ...c, value: getComunaValue(id, activeLayer) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className={`relative ${className || ""}`}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Layer controls — top-left */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-paper/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-2 space-y-1">
          <div className="text-[0.5625rem] font-semibold uppercase tracking-wider text-gray-400 px-2 pb-1">
            <Layers size={10} className="inline mr-1" />
            Capas
          </div>
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-medium transition-all duration-200 ${
                layer.active
                  ? "bg-ochre-soft text-ochre"
                  : "text-gray-400 hover:bg-cream hover:text-ink"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color, opacity: layer.active ? 1 : 0.4 }} />
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom level indicator + barrio hint */}
      <AnimatePresence>
        {!showBarrios && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-14 left-3 z-10"
          >
            <div className="bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg px-3 py-2">
              <div className="text-[0.5625rem] text-gray-400 mb-1">
                {activeLayer === "fiscal" ? "Recaudo (millones)" :
                 activeLayer === "poblacion" ? "Habitantes (miles)" :
                 activeLayer === "estrato" ? "Estrato promedio" : "N° contratos"}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[0.5625rem] text-gray-400">Bajo</span>
                <div className="w-20 h-2 rounded-full" style={{
                  background: `linear-gradient(to right, ${getLayerColorScale(activeLayer)[0]}, ${getLayerColorScale(activeLayer)[1]})`,
                }} />
                <span className="text-[0.5625rem] text-gray-400">Alto</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-[0.5rem] text-ochre">
                <ZoomIn size={9} />
                Zoom para ver barrios
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barrios active indicator */}
      <AnimatePresence>
        {showBarrios && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-14 left-3 z-10"
          >
            <div className="bg-ink/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-paper">
              <div className="flex items-center gap-1.5 text-[0.625rem] font-semibold">
                <Building2 size={11} className="text-ochre" />
                Vista de barrios activa
              </div>
              <div className="text-[0.5rem] text-gray-400 mt-0.5">
                349 barrios · Datos estimados por área
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top 3 — bottom-right */}
      <div className="absolute bottom-3 right-3 z-10">
        <motion.div
          key={activeLayer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-paper/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-3"
        >
          <div className="text-[0.5625rem] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Top 3 comunas
          </div>
          {sortedComunas.slice(0, 3).map((c, i) => (
            <button
              key={c.nombre}
              onClick={() => onComunaSelect(c.id === selectedComuna ? null : c.id)}
              className={`flex items-center gap-2 py-0.5 w-full text-left rounded px-1 transition-colors ${
                c.id === selectedComuna ? "bg-ochre-soft" : "hover:bg-cream"
              }`}
            >
              <span className="text-[0.625rem] font-bold text-ochre w-4">{i + 1}.</span>
              <span className="text-[0.6875rem] text-ink flex-1">{c.nombre}</span>
              <span className="text-[0.625rem] text-gray-400">
                {activeLayer === "fiscal" ? `$${(c.value / 1000).toFixed(0)}M` :
                 activeLayer === "poblacion" ? `${(c.value / 1000).toFixed(0)}K` :
                 activeLayer === "estrato" ? `E${c.value.toFixed(1)}` :
                 `${c.value}`}
              </span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Selected comuna info */}
      {selectedComuna && comunasData[selectedComuna] && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-14 z-10 bg-ink/95 backdrop-blur-sm text-paper rounded-xl shadow-lg p-3 max-w-[200px]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.8125rem] font-semibold">{comunasData[selectedComuna].nombre}</span>
            <button onClick={() => onComunaSelect(null)} className="text-gray-400 hover:text-paper text-xs">✕</button>
          </div>
          <div className="space-y-1 text-[0.6875rem]">
            <div className="flex justify-between"><span className="text-gray-400">Población</span><span>{(comunasData[selectedComuna].poblacion / 1000).toFixed(0)}K</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Predial</span><span className="text-ochre">${(comunasData[selectedComuna].predial / 1000).toFixed(1)}M</span></div>
            <div className="flex justify-between"><span className="text-gray-400">ICA</span><span className="text-ochre">${(comunasData[selectedComuna].ica / 1000).toFixed(1)}M</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Estrato</span><span>~{comunasData[selectedComuna].estrato}</span></div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
