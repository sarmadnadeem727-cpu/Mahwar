"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import {
  BarChart3, Layers, Activity, Sparkles, ShieldCheck, Grid3X3, Globe, Percent, Calendar, Columns
} from "lucide-react";
import dynamic from 'next/dynamic';
import { TickerSearch } from "@/components/features/TickerSearch";
import DashboardGCCMap from "@/components/features/DashboardGCCMap";
import { useTerminalStore, type Currency } from "@/store/useTerminalStore";
import MahwarLogo from "@/components/ui/MahwarLogo";

// Lazy loading models with zero SSR for weight optimization
const DCFModel = dynamic(() => import("@/components/models/DCFModel").then((mod) => ({ default: mod.DCFModel })), { ssr: false });
const LBOModel = dynamic(() => import("@/components/models/LBOModel").then((mod) => ({ default: mod.LBOModel })), { ssr: false });
const ThreeStatementModel = dynamic(() => import("@/components/models/ThreeStatementModel").then((mod) => ({ default: mod.ThreeStatementModel })), { ssr: false });

type Panel = "hub" | "DCF" | "LBO" | "FS" | "research" | "shariah" | "dividends" | "calendar";

const NAV_SECTIONS = [
  {
    label: "Intelligence Hub",
    items: [
      { id: "hub" as Panel, icon: <Columns size={14} />, label: "Dashboard Hub" },
    ],
  },
  {
    label: "Sovereign Models",
    items: [
      { id: "DCF" as Panel, icon: <BarChart3 size={14} />, label: "DCF Engine" },
      { id: "LBO" as Panel, icon: <Layers size={14} />, label: "LBO Analytics" },
      { id: "FS" as Panel, icon: <Activity size={14} />, label: "3-Statement" },
    ],
  },
  {
    label: "Advanced Research",
    items: [
      { id: "research" as Panel, icon: <Sparkles size={14} />, label: "AI Research" },
      { id: "shariah" as Panel, icon: <ShieldCheck size={14} />, label: "Compliance Hub" },
      { id: "dividends" as Panel, icon: <Percent size={14} />, label: "Dividend Tracker" },
    ],
  },
];

export default function DashboardPage() {
  const [panel, setPanel] = useState<Panel>("hub");
  const { language, setLanguage, currency, setCurrency, isAr } = useTerminalStore();

  const renderContent = () => {
    switch (panel) {
      case "DCF": return <DCFModel />;
      case "LBO": return <LBOModel />;
      case "FS":  return <ThreeStatementModel />;
      case "hub":
      default: return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-12 gap-6">
          <motion.div variants={staggerItem} className="col-span-12">
            <div className="bg-[#0F172A] border border-[#334155] p-12 text-left mb-8">
              <h2 className="text-[#F8FAFC] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-4">Institutional Launchpad</h2>
              <h1 className="text-4xl text-[#F8FAFC] font-bold mb-6">Unified GCC Financial Intelligence</h1>
              <p className="text-[#94A3B8] max-w-2xl leading-relaxed">
                Connect to standardized regional exchange data with native support for sovereign tax treatments, IFRS compliance, and precise currency mapping across all GCC capital markets.
              </p>
            </div>
          </motion.div>

          {/* Core Model Launchers */}
          {NAV_SECTIONS[1].items.map((item) => (
            <motion.div 
              key={item.id} 
              variants={staggerItem} 
              onClick={() => setPanel(item.id)}
              className="col-span-12 md:col-span-4 bg-[#0F172A] border border-[#334155] p-8 cursor-pointer hover:bg-[#1E293B] transition-colors"
            >
              <div className="text-[#F59E0B] mb-6">{item.icon}</div>
              <h3 className="text-[#F8FAFC] font-mono font-bold uppercase tracking-widest text-sm mb-2">{item.label}</h3>
              <p className="text-[#64748B] text-xs">Direct terminal access to institutional-grade modelling engines.</p>
            </motion.div>
          ))}
        </motion.div>
      );
    }
  };

  return (
    <div className={`flex min-h-screen bg-[#020617] text-[#F8FAFC] ${isAr ? 'font-arabic' : ''}`} dir={isAr ? "rtl" : "ltr"}>
      {/* SIDEBAR */}
      <aside className="w-72 min-w-72 bg-[#0F172A] border-r border-[#334155] flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-[#334155] flex flex-col items-center gap-4">
          <MahwarLogo size={60} animate={false} />
          <div className="text-center">
            <div className="font-mono text-xl font-bold tracking-[0.2em] uppercase">Mahwar</div>
            <div className="text-[10px] text-[#10B981] font-bold tracking-[0.1em] opacity-80">GCC TERMINAL v2.1</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-4 mb-2 text-[9px] font-bold text-[#64748B] uppercase tracking-[0.2em]">{section.label}</div>
              {section.items.map((item) => {
                const active = panel === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPanel(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors ${
                      active ? "bg-[#1E293B] text-[#F59E0B] border-l-2 border-[#F59E0B]" : "text-[#94A3B8] hover:text-[#F8FAFC]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-[#334155]">
          <div className="text-[9px] text-[#64748B] font-mono mb-2 uppercase select-none">Authored By</div>
          <div className="text-[11px] font-bold text-[#F8FAFC] opacity-90">Muhammad Sarmad Nadeem</div>
          <div className="text-[8px] text-[#94A3B8] font-mono mt-1 uppercase">© 2026 All Rights Reserved</div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-[#334155] bg-[#020617]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-12 flex-1">
            <div className="font-mono text-sm font-bold uppercase tracking-widest text-[#F8FAFC]">
              {panel === "hub" ? "Intelligence_Hub" : panel}
            </div>
            <div className="flex-1 max-w-xl">
              <TickerSearch />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency Switcher Dropdown */}
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-[#0F172A] border border-[#334155] text-[#F8FAFC] text-[11px] font-bold px-3 py-1.5 rounded focus:outline-none focus:border-[#F59E0B]"
            >
              {['SAR', 'AED', 'KWD', 'BHD', 'OMR', 'QAR'].map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>

            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#0F172A] border border-[#334155] text-[#F59E0B] text-[11px] font-bold hover:bg-[#1E293B] transition-colors uppercase tracking-widest"
            >
              <Globe size={12} />
              {language === 'ar' ? "English" : "العربية"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-10 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
