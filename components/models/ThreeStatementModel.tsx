"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { fmt } from "@/lib/fmt";
import { useThreeStatement } from "@/hooks/useFinancialModels";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useMarketData } from "@/hooks/useMarketData";
import { exportFactbookToExcel, exportFactbookToPDF } from "@/lib/services/exportService";
import { ModelButton } from "@/components/ui/ModelButton";
import { FileText, CheckCircle2, AlertCircle, Calculator, Download, ChevronRight, Table as TableIcon } from "lucide-react";
import { useFX } from "@/hooks/useFX";

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
      border-b border-white/5 transition-colors
      ${isHeader ? "bg-white/5 font-bold text-zinc-300 border-t border-white/10" : "hover:bg-white/5"} 
      ${isTotal ? "font-bold bg-white/[0.02] border-t border-white/10" : ""}
    `}
    >
      <td
        className={`py-3 px-6 text-left flex items-center gap-3 ${
          indent ? "pl-12 text-zinc-500 text-[11px]" : "text-[11px] font-sans text-zinc-300 uppercase tracking-widest font-bold"
        }`}
      >
        {!isHeader && !isTotal && !indent && <ChevronRight className="w-3 h-3 text-white/20" />}
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-3 px-6 text-right font-mono text-xs border-l border-white/5 ${
            typeof v === "number" && v < 0 ? "text-rose-400" : "text-zinc-50"
          } ${isTotal ? 'font-bold' : ''}`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}

export function ThreeStatementModel() {
  const { validate, data: auditResults, loading } = useThreeStatement();
  const { activeTicker, currency } = useTerminalStore();
  const [isCommonSize, setIsCommonSize] = useState(false);
  const { convert } = useFX();

  const { data: globalData, isLoading: fetchLoading } = useMarketData(activeTicker);

  const [activeStatement, setActiveStatement] = useState<"IS" | "BS" | "CF">("IS");

  const handleRunSync = useCallback(() => {
    if (globalData && (globalData as any).financials?.statements?.is) {
      validate(
        (globalData as any).financials.statements.is,
        (globalData as any).financials.statements.bs,
        (globalData as any).financials.statements.cf,
        (globalData as any).financials.statements.prevBs
      );
    }
  }, [globalData, validate]);

  const isData = ((globalData as any)?.financials?.income || {}) as Record<string, any>;
  const bsData = ((globalData as any)?.financials?.balance || {}) as Record<string, any>;
  const cfData = ((globalData as any)?.financials?.cashflow || {}) as Record<string, any>;
  const sortedYears = Object.keys(isData).sort().reverse().slice(0, 4);
  const displayYears = sortedYears.map(y => y.split("-")[0] + "A");

  // Regional Compliance Logic: ZATCA Zakat
  const latestBS = bsData[sortedYears[0]] || {};
  const equity = Number(latestBS.stockholdersEquity || 0);
  const longTermLiab = Number(latestBS.longTermDebt || 0); 
  const nonCurrentAssets = Number(latestBS.totalAssets || 0) - Number(latestBS.currentAssets || 0);
  const zakatBase = Math.max(0, equity + longTermLiab - nonCurrentAssets);
  const zakatZatca = zakatBase * 0.025;

  const renderVal = (year: string, rawVal: number | string) => {
    let num = typeof rawVal === 'string' ? parseFloat(rawVal) : (rawVal as number);
    if (isNaN(num)) num = 0;
    
    if (isCommonSize) {
      const rev = Number((isData[year]?.totalRevenue as number) || 1);
      return `${((num / rev) * 100).toFixed(1)}%`;
    }
    // APPLY FX CONVERSION
    return fmt.accounting(convert(num, 'SAR'));
  };

  const validations = [];
  if (globalData) {
    const totalAssets = Number(latestBS.totalAssets || 0);
    const liabEquity = Number(latestBS.totalLiabilitiesNetMinorityInterest || 0) + Number(latestBS.stockholdersEquity || 0);
    validations.push({
      test: "Balance Sheet Reconciliation",
      pass: Math.abs(totalAssets - liabEquity) < 1,
      message: `Assets = Liab+Equity (IFRS Check)`
    });

    const statReserve = Number(latestBS.statutoryReserve || 0);
    validations.push({
      test: "Saudi Statutory Reserve",
      pass: statReserve > 0,
      message: statReserve > 0 ? "Legal 10% transfers documented" : "No explicit statutory reserve found"
    });
  }

  return (
    <motion.div
      className="flex flex-col gap-8 text-zinc-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 p-8 rounded-xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
            <FileText className="text-zinc-50 w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-zinc-50">Institutional Terminal Mode</h1>
            <p className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase mt-1">
              {activeTicker?.replace(".SR", "") || "---"} • {currency} • REGIONAL_AUDIT_ENABLED
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: "IS", label: "Income" },
            { id: "BS", label: "Balance" },
            { id: "CF", label: "Cash" },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStatement(s.id as any)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all rounded-md ${
                activeStatement === s.id ? "bg-zinc-100 border-zinc-100 text-zinc-950" : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-50 hover:bg-white/10"
              }`}
            >
              {s.label}
            </button>
          ))}
          <div className="w-[1px] h-6 bg-white/10 mx-2" />
          <button 
            onClick={() => setIsCommonSize(!isCommonSize)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all rounded-md mr-2 ${
              isCommonSize ? "bg-zinc-100 border-zinc-100 text-zinc-950" : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-50 hover:bg-white/10"
            }`}
          >
            Common Size (%)
          </button>
          <ModelButton label="Run Audit" onClick={handleRunSync} loading={loading || fetchLoading} />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-12 xl:col-span-9">
          <div className="bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="py-4 px-6 font-bold uppercase tracking-widest text-zinc-500 text-[10px] w-1/3">Line_Item ({currency}m)</th>
                  {displayYears.map((y) => (
                    <th key={y} className="py-4 px-6 text-right font-bold uppercase tracking-widest text-zinc-500 text-[10px]">{y}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeStatement === "IS" && (
                  <>
                    <StatementRow label="Revenue" values={sortedYears.map(y => renderVal(y, isData[y]?.totalRevenue))} isTotal />
                    <StatementRow label="Cost of Revenue" values={sortedYears.map(y => renderVal(y, -isData[y]?.costOfRevenue))} indent />
                    <StatementRow label="Gross Profit" values={sortedYears.map(y => renderVal(y, isData[y]?.grossProfit))} isTotal />
                    <StatementRow label="Operating Expenses" values={sortedYears.map(() => "—")} isHeader />
                    <StatementRow label="SG&A" values={sortedYears.map(y => renderVal(y, -isData[y]?.sellingGeneralAndAdministration))} indent />
                    <StatementRow label="EBITDA" values={sortedYears.map(y => renderVal(y, isData[y]?.EBITDA))} isTotal />
                    <StatementRow label="Depreciation & Amortization" values={sortedYears.map(y => renderVal(y, -isData[y]?.depreciationAndAmortization))} indent />
                    <StatementRow label="Operating Income" values={sortedYears.map(y => renderVal(y, isData[y]?.EBIT))} isTotal />
                    <StatementRow label="Zakat & Tax" values={sortedYears.map(y => renderVal(y, -isData[y]?.taxProvision))} indent />
                    <StatementRow label="Net Income" values={sortedYears.map(y => renderVal(y, isData[y]?.netIncome))} isTotal />
                  </>
                )}
                {activeStatement === "BS" && (
                  <>
                    <StatementRow label="Assets" values={sortedYears.map(() => "")} isHeader />
                    <StatementRow label="Cash & Equivalents" values={sortedYears.map(y => renderVal(y, bsData[y]?.cashAndCashEquivalents))} indent />
                    <StatementRow label="Total Current Assets" values={sortedYears.map(y => renderVal(y, bsData[y]?.currentAssets))} isTotal />
                    <StatementRow label="Total Assets" values={sortedYears.map(y => renderVal(y, bsData[y]?.totalAssets))} isTotal />
                    <StatementRow label="Liabilities & Equity" values={sortedYears.map(() => "")} isHeader />
                    <StatementRow label="Total Liabilities" values={sortedYears.map(y => renderVal(y, bsData[y]?.totalLiabilitiesNetMinorityInterest))} isTotal />
                    <StatementRow label="Total Equity" values={sortedYears.map(y => renderVal(y, bsData[y]?.stockholdersEquity))} isTotal />
                  </>
                )}
                {activeStatement === "CF" && (
                  <>
                    <StatementRow label="Cash from Operations" values={sortedYears.map(y => renderVal(y, cfData[y]?.operatingCashFlow))} isTotal />
                    <StatementRow label="Cash from Investing" values={sortedYears.map(y => renderVal(y, cfData[y]?.investingCashFlow))} isTotal />
                    <StatementRow label="Cash from Financing" values={sortedYears.map(y => renderVal(y, cfData[y]?.financingCashFlow))} isTotal />
                    <StatementRow label="Net Change in Cash" values={sortedYears.map(y => renderVal(y, cfData[y]?.changesInCash))} isTotal />
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="col-span-12 xl:col-span-3 space-y-6">
          <div className="bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-3">
              <Calculator className="w-4 h-4 text-zinc-400" />
              Regional Probe
            </h3>
            <div className="space-y-4">
              {validations.map((v, mIdx) => (
                <div key={mIdx} className={`p-4 border rounded-lg ${v.pass ? 'border-zinc-500/20 bg-zinc-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {v.pass ? <CheckCircle2 className="w-4 text-zinc-300" /> : <AlertCircle className="w-4 text-rose-500" />}
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${v.pass ? 'text-zinc-300' : 'text-rose-500'}`}>{v.test}</p>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500">{v.message}</p>
                </div>
              ))}
              
              <div className="bg-white/5 p-4 border border-white/10 rounded-lg">
                <h4 className="text-[9px] font-bold uppercase text-zinc-300 mb-3 tracking-widest">Internal ZATCA Probe</h4>
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-[10px] font-mono text-zinc-500 mb-1">Base: {fmt.accounting(convert(zakatBase, 'SAR'))}</p>
                     <p className="text-[10px] font-mono text-zinc-50 font-bold">Zakat: {fmt.accounting(convert(zakatZatca, 'SAR'))}</p>
                   </div>
                   <div className="text-[8px] border border-white/10 bg-white/5 text-zinc-400 px-2 py-0.5 rounded font-bold uppercase">AAOIFI_V2</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl flex flex-col gap-3">
            <button onClick={() => globalData && exportFactbookToPDF(globalData as any, sortedYears)} className="w-full flex items-center justify-between text-zinc-300 p-4 hover:bg-white/5 border border-white/10 rounded-lg transition-all group">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Generate Factbook</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </button>
            <button onClick={() => globalData && exportFactbookToExcel(activeTicker ?? "N/A", isData)} className="w-full flex items-center justify-between text-zinc-300 p-4 hover:bg-white/5 border border-white/10 rounded-lg transition-all group">
              <div className="flex items-center gap-3">
                <TableIcon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Excel Formula Export</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
