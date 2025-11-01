import crypto from "crypto";

export function createPlantModel(payload) {
  const {
    user_id,
    foundation_id,
    name,
    species,
    description,
    image,
    device_id,
    is_adopted = false,
  } = payload;

  if (!name || !species) {
    throw new Error("name y species son requeridos");
  }

  // Limitar tamaño de imagen a 250KB en base64 (~187KB original)
  // Si la imagen es muy grande, guardar null para evitar errores en Supabase
  let imageValue = image || null;
  if (imageValue && typeof imageValue === 'string') {
    // Si es data URL, validar tamaño de forma más estricta
    if (imageValue.startsWith('data:')) {
      // Limitar el string completo a ~250KB para evitar problemas con Supabase TEXT
      // (margen de seguridad más conservador)
      const maxDataUrlLength = 250 * 1024; // ~250KB de data URL
      
      if (imageValue.length > maxDataUrlLength) {
        console.warn(`⚠️ Imagen muy grande (${Math.round(imageValue.length / 1024)}KB), guardando null para evitar error en BD`);
        imageValue = null;
      } else {
        // Validar que la data URL esté bien formada
        try {
          // Intentar parsear para verificar formato
          const [header, data] = imageValue.split(',');
          if (!header || !data) {
            console.warn('⚠️ Data URL mal formada, guardando null');
            imageValue = null;
          }
        } catch (e) {
          console.warn('⚠️ Error validando data URL, guardando null:', e.message);
          imageValue = null;
        }
      }
    }
    // Si es URL externa o relativa, validar que no esté vacía
    else if (imageValue.trim() === '') {
      imageValue = null;
    }
  }

  return {
    id: crypto.randomUUID(), // Generar UUID para el campo id
    name,
    species,
    description: description || null,
    image: imageValue,
    user_id: user_id || null,
    foundation_id: foundation_id || null,
    device_id: device_id || null,
    is_adopted,
    // registration_date se agrega automáticamente con default: now() en la DB
  };
}

export function sanitizePlantUpdate(payload) {
  const blocked = new Set(["id", "registration_date"]);
  const allowed = [
    "name",
    "species",
    "description",
    "image",
    "user_id",
    "foundation_id",
    "device_id",
    "is_adopted",
  ];
  const update = {};

  Object.keys(payload || {}).forEach((k) => {
    if (!blocked.has(k) && allowed.includes(k) && payload[k] !== undefined) {
      update[k] = payload[k];
    }
  });

  return update;
}

// Esta función ya no es necesaria ya que plant_stats es una tabla separada
// Mantenemos por compatibilidad pero vacía
export function sanitizePlantMetrics(payload) {
  // Las métricas ahora van a la tabla plant_stats
  return {};
}
