// lib/i18n.ts

export const translations = {
  en: {
    // Top Bar
    search_placeholder: "Search ticker (e.g. 2222, 1180)...",
    tasi_index: "TASI Index",
    launch_terminal: "Launch Terminal",
    back_to_hub: "Back to Intelligence Hub",
    
    // Sidebar / Sections
    platform: "Platform",
    research: "Research",
    models: "Models",
    hub: "Intelligence Hub",
    ai_research: "AI Research",
    shariah_screen: "Shariah Screen",
    market_screener: "Market Screener",
    live_market: "Live Market",
    dcf_engine: "DCF Engine",
    lbo_builder: "LBO Builder",
    three_statement: "3-Statement",
    dividends: "Dividend Tracker",
    calendar: "Economic Calendar",
    ownership: "Ownership Analysis",
    technical: "Technical Charts",
    watchlist: "Watchlist",
    
    // Hub (Dashboard)
    performance_alpha: "Performance Alpha",
    vs_tasi: "vs TASI Benchmark Convergence",
    institutional_flow: "Institutional Flow",
    real_time_tape: "Real-time Order Book Simulation",
    live_tape: "Live Tape View",
    
    // AI Research
    gen_memo: "Generate Institutional Memo",
    full_report: "Full Institutional Report",
    quick_summary: "Quick Summary",
    valuation_focus: "Valuation Focus",
    
    // Financial Terms
    revenue: "Revenue",
    net_income: "Net Income",
    ebitda: "EBITDA",
    market_cap: "Market Cap",
    pe_ratio: "P/E Ratio",
    shariah_status: "Shariah Status",
    compliant: "Compliant",
    non_compliant: "Non-Compliant",
  },
  ar: {
    // Top Bar
    search_placeholder: "ابحث عن رمز (مثلاً: ٢٢٢٢، ١١٨٠)...",
    tasi_index: "مؤشر تاسي",
    launch_terminal: "تشغيل المنصة",
    back_to_hub: "العودة إلى مركز الاستخبارات",
    
    // Sidebar / Sections
    platform: "المنصة",
    research: "الأبحاث",
    models: "النماذج",
    hub: "مركز الاستخبارات",
    ai_research: "أبحاث الذكاء الاصطناعي",
    shariah_screen: "الفحص الشرعي",
    market_screener: "فاحص السوق",
    live_market: "السوق المباشر",
    dcf_engine: "محرك التدفقات النقدية",
    lbo_builder: "محلل الاستحواذ",
    three_statement: "القوائم الثلاث",
    dividends: "تتبع التوزيعات",
    calendar: "المفكرة الاقتصادية",
    ownership: "تحليل الملكية",
    technical: "الرسوم الفنية",
    watchlist: "قائمة المتابعة",
    
    // Hub (Dashboard)
    performance_alpha: "أداء ألفا",
    vs_tasi: "مقارنة بمؤشر تاسي",
    institutional_flow: "التدفقات المؤسسية",
    real_time_tape: "محاكاة دفتر الأوامر اللحظي",
    live_tape: "عرض الشريط المباشر",
    
    // AI Research
    gen_memo: "توليد مذكرة مؤسسية",
    full_report: "تقرير مؤسسي كامل",
    quick_summary: "ملخص سريع",
    valuation_focus: "تركيز التقييم",
    
    // Financial Terms
    revenue: "الإيرادات",
    net_income: "صافي الدخل",
    ebitda: "الأرباح قبل الفوائد والضرائب",
    market_cap: "القيمة السوقية",
    pe_ratio: "مكرر الأرباح",
    shariah_status: "الحالة الشرعية",
    compliant: "متوافق",
    non_compliant: "غير متوافق",
  }
};

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof translations.en;
