import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo — Medellín | Gobia",
  description:
    "Demo interactiva de Gobia con datos reales de Medellín. Consulta el Acuerdo 093 de 2023, tarifas prediales, ICA por código CIIU y más.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Centro de Mando Fiscal — Medellín | Gobia",
    description: "Dashboard fiscal interactivo con datos reales: IDF, recaudo tributario, ejecución presupuestal, cartera morosa y más.",
    type: "website",
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
