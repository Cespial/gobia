"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------- helpers ---------- */

function scoreColorClass(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 70) return "text-blue-400";
  if (score >= 60) return "text-amber-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function scoreBgClass(score: number): string {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 70) return "bg-blue-400";
  if (score >= 60) return "bg-amber-400";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-400";
}

function rankingLabel(score: number): string {
  if (score >= 80) return "Sobresaliente";
  if (score >= 70) return "Satisfactorio";
  if (score >= 60) return "Medio";
  if (score >= 40) return "Bajo";
  return "Crítico";
}

function scoreBorderClass(score: number): string {
  if (score >= 80) return "border-emerald-400/30";
  if (score >= 70) return "border-blue-400/30";
  if (score >= 60) return "border-amber-400/30";
  if (score >= 40) return "border-orange-400/30";
  return "border-red-400/30";
}

function scoreGlowBg(score: number): string {
  if (score >= 80) return "bg-emerald-400/10";
  if (score >= 70) return "bg-blue-400/10";
  if (score >= 60) return "bg-amber-400/10";
  if (score >= 40) return "bg-orange-400/10";
  return "bg-red-400/10";
}

function globalStatusColor(s: "cumple" | "parcial" | "no_cumple") {
  if (s === "cumple") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (s === "parcial") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

function globalStatusLabel(s: "cumple" | "parcial" | "no_cumple") {
  if (s === "cumple") return "Cumple";
  if (s === "parcial") return "Parcial";
  return "No Cumple";
}

/* ---------- types ---------- */

interface IDFPanelProps {
  data: {
    resultadosFiscales: {
      name: string;
      value: number;
      score: number;
      interpretation: string;
    }[];
    gestionFinanciera: {
      name: string;
      value: number;
      score: number;
      interpretation: string;
    }[];
    scoreResultados: number;
    scoreGestion: number;
    idfTotal: number;
    ranking: string;
    status: "cumple" | "parcial" | "no_cumple";
  };
  periodo: string;
  municipio: { code: string; name: string; dept: string };
}

/* ---------- indicator section ---------- */

function IndicatorSection({
  title,
  weight,
  sectionScore,
  indicators,
}: {
  title: string;
  weight: string;
  sectionScore: number;
  indicators: {
    name: string;
    value: number;
    score: number;
    interpretation: string;
  }[];
}) {
  return (
    <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3
            className="text-sm font-semibold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h3>
          <span className="text-xs text-[var(--gray-500)]">{weight}</span>
        </div>
        <span
          className={`text-lg font-bold ${scoreColorClass(sectionScore)}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {sectionScore.toFixed(1)}
        </span>
      </div>

      <div className="space-y-4">
        {indicators.map((ind) => (
          <div key={ind.name}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-[var(--gray-400)]">{ind.name}</span>
              <span className="text-xs font-medium text-white">
                {ind.value.toFixed(1)}%
              </span>
            </div>
            <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-[var(--gray-700)]">
              <div
                className={`h-full rounded-full ${scoreBgClass(ind.score)}`}
                style={{ width: `${Math.min(ind.score, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[var(--gray-500)]">
                {ind.interpretation}
              </span>
              <span className={`font-semibold ${scoreColorClass(ind.score)}`}>
                {ind.score.toFixed(1)} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function IDFPanel({ data, periodo, municipio }: IDFPanelProps) {
  const radarData = [
    ...data.resultadosFiscales.map((i) => ({
      subject: i.name.length > 20 ? i.name.slice(0, 20) + "\u2026" : i.name,
      score: i.score,
      fullMark: 100,
    })),
    ...data.gestionFinanciera.map((i) => ({
      subject: i.name.length > 20 ? i.name.slice(0, 20) + "\u2026" : i.name,
      score: i.score,
      fullMark: 100,
    })),
  ];

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Índice de Desempeño Fiscal (IDF)
          </h2>
          <p className="mt-1 text-sm text-[var(--gray-400)]">
            {municipio.name} ({municipio.dept}) &mdash; Período{" "}
            {periodo.slice(0, 4)} T
            {(
              {
                "03": "1",
                "06": "2",
                "09": "3",
                "12": "4",
              } as Record<string, string>
            )[periodo.slice(4, 6)] || "?"}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${globalStatusColor(data.status)}`}
        >
          {globalStatusLabel(data.status)}
        </span>
      </div>

      {/* Large IDF score display + radar */}
      <div className="mb-8 grid grid-cols-1 items-center gap-6 lg:grid-cols-3">
        {/* Score card */}
        <div
          className={`flex flex-col items-center rounded-xl border p-8 ${scoreBorderClass(data.idfTotal)} ${scoreGlowBg(data.idfTotal)}`}
        >
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            IDF Total
          </div>
          <span
            className={`text-5xl font-bold ${scoreColorClass(data.idfTotal)}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.idfTotal.toFixed(1)}
          </span>
          <span
            className={`mt-2 text-sm font-semibold ${scoreColorClass(data.idfTotal)}`}
          >
            {data.ranking || rankingLabel(data.idfTotal)}
          </span>
          <div className="mt-4 flex w-full gap-3">
            <div className="flex-1 rounded-lg bg-[var(--gray-800)] p-3 text-center">
              <div className="text-[10px] text-[var(--gray-500)]">
                Resultados (80%)
              </div>
              <div
                className={`mt-0.5 text-lg font-bold ${scoreColorClass(data.scoreResultados)}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {data.scoreResultados.toFixed(1)}
              </div>
            </div>
            <div className="flex-1 rounded-lg bg-[var(--gray-800)] p-3 text-center">
              <div className="text-[10px] text-[var(--gray-500)]">
                Gestión (20%)
              </div>
              <div
                className={`mt-0.5 text-lg font-bold ${scoreColorClass(data.scoreGestion)}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {data.scoreGestion.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div className="lg:col-span-2">
          {radarData.length > 0 && (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="#404040" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#A3A3A3", fontSize: 9 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#737373", fontSize: 9 }}
                  />
                  <Radar
                    name="Puntaje"
                    dataKey="score"
                    stroke="#B8956A"
                    fill="#B8956A"
                    fillOpacity={0.2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#262626",
                      border: "1px solid #404040",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 12,
                    }}
                    formatter={(value) => `${Number(value).toFixed(1)} pts`}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Two sections side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IndicatorSection
          title="Resultados Fiscales"
          weight="Peso: 80%"
          sectionScore={data.scoreResultados}
          indicators={data.resultadosFiscales}
        />
        <IndicatorSection
          title="Gestión Financiera"
          weight="Peso: 20%"
          sectionScore={data.scoreGestion}
          indicators={data.gestionFinanciera}
        />
      </div>

      {/* Scale legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px]">
        {[
          { min: 80, label: "Sobresaliente" },
          { min: 70, label: "Satisfactorio" },
          { min: 60, label: "Medio" },
          { min: 40, label: "Bajo" },
          { min: 0, label: "Crítico" },
        ].map((tier) => (
          <div key={tier.label} className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${scoreBgClass(tier.min)}`}
            />
            <span className="text-[var(--gray-400)]">
              {tier.min > 0 ? `\u2265${tier.min}` : `<40`} {tier.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
