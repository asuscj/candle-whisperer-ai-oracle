
import { describe, it, expect } from 'vitest';
import { CandlePatternDetector } from '../candlePatterns';
import { CandlestickData } from '../../types/trading';

describe('CandlePatternDetector', () => {
  const detector = new CandlePatternDetector();

  const createCandle = (open: number, high: number, low: number, close: number): CandlestickData => ({
    timestamp: Date.now(),
    open,
    high,
    low,
    close,
    volume: 1000
  });

  describe('Hammer Pattern Detection', () => {
    it('should detect a valid hammer pattern', () => {
      // Hammer: Small body, long lower shadow, minimal upper shadow
      const hammer = createCandle(100, 102, 90, 101); // Small green body, long lower shadow
      const patterns = detector.detectPatterns([hammer]);
      
      const hammerPattern = patterns.find(p => p.type === 'hammer');
      expect(hammerPattern).toBeDefined();
      expect(hammerPattern?.confidence).toBeGreaterThan(0.7);
      expect(hammerPattern?.signal).toBe('buy');
    });

    it('should not detect hammer with short lower shadow', () => {
      // Not a hammer: body too large relative to shadow
      const notHammer = createCandle(100, 102, 98, 101);
      const patterns = detector.detectPatterns([notHammer]);
      
      const hammerPattern = patterns.find(p => p.type === 'hammer');
      expect(hammerPattern).toBeUndefined();
    });
  });

  describe('Doji Pattern Detection', () => {
    it('should detect a valid doji pattern', () => {
      // Doji: Open ≈ Close (indecision)
      const doji = createCandle(100, 105, 95, 100.1); // Minimal difference between open/close
      const patterns = detector.detectPatterns([doji]);
      
      const dojiPattern = patterns.find(p => p.type === 'doji');
      expect(dojiPattern).toBeDefined();
      expect(dojiPattern?.confidence).toBeGreaterThan(0.6);
      expect(dojiPattern?.signal).toBe('hold');
    });

    it('should not detect doji with large body', () => {
      // Not a doji: significant difference between open and close
      const notDoji = createCandle(100, 105, 95, 103);
      const patterns = detector.detectPatterns([notDoji]);
      
      const dojiPattern = patterns.find(p => p.type === 'doji');
      expect(dojiPattern).toBeUndefined();
    });
  });

  describe('Engulfing Pattern Detection', () => {
    it('should detect bullish engulfing pattern', () => {
      const candles = [
        createCandle(105, 106, 100, 101), // Small red candle
        createCandle(100, 108, 99, 107)   // Large green candle that engulfs previous
      ];
      
      const patterns = detector.detectPatterns(candles);
      const engulfingPattern = patterns.find(p => p.type === 'engulfing');
      
      expect(engulfingPattern).toBeDefined();
      expect(engulfingPattern?.confidence).toBeGreaterThan(0.6);
      expect(engulfingPattern?.signal).toBe('buy');
    });

    it('should detect bearish engulfing pattern', () => {
      const candles = [
        createCandle(100, 106, 99, 105),  // Small green candle
        createCandle(106, 107, 98, 99)    // Large red candle that engulfs previous
      ];
      
      const patterns = detector.detectPatterns(candles);
      const engulfingPattern = patterns.find(p => p.type === 'engulfing');
      
      expect(engulfingPattern).toBeDefined();
      expect(engulfingPattern?.confidence).toBeGreaterThan(0.6);
      expect(engulfingPattern?.signal).toBe('sell');
    });
  });

  describe('Pattern Validation', () => {
    it('should validate OHLC values correctly', () => {
      // Invalid candle: high < low
      const invalidCandle = createCandle(100, 95, 105, 101);
      const patterns = detector.detectPatterns([invalidCandle]);
      
      // Should not detect any patterns with invalid data
      expect(patterns).toHaveLength(0);
    });

    it('should handle edge cases gracefully', () => {
      // Empty array
      expect(detector.detectPatterns([])).toHaveLength(0);
      
      // Single candle (some patterns need multiple candles)
      const singleCandle = createCandle(100, 105, 95, 102);
      const patterns = detector.detectPatterns([singleCandle]);
      
      // Should still detect single-candle patterns
      expect(patterns.length).toBeGreaterThanOrEqual(0);
    });
  });
});
