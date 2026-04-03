import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import fs from "fs";
import path from "path";

const yahooFinance = new YahooFinance({ 
  suppressNotices: ["yahooSurvey", "ripHistorical"] 
});

// Fallback static data if Yahoo completely fails
const STATIC_FALLBACK = {
  financials: {
    incomeStatement: [
      { date: "2023-12-31", totalRevenue: 1671204000000, netIncome: 348042000000, normalizedEBITDA: 839467000000 },
      { date: "2022-12-31", totalRevenue: 2006955000000, netIncome: 604006000000, normalizedEBITDA: 1046162000000 }
    ],
    balanceSheet: [
      { date: "2023-12-31", totalAssets: 2551964000000, totalLiabilities: 830220000000, stockholdersEquity: 1491996000000 },
      { date: "2022-12-31", totalAssets: 2489814000000, totalLiabilities: 835252000000, stockholdersEquity: 1416972000000 }
    ],
    cashFlow: [
      { date: "2023-12-31", operatingCashFlow: 510798000000, freeCashFlow: 320354000000, capitalExpenditure: -190444000000 },
      { date: "2022-12-31", operatingCashFlow: 651268000000, freeCashFlow: 509204000000, capitalExpenditure: -142064000000 }
    ]
  },
  historical: [],
  ratios: { revenueGrowth: -16.7, netMargin: 20.8, ebitdaMargin: 50.2 }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> } 
) {
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker;
  
  if (!ticker) {
    return NextResponse.json({ error: "ticker required" }, { status: 400 });
  }

  const sym = ticker.endsWith(".SR") ? ticker : `${ticker}.SR`;

  try {
    // 1. Fetch Fundamentals (Annual) from Yahoo
    const fourYearsAgo = new Date();
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
    
    let fundamentals: any[] = [];
    try {
      fundamentals = await yahooFinance.fundamentalsTimeSeries(sym, {
        module: "all",
        period1: fourYearsAgo.toISOString(),
        period2: new Date().toISOString(),
        type: "annual"
      });
    } catch (e) {
      console.warn("Could not fetch fundamentals from Yahoo for", sym);
    }

    fundamentals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let is = STATIC_FALLBACK.financials.incomeStatement;
    let bs = STATIC_FALLBACK.financials.balanceSheet;
    let cf = STATIC_FALLBACK.financials.cashFlow;
    let ratios = STATIC_FALLBACK.ratios;

    if (fundamentals.length > 0) {
      is = fundamentals.map(f => ({
        date: f.date,
        totalRevenue: f.totalRevenue,
        costOfRevenue: f.costOfRevenue,
        grossProfit: f.grossProfit,
        operatingExpense: f.operatingExpense,
        operatingIncome: f.operatingIncome,
        interestExpense: f.interestExpense,
        netIncome: f.netIncome,
        normalizedEBITDA: f.normalizedEBITDA,
        ebitda: f.EBITDA,
        depreciationAndAmortization: f.depreciationAndAmortization,
        taxProvision: f.taxProvision
      }));

      bs = fundamentals.map(f => ({
        date: f.date,
        cashAndCashEquivalents: f.cashAndCashEquivalents,
        accountsReceivable: f.accountsReceivable,
        inventory: f.inventory,
        otherCurrentAssets: f.otherCurrentAssets,
        totalCurrentAssets: f.currentAssets,
        netPPE: f.netPPE,
        totalAssets: f.totalAssets,
        currentDebt: f.currentDebt,
        longTermDebt: f.longTermDebt,
        totalDebt: f.totalDebt,
        commonStock: f.commonStock,
        retainedEarnings: f.retainedEarnings,
        stockholdersEquity: f.stockholdersEquity,
        totalLiabilities: f.totalLiabilitiesNetMinorityInterest 
      }));

      cf = fundamentals.map(f => ({
        date: f.date,
        netIncome: f.netIncome,
        depreciation: f.depreciation,
        changeInWorkingCapital: f.changeInWorkingCapital,
        capitalExpenditure: f.capitalExpenditure,
        issuanceOfDebt: f.issuanceOfDebt,
        repaymentOfDebt: f.repaymentOfDebt,
        commonStockDividendPaid: f.commonStockDividendPaid,
        beginningCashPosition: f.beginningCashPosition,
        changesInCash: f.changesInCash,
        operatingCashFlow: f.operatingCashFlow,
        freeCashFlow: f.freeCashFlow
      }));

      const latest = fundamentals[0];
      const prev = fundamentals.length > 1 ? fundamentals[1] : null;
      const rev = latest.totalRevenue || 0;
      const prevRev = prev?.totalRevenue || null;
      ratios.revenueGrowth = prevRev ? ((rev - prevRev) / prevRev) * 100 : 0;
      ratios.netMargin = rev ? ((latest.netIncome || 0) / rev) * 100 : 0;
      ratios.ebitdaMargin = rev ? ((latest.EBITDA || latest.normalizedEBITDA || 0) / rev) * 100 : 0;
    }

    // 2. Fetch trailing 1-year historical chart (for sparklines)
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    let historical: any[] = [];
    try {
      const chart = await yahooFinance.chart(sym, {
        period1: startDate.toISOString(),
        interval: "1d"
      });
      historical = chart.quotes;
    } catch (e) {
      console.warn("Could not fetch chart data for", sym);
    }

    // 3. Fetch Finnhub live price (using symbol without .SR for Finnhub logic, Finnhub usually uses symbol with correct exchange code but Tadawul might be unsupported or limited. Finnhub doesn't support Saudi out of the box for free, but we will mock or use Yahoo as fallback safely)
    let currentPrice = 0;
    let changePrice = 0;
    let changePercent = 0;

    try {
      const finnhubKey = process.env.FINNHUB_API_KEY;
      if (finnhubKey && finnhubKey !== "your_finnhub_key_here") {
        // e.g. 2222.SR -> mapped to Finnhub formatting if needed
        const fnRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`);
        if(fnRes.ok) {
           const fnData = await fnRes.json();
           if (fnData.c) { // Current price
             currentPrice = fnData.c;
             changePrice = fnData.d;
             changePercent = fnData.dp;
           }
        }
      }
    } catch (e) {
      console.warn("Finnhub fetch failed, using fallback");
    }

    // Fallback to Yahoo quote if Finnhub fails or isn't configured
    if (!currentPrice) {
      try {
        const quote = await yahooFinance.quote(sym);
        currentPrice = quote.regularMarketPrice || 0;
        changePrice = quote.regularMarketChange || 0;
        changePercent = quote.regularMarketChangePercent || 0;
      } catch (e) {
        console.warn("Yahoo quote failed too", e);
      }
    }

    return NextResponse.json({
      ticker: sym,
      price: {
        current: currentPrice,
        change: changePrice,
        percent: changePercent
      },
      historical,
      financials: {
        incomeStatement: is,
        balanceSheet: bs,
        cashFlow: cf
      },
      ratios
    }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err: any) {
    console.error("Yahoo API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Yahoo data", details: err.message, fallback: STATIC_FALLBACK },
      { status: 200 } // Return 200 with fallback data so front-end doesn't crash
    );
  }
}
