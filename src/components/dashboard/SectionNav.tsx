"use client";

import { useState, useEffect } from "react";
import { Sparkles, BarChart3, PieChart, Shield, TrendingUp, Wifi } from "lucide-react";

const sections = [
  { id: "resumen", label: "Resumen", short: "Resumen", icon: Sparkles },
  { id: "presupuesto", label: "Presupuesto", short: "Presup.", icon: BarChart3 },
  { id: "gasto", label: "Gasto", short: "Gasto", icon: PieChart },
  { id: "fiscal", label: "Desempeño Fiscal", short: "Fiscal", icon: Shield },
  { id: "inversion", label: "Inversión", short: "Invers.", icon: TrendingUp },
  { id: "datos-vivo", label: "En vivo", short: "Vivo", icon: Wifi },
];

export default function SectionNav() {
  const [active, setActive] = useState("resumen");

  useEffect(() => {
    const panel = document.getElementById("data-panel");
    if (!panel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { root: panel, threshold: 0.3 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-1.5 -mx-4 md:-mx-5 md:px-5">
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            aria-label={`Ir a sección ${s.label}`}
            aria-current={active === s.id ? "true" : undefined}
            className={`shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md text-[0.6875rem] font-medium transition-all ${
              active === s.id
                ? "bg-ochre text-paper"
                : "text-gray-400 hover:text-ink hover:bg-cream"
            }`}
          >
            <s.icon size={12} />
            <span className="sm:hidden">{s.short}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
