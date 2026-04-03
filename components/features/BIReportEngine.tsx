"use client";

import React, { useState, useMemo } from 'react';
import { useTerminalStore } from '@/store/useTerminalStore';
import { useFX } from '@/hooks/useFX';
import { fmt } from '@/lib/fmt';
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
} from 'recharts';
import { BarChart3, Calculator, TrendingUp, Info } from 'lucide-react';

interface BIReportEngineProps {
  incomeStatementData?: any; 
}

export const BIReportEngine: React.FC<BIReportEngineProps> = ({ incomeStatementData }) => {
  const { currency } = useTerminalStore();
  const { convert } = useFX();
  const [isCommonSize, setIsCommonSize] = useState(false);

  // Derive waterfall data from mock or actual data
  const waterfallData = useMemo(() => {
    const ebitda = 8400;
    const da = -1200;
    const interest = -850;
    const taxes = -420;
    const netIncome = ebitda + da + interest + taxes;

    return [
      { name: 'EBITDA', value: ebitda, type: 'total' },
      { name: 'D&A', value: da, type: 'delta' },
      { name: 'Interest', value: interest, type: 'delta' },
      { name: 'Tax_Zakat', value: taxes, type: 'delta' },
      { name: 'Net_Income', value: netIncome, type: 'total' },
    ].map(item => ({
      ...item,
      displayValue: convert(item.value, 'SAR', currency)
    }));
  }, [currency, convert]);

  return (
    <div className="bg-[#0F172A] border border-[#334155] p-8 flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-[#1E293B] border border-[#334155] flex items-center justify-center">
             <BarChart3 className="text-[#10B981] w-5 h-5" />
           </div>
           <div>
             <h2 className="text-lg font-bold font-mono uppercase tracking-tighter text-[#F8FAFC]">Performance_Attribution_BI</h2>
             <p className="text-[#64748B] text-[10px] font-mono tracking-widest uppercase">EBITDA_TO_NI_WATERFALL • {currency}</p>
           </div>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={() => setIsCommonSize(!isCommonSize)}
             className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all ${
               isCommonSize ? "bg-[#F59E0B] border-[#F59E0B] text-[#020617]" : "border-[#334155] text-[#94A3B8]"
             }`}
           >
             Common_Size (%)
           </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8">
          <div className="h-[350px] w-full bg-[#1E293B]/30 border border-[#334155] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontFamily: 'var(--font-inter)', fontSize: 10, fill: '#64748B' }} 
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#64748B' }}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => fmt.accounting(val)}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0px' }}
                  itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                />
                <Bar dataKey="displayValue" radius={0}>
                  {waterfallData.map((entry, index) => {
                    let color = entry.value >= 0 ? "#10B981" : "#F43F5E";
                    if (entry.type === 'total') color = "#F59E0B";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                  <LabelList 
                    dataKey="displayValue" 
                    position="top" 
                    fill="#F8FAFC" 
                    fontSize={10} 
                    formatter={(val: number) => fmt.accounting(val)} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="col-span-12 xl:col-span-4 space-y-6">
           <div className="bg-[#1E293B] border border-[#334155] p-6">
              <h4 className="text-[10px] font-bold text-[#F8FAFC] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info className="w-3 h-3 text-[#10B981]" />
                BI_INSIGHTS_PROBE
              </h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[11px] font-mono border-b border-[#334155] pb-2">
                   <span className="text-[#64748B]">MAR_EXPANSION</span>
                   <span className="text-[#10B981] font-bold">+2.4%</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px] font-mono border-b border-[#334155] pb-2">
                   <span className="text-[#64748B]">ZAKAT_DRAG</span>
                   <span className="text-red-400 font-bold">-1.1%</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px] font-mono">
                   <span className="text-[#64748B]">FX_IMPACT_HEDGE</span>
                   <span className="text-[#F8FAFC] font-bold">NEUTRAL</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#1E293B] border border-[#334155] p-6">
              <h4 className="text-[10px] font-bold text-[#F8FAFC] uppercase tracking-widest mb-4">LEVERAGE_MONITOR</h4>
              <div className="w-full h-2 bg-[#334155] rounded-full overflow-hidden">
                 <div className="w-[65%] h-full bg-[#10B981]" />
              </div>
              <p className="text-[9px] font-mono text-[#64748B] mt-2">D/E_RATIO: 0.65x (TARGET: 0.80x)</p>
           </div>
        </aside>
      </div>
    </div>
  );
};
