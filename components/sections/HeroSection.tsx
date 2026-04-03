"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { staggerContainer, staggerItem } from "@/lib/motion";
import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { useTerminalStore } from "@/store/useTerminalStore";

const GlobeVisualization = dynamic(() => import("@/components/globe/GlobeVisualization"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--void)] opacity-50">
      <div className="w-24 h-24 rounded-full border border-[var(--emerald)]/20 border-t-[var(--emerald)] animate-spin" />
    </div>

  ),
});

const HeroSection = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[var(--void)]">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        <GlobeVisualization />
        {/* Radial Mask */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[var(--void)] to-[var(--void)] opacity-40" />
        {/* Mesh Gradients */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[var(--emerald)]/10 blur-[120px] rounded-full opacity-30" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[var(--emerald)]/10 blur-[120px] rounded-full opacity-20" />
        {/* Grid Overlay */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      </div>


      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center"
      >
        <SectionLabel 
          label={isAr ? "محطة النمذجة المالية المؤسسية" : "Institutional Financial Modelling Terminal"} 
          className="justify-center" 
        />

        <motion.h1
          variants={staggerItem}
          className="font-cormorant text-6xl md:text-8xl lg:text-[120px] leading-tight text-[var(--emerald)] drop-shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-4 uppercase tracking-[0.1em]"
        >
          MAHWAR <span className="font-cairo">محور</span>
        </motion.h1>

        <motion.h2
          variants={staggerItem}
          className={`font-cormorant text-2xl md:text-4xl lg:text-5xl italic font-light text-[var(--text1)] mb-8 tracking-wide ${isAr ? 'font-arabic not-italic' : ''}`}
        >
          {isAr ? "محور الذكاء المالي السيادي" : "The Axis of financial intelligence"}
        </motion.h2>

        <motion.p
          variants={staggerItem}
          className={`font-dm-sans text-base md:text-lg text-[var(--text2)] max-w-[520px] leading-relaxed mb-12 ${isAr ? 'font-arabic' : ''}`}
        >
          {isAr 
            ? "نمذجة مالية احترافية، تحليل التدفقات النقدية، وأدوات تقييم متقدمة لكل من التداول والشركات الخاصة في منطقة الخليج."
            : "Professional financial modelling, DCF/LBO engines, and advanced valuation tools for both Tadawul and private GCC entities."}
        </motion.p>

        <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-[var(--emerald)] text-white px-8 py-3.5 rounded-sm font-dm-sans text-sm font-bold hover:bg-[var(--emerald-bright)] transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] ${isAr ? 'font-arabic' : ''}`}
            >
              {isAr ? "دخول المنصة ←" : "Enter Platform →"}
            </motion.button>

          </Link>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`border border-[var(--emerald)]/30 text-[var(--emerald)] px-8 py-3.5 rounded-sm font-dm-sans text-sm font-bold hover:bg-[var(--emerald)]/10 transition-all ${isAr ? 'font-arabic' : ''}`}
          >
            {isAr ? "استكشاف المميزات" : "Explore Features"}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className={`font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text3)] ${isAr ? 'font-arabic' : ''}`}>
          {isAr ? "مرر للأسفل" : "Scroll"}
        </span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-[var(--emerald)] to-transparent relative overflow-hidden">
          <motion.div
            animate={{ 
              y: ["-100%", "100%"],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 left-0 w-full h-1/2 bg-[var(--emerald-bright)]"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
