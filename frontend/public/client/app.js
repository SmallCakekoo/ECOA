import "./screens/LogIn/app.js";
import "./screens/SingUp/app.js";
import "./screens/Home/app.js";

class Router {
  constructor() {
    this.routes = {
      "/": "login-screen",
      "/login": "login-screen",
      "/signup": "signup-screen",
      "/home": "home-screen",
      "/plants": "home-screen", // Por ahora redirigir a home
      "/community": "home-screen", // Por ahora redirigir a home
      "/profile": "home-screen", // Por ahora redirigir a home
      "/adopt": "home-screen", // Por ahora redirigir a home
      "/garden": "home-screen", // Por ahora redirigir a home
    };

    this.currentComponent = null;
    this.init();
  }

  init() {
    // Escuchar eventos de navegación
    window.addEventListener("popstate", () => this.handleRoute());

    // Escuchar eventos personalizados del login
    document.addEventListener("login-submit", (e) => {
      console.log("Login data:", e.detail);
      // Aquí puedes hacer la validación y navegar
      this.navigate("/home");
    });

    document.addEventListener("navigate-signup", () => {
      this.navigate("/signup");
    });

    document.addEventListener("navigate-signin", () => {
      this.navigate("/login");
    });

    // Escuchar eventos de navegación desde la home page
    document.addEventListener("navigate", (e) => {
      const { page } = e.detail;
      this.navigate(`/${page}`);
    });

    document.addEventListener("adopt-plant", () => {
      this.navigate("/adopt");
    });

    document.addEventListener("view-garden", () => {
      this.navigate("/garden");
    });

    // Cargar ruta inicial
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    let componentName = this.routes[path];

    // Si no encuentra la ruta, usar home como fallback
    if (!componentName) {
      console.log(`Ruta no encontrada: ${path}, usando home como fallback`);
      componentName = this.routes["/home"];
    }

    this.renderComponent(componentName);

    // Actualizar el estado activo de la navbar después de un pequeño delay
    setTimeout(() => {
      this.updateActiveNavItem();
    }, 100);
  }

  renderComponent(componentName) {
    const app = document.getElementById("app");

    // Limpiar el componente anterior si existe
    if (this.currentComponent) {
      this.currentComponent.remove();
    }

    app.innerHTML = "";

    const component = document.createElement(componentName);
    app.appendChild(component);
    this.currentComponent = component;
  }

  navigate(path) {
    // Solo navegar si la ruta es diferente
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      this.handleRoute();
    }
  }

  updateActiveNavItem() {
    const currentPath = window.location.pathname;
    const homeScreen = document.querySelector("home-screen");

    if (homeScreen && homeScreen.shadowRoot) {
      const navBtns = homeScreen.shadowRoot.querySelectorAll(".nav-btn");
      navBtns.forEach((btn) => {
        btn.classList.remove("active");
        const page = btn.getAttribute("data-page");

        // Mapear rutas a páginas
        let isActive = false;
        if (currentPath === `/${page}`) {
          isActive = true;
        } else if (currentPath === "/" && page === "home") {
          isActive = true;
        } else if (currentPath === "/home" && page === "home") {
          isActive = true;
        }

        if (isActive) {
          btn.classList.add("active");
        }
      });
    }
  }
}

// Inicializar el router cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new Router();
});
