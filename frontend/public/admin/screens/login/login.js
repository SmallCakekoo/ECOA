document.addEventListener("DOMContentLoaded", () => {
  // Verificar si ya está autenticado
  if (window.AdminAPI && window.AdminAPI.isAuthenticated()) {
    window.location.href = "/admin/dashboard";
    return;
  }

  const togglePassword = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eye-icon");

  if (togglePassword && passwordInput && eyeIcon) {
    togglePassword.addEventListener("click", function (e) {
      e.preventDefault();

      if (passwordInput.type === "password") {
        // Mostrar contraseña
        passwordInput.type = "text";
        eyeIcon.setAttribute("data-icon", "mdi:eye-outline");
        console.log("Contraseña visible");
      } else {
        // Ocultar contraseña
        passwordInput.type = "password";
        eyeIcon.setAttribute("data-icon", "mdi:eye-off-outline");
        console.log("Contraseña oculta");
      }
    });
  }

  // Función para mostrar notificaciones
  function showNotification(message, type = "error") {
    window.AdminUtils.showNotification(message, type);
  }

  // Función para mostrar loading
  function showLoading(show = true) {
    const submitBtn = document.querySelector('button[type="submit"]');
    window.AdminUtils.showButtonLoading(submitBtn, show, "Iniciando sesión...");
  }

  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const remember = document.getElementById("remember").checked;

      // Validaciones básicas
      if (!email || !password) {
        showNotification("Por favor completa todos los campos");
        return;
      }

      if (!email.includes("@")) {
        showNotification("Por favor ingresa un email válido");
        return;
      }

      showLoading(true);

      try {
        // Esperar a que se cargue la API
        if (!window.AdminAPI) {
          await new Promise((resolve) => {
            const checkAPI = () => {
              if (window.AdminAPI) {
                resolve();
              } else {
                setTimeout(checkAPI, 100);
              }
            };
            checkAPI();
          });
        }

        console.log("API cargada, iniciando login...");
        // Solo usar email (la contraseña no se usa en autenticación simulada)
        const result = await window.AdminAPI.login(email, password);

        console.log("Resultado del login:", result);

        if (result && result.success) {
          // Verificar el rol del usuario
          if (result.data && result.data.rol === "admin") {
            showNotification(
              "¡Bienvenido al panel de administración!",
              "success"
            );

            console.log("Login exitoso, verificando autenticación...");

            // Verificar que la autenticación se guardó correctamente
            const isAuth = window.AdminAPI.isAuthenticated();
            console.log("¿Está autenticado después del login?", isAuth);

            if (isAuth) {
              console.log("Redirigiendo a dashboard...");
              // Pequeño delay para mostrar el mensaje de éxito
              setTimeout(() => {
                window.location.href = "/admin/dashboard";
              }, 500);
            } else {
              console.error("Error: No se pudo verificar la autenticación");
              showNotification("Error al verificar la autenticación", "error");
            }
          } else {
            showNotification(
              "Acceso denegado: Solo administradores pueden acceder",
              "error"
            );
          }
        } else {
          console.log("Login falló:", result);
          showNotification("Credenciales incorrectas", "error");
        }
      } catch (error) {
        console.error("Login error:", error);
        // Mostrar el mensaje de error específico
        const errorMsg =
          error.message || "Error al iniciar sesión. Intenta nuevamente.";
        showNotification(errorMsg, "error");
      } finally {
        showLoading(false);
      }
    });
  }

  const forgotLink = document.getElementById("forgot-link");

  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      showNotification(
        "Funcionalidad de recuperación de contraseña próximamente"
      );
    });
  }
});
