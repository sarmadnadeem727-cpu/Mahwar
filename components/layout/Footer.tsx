"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTerminalStore } from "@/store/useTerminalStore";
import FooterModal from "@/components/ui/FooterModal";
import MahwarLogo from "@/components/ui/MahwarLogo";


const Footer = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [modalType, setModalType] = useState<string | null>(null);

  const columnsEn = [
    {
      title: "Platform",
      links: ["Features", "Pricing", "AI Research", "Security", "Documentation"],
    },
    {
      title: "Markets",
      links: ["Tadawul", "GCC Markets", "Sectors", "Global Indices", "Economic Calendar"],
    },
    {
      title: "Company",
      links: ["About Us", "Contact", "Privacy Policy", "Terms of Service", "Licensing"],
    },
  ];

  const columnsAr = [
    {
      title: "المنصة",
      links: ["المميزات", "الأسعار", "أبحاث الذكاء الاصطناعي", "الأمان", "الوثائق"],
    },
    {
      title: "الأسواق",
      links: ["تداول", "الأسواق الخليجية", "القطاعات", "المؤشرات العالمية", "المفكرة الاقتصادية"],
    },
    {
      title: "الشركة",
      links: ["من نحن", "اتصل بنا", "سياسة الخصوصية", "شروط الخدمة", "التراخيص"],
    },
  ];

  const columns = isAr ? columnsAr : columnsEn;

  // Set of links that should trigger a modal
  const modalLinks = [
    "documentation", "الوثائق",
    "global indices", "المؤشرات العالمية",
    "sectors", "القطاعات",
    "privacy policy", "سياسة الخصوصية",
    "terms of service", "شروط الخدمة",
    "licensing", "التراخيص"
  ];

  const handleLinkClick = (e: React.MouseEvent, link: string) => {
    const l = link.toLowerCase();
    if (modalLinks.includes(l)) {
      e.preventDefault();
      setModalType(link);
    }
  };

  const getHref = (link: string) => {
    const l = link.toLowerCase();
    if (l.includes("feature") || l.includes("مميزات")) return "/#solutions";
    if (l.includes("pricing") || l.includes("أسعار")) return "/#solutions";
    if (l.includes("research") || l.includes("أبحاث")) return "/#ai-research";
    if (l.includes("security") || l.includes("أمان")) return "/#security";
    if (l.includes("market") || l.includes("أسواق") || l.includes("tadawul") || l.includes("تداول")) return "/#markets";
    if (l.includes("calendar") || l.includes("مفكرة")) return "/dashboard"; // Links to tool
    if (l.includes("about") || l.includes("contact") || l.includes("من نحن") || l.includes("اتصل بنا")) return "/#company";
    return "#";
  };

  return (
    <footer className="relative bg-[var(--bg1)] border-t border-[var(--border)] pt-16 pb-10 px-6 lg:px-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <MahwarLogo size={32} animate={false} />

              <div className="flex flex-col leading-tight">
                <span className="font-cormorant text-xl font-semibold text-[var(--text1)]">
                  Mahwar
                </span>
                <span className="font-cairo text-[11px] text-[var(--gold)] -mt-1">
                  محور
                </span>
              </div>
            </div>
            <p className={`font-dm-sans text-xs text-[var(--text3)] max-w-[260px] leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
              {isAr 
                ? "منصة استخبارات أسواق المال السعودية الرائدة. هندسة دقيقة للمحللين المؤسسيين وصناع القرار."
                : "The premium Saudi capital markets intelligence platform. Precision-engineered for institutional analysts and decision makers."}
            </p>
          </div>

          {/* Link Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <h4 className={`font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--emerald)] ${isAr ? 'font-arabic' : ''}`}>
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={getHref(link)}
                      onClick={(e) => handleLinkClick(e, link)}
                      className={`font-dm-sans text-[13px] text-[var(--text3)] hover:text-[var(--text1)] transition-colors ${isAr ? 'font-arabic' : ''}`}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className={`font-mono text-[12px] text-[var(--text3)] ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "© ٢٠٢٥ محور · جميع الحقوق محفوظة" : "© 2025 Mahwar · All Rights Reserved"}
          </div>
          <div className={`font-mono text-[11px] text-[var(--text3)] hidden lg:block ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "محور · نبض أسواق المال السعودية" : "محور · The Axis of Saudi Capital Markets"}
          </div>
          <div className={`font-mono text-[12px] text-[var(--text3)] ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? "تطوير" : "Developed by"} <span className="text-[var(--gold)] font-medium">Muhammad Sarmad Nadeem</span>
          </div>
        </div>
      </div>

      <FooterModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        type={modalType || ""} 
      />
    </footer>
  );
};

export default Footer;
