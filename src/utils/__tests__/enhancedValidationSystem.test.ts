
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedValidationSystem } from '../enhancedValidationSystem';
import { CandlestickData, MLPrediction } from '../../types/trading';

describe('EnhancedValidationSystem', () => {
  let validationSystem: EnhancedValidationSystem;

  beforeEach(() => {
    validationSystem = new EnhancedValidationSystem();
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
    nextCandle: {
      open: predictedPrice - 1,
      high: predictedPrice + 2,
      low: predictedPrice - 2,
      close: predictedPrice,
      confidence: 0.8
    },
    pattern: 'Test Pattern',
    signal,
    accuracy: 0.8,
    predictedPrice,
    confidence: 0.8,
    timestamp: Date.now()
  });

  describe('Prediction Registration', () => {
    it('should register predictions for validation', () => {
      const prediction = createPrediction(105, 'buy');
      
      const predictionId = validationSystem.registerPrediction(prediction, 0);
      
      expect(predictionId).toBeDefined();
      expect(predictionId).toContain('pred_');
      expect(validationSystem.getPendingCount()).toBe(1);
    });
  });

  describe('Automatic Validation', () => {
    it('should validate predictions after sufficient candles', () => {
      const prediction = createPrediction(105, 'buy');
      validationSystem.registerPrediction(prediction, 0);
      
      // Create candles to trigger validation (need 5+ candles gap)
      const candles = [
        createCandle(100), // Index 0 - prediction made here
        createCandle(102), // Index 1
        createCandle(103), // Index 2  
        createCandle(104), // Index 3
        createCandle(105), // Index 4
        createCandle(106)  // Index 5 - should trigger validation
      ];
      
      const validations = validationSystem.processAutomaticValidation(candles, 5);
      
      expect(validations.length).toBe(1);
      expect(validations[0].predictionId).toBeDefined();
      expect(validations[0].priceAccuracy).toBeGreaterThan(0);
    });

    it('should calculate price accuracy correctly', () => {
      const prediction = createPrediction(105, 'buy'); // Predicted 105
      validationSystem.registerPrediction(prediction, 0);
      
      // Add candles, final price will be 104 (close to prediction)
      const candles = [
        createCandle(100), // Index 0
        createCandle(101), // Index 1
        createCandle(102), // Index 2
        createCandle(103), // Index 3
        createCandle(104), // Index 4
        createCandle(104)  // Index 5 - actual price: 104, predicted: 105
      ];
      
      const validations = validationSystem.processAutomaticValidation(candles, 5);
      
      expect(validations.length).toBe(1);
      const validation = validations[0];
      expect(validation.priceAccuracy).toBeGreaterThan(0.9); // Should be high accuracy
    });
  });

  describe('Enhanced Metrics', () => {
    it('should track overall accuracy metrics', () => {
      // Register and validate multiple predictions
      const predictions = [
        { pred: createPrediction(105, 'buy'), actualPrice: 106 }, // Good prediction
        { pred: createPrediction(100, 'sell'), actualPrice: 98 }, // Good prediction  
        { pred: createPrediction(110, 'buy'), actualPrice: 105 }  // Poor prediction
      ];
      
      predictions.forEach(({ pred }, index) => {
        validationSystem.registerPrediction(pred, index * 6);
      });
      
      // Create validation scenario for each prediction
      predictions.forEach(({ actualPrice }, predIndex) => {
        const baseIndex = predIndex * 6;
        const candles = Array.from({ length: 12 }, (_, i) => 
          createCandle(actualPrice + (i - 6) * 0.1)
        );
        
        validationSystem.processAutomaticValidation(candles, baseIndex + 5);
      });
      
      const metrics = validationSystem.getEnhancedMetrics();
      expect(metrics.totalValidations).toBe(3);
      expect(metrics.priceAccuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.signalAccuracy).toBeGreaterThanOrEqual(0);
    });
  });

  describe('System State', () => {
    it('should track pending validations count', () => {
      expect(validationSystem.getPendingCount()).toBe(0);
      
      validationSystem.registerPrediction(createPrediction(105, 'buy'), 0);
      expect(validationSystem.getPendingCount()).toBe(1);
      
      validationSystem.registerPrediction(createPrediction(110, 'sell'), 1);
      expect(validationSystem.getPendingCount()).toBe(2);
    });

    it('should provide recent validations', () => {
      const prediction = createPrediction(105, 'buy');
      validationSystem.registerPrediction(prediction, 0);
      
      const candles = Array.from({ length: 6 }, (_, i) => createCandle(100 + i));
      validationSystem.processAutomaticValidation(candles, 5);
      
      const recentValidations = validationSystem.getRecentValidations(5);
      expect(recentValidations).toHaveLength(1);
    });
  });
});
