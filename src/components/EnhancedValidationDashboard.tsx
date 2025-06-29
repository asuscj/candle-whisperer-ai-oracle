
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedValidationMetrics, AutoValidationResult } from '@/utils/enhancedValidationSystem';
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';

interface EnhancedValidationDashboardProps {
  metrics: EnhancedValidationMetrics;
  recentValidations: AutoValidationResult[];
  pendingCount: number;
  isActive: boolean;
}

const EnhancedValidationDashboard = ({ 
  metrics, 
  recentValidations, 
  pendingCount,
  isActive 
}: EnhancedValidationDashboardProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'text-green-400';
    if (accuracy >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
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
      {/* Main Validation Metrics */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Validación Automática Mejorada
            {isActive && (
              <div className="ml-auto flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Activo</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <div className={`text-xl font-bold ${getAccuracyColor(metrics.priceAccuracy)}`}>
                  {(metrics.priceAccuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Precisión Precio</div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <div className={`text-xl font-bold ${getAccuracyColor(metrics.signalAccuracy)}`}>
                  {(metrics.signalAccuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Precisión Señal</div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">
                  {metrics.totalValidations}
                </div>
                <div className="text-xs text-gray-400">Validaciones</div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">
                  {pendingCount}
                </div>
                <div className="text-xs text-gray-400">Pendientes</div>
              </div>
            </div>
          </div>

          {/* Performance Trend */}
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white text-sm font-medium">Tendencia de Rendimiento</h4>
              <div className="flex items-center gap-2">
                {getTrendIcon(metrics.recentPerformance.trend)}
                <span className="text-xs text-gray-400 capitalize">
                  {metrics.recentPerformance.trend}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Últimas 10:</span>
                <span className={getAccuracyColor(metrics.recentPerformance.last10Accuracy)}>
                  {(metrics.recentPerformance.last10Accuracy * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Patrones:</span>
                <span className="text-cyan-400">
                  {(metrics.patternSuccessRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Conflict Resolution Stats */}
          {metrics.conflictResolutionStats.totalConflicts > 0 && (
            <div className="p-3 bg-orange-900/20 rounded-lg border border-orange-700">
              <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Resolución de Conflictos
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-orange-400 font-medium">
                    {metrics.conflictResolutionStats.totalConflicts}
                  </div>
                  <div className="text-gray-400">Conflictos</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-medium">
                    {metrics.conflictResolutionStats.correctResolutions}
                  </div>
                  <div className="text-gray-400">Correctos</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${getAccuracyColor(metrics.conflictResolutionStats.resolutionAccuracy)}`}>
                    {(metrics.conflictResolutionStats.resolutionAccuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-400">Precisión</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Validations */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Validaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentValidations.slice(0, 5).map((validation, index) => (
              <div key={validation.predictionId} className="flex items-center justify-between p-2 bg-gray-800/30 rounded text-xs">
                <div className="flex items-center gap-2">
                  {validation.signalAccuracy > 0 ? 
                    <CheckCircle2 className="h-3 w-3 text-green-500" /> :
                    <XCircle className="h-3 w-3 text-red-500" />
                  }
                  <span className="text-gray-300">
                    {getSignalIcon(validation.conflictResolution.resolvedSignal)} 
                    {validation.conflictResolution.resolvedSignal.toUpperCase()}
                  </span>
                  {validation.conflictResolution.hasConflict && (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    Precio: <span className={getAccuracyColor(validation.priceAccuracy)}>
                      {(validation.priceAccuracy * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {validation.validationDelay}v
                  </div>
                  <Badge className={`text-xs ${
                    validation.patternSuccess ? 
                    'bg-green-900/30 border-green-500 text-green-400' :
                    'bg-red-900/30 border-red-500 text-red-400'
                  }`}>
                    {validation.patternSuccess ? '✓' : '✗'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {recentValidations.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">No hay validaciones recientes</p>
                <p className="text-gray-500 text-xs mt-1">
                  {pendingCount > 0 ? `${pendingCount} predicciones esperando validación` : 'Sistema listo para predicciones'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedValidationDashboard;
