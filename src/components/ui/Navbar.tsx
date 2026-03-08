"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-border shadow-xs"
            : "bg-transparent"
        }`}
        style={{
          boxShadow: scrolled ? "var(--shadow-xs)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-4 md:px-8">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span
              className={`transition-colors duration-300 ${
                scrolled ? "text-navy" : "text-white"
              }`}
            >
              gobia
            </span>
            <span
              className={`text-sm font-medium transition-colors duration-300 ${
                scrolled ? "text-teal" : "text-teal-soft"
              }`}
            >
              .co
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-md px-3.5 py-2 text-[0.8125rem] font-medium transition-colors duration-200 ${
                  scrolled
                    ? "text-gray-600 hover:text-navy hover:bg-off-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="#contacto"
              className={`rounded-lg px-5 py-2.5 text-[0.8125rem] font-semibold transition-all duration-200 ${
                scrolled
                  ? "bg-navy text-white hover:bg-blue"
                  : "bg-white text-navy hover:bg-blue-soft"
              }`}
            >
              Solicitar demo
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled
                ? "text-navy hover:bg-off-white"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
              className="fixed inset-0 z-40 bg-black/25"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[72px] left-0 right-0 z-50 bg-white border-b border-border shadow-lg"
            >
              <div className="flex flex-col px-5 py-4 gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-3 text-[0.9375rem] font-medium text-gray-700 hover:bg-off-white hover:text-navy transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-3 pt-3 border-t border-border">
                  <a
                    href="#contacto"
                    onClick={() => setMobileOpen(false)}
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
