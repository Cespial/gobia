"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { indicadoresIDF, historicoIDF } from "@/data/medellin-hacienda";
import { nuevoIDF, rangoIDF } from "@/data/medellin-terridata";

const idfGlobal = indicadoresIDF.find((i) => i.abreviatura === "IDF");
const components = indicadoresIDF.filter((i) => i.abreviatura !== "IDF");

// Full names for each abbreviation — clarity for officials
const fullNames: Record<string, string> = {
  AF: "Autofinanciamiento",
  MD: "Magnitud de la deuda",
  DT: "Depend. transferencias",
  GRP: "Recursos propios",
  MI: "Magnitud inversión",
  CA: "Capacidad de ahorro",
};

function MiniArc({ value, max, good, size = 52 }: { value: number; max: number; good: boolean; size?: number }) {
  const pct = Math.min(value / max, 1);
  const r = size / 2 - 4;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const fillAngle = startAngle + totalAngle * pct;

  const toCart = (angle: number) => ({
    x: size / 2 + r * Math.cos((angle * Math.PI) / 180),
    y: size / 2 + r * Math.sin((angle * Math.PI) / 180),
  });

  const s = toCart(startAngle);
  const e = toCart(endAngle);
  const f = toCart(fillAngle);
  const largeArcBg = totalAngle > 180 ? 1 : 0;
  const largeArcFill = (fillAngle - startAngle) > 180 ? 1 : 0;

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.8}`}>
      <path
        d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArcBg} 1 ${e.x} ${e.y}`}
        fill="none" stroke="#EDE6DA" strokeWidth={3} strokeLinecap="round"
      />
      <motion.path
        d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArcFill} 1 ${f.x} ${f.y}`}
        fill="none"
        stroke={good ? "#6B8E4E" : "#D97706"}
        strokeWidth={3} strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <text
        x={size / 2} y={size * 0.42}
        textAnchor="middle" fill="#2C2418"
        fontSize={size * 0.22} fontWeight="700"
        fontFamily="'DM Serif Display', serif"
      >
        {value.toFixed(1)}
      </text>
    </svg>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp size={10} className="text-green-500" />;
  if (trend === "down") return <TrendingDown size={10} className="text-red-400" />;
  return <Minus size={10} className="text-gray-400" />;
}

export default function IDFDeepDive() {
  const rango2022 = rangoIDF[2022] ?? "Solvente";

  return (
    <div className="bg-paper rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[0.8125rem] font-semibold text-ink flex items-center gap-1.5">
          <Shield size={14} className="text-green-600" />
          Desempeño Fiscal — IDF Desagregado
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[0.625rem] font-semibold text-green-700">
          {idfGlobal?.valor ?? 83.6} pts · Sostenible
        </span>
      </div>

      {/* 6 component mini-arcs — 2 columns on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
        {components.map((c, i) => {
          const isInverse = c.abreviatura === "AF" || c.abreviatura === "DT" || c.abreviatura === "MD";
          const isGood = isInverse ? c.valor < c.meta : c.valor > c.meta;
          const name = fullNames[c.abreviatura] ?? c.indicador;
          return (
            <motion.div
              key={c.abreviatura}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg p-2 text-center ${isGood ? "bg-cream" : "bg-amber-50/60 border border-amber-200/50"}`}
            >
              <MiniArc value={c.valor} max={100} good={isGood} />
              <div className="text-[0.6875rem] font-semibold text-ink leading-tight mt-0.5">
                {name}
              </div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-[0.625rem] text-gray-400">{c.abreviatura}</span>
                <TrendIcon trend={c.tendencia} />
                <span className={`text-[0.625rem] font-semibold px-1.5 py-px rounded ${isGood ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"}`}>
                  {isGood ? "OK" : "Alerta"}
                </span>
              </div>
              <div className="text-[0.625rem] text-gray-400 mt-0.5">
                Meta: {isInverse ? "<" : ">"}{c.meta}%
              </div>
              {!isGood && (
                <div className="text-[0.5625rem] text-amber-600 mt-1 leading-snug font-medium">
                  Revisar con Hacienda
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Nuevo IDF context */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.75rem] font-semibold text-ink">Nuevo IDF (DNP · 2022)</span>
          <span className="text-[0.625rem] text-gray-400">{rango2022}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {nuevoIDF.slice(0, 4).map((n) => {
            const latest = n.series[0];
            const prev = n.series[1];
            const change = prev ? latest.value - prev.value : 0;
            const shortName = n.indicator
              .replace("Puntaje nuevo Índice de Desempeño Fiscal", "IDF Global")
              .replace("Componente de ", "")
              .replace("gestión financiera", "Gestión financiera")
              .replace("resultados fiscales", "Resultados fiscales");
            return (
              <div key={n.code} className="bg-cream rounded-lg p-2">
                <div className="text-[0.625rem] text-gray-500 leading-snug mb-0.5">
                  {shortName}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-[0.9375rem] text-ink">{latest.value.toFixed(1)}</span>
                  <span className="text-[0.625rem] text-gray-400">pts</span>
                  <span className={`text-[0.625rem] font-bold ${change >= 0 ? "text-green-500" : "text-red-400"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini sparkline trend */}
      <div className="border-t border-border pt-3 mt-3">
        <div className="text-[0.75rem] font-semibold text-ink mb-2">Tendencia IDF 2019–2024</div>
        <div className="flex items-end gap-1.5 h-16">
          {historicoIDF.map((h, i) => (
            <div key={h.year} className="flex-1 flex flex-col items-center gap-0.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(h.idf / 100) * 48}px` }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="w-full bg-ochre rounded-t-sm relative"
              >
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[0.625rem] font-bold text-ink whitespace-nowrap">
                  {h.idf}
                </span>
              </motion.div>
              <span className="text-[0.625rem] text-gray-400">{h.year.toString().slice(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
