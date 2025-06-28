
import { useState, useEffect, useCallback } from 'react';
import { CandleData } from '@/types/trading';

interface SlidingWindowConfig {
  windowSize: number;
  evaluationThreshold: number;
}

export interface WindowMetrics {
  volatility: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  volume: number;
  priceRange: number;
  momentum: number;
}

export const useSlidingWindowOHLC = (config: SlidingWindowConfig = { windowSize: 30, evaluationThreshold: 1 }) => {
  const [candleWindow, setCandleWindow] = useState<CandleData[]>([]);
  const [windowMetrics, setWindowMetrics] = useState<WindowMetrics | null>(null);
  const [isReady, setIsReady] = useState(false);

  const calculateMetrics = useCallback((candles: CandleData[]): WindowMetrics => {
    if (candles.length < 2) {
      return {
        volatility: 0,
        trend: 'sideways',
        volume: 0,
        priceRange: 0,
        momentum: 0
      };
    }

    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);

    // Calcular volatilidad (desviación estándar de closes)
    const avgClose = closes.reduce((sum, close) => sum + close, 0) / closes.length;
    const volatility = Math.sqrt(
      closes.reduce((sum, close) => sum + Math.pow(close - avgClose, 2), 0) / closes.length
    );

    // Calcular tendencia
    const firstClose = closes[0];
    const lastClose = closes[closes.length - 1];
    const trendChange = (lastClose - firstClose) / firstClose;
    
    let trend: 'bullish' | 'bearish' | 'sideways' = 'sideways';
    if (trendChange > 0.01) trend = 'bullish';
    else if (trendChange < -0.01) trend = 'bearish';

    // Calcular volumen promedio
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;

    // Calcular rango de precios
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const priceRange = maxHigh - minLow;

    // Calcular momentum (cambio porcentual en últimas 5 velas)
    const recentCandles = candles.slice(-5);
    const momentum = recentCandles.length >= 2 ? 
      (recentCandles[recentCandles.length - 1].close - recentCandles[0].close) / recentCandles[0].close :
      0;

    return {
      volatility,
      trend,
      volume: avgVolume,
      priceRange,
      momentum
    };
  }, []);

  const addCandle = useCallback((newCandle: CandleData) => {
    setCandleWindow(prevWindow => {
      const updatedWindow = [...prevWindow, newCandle];
      
      // Mantener solo las últimas `windowSize` velas
      if (updatedWindow.length > config.windowSize) {
        updatedWindow.shift();
      }

      // Calcular métricas si tenemos suficientes datos
      if (updatedWindow.length >= config.evaluationThreshold) {
        const metrics = calculateMetrics(updatedWindow);
        setWindowMetrics(metrics);
        setIsReady(true);
      }

      return updatedWindow;
    });
  }, [config.windowSize, config.evaluationThreshold, calculateMetrics]);

  const getWindow = useCallback(() => candleWindow, [candleWindow]);

  const reset = useCallback(() => {
    setCandleWindow([]);
    setWindowMetrics(null);
    setIsReady(false);
  }, []);

  return {
    candleWindow,
    windowMetrics,
    isReady,
    addCandle,
    getWindow,
    reset,
    windowSize: candleWindow.length
  };
};
