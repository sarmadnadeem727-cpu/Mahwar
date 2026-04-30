import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/market/yahoo";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "ticker required" }, { status: 400 });
  }

  try {
    const data = await getQuote(ticker);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("Quote proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}
