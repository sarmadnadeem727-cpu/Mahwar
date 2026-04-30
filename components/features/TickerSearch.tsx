"use client";

import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { translations } from "@/lib/i18n";

export function TickerSearch() {
  const [input, setInput] = useState("");
  const { setTicker, isLoading, activeTicker, language } = useTerminalStore();
  const t = translations[language];
  const isAr = language === "ar";
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setTicker(input);
    setInput("");
  };
  
  return (
    <form onSubmit={handleSearch} className="flex items-center gap-3 w-full" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative flex-1 group">
        <Search className={`absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors z-10`} />
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAr ? "أدخل الرمز (مثال AAPL, TSLA)..." : "Enter ticker (e.g., AAPL, TSLA)..."}
          className={`w-full ${isAr ? "pr-12 pl-4" : "pl-12 pr-4"} h-12 bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 rounded-xl focus:border-zinc-500 focus:bg-[#0a0a0a] outline-none text-zinc-50 placeholder-zinc-500 transition-all shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]`}
          disabled={isLoading}
        />
        
        {isLoading && (
          <Loader2 className={`absolute ${isAr ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin`} />
        )}
      </div>
    </form>
  );
}
