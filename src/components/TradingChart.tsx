
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CandleData, CandlePattern } from '@/types/trading';
import { format } from 'date-fns';

interface TradingChartProps {
  candles: CandleData[];
  patterns: CandlePattern[];
  prediction?: {
    timestamp: number;
    value: number;
    confidence: number;
  };
}

const CandlestickChart = ({ candles, patterns, prediction }: TradingChartProps) => {
  // Convert candle data for line chart representation
  const chartData = candles.map(candle => ({
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

  return (
    <div className="bg-gray-900 rounded-lg p-4">
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
            const candle = candles[pattern.position];
            if (!candle) return null;
            
            return (
              <ReferenceLine
                key={index}
                x={format(new Date(candle.timestamp), 'HH:mm')}
                stroke={pattern.type === 'bullish' ? '#10B981' : pattern.type === 'bearish' ? '#EF4444' : '#F59E0B'}
                strokeDasharray="5 5"
                label={{
                  value: pattern.name,
                  position: 'top',
                  fill: pattern.type === 'bullish' ? '#10B981' : pattern.type === 'bearish' ? '#EF4444' : '#F59E0B'
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

export default CandlestickChart;
