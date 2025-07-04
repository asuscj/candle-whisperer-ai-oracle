
import { CandleData, TradingPair } from '@/types/trading';
import { YahooFinanceAPI } from './yahooFinanceAPI';

export class DataProvider {
  private static generateRealisticCandle(
    previous: CandleData,
    trend: number = 0,
    volatility: number = 0.02
  ): CandleData {
    const basePrice = previous.close;
    const change = (Math.random() - 0.5) * volatility * basePrice + trend;
    
    const open = previous.close;
    const close = open + change;
    
    const range = Math.abs(change) * (1 + Math.random());
    const high = Math.max(open, close) + range * Math.random() * 0.5;
    const low = Math.min(open, close) - range * Math.random() * 0.5;
    
    return {
      timestamp: previous.timestamp + 60000, // 1 minute later
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
      volume: Math.floor(Math.random() * 10000 + 1000)
    };
  }

  static generateHistoricalData(pair: TradingPair, count: number = 200): CandleData[] {
    const candles: CandleData[] = [];
    const startTime = Date.now() - (count + 1) * 60000;
    
    // Base prices for different pairs
    const basePrices: { [key: string]: number } = {
      'BTCUSDT': 43500,
      'ETHUSDT': 2650,
      'EURUSD': 1.0845,
      'GBPUSD': 1.2721,
      'USDJPY': 150.25,
      'AAPL': 175.50,
      'GOOGL': 142.30,
      'TSLA': 248.75,
      'MSFT': 378.25,
      'NVDA': 875.40
    };

    const basePrice = basePrices[pair.symbol] || 1.0;
    
    // Initial candle
    candles.push({
      timestamp: startTime,
      open: basePrice,
      high: basePrice * 1.005,
      low: basePrice * 0.995,
      close: basePrice * (1 + (Math.random() - 0.5) * 0.01),
      volume: Math.floor(Math.random() * 5000 + 2000)
    });

    // Generate subsequent candles with realistic patterns
    for (let i = 1; i < count; i++) {
      let trend = 0;
      let volatility = pair.market === 'crypto' ? 0.025 : 
                      pair.market === 'stocks' ? 0.015 : 0.008;

      // Add some trending behavior
      if (i % 20 < 10) {
        trend = basePrice * 0.001 * (Math.random() > 0.5 ? 1 : -1);
      }

      // Increase volatility occasionally (news events)
      if (Math.random() < 0.1) {
        volatility *= 2;
      }

      const newCandle = this.generateRealisticCandle(candles[i - 1], trend, volatility);
      candles.push(newCandle);
    }

    return candles;
  }

  /**
   * Fetches real-time data from Yahoo Finance or falls back to simulated data
   */
  static async fetchRealTimeData(
    pair: TradingPair, 
    interval: string = '1m', 
    range: string = '1d'
  ): Promise<CandleData[]> {
    // Try to fetch real data from Yahoo Finance first
    if (YahooFinanceAPI.isAvailable() && YahooFinanceAPI.isSymbolSupported(pair.symbol)) {
      try {
        console.log(`Fetching real data for ${pair.symbol} from Yahoo Finance`);
        const realData = await YahooFinanceAPI.fetchHistoricalData(pair, interval, range);
        
        if (realData.length > 0) {
          console.log(`✅ Successfully loaded ${realData.length} real candles for ${pair.symbol}`);
          return realData;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch real data for ${pair.symbol}, falling back to simulated data:`, error);
      }
    }

    // Fallback to simulated data
    console.log(`📊 Using simulated data for ${pair.symbol}`);
    return this.generateHistoricalData(pair, 100);
  }

  /**
   * Gets current price from Yahoo Finance or simulated data
   */
  static async getCurrentPrice(pair: TradingPair): Promise<number> {
    if (YahooFinanceAPI.isAvailable() && YahooFinanceAPI.isSymbolSupported(pair.symbol)) {
      try {
        return await YahooFinanceAPI.fetchCurrentPrice(pair);
      } catch (error) {
        console.warn(`Failed to fetch current price for ${pair.symbol}:`, error);
      }
    }

    // Fallback to simulated data
    const simulatedData = this.generateHistoricalData(pair, 1);
    return simulatedData[0].close;
  }

  static getAvailablePairs(): TradingPair[] {
    // Combine Yahoo Finance supported pairs with original pairs
    const yahooFinancePairs = YahooFinanceAPI.getSupportedPairs();
    const originalPairs = [
      { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', market: 'crypto' as const },
      { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', market: 'crypto' as const },
      { symbol: 'EURUSD', baseAsset: 'EUR', quoteAsset: 'USD', market: 'forex' as const },
      { symbol: 'GBPUSD', baseAsset: 'GBP', quoteAsset: 'USD', market: 'forex' as const },
      { symbol: 'USDJPY', baseAsset: 'USD', quoteAsset: 'JPY', market: 'forex' as const }
    ];

    // Merge and deduplicate by symbol
    const allPairs = [...yahooFinancePairs, ...originalPairs];
    const uniquePairs = allPairs.filter((pair, index, self) => 
      index === self.findIndex(p => p.symbol === pair.symbol)
    );

    return uniquePairs;
  }

  /**
   * Checks if real data is available and configured
   */
  static isRealDataAvailable(): boolean {
    return YahooFinanceAPI.isAvailable();
  }

  /**
   * Gets data source information
   */
  static getDataSourceInfo(): { source: string; available: boolean; supportedPairs: number } {
    return {
      source: YahooFinanceAPI.isAvailable() ? 'Yahoo Finance API' : 'Simulated Data',
      available: YahooFinanceAPI.isAvailable(),
      supportedPairs: YahooFinanceAPI.getSupportedPairs().length
    };
  }
}
