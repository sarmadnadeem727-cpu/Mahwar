import { create } from "zustand";

export type Currency = 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'QAR' | 'USD';
export type Language = 'en' | 'ar';

interface TerminalState {
  activeTicker: string | null;
  isLoading: boolean;
  globalError: string | null;
  
  // Legacy fields to avoid breaking TickerSearch UI translation logic
  language: Language;
  currency: Currency;

  setTicker: (ticker: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  activeTicker: "2222.SR", // Defaulting to Aramco for initial view
  isLoading: false,
  globalError: null,
  
  language: "en",
  currency: "SAR",

  setTicker: (ticker) => {
    if (!ticker) {
      set({ activeTicker: null });
      return;
    }
    // Standardize to Saudi Stock Exchange if no suffix and it looks like a Tadawul ticker
    const formatted = (/^\d{4}$/.test(ticker) && !ticker.endsWith(".SR")) ? `${ticker}.SR` : ticker;
    set({ activeTicker: formatted, globalError: null });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (globalError) => set({ globalError }),
  
  setLanguage: (lang) => set({ language: lang }),
  setCurrency: (currency) => set({ currency }),
}));
