
import { CandleData, CandlePattern } from '@/types/trading';

export interface PatternMatch {
  pattern: CandlePattern;
  strength: number;
  context: {
    volumeConfirmation: boolean;
    trendAlignment: boolean;
    marketCondition: 'volatile' | 'stable' | 'trending';
  };
  historicalAccuracy: number;
}

export interface PatternRule {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  minCandles: number;
  detector: (candles: CandleData[], index: number) => number; // Retorna score 0-1
  description: string;
}

export class ClientPatternRecognition {
  private static patternRules: PatternRule[] = [
    {
      name: 'Strong Bullish Reversal',
      type: 'bullish',
      minCandles: 3,
      detector: (candles, index) => {
        if (index < 2) return 0;
        
        const [prev2, prev1, current] = [candles[index-2], candles[index-1], candles[index]];
        
        // Patrón: Vela roja grande -> Vela pequeña -> Vela verde que supera
        const redCandle = prev2.close < prev2.open && (prev2.open - prev2.close) > (prev2.high - prev2.low) * 0.6;
        const smallCandle = Math.abs(prev1.close - prev1.open) < (prev1.high - prev1.low) * 0.3;
        const greenCandle = current.close > current.open && current.close > prev2.open;
        
        if (redCandle && smallCandle && greenCandle) {
          const strength = Math.min(
            (current.close - prev2.close) / prev2.close * 10, // Magnitud de reversión
            current.volume / prev2.volume // Confirmación de volumen
          );
          return Math.min(strength, 1);
        }
        
        return 0;
      },
      description: 'Reversión bullish fuerte con confirmación de volumen'
    },
    
    {
      name: 'Momentum Breakout',
      type: 'bullish',
      minCandles: 5,
      detector: (candles, index) => {
        if (index < 4) return 0;
        
        const recent = candles.slice(index-4, index+1);
        const avgVolume = recent.reduce((sum, c) => sum + c.volume, 0) / recent.length;
        const currentVolume = recent[recent.length - 1].volume;
        
        // Buscar breakout con volumen
        const priceBreakout = recent[recent.length - 1].close > Math.max(...recent.slice(0, -1).map(c => c.high));
        const volumeConfirmation = currentVolume > avgVolume * 1.5;
        
        if (priceBreakout && volumeConfirmation) {
          return Math.min((currentVolume / avgVolume) * 0.3, 0.9);
        }
        
        return 0;
      },
      description: 'Breakout con confirmación de volumen alto'
    },

    {
      name: 'Consolidation End',
      type: 'neutral',
      minCandles: 10,
      detector: (candles, index) => {
        if (index < 9) return 0;
        
        const recent = candles.slice(index-9, index+1);
        const prices = recent.map(c => c.close);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice;
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        
        // Detectar consolidación (bajo rango de precios)
        const consolidation = (priceRange / avgPrice) < 0.02; // Menos del 2% de rango
        
        // Detectar posible final (incremento de volumen)
        const avgVolume = recent.slice(0, -2).reduce((sum, c) => sum + c.volume, 0) / (recent.length - 2);
        const recentVolume = recent[recent.length - 1].volume;
        const volumeIncrease = recentVolume > avgVolume * 1.3;
        
        if (consolidation && volumeIncrease) {
          return 0.7;
        }
        
        return 0;
      },
      description: 'Final de consolidación con incremento de volumen'
    },

    {
      name: 'Strong Bearish Reversal',
      type: 'bearish',
      minCandles: 3,
      detector: (candles, index) => {
        if (index < 2) return 0;
        
        const [prev2, prev1, current] = [candles[index-2], candles[index-1], candles[index]];
        
        // Patrón: Vela verde grande -> Vela pequeña -> Vela roja que cae por debajo
        const greenCandle = prev2.close > prev2.open && (prev2.close - prev2.open) > (prev2.high - prev2.low) * 0.6;
        const smallCandle = Math.abs(prev1.close - prev1.open) < (prev1.high - prev1.low) * 0.3;
        const redCandle = current.close < current.open && current.close < prev2.open;
        
        if (greenCandle && smallCandle && redCandle) {
          const strength = Math.min(
            (prev2.close - current.close) / prev2.close * 10,
            current.volume / prev2.volume
          );
          return Math.min(strength, 1);
        }
        
        return 0;
      },
      description: 'Reversión bearish fuerte con confirmación de volumen'
    }
  ];

  static detectCandlestickPattern(candleSeries: CandleData[]): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    for (let i = 0; i < candleSeries.length; i++) {
      for (const rule of this.patternRules) {
        if (i >= rule.minCandles - 1) {
          const score = rule.detector(candleSeries, i);
          
          if (score > 0.3) { // Umbral mínimo de confianza
            const context = this.analyzeContext(candleSeries, i);
            const historicalAccuracy = this.getHistoricalAccuracy(rule.name);
            
            matches.push({
              pattern: {
                name: rule.name,
                type: rule.type,
                confidence: score,
                description: rule.description,
                position: i
              },
              strength: score,
              context,
              historicalAccuracy
            });
          }
        }
      }
    }
    
    return matches.sort((a, b) => b.strength - a.strength);
  }

  private static analyzeContext(candles: CandleData[], index: number): PatternMatch['context'] {
    const windowStart = Math.max(0, index - 20);
    const contextCandles = candles.slice(windowStart, index + 1);
    
    // Análisis de volumen
    const avgVolume = contextCandles.reduce((sum, c) => sum + c.volume, 0) / contextCandles.length;
    const currentVolume = candles[index].volume;
    const volumeConfirmation = currentVolume > avgVolume * 1.2;
    
    // Análisis de tendencia
    const trendCandles = contextCandles.slice(-10);
    const trendSlope = this.calculateTrendSlope(trendCandles);
    const trendAlignment = Math.abs(trendSlope) > 0.001; // Tendencia definida
    
    // Condición de mercado
    const volatility = this.calculateVolatility(contextCandles);
    let marketCondition: 'volatile' | 'stable' | 'trending' = 'stable';
    
    if (volatility > 0.03) marketCondition = 'volatile';
    else if (Math.abs(trendSlope) > 0.002) marketCondition = 'trending';
    
    return {
      volumeConfirmation,
      trendAlignment,
      marketCondition
    };
  }

  private static calculateTrendSlope(candles: CandleData[]): number {
    if (candles.length < 2) return 0;
    
    const firstPrice = candles[0].close;
    const lastPrice = candles[candles.length - 1].close;
    
    return (lastPrice - firstPrice) / firstPrice / candles.length;
  }

  private static calculateVolatility(candles: CandleData[]): number {
    if (candles.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < candles.length; i++) {
      returns.push((candles[i].close - candles[i-1].close) / candles[i-1].close);
    }
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private static getHistoricalAccuracy(patternName: string): number {
    // En una implementación real, esto vendría de una base de datos
    // Por ahora, usamos valores simulados basados en research común
    const accuracyMap: { [key: string]: number } = {
      'Strong Bullish Reversal': 0.72,
      'Momentum Breakout': 0.68,
      'Consolidation End': 0.55,
      'Strong Bearish Reversal': 0.71
    };
    
    return accuracyMap[patternName] || 0.6;
  }
}
