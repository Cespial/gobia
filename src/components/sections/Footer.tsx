import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_auto] md:gap-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold tracking-tight text-white">
                gobia
              </span>
              <span className="text-sm font-medium text-teal-soft">.co</span>
            </div>
            <p className="text-[0.875rem] leading-relaxed text-white/50 max-w-xs mb-6">
              Gestión pública inteligente para Colombia. Una solución de{" "}
              <a
                href="https://inplux.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors underline underline-offset-2"
              >
                inplux.co
              </a>
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {["inplux.co", "tribai.co"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-[0.6875rem] font-medium text-white/50"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">
              Producto
            </p>
            <ul className="space-y-2.5">
              {[
                { label: "Solución", href: "#solucion" },
                { label: "Tecnología", href: "#tecnologia" },
                { label: "Casos de uso", href: "#casos" },
                { label: "Solicitar demo", href: "#contacto" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[0.8125rem] text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">
              Legal
            </p>
            <ul className="space-y-2.5">
              {[
                { label: "Política de privacidad", href: "#" },
                { label: "Tratamiento de datos", href: "#" },
                { label: "Términos de uso", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[0.8125rem] text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/10" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.75rem] text-white/30">
            &copy; {new Date().getFullYear()} gobia.co — Todos los derechos
            reservados. Una empresa de inplux.co
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://tribai.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[0.75rem] text-white/30 hover:text-white/60 transition-colors"
            >
              tribai.co
              <ExternalLink size={10} />
            </a>
            <a
              href="https://inplux.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[0.75rem] text-white/30 hover:text-white/60 transition-colors"
            >
              inplux.co
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
