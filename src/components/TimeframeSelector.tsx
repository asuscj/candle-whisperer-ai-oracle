
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TimeframeOption } from '@/types/trading';
import { Clock } from 'lucide-react';

interface TimeframeSelectorProps {
  selectedTimeframe: TimeframeOption;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
}

const TimeframeSelector = ({ selectedTimeframe, onTimeframeChange }: TimeframeSelectorProps) => {
  const timeframes: TimeframeOption[] = [
    { value: '30s', label: '30 Segundos', duration: 30000 },
    { value: '1m', label: '1 Minuto', duration: 60000 },
    { value: '5m', label: '5 Minutos', duration: 300000 },
    { value: '15m', label: '15 Minutos', duration: 900000 },
    { value: '1h', label: '1 Hora', duration: 3600000 },
    { value: '4h', label: '4 Horas', duration: 14400000 },
    { value: '1D', label: '1 Día', duration: 86400000 }
  ];

  const getTimeframeColor = (value: string) => {
    const colors = {
      '30s': 'bg-red-900/30 border-red-500 text-red-400',
      '1m': 'bg-orange-900/30 border-orange-500 text-orange-400',
      '5m': 'bg-yellow-900/30 border-yellow-500 text-yellow-400',
      '15m': 'bg-green-900/30 border-green-500 text-green-400',
      '1h': 'bg-blue-900/30 border-blue-500 text-blue-400',
      '4h': 'bg-purple-900/30 border-purple-500 text-purple-400',
      '1D': 'bg-pink-900/30 border-pink-500 text-pink-400'
    };
    return colors[value as keyof typeof colors] || 'bg-gray-900/30 border-gray-500 text-gray-400';
  };

  return (
    <div className="space-y-2">
      <label className="text-white text-sm font-medium flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Timeframe
      </label>
      <Select
        value={selectedTimeframe.value}
        onValueChange={(value) => {
          const timeframe = timeframes.find(t => t.value === value);
          if (timeframe) onTimeframeChange(timeframe);
        }}
      >
        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {timeframes.map((timeframe) => (
            <SelectItem
              key={timeframe.value}
              value={timeframe.value}
              className="text-white hover:bg-gray-700 focus:bg-gray-700"
            >
              <div className="flex items-center justify-between w-full">
                <span>{timeframe.label}</span>
                <Badge className={getTimeframeColor(timeframe.value)}>
                  {timeframe.value}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeframeSelector;
