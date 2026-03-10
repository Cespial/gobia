"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface ColombiaMapboxProps {
  animate?: boolean;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Simulated data per department
const deptData: Record<string, { sistemas: number; poblacion: string }> = {
  Antioquia: { sistemas: 11, poblacion: "6.9M" },
  Cundinamarca: { sistemas: 9, poblacion: "3.2M" },
  "Valle del Cauca": { sistemas: 10, poblacion: "4.8M" },
  "Atlántico": { sistemas: 8, poblacion: "2.7M" },
  "Bolívar": { sistemas: 7, poblacion: "2.2M" },
  Santander: { sistemas: 9, poblacion: "2.3M" },
  "Córdoba": { sistemas: 6, poblacion: "1.9M" },
  "Boyacá": { sistemas: 8, poblacion: "1.3M" },
  "Nariño": { sistemas: 7, poblacion: "1.9M" },
  Tolima: { sistemas: 8, poblacion: "1.4M" },
  Huila: { sistemas: 6, poblacion: "1.2M" },
  Meta: { sistemas: 7, poblacion: "1.1M" },
  Cesar: { sistemas: 6, poblacion: "1.3M" },
  Magdalena: { sistemas: 7, poblacion: "1.4M" },
  "Norte de Santander": { sistemas: 8, poblacion: "1.6M" },
  "La Guajira": { sistemas: 5, poblacion: "1.1M" },
  Cauca: { sistemas: 7, poblacion: "1.5M" },
  "Chocó": { sistemas: 5, poblacion: "0.5M" },
  Caldas: { sistemas: 8, poblacion: "1.0M" },
  Risaralda: { sistemas: 8, poblacion: "1.0M" },
  Sucre: { sistemas: 6, poblacion: "0.9M" },
  "Quindío": { sistemas: 7, poblacion: "0.6M" },
  "Caquetá": { sistemas: 5, poblacion: "0.5M" },
  Putumayo: { sistemas: 5, poblacion: "0.4M" },
  Amazonas: { sistemas: 3, poblacion: "0.08M" },
  "Arauca": { sistemas: 5, poblacion: "0.3M" },
  Casanare: { sistemas: 6, poblacion: "0.4M" },
  "Guainía": { sistemas: 3, poblacion: "0.05M" },
  "Guaviare": { sistemas: 4, poblacion: "0.1M" },
  "Vaupés": { sistemas: 3, poblacion: "0.05M" },
  Vichada: { sistemas: 3, poblacion: "0.08M" },
  "San Andrés": { sistemas: 4, poblacion: "0.08M" },
  "Bogotá": { sistemas: 12, poblacion: "7.9M" },
};

// Normalize name for lookup (handle accents/variations)
function normalizeName(name: string): string {
  const map: Record<string, string> = {
    "Archipiélago de San Andrés, Providencia y Santa Catalina": "San Andrés",
    "Bogotá, D.C.": "Bogotá",
    "Capital District": "Bogotá",
    "San Andrés y Providencia": "San Andrés",
    "Norte De Santander": "Norte de Santander",
    "Valle Del Cauca": "Valle del Cauca",
  };
  return map[name] || name;
}

function getDeptInfo(name: string) {
  const normalized = normalizeName(name);
  return deptData[normalized] || { sistemas: Math.floor(Math.random() * 7) + 4, poblacion: "N/D" };
}

export default function ColombiaMapbox({ animate = true }: ColombiaMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loaded, setLoaded] = useState(false);

  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: "Gobia Mono",
        sources: {},
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#F8F8F6" },
          },
        ],
      },
      center: [-73.5, 4.5],
      zoom: 4.8,
      minZoom: 4,
      maxZoom: 7,
      maxBounds: [[-82, -5], [-66, 14]],
      attributionControl: false,
      interactive: true,
      dragRotate: false,
      pitchWithRotate: false,
      touchZoomRotate: true,
    });

    map.current.scrollZoom.disable();

    popup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "220px",
      offset: 12,
    });

    map.current.on("load", () => {
      const m = map.current!;

      // Add GeoJSON source with auto-generated IDs for feature-state
      m.addSource("departments", {
        type: "geojson",
        data: "/data/colombia-departments.geojson",
        generateId: true,
      });

      // Fill layer
      m.addLayer({
        id: "dept-fill",
        type: "fill",
        source: "departments",
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#B8956A",
            "#E5E5E5",
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.7,
            ["boolean", ["feature-state", "visible"], false],
            0.6,
            0,
          ],
        },
      });

      // Border layer
      m.addLayer({
        id: "dept-border",
        type: "line",
        source: "departments",
        paint: {
          "line-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#B8956A",
            "#D4D4D4",
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            2,
            ["boolean", ["feature-state", "visible"], false],
            0.8,
            0,
          ],
        },
      });

      // Hover interactions
      let hoveredId: string | number | null = null;

      m.on("mousemove", "dept-fill", (e) => {
        if (!e.features || e.features.length === 0) return;
        m.getCanvas().style.cursor = "pointer";

        const feature = e.features[0];
        const fid = feature.id;

        if (hoveredId !== null && hoveredId !== fid) {
          m.setFeatureState({ source: "departments", id: hoveredId }, { hover: false });
        }

        if (fid !== undefined) {
          hoveredId = fid;
          m.setFeatureState({ source: "departments", id: fid }, { hover: true });
        }

        const name = normalizeName(feature.properties?.shapeName || "");
        const info = getDeptInfo(name);

        popup.current!
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;padding:2px 0">
              <div style="font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:4px">${name}</div>
              <div style="font-size:11px;color:#737373;line-height:1.5">
                <span style="color:#B8956A;font-weight:600">${info.sistemas}</span> sistemas desconectados<br/>
                Población: ${info.poblacion}
              </div>
            </div>`
          )
          .addTo(m);
      });

      m.on("mouseleave", "dept-fill", () => {
        m.getCanvas().style.cursor = "";
        if (hoveredId !== null) {
          m.setFeatureState({ source: "departments", id: hoveredId }, { hover: false });
          hoveredId = null;
        }
        popup.current!.remove();
      });

      // Sequential reveal animation
      let revealIndex = 0;
      const totalFeatures = 33;
      revealIntervalRef.current = setInterval(() => {
        if (revealIndex >= totalFeatures) {
          clearInterval(revealIntervalRef.current!);
          revealIntervalRef.current = null;
          return;
        }
        m.setFeatureState(
          { source: "departments", id: revealIndex },
          { visible: true }
        );
        revealIndex++;
      }, 60);

      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (animate) {
      initMap();
    }
    return () => {
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [animate, initMap]);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div
        ref={mapContainer}
        className={`w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {/* Map attribution */}
      <p className="text-[0.625rem] text-gray-400 text-center mt-2">
        Datos: geoBoundaries · Mapbox
      </p>
    </div>
  );
}
