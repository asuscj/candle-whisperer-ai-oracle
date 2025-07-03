
# Documentación de API Interna - Trading AI

Esta documentación describe la API interna y los módulos principales del sistema Trading AI.

## 📚 Índice

1. [Tipos de Datos](#tipos-de-datos)
2. [Proveedores de Datos](#proveedores-de-datos)
3. [Detección de Patrones](#detección-de-patrones)
4. [Predicciones ML](#predicciones-ml)
5. [Sistema de Validación](#sistema-de-validación)
6. [Aprendizaje Online](#aprendizaje-online)
7. [Componentes React](#componentes-react)

## 🔧 Tipos de Datos

### CandleData
```typescript
/**
 * Datos básicos de una vela japonesa
 */
interface CandleData {
  timestamp: number;    // Unix timestamp en millisegundos
  open: number;        // Precio de apertura
  high: number;        // Precio máximo
  low: number;         // Precio mínimo
  close: number;       // Precio de cierre
  volume: number;      // Volumen de transacciones
}
```

### CandlePattern
```typescript
/**
 * Patrón de vela detectado
 */
interface CandlePattern {
  name: string;           // Nombre del patrón ('hammer', 'doji', 'engulfing')
  position: number;       // Índice de la vela en el array
  confidence: number;     // Confianza del patrón (0-1)
  type?: 'bullish' | 'bearish' | 'neutral';
  timestamp: number;      // Timestamp de detección
}
```

### MLPrediction
```typescript
/**
 * Predicción del modelo de Machine Learning
 */
interface MLPrediction {
  timestamp: number;      // Timestamp de la predicción
  value: number;         // Valor predicho
  confidence: number;    // Confianza (0-1)
  signal: 'buy' | 'sell' | 'hold';
  features?: number[];   // Features utilizadas
}
```

## 📈 Proveedores de Datos

### DataProvider (`src/utils/dataProvider.ts`)

#### `generateCandle(symbol: string, timeframe: string): CandleData`
```typescript
/**
 * Genera una vela simulada basada en parámetros del mercado
 * 
 * @param symbol - Par de trading (ej: 'EUR/USD')
 * @param timeframe - Marco temporal (ej: '1m', '5m', '1h')
 * @returns Nueva vela con datos OHLCV
 * 
 * @example
 * const candle = generateCandle('BTC/USD', '5m');
 * console.log(candle.close); // 45250.123
 */
```

#### `getHistoricalData(symbol: string, timeframe: string, count: number): Promise<CandleData[]>`
```typescript
/**
 * Genera datos históricos simulados
 * 
 * @param symbol - Par de trading
 * @param timeframe - Marco temporal
 * @param count - Número de velas a generar
 * @returns Array de velas históricas
 */
```

## 🔍 Detección de Patrones

### CandlePatterns (`src/utils/candlePatterns.ts`)

#### `detectHammer(candle: CandleData): CandlePattern | null`
```typescript
/**
 * Detecta patrón Hammer (Martillo)
 * 
 * Criterios:
 * - Sombra inferior > 2x el cuerpo
 * - Sombra superior < 10% del cuerpo
 * - Indica potencial reversión bullish
 * 
 * @param candle - Datos de la vela a analizar
 * @returns Patrón detectado o null
 * 
 * @example
 * const pattern = detectHammer(candleData);
 * if (pattern) {
 *   console.log(`Hammer detectado con confianza: ${pattern.confidence}`);
 * }
 */
```

#### `detectDoji(candle: CandleData): CandlePattern | null`
```typescript
/**
 * Detecta patrón Doji (Indecisión)
 * 
 * Criterios:
 * - Apertura ≈ Cierre (diferencia < 0.1% del rango)
 * - Indica indecisión del mercado
 * 
 * @param candle - Datos de la vela
 * @returns Patrón Doji o null
 */
```

#### `detectEngulfing(candles: CandleData[]): CandlePattern | null`
```typescript
/**
 * Detecta patrón Engulfing (Envolvente)
 * 
 * Criterios:
 * - Vela actual envuelve completamente la anterior
 * - Cambio de tendencia (bearish/bullish)
 * 
 * @param candles - Array de al menos 2 velas
 * @returns Patrón Engulfing o null
 */
```

#### `detectAllPatterns(candles: CandleData[]): CandlePattern[]`
```typescript
/**
 * Ejecuta detección de todos los patrones disponibles
 * 
 * @param candles - Array completo de velas
 * @returns Array de todos los patrones detectados
 */
```

## 🤖 Predicciones ML

### MLPredictor (`src/utils/mlPredictor.ts`)

#### `class MLPredictor`

##### `constructor(config?: MLPredictorConfig)`
```typescript
/**
 * Inicializa el predictor ML
 * 
 * @param config - Configuración opcional
 * @param config.learningRate - Tasa de aprendizaje (default: 0.01)
 * @param config.memorySize - Tamaño de memoria (default: 100)
 */
```

##### `predict(candles: CandleData[], patterns: CandlePattern[]): MLPrediction`
```typescript
/**
 * Genera predicción basada en velas y patrones
 * 
 * @param candles - Datos históricos de velas
 * @param patterns - Patrones detectados
 * @returns Predicción con valor, confianza y señal
 * 
 * @example
 * const predictor = new MLPredictor();
 * const prediction = predictor.predict(candles, patterns);
 * console.log(`Predicción: ${prediction.signal} (${prediction.confidence})`);
 */
```

##### `train(data: TrainingData[]): void`
```typescript
/**
 * Entrena el modelo con nuevos datos
 * 
 * @param data - Array de datos de entrenamiento
 * @param data[].features - Features de entrada
 * @param data[].target - Valor objetivo
 */
```

##### `updateModel(feedback: ModelFeedback): void`
```typescript
/**
 * Actualiza el modelo con retroalimentación
 * 
 * @param feedback - Resultado de validación
 * @param feedback.prediction - Predicción original
 * @param feedback.actual - Valor real observado
 * @param feedback.accuracy - Precisión calculada
 */
```

## ✅ Sistema de Validación

### EnhancedValidationSystem (`src/utils/enhancedValidationSystem.ts`)

#### `class ValidationSystem`

##### `addPrediction(prediction: MLPrediction): void`
```typescript
/**
 * Registra una predicción para validación futura
 * 
 * @param prediction - Predicción a validar
 */
```

##### `validatePredictions(currentCandles: CandleData[]): ValidationResult[]`
```typescript
/**
 * Valida predicciones pendientes contra datos reales
 * 
 * @param currentCandles - Datos actuales del mercado
 * @returns Array de resultados de validación
 * 
 * @example
 * const results = validationSystem.validatePredictions(candles);
 * results.forEach(result => {
 *   console.log(`Precisión: ${result.accuracy}%`);
 * });
 */
```

##### `getMetrics(): ValidationMetrics`
```typescript
/**
 * Obtiene métricas consolidadas de rendimiento
 * 
 * @returns Métricas de precisión y rendimiento
 * 
 * Interface ValidationMetrics:
 * - totalValidations: number
 * - correctPredictions: number
 * - priceAccuracy: number
 * - signalAccuracy: number
 * - trend: 'improving' | 'stable' | 'declining'
 */
```

## 📚 Aprendizaje Online

### EnhancedOnlineLearning (`src/utils/enhancedOnlineLearning.ts`)

#### `class OnlineLearningSystem`

##### `updateModel(candles: CandleData[], patterns: CandlePattern[], feedback?: ValidationResult): void`
```typescript
/**
 * Actualización incremental del modelo
 * 
 * @param candles - Nuevos datos de velas
 * @param patterns - Patrones detectados
 * @param feedback - Retroalimentación opcional de validación
 */
```

##### `getReservoirSample(): TrainingData[]`
```typescript
/**
 * Obtiene muestra representativa para entrenamiento
 * Utiliza algoritmo de Reservoir Sampling
 * 
 * @returns Muestra balanceada de datos históricos
 */
```

##### `adaptLearningRate(performance: number): void`
```typescript
/**
 * Ajusta dinámicamente la tasa de aprendizaje
 * 
 * @param performance - Rendimiento actual (0-1)
 */
```

## ⚛️ Componentes React

### TradingChart (`src/components/TradingChart.tsx`)

#### Props:
```typescript
interface TradingChartProps {
  data?: CandlestickData[];           // Datos legacy
  candles?: CandleData[];             // Datos de velas actuales
  patterns?: (CandlePattern | PatternDetection)[];  // Patrones a mostrar
  predictions?: MLPrediction[];       // Predicciones legacy
  prediction?: {                      // Predicción actual
    timestamp: number;
    value: number;
    confidence: number;
  };
}
```

#### Funcionalidades:
- Renderizado de gráfico de líneas para datos OHLC
- Overlay de patrones detectados con colores distintivos
- Tooltip personalizado con información detallada
- Líneas de referencia para predicciones ML

### MLDashboard (`src/components/MLDashboard.tsx`)

#### Props:
```typescript
interface MLDashboardProps {
  predictions?: MLPrediction[];
  accuracy?: number;
  isTraining?: boolean;
  onTrain?: () => void;
}
```

#### Funcionalidades:
- Visualización de métricas ML en tiempo real
- Panel de control para entrenamiento manual
- Indicadores de estado del modelo
- Historial de predicciones

### EnhancedValidationDashboard (`src/components/EnhancedValidationDashboard.tsx`)

#### Props:
```typescript
interface ValidationDashboardProps {
  validationResults?: ValidationResult[];
  metrics?: ValidationMetrics;
  isValidating?: boolean;
}
```

#### Funcionalidades:
- Dashboard completo de métricas de validación
- Gráficos de tendencia de precisión
- Análisis de conflictos entre patrones y ML
- Indicadores de estado del sistema

## 🔧 Utilidades de Configuración

### Configuración por Defecto:

```typescript
// Configuración del sistema de aprendizaje
export const LEARNING_CONFIG = {
  reservoirSize: 1000,        // Tamaño del buffer circular
  slidingWindow: 50,          // Ventana para métricas móviles
  learningRate: 0.01,         // Tasa de aprendizaje inicial
  validationDelay: 5,         // Velas para validar predicciones
  confidenceThreshold: 0.7,   // Umbral mínimo de confianza
  patternWeight: 0.3,         // Peso de patrones tradicionales
  mlWeight: 0.7               // Peso de predicciones ML
};

// Configuración de detección de patrones
export const PATTERN_CONFIG = {
  hammer: {
    shadowRatio: 2.0,         // Ratio mínimo sombra/cuerpo
    bodyRatio: 0.3            // Ratio máximo cuerpo/rango
  },
  doji: {
    bodyThreshold: 0.001,     // Umbral absoluto para cuerpo
    relativeTolerance: 0.1    // Tolerancia relativa
  },
  engulfing: {
    minimumOverlap: 0.9,      // Superposición mínima requerida
    volumeWeight: 0.2         // Peso del factor volumen
  }
};
```

## 🧪 Testing y Debugging

### Funciones de Debug:

```typescript
// Habilitar logs detallados
localStorage.setItem('trading-debug', 'true');

// Acceder al estado global (en browser console)
window.tradingSystem = {
  candles: CandleData[],
  patterns: CandlePattern[],
  predictions: MLPrediction[],
  metrics: ValidationMetrics
};

// Logs de sistema
console.log('Sistema Estado:', window.tradingSystem);
```

### Métricas de Performance:

```typescript
// Tiempo de procesamiento
console.time('Pattern Detection');
const patterns = detectAllPatterns(candles);
console.timeEnd('Pattern Detection');

// Memoria utilizada
console.log('Heap:', performance.memory?.usedJSHeapSize);
```

---

## 📞 Soporte

Para dudas sobre la API interna:
1. Revisar esta documentación
2. Consultar tests unitarios en `src/utils/__tests__/`
3. Revisar implementaciones de ejemplo en `src/pages/Index.tsx`
4. Abrir issue en el repositorio con detalles específicos

**Última actualización:** 2025-07-03
