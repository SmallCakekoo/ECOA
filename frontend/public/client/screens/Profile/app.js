const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));

// Actualizar la hora actual
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const timeElement = document.getElementById("current-time");
  if (timeElement) {
    timeElement.textContent = `${hours}:${minutes}`;
  }
}

// Actualizar la hora al cargar la página
updateTime();

// Actualizar la hora cada minuto
setInterval(updateTime, 60000);

// Cargar información del usuario desde localStorage
async function loadUserData() {
  if (!USER_DATA) {
    console.error("No user data found");
    window.location.href = "/client/screens/LogIn";
    return;
  }

  document.getElementById("userName").textContent = USER_DATA.name;
  // document.getElementById('profileImage').src = 'user-profile.jpg'; TODO: set USER_DATA.img when db holds it

  try {
    const response = await fetch(
      `https://ecoa-backend-three.vercel.app/users/${USER_DATA.id}/plants`
    );
    const { success, count } = await response.json();
    console.log(success, count);

    if (success) document.getElementById("plantsCount").textContent = count;
  } catch (error) {
    console.error("Error loading user plants:", error);
  }
}

// Cargar datos al iniciar
window.addEventListener("DOMContentLoaded", loadUserData);

// Funciones de navegación del navbar (expuestas globalmente)
window.goToHome = function () {
  console.log("Navegando a Home");
  window.location.href = "/client/screens/Home";
};

window.goToPlants = function () {
  console.log("Navegando a Virtual Pet");
  window.location.href = "/client/screens/VirtualPet";
};

window.goToGlobe = function () {
  console.log("Navegando a Globe/Community");
  // Implementar cuando exista la página
  alert("Globe feature coming soon!");
};

window.goToProfile = function () {
  console.log("Ya estás en Profile");
  // Ya estamos aquí, no hacer nada
};

// Funciones de ajustes (expuestas globalmente)
window.goToChangePassword = function () {
  console.log("Navegando a Change Password");
  // Aquí iría la navegación a la página de cambio de contraseña
  alert("Change Password feature - Create this page next!");
};

window.goToEditProfile = function () {
  console.log("Navegando a Edit Profile");
  // Aquí iría la navegación a la página de editar perfil
  alert("Edit Profile feature - Create this page next!");
};

window.goToNotifications = function () {
  console.log("Navegando a Notifications");
  // Aquí iría la navegación a la página de notificaciones
  alert("Notifications settings - Create this page next!");
};

window.goToPrivacy = function () {
  console.log("Navegando a Privacy & Security");
  // Aquí iría la navegación a la página de privacidad
  alert("Privacy & Security settings - Create this page next!");
};

window.goToAbout = function () {
  console.log("Navegando a About");
  // Aquí iría la navegación a la página de acerca de
  alert("About ECOA - Version 1.0.0");
};

// Función para cerrar sesión (expuesta globalmente)
window.handleLogout = function () {
  // Confirmar antes de cerrar sesión
  const confirmLogout = confirm("Are you sure you want to log out?");

  if (confirmLogout) {
    console.log("Cerrando sesión...");

    // Limpiar datos de sesión del localStorage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("USER_DATA");

    // Opcional: Mantener algunos datos si quieres que persistan
    // localStorage.removeItem('userName');
    // localStorage.removeItem('userImage');

    // Mostrar mensaje
    alert("You have been logged out successfully");

    // Redirigir a la página de inicio de sesión
    window.location.href = "/client/screens/LogIn";
  }
};
