import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import ProblemaSection from "@/components/sections/ProblemaSection";
import SolucionSection from "@/components/sections/SolucionSection";
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
        <SolidezTecnica />
        <CasosDeUso />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
