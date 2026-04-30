import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getHistoricalData, getFundamentals } from '@/lib/market/yahoo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  
  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'quote': {
        const quote = await getQuote(ticker);
        return NextResponse.json(quote);
      }
      
      case 'history': {
        const range = searchParams.get('range') || '1y'; // Optional: Default to 1 year
        // We'll calculate a simple period1 based on the range.
        // For simplicity, we just use a default date or calculate based on the range.
        const period1 = new Date();
        period1.setFullYear(period1.getFullYear() - 1); // defaulting to 1 year ago for now
        
        const history = await getHistoricalData(ticker, period1, '1d');
        return NextResponse.json(history);
      }
      
      case 'fundamentals': {
        const fundamentals = await getFundamentals(ticker);
        return NextResponse.json(fundamentals);
      }
      
      default: {
        return NextResponse.json(
          { error: 'Invalid type parameter. Use ?type=quote, ?type=history, or ?type=fundamentals.' },
          { status: 400 }
        );
      }
    }
  } catch (error: any) {
    console.error(`Error in /api/yahoo/${ticker}?type=${type}:`, error);
    return NextResponse.json(
      { error: 'Data not found or failed to fetch' },
      { status: 404 }
    );
  }
}
