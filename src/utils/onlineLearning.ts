
import { CandleData, OnlineLearningMetrics } from '@/types/trading';

export class OnlineLearningSystem {
  private reservoir: CandleData[] = [];
  private reservoirSize: number = 1000;
  private samplesProcessed: number = 0;
  private weights: number[] = [];
  private learningRate: number = 0.01;
  private adaptationRate: number = 0.1;

  constructor(reservoirSize: number = 1000) {
    this.reservoirSize = reservoirSize;
    this.initializeWeights();
  }

  private initializeWeights(): void {
    // Initialize simple linear weights for demonstration
    this.weights = new Array(10).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  // Reservoir Sampling implementation
  public addSample(candle: CandleData): void {
    this.samplesProcessed++;
    
    if (this.reservoir.length < this.reservoirSize) {
      // Fill reservoir until capacity
      this.reservoir.push(candle);
    } else {
      // Replace with probability 1/samplesProcessed
      const randomIndex = Math.floor(Math.random() * this.samplesProcessed);
      if (randomIndex < this.reservoirSize) {
        this.reservoir[randomIndex] = candle;
      }
    }

    // Perform incremental learning
    this.incrementalUpdate(candle);
  }

  private incrementalUpdate(candle: CandleData): void {
    // Simple online gradient descent
    const features = this.extractFeatures(candle);
    const prediction = this.predict(features);
    
    // Calculate error (simplified)
    const actual = candle.close > candle.open ? 1 : 0;
    const error = actual - prediction;

    // Update weights
    for (let i = 0; i < this.weights.length && i < features.length; i++) {
      this.weights[i] += this.learningRate * error * features[i];
    }

    // Decay learning rate over time
    this.learningRate *= (1 - this.adaptationRate / this.samplesProcessed);
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
      Math.cos(candle.timestamp / 86400000),
      Math.random() * 0.1 // Noise factor
    ];
  }

  private predict(features: number[]): number {
    let prediction = 0;
    for (let i = 0; i < this.weights.length && i < features.length; i++) {
      prediction += this.weights[i] * features[i];
    }
    return 1 / (1 + Math.exp(-prediction)); // Sigmoid activation
  }

  public getMetrics(): OnlineLearningMetrics {
    return {
      samplesProcessed: this.samplesProcessed,
      reservoirSize: this.reservoir.length,
      memoryUsage: this.reservoir.length * 48, // Approximate bytes per candle
      lastUpdate: Date.now(),
      adaptationRate: this.adaptationRate
    };
  }

  public getReservoirSample(): CandleData[] {
    return [...this.reservoir];
  }

  public predictNextCandle(recentCandles: CandleData[]): number {
    if (recentCandles.length === 0) return 0.5;
    
    const lastCandle = recentCandles[recentCandles.length - 1];
    const features = this.extractFeatures(lastCandle);
    return this.predict(features);
  }
}
