// Configuración del cliente Supabase para el panel de administración
// Este cliente se conecta directamente desde el navegador a Supabase para Realtime

const SUPABASE_CONFIG = {
  url: 'https://cjkatlisqqvbvvwlllug.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqa2F0bGlzcXF2YnZ2d2xsbHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzE5NjYsImV4cCI6MjA3MzYwNzk2Nn0.wGHpSyRnJhN68w_4DCVryKXh91fdj0VxkpGzfY6h3LE'
};

// Inicializar cliente de Supabase (requiere que la librería esté cargada)
let supabaseClient = null;

function initSupabaseClient() {
  if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded. Make sure to include the Supabase CDN script.');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    console.log('✅ Supabase client initialized for admin');
  }

  return supabaseClient;
}

// Exportar globalmente para uso en otros scripts
window.SupabaseAdmin = {
  getClient: initSupabaseClient,
  config: SUPABASE_CONFIG
};
