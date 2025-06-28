
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CandlePattern, CandleData } from '@/types/trading';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AdvancedPatternVisualizerProps {
  patterns: CandlePattern[];
  candles: CandleData[];
  isRealTime: boolean;
}

const AdvancedPatternVisualizer = ({ patterns, candles, isRealTime }: AdvancedPatternVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || candles.length === 0) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 200;

    // Clear previous content
    svg.innerHTML = '';

    // Create scales
    const xScale = (index: number) => (index / Math.max(candles.length - 1, 1)) * width;
    const prices = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const yScale = (price: number) => height - ((price - minPrice) / priceRange) * height;

    // Draw candlesticks
    candles.forEach((candle, index) => {
      const x = xScale(index);
      const isGreen = candle.close > candle.open;
      
      // Draw wick
      const wickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      wickLine.setAttribute('x1', x.toString());
      wickLine.setAttribute('y1', yScale(candle.high).toString());
      wickLine.setAttribute('x2', x.toString());
      wickLine.setAttribute('y2', yScale(candle.low).toString());
      wickLine.setAttribute('stroke', '#6B7280');
      wickLine.setAttribute('stroke-width', '1');
      svg.appendChild(wickLine);

      // Draw body
      const bodyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const bodyHeight = Math.abs(yScale(candle.close) - yScale(candle.open));
      bodyRect.setAttribute('x', (x - 2).toString());
      bodyRect.setAttribute('y', Math.min(yScale(candle.close), yScale(candle.open)).toString());
      bodyRect.setAttribute('width', '4');
      bodyRect.setAttribute('height', Math.max(bodyHeight, 1).toString());
      bodyRect.setAttribute('fill', isGreen ? '#10B981' : '#EF4444');
      svg.appendChild(bodyRect);
    });

    // Draw pattern markers
    patterns.forEach((pattern) => {
      if (pattern.position < candles.length) {
        const candle = candles[pattern.position];
        const x = xScale(pattern.position);
        const y = yScale(candle.high) - 20;

        // Pattern marker circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x.toString());
        circle.setAttribute('cy', y.toString());
        circle.setAttribute('r', '6');
        circle.setAttribute('fill', pattern.type === 'bullish' ? '#10B981' : pattern.type === 'bearish' ? '#EF4444' : '#F59E0B');
        circle.setAttribute('opacity', '0.8');
        svg.appendChild(circle);

        // Pattern confidence text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', (y - 10).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '10');
        text.textContent = `${(pattern.confidence * 100).toFixed(0)}%`;
        svg.appendChild(text);
      }
    });

  }, [patterns, candles]);

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

  const recentPatterns = patterns.slice(-3).reverse();

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          Visualización Avanzada de Patrones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SVG Chart */}
        <div className="bg-gray-800/50 rounded-lg p-2">
          <svg
            ref={svgRef}
            width="100%"
            height="200"
            className="border border-gray-700 rounded"
          />
        </div>

        {/* Pattern List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Patrones Recientes</h4>
          {recentPatterns.length === 0 ? (
            <p className="text-gray-500 text-xs">No hay patrones detectados</p>
          ) : (
            recentPatterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-800/30 border border-gray-700">
                <div className="flex items-center gap-2">
                  {getPatternIcon(pattern.type)}
                  <div>
                    <span className="text-white text-sm font-medium">{pattern.name}</span>
                    <p className="text-gray-400 text-xs">{pattern.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPatternColor(pattern.type)}>
                    {(pattern.confidence * 100).toFixed(0)}%
                  </Badge>
                  <span className="text-xs text-gray-500">#{pattern.position}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedPatternVisualizer;
