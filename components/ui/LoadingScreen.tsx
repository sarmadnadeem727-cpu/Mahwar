"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MahwarLogo from "./MahwarLogo";
import { useTerminalStore } from "@/store/useTerminalStore";

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  useEffect(() => {
    // Simulate initial platform handshake
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[var(--void)] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Grid - Blueprint Style */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(var(--emerald) 0.5px, transparent 0.5px)", backgroundSize: "30px 30px" }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(var(--emerald) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--emerald) 0.5px, transparent 0.5px)", backgroundSize: "120px 120px" }} />

          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <MahwarLogo size={180} />
            
            {/* Soft Professional Aura */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute inset-0 bg-[var(--emerald)] blur-[80px] rounded-full -z-10"
            />
          </motion.div>

          {/* Branding */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-12 text-center"
          >
            <h1 className="font-cormorant text-6xl font-bold tracking-[0.25em] text-[var(--text1)] uppercase mb-4">
              Mahwar
            </h1>
            <div className="flex items-center justify-center gap-6">
              <div className="w-12 h-[1px] bg-[var(--emerald)] opacity-20" />
              <span className="font-ibm-plex-mono text-[10px] font-bold text-[var(--emerald)] tracking-[0.4em] uppercase">
                {isAr ? "محور الذكاء المالي" : "THE AXIS OF INTELLIGENCE"}
              </span>
              <div className="w-12 h-[1px] bg-[var(--emerald)] opacity-20" />
            </div>
          </motion.div>

          {/* Progress Indicator */}
          <div className="absolute bottom-24 w-60 h-[1.5px] bg-[var(--emerald)]/10 overflow-hidden rounded-full">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="w-full h-full bg-[var(--emerald)] shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            />
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
