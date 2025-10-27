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

// Función para volver a Garden (expuesta globalmente)
window.goToGarden = function () {
  window.location.href = "/client/screens/Garden";
};

// Funciones de navegación del navbar (expuestas globalmente)
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

// Funciones para los botones de accesorios (expuestas globalmente)
window.goToShopSuccess = function () {
  console.log("Navegando a Shop Feedback Success");
  window.location.href = "/client/screens/ShopFeedback/success";
};

window.goToShopError = function () {
  console.log("Navegando a Shop Feedback Error");
  window.location.href = "/client/screens/ShopFeedback/error";
};

// Función para el botón View More (expuesta globalmente)
window.goToShop = function () {
  console.log("Navegando a Shop");
  window.location.href = "/client/screens/Shop";
};
