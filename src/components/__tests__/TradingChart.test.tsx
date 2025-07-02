
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TradingChart from '../TradingChart';
import { CandlestickData, PatternDetection, MLPrediction } from '../../types/trading';

describe('TradingChart', () => {
  const mockCandleData: CandlestickData[] = [
    {
      timestamp: 1640995200000,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
      volume: 1000
    },
    {
      timestamp: 1640995260000,
      open: 102,
      high: 108,
      low: 100,
      close: 106,
      volume: 1200
    }
  ];

  it('should render chart with data', () => {
    const { container } = render(<TradingChart data={mockCandleData} />);
    
    // Should render the chart container
    expect(container.querySelector('[data-testid="trading-chart"]')).toBeInTheDocument();
  });

  it('should display "No hay datos" when data is empty', () => {
    const { getByText } = render(<TradingChart data={[]} />);
    
    expect(getByText('No hay datos para mostrar')).toBeInTheDocument();
  });

  it('should handle patterns overlay', () => {
    const mockPatterns: PatternDetection[] = [
      {
        type: 'hammer',
        timestamp: 1640995200000,
        confidence: 0.8,
        signal: 'buy',
        candleIndex: 0,
        name: 'Hammer',
        description: 'Bullish reversal pattern',
        position: 0
      }
    ];

    const { container } = render(
      <TradingChart 
        data={mockCandleData} 
        patterns={mockPatterns}
      />
    );
    
    // Chart should render with pattern data
    expect(container.querySelector('[data-testid="trading-chart"]')).toBeInTheDocument();
  });

  it('should handle predictions overlay', () => {
    const mockPredictions: MLPrediction[] = [
      {
        nextCandle: {
          open: 106,
          high: 112,
          low: 104,
          close: 110,
          confidence: 0.75
        },
        pattern: 'Bullish Trend',
        signal: 'buy',
        accuracy: 0.78,
        predictedPrice: 110,
        confidence: 0.75,
        timestamp: 1640995260000
      }
    ];

    const { container } = render(
      <TradingChart 
        data={mockCandleData}
        predictions={mockPredictions}
      />
    );
    
    // Chart should render with prediction data
    expect(container.querySelector('[data-testid="trading-chart"]')).toBeInTheDocument();
  });
});
