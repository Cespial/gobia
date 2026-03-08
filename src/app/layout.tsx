import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Publia — Gestión pública inteligente para Colombia",
  description:
    "Plataforma GovTech que transforma la gestión pública colombiana con inteligencia artificial, datos abiertos y automatización normativa. Para alcaldías, gobernaciones y entidades territoriales.",
  keywords: [
    "GovTech",
    "sector público",
    "Colombia",
    "gestión pública",
    "inteligencia artificial",
    "hacienda pública",
    "plan de desarrollo",
    "estatuto tributario",
  ],
  authors: [{ name: "inplux.co" }],
  openGraph: {
    title: "Publia — Gestión pública inteligente para Colombia",
    description:
      "Plataforma GovTech que transforma la gestión pública colombiana con IA, datos abiertos y automatización normativa.",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${jakarta.variable} ${dmSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
