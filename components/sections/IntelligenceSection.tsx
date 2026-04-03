"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, EASE_PREMIUM } from "@/lib/motion";
import SectionLabel from "@/components/ui/SectionLabel";

const IntelligenceSection = () => {
  return (
    <section id="ai-research" className="relative py-[120px] px-6 lg:px-24 bg-[var(--void)] overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--gold-glow)] blur-[160px] opacity-10 rounded-full pointer-events-none" />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Column */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <SectionLabel label="Institutional Analysis" />
          <motion.h2 variants={staggerItem} className="font-cormorant text-4xl md:text-5xl lg:text-6xl italic leading-tight mb-8">
            Every tick. Every ratio. <br /> Every signal.
          </motion.h2>
          <motion.p variants={staggerItem} className="font-dm-sans text-lg text-[var(--text2)] max-w-[500px] leading-relaxed mb-12">
            The platform delivers sub-second data streaming and complex financial ratios that evolve as the market moves. Precision at your fingertips.
          </motion.p>
          
          <ul className="space-y-6">
            {[
              "Real-time Tadawul Level II data",
              "Automated Shariah compliance tracking",
              "Dynamic valuation sensitivity analysis",
              "Visual portfolio attribution",
              "Institutional research integration",
            ].map((item, i) => (
              <motion.li
                key={i}
                variants={staggerItem}
                className="flex items-center gap-4 text-sm font-dm-sans text-[var(--text2)]"
              >
                <div className="w-5 h-[1px] bg-[var(--gold)]" />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right Column: Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: EASE_PREMIUM }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative bg-[var(--bg2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl shadow-black/5">
            {/* Top Bar */}
            <div className="h-10 bg-[var(--bg2)] border-b border-[var(--border)] px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
              </div>
              <div className="flex gap-4">
                {["OVERVIEW", "DCF", "RESEARCH"].map((tab, i) => (
                  <span key={i} className={`font-mono text-[8px] tracking-widest ${i === 2 ? "text-[var(--gold)]" : "text-[var(--text3)]"}`}>
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "WACC (%)", val: "9.2%", chg: "Stable", up: true },
                  { label: "FV (SAR)", val: "34.50", chg: "Upside", up: true },
                  { label: "ZAKAT", val: "2.5%", chg: "Compliant", up: true },
                ].map((kpi, i) => (
                  <div key={i} className="bg-[var(--bg1)] border border-[var(--border)] rounded-lg p-3">
                    <span className="block font-mono text-[8px] text-[var(--text3)] mb-1">{kpi.label}</span>
                    <div className="flex items-end justify-between">
                      <span className="font-mono text-base font-semibold text-[var(--text1)]">{kpi.val}</span>
                      <span className={`font-mono text-[8px] ${kpi.up ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                        ▲ {kpi.chg}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Area */}
              <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-lg p-4 h-[140px] relative overflow-hidden">
                <span className="absolute top-4 left-4 font-mono text-[8px] text-[var(--text3)] uppercase tracking-widest">
                  Valuation Bridge
                </span>
                <svg className="w-full h-full pt-6" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d="M 0 80 Q 50 20 100 60 Q 150 90 200 40 Q 250 10 300 50 Q 350 30 400 70"
                    fill="none"
                    stroke="var(--emerald)"
                    strokeWidth="2"
                  />
                  <motion.path
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    d="M 0 80 Q 50 20 100 60 Q 150 90 200 40 Q 250 10 300 50 Q 350 30 400 70 V 100 H 0 Z"
                    fill="url(#chartGradient)"
                  />
                </svg>
              </div>

              {/* Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1 font-mono text-[8px] text-[var(--text3)] uppercase tracking-widest">
                  <span>Ticker</span>
                  <span>Price</span>
                  <span>Chg%</span>
                </div>
                {[
                  { t: "2222.SR", p: "28.40", c: "+0.53%", u: true },
                  { t: "1120.SR", p: "87.60", c: "+1.39%", u: true },
                  { t: "1180.SR", p: "38.90", c: "+2.91%", u: true },
                  { t: "7010.SR", p: "41.20", c: "-0.24%", u: false },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center px-3 py-2 bg-[var(--bg2)] border border-[var(--border)] rounded-md">
                    <span className="font-mono text-[10px] text-[var(--emerald)]">{row.t}</span>
                    <span className="font-mono text-[10px] text-[var(--text1)]">{row.p}</span>
                    <span className={`font-mono text-[10px] ${row.u ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                      {row.u ? "+" : ""}{row.c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--emerald)]/20 to-transparent blur-xl -z-10 opacity-20" />
        </motion.div>

      </div>
    </section>
  );
};

export default IntelligenceSection;
