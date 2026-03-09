"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Layers, MapPin, Building2, Users, Briefcase, BarChart3 } from "lucide-react";
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

// Corregimiento IDs to exclude from choropleth data (sector != 6 keeps comunas only)
const CORREGIMIENTO_IDS = ["50", "60", "70", "80", "90"];

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

export default function GemeloMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layers, setLayers] = useState<DataLayer[]>([
    { id: "fiscal", label: "Recaudo Fiscal", icon: BarChart3, color: "#B8956A", active: true },
    { id: "poblacion", label: "Población", icon: Users, color: "#5B7BA5", active: false },
    { id: "estrato", label: "Estratificación", icon: Building2, color: "#6B8E4E", active: false },
    { id: "contratos", label: "Contratos SECOP", icon: Briefcase, color: "#7B6BA5", active: false },
  ]);

  const activeLayer = layers.find((l) => l.active)?.id || "fiscal";

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
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // Load comunas GeoJSON
      fetch("/data/comunas-medellin.geojson")
        .then((res) => { if (!res.ok) throw new Error("GeoJSON load failed"); return res.json(); })
        .then((geojson) => {
          map.addSource("comunas", {
            type: "geojson",
            data: geojson,
          });

          // Choropleth fill layer
          map.addLayer({
            id: "comunas-fill",
            type: "fill",
            source: "comunas",
            paint: {
              "fill-color": "#B8956A",
              "fill-opacity": 0.5,
            },
          });

          // Border lines
          map.addLayer({
            id: "comunas-border",
            type: "line",
            source: "comunas",
            paint: {
              "line-color": "#FFFDF8",
              "line-width": 1.5,
              "line-opacity": 0.9,
            },
          });

          // Hover highlight
          map.addLayer({
            id: "comunas-highlight",
            type: "line",
            source: "comunas",
            paint: {
              "line-color": "#2C2418",
              "line-width": 2.5,
              "line-opacity": 0,
            },
          });

          setMapLoaded(true);
        })
        .catch(() => { /* GeoJSON failed — map remains base layer only */ });
    });

    // Hover interaction
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
    });
    popupRef.current = popup;

    map.on("mousemove", "comunas-fill", (e) => {
      if (!e.features || e.features.length === 0) return;
      map.getCanvas().style.cursor = "pointer";
      const feat = e.features[0];
      const id = feat.properties?.id;
      const c = comunasData[id];
      if (!c) return;

      // Highlight
      map.setPaintProperty("comunas-highlight", "line-opacity", [
        "case",
        ["==", ["get", "id"], id],
        1,
        0,
      ]);

      const coords = e.lngLat;
      popup
        .setLngLat(coords)
        .setHTML(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px 0;">
            <strong style="font-size:13px;color:#2C2418;">${c.nombre}</strong><br/>
            <span style="font-size:11px;color:#9E9484;">
              Población: ${(c.poblacion / 1000).toFixed(0)}K · Estrato ~${c.estrato}<br/>
              Predial: $${(c.predial / 1000).toFixed(1)}M · ICA: $${(c.ica / 1000).toFixed(1)}M
            </span>
          </div>`
        )
        .addTo(map);
    });

    map.on("mouseleave", "comunas-fill", () => {
      map.getCanvas().style.cursor = "";
      map.setPaintProperty("comunas-highlight", "line-opacity", 0);
      popup.remove();
    });

    mapRef.current = map;

    return () => {
      popup.remove();
      map.remove();
    };
  }, []);

  // Update choropleth colors when layer changes
  const updateChoropleth = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const [lowColor, highColor] = getLayerColorScale(activeLayer);

    // Get min/max values for normalization
    const ids = Object.keys(comunasData);
    const values = ids.map((id) => getComunaValue(id, activeLayer));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    // Build data-driven color expression
    const colorExpr: mapboxgl.Expression = [
      "match",
      ["get", "id"],
      ...ids.flatMap((id) => {
        const t = (getComunaValue(id, activeLayer) - minVal) / range;
        return [id, interpolateColor(lowColor, highColor, t)];
      }),
      "#DDD4C4", // default for corregimientos
    ];

    map.setPaintProperty("comunas-fill", "fill-color", colorExpr);
  }, [activeLayer, mapLoaded]);

  useEffect(() => {
    updateChoropleth();
  }, [updateChoropleth]);

  const toggleLayer = (id: string) => {
    setLayers((prev) => prev.map((l) => ({ ...l, active: l.id === id })));
  };

  // Sort comunas for top 3
  const sortedComunas = Object.entries(comunasData)
    .map(([id, c]) => ({ id, ...c, value: getComunaValue(id, activeLayer) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-paper shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-ink text-paper">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-ochre" />
          <h3 className="text-sm font-semibold">Gemelo Municipal — Medellín</h3>
        </div>
        <span className="text-[0.6875rem] text-gray-400">16 comunas + 5 corregimientos · GeoJSON</span>
      </div>

      {/* Map */}
      <div className="relative">
        <div ref={mapContainer} className="w-full h-[480px] md:h-[560px]" />

        {/* Layer controls */}
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-paper/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-2 space-y-1">
            <div className="text-[0.5625rem] font-semibold uppercase tracking-wider text-gray-400 px-2 pb-1">
              <Layers size={10} className="inline mr-1" />
              Capas de datos
            </div>
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 ${
                  layer.active
                    ? "bg-ochre-soft text-ochre"
                    : "text-gray-400 hover:bg-cream hover:text-ink"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: layer.color, opacity: layer.active ? 1 : 0.4 }} />
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color legend */}
        <div className="absolute bottom-16 left-3 z-10">
          <div className="bg-paper/95 backdrop-blur-sm rounded-lg border border-border shadow-lg px-3 py-2">
            <div className="text-[0.5625rem] text-gray-400 mb-1">
              {activeLayer === "fiscal" ? "Recaudo (millones)" :
               activeLayer === "poblacion" ? "Habitantes (miles)" :
               activeLayer === "estrato" ? "Estrato promedio" : "N° contratos"}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[0.5625rem] text-gray-400">Bajo</span>
              <div className="w-24 h-2 rounded-full" style={{
                background: `linear-gradient(to right, ${getLayerColorScale(activeLayer)[0]}, ${getLayerColorScale(activeLayer)[1]})`,
              }} />
              <span className="text-[0.5625rem] text-gray-400">Alto</span>
            </div>
          </div>
        </div>

        {/* Stats overlay */}
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
              <div key={c.nombre} className="flex items-center gap-2 py-0.5">
                <span className="text-[0.625rem] font-bold text-ochre w-4">{i + 1}.</span>
                <span className="text-[0.6875rem] text-ink flex-1">{c.nombre}</span>
                <span className="text-[0.625rem] text-gray-400">
                  {activeLayer === "fiscal" ? `$${(c.value / 1000).toFixed(0)}M` :
                   activeLayer === "poblacion" ? `${(c.value / 1000).toFixed(0)}K` :
                   activeLayer === "estrato" ? `E${c.value.toFixed(1)}` :
                   `${c.value}`}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
