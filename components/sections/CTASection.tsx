"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";

const CTASection = () => {
  return (
    <section id="company" className="relative py-[160px] flex items-center justify-center overflow-hidden bg-[var(--void)]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-radial-gradient from-[rgba(201,168,76,0.04)] to-transparent" />
        <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-cairo text-[140px] md:text-[240px] text-[var(--gold)] opacity-5 select-none pointer-events-none">
          محور
        </h2>
      </div>

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        <SectionLabel label="Get Started" className="justify-center" />
        
        <motion.h2 variants={staggerItem} className="font-cormorant text-5xl md:text-6xl lg:text-7xl mb-8">
          Ready to find your <span className="italic gold-gradient-text">axis</span>?
        </motion.h2>

        <motion.p variants={staggerItem} className="font-dm-sans text-lg text-[var(--text2)] max-w-[480px] leading-relaxed mb-12">
          Join the next generation of Saudi analysts. Deep intelligence, absolute precision, zero friction.
        </motion.p>

        <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[var(--gold)] text-[var(--bg1)] px-10 py-4 rounded-sm font-dm-sans text-base font-bold hover:bg-[var(--gold-bright)] transition-all shadow-[0_0_40px_rgba(201,168,76,0.2)]"
            >
              Enter Platform →
            </motion.button>
          </Link>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="border border-[var(--gold-dim)] text-[var(--gold)] px-10 py-4 rounded-sm font-dm-sans text-base font-bold hover:bg-[var(--gold-dim)] transition-all"
          >
            Explore Features
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;
