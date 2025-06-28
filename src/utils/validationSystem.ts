import { CandleData, MLPrediction, CandlePattern } from '@/types/trading';

export interface PredictionValidation {
  predictionId: string;
  timestamp: number;
  prediction: MLPrediction;
  actualOutcome: CandleData | null;
  accuracy: number;
  patternSuccess: boolean;
  errorMagnitude: number;
  validationStatus: 'pending' | 'validated' | 'failed';
}

export interface ValidationMetrics {
  totalPredictions: number;
  correctPredictions: number;
  accuracyTrend: number[];
  patternSuccessRate: { [pattern: string]: number };
  averageErrorMagnitude: number;
  recentAccuracy: number;
}

export class RealTimeValidationSystem {
  private pendingValidations: Map<string, PredictionValidation> = new Map();
  private validatedPredictions: PredictionValidation[] = [];
  private validationWindow: number = 1000; // Keep last 1000 validations
  private slidingAccuracy: number[] = [];
  private slidingWindow: number = 50;

  public addPrediction(prediction: MLPrediction): string {
    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const validation: PredictionValidation = {
      predictionId,
      timestamp: Date.now(),
      prediction,
      actualOutcome: null,
      accuracy: 0,
      patternSuccess: false,
      errorMagnitude: 0,
      validationStatus: 'pending'
    };

    this.pendingValidations.set(predictionId, validation);
    
    console.log(`Prediction registered for validation: ${predictionId}`);
    return predictionId;
  }

  public validatePrediction(predictionId: string, actualCandle: CandleData): PredictionValidation | null {
    const validation = this.pendingValidations.get(predictionId);
    if (!validation) return null;

    // Calculate accuracy based on price prediction
    const predictedClose = validation.prediction.nextCandle.close;
    const actualClose = actualCandle.close;
    const errorMagnitude = Math.abs(predictedClose - actualClose) / actualClose;
    
    // Accuracy based on inverse of error (closer to 0 error = higher accuracy)
    const accuracy = Math.max(0, 1 - errorMagnitude * 10); // Scale error to accuracy

    // Validate pattern success
    const patternSuccess = this.validatePatternSuccess(validation.prediction, actualCandle);

    // Update validation
    validation.actualOutcome = actualCandle;
    validation.accuracy = accuracy;
    validation.patternSuccess = patternSuccess;
    validation.errorMagnitude = errorMagnitude;
    validation.validationStatus = 'validated';

    // Move to validated predictions
    this.pendingValidations.delete(predictionId);
    this.validatedPredictions.push(validation);

    // Maintain sliding window
    this.updateSlidingMetrics(accuracy);

    // Keep only recent validations
    if (this.validatedPredictions.length > this.validationWindow) {
      this.validatedPredictions.shift();
    }

    console.log(`Prediction validated: ${predictionId}, Accuracy: ${(accuracy * 100).toFixed(2)}%`);
    
    return validation;
  }

  private validatePatternSuccess(prediction: MLPrediction, actualCandle: CandleData): boolean {
    // Pattern validation logic based on signal direction
    switch (prediction.signal) {
      case 'buy':
        return actualCandle.close > actualCandle.open; // Bullish candle
      case 'sell':
        return actualCandle.close < actualCandle.open; // Bearish candle
      case 'hold':
        return Math.abs(actualCandle.close - actualCandle.open) / actualCandle.open < 0.005; // Small movement
      default:
        return false;
    }
  }

  private updateSlidingMetrics(accuracy: number): void {
    this.slidingAccuracy.push(accuracy);
    if (this.slidingAccuracy.length > this.slidingWindow) {
      this.slidingAccuracy.shift();
    }
  }

  public getValidationMetrics(): ValidationMetrics {
    const totalPredictions = this.validatedPredictions.length;
    const correctPredictions = this.validatedPredictions.filter(v => v.patternSuccess).length;
    
    // Pattern success rates
    const patternSuccessRate: { [pattern: string]: number } = {};
    const patternCounts: { [pattern: string]: number } = {};
    
    this.validatedPredictions.forEach(validation => {
      const pattern = validation.prediction.pattern;
      if (!patternCounts[pattern]) {
        patternCounts[pattern] = 0;
        patternSuccessRate[pattern] = 0;
      }
      patternCounts[pattern]++;
      if (validation.patternSuccess) {
        patternSuccessRate[pattern]++;
      }
    });

    // Calculate success rates
    Object.keys(patternSuccessRate).forEach(pattern => {
      patternSuccessRate[pattern] = patternSuccessRate[pattern] / patternCounts[pattern];
    });

    // Recent accuracy trend
    const recentAccuracy = this.slidingAccuracy.length > 0 
      ? this.slidingAccuracy.reduce((sum, acc) => sum + acc, 0) / this.slidingAccuracy.length
      : 0;

    // Average error magnitude
    const averageErrorMagnitude = totalPredictions > 0
      ? this.validatedPredictions.reduce((sum, v) => sum + v.errorMagnitude, 0) / totalPredictions
      : 0;

    // Accuracy trend over time (last 20 predictions)
    const accuracyTrend = this.validatedPredictions
      .slice(-20)
      .map(v => v.accuracy);

    return {
      totalPredictions,
      correctPredictions,
      accuracyTrend,
      patternSuccessRate,
      averageErrorMagnitude,
      recentAccuracy
    };
  }

  public getPendingValidations(): PredictionValidation[] {
    return Array.from(this.pendingValidations.values());
  }

  public getRecentValidations(limit: number = 10): PredictionValidation[] {
    return this.validatedPredictions.slice(-limit);
  }
}
