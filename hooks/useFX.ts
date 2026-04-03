"use client";

import { useMemo } from 'react';
import { useTerminalStore, type Currency } from '@/store/useTerminalStore';

// Official Central Bank USD Pegs
const PEGS: Record<Currency, number> = {
  SAR: 3.75,     // Saudi Riyal
  AED: 3.6725,   // UAE Dirham
  QAR: 3.64,     // Qatari Riyal
  OMR: 0.3845,   // Omani Rial
  BHD: 0.376,    // Bahraini Dinar
  KWD: 0.307,    // Kuwaiti Dinar
};

export function useFX() {
  const { currency } = useTerminalStore();

  /**
   * Converts a value from a source currency (default SAR) to a target currency.
   * Since all GCC currencies are pegged to USD, we use USD as the base for the matrix.
   */
  const convert = useMemo(() => {
    return (value: number, sourceCurrency: Currency = 'SAR', targetCurrency: Currency = currency) => {
      if (!value || isNaN(value)) return 0;
      if (sourceCurrency === targetCurrency) return value;

      // Logic: Value (Source) -> Value (USD) -> Value (Target)
      const valueInUSD = value / PEGS[sourceCurrency];
      const targetValue = valueInUSD * PEGS[targetCurrency];

      return targetValue;
    };
  }, [currency]);

  return { convert, currency };
}
