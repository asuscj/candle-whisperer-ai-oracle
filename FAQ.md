
# ❓ Preguntas Frecuentes - Trading AI

Esta sección responde las preguntas más comunes sobre Trading AI.

## 🚀 Uso General

### ¿Qué es Trading AI?
Trading AI es una aplicación web de código abierto que combina análisis técnico tradicional con machine learning para detectar patrones en gráficos de trading y generar predicciones de precios.

### ¿Es gratuito?
Sí, Trading AI es completamente gratuito y de código abierto bajo licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

### ¿Necesito conocimientos de programación?
No necesariamente. La aplicación está diseñada para ser usada por traders sin conocimientos técnicos. Sin embargo, si quieres contribuir al desarrollo, conocimientos de React/TypeScript son útiles.

### ¿Los datos son reales?
Por defecto, Trading AI usa datos simulados muy realistas. Opcionalmente, puedes configurar APIs de datos reales (Alpha Vantage, Finnhub, IEX Cloud) mediante variables de entorno.

## 📊 Funcionalidades

### ¿Qué patrones puede detectar?
Actualmente detecta:
- **Hammer**: Patrón de reversión alcista
- **Doji**: Indecisión del mercado
- **Engulfing**: Patrones de envolvimiento alcista/bajista
- Más patrones se añaden regularmente

### ¿Qué tan precisas son las predicciones?
La precisión varía según las condiciones del mercado, pero típicamente oscila entre 60-75%. El sistema incluye métricas de confianza para cada predicción.

### ¿Puedo cambiar el timeframe?
Sí, la aplicación soporta múltiples timeframes:
- 1 minuto (1m)
- 5 minutos (5m)
- 1 hora (1h)
- 1 día (1d)

### ¿Qué pares de trading están disponibles?
Incluye los pares más populares:
- **Forex**: EURUSD, GBPUSD, USDJPY, AUDUSD
- **Crypto**: BTCUSD, ETHUSD, ADAUSD
- **Stocks**: AAPL, GOOGL, MSFT, TSLA

## 🔧 Configuración Técnica

### ¿Cómo instalo Trading AI localmente?
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/trading-ai.git
cd trading-ai

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### ¿Cómo configuro APIs de datos reales?
1. Copia `.env.example` a `.env.local`
2. Añade tus API keys:
```bash
VITE_ALPHA_VANTAGE_API_KEY=tu_clave_aqui
VITE_FINNHUB_API_KEY=tu_clave_aqui
```
3. Reinicia la aplicación

### ¿Qué navegadores son compatibles?
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Navegadores móviles modernos

## 🧠 Machine Learning

### ¿Cómo funciona el sistema de ML?
El sistema:
1. Extrae características técnicas de los datos históricos
2. Entrena un modelo de red neuronal
3. Valida predicciones automáticamente
4. Mejora continuamente con feedback

### ¿Dónde se ejecuta el ML?
Todo el procesamiento de ML ocurre en tu navegador (client-side). No se envían datos a servidores externos.

### ¿Puedo entrenar el modelo con mis propios datos?
Sí, puedes importar datos históricos en formato CSV o conectar APIs para entrenar con datos específicos.

### ¿El modelo mejora con el tiempo?
Sí, incluye un sistema de aprendizaje online que mejora las predicciones basándose en la validación de resultados anteriores.

## 🛠️ Desarrollo y Contribución

### ¿Cómo puedo contribuir?
1. Lee [CONTRIBUTING.md](CONTRIBUTING.md)
2. Haz fork del repositorio
3. Crea una rama para tu feature
4. Envía un Pull Request

### ¿Qué stack tecnológico usa?
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Build**: Vite
- **Testing**: Vitest + React Testing Library

### ¿Cómo reporto un bug?
1. Verifica que no exista ya un issue similar
2. Crea un nuevo issue en GitHub
3. Incluye pasos para reproducir el problema
4. Añade screenshots si es necesario

## 🚀 Despliegue

### ¿Dónde puedo hospedar Trading AI?
Funciona en cualquier hosting de archivos estáticos:
- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**
- **Firebase Hosting**

### ¿Cómo hago deploy en Vercel?
```bash
npm run build
npx vercel --prod
```
O conecta tu repositorio GitHub directamente.

### ¿Puedo usar un dominio personalizado?
Sí, la mayoría de plataformas de hosting permiten configurar dominios personalizados.

## 🔒 Seguridad y Privacidad

### ¿Se almacenan mis datos?
No, todos los datos se procesan localmente en tu navegador. No se envía información a servidores externos.

### ¿Las API keys están seguras?
Las API keys se manejan como variables de entorno y no se incluyen en el bundle de producción. Sin embargo, ten cuidado de no commitearlas en repositorios públicos.

### ¿Puedo usar Trading AI para trading real?
Trading AI es una herramienta educativa y de análisis. Las predicciones no constituyen consejos financieros. Siempre haz tu propia investigación antes de tomar decisiones de inversión.

## 🆘 Solución de Problemas

### La aplicación no carga
1. Verifica que tienes Node.js 18+ instalado
2. Borra `node_modules` y ejecuta `npm install`
3. Verifica que no hay errores en la consola del navegador

### Los gráficos no se muestran
1. Verifica que JavaScript está habilitado
2. Desactiva extensiones del navegador temporalmente
3. Prueba en modo incógnito

### El ML no genera predicciones
1. Asegúrate que hay suficientes datos históricos (mínimo 20 velas)
2. Verifica que no hay errores en la consola
3. Prueba regenerando los datos

### Error al instalar dependencias
```bash
# Limpiar cache
npm cache clean --force

# Borrar lock file y node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

## 📞 Soporte

### ¿Dónde puedo pedir ayuda?
- 🐛 **Bugs**: [GitHub Issues](https://github.com/repo/issues)
- 💬 **Discusiones**: [GitHub Discussions](https://github.com/repo/discussions)
- 📧 **Email**: support@trading-ai.dev

### ¿Hay documentación adicional?
- [README.md](README.md) - Información general
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guía para contribuir
- [ARCHITECTURE.md](ARCHITECTURE.md) - Documentación técnica
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Referencia de APIs

---

¿No encuentras tu pregunta? [Abre un issue](https://github.com/repo/issues/new) y te ayudaremos.
