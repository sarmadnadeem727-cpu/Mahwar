"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Briefcase, CreditCard, DollarSign } from "lucide-react";
import { runLbo, DebtTranche, LboYearInput } from "@/lib/finance/lbo";
import { fmt } from "@/lib/fmt";
import { useTerminalStore } from "@/store/useTerminalStore";

const DEFAULT_TRANCHES: DebtTranche[] = [
  {
    name: "Senior Term Loan A",
    type: "SENIOR",
    openingBalance: 400,
    commitment: 400,
    spreadBps: 350,
    benchmarkRate: 0.055,
    amortPctPa: 0.05,
    cashSweepPct: 0.7,
    seniority: 1,
  },
  {
    name: "Senior Term Loan B",
    type: "SENIOR",
    openingBalance: 200,
    commitment: 200,
    spreadBps: 450,
    benchmarkRate: 0.055,
    amortPctPa: 0.01,
    cashSweepPct: 0.2,
    seniority: 2,
  },
  {
    name: "Mezzanine Note",
    type: "MEZZ",
    openingBalance: 150,
    commitment: 150,
    spreadBps: 800,
    benchmarkRate: 0.055,
    amortPctPa: 0,
    cashSweepPct: 0,
    seniority: 3,
  },
];

const DEFAULT_YEARS_LBO: LboYearInput[] = [
  { yearIndex: 1, year: 2025, revenue: 800, ebitdaMargin: 0.25, capex: 40, deltaNwc: 10, taxesZakat: 25 },
  { yearIndex: 2, year: 2026, revenue: 880, ebitdaMargin: 0.26, capex: 44, deltaNwc: 12, taxesZakat: 28 },
  { yearIndex: 3, year: 2027, revenue: 968, ebitdaMargin: 0.27, capex: 48, deltaNwc: 15, taxesZakat: 32 },
  { yearIndex: 4, year: 2028, revenue: 1064, ebitdaMargin: 0.28, capex: 52, deltaNwc: 18, taxesZakat: 36 },
  { yearIndex: 5, year: 2029, revenue: 1170, ebitdaMargin: 0.29, capex: 56, deltaNwc: 20, taxesZakat: 40 },
];

export function LBOModel() {
  const { data: globalData } = useTerminalStore();
  const [tranches, setTranches] = useState<DebtTranche[]>(DEFAULT_TRANCHES);
  
  // Model state grouped to minimize effects
  const [modelState, setModelState] = useState({
    years: DEFAULT_YEARS_LBO,
    entryEv: 1200,
    exitMultiple: 8.5
  });

  const hasSyncedRef = useRef(false);

  // Auto-populate from global stock data
  useEffect(() => {
    if (globalData && !hasSyncedRef.current) {
      const timer = setTimeout(() => {
        const income = globalData.financials.income || {};
        const sortedYears = Object.keys(income).sort().reverse();
        const latest = (income[sortedYears[0]] || {}) as Record<string, number | string>;
        
        const newEntryEv = Math.round((globalData.mktCap || 1200000000) / 1000000);
        const revenueGrowth = typeof globalData.metrics.revenueGrowth === 'string' ? parseFloat(globalData.metrics.revenueGrowth) : (globalData.metrics.revenueGrowth || 8);
        const ebitdaMargin = typeof globalData.metrics.ebitdaMargin === 'string' ? parseFloat(globalData.metrics.ebitdaMargin) : (globalData.metrics.ebitdaMargin || 25);
        
        const rawRevenue = latest.totalRevenue;
        const latestRevenue = typeof rawRevenue === 'string' ? parseFloat(rawRevenue) : (typeof rawRevenue === 'number' ? rawRevenue : 1000);
        
        const pe = typeof globalData.metrics.pe === 'string' ? parseFloat(globalData.metrics.pe) : (globalData.metrics.pe || 15);

        const newYears: LboYearInput[] = Array.from({ length: 5 }).map((_, i) => {
          const growth = 1 + (revenueGrowth / 100) * (i + 1);
          return {
            yearIndex: i + 1,
            year: 2025 + i,
            revenue: Math.round(latestRevenue * growth),
            ebitdaMargin: ebitdaMargin / 100,
            capex: Math.round(latestRevenue * 0.05),
            deltaNwc: 10,
            taxesZakat: 25
          };
        });

        setModelState({
          years: newYears,
          entryEv: newEntryEv,
          exitMultiple: Math.round(pe / 2) || 8.5
        });
        
        hasSyncedRef.current = true;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [globalData]);

  const result = useMemo(
    () => runLbo(tranches, modelState.years, modelState.entryEv, 200, 20, 5, modelState.exitMultiple),
    [tranches, modelState]
  );

  const setExitMultiple = useCallback((m: number) => {
    setModelState(prev => ({ ...prev, exitMultiple: m }));
  }, []);

  const updateTranche = (index: number, key: keyof DebtTranche, val: number) => {
    setTranches(prev => {
      const next = [...prev];
      (next[index] as any)[key] = val;
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-10 p-8 pb-32 max-w-[1600px] mx-auto text-[var(--text1)] bg-[var(--void)]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[var(--bg1)] border border-[var(--border)] p-10 rounded-[2.5rem] shadow-[0_15px_40px_rgba(14,124,105,0.05)] relative overflow-hidden group">


        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg2)] flex items-center justify-center border border-[var(--border)] shadow-sm">
            <Briefcase className="text-[var(--emerald)] w-8 h-8" />
          </div>
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--text1)] mb-1 leading-tight">
              Sovereign LBO Engine
            </h1>
            <p className="text-[var(--text3)] text-xs font-ibm-plex-mono font-bold uppercase tracking-[0.2em] opacity-80">
              Transaction Structuring • Debt Sculpting • Returns Analysis
            </p>
          </div>
        </div>


        <div className="flex items-center gap-8 bg-[var(--bg2)] p-6 rounded-2xl border border-[var(--border)] relative z-10 shadow-inner">
          <div className="text-center px-8 border-r border-[var(--border)]">
            <div className="text-[10px] text-[var(--text3)] uppercase tracking-[0.25em] mb-2 font-ibm-plex-mono font-bold">Entry Leverage</div>
            <div className="text-4xl font-mono font-bold text-[var(--navy)] tracking-tighter">{result.sourcesUses.entryLeverage.toFixed(1)}x</div>
          </div>
          <div className="text-center px-8">
            <div className="text-[10px] text-[var(--text3)] uppercase tracking-[0.25em] mb-2 font-ibm-plex-mono font-bold">Projected IRR</div>
            <div className="text-4xl font-mono font-bold text-[var(--emerald)] tracking-tighter">{result.irr}%</div>
          </div>
        </div>


      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <section className="xl:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-8 shadow-[0_10px_30px_rgba(14,124,105,0.03)]">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--navy)] mb-10 flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[var(--emerald)]" /> Transaction Uses
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm py-4 border-b border-[var(--border)]">
                  <span className="text-[var(--text3)] uppercase tracking-wider text-[10px] font-bold">Purchase of Equity (EV)</span>
                  <span className="font-mono text-[var(--text1)] font-bold">{fmt.large(result.sourcesUses.entryEv)}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-4 border-b border-[var(--border)]">
                  <span className="text-[var(--text3)] uppercase tracking-wider text-[10px] font-bold">Transaction Fees</span>
                  <span className="font-mono text-[var(--text1)] font-bold">{fmt.large(result.sourcesUses.transactionFees)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-6 font-bold text-[var(--text1)] uppercase tracking-widest">
                  <span className="text-xs">Total Transaction Uses</span>
                  <span className="font-mono text-2xl text-[var(--navy)] font-bold">{fmt.large(result.sourcesUses.totalUses)}</span>
                </div>
              </div>
            </div>



            <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-8 shadow-[0_10px_30px_rgba(14,124,105,0.03)] border-l-4 border-l-[var(--emerald)]">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--navy)] mb-10 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[var(--emerald)]" /> Transaction Sources
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm py-4 border-b border-[var(--border)]">
                  <span className="text-[var(--text3)] uppercase tracking-wider text-[10px] font-bold">New Tranche Debt</span>
                  <span className="font-mono text-[var(--text1)] font-bold">{fmt.large(result.sourcesUses.totalDebt)}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-4 border-b border-[var(--border)]">
                  <span className="text-[var(--text3)] uppercase tracking-wider text-[10px] font-bold">Sponsor Equity Check</span>
                  <span className="font-mono text-[var(--navy)] font-bold">{fmt.large(result.sourcesUses.equityCheck)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] pt-6 font-bold text-[var(--text1)] uppercase tracking-[0.25em]">
                  <span>Equity Contribution %</span>
                  <span className="font-mono text-base font-bold text-[var(--emerald)]">{result.sourcesUses.entryEquityPct.toFixed(1)}%</span>
                </div>
              </div>
            </div>


          </div>

          {/* Editable Debt Tranches */}
          <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--navy)] mb-6 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[var(--accent)]" /> Debt Capital Structure
            </h3>
            
            <div className="space-y-4">
              {tranches.map((t, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between gap-4 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg2)]">
                  <div className="min-w-[150px]">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text1)]">{t.name}</div>
                    <div className="text-[9px] text-[var(--text3)] uppercase tracking-wider">{t.type}</div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[var(--text3)] mb-1">Amount ($M)</label>
                      <input 
                        type="number" 
                        value={t.commitment} 
                        onChange={e => updateTranche(i, 'commitment', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-[var(--bg1)] border border-[var(--border)] rounded px-2 py-1 text-xs font-mono text-[var(--text1)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[var(--text3)] mb-1">Spread (bps)</label>
                      <input 
                        type="number" 
                        value={t.spreadBps} 
                        onChange={e => updateTranche(i, 'spreadBps', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-[var(--bg1)] border border-[var(--border)] rounded px-2 py-1 text-xs font-mono text-[var(--text1)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(14,124,105,0.03)]">
            <div className="bg-[var(--bg2)] p-6 border-b border-[var(--border)]">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--navy)]">
                Debt Amortization & Cash Sweep Schedule
              </h3>
            </div>


            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg2)] text-[var(--navy)] font-mono text-[9px] uppercase tracking-widest">
                    <th className="py-4 px-8 border-r border-[var(--border)]">Line Item</th>
                    {result.years.map(y => (
                      <th key={y.year} className="py-4 px-6 border-r border-[var(--border)] last:border-0 text-right">
                        FY {y.year}E
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono text-xs text-[var(--text1)]">
                  <tr className="hover:bg-[var(--bg3)] transition-colors">
                    <td className="py-5 px-8 text-[var(--text1)] font-sans font-bold uppercase tracking-wider border-r border-[var(--border)]">
                      EBITDA
                    </td>

                    {result.years.map((y, i) => (
                      <td key={i} className="py-5 px-6 text-right border-r border-[var(--border)] last:border-0 font-bold">
                        {y.ebitda.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[var(--bg3)] transition-colors">
                    <td className="py-5 px-8 text-[var(--text3)] italic font-sans border-r border-[var(--border)] font-bold">
                      CFADS (Cash Flow Available for Debt Service)
                    </td>
                    {result.years.map((y, i) => (
                      <td key={i} className="py-5 px-6 text-right text-[var(--positive)] font-bold border-r border-[var(--border)] last:border-0">
                        {y.cfads.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-[var(--bg2)] font-bold text-[var(--text1)]">
                    <td className="py-5 px-8 uppercase tracking-widest font-sans border-r border-[var(--border)] font-semibold">
                      Closing Debt Balance
                    </td>
                    {result.years.map((y, i) => (
                      <td key={i} className="py-5 px-6 text-right border-r border-[var(--border)] last:border-0 text-base font-bold text-[var(--navy)]">
                        {y.debtClose.toFixed(1)}
                      </td>
                    ))}
                  </tr>


                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="xl:col-span-4 flex flex-col gap-8">
          <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-3xl p-8 text-center shadow-[0_30px_70px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--emerald)] to-transparent opacity-80" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--emerald)] opacity-[0.05] blur-[100px] rounded-full group-hover:opacity-[0.08] transition-opacity duration-1000" />

            <span className="text-[10px] font-mono tracking-[0.5em] text-[var(--emerald)] uppercase mb-8 block font-bold">
              Institutional Performance
            </span>

            <div className="flex items-center justify-center gap-12 my-12 relative z-10 font-bold">
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-[var(--text1)] tracking-tighter mb-2 font-ibm-plex-mono">{result.moic}x</div>
                <div className="text-[10px] text-[var(--text3)] uppercase font-bold tracking-[0.25em]">Exit MOIC</div>
              </div>
              <div className="w-[1px] h-20 bg-[var(--border)]" />
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-[var(--emerald)] tracking-tighter mb-2 font-ibm-plex-mono">{result.irr}%</div>
                <div className="text-[10px] text-[var(--text3)] uppercase font-bold tracking-[0.25em]">Projected IRR</div>
              </div>
            </div>


            <div className="space-y-6 text-left border-t border-[var(--border)] pt-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] text-[var(--text3)] uppercase tracking-widest font-bold">Exit Multiple</span>
                  <span className="font-mono text-[var(--emerald)] text-lg font-bold">{modelState.exitMultiple}x</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="0.5"
                  value={modelState.exitMultiple}
                  onChange={(e) => setExitMultiple(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--emerald)]"
                />
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-6 border-t border-[var(--border)]">
                <span className="text-[var(--text1)] uppercase tracking-widest text-[10px] font-bold">Proj. Equity Exit Value</span>
                <span className="text-[var(--emerald)] font-mono text-xl">{fmt.large(result.exitEquity)}</span>
              </div>
            </div>

          </div>

          <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--emerald)] mb-8 border-b border-[var(--border)] pb-4">
              Returns Sensitivity Matrix
            </h3>


            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--bg2)]">
                    <th className="p-3 border border-[var(--border)] text-[8px] text-[var(--text3)] uppercase tracking-tighter w-16 text-left font-bold">
                      Exit Yr<br />Multiple →
                    </th>
                    {result.exitMultipleRange.map(m => (
                      <th key={m} className="p-3 border border-[var(--border)] font-mono text-[9px] text-[var(--text1)] font-bold">
                        {m}x
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {result.returnsSensitivity.map((row, ri) => (
                    <tr key={ri}>
                      <td className="p-4 border border-[var(--border)] font-mono text-[10px] font-bold text-[var(--text1)] bg-[var(--bg2)] text-left">
                        Yr {row.exitYear}
                      </td>

                      {row.irrs.map((val, ci) => {
                        const isHigh = val > 25;
                        const isMid = val > 15;
                        const cellStyle = isHigh
                          ? { backgroundColor: "rgba(14, 124, 105, 0.15)", color: "var(--emerald)" }
                          : isMid
                          ? { backgroundColor: "rgba(14, 124, 105, 0.05)", color: "var(--navy)" }
                          : { backgroundColor: "rgba(255, 90, 90, 0.05)", color: "var(--neg)" };

                        return (
                          <td
                            key={ci}
                            className="p-4 border border-[var(--border)] font-mono text-[11px] text-center font-bold"
                            style={cellStyle}
                          >
                            {val}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-6 text-[8px] text-[var(--text2)] uppercase tracking-widest font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> &gt; 25% IRR
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" /> &gt; 15% IRR
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
