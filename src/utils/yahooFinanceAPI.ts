
import { CandleData, TradingPair } from '@/types/trading';

/**
 * Yahoo Finance API Service
 * Provides real-time and historical market data from Yahoo Finance
 */
export class YahooFinanceAPI {
  private static readonly BASE_URL = import.meta.env.VITE_YAHOO_FINANCE_API_URL || 'https://query1.finance.yahoo.com/v8/finance/chart';
  private static readonly CORS_PROXY = import.meta.env.VITE_CORS_PROXY || 'https://api.allorigins.win/raw?url=';
  private static readonly ENABLE_REAL_DATA = import.meta.env.VITE_ENABLE_REAL_DATA === 'true';

  /**
   * Maps our internal trading pairs to Yahoo Finance symbols
   */
  private static getYahooSymbol(pair: TradingPair): string {
    const symbolMap: { [key: string]: string } = {
      'BTCUSDT': 'BTC-USD',
      'ETHUSDT': 'ETH-USD',
      'EURUSD': 'EURUSD=X',
      'GBPUSD': 'GBPUSD=X',
      'USDJPY': 'USDJPY=X',
      'AAPL': 'AAPL',
      'GOOGL': 'GOOGL',
      'TSLA': 'TSLA',
      'MSFT': 'MSFT',
      'NVDA': 'NVDA'
    };

    return symbolMap[pair.symbol] || pair.symbol;
  }

  /**
   * Converts Yahoo Finance interval format to our internal format
   */
  private static getYahooInterval(timeframe: string): string {
    const intervalMap: { [key: string]: string } = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '1d': '1d',
      '1w': '1wk',
      '1M': '1mo'
    };

    return intervalMap[timeframe] || '1m';
  }

  /**
   * Fetches historical data from Yahoo Finance API
   */
  static async fetchHistoricalData(
    pair: TradingPair, 
    interval: string = '1m', 
    range: string = '1d'
  ): Promise<CandleData[]> {
    if (!this.ENABLE_REAL_DATA) {
      console.log('Real data disabled, using simulated data');
      return [];
    }

    try {
      const symbol = this.getYahooSymbol(pair);
      const yahooInterval = this.getYahooInterval(interval);
      
      const url = `${this.BASE_URL}/${symbol}?interval=${yahooInterval}&range=${range}`;
      const proxiedUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;

      console.log(`Fetching data from Yahoo Finance: ${symbol} (${yahooInterval})`);

      const response = await fetch(proxiedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        throw new Error('No data available from Yahoo Finance');
      }

      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      if (!timestamps || !quotes) {
        throw new Error('Invalid data format from Yahoo Finance');
      }

      const candles: CandleData[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i] * 1000; // Convert to milliseconds
        const open = quotes.open[i];
        const high = quotes.high[i];
        const low = quotes.low[i];
        const close = quotes.close[i];
        const volume = quotes.volume[i] || 0;

        // Skip invalid data points
        if (open && high && low && close) {
          candles.push({
            timestamp,
            open: parseFloat(open.toFixed(5)),
            high: parseFloat(high.toFixed(5)),
            low: parseFloat(low.toFixed(5)),
            close: parseFloat(close.toFixed(5)),
            volume
          });
        }
      }

      console.log(`Successfully fetched ${candles.length} candles from Yahoo Finance`);
      return candles;

    } catch (error) {
      console.error('Error fetching data from Yahoo Finance:', error);
      throw error;
    }
  }

  /**
   * Fetches current price for a trading pair
   */
  static async fetchCurrentPrice(pair: TradingPair): Promise<number> {
    try {
      const candles = await this.fetchHistoricalData(pair, '1m', '1d');
      if (candles.length > 0) {
        return candles[candles.length - 1].close;
      }
      throw new Error('No price data available');
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw error;
    }
  }

  /**
   * Checks if Yahoo Finance API is available and configured
   */
  static isAvailable(): boolean {
    return this.ENABLE_REAL_DATA && !!this.BASE_URL;
  }

  /**
   * Gets available trading pairs with Yahoo Finance support
   */
  static getSupportedPairs(): TradingPair[] {
    return [
      { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USD', market: 'crypto' },
      { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USD', market: 'crypto' },
      { symbol: 'EURUSD', baseAsset: 'EUR', quoteAsset: 'USD', market: 'forex' },
      { symbol: 'GBPUSD', baseAsset: 'GBP', quoteAsset: 'USD', market: 'forex' },
      { symbol: 'USDJPY', baseAsset: 'USD', quoteAsset: 'JPY', market: 'forex' },
      { symbol: 'AAPL', baseAsset: 'AAPL', quoteAsset: 'USD', market: 'stocks' },
      { symbol: 'GOOGL', baseAsset: 'GOOGL', quoteAsset: 'USD', market: 'stocks' },
      { symbol: 'TSLA', baseAsset: 'TSLA', quoteAsset: 'USD', market: 'stocks' },
      { symbol: 'MSFT', baseAsset: 'MSFT', quoteAsset: 'USD', market: 'stocks' },
      { symbol: 'NVDA', baseAsset: 'NVDA', quoteAsset: 'USD', market: 'stocks' }
    ];
  }

  /**
   * Validates if a symbol is supported by Yahoo Finance
   */
  static isSymbolSupported(symbol: string): boolean {
    const supportedSymbols = this.getSupportedPairs().map(pair => pair.symbol);
    return supportedSymbols.includes(symbol);
  }
}
