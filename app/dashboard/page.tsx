"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import {
  BarChart3, Search, ArrowUpRight, ArrowDownRight,
  ChevronRight, Layers, Activity, Sparkles, ShieldCheck, Grid3X3, Calendar
} from "lucide-react";
import { DCFModel } from "@/components/models/DCFModel";
import { LBOModel } from "@/components/models/LBOModel";
import { ThreeStatementModel } from "@/components/models/ThreeStatementModel";
import { AIResearch } from "@/components/features/AIResearch";
import { ShariahScreening } from "@/components/features/ShariahScreening";
import { TickerSearch } from "@/components/features/TickerSearch";
import { HistoricalChart } from "@/components/features/HistoricalChart";
import { MetricCards } from "@/components/features/MetricCards";
import { useTerminalStore } from "@/store/useTerminalStore";
import { translations } from "@/lib/i18n";
import { Globe, Percent } from "lucide-react";
import DividendAnalysis from "@/components/features/DividendAnalysis";
import EconomicCalendar from "@/components/features/EconomicCalendar";
import OwnershipDetails from "@/components/features/OwnershipDetails";
import TechnicalCharts from "@/components/features/TechnicalCharts";
import MahwarLogo from "@/components/ui/MahwarLogo";


type Panel = "hub" | "DCF" | "LBO" | "FS" | "research" | "shariah" | "dividends" | "calendar";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { id: "hub" as Panel, icon: "⊞", label: "Intelligence Hub" },
    ],
  },
  {
    label: "Research",
    items: [
      { id: "research" as Panel, icon: "✦", label: "AI Research" },
    ],
  },
  {
    label: "Yield Analysis",
    items: [
      { id: "dividends" as Panel, icon: <Percent size={14} />, label: "Dividend Tracker" },
      { id: "calendar" as Panel, icon: <Calendar size={14} />, label: "Economic Calendar" },
    ],
  },
  {
    label: "Models",
    items: [
      { id: "DCF" as Panel, icon: "◎", label: "DCF Engine" },
      { id: "LBO" as Panel, icon: "⬡", label: "LBO Builder" },
      { id: "FS" as Panel, icon: "△", label: "3-Statement" },
    ],
  },
];

const PANEL_META: Record<Panel, { title: string; titleAr: string; badge: string }> = {
  hub:      { title: "Intelligence Terminal",  titleAr: "المحطة الذكية",         badge: "GCC Markets"        },
  research: { title: "AI Research",            titleAr: "أبحاث الذكاء الاصطناعي", badge: "Gemini 2.0 Flash"  },
  shariah:  { title: "Shariah Screening",       titleAr: "الفحص الشرعي",          badge: "AAOIFI Standard"    },
  DCF:      { title: "DCF Engine",              titleAr: "محرك التدفقات النقدية",  badge: "Sovereign Model"    },
  LBO:      { title: "LBO Analytics",           titleAr: "تحليلات الاستحواذ",     badge: "Multi-Tranche"      },
  FS:       { title: "Three-Statement Model",   titleAr: "نموذج القوائم الثلاث",  badge: "IFRS / GAAP"        },
  dividends: { title: "Dividend & Yield Tracker", titleAr: "تتبع العوائد والتوزيعات", badge: "Premium Yield"   },
  calendar:  { title: "Economic Calendar",       titleAr: "المفكرة الاقتصادية",    badge: "KSA/GCC Events"      },
};

export default function DashboardPage() {
  const [panel, setPanel] = useState<Panel>("hub");
  
  const { selectedTicker, setTicker, data, language, setLanguage } = useTerminalStore();

  const t = translations[language];
  const isAr = language === "ar";

  const meta = PANEL_META[panel];

  // ── Full-screen model/feature views ──────────────────────────────────────
  const renderFullScreen = () => {
    const back = () => setPanel("hub");
    
    const LocalBackBtn = () => (
      <button
        onClick={back}
        dir={isAr ? "rtl" : "ltr"}
        style={{
          position: "absolute", top: "16px", [isAr ? "right" : "left"]: "16px", zIndex: 50,
          padding: "8px 16px", background: "white", border: "1px solid var(--border)",
          borderRadius: "6px", fontSize: "10px", textTransform: "uppercase", letterSpacing: ".12em",
          color: "var(--text2)", cursor: "pointer", fontFamily: isAr ? "'Cairo',sans-serif" : "'IBM Plex Mono',monospace",
          transition: "all .2s", boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg2)"; e.currentTarget.style.color = "var(--gold)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg1)"; e.currentTarget.style.color = "var(--text1)"; }}


      >
        {isAr ? "← العودة إلى مركز الاستخبارات" : "← Back to Intelligence Hub"}
      </button>
    );

    if (panel === "DCF") return (
      <div className="min-h-screen bg-[var(--void)] relative">
        <LocalBackBtn />
        <DCFModel />
      </div>
    );
    if (panel === "LBO") return (
      <div className="min-h-screen bg-[var(--void)] relative" dir={isAr ? "rtl" : "ltr"}>
        <LocalBackBtn />
        <LBOModel />
      </div>
    );
    if (panel === "FS") return (
      <div className="min-h-screen bg-[var(--void)] relative" dir={isAr ? "rtl" : "ltr"}>
        <LocalBackBtn />
        <ThreeStatementModel />
      </div>
    );
    return null;
  };

  if (panel === "DCF" || panel === "LBO" || panel === "FS") {
    return renderFullScreen();
  }

  // ── Shell with sidebar ────────────────────────────────────────────────────
  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ display: "flex", minHeight: "100vh", background: "var(--void)" }}>


      {/* SIDEBAR */}
      <aside style={{
        width: "280px", minWidth: "280px", background: "var(--bg1)",
        borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto", padding: "0 0 24px", zIndex: 10,
        boxShadow: "10px 0 40px rgba(0,0,0,0.3)"
      }}>


        {/* Logo & Branding Restoration */}
        <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center" }}>
          <MahwarLogo size={80} animate={true} />
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "32px", fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text1)", lineHeight: 1 }}>Mahwar</div>
            <div style={{ fontFamily: "'Cairo',sans-serif", fontSize: "10px", fontWeight: 700, color: "var(--emerald)", letterSpacing: ".3em", textTransform: "uppercase", marginTop: "8px", opacity: 0.8 }}>
              {isAr ? "محور الاستخبارات المالية" : "THE AXIS OF INTELLIGENCE"}
            </div>
          </div>
        </div>



        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div style={{ padding: "24px 16px 8px", fontFamily: isAr ? "'Cairo',sans-serif" : "'IBM Plex Mono',monospace", fontSize: "9px", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text3)" }}>

              {isAr ? (section.label === "Platform" ? "المنصة" : section.label === "Research" ? "الأبحاث" : "النماذج") : section.label}
            </div>
            {section.items.map((item) => {
              const active = panel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPanel(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 14px", margin: "2px 10px", borderRadius: "10px",
                    fontSize: "13px", fontWeight: active ? 600 : 500, cursor: "pointer", width: "calc(100% - 20px)",
                    background: active ? "var(--emerald-dim)" : "transparent",
                    color: active ? "var(--emerald)" : "var(--text2)",
                    border: active ? "1px solid var(--emerald)" : "1px solid transparent",
                    transition: "all .2s", fontFamily: "'DM Sans',sans-serif", textAlign: "left",
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "var(--bg2)"; e.currentTarget.style.color = "var(--text1)"; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; } }}

                >
                  <span style={{ width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", opacity: active ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                  <span>{isAr ? (item.label === "Intelligence Hub" ? "مركز الاستخبارات" : item.label === "AI Research" ? "أبحاث الذكاء الاصطناعي" : item.label === "Shariah Screen" ? "الفحص الشرعي" : item.label === "Market Screener" ? "فاحص السوق" : item.label === "Live Market" ? "السوق المباشر" : item.label === "DCF Engine" ? "محرك التدفقات النقدية" : item.label === "LBO Builder" ? "محلل الاستحواذ" : "القوائم الثلاث") : item.label}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", fontWeight: 600, color: "var(--emerald)", letterSpacing: ".1em" }}>
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 bg-[var(--emerald)] rounded-full animate-ping opacity-40" />
              <div className="relative w-2 h-2 rounded-full bg-[var(--emerald)]" />
            </div>
            Terminal Active
          </div>

          {/* Developer Credits Button */}
          <button
            title="All Rights Reserved"
            style={{
              width: "100%", padding: "12px 10px", borderRadius: "10px",
              background: "var(--bg2)",
              border: "1px solid var(--border)", cursor: "default",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
            }}
          >
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "14px", fontWeight: 700, color: "var(--navy)", letterSpacing: ".02em" }}>
              Muhammad Sarmad Nadeem
            </span>
            <span style={{ fontFamily: "'Cairo',sans-serif", fontSize: "10px", fontWeight: 600, color: "var(--text2)", letterSpacing: ".04em" }}>
              محمد سرمد نديم
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "8px", fontWeight: 600, color: "var(--text3)", letterSpacing: ".12em", textTransform: "uppercase", marginTop: "1px" }}>
              © 2026 · All Rights Reserved
            </span>

          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* TOP BAR */}
        <div style={{
          height: "72px", borderBottom: "1px solid var(--border)",
          background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", position: "sticky", top: 0, zIndex: 9,
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1 }}>
            <div>
              <div style={{ fontFamily: isAr ? "'Cairo',sans-serif" : "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 700, letterSpacing: ".01em", color: "var(--text1)" }}>{isAr ? meta.titleAr : meta.title}</div>
              <div style={{ fontFamily: "'Cairo',sans-serif", fontSize: "12px", fontWeight: 700, color: "var(--emerald)", opacity: 0.9 }}>{isAr ? meta.title : meta.titleAr}</div>
            </div>


            {/* Global Asset Search */}
            <div className="flex-1 max-w-2xl mx-8">
              <TickerSearch />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(isAr ? 'en' : 'ar')}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px",
                background: "white", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--gold)", fontSize: "11px", fontWeight: 700,
                cursor: "pointer", transition: "all .2s", textTransform: "uppercase", letterSpacing: ".1em",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg1)"}


            >
              <Globe size={14} />
              {isAr ? "English" : "العربية"}
            </button>

          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>

          {/* ── RESEARCH PANEL ── */}
          {panel === "research" && (
            <motion.div key="research" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <AIResearch />
            </motion.div>
          )}

          {/* ── SHARIAH PANEL ── */}
          {panel === "shariah" && (
            <motion.div key="shariah" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <ShariahScreening />
            </motion.div>
          )}

          {/* ── DIVIDENDS PANEL ── */}
          {panel === "dividends" && (
            <motion.div key="dividends" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <DividendAnalysis />
            </motion.div>
          )}

          {/* ── CALENDAR PANEL ── */}
          {panel === "calendar" && (
            <motion.div key="calendar" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <EconomicCalendar />
            </motion.div>
          )}



          {/* ── HUB PANEL ── */}
          {panel === "hub" && (
            <motion.div
              key="hub"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-12 gap-6"
            >
              <MetricCards />
              <HistoricalChart />

              {/* Feature Portal Cards */}
              <motion.div variants={staggerItem} className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                {/* DCF */}
                <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-5 relative overflow-hidden group cursor-pointer shadow-sm hover:border-[var(--gold)] transition-all" onClick={() => setPanel("DCF")}>


                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <BarChart3 className="w-4 h-4 text-[var(--gold)]" />
                      <h3 className="text-xs font-semibold text-[var(--gold)] uppercase tracking-widest">{t.dcf_engine}</h3>
                    </div>
                    <p className="text-xs text-[var(--text2)] leading-relaxed mb-4">{isAr ? "تقييم التدفقات النقدية السيادية مع تقييم WACC الآلي." : "Sovereign DCF with automated WACC and sensitivity analysis."}</p>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--gold)] group-hover:text-[var(--gold-bright)] transition-colors uppercase tracking-widest">
                      {isAr ? "تهيئة" : "Initialize"} <ChevronRight className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[var(--gold)] opacity-[0.03] blur-3xl rounded-full group-hover:opacity-10 transition-opacity" />

                </div>

                {/* LBO */}
                <div className="terminal-card p-5 hover:border-[var(--accent-border)] hover:shadow-lg transition-all cursor-pointer group" onClick={() => setPanel("LBO")}>
                  <div className="flex items-center gap-3 mb-3">
                    <Layers className="w-4 h-4 text-[var(--amber)] group-hover:scale-110 transition-transform" />
                    <h3 className="text-xs font-bold text-[var(--text1)] uppercase tracking-widest group-hover:text-[var(--amber)] transition-colors">{t.lbo_builder}</h3>
                  </div>
                  <p className="text-xs text-[var(--text2)] leading-relaxed mb-4">{isAr ? "هياكل ديون متعددة المستويات وتصوير لعوائد الاستثمار IRR." : "Multi-tier debt structures and exit IRR visualizations."}</p>
                  <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--amber)] group-hover:text-[var(--amber-dim)] transition-colors uppercase tracking-widest">
                    {isAr ? "بناء سيناريو" : "Build Scenario"} <ChevronRight className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* 3-Statement */}
                <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--border-gold)] hover:shadow-lg transition-all cursor-pointer group" onClick={() => setPanel("FS")}>
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-4 h-4 text-[var(--text2)] group-hover:text-[var(--gold)] transition-colors" />
                    <h3 className="text-xs font-bold text-[var(--text1)] uppercase tracking-widest group-hover:text-[var(--gold)] transition-colors">{t.three_statement}</h3>
                  </div>
                  <p className="text-xs text-[var(--text3)] leading-relaxed mb-4">{isAr ? "القائمة الثلاثية مع معالجات الزكاة السعودية IFRS/GAAP." : "IS · BS · CF with Saudi GAAP/IFRS Zakat treatments."}</p>

                  <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--text3)] group-hover:text-[var(--gold)] transition-colors uppercase tracking-widest">
                    {isAr ? "بدء المراجعة" : "Launch Audit"} <ChevronRight className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
                  </button>

                </div>

              </motion.div>

              {/* Research Feature Banners */}
              <motion.div variants={staggerItem} className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "research" as Panel, icon: <Sparkles className="w-5 h-5" />, label: "AI Research", labelAr: "أبحاث الذكاء الاصطناعي", desc: "Gemini-powered institutional memos with Zakat & Vision 2030 context.", badge: "Gemini 2.0" },
                  { id: "shariah" as Panel,  icon: <ShieldCheck className="w-5 h-5" />, label: "Shariah Screening", labelAr: "الفحص الشرعي", desc: "AAOIFI-standard compliance engine with purification data.", badge: "AAOIFI" },
                  { id: "screener" as Panel, icon: <Grid3X3 className="w-5 h-5" />, label: "Market Screener", labelAr: "فاحص السوق", desc: "Multi-dimensional filtering across 30 Tadawul symbols with heatmaps.", badge: "30 Stocks" },
                ].map(({ id, icon, label, labelAr, desc, badge }) => (
                  <div key={id} onClick={() => setPanel(id)} style={{
                    background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: "16px",
                    padding: "24px", cursor: "pointer", transition: "all .3s", position: "relative", overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                  }}

                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--emerald)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(14,124,105,0.05)"; }}

                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(14,124,105,0.02)"; }}
                  >
                    <div style={{ color: "var(--emerald)", marginBottom: "16px" }}>{icon}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "9px", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--emerald)", marginBottom: "4px" }}>{badge}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: 700, color: "var(--text1)", marginBottom: "2px" }}>{label}</div>
                    <div style={{ fontFamily: "'Cairo',sans-serif", fontSize: "11px", fontWeight: 600, color: "var(--text3)", marginBottom: "12px" }}>{labelAr}</div>
                    <div style={{ fontSize: "12px", color: "var(--text2)", lineHeight: 1.6 }}>{desc}</div>
                    <div style={{ position: "absolute", bottom: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "var(--emerald)", opacity: 0.03, filter: "blur(20px)" }} />
                  </div>
                ))}

              </motion.div>


            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse-logo { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(.6);opacity:.5} }
      `}</style>
    </div>
  );
}
