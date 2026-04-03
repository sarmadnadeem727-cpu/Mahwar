// app/api/debug-env/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const googleKey = process.env.GOOGLE_API_KEY;
  const eodhdKey = process.env.EODHD_API_KEY;

  const status = {
    GOOGLE_API_KEY: googleKey ? `Present (Length: ${googleKey.length}, Starts with: ${googleKey.substring(0, 4)}...)` : "MISSING",
    EODHD_API_KEY: eodhdKey ? `Present (Length: ${eodhdKey.length}, Starts with: ${eodhdKey.substring(0, 4)}...)` : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  };

  // Test Gemini connectivity
  let geminiTest = "Not attempted";
  if (googleKey) {
    try {
      const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] }),
      });
      const gData = await gRes.json();
      if (gRes.ok) {
        geminiTest = "SUCCESS: API Key is valid and can reach Gemini 1.5 Flash";
      } else {
        geminiTest = `FAILED: ${gRes.status} - ${JSON.stringify(gData.error || gData)}`;
      }
    } catch (e: unknown) {
      geminiTest = `ERROR: ${(e as Error).message}`;
    }
  }

  return NextResponse.json({
    env_status: status,
    gemini_test: geminiTest,
    tip: "If keys are MISSING, ensure your file is named exactly '.env' or '.env.local' in the root directory and you have restarted the dev server."
  });
}
