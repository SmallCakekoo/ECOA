# Configuración de Supabase para el Panel de Admin

## 🔐 Autenticación Integrada con Supabase

El panel de administración ahora está integrado con Supabase para autenticación segura. Sigue estos pasos para configurarlo:

---

## 📋 Requisitos Previos

1. **Cuenta de Supabase**: Crea una cuenta en [supabase.com](https://supabase.com) si aún no tienes una.
2. **Proyecto de Supabase**: Asegúrate de tener un proyecto creado.

---

## ⚙️ Paso 1: Obtener Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, ve a **Settings** → **API**
3. Encontrarás:
   - **URL del Proyecto** (Project URL): `https://xxxxxxxxxxx.supabase.co`
   - **Clave Anónima** (anon/public key): `eyJhbGc...` (una cadena larga)

---

## 🔧 Paso 2: Configurar las Credenciales

Abre el archivo `frontend/public/admin/src/config.js` y reemplaza las credenciales de Supabase:

```javascript
SUPABASE: {
  URL: 'https://tu-proyecto.supabase.co', // ⚠️ Reemplaza con tu URL
  ANON_KEY: 'tu-clave-anonima-aqui', // ⚠️ Reemplaza con tu clave anónima
},
```

---

## 🗄️ Paso 3: Configurar la Base de Datos

### Estructura de la Tabla `users`

Tu tabla de usuarios en Supabase debe tener al menos estos campos:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL DEFAULT 'user',
  nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Importante: Campo `rol`

- Los usuarios con `rol = 'admin'` podrán acceder al panel de administración
- Los usuarios con `rol = 'user'` NO podrán acceder

---

## 🔐 Paso 4: Configurar Autenticación en Supabase

1. Ve a **Authentication** → **Settings** en tu proyecto de Supabase
2. Activa **Email Authentication**
3. (Opcional) Configura otras opciones según tus necesidades

---

## 👤 Paso 5: Crear un Usuario Admin

### Opción A: Desde Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Clic en **Add User**
3. Ingresa el email y contraseña
4. Luego, ve a **Table Editor** → **users**
5. Busca el usuario recién creado y cambia el campo `rol` a `'admin'`

### Opción B: Usando SQL

```sql
-- Crear usuario en la tabla users con rol admin
INSERT INTO users (email, rol, nombre)
VALUES ('admin@tudominio.com', 'admin', 'Administrador');
```

Luego, en **Authentication** → **Users**, agrega el mismo email con una contraseña.

---

## 🚀 Uso

Una vez configurado:

1. Abre el panel de admin: `http://localhost:3000/admin/login` (o tu URL de producción)
2. Ingresa el email y contraseña del usuario admin
3. El sistema verificará:
   - ✅ Que el usuario exista en Supabase Auth
   - ✅ Que el usuario tenga `rol = 'admin'` en la tabla `users`
4. Si todo es correcto, serás redirigido al dashboard

---

## 🔄 Desactivar Supabase (usar método tradicional)

Si quieres usar el método tradicional sin Supabase, simplemente cambia en `config.js`:

```javascript
AUTH: {
  // ...
  USE_SUPABASE: false // Cambiar a false
},
```

---

## 🐛 Solución de Problemas

### Error: "Supabase no se cargó correctamente"

- **Solución**: Verifica tu conexión a internet y que el script de Supabase se esté cargando correctamente en el HTML.

### Error: "Credenciales de Supabase no configuradas"

- **Solución**: Asegúrate de haber configurado correctamente `URL` y `ANON_KEY` en `config.js`.

### Error: "Usuario no es admin"

- **Solución**: Verifica que el campo `rol` en la tabla `users` esté configurado como `'admin'` (en minúsculas).

### Error: "Invalid login credentials"

- **Solución**: Verifica que el email y contraseña sean correctos en Supabase Auth.

---

## 🔒 Seguridad

### Políticas de Seguridad (RLS - Row Level Security)

Es recomendable activar RLS en la tabla `users`:

```sql
-- Activar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propia información
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Política: Solo admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.rol = 'admin'
  )
);
```

---

## 📝 Notas Adicionales

- **Tokens**: Los tokens de sesión de Supabase se almacenan en `localStorage` bajo la clave `admin_session`.
- **Expiración**: Los tokens de Supabase expiran automáticamente según la configuración de tu proyecto (por defecto, 1 hora).
- **Refresh**: El cliente de Supabase maneja automáticamente la renovación de tokens.

---

## 📚 Recursos

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

---

¡Todo listo! 🎉 Tu panel de admin ahora está integrado con Supabase.
