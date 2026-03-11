"use client";

import { motion } from "framer-motion";

interface FragmentedDataSVGProps {
  animate?: boolean;
}

/*
  "Star SVG" — Visually chaotic illustration of fragmented,
  disconnected public data sources in Colombian municipalities.
  Each source has a distinct visual identity (color-coded by type).
  Broken dashed lines + red X marks emphasize the disconnect.
*/
export default function FragmentedDataSVG({ animate = true }: FragmentedDataSVGProps) {
  // Data sources positioned in a scattered, organic layout
  const sources = [
    // Government platforms (blue-gray)
    { x: 68, y: 52, label: "CHIP", sub: "Contaduría Gral.", type: "gov", w: 82, h: 44 },
    { x: 310, y: 28, label: "SISFUT", sub: "Presupuesto", type: "gov", w: 82, h: 44 },
    { x: 540, y: 64, label: "SECOP", sub: "Contratos", type: "gov", w: 82, h: 44 },
    { x: 160, y: 172, label: "SIRECI", sub: "CGR Rendición", type: "gov", w: 82, h: 44 },
    { x: 475, y: 178, label: "SIA Observa", sub: "Auditoría", type: "gov", w: 92, h: 44 },
    { x: 44, y: 280, label: "MUISCA", sub: "DIAN Exógena", type: "gov", w: 88, h: 44 },
    { x: 578, y: 282, label: "DNP", sub: "TerriData", type: "gov", w: 74, h: 44 },

    // Spreadsheets (green)
    { x: 210, y: 108, label: "Excel", sub: "v3_FINAL(2).xlsx", type: "excel", w: 88, h: 44 },
    { x: 410, y: 118, label: "Excel", sub: "FUT_copia.xlsx", type: "excel", w: 88, h: 44 },
    { x: 310, y: 288, label: "Excel", sub: "recaudo_2024.xls", type: "excel", w: 100, h: 44 },

    // PDFs (red)
    { x: 100, y: 350, label: "PDF", sub: "Estatuto tribut...", type: "pdf", w: 88, h: 44 },
    { x: 456, y: 348, label: "PDF", sub: "Acuerdo 042.pdf", type: "pdf", w: 88, h: 44 },

    // Manual/paper (warm)
    { x: 258, y: 218, label: "Manual", sub: "Libro de registro", type: "paper", w: 90, h: 44 },
    { x: 186, y: 432, label: "Email", sub: "Bandeja(147 sin..)", type: "email", w: 98, h: 44 },
    { x: 434, y: 428, label: "WhatsApp", sub: "Grupo Hacienda", type: "email", w: 100, h: 44 },

    // FUT (orange)
    { x: 580, y: 186, label: "FUT", sub: "Form. Único Terr.", type: "gov", w: 82, h: 44 },
  ];

  // Colors by source type
  const typeColors: Record<string, { bg: string; border: string; accent: string; text: string }> = {
    gov: { bg: "#F0F4F8", border: "#B0BEC5", accent: "#607D8B", text: "#37474F" },
    excel: { bg: "#E8F5E9", border: "#81C784", accent: "#388E3C", text: "#1B5E20" },
    pdf: { bg: "#FFEBEE", border: "#E57373", accent: "#D32F2F", text: "#B71C1C" },
    paper: { bg: "#FFF8E1", border: "#FFD54F", accent: "#F9A825", text: "#E65100" },
    email: { bg: "#F3E5F5", border: "#BA68C8", accent: "#7B1FA2", text: "#4A148C" },
  };

  // Broken connections — pairs of source indices
  const connections: [number, number][] = [
    [0, 7], [1, 8], [2, 4], [3, 12], [5, 10], [6, 4],
    [7, 12], [8, 15], [9, 11], [3, 7], [1, 7], [10, 13],
    [0, 3], [2, 8], [5, 9], [14, 11], [6, 15], [12, 9],
  ];

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 680 490"
        fill="none"
        className="w-full"
        role="img"
        aria-label="Múltiples fuentes de datos gubernamentales desconectadas y fragmentadas: CHIP, SISFUT, SECOP, Excel, PDFs, SIRECI y más"
      >
        {/* Background subtle grid to reinforce "data" feeling */}
        <defs>
          <pattern id="fragGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5E5" strokeWidth="0.3" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="680" height="490" fill="url(#fragGrid)" opacity="0.4" />

        {/* Broken connection lines */}
        {connections.map(([a, b], i) => {
          const sa = sources[a];
          const sb = sources[b];
          if (!sa || !sb) return null;
          const ax = sa.x + sa.w / 2;
          const ay = sa.y + sa.h / 2;
          const bx = sb.x + sb.w / 2;
          const by = sb.y + sb.h / 2;
          const mx = (ax + bx) / 2;
          const my = (ay + by) / 2;

          return (
            <motion.g
              key={`conn-${i}`}
              initial={animate ? { opacity: 0 } : { opacity: 0.3 }}
              animate={animate ? { opacity: 0.3 } : undefined}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.03 }}
            >
              {/* Two broken segments with gap in middle */}
              <line
                x1={ax} y1={ay}
                x2={mx - 6} y2={my - 3}
                stroke="#D4D0CB"
                strokeWidth={0.7}
                strokeDasharray="4 5"
              />
              <line
                x1={mx + 6} y1={my + 3}
                x2={bx} y2={by}
                stroke="#D4D0CB"
                strokeWidth={0.7}
                strokeDasharray="4 5"
              />
              {/* Red X at break point */}
              <line x1={mx - 3} y1={my - 3} x2={mx + 3} y2={my + 3} stroke="#E53935" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
              <line x1={mx + 3} y1={my - 3} x2={mx - 3} y2={my + 3} stroke="#E53935" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
            </motion.g>
          );
        })}

        {/* Source nodes */}
        {sources.map((src, i) => {
          const colors = typeColors[src.type];
          return (
            <motion.g
              key={`${src.label}-${i}`}
              initial={animate ? { opacity: 0, scale: 0.85 } : { opacity: 1 }}
              animate={animate ? { opacity: 1, scale: 1 } : undefined}
              transition={{
                duration: 0.4,
                delay: 0.2 + i * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              style={{ transformOrigin: `${src.x + src.w / 2}px ${src.y + src.h / 2}px` }}
            >
              {/* Card shadow */}
              <rect
                x={src.x + 2}
                y={src.y + 2}
                width={src.w}
                height={src.h}
                rx={6}
                fill="#00000008"
              />
              {/* Card body */}
              <rect
                x={src.x}
                y={src.y}
                width={src.w}
                height={src.h}
                rx={6}
                fill={colors.bg}
                stroke={colors.border}
                strokeWidth={0.8}
              />
              {/* Type accent strip on left */}
              <rect
                x={src.x}
                y={src.y}
                width={3}
                height={src.h}
                rx={1.5}
                fill={colors.accent}
                opacity={0.7}
              />
              {/* Label */}
              <text
                x={src.x + 12}
                y={src.y + 17}
                fontSize={9}
                fontWeight={700}
                fill={colors.text}
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {src.label}
              </text>
              {/* Sub label */}
              <text
                x={src.x + 12}
                y={src.y + 31}
                fontSize={6.5}
                fill={colors.accent}
                fontFamily="'Plus Jakarta Sans', sans-serif"
                opacity={0.8}
              >
                {src.sub}
              </text>
            </motion.g>
          );
        })}

        {/* Floating error indicators scattered around */}
        {[
          { x: 178, y: 148, text: "#REF!" },
          { x: 380, y: 90, text: "#N/A" },
          { x: 520, y: 240, text: "ERROR" },
          { x: 148, y: 395, text: "???" },
          { x: 368, y: 370, text: "#VALUE!" },
          { x: 260, y: 330, text: "DUPLICADO" },
        ].map((err, i) => (
          <motion.text
            key={`err-${i}`}
            x={err.x}
            y={err.y}
            fontSize={7}
            fontWeight={700}
            fontFamily="monospace"
            fill="#E53935"
            opacity={0.45}
            initial={animate ? { opacity: 0 } : { opacity: 0.45 }}
            animate={animate ? { opacity: [0, 0.45, 0.2, 0.45] } : undefined}
            transition={{
              duration: 3,
              delay: 1.2 + i * 0.3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {err.text}
          </motion.text>
        ))}

        {/* Central frustration text */}
        <motion.g
          initial={animate ? { opacity: 0, y: 8 } : { opacity: 1 }}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <rect x="240" y="138" width="200" height="40" rx="20" fill="#1A1A1A" opacity="0.06" />
          <text
            x="340"
            y="155"
            textAnchor="middle"
            fontSize={7.5}
            fontWeight={600}
            fill="#9E9484"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            letterSpacing="0.1em"
          >
            SIN CONEXION ENTRE SI
          </text>
          <text
            x="340"
            y="168"
            textAnchor="middle"
            fontSize={6.5}
            fill="#B8956A"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            16+ fuentes &middot; 0 integradas &middot; 1 funcionario
          </text>
        </motion.g>
      </svg>

      {/* Bottom summary stats */}
      <motion.div
        className="flex items-center justify-center gap-6 md:gap-10 mt-4 flex-wrap"
        initial={animate ? { opacity: 0, y: 10 } : { opacity: 1 }}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: 1.8 }}
      >
        {[
          { value: "16+", label: "fuentes de datos" },
          { value: "0", label: "integradas entre sí" },
          { value: "∞", label: "horas perdidas" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <span className="block font-serif font-bold text-xl md:text-2xl text-ochre">
              {stat.value}
            </span>
            <span className="block text-[0.6875rem] text-gray-400 font-medium mt-0.5">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
