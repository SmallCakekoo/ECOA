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
  // Obtener el plantId de la URL si existe
  const params = new URLSearchParams(window.location.search);
  const plantId = params.get("id");
  if (plantId) {
    window.location.href = `/client/screens/Shop?id=${plantId}`;
  } else {
    window.location.href = "/client/screens/Shop";
  }
};
