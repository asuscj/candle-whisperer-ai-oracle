
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BacktestResult, CandleData } from '@/types/trading';
import { BacktestingEngine } from '@/utils/backtesting';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlayCircle, StopCircle, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface BacktestingPanelProps {
  candles: CandleData[];
}

const BacktestingPanel = ({ candles }: BacktestingPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = async () => {
    if (candles.length < 50) {
      setError('Se necesitan al menos 50 velas para ejecutar el backtesting');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      // Use last 200 candles for backtesting
      const testData = candles.slice(-200);
      const backtestResults = await BacktestingEngine.runBacktest(testData);
      setResults(backtestResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido en backtesting');
    } finally {
      setIsRunning(false);
    }
  };

  const equityChartData = results?.equity.map((value, index) => ({
    index,
    equity: value,
    return: results.returns[index] || 0
  })) || [];

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Backtesting Module
          </div>
          <Button
            onClick={runBacktest}
            disabled={isRunning || candles.length < 50}
            size="sm"
            className={isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {isRunning ? (
              <>
                <StopCircle className="h-4 w-4 mr-1" />
                Ejecutando...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-1" />
                Ejecutar Test
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {results && (
          <>
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-gray-300 text-sm">Tasa de Éxito</span>
                </div>
                <p className="text-white font-semibold">{formatPercentage(results.winRate)}</p>
              </div>
              
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-300 text-sm">Factor Profit</span>
                </div>
                <p className="text-white font-semibold">{results.profitFactor.toFixed(2)}</p>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-gray-300 text-sm">Max Drawdown</span>
                </div>
                <p className="text-white font-semibold">{formatPercentage(results.maxDrawdown)}</p>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 text-sm">Ratio Sharpe</span>
                <p className="text-white font-semibold">{results.sharpeRatio.toFixed(3)}</p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-white border-gray-600">
                Total Trades: {results.totalTrades}
              </Badge>
              <Badge 
                variant="outline" 
                className={`border-gray-600 ${results.winRate > 0.5 ? 'text-green-400' : 'text-red-400'}`}
              >
                {results.winRate > 0.5 ? '↗' : '↘'} Rendimiento
              </Badge>
            </div>

            {/* Equity Curve */}
            {equityChartData.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h4 className="text-white text-sm font-medium mb-2">Curva de Capital</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={equityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="index" 
                      stroke="#9CA3AF"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={10}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Capital']}
                    />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {!results && !error && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              {candles.length < 50 
                ? `Se necesitan ${50 - candles.length} velas más para ejecutar backtesting`
                : 'Ejecuta el backtesting para ver los resultados de rendimiento histórico'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BacktestingPanel;
