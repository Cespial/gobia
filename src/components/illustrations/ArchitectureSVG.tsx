"use client";

import { motion } from "framer-motion";

const layers = [
  {
    label: "Presentación",
    items: ["Dashboard", "IA Chat", "Mapas", "Reportes"],
  },
  {
    label: "API + IA",
    items: ["RAG", "ETL", "Auth", "Multi-tenant", "Alertas", "XML Gen"],
  },
  {
    label: "Datos + Vectores",
    items: ["PostgreSQL", "PostGIS", "pgvector"],
  },
];

interface ArchitectureSVGProps {
  animate?: boolean;
}

export default function ArchitectureSVG({ animate = true }: ArchitectureSVGProps) {
  const W = 420;
  const layerH = 72;
  const layerGap = 32;
  const padX = 30;
  const padY = 16;
  const totalH = padY + 3 * layerH + 2 * layerGap + padY;
  const pillH = 26;

  return (
    <svg
      viewBox={`0 0 ${W + padX * 2} ${totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      role="img"
      aria-label="Arquitectura de 3 capas: Presentación, API + IA, y Datos + Vectores"
    >
      {layers.map((layer, li) => {
        const y = padY + li * (layerH + layerGap);
        const pillCount = layer.items.length;
        const innerPad = 12;
        const pillGap = 6;
        const availableW = W - innerPad * 2;
        const pillW = (availableW - (pillCount - 1) * pillGap) / pillCount;

        return (
          <motion.g
            key={layer.label}
            initial={animate ? { opacity: 0, y: 10 } : false}
            animate={animate ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.5, delay: 0.15 + li * 0.15, ease: [0.25, 1, 0.5, 1] as const }}
          >
            {/* Layer background */}
            <rect
              x={padX} y={y}
              width={W} height={layerH}
              rx={12}
              fill="rgba(255, 253, 248, 0.04)"
              stroke="rgba(255, 253, 248, 0.1)"
              strokeWidth={1}
            />

            {/* Layer label */}
            <text
              x={padX + innerPad} y={y + 16}
              fill="#B8956A" fontSize={9} fontWeight={600}
              fontFamily="'Plus Jakarta Sans', sans-serif"
              letterSpacing="0.08em"
            >
              {layer.label.toUpperCase()}
            </text>

            {/* Pills */}
            {layer.items.map((item, ii) => {
              const px = padX + innerPad + ii * (pillW + pillGap);
              const py = y + 30;
              return (
                <g key={item}>
                  <rect
                    x={px} y={py}
                    width={pillW} height={pillH}
                    rx={6}
                    fill="rgba(184, 149, 106, 0.08)"
                    stroke="rgba(184, 149, 106, 0.18)"
                    strokeWidth={0.8}
                  />
                  <text
                    x={px + pillW / 2} y={py + pillH / 2 + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fill="#FFFDF8" fontSize={10} fontWeight={500}
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                  >
                    {item}
                  </text>
                </g>
              );
            })}
          </motion.g>
        );
      })}

      {/* Connections between layers */}
      {[0, 1].map((li) => {
        const y1 = padY + li * (layerH + layerGap) + layerH;
        const y2 = padY + (li + 1) * (layerH + layerGap);
        const connCount = 4;
        const spacing = W / (connCount + 1);

        return Array.from({ length: connCount }).map((_, ci) => {
          const x = padX + spacing * (ci + 1);
          return (
            <motion.g
              key={`conn-${li}-${ci}`}
              initial={animate ? { opacity: 0 } : false}
              animate={animate ? { opacity: 1 } : false}
              transition={{ duration: 0.3, delay: 0.6 + li * 0.2 + ci * 0.04 }}
            >
              <line
                x1={x} y1={y1 + 3} x2={x} y2={y2 - 3}
                stroke="rgba(184, 149, 106, 0.2)" strokeWidth={1}
                strokeDasharray="3 3"
              />
              {/* Arrow head */}
              <path
                d={`M ${x - 3} ${y2 - 7} L ${x} ${y2 - 3} L ${x + 3} ${y2 - 7}`}
                stroke="rgba(184, 149, 106, 0.35)" strokeWidth={1} fill="none"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </motion.g>
          );
        });
      })}

      {/* Animated flowing dot (one per gap, subtle) */}
      {[0, 1].map((li) => {
        const y1 = padY + li * (layerH + layerGap) + layerH + 3;
        const y2 = padY + (li + 1) * (layerH + layerGap) - 3;
        const x = padX + W / 2;
        return (
          <motion.circle
            key={`flow-${li}`}
            cx={x} r={2.5} fill="#B8956A"
            initial={{ cy: y1, opacity: 0 }}
            animate={animate ? {
              cy: [y1, y2],
              opacity: [0, 0.7, 0.7, 0],
            } : false}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: li * 0.8,
              ease: "linear",
              repeatDelay: 0.5,
            }}
          />
        );
      })}
    </svg>
  );
}
