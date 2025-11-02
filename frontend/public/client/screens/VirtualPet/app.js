const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
const API_BASE_URL = "https://ecoa-backend-three.vercel.app";

// Obtener el ID de la planta desde la URL
const params = new URLSearchParams(window.location.search);
const plantId = params.get("id");

// Si no hay ID, redirigir a Garden
if (!plantId) {
  console.error("No plant ID provided");
  window.location.href = "/client/screens/Garden";
}

// Función para obtener la URL de la imagen de la planta
function getPlantImageUrl(plant) {
  const url = plant.image || plant.image_url;
  if (url) {
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:")
    ) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  }
  return "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=400&fit=crop";
}

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

// Cargar datos de la planta
(async function loadPlantData() {
  try {
    // Cargar datos básicos de la planta
    const plantResponse = await fetch(`${API_BASE_URL}/plants/${plantId}`);
    const { success: plantSuccess, data: plant } = await plantResponse.json();

    if (!plantSuccess || !plant) {
      throw new Error("Plant not found");
    }

    // Actualizar título y nombre en el DOM
    document.title = `${plant.name} - Plant Detail`;
    const headerTitle = document.querySelector(".header-title");
    if (headerTitle) {
      headerTitle.textContent = plant.name;
    }

    // Actualizar imagen de la planta
    const plantImage = document.querySelector(".plant-image-container img");
    if (plantImage) {
      plantImage.src = getPlantImageUrl(plant);
      plantImage.alt = `${plant.name} Plant`;
      plantImage.onerror = function () {
        this.src =
          "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=400&fit=crop";
      };
    }

    // Cargar métricas (plant_stats)
    try {
      const statsResponse = await fetch(
        `${API_BASE_URL}/plant_stats/${plantId}`
      );
      const { success: statsSuccess, data: stats } = await statsResponse.json();

      if (statsSuccess && stats) {
        const stateButtons = document.querySelectorAll(".state-button");
        if (stateButtons.length >= 3) {
          // Botón 1: Sol/Luz
          const lightText = document.createElement("p");
          lightText.textContent = (stats.light || 0) + "%";
          stateButtons[0].appendChild(lightText);

          // Botón 2: Agua/Humedad del suelo
          const waterText = document.createElement("p");
          waterText.textContent = (stats.soil_moisture || 0) + "%";
          stateButtons[1].appendChild(waterText);

          // Botón 3: Temperatura
          const tempText = document.createElement("p");
          tempText.textContent = (stats.temperature || 0) + "°C";
          stateButtons[2].appendChild(tempText);
        }
      }
    } catch (error) {
      console.warn("Could not load plant stats:", error);
    }

    // Cargar estado (plant_status)
    try {
      const statusResponse = await fetch(
        `${API_BASE_URL}/plant_status/${plantId}`
      );
      const { success: statusSuccess, data: status } =
        await statusResponse.json();

      if (statusSuccess && status) {
        const stateButtons = document.querySelectorAll(".state-button");
        if (stateButtons.length >= 4) {
          // Botón 4: Mood/Estado
          const moodText = document.createElement("p");
          const moodPercent = Math.round((status.mood_index || 0) * 100);
          moodText.textContent = moodPercent + "%";
          stateButtons[3].appendChild(moodText);

          // Opcional: cambiar el ícono según el mood
          if (status.mood_face) {
            stateButtons[3].innerHTML = `${status.mood_face}<p>${moodPercent}%</p>`;
          }
        }
      }
    } catch (error) {
      console.warn("Could not load plant status:", error);
    }
  } catch (error) {
    console.error("Error loading plant data:", error);
    alert("No se pudo cargar la información de la planta");
    window.location.href = "/client/screens/Garden";
  }
})();

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
  console.log("Navegando a Garden");
  window.location.href = "/client/screens/Garden";
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
