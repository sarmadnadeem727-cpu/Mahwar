"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { fmt } from "@/lib/fmt";
import { useThreeStatement } from "@/hooks/useFinancialModels";
import { useTerminalStore } from "@/store/useTerminalStore";
import { ModelButton } from "@/components/ui/ModelButton";
import { FileText, CheckCircle2, AlertCircle, Calculator, Download, ChevronRight, BarChart3, Table as TableIcon } from "lucide-react";
import { StatementCharts } from "./StatementCharts";

interface StatementRowProps {
  label: string;
  values: (number | string)[];
  isHeader?: boolean;
  isTotal?: boolean;
  indent?: boolean;
}

function StatementRow({ label, values, isHeader, isTotal, indent }: StatementRowProps) {
  return (
    <tr
      className={`
      border-b border-[var(--border)] transition-colors
      ${isHeader ? "bg-[var(--bg2)] font-bold text-[var(--emerald)] border-t border-[var(--border)] first:border-t-0" : "hover:bg-[var(--bg2)]"} 
      ${isTotal ? "font-bold bg-[var(--bg-primary)] border-t-[2px] border-[var(--emerald)]/30" : ""}
    `}
    >
      <td
        className={`py-4 px-8 text-left flex items-center gap-3 ${
          indent ? "pl-14 text-[var(--text3)] text-[11px] italic" : "text-[12px] font-sans text-[var(--text1)] uppercase tracking-[0.05em] font-semibold"
        }`}
      >

        {!isHeader && !isTotal && !indent && <ChevronRight className="w-3 h-3 text-[var(--emerald)]/40" />}
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-4 px-6 text-right font-mono text-xs border-l border-[var(--border)] ${
            typeof v === "number" && v < 0 ? "text-red-400" : "text-[var(--text1)]"
          }`}
        >
          {typeof v === "number" ? fmt.accounting(v) : v}
        </td>
      ))}
    </tr>
  );
}

export function ThreeStatementModel() {
  const { validate, data, loading } = useThreeStatement();
  const { data: globalData, selectedTicker } = useTerminalStore();

  const [activeStatement, setActiveStatement] = useState<"IS" | "BS" | "CF">("IS");
  const [viewMode, setViewMode] = useState<"table" | "charts">("table");

  const hasSyncedRef = useRef(false);

  const handleRunSync = useCallback(() => {
    if (globalData && globalData.financials.statements.is) {
      validate(
        globalData.financials.statements.is,
        globalData.financials.statements.bs,
        globalData.financials.statements.cf,
        globalData.financials.statements.prevBs
      );
    }
  }, [globalData, validate]);

  // Auto-run audit when global data changes (once per mount/ticker change)
  useEffect(() => {
    if (globalData && !hasSyncedRef.current) {
      const timer = setTimeout(() => {
        handleRunSync();
        hasSyncedRef.current = true;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [globalData, handleRunSync]);

  const isData = (globalData?.financials.income || {}) as Record<string, Record<string, unknown>>;
  const bsData = (globalData?.financials.balance || {}) as Record<string, Record<string, unknown>>;
  const cfData = (globalData?.financials.cashflow || {}) as Record<string, Record<string, unknown>>;
  const sortedYears = Object.keys(isData).sort().reverse().slice(0, 4);
  const displayYears = sortedYears.map(y => y.split("-")[0] + "A");

  const validationResults = data ? [
    { test: "Balance Sheet", pass: data.isValid, message: data.errors[0] || "Assets equal Liabilities + Equity" },
    { test: "Cash Flow", pass: !data.warnings.some((w: string) => w.includes("Cash")), message: data.warnings.find((w: string) => w.includes("Cash")) || "Reconciliation Confirmed" },
    { test: "Statutory Reserve", pass: !data.warnings.some((w: string) => w.includes("Reserve")), message: data.warnings.find((w: string) => w.includes("Reserve")) || "Zakat & Statutory Transfer Valid" }
  ] : [];
  
  const ratios = data?.ratios || { ebitdaMargin: 0, roe: 0, currentRatio: 0, debtToEquity: 0 };

  return (
    <motion.div
      className="flex flex-col gap-10 p-8 pb-32 max-w-[1600px] mx-auto text-[var(--text1)] bg-[var(--void)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[var(--bg1)] border border-[var(--border)] p-10 rounded-[2.5rem] shadow-[0_15px_40px_rgba(14,124,105,0.05)] relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--emerald)]/20 to-transparent" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg2)] flex items-center justify-center border border-[var(--border)] shadow-sm">
            <FileText className="text-[var(--emerald)] w-8 h-8" />
          </div>
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--text1)] mb-1 leading-tight">
              Institutional FS Engine
            </h1>
            <p className="text-[var(--text3)] text-xs font-ibm-plex-mono font-bold uppercase tracking-[0.2em] opacity-80">
              {selectedTicker.replace(".SR", "")} • Financial Intelligence Hub • IFRS/GAAP
            </p>

            <nav className="flex gap-10 mt-5">
              {[
                { id: "IS", label: "Income Statement" },
                { id: "BS", label: "Balance Sheet" },
                { id: "CF", label: "Cash Flow" },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveStatement(s.id as "IS" | "BS" | "CF")}
                  className={`text-[10px] uppercase font-bold tracking-[0.4em] pb-3 transition-all relative ${
                    activeStatement === s.id ? "text-[var(--emerald)]" : "text-[var(--text3)] hover:text-[var(--text1)]"
                  }`}
                >
                  {s.label}
                  {activeStatement === s.id && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--emerald)] via-[var(--emerald)] to-[var(--emerald)] shadow-[0_0_10px_var(--emerald)]"
                    />
                  )}

                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="flex p-1.5 bg-[var(--bg2)] rounded-xl border border-[var(--border)] mr-2 shadow-inner">
            {[
              { id: "table", label: "Table", icon: <TableIcon className="w-3 h-3" /> },
              { id: "charts", label: "Charts", icon: <BarChart3 className="w-3 h-3" /> },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as "table" | "charts")}
                className={`flex items-center gap-2 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] rounded-lg transition-all ${
                  viewMode === v.id ? "bg-[var(--emerald)] text-white shadow-md shadow-[var(--emerald)]/10" : "text-[var(--text3)] hover:text-[var(--text1)]"
                }`}
              >

                {v.icon}
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-[var(--bg2)] rounded-2xl border border-[var(--border)] shadow-inner relative z-10">
          {(["Annual", "Quarterly"] as const).map((p) => (
            <button
              key={p}
              className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 ${p === "Annual" ? "bg-[var(--emerald)] text-white shadow-md shadow-[var(--emerald)]/10 scale-105" : "text-[var(--text3)] hover:text-[var(--text1)]"}`}
            >

                {p}
              </button>
            ))}
          </div>
          <ModelButton label="Run Statement Audit" onClick={handleRunSync} loading={loading} />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1">
        <section className="xl:col-span-3 flex flex-col">
          {viewMode === "table" ? (
            <section className="bg-[var(--bg1)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-[0_15px_40px_rgba(14,124,105,0.03)]">
              <div className="bg-[var(--bg-primary)] p-1 border-b border-[var(--border)]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg2)] text-[var(--emerald)] font-mono text-[9px] uppercase tracking-[0.2em]">
                      <th className="py-5 px-8 text-left font-sans border-r border-[var(--border)]">Statement Mapping (SAR Millions)</th>
                      {displayYears.map((y) => (
                        <th key={y} className="py-5 px-6 text-right border-l border-[var(--border)]">
                          {y}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {activeStatement === "IS" && (
                      <>
                        <StatementRow
                          label="Revenue"
                          values={sortedYears.map(y => (typeof (isData[y]?.totalRevenue) === 'string' ? parseFloat(isData[y]?.totalRevenue as string) : (isData[y]?.totalRevenue as number)) || 0)}
                          isTotal
                        />
                        <StatementRow label="Cost of Revenue" values={sortedYears.map(y => -((typeof (isData[y]?.costOfRevenue) === 'string' ? parseFloat(isData[y]?.costOfRevenue as string) : (isData[y]?.costOfRevenue as number)) || 0))} indent />
                        <StatementRow label="Gross Profit" values={sortedYears.map(y => (typeof (isData[y]?.grossProfit) === 'string' ? parseFloat(isData[y]?.grossProfit as string) : (isData[y]?.grossProfit as number)) || 0)} isTotal />
                        <StatementRow label="Operating Expenses" values={sortedYears.map(() => "—")} isHeader />
                        <StatementRow label="SG&A" values={sortedYears.map(y => -((typeof (isData[y]?.sellingGeneralAndAdministration) === 'string' ? parseFloat(isData[y]?.sellingGeneralAndAdministration as string) : (isData[y]?.sellingGeneralAndAdministration as number)) || 0))} indent />
                        <StatementRow label="R&D" values={sortedYears.map(y => -((typeof (isData[y]?.researchAndDevelopment) === 'string' ? parseFloat(isData[y]?.researchAndDevelopment as string) : (isData[y]?.researchAndDevelopment as number)) || 0))} indent />
                        <StatementRow label="EBITDA" values={sortedYears.map(y => (typeof (isData[y]?.EBITDA) === 'string' ? parseFloat(isData[y]?.EBITDA as string) : (isData[y]?.EBITDA as number)) || 0)} isTotal />
                        <StatementRow
                          label="Depreciation & Amortization"
                          values={sortedYears.map(y => -((typeof (isData[y]?.depreciationAndAmortization) === 'string' ? parseFloat(isData[y]?.depreciationAndAmortization as string) : (isData[y]?.depreciationAndAmortization as number)) || 0))}
                          indent
                        />
                        <StatementRow label="Operating Income (EBIT)" values={sortedYears.map(y => (typeof (isData[y]?.EBIT) === 'string' ? parseFloat(isData[y]?.EBIT as string) : (isData[y]?.EBIT as number)) || 0)} isTotal />
                        <StatementRow label="Finance Costs" values={sortedYears.map(y => -((typeof (isData[y]?.interestExpense) === 'string' ? parseFloat(isData[y]?.interestExpense as string) : (isData[y]?.interestExpense as number)) || 0))} indent />
                        <StatementRow label="Zakat & Tax" values={sortedYears.map(y => -((typeof (isData[y]?.taxProvision) === 'string' ? parseFloat(isData[y]?.taxProvision as string) : (isData[y]?.taxProvision as number)) || 0))} indent />
                        <StatementRow label="Net Income" values={sortedYears.map(y => (typeof (isData[y]?.netIncome) === 'string' ? parseFloat(isData[y]?.netIncome as string) : (isData[y]?.netIncome as number)) || 0)} isTotal />
                      </>
                    )}
                    {activeStatement === "BS" && (
                      <>
                        <StatementRow label="Assets" values={sortedYears.map(() => "")} isHeader />
                        <StatementRow label="Cash & Equivalents" values={sortedYears.map(y => (typeof (bsData[y]?.cashAndCashEquivalents) === 'string' ? parseFloat(bsData[y]?.cashAndCashEquivalents as string) : (bsData[y]?.cashAndCashEquivalents as number)) || 0)} indent />
                        <StatementRow label="Accounts Receivable" values={sortedYears.map(y => (typeof (bsData[y]?.accountsReceivable) === 'string' ? parseFloat(bsData[y]?.accountsReceivable as string) : (bsData[y]?.accountsReceivable as number)) || 0)} indent />
                        <StatementRow label="Inventory" values={sortedYears.map(y => (typeof (bsData[y]?.inventory) === 'string' ? parseFloat(bsData[y]?.inventory as string) : (bsData[y]?.inventory as number)) || 0)} indent />
                        <StatementRow
                          label="Total Current Assets"
                          values={sortedYears.map(y => (typeof (bsData[y]?.currentAssets) === 'string' ? parseFloat(bsData[y]?.currentAssets as string) : (bsData[y]?.currentAssets as number)) || 0)}
                          isTotal
                        />
                        <StatementRow label="Non-Current Assets" values={sortedYears.map(() => "")} isHeader />
                        <StatementRow label="Net PP&E" values={sortedYears.map(y => (typeof (bsData[y]?.netPPE) === 'string' ? parseFloat(bsData[y]?.netPPE as string) : (bsData[y]?.netPPE as number)) || 0)} indent />
                        <StatementRow label="Total Assets" values={sortedYears.map(y => (typeof (bsData[y]?.totalAssets) === 'string' ? parseFloat(bsData[y]?.totalAssets as string) : (bsData[y]?.totalAssets as number)) || 0)} isTotal />
                        <StatementRow label="Liabilities & Equity" values={sortedYears.map(() => "")} isHeader />
                        <StatementRow label="Total Liabilities" values={sortedYears.map(y => (typeof (bsData[y]?.totalLiabilitiesNetMinorityInterest) === 'string' ? parseFloat(bsData[y]?.totalLiabilitiesNetMinorityInterest as string) : (bsData[y]?.totalLiabilitiesNetMinorityInterest as number)) || 0)} isTotal />
                        <StatementRow label="Total Equity" values={sortedYears.map(y => (typeof (bsData[y]?.stockholdersEquity) === 'string' ? parseFloat(bsData[y]?.stockholdersEquity as string) : (bsData[y]?.stockholdersEquity as number)) || 0)} isTotal />
                      </>
                    )}
                    {activeStatement === "CF" && (
                      <>
                        <StatementRow label="Operations" values={sortedYears.map(() => "")} isHeader />
                        <StatementRow label="Net Income" values={sortedYears.map(y => (typeof (cfData[y]?.netIncome) === 'string' ? parseFloat(cfData[y]?.netIncome as string) : (cfData[y]?.netIncome as number)) || 0)} isTotal />
                        <StatementRow label="Depreciation & Amortization" values={sortedYears.map(y => (typeof (cfData[y]?.depreciation) === 'string' ? parseFloat(cfData[y]?.depreciation as string) : (cfData[y]?.depreciation as number)) || 0)} indent />
                        <StatementRow
                          label="Cash from Operations"
                          values={sortedYears.map(y => (typeof (cfData[y]?.operatingCashFlow) === 'string' ? parseFloat(cfData[y]?.operatingCashFlow as string) : (cfData[y]?.operatingCashFlow as number)) || 0)}
                          isTotal
                        />
                        <StatementRow
                          label="Cash from Investing"
                          values={sortedYears.map(y => (typeof (cfData[y]?.investingCashFlow) === 'string' ? parseFloat(cfData[y]?.investingCashFlow as string) : (cfData[y]?.investingCashFlow as number)) || 0)}
                          isTotal
                        />
                        <StatementRow
                          label="Cash from Financing"
                          values={sortedYears.map(y => (typeof (cfData[y]?.financingCashFlow) === 'string' ? parseFloat(cfData[y]?.financingCashFlow as string) : (cfData[y]?.financingCashFlow as number)) || 0)}
                          isTotal
                        />
                        <tr className="bg-[var(--emerald)]/5 font-bold text-[var(--emerald)]">
                          <td className="py-5 px-8 text-left font-sans uppercase tracking-[0.2em] border-r border-[var(--border)] text-sm">
                            Net Change in Cash
                          </td>
                          {sortedYears.map(y => (
                            <td key={y} className="py-5 px-6 text-right font-mono border-l border-[var(--emerald)]/10">
                              {fmt.accounting((typeof (cfData[y]?.changesInCash) === 'string' ? parseFloat(cfData[y]?.changesInCash as string) : (cfData[y]?.changesInCash as number)) || 0)}
                            </td>
                          ))}
                        </tr>

                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <StatementCharts 
              activeStatement={activeStatement}
              sortedYears={sortedYears}
              displayYears={displayYears}
              isData={isData}
              bsData={bsData}
              cfData={cfData}
            />
          )}
        </section>

        <aside className="xl:col-span-1 flex flex-col gap-8">
          <div className="bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)] opacity-[0.03] blur-3xl pointer-events-none" />
            <h3 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <Calculator className="w-4 h-4 text-[var(--emerald)] drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
              Audit Trail
            </h3>


            <div className="space-y-4">
              {validationResults.length > 0 ? (
                validationResults.map((v, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                      v.pass ? "bg-[var(--emerald)]/5 border-[var(--emerald)]/10 shadow-sm" : "bg-red-500/5 border-red-500/10 shadow-sm"
                    }`}
                  >

                    {v.pass ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--emerald)] mt-0.5 drop-shadow-[0_0_8px_rgba(0,255,187,0.4)]" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 drop-shadow-[0_0_8px_rgba(255,77,77,0.4)]" />
                    )}
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${v.pass ? "text-[var(--emerald)]" : "text-red-400"}`}>
                        {v.test}
                      </span>
                      <span className="text-[10px] text-[var(--text2)] font-mono leading-relaxed opacity-80">{v.message}</span>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12 opacity-30 border border-dashed border-[var(--border)] rounded-2xl">
                  <Calculator className="w-12 h-12 mx-auto mb-4 text-[var(--text3)]" />
                  <p className="text-[9px] uppercase font-mono tracking-[0.3em] leading-relaxed max-w-[150px] mx-auto">
                    Waiting for Audit Initialization
                  </p>
                </div>
              )}
            </div>
          </div>

          {data?.ratios && (
            <>
              <div className="p-10 border-b border-[var(--border)] bg-[var(--bg2)] flex justify-between items-center">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[var(--gold)]">AI Generated Model Insights</h3>
                <div className="px-4 py-1.5 bg-[var(--gold-dim)] rounded-full text-[9px] text-[var(--gold)] font-bold">Zustand Alpha Reactive</div>
              </div>
              <div className="p-10 bg-[var(--bg1)]">
                <div className="space-y-4 font-mono">
                  <RatioRow label="EBITDA Margin" value={(ratios.ebitdaMargin || 0) * 100} unit="%" />
                  <RatioRow label="ROE" value={(ratios.roe || 0) * 100} unit="%" />
                  <RatioRow label="Current Ratio" value={ratios.currentRatio || 0} unit="x" />
                  <RatioRow label="Debt / Equity" value={(ratios.debtToEquity || 0) * 100} unit="%" />
                </div>
              </div>
            </>
          )}

          <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">

            <button className="w-full flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Download className="w-5 h-5 text-[var(--gold)]" />
                <span className="text-[10px] font-bold text-[var(--text1)] uppercase tracking-[0.2em] group-hover:text-[var(--gold)] transition-colors">
                  Export Factbook
                </span>

              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text2)] group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

interface RatioRowProps {
  label: string;
  value: number;
  unit: string;
}

function RatioRow({ label, value, unit }: RatioRowProps) {
  return (
    <div className="flex items-center justify-between text-xs py-2 border-b border-[var(--border)]/30 last:border-0 border-dashed">
      <span className="text-[var(--text3)] uppercase text-[9px] tracking-widest">{label}</span>
      <span className="text-[var(--text1)] font-bold">{value?.toFixed(1)}{unit}</span>
    </div>

  );
}
