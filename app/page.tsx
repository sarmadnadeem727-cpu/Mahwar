"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import ShiftSection from "@/components/sections/ShiftSection";
import SolutionSection from "@/components/sections/SolutionSection";
import IntelligenceSection from "@/components/sections/IntelligenceSection";
import GCCSection from "@/components/sections/GCCSection";
import TechnologySection from "@/components/sections/TechnologySection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function Home() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  
  return (
    <main className={`relative bg-[var(--void)] ${isAr ? 'font-arabic' : ''}`} dir={isAr ? "rtl" : "ltr"}>
      <Navigation />
      
      <div className="flex flex-col">
        <HeroSection />
        <ProblemSection />
        <ShiftSection />
        <SolutionSection />
        <IntelligenceSection />
        <GCCSection />
        <TechnologySection />
        <TestimonialsSection />
        <CTASection />
      </div>

      <Footer />
    </main>
  );
}
