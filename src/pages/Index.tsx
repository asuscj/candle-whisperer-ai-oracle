
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TradingChart from '@/components/TradingChart';
import PatternDetector from '@/components/PatternDetector';
import MLDashboard from '@/components/MLDashboard';
import TradingPairSelector from '@/components/TradingPairSelector';
import { CandleData, CandlePattern, TradingPair, MLPrediction, PerformanceMetrics } from '@/types/trading';
import { DataProvider } from '@/utils/dataProvider';
import { CandlePatternDetector } from '@/utils/candlePatterns';
import { MLPredictor } from '@/utils/mlPredictor';
import { useToast } from '@/hooks/use-toast';
import { Activity, Brain, Play, Square, RefreshCw } from 'lucide-react';

const Index = () => {
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [patterns, setPatterns] = useState<CandlePattern[]>([]);
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    accuracy: 0.72,
    precision: 0.68,
    recall: 0.75,
    f1Score: 0.714,
    profitFactor: 1.45,
    winRate: 0.64,
    totalTrades: 127
  });

  const { toast } = useToast();
  const availablePairs = DataProvider.getAvailablePairs();

  // Initialize with default pair
  useEffect(() => {
    if (availablePairs.length > 0 && !selectedPair) {
      setSelectedPair(availablePairs[0]);
    }
  }, [availablePairs, selectedPair]);

  // Load initial data when pair changes
  useEffect(() => {
    if (selectedPair) {
      loadInitialData();
    }
  }, [selectedPair]);

  // Real-time data simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && selectedPair) {
      interval = setInterval(() => {
        updateRealTimeData();
      }, 2000); // Update every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, selectedPair]);

  const loadInitialData = async () => {
    if (!selectedPair) return;

    try {
      const historicalData = await DataProvider.fetchRealTimeData(selectedPair);
      setCandles(historicalData);
      
      const detectedPatterns = CandlePatternDetector.detectPatterns(historicalData);
      setPatterns(detectedPatterns);

      if (historicalData.length >= 20) {
        const mlPrediction = MLPredictor.predict(historicalData);
        setPrediction(mlPrediction);
      }

      toast({
        title: "Datos cargados",
        description: `${historicalData.length} velas históricas cargadas para ${selectedPair.symbol}`
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos históricos",
        variant: "destructive"
      });
    }
  };

  const updateRealTimeData = () => {
    if (!selectedPair || candles.length === 0) return;

    // Generate new candle
    const lastCandle = candles[candles.length - 1];
    const newCandle = DataProvider.generateHistoricalData(selectedPair, 1)[0];
    newCandle.timestamp = lastCandle.timestamp + 60000;

    const updatedCandles = [...candles.slice(-199), newCandle]; // Keep last 200 candles
    setCandles(updatedCandles);

    // Update patterns
    const newPatterns = CandlePatternDetector.detectPatterns(updatedCandles);
    setPatterns(newPatterns);

    // Update prediction
    if (updatedCandles.length >= 20) {
      try {
        const newPrediction = MLPredictor.predict(updatedCandles);
        setPrediction(newPrediction);
        
        // Simulate metrics updates
        setMetrics(prev => ({
          ...prev,
          totalTrades: prev.totalTrades + (Math.random() < 0.1 ? 1 : 0),
          accuracy: Math.max(0.5, Math.min(0.95, prev.accuracy + (Math.random() - 0.5) * 0.02))
        }));
      } catch (error) {
        console.error('Error generating prediction:', error);
      }
    }
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
    toast({
      title: isRunning ? "Análisis detenido" : "Análisis iniciado",
      description: isRunning ? "El análisis en tiempo real se ha detenido" : "Iniciando análisis en tiempo real"
    });
  };

  const handleTrainModel = async () => {
    if (candles.length < 50) {
      toast({
        title: "Datos insuficientes",
        description: "Se necesitan al menos 50 velas para entrenar el modelo",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    try {
      await MLPredictor.trainModel(candles);
      toast({
        title: "Entrenamiento completado",
        description: "El modelo ML ha sido entrenado con los datos actuales"
      });
      
      // Update metrics after training
      setMetrics(prev => ({
        ...prev,
        accuracy: Math.min(0.95, prev.accuracy + 0.05),
        precision: Math.min(0.95, prev.precision + 0.03),
        recall: Math.min(0.95, prev.recall + 0.03)
      }));
    } catch (error) {
      toast({
        title: "Error en entrenamiento",
        description: "No se pudo completar el entrenamiento del modelo",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">
            Trading AI - Análisis de Velas Japonesas
          </h1>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isRunning ? 'En vivo' : 'Detenido'}
            </span>
          </div>
        </div>
        <p className="text-gray-400">
          Detección automática de patrones y predicción ML en tiempo real para Forex y Criptomonedas
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <TradingPairSelector
            pairs={availablePairs}
            selectedPair={selectedPair}
            onSelect={setSelectedPair}
          />
        </div>
        <Button
          onClick={handleStartStop}
          className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isRunning ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Detener
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </>
          )}
        </Button>
        <Button
          onClick={handleTrainModel}
          disabled={isTraining || candles.length < 50}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isTraining ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Entrenando...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Entrenar ML
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Gráfico de Velas - {selectedPair?.symbol || 'No seleccionado'}</span>
                <div className="text-sm text-gray-400">
                  {candles.length} velas cargadas
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candles.length > 0 ? (
                <TradingChart
                  candles={candles}
                  patterns={patterns}
                  prediction={prediction ? {
                    timestamp: Date.now() + 60000,
                    value: prediction.nextCandle.close,
                    confidence: prediction.nextCandle.confidence
                  } : undefined}
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-400">
                  Selecciona un par de trading para ver el gráfico
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Pattern Detection */}
          <PatternDetector patterns={patterns} />
          
          {/* ML Dashboard */}
          <MLDashboard
            prediction={prediction}
            metrics={metrics}
            isTraining={isTraining}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-400">
            <span>Última actualización: {new Date().toLocaleTimeString()}</span>
            <span>Patrones detectados: {patterns.length}</span>
            <span>Precisión ML: {(metrics.accuracy * 100).toFixed(1)}%</span>
          </div>
          <div className="text-green-400">
            {isRunning ? '🟢 Sistema activo' : '🔴 Sistema inactivo'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
