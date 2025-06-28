
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ValidationMetrics } from '@/utils/validationSystem';
import { ErrorLearningMetrics } from '@/utils/enhancedOnlineLearning';
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Target, Brain } from 'lucide-react';

interface ValidationMetricsProps {
  validationMetrics: ValidationMetrics;
  errorLearningMetrics: ErrorLearningMetrics;
}

const ValidationMetricsComponent = ({ validationMetrics, errorLearningMetrics }: ValidationMetricsProps) => {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.7) return 'text-green-400';
    if (accuracy >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConvergenceColor = (rate: number) => {
    if (rate > 0.1) return 'text-green-400';
    if (rate > 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Real-time Validation */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Validación en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-300 text-sm">Precisión Reciente</span>
              </div>
              <p className={`text-lg font-semibold ${getAccuracyColor(validationMetrics.recentAccuracy)}`}>
                {(validationMetrics.recentAccuracy * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-gray-300 text-sm">Predicciones</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {validationMetrics.correctPredictions}/{validationMetrics.totalPredictions}
              </p>
            </div>
          </div>

          {/* Pattern Success Rates */}
          <div className="space-y-2">
            <h4 className="text-white text-sm font-medium">Tasas de Éxito por Patrón</h4>
            <div className="space-y-1">
              {Object.entries(validationMetrics.patternSuccessRate).map(([pattern, rate]) => (
                <div key={pattern} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                  <span className="text-gray-300 text-sm">{pattern}</span>
                  <Badge className={`${getAccuracyColor(rate)} border-current`}>
                    {(rate * 100).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Error Magnitude */}
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Error Promedio:</span>
              <span className="text-white">{(validationMetrics.averageErrorMagnitude * 100).toFixed(2)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Learning Metrics */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Aprendizaje de Errores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300 text-sm">Tasa Aprendizaje</span>
              </div>
              <p className="text-lg font-semibold text-orange-400">
                {errorLearningMetrics.learningRate.toFixed(4)}
              </p>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-gray-300 text-sm">Convergencia</span>
              </div>
              <p className={`text-lg font-semibold ${getConvergenceColor(errorLearningMetrics.convergenceRate)}`}>
                {(errorLearningMetrics.convergenceRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Error Trend Visualization */}
          <div className="space-y-2">
            <h4 className="text-white text-sm font-medium">Tendencia de Errores</h4>
            <div className="flex items-end gap-1 h-12">
              {errorLearningMetrics.errorTrend.slice(-20).map((error, index) => (
                <div
                  key={index}
                  className="bg-red-500/60 rounded-t"
                  style={{
                    height: `${Math.max(2, error * 100)}%`,
                    width: '4px',
                    opacity: 0.4 + (index / 20) * 0.6
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Learning Statistics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Errores:</span>
              <span className="text-white">{errorLearningMetrics.totalErrors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Error Promedio:</span>
              <span className="text-white">{(errorLearningMetrics.averageError * 100).toFixed(2)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationMetricsComponent;
