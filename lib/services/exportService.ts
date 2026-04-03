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
