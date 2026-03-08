import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import ProblemaSection from "@/components/sections/ProblemaSection";
import SolucionSection from "@/components/sections/SolucionSection";
import ProductoPreview from "@/components/sections/ProductoPreview";
import SolidezTecnica from "@/components/sections/SolidezTecnica";
import CasosDeUso from "@/components/sections/CasosDeUso";
import CTAFinal from "@/components/sections/CTAFinal";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemaSection />
        <SolucionSection />
        <ProductoPreview />
        <SolidezTecnica />
        <CasosDeUso />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
