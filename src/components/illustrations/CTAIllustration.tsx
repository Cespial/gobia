"use client";

import { motion } from "framer-motion";

interface CTAIllustrationProps {
  animate?: boolean;
}

export default function CTAIllustration({ animate = true }: CTAIllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-xs mx-auto"
      role="img"
      aria-label="Ilustración de datos convergiendo hacia una plataforma unificada"
    >
      <style>{`
        @keyframes cta-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }
        .cta-ring { animation: cta-pulse 3s ease-in-out infinite; }
      `}</style>

      {/* Central platform circle */}
      <motion.g
        initial={animate ? { scale: 0, opacity: 0 } : false}
        animate={animate ? { scale: 1, opacity: 1 } : false}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 1, 0.5, 1] as const }}
      >
        {/* Pulse rings */}
        <circle cx={160} cy={140} r={70} stroke="#B8956A" strokeWidth={0.5} className="cta-ring" style={{ animationDelay: "0s" }} />
        <circle cx={160} cy={140} r={90} stroke="#B8956A" strokeWidth={0.5} className="cta-ring" style={{ animationDelay: "1s" }} />
        <circle cx={160} cy={140} r={110} stroke="#B8956A" strokeWidth={0.3} className="cta-ring" style={{ animationDelay: "2s" }} />

        {/* Center circle */}
        <circle cx={160} cy={140} r={40} fill="#F5EDDF" stroke="#B8956A" strokeWidth={1.5} />
        <text x={160} y={136} textAnchor="middle" dominantBaseline="central" fill="#B8956A" fontSize={12} fontWeight={700} fontFamily="'Space Grotesk', serif">
          Gobia
        </text>
        <text x={160} y={152} textAnchor="middle" fill="#9E9484" fontSize={7} fontFamily="'Plus Jakarta Sans', sans-serif">
          Plataforma unificada
        </text>
      </motion.g>

      {/* Incoming data streams — 5 sources converging to center */}
      {[
        { label: "Hacienda", x: 40, y: 40 },
        { label: "Planeación", x: 280, y: 50 },
        { label: "Normativa", x: 30, y: 220 },
        { label: "Catastro", x: 290, y: 210 },
        { label: "DIAN", x: 160, y: 260 },
      ].map((src, i) => {
        const angle = Math.atan2(140 - src.y, 160 - src.x);
        const endX = 160 - 44 * Math.cos(angle);
        const endY = 140 - 44 * Math.sin(angle);
        return (
          <motion.g
            key={src.label}
            initial={animate ? { opacity: 0 } : false}
            animate={animate ? { opacity: 1 } : false}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
          >
            {/* Source node */}
            <circle cx={src.x} cy={src.y} r={16} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.8} />
            <text x={src.x} y={src.y + 1} textAnchor="middle" dominantBaseline="central" fill="#7D7365" fontSize={6} fontWeight={500} fontFamily="'Plus Jakarta Sans', sans-serif">
              {src.label}
            </text>

            {/* Connection line */}
            <line
              x1={src.x + 16 * Math.cos(angle)} y1={src.y + 16 * Math.sin(angle)}
              x2={endX} y2={endY}
              stroke="#DDD4C4" strokeWidth={0.8} strokeDasharray="3 4"
            />

            {/* Animated dot flowing toward center */}
            <motion.circle
              r={2.5}
              fill="#B8956A"
              initial={{
                cx: src.x + 16 * Math.cos(angle),
                cy: src.y + 16 * Math.sin(angle),
                opacity: 0,
              }}
              animate={animate ? {
                cx: [src.x + 16 * Math.cos(angle), endX],
                cy: [src.y + 16 * Math.sin(angle), endY],
                opacity: [0, 0.8, 0.8, 0],
              } : false}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.8 + i * 0.4,
                ease: "linear",
                repeatDelay: 1,
              }}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}
