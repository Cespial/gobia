"use client";

import { motion } from "framer-motion";

interface DashboardMockupSVGProps {
  animate?: boolean;
}

export default function DashboardMockupSVG({ animate = true }: DashboardMockupSVGProps) {
  const W = 560;
  const H = 370;
  const sidebar = 64;
  const header = 36;
  const titleBar = 28;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-2xl mx-auto"
      role="img"
      aria-label="Mockup del dashboard de Gobia mostrando métricas, gráficos y tabla de datos"
    >
      {/* Drop shadow */}
      <defs>
        <filter id="mockup-shadow" x="-4%" y="-2%" width="108%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#2C2418" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Window frame */}
      <motion.g
        filter="url(#mockup-shadow)"
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={animate ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] as const }}
      >
        <rect x={0} y={0} width={W} height={H} rx={10} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={1} />

        {/* Title bar */}
        <rect x={0.5} y={0.5} width={W - 1} height={titleBar} rx={10} fill="#F5EFE6" />
        <rect x={0.5} y={16} width={W - 1} height={titleBar - 16} fill="#F5EFE6" />
        <circle cx={14} cy={14} r={3.5} fill="#DDD4C4" />
        <circle cx={26} cy={14} r={3.5} fill="#DDD4C4" />
        <circle cx={38} cy={14} r={3.5} fill="#DDD4C4" />
        <text x={W / 2} y={17} textAnchor="middle" fill="#9E9484" fontSize={9} fontFamily="'Plus Jakarta Sans', sans-serif">
          gobia.co/dashboard
        </text>

        {/* Sidebar */}
        <rect x={0.5} y={titleBar} width={sidebar} height={H - titleBar - 0.5} fill="#2C2418" />
        {/* Cover sidebar bottom-left corner so main frame's rounded rect shows through */}
        <rect x={0} y={H - 10} width={1} height={10.5} fill="#FFFDF8" />
        <rect x={0.5} y={H - 10.5} width={10} height={11} rx={10} ry={10} fill="#2C2418" />

        {/* Sidebar nav items */}
        <motion.g
          initial={animate ? { opacity: 0 } : false}
          animate={animate ? { opacity: 1 } : false}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Logo placeholder */}
          <rect x={16} y={titleBar + 14} width={32} height={8} rx={2} fill="rgba(184, 149, 106, 0.6)" />

          {/* Active nav item */}
          <rect x={10} y={titleBar + 38} width={44} height={22} rx={4} fill="rgba(184, 149, 106, 0.15)" />
          <rect x={18} y={titleBar + 44} width={28} height={5} rx={2} fill="#B8956A" opacity={0.7} />

          {/* Other nav items */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={18} y={titleBar + 72 + i * 24} width={24 + (i % 2) * 6} height={5} rx={2} fill="rgba(255, 253, 248, 0.15)" />
          ))}

          {/* Bottom nav items */}
          <rect x={18} y={H - 44} width={20} height={5} rx={2} fill="rgba(255, 253, 248, 0.1)" />
          <rect x={18} y={H - 28} width={28} height={5} rx={2} fill="rgba(255, 253, 248, 0.1)" />
        </motion.g>

        {/* Header */}
        <motion.g
          initial={animate ? { opacity: 0 } : false}
          animate={animate ? { opacity: 1 } : false}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <line x1={sidebar} y1={titleBar + header} x2={W} y2={titleBar + header} stroke="#EDE6DA" strokeWidth={0.8} />
          <rect x={sidebar + 18} y={titleBar + 11} width={100} height={10} rx={2} fill="#2C2418" opacity={0.6} />
          {/* CTA button */}
          <rect x={W - 90} y={titleBar + 7} width={72} height={22} rx={5} fill="#B8956A" />
          <rect x={W - 80} y={titleBar + 14} width={52} height={6} rx={2} fill="#FFFDF8" opacity={0.6} />
        </motion.g>

        {/* Content area */}
        {/* Metric cards */}
        <motion.g
          initial={animate ? { opacity: 0, y: 8 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          {[0, 1, 2].map((i) => {
            const cx = sidebar + 18 + i * 156;
            return (
              <g key={`metric-${i}`}>
                <rect x={cx} y={titleBar + header + 16} width={144} height={66} rx={8} fill="#FFFDF8" stroke="#EDE6DA" strokeWidth={0.8} />
                <rect x={cx + 12} y={titleBar + header + 28} width={50} height={6} rx={2} fill="#9E9484" opacity={0.4} />
                <rect x={cx + 12} y={titleBar + header + 42} width={70} height={12} rx={2} fill="#2C2418" opacity={0.5} />
                <rect x={cx + 12} y={titleBar + header + 62} width={35} height={5} rx={2} fill={i === 0 ? "#B8956A" : "#BFB5A3"} opacity={0.5} />
              </g>
            );
          })}
        </motion.g>

        {/* Chart area */}
        <motion.g
          initial={animate ? { opacity: 0, y: 8 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <rect x={sidebar + 18} y={titleBar + header + 98} width={308} height={175} rx={8} fill="#FFFDF8" stroke="#EDE6DA" strokeWidth={0.8} />
          {/* Chart title */}
          <rect x={sidebar + 32} y={titleBar + header + 112} width={80} height={7} rx={2} fill="#2C2418" opacity={0.4} />

          {/* Bar chart */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const barX = sidebar + 40 + i * 24;
            const maxH = 110;
            const heights = [55, 72, 48, 85, 65, 92, 78, 60, 95, 70, 82, 58];
            const barH = heights[i];
            const barY = titleBar + header + 250 - barH;
            return (
              <rect
                key={`bar-${i}`}
                x={barX} y={barY}
                width={14} height={barH}
                rx={2}
                fill={i === 5 || i === 8 ? "#B8956A" : "#EDE6DA"}
                opacity={i === 5 || i === 8 ? 0.6 : 0.7}
              />
            );
          })}

          {/* X-axis */}
          <line x1={sidebar + 34} y1={titleBar + header + 254} x2={sidebar + 314} y2={titleBar + header + 254} stroke="#DDD4C4" strokeWidth={0.5} />
        </motion.g>

        {/* Side panel */}
        <motion.g
          initial={animate ? { opacity: 0, y: 8 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <rect x={sidebar + 338} y={titleBar + header + 98} width={138} height={175} rx={8} fill="#FFFDF8" stroke="#EDE6DA" strokeWidth={0.8} />
          {/* Panel title */}
          <rect x={sidebar + 352} y={titleBar + header + 112} width={60} height={7} rx={2} fill="#2C2418" opacity={0.4} />

          {/* List items */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={`list-${i}`}>
              <circle cx={sidebar + 358} cy={titleBar + header + 140 + i * 28} r={4} fill={i < 2 ? "#F5EDDF" : "#EDE6DA"} />
              <rect x={sidebar + 368} y={titleBar + header + 136 + i * 28} width={80} height={5} rx={2} fill="#2C2418" opacity={0.25} />
              <rect x={sidebar + 368} y={titleBar + header + 145 + i * 28} width={55} height={4} rx={2} fill="#9E9484" opacity={0.2} />
            </g>
          ))}
        </motion.g>
      </motion.g>
    </svg>
  );
}
