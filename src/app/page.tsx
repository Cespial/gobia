import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import ProblemaSection from "@/components/sections/ProblemaSection";
import Footer from "@/components/sections/Footer";

// Lazy-load below-fold sections to reduce initial JS bundle
const SolucionSection = dynamic(() => import("@/components/sections/SolucionSection"));
const ProductoPreview = dynamic(() => import("@/components/sections/ProductoPreview"));
const CerebroNormativo = dynamic(() => import("@/components/sections/CerebroNormativo"));
const SolidezTecnica = dynamic(() => import("@/components/sections/SolidezTecnica"));
const CasosDeUso = dynamic(() => import("@/components/sections/CasosDeUso"));
const Comparativa = dynamic(() => import("@/components/sections/Comparativa"));
const CTAFinal = dynamic(() => import("@/components/sections/CTAFinal"));

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemaSection />
        <SolucionSection />
        <ProductoPreview />
        <CerebroNormativo />
        <SolidezTecnica />
        <CasosDeUso />
        <Comparativa />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
