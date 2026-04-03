"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import SectionLabel from "@/components/ui/SectionLabel";

const testimonials = [
  {
    quote: "Mahwar has completely transformed our workflow. What used to take days of manual data cleaning now happens in minutes with institutional precision.",
    author: "Faisal Al-Saud",
    role: "Senior Portfolio Manager",
    org: "Riyadh Capital",
    initials: "FA",
  },
  {
    quote: "The Zakat engine is a game-changer. Finally, a platform that understands the specific regulatory and religious requirements of the Saudi market.",
    author: "Omar Bin Talal",
    role: "Equity Research Analyst",
    org: "SNB Capital",
    initials: "OB",
  },
  {
    quote: "A truly world-class interface that doesn't compromise on the depth of financial data. The AI research memos are shockingly accurate and insightful.",
    author: "Lulwa Al-Rashid",
    role: "Director of Corporate Finance",
    org: "Al Rajhi Bank",
    initials: "LR",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="relative py-[120px] px-6 lg:px-24 bg-[var(--bg1)]">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <SectionLabel label="Social Proof" className="justify-center" />
          <motion.h2 variants={staggerItem} className="font-cormorant text-4xl md:text-5xl lg:text-6xl mb-6">
            Trusted by the <span className="italic text-[var(--gold)]">Kingdom's finest</span>
          </motion.h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -4, borderColor: "var(--border-gold)" }}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-10 transition-all duration-300 flex flex-col"
            >
              <div className="font-cormorant text-6xl text-[var(--gold-glow)] leading-none mb-4 select-none">
                “
              </div>
              <p className="font-dm-sans text-sm italic text-[var(--text2)] leading-relaxed mb-10 flex-grow">
                {t.quote}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-bright)] flex items-center justify-center text-xs font-bold text-[var(--bg1)] shadow-lg">
                  {t.initials}
                </div>
                <div className="flex flex-col">
                  <span className="font-dm-sans text-sm font-semibold text-[var(--text1)]">
                    {t.author}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text3)]">
                    {t.role} · {t.org}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
