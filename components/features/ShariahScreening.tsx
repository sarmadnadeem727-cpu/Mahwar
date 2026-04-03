"use client";

import React from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { ShieldCheck, Target, AlertTriangle, AlertCircle } from "lucide-react";

export function ShariahScreening() {
  const { selectedTicker, data: globalData, language } = useTerminalStore();
  const isAr = language === "ar";
  
  if (!globalData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-lg mx-auto">
        <ShieldCheck className="w-16 h-16 text-[var(--text3)] mb-6 opacity-50" />
        <h2 className="text-2xl font-serif text-[var(--text1)] mb-2">
          {isAr ? "الفحص الشرعي المؤسسي" : "Institutional Shariah Screening"}
        </h2>
        <p className="text-[var(--text3)]">
          {isAr ? "يرجى البحث عن شركة لتوليد تقرير التوافق الشرعي" : "Please search for a company to access its real-time shariah compliance report."}
        </p>
      </div>
    );
  }

  const liveShariah = globalData.shariah;
  
  return (
    <div className="max-w-[1200px] mx-auto py-8">
      {/* Live Analysis for Selected Ticker */}
      <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.03] blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-6 relative z-10" dir={isAr ? "rtl" : "ltr"}>
          <div>
            <div className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-[0.3em] font-bold mb-3 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4" /> {isAr ? "تحليل مباشر (معايير أيوفي)" : "Live Analysis (AAOIFI Standard)"}
            </div>
            <h2 className="font-serif text-4xl font-bold text-[var(--text1)] tracking-tight">
               {globalData.name} <span className="text-[var(--text4)] text-2xl tracking-normal">({selectedTicker})</span>
            </h2>
          </div>
          
          <div className="flex flex-shrink-0">
            <div className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-mono text-sm uppercase tracking-widest font-bold border shadow-inner
              ${liveShariah.isCompliant 
                ? "bg-[var(--pos-bg)] border-[var(--pos)] text-[var(--pos)]" 
                : "bg-[var(--neg-bg)] border-[var(--neg)] text-[var(--neg)]"}
            `}>
              {liveShariah.isCompliant ? (isAr ? "✓ متوافق شرعياً" : "✓ COMPLIANT") : (isAr ? "✗ غير متوافق" : "✗ NON-COMPLIANT")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10" dir={isAr ? "rtl" : "ltr"}>
          {[
            { label: isAr ? "النقد + الفوائد / الأصول" : "Cash + Interest / Total Assets", val: liveShariah.ratios.cash, threshold: 33 },
            { label: isAr ? "إجمالي الدين / الأصول" : "Total Debt / Total Assets", val: liveShariah.ratios.debt, threshold: 33 },
            { label: isAr ? "الذمم المدينة / الأصول" : "Accounts Receivable / Assets", val: liveShariah.ratios.ar, threshold: 49 },
          ].map((r) => {
             const isPass = (r.val || 0) <= r.threshold;
             return (
               <div key={r.label} className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-6 group hover:border-[var(--accent-border)] transition-colors">
                 <div className="text-[11px] text-[var(--text2)] mb-4 font-bold uppercase tracking-widest">{r.label}</div>
                 <div className="flex items-baseline justify-between mb-3">
                   <div className={`text-3xl font-mono font-bold tracking-tighter ${isPass ? "text-[var(--text1)]" : "text-[var(--neg)]"}`}>
                     {(r.val || 0).toFixed(2)}%
                   </div>
                   <div className="text-[10px] text-[var(--text4)] font-bold uppercase tracking-widest">{isAr ? "الحد" : "Max"} {r.threshold}%</div>
                 </div>
                 
                 <div className="h-1.5 bg-[var(--bg1)] rounded-full overflow-hidden">
                   <div 
                     className="h-full rounded-full transition-all duration-1000"
                     style={{ 
                       width: `${Math.min(100, (r.val || 0) / r.threshold * 100)}%`, 
                       backgroundColor: isPass ? "var(--pos)" : "var(--neg)"
                     }}
                   />
                 </div>
               </div>
             );
          })}
        </div>

        <div className="p-6 bg-[var(--amber-dim)] border border-[var(--amber-border)] rounded-2xl flex items-start gap-4" dir={isAr ? "rtl" : "ltr"}>
          <AlertCircle className="w-5 h-5 text-[var(--amber)] flex-shrink-0 mt-0.5" />
          <div>
             <h4 className="text-[11px] font-bold text-[var(--amber)] uppercase tracking-widest mb-1.5">
               {isAr ? "مبلغ التطهير التقديري" : "Estimated Purification Amount"}
             </h4>
             <p className="text-sm text-[var(--text2)] leading-relaxed font-medium">
               {isAr 
                 ? "بناءً على المعطيات الحالية، لم يتم الكشف عن إيرادات غير مباحة صريحة في القوائم المالية الموحدة التلقائية. يجب مراجعة المدقق الشرعي للشركة للتحقق النهائي."
                 : "Based on dynamic parsing, no explicit non-permissible baseline revenue was detected. Please consult the company's official Shariah board report for precise final dividend purification metrics."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
