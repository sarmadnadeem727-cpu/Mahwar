import yahooFinance from 'yahoo-finance2';

// Ensure Tadawul (Saudi) tickers have the correct .SR suffix if they don't already
export const formatTicker = (ticker: string) => {
  if (/^\d{4}$/.test(ticker)) {
    return `${ticker}.SR`;
  }
  return ticker;
};

export async function getQuote(ticker: string | string[]) {
  try {
    if (Array.isArray(ticker)) {
      const symbols = ticker.map(formatTicker);
      const quotes = await yahooFinance.quote(symbols);
      return quotes;
    } else {
      const symbol = formatTicker(ticker);
      const quote = await yahooFinance.quote(symbol);
      return quote;
    }
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    throw new Error('Failed to fetch quote data');
  }
}

export async function getHistoricalData(ticker: string, period1: string | Date = '2023-01-01', interval: '1d' | '1wk' | '1mo' = '1d') {
  try {
    const symbol = formatTicker(ticker);
    const result = await yahooFinance.historical(symbol, {
      period1,
      interval,
    });
    return result;
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    throw new Error('Failed to fetch historical data');
  }
}

export async function getFundamentals(ticker: string) {
  try {
    const symbol = formatTicker(ticker);
    const result = (await yahooFinance.quoteSummary(symbol, {
      modules: [
        'incomeStatementHistory',
        'balanceSheetHistory',
        'cashflowStatementHistory',
        'financialData',
        'defaultKeyStatistics'
      ],
    })) as any;

    return {
      incomeStatement: result.incomeStatementHistory?.incomeStatementHistory || [],
      balanceSheet: result.balanceSheetHistory?.balanceSheetStatements || [],
      cashFlow: result.cashflowStatementHistory?.cashflowStatements || [],
      financialData: result.financialData || null,
      keyStatistics: result.defaultKeyStatistics || null,
    };
  } catch (error) {
    console.error(`Error fetching fundamentals for ${ticker}:`, error);
    throw new Error('Failed to fetch fundamentals data');
  }
}
