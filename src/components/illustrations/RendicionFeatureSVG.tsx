"use client";

import { motion } from "framer-motion";

interface Props {
  animate?: boolean;
  delay?: number;
}

export default function RendicionFeatureSVG({ animate = true, delay = 0 }: Props) {
  const reports = [
    { label: "SIRECI", subtitle: "CGR", x: 20, y: 44, color: "#B8956A" },
    { label: "SIA", subtitle: "Auditoría", x: 20, y: 88, color: "#8B7355" },
    { label: "FUT", subtitle: "DNP", x: 20, y: 132, color: "#7D7365" },
  ];

  return (
    <svg viewBox="0 0 280 200" fill="none" className="w-full h-auto" role="img" aria-label="Rendición automatizada de reportes gubernamentales">
      {/* Background card */}
      <rect x={0} y={0} width={280} height={200} rx={12} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.8} />

      {/* Title */}
      <motion.text
        x={140}
        y={24}
        textAnchor="middle"
        fill="#7D7365"
        fontSize={5.5}
        fontWeight={700}
        fontFamily="'Plus Jakarta Sans', sans-serif"
        letterSpacing="0.08em"
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: 0.3, delay: delay + 0.1 }}
      >
        RENDICIÓN AUTOMATIZADA
      </motion.text>

      {/* Source documents */}
      {reports.map((report, i) => (
        <motion.g
          key={report.label}
          initial={animate ? { opacity: 0, x: -15 } : undefined}
          animate={animate ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.4, delay: delay + 0.2 + i * 0.15 }}
        >
          {/* Document shape */}
          <rect x={report.x} y={report.y} width={62} height={34} rx={4} fill="#FFFDF8" stroke={report.color} strokeWidth={0.8} />

          {/* Document lines */}
          <line x1={report.x + 8} y1={report.y + 10} x2={report.x + 54} y2={report.y + 10} stroke="#EDE6DA" strokeWidth={0.5} />
          <line x1={report.x + 8} y1={report.y + 16} x2={report.x + 42} y2={report.y + 16} stroke="#EDE6DA" strokeWidth={0.5} />
          <line x1={report.x + 8} y1={report.y + 22} x2={report.x + 48} y2={report.y + 22} stroke="#EDE6DA" strokeWidth={0.5} />

          {/* Label */}
          <text x={report.x + 31} y={report.y + 10} textAnchor="middle" fill={report.color} fontSize={7} fontWeight={700} fontFamily="'Plus Jakarta Sans', sans-serif">
            {report.label}
          </text>
          <text x={report.x + 31} y={report.y + 30} textAnchor="middle" fill="#9E9484" fontSize={4.5} fontFamily="'Plus Jakarta Sans', sans-serif">
            {report.subtitle}
          </text>
        </motion.g>
      ))}

      {/* Arrows from documents to center */}
      {reports.map((report, i) => (
        <motion.g
          key={`arrow-${report.label}`}
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 0.3, delay: delay + 0.5 + i * 0.1 }}
        >
          <line
            x1={report.x + 62}
            y1={report.y + 17}
            x2={110}
            y2={100}
            stroke="#DDD4C4"
            strokeWidth={0.8}
            strokeDasharray="3 3"
          />
          {/* Animated dot flowing along the line */}
          <motion.circle
            r={2}
            fill={report.color}
            initial={{
              cx: report.x + 62,
              cy: report.y + 17,
              opacity: 0,
            }}
            animate={animate ? {
              cx: [report.x + 62, 110],
              cy: [report.y + 17, 100],
              opacity: [0, 0.8, 0.8, 0],
            } : undefined}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: delay + 0.8 + i * 0.5,
              ease: "linear",
              repeatDelay: 1.5,
            }}
          />
        </motion.g>
      ))}

      {/* Central hub - Gobia engine */}
      <motion.g
        initial={animate ? { scale: 0, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.5, delay: delay + 0.4, type: "spring" }}
        style={{ transformOrigin: "130px 100px" }}
      >
        {/* Gear shape (simplified) */}
        <circle cx={130} cy={100} r={20} fill="#2C2418" />
        <circle cx={130} cy={100} r={14} fill="#2C2418" stroke="#B8956A" strokeWidth={0.8} />
        {/* Gear teeth */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 130 + 18 * Math.cos(rad);
          const y1 = 100 + 18 * Math.sin(rad);
          const x2 = 130 + 22 * Math.cos(rad);
          const y2 = 100 + 22 * Math.sin(rad);
          return (
            <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#B8956A" strokeWidth={3} strokeLinecap="round" />
          );
        })}
        <text x={130} y={98} textAnchor="middle" fill="#B8956A" fontSize={7} fontWeight={700} fontFamily="'Space Grotesk', serif">
          G
        </text>
        <text x={130} y={106} textAnchor="middle" fill="#9E9484" fontSize={4} fontFamily="'Plus Jakarta Sans', sans-serif">
          Motor
        </text>
      </motion.g>

      {/* Output arrows */}
      <motion.g
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: 0.3, delay: delay + 0.7 }}
      >
        <line x1={152} y1={100} x2={170} y2={100} stroke="#B8956A" strokeWidth={1.5} />
        <polygon points="170,96 178,100 170,104" fill="#B8956A" />
      </motion.g>

      {/* Output files - ready formats */}
      <motion.g
        initial={animate ? { opacity: 0, x: 15 } : undefined}
        animate={animate ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.5, delay: delay + 0.8 }}
      >
        {/* Output container */}
        <rect x={182} y={38} width={90} height={130} rx={8} fill="#FAF6F0" stroke="#EDE6DA" strokeWidth={0.5} />
        <text x={227} y={52} textAnchor="middle" fill="#7D7365" fontSize={5} fontWeight={700} fontFamily="'Plus Jakarta Sans', sans-serif">
          Archivos listos
        </text>

        {/* File cards */}
        {[
          { name: "SIRECI.fmt", format: "Storm", y: 60, icon: "📄" },
          { name: "SIA_anexos.xlsx", format: "Excel", y: 88, icon: "📊" },
          { name: "FUT_CHIP.xml", format: "CHIP", y: 116, icon: "📋" },
        ].map((file, i) => (
          <motion.g
            key={file.name}
            initial={animate ? { opacity: 0, y: 5 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.3, delay: delay + 1 + i * 0.15 }}
          >
            <rect x={190} y={file.y} width={74} height={22} rx={4} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.5} />

            {/* Check icon */}
            <circle cx={200} cy={file.y + 11} r={5} fill="#E8F5E9" />
            <path
              d={`M ${197.5} ${file.y + 11} L ${199.5} ${file.y + 13} L ${202.5} ${file.y + 9}`}
              stroke="#4CAF50"
              strokeWidth={1}
              strokeLinecap="round"
              fill="none"
            />

            <text x={210} y={file.y + 9} fill="#4A4237" fontSize={5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
              {file.name}
            </text>
            <text x={210} y={file.y + 17} fill="#9E9484" fontSize={4} fontFamily="'Plus Jakarta Sans', sans-serif">
              Formato {file.format}
            </text>
          </motion.g>
        ))}
      </motion.g>

      {/* Bottom timeline hint */}
      <motion.g
        initial={animate ? { opacity: 0, y: 5 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4, delay: delay + 1.4 }}
      >
        <rect x={14} y={178} width={252} height={14} rx={7} fill="#F5EDDF" />
        <text x={140} y={187.5} textAnchor="middle" fill="#8B7355" fontSize={5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
          Sin doble digitación — datos existentes → reportes listos
        </text>
      </motion.g>
    </svg>
  );
}
