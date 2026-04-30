"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { Info, TrendingUp, ShieldCheck, DollarSign } from "lucide-react";

const DividendAnalysis = () => {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === "ar";

  // Mock dividend data for 2222.SR (Aramco) and fallback
  const history = [
    { year: "2020", amount: 1.24, yield: 3.5 },
    { year: "2021", amount: 1.35, yield: 3.8 },
    { year: "2022", amount: 1.48, yield: 4.2 },
    { year: "2023", amount: 1.62, yield: 4.8 },
    { year: "2024", amount: 1.75, yield: 5.2 },
  ];

  const yieldBenchmark = [
    { name: "Current Ticker", value: 5.2, color: "var(--emerald)" },
    { name: "Sector Avg", value: 3.8, color: "rgba(14,124,105,0.2)" },
    { name: "TASI Avg", value: 3.1, color: "var(--bg2)" },
  ];

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <TrendingUp className="w-4 h-4" />, label: isAr ? "عائد التوزيعات" : "Dividend Yield", value: "5.21%", sub: "+0.45% YoY" },
          { icon: <DollarSign className="w-4 h-4" />, label: isAr ? "آخر توزيع" : "Last Dividend", value: "SAR 0.44", sub: "Q4 2024" },
          { icon: <ShieldCheck className="w-4 h-4" />, label: isAr ? "نسبة التوزيع" : "Payout Ratio", value: "78.4%", sub: "Sustainable" },
          { icon: <Info className="w-4 h-4" />, label: isAr ? "معدل النمو (٥س)" : "Growth Rate (5Y)", value: "8.2%", sub: "CAGR" },
        ].map((card, i) => (
          <div key={i} className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all group">

            <div className="flex items-center gap-3 text-[var(--emerald)] mb-3">
              {card.icon}
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[var(--emerald)]">{card.label}</span>
            </div>
            <div className="text-3xl font-ibm-plex-mono font-bold text-[var(--text1)] mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{card.value}</div>
            <div className="text-[11px] text-[var(--text3)] font-bold uppercase tracking-wider">{card.sub}</div>

          </div>

        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Growth Chart */}
        <div className="col-span-12 lg:col-span-8 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-8 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-serif font-bold text-[var(--text1)] mb-1 uppercase tracking-tight">
                {isAr ? "سجل نمو التوزيعات" : "Dividend Growth History"}
              </h3>
              <p className="text-[10px] text-[var(--text3)] uppercase tracking-[.2em]">{activeTicker} · Annualized Returns</p>

            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-[var(--bg2)] border border-[var(--emerald)]/20 rounded-full text-[9px] text-[var(--emerald)] font-bold uppercase tracking-widest">Premium Insights</span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="divGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="var(--text3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="var(--text3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `SAR ${val}`}
                />
                <Tooltip 
                  contentStyle={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "11px", color: "var(--text1)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
                  itemStyle={{ color: "var(--emerald)", fontWeight: 700 }}
                />


                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="var(--emerald)" 
                  strokeWidth={3} 
                  fill="url(#divGradient)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yield Benchmark */}
        <div className="col-span-12 lg:col-span-4 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-8 flex flex-col shadow-xl">

          <h3 className="text-sm font-semibold text-[var(--text1)] mb-8 uppercase tracking-widest text-center">
            {isAr ? "مقارنة العائد" : "Yield Benchmark"}
          </h3>

          
          <div className="flex-1 flex flex-col justify-center gap-6">
            {yieldBenchmark.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-[var(--text3)] uppercase font-mono tracking-widest">{item.name}</span>
                  <span className="text-[11px] font-bold font-ibm-plex-mono" style={{ color: item.color === "var(--emerald)" ? "var(--emerald)" : "var(--text3)" }}>{item.value}%</span>
                </div>
                <div className="h-2 bg-[var(--bg2)] rounded-full overflow-hidden">

                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / 10) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>

              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-[var(--bg2)] border border-[var(--border)] rounded-xl">
             <div className="text-[11px] text-[var(--emerald)] font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
               <Info className="w-3 h-3" /> {isAr ? "رؤية الفحص" : "Insight"}
             </div>
             <p className="text-[12px] text-[var(--text2)] leading-relaxed font-bold">

               {isAr 
                 ? "هذا السهم يتفوق على متوسط القطاع بنسبة ١.٤٪. تعتبر هذه النسبة مستدامة بناءً على التدفقات النقدية الحرة."
                 : "This ticker outperforms the sector average by 1.4%. Payout levels are sustainable based on FCF coverage."}
             </p>
          </div>
        </div>

        {/* Shariah Purification Table */}
        <div className="col-span-12 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-lg shadow-[rgba(14,124,105,0.02)]">

          <div className="p-8 border-b border-[var(--border)] flex justify-between items-center">
             <h3 className="text-xl font-serif font-bold text-[var(--text1)] uppercase tracking-tight">
               {isAr ? "بيانات التطهير الشرعي" : "Shariah Purification Data"}
             </h3>
             <span className="text-[9px] font-mono tracking-widest text-[var(--emerald)] px-3 py-1 bg-[var(--pos-bg)] border border-[var(--pos)] rounded-full font-bold">AAOIFI COMPLIANT</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg2)] text-[var(--text3)] uppercase tracking-[0.2em] font-mono">

                <th className="px-8 py-4 font-bold border-b border-white/5">{isAr ? "تاريخ الاستحقاق" : "Record Date"}</th>
                <th className="px-8 py-4 font-bold border-b border-white/5">{isAr ? "المبلغ لكل سهم" : "Amt/Share"}</th>
                <th className="px-8 py-4 font-bold border-b border-white/5">{isAr ? "مبلغ التطهير (ر.س)" : "Purification (SAR)"}</th>
                <th className="px-8 py-4 font-bold border-b border-white/5">{isAr ? "صافي التوزيع" : "Net Dividend"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[
                { date: "2024-12-15", amt: 0.44, pur: 0.002, net: 0.438 },
                { date: "2024-09-15", amt: 0.44, pur: 0.002, net: 0.438 },
                { date: "2024-06-15", amt: 0.42, pur: 0.002, net: 0.418 },
                { date: "2024-03-15", amt: 0.42, pur: 0.002, net: 0.418 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[var(--bg2)] transition-colors group">
                  <td className="px-8 py-4 font-mono text-[var(--text2)] group-hover:text-[var(--text1)] group-hover:font-bold transition-all">{row.date}</td>
                  <td className="px-8 py-4 font-ibm-plex-mono text-[var(--text1)] font-bold">SAR {row.amt.toFixed(3)}</td>
                  <td className="px-8 py-5 font-ibm-plex-mono text-[var(--neg)] font-extrabold">{row.pur.toFixed(4)}</td>
                  <td className="px-8 py-5 font-ibm-plex-mono font-extrabold text-[var(--navy)] text-lg">SAR {row.net.toFixed(3)}</td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default DividendAnalysis;
