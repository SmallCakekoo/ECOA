const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
const API_BASE_URL = "https://ecoabackendecoa.vercel.app";

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

// Funciones de navegación (expuestas globalmente)
window.goToHome = function (event) {
  if (event) event.preventDefault();
  console.log("Navegando a Home");
  window.location.href = "/client/screens/Home";
};

window.goToPlants = function (event) {
  if (event) event.preventDefault();
  console.log("Ya estás en Plants");
  // Ya estamos en esta página
};

window.goToProfile = function (event) {
  if (event) event.preventDefault();
  console.log("Navegando a Profile");
  window.location.href = "/client/screens/Profile";
};

// Función para obtener la URL de la imagen de la planta
function getPlantImageUrl(plant) {
  const url = plant.image || plant.image_url;
  if (url) {
    // Si es data URL, devolver directamente
    if (url.startsWith("data:")) return url;
    // Si es URL absoluta, devolver directamente
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // Si es relativa, construir URL completa
    return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
  }
  // Usar imagen local como fallback basada en ID o nombre
  if (plant && plant.id) {
    const plantIdStr = String(plant.id);
    let hash = 0;
    for (let i = 0; i < plantIdStr.length; i++) {
      hash = ((hash << 5) - hash) + plantIdStr.charCodeAt(i);
      hash = hash & hash;
    }
    const imageIndex = (Math.abs(hash) % 10) + 1;
    return `/client/src/assets/images/plants/plant-${imageIndex}.png`;
  }
  
  // Si no hay ID, usar nombre
  if (plant && plant.name) {
    const hash = plant.name.charCodeAt(0) % 10;
    const imageIndex = hash + 1;
    return `/client/src/assets/images/plants/plant-${imageIndex}.png`;
  }
  
  return "/client/src/assets/images/plant.png";
}

// Función para manejar errores de imagen en Garden
function handleGardenImageError(imgElement, plantId) {
  if (plantId) {
    const plantIdStr = String(plantId);
    let hash = 0;
    for (let i = 0; i < plantIdStr.length; i++) {
      hash = ((hash << 5) - hash) + plantIdStr.charCodeAt(i);
      hash = hash & hash;
    }
    const imageIndex = (Math.abs(hash) % 10) + 1;
    imgElement.src = `/client/src/assets/images/plants/plant-${imageIndex}.png`;
    imgElement.onerror = function() {
      this.onerror = null;
      this.src = "/client/src/assets/images/plant.png";
    };
  } else {
    imgElement.onerror = null;
    imgElement.src = "/client/src/assets/images/plant.png";
  }
}

// Exponer función globalmente para uso en onerror inline
window.handleGardenImageError = handleGardenImageError;

function createPlantCard(plant, i) {
  const card = document.createElement("div");
  card.className = "plant-card";
  card.innerHTML = `
        <div class="card-background"></div>
        <img class="plant-image" src="${getPlantImageUrl(
          plant
        )}" alt="Planta ${i}" onerror="handleGardenImageError(this, '${plant.id || ''}')">
        <div class="card-overlay">
            <div class="plant-name">${plant.name}</div>
            <div class="plant-stats">
                <div class="stat">
                    <span class="iconify" data-icon="solar:sun-linear"></span>
                    ${plant.light}%
                </div>
                <div class="stat">
                    <span class="iconify" data-icon="lets-icons:water-light"></span>
                    ${plant.soil_moisture}%
                </div>
            </div>
        </div>
    `;

  // Al hacer clic en una planta, ir a Virtual Pet con el ID
  card.onclick = function () {
    console.log(
      "Navegando a Virtual Pet con planta:",
      plant.name,
      "ID:",
      plant.id
    );
    window.location.href = `/client/screens/VirtualPet?id=${plant.id}`;
  };

  return card;
}

// Generar plantas
const plantsGrid = document.getElementById("plantsGrid");

(async () => {
  const response = await fetch(`${API_BASE_URL}/users/${USER_DATA.id}/plants`);
  const { success, data: plants } = await response.json();

  if (!success) return;

  const promises = plants.map(async (plant, index) => {
    try {
      // Usar query params para buscar por plant_id y obtener el más reciente
      const res = await fetch(
        `${API_BASE_URL}/plant_stats?plant_id=${plant.id}`
      );

      let plantMetrics = {};
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          // Tomar el más reciente (ya viene ordenado por fecha descendente)
          plantMetrics = result.data[0];
        }
      }

      const card = createPlantCard(
        {
          ...plant,
          soil_moisture: plantMetrics.soil_moisture || 0,
          light: plantMetrics.light || 0,
        },
        index
      );

      plantsGrid.appendChild(card);
    } catch (error) {
      console.error(`Error loading stats for plant ${plant.id}:`, error);
      // Crear la tarjeta sin métricas si falla
      const card = createPlantCard(
        {
          ...plant,
          soil_moisture: 0,
          light: 0,
        },
        index
      );
      plantsGrid.appendChild(card);
    }
  });

  await Promise.allSettled(promises);

  // Botón de agregar - Redirige a Shop
  const addButton = document.createElement("div");
  addButton.className = "plant-card add-button";
  addButton.onclick = function () {
    console.log("Navegando a Adopt para adoptar nueva planta");
    window.location.href =
      "https://ecoafrontendecoa.vercel.app/client/screens/Adopt";
  };
  plantsGrid.appendChild(addButton);

  // CREATE PLANT STAT
  // const r = await fetch(`http://localhost:3000/plant_stats`, {
  //     method: "POST",
  //     headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     body: JSON.stringify({
  //         "plant_id": "bc847426-4203-4d18-aa12-21864906fe08",
  //         "soil_moisture": 44,
  //         "temperature": 26.2,
  //         "light": 70.5,
  //       })
  // });
  // const { success: s, data} = await r.json()
  // console.log(s, data);

  // DELETE PLANT STAT
  // const r = await fetch(`http://localhost:3000/plant_stats/35f62fc2-9f08-41fc-9633-efe6832a9d60`, {
  //     method: "DELETE",
  // });
  // const { success: s, data} = await r.json()
  // console.log(s, data);
})();
