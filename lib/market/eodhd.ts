// lib/market/eodhd.ts

const EODHD_KEY = process.env.EODHD_API_KEY || "69bc121ece73d1.84742044";

export async function fetchFundamentals(ticker: string) {
  const sym = ticker.endsWith(".SR") ? ticker : `${ticker}.SR`;
  const url = `https://eodhd.com/api/fundamentals/${sym}?api_token=${EODHD_KEY}&fmt=json`;
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) throw new Error("EODHD API error");
    return res.json();
  } catch (error) {
    console.error("Fundamentals fetch failed:", error);
    return null;
  }
}

export async function fetchRealTimeQuote(ticker: string) {
  const sym = ticker.endsWith(".SR") ? ticker : `${ticker}.SR`;
  const url = `https://eodhd.com/api/real-time/${sym}?api_token=${EODHD_KEY}&fmt=json`;
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 20 } // Cache for 20s
    });
    if (!res.ok) throw new Error("EODHD Quote API error");
    return res.json();
  } catch (error) {
    console.error("Quote fetch failed:", error);
    return null;
  }
}
