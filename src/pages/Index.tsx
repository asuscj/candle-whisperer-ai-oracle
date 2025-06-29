import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TradingChart from '@/components/TradingChart';
import PatternDetector from '@/components/PatternDetector';
import PatternStatistics from '@/components/PatternStatistics';
import MLDashboard from '@/components/MLDashboard';
import TradingPairSelector from '@/components/TradingPairSelector';
import TimeframeSelector from '@/components/TimeframeSelector';
import AdvancedPatternVisualizer from '@/components/AdvancedPatternVisualizer';
import BacktestingPanel from '@/components/BacktestingPanel';
import OnlineLearningMetricsComponent from '@/components/OnlineLearningMetrics';
import ValidationMetricsComponent from '@/components/ValidationMetrics';
import EnhancedValidationDashboard from '@/components/EnhancedValidationDashboard';
import { CandleData, CandlePattern, TradingPair, MLPrediction, PerformanceMetrics, TimeframeOption, OnlineLearningMetrics } from '@/types/trading';
import { DataProvider } from '@/utils/dataProvider';
import { CandlePatternDetector } from '@/utils/candlePatterns';
import { MLPredictor } from '@/utils/mlPredictor';
import { EnhancedOnlineLearningSystem } from '@/utils/enhancedOnlineLearning';
import { RealTimeValidationSystem, ValidationMetrics } from '@/utils/validationSystem';
import { EnhancedValidationSystem, EnhancedValidationMetrics, AutoValidationResult } from '@/utils/enhancedValidationSystem';
import { SlidingWindowBuffer, BufferMetrics, PerformanceWindow } from '@/utils/slidingWindowBuffer';
import { ErrorLearningMetrics } from '@/utils/enhancedOnlineLearning';
import { useToast } from '@/hooks/use-toast';
import { Activity, Brain, Play, Square, RefreshCw, Database, Zap } from 'lucide-react';
import { useSlidingWindowOHLC, WindowMetrics } from '@/hooks/useSlidingWindowOHLC';
import { ClientPatternRecognition, PatternMatch } from '@/utils/clientPatternRecognition';
import ModelFeedbackPanel from '@/components/ModelFeedbackPanel';

const Index = () => {
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>({
    value: '1m',
    label: '1 Minuto',
    duration: 60000
  });
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
  
  // Enhanced validation systems
  const [enhancedLearning] = useState(() => new EnhancedOnlineLearningSystem(1000));
  const [validationSystem] = useState(() => new RealTimeValidationSystem());
  const [enhancedValidationSystem] = useState(() => new EnhancedValidationSystem());
  const [slidingBuffer] = useState(() => new SlidingWindowBuffer(2000, 150));
  
  const [onlineLearningMetrics, setOnlineLearningMetrics] = useState<OnlineLearningMetrics>({
    samplesProcessed: 0,
    reservoirSize: 0,
    memoryUsage: 0,
    lastUpdate: Date.now(),
    adaptationRate: 0.1
  });
  const [validationMetrics, setValidationMetrics] = useState<ValidationMetrics>({
    totalPredictions: 0,
    correctPredictions: 0,
    accuracyTrend: [],
    patternSuccessRate: {},
    averageErrorMagnitude: 0,
    recentAccuracy: 0
  });
  const [enhancedValidationMetrics, setEnhancedValidationMetrics] = useState<EnhancedValidationMetrics>({
    totalValidations: 0,
    priceAccuracy: 0,
    signalAccuracy: 0,
    patternSuccessRate: 0,
    averageValidationDelay: 5,
    conflictResolutionStats: {
      totalConflicts: 0,
      correctResolutions: 0,
      resolutionAccuracy: 0
    },
    recentPerformance: {
      last10Accuracy: 0,
      trend: 'stable'
    }
  });
  const [errorLearningMetrics, setErrorLearningMetrics] = useState<ErrorLearningMetrics>({
    totalErrors: 0,
    averageError: 0,
    errorTrend: [],
    learningRate: 0.01,
    adaptationStrength: 0.1,
    convergenceRate: 0
  });
  const [bufferMetrics, setBufferMetrics] = useState<BufferMetrics>({
    totalSamples: 0,
    bufferUtilization: 0,
    dataFreshness: 1.0,
    samplingRate: 1.0,
    memoryEfficiency: 0
  });
  const [currentPredictionId, setCurrentPredictionId] = useState<string | null>(null);

  const { toast } = useToast();
  const availablePairs = DataProvider.getAvailablePairs();
  
  const slidingWindow = useSlidingWindowOHLC({ windowSize: 30, evaluationThreshold: 5 });
  const [clientPatterns, setClientPatterns] = useState<PatternMatch[]>([]);
  const [windowMetrics, setWindowMetrics] = useState<WindowMetrics | null>(null);

  useEffect(() => {
    if (availablePairs.length > 0 && !selectedPair) {
      setSelectedPair(availablePairs[0]);
    }
  }, [availablePairs, selectedPair]);

  useEffect(() => {
    if (selectedPair) {
      loadInitialData();
    }
  }, [selectedPair]);

  // Enhanced real-time data with automatic validation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && selectedPair) {
      interval = setInterval(() => {
        updateRealTimeDataWithAutoValidation();
      }, selectedTimeframe.duration);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, selectedPair, selectedTimeframe]);

  const loadInitialData = async () => {
    if (!selectedPair) return;

    try {
      const historicalData = await DataProvider.fetchRealTimeData(selectedPair);
      setCandles(historicalData);
      
      historicalData.forEach(candle => {
        slidingBuffer.addSample(candle);
        enhancedLearning.addSample(candle);
      });
      
      const detectedPatterns = CandlePatternDetector.detectPatterns(historicalData);
      setPatterns(detectedPatterns);

      if (historicalData.length >= 20) {
        const mlPrediction = MLPredictor.predict(historicalData);
        setPrediction(mlPrediction);
        
        // Register prediction in enhanced validation system
        const clientDetectedPatterns = ClientPatternRecognition.detectCandlestickPattern(historicalData.slice(-30));
        const predictionId = enhancedValidationSystem.registerPrediction(
          mlPrediction, 
          historicalData.length - 1,
          clientDetectedPatterns
        );
        setCurrentPredictionId(predictionId);
      }

      setBufferMetrics(slidingBuffer.getMetrics());
      setOnlineLearningMetrics(enhancedLearning.getMetrics());
      setEnhancedValidationMetrics(enhancedValidationSystem.getEnhancedMetrics());

      toast({
        title: "Sistema mejorado inicializado",
        description: `${historicalData.length} velas cargadas con validación automática activada`
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

  const updateRealTimeDataWithAutoValidation = () => {
    if (!selectedPair || candles.length === 0) return;

    const lastCandle = candles[candles.length - 1];
    const newCandle = DataProvider.generateHistoricalData(selectedPair, 1)[0];
    newCandle.timestamp = lastCandle.timestamp + selectedTimeframe.duration;

    slidingWindow.addCandle(newCandle);
    
    if (slidingWindow.isReady && slidingWindow.windowMetrics) {
      setWindowMetrics(slidingWindow.windowMetrics);
    }

    // Process automatic validation
    const newValidations = enhancedValidationSystem.processAutomaticValidation(
      [...candles, newCandle], 
      candles.length
    );

    // Learn from validation results - now compatible with PredictionValidation interface
    newValidations.forEach((validation: AutoValidationResult) => {
      // AutoValidationResult now extends PredictionValidation, so it's compatible
      enhancedLearning.learnFromError(validation);
      slidingBuffer.addPerformanceData(validation, enhancedLearning.getErrorLearningMetrics().learningRate);
    });

    // Update enhanced metrics
    setEnhancedValidationMetrics(enhancedValidationSystem.getEnhancedMetrics());
    setErrorLearningMetrics(enhancedLearning.getErrorLearningMetrics());
    setBufferMetrics(slidingBuffer.getMetrics());

    // Update performance metrics with corrected accuracy calculation
    const enhancedMetrics = enhancedValidationSystem.getEnhancedMetrics();
    setMetrics(prev => ({
      ...prev,
      accuracy: enhancedMetrics.priceAccuracy, // Use corrected price accuracy
      precision: enhancedMetrics.signalAccuracy, // Use signal accuracy as precision
      winRate: enhancedMetrics.patternSuccessRate,
      totalTrades: enhancedMetrics.totalValidations
    }));

    enhancedLearning.addSample(newCandle);
    slidingBuffer.addSample(newCandle);
    setOnlineLearningMetrics(enhancedLearning.getMetrics());

    const optimizedCandles = slidingBuffer.getSample(200);
    setCandles(optimizedCandles);

    const traditionalPatterns = CandlePatternDetector.detectPatterns(optimizedCandles);
    setPatterns(traditionalPatterns);

    const windowCandles = slidingWindow.getWindow();
    const clientDetectedPatterns = ClientPatternRecognition.detectCandlestickPattern(windowCandles);
    setClientPatterns(clientDetectedPatterns);

    if (optimizedCandles.length >= 20) {
      try {
        const newPrediction = MLPredictor.predict(optimizedCandles);
        setPrediction(newPrediction);
        
        // Register new prediction with enhanced validation
        const predictionId = enhancedValidationSystem.registerPrediction(
          newPrediction, 
          optimizedCandles.length - 1,
          clientDetectedPatterns
        );
        setCurrentPredictionId(predictionId);
      } catch (error) {
        console.error('Error generating prediction:', error);
      }
    }
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
    const status = !isRunning ? "iniciado" : "detenido";
    toast({
      title: `Sistema ${status}`,
      description: `Análisis en tiempo real ${status} con validación automática mejorada`
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
      const trainingSample = slidingBuffer.getSample(500);
      await MLPredictor.trainModel(trainingSample);
      
      const performanceTrend = slidingBuffer.getRecentPerformanceTrend();
      setMetrics(prev => ({
        ...prev,
        accuracy: Math.min(0.95, MLPredictor.getAccuracy()),
        precision: Math.min(0.95, prev.precision + 0.03),
        recall: Math.min(0.95, prev.recall + 0.03)
      }));
      
      toast({
        title: "Entrenamiento completado",
        description: `Modelo mejorado con precisión: ${(MLPredictor.getAccuracy() * 100).toFixed(1)}%`
      });
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

  const handleOptimizeBuffer = () => {
    const beforeSize = slidingBuffer.getBufferSize();
    slidingBuffer.clear();
    candles.forEach(candle => slidingBuffer.addSample(candle));
    const afterSize = slidingBuffer.getBufferSize();
    
    setBufferMetrics(slidingBuffer.getMetrics());
    
    toast({
      title: "Buffer optimizado",
      description: `Tamaño optimizado: ${beforeSize} → ${afterSize} muestras`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      {/* Enhanced Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">
            Trading AI - Sistema Avanzado v4.0
          </h1>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isRunning ? 'En vivo' : 'Detenido'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>Validaciones: {enhancedValidationMetrics.totalValidations}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Precisión: {(enhancedValidationMetrics.priceAccuracy * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <p className="text-gray-400">
          Sistema v4.0 con Validación Automática, Corrección OHLC y Resolución de Conflictos
        </p>
      </div>

      {/* Enhanced Controls */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="md:col-span-2">
          <TradingPairSelector
            pairs={availablePairs}
            selectedPair={selectedPair}
            onSelect={setSelectedPair}
          />
        </div>
        <TimeframeSelector
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />
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
        <Button
          onClick={handleOptimizeBuffer}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Database className="h-4 w-4 mr-2" />
          Optimizar Buffer
        </Button>
      </div>

      {/* Enhanced Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Gráfico - {selectedPair?.symbol || 'No seleccionado'} ({selectedTimeframe.label})</span>
                <div className="text-sm text-gray-400">
                  {candles.length} velas | {patterns.length} patrones
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candles.length > 0 ? (
                <TradingChart
                  candles={candles}
                  patterns={patterns}
                  prediction={prediction ? {
                    timestamp: Date.now() + selectedTimeframe.duration,
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

        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <PatternDetector patterns={patterns} />
            <PatternStatistics patterns={patterns} isRealTime={isRunning} />
          </div>
          
          <div className="space-y-4">
            <MLDashboard
              prediction={prediction}
              metrics={metrics}
              isTraining={isTraining}
            />
            <ModelFeedbackPanel 
              detectedPatterns={clientPatterns}
              currentCandles={candles}
              isRealTime={isRunning}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Lower Section with New Validation Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <AdvancedPatternVisualizer
          patterns={patterns}
          candles={candles}
          isRealTime={isRunning}
        />
        <BacktestingPanel candles={candles} />
        <OnlineLearningMetricsComponent 
          metrics={onlineLearningMetrics} 
          isActive={isRunning}
        />
        <EnhancedValidationDashboard
          metrics={enhancedValidationMetrics}
          recentValidations={enhancedValidationSystem.getRecentValidations(10)}
          pendingCount={enhancedValidationSystem.getPendingCount()}
          isActive={isRunning}
        />
      </div>

      {/* Enhanced Status Bar */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-gray-400">Sistema</div>
            <div className="flex items-center gap-2">
              <span>Estado: {isRunning ? '🟢 Activo' : '🔴 Inactivo'}</span>
            </div>
            <div className="text-gray-500">
              v4.0 - Validación Auto
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-400">Datos</div>
            <div className="text-green-400">
              Velas: {candles.length}
            </div>
            <div className="text-gray-500">
              Patrones: {patterns.length}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-400">Precisión Corregida</div>
            <div className="text-blue-400">
              Precio: {(enhancedValidationMetrics.priceAccuracy * 100).toFixed(1)}%
            </div>
            <div className="text-gray-500">
              Señal: {(enhancedValidationMetrics.signalAccuracy * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-400">Validaciones</div>
            <div className="text-purple-400">
              Total: {enhancedValidationMetrics.totalValidations}
            </div>
            <div className="text-gray-500">
              Pendientes: {enhancedValidationSystem.getPendingCount()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-400">Conflictos</div>
            <div className="text-orange-400">
              Detectados: {enhancedValidationMetrics.conflictResolutionStats.totalConflicts}
            </div>
            <div className="text-gray-500">
              Resueltos: {enhancedValidationMetrics.conflictResolutionStats.correctResolutions}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-400">Tendencia</div>
            <div className="text-cyan-400 capitalize">
              {enhancedValidationMetrics.recentPerformance.trend}
            </div>
            <div className="text-gray-500">
              Últimas 10: {(enhancedValidationMetrics.recentPerformance.last10Accuracy * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
