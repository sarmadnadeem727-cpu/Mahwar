import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/market/yahoo";

// Full Tadawul major index constituents
const TASI_SYMBOLS = [
  "2222","1180","2010","4001","6010","1211","2280","1010",
  "4100","2270","7010","2330","3010","6020","2120","1050",
  "2050","4030","8010","9200","2090","7070","4321","6004",
  "2381","4080","1832","1150","9515","1202","1120","1140",
  "2060","1060","4007","4003","4008","6090","8200","9510",
];

export async function GET(req: NextRequest) {
  const tickersParam = req.nextUrl.searchParams.get("tickers");

  const symbols = tickersParam
    ? tickersParam.split(",")
    : TASI_SYMBOLS.slice(0, 15); // default: top 15

  try {
    const raw = await getQuote(symbols);
    // getQuote returns array when multiple symbols are queried
    const data = Array.isArray(raw) ? raw : [raw];
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("Live proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch live quotes" }, { status: 500 });
  }
}
