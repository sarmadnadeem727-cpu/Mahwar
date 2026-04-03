// app/api/market/quote/route.ts
// Server-side proxy for EODHD real-time quote — avoids client-side CORS issues

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const EODHD_KEY = process.env.EODHD_API_KEY;
  
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "ticker required" }, { status: 400 });
  }

  if (!EODHD_KEY) {
    return NextResponse.json({ error: "EODHD_API_KEY not configured in .env" }, { status: 500 });
  }

  const sym = ticker.endsWith(".SR") ? ticker : `${ticker}.SR`;
  const url = `https://eodhd.com/api/real-time/${sym}?api_token=${EODHD_KEY}&fmt=json`;

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `EODHD error: ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("Quote proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}
