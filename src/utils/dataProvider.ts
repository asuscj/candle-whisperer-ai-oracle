
import { CandleData, TradingPair } from '@/types/trading';

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
      'USDJPY': 150.25
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
      let volatility = pair.market === 'crypto' ? 0.025 : 0.008;

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

  static async fetchRealTimeData(pair: TradingPair): Promise<CandleData[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, this would fetch from Binance, Alpha Vantage, etc.
    return this.generateHistoricalData(pair, 100);
  }

  static getAvailablePairs(): TradingPair[] {
    return [
      { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', market: 'crypto' },
      { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', market: 'crypto' },
      { symbol: 'EURUSD', baseAsset: 'EUR', quoteAsset: 'USD', market: 'forex' },
      { symbol: 'GBPUSD', baseAsset: 'GBP', quoteAsset: 'USD', market: 'forex' },
      { symbol: 'USDJPY', baseAsset: 'USD', quoteAsset: 'JPY', market: 'forex' }
    ];
  }
}
