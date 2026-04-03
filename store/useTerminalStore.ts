import { create } from "zustand";
import { fetchInstitutionalData, type InstitutionalData } from "@/lib/services/terminalService";

// Unified Institutional GCC Currency System
export type Currency = 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'QAR' | 'USD';
export type Language = 'en' | 'ar';

interface TerminalState {
  selectedTicker: string;
  language: Language;
  currency: Currency;
  data: InstitutionalData | null;

  setTicker: (ticker: string) => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  selectedTicker: "2222", 
  language: "en",
  currency: "SAR",
  data: null,

  setLanguage: (lang) => set({ language: lang }),
  setCurrency: (currency) => set({ currency }),
  
  setTicker: (ticker: string) => {
    // Standardize to Saudi Stock Exchange if no suffix
    const formatted = ticker.endsWith(".SR") ? ticker : `${ticker}.SR`;
    set({ selectedTicker: formatted });
  },
}));
