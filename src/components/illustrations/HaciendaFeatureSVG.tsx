"use client";

import { motion } from "framer-motion";

interface Props {
  animate?: boolean;
  delay?: number;
}

export default function HaciendaFeatureSVG({ animate = true, delay = 0 }: Props) {
  const gauges = [
    { label: "Recaudo", value: 73, color: "#B8956A" },
    { label: "Ejecución", value: 88, color: "#8B7355" },
    { label: "IDF", value: 65, color: "#B8956A" },
  ];

  const bars = [
    { h: 28, label: "Ene" },
    { h: 18, label: "Feb" },
    { h: 32, label: "Mar" },
    { h: 24, label: "Abr" },
    { h: 36, label: "May" },
    { h: 30, label: "Jun" },
  ];

  return (
    <svg viewBox="0 0 280 200" fill="none" className="w-full h-auto" role="img" aria-label="Dashboard de hacienda con indicadores fiscales">
      {/* Background card */}
      <rect x={0} y={0} width={280} height={200} rx={12} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.8} />

      {/* Header bar */}
      <rect x={0} y={0} width={280} height={32} rx={12} fill="#2C2418" />
      <rect x={0} y={12} width={280} height={20} fill="#2C2418" />
      <circle cx={16} cy={16} r={4} fill="#B8956A" opacity={0.6} />
      <circle cx={28} cy={16} r={4} fill="#DDD4C4" opacity={0.3} />
      <circle cx={40} cy={16} r={4} fill="#DDD4C4" opacity={0.3} />
      <text x={140} y={19} textAnchor="middle" fill="#FAF6F0" fontSize={7} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
        Hacienda Dashboard
      </text>

      {/* Three gauge cards */}
      {gauges.map((g, i) => {
        const cx = 52 + i * 88;
        const cy = 68;
        const r = 18;
        const circumference = Math.PI * r;
        const progress = (g.value / 100) * circumference;

        return (
          <g key={g.label}>
            {/* Card bg */}
            <rect x={cx - 38} y={42} width={76} height={56} rx={6} fill="#FAF6F0" stroke="#EDE6DA" strokeWidth={0.5} />

            {/* Semi-circle gauge */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              stroke="#EDE6DA"
              strokeWidth={3}
              fill="none"
            />
            <motion.path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              stroke={g.color}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: circumference - progress }}
              animate={animate ? { strokeDashoffset: circumference - progress } : undefined}
              transition={{ duration: 1, delay: delay + 0.3 + i * 0.2, ease: [0.25, 1, 0.5, 1] }}
            />

            {/* Value */}
            <motion.text
              x={cx} y={cy - 2}
              textAnchor="middle"
              fill="#2C2418"
              fontSize={10}
              fontWeight={700}
              fontFamily="'Plus Jakarta Sans', sans-serif"
              initial={animate ? { opacity: 0 } : undefined}
              animate={animate ? { opacity: 1 } : undefined}
              transition={{ duration: 0.4, delay: delay + 0.6 + i * 0.2 }}
            >
              {g.value}%
            </motion.text>

            {/* Label */}
            <text x={cx} y={cy + 18} textAnchor="middle" fill="#9E9484" fontSize={6} fontFamily="'Plus Jakarta Sans', sans-serif">
              {g.label}
            </text>
          </g>
        );
      })}

      {/* Bar chart area */}
      <rect x={14} y={106} width={170} height={84} rx={6} fill="#FAF6F0" stroke="#EDE6DA" strokeWidth={0.5} />
      <text x={22} y={118} fill="#7D7365" fontSize={5.5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
        Recaudo mensual
      </text>

      {/* Grid lines */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={22} y1={128 + i * 18} x2={176} y2={128 + i * 18} stroke="#EDE6DA" strokeWidth={0.3} />
      ))}

      {/* Bars */}
      {bars.map((bar, i) => (
        <motion.rect
          key={bar.label}
          x={26 + i * 25}
          width={16}
          rx={2}
          fill={i === 4 ? "#B8956A" : "#DDD4C4"}
          initial={animate ? { y: 182, height: 0 } : { y: 182 - bar.h, height: bar.h }}
          animate={animate ? { y: 182 - bar.h, height: bar.h } : undefined}
          transition={{ duration: 0.5, delay: delay + 0.5 + i * 0.08, ease: [0.25, 1, 0.5, 1] }}
        />
      ))}

      {/* Sparkline card */}
      <rect x={192} y={106} width={78} height={38} rx={6} fill="#FAF6F0" stroke="#EDE6DA" strokeWidth={0.5} />
      <text x={200} y={118} fill="#7D7365" fontSize={5.5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
        Tendencia
      </text>
      <motion.polyline
        points="200,138 210,134 220,136 230,130 240,128 250,124 260,120"
        stroke="#B8956A"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.2, delay: delay + 0.8, ease: "easeOut" }}
      />

      {/* KPI card */}
      <rect x={192} y={150} width={78} height={40} rx={6} fill="#F5EDDF" stroke="#B8956A" strokeWidth={0.5} opacity={0.8} />
      <text x={200} y={162} fill="#8B7355" fontSize={5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
        IDF Nacional
      </text>
      <motion.text
        x={200} y={178}
        fill="#B8956A"
        fontSize={14}
        fontWeight={700}
        fontFamily="'Space Grotesk', serif"
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: 0.5, delay: delay + 1 }}
      >
        75.2
      </motion.text>
      <text x={238} y={178} fill="#9E9484" fontSize={6} fontFamily="'Plus Jakarta Sans', sans-serif">
        / 100
      </text>
    </svg>
  );
}
