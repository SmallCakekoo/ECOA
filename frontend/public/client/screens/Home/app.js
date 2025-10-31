const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
const API_BASE_URL = "https://ecoa-nine.vercel.app";

function resolvePlantImage(plant) {
  const url = plant.image || plant.image_url;
  if (!url) return "/client/src/assets/images/plant.png";
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}
console.log(USER_DATA);

// Verificar si hay datos de usuario
if (USER_DATA && USER_DATA.name) {
  document.querySelector(
    ".greeting"
  ).textContent = `Good Morning, ${USER_DATA.name}`;

  // Cargar plantas del usuario
  (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${USER_DATA.id}/plants`);
      const { success, data: plants, count } = await response.json();

      if (!success || count === 0) return;

      const plant = getMostRecentPlant(plants);

      document.querySelector(".subgreeting").style.display = "block";
      const lastPlantCard = document.querySelector(".last-plant-card");
      lastPlantCard.style.display = "flex";
      lastPlantCard.style.cursor = "pointer";

      // Al hacer clic en la tarjeta, ir a VirtualPet con el ID de la planta
      lastPlantCard.onclick = function () {
        console.log(
          "Navegando a VirtualPet con planta:",
          plant.name,
          "ID:",
          plant.id
        );
        window.location.href = `/client/screens/VirtualPet?id=${plant.id}`;
      };

      document.querySelector(".plant-name").textContent = plant.name;
      // Imagen de la última planta: usa el mismo campo 'image'
      const imgEl = document.querySelector(".last-plant-card .plant-image img");
      imgEl.src = resolvePlantImage(plant);

      fetchPlantMetrics(plant.id);
    } catch (error) {
      console.error("Error loading plants:", error);
    }
  })();
} else {
  // Si no hay usuario logueado, mostrar mensaje por defecto
  document.querySelector(".greeting").textContent = `Good Morning, Guest`;
  console.warn("No user data found. Please log in.");
}

function getMostRecentPlant(plants) {
  return [...plants].sort(
    (a, b) => new Date(b.registration_date) - new Date(a.registration_date)
  )[0];
}

async function fetchPlantMetrics(plantId) {
  const response = await fetch(`${API_BASE_URL}/plant_status/${plantId}`);
  const { success, data: plantMetrics } = await response.json();
  console.log(plantMetrics, success);

  if (!success) throw new Error("Failed to load plant metrics");
  const percent = plantMetrics.mood_index * 100;

  document.querySelector(".progress-text").textContent = percent + "%";
  // Animar progreso circular
  const circumference = 2 * Math.PI * 30;
  const progressCircle = document.getElementById("progressCircle");
  const offset = circumference - (percent / 100) * circumference;
  progressCircle.style.strokeDashoffset = offset;
}

// Actualizar hora
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  document.getElementById("current-time").textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 60000);

// Funciones de navegación (expuestas globalmente para onclick)
window.goToHome = function (event) {
  if (event) event.preventDefault();
  console.log("Navegando a Home");
  window.location.href = "/client/screens/Home";
};

window.goToPlants = function (event) {
  if (event) event.preventDefault();
  console.log("Navegando a Garden (todas las plantas)");
  window.location.href = "/client/screens/Garden";
};

window.goToProfile = function (event) {
  if (event) event.preventDefault();
  console.log("Navegando a Profile");
  window.location.href = "/client/screens/Profile";
};

// Adopt button - Redirige a página de adopción
document.getElementById("adoptBtn").addEventListener("click", () => {
  console.log("Adopt a new plant clicked");
  window.location.href = "/client/screens/Adopt";
});

// Actualizar estadísticas aleatoriamente
function updateStats() {
  const randomPlants = Math.floor(Math.random() * 1000) + 3000;
  document.getElementById(
    "statsText"
  ).textContent = `${randomPlants.toLocaleString()} plants adopted this week!`;
}

// Actualizar cada 10 segundos
setInterval(updateStats, 10000);
