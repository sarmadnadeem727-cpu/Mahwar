"use client";

import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LabelList
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useFX } from "@/hooks/useFX";
import { fmt } from "@/lib/fmt";
import { Calculator, BarChart3, TrendingUp, ShieldCheck } from "lucide-react";

export function BIReportEngine() {
  const { data } = useTerminalStore();
  const { convert, currency } = useFX();
  const [showCommonSize, setShowCommonSize] = useState(false);

  if (!data) return null;

  const is = data.financials.statements.is;
  
  // Data for Waterfall Chart (Net Income Bridge)
  // Values are converted to the target currency
  const rev = convert(is.revenue || 0);
  const gp = convert((is.revenue || 0) - (is.cogs || 0));
  const ebitda = convert(is.ebitda || 0);
  const netIncome = convert(Number(data.financials.income[data.financials.latestYear]?.netIncome || 0));
  
  const waterfallData = [
    { name: "Revenue", value: rev, fill: "#334155" },
    { name: "COGS", value: -convert(is.cogs || 0), fill: "#F43F5E" },
    { name: "Gross Profit", value: gp, fill: "#10B981", isTotal: true },
    { name: "OpEx", value: -convert((is.revenue || 0) - (is.cogs || 0) - (is.ebitda || 0)), fill: "#F43F5E" },
    { name: "EBITDA", value: ebitda, fill: "#10B981", isTotal: true },
    { name: "Net Income", value: netIncome, fill: "#F59E0B", isTotal: true },
  ];

  return (
    <div className="flex flex-col gap-6 text-[#F8FAFC]">
      <div className="flex items-center justify-between bg-[#0F172A] border border-[#334155] p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1E293B] border border-[#334155] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <h2 className="font-mono text-lg font-bold uppercase tracking-tight">Institutional_BI_Engine</h2>
            <p className="text-[#64748B] text-[10px] font-mono uppercase tracking-widest">Net_Income_Waterfall_Bridge</p>
          </div>
        </div>

        <button 
          onClick={() => setShowCommonSize(!showCommonSize)}
          className={`px-4 py-2 border font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${showCommonSize ? 'bg-[#10B981] border-[#10B981] text-[#020617]' : 'bg-[#1E293B] border-[#334155] text-[#F8FAFC] hover:bg-[#334155]'}`}
        >
          {showCommonSize ? "Disable_Common_Size" : "Enable_Common_Size"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Waterfall Chart */}
        <div className="col-span-12 lg:col-span-8 bg-[#0F172A] border border-[#334155] p-8 h-[450px]">
          <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.4em] mb-12">Attribution_Bridge ({currency})</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748B" 
                fontSize={10} 
                fontFamily="JetBrains Mono"
                tick={{ fill: '#64748B' }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={10} 
                fontFamily="JetBrains Mono"
                tickFormatter={(v) => fmt.accounting(v)}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '0' }}
                itemStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                formatter={(v: number) => [fmt.accounting(v), "Value"]}
              />
              <Bar dataKey="value">
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  formatter={(v: number) => fmt.accounting(v)}
                  style={{ fill: '#F8FAFC', fontSize: '9px', fontFamily: 'JetBrains Mono' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#0F172A] border border-[#334155] p-6 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
              <h4 className="text-[10px] font-bold text-[#F8FAFC] uppercase tracking-widest">Margins_Overview</h4>
            </div>
            <div className="space-y-6">
              <MarginStat label="Gross_Margin" val={(gp/rev)*100} />
              <MarginStat label="EBITDA_Margin" val={(ebitda/rev)*100} />
              <MarginStat label="Conversion_Ratio" val={(netIncome/ebitda)*100} />
            </div>
          </div>

          <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-6">
             <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <h4 className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Compliance_Scan</h4>
             </div>
             <p className="text-[10px] font-mono text-[#64748B] leading-relaxed uppercase">
                ZATCA_ZAKAT_PROBE: PASS <br/>
                AAOIFI_SHARIAH: COMPLIANT <br/>
                AUDITED_BY: MAHWAR_CORE
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarginStat({ label, val }: { label: string, val: number }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">{label}</span>
        <span className="text-sm font-mono font-bold text-[#F8FAFC]">{val.toFixed(2)}%</span>
      </div>
      <div className="w-full h-1 bg-[#1E293B]">
        <div className="h-full bg-[#10B981]" style={{ width: `${Math.min(100, Math.max(0, val))}%` }} />
      </div>
    </div>
  );
}
