import YahooFinance from 'yahoo-finance2';

async function testYahoo() {
  try {
    const symbol = '2222.SR';
    console.log(`Fetching data for ${symbol}...`);

    const yahooFinance = new YahooFinance();

    // 1. Fetch quote details & financials
    const quoteSummary = await yahooFinance.quoteSummary(symbol, {
      modules: [
        'incomeStatementHistory',
        'balanceSheetHistory',
        'cashflowStatementHistory',
        'financialData',
        'defaultKeyStatistics',
        'price'
      ]
    });

    console.log('--- Price ---');
    console.log("regularMarketPrice:", quoteSummary.price?.regularMarketPrice);
    
    // 2. Fetch historical prices
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const historical = await yahooFinance.historical(symbol, {
      period1: startDate,
      interval: '1d'
    });
    
    console.log('--- Historical ---');
    console.log(`Got ${historical.length} historical records.`);
    console.log("Latest historical close:", historical[historical.length - 1]?.close);
    
  } catch (error) {
    console.error("Error fetching Yahoo data:", error);
  }
}

testYahoo();
