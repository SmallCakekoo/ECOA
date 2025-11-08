// Actualizar hora
function updateTime() {
  var now = new Date();
  var hours = now.getHours().toString();
  var minutes = now.getMinutes().toString();

  if (hours.length === 1) hours = "0" + hours;
  if (minutes.length === 1) minutes = "0" + minutes;

  var timeElement = document.getElementById("current-time");
  if (timeElement) {
    timeElement.textContent = hours + ":" + minutes;
  }
}

updateTime();
setInterval(updateTime, 60000);

// Mostrar mensaje de error específico si existe
document.addEventListener("DOMContentLoaded", function () {
  const errorMessageElement = document.getElementById("errorMessage");
  if (errorMessageElement) {
    const storedError = sessionStorage.getItem("adoptionError");
    if (storedError) {
      errorMessageElement.textContent = storedError;
      // Limpiar el mensaje después de mostrarlo
      sessionStorage.removeItem("adoptionError");
    }
  }
});

// Funciones de navegación (expuestas globalmente)
window.goToHome = function (event) {
  if (event) event.preventDefault();
  console.log("Navegando a Home");
  window.location.href = "/client/screens/Home";
};

window.goToPlants = function (event) {
  if (event) event.preventDefault();
  console.log("Navegando a Virtual Pet");
  window.location.href = "/client/screens/VirtualPet";
};

window.goToProfile = function (event) {
  if (event) event.preventDefault();
  console.log("Navegando a Profile");
  window.location.href = "/client/screens/Profile";
};

// Función para volver atrás
window.goBack = function () {
  console.log("Volviendo atrás...");
  window.history.back();
};

// Función para ir a Shop
window.goToShop = function () {
  console.log("Volviendo a Shop...");
  window.location.href = "/client/screens/Shop";
};
