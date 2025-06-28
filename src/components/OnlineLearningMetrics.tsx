
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OnlineLearningMetrics } from '@/types/trading';
import { Brain, Database, Zap, Clock } from 'lucide-react';

interface OnlineLearningMetricsProps {
  metrics: OnlineLearningMetrics;
  isActive: boolean;
}

const OnlineLearningMetricsComponent = ({ metrics, isActive }: OnlineLearningMetricsProps) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Online Learning System
          <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={`${isActive ? 'text-green-400 border-green-500' : 'text-gray-400 border-gray-600'}`}
          >
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-500">
            Reservoir Sampling
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-gray-300 text-sm">Muestras Procesadas</span>
            </div>
            <p className="text-white font-semibold">{metrics.samplesProcessed.toLocaleString()}</p>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-green-500" />
              <span className="text-gray-300 text-sm">Tamaño Reservoir</span>
            </div>
            <p className="text-white font-semibold">{metrics.reservoirSize}</p>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-300 text-sm">Uso de Memoria</span>
            </div>
            <p className="text-white font-semibold">{formatBytes(metrics.memoryUsage)}</p>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-gray-300 text-sm">Tasa Adaptación</span>
            </div>
            <p className="text-white font-semibold">{(metrics.adaptationRate * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Última Actualización:</span>
            </div>
            <span className="text-white">{formatTimestamp(metrics.lastUpdate)}</span>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Eficiencia del Reservoir</span>
            <span className="text-white">
              {((metrics.reservoirSize / Math.max(metrics.samplesProcessed, 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((metrics.reservoirSize / Math.max(metrics.samplesProcessed, 1)) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnlineLearningMetricsComponent;
