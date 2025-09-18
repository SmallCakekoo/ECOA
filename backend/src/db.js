import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase (hardcoded)
const supabaseUrl = "urlhere";
const supabaseAnonKey = "keyhere";

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para manejar errores de Supabase
export const handleSupabaseError = (error, res) => {
  console.error("Error de Supabase:", error);

  if (error.code === "PGRST116") {
    return res.status(404).json({
      success: false,
      message: "Recurso no encontrado",
    });
  }

  if (error.code === "23505") {
    return res.status(400).json({
      success: false,
      message: "El recurso ya existe",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
};

// Función para validar UUID
export const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
