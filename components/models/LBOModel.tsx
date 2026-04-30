"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Briefcase, CreditCard, DollarSign, Calculator, ArrowRightLeft, ChevronRight } from "lucide-react";
import { runLbo, DebtTranche, LboYearInput } from "@/lib/finance/lbo";
import { fmt } from "@/lib/fmt";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useMarketData } from "@/hooks/useMarketData";
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
  const { activeTicker, currency } = useTerminalStore();
  const { convert } = useFX();
  const [tranches, setTranches] = useState<DebtTranche[]>(DEFAULT_TRANCHES);
  
  const { data: globalData, isLoading: fetchLoading } = useMarketData(activeTicker);

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
      className="flex flex-col gap-8 text-zinc-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 p-8 rounded-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-white/10 rounded-lg">
            <Briefcase className="text-zinc-50 w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-zinc-50">Sovereign LBO Engine</h1>
            <p className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase mt-1">
              {activeTicker?.replace(".SR", "") || "---"} • {currency} • TRANSACTION_LEVERAGE_SIMULATOR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-12 bg-white/5 p-6 border border-white/10 rounded-xl">
          <div className="text-right">
            <div className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] mb-1 font-bold">Entry Leverage</div>
            <div className="text-3xl font-mono font-bold text-zinc-50 tracking-tighter">{result.sourcesUses.entryLeverage.toFixed(1)}x</div>
          </div>
          <div className="w-[1px] h-10 bg-white/10" />
          <div className="text-right">
            <div className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] mb-1 font-bold">Projected IRR</div>
            <div className="text-3xl font-mono font-bold text-zinc-50 tracking-tighter">{result.irr}%</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-3">
              <Calculator className="w-4 h-4 text-zinc-400" />
              Deal Architecture
            </h3>
            <div className="space-y-6">
                <div className="flex justify-between border-b border-white/10 pb-3">
                   <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Entry EV</span>
                   <span className="font-mono text-xs text-zinc-50">{fmt.accounting(convert(result.sourcesUses.entryEv, 'SAR'))}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                   <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Equity Check</span>
                   <span className="font-mono text-xs text-zinc-50">{fmt.accounting(convert(result.sourcesUses.equityCheck, 'SAR'))}</span>
                </div>
                <div className="pt-4">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-3">Exit Multiple: <span className="text-zinc-50">{modelState.exitMultiple}x</span></label>
                   <input type="range" min="5" max="15" step="0.5" value={modelState.exitMultiple} 
                     onChange={(e) => setModelState(prev => ({ ...prev, exitMultiple: parseFloat(e.target.value) }))}
                     className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-zinc-400"
                   />
                </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl">
             <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-zinc-400" />
              Debt Tranches
            </h3>
            <div className="space-y-3">
               {tranches.map((t, i) => (
                 <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex justify-between mb-3 items-center">
                       <span className="text-[10px] font-bold uppercase text-zinc-50 tracking-wider">{t.name}</span>
                       <span className="text-[8px] border border-white/10 bg-white/5 px-2 py-0.5 rounded text-zinc-400">{t.type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[8px] uppercase tracking-wider text-zinc-500 block mb-1">Commitment ({currency})</label>
                          <input type="number" value={t.commitment} onChange={e => updateTranche(i, 'commitment', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0a0a0a] border border-white/10 text-xs font-mono p-1.5 text-zinc-50 rounded outline-none focus:border-zinc-500 transition-colors"
                          />
                       </div>
                       <div>
                          <label className="text-[8px] uppercase tracking-wider text-zinc-500 block mb-1">Spread (bps)</label>
                          <input type="number" value={t.spreadBps} onChange={e => updateTranche(i, 'spreadBps', parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#0a0a0a] border border-white/10 text-xs font-mono p-1.5 text-zinc-50 rounded outline-none focus:border-zinc-500 transition-colors"
                          />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </aside>

        <main className="col-span-12 xl:col-span-8 space-y-8">
           <div className="bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
             <table className="w-full text-left text-xs border-collapse">
               <thead>
                 <tr className="bg-white/5 border-b border-white/10">
                    <th className="py-4 px-6 font-bold uppercase tracking-widest text-zinc-500 text-[10px] w-1/3">Debt Service Schedule</th>
                    {result.years.map(y => <th key={y.year} className="py-4 px-6 text-right font-bold uppercase tracking-widest text-zinc-500 text-[10px]">FY {y.year}E</th>)}
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  <TableRow label="EBITDA" values={result.years.map(y => fmt.accounting(convert(y.ebitda, 'SAR')))} />
                  <TableRow label="CFADS" values={result.years.map(y => fmt.accounting(convert(y.cfads, 'SAR')))} isSub />
                  <TableRow label="Mandatory Amortization" values={result.years.map(y => `(${fmt.accounting(convert(y.totA, 'SAR'))})`)} isSub />
                  <TableRow label="Cash Sweep" values={result.years.map(y => `(${fmt.accounting(convert(y.totalSweep, 'SAR'))})`)} isSub />
                  <TableRow label="Closing Debt Balance" values={result.years.map(y => fmt.accounting(convert(y.debtClose, 'SAR')))} isTotal />
               </tbody>
             </table>
           </div>

           <div className="bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 p-8 rounded-xl shadow-2xl">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8">Returns Sensitivity (IRR %)</h3>
               <div className="overflow-x-auto rounded-lg border border-white/10">
                 <table className="w-full text-center border-collapse text-[10px] font-mono">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="p-4 border-r border-white/10 text-left text-zinc-500 uppercase tracking-widest">Year \ Exit Mult</th>
                        {result.exitMultipleRange.map(m => <th key={m} className="p-4 border-r last:border-0 border-white/10 text-zinc-300">{m}x</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {result.returnsSensitivity.map((row, ri) => (
                         <tr key={ri} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 border-r border-white/10 font-bold text-zinc-400 text-left">Yr {row.exitYear}</td>
                            {row.irrs.map((irr, ci) => (
                              <td key={ci} className={`p-4 border-r last:border-0 border-white/10 font-bold ${irr > 20 ? 'text-zinc-50' : 'text-zinc-500'}`}>
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
    <tr className={`transition-colors hover:bg-white/5 ${isTotal ? 'bg-white/5' : ''}`}>
      <td className={`py-4 px-6 text-left ${isSub ? 'pl-10 text-[11px] text-zinc-500' : 'text-[11px] font-bold uppercase tracking-wider text-zinc-300'} ${isTotal ? 'text-zinc-50' : ''}`}>
        {isSub && <span className="mr-2 text-white/20">└</span>}
        {label}
      </td>
      {values.map((v: any, i: number) => (
        <td key={i} className={`py-4 px-6 text-right font-mono text-xs border-l border-white/5 ${isTotal ? 'font-bold text-zinc-50' : 'text-zinc-400'}`}>
          {v}
        </td>
      ))}
    </tr>
  );
}
