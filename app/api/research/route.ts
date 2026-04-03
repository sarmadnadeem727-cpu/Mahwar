// app/api/research/route.ts
import { NextRequest } from 'next/server';

const COMPANY_CONTEXT: Record<string, string> = {
  '2222': 'Saudi Aramco (2222.SR): World\'s largest oil company, production ~9.4 mbpd, 2P reserves 258.6B BOE, FY2024 revenue ~SAR 1.22T, EBITDA margin ~68%, net income ~SAR 420B, base dividend USD 124.3B/yr, Ghawar field 3.8 mbpd, integrating SABIC chemicals downstream, Jafurah gas ramp-up, Zakat ~SAR 8.4B, ~2.2x Net Debt/EBITDA, current price SAR 28.40.',
  '1180': 'Al Rajhi Bank (1180.SR): Largest Islamic bank globally by assets, Tadawul Banking sector, FY2024 revenue ~SAR 29B, net income ~SAR 15B, ROE 19.8%, net margin 43.2%, P/E 18.4x, P/B 3.2x, dividend yield 2.1%, fully Shariah-compliant retail/corporate banking, strong retail franchise across KSA, Vision 2030 beneficiary via mortgage growth.',
  '2010': 'SABIC (2010.SR): Saudi Basic Industries Corporation, global chemicals & materials leader, majority owned by Saudi Aramco (70%), revenue ~SAR 148B, EBITDA ~SAR 24B, net margin 8.4%, cyclical petrochemicals exposed to feedstock prices, dividend yield 4.2%, Vision 2030 manufacturing hub positioning.',
  '4001': 'STC (4001.SR): Saudi Telecom Company, dominant telecom operator in KSA with ~36M subscribers, 5G network leader, revenue ~SAR 67B, EBITDA ~SAR 22B, net margin 18.7%, dividend yield 5.5%, expanding into digital services and fintech via STC Pay, Vision 2030 digital infrastructure beneficiary.',
  '6010': 'ACWA Power (6010.SR): Leading renewable energy and water developer, 250+ projects in 13 countries, Revenue SAR 8.4B, EBITDA SAR 5.2B, net margin 22.4%, P/E 34.6x (growth premium), key Vision 2030 partner for Saudi Green Initiative, dividend yield 0.8%, Riyad bulk green hydrogen project.',
  '1211': "Ma'aden (1211.SR): Saudi Arabian Mining Company, phosphate, aluminum, gold, revenue SAR 27B, EBITDA SAR 11B, net margin 18.1%, P/E 19.3x, Vision 2030 mining sector champion, Wa'ad Al-Shamal phosphate complex, Maaden Aluminum JV with Alcoa, significant capex cycle underway.",
  '2280': 'Almarai (2280.SR): Largest vertically integrated dairy company in GCC, revenue SAR 20B, EBITDA SAR 4.8B, net margin 11.3%, P/E 28.7x (consumer staple premium), dividend yield 1.8%, bread division contributor, expansion in poultry and baked goods, Shariah-compliant.',
  '1010': 'Riyad Bank (1010.SR): Saudi mid-tier commercial bank, revenue SAR 14B, EBITDA ~SAR 9B, net margin 40.5%, P/E 12.9x, P/B 1.8x, ROE 14.1%, dividend yield 4.8%, conventional banking (non-Islamic), Vision 2030 project financing beneficiary, lower premium vs. Islamic peers.',
};

export async function POST(req: NextRequest) {
  const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY not configured in .env' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = (await req.json()) as {
    ticker: string;
    companyName: string;
    depth: string;
    lang: string;
    context: {
        metrics?: { pe?: number; pb?: number; roe?: number; revenueGrowth?: number; ebitdaMargin?: number };
        shariah?: { isCompliant?: boolean };
        financials?: { latestYear?: string };
    };
    query?: string;
  };
  
  const { ticker, companyName, depth, lang, context: institutionalContext, query } = body;
  
  // Use professional financial data from store if available, else fallback to static context
  let context = "";
  if (institutionalContext && typeof institutionalContext === 'object' && institutionalContext.metrics) {
     context = `STRUCTURED DATA FOR ${ticker}:
       - Name: ${companyName}
       - Metrics: P/E ${institutionalContext.metrics.pe?.toFixed(2)}x, P/B ${institutionalContext.metrics.pb?.toFixed(2)}x, ROE ${institutionalContext.metrics.roe?.toFixed(2)}%
       - Revenue Growth: ${institutionalContext.metrics.revenueGrowth?.toFixed(2)}%
       - EBITDA Margin: ${institutionalContext.metrics.ebitdaMargin?.toFixed(2)}%
       - Shariah Status: ${institutionalContext.shariah?.isCompliant ? "Compliant" : "Non-Compliant"}
       - Latest Year: ${institutionalContext.financials?.latestYear}`;
  } else {
     context = (COMPANY_CONTEXT[ticker] || `${companyName} — Tadawul listed company`);
  }

  const langInstruction = lang === 'ar'
    ? 'Write the entire report in Arabic (العربية). Use formal financial Arabic terminology.'
    : 'Write the entire report in English.';

  const depthInstruction = depth === 'Quick Summary'
    ? 'Write a concise 3-section summary: Executive Summary (3 bullets), Key Financials, and Investment Verdict. Keep it under 400 words.'
    : depth === 'Valuation Focus'
    ? 'Focus primarily on valuation: DCF analysis, comparable company multiples (P/E, EV/EBITDA, P/B vs. peers), target price derivation, and sensitivity. Include financial metrics table.'
    : 'Write a full institutional equity research memo with all 7 sections as specified.';

  const researchFocus = query 
    ? `\nRESEARCH FOCUS: The user has asked a specific question: "${query}". Ensure this question is answered in depth, using the latest real-time search data available. Focus the report sections around this query while maintaining institutional rigor.`
    : '\nRESEARCH FOCUS: Provide a comprehensive state-of-the-market analysis and investment thesis.';

  const prompt = `You are a senior equity analyst at a top-tier Gulf investment bank. Write an institutional-grade equity research memo for the following company.
  
  You MUST use the Google Search tool to find the most recent market events, dividend announcements, and quarterly results (2024/2025) to provide absolute accuracy.

COMPANY DATA:
${context}
${researchFocus}

INSTRUCTIONS:
- ${langInstruction}
- ${depthInstruction}
- Include: Saudi GAAP/IFRS treatment, Zakat considerations (replaces corporate tax for Saudi entities), Vision 2030 sector context, CMA (Capital Market Authority) relevant disclosures.
- Use precise financial language. Include specific numbers, ratios, and year references.
- Format as a structured report with clear section headers.

REPORT STRUCTURE (for full report):
01 — Executive Summary (5-6 bullet points, most important investment thesis points)
02 — Company Overview (business model, revenue streams, market position in KSA)
03 — Financial Analysis (key metrics, margin analysis, Zakat treatment, YoY trends)
04 — Valuation (DCF assumptions, relative value vs. TASI peers, target price and upside %)
05 — Risk Factors (3-4 specific risks with severity: High/Medium/Low)
06 — Catalysts (3-4 near-term positive catalysts)
07 — Final Verdict (recommendation: BUY/HOLD/SELL, target price in SAR, conviction %, total return thesis)

End with a CMA disclaimer paragraph.

Now write the full report:`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }], // Enable Real-Time Grounding
      generationConfig: { temperature: 0.1, maxOutputTokens: 3000 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }

  // Stream raw SSE back to client
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
