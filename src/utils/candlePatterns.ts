
import { CandleData, CandlePattern } from '@/types/trading';

export class CandlePatternDetector {
  private static bodySize(candle: CandleData): number {
    return Math.abs(candle.close - candle.open);
  }

  private static upperShadow(candle: CandleData): number {
    return candle.high - Math.max(candle.open, candle.close);
  }

  private static lowerShadow(candle: CandleData): number {
    return Math.min(candle.open, candle.close) - candle.low;
  }

  private static isDojiPattern(candle: CandleData): boolean {
    const bodySize = this.bodySize(candle);
    const range = candle.high - candle.low;
    return bodySize / range < 0.1; // Body is less than 10% of total range
  }

  private static isHammerPattern(candle: CandleData): boolean {
    const bodySize = this.bodySize(candle);
    const lowerShadow = this.lowerShadow(candle);
    const upperShadow = this.upperShadow(candle);
    
    return (
      lowerShadow > bodySize * 2 && // Long lower shadow
      upperShadow < bodySize * 0.5   // Short upper shadow
    );
  }

  private static isEngulfingPattern(candles: CandleData[], index: number): boolean {
    if (index < 1) return false;
    
    const current = candles[index];
    const previous = candles[index - 1];
    
    const currentIsBullish = current.close > current.open;
    const previousIsBearish = previous.close < previous.open;
    
    return (
      currentIsBullish &&
      previousIsBearish &&
      current.open < previous.close &&
      current.close > previous.open
    );
  }

  static detectPatterns(candles: CandleData[]): CandlePattern[] {
    const patterns: CandlePattern[] = [];

    candles.forEach((candle, index) => {
      // Doji Pattern
      if (this.isDojiPattern(candle)) {
        patterns.push({
          name: 'Doji',
          type: 'neutral',
          confidence: 0.8,
          description: 'Indecision in the market, potential reversal signal',
          position: index
        });
      }

      // Hammer Pattern
      if (this.isHammerPattern(candle)) {
        patterns.push({
          name: 'Hammer',
          type: 'bullish',
          confidence: 0.75,
          description: 'Potential bullish reversal after downtrend',
          position: index
        });
      }

      // Bullish Engulfing
      if (this.isEngulfingPattern(candles, index)) {
        patterns.push({
          name: 'Bullish Engulfing',
          type: 'bullish',
          confidence: 0.85,
          description: 'Strong bullish reversal signal',
          position: index
        });
      }
    });

    return patterns;
  }

  static calculateConfidence(pattern: CandlePattern, candles: CandleData[]): number {
    // Enhanced confidence calculation based on volume and context
    const candle = candles[pattern.position];
    if (!candle) return pattern.confidence;

    // Factor in volume (if above average, increase confidence)
    const avgVolume = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
    const volumeFactor = candle.volume > avgVolume ? 1.1 : 0.9;

    return Math.min(pattern.confidence * volumeFactor, 1.0);
  }
}
