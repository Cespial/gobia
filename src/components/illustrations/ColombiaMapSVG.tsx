"use client";

import { motion } from "framer-motion";
import { useState, useCallback, useRef } from "react";

interface ColombiaMapSVGProps {
  animate?: boolean;
}

interface DepartmentData {
  id: string;
  name: string;
  disconnected: number;
  path: string;
}

// Simplified approximate SVG paths for Colombian departments
// ViewBox: 0 0 300 400 — portrait orientation matching Colombia's shape
const departments: DepartmentData[] = [
  {
    id: "guajira",
    name: "La Guajira",
    disconnected: 8,
    path: "M205,12 L230,5 L255,10 L265,30 L255,50 L240,65 L225,60 L215,50 L210,35 Z",
  },
  {
    id: "atlantico",
    name: "Atlántico",
    disconnected: 7,
    path: "M155,55 L170,48 L180,52 L182,62 L175,70 L162,72 L155,65 Z",
  },
  {
    id: "magdalena",
    name: "Magdalena",
    disconnected: 9,
    path: "M180,42 L205,35 L225,60 L215,80 L200,90 L185,85 L175,70 L182,55 Z",
  },
  {
    id: "cesar",
    name: "Cesar",
    disconnected: 10,
    path: "M200,65 L225,60 L240,65 L238,90 L225,110 L210,115 L195,105 L190,85 Z",
  },
  {
    id: "norte-santander",
    name: "Norte de Santander",
    disconnected: 11,
    path: "M225,110 L248,95 L265,105 L260,130 L245,145 L230,140 L218,130 L215,118 Z",
  },
  {
    id: "bolivar",
    name: "Bolívar",
    disconnected: 6,
    path: "M140,65 L162,72 L175,70 L185,85 L190,105 L182,125 L170,140 L155,150 L140,145 L130,125 L128,105 L130,85 Z",
  },
  {
    id: "sucre",
    name: "Sucre",
    disconnected: 9,
    path: "M120,60 L140,55 L155,55 L155,65 L140,65 L130,85 L118,80 L115,70 Z",
  },
  {
    id: "cordoba",
    name: "Córdoba",
    disconnected: 12,
    path: "M95,65 L115,58 L120,60 L118,80 L130,85 L128,105 L120,115 L108,120 L95,115 L85,100 L82,80 Z",
  },
  {
    id: "santander",
    name: "Santander",
    disconnected: 8,
    path: "M190,105 L210,115 L218,130 L215,150 L200,165 L185,162 L170,150 L170,140 L182,125 Z",
  },
  {
    id: "antioquia",
    name: "Antioquia",
    disconnected: 5,
    path: "M85,100 L95,115 L108,120 L120,115 L128,105 L140,120 L150,140 L155,150 L148,168 L135,178 L120,175 L105,165 L90,148 L78,130 L75,112 Z",
  },
  {
    id: "boyaca",
    name: "Boyacá",
    disconnected: 7,
    path: "M185,155 L200,165 L215,150 L225,160 L228,180 L218,198 L200,200 L188,195 L178,180 L175,165 Z",
  },
  {
    id: "arauca",
    name: "Arauca",
    disconnected: 11,
    path: "M230,140 L255,135 L275,145 L272,165 L255,170 L238,168 L228,155 Z",
  },
  {
    id: "caldas",
    name: "Caldas",
    disconnected: 6,
    path: "M105,168 L120,175 L130,185 L128,198 L118,205 L105,200 L98,188 Z",
  },
  {
    id: "risaralda",
    name: "Risaralda",
    disconnected: 7,
    path: "M88,170 L105,168 L105,185 L98,192 L85,188 L82,178 Z",
  },
  {
    id: "cundinamarca",
    name: "Cundinamarca",
    disconnected: 5,
    path: "M135,185 L155,175 L175,180 L188,195 L185,215 L170,228 L155,230 L140,225 L130,212 L128,198 Z",
  },
  {
    id: "tolima",
    name: "Tolima",
    disconnected: 8,
    path: "M105,200 L118,205 L128,198 L140,225 L142,248 L135,265 L120,268 L108,255 L100,235 L98,215 Z",
  },
  {
    id: "valle",
    name: "Valle del Cauca",
    disconnected: 6,
    path: "M62,195 L78,188 L88,195 L95,210 L100,235 L92,252 L78,258 L65,248 L55,228 L55,210 Z",
  },
  {
    id: "choco",
    name: "Chocó",
    disconnected: 12,
    path: "M42,120 L58,115 L72,120 L78,135 L82,155 L80,175 L72,195 L62,200 L48,195 L38,175 L30,155 L32,135 Z",
  },
  {
    id: "meta",
    name: "Meta",
    disconnected: 10,
    path: "M188,195 L218,198 L245,205 L265,220 L260,248 L240,260 L210,262 L185,255 L170,240 L170,228 L185,215 Z",
  },
  {
    id: "casanare",
    name: "Casanare",
    disconnected: 11,
    path: "M228,180 L255,170 L272,178 L275,200 L260,215 L245,205 L218,198 Z",
  },
  {
    id: "huila",
    name: "Huila",
    disconnected: 9,
    path: "M120,268 L135,265 L142,248 L155,255 L158,275 L152,298 L138,308 L125,305 L115,290 Z",
  },
  {
    id: "cauca",
    name: "Cauca",
    disconnected: 10,
    path: "M65,248 L78,258 L92,252 L108,262 L115,280 L115,305 L105,318 L90,325 L75,318 L60,298 L52,275 L55,258 Z",
  },
  {
    id: "narino",
    name: "Nariño",
    disconnected: 11,
    path: "M45,310 L60,298 L75,318 L90,325 L88,345 L78,360 L62,368 L48,362 L35,345 L35,325 Z",
  },
  {
    id: "putumayo",
    name: "Putumayo",
    disconnected: 12,
    path: "M88,345 L105,335 L125,330 L140,340 L145,358 L132,372 L115,378 L98,372 L88,360 Z",
  },
  {
    id: "caqueta",
    name: "Caquetá",
    disconnected: 10,
    path: "M125,305 L138,308 L155,300 L175,305 L195,298 L200,318 L192,340 L170,350 L145,358 L132,350 L125,330 L118,318 Z",
  },
  {
    id: "amazonas",
    name: "Amazonas",
    disconnected: 12,
    path: "M145,358 L170,350 L200,355 L218,365 L225,388 L210,400 L178,400 L150,395 L132,385 L132,372 Z",
  },
  {
    id: "vaupes",
    name: "Vaupés",
    disconnected: 12,
    path: "M200,318 L225,310 L248,320 L252,342 L240,358 L218,365 L200,355 L192,340 Z",
  },
  {
    id: "guainia",
    name: "Guainía",
    disconnected: 12,
    path: "M265,260 L285,255 L298,270 L295,300 L280,315 L260,318 L248,305 L250,280 Z",
  },
  {
    id: "vichada",
    name: "Vichada",
    disconnected: 12,
    path: "M260,215 L275,200 L295,210 L298,235 L295,260 L280,270 L260,265 L248,255 L245,235 Z",
  },
  {
    id: "guaviare",
    name: "Guaviare",
    disconnected: 11,
    path: "M210,262 L240,260 L260,270 L255,295 L240,310 L225,310 L200,305 L195,285 Z",
  },
];

export default function ColombiaMapSVG({ animate = true }: ColombiaMapSVGProps) {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGPathElement>) => {
      if (!svgRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;
      setTooltipPos({ x, y });
    },
    []
  );

  const hoveredData = departments.find((d) => d.id === hoveredDept);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 300 400"
        fill="none"
        className="w-full h-auto"
        role="img"
        aria-label="Mapa interactivo de Colombia mostrando departamentos con sistemas desconectados"
      >
        {departments.map((dept, i) => (
          <motion.path
            key={dept.id}
            d={dept.path}
            initial={animate ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
            animate={animate ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.4,
              delay: 0.1 + i * 0.04,
              ease: "easeOut",
            }}
            style={{
              transformOrigin: "center",
              cursor: "pointer",
            }}
            fill={hoveredDept === dept.id ? "#B8956A" : "#E5E5E5"}
            stroke="#FFFDF8"
            strokeWidth={1}
            className="transition-colors duration-300 ease-in-out"
            onMouseEnter={() => setHoveredDept(dept.id)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredDept(null)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredDept && hoveredData && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-border bg-paper px-3 py-2 shadow-md"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 40,
            transform:
              tooltipPos.x > 200 ? "translateX(-110%)" : "translateX(0)",
          }}
        >
          <p className="text-[0.8125rem] font-semibold text-ink leading-tight">
            {hoveredData.name}
          </p>
          <p className="text-[0.75rem] text-sepia leading-tight mt-0.5">
            {hoveredData.disconnected} sistemas desconectados
          </p>
        </div>
      )}
    </div>
  );
}
