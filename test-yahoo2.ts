import YahooFinance from 'yahoo-finance2';
import fs from 'fs';

async function testYahoo() {
  try {
    const symbol = '2222.SR';
    const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });
    const fundamentals = await yahooFinance.fundamentalsTimeSeries(symbol, {
      module: 'all',
      period1: '2020-01-01',
      period2: new Date().toISOString(),
      type: 'annual'
    });
    
    fs.writeFileSync('yahoo-keys.json', JSON.stringify(fundamentals[fundamentals.length - 1], null, 2));
    console.log('Saved to yahoo-keys.json');

  } catch (error) {
    console.error(error);
  }
}

testYahoo();
