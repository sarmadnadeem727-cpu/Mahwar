"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, EASE_PREMIUM } from "@/lib/motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { useTerminalStore } from "@/store/useTerminalStore";

const statsAr = [
  { value: "200+", label: "شركات تفتقر إلى تحليل موحد" },
  { value: "47h", label: "متوسط وقت إنشاء مذكرة بحثية" },
  { value: "$2.5T", label: "قيمة سوقية تفتقد لمنصة وطنية" },
  { value: "0", label: "منصات تدعم معالجة الزكاة بشكل صحيح" },
];

const statsEn = [
  { value: "200+", label: "Companies without unified analysis" },
  { value: "47h", label: "Average memo creation time" },
  { value: "$2.5T", label: "Market cap with no native platform" },
  { value: "0", label: "Platforms with correct Zakat treatment" },
];

const ProblemSection = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const stats = isAr ? statsAr : statsEn;
  return (
    <section className="relative py-[140px] px-6 lg:px-24 bg-[var(--bg1)] overflow-hidden">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Column */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col"
        >
          <SectionLabel label={isAr ? "المشكلة" : "The Problem"} />
          
          <motion.h2
            variants={staggerItem}
            className={`font-cormorant text-4xl md:text-5xl lg:text-6xl leading-tight mb-8 ${isAr ? 'font-arabic' : ''}`}
          >
            {isAr ? (
              <>البيانات المالية <br /> <span className="gold-gradient-text italic">مجزأة</span>، <br /> مشتتة، مفقودة.</>
            ) : (
              <>Financial data is <br /> <span className="gold-gradient-text italic">fragmented</span>, <br /> scattered, lost.</>
            )}
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className={`font-dm-sans text-lg text-[var(--text2)] leading-relaxed mb-12 max-w-[540px] ${isAr ? 'font-arabic' : ''}`}
          >
            {isAr 
              ? "ينمو السوق السعودي بوتيرة قياسية، لكن الأدوات المستخدمة لتحليله عالقة في الماضي. يقضي المحللون وقتاً أطول في معالجة البيانات من البحث عن الرؤى الاستثمارية."
              : "The Saudi market is growing at a record pace, but the tools used to analyze it are stuck in the past. Analysts spend more time cleaning data than finding insights."}
          </motion.p>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="flex flex-col gap-2"
              >
                <span className="font-ibm-plex-mono text-3xl font-semibold text-[var(--gold)]">
                  {stat.value}
                </span>
                <span className={`font-dm-sans text-xs text-[var(--text3)] uppercase tracking-wider ${isAr ? 'font-arabic' : ''}`}>
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Fragmented Visual */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: EASE_PREMIUM }}
          viewport={{ once: true }}
          className="relative h-[500px] flex items-center justify-center"
        >
          {/* Scatter Cards */}
          <div className="relative w-full h-full flex items-center justify-center">
            {[
              { rot: -2, x: -40, y: -60, labelEn: "Revenue Breakdown", labelAr: "توزيع الإيرادات", bars: [40, 70, 50, 90] },
              { rot: 3, x: 60, y: -20, labelEn: "Debt Maturity", labelAr: "استحقاق الديون", bars: [80, 40, 60, 30] },
              { rot: -4, x: -20, y: 80, labelEn: "Market Share", labelAr: "الحصة السوقية", bars: [30, 50, 80, 40] },
              { rot: 1, x: 40, y: 40, labelEn: "FCF Yield", labelAr: "عائد التدفق النقدي", bars: [60, 90, 40, 70] },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, zIndex: 10, rotate: 0 }}
                style={{
                  rotate: card.rot,
                  x: isAr ? -card.x : card.x,
                  y: card.y,
                }}
                className="absolute w-[240px] bg-[var(--bg2)] border border-[var(--border)] rounded-[10px] p-4 shadow-xl shadow-black/5 backdrop-blur-sm transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
              >

                <div className="flex justify-between items-center mb-4">
                  <span className={`font-mono text-[9px] uppercase tracking-wider text-[var(--text3)] ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? card.labelAr : card.labelEn}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold-dim)]" />
                </div>
                <div className="flex items-end gap-2 h-16">
                  {card.bars.map((h, j) => (
                    <div
                      key={j}
                      className={`flex-1 rounded-t-[2px] ${
                        j % 2 === 0 ? "bg-[var(--emerald)]/40" : "bg-[var(--negative)]/40"
                      }`}

                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-[var(--gold-glow)] via-transparent to-transparent opacity-20 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
