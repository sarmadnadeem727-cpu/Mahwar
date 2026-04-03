"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";

interface SectionLabelProps {
  label: string;
  className?: string;
}

const SectionLabel = ({ label, className = "" }: SectionLabelProps) => {
  return (
    <motion.div
      variants={staggerItem}
      className={`flex items-center gap-2 mb-6 ${className}`}
    >
      <div className="w-1.5 h-1.5 rounded-full border border-[var(--emerald)]" />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--emerald)]">
        {label}
      </span>
    </motion.div>
  );
};

export default SectionLabel;
