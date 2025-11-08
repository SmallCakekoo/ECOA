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
  // Nota: El campo 'image' puede no existir en la tabla, así que lo excluimos por ahora
  const allowed = ["name", "email", "rol"];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined) update[k] = payload[k];
  });
  
  // Si se envía 'image', lo ignoramos silenciosamente ya que el campo puede no existir en la BD
  // En el futuro, si se agrega el campo 'image' a la tabla users, se puede descomentar:
  /*
  if (payload.image !== undefined) {
    if (typeof payload.image === 'string' && payload.image.startsWith('data:')) {
      const maxDataUrlLength = 150 * 1024; // ~150KB de data URL
      if (payload.image.length > maxDataUrlLength) {
        console.warn(`⚠️ Imagen de perfil muy grande (${Math.round(payload.image.length / 1024)}KB), ignorando`);
      } else {
        // Validar formato de data URL
        try {
          const parts = payload.image.split(',');
          if (parts.length >= 2 && parts[0].includes('data:') && parts[0].includes('base64')) {
            update.image = payload.image;
          } else {
            console.warn('⚠️ Data URL mal formada en actualización de usuario, ignorando');
          }
        } catch (e) {
          console.warn('⚠️ Error validando data URL de usuario, ignorando:', e.message);
        }
      }
    } else if (payload.image === null || payload.image === '') {
      update.image = null;
    }
  }
  */
  
  return update;
}
