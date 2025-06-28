
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TradingPair } from '@/types/trading';

interface TradingPairSelectorProps {
  pairs: TradingPair[];
  selectedPair: TradingPair | null;
  onSelect: (pair: TradingPair) => void;
}

const TradingPairSelector = ({ pairs, selectedPair, onSelect }: TradingPairSelectorProps) => {
  const getMarketColor = (market: string) => {
    return market === 'crypto' 
      ? 'bg-orange-900/30 border-orange-500 text-orange-400'
      : 'bg-blue-900/30 border-blue-500 text-blue-400';
  };

  return (
    <div className="space-y-2">
      <label className="text-white text-sm font-medium">Par de Trading</label>
      <Select
        value={selectedPair?.symbol || ''}
        onValueChange={(value) => {
          const pair = pairs.find(p => p.symbol === value);
          if (pair) onSelect(pair);
        }}
      >
        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
          <SelectValue placeholder="Selecciona un par de trading" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {pairs.map((pair) => (
            <SelectItem
              key={pair.symbol}
              value={pair.symbol}
              className="text-white hover:bg-gray-700 focus:bg-gray-700"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{pair.symbol}</span>
                <Badge className={getMarketColor(pair.market)}>
                  {pair.market.toUpperCase()}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedPair && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">
            {selectedPair.baseAsset}/{selectedPair.quoteAsset}
          </span>
          <Badge className={getMarketColor(selectedPair.market)}>
            {selectedPair.market === 'crypto' ? '🪙 Crypto' : '💱 Forex'}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default TradingPairSelector;
