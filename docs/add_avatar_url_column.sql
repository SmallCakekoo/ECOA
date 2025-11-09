-- Script SQL para agregar la columna avatar_url a la tabla users
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columna avatar_url si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Opcional: Agregar comentario a la columna
COMMENT ON COLUMN users.avatar_url IS 'URL o data URL de la imagen de perfil del usuario';

-- Verificar que la columna fue agregada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar_url';

