import { CandleData, MLPrediction, CandlePattern } from '@/types/trading';
import { PatternMatch } from '@/utils/clientPatternRecognition';

// Tipo base para validación de predicciones
export interface PredictionValidation {
  accuracy: number;
  errorMagnitude: number;
  validationStatus: 'pending' | 'validated' | 'failed';
}

export interface AutoValidationResult extends PredictionValidation {
  predictionId: string;
  timestamp: number;
  prediction: MLPrediction;
  actualOutcome: CandleData;
  priceAccuracy: number;
  signalAccuracy: number;
  patternSuccess: boolean;
  validationDelay: number; // candles waited for validation
  conflictResolution: {
    hasConflict: boolean;
    patternSignal: 'buy' | 'sell' | 'hold';
    modelSignal: 'buy' | 'sell' | 'hold';
    resolvedSignal: 'buy' | 'sell' | 'hold';
    confidence: number;
  };
}

export interface EnhancedValidationMetrics {
  totalValidations: number;
  priceAccuracy: number;
  signalAccuracy: number;
  patternSuccessRate: number;
  averageValidationDelay: number;
  conflictResolutionStats: {
    totalConflicts: number;
    correctResolutions: number;
    resolutionAccuracy: number;
  };
  recentPerformance: {
    last10Accuracy: number;
    trend: 'improving' | 'declining' | 'stable';
  };
}

export class EnhancedValidationSystem {
  private pendingValidations: Map<string, {
    prediction: MLPrediction;
    timestamp: number;
    candleIndex: number;
    patternContext?: PatternMatch[];
  }> = new Map();
  
  private completedValidations: AutoValidationResult[] = [];
  private validationDelay: number = 5; // Wait 5 candles for validation
  private maxValidations: number = 1000;

  public registerPrediction(
    prediction: MLPrediction, 
    currentCandleIndex: number,
    patternContext?: PatternMatch[]
  ): string {
    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.pendingValidations.set(predictionId, {
      prediction,
      timestamp: Date.now(),
      candleIndex: currentCandleIndex,
      patternContext
    });
    
    console.log(`📋 Prediction registered for auto-validation: ${predictionId} (waiting ${this.validationDelay} candles)`);
    return predictionId;
  }

  public processAutomaticValidation(candles: CandleData[], currentIndex: number): AutoValidationResult[] {
    const newValidations: AutoValidationResult[] = [];
    
    for (const [predictionId, pending] of this.pendingValidations.entries()) {
      const candlesWaited = currentIndex - pending.candleIndex;
      
      if (candlesWaited >= this.validationDelay) {
        const actualCandle = candles[currentIndex];
        if (actualCandle) {
          const validation = this.validatePrediction(predictionId, pending, actualCandle, candlesWaited);
          if (validation) {
            newValidations.push(validation);
            this.completedValidations.push(validation);
            this.pendingValidations.delete(predictionId);
            
            // Maintain sliding window of validations
            if (this.completedValidations.length > this.maxValidations) {
              this.completedValidations.shift();
            }
            
            console.log(`✅ Auto-validation completed: ${predictionId}, Price Accuracy: ${(validation.priceAccuracy * 100).toFixed(1)}%, Signal: ${validation.signalAccuracy ? '✓' : '✗'}`);
          }
        }
      }
    }
    
    return newValidations;
  }

  private validatePrediction(
    predictionId: string,
    pending: any,
    actualCandle: CandleData,
    validationDelay: number
  ): AutoValidationResult | null {
    const prediction = pending.prediction;
    const predictedClose = prediction.nextCandle.close;
    const actualClose = actualCandle.close;
    
    // Calculate price accuracy (inverse of relative error)
    const priceError = Math.abs(predictedClose - actualClose) / actualClose;
    const priceAccuracy = Math.max(0, 1 - priceError * 5); // Scale error to accuracy
    
    // Calculate signal accuracy
    const predictedBullish = prediction.signal === 'buy';
    const actualBullish = actualCandle.close > actualCandle.open;
    const signalAccuracy = predictedBullish === actualBullish || prediction.signal === 'hold';
    
    // Pattern success validation
    const patternSuccess = this.validatePatternSuccess(prediction, actualCandle);
    
    // Conflict resolution
    const conflictResolution = this.resolveSignalConflicts(prediction, pending.patternContext);
    
    // Calculate combined accuracy for PredictionValidation compatibility
    const combinedAccuracy = (priceAccuracy + (signalAccuracy ? 1 : 0)) / 2;
    const errorMagnitude = priceError * actualClose; // Absolute error in price units
    const validationStatus: 'pending' | 'validated' | 'failed' = 
      combinedAccuracy > 0.6 ? 'validated' : 'failed';
    
    return {
      predictionId,
      timestamp: Date.now(),
      prediction,
      actualOutcome: actualCandle,
      priceAccuracy,
      signalAccuracy: signalAccuracy ? 1 : 0,
      patternSuccess,
      validationDelay,
      conflictResolution,
      // PredictionValidation properties
      accuracy: combinedAccuracy,
      errorMagnitude,
      validationStatus
    };
  }

  private validatePatternSuccess(prediction: MLPrediction, actualCandle: CandleData): boolean {
    switch (prediction.signal) {
      case 'buy':
        return actualCandle.close > actualCandle.open && actualCandle.volume > 0;
      case 'sell':
        return actualCandle.close < actualCandle.open && actualCandle.volume > 0;
      case 'hold':
        return Math.abs(actualCandle.close - actualCandle.open) / actualCandle.open < 0.005;
      default:
        return false;
    }
  }

  private resolveSignalConflicts(
    prediction: MLPrediction,
    patternContext?: PatternMatch[]
  ): AutoValidationResult['conflictResolution'] {
    if (!patternContext || patternContext.length === 0) {
      return {
        hasConflict: false,
        patternSignal: prediction.signal,
        modelSignal: prediction.signal,
        resolvedSignal: prediction.signal,
        confidence: prediction.nextCandle.confidence
      };
    }
    
    // Get strongest pattern signal
    const strongestPattern = patternContext.reduce((strongest, current) => 
      current.strength > strongest.strength ? current : strongest
    );
    
    const patternSignal = strongestPattern.pattern.type === 'bullish' ? 'buy' : 
                         strongestPattern.pattern.type === 'bearish' ? 'sell' : 'hold';
    
    const hasConflict = patternSignal !== prediction.signal;
    
    let resolvedSignal = prediction.signal;
    let confidence = prediction.nextCandle.confidence;
    
    if (hasConflict) {
      // Weighted resolution based on confidence and historical accuracy
      const modelWeight = prediction.nextCandle.confidence;
      const patternWeight = strongestPattern.strength * strongestPattern.historicalAccuracy;
      
      if (patternWeight > modelWeight) {
        resolvedSignal = patternSignal;
        confidence = patternWeight;
      }
      
      console.log(`🔄 Signal conflict resolved: Model(${prediction.signal}) vs Pattern(${patternSignal}) → ${resolvedSignal}`);
    }
    
    return {
      hasConflict,
      patternSignal,
      modelSignal: prediction.signal,
      resolvedSignal,
      confidence
    };
  }

  public getEnhancedMetrics(): EnhancedValidationMetrics {
    const validations = this.completedValidations;
    
    if (validations.length === 0) {
      return {
        totalValidations: 0,
        priceAccuracy: 0,
        signalAccuracy: 0,
        patternSuccessRate: 0,
        averageValidationDelay: this.validationDelay,
        conflictResolutionStats: {
          totalConflicts: 0,
          correctResolutions: 0,
          resolutionAccuracy: 0
        },
        recentPerformance: {
          last10Accuracy: 0,
          trend: 'stable'
        }
      };
    }
    
    // Calculate metrics
    const avgPriceAccuracy = validations.reduce((sum, v) => sum + v.priceAccuracy, 0) / validations.length;
    const avgSignalAccuracy = validations.reduce((sum, v) => sum + v.signalAccuracy, 0) / validations.length;
    const patternSuccessRate = validations.filter(v => v.patternSuccess).length / validations.length;
    const avgValidationDelay = validations.reduce((sum, v) => sum + v.validationDelay, 0) / validations.length;
    
    // Conflict resolution stats
    const conflicts = validations.filter(v => v.conflictResolution.hasConflict);
    const correctResolutions = conflicts.filter(v => v.signalAccuracy > 0).length;
    
    // Recent performance (last 10 validations)
    const recent = validations.slice(-10);
    const last10Accuracy = recent.length > 0 ? 
      recent.reduce((sum, v) => sum + v.priceAccuracy, 0) / recent.length : 0;
    
    // Trend calculation
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recent.length >= 5) {
      const firstHalf = recent.slice(0, 5).reduce((sum, v) => sum + v.priceAccuracy, 0) / 5;
      const secondHalf = recent.slice(5).reduce((sum, v) => sum + v.priceAccuracy, 0) / (recent.length - 5);
      const difference = secondHalf - firstHalf;
      
      if (difference > 0.05) trend = 'improving';
      else if (difference < -0.05) trend = 'declining';
    }
    
    return {
      totalValidations: validations.length,
      priceAccuracy: avgPriceAccuracy,
      signalAccuracy: avgSignalAccuracy,
      patternSuccessRate,
      averageValidationDelay: avgValidationDelay,
      conflictResolutionStats: {
        totalConflicts: conflicts.length,
        correctResolutions,
        resolutionAccuracy: conflicts.length > 0 ? correctResolutions / conflicts.length : 0
      },
      recentPerformance: {
        last10Accuracy,
        trend
      }
    };
  }

  public getRecentValidations(limit: number = 10): AutoValidationResult[] {
    return this.completedValidations.slice(-limit);
  }

  public getPendingCount(): number {
    return this.pendingValidations.size;
  }
}
