"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { GCC_CITIES } from "@/lib/globe-utils";
import { useTerminalStore } from "@/store/useTerminalStore";

const GCCSection = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const riyadh = GCC_CITIES.find(c => c.primary)!;

  const cityMapAr: Record<string, string> = {
    "Riyadh": "الرياض",
    "Dubai": "دبي",
    "Doha": "الدوحة",
    "Kuwait City": "الكويت",
    "Manama": "المنامة",
    "Muscat": "مسقط"
  };

  return (
    <section id="markets" className="relative py-[120px] px-6 lg:px-24 bg-[var(--void)] overflow-hidden">
      <div className="container mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
          <SectionLabel label={isAr ? "التكامل الإقليمي" : "Regional Integration"} className="justify-center" />
          <motion.h2 variants={staggerItem} className={`font-cormorant text-4xl md:text-5xl lg:text-6xl mb-6 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "محور رأس المال الخليجي" : "The GCC axis of capital"}
          </motion.h2>
          <motion.p variants={staggerItem} className={`font-dm-sans text-[var(--text2)] max-w-[500px] leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
            {isAr 
              ? "يسد محور الفجوة بين المملكة وجيرانها، ويوفر وصولاً موحداً للبيانات عبر جميع البورصات الخليجية."
              : "Mahwar bridges the gap between the Kingdom and its neighbors, providing unified data access across all GCC exchanges."}
          </motion.p>
        </div>

        {/* Map Visualization */}
        <div className="relative w-full max-w-[800px] h-[400px] bg-[var(--bg2)] border border-[var(--border)] rounded-[32px] overflow-hidden mb-16 shadow-2xl shadow-black/5">
          {/* Subtle Grid */}
          <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Connection Arcs */}
            {GCC_CITIES.filter(c => !c.primary).map((city, i) => {
              // Approximate mapping for visualization (top/left %)
              // Riyadh is center: 50/50
              const riyadhX = 50, riyadhY = 50;
              
              // Mapping lat/lon to % (very simplified for a stylized map)
              const getXY = (c: typeof city) => {
                const x = 50 + (c.lon - riyadh.lon) * 1.5;
                const y = 50 - (c.lat - riyadh.lat) * 2;
                return { x, y };
              };

              const start = { x: riyadhX, y: riyadhY };
              const end = getXY(city);
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2 - 20;

              return (
                <motion.path
                  key={i}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 0.5 + i * 0.2, ease: "easeInOut" }}
                  d={`M ${start.x}% ${start.y}% Q ${midX}% ${midY}% ${end.x}% ${end.y}%`}
                  fill="none"
                  stroke={`url(#arcGradient-${i})`}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="animate-[dash_3s_linear_infinite]"
                />
              );
            })}
            
            <defs>
              {GCC_CITIES.filter(c => !c.primary).map((_, i) => (
                <linearGradient key={i} id={`arcGradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--gold)" />
                  <stop offset="100%" stopColor="var(--emerald)" />
                </linearGradient>
              ))}
            </defs>
          </svg>

          {/* City Markers */}
          {GCC_CITIES.map((city, i) => {
            const riyadhX = 50, riyadhY = 50;
            const x = city.primary ? riyadhX : 50 + (city.lon - riyadh.lon) * 1.5;
            const y = city.primary ? riyadhY : 50 - (city.lat - riyadh.lat) * 2;

            return (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="relative">
                  <div className={`w-2.5 h-2.5 rounded-full z-10 ${city.primary ? "bg-[var(--gold)]" : "bg-[var(--emerald)]"}`} />
                  {/* Pulsing Rings */}
                  <motion.div
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                    className={`absolute inset-0 rounded-full border ${city.primary ? "border-[var(--gold)]" : "border-[var(--emerald)]"}`}
                  />
                  {city.primary && (
                    <motion.div
                      animate={{ scale: [1, 3], opacity: [0.3, 0] }}
                      transition={{ duration: 2.5, delay: 0.8, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border border-[var(--gold)]"
                    />
                  )}
                </div>
                <span className={`font-mono text-[9px] uppercase tracking-widest text-[var(--text2)] whitespace-nowrap bg-[var(--bg2)]/80 px-1.5 py-0.5 rounded backdrop-blur-sm border border-[var(--border)] ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? cityMapAr[city.name] : city.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats Row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[900px]"
        >
          {[
            { val: isAr ? "٣.٨ تريليون$" : "$3.8T", label: isAr ? "القيمة السوقية الخليجية" : "GCC Market Cap" },
            { val: "6", label: isAr ? "بورصات" : "Exchanges" },
            { val: "+500", label: isAr ? "شركات مدعومة" : "Companies" },
            { val: isAr ? "فوري" : "Real-time", label: isAr ? "تحديث البيانات" : "Refresh" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -4, borderColor: "var(--accent-border)", backgroundColor: "var(--bg2)" }}
              className="bg-[var(--bg1)] border border-[var(--border)] rounded-xl p-6 text-center transition-all duration-300 shadow-sm"
            >
              <div className="font-mono text-2xl font-bold text-[var(--gold)] mb-1">
                {stat.val}
              </div>
              <div className={`font-dm-sans text-[10px] text-[var(--text3)] uppercase tracking-widest ${isAr ? 'font-arabic' : ''}`}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </section>
  );
};

export default GCCSection;
