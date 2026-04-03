"use client";

import React from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { translations } from "@/lib/i18n";

export function MetricCards() {
  const { data, isLoading, language } = useTerminalStore();
  const t = translations[language];
  const isAr = language === "ar";
  
  if (isLoading) {
    return (
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="terminal-card p-6 animate-pulse">
            <div className="h-3 bg-[var(--bg3)] rounded mb-4 w-24"></div>
            <div className="h-8 bg-[var(--bg2)] rounded mb-3 w-32"></div>
            <div className="h-2 bg-[var(--bg3)] rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="col-span-12 terminal-card p-8 text-center flex items-center justify-center flex-col shadow-sm">
        <Activity className="w-12 h-12 text-[var(--bg3)] mx-auto mb-4" />
        <p className="text-[var(--text2)] font-semibold">{isAr ? "ابحث عن شركة لبدء التحليل" : "Search for a company to begin analysis"}</p>
        <p className="text-[var(--text3)] text-sm">{isAr ? "اختر من القائمة أو ابحث" : "Use the universal search above"}</p>
      </div>
    );
  }
  
  const metrics = [
    {
      label: isAr ? 'نمو الإيرادات' : 'Revenue Growth',
      value: `${data.metrics.revenueGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      positive: data.metrics.revenueGrowth >= 0,
    },
    {
      label: isAr ? 'هامش الربح التشغيلي' : 'EBITDA Margin',
      value: `${data.metrics.ebitdaMargin.toFixed(1)}%`,
      icon: DollarSign,
      positive: data.metrics.ebitdaMargin >= 0,
    },
    {
      label: isAr ? 'العائد على حقوق المساهمين' : 'Return on Equity',
      value: `${data.metrics.roe.toFixed(1)}%`,
      icon: Activity,
      positive: data.metrics.roe >= 0,
    },
    {
      label: isAr ? 'الديون إلى الأصول' : 'Debt / Assets',
      value: `${data.shariah.ratios.debt.toFixed(1)}%`,
      icon: TrendingDown,
      positive: data.shariah.ratios.debt < 33,
    },
  ];
  
  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" dir={isAr ? "rtl" : "ltr"}>
      {metrics.map((metric, i) => (
        <div key={i} className="terminal-card p-6 group hover:border-[var(--accent-border)] hover:shadow-lg transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--accent)] opacity-0 group-hover:opacity-[0.03] rounded-full blur-xl transition-all" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="metric-label tracking-widest font-bold">{metric.label}</span>
            <div className={`p-1.5 rounded-lg ${metric.positive ? 'bg-[var(--pos-bg)]' : 'bg-[var(--neg-bg)]'}`}>
              <metric.icon className={`w-4 h-4 ${metric.positive ? 'text-[var(--pos)]' : 'text-[var(--neg)]'}`} />
            </div>
          </div>
          
          <div className="metric-value tracking-tight relative z-10 mb-3">{metric.value}</div>
          
          <div className="h-1 bg-[var(--bg2)] rounded-full overflow-hidden relative z-10">
            <div 
              className={`h-full transition-all duration-1000 ${metric.positive ? 'bg-[var(--pos)]' : 'bg-[var(--neg)]'}`}
              style={{ width: `${Math.min(Math.abs(parseFloat(metric.value)), 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
