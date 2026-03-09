"use client";

import { motion } from "framer-motion";

interface Props {
  size?: number;
  animate?: boolean;
  variant?: "mark" | "full" | "navbar" | "navbar-dark";
  className?: string;
}

/**
 * Gobia Logo — Monogram "G" mark with hub/network motif.
 * - `navbar`: for light backgrounds (landing page)
 * - `navbar-dark`: for dark backgrounds (demo pages with bg-ink nav)
 * - `full`: standalone with text, light background
 * - `mark`: icon only
 */
export default function GobiaLogo({
  size = 40,
  animate = false,
  variant = "mark",
  className = "",
}: Props) {
  if (variant === "navbar") {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <svg width={28} height={28} viewBox="0 0 40 40" fill="none" role="img" aria-label="Gobia logo">
          <rect width={40} height={40} rx={10} fill="#2C2418" />
          <GobiaMark animate={animate} />
        </svg>
        <span className="font-serif text-xl tracking-tight text-ink">
          gobia
        </span>
        <span className="font-serif text-base text-ochre -ml-1">.co</span>
      </span>
    );
  }

  if (variant === "navbar-dark") {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <svg width={28} height={28} viewBox="0 0 40 40" fill="none" role="img" aria-label="Gobia logo">
          <rect width={40} height={40} rx={10} fill="#B8956A" />
          <GobiaMarkDark animate={animate} />
        </svg>
        <span className="font-serif text-xl tracking-tight text-paper">
          gobia
        </span>
        <span className="font-serif text-base text-ochre -ml-1">.co</span>
      </span>
    );
  }

  if (variant === "full") {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" role="img" aria-label="Gobia logo">
          <rect width={40} height={40} rx={10} fill="#2C2418" />
          <GobiaMark animate={animate} />
        </svg>
        <span className="font-serif text-2xl tracking-tight text-ink">
          gobia
          <span className="text-ochre">.co</span>
        </span>
      </span>
    );
  }

  // Mark only
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" role="img" aria-label="Gobia logo" className={className}>
      <rect width={40} height={40} rx={10} fill="#2C2418" />
      <GobiaMark animate={animate} />
    </svg>
  );
}

/** Mark for dark icon background (ink bg) — ochre G, light dots */
function GobiaMark({ animate }: { animate: boolean }) {
  return (
    <>
      <motion.path
        d="M 26 14.5 A 9.5 9.5 0 1 0 26 25.5 L 26 20 L 21 20"
        stroke="#B8956A"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <motion.circle cx={20} cy={20} r={2} fill="#B8956A"
        initial={animate ? { scale: 0 } : undefined}
        animate={animate ? { scale: 1 } : undefined}
        transition={{ duration: 0.3, delay: 0.8 }}
      />
      {[
        { cx: 12, cy: 12, delay: 1.0 },
        { cx: 28, cy: 12, delay: 1.1 },
        { cx: 28, cy: 28, delay: 1.2 },
      ].map((dot, i) => (
        <motion.circle key={i} cx={dot.cx} cy={dot.cy} r={1.3} fill="#FAF6F0" opacity={0.7}
          initial={animate ? { scale: 0 } : undefined}
          animate={animate ? { scale: 1 } : undefined}
          transition={{ duration: 0.2, delay: dot.delay }}
        />
      ))}
      {[
        { x1: 20, y1: 20, x2: 13, y2: 13, delay: 1.0 },
        { x1: 20, y1: 20, x2: 27, y2: 13, delay: 1.1 },
        { x1: 20, y1: 20, x2: 27, y2: 27, delay: 1.2 },
      ].map((line, i) => (
        <motion.line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke="#FAF6F0" strokeWidth={0.6} opacity={0.3}
          initial={animate ? { pathLength: 0 } : undefined}
          animate={animate ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.3, delay: line.delay }}
        />
      ))}
    </>
  );
}

/** Mark for ochre icon background — ink G, paper dots */
function GobiaMarkDark({ animate }: { animate: boolean }) {
  return (
    <>
      <motion.path
        d="M 26 14.5 A 9.5 9.5 0 1 0 26 25.5 L 26 20 L 21 20"
        stroke="#2C2418"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <motion.circle cx={20} cy={20} r={2} fill="#2C2418"
        initial={animate ? { scale: 0 } : undefined}
        animate={animate ? { scale: 1 } : undefined}
        transition={{ duration: 0.3, delay: 0.8 }}
      />
      {[
        { cx: 12, cy: 12, delay: 1.0 },
        { cx: 28, cy: 12, delay: 1.1 },
        { cx: 28, cy: 28, delay: 1.2 },
      ].map((dot, i) => (
        <motion.circle key={i} cx={dot.cx} cy={dot.cy} r={1.3} fill="#FFFDF8" opacity={0.9}
          initial={animate ? { scale: 0 } : undefined}
          animate={animate ? { scale: 1 } : undefined}
          transition={{ duration: 0.2, delay: dot.delay }}
        />
      ))}
      {[
        { x1: 20, y1: 20, x2: 13, y2: 13, delay: 1.0 },
        { x1: 20, y1: 20, x2: 27, y2: 13, delay: 1.1 },
        { x1: 20, y1: 20, x2: 27, y2: 27, delay: 1.2 },
      ].map((line, i) => (
        <motion.line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke="#FFFDF8" strokeWidth={0.6} opacity={0.4}
          initial={animate ? { pathLength: 0 } : undefined}
          animate={animate ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.3, delay: line.delay }}
        />
      ))}
    </>
  );
}
