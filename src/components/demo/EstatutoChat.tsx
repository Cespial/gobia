"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BookOpen, Sparkles, Scale } from "lucide-react";
import GobiaLogo from "@/components/illustrations/GobiaLogo";
import {
  tarifasPredial,
  tarifasICA,
  tarifasRST,
  tarifasFinancieras,
  retencionICA,
  tributosDistritales,
  estatutoMeta,
  estatutoStructure,
} from "@/data/medellin-estatuto";

interface Message {
  role: "user" | "assistant";
  content: string;
  citation?: { article: string; libro: string };
}

// ---------------------------------------------------------------------------
// Expanded Q&A knowledge base — all from Acuerdo 093 de 2023
// ---------------------------------------------------------------------------

const DEMO_QA: Record<string, { answer: string; citation: { article: string; libro: string } }> = {
  predial: {
    answer: `Según el Acuerdo 093 de 2023, la tarifa del impuesto predial para estrato 3 en zona urbana es:

• Avalúo hasta 135 SMLMV: **6.5 por mil**
• Avalúo mayor a 135 SMLMV: **7.5 por mil**

La base gravable es el avalúo catastral vigente al 1 de enero del año gravable. El impuesto se causa el 1 de enero de cada año.`,
    citation: { article: "Art. 24 · Tarifas del impuesto predial", libro: "Título II, Cap. I — Predial Unificado" },
  },
  predial_todos: {
    answer: `Tarifas del impuesto predial por estrato (Acuerdo 093 de 2023):

${tarifasPredial.residencial.map((t) => `• Estrato ${t.estrato}, ${t.rangoAvaluo}: **${t.tarifaXMil} por mil**`).join("\n")}

Rango legal: 5 a 33 por mil. La base gravable es el avalúo catastral vigente al 1 de enero.`,
    citation: { article: "Art. 24 · Tarifas del impuesto predial", libro: "Título II, Cap. I — Predial Unificado" },
  },
  predial_comercial: {
    answer: `Tarifas prediales para uso no residencial (Art. 24):

${tarifasPredial.noResidencial.map((t) => `• ${t.categoria}: **${t.tarifaXMil} por mil**`).join("\n")}

Los lotes urbanizables no urbanizados y urbanizados no edificados tienen la tarifa máxima de **33 por mil** como incentivo a la construcción.`,
    citation: { article: "Art. 24 · Tarifas predial no residencial", libro: "Título II, Cap. I — Predial Unificado" },
  },
  ica: {
    answer: `La tarifa del ICA para actividades de desarrollo de software (CIIU 5820 y 6201) en Medellín es de **10 por mil** sobre los ingresos brutos ordinarios y extraordinarios.

El período gravable va del 1 de enero al 31 de diciembre. La base gravable se determina restando del total de ingresos las exclusiones, exenciones y no sujeciones del Acuerdo.

Para actividades de intermediación digital (Art. 48, economía digital), aplican las reglas de territorialidad del Art. 70.`,
    citation: { article: "Art. 71 · Códigos de actividad y tarifas ICA", libro: "Título II, Cap. II — Industria y Comercio" },
  },
  retencion: {
    answer: `El sistema de retención de ICA en Medellín funciona así:

• **Tarifa general**: ${retencionICA.tarifaGeneral} por mil (1.8‰)
• **Base mínima**: pagos ≥ ${retencionICA.baseMinima} UVT
• **Periodicidad**: ${retencionICA.periodicidad}
• **Declaración**: bimestral, suscrita por representante legal y contador/revisor fiscal

Los autorretenedores se designan por Resolución de la Subsecretaría de Ingresos. Si no hay operaciones sujetas en el bimestre, no se presenta declaración.`,
    citation: { article: "Art. 83 · Base y tarifa para retención ICA", libro: "Título II, Cap. II — Retención" },
  },
  tributos: {
    answer: `El Art. 7 del Acuerdo 093 de 2023 establece **${tributosDistritales.length} tributos distritales** para Medellín:

${tributosDistritales.slice(0, 12).map((t, i) => `${i + 1}. ${t}`).join("\n")}
... y ${tributosDistritales.length - 12} más.

Estos incluyen impuestos (predial, ICA, avisos y tableros), sobretasas (bomberil, gasolina), contribuciones (valorización, plusvalía) y estampillas.`,
    citation: { article: "Art. 7 · Tributos distritales", libro: "Título I — Disposiciones Generales" },
  },
  financiero: {
    answer: `El sector financiero tiene un régimen especial de ICA con tarifas progresivas:

${tarifasFinancieras.progresion.map((t) => `• ${t.year}${"nota" in t ? "+" : ""}: **${t.tarifaXMil} por mil**`).join("\n")}

Además, cada oficina comercial adicional paga **27.8 UVT** anuales (Art. 56). Aplica a bancos, corporaciones financieras, aseguradoras, fondos de cesantías, leasing y demás entidades del Art. 54.`,
    citation: { article: "Art. 55 · Base impositiva sector financiero", libro: "Título II, Cap. II — Sector Financiero" },
  },
  avisos: {
    answer: `El impuesto de Avisos y Tableros se liquida así:

• **Tarifa**: **15%** sobre el valor del ICA liquidado
• **Hecho generador**: colocación de avisos, tableros, vallas, letreros en la vía pública, interior o exterior de locales
• **Período gravable**: igual al del ICA (anual)
• **Declaración**: se presenta conjuntamente con la del ICA

Todo contribuyente del ICA que tenga aviso visible está obligado a declarar este impuesto complementario.`,
    citation: { article: "Art. 96 · Tarifa avisos y tableros", libro: "Título II, Cap. III — Avisos y Tableros" },
  },
  bomberil: {
    answer: `La sobretasa bomberil se liquida como porcentaje sobre el valor del ICA:

• **Base gravable**: el valor del impuesto de industria y comercio liquidado
• **Sujeto pasivo**: los mismos contribuyentes del ICA
• **Declaración**: se liquida y paga junto con la declaración de ICA
• **Destinación**: financiamiento del Cuerpo de Bomberos del Distrito

Esta sobretasa se autoriza por la Ley 1575 de 2012 y fue incorporada en el Acuerdo 093 de 2023.`,
    citation: { article: "Art. 106 · Tarifa sobretasa bomberil", libro: "Título II, Cap. IV — Sobretasa Bomberil" },
  },
  delineacion: {
    answer: `El impuesto de delineación urbana grava las construcciones nuevas:

• **Hecho generador**: construcción, ampliación, modificación, adecuación y reparación de obras o construcciones
• **Base gravable**: presupuesto de obra o construcción
• **Requisito**: licencia de construcción expedida por curaduría urbana
• **Momento**: se causa al momento de expedirse la licencia de construcción

Las curadurías urbanas están obligadas a reportar las licencias expedidas a la Subsecretaría de Ingresos.`,
    citation: { article: "Art. 159 · Tarifa delineación urbana", libro: "Título II, Cap. IX — Delineación Urbana" },
  },
  digital: {
    answer: `La economía digital en Medellín tiene reglas especiales de ICA (Art. 48):

• **Plataformas digitales**: las que facilitan la venta de bienes o prestación de servicios son sujetos pasivos del ICA
• **Operadores de economía colaborativa**: tributan sobre los ingresos generados en jurisdicción del Distrito
• **Territorialidad**: se aplican las reglas del Art. 70 para determinar la sede efectiva de la actividad
• **Tarifa**: la correspondiente a la actividad según tabla CIIU del Art. 71

Este régimen aplica a plataformas tipo marketplace, delivery, transporte y servicios digitales.`,
    citation: { article: "Art. 48 · Economía digital", libro: "Título II, Cap. II — Industria y Comercio" },
  },
  rst: {
    answer: `El Régimen Simple de Tributación (RST) en Medellín tiene tarifas consolidadas especiales:

${tarifasRST.map((t) => `• ${t.tipo}: **${t.tarifaConsolidadaXMil} por mil**`).join("\n")}

Estas tarifas se integran al impuesto unificado del RST que se paga a la DIAN. El Distrito adopta el RST conforme al Art. 59, y las tarifas consolidadas incluyen el componente municipal del ICA.`,
    citation: { article: "Art. 60 · Tarifas ICA para RST", libro: "Título II, Cap. II — Régimen Simple" },
  },
  exenciones: {
    answer: `El Art. 9 del Acuerdo 093 de 2023 establece las reglas generales sobre exenciones:

• **Principio**: las exenciones deben ser expresas y de interpretación restrictiva
• **Temporalidad**: las exenciones tienen plazo definido; no pueden ser permanentes
• **Beneficiarios**: se otorgan por Acuerdo del Concejo Distrital
• **Límite legal**: las exenciones no pueden exceder 10 años (Ley 819 de 2003, Art. 5)
• **Costo fiscal**: todo tratamiento preferencial debe estimar su costo fiscal

En la versión completa, se pueden consultar las exenciones específicas vigentes por impuesto.`,
    citation: { article: "Art. 9 · Exenciones y tratamientos preferenciales", libro: "Título I — Disposiciones Generales" },
  },
  sobretasa_ambiental: {
    answer: `La sobretasa ambiental al predial funciona así:

• **Tarifa**: **1.5 por mil** sobre el avalúo catastral
• **Destinación**: exclusiva para el Área Metropolitana del Valle de Aburrá
• **Base gravable**: el avalúo catastral vigente (igual que el predial)
• **Recaudo**: el Distrito lo cobra junto con el impuesto predial y lo transfiere al AMVA

Esta sobretasa financia los planes de manejo ambiental y protección de los recursos naturales de la subregión metropolitana.`,
    citation: { article: "Art. 31 · Sobretasa ambiental", libro: "Título II, Cap. I — Predial Unificado" },
  },
  restaurantes: {
    answer: `Los restaurantes y establecimientos de comida en Medellín tributan ICA así:

• **Código CIIU**: 5611 — Expendio a la mesa de comidas preparadas
• **Tarifa ICA**: **10 por mil** sobre ingresos brutos
• **Avisos y tableros**: 15% adicional sobre el ICA (si tienen aviso visible)
• **Sobretasa bomberil**: aplica sobre el ICA liquidado

Los restaurantes con ingresos bajos pueden aplicar al régimen simplificado (Art. 61-62), que tiene condiciones especiales de declaración y pago.`,
    citation: { article: "Art. 71 · Tarifas ICA — CIIU 5611", libro: "Título II, Cap. II — Industria y Comercio" },
  },
  plusvalia: {
    answer: `La participación en plusvalía permite al Distrito captar el incremento de valor del suelo:

• **Hechos generadores**: incorporación de suelo rural a urbano, cambio de uso, o mayor edificabilidad por actos administrativos
• **Monto**: entre 30% y 50% del mayor valor generado por metro cuadrado
• **Exigibilidad**: al momento de solicitar licencia de urbanización/construcción, enajenación, o cambio de uso
• **Cálculo**: diferencia entre precio comercial antes y después del hecho generador

Se calcula y liquida conforme al POT y las normas urbanísticas vigentes.`,
    citation: { article: "Art. 245 · Hechos generadores de plusvalía", libro: "Título II, Cap. XVII — Plusvalía" },
  },
  estampillas: {
    answer: `Medellín tiene 5 estampillas distritales activas:

1. **Pro Cultura** (Art. 248): financia programas culturales y patrimonio
2. **Bienestar del Adulto Mayor** (Art. 267): programas de atención al adulto mayor
3. **Universidad de Antioquia** (Art. 282): cofinancia infraestructura universitaria
4. **Pro-Innovación** (Art. 297): financia CTI y ecosistema de innovación
5. **Justicia Familiar** (Art. 307): programas de justicia familiar

Las estampillas se causan sobre contratos y documentos del Distrito. La base, tarifa y obligados varían por cada estampilla.`,
    citation: { article: "Arts. 248-318 · Estampillas distritales", libro: "Título II, Caps. XVIII-XXII — Estampillas" },
  },
};

// ---------------------------------------------------------------------------
// Keyword matching rules — maps user input to Q&A keys
// ---------------------------------------------------------------------------

const MATCH_RULES: { keywords: string[]; requires?: string[]; excludes?: string[]; key: string }[] = [
  // Specific multi-keyword matches first
  { keywords: ["predial", "comercial"], key: "predial_comercial" },
  { keywords: ["predial", "industrial"], key: "predial_comercial" },
  { keywords: ["predial", "lote"], key: "predial_comercial" },
  { keywords: ["predial", "todo"], key: "predial_todos" },
  { keywords: ["predial", "tabla"], key: "predial_todos" },
  { keywords: ["tarifa", "estrato"], key: "predial" },
  { keywords: ["ica", "software"], key: "ica" },
  { keywords: ["ica", "tecnolog"], key: "ica" },
  { keywords: ["ica", "financ"], key: "financiero" },
  { keywords: ["ica", "restauran"], key: "restaurantes" },
  { keywords: ["ica", "comida"], key: "restaurantes" },
  // Single keyword matches
  { keywords: ["predial"], key: "predial" },
  { keywords: ["estrato"], key: "predial" },
  { keywords: ["avalúo"], key: "predial" },
  { keywords: ["avaluo"], key: "predial" },
  { keywords: ["catastral"], key: "predial" },
  { keywords: ["retenc"], key: "retencion" },
  { keywords: ["autorretenc"], key: "retencion" },
  { keywords: ["tributo"], key: "tributos" },
  { keywords: ["cuántos impuesto"], key: "tributos" },
  { keywords: ["cuantos impuesto"], key: "tributos" },
  { keywords: ["financ"], key: "financiero" },
  { keywords: ["banco"], key: "financiero" },
  { keywords: ["asegurad"], key: "financiero" },
  { keywords: ["aviso"], key: "avisos" },
  { keywords: ["tablero"], key: "avisos" },
  { keywords: ["valla"], key: "avisos" },
  { keywords: ["bomber"], key: "bomberil" },
  { keywords: ["delineac"], key: "delineacion" },
  { keywords: ["construcc"], key: "delineacion" },
  { keywords: ["licencia"], key: "delineacion" },
  { keywords: ["curaduría"], key: "delineacion" },
  { keywords: ["digital"], key: "digital" },
  { keywords: ["plataforma"], key: "digital" },
  { keywords: ["marketplace"], key: "digital" },
  { keywords: ["delivery"], key: "digital" },
  { keywords: ["régimen simple"], key: "rst" },
  { keywords: ["regimen simple"], key: "rst" },
  { keywords: ["rst"], key: "rst" },
  { keywords: ["simple de tributac"], key: "rst" },
  { keywords: ["exenc"], key: "exenciones" },
  { keywords: ["beneficio tributario"], key: "exenciones" },
  { keywords: ["sobretasa ambiental"], key: "sobretasa_ambiental" },
  { keywords: ["ambiental"], key: "sobretasa_ambiental" },
  { keywords: ["amva"], key: "sobretasa_ambiental" },
  { keywords: ["restauran"], key: "restaurantes" },
  { keywords: ["comida"], key: "restaurantes" },
  { keywords: ["plusvalía"], key: "plusvalia" },
  { keywords: ["plusvalia"], key: "plusvalia" },
  { keywords: ["estampilla"], key: "estampillas" },
  { keywords: ["pro cultura"], key: "estampillas" },
  { keywords: ["pro innovac"], key: "estampillas" },
  // Broad ICA catch-all (must be last)
  { keywords: ["ica"], key: "ica" },
  { keywords: ["industria y comercio"], key: "ica" },
  { keywords: ["industria"], key: "ica" },
  { keywords: ["comercio"], key: "ica" },
];

function matchQuery(input: string): string | null {
  const lower = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lowerOriginal = input.toLowerCase();

  for (const rule of MATCH_RULES) {
    const allMatch = rule.keywords.every(
      (kw) => lower.includes(kw) || lowerOriginal.includes(kw)
    );
    if (allMatch) {
      if (rule.excludes && rule.excludes.some((ex) => lower.includes(ex))) continue;
      return rule.key;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Suggested queries — expanded and categorized
// ---------------------------------------------------------------------------

const suggestedQueries = [
  { key: "predial", text: "Tarifa predial estrato 3", category: "popular" },
  { key: "ica", text: "ICA para software", category: "popular" },
  { key: "retencion", text: "Retención ICA", category: "popular" },
  { key: "tributos", text: "Tributos distritales", category: "popular" },
  { key: "financiero", text: "ICA sector financiero", category: "popular" },
  { key: "avisos", text: "Avisos y tableros", category: "secondary" },
  { key: "bomberil", text: "Sobretasa bomberil", category: "secondary" },
  { key: "digital", text: "Economía digital", category: "secondary" },
  { key: "rst", text: "Régimen Simple (RST)", category: "secondary" },
  { key: "predial_comercial", text: "Predial comercial e industrial", category: "secondary" },
  { key: "estampillas", text: "Estampillas distritales", category: "secondary" },
  { key: "plusvalia", text: "Plusvalía", category: "secondary" },
  { key: "exenciones", text: "Exenciones tributarias", category: "secondary" },
  { key: "delineacion", text: "Delineación urbana", category: "secondary" },
  { key: "restaurantes", text: "ICA restaurantes", category: "secondary" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EstatutoChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const totalArticulos = estatutoStructure.reduce(
    (sum, t) =>
      sum +
      (t.articulos?.length ?? 0) +
      (t.capitulos ?? []).reduce((s, c) => s + c.articulos.length, 0),
    0
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuery = (key: string, userText: string) => {
    const qa = DEMO_QA[key];
    if (!qa) return;

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: qa.answer, citation: qa.citation },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const matchKey = matchQuery(input);

    if (matchKey) {
      handleQuery(matchKey, input);
    } else {
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Puedo responder sobre ${Object.keys(DEMO_QA).length} temas del Acuerdo 093 de 2023:\n\n• **Impuesto predial** — tarifas por estrato, comercial, industrial\n• **ICA** — software, restaurantes, economía digital, sector financiero\n• **Retención de ICA** — base mínima, tarifas, periodicidad\n• **Avisos y tableros** — tarifa complementaria al ICA\n• **Sobretasas** — bomberil, ambiental (AMVA)\n• **Régimen Simple (RST)** — tarifas consolidadas\n• **Delineación urbana** — construcciones y licencias\n• **Plusvalía** — participación del Distrito\n• **Estampillas** — las 5 estampillas distritales\n• **Exenciones** — tratamientos preferenciales\n\nIntenta preguntar por alguno de estos temas. En la versión completa, uso búsqueda semántica con IA sobre los ${totalArticulos} artículos indexados.`,
          },
        ]);
        setIsTyping(false);
      }, 600);
    }
    setInput("");
  };

  const popularQueries = suggestedQueries.filter((q) => q.category === "popular");
  const secondaryQueries = suggestedQueries.filter((q) => q.category === "secondary");
  const visibleQueries = showAllTopics ? suggestedQueries : popularQueries;

  return (
    <div className="flex flex-col h-[600px] md:h-[680px] rounded-2xl border border-border overflow-hidden bg-paper shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-ink text-paper border-b border-ink">
        <GobiaLogo size={32} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Estatuto Tributario IA</h3>
          <p className="text-[0.6875rem] text-gray-400">
            {estatutoMeta.municipio} &middot; {estatutoMeta.acuerdo} &middot; {totalArticulos} artículos indexados
          </p>
        </div>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-900/40 border border-amber-500/30 text-[0.625rem] font-semibold text-amber-300">
          Demo
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-6"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ochre-soft mb-4">
              <BookOpen className="text-ochre" size={24} />
            </div>
            <h4 className="font-serif text-lg text-ink mb-2">
              Consulta el estatuto tributario
            </h4>
            <p className="text-[0.8125rem] text-gray-400 max-w-sm mx-auto mb-5">
              Pregunta en lenguaje natural sobre el {estatutoMeta.acuerdo} de {estatutoMeta.municipio}. Cada respuesta incluye la citación exacta del artículo.
            </p>

            {/* Topic count badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-ochre-soft border border-ochre/20 px-3 py-1 text-[0.6875rem] font-semibold text-ochre mb-4">
              <Scale size={12} />
              {Object.keys(DEMO_QA).length} temas disponibles
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {visibleQueries.map((q) => (
                <button
                  key={q.key}
                  onClick={() => handleQuery(q.key, q.text)}
                  className="rounded-full border border-border bg-paper px-3.5 py-2 text-[0.75rem] font-medium text-sepia hover:bg-cream hover:border-ochre/30 hover:text-ochre transition-all duration-200"
                >
                  {q.text}
                </button>
              ))}
            </div>

            {!showAllTopics && secondaryQueries.length > 0 && (
              <button
                onClick={() => setShowAllTopics(true)}
                className="text-[0.6875rem] text-ochre hover:text-ochre/80 font-medium transition-colors duration-200 mt-1"
              >
                Ver {secondaryQueries.length} temas más →
              </button>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-ochre-soft text-ink rounded-br-md"
                    : "bg-paper border border-border rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} className="text-ochre" />
                    <span className="text-[0.625rem] font-semibold text-ochre uppercase tracking-wider">
                      Gobia IA
                    </span>
                  </div>
                )}
                <div className="text-[0.8125rem] leading-relaxed text-ink whitespace-pre-line">
                  {msg.content.split("**").map((part, j) =>
                    j % 2 === 1 ? (
                      <strong key={j} className="font-semibold text-ochre">
                        {part}
                      </strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </div>
                {msg.citation && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-ochre-soft/60 border border-ochre/15 px-3 py-2">
                    <BookOpen size={14} className="text-ochre shrink-0" />
                    <div className="text-[0.6875rem]">
                      <span className="font-semibold text-ochre">{msg.citation.article}</span>
                      <span className="text-gray-400 ml-1.5">{msg.citation.libro}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1 px-4 py-3"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-ochre"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border px-4 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre el estatuto tributario..."
          className="flex-1 form-input text-[0.8125rem]"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-lg bg-ink text-paper p-2.5 hover:bg-ochre transition-colors duration-200 disabled:opacity-30"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Suggested follow-ups after conversation starts */}
      {messages.length > 0 && messages.length < 8 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {suggestedQueries
            .filter((q) => !messages.some((m) => m.role === "user" && m.content === q.text))
            .slice(0, 4)
            .map((q) => (
              <button
                key={q.key}
                onClick={() => handleQuery(q.key, q.text)}
                className="rounded-full border border-border px-2.5 py-1 text-[0.6875rem] text-gray-400 hover:text-ochre hover:border-ochre/30 transition-all duration-200"
              >
                {q.text}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
