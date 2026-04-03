"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { Zap, ShieldCheck, Globe, Brain } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

const techCardsEn = [
  {
    title: "Institutional Engine",
    desc: "Seamless financial data integration for both public and private GCC entities.",
    icon: <Zap size={20} className="text-[var(--gold)]" />,
  },
  {
    title: "Zakat Engine",
    desc: "ZATCA-compliant treatment for all financial disclosures.",
    icon: <ShieldCheck size={20} className="text-[var(--emerald)]" />,
  },
  {
    title: "Bilingual Core",
    desc: "Built-in RTL support for Arabic and English financial poetry.",
    icon: <Globe size={20} className="text-[var(--gold)]" />,
  },
  {
    title: "AI Research",
    desc: "Gemini 2.0 Flash powering deep equity research memos.",
    icon: <Brain size={20} className="text-[var(--emerald)]" />,
  },
];

const techCardsAr = [
  {
    title: "المحرك المؤسسي",
    desc: "تكامل سلس للبيانات المالية لكل من الشركات العامة والخاصة في الخليج.",
    icon: <Zap size={20} className="text-[var(--gold)]" />,
  },
  {
    title: "معالجة الزكاة",
    desc: "معالجة متوافقة مع هيئة الزكاة والضريبة والجمارك لجميع الإفصاحات.",
    icon: <ShieldCheck size={20} className="text-[var(--emerald)]" />,
  },
  {
    title: "جوهر ثنائي اللغة",
    desc: "دعم RTL مدمج للعربية والإنجليزية بلغة مالية رفيعة.",
    icon: <Globe size={20} className="text-[var(--gold)]" />,
  },
  {
    title: "أبحاث الذكاء الاصطناعي",
    desc: "Gemini 2.0 Flash يدعم مذكرات أبحاث الأسهم العميقة.",
    icon: <Brain size={20} className="text-[var(--emerald)]" />,
  },
];

const pills = [
  "Next.js 14", "TypeScript Strict", "Framer Motion", "React Three Fiber",
  "TanStack Query", "Zustand", "Yahoo Finance", "Gemini 2.0 Flash", "SQLite", "Tailwind"
];

const TechnologySection = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const techCards = isAr ? techCardsAr : techCardsEn;
  return (
    <section id="security" className="relative py-[120px] px-6 lg:px-24 bg-[var(--void)] overflow-hidden">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Column: Tech Cards (reversed order in desktop) */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 order-2 lg:order-1"
        >
          {techCards.map((card, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -3, borderColor: "var(--border-gold)", backgroundColor: "var(--bg3)" }}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-6 transition-all duration-300"
            >

              <div className="w-10 h-10 rounded-lg bg-[var(--bg3)] border border-[var(--border)] flex items-center justify-center mb-6">
                {card.icon}
              </div>
              <h3 className={`font-cormorant text-xl font-semibold text-[var(--text1)] mb-3 ${isAr ? 'font-arabic' : ''}`}>
                {card.title}
              </h3>
              <p className={`font-dm-sans text-xs text-[var(--text3)] leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Right Column: Copy */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col order-1 lg:order-2"
        >
          <SectionLabel label={isAr ? "التقنيات المستخدمة" : "Our Stack"} />
          <motion.h2 variants={staggerItem} className={`font-cormorant text-4xl md:text-5xl lg:text-6xl leading-tight mb-8 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? (
              <>هندسة متقنة <br /> <span className="italic text-[var(--gold)]">لمتطلبات مؤسسية</span></>
            ) : (
              <>Precision-engineered for <br /> <span className="italic text-[var(--gold)]">institutional demands</span></>
            )}
          </motion.h2>
          <motion.p variants={staggerItem} className={`font-dm-sans text-lg text-[var(--text2)] leading-relaxed mb-12 max-w-[540px] ${isAr ? 'font-arabic' : ''}`}>
            {isAr 
              ? "لا نكتفي بالحلول التقليدية. تم اختيار كل طبقة من تقنياتنا لضمان الأداء والموثوقية والأمان."
              : "We don't settle for generic solutions. Every layer of our technology stack is selected for performance, reliability, and security."}
          </motion.p>

          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap gap-3"
          >
            {pills.map((pill, i) => (
              <motion.span
                key={i}
                variants={staggerItem}
                className="font-mono text-[10px] uppercase tracking-widest text-[var(--text3)] px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg2)]/50 hover:text-[var(--gold)] hover:border-[var(--gold-dim)] transition-colors cursor-default"
              >
                {pill}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechnologySection;
