"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { Clock, Zap } from "lucide-react";

const rows = [
  {
    task: "Reporte trimestral FUT",
    before: "2 semanas, 3 funcionarios, Excel + copiar/pegar entre sistemas",
    after: "15 minutos — consolidación automática desde datos ya integrados",
  },
  {
    task: "Consulta del estatuto tributario",
    before: "Buscar en PDF de 400+ páginas, interpretar manualmente cada artículo",
    after: "Pregunta en lenguaje natural, respuesta con citación de artículos",
  },
  {
    task: "Generación exógena DIAN",
    before: "3–4 días, XML armado a mano, alto riesgo de rechazo por formato",
    after: "30 minutos — validación cruzada automática contra base contable",
  },
  {
    task: "Seguimiento metas del PDM",
    before: "Semáforo manual en Excel, actualización mensual o trimestral",
    after: "Dashboard en tiempo real con alertas automáticas por meta",
  },
  {
    task: "Rendición SIRECI / SIA / FUT",
    before: "Días de consolidación manual, doble digitación, riesgo de multa",
    after: "Reportes pre-generados con datos ya capturados en el sistema",
  },
];

/* ────────────────────────────────────────────
   "Antes" — Messy Excel mock (SVG)
   ──────────────────────────────────────────── */
function AntesSVG() {
  return (
    <svg
      viewBox="0 0 600 400"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background — dark spreadsheet feel */}
      <rect width="600" height="400" fill="#f0f0f0" />

      {/* Title bar */}
      <rect width="600" height="28" fill="#4a4a4a" />
      <text x="12" y="18" fontSize="11" fill="#ccc" fontFamily="monospace">
        reporte_final_v3_CORREGIDO(2).xlsx
      </text>
      <circle cx="574" cy="14" r="5" fill="#e74c3c" opacity="0.7" />
      <circle cx="556" cy="14" r="5" fill="#f39c12" opacity="0.7" />
      <circle cx="538" cy="14" r="5" fill="#2ecc71" opacity="0.7" />

      {/* Toolbar — fake Excel ribbon */}
      <rect y="28" width="600" height="20" fill="#e8e8e8" />
      <text x="10" y="42" fontSize="8" fill="#888" fontFamily="sans-serif">
        Archivo
      </text>
      <text x="50" y="42" fontSize="8" fill="#888" fontFamily="sans-serif">
        Editar
      </text>
      <text x="85" y="42" fontSize="8" fill="#888" fontFamily="sans-serif">
        Formato
      </text>
      <text x="130" y="42" fontSize="8" fill="#888" fontFamily="sans-serif">
        Datos
      </text>

      {/* Row/col headers */}
      <rect y="48" width="28" height="352" fill="#e0e0e0" />
      <rect y="48" width="600" height="22" fill="#e0e0e0" />

      {/* Column letters */}
      <text x="52" y="63" fontSize="9" fill="#888" fontFamily="monospace" textAnchor="middle">A</text>
      <text x="130" y="63" fontSize="9" fill="#888" fontFamily="monospace" textAnchor="middle">B</text>
      <text x="230" y="63" fontSize="9" fill="#888" fontFamily="monospace" textAnchor="middle">C</text>
      <text x="340" y="63" fontSize="9" fill="#888" fontFamily="monospace" textAnchor="middle">D</text>
      <text x="440" y="63" fontSize="9" fill="#888" fontFamily="monospace" textAnchor="middle">E</text>
      <text x="540" y="63" fontSize="9" fill="#888" fontFamily="monospace" textAnchor="middle">F</text>

      {/* Row numbers */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => (
        <text key={n} x="14" y={87 + i * 28} fontSize="8" fill="#888" fontFamily="monospace" textAnchor="middle">
          {n}
        </text>
      ))}

      {/* Grid lines — intentionally inconsistent */}
      <line x1="28" y1="70" x2="600" y2="70" stroke="#ccc" strokeWidth="0.5" />
      {[98, 126, 154, 182, 210, 238, 266, 294, 322, 350, 378].map((y) => (
        <line key={y} x1="28" y1={y} x2="600" y2={y} stroke="#d5d5d5" strokeWidth="0.5" />
      ))}
      {[88, 170, 280, 390, 490].map((x) => (
        <line key={x} x1={x} y1="48" x2={x} y2="400" stroke="#d5d5d5" strokeWidth="0.5" />
      ))}

      {/* Header row — messy inconsistent headers */}
      <rect x="28" y="70" width="572" height="28" fill="#d4d4d4" />
      <text x="35" y="88" fontSize="9" fontWeight="bold" fill="#333" fontFamily="monospace">
        SISFUT
      </text>
      <text x="95" y="88" fontSize="11" fontWeight="bold" fill="#555" fontFamily="serif">
        FUT
      </text>
      <text x="175" y="88" fontSize="8" fill="#666" fontFamily="sans-serif">
        CHIP_cod
      </text>
      <text x="285" y="88" fontSize="10" fontWeight="bold" fill="#333" fontFamily="monospace">
        VALOR
      </text>
      <text x="395" y="88" fontSize="7" fill="#999" fontFamily="sans-serif">
        fecha_corte
      </text>
      <text x="495" y="88" fontSize="9" fill="#555" fontFamily="monospace">
        ESTADO
      </text>

      {/* Data rows — chaotic */}
      {/* Row 1 */}
      <text x="35" y="116" fontSize="9" fill="#444" fontFamily="monospace">A-2301</text>
      <text x="95" y="116" fontSize="9" fill="#444" fontFamily="monospace">12.4</text>
      <text x="175" y="116" fontSize="9" fill="#444" fontFamily="monospace">CGR-001</text>
      <text x="285" y="116" fontSize="9" fill="#444" fontFamily="monospace">$1,234,567</text>
      <text x="395" y="116" fontSize="9" fill="#444" fontFamily="monospace">2024/03/1</text>
      <text x="495" y="116" fontSize="9" fill="#444" fontFamily="monospace">OK</text>

      {/* Row 2 — ERROR */}
      <rect x="280" y="100" width="105" height="28" fill="#fde8e8" />
      <text x="35" y="144" fontSize="9" fill="#444" fontFamily="monospace">B-4502</text>
      <text x="95" y="144" fontSize="9" fill="#444" fontFamily="monospace">???</text>
      <text x="175" y="144" fontSize="9" fill="#444" fontFamily="monospace">CGR-002</text>
      <text x="285" y="144" fontSize="10" fontWeight="bold" fill="#dc2626" fontFamily="monospace">ERROR</text>
      <text x="395" y="144" fontSize="8" fill="#444" fontFamily="monospace">01-mar-24</text>
      <text x="495" y="144" fontSize="9" fill="#dc2626" fontFamily="monospace">X</text>

      {/* Row 3 */}
      <text x="35" y="172" fontSize="9" fill="#444" fontFamily="monospace">C-1103</text>
      <text x="95" y="172" fontSize="9" fill="#444" fontFamily="monospace">8.91</text>
      <text x="175" y="172" fontSize="9" fill="#444" fontFamily="monospace">CGR003</text>
      <text x="285" y="172" fontSize="9" fill="#444" fontFamily="monospace">1234567</text>
      <text x="395" y="172" fontSize="9" fill="#444" fontFamily="monospace">2024-03-01</text>
      <text x="495" y="172" fontSize="9" fill="#444" fontFamily="monospace">PEND.</text>

      {/* Row 4 — more mess */}
      <rect x="88" y="182" width="82" height="28" fill="#fef3cd" />
      <text x="35" y="200" fontSize="9" fill="#444" fontFamily="monospace">D-7788</text>
      <text x="95" y="200" fontSize="9" fill="#b45309" fontFamily="monospace">???</text>
      <text x="175" y="200" fontSize="9" fill="#444" fontFamily="monospace">CGR_004</text>
      <text x="285" y="200" fontSize="9" fill="#444" fontFamily="monospace">$  987.654</text>
      <text x="395" y="200" fontSize="9" fill="#444" fontFamily="monospace">Mar 1, 24</text>
      <text x="495" y="200" fontSize="9" fill="#dc2626" fontWeight="bold" fontFamily="monospace">ERROR</text>

      {/* Row 5 */}
      <text x="35" y="228" fontSize="9" fill="#444" fontFamily="monospace">E-0091</text>
      <text x="95" y="228" fontSize="9" fill="#444" fontFamily="monospace">14.2</text>
      <text x="175" y="228" fontSize="8" fill="#444" fontFamily="monospace">CGR-005</text>
      <text x="285" y="228" fontSize="9" fill="#444" fontFamily="monospace">$2.345.678</text>
      <text x="395" y="228" fontSize="9" fill="#444" fontFamily="monospace">01/03/2024</text>
      <text x="495" y="228" fontSize="9" fill="#444" fontFamily="monospace">OK</text>

      {/* Row 6 — empty/broken */}
      <rect x="280" y="238" width="105" height="28" fill="#fde8e8" />
      <text x="35" y="256" fontSize="9" fill="#444" fontFamily="monospace">F-3320</text>
      <text x="95" y="256" fontSize="9" fill="#444" fontFamily="monospace">--</text>
      <text x="175" y="256" fontSize="9" fill="#aaa" fontFamily="monospace">#N/A</text>
      <text x="285" y="256" fontSize="9" fill="#dc2626" fontFamily="monospace">#REF!</text>
      <text x="395" y="256" fontSize="9" fill="#444" fontFamily="monospace">???</text>
      <text x="495" y="256" fontSize="9" fill="#dc2626" fontFamily="monospace">X</text>

      {/* Row 7 */}
      <text x="35" y="284" fontSize="9" fill="#444" fontFamily="monospace">G-1155</text>
      <text x="95" y="284" fontSize="9" fill="#444" fontFamily="monospace">6.0</text>
      <text x="175" y="284" fontSize="9" fill="#444" fontFamily="monospace">CGR-007</text>
      <text x="285" y="284" fontSize="9" fill="#444" fontFamily="monospace">456,789</text>
      <text x="395" y="284" fontSize="9" fill="#444" fontFamily="monospace">1-Mar</text>
      <text x="495" y="284" fontSize="9" fill="#b45309" fontFamily="monospace">PEND.</text>

      {/* Row 8 — another error */}
      <rect x="280" y="294" width="105" height="28" fill="#fde8e8" />
      <text x="35" y="312" fontSize="9" fill="#444" fontFamily="monospace">H-9944</text>
      <text x="95" y="312" fontSize="11" fill="#444" fontFamily="serif">3,5</text>
      <text x="175" y="312" fontSize="9" fill="#444" fontFamily="monospace">CGR--08</text>
      <text x="285" y="312" fontSize="9" fill="#dc2626" fontWeight="bold" fontFamily="monospace">#VALUE!</text>
      <text x="395" y="312" fontSize="7" fill="#444" fontFamily="monospace">marzo 2024</text>
      <text x="495" y="312" fontSize="9" fill="#dc2626" fontFamily="monospace">ERROR</text>

      {/* Rows 9-10 dimmed */}
      <text x="35" y="340" fontSize="9" fill="#bbb" fontFamily="monospace">I-2200</text>
      <text x="95" y="340" fontSize="9" fill="#bbb" fontFamily="monospace">...</text>
      <text x="175" y="340" fontSize="9" fill="#bbb" fontFamily="monospace">...</text>
      <text x="285" y="340" fontSize="9" fill="#bbb" fontFamily="monospace">...</text>

      <text x="35" y="368" fontSize="9" fill="#bbb" fontFamily="monospace">J-0087</text>
      <text x="95" y="368" fontSize="9" fill="#bbb" fontFamily="monospace">...</text>

      {/* Red X marks scattered */}
      <text x="560" y="146" fontSize="16" fill="#dc2626" fontWeight="bold" opacity="0.6">X</text>
      <text x="560" y="258" fontSize="16" fill="#dc2626" fontWeight="bold" opacity="0.6">X</text>
      <text x="560" y="314" fontSize="16" fill="#dc2626" fontWeight="bold" opacity="0.6">X</text>

      {/* Warning triangle */}
      <g transform="translate(155, 192)" opacity="0.7">
        <polygon points="6,0 12,10 0,10" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
        <text x="6" y="9" fontSize="7" fill="#fff" textAnchor="middle" fontWeight="bold">!</text>
      </g>

      {/* Merge conflict indicator */}
      <rect x="30" y="380" width="200" height="18" fill="#fde8e8" rx="2" opacity="0.8" />
      <text x="38" y="393" fontSize="8" fill="#dc2626" fontFamily="monospace">
        3 errores | 2 formatos mixtos | 1 #REF
      </text>
    </svg>
  );
}

/* ────────────────────────────────────────────
   "Después" — Clean Gobia dashboard (SVG)
   ──────────────────────────────────────────── */
function DespuesSVG() {
  return (
    <svg
      viewBox="0 0 600 400"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="600" height="400" fill="#FAFAF8" />

      {/* Top bar */}
      <rect width="600" height="36" fill="#1A1A1A" rx="0" />
      <text x="16" y="23" fontSize="13" fontWeight="700" fill="#FAFAF8" fontFamily="sans-serif">
        gobia
      </text>
      <circle cx="40" cy="18" r="2" fill="#B8956A" />
      <text x="400" y="23" fontSize="9" fill="#888" fontFamily="sans-serif">
        Panel de Hacienda
      </text>
      <circle cx="570" cy="18" r="10" fill="#333" />
      <text x="570" y="22" fontSize="9" fill="#ccc" textAnchor="middle" fontFamily="sans-serif">
        JR
      </text>

      {/* Breadcrumb / section title */}
      <text x="24" y="58" fontSize="8" fill="#A3A3A3" fontFamily="sans-serif">
        Reportes
      </text>
      <text x="68" y="58" fontSize="8" fill="#A3A3A3" fontFamily="sans-serif">
        /
      </text>
      <text x="78" y="58" fontSize="8" fill="#1A1A1A" fontWeight="600" fontFamily="sans-serif">
        FUT Trimestral
      </text>

      <text x="24" y="78" fontSize="16" fontWeight="700" fill="#1A1A1A" fontFamily="sans-serif">
        Reporte consolidado Q1 2024
      </text>

      {/* KPI Cards — 2x2 grid */}
      {/* Card 1 */}
      <rect x="24" y="92" width="132" height="64" rx="8" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" />
      <text x="36" y="112" fontSize="8" fill="#A3A3A3" fontFamily="sans-serif">
        Recaudo total
      </text>
      <text x="36" y="132" fontSize="18" fontWeight="700" fill="#1A1A1A" fontFamily="sans-serif">
        $1.2B
      </text>
      <text x="108" y="132" fontSize="8" fill="#16a34a" fontFamily="sans-serif">
        +12%
      </text>

      {/* Card 2 */}
      <rect x="164" y="92" width="132" height="64" rx="8" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" />
      <text x="176" y="112" fontSize="8" fill="#A3A3A3" fontFamily="sans-serif">
        Formularios
      </text>
      <text x="176" y="132" fontSize="18" fontWeight="700" fill="#1A1A1A" fontFamily="sans-serif">
        847
      </text>
      {/* Checkmark */}
      <g transform="translate(250, 118)">
        <circle r="8" fill="#dcfce7" />
        <path d="M-3,0 L-1,3 L4,-3" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Card 3 */}
      <rect x="304" y="92" width="132" height="64" rx="8" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" />
      <text x="316" y="112" fontSize="8" fill="#A3A3A3" fontFamily="sans-serif">
        Tasa de error
      </text>
      <text x="316" y="132" fontSize="18" fontWeight="700" fill="#1A1A1A" fontFamily="sans-serif">
        0.3%
      </text>
      <text x="370" y="132" fontSize="8" fill="#16a34a" fontFamily="sans-serif">
        -94%
      </text>

      {/* Card 4 */}
      <rect x="444" y="92" width="132" height="64" rx="8" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" />
      <text x="456" y="112" fontSize="8" fill="#A3A3A3" fontFamily="sans-serif">
        Tiempo proceso
      </text>
      <text x="456" y="132" fontSize="18" fontWeight="700" fill="#1A1A1A" fontFamily="sans-serif">
        15m
      </text>
      {/* Checkmark */}
      <g transform="translate(530, 118)">
        <circle r="8" fill="#dcfce7" />
        <path d="M-3,0 L-1,3 L4,-3" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Bar chart section */}
      <rect x="24" y="168" width="350" height="218" rx="8" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" />
      <text x="40" y="192" fontSize="10" fontWeight="600" fill="#1A1A1A" fontFamily="sans-serif">
        Recaudo por categoría
      </text>
      <text x="40" y="204" fontSize="8" fill="#A3A3A3" fontFamily="sans-serif">
        Enero - Marzo 2024
      </text>

      {/* Chart axis */}
      <line x1="56" y1="220" x2="56" y2="368" stroke="#E5E5E5" strokeWidth="1" />
      <line x1="56" y1="368" x2="350" y2="368" stroke="#E5E5E5" strokeWidth="1" />

      {/* Horizontal grid lines */}
      <line x1="56" y1="258" x2="350" y2="258" stroke="#F0F0F0" strokeWidth="0.5" strokeDasharray="3,3" />
      <line x1="56" y1="295" x2="350" y2="295" stroke="#F0F0F0" strokeWidth="0.5" strokeDasharray="3,3" />
      <line x1="56" y1="332" x2="350" y2="332" stroke="#F0F0F0" strokeWidth="0.5" strokeDasharray="3,3" />

      {/* Y-axis labels */}
      <text x="50" y="224" fontSize="7" fill="#A3A3A3" textAnchor="end" fontFamily="sans-serif">$400M</text>
      <text x="50" y="261" fontSize="7" fill="#A3A3A3" textAnchor="end" fontFamily="sans-serif">$300M</text>
      <text x="50" y="298" fontSize="7" fill="#A3A3A3" textAnchor="end" fontFamily="sans-serif">$200M</text>
      <text x="50" y="335" fontSize="7" fill="#A3A3A3" textAnchor="end" fontFamily="sans-serif">$100M</text>

      {/* Bars */}
      <rect x="80" y="240" width="42" height="128" rx="3" fill="#D4D4D4" />
      <rect x="145" y="260" width="42" height="108" rx="3" fill="#D4D4D4" />
      <rect x="210" y="228" width="42" height="140" rx="3" fill="#B8956A" />
      <rect x="275" y="288" width="42" height="80" rx="3" fill="#D4D4D4" />

      {/* Bar labels */}
      <text x="101" y="382" fontSize="7" fill="#737373" textAnchor="middle" fontFamily="sans-serif">Predial</text>
      <text x="166" y="382" fontSize="7" fill="#737373" textAnchor="middle" fontFamily="sans-serif">ICA</text>
      <text x="231" y="382" fontSize="7" fill="#1A1A1A" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">Sobretasa</text>
      <text x="296" y="382" fontSize="7" fill="#737373" textAnchor="middle" fontFamily="sans-serif">Otros</text>

      {/* Bar values on top */}
      <text x="101" y="235" fontSize="7" fill="#737373" textAnchor="middle" fontFamily="sans-serif">$350M</text>
      <text x="166" y="255" fontSize="7" fill="#737373" textAnchor="middle" fontFamily="sans-serif">$290M</text>
      <text x="231" y="223" fontSize="7" fill="#B8956A" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">$380M</text>
      <text x="296" y="283" fontSize="7" fill="#737373" textAnchor="middle" fontFamily="sans-serif">$210M</text>

      {/* Right side — status list */}
      <rect x="386" y="168" width="190" height="218" rx="8" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" />
      <text x="402" y="192" fontSize="10" fontWeight="600" fill="#1A1A1A" fontFamily="sans-serif">
        Estado de reportes
      </text>

      {/* Status items */}
      {[
        { label: "FUT", status: "Enviado", y: 214 },
        { label: "CHIP", status: "Enviado", y: 240 },
        { label: "SIRECI", status: "Enviado", y: 266 },
        { label: "SIA Observa", status: "Enviado", y: 292 },
        { label: "Exógena DIAN", status: "Validado", y: 318 },
      ].map((item) => (
        <g key={item.label}>
          {/* Green checkmark */}
          <circle cx="410" cy={item.y - 4} r="6" fill="#dcfce7" />
          <path
            d={`M${407},${item.y - 4} L${409},${item.y - 1} L${414},${item.y - 8}`}
            stroke="#16a34a"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="422" y={item.y} fontSize="9" fill="#1A1A1A" fontFamily="sans-serif">
            {item.label}
          </text>
          <text x="540" y={item.y} fontSize="8" fill="#16a34a" fontFamily="sans-serif" textAnchor="end">
            {item.status}
          </text>
          {item.y < 318 && (
            <line x1="402" y1={item.y + 10} x2="560" y2={item.y + 10} stroke="#F0F0F0" strokeWidth="0.5" />
          )}
        </g>
      ))}

      {/* Status bar at very bottom */}
      <rect x="402" y="345" width="156" height="28" rx="6" fill="#F5F0E8" />
      <text x="416" y="363" fontSize="8" fontWeight="600" fill="#B8956A" fontFamily="sans-serif">
        5/5 reportes al dia
      </text>
      {/* Small checkmark */}
      <g transform="translate(550, 355)">
        <circle r="6" fill="#B8956A" opacity="0.2" />
        <path d="M-2,0 L0,2 L3,-2" stroke="#B8956A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>

      {/* gobia logo watermark */}
      <text x="564" y="396" fontSize="9" fontWeight="700" fill="#D4D4D4" fontFamily="sans-serif" textAnchor="end">
        gobia
      </text>
    </svg>
  );
}

/* ────────────────────────────────────────────
   Before/After Slider component
   ──────────────────────────────────────────── */
function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderInView = useInView(containerRef, { once: true, margin: "-40px" });

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(4, Math.min(96, (x / rect.width) * 100));
      setPosition(pct);
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setHasInteracted(true);
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      setHasInteracted(true);
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientX);
    };
    const onEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className="relative h-[200px] md:h-[300px] rounded-2xl border border-border bg-paper overflow-hidden shadow-sm select-none cursor-col-resize touch-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-label="Comparación antes y después"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition((p) => Math.max(4, p - 2));
        if (e.key === "ArrowRight") setPosition((p) => Math.min(96, p + 2));
      }}
    >
      {/* "Antes" — full width behind */}
      <div className="absolute inset-0">
        <AntesSVG />
      </div>

      {/* "Después" — clipped to reveal from right */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <DespuesSVG />
      </div>

      {/* Labels — always visible, larger on mobile */}
      <div
        className="absolute top-3 left-3 md:top-4 md:left-4 z-10 pointer-events-none"
        style={{ opacity: position > 10 ? 1 : 0, transition: "opacity 0.2s" }}
      >
        <span className="inline-block bg-gray-800/85 backdrop-blur-sm text-white text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg tracking-wide uppercase">
          Antes
        </span>
      </div>
      <div
        className="absolute top-3 right-3 md:top-4 md:right-4 z-10 pointer-events-none"
        style={{ opacity: position < 90 ? 1 : 0, transition: "opacity 0.2s" }}
      >
        <span className="inline-block bg-ochre/90 backdrop-blur-sm text-white text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg tracking-wide uppercase">
          Con Gobia
        </span>
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="w-[2px] h-full bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.3),0_0_16px_rgba(184,149,106,0.45),0_0_32px_rgba(184,149,106,0.2)]" />
      </div>

      {/* Drag handle */}
      <motion.div
        className="absolute z-30 pointer-events-none"
        style={{
          left: `${position}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={
          sliderInView && !hasInteracted
            ? { x: [0, -6, 6, -4, 4, 0] }
            : {}
        }
        transition={{
          duration: 1.2,
          delay: 0.8,
          ease: "easeInOut",
          repeat: sliderInView && !hasInteracted ? 1 : 0,
          repeatDelay: 1.5,
        }}
      >
        <div className="w-11 h-11 md:w-10 md:h-10 rounded-full bg-white border-2 border-ochre/40 shadow-lg flex items-center justify-center pointer-events-auto cursor-col-resize transition-transform hover:scale-110 ring-4 ring-ochre/10">
          {/* Left/right arrows */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500"
          >
            <path
              d="M5.5 6L3 9L5.5 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.5 6L15 9L12.5 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main section
   ──────────────────────────────────────────── */
export default function Comparativa() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre-text mb-4"
          >
            Antes vs. con Gobia
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif font-bold text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-ink mb-5"
          >
            El impacto en números reales
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[1.0625rem] leading-relaxed text-gray-500 max-w-2xl mx-auto"
          >
            Así cambia el día a día de un funcionario público cuando la
            tecnología trabaja a su favor.
          </motion.p>
        </div>

        {/* ── Before/After Slider ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-10"
        >

          <p className="text-center text-[0.8125rem] text-gray-400 mb-3 flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-[2px] bg-gray-300" />
            Arrastra para comparar
            <span className="inline-block w-4 h-[2px] bg-gray-300" />
          </p>
          <BeforeAfterSlider />
        </motion.div>

        {/* Table — desktop */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="hidden md:block"
        >
          <div className="rounded-2xl border border-border bg-paper overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border">
              <div className="px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-gray-400">
                Proceso
              </div>
              <div className="px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-gray-400 border-l border-border flex items-center gap-2">
                <Clock size={14} className="text-gray-300" />
                Flujo tradicional
              </div>
              <div className="px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ochre-text border-l border-border flex items-center gap-2">
                <Zap size={14} className="text-ochre" />
                Con Gobia
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.task}
                className={`grid grid-cols-[1fr_1fr_1fr] ${i < rows.length - 1 ? "border-b border-border-light" : ""}`}
              >
                <div className="px-6 py-5 text-[0.9375rem] font-semibold text-ink">
                  {row.task}
                </div>
                <div className="px-6 py-5 text-[0.875rem] leading-relaxed text-gray-500 border-l border-border-light">
                  {row.before}
                </div>
                <div className="px-6 py-5 text-[0.875rem] leading-relaxed text-ink font-medium border-l border-border-light bg-ochre-soft/30">
                  {row.after}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cards — mobile */}
        <div className="md:hidden space-y-4">
          {rows.map((row, i) => (
            <motion.div
              key={row.task}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              className="card"
            >
              <h3 className="text-[0.9375rem] font-bold text-ink mb-3">
                {row.task}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-1 flex items-center gap-1.5">
                    <Clock size={12} />
                    Antes
                  </p>
                  <p className="text-[0.8125rem] leading-relaxed text-gray-500">
                    {row.before}
                  </p>
                </div>
                <div className="rounded-lg bg-ochre-soft/40 p-3">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ochre mb-1 flex items-center gap-1.5">
                    <Zap size={12} />
                    Con Gobia
                  </p>
                  <p className="text-[0.8125rem] leading-relaxed text-ink font-medium">
                    {row.after}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-[0.75rem] text-gray-400 mt-8 italic"
        >
          * Estimaciones basadas en análisis de eficiencia para entidades de categorías 4–6.
          Resultados reales dependen de la configuración y volumen de cada entidad.
        </motion.p>
      </div>
    </section>
  );
}
