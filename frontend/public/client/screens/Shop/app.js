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

// Función para volver atrás
function goBack() {
  window.history.back();
}

// Funciones de navegación
function goToHome(event) {
  if (event) event.preventDefault();
  window.location.href = "https://ecoa-frontend.vercel.app/client/screens/Home";
}

function goToPlants(event) {
  if (event) event.preventDefault();
  window.location.href = "https://ecoa-frontend.vercel.app/client/screens/VirtualPet";
}

function goToProfile(event) {
  if (event) event.preventDefault();
  window.location.href = "https://ecoa-frontend.vercel.app/client/screens/Profile";
}

// Función para ir a Shop Feedback Success
function goToShopFeedback() {
  window.location.href = "https://ecoa-frontend.vercel.app/client/screens/ShopFeedback/success";
}