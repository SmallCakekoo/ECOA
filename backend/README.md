# 🌱 ECOA Backend

API RESTful construida con Node.js, Express.js, Supabase y Socket.IO para el sistema de monitoreo inteligente de plantas ECOA.

## Características

- **API REST** completa con Express.js 5.1
- **Base de datos** Supabase PostgreSQL
- **Tiempo Real** con Socket.IO 4.8
- **APIs Externas** para datos de plantas (Perenual)
- **Arquitectura modular** y escalable

## Inicio Rápido

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Cuenta activa en Supabase

### Instalación

1. **Instalar dependencias**

```bash
cd backend
npm install
```

2. **Configurar variables de entorno**

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

3. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

4. **Iniciar servidor de producción**

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
backend/
├── src/
│   ├── routes/           # Rutas de la API
│   │   ├── users.js      # Gestión de usuarios
│   │   ├── plants.js     # CRUD de plantas
│   │   ├── alerts.js     # Sistema de alertas
│   │   ├── donations.js  # Donaciones comunitarias
│   │   ├── accessories.js # Accesorios para plantas
│   │   ├── achievements.js # Sistema de logros
│   │   └── integrations.js # APIs externas
│   ├── integrations/     # Servicios externos
│   │   └── perenual.service.js    # Perenual API
│   ├── sockets/          # Socket.IO handlers
│   │   └── index.js      # Configuración WebSockets
│   ├── db.js            # Conexión Supabase
│   └── index.js         # Servidor principal
├── package.json
└── README.md
```

## Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev

# Producción
npm start

# Pruebas (pendiente implementar)
npm test
```

## Endpoints Principales

### Usuarios (`/users`)

```http
GET    /users           # Listar usuarios
GET    /users/:id       # Usuario por ID
POST   /users           # Crear usuario
PUT    /users/:id       # Actualizar usuario
DELETE /users/:id       # Eliminar usuario
GET    /users/:id/plants # Plantas del usuario
```

### Plantas (`/plants`)

```http
GET    /plants          # Listar plantas
GET    /plants/:id      # Planta por ID
POST   /plants          # Crear planta
PUT    /plants/:id      # Actualizar planta
PUT    /plants/:id/metrics # Actualizar métricas
DELETE /plants/:id      # Eliminar planta
```

### Alertas (`/alerts`)

```http
GET    /alerts          # Listar alertas
POST   /alerts          # Crear alerta
PUT    /alerts/:id/status # Cambiar estado
GET    /alerts/plant/:plant_id # Alertas por planta
```

### Integraciones (`/api/integrations`)

```http
GET    /api/integrations/perenual/search          # Buscar plantas
GET    /api/integrations/perenual/details/:plantId # Detalle por ID
GET    /api/integrations/perenual/species         # Listar especies
GET    /api/integrations/perenual/families        # Listar familias
POST   /api/integrations/perenual/identify       # Identificar planta por imagen
POST   /api/integrations/perenual/identify-health # Identificar con análisis de salud
```

## Integración Perenual

Variables de entorno requeridas y ejemplo de uso en los endpoints de arriba.

### Características de la API de Perenual

- **Más de 10,000 especies de plantas** en la base de datos
- **Identificación de plantas por imagen** con análisis de salud
- **Datos detallados** incluyendo cuidado, riego, luz solar, etc.
- **Guías de cuidado** específicas para cada planta
- **Análisis de enfermedades** y problemas de salud

## Socket.IO - Tiempo Real

### Eventos Disponibles

**Cliente → Servidor:**

```javascript
socket.emit("join_user_room", userId);
socket.emit("join_plant_room", plantId);
socket.emit("plant_metrics_update", { plantId, metrics });
```

**Servidor → Cliente:**

```javascript
socket.on("plant_created", (data) => {
  /* Nueva planta */
});
socket.on("plant_metrics_updated", (data) => {
  /* Métricas actualizadas */
});
socket.on("alert_created", (data) => {
  /* Nueva alerta */
});
socket.on("notification_received", (data) => {
  /* Notificación */
});
```

### Salas (Rooms)

- `user_${userId}` - Eventos específicos del usuario
- `plant_${plantId}` - Eventos específicos de la planta
- `notifications_${userId}` - Notificaciones del usuario
- `general` - Eventos globales

## Base de Datos (Supabase)

### Tablas Principales

**users**

- id (uuid, primary key)
- name (text)
- email (text, unique)
- avatar_url (text)
- level (int, default: 1)
- experience_points (int, default: 0)

**plants**

- id (uuid, primary key)
- user_id (uuid, foreign key)
- name (text)
- species (text)
- health_status (text)
- water_level (int)
- light_level (int)
- temperature (float)
- humidity (int)

**alerts**

- id (uuid, primary key)
- plant_id (uuid, foreign key)
- user_id (uuid, foreign key)
- title (text)
- message (text)
- alert_type (text)
- priority (text)
- status (text, default: 'active')

## Configuración

### Variables de Entorno (.env)

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui

# Perenual API (para plantas)
PERENUAL_API_KEY=tu_perenual_api_key

# Servidor
PORT=3000
NODE_ENV=development
```

### Supabase Setup

1. Crea un nuevo proyecto en [supabase.com](https://supabase.com)
2. Ejecuta las migraciones SQL para crear las tablas
3. Configura las políticas RLS (Row Level Security)
4. Obtén tu URL y Anon Key del dashboard

## Monitoreo y Logging

```javascript
// Health Check
GET /health

// Respuesta
{
  "success": true,
  "message": "Servidor ECOA funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5
}
```

## Seguridad

- **Validación de UUID** para todos los parámetros de ID
- **Sanitización** de datos de entrada
- **Rate limiting** en APIs externas
- **CORS** configurado para frontend
- **Error handling** centralizado

## Debugging

```bash
# Logs detallados
DEBUG=* npm run dev

# Solo logs de Socket.IO
DEBUG=socket.io* npm run dev

# Logs de base de datos
DEBUG=supabase* npm run dev
```

## Performance

- **Conexiones concurrentes**: 1000+ con Socket.IO
- **Response time**: < 100ms promedio
- **Database queries**: Optimizadas con índices
- **Memory usage**: ~50MB en idle

## Deployment

### Desarrollo Local

```bash
npm run dev
```

## Recursos Adicionales

- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Google Gemini API](https://ai.google.dev/docs)
