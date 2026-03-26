"use client";

/* ---------- helpers ---------- */

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

/* ---------- types ---------- */

interface Ley617PanelProps {
  data: {
    icldTotal: number;
    gastosFuncionamientoTotal: number;
    ratioGlobal: number;
    limiteGlobal: number;
    secciones: {
      seccion: string;
      gastosFuncionamiento: number;
      icld: number;
      ratio: number;
      limite: number;
      status: "cumple" | "no_cumple";
    }[];
    status: "cumple" | "no_cumple";
  };
  periodo: string;
  municipio: { code: string; name: string; dept: string };
}

/* ---------- sub-components ---------- */

function KPI({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5">
      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </span>
      </div>
      {subtext && <div className="mt-1 text-xs text-[var(--gray-400)]">{subtext}</div>}
    </div>
  );
}

/** Semicircular gauge showing ratio vs limit */
function Gauge({
  ratio,
  limite,
  status,
}: {
  ratio: number;
  limite: number;
  status: "cumple" | "no_cumple";
}) {
  const maxDisplay = Math.max(limite * 1.5, 100);
  const ratioAngle = Math.min((ratio / maxDisplay) * 180, 180);
  const limiteAngle = (limite / maxDisplay) * 180;
  const isCumple = status === "cumple";

  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  function polarToCartesian(
    cx: number,
    cy: number,
    r: number,
    angleDeg: number,
  ) {
    const angleRad = ((180 + angleDeg) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  }

  const cx = 120;
  const cy = 110;
  const r = 90;
  const limitPos = polarToCartesian(cx, cy, r + 12, limiteAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={240} height={140} viewBox="0 0 240 140">
        {/* Background arc */}
        <path
          d={describeArc(cx, cy, r, 0, 180)}
          fill="none"
          stroke="#404040"
          strokeWidth={16}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {ratioAngle > 0 && (
          <path
            d={describeArc(cx, cy, r, 0, ratioAngle)}
            fill="none"
            stroke={isCumple ? "#34d399" : "#f87171"}
            strokeWidth={16}
            strokeLinecap="round"
          />
        )}
        {/* Limit marker */}
        <circle cx={limitPos.x} cy={limitPos.y} r={4} fill="#B8956A" />
        <text
          x={limitPos.x}
          y={limitPos.y - 10}
          textAnchor="middle"
          fill="#B8956A"
          fontSize={10}
          fontWeight={600}
        >
          Límite {limite}%
        </text>
      </svg>

      {/* Central number */}
      <div className="-mt-16 text-center">
        <span
          className={`text-4xl font-bold ${isCumple ? "text-emerald-400" : "text-red-400"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {ratio.toFixed(1)}%
        </span>
        <div className="mt-1 text-xs text-[var(--gray-400)]">
          Gastos / ICLD
        </div>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function Ley617Panel({
  data,
  periodo,
  municipio,
}: Ley617PanelProps) {
  const isCumple = data.status === "cumple";

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Cumplimiento Ley 617/2000
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
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            isCumple
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              : "border-red-400/20 bg-red-400/10 text-red-400"
          }`}
        >
          {isCumple ? "Cumple" : "No Cumple"}
        </span>
      </div>

      {/* Gauge + KPIs row */}
      <div className="mb-8 grid grid-cols-1 items-center gap-6 lg:grid-cols-3">
        <div className="flex justify-center lg:col-span-1">
          <Gauge
            ratio={data.ratioGlobal}
            limite={data.limiteGlobal}
            status={data.status}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <KPI
            label="ICLD Total"
            value={formatCOP(data.icldTotal)}
            subtext="Ingresos Corrientes de Libre Destinación"
          />
          <KPI
            label="Gastos de Funcionamiento"
            value={formatCOP(data.gastosFuncionamientoTotal)}
            subtext={`Ratio global: ${data.ratioGlobal.toFixed(1)}% / Límite: ${data.limiteGlobal}%`}
          />
        </div>
      </div>

      {/* Section cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {data.secciones.map((s) => {
          const secCumple = s.status === "cumple";
          return (
            <div
              key={s.seccion}
              className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)] p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.seccion}
                </h4>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    secCumple
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                      : "border-red-400/20 bg-red-400/10 text-red-400"
                  }`}
                >
                  {secCumple ? "CUMPLE" : "NO CUMPLE"}
                </span>
              </div>

              <div className="mb-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--gray-500)]">Gastos func.</span>
                  <span className="text-[var(--gray-300)]">
                    {formatCOP(s.gastosFuncionamiento)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--gray-500)]">ICLD</span>
                  <span className="text-[var(--gray-300)]">
                    {formatCOP(s.icld)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--gray-500)]">Ratio</span>
                  <span
                    className={`font-semibold ${secCumple ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {s.ratio.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--gray-500)]">Límite legal</span>
                  <span className="text-[var(--ochre)]">{s.limite}%</span>
                </div>
              </div>

              {/* Progress bar: ratio vs limit */}
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--gray-700)]">
                <div
                  className={`h-full rounded-full transition-all ${
                    secCumple ? "bg-emerald-400" : "bg-red-400"
                  }`}
                  style={{
                    width: `${Math.min((s.ratio / Math.max(s.limite * 1.5, 100)) * 100, 100)}%`,
                  }}
                />
                {/* Limit marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-[var(--ochre)]"
                  style={{
                    left: `${(s.limite / Math.max(s.limite * 1.5, 100)) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[var(--gray-500)]">
                <span>0%</span>
                <span>{s.limite}% límite</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/50 px-4 py-3 text-xs text-[var(--gray-500)]">
        <strong className="text-[var(--gray-400)]">Nota:</strong> La Ley
        617/2000 establece límites al gasto de funcionamiento de las entidades
        territoriales como proporción de sus Ingresos Corrientes de Libre
        Destinación (ICLD). Los límites varían según la categoría del municipio.
        El incumplimiento puede derivar en planes de ajuste fiscal y
        restricciones presupuestales.
      </div>
    </div>
  );
}
