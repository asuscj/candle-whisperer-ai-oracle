
import { describe, it, expect, beforeEach } from 'vitest';
import { MLPredictor } from '../mlPredictor';
import { CandlestickData } from '../../types/trading';

describe('MLPredictor', () => {
  let predictor: MLPredictor;

  beforeEach(() => {
    predictor = new MLPredictor();
  });

  const createCandle = (open: number, high: number, low: number, close: number): CandlestickData => ({
    timestamp: Date.now(),
    open,
    high,
    low,
    close,
    volume: 1000
  });

  describe('Training', () => {
    it('should require minimum data for training', () => {
      const insufficientData = Array.from({ length: 10 }, (_, i) => 
        createCandle(100 + i, 105 + i, 95 + i, 102 + i)
      );

      const result = predictor.train(insufficientData);
      expect(result.success).toBe(false);
      expect(result.message).toContain('menos de 20 velas');
    });

    it('should train successfully with sufficient data', () => {
      const sufficientData = Array.from({ length: 60 }, (_, i) => 
        createCandle(100 + i * 0.1, 105 + i * 0.1, 95 + i * 0.1, 102 + i * 0.1)
      );

      const result = predictor.train(sufficientData);
      expect(result.success).toBe(true);
      expect(result.epochsCompleted).toBeGreaterThan(0);
    });

    it('should handle training with invalid data gracefully', () => {
      const invalidData = [
        createCandle(100, 95, 105, 101), // high < low
        createCandle(NaN, 105, 95, 102), // NaN values
      ];

      const result = predictor.train(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Prediction', () => {
    it('should make predictions after training', () => {
      // Train with sufficient data
      const trainingData = Array.from({ length: 60 }, (_, i) => 
        createCandle(100 + i * 0.1, 105 + i * 0.1, 95 + i * 0.1, 102 + i * 0.1)
      );
      
      predictor.train(trainingData);

      // Make prediction
      const recentData = trainingData.slice(-10);
      const prediction = predictor.predict(recentData);

      expect(prediction).toBeDefined();
      expect(prediction.predictedPrice).toBeGreaterThan(0);
      expect(['buy', 'sell', 'hold']).toContain(prediction.signal);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    it('should not make predictions without training', () => {
      const testData = [createCandle(100, 105, 95, 102)];
      const prediction = predictor.predict(testData);

      expect(prediction.predictedPrice).toBe(0);
      expect(prediction.signal).toBe('hold');
      expect(prediction.confidence).toBe(0);
    });

    it('should handle insufficient data for prediction', () => {
      // Train first
      const trainingData = Array.from({ length: 60 }, (_, i) => 
        createCandle(100 + i * 0.1, 105 + i * 0.1, 95 + i * 0.1, 102 + i * 0.1)
      );
      predictor.train(trainingData);

      // Try to predict with insufficient data
      const insufficientData = [createCandle(100, 105, 95, 102)];
      const prediction = predictor.predict(insufficientData);

      // Should still return a valid structure but with low confidence
      expect(prediction).toBeDefined();
      expect(prediction.confidence).toBeLessThan(0.5);
    });
  });

  describe('Model Management', () => {
    it('should report training status correctly', () => {
      expect(predictor.isTrained()).toBe(false);

      const trainingData = Array.from({ length: 60 }, (_, i) => 
        createCandle(100 + i * 0.1, 105 + i * 0.1, 95 + i * 0.1, 102 + i * 0.1)
      );
      
      predictor.train(trainingData);
      expect(predictor.isTrained()).toBe(true);
    });

    it('should provide model statistics', () => {
      const trainingData = Array.from({ length: 60 }, (_, i) => 
        createCandle(100 + i * 0.1, 105 + i * 0.1, 95 + i * 0.1, 102 + i * 0.1)
      );
      
      const result = predictor.train(trainingData);
      const stats = predictor.getModelStats();

      expect(stats.trainingDataSize).toBe(trainingData.length);
      expect(stats.lastTrainingDate).toBeDefined();
      expect(stats.totalPredictions).toBe(0); // No predictions made yet
    });
  });

  describe('Feature Engineering', () => {
    it('should generate consistent features for same input', () => {
      const candle = createCandle(100, 105, 95, 102);
      const features1 = predictor.extractFeatures([candle]);
      const features2 = predictor.extractFeatures([candle]);

      expect(features1).toEqual(features2);
    });

    it('should generate different features for different inputs', () => {
      const candle1 = createCandle(100, 105, 95, 102);
      const candle2 = createCandle(110, 115, 105, 112);
      
      const features1 = predictor.extractFeatures([candle1]);
      const features2 = predictor.extractFeatures([candle2]);

      expect(features1).not.toEqual(features2);
    });
  });
});
