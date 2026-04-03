"use client";

import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { translations } from "@/lib/i18n";

import { UploadDataButton } from "@/components/ui/UploadDataButton";

export function TickerSearch() {
  const [input, setInput] = useState("");
  const { setTicker, isLoading, selectedTicker, language } = useTerminalStore();
  const t = translations[language];
  const isAr = language === "ar";
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const ticker = input.toUpperCase().trim();
    await setTicker(ticker);
    setInput(""); // Clear input after search
  };
  
  return (
    <form onSubmit={handleSearch} className="flex items-center gap-3 w-full" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative flex-1 max-w-xl group">
        <Search className={`absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] group-focus-within:text-[var(--accent)] transition-colors`} />
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAr ? "أدخل الرمز (مثال 2222.SR ، AAPL)..." : "Enter ticker (e.g., AAPL, 2222.SR)..."}
          className={`terminal-input w-full ${isAr ? "pr-11 pl-4" : "pl-11 pr-4"} h-10 border border-[var(--border)] bg-[var(--bg2)] rounded-lg focus:ring-1 focus:ring-[var(--accent)] outline-none text-[var(--text1)] placeholder-[var(--text4)] transition-all`}
          disabled={isLoading}
        />
        
        {isLoading && (
          <Loader2 className={`absolute ${isAr ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent)] animate-spin`} />
        )}
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="btn-primary h-10 flex items-center justify-center min-w-[100px]"
      >
        {isLoading ? (isAr ? "جاري التحميل..." : "Loading...") : (isAr ? "بحث" : "Analyze")}
      </button>

      <UploadDataButton />


    </form>
  );
}
