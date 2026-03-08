"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Problema", href: "#problema" },
  { label: "Solución", href: "#solucion" },
  { label: "Tecnología", href: "#tecnologia" },
  { label: "Casos de uso", href: "#casos" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll spy: observe all sections with IDs
  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/92 backdrop-blur-xl border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
        style={{ boxShadow: scrolled ? "var(--shadow-xs)" : "none" }}
      >
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-4 md:px-8">
          <a href="#" className="flex items-baseline gap-0.5">
            <span className="font-serif text-xl tracking-tight text-ink">
              gobia
            </span>
            <span className="font-serif text-base text-ochre">
              .co
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-md px-3.5 py-2 text-[0.8125rem] font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-ink"
                      : "text-gray-500 hover:text-ink hover:bg-cream"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-ochre rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          <div className="hidden md:flex items-center">
            <a
              href="#contacto"
              className="rounded-md px-5 py-2.5 text-[0.8125rem] font-semibold bg-ink text-paper transition-all duration-300 hover:bg-sepia hover:shadow-md hover:-translate-y-0.5"
            >
              Solicitar demo
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-ink hover:bg-cream transition-colors duration-200"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/15 backdrop-blur-sm"
              onClick={closeMobile}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] as const }}
              className="fixed top-[72px] left-0 right-0 z-50 bg-paper border-b border-border shadow-lg rounded-b-2xl overflow-hidden"
            >
              <div className="flex flex-col px-5 py-4 gap-1">
                {navLinks.map((link, i) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={closeMobile}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className={`rounded-lg px-4 py-3 text-[0.9375rem] font-medium transition-colors duration-150 ${
                        isActive
                          ? "text-ochre bg-ochre-soft"
                          : "text-gray-700 hover:bg-cream hover:text-ink"
                      }`}
                    >
                      {link.label}
                    </motion.a>
                  );
                })}
                <div className="mt-3 pt-3 border-t border-border">
                  <a
                    href="#contacto"
                    onClick={closeMobile}
                    className="btn-primary w-full text-center"
                  >
                    Solicitar demo
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
