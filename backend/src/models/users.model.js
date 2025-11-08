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
  // SOLO permitir 'name' por ahora para asegurar que funcione
  // Una vez que funcione, podemos agregar otros campos
  const update = {};
  
  // Solo procesar 'name' que es el campo más básico y seguro
  if (payload.name !== undefined && payload.name !== null) {
    const nameValue = String(payload.name).trim();
    if (nameValue.length > 0) {
      update.name = nameValue;
    }
  }
  
  // Ignorar todos los demás campos por ahora para evitar errores
  console.log('📝 Payload recibido:', Object.keys(payload));
  console.log('📝 Campos a actualizar (solo name):', Object.keys(update));
  console.log('📝 Valor de name:', update.name);
  
  return update;
}
