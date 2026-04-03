import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// We extend the typings explicitly since jspdf-autotable modifies it at runtime
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportDCFToExcel(
  companyName: string,
  ticker: string,
  projections: any[],
  inputs: Record<string, any>,
  valuation: any
) {
  const wb = XLSX.utils.book_new();

  // 1. Valuation Summary
  const summaryData = [
    ["Mahwar DCF Valuation Report"],
    ["Company", companyName],
    ["Ticker", ticker],
    ["Date", new Date().toLocaleDateString()],
    [],
    ["Key Valuation Outputs", "Value (SAR)"],
    ["Implied Share Price", valuation.impliedSharePrice],
    ["Enterprise Value", valuation.enterpriseValue],
    ["Equity Value", valuation.equityValue],
    ["PV of Cash Flows", valuation.pvProjectionPeriod],
    ["PV of Terminal Value", valuation.pvTerminalValue],
    [],
    ["Model Parameters", "Value"],
    ["Risk-Free Rate", inputs.rfRate + "%"],
    ["Equity Risk Premium", inputs.erp + "%"],
    ["Beta", inputs.beta],
    ["Cost of Debt", inputs.costOfDebt + "%"],
    ["Tax Rate", inputs.taxRate + "%"],
    ["Zakat Rate (ZATCA)", inputs.zakatRate + "%"],
    ["WACC", (valuation.wacc * 100).toFixed(2) + "%"]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Valuation Summary");

  // 2. Unlevered Free Cash Flow Projections
  const projectionHeaders = [
    "Year",
    "Revenue",
    "EBITDA",
    "NOPAT",
    "Zakat Expense",
    "D&A",
    "CapEx",
    "Change in NWC",
    "Unlevered FCF",
    "Discount Factor",
    "PV of FCF"
  ];
  
  const projectionRows = projections.map(p => [
    p.year,
    p.revenue,
    p.revenue * (inputs.ebitdaMargin / 100),
    p.nopat,
    p.zakatExpense || 0,
    p.dAndA,
    p.capex,
    p.deltaNwc,
    p.fcff,
    p.discountFactor,
    p.pvFcff
  ]);

  const projectionSheet = XLSX.utils.aoa_to_sheet([projectionHeaders, ...projectionRows]);
  XLSX.utils.book_append_sheet(wb, projectionSheet, "DCF Projections");

  XLSX.writeFile(wb, `${ticker}_DCF_Model_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportDCFToPDF(
  companyName: string,
  ticker: string,
  projections: any[],
  inputs: Record<string, any>,
  valuation: any
) {
  const doc = new jsPDF("landscape");
  
  doc.setFontSize(20);
  doc.text("Mahwar Institutional DCF Report", 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Target: ${companyName} (${ticker})`, 14, 32);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

  doc.autoTable({
    startY: 45,
    head: [['Valuation Output', 'SARm']],
    body: [
      ['Implied Share Price', valuation.impliedSharePrice.toFixed(2)],
      ['Enterprise Value', valuation.enterpriseValue.toFixed(2)],
      ['WACC', (valuation.wacc * 100).toFixed(2) + '%'],
      ['PV of Terminal Value', valuation.pvTerminalValue.toFixed(2)],
      ['PV of Cash Flows', valuation.pvProjectionPeriod.toFixed(2)]
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] } // Emerald
  });

  const projectionHeaders = [
    "Year",
    "Revenue",
    "NOPAT",
    "Zakat",
    "D&A",
    "CapEx",
    "NWC",
    "UFCF",
    "PV of FCF"
  ];

  const projectionRows = projections.map(p => [
    p.year,
    p.revenue.toFixed(1),
    p.nopat.toFixed(1),
    (p.zakatExpense || 0).toFixed(1),
    p.dAndA.toFixed(1),
    `(${p.capex.toFixed(1)})`,
    `(${p.deltaNwc.toFixed(1)})`,
    p.fcff.toFixed(1),
    p.pvFcff.toFixed(1)
  ]);

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [projectionHeaders],
    body: projectionRows,
    theme: 'grid',
    headStyles: { fillColor: [40, 50, 70] } // Navy
  });

  doc.save(`${ticker}_DCF_Report.pdf`);
}

export function exportFactbookToExcel(ticker: string, isData: Record<string, any>) {
  const wb = XLSX.utils.book_new();
  const sortedYears = Object.keys(isData).sort().reverse().slice(0, 4);
  
  const headers = ["Metric", ...sortedYears];
  const ws = XLSX.utils.aoa_to_sheet([headers]);

  const rev = ["Revenue", ...sortedYears.map(y => isData[y]?.totalRevenue || 0)];
  const cogs = ["COGS", ...sortedYears.map(y => -(isData[y]?.costOfRevenue || 0))];
  
  XLSX.utils.sheet_add_aoa(ws, [rev, cogs], { origin: -1 });

  // Live Formula for Gross Profit (Row 2 + Row 3)
  const columns = ['B', 'C', 'D', 'E'];
  const gpRow = [
    "Gross Profit",
    ...sortedYears.map((_, i) => {
      const col = columns[i];
      if (!col) return 0;
      return { t: 'n', f: `${col}2+${col}3` };
    })
  ];
  XLSX.utils.sheet_add_aoa(ws, [gpRow], { origin: -1 });

  XLSX.utils.book_append_sheet(wb, ws, "Financials");
  XLSX.writeFile(wb, `${ticker}_Factbook.xlsx`);
}

export function exportFactbookToPDF(globalData: any, sortedYears: string[]) {
  const doc = new jsPDF("portrait");
  
  // Page 1: Exec Summary & Meta
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Deep slate
  doc.text("Mahwar Factbook", 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`${globalData?.name || 'Company'} (${globalData?.ticker || 'TICKER'})`, 14, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
  
  const isCompliant = globalData?.shariah?.isCompliant;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Shariah Compliance Status:", 14, 55);
  doc.setTextColor(isCompliant ? 16 : 220, isCompliant ? 185 : 38, isCompliant ? 129 : 38);
  doc.text(isCompliant ? "COMPLIANT" : "NON-COMPLIANT", 75, 55);

  doc.setTextColor(15, 23, 42);
  doc.text(`Cash Ratio: ${globalData?.shariah?.ratios?.cash || 0}%`, 14, 65);
  doc.text(`Debt Ratio: ${globalData?.shariah?.ratios?.debt || 0}%`, 14, 73);

  // Page 2: Financials
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("3-Statement Financials", 14, 20);
  
  const isData = globalData?.financials?.income || {};
  const incomeRows = [
    ["Revenue", ...sortedYears.map(y => (isData[y]?.totalRevenue || 0).toFixed(1))],
    ["COGS", ...sortedYears.map(y => (isData[y]?.costOfRevenue || 0).toFixed(1))],
    ["Gross Profit", ...sortedYears.map(y => (isData[y]?.grossProfit || 0).toFixed(1))],
    ["EBITDA", ...sortedYears.map(y => (isData[y]?.EBITDA || 0).toFixed(1))],
    ["Net Income", ...sortedYears.map(y => (isData[y]?.netIncome || 0).toFixed(1))]
  ];
  
  doc.autoTable({
    startY: 30,
    head: [["Income Statement", ...sortedYears]],
    body: incomeRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] } // Navy
  });

  doc.save(`${globalData?.ticker || 'TICKER'}_Mahwar_Factbook.pdf`);
}
