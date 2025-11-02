const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
const API_BASE_URL = "https://ecoa-backend-three.vercel.app";

function resolvePlantImage(plant) {
  const url = plant.image || plant.image_url;
  if (!url) {
    // Usar una imagen placeholder de Unsplash en lugar de un archivo local
    return "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=400&fit=crop";
  }
  // Si es data URL, devolver directamente
  if (url.startsWith("data:")) return url;
  // Si es URL absoluta, devolver directamente
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Si es relativa, construir URL completa del backend
  return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
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
      const response = await fetch(
        `${API_BASE_URL}/users/${USER_DATA.id}/plants`
      );
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
  try {
    // Usar query params para buscar por plant_id y obtener el más reciente
    const response = await fetch(`${API_BASE_URL}/plant_status?plant_id=${plantId}`);
    
    if (!response.ok) {
      console.warn(`No se encontró estado para planta ${plantId}`);
      return;
    }
    
    const { success, data: statuses } = await response.json();
    
    if (!success || !statuses || statuses.length === 0) {
      console.warn(`No hay estados registrados para la planta ${plantId}`);
      return;
    }

    // Tomar el más reciente (ya viene ordenado por fecha descendente)
    const plantMetrics = statuses[0];
    const percent = plantMetrics.mood_index ? plantMetrics.mood_index * 100 : 0;

    const progressText = document.querySelector(".progress-text");
    if (progressText) {
      progressText.textContent = percent + "%";
    }
    
    // Animar progreso circular
    const circumference = 2 * Math.PI * 30;
    const progressCircle = document.getElementById("progressCircle");
    if (progressCircle) {
      const offset = circumference - (percent / 100) * circumference;
      progressCircle.style.strokeDashoffset = offset;
    }
  } catch (error) {
    console.error("Error fetching plant metrics:", error);
    // No lanzar error para no romper el flujo si no hay métricas
  }
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
