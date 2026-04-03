"use client";

import React, { useState, useRef } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";

// Tickers are now managed globally in useTerminalStore

const DEPTHS = ["Full Institutional Report", "Quick Summary", "Valuation Focus"];

export function AIResearch() {
  const { selectedTicker, data: globalData, language, setLanguage } = useTerminalStore();
  const isAr = language === "ar";
  const [depth, setDepth] = useState(DEPTHS[0]);
  const [status, setStatus] = useState<"idle" | "streaming" | "done">("idle");
  const [reportText, setReportText] = useState("");
  const [query, setQuery] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const companyName = globalData?.name || selectedTicker;

  const generate = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setStatus("streaming");
    setReportText("");

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: selectedTicker,
          companyName,
          depth,
          lang: language, // Use global language state
          query: query.trim() || null,
          // Pass full institutional context to Gemini
          context: globalData ? {
            metrics: globalData.metrics,
            financials: {
              latestYear: globalData.financials.latestYear,
              currentIS: globalData.financials.income[globalData.financials.latestYear]
            },
            shariah: globalData.shariah
          } : null
        }),
        signal: abortRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE lines
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const json = line.slice(6).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const text =
                parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              setReportText((prev) => prev + text);
            } catch {
              // ignore parse errors in partial SSE chunks
            }
          }
        }
      }
      setStatus("done");
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") setStatus("idle");
    }
  };

  const formattedReport = reportText
    .split("\n")
    .map((line, i) => {
      // Bold section headers like "01 — Executive Summary"
      if (/^\d{2}\s*—/.test(line) || /^#+\s/.test(line)) {
        const clean = line.replace(/^#+\s/, "").replace(/\*\*/g, "");
        return (
          <div key={i} className="report-section-title-native" style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            letterSpacing: ".25em",
            textTransform: "uppercase",
            color: "var(--emerald)",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "32px 0 16px",
          }}>
            {clean}
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, var(--emerald), transparent)", opacity: 0.2 }} />
          </div>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <div key={i} style={{ display: "flex", gap: "10px", fontSize: "16px", lineHeight: 1.8, color: "var(--text2)", marginBottom: "8px", fontWeight: 700 }}>
            <span style={{ color: "var(--emerald)", fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", flexShrink: 0, marginTop: "6px" }}>—</span>
            <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text1);font-weight:800">$1</strong>') }} />
          </div>
        );
      }
      if (line.trim() === "") return <div key={i} style={{ height: "12px" }} />;
      return (
        <p key={i} style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--text2)", marginBottom: "10px", fontWeight: 600 }}
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text1);font-weight:800">$1</strong>') }}
        />
      );

    });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px", alignItems: "start" }}>
      {/* Left config */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", position: "sticky", top: "84px" }}>
        <div className="cfg-card">
          <h3 style={{ fontFamily: isAr ? "'Cairo', serif" : "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--navy)" }}>
            <span style={{ color: "var(--emerald)" }}>✦</span> {isAr ? "مذكرة الأبحاث" : "Research Memo"}
          </h3>

          <div style={{ padding: "12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "10px", marginBottom: "14px" }}>
            <div style={{ fontSize: "10px", color: "var(--t3)", textTransform: "uppercase", marginBottom: "4px" }}>{isAr ? "الأصل المحدد" : "Selected Asset"}</div>
            <div style={{ fontSize: "14px", color: "var(--navy)", fontWeight: 600 }}>{selectedTicker}</div>
            <div style={{ fontSize: "12px", color: "var(--t1)" }}>{companyName}</div>
          </div>

          <label className="input-label-native">{isAr ? "عمق التحليل" : "Analysis Depth"}</label>
          <select className="sel-native" value={depth} onChange={(e) => setDepth(e.target.value)}>
            {DEPTHS.map((d) => <option key={d}>{d}</option>)}
          </select>

          <label className="input-label-native">{isAr ? "سؤال بحثي مخصص" : "Custom Research Question"}</label>
          <textarea 
            className="sel-native min-h-[100px] resize-none py-3" 
            placeholder={isAr ? "مثال: ما هي أحدث توزيعات الأرباح؟" : "e.g. What are the latest dividend announcements?"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 mb-4">
            {(isAr 
              ? ["توقعات ٢٠٢٥", "تحليل المنافسين", "أثر الزكاة"] 
              : ["2025 Outlook", "Peer Analysis", "Zakat Impact"]
            ).map((q) => (
              <button 
                key={q} 
                onClick={() => setQuery(q)}
                className="text-[10px] px-2 py-1 rounded bg-[var(--bg3)] border border-[var(--border)] text-[var(--text2)] hover:border-[var(--emerald)] transition-all"
              >
                + {q}
              </button>
            ))}
          </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px" }}>
              {(["en", "ar"] as const).map((l) => (

                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    language === l ? "bg-[var(--emerald)] text-white shadow-lg shadow-emerald-500/20" : "text-[var(--text3)] hover:text-[var(--text1)]"
                  }`}

                  style={{ fontFamily: l === "ar" ? "'Cairo', sans-serif" : "'IBM Plex Mono', sans-serif" }}
                >
                  {l === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>

          <button onClick={generate} disabled={status === "streaming"} style={{
            width: "100%", padding: "10px 22px", borderRadius: "10px", background: "var(--emerald)",
            color: "white", border: "none", fontSize: "12px", fontWeight: 700, letterSpacing: ".04em",
            cursor: status === "streaming" ? "not-allowed" : "pointer", opacity: status === "streaming" ? .7 : 1,

            fontFamily: isAr ? "'Cairo', sans-serif" : "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
            transition: "all .2s",
          }}>
            <span>{status === "streaming" ? "⟳" : "✦"}</span>
            <span>{status === "idle" ? (isAr ? "توليد المذكرة" : "Generate Memo") : status === "streaming" ? (isAr ? "جاري التوليد…" : "Generating…") : (isAr ? "إعادة التوليد" : "Regenerate")}</span>
          </button>
        </div>

        {/* Engine info card */}
        <div className="cfg-card">
          <h3 style={{ fontFamily: isAr ? "'Cairo', serif" : "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
            {isAr ? "محرك الاستخبارات" : "Intelligence Engine"}
          </h3>
          <p style={{ fontSize: "12px", lineHeight: 1.7, color: "var(--t2)", marginBottom: "12px" }}>
            {isAr 
              ? "مدعوم بواسطة Gemini 2.0 Flash مع سياق مالي سعودي، معالجة الزكاة، معايير إفصاح هيئة السوق المالية، ورسم خرائط قطاعات رؤية 2030." 
              : "Powered by Gemini 2.0 Flash with KSA financial context, Zakat treatment, CMA disclosure standards, and Vision 2030 sector mapping."}
          </p>
          {(isAr 
            ? ["متوافق مع معايير المحاسبة الدولية + الزكاة", "تذييل إخلاء مسؤولية CMA آلي", "سياق قطاعات رؤية ٢٠٣٠", "مخرجات ثنائية اللغة EN / AR"]
            : ["IFRS + Zakat aware","CMA disclaimer auto-appended","Vision 2030 sector context","Bilingual EN / AR output"]
          ).map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 600, color: "var(--t2)", marginBottom: "6px" }}>
              <span style={{ color: "var(--emerald)" }}>✓</span> {f}
            </div>

          ))}
        </div>

        <div style={{ padding: "12px", background: "var(--bg3)", border: "1px solid var(--b1)", borderRadius: "10px", fontSize: "11px", lineHeight: 1.6, color: "var(--t3)" }}>
          <strong style={{ color: "var(--warn)", fontSize: "10px" }}>{isAr ? "⚠ تنبيه هيئة السوق المالية" : "⚠ CMA Notice"}</strong><br />
          {isAr 
            ? "هذا التقرير تم توليده بواسطة الذكاء الاصطناعي للأغراض المعلوماتية فقط. لا يعتبر نصيحة استثمارية. ليس بحثاً مراقباً من قبل هيئة السوق المالية." 
            : "This report is AI-generated for informational purposes only. Not investment advice. Not CMA-regulated research."}
        </div>
      </div>

      {/* Right report shell */}
      <div style={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: "18px", overflow: "hidden", minHeight: "600px", boxShadow: "0 15px 40px rgba(14,124,105,0.03)" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {["#FF4D4D", "#FFD43B", "#00FFD1"].map((c) => <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}44` }} />)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 700 }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: status === "streaming" ? "var(--emerald)" : status === "done" ? "var(--pos)" : "rgba(13,29,56,0.1)", animation: status === "streaming" ? "pulse-ai 1s ease-in-out infinite" : "none", boxShadow: status !== "idle" ? "0 0 8px currentColor" : "none" }} />
              <span style={{ color: "var(--text3)" }}>{status === "idle" ? "Ready" : status === "streaming" ? (isAr ? "بحث فوري..." : "Live Grounding...") : "Complete"}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => navigator.clipboard.writeText(reportText)} style={{ padding: "7px 16px", borderRadius: "10px", background: "transparent", color: "var(--t2)", border: "1px solid var(--b2)", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              ⎘ Copy
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "36px 40px", minHeight: "540px" }}>
          {status === "idle" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 40px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px", opacity: .2 }}>✦</div>
              <div style={{ fontFamily: isAr ? "'Cairo', serif" : "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 300, color: "var(--t2)", marginBottom: "12px" }}>
                {isAr ? "اختر شركة وقم بتوليد مذكرة بحثية" : "Select a company and generate a memo"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--t3)", maxWidth: "360px", lineHeight: 1.7 }}>
                {isAr 
                  ? "أبحاث أسهم من الدرجة المؤسسية مع معالجة الزكاة، سياق رؤية 2030، ولغة متوافقة مع هيئة السوق المالية - يتم توليدها في ثوانٍ." 
                  : "Institutional-grade equity research with Zakat treatment, Vision 2030 context, and CMA-compliant language — generated in seconds."}
              </div>
            </div>
          )}

          {(status === "streaming" || status === "done") && (
            <div dir={isAr ? "rtl" : "ltr"}>
              {formattedReport}
              {status === "streaming" && (
                <span style={{ display: "inline-block", width: "7px", height: "14px", background: "var(--emerald)", [isAr ? "marginRight" : "marginLeft"]: "2px", verticalAlign: "middle", animation: "blink-ai .9s step-end infinite" }} />
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cfg-card { background: var(--bg1); border: 1px solid var(--border); border-radius: 18px; padding: 22px; box-shadow: 0 10px 30px rgba(14,124,105,0.03); }
        .input-label-native { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: .15em; text-transform: uppercase; color: var(--text3); margin-bottom: 6px; display: block; margin-top: 10px; font-weight: 700; }
        .input-label-native:first-of-type { margin-top: 0; }
        .sel-native { width: 100%; background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; padding: 9px 12px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--text1); outline: none; appearance: none; margin-bottom: 14px; transition: border-color .2s; font-weight: 700; }
        .sel-native:focus { border-color: var(--emerald); }

        @keyframes pulse-ai { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes blink-ai { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
