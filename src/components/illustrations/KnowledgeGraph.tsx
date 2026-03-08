"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { graphBooks, crossReferences } from "@/data/knowledge-graph-data";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  type: "root" | "book" | "article";
  category: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: "hierarchy" | "reference";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function buildGraph() {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, Node>();

  const cx = 400;
  const cy = 270;
  const bookR = 140;

  // Root
  const root: Node = {
    id: "root",
    label: "Estatuto",
    x: cx,
    y: cy,
    r: 26,
    type: "root",
    category: "root",
  };
  nodes.push(root);
  nodeMap.set("root", root);

  graphBooks.forEach((book, bi) => {
    const angle = ((bi * 60 - 90) * Math.PI) / 180;
    const bx = cx + bookR * Math.cos(angle);
    const by = cy + bookR * Math.sin(angle);
    const bookId = `book-${book.id}`;

    const bookNode: Node = {
      id: bookId,
      label: book.label,
      x: bx,
      y: by,
      r: 17,
      type: "book",
      category: book.id,
    };
    nodes.push(bookNode);
    nodeMap.set(bookId, bookNode);
    edges.push({
      id: `e-root-${bookId}`,
      source: "root",
      target: bookId,
      type: "hierarchy",
      x1: cx,
      y1: cy,
      x2: bx,
      y2: by,
    });

    const count = book.articles.length;
    const arcSpan = (85 * Math.PI) / 180;
    const startAngle = angle - arcSpan / 2;
    const step = count > 1 ? arcSpan / (count - 1) : 0;

    book.articles.forEach((article, ai) => {
      const aAngle = startAngle + ai * step;
      const dist = 55 + ((ai * 7 + bi * 11) % 4) * 10;
      const ax = bx + dist * Math.cos(aAngle);
      const ay = by + dist * Math.sin(aAngle);
      const artId = `${book.id}-${ai}`;

      const artNode: Node = {
        id: artId,
        label: article,
        x: ax,
        y: ay,
        r: 4.5,
        type: "article",
        category: book.id,
      };
      nodes.push(artNode);
      nodeMap.set(artId, artNode);
      edges.push({
        id: `e-${bookId}-${artId}`,
        source: bookId,
        target: artId,
        type: "hierarchy",
        x1: bx,
        y1: by,
        x2: ax,
        y2: ay,
      });
    });
  });

  crossReferences.forEach(([src, tgt], i) => {
    const s = nodeMap.get(src);
    const t = nodeMap.get(tgt);
    if (s && t) {
      edges.push({
        id: `xref-${i}`,
        source: src,
        target: tgt,
        type: "reference",
        x1: s.x,
        y1: s.y,
        x2: t.x,
        y2: t.y,
      });
    }
  });

  return { nodes, edges };
}

// Deterministic pseudo-random
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const { nodes: NODES, edges: EDGES } = buildGraph();

const ADJACENCY = (() => {
  const map = new Map<string, Set<string>>();
  EDGES.forEach((e) => {
    if (!map.has(e.source)) map.set(e.source, new Set());
    if (!map.has(e.target)) map.set(e.target, new Set());
    map.get(e.source)!.add(e.target);
    map.get(e.target)!.add(e.source);
  });
  return map;
})();

interface KnowledgeGraphProps {
  animate?: boolean;
}

export default function KnowledgeGraph({ animate = true }: KnowledgeGraphProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const constellationDots = useMemo(() => {
    const rand = seededRand(42);
    return Array.from({ length: 70 }, () => ({
      x: rand() * 800,
      y: rand() * 540,
      r: 0.4 + rand() * 0.8,
      delay: rand() * 8,
      dur: 3 + rand() * 5,
    }));
  }, []);

  const isActive = (id: string) =>
    !hovered ? false : id === hovered || (ADJACENCY.get(hovered)?.has(id) ?? false);

  const isEdgeActive = (e: Edge) =>
    !hovered ? false : e.source === hovered || e.target === hovered;

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.97 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 1, 0.5, 1] as const }}
    >
      <svg
        viewBox="0 0 800 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        role="img"
        aria-label="Grafo interactivo del Estatuto Tributario Municipal con 6 libros y sus artículos conectados"
      >
        <style>{`
          @keyframes kg-twinkle {
            0%, 100% { opacity: 0.04; }
            50% { opacity: 0.18; }
          }
          .kg-dot { animation: kg-twinkle ease-in-out infinite; }
          .kg-node { transition: opacity 0.2s ease, fill 0.2s ease; cursor: pointer; }
          .kg-edge { transition: opacity 0.2s ease, stroke 0.2s ease; }
          .kg-label { pointer-events: none; transition: opacity 0.2s ease; }
        `}</style>

        {/* Constellation background */}
        {constellationDots.map((d, i) => (
          <circle
            key={`c-${i}`}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill="#FFFDF8"
            className="kg-dot"
            style={{ animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }}
          />
        ))}

        {/* Glow filter for root */}
        <defs>
          <filter id="kg-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {EDGES.map((e) => {
          const active = isEdgeActive(e);
          const dimmed = hovered && !active;
          const isRef = e.type === "reference";
          return (
            <line
              key={e.id}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              className="kg-edge"
              stroke={
                active
                  ? isRef
                    ? "#B8956A"
                    : "rgba(255,253,248,0.3)"
                  : isRef
                    ? "rgba(184,149,106,0.18)"
                    : "rgba(255,253,248,0.06)"
              }
              strokeWidth={isRef ? (active ? 1.5 : 0.7) : active ? 0.8 : 0.4}
              strokeDasharray={isRef ? "4 3" : undefined}
              opacity={dimmed ? 0.12 : 1}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((node) => {
          const active = isActive(node.id);
          const isHov = node.id === hovered;
          const dimmed = hovered && !active;

          let fill: string;
          let stroke = "none";
          let sw = 0;

          if (node.type === "root") {
            fill = "#B8956A";
            stroke = isHov ? "#FFFDF8" : "#B8956A";
            sw = 2;
          } else if (node.type === "book") {
            fill = active ? "rgba(184,149,106,0.25)" : "rgba(255,253,248,0.06)";
            stroke = active ? "#B8956A" : "rgba(255,253,248,0.15)";
            sw = active ? 1.5 : 0.8;
          } else {
            fill = active ? "#B8956A" : "rgba(255,253,248,0.2)";
          }

          return (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={isHov ? node.r * 1.4 : node.r}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              className="kg-node"
              opacity={dimmed ? 0.15 : 1}
              filter={node.type === "root" ? "url(#kg-glow)" : undefined}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setHovered((p) => (p === node.id ? null : node.id))}
            />
          );
        })}

        {/* Book & root labels */}
        {NODES.filter((n) => n.type !== "article").map((node) => {
          const active = isActive(node.id);
          const vis = !hovered || active;
          return (
            <text
              key={`lbl-${node.id}`}
              x={node.x}
              y={node.type === "root" ? node.y + 1 : node.y + node.r + 13}
              textAnchor="middle"
              dominantBaseline={node.type === "root" ? "central" : undefined}
              fill={hovered && active ? "#B8956A" : "#FFFDF8"}
              fontSize={node.type === "root" ? 11 : 9}
              fontWeight={node.type === "root" ? 700 : 600}
              fontFamily="'Plus Jakarta Sans', sans-serif"
              className="kg-label"
              opacity={vis ? (node.type === "root" ? 1 : 0.7) : 0.15}
            >
              {node.label}
            </text>
          );
        })}

        {/* Tooltip for hovered node */}
        {hovered &&
          (() => {
            const node = NODES.find((n) => n.id === hovered);
            if (!node || node.type === "root") return null;
            const lbl = node.label;
            const w = lbl.length * 5.8 + 20;
            const tx = Math.min(Math.max(node.x, w / 2 + 8), 800 - w / 2 - 8);
            const ty = node.y - node.r - 14;
            return (
              <g className="kg-label">
                <rect
                  x={tx - w / 2}
                  y={ty - 11}
                  width={w}
                  height={22}
                  rx={5}
                  fill="rgba(44, 36, 24, 0.88)"
                  stroke="rgba(184, 149, 106, 0.3)"
                  strokeWidth={0.5}
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFDF8"
                  fontSize={9.5}
                  fontWeight={500}
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                >
                  {lbl}
                </text>
              </g>
            );
          })()}
      </svg>

      {/* Interaction hint */}
      <p className="text-center text-[0.75rem] text-paper/40 mt-3 hidden md:block">
        Explora el grafo — pasa el cursor sobre los nodos
      </p>
    </motion.div>
  );
}
