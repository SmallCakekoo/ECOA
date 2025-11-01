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

  // Limitar tamaño de imagen a 500KB en base64 (~375KB original)
  // Si la imagen es muy grande, guardar null para evitar errores en Supabase
  let imageValue = image || null;
  if (imageValue && imageValue.startsWith('data:')) {
    // Estimar tamaño: base64 es ~33% más grande que el original
    const base64Length = imageValue.length - imageValue.indexOf(',') - 1;
    const estimatedOriginalSize = (base64Length * 3) / 4;
    
    if (estimatedOriginalSize > 500 * 1024) {
      console.warn('⚠️ Imagen muy grande, guardando null para evitar error en BD');
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
