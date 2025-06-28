
import { CandleData, BacktestResult, MLPrediction } from '@/types/trading';
import { MLPredictor } from './mlPredictor';

export class BacktestingEngine {
  private static calculateReturns(candles: CandleData[], signals: ('buy' | 'sell' | 'hold')[]): number[] {
    const returns: number[] = [];
    let position = 0; // 0 = no position, 1 = long, -1 = short
    let entryPrice = 0;

    for (let i = 1; i < candles.length && i < signals.length; i++) {
      const currentCandle = candles[i];
      const signal = signals[i];
      let currentReturn = 0;

      if (position === 0) {
        // No position, check for entry signals
        if (signal === 'buy') {
          position = 1;
          entryPrice = currentCandle.close;
        } else if (signal === 'sell') {
          position = -1;
          entryPrice = currentCandle.close;
        }
      } else {
        // In position, calculate return
        const priceChange = (currentCandle.close - entryPrice) / entryPrice;
        currentReturn = position * priceChange;

        // Exit on opposite signal or hold
        if ((position === 1 && signal === 'sell') || 
            (position === -1 && signal === 'buy') ||
            signal === 'hold') {
          position = 0;
          entryPrice = 0;
        } else {
          entryPrice = currentCandle.close; // Update for running position
        }
      }

      returns.push(currentReturn);
    }

    return returns;
  }

  private static calculateEquityCurve(returns: number[], initialCapital: number = 10000): number[] {
    const equity = [initialCapital];
    let currentCapital = initialCapital;

    for (const ret of returns) {
      currentCapital *= (1 + ret);
      equity.push(currentCapital);
    }

    return equity;
  }

  private static calculateMaxDrawdown(equity: number[]): number {
    let maxDrawdown = 0;
    let peak = equity[0];

    for (const value of equity) {
      if (value > peak) {
        peak = value;
      } else {
        const drawdown = (peak - value) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    return maxDrawdown;
  }

  private static calculateSharpeRatio(returns: number[]): number {
    if (returns.length === 0) return 0;

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Annualized Sharpe ratio (assuming daily returns)
    const annualizedReturn = meanReturn * 252;
    const annualizedStd = stdDev * Math.sqrt(252);

    return annualizedStd === 0 ? 0 : annualizedReturn / annualizedStd;
  }

  public static async runBacktest(
    historicalData: CandleData[],
    startDate?: Date,
    endDate?: Date
  ): Promise<BacktestResult> {
    // Filter data by date range if provided
    let testData = historicalData;
    if (startDate || endDate) {
      testData = historicalData.filter(candle => {
        const candleDate = new Date(candle.timestamp);
        if (startDate && candleDate < startDate) return false;
        if (endDate && candleDate > endDate) return false;
        return true;
      });
    }

    if (testData.length < 50) {
      throw new Error('Insufficient data for backtesting');
    }

    // Generate predictions for each candle
    const signals: ('buy' | 'sell' | 'hold')[] = [];
    const predictions: MLPrediction[] = [];

    for (let i = 20; i < testData.length; i++) {
      try {
        const recentCandles = testData.slice(i - 20, i);
        const prediction = MLPredictor.predict(recentCandles);
        predictions.push(prediction);
        signals.push(prediction.signal);
      } catch (error) {
        signals.push('hold');
      }
    }

    // Calculate performance metrics
    const returns = this.calculateReturns(testData.slice(20), signals);
    const equity = this.calculateEquityCurve(returns);
    const maxDrawdown = this.calculateMaxDrawdown(equity);
    const sharpeRatio = this.calculateSharpeRatio(returns);

    // Calculate win rate
    const trades = returns.filter(r => r !== 0);
    const winningTrades = trades.filter(r => r > 0);
    const winRate = trades.length > 0 ? winningTrades.length / trades.length : 0;

    // Calculate profit factor
    const grossProfit = winningTrades.reduce((sum, r) => sum + r, 0);
    const grossLoss = trades.filter(r => r < 0).reduce((sum, r) => sum + Math.abs(r), 0);
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

    return {
      totalTrades: trades.length,
      winRate,
      profitFactor,
      maxDrawdown,
      sharpeRatio,
      returns,
      equity
    };
  }
}
