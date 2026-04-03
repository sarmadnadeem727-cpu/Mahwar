"use client";

import React from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { translations } from "@/lib/i18n";

export function HistoricalChart() {
  const { data, isLoading, language } = useTerminalStore();
  const t = translations[language];
  const isAr = language === "ar";
  
  if (isLoading) {
    return (
      <div className="col-span-12 lg:col-span-8 terminal-card p-8 h-80 flex items-center justify-center bg-[var(--bg1)] backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.03] blur-[100px] pointer-events-none" />
        <div className="text-[var(--text3)] flex items-center gap-3">
           <div className="w-5 h-5 border-2 border-[var(--text3)] border-t-[var(--accent)] rounded-full animate-spin" />
           {isAr ? "جاري تحميل السجل التاريخي..." : "Loading price history..."}
        </div>
      </div>
    );
  }
  
  if (!data || !data.historical || data.historical.length === 0) {
    return (
      <div className="col-span-12 lg:col-span-8 terminal-card p-8 h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text2)] mb-2 font-bold">{isAr ? "لا توجد بيانات متاحة" : "No data available"}</p>
          <p className="text-xs text-[var(--text3)]">{isAr ? "ابحث عن شركة لعرض الأداء" : "Search for a ticker to view price history"}</p>
        </div>
      </div>
    );
  }
  
  // Format data for Recharts (limit to ~252 trading days for 1 yr)
  const chartData = data.historical
    .slice(-252)
    .map((point: any) => ({
      date: new Date(point.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' }),
      price: point.close,
    }));
  
  return (
    <div className="col-span-12 lg:col-span-8 terminal-card p-8 relative overflow-hidden border border-[var(--border)] shadow-sm hover:shadow-lg transition-all">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.03] blur-[100px] pointer-events-none" />

      <div className="flex justify-between items-start mb-8 relative z-10" dir={isAr ? "rtl" : "ltr"}>
        <div>
          <h2 className="text-xl font-serif font-bold text-[var(--text1)] mb-1 flex items-center gap-3">
             {isAr ? "الأداء التاريخي" : "Historical Performance"}
             <div className="px-3 py-1 bg-[var(--pos-bg)] border border-[var(--pos)]/30 rounded-full text-[10px] text-[var(--pos)] font-mono uppercase tracking-widest font-bold">
                 {isAr ? "مباشر 1س" : "1Y LIVE"}
             </div>
          </h2>
          <p className="text-xs text-[var(--accent)] font-bold uppercase tracking-[0.1em]">{data.ticker}</p>
        </div>
        
        <div className={`text-${isAr ? "left" : "right"}`}>
          <div className="text-[10px] text-[var(--text3)] mb-1 font-bold uppercase tracking-widest">{isAr ? "السعر الحالي" : "Current Quote"}</div>
          <div className="text-2xl font-bold font-mono text-[var(--text1)] leading-none">${data.price.toFixed(2)}</div>
          <div className={`text-xs font-mono font-bold mt-1 ${data.change >= 0 ? "text-[var(--pos)]" : "text-[var(--neg)]"}`}>
            {data.change >= 0 ? "▲" : "▼"} {Math.abs(data.change).toFixed(2)} ({data.changePerc.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      <div className="h-[260px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              stroke="var(--text3)"
              tick={{ fill: "var(--text3)", fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="var(--text3)"
              tick={{ fill: "var(--text3)", fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val.toFixed(0)}`}
              domain={['auto', 'auto']}
              orientation="right"
              width={40}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text1)",
                fontWeight: 600,
                fontSize: "12px",
                fontFamily: "var(--font-mono)"
              }}
              itemStyle={{ color: "var(--accent)" }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, isAr ? "السعر" : "Close"]}
              labelStyle={{ color: "var(--text3)", marginBottom: "4px" }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="var(--accent)" 
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "var(--accent)", stroke: "var(--bg1)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
