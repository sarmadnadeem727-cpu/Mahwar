// app/api/market/fundamentals/route.ts
// Server-side proxy for EODHD fundamentals — avoids client-side CORS issues

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
  const url = `https://eodhd.com/api/fundamentals/${sym}?api_token=${EODHD_KEY}&fmt=json`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `EODHD error: ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err) {
    console.error("Fundamentals proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch fundamentals" }, { status: 500 });
  }
}
