"use client";

import React from "react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { useTerminalStore } from "@/store/useTerminalStore";

/**
 * Animated Capital Radar Ping.
 * Expands concentric rings to simulate active regional mapping.
 */
const RadarPing = ({ x, y, label }: { x: number; y: number; label: string }) => (
  <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
    <div className="relative flex items-center justify-center">
       {/* Expanding Rings */}
       <motion.div 
         animate={{ scale: [1, 3], opacity: [0.6, 0] }}
         transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
         className="absolute w-3 h-3 rounded-full border border-[#10B981]"
       />
       <motion.div 
         animate={{ scale: [1, 2], opacity: [0.3, 0] }}
         transition={{ repeat: Infinity, duration: 2.5, delay: 0.8, ease: "linear" }}
         className="absolute w-3 h-3 rounded-full border border-[#10B981]"
       />
       
       {/* High-Contrast Node Point */}
       <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full shadow-[0_0_10px_#10B981]" />
       
       {/* Institutional Label */}
       <div className="absolute left-4 bg-[#020617] border border-[#334155] px-2 py-0.5 pointer-events-none">
          <span className="text-[#F8FAFC] font-mono text-[9px] uppercase tracking-tighter font-bold">
            {label}
          </span>
       </div>
    </div>
  </div>
);

const GCCSection = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const stats = [
    { val: "$3.8T", label: isAr ? "القيمة السوقية" : "GCC MARKET CAP" },
    { val: "6", label: isAr ? "بورصات" : "UNIFIED EXCHANGES" },
    { val: "+500", label: isAr ? "شركات مدعومة" : "DATA NODES SYNCED" },
    { val: "T+1", label: isAr ? "التسوية" : "SETTLEMENT CYCLE" },
  ];

  return (
    <section id="markets" className="relative py-24 px-6 lg:px-24 bg-[#020617] overflow-hidden border-y border-[#334155]">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-stretch gap-16">
          
          {/* Dashboard Left Rail */}
          <div className="flex-[0.35] flex flex-col justify-center">
            <SectionLabel label="Regional_Radar_v4.2" className="justify-start" />
            <h2 
              className={`font-mono text-3xl md:text-5xl mb-8 text-[#F8FAFC] tracking-tight uppercase leading-[0.9] ${isAr ? 'font-arabic' : ''}`}
            >
              {isAr ? "محور رأس المال" : "REGIONAL_MAPPING"}
            </h2>
            <p className={`font-mono text-[#64748B] max-w-[500px] leading-relaxed mb-12 text-xs uppercase tracking-widest ${isAr ? 'font-arabic' : ''}`}>
              {isAr 
                ? "يوفر محور وصولاً موحداً للبيانات عبر جميع البورصات الخليجية، مما يسد الفجوة التحليلية للمستثمرين المؤسسيين."
                : "Real-time vector triangulation of the GCC economic block. Synchronized data streaming across TASI, ADX, DFM, and QSE nodes."}
            </p>

            {/* Institutional Stats Grid - Flat, No Bouncy Animations */}
            <div className="grid grid-cols-2 gap-px bg-[#334155] border border-[#334155]">
               {stats.map((stat, i) => (
                 <div key={i} className="bg-[#0F172A] p-6">
                    <div className="font-mono text-xl font-bold text-[#10B981] mb-1">{stat.val}</div>
                    <div className="font-mono text-[9px] text-[#64748B] tracking-widest">{stat.label}</div>
                 </div>
               ))}
            </div>
          </div>

          {/* Map Visualization - High-Contrast SVG Vector Map */}
          <div className="flex-1 relative min-h-[500px] bg-[#0F172A] border border-[#334155] overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-5 pointer-events-none" />
            
            <svg viewBox="0 0 800 600" className="w-full h-full p-20 opacity-40">
               {/* Simplified Middle East Vector Outline */}
               <path 
                 d="M150,150 L550,150 L650,350 L550,550 L150,550 L50,350 Z" 
                 fill="#020617" 
                 stroke="#334155" 
                 strokeWidth="2"
               />
               {/* Highlighted GCC Economic Zone */}
               <path 
                 d="M350,250 L550,250 L600,450 L450,500 L350,500 L300,350 Z" 
                 fill="#1E293B" 
                 stroke="#10B981" 
                 strokeWidth="1.5"
                 strokeDasharray="4 4"
               />
            </svg>

            {/* Automated Capital Triangulation */}
            <RadarPing x={44} y={45} label="Riyadh — TASI" />
            <RadarPing x={64} y={35} label="Dubai — DFM" />
            <RadarPing x={58} y={31} label="Doha — QSE" />
            <RadarPing x={50} y={28} label="Kuwait — BKW" />
            <RadarPing x={68} y={50} label="Muscat — MSX" />
            <RadarPing x={55} y={34} label="Manama — BHB" />

            {/* Radar UI Overlays */}
            <div className="absolute top-8 right-8">
               <div className="flex items-center gap-3 bg-[#020617] border border-[#334155] px-4 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[10px] font-mono text-[#F8FAFC] tracking-[0.3em]">SURVEILLANCE_ACTIVE</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GCCSection;
