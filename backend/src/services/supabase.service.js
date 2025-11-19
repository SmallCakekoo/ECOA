import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Validar variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Error: SUPABASE_URL y SUPABASE_KEY deben estar configuradas en .env");
  throw new Error("Configuración de Supabase incompleta. Verifica tus variables de entorno.");
}

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
  },
});

// Función para verificar la conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("plants").select("id").limit(1);
    if (error) {
      console.error("❌ Error de conexión a Supabase:", error.message);
      return { connected: false, error: error.message };
    }
    return { connected: true, message: "Conexión a Supabase exitosa" };
  } catch (error) {
    console.error("❌ Error verificando conexión:", error.message);
    return { connected: false, error: error.message };
  }
}

export default supabase;
