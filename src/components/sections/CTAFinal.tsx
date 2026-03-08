"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function CTAFinal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contacto" ref={ref} className="relative py-24 md:py-32 bg-background">
      <div className="relative z-10 mx-auto max-w-[1120px] px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ochre mb-4"
            >
              Comencemos
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-[2rem] md:text-[2.75rem] leading-[1.1] tracking-[-0.02em] text-ink mb-5"
            >
              Lleva la gestión de tu{" "}
              <em className="text-ochre not-italic">entidad</em> al siguiente nivel
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-[1.0625rem] leading-relaxed text-gray-500 mb-8"
            >
              Agenda una sesión de 30 minutos con nuestro equipo. Te mostramos
              cómo Gobia se adapta a las necesidades específicas de tu
              municipio, gobernación o entidad territorial.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-3"
            >
              {[
                "Demo personalizada con datos reales de tu entidad",
                "Sin compromiso — conoce la plataforma primero",
                "Acompañamiento técnico para la implementación",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-ochre mt-0.5 shrink-0" />
                  <span className="text-[0.9375rem] text-gray-600">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {submitted ? (
              <div className="rounded-2xl border border-ochre/20 bg-ochre-soft p-10 text-center">
                <div className="mx-auto mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-ochre/10">
                  <CheckCircle size={28} className="text-ochre" />
                </div>
                <h3 className="text-[1.25rem] font-bold text-ink mb-2">Solicitud recibida</h3>
                <p className="text-[0.9375rem] text-gray-500 leading-relaxed">
                  Nuestro equipo te contactará en las próximas 24 horas hábiles para agendar la demo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-paper p-8 md:p-10 shadow-sm">
                <h3 className="text-[1.125rem] font-bold text-ink mb-6">Solicitar demo gratuita</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nombre" className="block text-[0.8125rem] font-medium text-gray-700 mb-1.5">Nombre completo</label>
                    <input type="text" id="nombre" name="nombre" required className="form-input" placeholder="Ej: María García" />
                  </div>
                  <div>
                    <label htmlFor="entidad" className="block text-[0.8125rem] font-medium text-gray-700 mb-1.5">Entidad</label>
                    <input type="text" id="entidad" name="entidad" required className="form-input" placeholder="Ej: Alcaldía de Rionegro" />
                  </div>
                  <div>
                    <label htmlFor="cargo" className="block text-[0.8125rem] font-medium text-gray-700 mb-1.5">Cargo</label>
                    <input type="text" id="cargo" name="cargo" required className="form-input" placeholder="Ej: Secretario(a) de Hacienda" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[0.8125rem] font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                    <input type="email" id="email" name="email" required className="form-input" placeholder="correo@entidad.gov.co" />
                  </div>
                  <button type="submit" className="btn-primary w-full mt-2">
                    <Send size={16} />
                    Solicitar demo
                  </button>
                </div>
                <p className="mt-4 text-[0.6875rem] text-gray-400 leading-relaxed text-center">
                  Al enviar este formulario aceptas nuestra política de tratamiento de datos personales conforme a la Ley 1581 de 2012.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
