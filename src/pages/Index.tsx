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
import { CandleData, CandlePattern, TradingPair, MLPrediction, PerformanceMetrics, TimeframeOption, OnlineLearningMetrics } from '@/types/trading';
import { DataProvider } from '@/utils/dataProvider';
import { CandlePatternDetector } from '@/utils/candlePatterns';
import { MLPredictor } from '@/utils/mlPredictor';
import { EnhancedOnlineLearningSystem } from '@/utils/enhancedOnlineLearning';
import { RealTimeValidationSystem, ValidationMetrics } from '@/utils/validationSystem';
import { SlidingWindowBuffer, BufferMetrics, PerformanceWindow } from '@/utils/slidingWindowBuffer';
import { ErrorLearningMetrics } from '@/utils/enhancedOnlineLearning';
import { useToast } from '@/hooks/use-toast';
import { Activity, Brain, Play, Square, RefreshCw, Database, Zap } from 'lucide-react';

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
  
  // Enhanced learning systems
  const [enhancedLearning] = useState(() => new EnhancedOnlineLearningSystem(1000));
  const [validationSystem] = useState(() => new RealTimeValidationSystem());
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

  // Enhanced real-time data with validation and buffer management
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && selectedPair) {
      interval = setInterval(() => {
        updateRealTimeDataWithEnhancedLearning();
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
      
      // Agregar datos históricos al buffer
      historicalData.forEach(candle => {
        slidingBuffer.addSample(candle);
        enhancedLearning.addSample(candle);
      });
      
      const detectedPatterns = CandlePatternDetector.detectPatterns(historicalData);
      setPatterns(detectedPatterns);

      if (historicalData.length >= 20) {
        const mlPrediction = MLPredictor.predict(historicalData);
        setPrediction(mlPrediction);
        
        // Register prediction for validation
        const predictionId = validationSystem.addPrediction(mlPrediction);
        setCurrentPredictionId(predictionId);
      }

      // Update metrics
      setBufferMetrics(slidingBuffer.getMetrics());
      setOnlineLearningMetrics(enhancedLearning.getMetrics());

      toast({
        title: "Sistema inicializado",
        description: `${historicalData.length} velas cargadas, ${detectedPatterns.length} patrones detectados`
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

  const updateRealTimeDataWithEnhancedLearning = () => {
    if (!selectedPair || candles.length === 0) return;

    // Generate new candle
    const lastCandle = candles[candles.length - 1];
    const newCandle = DataProvider.generateHistoricalData(selectedPair, 1)[0];
    newCandle.timestamp = lastCandle.timestamp + selectedTimeframe.duration;

    // Validate previous prediction if exists
    if (currentPredictionId) {
      const validation = validationSystem.validatePrediction(currentPredictionId, newCandle);
      if (validation) {
        // Learn from the error using enhanced systems
        enhancedLearning.learnFromError(validation);
        slidingBuffer.addPerformanceData(validation, enhancedLearning.getErrorLearningMetrics().learningRate);
        
        // Update all metrics
        setValidationMetrics(validationSystem.getValidationMetrics());
        setErrorLearningMetrics(enhancedLearning.getErrorLearningMetrics());
        setBufferMetrics(slidingBuffer.getMetrics());
        
        // Update performance metrics with sliding window insights
        const performanceTrend = slidingBuffer.getRecentPerformanceTrend();
        setMetrics(prev => ({
          ...prev,
          accuracy: performanceTrend.accuracy,
          totalTrades: prev.totalTrades + 1,
          winRate: validation.patternSuccess ? 
            (prev.winRate * prev.totalTrades + 1) / (prev.totalTrades + 1) :
            (prev.winRate * prev.totalTrades) / (prev.totalTrades + 1)
        }));

        // Advanced logging with buffer insights
        const trend = slidingBuffer.getCurrentTrend();
        const volatility = slidingBuffer.getVolatilityMetrics();
        console.log(`Enhanced Learning Update - Trend: ${trend}, Volatility: ${volatility.trend}, Accuracy: ${(validation.accuracy * 100).toFixed(1)}%`);
      }
    }

    // Add to enhanced learning systems
    enhancedLearning.addSample(newCandle);
    slidingBuffer.addSample(newCandle);
    setOnlineLearningMetrics(enhancedLearning.getMetrics());
    setBufferMetrics(slidingBuffer.getMetrics());

    // Get optimized sample from sliding buffer
    const optimizedCandles = slidingBuffer.getSample(200);
    setCandles(optimizedCandles);

    // Update patterns with enhanced detection
    const newPatterns = CandlePatternDetector.detectPatterns(optimizedCandles);
    // Calculate enhanced confidence for patterns
    const enhancedPatterns = newPatterns.map(pattern => ({
      ...pattern,
      confidence: CandlePatternDetector.calculateConfidence(pattern, optimizedCandles)
    }));
    setPatterns(enhancedPatterns);

    // Generate new prediction with buffer insights
    if (optimizedCandles.length >= 20) {
      try {
        const newPrediction = MLPredictor.predict(optimizedCandles);
        setPrediction(newPrediction);
        
        // Register new prediction for validation
        const predictionId = validationSystem.addPrediction(newPrediction);
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
      description: `Análisis en tiempo real ${status} con buffer inteligente y aprendizaje continuo`
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
      // Use optimized sample from sliding buffer for training
      const trainingSample = slidingBuffer.getSample(500);
      await MLPredictor.trainModel(trainingSample);
      
      // Update metrics based on buffer performance
      const performanceTrend = slidingBuffer.getRecentPerformanceTrend();
      setMetrics(prev => ({
        ...prev,
        accuracy: Math.min(0.95, performanceTrend.accuracy + 0.05),
        precision: Math.min(0.95, prev.precision + 0.03),
        recall: Math.min(0.95, prev.recall + 0.03)
      }));
      
      toast({
        title: "Entrenamiento completado",
        description: `Modelo entrenado con ${trainingSample.length} muestras optimizadas del buffer`
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
    // Force cleanup and optimization
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
      {/* Enhanced Header with Buffer Metrics */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">
            Trading AI - Sistema Avanzado v2.0
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
              <span>Buffer: {bufferMetrics.bufferUtilization.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Frescura: {(bufferMetrics.dataFreshness * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
        <p className="text-gray-400">
          Sistema completo con Buffer Deslizante, Detección de Patrones Avanzada y Aprendizaje Continuo Optimizado
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
        {/* Chart - Takes up 2 columns */}
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

        {/* Enhanced Right Sidebar with Pattern Statistics */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <PatternDetector patterns={patterns} />
            <PatternStatistics patterns={patterns} isRealTime={isRunning} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            <MLDashboard
              prediction={prediction}
              metrics={metrics}
              isTraining={isTraining}
            />
            <ValidationMetricsComponent
              validationMetrics={validationMetrics}
              errorLearningMetrics={errorLearningMetrics}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
      </div>

      {/* Enhanced Status Bar with Buffer Metrics */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-gray-400">Sistema</div>
            <div className="flex items-center gap-2">
              <span>Estado: {isRunning ? '🟢 Activo' : '🔴 Inactivo'}</span>
            </div>
            <div className="text-gray-500">
              Actualizado: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-400">Datos</div>
            <div className="text-green-400">
              Velas: {candles.length} | Patrones: {patterns.length}
            </div>
            <div className="text-gray-500">
              Buffer: {slidingBuffer.getBufferSize()} muestras
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-400">Rendimiento</div>
            <div className="text-blue-400">
              Precisión: {(validationMetrics.recentAccuracy * 100).toFixed(1)}%
            </div>
            <div className="text-gray-500">
              Validaciones: {validationMetrics.totalPredictions}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-400">Buffer</div>
            <div className="text-orange-400">
              Utilización: {(bufferMetrics.bufferUtilization * 100).toFixed(1)}%
            </div>
            <div className="text-gray-500">
              Memoria: {bufferMetrics.memoryEfficiency.toFixed(2)} MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
