"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { staggerContainer, staggerItem } from "@/lib/motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { useTerminalStore } from "@/store/useTerminalStore";

const GlobeVisualization = dynamic(() => import("@/components/globe/GlobeVisualization"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#020617] opacity-50">
      <div className="w-12 h-12 rounded-full border border-[#10B981]/20 border-t-[#10B981] animate-spin" />
    </div>
  ),
});

const GCCSection = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const stats = [
    { val: isAr ? "٣.٨ تريليون$" : "$3.8T", label: isAr ? "القيمة السوقية الخليجية" : "GCC Market Cap" },
    { val: "6", label: isAr ? "بورصات" : "Regional Exchanges" },
    { val: "+500", label: isAr ? "شركات مدعومة" : "Standardized Symbols" },
    { val: isAr ? "فوري" : "Real-time", label: isAr ? "تحديث البيانات" : "Data Latency" },
  ];

  return (
    <section id="markets" className="relative py-24 px-6 lg:px-24 bg-[#020617] overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Content */}
          <div className="flex-1 text-left">
            <SectionLabel label={isAr ? "التكامل الإقليمي" : "Regional Integration"} className="justify-start" />
            <motion.h2 
              variants={staggerItem} 
              className={`font-mono text-3xl md:text-5xl mb-6 text-[#F8FAFC] tracking-tight ${isAr ? 'font-arabic' : ''}`}
            >
              {isAr ? "محور رأس المال الخليجي" : "The GCC axis of capital"}
            </motion.h2>
            <motion.p 
              variants={staggerItem} 
              className={`font-sans text-[#94A3B8] max-w-[500px] leading-relaxed mb-12 ${isAr ? 'font-arabic' : ''}`}
            >
              {isAr 
                ? "يوفر محور وصولاً موحداً للبيانات عبر جميع البورصات الخليجية، مما يسد الفجوة التحليلية للمستثمرين المؤسسيين."
                : "Mahwar provide unified data access across all GCC exchanges, bridging the analytical gap for institutional investors."}
            </motion.p>

            {/* Stats Grid - Professional Left-Aligned */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 w-full"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="bg-[#0F172A] border border-[#334155] p-6 text-left"
                >
                  <div className="font-mono text-2xl font-bold text-[#F59E0B] mb-1">
                    {stat.val}
                  </div>
                  <div className={`font-mono text-[9px] text-[#64748B] uppercase tracking-widest ${isAr ? 'font-arabic' : ''}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Map Visualization */}
          <div className="flex-1 relative w-full aspect-square max-w-[600px] bg-[#0F172A] border border-[#334155] overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
            <GlobeVisualization />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GCCSection;
