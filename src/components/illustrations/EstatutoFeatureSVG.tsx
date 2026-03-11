"use client";

import { motion } from "framer-motion";

interface Props {
  animate?: boolean;
  delay?: number;
}

export default function EstatutoFeatureSVG({ animate = true, delay = 0 }: Props) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className="w-full h-auto" role="img" aria-label="Chat de consulta de estatuto tributario con IA">
      {/* Background card */}
      <rect x={0} y={0} width={280} height={200} rx={12} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.8} />

      {/* Chat header */}
      <rect x={0} y={0} width={280} height={30} rx={12} fill="#2C2418" />
      <rect x={0} y={12} width={280} height={18} fill="#2C2418" />
      <circle cx={16} cy={15} r={6} fill="#B8956A" opacity={0.8} />
      <text x={28} y={18} fill="#FAF6F0" fontSize={6.5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
        Estatuto IA
      </text>
      <circle cx={260} cy={15} r={3} fill="#4CAF50" />
      <text x={248} y={18} textAnchor="end" fill="#9E9484" fontSize={5} fontFamily="'Plus Jakarta Sans', sans-serif">
        Online
      </text>

      {/* User message */}
      <motion.g
        initial={animate ? { opacity: 0, x: 20 } : undefined}
        animate={animate ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.4, delay: delay + 0.2 }}
      >
        <rect x={90} y={40} width={180} height={26} rx={10} fill="#F5EDDF" />
        <text x={100} y={50} fill="#4A4237" fontSize={6} fontFamily="'Plus Jakarta Sans', sans-serif">
          ¿Cuál es la tarifa del predial
        </text>
        <text x={100} y={58} fill="#4A4237" fontSize={6} fontFamily="'Plus Jakarta Sans', sans-serif">
          para estrato 3 en zona urbana?
        </text>
      </motion.g>

      {/* AI response */}
      <motion.g
        initial={animate ? { opacity: 0, x: -20 } : undefined}
        animate={animate ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.5, delay: delay + 0.7 }}
      >
        {/* AI avatar */}
        <circle cx={20} cy={86} r={8} fill="#2C2418" />
        <text x={20} y={89} textAnchor="middle" fill="#B8956A" fontSize={6} fontWeight={700} fontFamily="'Space Grotesk', serif">
          G
        </text>

        {/* Response bubble */}
        <rect x={34} y={74} width={236} height={68} rx={10} fill="#FFFDF8" stroke="#EDE6DA" strokeWidth={0.6} />

        {/* Response text */}
        <text x={44} y={88} fill="#4A4237" fontSize={5.8} fontFamily="'Plus Jakarta Sans', sans-serif">
          Según el Estatuto Tributario Municipal, la tarifa
        </text>
        <text x={44} y={97} fill="#4A4237" fontSize={5.8} fontFamily="'Plus Jakarta Sans', sans-serif">
          del impuesto predial para estrato 3 en zona
        </text>
        <text x={44} y={106} fill="#4A4237" fontSize={5.8} fontFamily="'Plus Jakarta Sans', sans-serif">
          urbana es del 7.5 por mil sobre el avalúo catastral.
        </text>

        {/* Citation badge */}
        <motion.g
          initial={animate ? { scale: 0 } : undefined}
          animate={animate ? { scale: 1 } : undefined}
          transition={{ duration: 0.3, delay: delay + 1.2 }}
          style={{ transformOrigin: "130px 125px" }}
        >
          <rect x={44} y={114} width={120} height={20} rx={4} fill="#F5EDDF" stroke="#B8956A" strokeWidth={0.5} />
          {/* Book icon */}
          <rect x={50} y={118} width={8} height={11} rx={1} fill="none" stroke="#B8956A" strokeWidth={0.7} />
          <line x1={54} y1={118} x2={54} y2={129} stroke="#B8956A" strokeWidth={0.5} />
          <text x={64} y={125} fill="#B8956A" fontSize={5.5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
            Art. 4 · Libro Predial
          </text>
          <text x={153} y={125} fill="#9E9484" fontSize={5} fontFamily="'Plus Jakarta Sans', sans-serif">
            ↗
          </text>
        </motion.g>
      </motion.g>

      {/* Suggested queries */}
      <motion.g
        initial={animate ? { opacity: 0, y: 10 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4, delay: delay + 1.5 }}
      >
        <text x={14} y={158} fill="#9E9484" fontSize={5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Preguntas sugeridas
        </text>
        {[
          { text: "Exenciones prediales", x: 14 },
          { text: "Tarifa ICA comercial", x: 100 },
          { text: "Sanciones moratorias", x: 186 },
        ].map((q, i) => (
          <motion.g
            key={q.text}
            initial={animate ? { opacity: 0, y: 5 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.3, delay: delay + 1.6 + i * 0.1 }}
          >
            <rect x={q.x} y={164} width={78} height={20} rx={10} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.5} />
            <text x={q.x + 39} y={176} textAnchor="middle" fill="#7D7365" fontSize={5} fontFamily="'Plus Jakarta Sans', sans-serif">
              {q.text}
            </text>
          </motion.g>
        ))}
      </motion.g>

      {/* Input bar */}
      <motion.g
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: 0.4, delay: delay + 0.1 }}
      >
        <rect x={10} y={190} width={220} height={1} rx={0.5} fill="#EDE6DA" />
      </motion.g>
    </svg>
  );
}
