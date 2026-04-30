"use client";

import React, { useState, useRef } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useMarketData } from "@/hooks/useMarketData";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import ReactMarkdown from "react-markdown";

export function AIResearch() {
  const { activeTicker, language, setLanguage } = useTerminalStore();
  const isAr = language === "ar";
  const [status, setStatus] = useState<"idle" | "streaming" | "done">("idle");
  const [reportText, setReportText] = useState("");
  const [query, setQuery] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const { data: globalData, isLoading: fetchLoading } = useMarketData(activeTicker);
  const companyName = globalData?.quote?.longName || globalData?.quote?.shortName || activeTicker || "Unknown";

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
          ticker: activeTicker,
          fundamentals: JSON.stringify(globalData?.fundamentals || {}),
          query: query.trim() || null,
        }),
        signal: abortRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const json = line.slice(6).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-5 items-start">
      {/* Left config */}
      <div className="flex flex-col gap-4 sticky top-[84px]">
        <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-sm">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 text-[#F8FAFC]">
            <span className="text-[#F59E0B]">✦</span> {isAr ? "مذكرة الأبحاث" : "Research Memo"}
          </h3>

          <div className="p-3 bg-[#1E293B] border border-[#334155] rounded-lg mb-4">
            <div className="text-[10px] text-[#64748B] uppercase mb-1">{isAr ? "الأصل المحدد" : "Selected Asset"}</div>
            <div className="text-sm text-[#F8FAFC] font-bold">{activeTicker}</div>
            <div className="text-xs text-[#94A3B8]">{companyName}</div>
          </div>

          <label className="block font-mono text-[9px] tracking-widest uppercase text-[#94A3B8] mb-1 font-bold">
            {isAr ? "سؤال بحثي مخصص" : "Custom Research Question"}
          </label>
          <textarea 
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg p-3 font-mono text-xs text-[#F8FAFC] outline-none appearance-none mb-3 transition-colors focus:border-[#F59E0B] min-h-[100px] resize-none" 
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
                className="text-[10px] px-2 py-1 rounded bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:border-[#F59E0B] transition-all"
              >
                + {q}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1 bg-[#1E293B] border border-[#334155] rounded-lg p-1 mb-4">
            {(["en", "ar"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`py-2 px-4 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                  language === l ? "bg-[#F59E0B] text-[#0F172A]" : "text-[#64748B] hover:text-[#F8FAFC]"
                }`}
                style={{ fontFamily: l === "ar" ? "'Cairo', sans-serif" : "'IBM Plex Mono', sans-serif" }}
              >
                {l === "en" ? "English" : "العربية"}
              </button>
            ))}
          </div>

          <button onClick={generate} disabled={status === "streaming" || fetchLoading} className="w-full py-3 px-5 rounded-lg bg-[#F59E0B] text-[#0F172A] border-none text-xs font-bold tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-sans">
            <span>{status === "streaming" ? "⟳" : "✦"}</span>
            <span>{status === "idle" ? (isAr ? "توليد المذكرة" : "Generate AI Report") : status === "streaming" ? (isAr ? "جاري التوليد…" : "Generating…") : (isAr ? "إعادة التوليد" : "Regenerate")}</span>
          </button>
        </div>
      </div>

      {/* Right report shell */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden min-h-[600px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between py-3 px-5 bg-[#1E293B] border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {["#EF4444", "#F59E0B", "#10B981"].map((c) => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest uppercase font-bold text-[#64748B]">
              <div className={`w-1.5 h-1.5 rounded-full ${status === "streaming" ? "bg-[#F59E0B] animate-pulse" : status === "done" ? "bg-[#10B981]" : "bg-[#334155]"}`} />
              <span>{status === "idle" ? "Ready" : status === "streaming" ? "Live Grounding..." : "Complete"}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 min-h-[540px]">
          {fetchLoading && status === "idle" && (
            <LoadingScreen />
          )}

          {!fetchLoading && status === "idle" && (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-5 opacity-20 text-[#F8FAFC]">✦</div>
              <div className="font-serif text-2xl font-light text-[#94A3B8] mb-3">
                {isAr ? "اختر شركة وقم بتوليد مذكرة بحثية" : "Select a company and generate a memo"}
              </div>
              <div className="text-sm text-[#64748B] max-w-sm leading-relaxed">
                {isAr 
                  ? "أبحاث أسهم من الدرجة المؤسسية مع معالجة الزكاة، سياق رؤية 2030، ولغة متوافقة مع هيئة السوق المالية - يتم توليدها في ثوانٍ." 
                  : "Institutional-grade equity research with Zakat treatment, Vision 2030 context, and CMA-compliant language — generated in seconds."}
              </div>
            </div>
          )}

          {(status === "streaming" || status === "done") && (
            <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-serif prose-headings:text-[#F8FAFC] prose-p:text-[#94A3B8] prose-a:text-[#F59E0B] prose-strong:text-[#F8FAFC] prose-ul:text-[#94A3B8] prose-li:marker:text-[#F59E0B]" dir={isAr ? "rtl" : "ltr"}>
              <ReactMarkdown>{reportText}</ReactMarkdown>
              {status === "streaming" && (
                <span className="inline-block w-2 h-4 bg-[#F59E0B] ml-1 align-middle animate-pulse" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
