// lib/market/yahoo.ts

const toSymbol = (ticker: string) => ticker.endsWith('.SR') ? ticker : `${ticker}.SR`;

export async function fetchBulkQuotes(tickers: string[]) {
  const symbols = tickers.map(toSymbol).join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
  
  try {
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 20 } // Cache for 20s as per requirement
    });
    
    if (!res.ok) throw new Error("Yahoo Finance API error");
    
    const data = await res.json();
    return data.quoteResponse?.result || [];
  } catch (error) {
    console.error("Market data fetch failed:", error);
    return [];
  }
}

// Mock data for initial development if API fails or for symbols
export const TICKERS = [
  { symbol: "2222.SR", name: "Saudi Aramco", price: "28.40", change: "0.15", percent: "0.53", up: true },
  { symbol: "1120.SR", name: "Al Rajhi Bank", price: "87.60", change: "1.20", percent: "1.39", up: true },
  { symbol: "1180.SR", name: "SNB", price: "38.90", change: "1.10", percent: "2.91", up: true },
  { symbol: "7010.SR", name: "STC", price: "41.20", change: "-0.10", percent: "-0.24", up: false },
  { symbol: "2010.SR", name: "SABIC", price: "74.50", change: "0.80", percent: "1.09", up: true },
  { symbol: "1211.SR", name: "Ma'aden", price: "45.10", change: "0.35", percent: "0.78", up: true },
  { symbol: "4003.SR", name: "Extra", price: "92.30", change: "-1.50", percent: "-1.60", up: false },
  { symbol: "2020.SR", name: "SABIC Agri", price: "135.20", change: "2.40", percent: "1.81", up: true },
];
