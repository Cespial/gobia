import MunicipioSelector from "@/components/validador/MunicipioSelector";
import { Shield, Database, Zap } from "lucide-react";

export default function ValidadorPage() {
  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1
          className="text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Validador Fiscal Municipal
        </h1>
        <p className="mt-3 text-lg text-[var(--gray-400)]">
          Diagnóstico automatizado de informes FUT y CUIPO para los{" "}
          <span className="text-[var(--ochre)]">1,104 municipios</span> de Colombia
        </p>
      </div>

      {/* Stats */}
      <div className="mx-auto mb-12 grid max-w-3xl grid-cols-3 gap-4">
        {[
          {
            icon: Shield,
            label: "Validaciones",
            value: "7+1",
            desc: "Equilibrio, Ley 617, SGP, CGA, Eficiencia, IDF",
          },
          {
            icon: Database,
            label: "Fuentes de datos",
            value: "6",
            desc: "CUIPO, SICODIS, FUT, CGN, SECOP, Deuda",
          },
          {
            icon: Zap,
            label: "Automatización",
            value: "100%",
            desc: "Sin Excel, sin pegado manual",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-5 text-center"
          >
            <s.icon className="mx-auto mb-2 h-5 w-5 text-[var(--ochre)]" />
            <div
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s.value}
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--gray-400)]">
              {s.label}
            </div>
            <div className="mt-1 text-xs text-[var(--gray-500)]">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Municipality selector */}
      <MunicipioSelector />
    </div>
  );
}
