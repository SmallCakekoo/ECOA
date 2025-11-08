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
  
  // TEMPORALMENTE DESHABILITADO: Procesar campo 'image' o 'avatar_url'
  // El campo avatar_url puede no existir en la tabla, así que lo ignoramos por ahora
  // TODO: Agregar el campo avatar_url a la tabla users en Supabase antes de habilitar esto
  /*
  const imageValue = payload.image !== undefined ? payload.image : payload.avatar_url;
  if (imageValue !== undefined && imageValue !== null && imageValue !== '') {
    try {
      if (typeof imageValue === 'string' && imageValue.startsWith('data:')) {
        const maxDataUrlLength = 150 * 1024; // ~150KB de data URL
        if (imageValue.length > maxDataUrlLength) {
          console.warn(`⚠️ Imagen de perfil muy grande (${Math.round(imageValue.length / 1024)}KB), ignorando`);
        } else {
          const parts = imageValue.split(',');
          if (parts.length >= 2 && parts[0].includes('data:') && parts[0].includes('base64')) {
            update.avatar_url = imageValue;
            console.log(`✅ Imagen de perfil validada, tamaño: ${Math.round(imageValue.length / 1024)}KB`);
          }
        }
      } else if (typeof imageValue === 'string' && (imageValue.startsWith('http://') || imageValue.startsWith('https://'))) {
        update.avatar_url = imageValue;
      }
    } catch (e) {
      console.error('❌ Error procesando imagen de perfil:', e.message);
    }
  }
  */
  console.log('📝 Campos a actualizar:', Object.keys(update));
  console.log('⚠️ NOTA: avatar_url está temporalmente deshabilitado hasta que se agregue el campo a la tabla');
  return update;
}
