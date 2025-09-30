# 🌱 ECOA Frontend

Aplicación web cliente para el sistema de monitoreo inteligente de plantas ECOA, construida con HTML5, CSS3, JavaScript ES6+ y Vite.

## Características

- **Interfaz de Usuario** moderna y responsive
- **Panel Cliente** para usuarios finales
- **Panel Administrador** para gestión del sistema
- **Tiempo Real** con Socket.IO client
- **PWA Ready** (Progressive Web App)
- **Optimización** con Vite bundler

## Inicio Rápido

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Backend ECOA ejecutándose (puerto 3000)

### Instalación

1. **Instalar dependencias**
```bash
cd frontend
npm install
```

2. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

3. **Build para producción**
```bash
npm run build
```

4. **Preview del build**
```bash
npm run preview
```

La aplicación estará disponible en `http://localhost:5000`

## Estructura del Proyecto

```
frontend/
├── public/
│   ├── client/           # Panel de Usuario
│   │   ├── index.html    # Página principal cliente
│   │   ├── app.js        # Lógica JavaScript
│   │   └── style.css     # Estilos CSS
│   └── admin/            # Panel de Administración
│       ├── index.html    # Dashboard administrativo
│       ├── app.js        # Lógica admin
│       └── style.css     # Estilos admin
├── package.json
├── vite.config.js        # Configuración Vite
└── README.md
```

## Scripts Disponibles

```bash
# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Interfaces Disponibles

### Panel Cliente (`/client`)
**Funcionalidades:**
- Dashboard personal de plantas
- Monitoreo de métricas en tiempo real
- Chat con plantas usando IA
- Sistema de alertas y notificaciones
- Perfil de usuario y logros
- Donaciones comunitarias

**Características técnicas:**
- Responsive design para mobile y desktop
- Conexión Socket.IO para actualizaciones live
- LocalStorage para datos temporales
- Fetch API para comunicación con backend

### Panel Admin (`/admin`)
**Funcionalidades:**
- Gestión de usuarios del sistema
- Administración de plantas globales
- Control de alertas y notificaciones
- Estadísticas y métricas del sistema
- Gestión de logros y accesorios
- Configuración de integraciones

## Tecnologías Utilizadas

### Core
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con Flexbox/Grid
- **JavaScript ES6+** - Lógica de aplicación
- **Vite 7.1** - Build tool y dev server

### Librerías y APIs
- **Socket.IO Client** - WebSockets para tiempo real
- **Fetch API** - Comunicación HTTP
- **Web APIs** - Geolocation, Notifications, etc.

### Herramientas de Desarrollo
- **ESLint** - Linter para JavaScript
- **Vite** - Bundler ultra-rápido
- **Hot Module Replacement** - Recarga automática


## Configuración de Vite

```javascript
// vite.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "frontend/public",
  server: {
    port: 5000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: "../../dist",
    rollupOptions: {
      input: {
        client: path.resolve(__dirname, "public/client/index.html"),
        admin: path.resolve(__dirname, "public/admin/index.html"),
      },
    },
  },
});
```