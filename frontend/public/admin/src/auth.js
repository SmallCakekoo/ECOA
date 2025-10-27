// Sistema de autenticación para el panel de administración
class AuthManager {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  init() {
    // Verificar autenticación al cargar
    this.checkAuth();
    this.isInitialized = true;
  }

  checkAuth() {
    // Solo verificar si no estamos en la página de login
    if (window.location.pathname.includes('/login/')) {
      return;
    }

    // Esperar a que se cargue la API
    const checkAPI = () => {
      if (window.AdminAPI) {
        if (!window.AdminAPI.isAuthenticated()) {
          console.log('Usuario no autenticado, redirigiendo al login');
          window.location.href = './screens/login/index.html';
        } else {
          console.log('Usuario autenticado correctamente');
        }
      } else {
        setTimeout(checkAPI, 100);
      }
    };
    
    checkAPI();
  }

  // Función para verificar autenticación en cualquier momento
  static verifyAuth() {
    if (window.AdminAPI && !window.AdminAPI.isAuthenticated()) {
      window.location.href = './screens/login/index.html';
      return false;
    }
    return true;
  }

  // Función para logout
  static logout() {
    if (window.AdminAPI) {
      window.AdminAPI.logout();
    }
    window.location.href = './screens/login/index.html';
  }
}

// Inicializar el manager de autenticación
window.AuthManager = new AuthManager();
