"use client";

import React, { useEffect } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useMarketData } from "@/hooks/useMarketData";
import { DollarSign, Activity, Percent, Briefcase } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 2 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
  const spring = useSpring(0, { bounce: 0, duration: 1000 });
  const display = useTransform(spring, (current) => prefix + current.toFixed(decimals) + suffix);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function MetricCards() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === "ar";
  
  const { data: globalData, isLoading } = useMarketData(activeTicker);
  
  if (isLoading) {
    return (
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-xl animate-pulse backdrop-blur-xl">
            <div className="h-3 bg-white/10 rounded mb-4 w-24"></div>
            <div className="h-8 bg-white/10 rounded mb-3 w-32"></div>
            <div className="h-2 bg-white/10 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!globalData || !globalData.quote) {
    return (
      <div className="col-span-12 bg-[#0a0a0a]/50 border border-white/10 p-8 rounded-xl text-center flex items-center justify-center flex-col backdrop-blur-xl">
        <Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
        <p className="text-zinc-400 font-semibold">{isAr ? "ابحث عن شركة لبدء التحليل" : "Search for a company to begin analysis"}</p>
        <p className="text-zinc-600 text-sm">{isAr ? "اختر من القائمة أو ابحث" : "Use the universal search above"}</p>
      </div>
    );
  }
  
  const quote = globalData.quote;
  
  const currentPrice = quote.regularMarketPrice || 0;
  const change = quote.regularMarketChange || 0;
  const changePercent = quote.regularMarketChangePercent || 0;
  const marketCap = quote.marketCap || 0;

  const formatMarketCap = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    return num.toLocaleString();
  };

  const metrics = [
    {
      label: isAr ? 'السعر الحالي' : 'Current Price',
      value: currentPrice,
      icon: DollarSign,
      positive: true,
      neutral: true,
      content: <AnimatedNumber value={currentPrice} decimals={2} />
    },
    {
      label: isAr ? 'التغير (يومي)' : 'Day Change',
      value: change,
      icon: Activity,
      positive: change >= 0,
      content: <AnimatedNumber value={Math.abs(change)} prefix={change >= 0 ? "+" : "-"} decimals={2} />
    },
    {
      label: isAr ? 'التغير (%)' : 'Change (%)',
      value: changePercent,
      icon: Percent,
      positive: changePercent >= 0,
      content: <AnimatedNumber value={Math.abs(changePercent)} prefix={changePercent >= 0 ? "+" : "-"} suffix="%" decimals={2} />
    },
    {
      label: isAr ? 'القيمة السوقية' : 'Market Cap',
      value: marketCap,
      icon: Briefcase,
      positive: true,
      neutral: true,
      content: <span>{formatMarketCap(marketCap)}</span>
    },
  ];
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" 
      dir={isAr ? "rtl" : "ltr"}
    >
      {metrics.map((metric, i) => (
        <motion.div 
          key={i} 
          variants={itemVariants}
          className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-6 relative overflow-hidden backdrop-blur-xl transition-all hover:bg-white/5 group"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{metric.label}</span>
            <div className={`p-1.5 rounded-lg ${metric.neutral ? 'bg-zinc-800/30' : metric.positive ? 'bg-emerald-950/30' : 'bg-rose-950/30'}`}>
              <metric.icon className={`w-4 h-4 ${metric.neutral ? 'text-zinc-400' : metric.positive ? 'text-emerald-400' : 'text-rose-400'}`} />
            </div>
          </div>
          
          <div className={`font-sans text-3xl font-bold tracking-tight relative z-10 mb-2 ${metric.neutral ? 'text-zinc-50' : metric.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
             {metric.content}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
