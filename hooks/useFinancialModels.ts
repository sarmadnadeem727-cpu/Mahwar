"use client";

import { useState, useCallback } from "react";
// For now, we'll keep the hook structure but allow direct engine imports for faster calcs.
import { runDcf, DcfYear, DcfParams, EvBridge } from "@/lib/finance/dcf";
import { runLbo, DebtTranche, LboYearInput } from "@/lib/finance/lbo";
import { validateThreeStatement, IncomeStatement, BalanceSheet, CashFlow } from "@/lib/finance/threeStatement";
// NOTE: Do NOT import fetchFundamentals/fetchRealTimeQuote directly here.
// They must be called via the /api/market/* server proxy to avoid CORS.

export function useDCF() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReturnType<typeof runDcf> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (years: DcfYear[], params: DcfParams, bridge: EvBridge) => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this might be a server action or API call.
      // Here we run it client-side for immediate feedback.
      const result = runDcf(years, params, bridge);
      setData(result);
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { calculate, data, loading, error };
}

export function useLBO() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReturnType<typeof runLbo> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (tranches: DebtTranche[], yearInputs: LboYearInput[], config: {
    entryEv: number;
    entryEbitda: number;
    transactionFees: number;
    exitYear: number;
    exitMultiple: number;
    minCash?: number;
    openingCash?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = runLbo(
        tranches,
        yearInputs,
        config.entryEv,
        config.entryEbitda,
        config.transactionFees,
        config.exitYear,
        config.exitMultiple,
        config.minCash,
        config.openingCash
      );
      setData(result);
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { calculate, data, loading, error };
}

export function useThreeStatement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReturnType<typeof validateThreeStatement> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(async (is: IncomeStatement, bs: BalanceSheet, cf: CashFlow, prevBs?: BalanceSheet) => {
    setLoading(true);
    setError(null);
    try {
      // Data is already mapped, just validate directly
      const result = validateThreeStatement(is, bs, cf, prevBs);
      setData(result);
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { validate, data, loading, error };
}

