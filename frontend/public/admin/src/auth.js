// Sistema de autenticación para el panel de administración
class AuthManager {
  constructor() {
    this.isInitialized = false;
    this.supabaseClient = null;
    this.init();
  }

  async init() {
    // Inicializar Supabase si está habilitado
    if (window.AdminConfig?.AUTH?.USE_SUPABASE) {
      try {
        await window.SupabaseClient.init();
        this.supabaseClient = window.SupabaseClient;

        // Suscribirse a cambios de autenticación
        this.supabaseClient.onAuthStateChange((event, session) => {
          this.handleAuthChange(event, session);
        });

        console.log("✅ Supabase Auth inicializado");
      } catch (error) {
        console.error("❌ Error al inicializar Supabase Auth:", error);
      }
    }

    // Verificar autenticación al cargar
    await this.checkAuth();
    this.isInitialized = true;
  }

  handleAuthChange(event, session) {
    console.log("🔐 Evento de autenticación:", event);

    if (event === "SIGNED_OUT") {
      // Limpiar localStorage
      this.clearAuth();

      // Redirigir al login si no estamos ya ahí
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/admin/login";
      }
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      // Guardar sesión
      if (session) {
        localStorage.setItem(
          window.AdminConfig?.AUTH?.SESSION_KEY || "admin_session",
          JSON.stringify(session)
        );
      }
    }
  }

  async checkAuth() {
    // Solo verificar si no estamos en la página de login
    if (window.location.pathname.includes("/login")) {
      console.log("✅ Estamos en la página de login, no verificar auth");
      return;
    }

    console.log("🔐 Verificando autenticación...");

    // Si usa Supabase
    if (window.AdminConfig?.AUTH?.USE_SUPABASE && this.supabaseClient) {
      try {
        const session = await this.supabaseClient.getSession();

        if (!session) {
          console.log("❌ No hay sesión de Supabase, redirigiendo al login");
          window.location.href = "/admin/login";
          return;
        }

        // Verificar que el usuario tenga rol de admin
        const user = await this.supabaseClient.getUser();
        if (user) {
          const role = await this.supabaseClient.getUserRole(user.id);

          if (role !== "admin") {
            console.log("❌ Usuario no es admin, redirigiendo al login");
            await this.logout();
            window.location.href = "/admin/login";
            return;
          }
        }

        console.log("✅ Usuario autenticado correctamente con Supabase");
      } catch (error) {
        console.error("❌ Error verificando autenticación:", error);
        window.location.href = "/admin/login";
      }
    } else {
      // Usar autenticación tradicional
      const checkAPI = () => {
        if (window.AdminAPI) {
          if (!window.AdminAPI.isAuthenticated()) {
            console.log("❌ Usuario no autenticado, redirigiendo al login");
            window.location.href = "/admin/login";
          } else {
            console.log("✅ Usuario autenticado correctamente");
          }
        } else {
          setTimeout(checkAPI, 100);
        }
      };

      checkAPI();
    }
  }

  clearAuth() {
    localStorage.removeItem(
      window.AdminConfig?.AUTH?.TOKEN_KEY || "admin_token"
    );
    localStorage.removeItem(window.AdminConfig?.AUTH?.USER_KEY || "admin_user");
    localStorage.removeItem(
      window.AdminConfig?.AUTH?.SESSION_KEY || "admin_session"
    );
  }

  // Función para verificar autenticación en cualquier momento
  static async verifyAuth() {
    if (window.AdminConfig?.AUTH?.USE_SUPABASE && window.SupabaseClient) {
      try {
        const session = await window.SupabaseClient.getSession();
        if (!session) {
          console.log("❌ Verificación falló, redirigiendo al login");
          window.location.href = "/admin/login";
          return false;
        }
        return true;
      } catch (error) {
        console.error("❌ Error en verificación:", error);
        window.location.href = "/admin/login";
        return false;
      }
    } else {
      if (window.AdminAPI && !window.AdminAPI.isAuthenticated()) {
        console.log("❌ Verificación falló, redirigiendo al login");
        window.location.href = "/admin/login";
        return false;
      }
      return true;
    }
  }

  // Función para logout
  static async logout() {
    console.log("🚪 Cerrando sesión...");

    if (window.AdminConfig?.AUTH?.USE_SUPABASE && window.SupabaseClient) {
      try {
        await window.SupabaseClient.signOut();
      } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
      }
    }

    if (window.AdminAPI) {
      window.AdminAPI.logout();
    }

    // Limpiar localStorage
    localStorage.removeItem(
      window.AdminConfig?.AUTH?.TOKEN_KEY || "admin_token"
    );
    localStorage.removeItem(window.AdminConfig?.AUTH?.USER_KEY || "admin_user");
    localStorage.removeItem(
      window.AdminConfig?.AUTH?.SESSION_KEY || "admin_session"
    );

    window.location.href = "/admin/login";
  }
}

// Inicializar el manager de autenticación
window.AuthManager = new AuthManager();
