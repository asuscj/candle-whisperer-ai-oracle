
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedValidationSystem } from '../enhancedValidationSystem';
import { CandlestickData, MLPrediction } from '../../types/trading';

describe('EnhancedValidationSystem', () => {
  let validationSystem: EnhancedValidationSystem;

  beforeEach(() => {
    validationSystem = new EnhancedValidationSystem(3); // 3 candles delay for testing
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  const createCandle = (close: number): CandlestickData => ({
    timestamp: Date.now(),
    open: close - 1,
    high: close + 2,
    low: close - 2,
    close,
    volume: 1000
  });

  const createPrediction = (predictedPrice: number, signal: 'buy' | 'sell' | 'hold'): MLPrediction => ({
    predictedPrice,
    signal,
    confidence: 0.8,
    timestamp: Date.now()
  });

  describe('Prediction Submission', () => {
    it('should accept and track predictions', () => {
      const prediction = createPrediction(105, 'buy');
      const patternSignal = 'buy';
      
      validationSystem.submitPrediction(prediction, patternSignal);
      
      const metrics = validationSystem.getMetrics();
      expect(metrics.totalValidations).toBe(0); // Not validated yet
      
      const pending = validationSystem.getPendingValidations();
      expect(pending).toHaveLength(1);
      expect(pending[0].originalPrediction.signal).toBe('buy');
    });

    it('should handle conflicting signals', () => {
      const prediction = createPrediction(105, 'buy');
      const patternSignal = 'sell'; // Conflict!
      
      validationSystem.submitPrediction(prediction, patternSignal);
      
      const pending = validationSystem.getPendingValidations();
      expect(pending[0].conflictResolution.hasConflict).toBe(true);
      expect(pending[0].conflictResolution.originalMLSignal).toBe('buy');
      expect(pending[0].conflictResolution.originalPatternSignal).toBe('sell');
    });
  });

  describe('Automatic Validation', () => {
    it('should validate predictions after sufficient candles', () => {
      const prediction = createPrediction(105, 'buy');
      validationSystem.submitPrediction(prediction, 'buy');
      
      // Add candles to trigger validation
      const candles = [
        createCandle(102), // Candle 1
        createCandle(103), // Candle 2  
        createCandle(106)  // Candle 3 - should trigger validation
      ];
      
      candles.forEach(candle => {
        validationSystem.processNewCandle(candle);
      });
      
      const metrics = validationSystem.getMetrics();
      expect(metrics.totalValidations).toBe(1);
      
      const pending = validationSystem.getPendingValidations();
      expect(pending).toHaveLength(0); // Should be validated and removed from pending
    });

    it('should calculate price accuracy correctly', () => {
      const prediction = createPrediction(105, 'buy'); // Predicted 105
      validationSystem.submitPrediction(prediction, 'buy');
      
      // Add candles, final price will be 104 (1 point off from 105)
      const candles = [
        createCandle(102),
        createCandle(103),
        createCandle(104) // Actual final price: 104
      ];
      
      candles.forEach(candle => {
        validationSystem.processNewCandle(candle);
      });
      
      const recent = validationSystem.getRecentValidations();
      expect(recent).toHaveLength(1);
      
      const validation = recent[0];
      expect(validation.priceAccuracy).toBeCloseTo(0.99, 2); // |104-105|/104 = ~0.01, so accuracy = 0.99
    });
  });

  describe('Metrics Calculation', () => {
    it('should track overall accuracy metrics', () => {
      // Submit multiple predictions
      const predictions = [
        { pred: createPrediction(105, 'buy'), pattern: 'buy', actualPrice: 106 }, // Good prediction
        { pred: createPrediction(100, 'sell'), pattern: 'sell', actualPrice: 98 }, // Good prediction  
        { pred: createPrediction(110, 'buy'), pattern: 'buy', actualPrice: 105 }  // Poor prediction
      ];
      
      predictions.forEach(({ pred, pattern, actualPrice }) => {
        validationSystem.submitPrediction(pred, pattern);
        
        // Process candles to validate
        const candles = [
          createCandle(actualPrice - 2),
          createCandle(actualPrice - 1),
          createCandle(actualPrice)
        ];
        
        candles.forEach(candle => {
          validationSystem.processNewCandle(candle);
        });
      });
      
      const metrics = validationSystem.getMetrics();
      expect(metrics.totalValidations).toBe(3);
      expect(metrics.priceAccuracy).toBeGreaterThan(0);
      expect(metrics.signalAccuracy).toBeGreaterThan(0);
    });

    it('should track performance trends', () => {
      // Add several good predictions
      for (let i = 0; i < 15; i++) {
        const prediction = createPrediction(100 + i, 'buy');
        validationSystem.submitPrediction(prediction, 'buy');
        
        const candles = [
          createCandle(100 + i - 1),
          createCandle(100 + i),
          createCandle(100 + i + 1) // Close to predicted, should be accurate
        ];
        
        candles.forEach(candle => {
          validationSystem.processNewCandle(candle);
        });
      }
      
      const metrics = validationSystem.getMetrics();
      expect(metrics.recentPerformance.trend).toBe('stable'); // Good consistent performance
      expect(metrics.recentPerformance.last10Accuracy).toBeGreaterThan(0.8);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts based on confidence', () => {
      const highConfidencePrediction = createPrediction(105, 'buy');
      highConfidencePrediction.confidence = 0.9;
      
      validationSystem.submitPrediction(highConfidencePrediction, 'sell'); // Conflict
      
      const pending = validationSystem.getPendingValidations();
      const conflictResolution = pending[0].conflictResolution;
      
      expect(conflictResolution.hasConflict).toBe(true);
      expect(conflictResolution.resolvedSignal).toBe('buy'); // High confidence ML should win
      expect(conflictResolution.resolutionReason).toContain('confianza');
    });

    it('should track conflict resolution accuracy', () => {
      const prediction = createPrediction(105, 'buy');
      prediction.confidence = 0.9;
      
      validationSystem.submitPrediction(prediction, 'sell');
      
      // Validate with result that confirms ML was right
      const candles = [
        createCandle(103),
        createCandle(104),
        createCandle(106) // Price went up, confirming 'buy' signal
      ];
      
      candles.forEach(candle => {
        validationSystem.processNewCandle(candle);
      });
      
      const metrics = validationSystem.getMetrics();
      expect(metrics.conflictResolutionStats.totalConflicts).toBe(1);
      expect(metrics.conflictResolutionStats.correctResolutions).toBe(1);
      expect(metrics.conflictResolutionStats.resolutionAccuracy).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid candle data', () => {
      const prediction = createPrediction(105, 'buy');
      validationSystem.submitPrediction(prediction, 'buy');
      
      // Invalid candle with NaN values
      const invalidCandle = createCandle(NaN);
      validationSystem.processNewCandle(invalidCandle);
      
      // Should not crash and pending should remain
      const pending = validationSystem.getPendingValidations();
      expect(pending).toHaveLength(1);
    });

    it('should clean up old pending validations', () => {
      const prediction = createPrediction(105, 'buy');
      validationSystem.submitPrediction(prediction, 'buy');
      
      // Simulate time passing without sufficient candles
      vi.advanceTimersByTime(1000 * 60 * 30); // 30 minutes
      
      // Process a candle to trigger cleanup
      validationSystem.processNewCandle(createCandle(100));
      
      // Should have cleaned up old pending validations  
      const pending = validationSystem.getPendingValidations();
      expect(pending).toHaveLength(0);
    });
  });
});
