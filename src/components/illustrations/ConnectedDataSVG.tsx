"use client";

import { motion } from "framer-motion";

interface ConnectedDataSVGProps {
  animate?: boolean;
}

/*
  Mirror of FragmentedDataSVG — same 16 sources, same layout,
  but now all connected through Gobia with solid ochre lines.
  Near-monochromatic palette. No decorative noise.
*/

interface Source {
  label: string;
  sub: string;
  type: "gov" | "excel" | "pdf" | "paper" | "email";
}

const innerSources: Source[] = [
  { label: "CHIP", sub: "Contaduría General", type: "gov" },
  { label: "SISFUT", sub: "Presupuesto", type: "gov" },
  { label: "SECOP II", sub: "Contratos públicos", type: "gov" },
  { label: "SIRECI", sub: "Rendición CGR", type: "gov" },
  { label: "SIA Observa", sub: "Auditoría territorial", type: "gov" },
  { label: "MUISCA", sub: "DIAN Exógena", type: "gov" },
  { label: "TerriData", sub: "DNP Indicadores", type: "gov" },
  { label: "FUT", sub: "Formulario Único", type: "gov" },
];

const outerSources: Source[] = [
  { label: "Excel", sub: "Importación directa", type: "excel" },
  { label: "PDF", sub: "Indexado con IA", type: "pdf" },
  { label: "Email", sub: "Alertas automáticas", type: "email" },
  { label: "Excel", sub: "Migración asistida", type: "excel" },
  { label: "Word", sub: "Generación automática", type: "paper" },
  { label: "PDF", sub: "Consulta semántica", type: "pdf" },
  { label: "WhatsApp", sub: "Notificaciones", type: "email" },
  { label: "Archivo", sub: "Digitalizado", type: "paper" },
];

// Same subtle accent colors as FragmentedDataSVG
const accentByType: Record<string, string> = {
  gov: "#78909C",
  excel: "#7CB342",
  pdf: "#E57373",
  paper: "#FFB74D",
  email: "#AB47BC",
};

const tooltipByType: Record<string, string> = {
  gov: "Sincronización automática vía API",
  excel: "Importación y exportación automatizada",
  pdf: "Indexado con IA semántica",
  paper: "Generación y digitalización automática",
  email: "Notificaciones en tiempo real",
};

export default function ConnectedDataSVG({ animate = true }: ConnectedDataSVGProps) {
  const cx = 400, cy = 270;
  const innerR = 142, outerR = 248;

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
        aria-label="Todas las fuentes de datos conectadas a través de Gobia"
      >
        {/* ── Subtle guide rings ── */}
        <circle cx={cx} cy={cy} r={innerR} stroke="#D4CFC7" strokeWidth={0.5} opacity={0.4} />
        <circle cx={cx} cy={cy} r={outerR} stroke="#D4CFC7" strokeWidth={0.3} opacity={0.25} />

        {/* ── Solid connections — all 16, unbroken, ochre ── */}
        {allSources.map((src, i) => {
          const dx = src.x - cx, dy = src.y - cy;
          const len = Math.hypot(dx, dy);
          const nx = dx / len, ny = dy / len;
          const delay = src.ring === "inner" ? 0.3 + i * 0.05 : 0.6 + (i - 8) * 0.05;

          return (
            <motion.line
              key={`conn-${i}`}
              x1={cx + nx * 48} y1={cy + ny * 48}
              x2={src.x - nx * (src.w / 2 - 2)} y2={src.y - ny * (src.h / 2 - 2)}
              stroke="#B8956A"
              strokeWidth={src.ring === "inner" ? 0.9 : 0.6}
              opacity={src.ring === "inner" ? 0.3 : 0.2}
              initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
              animate={animate ? { pathLength: 1, opacity: src.ring === "inner" ? 0.3 : 0.2 } : undefined}
              transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}

        {/* ── Small green checkmarks at midpoint of inner connections ── */}
        {allSources.slice(0, 8).map((src, i) => {
          const dx = src.x - cx, dy = src.y - cy;
          const mx = cx + dx * 0.46, my = cy + dy * 0.46;
          return (
            <motion.g
              key={`check-${i}`}
              initial={animate ? { opacity: 0, scale: 0 } : undefined}
              animate={animate ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.3, delay: 0.8 + i * 0.05, type: "spring" }}
              style={{ transformOrigin: `${mx}px ${my}px` }}
            >
              <circle cx={mx} cy={my} r={6} fill="#FAFAF8" stroke="#86EFAC" strokeWidth={0.8} />
              <path
                d={`M${mx - 3} ${my + 0.3} L${mx - 0.5} ${my + 3} L${mx + 3.5} ${my - 2}`}
                stroke="#16a34a" strokeWidth={1.1} fill="none"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </motion.g>
          );
        })}

        {/* ── Center: Gobia ── */}
        <motion.g
          initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
          animate={animate ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {/* Subtle pulse ring */}
          <motion.circle
            cx={cx} cy={cy} r={46}
            fill="none" stroke="#B8956A"
            strokeWidth={0.8}
            initial={{ opacity: 0, scale: 1 }}
            animate={animate ? { opacity: [0, 0.3, 0], scale: [1, 1.25, 1.4] } : undefined}
            transition={{ duration: 2.5, delay: 1.2, repeat: Infinity, repeatDelay: 3, ease: "easeOut" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          <circle cx={cx} cy={cy} r={46} fill="#FAFAF8" stroke="#B8956A" strokeWidth={1.2} />
          <circle cx={cx} cy={cy} r={42} fill="none" stroke="#D4CFC7" strokeWidth={0.4} />

          <text
            x={cx} y={cy + 2}
            textAnchor="middle" dominantBaseline="central"
            fontSize={16} fontWeight={700} fill="#B8956A"
            fontFamily="'Space Grotesk', sans-serif"
          >
            Gobia
          </text>
          <text
            x={cx} y={cy + 18}
            textAnchor="middle" fontSize={5} fill="#A09A92"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            letterSpacing="0.08em"
          >
            PLATAFORMA INTEGRADA
          </text>
        </motion.g>

        {/* ── Source nodes — identical card style to FragmentedDataSVG ── */}
        {allSources.map((src, i) => {
          const accent = accentByType[src.type];
          const nx = src.x - src.w / 2, ny = src.y - src.h / 2;
          const delay = src.ring === "inner" ? 0.15 + i * 0.04 : 0.4 + (i - 8) * 0.04;

          return (
            <motion.g
              key={`node-${i}`}
              initial={animate ? { opacity: 0, y: 6 } : { opacity: 1 }}
              animate={animate ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
            >
              <title>{src.label}: {tooltipByType[src.type]}</title>
              {/* Shadow */}
              <rect x={nx + 1} y={ny + 1.5} width={src.w} height={src.h} rx={4} fill="#00000006" />

              {/* Card */}
              <rect
                x={nx} y={ny} width={src.w} height={src.h} rx={4}
                fill="#FAFAF8"
                stroke="#D4CFC7"
                strokeWidth={0.7}
              />

              {/* Accent strip */}
              <rect x={nx + 0.5} y={ny + 6} width={2.5} height={src.h - 12} rx={1} fill={accent} opacity={0.45} />

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
      </svg>

      {/* ── Bottom stats ── */}
      <motion.div
        className="flex items-center justify-center gap-10 md:gap-14 mt-2"
        initial={animate ? { opacity: 0 } : { opacity: 1 }}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        {[
          { value: "16+", label: "fuentes conectadas" },
          { value: "1", label: "plataforma integrada" },
          { value: "15 min", label: "en vez de semanas" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <span className="block font-serif font-bold text-lg md:text-xl tracking-tight text-ochre">{stat.value}</span>
            <span className="block text-[0.6875rem] text-gray-400 mt-0.5">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
