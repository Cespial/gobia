import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1120px] px-5 md:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_auto] md:gap-16">
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
