"use client";

import React from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useMarketData } from "@/hooks/useMarketData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function HistoricalChart() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === "ar";
  
  const { data: globalData, isLoading } = useMarketData(activeTicker);
  
  if (isLoading) {
    return (
      <div className="col-span-12 lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-xl p-8 h-80 flex items-center justify-center relative overflow-hidden animate-pulse">
        <div className="text-zinc-500 flex items-center gap-3">
           <div className="w-5 h-5 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
           {isAr ? "جاري تحميل السجل التاريخي..." : "Loading price history..."}
        </div>
      </div>
    );
  }
  
  if (!globalData || !globalData.history || globalData.history.length === 0) {
    return (
      <div className="col-span-12 lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-xl p-8 h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-2 font-bold">{isAr ? "لا توجد بيانات متاحة" : "No data available"}</p>
          <p className="text-xs text-zinc-600">{isAr ? "ابحث عن شركة لعرض الأداء" : "Search for a ticker to view price history"}</p>
        </div>
      </div>
    );
  }
  
  // Format data for Recharts (Yahoo finance historical data)
  const chartData = globalData.history
    .map((point: any) => ({
      date: new Date(point.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' }),
      price: point.close || point.adjClose || 0,
    }))
    .filter((p: any) => p.price > 0);
  
  const currentPrice = globalData.quote?.regularMarketPrice || 0;
  const change = globalData.quote?.regularMarketChange || 0;
  const changePerc = globalData.quote?.regularMarketChangePercent || 0;

  return (
    <div className="col-span-12 lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-xl p-8 relative overflow-hidden transition-all hover:bg-zinc-900 group">
      <div className="flex justify-between items-start mb-8 relative z-10" dir={isAr ? "rtl" : "ltr"}>
        <div>
          <h2 className="text-xl font-serif font-bold text-zinc-100 mb-1 flex items-center gap-3">
             {isAr ? "الأداء التاريخي" : "Historical Performance"}
             <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] text-zinc-300 font-mono uppercase tracking-widest font-bold">
                 {isAr ? "مباشر 1س" : "1Y LIVE"}
             </div>
          </h2>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.1em]">{activeTicker}</p>
        </div>
        
        <div className={`text-${isAr ? "left" : "right"}`}>
          <div className="text-[10px] text-zinc-500 mb-1 font-bold uppercase tracking-widest">{isAr ? "السعر الحالي" : "Current Quote"}</div>
          <div className="text-2xl font-bold font-mono text-zinc-100 leading-none">{currentPrice.toFixed(2)}</div>
          <div className={`text-xs font-mono font-bold mt-1 ${change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)} ({changePerc.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      <div className="h-[260px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              stroke="#52525b" // zinc-600
              tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 600 }} // zinc-400
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#52525b"
              tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val.toFixed(0)}`}
              domain={['auto', 'auto']}
              orientation="right"
              width={40}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "#18181b", // zinc-900
                border: "1px solid #27272a", // zinc-800
                borderRadius: "8px",
                color: "#f4f4f5", // zinc-100
                fontWeight: 600,
                fontSize: "12px",
                fontFamily: "monospace"
              }}
              itemStyle={{ color: "#d4d4d8" }} // zinc-300
              formatter={(value: number) => [`${value.toFixed(2)}`, isAr ? "السعر" : "Close"]}
              labelStyle={{ color: "#71717a", marginBottom: "4px" }} // zinc-500
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#71717a" // zinc-500 muted professional color
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#e4e4e7", stroke: "#18181b", strokeWidth: 2 }} // zinc-200 and zinc-900
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
