"use client";

import { useMemo } from 'react';
import { useTerminalStore, type Currency } from '@/store/useTerminalStore';

/**
 * Institutional USD-Peg Matrix for GCC Currencies.
 * Source: Unified regional capital market data.
 */
const PEGS: Record<Currency, number> = {
  SAR: 3.75,     // Saudi Riyal
  AED: 3.6725,   // UAE Dirham
  QAR: 3.64,     // Qatari Riyal
  OMR: 0.3845,   // Omani Rial (Fixed)
  BHD: 0.376,    // Bahraini Dinar (Fixed)
  KWD: 0.307,    // Kuwaiti Dinar (Managed Basket)
  USD: 1.0,      // US Dollar Reference
};

export function useFX() {
  const { currency } = useTerminalStore();

  /**
   * Converts a value from a source currency (default USD-peg base) 
   * to the user's selected terminal currency.
   */
  const convert = useMemo(() => {
    return (value: number, sourceCurrency: Currency = 'SAR') => {
      if (!value || isNaN(value)) return 0;
      if (sourceCurrency === currency) return value;

      // 1. Normalize source to USD base
      const valueInUSD = value / PEGS[sourceCurrency];
      
      // 2. Convert USD to target regional currency
      const targetValue = valueInUSD * PEGS[currency];

      return targetValue;
    };
  }, [currency]);

  return { convert, currency };
}
