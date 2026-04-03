"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Briefcase, CreditCard, DollarSign, Calculator, ArrowRightLeft, ChevronRight } from "lucide-react";
import { runLbo, DebtTranche, LboYearInput } from "@/lib/finance/lbo";
import { fmt } from "@/lib/fmt";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useQuery } from "@tanstack/react-query";
import { fetchInstitutionalData } from "@/lib/services/terminalService";
import { useFX } from "@/hooks/useFX";

const DEFAULT_TRANCHES: DebtTranche[] = [
  { name: "Senior Term Loan A", type: "SENIOR", openingBalance: 400, commitment: 400, spreadBps: 350, benchmarkRate: 0.055, amortPctPa: 0.05, cashSweepPct: 0.7, seniority: 1 },
  { name: "Senior Term Loan B", type: "SENIOR", openingBalance: 200, commitment: 200, spreadBps: 450, benchmarkRate: 0.055, amortPctPa: 0.01, cashSweepPct: 0.2, seniority: 2 },
  { name: "Mezzanine Note", type: "MEZZ", openingBalance: 150, commitment: 150, spreadBps: 800, benchmarkRate: 0.055, amortPctPa: 0, cashSweepPct: 0, seniority: 3 },
];

const DEFAULT_YEARS_LBO: LboYearInput[] = [
  { yearIndex: 1, year: 2025, revenue: 800, ebitdaMargin: 0.25, capex: 40, deltaNwc: 10, taxesZakat: 25 },
  { yearIndex: 2, year: 2026, revenue: 880, ebitdaMargin: 0.26, capex: 44, deltaNwc: 12, taxesZakat: 28 },
  { yearIndex: 3, year: 2027, revenue: 968, ebitdaMargin: 0.27, capex: 48, deltaNwc: 15, taxesZakat: 32 },
  { yearIndex: 4, year: 2028, revenue: 1064, ebitdaMargin: 0.28, capex: 52, deltaNwc: 18, taxesZakat: 36 },
  { yearIndex: 5, year: 2029, revenue: 1170, ebitdaMargin: 0.29, capex: 56, deltaNwc: 20, taxesZakat: 40 },
];

export function LBOModel() {
  const { selectedTicker, currency } = useTerminalStore();
  const { convert } = useFX();
  const [tranches, setTranches] = useState<DebtTranche[]>(DEFAULT_TRANCHES);
  
  const { data: globalData, isLoading: fetchLoading } = useQuery({
    queryKey: ['financialData', selectedTicker],
    queryFn: () => fetchInstitutionalData(selectedTicker),
    staleTime: 5 * 60 * 1000,
  });

  const [modelState, setModelState] = useState({
    years: DEFAULT_YEARS_LBO,
    entryEv: 1200,
    exitMultiple: 8.5
  });

  const result = useMemo(
    () => runLbo(tranches, modelState.years, modelState.entryEv, 200, 20, 5, modelState.exitMultiple),
    [tranches, modelState]
  );

  const updateTranche = (index: number, key: keyof DebtTranche, val: number) => {
    setTranches(prev => {
      const next = [...prev];
      (next[index] as any)[key] = val;
      return next;
    });
  };

  return (
    <motion.div 
      className="flex flex-col gap-8 text-[#F8FAFC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0F172A] border border-[#334155] p-8">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-[#1E293B] flex items-center justify-center border border-[#334155]">
            <Briefcase className="text-[#10B981] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold uppercase tracking-tighter text-[#F8FAFC]">Sovereign LBO Engine</h1>
            <p className="text-[#64748B] text-[10px] font-mono tracking-widest uppercase">
              {selectedTicker.replace(".SR", "")} • {currency} • TRANSACTION_LEVERAGE_SIMULATOR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-12 bg-[#1E293B] p-6 border border-[#334155]">
          <div className="text-right">
            <div className="text-[9px] text-[#64748B] uppercase tracking-[0.2em] mb-1 font-bold">Entry Leverage</div>
            <div className="text-3xl font-mono font-bold text-[#F8FAFC] tracking-tighter">{result.sourcesUses.entryLeverage.toFixed(1)}x</div>
          </div>
          <div className="w-[1px] h-10 bg-[#334155]" />
          <div className="text-right">
            <div className="text-[9px] text-[#64748B] uppercase tracking-[0.2em] mb-1 font-bold">Projected IRR</div>
            <div className="text-3xl font-mono font-bold text-[#10B981] tracking-tighter">{result.irr}%</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-[#0F172A] border border-[#334155] p-6">
            <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <Calculator className="w-4 h-4 text-[#F59E0B]" />
              Deal Architecture
            </h3>
            <div className="space-y-6">
                <div className="flex justify-between border-b border-[#334155] pb-3">
                   <span className="text-[9px] text-[#F8FAFC] font-bold uppercase">Entry EV</span>
                   <span className="font-mono text-xs text-[#F8FAFC]">{fmt.accounting(convert(result.sourcesUses.entryEv, 'SAR', currency))}</span>
                </div>
                <div className="flex justify-between border-b border-[#334155] pb-3">
                   <span className="text-[9px] text-[#94A3B8] font-bold uppercase">Equity Check</span>
                   <span className="font-mono text-xs text-[#10B981]">{fmt.accounting(convert(result.sourcesUses.equityCheck, 'SAR', currency))}</span>
                </div>
                <div className="pt-4">
                   <label className="text-[10px] font-bold text-[#64748B] uppercase block mb-3">Exit Multiple: <span className="text-[#10B981]">{modelState.exitMultiple}x</span></label>
                   <input type="range" min="5" max="15" step="0.5" value={modelState.exitMultiple} 
                     onChange={(e) => setModelState(prev => ({ ...prev, exitMultiple: parseFloat(e.target.value) }))}
                     className="w-full h-1 bg-[#334155] rounded-none appearance-none cursor-pointer accent-[#10B981]"
                   />
                </div>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-[#334155] p-6">
             <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-[#10B981]" />
              Debt Tranches
            </h3>
            <div className="space-y-3">
               {tranches.map((t, i) => (
                 <div key={i} className="p-4 bg-[#1E293B] border border-[#334155]">
                    <div className="flex justify-between mb-3">
                       <span className="text-[10px] font-bold uppercase text-[#F8FAFC]">{t.name}</span>
                       <span className="text-[8px] bg-[#334155] px-1 text-[#94A3B8]">{t.type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[8px] uppercase text-[#64748B] block mb-1">Commitment ({currency})</label>
                          <input type="number" value={t.commitment} onChange={e => updateTranche(i, 'commitment', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0F172A] border border-[#334155] text-xs font-mono p-1 text-[#F8FAFC]"
                          />
                       </div>
                       <div>
                          <label className="text-[8px] uppercase text-[#64748B] block mb-1">Spread (bps)</label>
                          <input type="number" value={t.spreadBps} onChange={e => updateTranche(i, 'spreadBps', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0F172A] border border-[#334155] text-xs font-mono p-1 text-[#F8FAFC]"
                          />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </aside>

        <main className="col-span-12 xl:col-span-8 space-y-8">
           <div className="bg-[#0F172A] border border-[#334155] overflow-hidden">
             <table className="terminal-table">
               <thead>
                 <tr>
                    <th className="w-1/3">Debt Service Schedule</th>
                    {result.years.map(y => <th key={y.year} className="text-right">FY {y.year}E</th>)}
                 </tr>
               </thead>
               <tbody>
                  <TableRow label="EBITDA" values={result.years.map(y => fmt.accounting(convert(y.ebitda, 'SAR', currency)))} />
                  <TableRow label="CFADS" values={result.years.map(y => fmt.accounting(convert(y.cfads, 'SAR', currency)))} isSub />
                  <TableRow label="Mandatory Amortization" values={result.years.map(y => `(${fmt.accounting(convert(y.mandatoryAmort, 'SAR', currency))})`)} isSub />
                  <TableRow label="Cash Sweep" values={result.years.map(y => `(${fmt.accounting(convert(y.cashSweep, 'SAR', currency))})`)} isSub />
                  <TableRow label="Closing Debt Balance" values={result.years.map(y => fmt.accounting(convert(y.debtClose, 'SAR', currency)))} isTotal />
               </tbody>
             </table>
           </div>

           <div className="bg-[#0F172A] border border-[#334155] p-8">
               <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.4em] mb-8">Returns Sensitivity (IRR %)</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-center border-collapse text-[10px] font-mono">
                    <thead>
                      <tr className="bg-[#1E293B]">
                        <th className="p-3 border border-[#334155] text-left text-[#94A3B8]">Year \ Exit Mult</th>
                        {result.exitMultipleRange.map(m => <th key={m} className="p-3 border border-[#334155] text-[#F8FAFC]">{m}x</th>)}
                      </tr>
                    </thead>
                    <tbody>
                       {result.returnsSensitivity.map((row, ri) => (
                         <tr key={ri} className="hover:bg-[#1E293B]">
                            <td className="p-3 border border-[#334155] font-bold text-[#94A3B8] text-left">Yr {row.exitYear}</td>
                            {row.irrs.map((irr, ci) => (
                              <td key={ci} className={`p-3 border border-[#334155] ${irr > 20 ? 'text-[#10B981]' : 'text-red-400'}`}>
                                {irr}%
                              </td>
                            ))}
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
           </div>
        </main>
      </div>
    </motion.div>
  );
}

function TableRow({ label, values, isSub, isTotal }: any) {
  return (
    <tr className={`border-b border-[#334155] transition-colors hover:bg-[#1E293B] ${isTotal ? 'bg-[#1E293B]/50' : ''}`}>
      <td className={`py-4 px-6 text-left ${isSub ? 'pl-10 text-[11px] text-[#64748B] italic' : 'text-[12px] font-bold uppercase text-[#F8FAFC]'} ${isTotal ? 'text-[#10B981]' : ''}`}>
        {isSub && <span className="mr-2">└</span>}
        {label}
      </td>
      {values.map((v: any, i: number) => (
        <td key={i} className={`py-4 px-6 text-right font-mono text-xs border-l border-[#334155] ${isTotal ? 'font-bold' : ''}`}>
          {v}
        </td>
      ))}
    </tr>
  );
}
