"use client";

import { motion } from "framer-motion";

interface Props {
  animate?: boolean;
  delay?: number;
}

export default function ExogenaFeatureSVG({ animate = true, delay = 0 }: Props) {
  const validations = [
    { label: "NIT verificado", x: 160, y: 54, success: true },
    { label: "Formato 1001 OK", x: 160, y: 78, success: true },
    { label: "Cruce contable", x: 160, y: 102, success: true },
    { label: "Encoding ISO", x: 160, y: 126, success: true },
    { label: "≤5,000 registros", x: 160, y: 150, success: true },
  ];

  return (
    <svg viewBox="0 0 280 200" fill="none" className="w-full h-auto" role="img" aria-label="Generación automatizada de XML exógena para DIAN">
      {/* Background card */}
      <rect x={0} y={0} width={280} height={200} rx={12} fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.8} />

      {/* XML Document */}
      <motion.g
        initial={animate ? { opacity: 0, x: -15 } : undefined}
        animate={animate ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        {/* Document shape */}
        <path d="M 16 20 L 16 180 L 130 180 L 130 34 L 116 20 Z" fill="#FFFDF8" stroke="#DDD4C4" strokeWidth={0.8} />
        <path d="M 116 20 L 116 34 L 130 34" fill="none" stroke="#DDD4C4" strokeWidth={0.8} />

        {/* XML header */}
        <text x={24} y={40} fill="#9E9484" fontSize={5} fontFamily="monospace">
          {"<?xml version=\"1.0\""}
        </text>
        <text x={24} y={48} fill="#9E9484" fontSize={5} fontFamily="monospace">
          {"encoding=\"ISO-8859-1\"?>"}
        </text>

        {/* XML content lines */}
        {[
          { text: "<mas:Concepto>", color: "#B8956A", y: 62 },
          { text: "  <mas:Formato>1001</mas:Formato>", color: "#8B7355", y: 72 },
          { text: "  <mas:Version>10</mas:Version>", color: "#8B7355", y: 82 },
          { text: "  <mas:AnoGrav>2025</mas:AnoGrav>", color: "#8B7355", y: 92 },
          { text: "  <mas:NitInfo>", color: "#8B7355", y: 102 },
          { text: "    900123456", color: "#2C2418", y: 112 },
          { text: "  </mas:NitInfo>", color: "#8B7355", y: 122 },
          { text: "  <mas:Vlr>15.200.000</mas:Vlr>", color: "#8B7355", y: 132 },
          { text: "</mas:Concepto>", color: "#B8956A", y: 142 },
        ].map((line, i) => (
          <motion.text
            key={i}
            x={24}
            y={line.y}
            fill={line.color}
            fontSize={5}
            fontFamily="monospace"
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.2, delay: delay + 0.4 + i * 0.06 }}
          >
            {line.text}
          </motion.text>
        ))}

        {/* File name */}
        <rect x={22} y={156} width={100} height={16} rx={3} fill="#F5EDDF" />
        <text x={72} y={167} textAnchor="middle" fill="#8B7355" fontSize={4.5} fontWeight={600} fontFamily="monospace">
          Dmuisca_010011002502501.xml
        </text>
      </motion.g>

      {/* Arrow */}
      <motion.g
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: 0.3, delay: delay + 0.5 }}
      >
        <line x1={136} y1={100} x2={152} y2={100} stroke="#B8956A" strokeWidth={1.5} />
        <polygon points="152,96 158,100 152,104" fill="#B8956A" />
      </motion.g>

      {/* Validation checklist */}
      <motion.g
        initial={animate ? { opacity: 0, x: 15 } : undefined}
        animate={animate ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        <rect x={155} y={28} width={115} height={148} rx={8} fill="#FAF6F0" stroke="#EDE6DA" strokeWidth={0.6} />
        <text x={212} y={44} textAnchor="middle" fill="#7D7365" fontSize={5.5} fontWeight={700} fontFamily="'Plus Jakarta Sans', sans-serif">
          Validación DIAN
        </text>

        {validations.map((v, i) => (
          <motion.g
            key={v.label}
            initial={animate ? { opacity: 0, x: 10 } : undefined}
            animate={animate ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.3, delay: delay + 0.7 + i * 0.15 }}
          >
            {/* Check circle */}
            <motion.circle
              cx={v.x + 10}
              cy={v.y}
              r={7}
              fill={v.success ? "#E8F5E9" : "#FFEBEE"}
              stroke={v.success ? "#4CAF50" : "#E53935"}
              strokeWidth={0.6}
              initial={animate ? { scale: 0 } : undefined}
              animate={animate ? { scale: 1 } : undefined}
              transition={{ duration: 0.3, delay: delay + 0.9 + i * 0.15, type: "spring" }}
              style={{ transformOrigin: `${v.x + 10}px ${v.y}px` }}
            />
            {/* Checkmark */}
            <motion.path
              d={`M ${v.x + 7} ${v.y} L ${v.x + 9.5} ${v.y + 2.5} L ${v.x + 13} ${v.y - 2}`}
              stroke="#4CAF50"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={animate ? { pathLength: 0 } : undefined}
              animate={animate ? { pathLength: 1 } : undefined}
              transition={{ duration: 0.3, delay: delay + 1 + i * 0.15 }}
            />

            {/* Label */}
            <text x={v.x + 22} y={v.y + 3} fill="#615849" fontSize={6} fontFamily="'Plus Jakarta Sans', sans-serif">
              {v.label}
            </text>
          </motion.g>
        ))}
      </motion.g>

      {/* Bottom status bar */}
      <motion.g
        initial={animate ? { opacity: 0, y: 10 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4, delay: delay + 1.6 }}
      >
        <rect x={155} y={162} width={115} height={10} rx={5} fill="#E8F5E9" />
        <text x={212} y={169.5} textAnchor="middle" fill="#2E7D32" fontSize={5} fontWeight={600} fontFamily="'Plus Jakarta Sans', sans-serif">
          ✓ Listo para MUISCA
        </text>
      </motion.g>
    </svg>
  );
}
