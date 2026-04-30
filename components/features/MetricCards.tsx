"use client";

import React, { useEffect, useState } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useMarketData } from "@/hooks/useMarketData";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { bounce: 0, duration: 1000 });
  const display = useTransform(spring, (current) => current.toFixed(1) + "%");

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function MetricCards() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === "ar";
  
  const { data: globalData, isLoading } = useMarketData(activeTicker);
  
  if (isLoading) {
    return (
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl animate-pulse">
            <div className="h-3 bg-zinc-900 rounded mb-4 w-24"></div>
            <div className="h-8 bg-zinc-900 rounded mb-3 w-32"></div>
            <div className="h-2 bg-zinc-900 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!globalData || !globalData.fundamentals) {
    return (
      <div className="col-span-12 bg-zinc-950 border border-zinc-800 p-8 rounded-xl text-center flex items-center justify-center flex-col">
        <Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
        <p className="text-zinc-400 font-semibold">{isAr ? "ابحث عن شركة لبدء التحليل" : "Search for a company to begin analysis"}</p>
        <p className="text-zinc-600 text-sm">{isAr ? "اختر من القائمة أو ابحث" : "Use the universal search above"}</p>
      </div>
    );
  }
  
  const financials = globalData.fundamentals;
  const keyStats = financials.keyStatistics || {};
  const finData = financials.financialData || {};
  
  // Safe math mapping
  const revenueGrowth = finData.revenueGrowth ? finData.revenueGrowth * 100 : 0;
  const ebitdaMargin = finData.ebitdaMargins ? finData.ebitdaMargins * 100 : 0;
  const roe = finData.returnOnEquity ? finData.returnOnEquity * 100 : 0;
  const debtToAssets = (finData.totalDebt && finData.totalAssets) ? (finData.totalDebt / finData.totalAssets) * 100 : 0;

  const metrics = [
    {
      label: isAr ? 'نمو الإيرادات' : 'Revenue Growth',
      value: revenueGrowth,
      icon: TrendingUp,
      positive: revenueGrowth >= 0,
    },
    {
      label: isAr ? 'هامش الربح التشغيلي' : 'EBITDA Margin',
      value: ebitdaMargin,
      icon: DollarSign,
      positive: ebitdaMargin >= 0,
    },
    {
      label: isAr ? 'العائد على حقوق المساهمين' : 'Return on Equity',
      value: roe,
      icon: Activity,
      positive: roe >= 0,
    },
    {
      label: isAr ? 'الديون إلى الأصول' : 'Debt / Assets',
      value: debtToAssets,
      icon: TrendingDown,
      positive: debtToAssets < 33, // Simple shariah rule of thumb
    },
  ];
  
  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" dir={isAr ? "rtl" : "ltr"}>
      {metrics.map((metric, i) => (
        <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 relative overflow-hidden transition-all hover:bg-zinc-900 group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{metric.label}</span>
            <div className={`p-1.5 rounded-lg ${metric.positive ? 'bg-emerald-950/30' : 'bg-red-950/30'}`}>
              <metric.icon className={`w-4 h-4 ${metric.positive ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
          </div>
          
          <div className="font-sans text-2xl font-bold tracking-tight text-zinc-100 relative z-10 mb-4">
             <AnimatedNumber value={metric.value} />
          </div>
          
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden relative z-10">
            <div 
              className={`h-full transition-all duration-1000 ${metric.positive ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(Math.abs(metric.value), 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
