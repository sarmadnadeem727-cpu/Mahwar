import { IncomeStatement, BalanceSheet, CashFlow } from "@/lib/finance/threeStatement";

export interface InstitutionalData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePerc: number;
  volume: number;
  mktCap: number;
  historical: Array<{ date: string; close: number }>;
  
  financials: {
    income: Record<string, Record<string, unknown>>;
    balance: Record<string, Record<string, unknown>>;
    cashflow: Record<string, Record<string, unknown>>;
    latestYear: string;
    
    statements: {
      is: IncomeStatement;
      bs: BalanceSheet;
      cf: CashFlow;
      prevBs?: BalanceSheet;
    };
  };

  metrics: {
    pe: number;
    pb: number;
    roe: number;
    currentRatio: number;
    debtToEquity: number;
    sharesOutstanding: number;
    revenueGrowth: number;
    ebitdaMargin: number;
    taxRate: number;
  };

  shariah: {
    isCompliant: boolean;
    ratios: {
      debt: number;     // < 33%
      cash: number;     // < 33%
      ar: number;       // < 49%
      nonPerm: number;  // < 5%
    };
    purificationAmount: number;
  };
}

export async function fetchInstitutionalData(ticker: string): Promise<InstitutionalData> {
  const sym = ticker.endsWith(".SR") ? ticker : `${ticker}.SR`;
  
  try {
    const res = await fetch(`/api/yahoo/${encodeURIComponent(sym)}`);
    if (!res.ok) throw new Error("Terminal data synchronization failed");

    const data = await res.json();
    
    const isArr = data.financials?.incomeStatement || [];
    const bsArr = data.financials?.balanceSheet || [];
    const cfArr = data.financials?.cashFlow || [];
    
    const latestIS = isArr[0] || {};
    const latestBS = bsArr[0] || {};
    const latestCF = cfArr[0] || {};
    const prevBS = bsArr[1] || undefined;
    
    const latestYear = latestIS.date ? new Date(latestIS.date).getFullYear().toString() : new Date().getFullYear().toString();

    // Map to standardized statements expected by the engines
    const parsedIS: IncomeStatement = {
      revenue: latestIS.totalRevenue || 0,
      cogs: latestIS.costOfRevenue || 0,
      ebitda: latestIS.ebitda || latestIS.normalizedEBITDA || 0,
      da: latestIS.depreciationAndAmortization || 0,
      interestExpense: latestIS.interestExpense || 0,
      zakatExpense: latestIS.taxProvision || 0,
    };

    const parsedBS: BalanceSheet = {
      cash: latestBS.cashAndCashEquivalents || 0,
      accountsReceivable: latestBS.accountsReceivable || 0,
      inventory: latestBS.inventory || 0,
      otherCurrentAssets: latestBS.otherCurrentAssets || 0,
      ppeNet: latestBS.netPPE || 0,
      totalCurrentAssets: latestBS.totalCurrentAssets || 0,
      shortTermDebt: latestBS.currentDebt || 0,
      longTermDebt: latestBS.longTermDebt || 0,
      shareCapital: latestBS.commonStock || 0,
      statutoryReserve: (latestBS.retainedEarnings || 0) * 0.1, 
      retainedEarnings: latestBS.retainedEarnings || 0,
    };
    
    let parsedPrevBS: BalanceSheet | undefined = undefined;
    if (prevBS) {
       parsedPrevBS = {
         cash: prevBS.cashAndCashEquivalents || 0,
         accountsReceivable: prevBS.accountsReceivable || 0,
         inventory: prevBS.inventory || 0,
         otherCurrentAssets: prevBS.otherCurrentAssets || 0,
         ppeNet: prevBS.netPPE || 0,
         totalCurrentAssets: prevBS.totalCurrentAssets || 0,
         shortTermDebt: prevBS.currentDebt || 0,
         longTermDebt: prevBS.longTermDebt || 0,
         shareCapital: prevBS.commonStock || 0,
         statutoryReserve: (prevBS.retainedEarnings || 0) * 0.1,
         retainedEarnings: prevBS.retainedEarnings || 0,
       };
    }

    const parsedCF: CashFlow = {
      netIncomeCf: latestCF.netIncome || 0,
      daAddback: latestCF.depreciation || 0,
      workingCapitalChange: latestCF.changeInWorkingCapital || 0,
      capex: latestCF.capitalExpenditure || 0,
      debtIssuance: latestCF.issuanceOfDebt || 0,
      debtRepayment: latestCF.repaymentOfDebt || 0,
      dividendsPaid: latestCF.commonStockDividendPaid || 0,
      openingCash: latestCF.beginningCashPosition || 0,
      changeInCash: latestCF.changesInCash || 0,
    };

    const totalAssets = latestBS.totalAssets || 1;
    const totalLiabilities = latestBS.totalLiabilities || 0;
    const totalEquity = latestBS.stockholdersEquity || 1;
    const netIncome = latestIS.netIncome || 0;
    
    // Yahoo mostly gives shares separately or we compute it
    const shares = data.quoteSummary?.defaultKeyStatistics?.sharesOutstanding || (data.price?.current ? (data.quoteSummary?.summaryDetail?.marketCap / data.price.current) : 1000000000) || 1000000000;
    const price = data.price?.current || 1;
    const mktCap = price * shares;

    const pe = (netIncome > 0) ? (mktCap / netIncome) : 0;
    const pb = mktCap / totalEquity;
    const roe = (netIncome / totalEquity) * 100;
    const revGrowth = data.ratios?.revenueGrowth || 0;
    const ebitdaMargin = data.ratios?.ebitdaMargin || 0;

    // Shariah Ratios
    const debtToAssets = ((latestBS.currentDebt || 0) + (latestBS.longTermDebt || 0)) / totalAssets * 100;
    const cashToAssets = (latestBS.cashAndCashEquivalents || 0) / totalAssets * 100;
    const arToAssets = (latestBS.accountsReceivable || 0) / totalAssets * 100;
    const nonPermToRev = 0; 
    const isShariahCompliant = debtToAssets < 33 && cashToAssets < 33 && arToAssets < 49;

    // Legacy EODHD yearly formats (some legacy components might expect it)
    const isYearlyRaw: Record<string, any> = {};
    const bsYearlyRaw: Record<string, any> = {};
    const cfYearlyRaw: Record<string, any> = {};
    
    isArr.forEach((item: any) => {
      if(!item.date) return;
      const year = new Date(item.date).getFullYear().toString();
      isYearlyRaw[year] = { ...item };
    });
    bsArr.forEach((item: any) => {
      if(!item.date) return;
      const year = new Date(item.date).getFullYear().toString();
      bsYearlyRaw[year] = { ...item };
    });
    cfArr.forEach((item: any) => {
      if(!item.date) return;
      const year = new Date(item.date).getFullYear().toString();
      cfYearlyRaw[year] = { ...item };
    });

    return {
      ticker,
      name: data.quoteSummary?.price?.longName || data.quoteSummary?.price?.shortName || ticker,
      price,
      change: data.price?.change || 0,
      changePerc: data.price?.percent || 0,
      volume: data.quoteSummary?.summaryDetail?.volume || 0,
      mktCap,
      historical: data.historical || [],
      financials: {
        income: isYearlyRaw,
        balance: bsYearlyRaw,
        cashflow: cfYearlyRaw,
        latestYear,
        statements: {
          is: parsedIS,
          bs: parsedBS,
          cf: parsedCF,
          prevBs: parsedPrevBS
        }
      },
      metrics: {
        pe,
        pb,
        roe,
        currentRatio: (parsedBS.totalCurrentAssets || 0) / ((latestBS.totalLiabilities || 1) * 0.3), 
        debtToEquity: (totalLiabilities / totalEquity) * 100,
        sharesOutstanding: shares,
        revenueGrowth: revGrowth,
        ebitdaMargin,
        taxRate: ((parsedIS.zakatExpense || 0) / (netIncome + (parsedIS.zakatExpense || 0) || 1)) * 100
      },
      shariah: {
        isCompliant: isShariahCompliant,
        ratios: {
          debt: debtToAssets,
          cash: cashToAssets,
          ar: arToAssets,
          nonPerm: nonPermToRev
        },
        purificationAmount: 0 
      }
    };
  } catch (err) {
    console.error("fetchInstitutionalData error:", err);
    throw err;
  }
}
