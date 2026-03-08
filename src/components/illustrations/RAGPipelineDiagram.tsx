"use client";

import { motion } from "framer-motion";

const stages = [
  {
    label: "Consulta",
    sub: "Lenguaje natural",
    icon: "chat",
  },
  {
    label: "Búsqueda",
    sub: "Semántica vectorial",
    icon: "search",
  },
  {
    label: "Grafo",
    sub: "Navegación normativa",
    icon: "graph",
  },
  {
    label: "Respuesta",
    sub: "Con citación legal",
    icon: "doc",
  },
];

function StageIcon({ type, cx, cy }: { type: string; cx: number; cy: number }) {
  const stroke = "#B8956A";
  const sw = 1.3;

  switch (type) {
    case "chat":
      return (
        <g>
          <path
            d={`M ${cx - 10} ${cy - 8} h 20 a 3 3 0 0 1 3 3 v 10 a 3 3 0 0 1 -3 3 h -14 l -6 5 v -5 a 3 3 0 0 1 -3 -3 v -10 a 3 3 0 0 1 3 -3 z`}
            stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round"
          />
          <line x1={cx - 6} y1={cy - 2} x2={cx + 6} y2={cy - 2} stroke={stroke} strokeWidth={0.9} />
          <line x1={cx - 6} y1={cy + 3} x2={cx + 2} y2={cy + 3} stroke={stroke} strokeWidth={0.9} />
        </g>
      );
    case "search":
      return (
        <g>
          <circle cx={cx - 2} cy={cy - 2} r={8} stroke={stroke} strokeWidth={sw} fill="none" />
          <line x1={cx + 4} y1={cy + 4} x2={cx + 10} y2={cy + 10} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <circle cx={cx - 2} cy={cy - 2} r={3} stroke={stroke} strokeWidth={0.7} fill="none" strokeDasharray="2 2" />
        </g>
      );
    case "graph":
      return (
        <g>
          {/* Three connected nodes */}
          <circle cx={cx} cy={cy - 8} r={3.5} stroke={stroke} strokeWidth={sw} fill="#F5EDDF" />
          <circle cx={cx - 9} cy={cy + 6} r={3.5} stroke={stroke} strokeWidth={sw} fill="#F5EDDF" />
          <circle cx={cx + 9} cy={cy + 6} r={3.5} stroke={stroke} strokeWidth={sw} fill="#F5EDDF" />
          {/* Edges */}
          <line x1={cx} y1={cy - 4} x2={cx - 7} y2={cy + 3} stroke={stroke} strokeWidth={0.9} />
          <line x1={cx} y1={cy - 4} x2={cx + 7} y2={cy + 3} stroke={stroke} strokeWidth={0.9} />
          <line x1={cx - 6} y1={cy + 6} x2={cx + 6} y2={cy + 6} stroke={stroke} strokeWidth={0.9} />
        </g>
      );
    case "doc":
      return (
        <g>
          <rect x={cx - 9} y={cy - 11} width={18} height={22} rx={2} stroke={stroke} strokeWidth={sw} fill="none" />
          <line x1={cx - 5} y1={cy - 4} x2={cx + 5} y2={cy - 4} stroke={stroke} strokeWidth={0.8} />
          <line x1={cx - 5} y1={cy + 1} x2={cx + 5} y2={cy + 1} stroke={stroke} strokeWidth={0.8} />
          {/* Checkmark */}
          <path d={`M ${cx - 3} ${cy + 6} l 2 2 l 5 -5`} stroke="#B8956A" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    default:
      return null;
  }
}

interface RAGPipelineDiagramProps {
  animate?: boolean;
}

export default function RAGPipelineDiagram({ animate = true }: RAGPipelineDiagramProps) {
  const stageW = 120;
  const stageH = 100;
  const gap = 40;
  const totalW = 4 * stageW + 3 * gap;
  const arrowLen = gap;

  return (
    <svg
      viewBox={`0 0 ${totalW} 150`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-2xl mx-auto"
      role="img"
      aria-label="Pipeline RAG: Consulta, Búsqueda semántica, Grafo normativo, Respuesta con citación"
    >
      {stages.map((stage, i) => {
        const x = i * (stageW + gap);
        const centerX = x + stageW / 2;

        return (
          <motion.g
            key={stage.label}
            initial={animate ? { opacity: 0, y: 12 } : false}
            animate={animate ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.15, ease: [0.25, 1, 0.5, 1] as const }}
          >
            {/* Stage card */}
            <rect
              x={x} y={10}
              width={stageW} height={stageH}
              rx={12} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={1}
            />

            {/* Icon background */}
            <circle cx={centerX} cy={46} r={18} fill="#F5EDDF" />

            {/* Icon */}
            <StageIcon type={stage.icon} cx={centerX} cy={46} />

            {/* Label */}
            <text
              x={centerX} y={88}
              textAnchor="middle" fill="#2C2418"
              fontSize={11} fontWeight={600}
              fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              {stage.label}
            </text>

            {/* Sublabel */}
            <text
              x={centerX} y={102}
              textAnchor="middle" fill="#9E9484"
              fontSize={8} fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              {stage.sub}
            </text>
          </motion.g>
        );
      })}

      {/* Arrows between stages */}
      {[0, 1, 2].map((i) => {
        const x1 = (i + 1) * stageW + i * gap;
        const x2 = x1 + arrowLen;
        const y = 10 + stageH / 2;
        const midX = x1 + arrowLen / 2;

        return (
          <motion.g
            key={`arrow-${i}`}
            initial={animate ? { opacity: 0 } : false}
            animate={animate ? { opacity: 1 } : false}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
          >
            <line
              x1={x1 + 4} y1={y} x2={x2 - 8} y2={y}
              stroke="#BFB5A3" strokeWidth={1.2}
            />
            <path
              d={`M ${x2 - 12} ${y - 4} L ${x2 - 6} ${y} L ${x2 - 12} ${y + 4}`}
              stroke="#B8956A" strokeWidth={1.3} fill="none"
              strokeLinecap="round" strokeLinejoin="round"
            />

            {/* Animated dot traveling along the arrow */}
            <motion.circle
              r={2.5} cy={y} fill="#B8956A"
              initial={{ cx: x1 + 6, opacity: 0 }}
              animate={animate ? {
                cx: [x1 + 6, x2 - 8],
                opacity: [0, 0.8, 0.8, 0],
              } : false}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: 1 + i * 0.4,
                ease: "linear",
                repeatDelay: 1.5,
              }}
            />
          </motion.g>
        );
      })}

      {/* Step numbers */}
      {stages.map((_, i) => {
        const x = i * (stageW + gap) + 12;
        return (
          <motion.text
            key={`num-${i}`}
            x={x} y={24}
            fill="#B8956A" fontSize={9} fontWeight={700}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            opacity={0.5}
            initial={animate ? { opacity: 0 } : false}
            animate={animate ? { opacity: 0.5 } : false}
            transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
          >
            {`0${i + 1}`}
          </motion.text>
        );
      })}
    </svg>
  );
}
