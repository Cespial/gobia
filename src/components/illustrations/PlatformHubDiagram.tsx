"use client";

import { motion } from "framer-motion";

const modules = [
  { label: "Dashboard", angle: -90 },
  { label: "PDM", angle: -30 },
  { label: "Estatuto IA", angle: 30 },
  { label: "Exógena", angle: 90 },
  { label: "Gemelo", angle: 150 },
  { label: "Rendición", angle: 210 },
];

interface PlatformHubDiagramProps {
  animate?: boolean;
}

export default function PlatformHubDiagram({ animate = true }: PlatformHubDiagramProps) {
  const cx = 200;
  const cy = 190;
  const orbitR = 130;
  const nodeR = 34;
  const hubR = 40;

  const nodes = modules.map((m) => ({
    ...m,
    x: cx + orbitR * Math.cos((m.angle * Math.PI) / 180),
    y: cy + orbitR * Math.sin((m.angle * Math.PI) / 180),
  }));

  return (
    <svg
      viewBox="0 0 400 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm mx-auto"
      role="img"
      aria-label="Plataforma Gobia conectando 6 módulos de gestión pública"
    >
      {/* Orbit ring */}
      <motion.circle
        cx={cx} cy={cy} r={orbitR}
        stroke="#EDE6DA" strokeWidth={1} strokeDasharray="4 6"
        initial={animate ? { opacity: 0 } : false}
        animate={animate ? { opacity: 0.5 } : false}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      {/* Connection lines */}
      {nodes.map((node, i) => (
        <motion.line
          key={`line-${i}`}
          x1={cx} y1={cy} x2={node.x} y2={node.y}
          stroke="#DDD4C4" strokeWidth={1.2}
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={animate ? { pathLength: 1, opacity: 1 } : false}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
        />
      ))}

      {/* Center hub */}
      <motion.g
        initial={animate ? { scale: 0, opacity: 0 } : false}
        animate={animate ? { scale: 1, opacity: 1 } : false}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 1, 0.5, 1] as const }}
      >
        <circle cx={cx} cy={cy} r={hubR + 6} fill="#F5EDDF" opacity={0.5} />
        <circle cx={cx} cy={cy} r={hubR} fill="#F5EDDF" stroke="#B8956A" strokeWidth={1.5} />
        <text
          x={cx} y={cy + 1}
          textAnchor="middle" dominantBaseline="central"
          fill="#B8956A" fontSize={16} fontWeight={700}
          fontFamily="'DM Serif Display', serif"
        >
          Gobia
        </text>
      </motion.g>

      {/* Module nodes */}
      {nodes.map((node, i) => (
        <motion.g
          key={node.label}
          initial={animate ? { scale: 0, opacity: 0 } : false}
          animate={animate ? { scale: 1, opacity: 1 } : false}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.08, ease: [0.25, 1, 0.5, 1] as const }}
        >
          <circle cx={node.x} cy={node.y} r={nodeR} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={1} />
          <text
            x={node.x} y={node.y + 1}
            textAnchor="middle" dominantBaseline="central"
            fill="#2C2418" fontSize={10} fontWeight={600}
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            {node.label}
          </text>
        </motion.g>
      ))}

      {/* Subtle connecting dots on the orbit */}
      {nodes.map((node, i) => {
        const dotAngle = (node.angle + (modules[(i + 1) % modules.length].angle - node.angle) / 2) * Math.PI / 180;
        const dx = cx + (orbitR + 1) * Math.cos(dotAngle);
        const dy = cy + (orbitR + 1) * Math.sin(dotAngle);
        return (
          <motion.circle
            key={`dot-${i}`}
            cx={dx} cy={dy} r={2}
            fill="#B8956A" opacity={0.3}
            initial={animate ? { opacity: 0 } : false}
            animate={animate ? { opacity: 0.3 } : false}
            transition={{ duration: 0.3, delay: 0.9 + i * 0.05 }}
          />
        );
      })}
    </svg>
  );
}
