import { NextRequest, NextResponse } from "next/server";
import { getFundamentals } from "@/lib/market/yahoo";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "ticker required" }, { status: 400 });
  }

  try {
    const data = await getFundamentals(ticker);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err) {
    console.error("Fundamentals proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch fundamentals" }, { status: 500 });
  }
}
