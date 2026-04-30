import { create } from "zustand";

export type Currency = 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'QAR' | 'USD';
export type Language = 'en' | 'ar';

interface TerminalState {
  activeTicker: string | null;
  isLoading: boolean;
  globalError: string | null;
  
  language: Language;
  currency: Currency;

  setTicker: (ticker: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  activeTicker: "AAPL", // Default ticker
  isLoading: false,
  globalError: null,
  
  language: "en",
  currency: "SAR",

  setTicker: (ticker) => {
    if (!ticker) {
      set({ activeTicker: null });
      return;
    }
    const formatted = ticker.toUpperCase().trim();
    set({ activeTicker: formatted, globalError: null });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (globalError) => set({ globalError }),
  
  setLanguage: (lang) => set({ language: lang }),
  setCurrency: (currency) => set({ currency }),
}));
