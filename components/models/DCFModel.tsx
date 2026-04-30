"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { fmt } from "@/lib/fmt";
import { useDCF } from "@/hooks/useFinancialModels";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useMarketData } from "@/hooks/useMarketData";
import { formatYahooFundamentalsToModel } from "@/lib/finance/adapter";
import { ModelButton } from "@/components/ui/ModelButton";
import { TrendingUp, ShieldCheck, ArrowRightLeft, Download, Calculator, ChevronRight, AlertTriangle } from "lucide-react";
import { exportDCFToExcel, exportDCFToPDF } from "@/lib/services/exportService";
import { useFX } from "@/hooks/useFX";

interface ProjectionPeriod {
  year: number;
  revenue: number;
  nopat: number;
  dAndA: number;
  capex: number;
  deltaNwc: number;
  fcff: number;
  discountFactor: number;
  pvFcff: number;
}

export function DCFModel() {
  const { calculate, data, loading, error: mathError } = useDCF();
  const { activeTicker, currency } = useTerminalStore();
  const { convert } = useFX();

  const { data: globalData, isLoading: fetchLoading, isError: fetchError } = useMarketData(activeTicker);

  const [inputs, setInputs] = useState({
    baseRevenue: 5000,
    ebitdaMargin: 25.0,
    sharesOutstanding: 1000,
    rfRate: 4.5,
    beta: 1.2,
    erp: 6.0,
    costOfDebt: 5.0,
    taxRate: 21.0,
    zakatRate: 2.5,
    tgr: 3.0,
    revenueGrowth: 8.0,
    projectionYears: 5
  });

  const handleRunSync = useCallback(() => {
    if (!globalData) return;
    
    const years = Array.from({ length: inputs.projectionYears }).map((_, i) => ({
      yearIndex: i + 1,
      year: 2025 + i,
      revenue: inputs.baseRevenue * Math.pow(1 + inputs.revenueGrowth / 100, i + 1),
      ebitMargin: (inputs.ebitdaMargin / 100) * 0.8,
      taxRateEffective: 0,
      dAndA: inputs.baseRevenue * 0.05,
      capex: inputs.baseRevenue * 0.04,
      deltaNwc: inputs.baseRevenue * 0.02,
    }));

    const params = {
      rfRate: inputs.rfRate / 100,
      erp: inputs.erp / 100,
      betaUnlevered: inputs.beta,
      targetDtoE: 0.3,
      taxShieldRate: inputs.taxRate / 100,
      kdPreTax: inputs.costOfDebt / 100,
      zakatRate: inputs.zakatRate / 100,
      terminalMethod: "GORDON" as const,
      terminalGrowth: inputs.tgr / 100,
      includeLeasesInDebt: true,
      includeEosbInDebt: true,
      includeSukukInDebt: true,
    };

    const modelData = formatYahooFundamentalsToModel(globalData.fundamentals);

    const bridge = {
      enterpriseValue: 0,
      cash: Number(modelData?.cashAndEquivalents || 0),
      shortTermDebt: Number(modelData?.totalDebt || 0),
      longTermDebt: 0,
      sukuk: 0,
      leaseFinancingLiabilities: 0,
      eosbLiability: 0,
      minorityInterest: 0,
      otherDebtLike: 0,
      nonOperatingAssets: 0,
      sharesOutstanding: modelData?.sharesOutstanding || inputs.sharesOutstanding,
      currentPrice: globalData.quote?.regularMarketPrice || globalData.quote?.currentPrice || 30.0,
    };

    try {
      calculate(years, params, bridge);
    } catch (e) {
      console.error(e);
    }
  }, [inputs, globalData, calculate]);

  const projections = (data?.projectedYears || []) as ProjectionPeriod[];
  const upside = data?.bridge?.upsidePct;

  const updateInput = (key: string, val: number) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col gap-4 w-full h-[60vh] justify-center items-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-xl"
        >
          <TrendingUp className="text-zinc-400 w-6 h-6 opacity-80" />
        </motion.div>
        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase animate-pulse">Syncing SEC Filings...</p>
      </div>
    );
  }

  if (fetchError || mathError || !data) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-500 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
        Detailed financials unavailable for SEC modeling.
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-8 text-zinc-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0a0a0a]/50 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-white/10 rounded-xl">
            <TrendingUp className="text-zinc-300 w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold uppercase tracking-tighter text-zinc-50">Sovereign DCF Engine</h1>
            <p className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
              {activeTicker?.replace(".SR", "") || "---"} • {currency} • INTRINSIC_VALUE_RECONCILIATION
            </p>
          </div>
        </div>

        {data && (
          <div className="flex items-center gap-12 text-right">
            <div>
              <div className="text-[10px] text-zinc-500 mb-1 uppercase tracking-[0.2em] font-bold">Implied Price ({currency})</div>
              <div className="font-mono font-bold text-4xl text-zinc-50">
                {fmt.accounting(convert(data.bridge.impliedSharePrice, 'SAR'))}
              </div>
              <div className={`font-mono text-xs mt-1 font-bold ${(upside ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {(upside ?? 0) > 0 ? "▲" : "▼"} {Math.abs(upside || 0).toFixed(1)}% { (upside ?? 0) >= 0 ? "Upside" : "Overvalued" }
              </div>
            </div>
            <ModelButton label="Recalculate" onClick={handleRunSync} loading={loading || fetchLoading} />
          </div>
        )}
      </header>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 xl:col-span-3 space-y-6">
          <div className="bg-[#0a0a0a]/50 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
             <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <Calculator className="w-4 h-4 text-zinc-400" />
              Model Inputs
            </h3>
            <div className="space-y-6">
              <Slider label="Risk-Free Rate" value={inputs.rfRate} min={1} max={10} step={0.1} unit="%" onChange={(v: number) => updateInput('rfRate', v)} />
              <Slider label="Equity Risk Premium" value={inputs.erp} min={3} max={10} step={0.1} unit="%" onChange={(v: number) => updateInput('erp', v)} />
              <Slider label="Beta" value={inputs.beta} min={0.5} max={2.5} step={0.05} onChange={(v: number) => updateInput('beta', v)} />
              <div className="pt-4 border-t border-white/10">
                <Slider label="Terminal Growth" value={inputs.tgr} min={0} max={5} step={0.1} unit="%" onChange={(v: number) => updateInput('tgr', v)} />
                <Slider label="Proj. Revenue Growth" value={inputs.revenueGrowth} min={-5} max={25} step={0.5} unit="%" onChange={(v: number) => updateInput('revenueGrowth', v)} />
              </div>
            </div>
          </div>

          {data && (
            <div className="bg-[#0a0a0a]/50 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                <ArrowRightLeft className="w-4 h-4 text-zinc-400" />
                Value Bridge
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-3">
                   <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Enterprise Value</span>
                   <span className="font-mono text-xs text-zinc-50">{fmt.accounting(convert(data.bridge.equityValue + data.bridge.netDebt, 'SAR'))}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                   <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">(+) Cash</span>
                   <span className="font-mono text-xs text-emerald-400">+{fmt.accounting(convert(data.bridge.cash, 'SAR'))}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                   <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">(-) Net Debt</span>
                   <span className="font-mono text-xs text-rose-400">-{fmt.accounting(convert(data.bridge.netDebt, 'SAR'))}</span>
                </div>
                <div className="flex justify-between pt-2">
                   <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Equity Value</span>
                   <span className="font-mono text-sm text-zinc-100 font-bold">{fmt.accounting(convert(data.bridge.equityValue, 'SAR'))}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="col-span-12 xl:col-span-9 space-y-8">
           <div className="bg-[#0a0a0a]/50 border border-white/10 overflow-hidden rounded-2xl backdrop-blur-xl">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-1/3">FCF Projection (Millions)</th>
                    {projections.map(p => <th key={p.year} className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">{p.year}E</th>)}
                 </tr>
               </thead>
               <tbody>
                  <TableRow label="Revenue" values={projections.map(p => fmt.accounting(convert(p.revenue, 'SAR')))} />
                  <TableRow label="NOPAT" values={projections.map(p => fmt.accounting(convert(p.nopat, 'SAR')))} />
                  <TableRow label="(+) D&A" values={projections.map(p => fmt.accounting(convert(p.dAndA, 'SAR')))} isSub />
                  <TableRow label="(-) CapEx" values={projections.map(p => `(${fmt.accounting(convert(p.capex, 'SAR'))})`)} isSub />
                  <TableRow label="Unlevered Free Cash Flow" values={projections.map(p => fmt.accounting(convert(p.fcff, 'SAR')))} isTotal />
                  <TableRow label="Discount Factor" values={projections.map(p => p.discountFactor.toFixed(4))} isSub />
                  <TableRow label="PV of FCF" values={projections.map(p => fmt.accounting(convert(p.pvFcff, 'SAR')))} isTotal />
               </tbody>
             </table>
           </div>

           {data?.sensitivityTable && (
            <div className="bg-[#0a0a0a]/50 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mb-6">WACC vs TGR Sensitivity (Implied Price)</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-center border-collapse text-[10px] font-mono">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="p-3 border border-white/10 text-left text-zinc-500">TGR \ WACC</th>
                        {data.sensitivityTable.cols.slice(0, 7).map((w: number) => (
                          <th key={w} className="p-3 border border-white/10 text-zinc-300">{(w * 100).toFixed(1)}%</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.sensitivityTable.cells.slice(0, 5).map((row: any[], ri: number) => (
                        <tr key={ri} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 border border-white/10 font-bold text-zinc-500 text-left">{(data.sensitivityTable!.rows[ri] * 100).toFixed(1)}%</td>
                          {row.slice(0, 7).map((v, ci) => (
                            <td key={ci} className={`p-3 border border-white/10 ${v > data.bridge.impliedSharePrice ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {v ? fmt.accounting(convert(v)) : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
           )}
        </main>
      </div>
    </motion.div>
  );
}

function Slider({ label, value, min, max, step, unit = "", onChange }: any) {
  return (
    <div className="group">
      <div className="flex justify-between mb-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase group-hover:text-zinc-300 transition-colors">{label}</label>
        <span className="font-mono text-xs font-bold text-zinc-50">{value.toFixed(1)}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-zinc-400"
      />
    </div>
  );
}

function TableRow({ label, values, isSub, isTotal }: any) {
  return (
    <tr className={`border-b border-white/10 transition-colors hover:bg-white/5 ${isTotal ? 'bg-white/5' : ''}`}>
      <td className={`py-4 px-6 text-left ${isSub ? 'pl-10 text-[11px] text-zinc-500 italic' : 'text-[12px] font-bold uppercase text-zinc-100'} ${isTotal ? 'text-zinc-50' : ''}`}>
        {isSub && <span className="mr-2 text-zinc-600">└</span>}
        {label}
      </td>
      {values.map((v: any, i: number) => (
        <td key={i} className={`py-4 px-6 text-right font-mono text-xs border-l border-white/10 ${isTotal ? 'font-bold text-zinc-50' : 'text-zinc-400'}`}>
          {v}
        </td>
      ))}
    </tr>
  );
}
