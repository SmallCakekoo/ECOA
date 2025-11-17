# 🚀 Guía de Ejecución del Sistema ECOA

Esta guía te explica cómo ejecutar cada componente del sistema IoT completo.

## 📋 Componentes del Sistema

1. **Backend** (Node.js/Express) - API REST
2. **Frontend** (Vite/HTML/CSS/JS) - Interfaz web
3. **Raspberry Pi** (Python) - Sensores y LED Matrix

---

## 🔧 1. BACKEND

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Cuenta de Supabase activa

### Pasos para ejecutar

```bash
# 1. Navegar a la carpeta del backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env con:
# SUPABASE_URL=tu_url_de_supabase
# SUPABASE_KEY=tu_key_de_supabase
# PORT=3000 (opcional, por defecto es 3000)

# 4. Ejecutar en modo desarrollo (con auto-reload)
npm run dev

# O ejecutar en modo producción
npm start
```

El backend está desplegado en: `https://ecoabackendecoa.vercel.app`

### Verificar que funciona

```bash
# Probar el endpoint de salud
curl https://ecoabackendecoa.vercel.app/health

# O abrir en el navegador
# https://ecoabackendecoa.vercel.app/health
```

**Nota**: El backend ya está desplegado en Vercel. Si quieres ejecutarlo localmente para desarrollo, sigue los pasos anteriores, pero recuerda que el frontend y la Raspberry Pi están configurados para usar el backend en producción.

---

## 🎨 2. FRONTEND

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0

### Frontend Desplegado

El frontend está desplegado en: **`https://ecoafrontendecoa.vercel.app/`**

Puedes acceder directamente sin necesidad de ejecutarlo localmente.

### Ejecutar Localmente (Desarrollo)

Si necesitas ejecutar el frontend localmente para desarrollo:

```bash
# 1. Navegar a la carpeta del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar servidor de desarrollo
npm run dev
```

El frontend local estará disponible en: `http://localhost:5173` (puerto por defecto de Vite)

### Nota importante

El frontend está configurado para usar el backend en producción (`https://ecoabackendecoa.vercel.app`). Todas las peticiones se realizan directamente al backend desplegado.

---

## 🍓 3. RASPBERRY PI

### Prerrequisitos

- Raspberry Pi con Raspbian OS
- Sensores conectados:
  - Sensor de temperatura DS18B20
  - Sensor de humedad del suelo (analógico y digital)
  - Sensor de luminosidad BH1750
  - LED Matrix 8x8 MAX7219

### Pasos para ejecutar

```bash
# 1. Navegar a la carpeta de la Raspberry
cd raspi

# 2. Crear entorno virtual (recomendado)
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
# Crear archivo .env con:
# BACKEND_URL=https://ecoabackendecoa.vercel.app/
# PLANT_ID=tu_plant_id_opcional (si no se proporciona, usa la primera planta adoptada)
# DEVICE_SERIAL=serial_unico_de_la_raspberry
# DEVICE_MODEL=Raspberry Pi 4 (opcional)
# DEVICE_LOCATION=Sala principal (opcional)
# FOUNDATION_ID=id_de_la_fundacion_asociada (opcional)

# 5. Ejecutar el script principal
python main.py
```

### Notas importantes para Raspberry Pi

1. **Permisos GPIO**: Puede que necesites ejecutar con `sudo`:

   ```bash
   sudo python main.py
   ```

2. **Habilitar I2C y SPI**: Asegúrate de tener habilitados I2C y SPI en la configuración de la Raspberry:

   ```bash
   sudo raspi-config
   # Interface Options > I2C > Enable
   # Interface Options > SPI > Enable
   ```

3. **Sensor DS18B20**: Necesitas habilitar el protocolo 1-Wire:
   ```bash
   sudo raspi-config
   # Interface Options > 1-Wire > Enable
   ```

---

## 🔄 Flujo Completo de Ejecución

### Orden recomendado:

1. **Verificar Backend**: El backend ya está desplegado en `https://ecoabackendecoa.vercel.app`

   ```bash
   # Verificar que está funcionando
   curl https://ecoabackendecoa.vercel.app/health
   ```

2. **Acceder al Frontend**: El frontend ya está desplegado en `https://ecoafrontendecoa.vercel.app/`

   O ejecutar localmente para desarrollo:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Ejecutar la Raspberry Pi** (en la Raspberry)
   ```bash
   cd raspi
   pip install -r requirements.txt
   python main.py
   ```

**Nota**: Si necesitas ejecutar el backend localmente para desarrollo:

```bash
cd backend
npm install
npm run dev
```

Pero recuerda que el frontend y la Raspberry Pi están configurados para usar el backend en producción.

---

## 🧪 Probar la Integración

### 1. Verificar que el backend recibe datos

La Raspberry Pi enviará datos cada 5 segundos al endpoint `/sensor-data`. Puedes verificar en los logs del backend.

### 2. Obtener el emoji desde la Raspberry

La Raspberry Pi obtendrá el emoji cada 3 segundos del endpoint `https://ecoabackendecoa.vercel.app/emoji` y lo mostrará en el LED Matrix.

### 3. Ver datos en el frontend

1. Abre el navegador en `https://ecoafrontendecoa.vercel.app/` (producción) o `http://localhost:5173` (desarrollo local)
2. Navega a la pantalla de una planta adoptada
3. Deberías ver:
   - Última lectura de sensores (temperatura, luz, humedad)
   - Estado de la planta (Healthy, Recovering, Bad)
   - Emoji del estado (😊, 😐, 😢)

### 4. Verificar endpoints del backend

Puedes probar los endpoints directamente:

```bash
# Health check
curl https://ecoabackendecoa.vercel.app/health

# Obtener emoji (requiere plant_id o usa primera planta adoptada)
curl https://ecoabackendecoa.vercel.app/emoji

# Ver todos los endpoints disponibles
curl https://ecoabackendecoa.vercel.app/
```

---

## 🐛 Solución de Problemas

### Backend no responde

- Verifica que el backend esté desplegado en Vercel: `https://ecoabackendecoa.vercel.app/health`
- Si ejecutas localmente, verifica que el puerto 3000 no esté en uso
- Revisa las variables de entorno en `.env`
- Verifica la conexión a Supabase

### Frontend no se conecta al backend

- Accede al frontend desplegado: `https://ecoafrontendecoa.vercel.app/`
- Verifica que el backend esté disponible en `https://ecoabackendecoa.vercel.app/health`
- Revisa la conexión a internet
- Verifica CORS en el backend (ya está configurado para permitir todas las solicitudes)
- Si usas frontend local, verifica que esté corriendo en `http://localhost:5173`

### Raspberry Pi no envía datos

- Verifica la conexión a internet
- Revisa la URL del backend en `.env`
- Verifica que los sensores estén conectados correctamente
- Revisa los permisos GPIO (puede necesitar `sudo`)

### No se muestra el emoji en el LED

- Verifica que el LED Matrix esté conectado correctamente
- Revisa la conexión SPI
- Verifica que el backend esté respondiendo en `https://ecoabackendecoa.vercel.app/emoji`
- Prueba manualmente: `curl https://ecoabackendecoa.vercel.app/emoji`

---

## 📝 Variables de Entorno Necesarias

### Backend (.env)

```
SUPABASE_URL=tu_url
SUPABASE_KEY=tu_key
PORT=3000
```

### Raspberry Pi (.env)

```
BACKEND_URL=https://ecoabackendecoa.vercel.app/
PLANT_ID=opcional_uuid_de_planta
```

---

## ✅ Checklist de Verificación

- [ ] Backend disponible en `https://ecoabackendecoa.vercel.app` (verificar con `/health`)
- [ ] Frontend disponible en `https://ecoafrontendecoa.vercel.app/` (producción) o corriendo localmente en `http://localhost:5173` (desarrollo)
- [ ] Raspberry Pi ejecutando `main.py`
- [ ] Sensores conectados y funcionando
- [ ] LED Matrix conectado y funcionando
- [ ] Base de datos Supabase configurada
- [ ] Al menos una planta registrada y adoptada
- [ ] Datos fluyendo desde Raspberry → Backend → Frontend

---

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. **Acceder al sistema**: Abre `https://ecoafrontendecoa.vercel.app/` en tu navegador
2. **Registrar una planta** desde el panel de admin
3. **Adoptar la planta** desde el frontend cliente
4. **Configurar PLANT_ID** en la Raspberry Pi (opcional, si no se configura usará la primera planta adoptada)
5. **Monitorear** los datos en tiempo real en el frontend

## 🌐 URLs del Sistema

- **Backend API**: `https://ecoabackendecoa.vercel.app`
- **Frontend Web**: `https://ecoafrontendecoa.vercel.app/`
- **Health Check**: `https://ecoabackendecoa.vercel.app/health`

¡Listo! 🎉
