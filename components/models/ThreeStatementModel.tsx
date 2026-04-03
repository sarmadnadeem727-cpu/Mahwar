"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { fmt } from "@/lib/fmt";
import { useThreeStatement } from "@/hooks/useFinancialModels";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useQuery } from "@tanstack/react-query";
import { fetchInstitutionalData } from "@/lib/services/terminalService";
import { exportFactbookToExcel, exportFactbookToPDF } from "@/lib/services/exportService";
import { ModelButton } from "@/components/ui/ModelButton";
import { FileText, CheckCircle2, AlertCircle, Calculator, Download, ChevronRight, BarChart3, Table as TableIcon } from "lucide-react";
import { StatementCharts } from "./StatementCharts";
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
      border-b border-[#334155] transition-colors
      ${isHeader ? "bg-[#1E293B] font-bold text-[#10B981] border-t border-[#334155]" : "hover:bg-[#1E293B]"} 
      ${isTotal ? "font-bold bg-[#0F172A] border-t-[1px] border-[#10B981]/30" : ""}
    `}
    >
      <td
        className={`py-3 px-6 text-left flex items-center gap-3 ${
          indent ? "pl-12 text-[#64748B] text-[11px] italic" : "text-[12px] font-sans text-[#F8FAFC] uppercase tracking-[0.05em] font-semibold"
        }`}
      >
        {!isHeader && !isTotal && !indent && <ChevronRight className="w-3 h-3 text-[#10B981]/40" />}
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-3 px-6 text-right font-mono text-xs border-l border-[#334155] ${
            typeof v === "number" && v < 0 ? "text-red-400" : "text-[#F8FAFC]"
          }`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}

export function ThreeStatementModel() {
  const { validate, data: auditResults, loading } = useThreeStatement();
  const { selectedTicker, currency } = useTerminalStore();
  const [isCommonSize, setIsCommonSize] = useState(false);
  const { convert } = useFX();

  const { data: globalData, isLoading: fetchLoading } = useQuery({
    queryKey: ['financialData', selectedTicker],
    queryFn: () => fetchInstitutionalData(selectedTicker),
    staleTime: 5 * 60 * 1000,
  });

  const [activeStatement, setActiveStatement] = useState<"IS" | "BS" | "CF">("IS");
  const [viewMode, setViewMode] = useState<"table" | "charts">("table");

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

  const isData = (globalData?.financials.income || {}) as Record<string, any>;
  const bsData = (globalData?.financials.balance || {}) as Record<string, any>;
  const cfData = (globalData?.financials.cashflow || {}) as Record<string, any>;
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
    return fmt.accounting(convert(num, 'SAR', currency));
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
      className="flex flex-col gap-8 text-[#F8FAFC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0F172A] border border-[#334155] p-8">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-[#1E293B] flex items-center justify-center border border-[#334155]">
            <FileText className="text-[#10B981] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold uppercase tracking-tighter">Institutional Terminal Mode</h1>
            <p className="text-[#64748B] text-[10px] font-mono tracking-widest uppercase">
              {selectedTicker.replace(".SR", "")} • {currency} • REGIONAL_AUDIT_ENABLED
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
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                activeStatement === s.id ? "bg-[#10B981] border-[#10B981] text-[#020617]" : "border-[#334155] text-[#94A3B8] hover:border-[#10B981]"
              }`}
            >
              {s.label}
            </button>
          ))}
          <div className="w-[1px] h-6 bg-[#334155] mx-2" />
          <button 
            onClick={() => setIsCommonSize(!isCommonSize)}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all ${
              isCommonSize ? "bg-[#F59E0B] border-[#F59E0B] text-[#020617]" : "border-[#334155] text-[#94A3B8]"
            }`}
          >
            Common Size (%)
          </button>
          <ModelButton label="Run Audit" onClick={handleRunSync} loading={loading || fetchLoading} />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-12 xl:col-span-9">
          <div className="bg-[#0F172A] border border-[#334155] overflow-hidden">
            <table className="terminal-table">
              <thead>
                <tr>
                  <th className="w-1/3">Line_Item ({currency}m)</th>
                  {displayYears.map((y) => (
                    <th key={y} className="text-right">{y}</th>
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
          <div className="bg-[#0F172A] border border-[#334155] p-6">
            <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
              <Calculator className="w-4 h-4 text-[#10B981]" />
              Regional Probe
            </h3>
            <div className="space-y-4">
              {validations.map((v, i) => (
                <div key={i} className={`p-4 border ${v.pass ? 'border-[#10B981]/20 bg-[#10B981]/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {v.pass ? <CheckCircle2 className="w-4 text-[#10B981]" /> : <AlertCircle className="w-4 text-red-500" />}
                    <p className={`text-[10px] font-bold uppercase ${v.pass ? 'text-[#10B981]' : 'text-red-500'}`}>{v.test}</p>
                  </div>
                  <p className="text-[10px] font-mono text-[#94A3B8]">{v.message}</p>
                </div>
              ))}
              
              <div className="bg-[#1E293B] p-4 border border-[#334155]">
                <h4 className="text-[9px] font-bold uppercase text-[#F8FAFC] mb-2 tracking-widest">Internal ZATCA Probe</h4>
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-[10px] font-mono text-[#64748B]">Base: {fmt.accounting(convert(zakatBase, 'SAR', currency))}</p>
                     <p className="text-[10px] font-mono text-[#10B981] font-bold">Zakat: {fmt.accounting(convert(zakatZatca, 'SAR', currency))}</p>
                   </div>
                   <div className="text-[8px] bg-[#10B981] text-[#020617] px-1 font-bold">AAOIFI_V2</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-[#334155] p-6">
            <button onClick={() => globalData && exportFactbookToPDF(globalData, sortedYears)} className="w-full flex items-center justify-between text-[#F8FAFC] p-3 hover:bg-[#1E293B] border border-transparent hover:border-[#334155] transition-all mb-2">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Generate Factbook</span>
              </div>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button onClick={() => globalData && exportFactbookToExcel(selectedTicker, isData)} className="w-full flex items-center justify-between text-[#F8FAFC] p-3 hover:bg-[#1E293B] border border-transparent hover:border-[#334155] transition-all">
              <div className="flex items-center gap-3">
                <TableIcon className="w-4 h-4 text-[#10B981]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Excel Formula Export</span>
              </div>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
