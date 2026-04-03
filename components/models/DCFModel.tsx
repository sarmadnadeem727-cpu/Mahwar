"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { fmt } from "@/lib/fmt";
import { useDCF } from "@/hooks/useFinancialModels";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useQuery } from "@tanstack/react-query";
import { fetchInstitutionalData } from "@/lib/services/terminalService";
import { ModelButton } from "@/components/ui/ModelButton";
import { TrendingUp, ShieldCheck, ArrowRightLeft, Download, Calculator, ChevronRight } from "lucide-react";
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
  const { calculate, data, loading } = useDCF();
  const { selectedTicker, currency } = useTerminalStore();
  const { convert } = useFX();

  const { data: globalData, isLoading: fetchLoading } = useQuery({
    queryKey: ['financialData', selectedTicker],
    queryFn: () => fetchInstitutionalData(selectedTicker),
    staleTime: 5 * 60 * 1000,
  });

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

    const latestBS = (globalData.financials.balance[globalData.financials.latestYear] || {}) as any;

    const bridge = {
      enterpriseValue: 0,
      cash: Number(latestBS.cashAndCashEquivalents || 0),
      shortTermDebt: Number(latestBS.shortTermDebt || 0),
      longTermDebt: Number(latestBS.longTermDebt || 0),
      sukuk: 0,
      leaseFinancingLiabilities: 0,
      eosbLiability: 0,
      minorityInterest: 0,
      otherDebtLike: 0,
      nonOperatingAssets: 0,
      sharesOutstanding: inputs.sharesOutstanding,
      currentPrice: globalData.price || 30.0,
    };

    calculate(years, params, bridge);
  }, [inputs, globalData, calculate]);

  const projections = (data?.projectedYears || []) as ProjectionPeriod[];
  const upside = data?.bridge?.upsidePct;

  const updateInput = (key: string, val: number) => {
    setInputs(prev => ({ ...prev, [key]: val }));
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
            <TrendingUp className="text-[#F59E0B] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold uppercase tracking-tighter">Sovereign DCF Engine</h1>
            <p className="text-[#64748B] text-[10px] font-mono tracking-widest uppercase">
              {selectedTicker.replace(".SR", "")} • {currency} • INTRINSIC_VALUE_RECONCILIATION
            </p>
          </div>
        </div>

        {data && (
          <div className="flex items-center gap-12 text-right">
            <div>
              <div className="text-[10px] text-[#64748B] mb-1 uppercase tracking-[0.2em] font-bold">Implied Price ({currency})</div>
              <div className="font-mono font-bold text-4xl text-[#F8FAFC]">
                {fmt.accounting(convert(data.bridge.impliedSharePrice, 'SAR', currency))}
              </div>
              <div className={`font-mono text-xs mt-1 font-bold ${(upside ?? 0) >= 0 ? "text-[#10B981]" : "text-red-400"}`}>
                {(upside ?? 0) > 0 ? "▲" : "▼"} {Math.abs(upside || 0).toFixed(1)}% { (upside ?? 0) >= 0 ? "Upside" : "Overvalued" }
              </div>
            </div>
            <ModelButton label="Recalculate" onClick={handleRunSync} loading={loading || fetchLoading} />
          </div>
        )}
      </header>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 xl:col-span-3 space-y-6">
          <div className="bg-[#0F172A] border border-[#334155] p-6">
             <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <Calculator className="w-4 h-4 text-[#F59E0B]" />
              Model Inputs
            </h3>
            <div className="space-y-6">
              <Slider label="Risk-Free Rate" value={inputs.rfRate} min={1} max={10} step={0.1} unit="%" onChange={(v) => updateInput('rfRate', v)} />
              <Slider label="Equity Risk Premium" value={inputs.erp} min={3} max={10} step={0.1} unit="%" onChange={(v) => updateInput('erp', v)} />
              <Slider label="Beta" value={inputs.beta} min={0.5} max={2.5} step={0.05} onChange={(v) => updateInput('beta', v)} />
              <div className="pt-4 border-t border-[#334155]">
                <Slider label="Terminal Growth" value={inputs.tgr} min={0} max={5} step={0.1} unit="%" onChange={(v) => updateInput('tgr', v)} />
                <Slider label="Proj. Revenue Growth" value={inputs.revenueGrowth} min={-5} max={25} step={0.5} unit="%" onChange={(v) => updateInput('revenueGrowth', v)} />
              </div>
            </div>
          </div>

          {data && (
            <div className="bg-[#0F172A] border border-[#334155] p-6">
              <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                <ArrowRightLeft className="w-4 h-4 text-[#10B981]" />
                Value Bridge
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-[#334155] pb-3">
                   <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">Enterprise Value</span>
                   <span className="font-mono text-xs text-[#F8FAFC]">{fmt.accounting(convert(data.bridge.enterpriseValue, 'SAR', currency))}</span>
                </div>
                <div className="flex justify-between border-b border-[#334155] pb-3">
                   <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">(+) Cash</span>
                   <span className="font-mono text-xs text-[#10B981]">+{fmt.accounting(convert(data.bridge.cash, 'SAR', currency))}</span>
                </div>
                <div className="flex justify-between border-b border-[#334155] pb-3">
                   <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">(-) Net Debt</span>
                   <span className="font-mono text-xs text-red-400">-{fmt.accounting(convert(data.bridge.netDebt, 'SAR', currency))}</span>
                </div>
                <div className="flex justify-between pt-2">
                   <span className="text-[10px] text-[#F8FAFC] font-bold uppercase tracking-widest">Equity Value</span>
                   <span className="font-mono text-sm text-[#F59E0B] font-bold">{fmt.accounting(convert(data.bridge.equityValue, 'SAR', currency))}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="col-span-12 xl:col-span-9 space-y-8">
           <div className="bg-[#0F172A] border border-[#334155] overflow-hidden">
             <table className="terminal-table">
               <thead>
                 <tr>
                    <th className="w-1/3">FCF Projection (Millions)</th>
                    {projections.map(p => <th key={p.year} className="text-right">{p.year}E</th>)}
                 </tr>
               </thead>
               <tbody>
                  <TableRow label="Revenue" values={projections.map(p => fmt.accounting(convert(p.revenue, 'SAR', currency)))} />
                  <TableRow label="NOPAT" values={projections.map(p => fmt.accounting(convert(p.nopat, 'SAR', currency)))} />
                  <TableRow label="(+) D&A" values={projections.map(p => fmt.accounting(convert(p.dAndA, 'SAR', currency)))} isSub />
                  <TableRow label="(-) CapEx" values={projections.map(p => `(${fmt.accounting(convert(p.capex, 'SAR', currency))})`)} isSub />
                  <TableRow label="Unlevered Free Cash Flow" values={projections.map(p => fmt.accounting(convert(p.fcff, 'SAR', currency)))} isTotal />
                  <TableRow label="Discount Factor" values={projections.map(p => p.discountFactor.toFixed(4))} isSub />
                  <TableRow label="PV of FCF" values={projections.map(p => fmt.accounting(convert(p.pvFcff, 'SAR', currency)))} isTotal />
               </tbody>
             </table>
           </div>

           {data?.sensitivityTable && (
            <div className="bg-[#0F172A] border border-[#334155] p-8">
               <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.4em] mb-6">WACC vs TGR Sensitivity (Implied Price)</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-center border-collapse text-[10px] font-mono">
                    <thead>
                      <tr className="bg-[#1E293B]">
                        <th className="p-3 border border-[#334155] text-left text-[#94A3B8]">TGR \ WACC</th>
                        {data.sensitivityTable.cols.slice(0, 7).map((w: number) => (
                          <th key={w} className="p-3 border border-[#334155] text-[#F8FAFC]">{(w * 100).toFixed(1)}%</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.sensitivityTable.cells.slice(0, 5).map((row: any[], ri: number) => (
                        <tr key={ri} className="hover:bg-[#1E293B]">
                          <td className="p-3 border border-[#334155] font-bold text-[#94A3B8] text-left">{(data.sensitivityTable!.rows[ri] * 100).toFixed(1)}%</td>
                          {row.slice(0, 7).map((v, ci) => (
                            <td key={ci} className={`p-3 border border-[#334155] ${v > data.bridge.impliedSharePrice ? 'text-[#10B981]' : 'text-red-400'}`}>
                              {v ? fmt.accounting(convert(v, 'SAR', currency)) : "—"}
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
        <label className="text-[10px] font-bold text-[#94A3B8] uppercase group-hover:text-[#F59E0B] transition-colors">{label}</label>
        <span className="font-mono text-xs font-bold text-[#F8FAFC]">{value.toFixed(1)}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-[#334155] rounded-none appearance-none cursor-pointer accent-[#F59E0B]"
      />
    </div>
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
