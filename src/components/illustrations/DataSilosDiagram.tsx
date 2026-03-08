"use client";

import { motion } from "framer-motion";

const silos = [
  { label: "Excel", sub: "Reportes manuales", icon: "grid" },
  { label: "SISFUT", sub: "Formulario único", icon: "form" },
  { label: "CHIP", sub: "Contaduría", icon: "stack" },
  { label: "SECOP", sub: "Contratación", icon: "doc" },
] as const;

function SiloIcon({ type, cx, cy }: { type: string; cx: number; cy: number }) {
  switch (type) {
    case "grid":
      return (
        <g>
          <rect x={cx - 13} y={cy - 11} width={26} height={22} rx={2.5} stroke="#B8956A" strokeWidth={1.2} fill="none" />
          <line x1={cx - 13} y1={cy} x2={cx + 13} y2={cy} stroke="#B8956A" strokeWidth={0.8} />
          <line x1={cx} y1={cy - 11} x2={cx} y2={cy + 11} stroke="#B8956A" strokeWidth={0.8} />
        </g>
      );
    case "form":
      return (
        <g>
          <rect x={cx - 10} y={cy - 13} width={20} height={26} rx={2.5} stroke="#B8956A" strokeWidth={1.2} fill="none" />
          <line x1={cx - 5} y1={cy - 6} x2={cx + 5} y2={cy - 6} stroke="#B8956A" strokeWidth={0.9} />
          <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="#B8956A" strokeWidth={0.9} />
          <line x1={cx - 5} y1={cy + 6} x2={cx + 3} y2={cy + 6} stroke="#B8956A" strokeWidth={0.9} />
        </g>
      );
    case "stack":
      return (
        <g>
          <ellipse cx={cx} cy={cy - 8} rx={13} ry={5} stroke="#B8956A" strokeWidth={1.2} fill="none" />
          <path d={`M ${cx - 13} ${cy - 8} L ${cx - 13} ${cy + 4}`} stroke="#B8956A" strokeWidth={1.2} />
          <path d={`M ${cx + 13} ${cy - 8} L ${cx + 13} ${cy + 4}`} stroke="#B8956A" strokeWidth={1.2} />
          <ellipse cx={cx} cy={cy + 4} rx={13} ry={5} stroke="#B8956A" strokeWidth={1.2} fill="none" />
        </g>
      );
    case "doc":
      return (
        <g>
          <path
            d={`M ${cx - 9} ${cy - 13} L ${cx + 5} ${cy - 13} L ${cx + 11} ${cy - 7} L ${cx + 11} ${cy + 13} L ${cx - 9} ${cy + 13} Z`}
            stroke="#B8956A" strokeWidth={1.2} fill="none" strokeLinejoin="round"
          />
          <path d={`M ${cx + 5} ${cy - 13} L ${cx + 5} ${cy - 7} L ${cx + 11} ${cy - 7}`} stroke="#B8956A" strokeWidth={0.9} fill="none" />
          <circle cx={cx} cy={cy + 3} r={4.5} stroke="#B8956A" strokeWidth={0.9} fill="none" />
        </g>
      );
    default:
      return null;
  }
}

interface DataSilosDiagramProps {
  animate?: boolean;
}

export default function DataSilosDiagram({ animate = true }: DataSilosDiagramProps) {
  const w = 104;
  const h = 140;
  const gap = 28;
  const totalW = 4 * w + 3 * gap;

  return (
    <svg
      viewBox={`0 0 ${totalW} 190`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto"
      role="img"
      aria-label="Datos fragmentados en silos desconectados: Excel, SISFUT, CHIP y SECOP"
    >
      {silos.map((silo, i) => {
        const x = i * (w + gap);
        return (
          <motion.g
            key={silo.label}
            initial={animate ? { opacity: 0, y: 14 } : false}
            animate={animate ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.25, 1, 0.5, 1] as const }}
          >
            <rect x={x} y={8} width={w} height={h} rx={10} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={1} />
            <rect x={x + 22} y={22} width={60} height={50} rx={8} fill="#F5EDDF" />
            <SiloIcon type={silo.icon} cx={x + w / 2} cy={47} />
            <text x={x + w / 2} y={96} textAnchor="middle" fill="#2C2418" fontSize={12.5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
              {silo.label}
            </text>
            <text x={x + w / 2} y={112} textAnchor="middle" fill="#9E9484" fontSize={8.5} fontFamily="'Plus Jakarta Sans', sans-serif">
              {silo.sub}
            </text>
          </motion.g>
        );
      })}

      {/* Broken connections */}
      {[0, 1, 2].map((i) => {
        const x1 = (i + 1) * w + i * gap;
        const midX = x1 + gap / 2;
        const y = 8 + h / 2;
        return (
          <motion.g
            key={`break-${i}`}
            initial={animate ? { opacity: 0 } : false}
            animate={animate ? { opacity: 1 } : false}
            transition={{ duration: 0.35, delay: 0.65 + i * 0.1 }}
          >
            <line x1={x1 + 3} y1={y} x2={midX - 6} y2={y} stroke="#BFB5A3" strokeWidth={1.5} strokeDasharray="3 3" />
            <line x1={midX - 4} y1={y - 4} x2={midX + 4} y2={y + 4} stroke="#B8956A" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={midX + 4} y1={y - 4} x2={midX - 4} y2={y + 4} stroke="#B8956A" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={midX + 6} y1={y} x2={x1 + gap - 3} y2={y} stroke="#BFB5A3" strokeWidth={1.5} strokeDasharray="3 3" />
          </motion.g>
        );
      })}

      {/* Bottom label */}
      <motion.text
        x={totalW / 2}
        y={172}
        textAnchor="middle"
        fill="#9E9484"
        fontSize={10}
        fontStyle="italic"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        initial={animate ? { opacity: 0 } : false}
        animate={animate ? { opacity: 0.7 } : false}
        transition={{ duration: 0.5, delay: 1 }}
      >
        Datos fragmentados en 4+ sistemas sin conexión entre sí
      </motion.text>
    </svg>
  );
}
