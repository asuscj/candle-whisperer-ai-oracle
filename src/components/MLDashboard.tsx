
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MLPrediction, PerformanceMetrics } from '@/types/trading';
import { Brain, Target, TrendingUp, BarChart3 } from 'lucide-react';

interface MLDashboardProps {
  prediction: MLPrediction | null;
  metrics: PerformanceMetrics;
  isTraining: boolean;
}

const MLDashboard = ({ prediction, metrics, isTraining }: MLDashboardProps) => {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy':
        return 'bg-green-900/30 border-green-500 text-green-400';
      case 'sell':
        return 'bg-red-900/30 border-red-500 text-red-400';
      default:
        return 'bg-gray-900/30 border-gray-500 text-gray-400';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy':
        return '📈';
      case 'sell':
        return '📉';
      default:
        return '⏸️';
    }
  };

  return (
    <div className="space-y-4">
      {/* ML Prediction Card */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Predicción ML
            {isTraining && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-orange-400">Entrenando...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prediction ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Señal</span>
                    <Badge className={getSignalColor(prediction.signal)}>
                      {getSignalIcon(prediction.signal)} {prediction.signal.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Patrón</span>
                    <span className="text-white text-sm">{prediction.pattern}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Confianza</span>
                    <span className="text-green-400 font-medium">
                      {(prediction.nextCandle.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Precisión</span>
                    <span className="text-blue-400 font-medium">
                      {(prediction.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-white text-sm font-medium mb-2">Próxima Vela Predicha</h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-400">Open</div>
                    <div className="text-white font-medium">
                      {prediction.nextCandle.open.toFixed(5)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">High</div>
                    <div className="text-green-400 font-medium">
                      {prediction.nextCandle.high.toFixed(5)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Low</div>
                    <div className="text-red-400 font-medium">
                      {prediction.nextCandle.low.toFixed(5)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Close</div>
                    <div className="text-yellow-400 font-medium">
                      {prediction.nextCandle.close.toFixed(5)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Generando predicción...</p>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Métricas de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Precisión</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {(metrics.winRate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Tasa de Éxito</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {metrics.f1Score.toFixed(3)}
              </div>
              <div className="text-xs text-gray-400">F1 Score</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">
                {metrics.profitFactor.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">Factor Ganancia</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">
                {metrics.totalTrades}
              </div>
              <div className="text-xs text-gray-400">Total Trades</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {(metrics.recall * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Recall</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MLDashboard;
