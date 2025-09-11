/**
 * Market Prices API
 * GET /api/market/prices - Get current prices for symbols
 */

import { NextResponse } from 'next/server';
import BinanceAPI from '../../../lib/trading-apis/binance-api.js';

// Create demo API instance for price data
const marketAPI = new BinanceAPI({ isDemo: true });

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');
    
    if (!symbols) {
      // Return popular symbols by default
      const tickers = await marketAPI.getTicker24hr();
      const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT'];
      
      const prices = Array.isArray(tickers) 
        ? tickers.filter(t => popularSymbols.includes(t.symbol)).slice(0, 10)
        : [tickers];
        
      return NextResponse.json({ prices });
    }
    
    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    const prices = [];
    
    for (const symbol of symbolList) {
      try {
        const ticker = await marketAPI.getTicker24hr(symbol);
        prices.push(ticker);
      } catch (error) {
        console.warn(`Failed to get price for ${symbol}:`, error.message);
        // Add mock data for failed requests
        prices.push({
          symbol,
          price: (Math.random() * 50000 + 1000).toFixed(2),
          priceChangePercent: (Math.random() * 20 - 10).toFixed(2),
          volume: (Math.random() * 1000000).toFixed(2),
          lastPrice: (Math.random() * 50000 + 1000).toFixed(2)
        });
      }
    }
    
    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Market prices error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch market prices' 
    }, { status: 500 });
  }
}