"use client";

import { motion } from "framer-motion";

interface MiniBarChartProps {
  beforeValue: number;
  afterValue: number;
  animate?: boolean;
  delay?: number;
}

export function MiniBarChart({ beforeValue, afterValue, animate = true, delay = 0 }: MiniBarChartProps) {
  const maxH = 32;
  const beforeH = (beforeValue / 100) * maxH;
  const afterH = (afterValue / 100) * maxH;

  return (
    <svg viewBox="0 0 48 40" fill="none" className="w-12 h-10">
      {/* Before bar */}
      <motion.rect
        x={6} width={14} rx={2}
        fill="#DDD4C4"
        initial={animate ? { y: 40, height: 0 } : { y: 40 - beforeH, height: beforeH }}
        animate={animate ? { y: 40 - beforeH, height: beforeH } : undefined}
        transition={{ duration: 0.6, delay: delay + 0.2, ease: [0.25, 1, 0.5, 1] as const }}
      />
      {/* After bar */}
      <motion.rect
        x={28} width={14} rx={2}
        fill="#B8956A"
        initial={animate ? { y: 40, height: 0 } : { y: 40 - afterH, height: afterH }}
        animate={animate ? { y: 40 - afterH, height: afterH } : undefined}
        transition={{ duration: 0.6, delay: delay + 0.4, ease: [0.25, 1, 0.5, 1] as const }}
      />
    </svg>
  );
}

interface MiniGaugeProps {
  value: number;
  animate?: boolean;
  delay?: number;
}

export function MiniGauge({ value, animate = true, delay = 0 }: MiniGaugeProps) {
  const r = 16;
  const circumference = 2 * Math.PI * r;
  const progress = (value / 100) * circumference;

  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      {/* Background circle */}
      <circle cx={20} cy={20} r={r} stroke="#DDD4C4" strokeWidth={3} />
      {/* Progress arc */}
      <motion.circle
        cx={20} cy={20} r={r}
        stroke="#B8956A" strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        transform="rotate(-90 20 20)"
        initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: circumference - progress }}
        animate={animate ? { strokeDashoffset: circumference - progress } : undefined}
        transition={{ duration: 0.8, delay: delay + 0.3, ease: [0.25, 1, 0.5, 1] as const }}
      />
    </svg>
  );
}

interface MiniCountProps {
  count: number;
  total: number;
  animate?: boolean;
  delay?: number;
}

export function MiniDots({ count, total, animate = true, delay = 0 }: MiniCountProps) {
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const size = 4;
  const gap = 2;
  const w = cols * size + (cols - 1) * gap;
  const h = rows * size + (rows - 1) * gap;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} fill="none" className="w-12 h-auto">
      {Array.from({ length: total }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const isActive = i < count;
        return (
          <motion.rect
            key={i}
            x={col * (size + gap)}
            y={row * (size + gap)}
            width={size}
            height={size}
            rx={1}
            fill={isActive ? "#B8956A" : "#EDE6DA"}
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.2, delay: delay + 0.1 + i * 0.02 }}
          />
        );
      })}
    </svg>
  );
}
