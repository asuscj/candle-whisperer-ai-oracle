
# Guía de Despliegue - Trading AI

Esta guía explica cómo desplegar Trading AI en diferentes plataformas de hosting.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Código fuente del proyecto
- Cuenta en la plataforma de despliegue elegida

## 🚀 Opciones de Despliegue

### 1. Vercel (Recomendado)

Vercel es la opción más sencilla para desplegar aplicaciones React con Vite.

#### Despliegue Automático desde GitHub:
1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente que es un proyecto Vite
3. El despliegue se realizará automáticamente

#### Despliegue Manual:
```bash
# Instalar Vercel CLI
npm i -g vercel

# En el directorio del proyecto
npm run build
vercel --prod
```

#### Configuración en vercel.json (opcional):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 2. Netlify

#### Desde GitHub:
1. Conecta tu repositorio en Netlify
2. Configuración de build:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

#### Despliegue con Drag & Drop:
```bash
npm run build
# Arrastra la carpeta 'dist' a Netlify
```

#### Configuración en netlify.toml (opcional):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Añadir scripts en package.json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# Desplegar
npm run deploy
```

Configurar en `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/nombre-del-repositorio/',
  // ... resto de configuración
});
```

### 4. Docker

#### Dockerfile:
```dockerfile
# Etapa de build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa de producción
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf:
```nginx
events {}
http {
    include /etc/nginx/mime.types;
    
    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

#### Comandos Docker:
```bash
# Construir imagen
docker build -t trading-ai .

# Ejecutar contenedor
docker run -p 8080:80 trading-ai
```

### 5. Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar proyecto
firebase init hosting

# Configurar firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# Construir y desplegar
npm run build
firebase deploy
```

## 🔧 Configuración de Variables de Entorno

### Para Vercel:
1. Ve a Project Settings → Environment Variables
2. Añade las variables necesarias:
   - `VITE_ALPHA_VANTAGE_API_KEY`
   - `VITE_APP_NAME`
   - etc.

### Para Netlify:
1. Ve a Site Settings → Environment Variables
2. Añade las variables con el prefijo `VITE_`

### Para otros servicios:
Consulta la documentación específica sobre variables de entorno.

## 🏗️ Scripts de Build Personalizados

### package.json scripts sugeridos:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:prod": "tsc && vite build --mode production",
    "preview": "vite preview",
    "deploy:vercel": "npm run build && vercel --prod",
    "deploy:netlify": "npm run build && netlify deploy --prod --dir=dist",
    "deploy:gh-pages": "npm run build && gh-pages -d dist"
  }
}
```

## 🔍 Verificación Post-Despliegue

Después del despliegue, verifica:

1. **Funcionalidad básica**:
   - ✅ La aplicación carga correctamente
   - ✅ Los datos se generan y muestran
   - ✅ Los patrones se detectan
   - ✅ Las predicciones ML funcionan

2. **Performance**:
   - ✅ Tiempo de carga < 3 segundos
   - ✅ Interacciones responsive
   - ✅ No hay errores en console

3. **SEO y Metadatos**:
   - ✅ Título y descripción correctos
   - ✅ Favicon presente
   - ✅ Metadatos Open Graph (opcional)

## 🛠️ Troubleshooting

### Error: "Failed to resolve import"
- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm install` antes del build

### Error: "Cannot read properties of undefined"
- Revisa las variables de entorno
- Verifica los paths de imports

### Página en blanco después del despliegue
- Verifica la configuración del `base` en `vite.config.ts`
- Asegúrate de que los redirects estén configurados para SPAs

### Assets no cargan
- Verifica la configuración de `publicPath`
- Revisa los paths relativos vs absolutos

## 📊 Monitoreo y Analytics

Para monitorear el rendimiento en producción:

1. **Google Analytics** (opcional):
```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

2. **Sentry** para error tracking:
```bash
npm install @sentry/react @sentry/tracing
```

3. **Web Vitals**:
```bash
npm install web-vitals
```

## 🔄 CI/CD Pipeline

### GitHub Actions ejemplo:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

¿Necesitas ayuda con alguna plataforma específica? ¡Consulta la documentación oficial o abre un issue!
