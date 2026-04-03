"use client";

import React, { useState } from 'react';
import { useTerminalStore } from '@/store/useTerminalStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface BIReportEngineProps {
  incomeStatementData: any[]; // Placeholder for actual typed data structure
}

export const BIReportEngine: React.FC<BIReportEngineProps> = ({ incomeStatementData }) => {
  const { currency } = useTerminalStore();
  const [isCommonSize, setIsCommonSize] = useState(false);
  const [showYoYGrowth, setShowYoYGrowth] = useState(false);

  // Mock Audit Trail calculation (EBITDA -> Net Income)
  const ebitda = 1200;
  const da = -150;
  const interest = -80;
  const preZakatIncome = ebitda + da + interest;
  
  // ZATCA Zakat calculation: (Equity + Long-term Liab - Non-current Assets) * 0.025
  const equity = 5000;
  const longTermLiab = 2000;
  const nonCurrentAssets = 3000;
  const zakatBase = equity + longTermLiab - nonCurrentAssets;
  const zakatExpense = -(zakatBase * 0.025); // -100
  
  const netIncome = preZakatIncome + zakatExpense;

  // Recharts Waterfall Bridge Data
  const waterfallData = [
    { name: 'EBITDA', value: ebitda },
    { name: 'D&A', value: da },
    { name: 'Interest', value: interest },
    { name: 'Zakat', value: zakatExpense },
    { name: 'Net Income', value: netIncome },
  ];

  return (
    <div className="terminal-card p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-inter text-[var(--text1)]">
          BI Reporting & Analytics <span className="text-[var(--text3)] text-sm">({currency})</span>
        </h2>
        <div className="flex gap-4">
          <button 
            className="btn-secondary text-sm font-semibold" 
            onClick={() => setIsCommonSize(!isCommonSize)}
          >
            {isCommonSize ? 'Disable Common-Size (%)' : 'Enable Common-Size (%)'}
          </button>
          <button 
            className="btn-secondary text-sm font-semibold" 
            onClick={() => setShowYoYGrowth(!showYoYGrowth)}
          >
            {showYoYGrowth ? 'Hide YoY (%)' : 'Show YoY (%)'}
          </button>
        </div>
      </div>

      <div className="h-80 w-full mt-4 flex flex-col pt-4 border-t border-[var(--border)]">
        <h3 className="section-header mb-4">EBITDA to Net Income Bridge</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontFamily: 'var(--font-inter)', fontSize: 12, fill: 'var(--text2)' }} />
            <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 12, fill: 'var(--text2)' }} />
            <Tooltip 
              cursor={{ fill: 'var(--bg2)' }}
              contentStyle={{ backgroundColor: 'var(--bg1)', borderColor: 'var(--border)', borderRadius: '8px' }}
              itemStyle={{ fontFamily: 'JetBrains Mono' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {waterfallData.map((entry, index) => {
                let color = entry.value >= 0 ? "var(--pos)" : "var(--neg)";
                if (entry.name === 'EBITDA' || entry.name === 'Net Income') color = "var(--accent)";
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Table segment using conditional isCommonSize / showYoYGrowth render logic */}
      <div className="p-4 bg-[var(--bg2)] border border-[var(--border)] rounded text-sm text-[var(--text2)] font-inter">
        Table View: Toggle Common-Size {isCommonSize ? 'ON' : 'OFF'} | YoY {showYoYGrowth ? 'ON' : 'OFF'}
      </div>
    </div>
  );
};
