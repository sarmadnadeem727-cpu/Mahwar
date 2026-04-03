"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import { Calendar, Clock, Bell, Landmark } from "lucide-react";

const EconomicCalendar = () => {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  const events = [
    {
      date: "Mar 30, 2026",
      time: "10:00 AM",
      title: isAr ? "قرارات مجلس الوزراء السعودي" : "Saudi Cabinet Resolutions",
      impact: "High",
      type: "Fiscal",
      desc: isAr ? "تحديثات الميزانية السنوية ومؤشرات الإنفاق الحكومي." : "Annual budget updates and government spending indicators.",
    },
    {
      date: "Apr 05, 2026",
      time: "02:30 PM",
      title: isAr ? "بيان السياسة النقدية (ساما)" : "SAMA Monetary Policy Statement",
      impact: "Critical",
      type: "Interest Rate",
      desc: isAr ? "توقعات أسعار الفائدة وتطورات السيولة المصرفية." : "Interest rate outlook and banking liquidity developments.",
    },
    {
      date: "Apr 12, 2026",
      time: "08:00 AM",
      title: isAr ? "مؤشر أسعار المستهلك (التضخم)" : "Consumer Price Index (Inflation)",
      impact: "Medium",
      type: "Economic",
      desc: isAr ? "بيانات تضخم تكاليف المعيشة للربع الأول." : "Cost of living inflation data for Q1.",
    },
    {
      date: "Apr 20, 2026",
      time: "11:00 AM",
      title: isAr ? "منتدى رؤية ٢٠٣٠ (الاستثمار)" : "Vision 2030 Investment Forum",
      impact: "High",
      type: "Strategic",
      desc: isAr ? "الإعلان عن شراكات دولية ومشاريع كبرى جديدة." : "Announcement of international partnerships and new giga-projects.",
    },
  ];

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Search/Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

        <div>
          <h2 className="text-xl font-serif font-bold text-[var(--text1)] mb-1 uppercase tracking-tight">{isAr ? "المفكرة الاقتصادية السيادية" : "Sovereign Economic Calendar"}</h2>
          <p className="text-[10px] text-[var(--text3)] uppercase tracking-[0.2em]">{isAr ? "تحديثات لحظية للأسواق الخليجية" : "Live GCC Market Catalysts"}</p>
        </div>
        <div className="flex gap-2">
          {["All", "High Impact", "Earnings", "Dividends"].map((f) => (
            <button key={f} className="px-4 py-2 bg-[var(--bg2)] border border-[var(--border)] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[var(--text3)] hover:text-[var(--text1)] hover:border-[var(--emerald)] transition-all font-mono">{f}</button>
          ))}
        </div>
      </div>


      {/* Main Timeline */}
      <div className="relative">
        {/* Timeline Thread */}
        <div className={`absolute ${isAr ? 'right-6' : 'left-6'} top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-[var(--emerald)] via-[var(--border)] to-transparent opacity-30`} />


        <div className="space-y-12">
          {events.map((event, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: isAr ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative ${isAr ? 'pr-16' : 'pl-16'}`}
            >
               {/* Event Marker */}
              <div className={`absolute ${isAr ? '-right-1.5' : '-left-1.5'} top-1 w-3.5 h-3.5 rounded-full bg-[var(--emerald)] shadow-[0_0_15px_rgba(16,185,129,0.4)] z-10 border-2 border-[var(--bg1)]`} />
              
              <div className="grid grid-cols-12 gap-8 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-10 hover:border-[var(--emerald)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all group">

                {/* Date/Time Column */}
                <div className="col-span-12 md:col-span-3 border-b md:border-b-0 md:border-r border-[var(--border)] pb-6 md:pb-0 md:pr-6">

                  <div className="flex items-center gap-2 mb-2 text-[var(--emerald)]">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-ibm-plex-mono font-bold">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text3)] mb-4">
                    <Clock className="w-4 h-4 opacity-50" />
                    <span className="text-[10px] font-mono tracking-widest">{event.time}</span>
                  </div>
                  <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                    event.impact === "Critical" ? "bg-red-500/15 text-red-500 border border-red-500/30" :
                    event.impact === "High" ? "bg-orange-500/15 text-orange-500 border border-orange-500/30" :
                    "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                  }`}>
                    {event.impact} IMPACT
                  </div>

                </div>

                {/* Content Column */}
                <div className="col-span-12 md:col-span-7 py-2">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-[var(--emerald)] leading-none">{event.type}</span>
                    <div className="h-[1px] flex-1 bg-[var(--border)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text1)] mb-3 group-hover:text-[var(--emerald)] transition-colors">{event.title}</h3>
                  <p className="text-base text-[var(--text2)] leading-relaxed font-bold">{event.desc}</p>

                </div>


                <div className="col-span-12 md:col-span-2 flex flex-col justify-center items-end gap-3">
                   <button className="p-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl text-[var(--text3)] hover:text-[var(--emerald)] hover:border-[var(--emerald)] transition-all">
                     <Bell className="w-4 h-4" />
                   </button>
                   <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text3)] hover:text-[var(--emerald)] transition-colors">
                     SET REMINDER
                   </button>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Corporate Action Teaser */}
      <div className="bg-[var(--bg1)] border border-[var(--emerald)] rounded-3xl p-10 relative overflow-hidden group shadow-xl shadow-[rgba(14,124,105,0.02)]">

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg2)] flex items-center justify-center text-[var(--emerald)]">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text1)] mb-1 uppercase tracking-tight">{isAr ? "إعلانات تداول اللحظية" : "Live Tadawul Corporate Actions"}</h3>
              <p className="text-sm text-[var(--text3)]">{isAr ? "متابعة مباشرة لجمعيات المساهمين وتوزيع الأرباح." : "Real-time tracking of AGMs, EGM, and board resolutions."}</p>
            </div>
          </div>
          <button className="px-8 py-3 bg-[var(--navy)] text-white font-bold text-[11px] uppercase tracking-[0.15em] rounded-xl hover:bg-[var(--emerald)] transition-all shadow-lg shadow-navy-900/10">
            {isAr ? "عرض جميع الإعلانات" : "View All Disclosures"}
          </button>
        </div>

        <div className="absolute right-[-5%] bottom-[-10%] w-64 h-64 bg-[var(--emerald)] opacity-5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
};

export default EconomicCalendar;
