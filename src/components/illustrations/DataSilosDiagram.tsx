"use client";

import { motion } from "framer-motion";

interface DataSilosDiagramProps {
  animate?: boolean;
}

export default function DataSilosDiagram({ animate = true }: DataSilosDiagramProps) {
  const systems = [
    { label: "CHIP", sub: "Contaduría", x: 40, y: 40 },
    { label: "SISFUT", sub: "Presupuesto", x: 160, y: 28 },
    { label: "Excel", sub: "Reportes", x: 280, y: 40 },
    { label: "SECOP", sub: "Contratos", x: 350, y: 110 },
    { label: "SIRECI", sub: "CGR", x: 290, y: 180 },
    { label: "SIA", sub: "Auditoría", x: 160, y: 195 },
    { label: "MUISCA", sub: "DIAN", x: 40, y: 175 },
  ];

  // Broken connections between adjacent systems
  const connections: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0],
    [0, 5], [1, 4], [2, 5],
  ];

  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      className="w-full max-w-xl mx-auto"
      role="img"
      aria-label="7 sistemas gubernamentales desconectados rodeando al funcionario público"
    >
      {/* Broken connection lines */}
      {connections.map(([a, b], i) => {
        const sa = systems[a];
        const sb = systems[b];
        const mx = (sa.x + sb.x) / 2;
        const my = (sa.y + sb.y) / 2;

        return (
          <motion.g
            key={`conn-${i}`}
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 0.4 } : undefined}
            transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
          >
            <line x1={sa.x} y1={sa.y} x2={mx - 4} y2={my - 2} stroke="#DDD4C4" strokeWidth={0.8} strokeDasharray="4 4" />
            <line x1={mx + 4} y1={my + 2} x2={sb.x} y2={sb.y} stroke="#DDD4C4" strokeWidth={0.8} strokeDasharray="4 4" />
            {/* X mark at midpoint */}
            <line x1={mx - 3} y1={my - 3} x2={mx + 3} y2={my + 3} stroke="#E53935" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
            <line x1={mx + 3} y1={my - 3} x2={mx - 3} y2={my + 3} stroke="#E53935" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
          </motion.g>
        );
      })}

      {/* Central "funcionario" */}
      <motion.g
        initial={animate ? { scale: 0, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        style={{ transformOrigin: "195px 112px" }}
      >
        {/* Frustration glow */}
        <circle cx={195} cy={112} r={40} fill="#FDECEA" opacity={0.3} />
        <circle cx={195} cy={112} r={28} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={1} />

        {/* Person silhouette */}
        <circle cx={195} cy={102} r={7} fill="#9E9484" />
        <path d="M 183 120 Q 183 110 195 110 Q 207 110 207 120" fill="#9E9484" />

        {/* Question marks floating */}
        <motion.text
          x={210} y={98}
          fill="#E53935"
          fontSize={10}
          fontWeight={700}
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: [0, 0.8, 0] } : undefined}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          ?
        </motion.text>
        <motion.text
          x={178} y={96}
          fill="#E53935"
          fontSize={8}
          fontWeight={700}
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: [0, 0.6, 0] } : undefined}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        >
          ?
        </motion.text>
      </motion.g>

      {/* System nodes */}
      {systems.map((sys, i) => (
        <motion.g
          key={sys.label}
          initial={animate ? { scale: 0, opacity: 0 } : undefined}
          animate={animate ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.07, type: "spring" }}
          style={{ transformOrigin: `${sys.x}px ${sys.y}px` }}
        >
          {/* Node */}
          <rect x={sys.x - 30} y={sys.y - 16} width={60} height={32} rx={6} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.8} />

          {/* Label */}
          <text x={sys.x} y={sys.y - 2} textAnchor="middle" fill="#2C2418" fontSize={8} fontWeight={700} fontFamily="'Plus Jakarta Sans', sans-serif">
            {sys.label}
          </text>
          <text x={sys.x} y={sys.y + 9} textAnchor="middle" fill="#9E9484" fontSize={6} fontFamily="'Plus Jakarta Sans', sans-serif">
            {sys.sub}
          </text>
        </motion.g>
      ))}

      {/* Bottom pain metrics */}
      <motion.g
        initial={animate ? { opacity: 0, y: 10 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: 1 }}
      >
        {[
          { value: "7+", label: "sistemas", x: 80 },
          { value: "0", label: "conexiones", x: 200 },
          { value: "∞", label: "frustración", x: 320 },
        ].map((metric) => (
          <g key={metric.label}>
            <text x={metric.x} y={226} textAnchor="middle" fill="#B8956A" fontSize={13} fontWeight={700} fontFamily="'DM Serif Display', serif">
              {metric.value}
            </text>
            <text x={metric.x} y={238} textAnchor="middle" fill="#9E9484" fontSize={7.5} fontWeight={500} fontFamily="'Plus Jakarta Sans', sans-serif">
              {metric.label}
            </text>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}
