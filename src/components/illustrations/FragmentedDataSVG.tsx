"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface FragmentedDataSVGProps {
  animate?: boolean;
}

/* ── Animated counter hook ── */
function useCounter(target: number, duration: number, startDelay: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = () => {
        const elapsed = performance.now() - start;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, startDelay * 1000);
    return () => clearTimeout(timeout);
  }, [target, duration, startDelay, active]);
  return value;
}

/* ── Data ── */
type SourceType = "gov" | "excel" | "pdf" | "paper" | "email";

interface Source {
  label: string;
  sub: string;
  type: SourceType;
  pain: string;
}

const innerSources: Source[] = [
  { label: "CHIP", sub: "Contaduría General", type: "gov", pain: "Carga manual de datos contables cada trimestre" },
  { label: "SISFUT", sub: "Presupuesto", type: "gov", pain: "Formato propio sin cruce con ejecución real" },
  { label: "SECOP II", sub: "Contratos públicos", type: "gov", pain: "Portal externo sin conexión a hacienda" },
  { label: "SIRECI", sub: "Rendición CGR", type: "gov", pain: "Consolidación manual con riesgo de multa" },
  { label: "SIA Observa", sub: "Auditoría territorial", type: "gov", pain: "Requiere datos de múltiples sistemas" },
  { label: "MUISCA", sub: "DIAN Exógena", type: "gov", pain: "XML armado a mano, alto riesgo de rechazo" },
  { label: "TerriData", sub: "DNP Indicadores", type: "gov", pain: "Indicadores sin vínculo al sistema local" },
  { label: "FUT", sub: "Formulario Único", type: "gov", pain: "Formulario llenado manualmente cada trimestre" },
];

const outerSources: Source[] = [
  { label: "Excel", sub: "presupuesto_v4.xlsx", type: "excel", pain: "Sin control de versiones ni validación" },
  { label: "PDF", sub: "Estatuto_tribut.pdf", type: "pdf", pain: "400+ páginas sin búsqueda inteligente" },
  { label: "Email", sub: "147 sin leer", type: "email", pain: "Solicitudes perdidas entre correos" },
  { label: "Excel", sub: "FUT_FINAL(2).xlsx", type: "excel", pain: "Copiar y pegar entre sistemas diferentes" },
  { label: "Word", sub: "Informe_borrador.docx", type: "paper", pain: "Borrador reescrito sin control de cambios" },
  { label: "PDF", sub: "Acuerdo_042.pdf", type: "pdf", pain: "Normativa estática, difícil de consultar" },
  { label: "WhatsApp", sub: "Grupo Hacienda", type: "email", pain: "Decisiones sin registro formal" },
  { label: "Carpeta", sub: "Archivo físico", type: "paper", pain: "Documentos sin digitalizar ni indexar" },
];

const typeStyles: Record<SourceType, { bg: string; border: string; accent: string; text: string; icon: string }> = {
  gov:   { bg: "#F0F4F8", border: "#B0BEC5", accent: "#546E7A", text: "#263238", icon: "GOV" },
  excel: { bg: "#E8F5E9", border: "#A5D6A7", accent: "#2E7D32", text: "#1B5E20", icon: "XLS" },
  pdf:   { bg: "#FFEBEE", border: "#EF9A9A", accent: "#C62828", text: "#B71C1C", icon: "PDF" },
  paper: { bg: "#FFF8E1", border: "#FFE082", accent: "#EF6C00", text: "#E65100", icon: "DOC" },
  email: { bg: "#F3E5F5", border: "#CE93D8", accent: "#7B1FA2", text: "#4A148C", icon: "MSG" },
};

const crossConnections: [number, number][] = [
  [0, 3], [1, 5], [2, 6], [4, 7], [0, 7], [3, 5],
];

// Indices of inner connections that show particles
const particleConns = [0, 2, 4, 5, 7];

/* ── Main component ── */
export default function FragmentedDataSVG({ animate = true }: FragmentedDataSVGProps) {
  const cx = 400, cy = 265;
  const innerR = 148, outerR = 255;
  const nodeW = 80, nodeH = 36;
  const outerNodeW = 86, outerNodeH = 36;

  type HoveredNode = { ring: "inner" | "outer"; idx: number } | null;
  const [hovered, setHovered] = useState<HoveredNode>(null);
  const [showStamp, setShowStamp] = useState(false);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setShowStamp(true), 2200);
    return () => clearTimeout(t);
  }, [animate]);

  // Position nodes on a ring
  const posOnRing = useCallback(<T,>(items: T[], r: number, offset = 0) =>
    items.map((item, i) => {
      const angle = -Math.PI / 2 + offset + (i * 2 * Math.PI) / items.length;
      return { ...item, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), angle };
    }), [cx, cy]
  );

  const inner = posOnRing(innerSources, innerR);
  const outer = posOnRing(outerSources, outerR, Math.PI / outerSources.length);

  // Precompute nearest inner node for each outer node
  const outerToInner = outer.map((src) =>
    inner.reduce((best, n, j) => {
      const d = Math.hypot(n.x - src.x, n.y - src.y);
      return d < best.d ? { d, idx: j } : best;
    }, { d: Infinity, idx: 0 }).idx
  );

  // Hover helpers
  const isHighlighted = (ring: "inner" | "outer", idx: number) => {
    if (!hovered) return false;
    return hovered.ring === ring && hovered.idx === idx;
  };

  const connOpacity = (involvedInner: number) => {
    if (!hovered) return 0.35;
    if (hovered.ring === "inner" && hovered.idx === involvedInner) return 0.8;
    if (hovered.ring === "outer" && outerToInner[hovered.idx] === involvedInner) return 0.6;
    return 0.1;
  };

  const outerConnOpacity = (outerIdx: number) => {
    if (!hovered) return 0.2;
    if (hovered.ring === "outer" && hovered.idx === outerIdx) return 0.7;
    if (hovered.ring === "inner" && hovered.idx === outerToInner[outerIdx]) return 0.5;
    return 0.08;
  };

  // Tooltip data
  const tooltipData = hovered
    ? hovered.ring === "inner"
      ? { ...(inner[hovered.idx] as typeof inner[0] & Source), nx: inner[hovered.idx].x, ny: inner[hovered.idx].y }
      : { ...(outer[hovered.idx] as typeof outer[0] & Source), nx: outer[hovered.idx].x, ny: outer[hovered.idx].y }
    : null;

  const count16 = useCounter(16, 1.5, 1.8, animate);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 800 530"
        fill="none"
        className="w-full"
        role="img"
        aria-label="Municipio en el centro rodeado de 16 fuentes de datos desconectadas"
      >
        {/* ── Background rings ── */}
        <circle cx={cx} cy={cy} r={outerR + 55} stroke="#E8E5E0" strokeWidth={0.3} strokeDasharray="2 10" opacity={0.3} />
        <circle cx={cx} cy={cy} r={outerR} stroke="#E8E5E0" strokeWidth={0.4} strokeDasharray="3 6" opacity={0.25} />
        <circle cx={cx} cy={cy} r={innerR} stroke="#E8E5E0" strokeWidth={0.4} strokeDasharray="3 6" opacity={0.3} />
        <circle cx={cx} cy={cy} r={60} stroke="#E8E5E0" strokeWidth={0.3} strokeDasharray="2 6" opacity={0.2} />

        {/* ── Ring labels (arc text) ── */}
        <defs>
          <path id="innerArc" d={`M ${cx - innerR + 14} ${cy} A ${innerR - 14} ${innerR - 14} 0 0 1 ${cx + innerR - 14} ${cy}`} />
          <path id="outerArc" d={`M ${cx - outerR + 14} ${cy} A ${outerR - 14} ${outerR - 14} 0 0 1 ${cx + outerR - 14} ${cy}`} />
        </defs>
        <motion.text
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 0.3 } : undefined}
          transition={{ duration: 0.5, delay: 1.2 }}
          fontSize={6.5} fill="#9E9484" fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.15em" fontWeight={600}
        >
          <textPath href="#innerArc" startOffset="50%" textAnchor="middle">PLATAFORMAS OFICIALES</textPath>
        </motion.text>
        <motion.text
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 0.25 } : undefined}
          transition={{ duration: 0.5, delay: 1.4 }}
          fontSize={6.5} fill="#9E9484" fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.15em" fontWeight={600}
        >
          <textPath href="#outerArc" startOffset="50%" textAnchor="middle">FUENTES INFORMALES Y MANUALES</textPath>
        </motion.text>

        {/* ── Cross connections between inner nodes ── */}
        {crossConnections.map(([a, b], i) => {
          const sa = inner[a], sb = inner[b];
          const mx = (sa.x + sb.x) / 2, my = (sa.y + sb.y) / 2;
          const isHov = hovered?.ring === "inner" && (hovered.idx === a || hovered.idx === b);
          return (
            <g key={`cross-${i}`} opacity={hovered ? (isHov ? 0.5 : 0.08) : 0.2}>
              <line x1={sa.x} y1={sa.y} x2={mx - 3} y2={my - 2} stroke="#D8D3CC" strokeWidth={0.5} strokeDasharray="3 5" />
              <line x1={mx + 3} y1={my + 2} x2={sb.x} y2={sb.y} stroke="#D8D3CC" strokeWidth={0.5} strokeDasharray="3 5" />
              <line x1={mx - 2.5} y1={my - 2.5} x2={mx + 2.5} y2={my + 2.5} stroke="#E53935" strokeWidth={0.8} strokeLinecap="round" opacity={0.6} />
              <line x1={mx + 2.5} y1={my - 2.5} x2={mx - 2.5} y2={my + 2.5} stroke="#E53935" strokeWidth={0.8} strokeLinecap="round" opacity={0.6} />
            </g>
          );
        })}

        {/* ── Center → inner connections ── */}
        {inner.map((src, i) => {
          const dx = src.x - cx, dy = src.y - cy;
          const bPct = 0.48;
          const bx = cx + dx * bPct, by = cy + dy * bPct;
          return (
            <g key={`ri-${i}`} style={{ opacity: connOpacity(i), transition: "opacity 0.2s" }}>
              <line x1={cx} y1={cy} x2={bx - 3 * Math.cos(src.angle)} y2={by - 3 * Math.sin(src.angle)} stroke="#D4D0CB" strokeWidth={0.8} strokeDasharray="4 4" />
              <line x1={bx + 3 * Math.cos(src.angle)} y1={by + 3 * Math.sin(src.angle)} x2={src.x} y2={src.y} stroke="#D4D0CB" strokeWidth={0.8} strokeDasharray="4 4" />
              <line x1={bx - 3} y1={by - 3} x2={bx + 3} y2={by + 3} stroke="#E53935" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
              <line x1={bx + 3} y1={by - 3} x2={bx - 3} y2={by + 3} stroke="#E53935" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
            </g>
          );
        })}

        {/* ── Inner → outer connections ── */}
        {outer.map((src, i) => {
          const ni = inner[outerToInner[i]];
          const mx = (ni.x + src.x) / 2, my = (ni.y + src.y) / 2;
          return (
            <g key={`ro-${i}`} style={{ opacity: outerConnOpacity(i), transition: "opacity 0.2s" }}>
              <line x1={ni.x} y1={ni.y} x2={mx - 3} y2={my - 2} stroke="#D8D3CC" strokeWidth={0.5} strokeDasharray="3 5" />
              <line x1={mx + 3} y1={my + 2} x2={src.x} y2={src.y} stroke="#D8D3CC" strokeWidth={0.5} strokeDasharray="3 5" />
              <line x1={mx - 2.5} y1={my - 2.5} x2={mx + 2.5} y2={my + 2.5} stroke="#E53935" strokeWidth={0.8} strokeLinecap="round" opacity={0.4} />
              <line x1={mx + 2.5} y1={my - 2.5} x2={mx - 2.5} y2={my + 2.5} stroke="#E53935" strokeWidth={0.8} strokeLinecap="round" opacity={0.4} />
            </g>
          );
        })}

        {/* ── Data particles (dots flowing from source → center, stopping at X) ── */}
        {particleConns.map((connIdx, ci) => {
          const src = inner[connIdx];
          const dx = src.x - cx, dy = src.y - cy;
          return [0.18, 0.28, 0.38, 0.46].map((pct, pi) => (
            <motion.circle
              key={`particle-${ci}-${pi}`}
              cx={cx + dx * pct}
              cy={cy + dy * pct}
              r={1.4}
              fill={pi === 3 ? "#E53935" : "#B8956A"}
              initial={{ opacity: 0 }}
              animate={animate ? { opacity: [0, pi === 3 ? 0.5 : 0.65, 0] } : undefined}
              transition={{
                duration: 0.9,
                delay: 2.5 + ci * 0.6 + pi * 0.18,
                repeat: Infinity,
                repeatDelay: 3.5,
              }}
            />
          ));
        })}

        {/* ── Center: Municipality ── */}
        <motion.g
          initial={animate ? { scale: 0, opacity: 0 } : undefined}
          animate={animate ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 160, damping: 16 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={54} fill="#FDECEA" opacity={0.2} />
          <circle cx={cx} cy={cy} r={44} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={1} />
          <rect x={cx - 12} y={cy - 12} width={24} height={18} rx={1.5} fill="none" stroke="#7A7062" strokeWidth={1.1} />
          <path d={`M${cx - 16} ${cy - 12} L${cx} ${cy - 22} L${cx + 16} ${cy - 12}`} fill="none" stroke="#7A7062" strokeWidth={1.1} strokeLinejoin="round" />
          <rect x={cx - 3} y={cy - 1} width={6} height={8} rx={0.8} fill="#7A7062" opacity={0.25} />
          <rect x={cx - 9} y={cy - 8} width={4} height={4} rx={0.5} fill="#7A7062" opacity={0.2} />
          <rect x={cx + 5} y={cy - 8} width={4} height={4} rx={0.5} fill="#7A7062" opacity={0.2} />
          <line x1={cx} y1={cy - 22} x2={cx} y2={cy - 28} stroke="#7A7062" strokeWidth={0.7} />
          <rect x={cx} y={cy - 28} width={5} height={3.5} rx={0.5} fill="#B8956A" opacity={0.6} />
          <text x={cx} y={cy + 20} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#2C2418" fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.05em">
            MUNICIPIO
          </text>
          <text x={cx} y={cy + 30} textAnchor="middle" fontSize={5.5} fill="#9E9484" fontFamily="'Plus Jakarta Sans', sans-serif">
            Secretaría de Hacienda
          </text>
        </motion.g>

        {/* ── Inner ring nodes ── */}
        {inner.map((src, i) => {
          const colors = typeStyles[src.type];
          const nx = src.x - nodeW / 2, ny = src.y - nodeH / 2;
          const isHov = isHighlighted("inner", i);
          return (
            <motion.g
              key={`in-${i}`}
              initial={animate ? { opacity: 0, scale: 0.8 } : { opacity: 1 }}
              animate={animate ? { opacity: 1, scale: isHov ? 1.08 : 1 } : undefined}
              transition={{ duration: 0.35, delay: 0.2 + i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformOrigin: `${src.x}px ${src.y}px`, cursor: "pointer" }}
              onMouseEnter={() => setHovered({ ring: "inner", idx: i })}
              onMouseLeave={() => setHovered(null)}
            >
              <title>{src.pain}</title>
              <rect x={nx + 1} y={ny + 1} width={nodeW} height={nodeH} rx={5} fill="#0000000A" />
              <rect x={nx} y={ny} width={nodeW} height={nodeH} rx={5} fill={colors.bg} stroke={isHov ? colors.accent : colors.border} strokeWidth={isHov ? 1.4 : 0.8} />
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
          const isHov = isHighlighted("outer", i);
          return (
            <motion.g
              key={`out-${i}`}
              initial={animate ? { opacity: 0, scale: 0.8 } : { opacity: 1 }}
              animate={animate ? { opacity: 1, scale: isHov ? 1.08 : 1 } : undefined}
              transition={{ duration: 0.35, delay: 0.4 + i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformOrigin: `${src.x}px ${src.y}px`, cursor: "pointer" }}
              onMouseEnter={() => setHovered({ ring: "outer", idx: i })}
              onMouseLeave={() => setHovered(null)}
            >
              <title>{src.pain}</title>
              <rect x={nx + 1} y={ny + 1} width={outerNodeW} height={outerNodeH} rx={5} fill="#0000000A" />
              <rect x={nx} y={ny} width={outerNodeW} height={outerNodeH} rx={5} fill={colors.bg} stroke={isHov ? colors.accent : colors.border} strokeWidth={isHov ? 1.2 : 0.7} />
              <rect x={nx + 4} y={ny + 4} width={22} height={11} rx={2.5} fill={colors.accent} opacity={0.12} />
              <text x={nx + 15} y={ny + 12} textAnchor="middle" fontSize={5.5} fontWeight={700} fill={colors.accent} fontFamily="'Plus Jakarta Sans', sans-serif" opacity={0.7}>{colors.icon}</text>
              <text x={nx + 30} y={ny + 13} fontSize={7.5} fontWeight={700} fill={colors.text} fontFamily="'Plus Jakarta Sans', sans-serif">{src.label}</text>
              <text x={nx + 5} y={ny + 27} fontSize={5.5} fill={colors.accent} fontFamily="'Plus Jakarta Sans', sans-serif" opacity={0.65}>{src.sub}</text>
            </motion.g>
          );
        })}

        {/* ── Pulsing question marks ── */}
        {[
          { x: cx + 20, y: cy - 38, size: 10, delay: 1.0 },
          { x: cx - 26, y: cy - 34, size: 8, delay: 1.5 },
        ].map((q, i) => (
          <motion.text
            key={`q-${i}`} x={q.x} y={q.y} fontSize={q.size} fontWeight={700} fill="#E53935"
            initial={animate ? { opacity: 0 } : { opacity: 0.5 }}
            animate={animate ? { opacity: [0, 0.55, 0.15, 0.55] } : undefined}
            transition={{ duration: 2.5, delay: q.delay, repeat: Infinity, repeatType: "reverse" }}
          >?</motion.text>
        ))}

        {/* ── "SIN INTEGRACIÓN" stamp ── */}
        <AnimatePresence>
          {showStamp && (
            <motion.g
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              style={{ transformOrigin: `${cx}px ${cy + 70}px` }}
            >
              <g transform={`rotate(-14, ${cx}, ${cy + 70})`}>
                <rect x={cx - 100} y={cy + 52} width={200} height={36} rx={4} fill="none" stroke="#E53935" strokeWidth={2} strokeDasharray="6 3" opacity={0.25} />
                <rect x={cx - 96} y={cy + 55} width={192} height={30} rx={2} fill="none" stroke="#E53935" strokeWidth={0.8} opacity={0.15} />
                <text x={cx} y={cy + 75} textAnchor="middle" fontSize={14} fontWeight={800} fill="#E53935" opacity={0.18} fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.12em">
                  SIN INTEGRACIÓN
                </text>
              </g>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── Hover tooltip ── */}
        <AnimatePresence>
          {tooltipData && (
            <motion.g
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              {(() => {
                const above = tooltipData.ny > cy;
                const tx = Math.max(85, Math.min(715, tooltipData.nx));
                const ty = above ? tooltipData.ny - outerNodeH / 2 - 30 : tooltipData.ny + outerNodeH / 2 + 10;
                const tw = 178;
                return (
                  <>
                    <rect x={tx - tw / 2} y={ty} width={tw} height={24} rx={4} fill="#1A1A1A" opacity={0.88} />
                    <text x={tx} y={ty + 15} textAnchor="middle" fontSize={6.5} fill="#FAFAF8" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight={500}>
                      {tooltipData.pain}
                    </text>
                  </>
                );
              })()}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* ── Bottom: legend + animated stats ── */}
      <div className="mt-3 flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
          {[
            { color: "#546E7A", label: "Plataformas gubernamentales" },
            { color: "#2E7D32", label: "Hojas de cálculo" },
            { color: "#C62828", label: "Documentos PDF" },
            { color: "#EF6C00", label: "Archivos y registros" },
            { color: "#7B1FA2", label: "Mensajería informal" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, opacity: 0.7 }} />
              <span className="text-[0.625rem] text-gray-400 font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        <motion.div
          className="flex items-center justify-center gap-8 md:gap-12"
          initial={animate ? { opacity: 0, y: 8 } : { opacity: 1 }}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          <div className="text-center">
            <span className="block font-serif font-bold text-lg md:text-xl text-ochre">{count16}+</span>
            <span className="block text-[0.625rem] text-gray-400 font-medium mt-0.5">fuentes de datos</span>
          </div>
          <div className="text-center">
            <span className="block font-serif font-bold text-lg md:text-xl text-ochre">0</span>
            <span className="block text-[0.625rem] text-gray-400 font-medium mt-0.5">integradas entre sí</span>
          </div>
          <div className="text-center">
            <span className="block font-serif font-bold text-lg md:text-xl text-ochre">∞</span>
            <span className="block text-[0.625rem] text-gray-400 font-medium mt-0.5">horas perdidas al mes</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
