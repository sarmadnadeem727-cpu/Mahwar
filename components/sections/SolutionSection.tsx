"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { FEATURES } from "@/lib/constants";
import { useTerminalStore } from "@/store/useTerminalStore";

const MiniViz = ({ type, isAr }: { type: string; isAr?: boolean }) => {
  switch (type) {
    case "DCF":
      return (
        <div className="flex items-end gap-1 h-8 w-full">
          {[30, 45, 60, 85, 95].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="flex-1 bg-[var(--gold)]/40 rounded-t-[1px]"
            />
          ))}
        </div>
      );
    case "LBO":
      return (
        <div className="flex items-end gap-1 h-8 w-full">
          {[90, 75, 60, 40, 20].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="flex-1 bg-[var(--emerald)]/40 rounded-t-[1px]"
            />
          ))}
        </div>
      );
    case "AI":
      return (
        <div className="font-mono text-[8px] text-[var(--text3)] space-y-1">
          <div className="flex gap-1">
            <span className="text-[var(--gold)]">{">"}</span>
            <span>{isAr ? "جاري توليد المذكرة..." : "Generating memo..."}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-[var(--gold)]">{">"}</span>
            <span>{isAr ? "اكتمل التحليل." : "Analysis complete."}</span>
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-1 h-2 bg-[var(--gold)]"
            />
          </div>
        </div>
      );
    case "3S":
      return (
        <div className="flex items-center justify-between gap-2 h-8 w-full px-2">
          {["IS", "BS", "CF"].map((t, i) => (
            <React.Fragment key={i}>
              <div className="w-6 h-6 border border-[var(--gold-dim)] rounded-sm flex items-center justify-center text-[8px] font-mono text-[var(--gold)]">
                {t}
              </div>
              {i < 2 && <div className="flex-1 h-[1px] bg-[var(--gold-dim)]" />}
            </React.Fragment>
          ))}
        </div>
      );
    case "Shariah":
      return (
        <div className="relative w-12 h-6 overflow-hidden mx-auto mt-2">
          <div className="absolute inset-0 border-[3px] border-[var(--emerald)]/40 rounded-full border-b-transparent" />
          <motion.div
            animate={{ rotate: [0, 120] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-[var(--gold)] origin-bottom"
          />
        </div>
      );
    case "Scenario":
      return (
        <div className="relative h-8 w-full flex items-center justify-center gap-1.5 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
          <div className="w-[1px] h-full bg-[var(--border)]" />
          <div className="flex flex-col gap-1">
            <div className="w-4 h-[2px] bg-[var(--pos)]" />
            <div className="w-6 h-[2px] bg-[var(--gold)]" />
            <div className="w-4 h-[2px] bg-[var(--neg)]" />
          </div>
        </div>
      );
    default:
      return null;
  }
};

const SolutionSection = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const featureDescriptionsAr: Record<string, string> = {
    "Three-Statement Model": "تكامل ديناميكي للقوائم المالية (الدخل، المركز المالي، التدفقات النقدية) مع معالجة الزكاة والمعايير السعودية.",
    "DCF Engine": "نماذج تدفقات نقدية مخصومة عالية الدقة مع حساب تلقائي لـ WACC وتحليل الحساسية.",
    "LBO Analytics": "نمذجة عمليات الاستحواذ الرافعة المعقدة مع هياكل ديون متعددة وتصورات العائد الداخلي (IRR).",
    "AI Research": "مذكرات أبحاث أسهم مؤتمتة تم إنشاؤها بواسطة Gemini 2.0 Flash، مدربة على إفصاحات تداول السعودية.",
    "Shariah Screening": "محرك فحص شرعي من الدرجة المؤسسية مع تتبع نسب التطهير والامتثال في الوقت الفعلي.",
    "Scenario Manager": "اختبار الجهد لعدة سيناريوهات (متفائل/أساسي/متشائم) لجميع النماذج مع عروض مقارنة فورية."
  };

  const tagMapAr: Record<string, string> = {
    "INSTITUTIONAL": "مؤسسي",
    "PRECISION": "دقة",
    "STRATEGY": "استراتيجية",
    "INTELLIGENCE": "ذكاء",
    "COMPLIANCE": "امتثال",
    "DATA": "بيانات"
  };

  return (
    <section id="solutions" className="relative py-[120px] px-6 lg:px-24 bg-[var(--bg1)]">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 grid-bg opacity-5 pointer-events-none" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto"
      >
        <div className="flex flex-col items-center text-center mb-20">
          <SectionLabel label={isAr ? "الحل" : "The Solution"} />
          <motion.h2 variants={staggerItem} className={`font-cormorant text-4xl md:text-5xl lg:text-6xl mb-6 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? (
              <>ستة محركات من <span className="italic text-[var(--gold)]">الدقة المالية</span></>
            ) : (
              <>Six engines of <span className="italic text-[var(--gold)]">financial precision</span></>
            )}
          </motion.h2>
          <motion.p variants={staggerItem} className={`font-dm-sans text-[var(--text2)] max-w-[500px] leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
            {isAr 
              ? "كل وحدة صممت خصيصاً لأسواق المال السعودية، مع الالتزام بالمعايير المؤسسية واحتياجات البيانات الفورية."
              : "Every module is purpose-built for the Saudi capital markets, adhering to institutional standards and real-time data needs."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover="hover"
              initial="rest"
              viewport={{ once: true }}
              className={`group relative bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-8 transition-all duration-500 hover:border-[var(--accent-border)] hover:shadow-2xl hover:shadow-[var(--accent)]/5 hover:-translate-y-2 lg:first:col-span-2 overflow-hidden`}
            >
              {/* Radial Glow on Hover */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--gold-glow)] blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-11 h-11 bg-[var(--gold-dim)] border border-[var(--gold-dim)] rounded-xl flex items-center justify-center text-xl text-[var(--gold)]">
                    {feature.icon}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--emerald)] px-2 py-1 bg-[var(--emerald)]/5 rounded-full border border-[var(--emerald)]/10">
                    {isAr ? tagMapAr[feature.tag] : feature.tag}
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4">
                  <h3 className={`font-cormorant text-2xl font-semibold text-[var(--text1)] group-hover:text-[var(--gold-bright)] transition-colors ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? feature.arabic : feature.title}
                  </h3>
                  {!isAr && (
                    <span className="font-cairo text-xs text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors text-right">
                      {feature.arabic}
                    </span>
                  )}
                </div>

                <p className={`font-dm-sans text-xs md:text-[13px] text-[var(--text2)] leading-[1.7] mb-8 group-hover:text-[var(--text1)] transition-colors ${isAr ? 'font-arabic text-sm' : ''}`}>
                  {isAr ? featureDescriptionsAr[feature.title] : feature.description}
                </p>

                <div className="mt-auto pt-6 border-t border-[var(--border)] group-hover:border-[var(--border-gold)] transition-colors">
                  <MiniViz type={feature.viz} isAr={isAr} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SolutionSection;
