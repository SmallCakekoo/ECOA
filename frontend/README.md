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

##  Conexión con Backend

### Configuración de API

```javascript
// config/api.js
const API_BASE_URL = 'http://localhost:3000';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

### Socket.IO Client

```javascript
// Conexión Socket.IO
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Unirse a sala de usuario
socket.emit('join_user_room', userId);

// Escuchar eventos de plantas
socket.on('plant_metrics_updated', (data) => {
  updatePlantDisplay(data);
});

// Escuchar notificaciones
socket.on('notification_received', (data) => {
  showNotification(data.message);
});
```

## Funcionalidades Principales

### Chat con Plantas IA

```javascript
// Ejemplo de chat con plantas
async function chatWithPlant(plantId, message) {
  try {
    const response = await apiClient.post('/api/integrations/gemini/chat', {
      message: message,
      plantType: plantData.species,
      plantName: plantData.name
    });

    if (response.success) {
      displayPlantResponse(response.message);
    }
  } catch (error) {
    console.error('Error en chat:', error);
  }
}
```

### Dashboard de Métricas

```javascript
// Actualización en tiempo real de métricas
function updatePlantMetrics(plantData) {
  const metricsContainer = document.getElementById('plant-metrics');
  
  metricsContainer.innerHTML = `
    <div class="metric">
      <span class="label">Humedad:</span>
      <span class="value">${plantData.humidity}%</span>
      <div class="progress-bar">
        <div class="progress" style="width: ${plantData.humidity}%"></div>
      </div>
    </div>
    <div class="metric">
      <span class="label">Temperatura:</span>
      <span class="value">${plantData.temperature}°C</span>
    </div>
    <div class="metric">
      <span class="label">Luz:</span>
      <span class="value">${plantData.light_level}%</span>
    </div>
  `;
}
```

### Sistema de Notificaciones

```javascript
// Notificaciones del navegador
function showNotification(title, body, icon) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: icon || '/icons/plant-icon.png',
      tag: 'ecoa-notification'
    });
  }
}

// Solicitar permisos de notificación
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}
```

## PWA (Progressive Web App)

### Manifest.json

```json
{
  "name": "ECOA - Plant Care Assistant",
  "short_name": "ECOA",
  "description": "Sistema inteligente de cuidado de plantas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#4CAF50",
  "theme_color": "#2E7D32",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (Básico)

```javascript
// sw.js
const CACHE_NAME = 'ecoa-v1';
const urlsToCache = [
  '/',
  '/client/',
  '/admin/',
  '/client/style.css',
  '/admin/style.css',
  '/client/app.js',
  '/admin/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

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

## Testing (Próximamente)

```bash
# Tests unitarios con Jest
npm test

# Tests de componentes
npm run test:components

# Tests end-to-end con Playwright
npm run test:e2e
```

## Performance

### Optimizaciones Implementadas
- **Code Splitting** con Vite
- **Lazy Loading** de imágenes
- **Service Worker** para caché
- **Bundle Size** optimizado (< 1MB)
- **CSS Critical** inline
- **Image Compression** automática

### Métricas Target
- **First Contentful Paint** < 1.5s
- **Time to Interactive** < 3s
- **Cumulative Layout Shift** < 0.1
- **Lighthouse Score** > 90

## Deployment

### Build de Producción
```bash
npm run build
```

### Hosting Estático
```bash
# Con Netlify
npm run build
netlify deploy --prod --dir=dist

# Con Vercel  
npm run build
vercel --prod
```

### Servidor HTTP Básico
```bash
npm run preview
# o
npx serve dist
```

## Debugging

### Developer Tools
```javascript
// Habilitar logs de desarrollo
if (process.env.NODE_ENV === 'development') {
  window.ECOA_DEBUG = true;
}

// Función de debug