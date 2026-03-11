"use client";

import { motion } from "framer-motion";

interface ConnectedDataSVGProps {
  animate?: boolean;
}

/*
  Mirror version of FragmentedDataSVG:
  Same 16 sources, same layout — but now all connected through Gobia.
  Solid ochre lines, green checkmarks, data flowing successfully.
*/

type SourceType = "gov" | "excel" | "pdf" | "paper" | "email";

const innerSources = [
  { label: "CHIP", sub: "Contaduría General", type: "gov" as SourceType },
  { label: "SISFUT", sub: "Presupuesto", type: "gov" as SourceType },
  { label: "SECOP II", sub: "Contratos públicos", type: "gov" as SourceType },
  { label: "SIRECI", sub: "Rendición CGR", type: "gov" as SourceType },
  { label: "SIA Observa", sub: "Auditoría territorial", type: "gov" as SourceType },
  { label: "MUISCA", sub: "DIAN Exógena", type: "gov" as SourceType },
  { label: "TerriData", sub: "DNP Indicadores", type: "gov" as SourceType },
  { label: "FUT", sub: "Formulario Único", type: "gov" as SourceType },
];

const outerSources = [
  { label: "Excel", sub: "Importación directa", type: "excel" as SourceType },
  { label: "PDF", sub: "Indexado con IA", type: "pdf" as SourceType },
  { label: "Email", sub: "Alertas automáticas", type: "email" as SourceType },
  { label: "Excel", sub: "Migración asistida", type: "excel" as SourceType },
  { label: "Word", sub: "Generación automática", type: "paper" as SourceType },
  { label: "PDF", sub: "Consulta semántica", type: "pdf" as SourceType },
  { label: "WhatsApp", sub: "Notificaciones", type: "email" as SourceType },
  { label: "Archivo", sub: "Digitalizado", type: "paper" as SourceType },
];

const typeStyles: Record<SourceType, { bg: string; border: string; accent: string; text: string; icon: string }> = {
  gov:   { bg: "#F0F4F8", border: "#90CAF9", accent: "#1565C0", text: "#0D47A1", icon: "GOV" },
  excel: { bg: "#E8F5E9", border: "#A5D6A7", accent: "#2E7D32", text: "#1B5E20", icon: "XLS" },
  pdf:   { bg: "#FFF3E0", border: "#FFCC80", accent: "#E65100", text: "#BF360C", icon: "PDF" },
  paper: { bg: "#FFF8E1", border: "#FFE082", accent: "#F9A825", text: "#F57F17", icon: "DOC" },
  email: { bg: "#F3E5F5", border: "#CE93D8", accent: "#7B1FA2", text: "#4A148C", icon: "MSG" },
};

// Select connections that show flowing particles
const particleConns = [0, 1, 3, 4, 6, 7];

export default function ConnectedDataSVG({ animate = true }: ConnectedDataSVGProps) {
  const cx = 400, cy = 265;
  const innerR = 148, outerR = 255;
  const nodeW = 80, nodeH = 36;
  const outerNodeW = 86, outerNodeH = 36;

  const posOnRing = <T,>(items: T[], r: number, offset = 0) =>
    items.map((item, i) => {
      const angle = -Math.PI / 2 + offset + (i * 2 * Math.PI) / items.length;
      return { ...item, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle };
    });

  const inner = posOnRing(innerSources, innerR);
  const outer = posOnRing(outerSources, outerR, Math.PI / outerSources.length);

  const outerToInner = outer.map((src) =>
    inner.reduce((best, n, j) => {
      const d = Math.hypot(n.x - src.x, n.y - src.y);
      return d < best.d ? { d, idx: j } : best;
    }, { d: Infinity, idx: 0 }).idx
  );

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 800 530" fill="none" className="w-full" role="img" aria-label="Todas las fuentes de datos conectadas a través de Gobia">
        {/* ── Background rings ── */}
        <circle cx={cx} cy={cy} r={outerR + 55} stroke="#B8956A" strokeWidth={0.3} strokeDasharray="2 10" opacity={0.15} />
        <circle cx={cx} cy={cy} r={outerR} stroke="#B8956A" strokeWidth={0.4} strokeDasharray="3 6" opacity={0.15} />
        <circle cx={cx} cy={cy} r={innerR} stroke="#B8956A" strokeWidth={0.5} opacity={0.12} />
        <circle cx={cx} cy={cy} r={60} stroke="#B8956A" strokeWidth={0.3} opacity={0.1} />

        {/* ── Ring labels ── */}
        <defs>
          <path id="cInnerArc" d={`M ${cx - innerR + 14} ${cy} A ${innerR - 14} ${innerR - 14} 0 0 1 ${cx + innerR - 14} ${cy}`} />
          <path id="cOuterArc" d={`M ${cx - outerR + 14} ${cy} A ${outerR - 14} ${outerR - 14} 0 0 1 ${cx + outerR - 14} ${cy}`} />
        </defs>
        <motion.text
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 0.3 } : undefined}
          transition={{ duration: 0.5, delay: 1.0 }}
          fontSize={6.5} fill="#B8956A" fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.15em" fontWeight={600}
        >
          <textPath href="#cInnerArc" startOffset="50%" textAnchor="middle">CONECTADAS VÍA GOBIA</textPath>
        </motion.text>
        <motion.text
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 0.25 } : undefined}
          transition={{ duration: 0.5, delay: 1.2 }}
          fontSize={6.5} fill="#B8956A" fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.15em" fontWeight={600}
        >
          <textPath href="#cOuterArc" startOffset="50%" textAnchor="middle">INTEGRADAS AUTOMÁTICAMENTE</textPath>
        </motion.text>

        {/* ── Solid connections: center → inner ── */}
        {inner.map((src, i) => (
          <motion.line
            key={`ci-${i}`}
            x1={cx} y1={cy} x2={src.x} y2={src.y}
            stroke="#B8956A" strokeWidth={0.9} opacity={0.25}
            initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
            animate={animate ? { pathLength: 1, opacity: 0.25 } : undefined}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.06 }}
          />
        ))}

        {/* ── Solid connections: inner → outer ── */}
        {outer.map((src, i) => {
          const ni = inner[outerToInner[i]];
          return (
            <motion.line
              key={`co-${i}`}
              x1={ni.x} y1={ni.y} x2={src.x} y2={src.y}
              stroke="#B8956A" strokeWidth={0.5} opacity={0.15}
              initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
              animate={animate ? { pathLength: 1, opacity: 0.15 } : undefined}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.05 }}
            />
          );
        })}

        {/* ── Success particles flowing TO center ── */}
        {particleConns.map((connIdx, ci) => {
          const src = inner[connIdx];
          const dx = src.x - cx, dy = src.y - cy;
          // Dots flow from source inward to center
          return [0.85, 0.65, 0.45, 0.25].map((pct, pi) => (
            <motion.circle
              key={`sp-${ci}-${pi}`}
              cx={cx + dx * pct} cy={cy + dy * pct} r={1.3}
              fill="#B8956A"
              initial={{ opacity: 0 }}
              animate={animate ? { opacity: [0, 0.55, 0] } : undefined}
              transition={{
                duration: 0.8,
                delay: 1.5 + ci * 0.5 + pi * 0.15,
                repeat: Infinity,
                repeatDelay: 3.5,
              }}
            />
          ));
        })}

        {/* ── Green checkmarks on connections (midpoint) ── */}
        {inner.map((src, i) => {
          const mx = (cx + src.x) / 2, my = (cy + src.y) / 2;
          return (
            <motion.g
              key={`check-${i}`}
              initial={animate ? { opacity: 0, scale: 0 } : undefined}
              animate={animate ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.3, delay: 0.9 + i * 0.06, type: "spring" }}
              style={{ transformOrigin: `${mx}px ${my}px` }}
            >
              <circle cx={mx} cy={my} r={6} fill="#dcfce7" />
              <path d={`M${mx - 2.5} ${my} L${mx - 0.5} ${my + 2.5} L${mx + 3} ${my - 2}`} stroke="#16a34a" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
          );
        })}

        {/* ── Center: Gobia ── */}
        <motion.g
          initial={animate ? { scale: 0, opacity: 0 } : undefined}
          animate={animate ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 160, damping: 16 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={54} fill="#F5EDDF" opacity={0.35} />
          <circle cx={cx} cy={cy} r={44} fill="#F5EDDF" stroke="#B8956A" strokeWidth={1.5} />
          <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} fill="#B8956A" fontFamily="'Space Grotesk', serif">
            Gobia
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize={6} fill="#9E9484" fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.08em">
            PLATAFORMA INTEGRADA
          </text>
        </motion.g>

        {/* ── Inner ring nodes ── */}
        {inner.map((src, i) => {
          const colors = typeStyles[src.type];
          const nx = src.x - nodeW / 2, ny = src.y - nodeH / 2;
          return (
            <motion.g
              key={`cin-${i}`}
              initial={animate ? { opacity: 0, scale: 0.8 } : { opacity: 1 }}
              animate={animate ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.35, delay: 0.2 + i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformOrigin: `${src.x}px ${src.y}px` }}
            >
              <rect x={nx + 1} y={ny + 1} width={nodeW} height={nodeH} rx={5} fill="#0000000A" />
              <rect x={nx} y={ny} width={nodeW} height={nodeH} rx={5} fill={colors.bg} stroke={colors.border} strokeWidth={0.8} />
              <rect x={nx + 4} y={ny + 4} width={22} height={11} rx={2.5} fill={colors.accent} opacity={0.12} />
              <text x={nx + 15} y={ny + 12} textAnchor="middle" fontSize={5.5} fontWeight={700} fill={colors.accent} fontFamily="'Plus Jakarta Sans', sans-serif" opacity={0.7}>{colors.icon}</text>
              <text x={nx + 30} y={ny + 13} fontSize={8} fontWeight={700} fill={colors.text} fontFamily="'Plus Jakarta Sans', sans-serif">{src.label}</text>
              <text x={nx + 5} y={ny + 27} fontSize={5.5} fill={colors.accent} fontFamily="'Plus Jakarta Sans', sans-serif" opacity={0.7}>{src.sub}</text>
            </motion.g>
          );
        })}

        {/* ── Outer ring nodes ── */}
        {outer.map((src, i) => {
          const colors = typeStyles[src.type];
          const nx = src.x - outerNodeW / 2, ny = src.y - outerNodeH / 2;
          return (
            <motion.g
              key={`cout-${i}`}
              initial={animate ? { opacity: 0, scale: 0.8 } : { opacity: 1 }}
              animate={animate ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.35, delay: 0.4 + i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformOrigin: `${src.x}px ${src.y}px` }}
            >
              <rect x={nx + 1} y={ny + 1} width={outerNodeW} height={outerNodeH} rx={5} fill="#0000000A" />
              <rect x={nx} y={ny} width={outerNodeW} height={outerNodeH} rx={5} fill={colors.bg} stroke={colors.border} strokeWidth={0.7} />
              <rect x={nx + 4} y={ny + 4} width={22} height={11} rx={2.5} fill={colors.accent} opacity={0.12} />
              <text x={nx + 15} y={ny + 12} textAnchor="middle" fontSize={5.5} fontWeight={700} fill={colors.accent} fontFamily="'Plus Jakarta Sans', sans-serif" opacity={0.7}>{colors.icon}</text>
              <text x={nx + 30} y={ny + 13} fontSize={7.5} fontWeight={700} fill={colors.text} fontFamily="'Plus Jakarta Sans', sans-serif">{src.label}</text>
              <text x={nx + 5} y={ny + 27} fontSize={5.5} fill={colors.accent} fontFamily="'Plus Jakarta Sans', sans-serif" opacity={0.65}>{src.sub}</text>
            </motion.g>
          );
        })}

        {/* ── "INTEGRADO" stamp ── */}
        <motion.g
          initial={animate ? { opacity: 0, scale: 1.5 } : undefined}
          animate={animate ? { opacity: 1, scale: 1 } : undefined}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 2.0 }}
          style={{ transformOrigin: `${cx}px ${cy + 70}px` }}
        >
          <g transform={`rotate(-14, ${cx}, ${cy + 70})`}>
            <rect x={cx - 68} y={cy + 54} width={136} height={32} rx={4} fill="none" stroke="#16a34a" strokeWidth={2} strokeDasharray="6 3" opacity={0.2} />
            <rect x={cx - 64} y={cy + 57} width={128} height={26} rx={2} fill="none" stroke="#16a34a" strokeWidth={0.8} opacity={0.12} />
            <text x={cx} y={cy + 75} textAnchor="middle" fontSize={13} fontWeight={800} fill="#16a34a" opacity={0.15} fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.12em">
              INTEGRADO
            </text>
          </g>
        </motion.g>
      </svg>

      {/* ── Bottom stats ── */}
      <motion.div
        className="flex items-center justify-center gap-8 md:gap-12 mt-3"
        initial={animate ? { opacity: 0, y: 8 } : { opacity: 1 }}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: 1.6 }}
      >
        {[
          { value: "16+", label: "fuentes conectadas" },
          { value: "1", label: "plataforma integrada" },
          { value: "15 min", label: "en vez de semanas" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <span className="block font-serif font-bold text-lg md:text-xl text-ochre">{stat.value}</span>
            <span className="block text-[0.625rem] text-gray-400 font-medium mt-0.5">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
