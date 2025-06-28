
export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlePattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  position: number; // index in candles array
}

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  market: 'forex' | 'crypto';
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
