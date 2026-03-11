"use client";

import { motion } from "framer-motion";

interface FragmentedDataSVGProps {
  animate?: boolean;
}

/*
  Circular diagram: municipality at center, 16 data sources
  arranged in a ring around it. Broken dashed connections from
  each source to center with red X marks showing fragmentation.
*/
export default function FragmentedDataSVG({ animate = true }: FragmentedDataSVGProps) {
  const cx = 340;
  const cy = 235;
  const radius = 185;
  const nodeW = 86;
  const nodeH = 40;

  const sources = [
    { label: "CHIP", sub: "Contaduría Gral.", type: "gov" },
    { label: "SISFUT", sub: "Presupuesto", type: "gov" },
    { label: "SECOP II", sub: "Contratos", type: "gov" },
    { label: "SIRECI", sub: "CGR Rendición", type: "gov" },
    { label: "SIA Observa", sub: "Auditoría", type: "gov" },
    { label: "MUISCA", sub: "DIAN Exógena", type: "gov" },
    { label: "TerriData", sub: "DNP Indicadores", type: "gov" },
    { label: "FUT", sub: "Form. Único Terr.", type: "gov" },
    { label: "Excel", sub: "v3_FINAL(2).xlsx", type: "excel" },
    { label: "Excel", sub: "recaudo_2024.xls", type: "excel" },
    { label: "PDF", sub: "Estatuto tribut...", type: "pdf" },
    { label: "PDF", sub: "Acuerdo 042.pdf", type: "pdf" },
    { label: "Word", sub: "Informe_borrador", type: "paper" },
    { label: "Manual", sub: "Libro de registro", type: "paper" },
    { label: "Email", sub: "Bandeja (147 sin...)", type: "email" },
    { label: "WhatsApp", sub: "Grupo Hacienda", type: "email" },
  ];

  // Position each source on the circle
  const positioned = sources.map((src, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sources.length;
    return {
      ...src,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      angle,
    };
  });

  const typeColors: Record<string, { bg: string; border: string; accent: string; text: string }> = {
    gov: { bg: "#F0F4F8", border: "#B0BEC5", accent: "#607D8B", text: "#37474F" },
    excel: { bg: "#E8F5E9", border: "#81C784", accent: "#388E3C", text: "#1B5E20" },
    pdf: { bg: "#FFEBEE", border: "#E57373", accent: "#D32F2F", text: "#B71C1C" },
    paper: { bg: "#FFF8E1", border: "#FFD54F", accent: "#F9A825", text: "#E65100" },
    email: { bg: "#F3E5F5", border: "#BA68C8", accent: "#7B1FA2", text: "#4A148C" },
  };

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 680 480"
        fill="none"
        className="w-full"
        role="img"
        aria-label="Municipio en el centro rodeado de 16 fuentes de datos desconectadas: CHIP, SISFUT, SECOP, Excel, PDFs y más"
      >
        {/* Subtle radial guides */}
        <circle cx={cx} cy={cy} r={radius + 60} stroke="#E8E5E0" strokeWidth={0.4} strokeDasharray="3 8" opacity={0.4} />
        <circle cx={cx} cy={cy} r={radius} stroke="#E8E5E0" strokeWidth={0.3} strokeDasharray="2 6" opacity={0.3} />
        <circle cx={cx} cy={cy} r={70} stroke="#E8E5E0" strokeWidth={0.3} strokeDasharray="2 6" opacity={0.3} />

        {/* Broken connections from center to each source */}
        {positioned.map((src, i) => {
          // Line from center outward, broken at ~60% with a red X
          const dx = src.x - cx;
          const dy = src.y - cy;
          const breakPct = 0.55;
          const bx = cx + dx * breakPct;
          const by = cy + dy * breakPct;

          return (
            <motion.g
              key={`conn-${i}`}
              initial={animate ? { opacity: 0 } : { opacity: 0.35 }}
              animate={animate ? { opacity: 0.35 } : undefined}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.04 }}
            >
              {/* Segment from center to break */}
              <line
                x1={cx} y1={cy}
                x2={bx - 4 * Math.cos(src.angle)} y2={by - 4 * Math.sin(src.angle)}
                stroke="#D4D0CB"
                strokeWidth={0.8}
                strokeDasharray="4 4"
              />
              {/* Segment from break to node */}
              <line
                x1={bx + 4 * Math.cos(src.angle)} y1={by + 4 * Math.sin(src.angle)}
                x2={src.x} y2={src.y}
                stroke="#D4D0CB"
                strokeWidth={0.8}
                strokeDasharray="4 4"
              />
              {/* Red X at break */}
              <line x1={bx - 3} y1={by - 3} x2={bx + 3} y2={by + 3} stroke="#E53935" strokeWidth={1.2} strokeLinecap="round" opacity={0.55} />
              <line x1={bx + 3} y1={by - 3} x2={bx - 3} y2={by + 3} stroke="#E53935" strokeWidth={1.2} strokeLinecap="round" opacity={0.55} />
            </motion.g>
          );
        })}

        {/* ── Center: Municipality ── */}
        <motion.g
          initial={animate ? { scale: 0, opacity: 0 } : undefined}
          animate={animate ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.15, type: "spring", stiffness: 180, damping: 18 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {/* Glow ring */}
          <circle cx={cx} cy={cy} r={58} fill="#FDECEA" opacity={0.25} />
          {/* Main circle */}
          <circle cx={cx} cy={cy} r={46} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={1.2} />

          {/* Building icon (simplified alcaldía) */}
          <rect x={cx - 14} y={cy - 14} width={28} height={22} rx={2} fill="none" stroke="#9E9484" strokeWidth={1.2} />
          {/* Roof / pediment */}
          <path d={`M${cx - 18} ${cy - 14} L${cx} ${cy - 26} L${cx + 18} ${cy - 14}`} fill="none" stroke="#9E9484" strokeWidth={1.2} strokeLinejoin="round" />
          {/* Door */}
          <rect x={cx - 4} y={cy - 2} width={8} height={10} rx={1} fill="#9E9484" opacity={0.3} />
          {/* Windows */}
          <rect x={cx - 11} y={cy - 10} width={5} height={5} rx={0.5} fill="#9E9484" opacity={0.25} />
          <rect x={cx + 6} y={cy - 10} width={5} height={5} rx={0.5} fill="#9E9484" opacity={0.25} />
          {/* Flag */}
          <line x1={cx} y1={cy - 26} x2={cx} y2={cy - 32} stroke="#9E9484" strokeWidth={0.8} />
          <rect x={cx} y={cy - 32} width={6} height={4} rx={0.5} fill="#B8956A" opacity={0.6} />

          {/* Label */}
          <text
            x={cx} y={cy + 22}
            textAnchor="middle"
            fontSize={8}
            fontWeight={700}
            fill="#2C2418"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            letterSpacing="0.06em"
          >
            MUNICIPIO
          </text>
          <text
            x={cx} y={cy + 32}
            textAnchor="middle"
            fontSize={6}
            fill="#9E9484"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            1 funcionario
          </text>
        </motion.g>

        {/* ── Source nodes around the ring ── */}
        {positioned.map((src, i) => {
          const colors = typeColors[src.type];
          const nx = src.x - nodeW / 2;
          const ny = src.y - nodeH / 2;

          return (
            <motion.g
              key={`node-${i}`}
              initial={animate ? { opacity: 0, scale: 0.8 } : { opacity: 1 }}
              animate={animate ? { opacity: 1, scale: 1 } : undefined}
              transition={{
                duration: 0.35,
                delay: 0.25 + i * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              style={{ transformOrigin: `${src.x}px ${src.y}px` }}
            >
              {/* Shadow */}
              <rect x={nx + 1.5} y={ny + 1.5} width={nodeW} height={nodeH} rx={6} fill="#0000000A" />
              {/* Card */}
              <rect x={nx} y={ny} width={nodeW} height={nodeH} rx={6} fill={colors.bg} stroke={colors.border} strokeWidth={0.8} />
              {/* Accent strip */}
              <rect x={nx} y={ny} width={3} height={nodeH} rx={1.5} fill={colors.accent} opacity={0.7} />
              {/* Label */}
              <text
                x={nx + 12}
                y={ny + 16}
                fontSize={8.5}
                fontWeight={700}
                fill={colors.text}
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {src.label}
              </text>
              {/* Sub */}
              <text
                x={nx + 12}
                y={ny + 28}
                fontSize={6}
                fill={colors.accent}
                fontFamily="'Plus Jakarta Sans', sans-serif"
                opacity={0.75}
              >
                {src.sub}
              </text>
            </motion.g>
          );
        })}

        {/* Pulsing question marks near center */}
        {[
          { x: cx + 22, y: cy - 42, size: 11, delay: 1.0 },
          { x: cx - 28, y: cy - 38, size: 9, delay: 1.4 },
          { x: cx + 34, y: cy + 14, size: 8, delay: 1.8 },
        ].map((q, i) => (
          <motion.text
            key={`q-${i}`}
            x={q.x}
            y={q.y}
            fontSize={q.size}
            fontWeight={700}
            fill="#E53935"
            opacity={0.6}
            initial={animate ? { opacity: 0 } : { opacity: 0.6 }}
            animate={animate ? { opacity: [0, 0.6, 0.2, 0.6] } : undefined}
            transition={{ duration: 2.5, delay: q.delay, repeat: Infinity, repeatType: "reverse" }}
          >
            ?
          </motion.text>
        ))}
      </svg>

      {/* Bottom summary stats */}
      <motion.div
        className="flex items-center justify-center gap-6 md:gap-10 mt-2 flex-wrap"
        initial={animate ? { opacity: 0, y: 10 } : { opacity: 1 }}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: 1.6 }}
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
