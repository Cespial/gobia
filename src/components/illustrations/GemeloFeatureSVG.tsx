"use client";

import { motion } from "framer-motion";

interface Props {
  animate?: boolean;
  delay?: number;
}

export default function GemeloFeatureSVG({ animate = true, delay = 0 }: Props) {
  // Simplified municipality contour (abstract polygon)
  const municipalityPath = "M 70,45 L 95,35 L 120,40 L 135,55 L 130,80 L 140,105 L 135,130 L 115,145 L 90,150 L 65,140 L 50,120 L 45,95 L 50,70 L 60,55 Z";

  // Data points on the map
  const dataPoints = [
    { x: 85, y: 60, type: "fiscal", label: "Hacienda" },
    { x: 110, y: 75, type: "social", label: "Hospital" },
    { x: 75, y: 95, type: "infra", label: "Vía" },
    { x: 100, y: 110, type: "social", label: "Colegio" },
    { x: 120, y: 130, type: "fiscal", label: "SECOP" },
    { x: 65, y: 125, type: "infra", label: "Puente" },
    { x: 95, y: 85, type: "center", label: "Centro" },
  ];

  const typeColors: Record<string, string> = {
    fiscal: "#B8956A",
    social: "#4CAF50",
    infra: "#7D7365",
    center: "#2C2418",
  };

  return (
    <svg viewBox="0 0 280 200" fill="none" className="w-full h-auto" role="img" aria-label="Gemelo digital municipal con datos georreferenciados">
      {/* Background card */}
      <rect x={0} y={0} width={280} height={200} rx={12} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.8} />

      {/* Map area */}
      <rect x={8} y={8} width={170} height={184} rx={8} fill="#FAF6F0" stroke="#EDE6DA" strokeWidth={0.5} />

      {/* Grid lines (subtle cartographic grid) */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={`grid-${i}`}>
          <line x1={8} y1={38 + i * 26} x2={178} y2={38 + i * 26} stroke="#EDE6DA" strokeWidth={0.3} />
          <line x1={38 + i * 26} y1={8} x2={38 + i * 26} y2={192} stroke="#EDE6DA" strokeWidth={0.3} />
        </g>
      ))}

      {/* Municipality outline */}
      <motion.path
        d={municipalityPath}
        fill="#F5EDDF"
        stroke="#B8956A"
        strokeWidth={1.2}
        initial={animate ? { pathLength: 0, fillOpacity: 0 } : undefined}
        animate={animate ? { pathLength: 1, fillOpacity: 0.5 } : undefined}
        transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
      />

      {/* Internal zones (subtle divisions) */}
      <motion.path
        d="M 80,50 L 100,85 L 70,110"
        stroke="#DDD4C4"
        strokeWidth={0.5}
        strokeDasharray="3 3"
        fill="none"
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 0.6 } : undefined}
        transition={{ duration: 0.5, delay: delay + 0.8 }}
      />
      <motion.path
        d="M 100,85 L 130,80 L 125,120"
        stroke="#DDD4C4"
        strokeWidth={0.5}
        strokeDasharray="3 3"
        fill="none"
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 0.6 } : undefined}
        transition={{ duration: 0.5, delay: delay + 0.9 }}
      />

      {/* Data points with pulse animation */}
      {dataPoints.map((point, i) => {
        const color = typeColors[point.type];
        const isCenter = point.type === "center";
        return (
          <motion.g
            key={point.label}
            initial={animate ? { scale: 0, opacity: 0 } : undefined}
            animate={animate ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.4, delay: delay + 0.8 + i * 0.1, type: "spring" }}
            style={{ transformOrigin: `${point.x}px ${point.y}px` }}
          >
            {/* Pulse ring for center */}
            {isCenter && (
              <circle cx={point.x} cy={point.y} r={12} fill="none" stroke={color} strokeWidth={0.5} opacity={0.3}>
                <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={point.x} cy={point.y} r={isCenter ? 5 : 3.5} fill={color} />
            <circle cx={point.x} cy={point.y} r={isCenter ? 5 : 3.5} fill="none" stroke="#FFFDF8" strokeWidth={0.8} />
          </motion.g>
        );
      })}

      {/* Data panel - right side */}
      <motion.g
        initial={animate ? { opacity: 0, x: 10 } : undefined}
        animate={animate ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.5, delay: delay + 0.4 }}
      >
        <rect x={186} y={8} width={86} height={184} rx={8} fill="#FAF6F0" stroke="#EDE6DA" strokeWidth={0.5} />

        <text x={196} y={26} fill="#7D7365" fontSize={5} fontWeight={700} fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.05em">
          CAPAS DE DATOS
        </text>

        {/* Data layers */}
        {[
          { icon: "📊", label: "Fiscal", color: "#B8956A", active: true },
          { icon: "👥", label: "Social", color: "#4CAF50", active: true },
          { icon: "🏗", label: "Infraestructura", color: "#7D7365", active: true },
          { icon: "📋", label: "Contratos", color: "#B8956A", active: false },
          { icon: "🏠", label: "Catastro", color: "#9E9484", active: false },
        ].map((layer, i) => (
          <motion.g
            key={layer.label}
            initial={animate ? { opacity: 0, x: 5 } : undefined}
            animate={animate ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.3, delay: delay + 0.6 + i * 0.1 }}
          >
            <rect
              x={192}
              y={35 + i * 26}
              width={74}
              height={20}
              rx={4}
              fill={layer.active ? "#FFFDF8" : "#FAF6F0"}
              stroke={layer.active ? layer.color : "#EDE6DA"}
              strokeWidth={layer.active ? 0.8 : 0.4}
              opacity={layer.active ? 1 : 0.5}
            />
            {/* Toggle circle */}
            <circle
              cx={202}
              cy={45 + i * 26}
              r={4}
              fill={layer.active ? layer.color : "#DDD4C4"}
            />
            {layer.active && (
              <path
                d={`M ${200} ${45 + i * 26} L ${201.5} ${46.5 + i * 26} L ${204} ${43.5 + i * 26}`}
                stroke="#FFFDF8"
                strokeWidth={1}
                strokeLinecap="round"
                fill="none"
              />
            )}
            <text
              x={212}
              y={48 + i * 26}
              fill={layer.active ? "#4A4237" : "#9E9484"}
              fontSize={5.5}
              fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              {layer.label}
            </text>
          </motion.g>
        ))}

        {/* Mini stats */}
        <motion.g
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 0.4, delay: delay + 1.2 }}
        >
          <line x1={192} y1={168} x2={260} y2={168} stroke="#EDE6DA" strokeWidth={0.5} />
          <text x={196} y={180} fill="#9E9484" fontSize={4.5} fontFamily="'Plus Jakarta Sans', sans-serif">
            128,120 hab.
          </text>
          <text x={196} y={188} fill="#9E9484" fontSize={4.5} fontFamily="'Plus Jakarta Sans', sans-serif">
            Cat. 1 · Antioquia
          </text>
        </motion.g>
      </motion.g>
    </svg>
  );
}
