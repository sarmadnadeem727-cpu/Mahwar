"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { EASE_PREMIUM } from "@/lib/motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import MahwarLogo from "@/components/ui/MahwarLogo";


const Navigation = () => {
  const { language, setLanguage } = useTerminalStore();
  const isAr = language === "ar";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE_PREMIUM }}
      className={`fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-6 lg:px-12 transition-all duration-500 ${
        isScrolled
          ? "bg-[var(--bg1)]/80 backdrop-blur-xl border-b border-[var(--border)]"
          : "bg-transparent"
      }`}

    >
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <MahwarLogo size={36} animate={true} />

        <div className="flex flex-col leading-tight">
          <span className="font-cormorant text-lg font-semibold tracking-tight text-[var(--text1)]">
            Mahwar
          </span>
          <span className="font-cairo text-[10px] text-[var(--gold)] -mt-1">
            محور
          </span>
        </div>
      </Link>

      {/* Center: Links */}
      <div className="hidden md:flex items-center gap-8">
        {(isAr 
          ? [ {id:"solutions", label: "المميزات"}, {id:"markets", label: "الأسواق"}, {id:"security", label: "الأمان"}, {id:"company", label: "الشركة"} ]
          : [ {id:"solutions", label: "Features"}, {id:"markets", label: "Markets"}, {id:"security", label: "Security"}, {id:"company", label: "Company"} ]
        ).map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            className={`font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--text2)] hover:text-[var(--gold-bright)] transition-colors ${isAr ? 'font-arabic' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right: CTA & Lang */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex p-0.5 bg-white/5 border border-white/10 rounded-sm">
          {["en", "ar"].map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l as "en" | "ar")}
              className={`px-3 py-1 rounded-[1px] text-[9px] font-bold uppercase tracking-widest transition-all ${
                language === l ? "bg-[var(--gold)] text-[var(--bg1)] shadow-lg" : "text-[var(--text3)] hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-[var(--gold)] text-[var(--bg1)] px-6 py-2.5 rounded-sm font-dm-sans text-xs font-semibold hover:bg-[var(--gold-bright)] transition-colors shadow-[0_0_20px_rgba(201,168,76,0.2)] ${isAr ? 'font-arabic' : ''}`}
          >
            {isAr ? "دخول المنصة ←" : "Enter Platform →"}
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
};

export default Navigation;
