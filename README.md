# 🌱 ECOA - Ecosystem Companion Optimization Assistant

Sistema inteligente de monitoreo y cuidado de plantas que permite a los usuarios gestionar su jardín personal mediante tecnología IoT, inteligencia artificial y gamificación.

## Descripción

ECOA es una plataforma completa que combina:
- **Backend API RESTful** con Node.js, Express y Supabase
- **Frontend web** con HTML, CSS y JavaScript vanilla
- **Integración con Raspberry Pi** para sensores IoT
- **Inteligencia Artificial** con Google Gemini para plantas que "hablan"
- **APIs externas** para identificación de plantas y datos climáticos

## Arquitectura del Sistema

```
ECOA/
├── backend/          # API RESTful con Express y Socket.IO
├── frontend/         # Aplicación web (cliente y admin)
├── raspi/            # Scripts para Raspberry Pi
├── integrations/     # APIs externas (OpenAI, Weather, Plant.id)
└── docs/             # Documentación técnica
```

## Inicio Rápido

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Python** 3.8+ (para Raspberry Pi)
- Cuenta en **Supabase**
- API Keys para servicios externos

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/smallcakekoo/ecoa.git
cd ecoa
```

2. **Configurar Backend**
```bash
cd backend
npm install
npm run dev
```

3. **Configurar Frontend**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Configurar Raspberry Pi** (opcional)
```bash
cd ../raspi
pip install -r requirements.txt
python main.py
```

## Servicios Principales

### Backend API (Puerto 3000)
- **Usuarios**: Gestión de cuentas y perfiles
- **Plantas**: CRUD de plantas y métricas
- **Alertas**: Sistema de notificaciones
- **Logros**: Gamificación y recompensas
- **Donaciones**: Sistema de apoyo comunitario
- **Integraciones**: APIs externas

### Frontend Web (Puerto 5000)
- **Panel Cliente**: Interfaz para usuarios finales
- **Panel Admin**: Administración del sistema
- **Tiempo Real**: Socket.IO para actualizaciones live

## APIs Integradas

- **Google Gemini**: IA para plantas que "hablan"
- **Open-Meteo**: Datos meteorológicos
- **Trefle.io**: Base de datos de plantas
- **Supabase**: Base de datos y autenticación

## Características Principales

### Plantas Inteligentes
Las plantas pueden "comunicarse" contigo gracias a Google Gemini:
```javascript
// Ejemplo de interacción
POST /api/integrations/gemini/chat
{
  "message": "¿Cómo te sientes hoy?",
  "plantType": "rosa",
  "plantName": "Rosa del jardín"
}
```

### Monitoreo IoT
Sensores de Raspberry Pi para:
- Humedad del suelo
- Temperatura ambiente
- Nivel de luz
- Control de riego automático

### Sistema de Gamificación
- Logros por cuidar plantas
- Niveles de experiencia
- Sistema de donaciones comunitarias

### Alertas en Tiempo Real
Socket.IO para notificaciones instantáneas:
- Plantas que necesitan agua
- Cambios en métricas
- Logros desbloqueados

## Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js**
- **Socket.IO** para tiempo real
- **Supabase** como base de datos
- **Google Gemini** para IA

### Frontend
- **HTML5** + **CSS3** + **JavaScript ES6+**
- **Vite** como bundler
- **Socket.IO Client** para tiempo real

### IoT
- **Raspberry Pi** con Python
- Sensores de humedad y temperatura
- Bombas de agua automáticas

## Documentación Detallada

- [**Backend README**](./backend/README.md) - Configuración de la API
- [**Frontend README**](./frontend/README.md) - Configuración de la web
- [**Documentación de API**](./docs/api.md) - Endpoints disponibles
- [**Arquitectura del Sistema**](./docs/arquitectura.md) - Diseño técnico
- [**Base de Datos**](./docs/base_datos.md) - Esquema de Supabase

## Variables de Entorno

Crea los archivos `.env` correspondientes:

### Backend (.env)
```env
# Supabase
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key

# APIs Externas
GEMINI_API_KEY=tu_gemini_api_key
TREFLE_API_KEY=tu_trefle_api_key

# Servidor
PORT=3000
NODE_ENV=development
```

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Raspberry Pi
cd raspi
python -m pytest
```

## Estado del Proyecto

- **Backend API** - Completamente funcional
- **Integración con Supabase** - Configurada
- **Socket.IO** - Tiempo real implementado
- **Google Gemini** - Plantas que hablan
- **Frontend** - En desarrollo
- **Raspberry Pi** - Scripts básicos
- **Testing** - Pendiente

## Equipo de Desarrollo

- **Ana Tobón** 
- **Cristina Jauregui** 
- **Sary Payán** 








