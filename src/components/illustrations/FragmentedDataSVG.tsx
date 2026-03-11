"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface FragmentedDataSVGProps {
  animate?: boolean;
}

/*
  Refined editorial diagram: municipality at center, 16 data
  sources radiating outward. Near-monochromatic palette.
  Clean break indicators. No decorative noise.
*/

interface Source {
  label: string;
  sub: string;
  type: "gov" | "excel" | "pdf" | "paper" | "email";
  pain: string;
}

const innerSources: Source[] = [
  { label: "CHIP", sub: "Contaduría General", type: "gov", pain: "Carga manual de datos contables cada trimestre" },
  { label: "SISFUT", sub: "Presupuesto", type: "gov", pain: "Formato propio sin cruce con ejecución real" },
  { label: "SECOP II", sub: "Contratos", type: "gov", pain: "Portal externo sin conexión a hacienda" },
  { label: "SIRECI", sub: "Rendición CGR", type: "gov", pain: "Consolidación manual con riesgo de multa" },
  { label: "SIA Observa", sub: "Auditoría", type: "gov", pain: "Requiere datos de múltiples sistemas" },
  { label: "MUISCA", sub: "DIAN Exógena", type: "gov", pain: "XML armado a mano, alto riesgo de rechazo" },
  { label: "TerriData", sub: "DNP", type: "gov", pain: "Indicadores sin vínculo al sistema local" },
  { label: "FUT", sub: "Form. Único Terr.", type: "gov", pain: "Formulario llenado manualmente cada trimestre" },
];

const outerSources: Source[] = [
  { label: "Excel", sub: "presupuesto_v4.xlsx", type: "excel", pain: "Sin control de versiones ni validación" },
  { label: "PDF", sub: "Estatuto_tribut.pdf", type: "pdf", pain: "400+ páginas sin búsqueda inteligente" },
  { label: "Email", sub: "147 sin leer", type: "email", pain: "Solicitudes perdidas entre correos" },
  { label: "Excel", sub: "FUT_FINAL(2).xlsx", type: "excel", pain: "Copiar y pegar entre sistemas" },
  { label: "Word", sub: "Informe_borrador", type: "paper", pain: "Borrador reescrito sin control de cambios" },
  { label: "PDF", sub: "Acuerdo_042.pdf", type: "pdf", pain: "Normativa estática, difícil de consultar" },
  { label: "WhatsApp", sub: "Grupo Hacienda", type: "email", pain: "Decisiones sin registro formal" },
  { label: "Carpeta", sub: "Archivo físico", type: "paper", pain: "Documentos sin digitalizar" },
];

// Subtle accent colors — all muted, not saturated
const accentByType: Record<string, string> = {
  gov: "#78909C",
  excel: "#7CB342",
  pdf: "#E57373",
  paper: "#FFB74D",
  email: "#AB47BC",
};

export default function FragmentedDataSVG({ animate = true }: FragmentedDataSVGProps) {
  const cx = 400, cy = 270;
  const innerR = 142, outerR = 248;
  const [hovered, setHovered] = useState<number | null>(null);

  // All 16 sources in a flat array with computed positions
  const allSources = [
    ...innerSources.map((s, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 8;
      return { ...s, x: cx + innerR * Math.cos(angle), y: cy + innerR * Math.sin(angle), ring: "inner" as const, w: 84, h: 38 };
    }),
    ...outerSources.map((s, i) => {
      const angle = -Math.PI / 2 + (Math.PI / 8) + (i * 2 * Math.PI) / 8;
      return { ...s, x: cx + outerR * Math.cos(angle), y: cy + outerR * Math.sin(angle), ring: "outer" as const, w: 90, h: 38 };
    }),
  ];

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 800 545"
        fill="none"
        className="w-full"
        role="img"
        aria-label="Municipio en el centro rodeado de 16 fuentes de datos desconectadas"
      >
        {/* ── Single subtle guide ring ── */}
        <circle cx={cx} cy={cy} r={innerR} stroke="#EAE6E1" strokeWidth={0.5} opacity={0.5} />
        <circle cx={cx} cy={cy} r={outerR} stroke="#EAE6E1" strokeWidth={0.3} opacity={0.3} />

        {/* ── Radial connections — all 16, broken at midpoint ── */}
        {allSources.map((src, i) => {
          const dx = src.x - cx, dy = src.y - cy;
          const len = Math.hypot(dx, dy);
          const nx = dx / len, ny = dy / len;
          const bPct = src.ring === "inner" ? 0.46 : 0.38;
          const bx = cx + dx * bPct, by = cy + dy * bPct;
          const isActive = hovered === i;
          const baseOpacity = src.ring === "inner" ? 0.3 : 0.18;
          const opacity = hovered !== null ? (isActive ? 0.6 : 0.08) : baseOpacity;

          return (
            <g key={`conn-${i}`} style={{ opacity, transition: "opacity 0.25s ease" }}>
              {/* Line from center to break */}
              <line
                x1={cx + nx * 48} y1={cy + ny * 48}
                x2={bx - nx * 8} y2={by - ny * 8}
                stroke="#C8C2BA" strokeWidth={src.ring === "inner" ? 0.8 : 0.5}
              />
              {/* Line from break to node */}
              <line
                x1={bx + nx * 8} y1={by + ny * 8}
                x2={src.x - nx * (src.w / 2 - 2)} y2={src.y - ny * (src.h / 2 - 2)}
                stroke="#C8C2BA" strokeWidth={src.ring === "inner" ? 0.8 : 0.5}
              />
              {/* Break indicator: circle with bold × */}
              <circle cx={bx} cy={by} r={6} fill="#FAFAF8" stroke="#D4A39A" strokeWidth={0.8} />
              <line x1={bx - 2.8} y1={by - 2.8} x2={bx + 2.8} y2={by + 2.8} stroke="#C0826A" strokeWidth={1.1} strokeLinecap="round" />
              <line x1={bx + 2.8} y1={by - 2.8} x2={bx - 2.8} y2={by + 2.8} stroke="#C0826A" strokeWidth={1.1} strokeLinecap="round" />
            </g>
          );
        })}

        {/* ── Center: Municipality ── */}
        <motion.g
          initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
          animate={animate ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={46} fill="#FAFAF8" stroke="#D4CFC7" strokeWidth={1.2} />
          <circle cx={cx} cy={cy} r={42} fill="none" stroke="#E8E4DE" strokeWidth={0.4} />

          {/* Building — clean, slightly larger */}
          <rect x={cx - 14} y={cy - 14} width={28} height={20} rx={1} fill="none" stroke="#8A8279" strokeWidth={1} />
          <path d={`M${cx - 18} ${cy - 14} L${cx} ${cy - 24} L${cx + 18} ${cy - 14}`} fill="none" stroke="#8A8279" strokeWidth={1} strokeLinejoin="round" />
          <rect x={cx - 3.5} y={cy - 2} width={7} height={9} rx={0.8} fill="#8A8279" opacity={0.2} />
          <rect x={cx - 10} y={cy - 10} width={5} height={4} rx={0.5} fill="#8A8279" opacity={0.15} />
          <rect x={cx + 5} y={cy - 10} width={5} height={4} rx={0.5} fill="#8A8279" opacity={0.15} />

          <text x={cx} y={cy + 20} textAnchor="middle" fontSize={7} fontWeight={700} fill="#3D3830" fontFamily="'Space Grotesk', sans-serif" letterSpacing="0.08em">
            MUNICIPIO
          </text>
          <text x={cx} y={cy + 30} textAnchor="middle" fontSize={5.5} fill="#A09A92" fontFamily="'Plus Jakarta Sans', sans-serif">
            Sec. de Hacienda
          </text>
        </motion.g>

        {/* ── Source nodes ── */}
        {allSources.map((src, i) => {
          const accent = accentByType[src.type];
          const nx = src.x - src.w / 2, ny = src.y - src.h / 2;
          const isHov = hovered === i;
          const delay = src.ring === "inner" ? 0.15 + i * 0.04 : 0.4 + (i - 8) * 0.04;

          return (
            <motion.g
              key={`node-${i}`}
              initial={animate ? { opacity: 0, y: 6 } : { opacity: 1 }}
              animate={animate ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <title>{src.pain}</title>

              {/* Shadow */}
              <rect x={nx + 1} y={ny + 1.5} width={src.w} height={src.h} rx={4} fill="#00000006" />

              {/* Card */}
              <rect
                x={nx} y={ny} width={src.w} height={src.h} rx={4}
                fill="#FAFAF8"
                stroke={isHov ? "#B8956A" : "#E5E0D8"}
                strokeWidth={isHov ? 1.2 : 0.7}
                style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
              />

              {/* Accent strip */}
              <rect x={nx + 0.5} y={ny + 6} width={2.5} height={src.h - 12} rx={1} fill={accent} opacity={isHov ? 0.8 : 0.45} />

              {/* Label */}
              <text
                x={nx + 11} y={ny + 15}
                fontSize={src.ring === "inner" ? 8.5 : 8}
                fontWeight={700}
                fill="#3D3830"
                fontFamily="'Space Grotesk', sans-serif"
              >
                {src.label}
              </text>

              {/* Sub label */}
              <text
                x={nx + 11} y={ny + 27}
                fontSize={6}
                fill="#A09A92"
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {src.sub}
              </text>
            </motion.g>
          );
        })}

        {/* ── Tooltip ── */}
        {hovered !== null && (() => {
          const src = allSources[hovered];
          const above = src.y > cy;
          const tx = Math.max(95, Math.min(705, src.x));
          const ty = above ? src.y - src.h / 2 - 28 : src.y + src.h / 2 + 8;
          const tw = Math.min(190, src.pain.length * 5.2 + 24);
          return (
            <g>
              <rect x={tx - tw / 2} y={ty} width={tw} height={22} rx={3} fill="#2C2418" opacity={0.92} />
              <text x={tx} y={ty + 14} textAnchor="middle" fontSize={6} fill="#F5F0E8" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight={500}>
                {src.pain}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* ── Bottom stats — minimal ── */}
      <motion.div
        className="flex items-center justify-center gap-10 md:gap-14 mt-2"
        initial={animate ? { opacity: 0 } : { opacity: 1 }}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        {[
          { value: "16+", label: "fuentes aisladas" },
          { value: "0", label: "conexiones" },
          { value: "2 sem", label: "por reporte" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <span className="block font-serif font-bold text-lg md:text-xl tracking-tight text-ink">{stat.value}</span>
            <span className="block text-[0.6875rem] text-gray-400 mt-0.5">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
