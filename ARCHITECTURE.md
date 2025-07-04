
# 🏗️ Arquitectura del Sistema - Trading AI

Esta documentación describe la arquitectura técnica del proyecto Trading AI.

## 📊 Visión General

Trading AI es una aplicación web de análisis técnico y predicción de mercados construida con React, TypeScript y tecnologías modernas de ML client-side.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   ML Engine     │    │   Data Layer    │
│   (React/TS)    ├────┤   (Client-side) ├────┤   (Simulated)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗂️ Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── TradingChart.tsx
│   ├── PatternDetector.tsx
│   └── MLDashboard.tsx
├── hooks/              # Custom hooks
│   ├── use-toast.ts
│   └── useSlidingWindowOHLC.ts
├── pages/              # Páginas principales
│   ├── Index.tsx
│   └── NotFound.tsx
├── store/              # Estado global (Zustand)
│   └── tradingStore.ts
├── types/              # Definiciones TypeScript
│   └── trading.ts
├── utils/              # Utilidades y lógica de negocio
│   ├── dataProvider.ts
│   ├── candlePatterns.ts
│   ├── mlPredictor.ts
│   └── validationSystem.ts
└── test/               # Configuración de tests
    └── setup.ts
```

## 🔄 Flujo de Datos

### 1. Generación de Datos
```
DataProvider → CandlestickData[] → TradingStore
```
- Genera datos OHLC simulados realistas
- Mantiene coherencia temporal y volatilidad
- Soporta diferentes timeframes

### 2. Detección de Patrones
```
CandlestickData[] → CandlePatternDetector → PatternDetection[]
```
- Analiza velas en busca de patrones conocidos
- Detecta: Hammer, Doji, Engulfing, etc.
- Calcula confianza y señales de trading

### 3. Predicción ML
```
HistoricalData → MLPredictor → Prediction + Confidence
```
- Entrena modelo con datos históricos
- Genera predicciones de precio futuro
- Sistema de validación automática

### 4. Visualización
```
Data + Patterns + Predictions → TradingChart → UI
```
- Renderiza gráficos interactivos
- Overlay de patrones detectados
- Indicadores de predicción ML

## 🧠 Motor de Machine Learning

### Arquitectura del Modelo
```typescript
interface MLModel {
  features: number[];      // Características extraídas
  weights: number[][];     // Pesos del modelo
  biases: number[];        // Sesgos
  layers: number[];        // Arquitectura de capas
}
```

### Pipeline de Entrenamiento
1. **Extracción de Features**
   - OHLC normalizados
   - RSI, MACD, Bollinger Bands
   - Volatilidad y volumen
   - Patrones técnicos

2. **Preparación de Datos**
   - Normalización Z-score
   - Sliding window approach
   - Train/validation split

3. **Entrenamiento**
   - Backpropagation
   - Adam optimizer
   - Early stopping
   - Cross-validation

### Validación del Modelo
- Sistema de validación deslizante
- Métricas de precisión por timeframe
- Validación out-of-sample
- Feedback loop para mejora continua

## 🎯 Patrones de Diseño Utilizados

### 1. Observer Pattern
```typescript
// TradingStore (Zustand)
const useTradingStore = create<TradingState>((set, get) => ({
  candles: [],
  patterns: [],
  predictions: [],
  // ...
}));
```

### 2. Strategy Pattern
```typescript
// Pattern Detection
interface PatternDetector {
  detect(candles: CandlestickData[]): PatternDetection[];
}

class HammerDetector implements PatternDetector { /* ... */ }
class DojiDetector implements PatternDetector { /* ... */ }
```

### 3. Factory Pattern
```typescript
// Data Generation
class DataProviderFactory {
  static create(type: 'forex' | 'crypto' | 'stocks'): DataProvider {
    // Factory logic
  }
}
```

## 📊 Gestión del Estado

### Estado Global (Zustand)
```typescript
interface TradingState {
  // Data
  candles: CandlestickData[];
  patterns: PatternDetection[];
  predictions: MLPrediction[];
  
  // UI State
  isGenerating: boolean;
  selectedTimeframe: string;
  selectedPair: string;
  
  // Actions
  generateData: () => void;
  detectPatterns: () => void;
  makePrediction: () => void;
}
```

### Estado Local (React Hooks)
- Formularios con `useState`
- Efectos con `useEffect`
- Custom hooks para lógica reutilizable

## 🔌 Integraciones

### APIs Externas (Opcionales)
```typescript
// Configurables via variables de entorno
const API_CONFIGS = {
  alphaVantage: process.env.VITE_ALPHA_VANTAGE_API_KEY,
  finnhub: process.env.VITE_FINNHUB_API_KEY,
  iexCloud: process.env.VITE_IEX_CLOUD_API_KEY,
};
```

### Librerías Principales
- **React 18**: Componentes y hooks
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling system
- **Recharts**: Gráficos y visualizaciones
- **Zustand**: Estado global
- **React Query**: Data fetching (futuro)

## 🧪 Testing Strategy

### Pirámide de Testing
```
    /\     E2E Tests (Playwright)
   /  \    
  /____\   Integration Tests (React Testing Library)
 /______\  Unit Tests (Vitest)
```

### Coverage Targets
- **Unit Tests**: >80% coverage
- **Integration**: Flujos críticos
- **E2E**: User journeys principales

## 🚀 Performance

### Optimizaciones Implementadas
1. **React.memo** para componentes pesados
2. **useMemo/useCallback** para cálculos costosos
3. **Lazy loading** de componentes
4. **Debouncing** en inputs de usuario
5. **Virtual scrolling** para listas largas

### Métricas Objetivo
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

## 🔒 Seguridad

### Client-Side Security
- Sanitización de inputs
- Validación de tipos TypeScript
- CSP headers configurados
- No almacenamiento de datos sensibles

### API Keys Management
- Variables de entorno
- No exposición en bundle
- Rotación recomendada

## 📈 Escalabilidad

### Horizontal Scaling
- Arquitectura stateless
- CDN para assets estáticos
- Edge computing compatible

### Vertical Scaling
- Lazy loading de módulos
- Code splitting por rutas
- Tree shaking automático

## 🔮 Roadmap Técnico

### Corto Plazo
- [ ] WebWorkers para ML processing
- [ ] IndexedDB para cache persistente
- [ ] PWA capabilities

### Medio Plazo
- [ ] WebAssembly para cálculos intensivos
- [ ] Real-time data streaming
- [ ] Multi-threading support

### Largo Plazo
- [ ] Edge AI deployment
- [ ] Blockchain integration
- [ ] Mobile app (React Native)

---

Esta arquitectura está diseñada para ser escalable, mantenible y performante, siguiendo las mejores prácticas de desarrollo moderno.
