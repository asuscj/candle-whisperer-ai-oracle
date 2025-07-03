
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CandleData, CandlestickData, CandlePattern, MLPrediction, PatternDetection } from '@/types/trading';
import { format } from 'date-fns';

/**
 * Props for the TradingChart component
 */
interface TradingChartProps {
  /** Legacy data prop for backwards compatibility */
  data?: CandlestickData[];
  /** Current candle data to display */
  candles?: CandleData[];
  /** Detected patterns to highlight on the chart */
  patterns?: (CandlePattern | PatternDetection)[];
  /** ML predictions array (legacy) */
  predictions?: MLPrediction[];
  /** Current ML prediction to display */
  prediction?: {
    timestamp: number;
    value: number;
    confidence: number;
  };
}

/**
 * TradingChart - Main chart component for displaying candlestick data, patterns, and predictions
 * 
 * This component renders a line chart representation of candlestick data with overlays for:
 * - Detected candlestick patterns (Hammer, Doji, Engulfing)
 * - ML predictions with confidence levels
 * - High/Low ranges and close prices
 * 
 * @example
 * ```tsx
 * <TradingChart 
 *   candles={candleData} 
 *   patterns={detectedPatterns}
 *   prediction={currentPrediction}
 * />
 * ```
 * 
 * @param props - The component props
 * @returns JSX element representing the trading chart
 */
const TradingChart = ({ data, candles, patterns = [], predictions, prediction }: TradingChartProps) => {
  // Use data or candles, with data taking precedence for backwards compatibility
  const candleData = data || candles || [];

  if (candleData.length === 0) {
    return (
      <div data-testid="trading-chart" className="bg-gray-900 rounded-lg p-4 flex items-center justify-center h-96">
        <p className="text-gray-400">No hay datos para mostrar</p>
      </div>
    );
  }

  // Convert candle data for line chart representation
  const chartData = candleData.map(candle => ({
    timestamp: candle.timestamp,
    time: format(new Date(candle.timestamp), 'HH:mm'),
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
    isGreen: candle.close > candle.open
  }));

  // Add prediction point if available
  if (prediction) {
    chartData.push({
      timestamp: prediction.timestamp,
      time: format(new Date(prediction.timestamp), 'HH:mm'),
      open: prediction.value,
      high: prediction.value,
      low: prediction.value,
      close: prediction.value,
      volume: 0,
      isGreen: true
    });
  }

  /**
   * Custom tooltip component for displaying OHLC data on hover
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            <div className="text-green-400">O: {data.open?.toFixed(5)}</div>
            <div className="text-blue-400">H: {data.high?.toFixed(5)}</div>
            <div className="text-red-400">L: {data.low?.toFixed(5)}</div>
            <div className="text-yellow-400">C: {data.close?.toFixed(5)}</div>
          </div>
          {data.volume > 0 && (
            <p className="text-gray-400 text-xs mt-1">Vol: {data.volume.toLocaleString()}</p>
          )}
        </div>
      );
    }
    return null;
  };

  /**
   * Type guard to check if a pattern is a CandlePattern
   * @param pattern - The pattern to check
   * @returns True if the pattern is a CandlePattern
   */
  const isCandlePattern = (pattern: CandlePattern | PatternDetection): pattern is CandlePattern => {
    return 'position' in pattern;
  };

  /**
   * Type guard to check if a pattern is a PatternDetection
   * @param pattern - The pattern to check
   * @returns True if the pattern is a PatternDetection
   */
  const isPatternDetection = (pattern: CandlePattern | PatternDetection): pattern is PatternDetection => {
    return 'candleIndex' in pattern;
  };

  return (
    <div data-testid="trading-chart" className="bg-gray-900 rounded-lg p-4">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* High-Low range */}
          <Line
            type="monotone"
            dataKey="high"
            stroke="#10B981"
            strokeWidth={1}
            dot={false}
            strokeDasharray="2 2"
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="#EF4444"
            strokeWidth={1}
            dot={false}
            strokeDasharray="2 2"
          />
          
          {/* Close price */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
          />

          {/* Pattern markers */}
          {patterns.map((pattern, index) => {
            // Use type guards to properly handle union types
            let position: number;
            let patternName: string;
            
            if (isCandlePattern(pattern)) {
              position = pattern.position;
              patternName = pattern.name;
            } else if (isPatternDetection(pattern)) {
              position = pattern.candleIndex;
              patternName = pattern.name;
            } else {
              return null;
            }
            
            const candle = candleData[position];
            if (!candle) return null;
            
            // Determine color based on pattern type or signal
            let strokeColor = '#F59E0B'; // Default yellow
            
            // Check if it's a CandlePattern with type property
            if (isCandlePattern(pattern) && pattern.type) {
              if (pattern.type === 'bullish') strokeColor = '#10B981';
              else if (pattern.type === 'bearish') strokeColor = '#EF4444';
            }
            
            // Check if it has signal property
            if ('signal' in pattern && typeof pattern.signal === 'string') {
              if (pattern.signal === 'buy') strokeColor = '#10B981';
              else if (pattern.signal === 'sell') strokeColor = '#EF4444';
            }
            
            return (
              <ReferenceLine
                key={index}
                x={format(new Date(candle.timestamp), 'HH:mm')}
                stroke={strokeColor}
                strokeDasharray="5 5"
                label={{
                  value: patternName,
                  position: 'top',
                  fill: strokeColor
                }}
              />
            );
          })}

          {/* Prediction line */}
          {prediction && (
            <ReferenceLine
              x={format(new Date(prediction.timestamp), 'HH:mm')}
              stroke="#8B5CF6"
              strokeDasharray="10 5"
              label={{ value: 'Prediction', position: 'top', fill: '#8B5CF6' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradingChart;
