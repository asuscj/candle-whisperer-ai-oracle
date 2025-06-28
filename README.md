
# Trading AI - Sistema Avanzado de Análisis de Velas 🚀

Un sistema completo de análisis de trading con Machine Learning, detección de patrones en tiempo real, y aprendizaje continuo.

## 🎯 Objetivos del Proyecto

- **Análisis de Patrones Avanzado**: Detección automática de patrones clásicos (Hammer, Doji, Engulfing, etc.)
- **Aprendizaje Continuo**: Sistema de entrenamiento incremental con validación en tiempo real
- **Predicción ML**: Predicciones basadas en análisis técnico y patrones históricos
- **Feedback Loop**: Autoaprendizaje mediante validación de resultados y corrección de errores

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Provider │    │ Pattern Detector│    │   ML Predictor  │
│                 │    │                 │    │                 │
│ • Market Data   ├────┤ • Hammer        ├────┤ • LSTM Model    │
│ • Real-time     │    │ • Doji          │    │ • Technical     │
│ • Historical    │    │ • Engulfing     │    │   Analysis      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │           Enhanced Learning System              │
         │                                                 │
         │ ┌─────────────────┐  ┌─────────────────────────┐│
         │ │ Reservoir       │  │ Real-time Validation    ││
         │ │ Sampling        │  │                         ││
         │ │                 │  │ • Prediction Tracking   ││
         │ │ • Sliding Window│  │ • Error Learning        ││
         │ │ • Incremental   │  │ • Pattern Reinforcement ││
         │ │   Updates       │  │ • Accuracy Metrics      ││
         │ └─────────────────┘  └─────────────────────────┘│
         └─────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Visualization Layer                │
         │                                                 │
         │ • Real-time Charts  • Pattern Highlights       │
         │ • Prediction Overlay • Performance Metrics     │
         │ • Learning Dashboard • Error Analysis          │
         └─────────────────────────────────────────────────┘
```

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js (v18 o superior)
- npm o bun

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o si usas bun
   bun install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   # o si usas bun
   bun run dev
   ```

4. **Abrir el navegador**
   ```
   http://localhost:5173
   ```

## 🎮 Guía de Uso

### 1. Selección de Par de Trading
- Elige un par de trading del selector (EUR/USD, BTC/USD, etc.)
- Selecciona el timeframe deseado (1m, 5m, 1h, etc.)

### 2. Iniciar Análisis
- Haz clic en "Iniciar" para comenzar el análisis en tiempo real
- El sistema comenzará a generar datos y detectar patrones

### 3. Entrenamiento del Modelo
- Usa el botón "Entrenar ML" para mejorar las predicciones
- Se requieren al menos 50 velas para entrenar

### 4. Monitoreo de Métricas
- **Validación en Tiempo Real**: Precisión de predicciones
- **Aprendizaje de Errores**: Tasa de convergencia y adaptación
- **Patrones**: Detección automática con niveles de confianza

## 🧠 Características Avanzadas

### Sistema de Aprendizaje Continuo
- **Reservoir Sampling**: Mantiene una muestra representativa de datos históricos
- **Sliding Window**: Actualización incremental del modelo con nuevos datos
- **Error Learning**: Ajuste automático de parámetros basado en errores de predicción
- **Pattern Reinforcement**: Fortalecimiento de patrones exitosos

### Detección de Patrones Clásicos
- **Hammer/Martillo**: Patrón de reversión bullish
- **Doji**: Indecisión del mercado
- **Engulfing**: Patrón de engulfimiento bullish/bearish
- **Confidence Scoring**: Nivel de confianza para cada patrón detectado

### Validación en Tiempo Real
- **Prediction Tracking**: Seguimiento de predicciones vs. resultados reales
- **Accuracy Metrics**: Métricas de precisión actualizadas en tiempo real
- **Error Analysis**: Análisis detallado de errores para mejora continua

## 📊 Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Query
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🔧 Configuración Avanzada

### Parámetros del Sistema de Aprendizaje
```typescript
// Configuración del reservoir sampling
const reservoirSize = 1000; // Tamaño del buffer de datos

// Configuración de la ventana deslizante
const slidingWindow = 50; // Ventana para métricas de precisión

// Tasa de aprendizaje adaptativa
const learningRate = 0.01; // Tasa inicial de aprendizaje
```

## 📈 Métricas de Rendimiento

El sistema proporciona métricas detalladas:

- **Precisión Reciente**: Basada en las últimas predicciones
- **Tasa de Éxito por Patrón**: Efectividad de cada patrón detectado
- **Error Promedio**: Magnitud promedio de error en predicciones
- **Tasa de Convergencia**: Velocidad de mejora del modelo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas de Desarrollo

### Estructura del Proyecto
```
src/
├── components/          # Componentes React
├── utils/              # Lógica de negocio
│   ├── dataProvider.ts         # Proveedor de datos
│   ├── candlePatterns.ts       # Detector de patrones
│   ├── mlPredictor.ts          # Predictor ML
│   ├── enhancedOnlineLearning.ts # Sistema de aprendizaje
│   └── validationSystem.ts     # Validación en tiempo real
├── types/              # Definiciones TypeScript
└── pages/              # Páginas de la aplicación
```

### Flujo de Datos
1. **Ingesta**: DataProvider obtiene datos del mercado
2. **Análisis**: CandlePatternDetector identifica patrones
3. **Predicción**: MLPredictor genera predicciones
4. **Aprendizaje**: EnhancedOnlineLearningSystem procesa resultados
5. **Validación**: RealTimeValidationSystem valida precisión
6. **Visualización**: Componentes React muestran resultados

## 🏆 Roadmap Futuro

- [ ] Integración con APIs reales de trading
- [ ] Más patrones de velas japonesas
- [ ] Modelos ML más sofisticados (LSTM, Transformer)
- [ ] Backtesting avanzado con múltiples estrategias
- [ ] Alertas en tiempo real
- [ ] Mobile app companion

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

**¿Necesitas ayuda?** Abre un issue o contacta al equipo de desarrollo.

**URL del Proyecto**: https://lovable.dev/projects/0424e1be-e95f-4ba9-b99d-115f21b86f69
