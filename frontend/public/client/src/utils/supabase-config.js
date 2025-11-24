// Configuración del cliente Supabase para el cliente (usuario)
// Este cliente se conecta directamente desde el navegador a Supabase para Realtime

const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Inicializar cliente de Supabase (requiere que la librería esté cargada)
let supabaseClient = null;

function initSupabaseClient() {
  if (typeof supabase === "undefined") {
    console.error(
      "❌ Supabase library not loaded. Make sure to include the Supabase CDN script."
    );
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }
    );
    console.log("✅ Supabase client initialized for client");
  }

  return supabaseClient;
}

// Exportar globalmente para uso en otros scripts
window.SupabaseClient = {
  getClient: initSupabaseClient,
  config: SUPABASE_CONFIG,
};
