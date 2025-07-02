
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

  private static totalRange(candle: CandleData): number {
    return candle.high - candle.low;
  }

  private static isBullish(candle: CandleData): boolean {
    return candle.close > candle.open;
  }

  private static isBearish(candle: CandleData): boolean {
    return candle.close < candle.open;
  }

  // Patrón Doji - Indecisión del mercado
  private static isDojiPattern(candle: CandleData): boolean {
    const bodySize = this.bodySize(candle);
    const range = this.totalRange(candle);
    return bodySize / range < 0.1; // Cuerpo menor al 10% del rango total
  }

  // Patrón Hammer - Reversión bullish
  private static isHammerPattern(candle: CandleData): boolean {
    const bodySize = this.bodySize(candle);
    const lowerShadow = this.lowerShadow(candle);
    const upperShadow = this.upperShadow(candle);
    
    return (
      lowerShadow > bodySize * 2 && // Sombra inferior larga
      upperShadow < bodySize * 0.5   // Sombra superior corta
    );
  }

  // Patrón Shooting Star - Reversión bearish
  private static isShootingStarPattern(candle: CandleData): boolean {
    const bodySize = this.bodySize(candle);
    const upperShadow = this.upperShadow(candle);
    const lowerShadow = this.lowerShadow(candle);
    
    return (
      upperShadow > bodySize * 2 && // Sombra superior larga
      lowerShadow < bodySize * 0.5   // Sombra inferior corta
    );
  }

  // Patrón Spinning Top - Indecisión con cuerpo pequeño
  private static isSpinningTopPattern(candle: CandleData): boolean {
    const bodySize = this.bodySize(candle);
    const upperShadow = this.upperShadow(candle);
    const lowerShadow = this.lowerShadow(candle);
    const range = this.totalRange(candle);
    
    return (
      bodySize / range < 0.3 && // Cuerpo pequeño
      upperShadow > bodySize * 0.5 && // Sombras presentes
      lowerShadow > bodySize * 0.5
    );
  }

  // Patrón Marubozu - Cuerpo grande sin sombras
  private static isMarubozuPattern(candle: CandleData): boolean {
    const bodySize = this.bodySize(candle);
    const upperShadow = this.upperShadow(candle);
    const lowerShadow = this.lowerShadow(candle);
    const range = this.totalRange(candle);
    
    return (
      bodySize / range > 0.95 && // Cuerpo muy grande
      upperShadow < range * 0.05 && // Sombras muy pequeñas
      lowerShadow < range * 0.05
    );
  }

  // Patrón Engulfing Bullish - Patrón de dos velas
  private static isBullishEngulfingPattern(candles: CandleData[], index: number): boolean {
    if (index < 1) return false;
    
    const current = candles[index];
    const previous = candles[index - 1];
    
    return (
      this.isBearish(previous) && // Vela anterior bearish
      this.isBullish(current) && // Vela actual bullish
      current.open < previous.close && // Abre por debajo del cierre anterior
      current.close > previous.open && // Cierra por encima de la apertura anterior
      this.bodySize(current) > this.bodySize(previous) // Cuerpo más grande
    );
  }

  // Patrón Engulfing Bearish
  private static isBearishEngulfingPattern(candles: CandleData[], index: number): boolean {
    if (index < 1) return false;
    
    const current = candles[index];
    const previous = candles[index - 1];
    
    return (
      this.isBullish(previous) && // Vela anterior bullish
      this.isBearish(current) && // Vela actual bearish
      current.open > previous.close && // Abre por encima del cierre anterior
      current.close < previous.open && // Cierra por debajo de la apertura anterior
      this.bodySize(current) > this.bodySize(previous) // Cuerpo más grande
    );
  }

  // Patrón Harami Bullish - Vela pequeña dentro de una grande
  private static isBullishHaramiPattern(candles: CandleData[], index: number): boolean {
    if (index < 1) return false;
    
    const current = candles[index];
    const previous = candles[index - 1];
    
    return (
      this.isBearish(previous) && // Vela anterior bearish grande
      this.isBullish(current) && // Vela actual bullish pequeña
      current.open > previous.close && // Abre por encima del cierre anterior
      current.close < previous.open && // Cierra por debajo de la apertura anterior
      this.bodySize(current) < this.bodySize(previous) * 0.7 // Cuerpo significativamente más pequeño
    );
  }

  // Patrón Harami Bearish
  private static isBearishHaramiPattern(candles: CandleData[], index: number): boolean {
    if (index < 1) return false;
    
    const current = candles[index];
    const previous = candles[index - 1];
    
    return (
      this.isBullish(previous) && // Vela anterior bullish grande
      this.isBearish(current) && // Vela actual bearish pequeña
      current.open < previous.close && // Abre por debajo del cierre anterior
      current.close > previous.open && // Cierra por encima de la apertura anterior
      this.bodySize(current) < this.bodySize(previous) * 0.7 // Cuerpo significativamente más pequeño
    );
  }

  // Patrón Morning Star - Tres velas de reversión bullish
  private static isMorningStarPattern(candles: CandleData[], index: number): boolean {
    if (index < 2) return false;
    
    const first = candles[index - 2];
    const middle = candles[index - 1];
    const last = candles[index];
    
    return (
      this.isBearish(first) && // Primera vela bearish grande
      this.bodySize(first) > this.totalRange(first) * 0.6 &&
      this.bodySize(middle) < this.bodySize(first) * 0.5 && // Vela del medio pequeña
      middle.high < first.close && // Gap hacia abajo
      this.isBullish(last) && // Última vela bullish
      last.close > (first.open + first.close) / 2 // Cierra por encima del punto medio de la primera
    );
  }

  // Patrón Evening Star - Tres velas de reversión bearish
  private static isEveningStarPattern(candles: CandleData[], index: number): boolean {
    if (index < 2) return false;
    
    const first = candles[index - 2];
    const middle = candles[index - 1];
    const last = candles[index];
    
    return (
      this.isBullish(first) && // Primera vela bullish grande
      this.bodySize(first) > this.totalRange(first) * 0.6 &&
      this.bodySize(middle) < this.bodySize(first) * 0.5 && // Vela del medio pequeña
      middle.low > first.close && // Gap hacia arriba
      this.isBearish(last) && // Última vela bearish
      last.close < (first.open + first.close) / 2 // Cierra por debajo del punto medio de la primera
    );
  }

  static detectPatterns(candles: CandleData[]): CandlePattern[] {
    const patterns: CandlePattern[] = [];

    candles.forEach((candle, index) => {
      // Patrones de una sola vela
      if (this.isDojiPattern(candle)) {
        patterns.push({
          name: 'Doji',
          type: 'neutral',
          confidence: 0.75,
          description: 'Indecisión en el mercado, posible señal de reversión',
          position: index,
          signal: 'hold'
        });
      }

      if (this.isHammerPattern(candle)) {
        patterns.push({
          name: 'Hammer',
          type: 'bullish',
          confidence: 0.8,
          description: 'Potencial reversión bullish después de tendencia bajista',
          position: index,
          signal: 'buy'
        });
      }

      if (this.isShootingStarPattern(candle)) {
        patterns.push({
          name: 'Shooting Star',
          type: 'bearish',
          confidence: 0.8,
          description: 'Potencial reversión bearish después de tendencia alcista',
          position: index,
          signal: 'sell'
        });
      }

      if (this.isSpinningTopPattern(candle)) {
        patterns.push({
          name: 'Spinning Top',
          type: 'neutral',
          confidence: 0.65,
          description: 'Indecisión del mercado con volatilidad',
          position: index,
          signal: 'hold'
        });
      }

      if (this.isMarubozuPattern(candle)) {
        const type = this.isBullish(candle) ? 'bullish' : 'bearish';
        const signal = type === 'bullish' ? 'buy' : 'sell';
        patterns.push({
          name: 'Marubozu',
          type,
          confidence: 0.85,
          description: `Fuerte momentum ${type === 'bullish' ? 'alcista' : 'bajista'}`,
          position: index,
          signal
        });
      }

      // Patrones de dos velas
      if (this.isBullishEngulfingPattern(candles, index)) {
        patterns.push({
          name: 'Bullish Engulfing',
          type: 'bullish',
          confidence: 0.9,
          description: 'Fuerte señal de reversión bullish',
          position: index,
          signal: 'buy'
        });
      }

      if (this.isBearishEngulfingPattern(candles, index)) {
        patterns.push({
          name: 'Bearish Engulfing',
          type: 'bearish',
          confidence: 0.9,
          description: 'Fuerte señal de reversión bearish',
          position: index,
          signal: 'sell'
        });
      }

      if (this.isBullishHaramiPattern(candles, index)) {
        patterns.push({
          name: 'Bullish Harami',
          type: 'bullish',
          confidence: 0.75,
          description: 'Posible reversión bullish con consolidación',
          position: index,
          signal: 'buy'
        });
      }

      if (this.isBearishHaramiPattern(candles, index)) {
        patterns.push({
          name: 'Bearish Harami',
          type: 'bearish',
          confidence: 0.75,
          description: 'Posible reversión bearish con consolidación',
          position: index,
          signal: 'sell'
        });
      }

      // Patrones de tres velas
      if (this.isMorningStarPattern(candles, index)) {
        patterns.push({
          name: 'Morning Star',
          type: 'bullish',
          confidence: 0.95,
          description: 'Patrón de reversión bullish muy fuerte',
          position: index,
          signal: 'buy'
        });
      }

      if (this.isEveningStarPattern(candles, index)) {
        patterns.push({
          name: 'Evening Star',
          type: 'bearish',
          confidence: 0.95,
          description: 'Patrón de reversión bearish muy fuerte',
          position: index,
          signal: 'sell'
        });
      }
    });

    return patterns;
  }

  static calculateConfidence(pattern: CandlePattern, candles: CandleData[]): number {
    const candle = candles[pattern.position];
    if (!candle) return pattern.confidence;

    // Factor en volumen (si está por encima del promedio, aumenta confianza)
    const avgVolume = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
    const volumeFactor = candle.volume > avgVolume ? 1.1 : 0.9;

    // Factor de posición (patrones al final de tendencias son más confiables)
    const positionFactor = this.calculateTrendContext(candles, pattern.position);

    return Math.min(pattern.confidence * volumeFactor * positionFactor, 1.0);
  }

  private static calculateTrendContext(candles: CandleData[], position: number): number {
    if (position < 10) return 1.0;

    const recentCandles = candles.slice(position - 10, position);
    const trend = this.calculateTrend(recentCandles);

    // Si el patrón va contra la tendencia establecida, es más confiable para reversión
    return Math.abs(trend) > 0.5 ? 1.15 : 1.0;
  }

  private static calculateTrend(candles: CandleData[]): number {
    if (candles.length < 2) return 0;

    const firstClose = candles[0].close;
    const lastClose = candles[candles.length - 1].close;
    
    return (lastClose - firstClose) / firstClose;
  }

  // Método para obtener estadísticas de patrones
  static getPatternStatistics(patterns: CandlePattern[]): {
    total: number;
    byType: { [key: string]: number };
    avgConfidence: number;
    mostCommon: string;
  } {
    const byType: { [key: string]: number } = {};
    let totalConfidence = 0;

    patterns.forEach(pattern => {
      byType[pattern.name] = (byType[pattern.name] || 0) + 1;
      totalConfidence += pattern.confidence;
    });

    const mostCommon = Object.entries(byType).reduce((a, b) => 
      byType[a[0]] > byType[b[0]] ? a : b, ['', 0])[0];

    return {
      total: patterns.length,
      byType,
      avgConfidence: patterns.length > 0 ? totalConfidence / patterns.length : 0,
      mostCommon
    };
  }
}
