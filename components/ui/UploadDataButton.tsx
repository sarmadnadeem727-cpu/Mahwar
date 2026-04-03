"use client";

import React, { useRef } from "react";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { InstitutionalData } from "@/lib/services/terminalService";

export function UploadDataButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadCustomData, language } = useTerminalStore();
  const isAr = language === "ar";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // We attempt a generic map: look for a known 'Year' or first string key...
      // For a robust institutional product, we enforce standard mapping, but here we do best-effort heuristic
      try {
        const generatedData = mapExcelToInstitutionalData(file.name, data);
        loadCustomData(generatedData, `[CUSTOM] ${file.name.replace('.xlsx', '').replace('.csv', '')}`);
      } catch (err) {
        console.error("Failed to parse", err);
        alert(isAr ? "فشل تحليل الملف. تأكد من استخدام نموذج الأكسيل المعياري." : "Failed to parse file. Please use standard headers.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset
  };

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center justify-center gap-2 h-10 px-4 border border-[var(--emerald)]/30 text-[var(--emerald)] bg-[var(--emerald)]/5 hover:bg-[var(--emerald)] hover:text-white rounded-lg transition-colors text-sm font-bold ${isAr ? 'font-arabic' : 'font-sans'}`}
      >
        <Upload size={16} />
        {isAr ? "رفع ملف" : "Upload Sheet"}
      </button>
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
    </>
  );
}

function mapExcelToInstitutionalData(fileName: string, rows: any[]): InstitutionalData {
  // Defensive fallbacks to satisfy UI requirements when a custom spreadsheet is uploaded
  // Assume rows contain: Year, Revenue, Net Income, Total Assets, Total Debt, Cash and Equivalents
  
  const income: Record<string, any> = {};
  const balance: Record<string, any> = {};
  const cashflow: Record<string, any> = {};
  let latestYear = "2024";

  rows.forEach((row, i) => {
    const yKey = row['Year'] || row['year'] || row['Date'] || (new Date().getFullYear() - rows.length + i + 1).toString();
    const strY = String(yKey);
    latestYear = strY; // will capture the last row as the latest

    // Map keys via heuristic ignoring case
    const findNumeric = (keys: string[]) => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find(x => x.toLowerCase().includes(k));
        if (foundKey && !isNaN(parseFloat(row[foundKey]))) {
          return parseFloat(row[foundKey]);
        }
      }
      return 0; // Default zero to prevent NaN cascades
    };

    const revenue = findNumeric(['rev', 'sales']);
    const netInc = findNumeric(['net inc', 'profit', 'earnings']);
    const cogs = findNumeric(['cogs', 'cost of goods']);
    
    income[strY] = {
      totalRevenue: revenue,
      costOfRevenue: cogs,
      grossProfit: revenue - cogs,
      operatingIncome: findNumeric(['op inc', 'ebit']),
      ebitda: findNumeric(['ebitda']),
      netIncome: netInc,
      researchAndDevelopment: 0,
    };

    balance[strY] = {
      totalAssets: findNumeric(['asset']),
      totalLiabilities: findNumeric(['liab']),
      totalStockholderEquity: findNumeric(['equity']),
      cashAndCashEquivalents: findNumeric(['cash']),
      shortTermDebt: findNumeric(['short', 'current debt']),
      longTermDebt: findNumeric(['long debt', 'non-current']),
      retainedEarnings: 0
    };

    cashflow[strY] = {
      operatingCashflow: findNumeric(['operating cf', 'ocf', 'cfo']),
      investingCashflow: findNumeric(['investing', 'cfi']),
      financingCashflow: findNumeric(['financing', 'cff']),
      capitalExpenditure: Math.abs(findNumeric(['capex', 'capital exp'])),
      freeCashflow: findNumeric(['fcf', 'free cash']),
    };
  });

  return {
    ticker: "USER.UPLOAD",
    name: fileName.split('.')[0],
    price: 100.0,
    change: 0.0,
    changePerc: 0.0,
    volume: 1000000,
    mktCap: 1000000,
    historical: [{ date: "2024-01-01", close: 100 }],
    financials: {
      income,
      balance,
      cashflow,
      latestYear,
      statements: {
        is: income[latestYear] as any,
        bs: balance[latestYear] as any,
        cf: cashflow[latestYear] as any,
      }
    },
    metrics: {
      pe: 12.5,
      pb: 1.5,
      roe: 0.15,
      currentRatio: 1.2,
      debtToEquity: 0.5,
      sharesOutstanding: 1000,
      revenueGrowth: 0.05,
      ebitdaMargin: 0.25,
      taxRate: 0.15
    },
    shariah: {
      isCompliant: true,
      ratios: {
        debt: 0.1,
        cash: 0.05,
        ar: 0.2,
        nonPerm: 0.01,
      },
      purificationAmount: 0.02
    }
  };
}
