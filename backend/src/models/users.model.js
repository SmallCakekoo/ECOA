import crypto from "crypto";

export function createUserModel(payload) {
  const { name, email, rol } = payload;
  if (!name) {
    throw new Error("Nombre es requerido");
  }
  return {
    id: crypto.randomUUID(), // Generar UUID para el campo id
    name,
    email: email || null,
    rol: rol || "donante", // rol por defecto: donante
    // registration_date se agrega automáticamente con default: now() en la DB
  };
}

export function sanitizeUserUpdate(payload) {
  // Solo permitir campos que existen en la tabla users
  const allowed = ["name", "email", "rol"];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined) update[k] = payload[k];
  });
  
  // Procesar campo 'image' o 'avatar_url' si existe (mapear a avatar_url para la BD)
  const imageValue = payload.image !== undefined ? payload.image : payload.avatar_url;
  if (imageValue !== undefined) {
    try {
      if (typeof imageValue === 'string' && imageValue.startsWith('data:')) {
        const maxDataUrlLength = 150 * 1024; // ~150KB de data URL
        if (imageValue.length > maxDataUrlLength) {
          console.warn(`⚠️ Imagen de perfil muy grande (${Math.round(imageValue.length / 1024)}KB), ignorando`);
        } else {
          // Validar formato de data URL
          const parts = imageValue.split(',');
          if (parts.length >= 2 && parts[0].includes('data:') && parts[0].includes('base64')) {
            update.avatar_url = imageValue;
            console.log(`✅ Imagen de perfil validada, tamaño: ${Math.round(imageValue.length / 1024)}KB`);
          } else {
            console.warn('⚠️ Data URL mal formada en actualización de usuario, ignorando');
          }
        }
      } else if (typeof imageValue === 'string' && (imageValue.startsWith('http://') || imageValue.startsWith('https://'))) {
        // Permitir URLs externas
        update.avatar_url = imageValue;
        console.log(`✅ URL externa de imagen aceptada: ${imageValue.substring(0, 50)}...`);
      } else if (imageValue === null || imageValue === '') {
        update.avatar_url = null;
        console.log('✅ Imagen de perfil eliminada (null)');
      } else {
        console.warn(`⚠️ Tipo de imagen no válido: ${typeof imageValue}, ignorando`);
      }
    } catch (e) {
      console.error('❌ Error procesando imagen de perfil:', e.message);
      // No agregar el campo si hay error, pero continuar con otros campos
    }
  }
  
  console.log('📝 Campos a actualizar:', Object.keys(update));
  return update;
}
