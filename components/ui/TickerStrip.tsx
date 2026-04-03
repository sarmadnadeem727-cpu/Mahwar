"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Ticker {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percent: string;
  up: boolean;
}

// For now using mock data, will integrate Yahoo later
const mockTickers: Ticker[] = [
  { symbol: "TASI", name: "Tadawul All Share", price: "12,450.20", change: "+142.30", percent: "+1.15%", up: true },
  { symbol: "2222.SR", name: "Saudi Aramco", price: "28.40", change: "+0.15", percent: "+0.53%", up: true },
  { symbol: "1120.SR", name: "Al Rajhi Bank", price: "87.60", change: "+1.20", percent: "+1.39%", up: true },
  { symbol: "1180.SR", name: "SNB", price: "38.90", change: "+1.10", percent: "+2.91%", up: true },
  { symbol: "7010.SR", name: "STC", price: "41.20", change: "-0.10", percent: "-0.24%", up: false },
  { symbol: "2010.SR", name: "SABIC", price: "74.50", change: "+0.80", percent: "+1.09%", up: true },
  { symbol: "1211.SR", name: "Ma'aden", price: "45.10", change: "+0.35", percent: "+0.78%", up: true },
  { symbol: "4003.SR", name: "Extra", price: "92.30", change: "-1.50", percent: "-1.60%", up: false },
];

const TickerStrip = () => {
  return (
    <div className="sticky top-16 w-full h-10 bg-[rgba(5,5,15,0.98)] border-y border-[var(--border)] z-40 overflow-hidden flex items-center">
      {/* Gradient Masks */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--bg1)] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[var(--bg1)] to-transparent z-10" />

      <motion.div
        animate={{ x: [0, "-50%"] }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex items-center gap-12 whitespace-nowrap px-6"
        style={{ width: "fit-content" }}
      >
        {[...mockTickers, ...mockTickers].map((item, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-default">
            <div className="flex items-center gap-2">
              <span className="text-[var(--emerald)] font-bold text-[8px]">●</span>
              <span className="font-mono text-[10px] font-bold text-[var(--text1)] tracking-wider">
                {item.symbol}
              </span>
            </div>
            
            <span className="font-dm-sans text-[11px] text-[var(--text2)] group-hover:text-[var(--text1)] transition-colors">
              {item.name}
            </span>

            <span className="font-mono text-[11px] text-[var(--text1)]">
              SAR {item.price}
            </span>

            <span
              className={`font-mono text-[10px] flex items-center gap-1 ${
                item.up ? "text-[var(--positive)]" : "text-[var(--negative)]"
              }`}
            >
              {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.percent}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TickerStrip;
