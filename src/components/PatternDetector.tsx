
import React from 'react';
import { CandlePattern } from '@/types/trading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PatternDetectorProps {
  patterns: CandlePattern[];
}

const PatternDetector = ({ patterns }: PatternDetectorProps) => {
  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'bullish':
        return 'bg-green-900/30 border-green-500/50 text-green-400';
      case 'bearish':
        return 'bg-red-900/30 border-red-500/50 text-red-400';
      default:
        return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400';
    }
  };

  const recentPatterns = patterns.slice(-5).reverse();

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          Patrones Detectados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentPatterns.length === 0 ? (
          <p className="text-gray-400 text-sm">No se han detectado patrones recientes</p>
        ) : (
          recentPatterns.map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-3">
                {getPatternIcon(pattern.type)}
                <div>
                  <h4 className="text-white font-medium">{pattern.name}</h4>
                  <p className="text-gray-400 text-xs">{pattern.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={getPatternColor(pattern.type)}>
                  {(pattern.confidence * 100).toFixed(0)}%
                </Badge>
                <span className="text-xs text-gray-500">
                  Posición: {pattern.position}
                </span>
              </div>
            </div>
          ))
        )}
        
        {patterns.length > 5 && (
          <div className="text-center pt-2">
            <span className="text-xs text-gray-500">
              +{patterns.length - 5} patrones más detectados
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatternDetector;
