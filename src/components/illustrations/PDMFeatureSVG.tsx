"use client";

import { motion } from "framer-motion";

interface Props {
  animate?: boolean;
  delay?: number;
}

const nodes = [
  // Root
  { id: "pdm", x: 140, y: 20, label: "PDM 2024-27", type: "root" as const },
  // Level 1 - Lines
  { id: "l1", x: 56, y: 62, label: "Social", type: "line" as const },
  { id: "l2", x: 140, y: 62, label: "Económico", type: "line" as const },
  { id: "l3", x: 224, y: 62, label: "Territorial", type: "line" as const },
  // Level 2 - Programs
  { id: "p1", x: 28, y: 108, label: "Educación", type: "program" as const, status: "green" as const },
  { id: "p2", x: 84, y: 108, label: "Salud", type: "program" as const, status: "green" as const },
  { id: "p3", x: 140, y: 108, label: "Empleo", type: "program" as const, status: "yellow" as const },
  { id: "p4", x: 196, y: 108, label: "Vías", type: "program" as const, status: "red" as const },
  { id: "p5", x: 252, y: 108, label: "Ambiente", type: "program" as const, status: "green" as const },
  // Level 3 - Goals (dots only)
  { id: "g1", x: 16, y: 148, label: "", type: "goal" as const, status: "green" as const },
  { id: "g2", x: 40, y: 148, label: "", type: "goal" as const, status: "green" as const },
  { id: "g3", x: 72, y: 148, label: "", type: "goal" as const, status: "green" as const },
  { id: "g4", x: 96, y: 148, label: "", type: "goal" as const, status: "yellow" as const },
  { id: "g5", x: 128, y: 148, label: "", type: "goal" as const, status: "yellow" as const },
  { id: "g6", x: 152, y: 148, label: "", type: "goal" as const, status: "red" as const },
  { id: "g7", x: 184, y: 148, label: "", type: "goal" as const, status: "red" as const },
  { id: "g8", x: 208, y: 148, label: "", type: "goal" as const, status: "yellow" as const },
  { id: "g9", x: 240, y: 148, label: "", type: "goal" as const, status: "green" as const },
  { id: "g10", x: 264, y: 148, label: "", type: "goal" as const, status: "green" as const },
];

const edges: [string, string][] = [
  ["pdm", "l1"], ["pdm", "l2"], ["pdm", "l3"],
  ["l1", "p1"], ["l1", "p2"],
  ["l2", "p3"],
  ["l3", "p4"], ["l3", "p5"],
  ["p1", "g1"], ["p1", "g2"],
  ["p2", "g3"], ["p2", "g4"],
  ["p3", "g5"], ["p3", "g6"],
  ["p4", "g7"], ["p4", "g8"],
  ["p5", "g9"], ["p5", "g10"],
];

const statusColors = {
  green: "#4CAF50",
  yellow: "#FFC107",
  red: "#E53935",
};

export default function PDMFeatureSVG({ animate = true, delay = 0 }: Props) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 280 200" fill="none" className="w-full h-auto" role="img" aria-label="Árbol de seguimiento del Plan de Desarrollo Municipal">
      {/* Background */}
      <rect x={0} y={0} width={280} height={200} rx={12} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.8} />

      {/* Edges */}
      {edges.map(([srcId, tgtId], i) => {
        const src = nodeMap.get(srcId)!;
        const tgt = nodeMap.get(tgtId)!;
        return (
          <motion.line
            key={`${srcId}-${tgtId}`}
            x1={src.x} y1={src.type === "root" ? src.y + 12 : src.y + 8}
            x2={tgt.x} y2={tgt.type === "goal" ? tgt.y - 5 : tgt.y - 10}
            stroke="#DDD4C4"
            strokeWidth={0.8}
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: delay + 0.1 + i * 0.03 }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => {
        if (node.type === "root") {
          return (
            <motion.g
              key={node.id}
              initial={animate ? { scale: 0, opacity: 0 } : undefined}
              animate={animate ? { scale: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.4, delay: delay + 0.1 }}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            >
              <rect x={node.x - 36} y={node.y - 10} width={72} height={22} rx={11} fill="#2C2418" />
              <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#FAF6F0" fontSize={6.5} fontWeight={700} fontFamily="'Plus Jakarta Sans', sans-serif">
                {node.label}
              </text>
            </motion.g>
          );
        }

        if (node.type === "line") {
          return (
            <motion.g
              key={node.id}
              initial={animate ? { scale: 0, opacity: 0 } : undefined}
              animate={animate ? { scale: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.4, delay: delay + 0.25 + i * 0.05 }}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            >
              <rect x={node.x - 30} y={node.y - 10} width={60} height={20} rx={10} fill="#F5EDDF" stroke="#B8956A" strokeWidth={0.8} />
              <text x={node.x} y={node.y + 3} textAnchor="middle" fill="#8B7355" fontSize={6} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
                {node.label}
              </text>
            </motion.g>
          );
        }

        if (node.type === "program") {
          const color = statusColors[node.status!];
          return (
            <motion.g
              key={node.id}
              initial={animate ? { scale: 0, opacity: 0 } : undefined}
              animate={animate ? { scale: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.4, delay: delay + 0.4 + i * 0.04 }}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            >
              <rect x={node.x - 26} y={node.y - 10} width={52} height={20} rx={4} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.6} />
              <circle cx={node.x - 16} cy={node.y} r={3} fill={color} />
              <text x={node.x + 4} y={node.y + 3} textAnchor="middle" fill="#615849" fontSize={5.5} fontWeight={500} fontFamily="'Plus Jakarta Sans', sans-serif">
                {node.label}
              </text>
            </motion.g>
          );
        }

        // Goal dots
        const color = statusColors[node.status!];
        return (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={4}
            fill={color}
            initial={animate ? { scale: 0, opacity: 0 } : undefined}
            animate={animate ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: delay + 0.6 + i * 0.03 }}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          />
        );
      })}

      {/* Legend */}
      <motion.g
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: 0.5, delay: delay + 1 }}
      >
        <rect x={14} y={168} width={252} height={22} rx={6} fill="#FAF6F0" stroke="#EDE6DA" strokeWidth={0.5} />
        {[
          { color: "#4CAF50", label: "≥80% On track", x: 30 },
          { color: "#FFC107", label: "50-79% Atención", x: 110 },
          { color: "#E53935", label: "<50% Crítico", x: 195 },
        ].map((item) => (
          <g key={item.label}>
            <circle cx={item.x} cy={179} r={3} fill={item.color} />
            <text x={item.x + 8} y={181.5} fill="#7D7365" fontSize={5.5} fontFamily="'Plus Jakarta Sans', sans-serif">
              {item.label}
            </text>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}
