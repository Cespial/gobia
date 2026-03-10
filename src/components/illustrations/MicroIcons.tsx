"use client";

import { motion } from "framer-motion";

interface MicroIconProps {
  animate?: boolean;
}

/* ─── 1. MicroHacienda — animated bar chart ──────────────────────── */

const barHeights = [20, 30, 14, 24];
const barWidth = 6;
const barGap = 4;
const totalBarsWidth = barHeights.length * barWidth + (barHeights.length - 1) * barGap;
const barsStartX = (48 - totalBarsWidth) / 2;

export function MicroHacienda({ animate = true }: MicroIconProps) {
  const tallestIdx = 1; // second bar is tallest

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {barHeights.map((h, i) => {
        const x = barsStartX + i * (barWidth + barGap);
        const y = 40 - h;
        const fill = i === tallestIdx ? "#B8956A" : "#E5E5E5";

        return (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            rx={2}
            fill={fill}
            initial={animate ? { height: 0, y: 40 } : { height: h, y }}
            animate={{ height: h, y }}
            transition={
              animate
                ? { duration: 0.6, delay: 0.1 * i, ease: [0.34, 1.56, 0.64, 1] }
                : { duration: 0 }
            }
          />
        );
      })}
      {/* baseline */}
      <line x1={barsStartX - 2} y1={40} x2={barsStartX + totalBarsWidth + 2} y2={40} stroke="#E5E5E5" strokeWidth={1} strokeLinecap="round" />
    </svg>
  );
}

/* ─── 2. MicroEstatuto — document with neural dots ───────────────── */

export function MicroEstatuto({ animate = true }: MicroIconProps) {
  const dots = [
    { cx: 24, cy: 18 },
    { cx: 18, cy: 26 },
    { cx: 30, cy: 26 },
    { cx: 24, cy: 34 },
  ];

  const lines: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 3],
  ];

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document outline */}
      <motion.path
        d="M14 8h14l8 8v24a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2z"
        stroke="#E5E5E5"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={animate ? { duration: 0.8, ease: "easeOut" } : { duration: 0 }}
      />
      {/* Fold */}
      <motion.path
        d="M28 8v8h8"
        stroke="#E5E5E5"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={animate ? { duration: 0.4, delay: 0.6, ease: "easeOut" } : { duration: 0 }}
      />
      {/* Neural network lines */}
      {lines.map(([a, b], i) => (
        <motion.line
          key={`line-${i}`}
          x1={dots[a].cx}
          y1={dots[a].cy}
          x2={dots[b].cx}
          y2={dots[b].cy}
          stroke="#D4C5B0"
          strokeWidth={1}
          initial={animate ? { opacity: 0 } : { opacity: 0.6 }}
          animate={{ opacity: 0.6 }}
          transition={animate ? { duration: 0.3, delay: 0.8 + i * 0.08 } : { duration: 0 }}
        />
      ))}
      {/* Neural network dots with pulse */}
      {dots.map((dot, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={dot.cx}
          cy={dot.cy}
          r={2.5}
          fill="#B8956A"
          initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={
            animate
              ? {
                  scale: [0, 1.3, 1],
                  opacity: [0, 1, 1],
                }
              : { scale: 1, opacity: 1 }
          }
          transition={
            animate
              ? { duration: 0.5, delay: 1.0 + i * 0.1, ease: "easeOut" }
              : { duration: 0 }
          }
        />
      ))}
    </svg>
  );
}

/* ─── 3. MicroPDM — semicircular gauge ───────────────────────────── */

export function MicroPDM({ animate = true }: MicroIconProps) {
  const cx = 24;
  const cy = 30;
  const r = 16;
  // Semicircle from 180deg to 0deg (left to right across the top)
  const circumference = Math.PI * r; // half-circle
  const fillPct = 0.75;
  const fillLength = circumference * fillPct;
  const gapLength = circumference * (1 - fillPct);

  // Position of the dot at 75% of the arc
  const dotAngle = Math.PI - Math.PI * fillPct; // angle from positive x-axis
  const dotX = cx + r * Math.cos(dotAngle);
  const dotY = cy + r * Math.sin(dotAngle);

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Track (full semicircle) */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        stroke="#E5E5E5"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      {/* Fill arc */}
      <motion.path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        stroke="#B8956A"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${fillLength} ${gapLength}`}
        initial={animate ? { strokeDashoffset: fillLength } : { strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: 0 }}
        transition={animate ? { duration: 1, delay: 0.2, ease: "easeOut" } : { duration: 0 }}
      />
      {/* Dot at the end of fill */}
      <motion.circle
        cx={dotX}
        cy={dotY}
        r={3}
        fill="#B8956A"
        initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={animate ? { duration: 0.3, delay: 1.1, ease: "easeOut" } : { duration: 0 }}
      />
      {/* Label */}
      <text x={cx} y={cy - 2} textAnchor="middle" fill="#8B7355" fontSize={9} fontWeight={600}>
        75%
      </text>
    </svg>
  );
}

/* ─── 4. MicroExogena — document with animated checkmark ─────────── */

export function MicroExogena({ animate = true }: MicroIconProps) {
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document outline */}
      <rect
        x={12}
        y={6}
        width={24}
        height={32}
        rx={3}
        stroke="#E5E5E5"
        strokeWidth={1.5}
        fill="none"
      />
      {/* Lines inside document */}
      <line x1={18} y1={14} x2={30} y2={14} stroke="#E5E5E5" strokeWidth={1} strokeLinecap="round" />
      <line x1={18} y1={19} x2={28} y2={19} stroke="#E5E5E5" strokeWidth={1} strokeLinecap="round" />
      <line x1={18} y1={24} x2={26} y2={24} stroke="#E5E5E5" strokeWidth={1} strokeLinecap="round" />
      {/* Checkmark */}
      <motion.path
        d="M19 30l4 4 8-8"
        stroke="#B8956A"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={
          animate
            ? { pathLength: { duration: 0.5, delay: 0.5, ease: "easeOut" }, opacity: { duration: 0.1, delay: 0.5 } }
            : { duration: 0 }
        }
      />
    </svg>
  );
}

/* ─── 5. MicroGemelo — map pin with ripple ───────────────────────── */

export function MicroGemelo({ animate = true }: MicroIconProps) {
  const pinCx = 24;
  const pinBottom = 40;

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ripple circles */}
      {[12, 18, 24].map((r, i) => (
        <motion.circle
          key={`ripple-${i}`}
          cx={pinCx}
          cy={pinBottom}
          r={r}
          stroke="#B8956A"
          strokeWidth={1}
          fill="none"
          initial={animate ? { scale: 0, opacity: 0.6 } : { scale: 1, opacity: 0 }}
          animate={animate ? { scale: 1, opacity: 0 } : { scale: 1, opacity: 0 }}
          transition={
            animate
              ? {
                  duration: 1.2,
                  delay: 0.6 + i * 0.25,
                  ease: "easeOut",
                }
              : { duration: 0 }
          }
        />
      ))}
      {/* Pin body */}
      <motion.g
        initial={animate ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={
          animate
            ? { type: "spring", stiffness: 300, damping: 12, delay: 0.1 }
            : { duration: 0 }
        }
      >
        <path
          d="M24 6c-6.075 0-11 4.925-11 11 0 8.25 11 23 11 23s11-14.75 11-23c0-6.075-4.925-11-11-11z"
          fill="#E5E5E5"
          stroke="#D4C5B0"
          strokeWidth={1}
        />
        <circle cx={24} cy={17} r={4} fill="#B8956A" />
      </motion.g>
    </svg>
  );
}

/* ─── 6. MicroRendicion — shield with clock ──────────────────────── */

export function MicroRendicion({ animate = true }: MicroIconProps) {
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield outline */}
      <motion.path
        d="M24 4L8 12v12c0 10 6.667 16.667 16 20 9.333-3.333 16-10 16-20V12L24 4z"
        stroke="#E5E5E5"
        strokeWidth={1.5}
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={animate ? { duration: 0.8, ease: "easeOut" } : { duration: 0 }}
      />
      {/* Clock circle */}
      <motion.circle
        cx={24}
        cy={22}
        r={7}
        stroke="#D4C5B0"
        strokeWidth={1.2}
        fill="none"
        initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={animate ? { duration: 0.4, delay: 0.7, ease: "easeOut" } : { duration: 0 }}
      />
      {/* Clock hands */}
      <motion.line
        x1={24}
        y1={22}
        x2={24}
        y2={17}
        stroke="#B8956A"
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={animate ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={animate ? { duration: 0.3, delay: 1.0 } : { duration: 0 }}
      />
      <motion.line
        x1={24}
        y1={22}
        x2={28}
        y2={22}
        stroke="#B8956A"
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={animate ? { opacity: 0 } : { opacity: 1 }}
        animate={
          animate
            ? {
                opacity: 1,
                rotate: [0, 360],
              }
            : { opacity: 1 }
        }
        transition={
          animate
            ? {
                opacity: { duration: 0.3, delay: 1.0 },
                rotate: { duration: 4, delay: 1.3, ease: "linear", repeat: Infinity },
              }
            : { duration: 0 }
        }
        style={{ originX: "24px", originY: "22px", transformBox: "fill-box" }}
      />
      {/* Small calendar ticks at 12, 3, 6, 9 o'clock */}
      {[
        { x1: 24, y1: 15.5, x2: 24, y2: 16.5 },
        { x1: 30.5, y1: 22, x2: 31.5, y2: 22 },
        { x1: 24, y1: 27.5, x2: 24, y2: 28.5 },
        { x1: 16.5, y1: 22, x2: 17.5, y2: 22 },
      ].map((tick, i) => (
        <motion.line
          key={`tick-${i}`}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="#D4C5B0"
          strokeWidth={1}
          strokeLinecap="round"
          initial={animate ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={animate ? { duration: 0.2, delay: 0.9 + i * 0.05 } : { duration: 0 }}
        />
      ))}
    </svg>
  );
}
