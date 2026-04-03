"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Area 
} from "recharts";
import { Settings, Download, Camera, SlidersHorizontal, Activity } from "lucide-react";

const TechnicalCharts = () => {
  const { selectedTicker, language } = useTerminalStore();
  const isAr = language === "ar";
  const [timeframe, setTimeframe] = useState("1D");

  // Mock Candlestick / OHLC Data
  const chartData = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const base = 28 + Math.sin(i / 5) * 2;
      const open = base + (Math.sin(i) * 0.2);
      const close = base + (Math.cos(i) * 0.2);
      const high = Math.max(open, close) + Math.abs(Math.sin(i * 2)) * 0.2;
      const low = Math.min(open, close) - Math.abs(Math.cos(i * 2)) * 0.2;
      return {
        time: i,
        open, high, low, close,
        volume: Math.floor(Math.abs(Math.sin(i)) * 1000000),
        rsi: 40 + Math.abs(Math.cos(i)) * 40,
      };
    });
  }, []);

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">

        <div className="flex items-center gap-2 p-1 bg-[var(--bg2)] border border-[var(--border)] rounded-xl">
          {["1M", "5M", "15M", "1H", "1D", "1W"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                timeframe === tf ? "bg-[var(--emerald)] text-white shadow-md" : "text-[var(--text3)] hover:text-[var(--text1)]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>


        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-[var(--text3)] hover:text-[var(--text1)] cursor-pointer transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{isAr ? "المؤشرات" : "Indicators"}</span>
           </div>
           <div className="h-4 w-[1px] bg-[var(--border)]" />
           <div className="flex gap-2">
             {[<Camera className="w-4 h-4" />, <Download className="w-4 h-4" />, <Settings className="w-4 h-4" />].map((icon, i) => (
               <button key={i} className="p-2 bg-[var(--bg2)] border border-[var(--border)] rounded-lg text-[var(--text3)] hover:text-[var(--emerald)] hover:border-[var(--emerald)] transition-all">
                 {icon}
               </button>
             ))}
           </div>
        </div>

      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Chart Canvas */}
        <div className="col-span-12 lg:col-span-9 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">

           <div className="flex items-center gap-4 mb-8">
              <div className="px-3 py-1 bg-[var(--pos-bg)] border border-[var(--pos)] rounded-full text-[10px] text-[var(--pos)] font-ibm-plex-mono font-bold">
                 LIVE: {selectedTicker}
              </div>
              <h2 className="text-xl font-serif font-bold text-[var(--text1)] uppercase tracking-tight">{isAr ? "الرسم البياني المتقدم" : "Advanced Pro Terminal Chart"}</h2>
           </div>


           <div className="flex-1 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={chartData}>
                 <defs>
                   <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.1" />
                     <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
                 <XAxis dataKey="time" hide />
                 <YAxis 
                   domain={['auto', 'auto']} 
                   orientation={isAr ? "left" : "right"} 
                   stroke="rgba(255,255,255,0.2)" 
                   fontSize={10} 
                   tickLine={false} 
                   axisLine={false} 
                 />
                  <Tooltip 
                    contentStyle={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "11px", color: "var(--text1)", boxShadow: "0 20px 60px rgba(14,124,105,0.05)" }}
                    cursor={{ stroke: 'rgba(14,124,105,0.3)', strokeWidth: 1 }}
                  />
                  {/* Moving Averages */}
                  <Line type="monotone" dataKey="close" stroke="var(--emerald)" strokeWidth={3} dot={false} animationDuration={2000} />
                  <Area type="monotone" dataKey="low" stroke="none" fill="url(#volGradient)" />
                 
                 {/* Volume Bars */}
                 <Bar dataKey="volume" yAxisId={1} fill="rgba(255,255,255,0.05)" />
                 <YAxis yAxisId={1} hide />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Technical Signals Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
           {/* RSI Indicator */}
           <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-6 shadow-xl">

              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--emerald)]">RSI (14)</span>
                <span className="text-xs font-bold text-[var(--pos)]">Neutral</span>
              </div>
              <div className="h-2 bg-[var(--bg2)] rounded-full overflow-hidden relative">
                 <div className="absolute inset-y-0 left-[30%] right-[30%] bg-white/5 border-x border-[var(--border)]" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "58%" }}
                    className="h-full bg-[var(--emerald)] rounded-full"
                  />
              </div>
              <div className="flex justify-between mt-2 font-mono text-[9px] text-[var(--text3)]">
                <span>30</span>
                <span>70</span>
              </div>
           </div>

           {/* Signal Cards */}
           {[
             { label: "EMA (200)", val: "SAR 27.80", status: "BULLISH", color: "text-[var(--pos)]" },
             { label: "MACD", val: "Converging", status: "BUY", color: "text-[var(--pos)]" },
             { label: "Bollinger", val: "Mid Band", status: "HOLD", color: "text-[var(--warn)]" },
           ].map((signal, i) => (
             <div key={i} className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-1 group hover:border-[var(--emerald)] hover:shadow-lg transition-all">

                <span className="text-[9px] uppercase font-mono tracking-widest text-[var(--text3)]">{signal.label}</span>
                <div className="flex justify-between items-end">
                   <span className="text-sm font-bold text-[var(--text1)]">{signal.val}</span>
                   <span className={`text-[10px] font-black tracking-tighter ${signal.color}`}>{signal.status}</span>
                </div>
             </div>
           ))}


           {/* Recommendation Gauge */}
            <div className="bg-[var(--bg1)] border-2 border-[var(--emerald)]/30 rounded-2xl p-6 mt-4 shadow-[0_10px_40px_rgba(14,124,105,0.05)] relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-[var(--emerald)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="flex items-center gap-3 mb-4 relative z-10">
                 <Activity className="w-4 h-4 text-[var(--emerald)]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text1)]">{isAr ? "ملخص الإشارة" : "Analyst Alpha"}</span>
               </div>
               <div className="text-3xl font-serif font-black text-[var(--navy)] mb-1 uppercase tracking-tight relative z-10">Strong Buy</div>
               <p className="text-[12px] text-[var(--text2)] leading-relaxed font-bold relative z-10">
                 {isAr 
                   ? "المؤشرات الفنية تتلاقى نحو اتجاه صعودي قوي مع حجم تداول مؤسسي كثيف."
                   : "Technical indicators converge toward a strong bullish trend with heavy institutional volume."}
               </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalCharts;
