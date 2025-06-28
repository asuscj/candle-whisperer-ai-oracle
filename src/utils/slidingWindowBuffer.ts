
import { CandleData, MLPrediction } from '@/types/trading';
import { PredictionValidation } from './validationSystem';

export interface BufferMetrics {
  totalSamples: number;
  bufferUtilization: number;
  dataFreshness: number;
  samplingRate: number;
  memoryEfficiency: number;
}

export interface PerformanceWindow {
  timestamp: number;
  accuracy: number;
  patternSuccess: boolean;
  errorMagnitude: number;
  learningRate: number;
}

export class SlidingWindowBuffer {
  private buffer: CandleData[] = [];
  private performanceWindow: PerformanceWindow[] = [];
  private maxBufferSize: number;
  private maxPerformanceWindow: number;
  private samplesAdded: number = 0;
  private lastCleanup: number = Date.now();
  private cleanupInterval: number = 300000; // 5 minutos

  constructor(maxBufferSize: number = 2000, maxPerformanceWindow: number = 100) {
    this.maxBufferSize = maxBufferSize;
    this.maxPerformanceWindow = maxPerformanceWindow;
  }

  public addSample(candle: CandleData): void {
    this.samplesAdded++;
    
    // Agregar nueva muestra
    this.buffer.push(candle);
    
    // Mantener tamaño del buffer
    if (this.buffer.length > this.maxBufferSize) {
      // Remover elementos más antiguos usando estrategia adaptativa
      this.adaptiveCleanup();
    }

    // Cleanup periódico para optimizar memoria
    if (Date.now() - this.lastCleanup > this.cleanupInterval) {
      this.performPeriodicCleanup();
      this.lastCleanup = Date.now();
    }
  }

  public addPerformanceData(validation: PredictionValidation, learningRate: number): void {
    const performanceData: PerformanceWindow = {
      timestamp: validation.timestamp,
      accuracy: validation.accuracy,
      patternSuccess: validation.patternSuccess,
      errorMagnitude: validation.errorMagnitude,
      learningRate
    };

    this.performanceWindow.push(performanceData);

    // Mantener ventana de rendimiento
    if (this.performanceWindow.length > this.maxPerformanceWindow) {
      this.performanceWindow.shift();
    }
  }

  private adaptiveCleanup(): void {
    // Estrategia de limpieza adaptativa basada en importancia
    const removeCount = Math.floor(this.maxBufferSize * 0.1); // Remover 10%
    const importance = this.calculateImportanceScores();
    
    // Ordenar por importancia (menor a mayor) y remover los menos importantes
    const sortedIndices = importance
      .map((score, index) => ({ score, index }))
      .sort((a, b) => a.score - b.score)
      .slice(0, removeCount)
      .map(item => item.index)
      .sort((a, b) => b - a); // Ordenar descendente para remover desde el final

    // Remover elementos seleccionados
    sortedIndices.forEach(index => {
      this.buffer.splice(index, 1);
    });

    console.log(`Adaptive cleanup removed ${removeCount} samples from buffer`);
  }

  private calculateImportanceScores(): number[] {
    return this.buffer.map((candle, index) => {
      let importance = 1.0;
      
      // Factor de antigüedad (más nuevo = más importante)
      const ageFactor = Math.max(0.1, index / this.buffer.length);
      importance *= ageFactor;
      
      // Factor de volatilidad (más volátil = más importante para aprendizaje)
      const volatility = Math.abs(candle.high - candle.low) / candle.open;
      const volatilityFactor = Math.min(2.0, 1.0 + volatility);
      importance *= volatilityFactor;
      
      // Factor de volumen (mayor volumen = más importante)
      const avgVolume = this.buffer.reduce((sum, c) => sum + c.volume, 0) / this.buffer.length;
      const volumeFactor = Math.min(1.5, candle.volume / avgVolume);
      importance *= volumeFactor;
      
      return importance;
    });
  }

  private performPeriodicCleanup(): void {
    // Limpiar datos de rendimiento muy antiguos
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 horas
    this.performanceWindow = this.performanceWindow.filter(
      data => data.timestamp > cutoffTime
    );

    // Optimización de memoria: compactar buffer si es necesario
    if (this.buffer.length < this.maxBufferSize * 0.5) {
      // Buffer está siendo sub-utilizado, podemos optimizar
      this.optimizeBuffer();
    }
  }

  private optimizeBuffer(): void {
    // Reordenar buffer por timestamp para mejorar acceso secuencial
    this.buffer.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remover duplicados si existen
    const uniqueBuffer: CandleData[] = [];
    let lastTimestamp = 0;
    
    this.buffer.forEach(candle => {
      if (candle.timestamp !== lastTimestamp) {
        uniqueBuffer.push(candle);
        lastTimestamp = candle.timestamp;
      }
    });
    
    this.buffer = uniqueBuffer;
  }

  public getSample(size?: number): CandleData[] {
    const sampleSize = size || Math.min(200, this.buffer.length);
    
    if (this.buffer.length <= sampleSize) {
      return [...this.buffer];
    }
    
    // Muestreo estratificado: mezcla de datos recientes y representativos
    const recent = this.buffer.slice(-Math.floor(sampleSize * 0.7)); // 70% reciente
    const representative = this.getRepresentativeSample(Math.floor(sampleSize * 0.3)); // 30% representativo
    
    return [...representative, ...recent];
  }

  private getRepresentativeSample(size: number): CandleData[] {
    if (this.buffer.length <= size) return [...this.buffer];
    
    const step = Math.floor(this.buffer.length / size);
    const sample: CandleData[] = [];
    
    for (let i = 0; i < this.buffer.length && sample.length < size; i += step) {
      sample.push(this.buffer[i]);
    }
    
    return sample;
  }

  public getCurrentTrend(): 'bullish' | 'bearish' | 'sideways' {
    if (this.buffer.length < 20) return 'sideways';
    
    const recent = this.buffer.slice(-20);
    const firstPrice = recent[0].close;
    const lastPrice = recent[recent.length - 1].close;
    const change = (lastPrice - firstPrice) / firstPrice;
    
    if (change > 0.02) return 'bullish';
    if (change < -0.02) return 'bearish';
    return 'sideways';
  }

  public getVolatilityMetrics(): {
    current: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (this.buffer.length < 20) {
      return { current: 0, average: 0, trend: 'stable' };
    }
    
    const recent = this.buffer.slice(-20);
    const volatilities = recent.map(candle => 
      (candle.high - candle.low) / candle.open
    );
    
    const current = volatilities[volatilities.length - 1];
    const average = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
    
    // Determinar tendencia de volatilidad
    const firstHalf = volatilities.slice(0, 10);
    const secondHalf = volatilities.slice(10);
    const firstAvg = firstHalf.reduce((sum, vol) => sum + vol, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, vol) => sum + vol, 0) / secondHalf.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) trend = 'increasing';
    else if (change < -0.1) trend = 'decreasing';
    
    return { current, average, trend };
  }

  public getRecentPerformanceTrend(): {
    accuracy: number;
    trend: 'improving' | 'declining' | 'stable';
    learningRate: number;
    convergence: number;
  } {
    if (this.performanceWindow.length < 10) {
      return { accuracy: 0, trend: 'stable', learningRate: 0.01, convergence: 0 };
    }
    
    const recent = this.performanceWindow.slice(-10);
    const accuracy = recent.reduce((sum, data) => sum + data.accuracy, 0) / recent.length;
    const learningRate = recent[recent.length - 1].learningRate;
    
    // Calcular tendencia de precisión
    const firstHalf = recent.slice(0, 5);
    const secondHalf = recent.slice(5);
    const firstAccuracy = firstHalf.reduce((sum, data) => sum + data.accuracy, 0) / firstHalf.length;
    const secondAccuracy = secondHalf.reduce((sum, data) => sum + data.accuracy, 0) / secondHalf.length;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    const improvement = (secondAccuracy - firstAccuracy) / Math.max(firstAccuracy, 0.01);
    
    if (improvement > 0.05) trend = 'improving';
    else if (improvement < -0.05) trend = 'declining';
    
    // Calcular convergencia
    const errors = recent.map(data => data.errorMagnitude);
    const errorVariance = this.calculateVariance(errors);
    const convergence = Math.max(0, 1 - errorVariance * 10);
    
    return { accuracy, trend, learningRate, convergence };
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  public getMetrics(): BufferMetrics {
    const bufferUtilization = this.buffer.length / this.maxBufferSize;
    
    // Calcular frescura de datos (qué tan recientes son)
    const now = Date.now();
    const avgAge = this.buffer.length > 0 
      ? this.buffer.reduce((sum, candle) => sum + (now - candle.timestamp), 0) / this.buffer.length
      : 0;
    const dataFreshness = Math.max(0, 1 - (avgAge / (24 * 60 * 60 * 1000))); // Normalizado a 24h
    
    const samplingRate = this.samplesAdded > 0 
      ? this.buffer.length / this.samplesAdded 
      : 0;
    
    const memoryEfficiency = this.buffer.length > 0 
      ? (this.buffer.length * 48) / (1024 * 1024) // Estimación en MB
      : 0;
    
    return {
      totalSamples: this.samplesAdded,
      bufferUtilization,
      dataFreshness,
      samplingRate,
      memoryEfficiency
    };
  }

  public clear(): void {
    this.buffer = [];
    this.performanceWindow = [];
    this.samplesAdded = 0;
    this.lastCleanup = Date.now();
  }

  public getBufferSize(): number {
    return this.buffer.length;
  }

  public getPerformanceWindowSize(): number {
    return this.performanceWindow.length;
  }
}
