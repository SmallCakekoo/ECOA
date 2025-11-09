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
  const update = {};
  
  // Procesar 'name'
  if (payload.name !== undefined && payload.name !== null) {
    const nameValue = String(payload.name).trim();
    if (nameValue.length > 0) {
      update.name = nameValue;
    }
  }
  
  // NO procesar imagen - se maneja completamente en el frontend con localStorage
  // El campo 'image' o 'avatar_url' se ignora intencionalmente
  // para evitar errores si el campo no existe en Supabase
  
  console.log('📝 Payload recibido:', Object.keys(payload));
  console.log('📝 Campos a actualizar (solo name, imagen se maneja en localStorage):', Object.keys(update));
  
  return update;
}
