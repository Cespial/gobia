"use client";

import { ExternalLink } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Mini Colombia presence map                                         */
/* ------------------------------------------------------------------ */

const COLOMBIA_OUTLINE =
  "M42,120 L38,175 L30,155 L32,135 L42,120 Z " +
  "M42,120 L58,115 L72,120 L78,135 L82,155 L80,175 L72,195 L62,200 " +
  "L55,210 L55,228 L52,275 L45,310 L35,325 L35,345 L48,362 L62,368 L78,360 " +
  "L88,345 L98,372 L115,378 L132,372 L145,358 L170,350 L200,355 L218,365 " +
  "L225,388 L210,400 L178,400 L150,395 L132,385 L132,372 " +
  "L115,378 L98,372 L88,360 L88,345 " +
  "L105,335 L125,330 L118,318 L105,318 L90,325 L75,318 L60,298 " +
  "L65,248 L55,258 L55,228 L62,200 L48,195 L38,175 " +
  "L42,120 " +
  "M82,80 L85,100 L75,112 L78,130 L82,155 L80,175 L88,195 " +
  "L95,210 L100,235 L108,255 L120,268 L115,290 L125,305 " +
  "L138,308 L152,298 L158,275 L155,255 L142,248 L135,265 " +
  "L120,268 L108,262 L92,252 L78,258 L65,248 L55,228 " +
  "L55,210 L62,195 L72,195 L80,175 L82,155 L78,135 L72,120 " +
  "L82,80 " +
  "M82,80 L95,65 L115,58 L120,60 L140,55 L155,55 L170,48 L180,52 " +
  "L205,35 L225,60 L240,65 L255,50 L265,30 L255,10 L230,5 L205,12 " +
  "L210,35 L205,35 L180,42 L155,55 L140,55 L120,60 L115,58 L95,65 " +
  "L82,80 " +
  "M265,105 L260,130 L245,145 L238,168 L255,170 L272,178 L275,200 " +
  "L295,210 L298,235 L295,260 L298,270 L295,300 L280,315 L260,318 " +
  "L248,305 L252,342 L240,358 L218,365 L200,355 L192,340 L200,318 " +
  "L195,285 L210,262 L185,255 L170,240 L170,228 L155,230 L140,225 " +
  "L130,212 L128,198 L118,205 L105,200 L98,188 L105,168 L90,148 " +
  "L95,115 L108,120 L128,105 L140,120 L155,150 L170,140 L182,125 " +
  "L190,105 L195,105 L200,90 L185,85 L175,70 L182,55 L200,65 " +
  "L215,80 L225,110 L248,95 L265,105";

interface CityDot {
  name: string;
  cx: number;
  cy: number;
  active: boolean;
}

const CITIES: CityDot[] = [
  { name: "Medellín",      cx: 108, cy: 145, active: true },
  { name: "Bogotá",        cx: 160, cy: 208, active: true },
  { name: "Cali",          cx: 82,  cy: 235, active: false },
  { name: "Barranquilla",  cx: 162, cy: 58,  active: false },
  { name: "Montería",      cx: 102, cy: 95,  active: false },
  { name: "Bucaramanga",   cx: 200, cy: 130, active: false },
];

function MiniColombiaMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center md:items-start"
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-paper/25 mb-4">
        Presencia
      </p>

      <svg
        width="120"
        height="160"
        viewBox="0 0 300 400"
        fill="none"
        role="img"
        aria-label="Mapa de presencia de gobia en Colombia"
        className="overflow-visible"
      >
        {/* Pulse animation for active dots */}
        <defs>
          <style>{`
            @keyframes footerPulse {
              0%, 100% { r: 4; opacity: 1; }
              50% { r: 7; opacity: 0.5; }
            }
            .footer-pulse-ring {
              animation: footerPulse 2.4s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .footer-pulse-ring { animation: none; }
            }
          `}</style>
        </defs>

        {/* Country silhouette */}
        <path
          d={COLOMBIA_OUTLINE}
          fill="#262626"
          stroke="#404040"
          strokeWidth={1}
          fillRule="evenodd"
        />

        {/* City dots */}
        {CITIES.map((city) => (
          <g key={city.name}>
            {city.active && (
              <circle
                cx={city.cx}
                cy={city.cy}
                r={4}
                fill="#B8956A"
                opacity={0.35}
                className="footer-pulse-ring"
              />
            )}
            <circle
              cx={city.cx}
              cy={city.cy}
              r={4}
              fill={city.active ? "#B8956A" : "#525252"}
            />
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-[0.625rem] text-paper/35">
          <span className="inline-block w-2 h-2 rounded-full bg-ochre" />
          Piloto activo
        </span>
        <span className="flex items-center gap-1.5 text-[0.625rem] text-paper/35">
          <span className="inline-block w-2 h-2 rounded-full border border-paper/25" />
          Próximamente
        </span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_auto_auto] md:gap-16">
          <div>
            <div className="flex items-baseline gap-0.5 mb-4">
              <span className="font-serif text-lg tracking-tight text-paper">gobia</span>
              <span className="font-serif text-sm text-ochre">.co</span>
            </div>
            <p className="text-[0.875rem] leading-relaxed text-paper/45 max-w-xs mb-6">
              Gestión pública inteligente para Colombia. Una solución de{" "}
              <a href="https://inplux.co" target="_blank" rel="noopener noreferrer" className="text-paper/60 hover:text-paper transition-colors underline underline-offset-2">
                inplux.co
              </a>
            </p>
            <div className="flex flex-wrap gap-3">
              {["inplux.co", "tribai.co"].map((badge) => (
                <span key={badge} className="inline-flex items-center rounded-full bg-paper/[0.05] border border-paper/10 px-3 py-1 text-[0.6875rem] font-medium text-paper/40">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-paper/25 mb-4">Producto</p>
            <ul className="space-y-2.5">
              {[
                { label: "Solución", href: "#solucion" },
                { label: "Tecnología", href: "#tecnologia" },
                { label: "Casos de uso", href: "#casos" },
                { label: "Solicitar demo", href: "#contacto" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[0.8125rem] text-paper/45 hover:text-paper transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-paper/25 mb-4">Legal</p>
            <ul className="space-y-2.5">
              {["Política de privacidad", "Tratamiento de datos", "Términos de uso"].map((label) => (
                <li key={label}>
                  <a href="#" className="text-[0.8125rem] text-paper/45 hover:text-paper transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Mini Colombia presence map */}
          <MiniColombiaMap />
        </div>

        <div className="my-10 h-px bg-paper/10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.75rem] text-paper/25">
            &copy; {new Date().getFullYear()} gobia.co — Todos los derechos reservados. Una empresa de inplux.co
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: "tribai.co", href: "https://tribai.co" },
              { label: "inplux.co", href: "https://inplux.co" },
            ].map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[0.75rem] text-paper/25 hover:text-paper/50 transition-colors">
                {link.label}
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
