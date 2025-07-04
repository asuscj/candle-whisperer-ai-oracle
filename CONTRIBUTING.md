
# 🤝 Guía de Contribución - Trading AI

¡Gracias por tu interés en contribuir a Trading AI! Esta guía te ayudará a comenzar.

## 📋 Antes de Empezar

### Prerrequisitos
- Node.js 18+ instalado
- Git configurado
- Editor de código (VS Code recomendado)

### Configuración del Entorno
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/trading-ai.git
cd trading-ai

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 🔄 Flujo de Trabajo

### 1. Fork y Clone
1. Haz fork del repositorio
2. Clona tu fork localmente
3. Configura el repositorio upstream:
```bash
git remote add upstream https://github.com/original-repo/trading-ai.git
```

### 2. Crear una Rama
```bash
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b fix/descripcion-del-bug
```

### 3. Desarrollo
- Mantén los commits pequeños y descriptivos
- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades
- Actualiza la documentación si es necesario

### 4. Testing
```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### 5. Commit y Push
```bash
git add .
git commit -m "feat: añadir nueva funcionalidad X"
git push origin feature/nombre-de-tu-feature
```

### 6. Pull Request
1. Ve a GitHub y crea un Pull Request
2. Llena la plantilla de PR
3. Espera la revisión del código

## 📝 Convenciones de Código

### Commits
Seguimos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` formateo, punto y coma faltante, etc.
- `refactor:` refactorización de código
- `test:` añadir tests
- `chore:` tareas de mantenimiento

### Código TypeScript
- Usar tipos explícitos cuando sea necesario
- Documentar funciones complejas con JSDoc
- Seguir las reglas de ESLint configuradas
- Nombres de variables y funciones en inglés

### Componentes React
- Un componente por archivo
- Usar TypeScript interfaces para props
- Componentes funcionales con hooks
- Documentar props complejas

## 🧪 Testing

### Estructura de Tests
```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
  utils/
    math.ts
    math.test.ts
```

### Escribir Tests
- Tests unitarios para utilidades
- Tests de componentes con React Testing Library
- Tests de integración para flujos críticos
- Aim for >80% code coverage

### Ejemplo de Test
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## 🎨 Estándares de UI/UX

### Diseño
- Usar Tailwind CSS para estilos
- Seguir el sistema de diseño existente
- Mantener consistencia visual
- Responsive design obligatorio

### Accesibilidad
- Usar elementos semánticos HTML
- Incluir atributos ARIA cuando sea necesario
- Soporte para teclado
- Contraste de colores adecuado

## 🐛 Reportar Bugs

### Antes de Reportar
1. Busca en issues existentes
2. Verifica que sea reproducible
3. Prueba en la última versión

### Información a Incluir
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es visual
- Información del navegador/OS

## 🚀 Sugerir Funcionalidades

### Proceso
1. Abre un issue con la etiqueta `enhancement`
2. Describe el problema que resuelve
3. Propone una solución
4. Discute con la comunidad
5. Espera aprobación antes de implementar

## 📖 Documentación

### Actualizar Docs
- README.md para cambios principales
- JSDoc para funciones públicas
- Comentarios en código complejo
- Ejemplos de uso cuando sea útil

## 🏆 Reconocimientos

Los contribuidores son reconocidos en:
- README.md (sección Contributors)
- Release notes para cambios significativos
- Issues y PRs mencionando la contribución

## ❓ ¿Necesitas Ayuda?

- 💬 [Discusiones en GitHub](https://github.com/repo/discussions)
- 🐛 [Issues](https://github.com/repo/issues)
- 📧 Email: contributing@trading-ai.dev

## 📜 Código de Conducta

Este proyecto sigue el [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Al participar, se espera que respetes este código.

---

¡Gracias por contribuir a Trading AI! 🎉
