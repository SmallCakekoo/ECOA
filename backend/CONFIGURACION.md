# 🔧 Configuración de Conexión a Supabase

## Estado Actual

❌ **La conexión NO está configurada correctamente**

Faltan:
1. Archivo `.env` con las credenciales
2. Dependencias de Node.js instaladas

## Pasos para Configurar

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Crear Archivo .env

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# Supabase Configuration
# Obtén estos valores desde tu proyecto en https://supabase.com
# Ve a Settings > API y copia:
# - Project URL -> SUPABASE_URL
# - anon/public key -> SUPABASE_KEY
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_anon_key_aqui

# Perenual API (opcional, para enriquecer datos de plantas)
# Obtén tu API key desde https://perenual.com/
PERENUAL_API_KEY=tu_perenual_api_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Obtener Credenciales de Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu proyecto
3. Ve a **Settings** > **API**
4. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`

### 4. Verificar la Conexión

Una vez configurado, puedes verificar la conexión de dos formas:

#### Opción A: Usando el endpoint de salud
```bash
# Inicia el servidor
npm run dev

# En otra terminal, verifica la conexión
curl http://localhost:3000/health
```

#### Opción B: Usando el endpoint de integraciones
```bash
curl http://localhost:3000/api/integrations/status
```

Ambos endpoints mostrarán el estado de la conexión a Supabase.

## Verificación de Variables de Entorno

El código ahora valida automáticamente que las variables estén configuradas. Si faltan, verás un error al iniciar el servidor:

```
❌ Error: SUPABASE_URL y SUPABASE_KEY deben estar configuradas en .env
```

## Notas Importantes

- El archivo `.env` NO debe subirse a Git (debe estar en `.gitignore`)
- Usa `SUPABASE_KEY` (no `SUPABASE_ANON_KEY`) como nombre de variable
- La conexión se verifica automáticamente al iniciar el servidor

