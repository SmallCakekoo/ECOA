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
  const allowed = ["name", "email", "rol", "image"];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined) update[k] = payload[k];
  });
  
  // Validar y limitar tamaño de imagen si se proporciona
  if (update.image && typeof update.image === 'string') {
    if (update.image.startsWith('data:')) {
      const maxDataUrlLength = 150 * 1024; // ~150KB de data URL
      if (update.image.length > maxDataUrlLength) {
        console.warn(`⚠️ Imagen de perfil muy grande (${Math.round(update.image.length / 1024)}KB), guardando null`);
        update.image = null;
      } else {
        // Validar formato de data URL
        try {
          const parts = update.image.split(',');
          if (parts.length < 2 || !parts[0] || !parts[1]) {
            console.warn('⚠️ Data URL mal formada en actualización de usuario, guardando null');
            update.image = null;
          } else {
            const header = parts[0];
            if (!header.includes('data:') || !header.includes('base64')) {
              console.warn('⚠️ Data URL sin formato correcto en actualización de usuario, guardando null');
              update.image = null;
            }
          }
        } catch (e) {
          console.warn('⚠️ Error validando data URL de usuario, guardando null:', e.message);
          update.image = null;
        }
      }
    }
  }
  
  return update;
}
