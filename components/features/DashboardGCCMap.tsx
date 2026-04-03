"use client";

import React from "react";
import { motion } from "framer-motion";

// DO NOT ALTER THIS DATA
const GCC_CITIES = [
  { id: "RUH", name: "Riyadh", cx: "45%", cy: "55%", isHub: true },
  { id: "DXB", name: "Dubai", cx: "65%", cy: "45%", isHub: false },
  { id: "DOH", name: "Doha", cx: "60%", cy: "48%", isHub: false },
  { id: "KWI", name: "Kuwait City", cx: "55%", cy: "35%", isHub: false },
  { id: "BAH", name: "Manama", cx: "58%", cy: "42%", isHub: false },
  { id: "MCT", name: "Muscat", cx: "75%", cy: "55%", isHub: false },
];

export default function DashboardGCCMap() {
  // Hub Coordinates (Riyadh) converted to viewBox 1000x1000 units
  const hubX = 450;
  const hubY = 550;

  return (
    <div className="flex flex-col lg:flex-row w-full h-[500px] bg-[#020617] border border-[#334155] rounded-xl overflow-hidden shadow-2xl">
      
      {/* LEFT SIDE: The 2D Network Map (65% width) */}
      <div className="relative w-full lg:w-[65%] h-full bg-[#020617] p-6 flex items-center justify-center overflow-hidden">
        
        {/* SVG CONTAINER */}
        <svg viewBox="0 0 1000 1000" className="w-full h-full opacity-80">
          
          {/* I WILL PASTE MY OWN GEOGRAPHIC SVG PATHS HERE. LEAVE THIS COMMENT AS IS. */}
          {/* <path d="..." fill="#1E293B" stroke="#10B981" /> */}

          {/* TODO 1: NETWORK DATA LINES */}
          <g>
            {GCC_CITIES.filter(city => !city.isHub).map(city => {
              const targetX = parseFloat(city.cx) * 10;
              const targetY = parseFloat(city.cy) * 10;
              
              // Calculate curved path using Quadratic Bezier (Q)
              // Midpoint with a vertical offset to create a nice arc
              const midX = (hubX + targetX) / 2;
              const midY = (hubY + targetY) / 2 - 80;
              
              const pathD = `M ${hubX} ${hubY} Q ${midX} ${midY} ${targetX} ${targetY}`;

              return (
                <motion.path
                  key={city.id}
                  d={pathD}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -20 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              );
            })}
          </g>
        </svg>

        {/* TODO 2: RADAR PING NODES */}
        <div className="absolute inset-0 pointer-events-none">
          {GCC_CITIES.map(city => {
            const color = city.isHub ? "#F59E0B" : "#10B981";
            
            return (
              <div 
                key={city.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: city.cx, top: city.cy }}
              >
                {/* Radar Ping Container */}
                <div className="relative flex items-center justify-center">
                  {/* Pulsing Outer Ring */}
                  <motion.div 
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {/* Solid Inner Dot */}
                  <div className="w-2 h-2 rounded-full bg-[#F8FAFC] relative z-10" />
                </div>

                {/* Crisp ID Label */}
                <span className="mt-2 font-mono text-[10px] text-[#F8FAFC] tracking-widest uppercase">
                   {city.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: The Data Dashboard Grid (35% width) */}
      <div className="w-full lg:w-[35%] h-full bg-[#0F172A] border-l border-[#334155] p-6 flex flex-col gap-4 overflow-y-auto">
        
        {/* TODO 3: HEADER */}
        <h3 className="font-mono text-xs uppercase tracking-widest text-[#94A3B8] mb-2">
          Regional Intelligence
        </h3>

        {/* TODO 4: STATS GRID */}
        <div className="flex flex-col gap-4">
          {[
            { label: "GCC Market Cap", val: "$3.8 Trillion" },
            { label: "Supported Exchanges", val: "6" },
            { label: "Active Companies", val: "500+" },
            { label: "Data Sync Engine", val: "Real-Time" }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="bg-[#020617] border border-[#334155] rounded-lg p-5"
            >
              <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1">
                {stat.label}
              </p>
              <p className="font-mono text-2xl font-bold text-[#F8FAFC]">
                {stat.val}
              </p>
            </div>
          ))}
        </div>
            
      </div>
    </div>
  );
}
