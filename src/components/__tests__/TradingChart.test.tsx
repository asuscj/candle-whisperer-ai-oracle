
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TradingChart from '../TradingChart';
import { CandlestickData } from '../../types/trading';

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
    render(<TradingChart data={mockCandleData} />);
    
    // Should render the chart container
    expect(screen.getByTestId('trading-chart')).toBeInTheDocument();
  });

  it('should display "No hay datos" when data is empty', () => {
    render(<TradingChart data={[]} />);
    
    expect(screen.getByText('No hay datos para mostrar')).toBeInTheDocument();
  });

  it('should handle patterns overlay', () => {
    const mockPatterns = [
      {
        type: 'hammer' as const,
        timestamp: 1640995200000,
        confidence: 0.8,
        signal: 'buy' as const,
        candleIndex: 0
      }
    ];

    render(
      <TradingChart 
        data={mockCandleData} 
        patterns={mockPatterns}
      />
    );
    
    // Chart should render with pattern data
    expect(screen.getByTestId('trading-chart')).toBeInTheDocument();
  });

  it('should handle predictions overlay', () => {
    const mockPredictions = [
      {
        predictedPrice: 110,
        signal: 'buy' as const,
        confidence: 0.75,
        timestamp: 1640995260000
      }
    ];

    render(
      <TradingChart 
        data={mockCandleData}
        predictions={mockPredictions}
      />
    );
    
    // Chart should render with prediction data
    expect(screen.getByTestId('trading-chart')).toBeInTheDocument();
  });
});
