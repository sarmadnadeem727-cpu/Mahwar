// components/ui/ModelButton.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Play } from 'lucide-react';

interface ModelButtonProps {
  onClick: () => void;
  loading: boolean;
  label?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
}

export const ModelButton: React.FC<ModelButtonProps> = ({ 
  onClick, 
  loading, 
  label = "Run Model Engine v5.0", 
  variant = 'primary',
  disabled = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]';
      case 'secondary':
        return 'bg-slate-700 hover:bg-slate-600 text-slate-100 shadow-[0_0_15px_rgba(51,65,85,0.2)]';
      case 'accent':
        return 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]';
      default:
        return 'bg-emerald-600 hover:bg-emerald-500 text-white';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm
        transition-all duration-300 flex items-center gap-3 group
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantStyles()}
      `}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      )}
      
      <span>{loading ? "INITIALIZING ENGINE..." : label}</span>
      
      {/* Animated glow effect */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.button>
  );
};
