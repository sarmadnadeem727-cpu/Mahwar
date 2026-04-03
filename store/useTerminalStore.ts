import { create } from "zustand";
import { fetchInstitutionalData, type InstitutionalData } from "@/lib/services/terminalService";

export type Currency = 'SAR' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'QAR';
export type Language = 'en' | 'ar';

interface TerminalState {
  selectedTicker: string;
  language: Language;
  currency: Currency;
  data: InstitutionalData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTicker: (ticker: string) => Promise<void>;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  refreshData: () => Promise<void>;
  loadCustomData: (data: InstitutionalData, tickerName: string) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  selectedTicker: "2222", // Default: Saudi Aramco
  language: "en",
  currency: "SAR",
  data: null,
  isLoading: false,
  error: null,

  setLanguage: (lang) => set({ language: lang }),
  setCurrency: (currency) => set({ currency }),

  loadCustomData: (data, tickerName) => {
    set({ data, selectedTicker: tickerName, isLoading: false, error: null });
  },

  setTicker: async (ticker: string) => {
    // Standardize ticker format (always include .SR for internal service)
    const formatted = ticker.endsWith(".SR") ? ticker : `${ticker}.SR`;
    
    // Skip if already selected and data exists
    if (get().selectedTicker === formatted && get().data) return;

    set({ selectedTicker: formatted, isLoading: true, error: null });

    try {
      const data = await fetchInstitutionalData(formatted);
      set({ data, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to load data", isLoading: false });
    }
  },

  refreshData: async () => {
    const { selectedTicker } = get();
    set({ isLoading: true, error: null });
    try {
      const data = await fetchInstitutionalData(selectedTicker);
      set({ data, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Refresh failed", isLoading: false });
    }
  },
}));
