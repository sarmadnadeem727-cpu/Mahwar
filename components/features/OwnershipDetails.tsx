"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { Users, TrendingUp, ArrowRight, Landmark } from "lucide-react";

const OwnershipDetails = () => {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === "ar";

  // Mock Ownership Data
  const ownershipData = [
    { name: isAr ? "صندوق الاستثمارات العامة" : "PIF", value: 65, color: "var(--emerald)" },
    { name: isAr ? "المؤسسات المحلية" : "Local Inst.", value: 15, color: "rgba(16,185,129,0.4)" },
    { name: isAr ? "المستثمرون الأجانب" : "Foreign Inst.", value: 10, color: "rgba(18,29,56,0.6)" },
    { name: isAr ? "الأفراد" : "Retail", value: 10, color: "var(--bg2)" },
  ];

  const recentChanges = [
    { holder: isAr ? "الحصاد للاستثمار" : "Al-Hassad Invest", type: "Increase", change: "+0.5%", date: "2024-12-01" },
    { holder: isAr ? "تأمينات الاجتماعية" : "GOSI", type: "No Change", change: "0.0%", date: "2024-11-28" },
    { holder: isAr ? "مجموعة الراشد" : "Al-Rashid Group", type: "Decrease", change: "-0.2%", date: "2024-11-15" },
  ];

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      <div className="grid grid-cols-12 gap-8">
        {/* Ownership Structure Chart */}
        <div className="col-span-12 lg:col-span-7 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">

          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-serif font-bold text-[var(--text1)] mb-1 uppercase tracking-tight">
                {isAr ? "هيكل الملكية المؤسسي" : "Institutional Ownership Structure"}
              </h3>
              <p className="text-[10px] text-[var(--text3)] uppercase tracking-[.2em]">{activeTicker} · Major Concentration</p>

            </div>
          </div>

          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ownershipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {ownershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "11px", color: "var(--text1)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
                  itemStyle={{ fontWeight: 700 }}
                />


              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend Overlay for Desktop */}
            <div className="hidden md:flex flex-col gap-4 pr-8">
               {ownershipData.map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                   <div className="flex flex-col">
                     <span className="text-[10px] text-[var(--text1)] font-bold">{item.value}%</span>
                     <span className="text-[9px] text-[var(--text3)] uppercase tracking-wider">{item.name}</span>
                   </div>
                 </div>
               ))}
            </div>

          </div>
        </div>

        {/* Ownership Stats Cards */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
           {[
             { title: isAr ? "تركيز كبار الملاك" : "Top 5 Concentration", value: "85.2%", icon: <Users className="w-4 h-4" /> },
             { title: isAr ? "ملكية الحكومة" : "Govt Ownership", value: "65.0%", icon: <Landmark className="w-4 h-4" /> },
             { title: isAr ? "معدل دوران الملكية" : "Owner Turnover", value: "Low", icon: <TrendingUp className="w-4 h-4" /> },
           ].map((stat, i) => (
             <div key={i} className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between group hover:border-[var(--emerald)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all">

               <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--bg2)] rounded-xl text-[var(--emerald)] group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{stat.icon}</div>
                  <span className="text-xs text-[var(--text2)] font-bold">{stat.title}</span>
               </div>
               <span className="text-xl font-ibm-plex-mono font-bold text-[var(--text1)]">{stat.value}</span>
             </div>

           ))}
        </div>

        {/* Recent Changes Table */}
        <div className="col-span-12 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-lg shadow-[rgba(14,124,105,0.02)]">

          <div className="p-8 border-b border-[var(--border)] flex justify-between items-center">
             <h3 className="text-xl font-serif font-bold text-[var(--text1)] uppercase tracking-tight">
               {isAr ? "تغيرات الملكية الأخيرة (أكثر من ٥٪)" : "Recent Major Ownership Changes (>5%)"}
             </h3>
             <button className="flex items-center gap-2 text-[10px] font-black text-[var(--gold)] uppercase tracking-widest hover:translate-x-1 transition-transform">
               {isAr ? "عرض السجل الكامل" : "View Full History"} <ArrowRight className="w-3 h-3" />
             </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--bg2)] text-[var(--text3)] uppercase tracking-[.2em] font-mono">

                <th className="px-8 py-4">{isAr ? "المساهم" : "Shareholder"}</th>
                <th className="px-8 py-4">{isAr ? "التاريخ" : "Date"}</th>
                <th className="px-8 py-4">{isAr ? "نوع التغير" : "Action"}</th>
                <th className="px-8 py-4 text-right">{isAr ? "التغير" : "Change"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recentChanges.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--bg2)] transition-colors group">
                  <td className="px-8 py-4 font-bold text-[var(--text1)] group-hover:text-[var(--emerald)]">{row.holder}</td>
                  <td className="px-8 py-4 font-mono text-[var(--text2)]">{row.date}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full bg-opacity-10 text-[9px] font-bold border ${
                      row.type === "Increase" ? "bg-emerald-500/10 text-[var(--emerald)] border-[var(--emerald)]/20" : 
                      row.type === "Decrease" ? "bg-red-500/10 text-[var(--neg)] border-[var(--neg)]/20" : 
                      "bg-[var(--bg2)] text-[var(--text3)] border-[var(--border)]"
                    }`}>
                      {row.type.toUpperCase()}
                    </span>
                  </td>
                  <td className={`px-8 py-4 text-right font-ibm-plex-mono font-extrabold ${
                    row.type === "Increase" ? "text-[var(--pos)]" : 
                    row.type === "Decrease" ? "text-[var(--neg)]" : 
                    "text-[var(--text1)]"
                  }`}>
                    {row.change}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnershipDetails;
