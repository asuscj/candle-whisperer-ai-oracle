
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PatternMatch } from '@/utils/clientPatternRecognition';
import { CandleData } from '@/types/trading';
import { Eye, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ModelFeedbackPanelProps {
  detectedPatterns: PatternMatch[];
  currentCandles: CandleData[];
  isRealTime?: boolean;
}

interface PatternOutcome {
  patternId: string;
  predictedDirection: 'bullish' | 'bearish' | 'neutral';
  actualOutcome: 'correct' | 'incorrect' | 'pending';
  confidenceLevel: number;
  actualPriceChange: number;
  timeToResolution: number; // en minutos
}

const ModelFeedbackPanel = ({ detectedPatterns, currentCandles, isRealTime = false }: ModelFeedbackPanelProps) => {
  const [patternOutcomes, setPatternOutcomes] = useState<PatternOutcome[]>([]);
  const [feedbackMetrics, setFeedbackMetrics] = useState({
    totalEvaluated: 0,
    correctPredictions: 0,
    accuracy: 0,
    avgConfidence: 0
  });

  // Simular seguimiento de resultados de patrones
  useEffect(() => {
    if (detectedPatterns.length > 0 && currentCandles.length > 10) {
      const newOutcomes = detectedPatterns.slice(-5).map((pattern, index) => {
        const patternCandle = currentCandles[pattern.pattern.position];
        const futureCandles = currentCandles.slice(pattern.pattern.position + 1, pattern.pattern.position + 6);
        
        if (futureCandles.length > 0) {
          const priceChange = (futureCandles[futureCandles.length - 1].close - patternCandle.close) / patternCandle.close;
          
          let actualOutcome: 'correct' | 'incorrect' | 'pending' = 'pending';
          
          if (Math.abs(priceChange) > 0.005) { // Movimiento significativo
            const predictedBullish = pattern.pattern.type === 'bullish';
            const actuallyBullish = priceChange > 0;
            actualOutcome = predictedBullish === actuallyBullish ? 'correct' : 'incorrect';
          }
          
          return {
            patternId: `${pattern.pattern.name}_${pattern.pattern.position}_${index}`,
            predictedDirection: pattern.pattern.type,
            actualOutcome,
            confidenceLevel: pattern.strength,
            actualPriceChange: priceChange * 100,
            timeToResolution: futureCandles.length
          };
        }
        
        return {
          patternId: `${pattern.pattern.name}_${pattern.pattern.position}_${index}`,
          predictedDirection: pattern.pattern.type,
          actualOutcome: 'pending' as const,
          confidenceLevel: pattern.strength,
          actualPriceChange: 0,
          timeToResolution: 0
        };
      });
      
      setPatternOutcomes(newOutcomes);
      
      // Calcular métricas de feedback
      const evaluated = newOutcomes.filter(o => o.actualOutcome !== 'pending');
      const correct = evaluated.filter(o => o.actualOutcome === 'correct');
      
      setFeedbackMetrics({
        totalEvaluated: evaluated.length,
        correctPredictions: correct.length,
        accuracy: evaluated.length > 0 ? correct.length / evaluated.length : 0,
        avgConfidence: newOutcomes.reduce((sum, o) => sum + o.confidenceLevel, 0) / newOutcomes.length
      });
    }
  }, [detectedPatterns, currentCandles]);

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'correct':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'incorrect':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPatternTypeIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength > 0.8) return 'text-green-400';
    if (strength > 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getContextBadgeColor = (context: PatternMatch['context']) => {
    const score = (context.volumeConfirmation ? 1 : 0) + 
                  (context.trendAlignment ? 1 : 0) + 
                  (context.marketCondition === 'trending' ? 1 : 0);
    
    if (score >= 2) return 'bg-green-900/30 border-green-500 text-green-400';
    if (score === 1) return 'bg-yellow-900/30 border-yellow-500 text-yellow-400';
    return 'bg-red-900/30 border-red-500 text-red-400';
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-500" />
          Retroalimentación del Modelo
          {isRealTime && (
            <div className="ml-auto flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Evaluando</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métricas de Rendimiento del Modelo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {(feedbackMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Precisión General</div>
            </div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {feedbackMetrics.totalEvaluated}
              </div>
              <div className="text-xs text-gray-400">Patrones Evaluados</div>
            </div>
          </div>
        </div>

        {/* Patrones Detectados Recientemente */}
        <div className="space-y-2">
          <h4 className="text-white text-sm font-medium">Patrones Detectados</h4>
          {detectedPatterns.slice(0, 3).map((match, index) => (
            <div key={index} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getPatternTypeIcon(match.pattern.type)}
                  <span className="text-white font-medium text-sm">{match.pattern.name}</span>
                </div>
                <Badge className={getContextBadgeColor(match.context)}>
                  Contexto: {match.context.marketCondition}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Fuerza:</span>
                  <span className={`ml-1 font-medium ${getStrengthColor(match.strength)}`}>
                    {(match.strength * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Precisión Histórica:</span>
                  <span className="ml-1 text-blue-400 font-medium">
                    {(match.historicalAccuracy * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">Vol:</span>
                  {match.context.volumeConfirmation ? 
                    <CheckCircle className="h-3 w-3 text-green-500" /> :
                    <XCircle className="h-3 w-3 text-red-500" />
                  }
                </div>
              </div>
              
              <div className="mt-2">
                <Progress 
                  value={match.strength * 100} 
                  className="h-1 bg-gray-700"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Resultados Post-Patrón */}
        <div className="space-y-2">
          <h4 className="text-white text-sm font-medium">Resultados Post-Patrón</h4>
          {patternOutcomes.slice(0, 3).map((outcome, index) => (
            <div key={outcome.patternId} className="flex items-center justify-between p-2 bg-gray-800/20 rounded">
              <div className="flex items-center gap-2">
                {getOutcomeIcon(outcome.actualOutcome)}
                <span className="text-sm text-gray-300">
                  {outcome.predictedDirection.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                <div className="text-gray-400">
                  Conf: <span className="text-white">{(outcome.confidenceLevel * 100).toFixed(0)}%</span>
                </div>
                {outcome.actualOutcome !== 'pending' && (
                  <div className={`font-medium ${
                    outcome.actualPriceChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {outcome.actualPriceChange > 0 ? '+' : ''}{outcome.actualPriceChange.toFixed(2)}%
                  </div>
                )}
                <Badge 
                  className={`text-xs ${
                    outcome.actualOutcome === 'correct' ? 'bg-green-900/30 border-green-500 text-green-400' :
                    outcome.actualOutcome === 'incorrect' ? 'bg-red-900/30 border-red-500 text-red-400' :
                    'bg-yellow-900/30 border-yellow-500 text-yellow-400'
                  }`}
                >
                  {outcome.actualOutcome === 'pending' ? 'Evaluando' : 
                   outcome.actualOutcome === 'correct' ? 'Correcto' : 'Incorrecto'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Estado cuando no hay patrones */}
        {detectedPatterns.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">No se han detectado patrones recientes</p>
            <p className="text-gray-500 text-xs mt-1">
              El sistema está monitoreando continuamente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelFeedbackPanel;
