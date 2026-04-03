import { create } from "zustand";
import { fetchInstitutionalData, type InstitutionalData } from "@/lib/services/terminalService";

// GCC Unified State
export type Currency = 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'QAR';
export type Language = 'en' | 'ar';

interface TerminalState {
  selectedTicker: string;
  language: Language;
  currency: Currency;
  data: InstitutionalData | null;
  // Note: We bypass manual isLoading here now in favor of useQuery!

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
    const formatted = ticker.endsWith(".SR") ? ticker : `${ticker}.SR`;
    set({ selectedTicker: formatted });
  },
}));
