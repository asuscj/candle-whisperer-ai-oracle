
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CandlePattern } from '@/types/trading';
import { CandlePatternDetector } from '@/utils/candlePatterns';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';

interface PatternStatisticsProps {
  patterns: CandlePattern[];
  isRealTime?: boolean;
}

const PatternStatistics = ({ patterns, isRealTime = false }: PatternStatisticsProps) => {
  const stats = CandlePatternDetector.getPatternStatistics(patterns);
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'text-green-400 bg-green-900/20 border-green-500/50';
      case 'bearish': return 'text-red-400 bg-red-900/20 border-red-500/50';
      default: return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50';
    }
  };

  const getPatternTypeFromName = (name: string): string => {
    const bullishPatterns = ['Hammer', 'Bullish Engulfing', 'Bullish Harami', 'Morning Star'];
    const bearishPatterns = ['Shooting Star', 'Bearish Engulfing', 'Bearish Harami', 'Evening Star'];
    
    if (bullishPatterns.includes(name)) return 'bullish';
    if (bearishPatterns.includes(name)) return 'bearish';
    return 'neutral';
  };

  const sortedPatterns = Object.entries(stats.byType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  const recentPatterns = patterns.slice(-10);
  const bullishCount = recentPatterns.filter(p => p.type === 'bullish').length;
  const bearishCount = recentPatterns.filter(p => p.type === 'bearish').length;
  const neutralCount = recentPatterns.filter(p => p.type === 'neutral').length;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Estadísticas de Patrones
          {isRealTime && (
            <div className="ml-auto flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">En vivo</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen General */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-gray-300 text-sm">Total Detectados</span>
            </div>
            <p className="text-xl font-semibold text-white">{stats.total}</p>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-300 text-sm">Confianza Promedio</span>
            </div>
            <p className="text-xl font-semibold text-yellow-400">
              {(stats.avgConfidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Distribución por Tipo (Últimos 10) */}
        <div className="space-y-2">
          <h4 className="text-white text-sm font-medium">Distribución Reciente</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-400">Bullish</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(bullishCount / Math.max(recentPatterns.length, 1)) * 100} 
                  className="w-20 h-2 bg-gray-700"
                />
                <span className="text-sm text-white w-8">{bullishCount}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-400">Bearish</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(bearishCount / Math.max(recentPatterns.length, 1)) * 100} 
                  className="w-20 h-2 bg-gray-700"
                />
                <span className="text-sm text-white w-8">{bearishCount}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-400">Neutral</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(neutralCount / Math.max(recentPatterns.length, 1)) * 100} 
                  className="w-20 h-2 bg-gray-700"
                />
                <span className="text-sm text-white w-8">{neutralCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Patrones */}
        <div className="space-y-2">
          <h4 className="text-white text-sm font-medium">Patrones Más Frecuentes</h4>
          <div className="space-y-2">
            {sortedPatterns.map(([name, count]) => {
              const type = getPatternTypeFromName(name);
              const percentage = (count / stats.total) * 100;
              
              return (
                <div key={name} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getTypeColor(type)}`}>
                      {name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          type === 'bullish' ? 'bg-green-500' :
                          type === 'bearish' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Patrón Más Común */}
        {stats.mostCommon && (
          <div className="p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Patrón Dominante</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{stats.mostCommon}</span>
              <Badge className={`${getTypeColor(getPatternTypeFromName(stats.mostCommon))}`}>
                {stats.byType[stats.mostCommon]} detecciones
              </Badge>
            </div>
          </div>
        )}

        {/* Estado cuando no hay patrones */}
        {stats.total === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">No se han detectado patrones aún</p>
            <p className="text-gray-500 text-xs mt-1">
              Los patrones aparecerán cuando se analicen más velas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatternStatistics;
