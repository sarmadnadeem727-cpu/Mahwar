"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { fmt } from "@/lib/fmt";
import { useDCF } from "@/hooks/useFinancialModels";
import { useTerminalStore } from "@/store/useTerminalStore";
import { ModelButton } from "@/components/ui/ModelButton";
import { TrendingUp, ShieldCheck, ArrowRightLeft, Download } from "lucide-react";
import { exportDCFToExcel, exportDCFToPDF } from "@/lib/services/exportService";


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
  const { data: globalData } = useTerminalStore();

  // Model Inputs - Unified to prevent cascading renders
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

  const hasSyncedRef = useRef(false);

  const handleRunSync = useCallback(() => {
    const years = Array.from({ length: inputs.projectionYears }).map((_, i) => ({
      yearIndex: i + 1,
      year: 2025 + i,
      revenue: inputs.baseRevenue * Math.pow(1 + inputs.revenueGrowth / 100, i + 1),
      ebitMargin: (inputs.ebitdaMargin / 100) * 0.8, // Simple EBIT proxy
      taxRateEffective: 0, // Saudi Zakat proxy
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

    // Cast for strict production linting
    const balance = globalData?.financials.balance || {};
    const latestYear: string = globalData?.financials.latestYear || "";
    const latestBS = (balance[latestYear] || {}) as Record<string, unknown>;

    const bridge = {
      enterpriseValue: 0,
      cash: (latestBS.cashAndCashEquivalents as number) || 0,
      shortTermDebt: (latestBS.shortTermDebt as number) || 0,
      longTermDebt: (latestBS.longTermDebt as number) || 0,
      sukuk: 0,
      leaseFinancingLiabilities: 0,
      eosbLiability: 0,
      minorityInterest: 0,
      otherDebtLike: 0,
      nonOperatingAssets: 0,
      sharesOutstanding: inputs.sharesOutstanding,
      currentPrice: globalData?.price || 32.4,
    };

    calculate(years, params, bridge);
  }, [inputs, globalData, calculate]);

  // Auto-populate when global data changes
  useEffect(() => {
    if (globalData && !hasSyncedRef.current) {
      const timer = setTimeout(() => {
        const income = globalData.financials.income || {};
        const latestYear: string = globalData.financials.latestYear || "";
        const latestIS = (income[latestYear] || {}) as Record<string, unknown>;
        
        const newBaseRevenue = typeof latestIS.totalRevenue === 'string' ? parseFloat(latestIS.totalRevenue) : ((latestIS.totalRevenue as number) || 5000);
        const newEbitdaMargin = typeof globalData.metrics.ebitdaMargin === 'string' ? parseFloat(globalData.metrics.ebitdaMargin) : (globalData.metrics.ebitdaMargin || 25);
        const newSharesOutstanding = typeof globalData.metrics.sharesOutstanding === 'string' ? parseFloat(globalData.metrics.sharesOutstanding) : (globalData.metrics.sharesOutstanding || 1000);
        const newRevenueGrowth = Math.min(20, Math.max(-5, typeof globalData.metrics.revenueGrowth === 'string' ? parseFloat(globalData.metrics.revenueGrowth) : (globalData.metrics.revenueGrowth || 8)));
        
        setInputs(prev => ({
          ...prev,
          baseRevenue: newBaseRevenue,
          ebitdaMargin: newEbitdaMargin,
          sharesOutstanding: newSharesOutstanding,
          revenueGrowth: newRevenueGrowth
        }));
        
        hasSyncedRef.current = true;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [globalData]);

  // Auto-calculate on first load or when data updates
  useEffect(() => {
    if (globalData && !data) {
      const timer = setTimeout(() => {
        handleRunSync();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [globalData, data, handleRunSync]);

  const projections = (data?.projectedYears || []) as ProjectionPeriod[];
  const upside = data?.bridge?.upsidePct;

  const updateInput = (key: string, val: number) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleExportExcel = () => {
    if (!data || !globalData) return;
    exportDCFToExcel(
      globalData.name,
      globalData.ticker,
      data.projectedYears,
      inputs,
      data
    );
  };

  const handleExportPDF = () => {
    if (!data || !globalData) return;
    exportDCFToPDF(
      globalData.name,
      globalData.ticker,
      data.projectedYears,
      inputs,
      data
    );
  };

  return (
    <motion.div
      className="flex flex-col gap-6 p-4 md:p-8 bg-[var(--void)] min-h-screen text-[var(--text1)]"

      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--border)] pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg2)] flex items-center justify-center border border-[var(--border)] shadow-sm">
            <TrendingUp className="text-[var(--emerald)] w-7 h-7" />
          </div>

          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--text1)] mb-1 leading-tight">
              Sovereign DCF Engine
            </h1>
            <p className="text-[var(--text3)] text-xs font-ibm-plex-mono font-bold uppercase tracking-[0.2em] opacity-80">
              Intrinsic Valuation • Multi-Scenario WACC • Terminal Growth
            </p>
          </div>

        </div>

        {data && (
          <div className="flex gap-12 items-end">
            <div className="flex flex-col gap-2 pb-2">
              <button onClick={handleExportExcel} className="flex gap-2 items-center text-[10px] uppercase font-bold text-[var(--emerald)] border border-[var(--emerald)]/20 px-3 py-1.5 rounded-sm hover:bg-[var(--emerald)]/10 transition-colors">
                <Download size={14} /> EXCEL
              </button>
              <button onClick={handleExportPDF} className="flex gap-2 items-center text-[10px] uppercase font-bold text-[var(--text2)] border border-[var(--border)] px-3 py-1.5 rounded-sm hover:text-[var(--text1)] hover:bg-[var(--border)] transition-colors">
                <Download size={14} /> PDF
              </button>
            </div>
            <div className="text-right">
            <div className="text-[10px] text-[var(--text3)] mb-1 uppercase tracking-[0.2em] font-bold">Implied Fair Value</div>
            <div className="font-mono font-bold text-5xl text-[var(--navy)]">
              {fmt.price(data.bridge.impliedSharePrice, "SAR")}
            </div>
            <div
              className={`font-mono text-sm mt-1 flex items-center justify-end gap-1 font-bold ${
                (upside ?? 0) >= 0 ? "text-[var(--pos)]" : "text-[var(--neg)]"
              }`}
            >
              {(upside ?? 0) > 0 ? "▲" : "▼"} {Math.abs(upside || 0).toFixed(1)}%{" "}
              <span className="opacity-80">{(upside ?? 0) >= 0 ? "Potential Upside" : "Overvalued"}</span>
            </div>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Inputs */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-8 shadow-[0_10px_30px_rgba(14,124,105,0.03)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[var(--navy)]">
              <ShieldCheck className="w-16 h-16" />
            </div>
            <h3 className="font-sans font-bold text-xs mb-8 text-[var(--text1)] uppercase tracking-[0.2em] border-l-2 border-[var(--emerald)] pl-4">
              Model Parameters
            </h3>


            <div className="flex flex-col gap-8">
              <div className="space-y-6">
                <Slider label="Risk-Free Rate" value={inputs.rfRate} min={0} max={10} step={0.1} unit="%" onChange={(v) => updateInput('rfRate', v)} />
                <Slider label="Equity Risk Premium" value={inputs.erp} min={2} max={12} step={0.1} unit="%" onChange={(v) => updateInput('erp', v)} />
                <Slider label="Beta" value={inputs.beta} min={0.1} max={3} step={0.05} onChange={(v) => updateInput('beta', v)} />
                <Slider label="Cost of Debt" value={inputs.costOfDebt} min={1} max={15} step={0.1} unit="%" onChange={(v) => updateInput('costOfDebt', v)} />
                <Slider label="Tax Rate" value={inputs.taxRate} min={0} max={40} step={1} unit="%" onChange={(v) => updateInput('taxRate', v)} />
                <div className="pt-2">
                  <Slider label="Zakat Rate (ZATCA)" value={inputs.zakatRate} min={0} max={10} step={0.5} unit="%" onChange={(v) => updateInput('zakatRate', v)} />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-[var(--border)]">
                <Slider label="Terminal Growth Rate" value={inputs.tgr} min={0} max={6} step={0.1} unit="%" onChange={(v) => updateInput('tgr', v)} />
                <Slider label="Revenue CAGR" value={inputs.revenueGrowth} min={-10} max={30} step={0.5} unit="%" onChange={(v) => updateInput('revenueGrowth', v)} />
                <Slider label="EBITDA Margin" value={inputs.ebitdaMargin} min={5} max={60} step={0.5} unit="%" onChange={(v) => updateInput('ebitdaMargin', v)} />
              </div>

              <div className="pt-6 border-t border-[var(--border)]">
                <ModelButton onClick={handleRunSync} loading={loading} />
              </div>
            </div>
          </div>

          {data && (
            <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-8 shadow-[0_15px_50px_rgba(0,0,0,0.3)]">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--emerald)] mb-10 flex items-center gap-3">
                <ArrowRightLeft className="w-5 h-5" /> Equity Value Reconciliation
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm py-4 border-b border-[var(--border)]">
                  <span className="text-[var(--text3)] uppercase tracking-wider text-[10px] font-bold">Add: Cash & Equivalents</span>
                  <span className="font-mono text-[var(--pos)] font-bold">+{fmt.large(data.bridge.cash)}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-4 border-b border-[var(--border)]">
                  <span className="text-[var(--text3)] uppercase tracking-wider text-[10px] font-bold">Less: Total Debt</span>
                  <span className="font-mono text-[var(--neg)] font-bold">-{fmt.large(data.bridge.netDebt)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-6 font-bold text-[var(--text1)] uppercase tracking-widest">
                  <span className="text-xs">Equity Value</span>
                  <span className="font-mono text-2xl text-[var(--emerald)] font-bold">{fmt.large(data.bridge.equityValue)}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="lg:col-span-3 flex flex-col gap-8">
          <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="bg-[var(--bg2)] p-6 border-b border-[var(--border)]">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--emerald)]">
                Unlevered Free Cash Flow (UFCF) Projection
              </h3>
            </div>


            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--bg2)] text-[var(--emerald)] font-mono text-[9px] uppercase tracking-widest">
                    <th className="py-4 px-6 text-left font-sans border-r border-[var(--border)]">Financial Metric (SARm)</th>
                    {projections.map((p) => (
                      <th key={p.year} className="py-4 px-4 border-r border-[var(--border)] last:border-0 font-bold">
                        {p.year}E
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono text-sm text-[var(--text1)]">
                  <TableRow label="Revenue" values={projections.map((p) => fmt.millions(p.revenue))} />
                  <TableRow label="EBITDA" values={projections.map((p) => fmt.millions(p.revenue * (inputs.ebitdaMargin / 100)))} isSub />
                  <TableRow label="NOPAT" values={projections.map((p) => fmt.millions(p.nopat))} />
                  <TableRow label="(-) ZATCA Zakat" values={projections.map((p) => `(${fmt.millions((p as any).zakatExpense || 0)})`)} className="text-[var(--neg)] font-medium bg-[var(--neg)]/5" isSub />
                  <TableRow label="(+) D&A" values={projections.map((p) => fmt.millions(p.dAndA))} isSub />
                  <TableRow label="(-) CapEx" values={projections.map((p) => `(${fmt.millions(p.capex)})`)} className="text-[var(--neg)] font-medium" />
                  <TableRow label="(-) Δ NWC" values={projections.map((p) => `(${fmt.millions(p.deltaNwc)})`)} className="text-orange-500 font-medium" isSub />
                  <tr className="bg-[var(--emerald)]/5 font-bold text-[var(--emerald)] border-y border-[var(--emerald)]/10">
                    <td className="py-4 px-6 text-left font-sans uppercase tracking-widest border-r border-[var(--border)]">
                      Unlevered FCF
                    </td>

                    {projections.map((p, i) => (
                      <td key={i} className="py-4 px-4 border-r border-emerald-500/10 last:border-0 border-l-0">
                        {fmt.millions(p.fcff || 0)}
                      </td>
                    ))}
                  </tr>
                  <TableRow label="Discount Factor" values={projections.map((p) => (p.discountFactor || 0).toFixed(4))} isSub />
                  <tr className="bg-[var(--bg2)] font-bold text-[var(--text1)]">
                    <td className="py-4 px-6 text-left font-sans uppercase tracking-widest border-r border-[var(--border)]">
                      Present Value
                    </td>
                    {projections.map((p, i) => (
                      <td key={i} className="py-4 px-4 border-r border-[var(--navy)]/10 last:border-0 border-l-0">
                        {fmt.millions(p.pvFcff || 0)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {data?.sensitivityTable && (
            <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-sans font-bold text-sm text-[var(--emerald)] uppercase tracking-[0.2em] mb-1">
                    Sensitivity Analysis
                  </h3>
                  <p className="text-[9px] text-[var(--text3)] uppercase tracking-widest font-bold">
                    Implied Price: WACC (%) vs Terminal Growth (%)
                  </p>
                </div>
              </div>


              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-[10px] font-mono">
                  <thead>
                  <tr className="bg-[var(--bg2)]/80">
                    <th className="p-4 border border-[var(--border)] text-[9px] text-[var(--text3)] uppercase tracking-tighter w-20 text-left font-bold">
                      TGR ↓ / WACC →
                    </th>
                    {data.sensitivityTable.cols.slice(0, 8).map((w: number) => (
                      <th key={w} className="p-4 border border-[var(--border)] font-mono text-[10px] text-[var(--text1)] font-bold">
                        {(w * 100).toFixed(1)}%
                      </th>
                    ))}
                  </tr>
                </thead>

                  <tbody>
                    {data.sensitivityTable.cells.slice(0, 8).map((row: (number | null)[], ri: number) => (
                      <tr key={ri}>
                        <td className="p-4 border border-[var(--border)] bg-[var(--bg2)] text-[var(--text1)] font-bold text-left uppercase tracking-widest">
                          {(data.sensitivityTable!.rows[ri] * 100).toFixed(1)}%
                        </td>
                        {row.slice(0, 8).map((p, ci: number) => {
                          const table = data.sensitivityTable!;
                          const isBase = ri === table.baseRowIndex && ci === table.baseColIndex;
                          const currentVal = data.bridge.impliedSharePrice;
                          const heat = !p ? "opacity-20" : p > currentVal * 1.05 ? "bg-[var(--emerald)]/10 text-[var(--emerald)] font-bold" : p < currentVal * 0.95 ? "bg-[var(--neg)]/5 text-[var(--neg)] font-bold" : "text-[var(--text2)]";
                          
                          return (
                            <td
                              key={ci}
                              className={`p-4 border border-[var(--border)] transition-all hover:bg-[var(--bg2)] ${heat} ${
                                isBase ? "bg-[var(--navy)] text-white font-bold" : ""
                              }`}
                            >

                              {p ? p.toFixed(2) : "—"}
                            </td>
                          );
                        })}
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

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (val: number) => void;
}

function Slider({ label, value, min, max, step, unit = "", onChange }: SliderProps) {
  return (
    <div className="group">
      <div className="flex justify-between mb-3 items-baseline">
        <label className="text-[9px] text-[var(--text3)] uppercase tracking-[0.2em] font-bold group-hover:text-[var(--emerald)] transition-colors">
          {label}
        </label>

        <span className="font-mono text-sm font-bold text-[var(--navy)]">
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-[2px] bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--emerald)] hover:accent-[var(--navy)] transition-all"
      />

    </div>
  );
}

interface TableRowProps {
  label: string;
  values: string[];
  isSub?: boolean;
  className?: string;
}

function TableRow({ label, values, isSub = false, className = "" }: TableRowProps) {
  return (
    <tr
      className={`border-b border-[var(--border)] hover:bg-[var(--bg2)] transition-colors ${
        isSub ? "text-[var(--text3)]" : ""
      }`}
    >

      <td
        className={`py-4 px-6 text-left font-sans border-r border-[var(--border)] ${
          isSub ? "text-[10px] pl-10 italic" : "text-[var(--text1)] font-medium uppercase tracking-[0.1em]"
        }`}
      >
        {label}
      </td>
      {values.map((v: string, i: number) => (
        <td key={i} className={`py-4 px-4 border-r border-[var(--border)] last:border-0 ${className}`}>
          {v}
        </td>
      ))}
    </tr>
  );
}
