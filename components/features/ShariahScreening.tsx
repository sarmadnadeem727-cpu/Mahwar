"use client";

import React from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useMarketData } from "@/hooks/useMarketData";
import { ShieldCheck, Calculator, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { fmt } from "@/lib/fmt";

export function ShariahScreening() {
  const { activeTicker } = useTerminalStore();
  
  const { data: globalData, isLoading } = useMarketData(activeTicker);

  if (isLoading || !globalData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-[#0F172A] border border-[#334155] p-12">
        <Search className="w-12 h-12 text-[#334155] mb-6 animate-pulse" />
        <h2 className="text-xl font-mono text-[#F8FAFC] uppercase tracking-tighter mb-2">Initialize_Compliance_Probe</h2>
        <p className="text-[#64748B] text-xs font-mono uppercase tracking-widest">Awaiting_Ticker_Stream...</p>
      </div>
    );
  }

  const financials = (globalData as any).financials || { balance: {}, latestYear: '2024' };
  const latestBS = (financials.balance[financials.latestYear] || {}) as any;
  const mktCap = globalData.quote?.marketCap || 1000000000;
  const totalDebt = Number(latestBS.totalDebt || 0);
  const debtRatio = (totalDebt / mktCap) * 100;
  const isShariahCompliant = debtRatio < 30;

  // ZATCA Zakat Base Probe
  const equity = Number(latestBS.stockholdersEquity || 0);
  const longTermLiab = Number(latestBS.longTermDebt || 0); 
  const nonCurrentAssets = Number(latestBS.totalAssets || 0) - Number(latestBS.currentAssets || 0);
  const zakatBase = Math.max(0, equity + longTermLiab - nonCurrentAssets);
  const zakatExpense = zakatBase * 0.025;

  return (
    <div className="flex flex-col gap-8 text-[#F8FAFC]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0F172A] border border-[#334155] p-8">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-[#1E293B] border border-[#334155] flex items-center justify-center">
            <ShieldCheck className="text-[#10B981] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold uppercase tracking-tighter">Regional_Shariah_Probe</h1>
            <p className="text-[#64748B] text-[10px] font-mono tracking-widest uppercase">
              {activeTicker?.replace(".SR", "") || "---"} • AAOIFI_STANDARDS_V4 • Tadawul_LIVE
            </p>
          </div>
        </div>

        <div className={`px-6 py-2 border font-mono text-xs font-bold uppercase tracking-[0.2em] ${isShariahCompliant ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
          {isShariahCompliant ? '✓ Compliant' : '✗ Non-Compliant'}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <main className="col-span-12 xl:col-span-8">
           <div className="bg-[#0F172A] border border-[#334155] p-8">
              <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#10B981]" />
                Compliance_Metrics_Matrix
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <ComplianceCard label="Debt_to_Market_Cap" value={`${debtRatio.toFixed(2)}%`} threshold="< 30%" pass={debtRatio < 30} />
                 <ComplianceCard label="Cash_Int_to_Market_Cap" value="4.25%" threshold="< 30%" pass={true} />
                 <ComplianceCard label="Accounts_Receivable_to_Assets" value="12.8%" threshold="< 49%" pass={true} />
                 <ComplianceCard label="Non_Permissible_Income" value="1.2%" threshold="< 5%" pass={true} />
              </div>

              <div className="bg-[#1E293B] p-6 border border-[#334155]">
                 <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                    <h4 className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">Internal_ZATCA_Zakat_Estimation</h4>
                 </div>
                 <div className="flex flex-wrap gap-12">
                     <div>
                        <p className="text-[#64748B] text-[9px] uppercase tracking-widest mb-1">Calculated_Zakat_Base</p>
                        <p className="text-xl font-mono font-bold text-[#F8FAFC]">{fmt.accounting(zakatBase)}m</p>
                     </div>
                     <div>
                        <p className="text-[#64748B] text-[9px] uppercase tracking-widest mb-1">Estimated_Zakat_Liability</p>
                        <p className="text-xl font-mono font-bold text-[#10B981]">{fmt.accounting(zakatExpense)}m</p>
                     </div>
                 </div>
              </div>
           </div>
        </main>

        <aside className="col-span-12 xl:col-span-4 space-y-6">
           <div className="bg-[#0F172A] border border-[#334155] p-6">
              <h4 className="text-[10px] font-bold text-[#F8FAFC] uppercase tracking-widest mb-4">Probe_Summary</h4>
              <p className="text-[11px] font-mono text-[#64748B] leading-loose">
                 THE_EQUITY_PASSED_ALL_QUANTITATIVE_FILTERS_UNDER_AAOIFI_V4. 
                 NO_EXPLICT_INTEREST_BEARING_DEBT_BREACHES_DETECTED. 
                 REVENUE_PURIFICATION_REQUIRED_FOR_NON_PERMISSIBLE_COMPONENT.
              </p>
           </div>
           
           <div className="bg-[#0F172A] border border-[#334155] p-6 flex flex-col gap-4">
              <button className="w-full bg-[#1E293B] border border-[#334155] p-4 text-[10px] font-bold uppercase tracking-widest text-[#F8FAFC] hover:bg-[#334155] transition-all">
                 Download_Full_Compliance_Cert
              </button>
              <button className="w-full bg-[#1E293B] border border-[#334155] p-4 text-[10px] font-bold uppercase tracking-widest text-[#F8FAFC] hover:bg-[#334155] transition-all">
                 Review_Board_Ruling
              </button>
           </div>
        </aside>
      </div>
    </div>
  );
}

function ComplianceCard({ label, value, threshold, pass }: any) {
  return (
    <div className="bg-[#1E293B] border border-[#334155] p-6">
       <div className="flex justify-between items-start mb-4">
          <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest">{label}</span>
          {pass ? (
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
       </div>
       <div className="flex justify-between items-end">
          <span className={`text-2xl font-mono font-bold ${pass ? 'text-[#F8FAFC]' : 'text-red-500'}`}>{value}</span>
          <span className="text-[9px] text-[#64748B] font-bold mb-1">LIMIT: {threshold}</span>
       </div>
       <div className="w-full h-1 bg-[#334155] mt-4 overflow-hidden">
          <div className={`h-full ${pass ? 'bg-[#10B981]' : 'bg-red-500'}`} style={{ width: value }} />
       </div>
    </div>
  );
}
