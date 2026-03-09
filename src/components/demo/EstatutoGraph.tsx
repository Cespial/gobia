"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { graphBooks, crossReferences } from "@/data/knowledge-graph-data";

const COLORS: Record<string, string> = {
  general: "#B8956A",
  predial: "#6B8E4E",
  ica: "#5B7BA5",
  retencion: "#A0616A",
  regimenes: "#8B7355",
  financiero: "#7B6BA5",
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  general: { x: 300, y: 50 },
  predial: { x: 100, y: 180 },
  ica: { x: 500, y: 180 },
  retencion: { x: 580, y: 360 },
  regimenes: { x: 300, y: 400 },
  financiero: { x: 20, y: 360 },
};

export default function EstatutoGraph() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Parse cross-reference indices
  const connections = crossReferences.map(([from, to]) => {
    const [fromBook, fromIdx] = from.split("-");
    const [toBook, toIdx] = to.split("-");
    return { fromBook, fromIdx: parseInt(fromIdx), toBook, toIdx: parseInt(toIdx) };
  });

  return (
    <div ref={ref} className="rounded-2xl border border-border bg-paper p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[0.75rem] font-semibold uppercase tracking-wider text-gray-400">
          Grafo normativo — Acuerdo 093/2023
        </span>
      </div>

      <svg viewBox="0 0 620 470" fill="none" className="w-full h-auto">
        {/* Connection lines */}
        {connections.map((conn, i) => {
          const fromPos = POSITIONS[conn.fromBook];
          const toPos = POSITIONS[conn.toBook];
          if (!fromPos || !toPos) return null;

          return (
            <motion.line
              key={`conn-${i}`}
              x1={fromPos.x + 70}
              y1={fromPos.y + 30}
              x2={toPos.x + 70}
              y2={toPos.y + 30}
              stroke={COLORS[conn.fromBook] || "#DDD4C4"}
              strokeWidth={0.8}
              strokeDasharray="4 4"
              opacity={0.3}
              initial={isInView ? { pathLength: 0 } : undefined}
              animate={isInView ? { pathLength: 1 } : undefined}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }}
            />
          );
        })}

        {/* Book nodes */}
        {graphBooks.map((book, bi) => {
          const pos = POSITIONS[book.id];
          if (!pos) return null;
          const color = COLORS[book.id] || "#B8956A";

          return (
            <motion.g
              key={book.id}
              initial={isInView ? { opacity: 0, scale: 0.8 } : undefined}
              animate={isInView ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.4, delay: bi * 0.1 }}
              style={{ transformOrigin: `${pos.x + 70}px ${pos.y + 30}px` }}
            >
              {/* Card background */}
              <rect
                x={pos.x}
                y={pos.y}
                width={140}
                height={20 + book.articles.length * 16}
                rx={8}
                fill="#FFFDF8"
                stroke={color}
                strokeWidth={1}
                opacity={0.9}
              />

              {/* Header */}
              <rect
                x={pos.x}
                y={pos.y}
                width={140}
                height={24}
                rx={8}
                fill={color}
              />
              <rect
                x={pos.x}
                y={pos.y + 12}
                width={140}
                height={12}
                fill={color}
              />
              <text
                x={pos.x + 70}
                y={pos.y + 16}
                textAnchor="middle"
                fill="#FFFDF8"
                fontSize={9}
                fontWeight={700}
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {book.label}
              </text>

              {/* Articles */}
              {book.articles.map((art, ai) => (
                <text
                  key={ai}
                  x={pos.x + 8}
                  y={pos.y + 40 + ai * 16}
                  fill="#4A4237"
                  fontSize={7}
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {art}
                </text>
              ))}
            </motion.g>
          );
        })}
      </svg>

      <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
        {graphBooks.map((book) => (
          <div key={book.id} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[book.id] }}
            />
            <span className="text-[0.625rem] text-gray-400">{book.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
