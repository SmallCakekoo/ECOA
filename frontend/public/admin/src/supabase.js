// Cliente de Supabase para el panel de administración
// Importar desde CDN ya que estamos usando HTML/JS vanilla
// Nota: Asegúrate de agregar el script de Supabase en el HTML

class SupabaseClient {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) {
      return this.client;
    }

    // Esperar a que se cargue el script de Supabase
    await this.waitForSupabase();

    // Obtener las credenciales de la configuración
    const supabaseUrl = window.AdminConfig?.SUPABASE?.URL;
    const supabaseKey = window.AdminConfig?.SUPABASE?.ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("⚠️ Credenciales de Supabase no configuradas");
      throw new Error(
        "Credenciales de Supabase no configuradas. Verifica AdminConfig."
      );
    }

    try {
      // Crear cliente de Supabase
      this.client = supabase.createClient(supabaseUrl, supabaseKey);
      this.isInitialized = true;
      console.log("✅ Cliente de Supabase inicializado");
      return this.client;
    } catch (error) {
      console.error("❌ Error al inicializar Supabase:", error);
      throw error;
    }
  }

  async waitForSupabase() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 segundos

      const checkSupabase = () => {
        if (typeof supabase !== "undefined") {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(
            new Error(
              "Supabase no se cargó correctamente. Verifica la conexión a internet."
            )
          );
        } else {
          attempts++;
          setTimeout(checkSupabase, 100);
        }
      };

      checkSupabase();
    });
  }

  getClient() {
    if (!this.isInitialized || !this.client) {
      throw new Error("Supabase no está inicializado. Llama a init() primero.");
    }
    return this.client;
  }

  // === MÉTODOS DE AUTENTICACIÓN ===

  async signInWithEmail(email, password) {
    const client = await this.init();

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("✅ Login exitoso con Supabase:", data);
      return { success: true, data: data.user, session: data.session };
    } catch (error) {
      console.error("❌ Error en login de Supabase:", error);
      throw error;
    }
  }

  async signOut() {
    const client = await this.init();

    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;

      console.log("✅ Logout exitoso");
      return { success: true };
    } catch (error) {
      console.error("❌ Error en logout:", error);
      throw error;
    }
  }

  async getSession() {
    const client = await this.init();

    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;

      return data.session;
    } catch (error) {
      console.error("❌ Error al obtener sesión:", error);
      return null;
    }
  }

  async getUser() {
    const client = await this.init();

    try {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;

      return data.user;
    } catch (error) {
      console.error("❌ Error al obtener usuario:", error);
      return null;
    }
  }

  // === MÉTODOS DE BASE DE DATOS ===

  async getUserByEmail(email) {
    const client = await this.init();

    try {
      const { data, error } = await client
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("❌ Error al buscar usuario:", error);
      throw error;
    }
  }

  async getUserRole(userId) {
    const client = await this.init();

    try {
      const { data, error } = await client
        .from("users")
        .select("rol")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return data?.rol;
    } catch (error) {
      console.error("❌ Error al obtener rol:", error);
      return null;
    }
  }

  // Suscribirse a cambios de autenticación
  onAuthStateChange(callback) {
    if (!this.client) {
      console.warn("⚠️ Supabase no inicializado para onAuthStateChange");
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return this.client.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Estado de autenticación cambió:", event);
      callback(event, session);
    });
  }
}

// Crear instancia global
window.SupabaseClient = new SupabaseClient();
