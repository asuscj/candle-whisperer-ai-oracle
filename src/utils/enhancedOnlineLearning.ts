import { CandleData, OnlineLearningMetrics } from '@/types/trading';
import { PredictionValidation } from './validationSystem';

export interface ErrorLearningMetrics {
  totalErrors: number;
  averageError: number;
  errorTrend: number[];
  learningRate: number;
  adaptationStrength: number;
  convergenceRate: number;
}

export class EnhancedOnlineLearningSystem {
  private reservoir: CandleData[] = [];
  private reservoirSize: number = 1000;
  private samplesProcessed: number = 0;
  private weights: number[] = [];
  private learningRate: number = 0.01;
  private adaptationRate: number = 0.1;
  private errorHistory: number[] = [];
  private errorWindow: number = 100;
  private reinforcementBuffer: Map<string, number> = new Map();

  constructor(reservoirSize: number = 1000) {
    this.reservoirSize = reservoirSize;
    this.initializeWeights();
  }

  private initializeWeights(): void {
    // Initialize with Xavier/Glorot initialization
    this.weights = new Array(15).fill(0).map(() => 
      (Math.random() * 2 - 1) * Math.sqrt(2 / 15)
    );
  }

  public addSample(candle: CandleData): void {
    this.samplesProcessed++;
    
    // Reservoir sampling
    if (this.reservoir.length < this.reservoirSize) {
      this.reservoir.push(candle);
    } else {
      const randomIndex = Math.floor(Math.random() * this.samplesProcessed);
      if (randomIndex < this.reservoirSize) {
        this.reservoir[randomIndex] = candle;
      }
    }

    // Incremental learning
    this.incrementalUpdate(candle);
  }

  public learnFromError(validation: PredictionValidation): void {
    if (!validation.actualOutcome) return;

    const error = validation.errorMagnitude;
    this.errorHistory.push(error);
    
    // Keep sliding window of errors
    if (this.errorHistory.length > this.errorWindow) {
      this.errorHistory.shift();
    }

    // Adaptive learning rate based on error trend
    this.adaptLearningRate(error);

    // Reinforce or punish pattern weights
    this.reinforcePattern(validation);

    // Update weights based on error feedback
    this.updateWeightsFromError(validation);

    console.log(`Learning from error: ${(error * 100).toFixed(2)}%, New LR: ${this.learningRate.toFixed(4)}`);
  }

  private adaptLearningRate(currentError: number): void {
    if (this.errorHistory.length < 10) return;

    // Calculate error trend
    const recentErrors = this.errorHistory.slice(-10);
    const oldErrors = this.errorHistory.slice(-20, -10);
    
    if (oldErrors.length === 0) return;

    const recentAvg = recentErrors.reduce((sum, e) => sum + e, 0) / recentErrors.length;
    const oldAvg = oldErrors.reduce((sum, e) => sum + e, 0) / oldErrors.length;

    // If errors are increasing, increase learning rate
    // If errors are decreasing, decrease learning rate for stability
    if (recentAvg > oldAvg) {
      this.learningRate = Math.min(0.1, this.learningRate * 1.05);
    } else {
      this.learningRate = Math.max(0.001, this.learningRate * 0.95);
    }
  }

  private reinforcePattern(validation: PredictionValidation): void {
    const pattern = validation.prediction.pattern;
    const reinforcement = validation.patternSuccess ? 0.1 : -0.05;
    
    const currentReinforcement = this.reinforcementBuffer.get(pattern) || 0;
    this.reinforcementBuffer.set(pattern, currentReinforcement + reinforcement);
  }

  private updateWeightsFromError(validation: PredictionValidation): void {
    if (!validation.actualOutcome) return;

    const features = this.extractFeatures(validation.actualOutcome);
    const error = validation.errorMagnitude;
    const direction = validation.prediction.signal === 'buy' ? 1 : -1;

    // Gradient descent with error feedback
    for (let i = 0; i < this.weights.length && i < features.length; i++) {
      const gradient = error * direction * features[i];
      this.weights[i] -= this.learningRate * gradient;
      
      // Apply L2 regularization
      this.weights[i] *= 0.999;
    }
  }

  private incrementalUpdate(candle: CandleData): void {
    const features = this.extractFeatures(candle);
    const prediction = this.predict(features);
    
    // Simple binary target (up/down)
    const actual = candle.close > candle.open ? 1 : 0;
    const error = actual - prediction;

    // Standard gradient descent update
    for (let i = 0; i < this.weights.length && i < features.length; i++) {
      this.weights[i] += this.learningRate * error * features[i];
    }
  }

  private extractFeatures(candle: CandleData): number[] {
    const bodySize = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    
    return [
      bodySize / range,
      upperShadow / range,
      lowerShadow / range,
      candle.volume / 10000,
      candle.close / candle.open,
      (candle.high - candle.low) / candle.open,
      Math.log(candle.volume + 1),
      Math.sin(candle.timestamp / 86400000), // Daily cycle
      Math.cos(candle.timestamp / 86400000), // Daily cycle
      Math.sin(candle.timestamp / 604800000), // Weekly cycle
      Math.cos(candle.timestamp / 604800000), // Weekly cycle
      candle.open / 1000, // Normalized price level
      candle.high / candle.low, // Range ratio
      bodySize / candle.volume * 10000, // Volume-price relationship
      Math.random() * 0.05 // Controlled noise
    ];
  }

  private predict(features: number[]): number {
    let prediction = 0;
    for (let i = 0; i < this.weights.length && i < features.length; i++) {
      prediction += this.weights[i] * features[i];
    }
    return 1 / (1 + Math.exp(-prediction)); // Sigmoid activation
  }

  public predictNextCandle(recentCandles: CandleData[]): number {
    if (recentCandles.length === 0) return 0.5;
    
    const lastCandle = recentCandles[recentCandles.length - 1];
    const features = this.extractFeatures(lastCandle);
    return this.predict(features);
  }

  public getMetrics(): OnlineLearningMetrics {
    return {
      samplesProcessed: this.samplesProcessed,
      reservoirSize: this.reservoir.length,
      memoryUsage: this.reservoir.length * 48,
      lastUpdate: Date.now(),
      adaptationRate: this.adaptationRate
    };
  }

  public getErrorLearningMetrics(): ErrorLearningMetrics {
    const averageError = this.errorHistory.length > 0 
      ? this.errorHistory.reduce((sum, e) => sum + e, 0) / this.errorHistory.length
      : 0;

    const convergenceRate = this.calculateConvergenceRate();

    return {
      totalErrors: this.errorHistory.length,
      averageError,
      errorTrend: this.errorHistory.slice(-20),
      learningRate: this.learningRate,
      adaptationStrength: this.adaptationRate,
      convergenceRate
    };
  }

  private calculateConvergenceRate(): number {
    if (this.errorHistory.length < 20) return 0;

    const recent = this.errorHistory.slice(-10);
    const older = this.errorHistory.slice(-20, -10);

    const recentAvg = recent.reduce((sum, e) => sum + e, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e, 0) / older.length;

    return olderAvg > 0 ? (olderAvg - recentAvg) / olderAvg : 0;
  }

  public getReservoirSample(): CandleData[] {
    return [...this.reservoir];
  }
}
