
import { createClient } from '@supabase/supabase-js';

// En el admin también usamos las mismas variables de entorno
// Asegúrate de que estén expuestas en Vercel o en tu .env local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in Admin!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
