"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, BarChart2, BookOpen, Shield, ScrollText, BadgeCheck } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

interface FooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
}

const FooterModal = ({ isOpen, onClose, type }: FooterModalProps) => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const renderContent = () => {
    switch (type.toLowerCase()) {
      case "global indices":
      case "المؤشرات العالمية":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="text-xl font-serif font-bold text-white uppercase tracking-tight">
                {isAr ? "المؤشرات العالمية" : "Global Market Indices"}
              </h3>
            </div>
            <div className="overflow-hidden border border-white/10 rounded-xl bg-white/5">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-white/10 text-[var(--gold)]">
                    <th className="p-4">{isAr ? "المؤشر" : "Index"}</th>
                    <th className="p-4">{isAr ? "القيمة" : "Value"}</th>
                    <th className="p-4">{isAr ? "التغير" : "Change"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    { name: "S&P 500", val: "5,842.20", chg: "+0.45%", up: true },
                    { name: "Nasdaq 100", val: "20,124.50", chg: "+0.82%", up: true },
                    { name: "FTSE 100", val: "8,231.10", chg: "-0.12%", up: false },
                    { name: "Nikkei 225", val: "38,450.00", chg: "+1.24%", up: true },
                    { name: "DAX 40", val: "19,412.30", chg: "+0.21%", up: true },
                  ].map((idx, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-bold">{idx.name}</td>
                      <td className="p-4 text-[var(--text2)]">{idx.val}</td>
                      <td className={`p-4 font-bold ${idx.up ? "text-emerald-400" : "text-red-400"}`}>
                        {idx.chg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "sectors":
      case "القطاعات":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart2 className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="text-xl font-serif font-bold text-white uppercase tracking-tight">
                {isAr ? "تحليل القطاعات" : "Tadawul Sector Analysis"}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: isAr ? "الطاقة" : "Energy", weight: "32.4%", count: "14" },
                { name: isAr ? "المواد الأساسية" : "Materials", weight: "18.2%", count: "42" },
                { name: isAr ? "البنوك" : "Banks", weight: "24.1%", count: "11" },
                { name: isAr ? "الاتصالات" : "Telecom", weight: "8.5%", count: "4" },
              ].map((s, i) => (
                <div key={i} className="p-4 border border-white/10 rounded-xl bg-white/5 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-white mb-1">{s.name}</div>
                    <div className="text-[10px] text-[var(--text3)] uppercase uppercase tracking-widest">{s.count} {isAr ? "شركات" : "Companies"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[var(--gold)] font-mono font-bold">{s.weight}</div>
                    <div className="text-[9px] text-[var(--text3)] uppercase">{isAr ? "الوزن النسبي" : "Weight"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "documentation":
      case "الوثائق":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="text-xl font-serif font-bold text-white uppercase tracking-tight">
                {isAr ? "وثائق المنصة" : "Terminal Documentation"}
              </h3>
            </div>
            <div className="prose prose-invert max-w-none text-xs text-[var(--text2)] leading-relaxed space-y-4">
              <p>
                {isAr 
                  ? "محور هي منصة متقدمة لتحليل أسهم السوق السعودي. توفر بيانات مباشرة ونماذج مالية مؤسسية."
                  : "Mahwar is an advanced analytics suite for the Saudi capital markets, providing real-time data and institutional-grade models."}
              </p>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <h4 className="text-emerald-400 font-bold mb-2 uppercase tracking-widest text-[10px]">{isAr ? "الميزات المدعومة" : "Core Modules"}</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{isAr ? "محرك التدفقات النقدية المخصومة (DCF)" : "DCF Engine"}</li>
                  <li>{isAr ? "أبحاث الذكاء الاصطناعي (Gemini 2.0)" : "AI Research (Gemini 2.0)"}</li>
                  <li>{isAr ? "فحص الامتثال الشرعي" : "Shariah Screening"}</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "privacy policy":
      case "سياسة الخصوصية":
        return (
          <div className="space-y-4 text-xs text-[var(--text2)] leading-relaxed">
            <div className="flex items-center gap-2 mb-4">
               <Shield className="w-5 h-5 text-emerald-500" />
               <h3 className="text-lg font-bold text-white">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</h3>
            </div>
            <p>{isAr ? "نحن نأخذ خصوصية بياناتك المالية على محمل الجد." : "We take the privacy of your financial research and identity seriously."}</p>
            <p>1. Data Encryption: All API keys and research memos are encrypted at rest.</p>
            <p>2. No Data Sharing: We do not sell your research patterns to third-party quants.</p>
            <p>3. Transparency: SAMA-compliant data handling practices are enforced.</p>
          </div>
        );

      case "terms of service":
      case "شروط الخدمة":
        return (
          <div className="space-y-4 text-xs text-[var(--text2)] leading-relaxed">
            <div className="flex items-center gap-2 mb-4">
               <ScrollText className="w-5 h-5 text-[var(--gold)]" />
               <h3 className="text-lg font-bold text-white">{isAr ? "شروط الخدمة" : "Terms of Service"}</h3>
            </div>
            <p>{isAr ? "باستخدام منصة محور، فإنك توافق على الالتزام بالشروط التالية." : "By accessing Mahwar, you agree to the following institutional terms."}</p>
            <p>1. Data Usage: Real-time data from Tadawul is for personal institutional use only.</p>
            <p>2. Compliance: Users are responsible for their own investment decisions.</p>
            <p>3. API Limits: Excessive calls to Gemini or EODHD may result in throttling.</p>
          </div>
        );

      case "licensing":
      case "التراخيص":
        return (
          <div className="space-y-4 text-xs text-[var(--text2)] leading-relaxed text-center">
            <BadgeCheck className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-white">{isAr ? "ترخيص المنصة المؤسسي" : "Enterprise Licensing"}</h3>
            <p className="max-w-[300px] mx-auto opacity-70">
              {isAr ? "منصة محور مسجلة ومحمية بموجب قوانين الملكية الفكرية في المملكة العربية السعودية." : "Mahwar is a proprietary financial intelligence system protected under Saudi IP law."}
            </p>
            <div className="py-2 px-4 bg-white/5 border border-white/10 rounded-full inline-block font-mono text-[10px] text-[var(--gold)]">
               LICENSE: {new Date().getFullYear()}-MAHWAR-PRO-GOLD
            </div>
          </div>
        );

      default:
        return (
          <div className="py-20 text-center text-[var(--text3)] italic">
            {isAr ? "المحتوى قيد التحديث..." : "Content under refinement..."}
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`
              relative w-full max-w-2xl bg-[var(--bg1)] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-8 overflow-hidden
              ${isAr ? 'font-arabic' : ''}
            `}
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/5 border border-white/10 rounded-full text-[var(--text3)] hover:text-white transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Overflow */}
            <div className="relative z-10 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {renderContent()}
            </div>

            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)] opacity-[0.03] blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 opacity-[0.03] blur-[100px] -z-10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FooterModal;
