
export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Add alias for backwards compatibility
export interface CandlestickData extends CandleData {}

export interface CandlePattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  position: number; // index in candles array
  signal: 'buy' | 'sell' | 'hold'; // Add missing signal property
}

// Add PatternDetection interface
export interface PatternDetection {
  type: string;
  timestamp: number;
  confidence: number;
  signal: 'buy' | 'sell' | 'hold';
  candleIndex: number;
  name: string;
  description: string;
  position: number;
}

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  market: 'forex' | 'crypto' | 'stocks'; // Added stocks market
}

export interface MLPrediction {
  nextCandle: {
    open: number;
    high: number;
    low: number;
    close: number;
    confidence: number;
  };
  pattern: string;
  signal: 'buy' | 'sell' | 'hold';
  accuracy: number;
  // Add missing properties for tests
  predictedPrice: number;
  confidence: number;
  timestamp: number;
}

export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  profitFactor: number;
  winRate: number;
  totalTrades: number;
}

export interface TimeframeOption {
  value: string;
  label: string;
  duration: number; // in milliseconds
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  returns: number[];
  equity: number[];
}

export interface OnlineLearningMetrics {
  samplesProcessed: number;
  reservoirSize: number;
  memoryUsage: number;
  lastUpdate: number;
  adaptationRate: number;
}

// New interface for data source information
export interface DataSourceInfo {
  source: string;
  available: boolean;
  supportedPairs: number;
  lastUpdate?: number;
  rateLimit?: {
    remaining: number;
    resetTime: number;
  };
}
