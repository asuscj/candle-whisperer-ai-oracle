
import { create } from 'zustand';
import { CandleData, MLPrediction, PatternDetection } from '../types/trading';
import { EnhancedValidationMetrics } from '../utils/enhancedValidationSystem';

interface TradingState {
  // Data
  candleData: CandleData[];
  patterns: PatternDetection[];
  predictions: MLPrediction[];
  
  // System State
  isRunning: boolean;
  selectedPair: string;
  selectedTimeframe: string;
  
  // ML & Validation
  mlTrained: boolean;
  validationMetrics: EnhancedValidationMetrics | null;
  
  // Actions
  setCandleData: (data: CandleData[]) => void;
  addCandle: (candle: CandleData) => void;
  setPatterns: (patterns: PatternDetection[]) => void;
  setPredictions: (predictions: MLPrediction[]) => void;
  setIsRunning: (running: boolean) => void;
  setSelectedPair: (pair: string) => void;
  setSelectedTimeframe: (timeframe: string) => void;
  setMLTrained: (trained: boolean) => void;
  setValidationMetrics: (metrics: EnhancedValidationMetrics) => void;
  reset: () => void;
}

export const useTradingStore = create<TradingState>((set, get) => ({
  // Initial state
  candleData: [],
  patterns: [],
  predictions: [],
  isRunning: false,
  selectedPair: 'EUR/USD',
  selectedTimeframe: '5m',
  mlTrained: false,
  validationMetrics: null,

  // Actions
  setCandleData: (data) => set({ candleData: data }),
  
  addCandle: (candle) => set((state) => ({
    candleData: [...state.candleData, candle].slice(-200) // Keep last 200 candles
  })),
  
  setPatterns: (patterns) => set({ patterns }),
  
  setPredictions: (predictions) => set({ predictions }),
  
  setIsRunning: (running) => set({ isRunning: running }),
  
  setSelectedPair: (pair) => set({ selectedPair: pair }),
  
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  
  setMLTrained: (trained) => set({ mlTrained: trained }),
  
  setValidationMetrics: (metrics) => set({ validationMetrics: metrics }),
  
  reset: () => set({
    candleData: [],
    patterns: [],
    predictions: [],
    isRunning: false,
    mlTrained: false,
    validationMetrics: null
  })
}));

// Selectors para optimizar renders
export const selectCandleData = (state: TradingState) => state.candleData;
export const selectPatterns = (state: TradingState) => state.patterns;
export const selectPredictions = (state: TradingState) => state.predictions;
export const selectSystemState = (state: TradingState) => ({
  isRunning: state.isRunning,
  selectedPair: state.selectedPair,
  selectedTimeframe: state.selectedTimeframe,
  mlTrained: state.mlTrained
});
export const selectValidationMetrics = (state: TradingState) => state.validationMetrics;
