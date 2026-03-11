import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import ProblemaSection from "@/components/sections/ProblemaSection";
import Footer from "@/components/sections/Footer";

// Skeleton placeholder to prevent CLS on lazy-loaded sections
const SectionSkeleton = () => <div className="py-24 md:py-32" />;

// Lazy-load below-fold sections to reduce initial JS bundle
const SolucionSection = dynamic(() => import("@/components/sections/SolucionSection"), { loading: SectionSkeleton });
const ProductoPreview = dynamic(() => import("@/components/sections/ProductoPreview"), { loading: SectionSkeleton });
const CerebroNormativo = dynamic(() => import("@/components/sections/CerebroNormativo"), { loading: SectionSkeleton });
const SolidezTecnica = dynamic(() => import("@/components/sections/SolidezTecnica"), { loading: SectionSkeleton });
const CasosDeUso = dynamic(() => import("@/components/sections/CasosDeUso"), { loading: SectionSkeleton });
const Comparativa = dynamic(() => import("@/components/sections/Comparativa"), { loading: SectionSkeleton });
const CTAFinal = dynamic(() => import("@/components/sections/CTAFinal"), { loading: SectionSkeleton });

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemaSection />
        <SolucionSection />
        <Comparativa />
        <ProductoPreview />
        <CerebroNormativo />
        <SolidezTecnica />
        <CasosDeUso />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
