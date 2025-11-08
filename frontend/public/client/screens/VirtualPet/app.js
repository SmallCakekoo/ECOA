const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
const API_BASE_URL = "https://ecoabackendecoa.vercel.app";

// Obtener el ID de la planta desde la URL
const params = new URLSearchParams(window.location.search);
const plantId = params.get("id");

// Si no hay ID, redirigir a Garden
if (!plantId) {
  console.error("No plant ID provided");
  window.location.href = "/client/screens/Garden";
}

// Función para obtener la URL de la imagen de la planta usando recursos locales
function getPlantImageUrl(plant) {
  // Usar la función helper si está disponible
  if (window.PlantImageUtils && window.PlantImageUtils.getPlantImageUrl) {
    return window.PlantImageUtils.getPlantImageUrl(plant, API_BASE_URL);
  }
  
  // Fallback si no está disponible el helper
  const url = plant.image || plant.image_url;
  if (url) {
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  }
  
  // Usar imagen local como fallback
  if (plant.id) {
    const hash = String(plant.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = (hash % 10) + 1;
    return `../../src/assets/images/plants/plant-${imageIndex}.png`;
  }
  
  return "../../src/assets/images/plant.png";
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
        if (window.PlantImageUtils && window.PlantImageUtils.handlePlantImageError) {
          window.PlantImageUtils.handlePlantImageError(this, plant);
        } else {
          // Fallback simple
          const hash = plant.id ? String(plant.id).charCodeAt(0) % 10 : 0;
          this.src = `../../src/assets/images/plants/plant-${hash + 1}.png`;
          this.onerror = function() {
            this.onerror = null;
            this.src = "../../src/assets/images/plant.png";
          };
        }
      };
    }

    // Cargar métricas y estado para crear cards informativas
    let stats = null;
    let status = null;

    try {
      // Cargar métricas (plant_stats)
      const statsResponse = await fetch(
        `${API_BASE_URL}/plant_stats?plant_id=${plantId}`
      );

      if (statsResponse.ok) {
        const result = await statsResponse.json();
        if (result.success && result.data && result.data.length > 0) {
          stats = result.data[0];
        }
      }
    } catch (error) {
      console.warn("Could not load plant stats:", error);
    }

    try {
      // Cargar estado (plant_status)
      const statusResponse = await fetch(
        `${API_BASE_URL}/plant_status?plant_id=${plantId}`
      );

      if (statusResponse.ok) {
        const result = await statusResponse.json();
        if (result.success && result.data && result.data.length > 0) {
          status = result.data[0];
        }
      }
    } catch (error) {
      console.warn("Could not load plant status:", error);
    }

    // Crear cards informativas
    const infoCardsContainer = document.getElementById("infoCardsContainer");
    if (infoCardsContainer) {
      infoCardsContainer.innerHTML = "";

      // Card 1: Nombre y Tipo
      const nameCard = createInfoCard(
        "Plant Name",
        plant.name || "Unknown",
        "Species",
        plant.species || "Not specified",
        "mdi:leaf",
        "#7EB234"
      );
      infoCardsContainer.appendChild(nameCard);

      // Card 2: Estado de Salud
      const healthStatus = status?.status || plant.health_status || "Healthy";
      const healthStatusText = healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1);
      const healthCard = createInfoCard(
        "Health Status",
        healthStatusText,
        "Current Condition",
        getHealthDescription(healthStatus),
        getHealthIcon(healthStatus),
        getHealthColor(healthStatus)
      );
      infoCardsContainer.appendChild(healthCard);

      // Card 3: Luz/Sunlight
      if (stats) {
        const lightValue = stats.light || 0;
        const lightCard = createInfoCard(
          "Light",
          `${lightValue}%`,
          "Sunlight Level",
          getLightDescription(lightValue),
          "solar:sun-linear",
          "#FFA500"
        );
        infoCardsContainer.appendChild(lightCard);

        // Card 4: Agua/Soil Moisture
        const moistureValue = stats.soil_moisture || 0;
        const waterCard = createInfoCard(
          "Soil Moisture",
          `${moistureValue}%`,
          "Water Level",
          getMoistureDescription(moistureValue),
          "lets-icons:water-light",
          "#4A90E2"
        );
        infoCardsContainer.appendChild(waterCard);

        // Card 5: Temperatura
        const tempValue = stats.temperature || 0;
        const tempCard = createInfoCard(
          "Temperature",
          `${tempValue}°C`,
          "Current Temp",
          getTemperatureDescription(tempValue),
          "material-symbols-light:shower-outline",
          "#E74C3C"
        );
        infoCardsContainer.appendChild(tempCard);
      }

      // Card 6: Mood/Happiness
      if (status) {
        const moodPercent = Math.round((status.mood_index || 0) * 100);
        const moodCard = createInfoCard(
          "Mood",
          `${moodPercent}%`,
          "Happiness Level",
          getMoodDescription(moodPercent),
          "mingcute:happy-line",
          "#F39C12"
        );
        infoCardsContainer.appendChild(moodCard);
      }

      // Card 7: Fecha de Registro
      if (plant.registration_date || plant.created_at) {
        const regDate = new Date(plant.registration_date || plant.created_at);
        const formattedDate = regDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });
        const dateCard = createInfoCard(
          "Adopted On",
          formattedDate,
          "Registration Date",
          "When this plant joined your garden",
          "mdi:calendar",
          "#9B59B6"
        );
        infoCardsContainer.appendChild(dateCard);
      }
    }
  } catch (error) {
    console.error("Error loading plant data:", error);
    alert("No se pudo cargar la información de la planta");
    window.location.href = "/client/screens/Garden";
  }
})();

// Función para crear cards informativas
function createInfoCard(title, value, subtitle, description, icon, color) {
  const card = document.createElement("div");
  card.className = "info-card";
  card.style.setProperty("--card-color", color);
  
  card.innerHTML = `
    <div class="info-card-icon">
      <span class="iconify" data-icon="${icon}"></span>
    </div>
    <div class="info-card-content">
      <div class="info-card-header">
        <h3 class="info-card-title">${title}</h3>
        <p class="info-card-value">${value}</p>
      </div>
      <div class="info-card-body">
        <p class="info-card-subtitle">${subtitle}</p>
        <p class="info-card-description">${description}</p>
      </div>
    </div>
  `;
  
  return card;
}

// Funciones helper para descripciones
function getHealthDescription(status) {
  const descriptions = {
    healthy: "Your plant is in excellent condition and thriving!",
    recovering: "Your plant is recovering and getting better.",
    bad: "Your plant needs immediate attention and care.",
    excellent: "Your plant is in perfect condition!",
    needs_care: "Your plant requires some extra care.",
    sick: "Your plant is showing signs of illness.",
    dying: "Your plant needs urgent care.",
    critical: "Your plant is in critical condition."
  };
  return descriptions[status.toLowerCase()] || "Status information not available.";
}

function getHealthIcon(status) {
  const icons = {
    healthy: "mdi:heart",
    recovering: "mdi:heart-pulse",
    bad: "mdi:heart-broken",
    excellent: "mdi:heart",
    needs_care: "mdi:heart-pulse",
    sick: "mdi:heart-broken",
    dying: "mdi:heart-broken",
    critical: "mdi:heart-broken"
  };
  return icons[status.toLowerCase()] || "mdi:heart";
}

function getHealthColor(status) {
  const colors = {
    healthy: "#27AE60",
    recovering: "#F39C12",
    bad: "#E74C3C",
    excellent: "#27AE60",
    needs_care: "#F39C12",
    sick: "#E74C3C",
    dying: "#E74C3C",
    critical: "#C0392B"
  };
  return colors[status.toLowerCase()] || "#7EB234";
}

function getLightDescription(value) {
  if (value >= 80) return "Excellent lighting conditions!";
  if (value >= 60) return "Good amount of sunlight.";
  if (value >= 40) return "Moderate lighting, could be better.";
  if (value >= 20) return "Low light conditions.";
  return "Very low light, consider moving to a brighter spot.";
}

function getMoistureDescription(value) {
  if (value >= 80) return "Soil is very moist, might be too wet.";
  if (value >= 60) return "Perfect moisture level!";
  if (value >= 40) return "Adequate moisture, keep monitoring.";
  if (value >= 20) return "Soil is getting dry, water soon.";
  return "Soil is very dry, needs watering immediately.";
}

function getTemperatureDescription(value) {
  if (value >= 30) return "Temperature is quite high.";
  if (value >= 25) return "Warm and comfortable temperature.";
  if (value >= 20) return "Ideal temperature range.";
  if (value >= 15) return "Cool but acceptable temperature.";
  return "Temperature is quite low, consider warming up.";
}

function getMoodDescription(value) {
  if (value >= 80) return "Your plant is extremely happy!";
  if (value >= 60) return "Your plant is feeling great!";
  if (value >= 40) return "Your plant is content.";
  if (value >= 20) return "Your plant could be happier.";
  return "Your plant needs more attention and care.";
}

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
// Nota: Estas funciones ya no se usan, pero se mantienen para compatibilidad
// Ahora se usa purchaseAccessory() que registra la compra y redirige correctamente
window.goToShopSuccess = function () {
  console.log("Navegando a Shop Feedback Success");
  if (plantId) {
    window.location.href = `/client/screens/ShopFeedback/success?id=${plantId}`;
  } else {
    window.location.href = "/client/screens/ShopFeedback/success";
  }
};

window.goToShopError = function () {
  console.log("Navegando a Shop Feedback Error");
  if (plantId) {
    window.location.href = `/client/screens/ShopFeedback/error?id=${plantId}`;
  } else {
    window.location.href = "/client/screens/ShopFeedback/error";
  }
};

// Función para el botón View More (expuesta globalmente)
window.goToShop = function () {
  console.log("Navegando a Shop con planta:", plantId);
  if (plantId) {
    window.location.href = `/client/screens/Shop?id=${plantId}`;
  } else {
    window.location.href = "/client/screens/Shop";
  }
};

// Función helper para resolver imagen de accesorio
function resolveAccessoryImage(image, accessoryName) {
  const getImagePath = (imageName) => {
    return `../../src/assets/images/${imageName}`;
  };

  const nameMap = {
    fertilizante: "accessory-3.png",
    lámpara: "accessory-1.png",
    lampara: "accessory-1.png",
    matera: "accessory-2.png",
    "care kit": "accessory-3.png",
    fertilizer: "accessory-3.png",
    pot: "accessory-2.png",
    lamp: "accessory-1.png",
  };

  if (!image || image.trim() === "") {
    const accessoryLower = (accessoryName || "").toLowerCase();
    for (const [key, value] of Object.entries(nameMap)) {
      if (accessoryLower.includes(key)) {
        return getImagePath(value);
      }
    }
    return getImagePath("accessory-1.png");
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }

  if (image.includes(".") && !image.includes("/")) {
    const imageNameMap = {
      "fertilizante.png": "accessory-3.png",
      "lampara.png": "accessory-1.png",
      "matera.png": "accessory-2.png",
    };
    const fileName = image.toLowerCase();
    const mappedName =
      imageNameMap[fileName] || imageNameMap[fileName.replace(".png", "")];
    if (mappedName) {
      return getImagePath(mappedName);
    }
    return getImagePath(image);
  }

  const accessoryLower = (accessoryName || "").toLowerCase();
  for (const [key, value] of Object.entries(nameMap)) {
    if (accessoryLower.includes(key)) {
      return getImagePath(value);
    }
  }

  return getImagePath("accessory-1.png");
}

// Función para comprar un accesorio (expuesta globalmente)
window.purchaseAccessory = async function (
  accessoryId,
  accessoryName,
  price,
  pId
) {
  try {
    const currentPlantId = pId || plantId;

    if (!USER_DATA || !USER_DATA.id) {
      console.error("Usuario no autenticado");
      window.location.href = "/client/screens/ShopFeedback/error";
      return;
    }

    if (!currentPlantId) {
      console.error("No se ha seleccionado una planta");
      window.location.href = "/client/screens/ShopFeedback/error";
      return;
    }

    console.log("Comprando accesorio:", {
      accessoryId,
      accessoryName,
      price,
      plantId: currentPlantId,
      userId: USER_DATA.id,
    });

    const donationResponse = await fetch(`${API_BASE_URL}/donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: USER_DATA.id,
        plant_id: currentPlantId,
        amount: price,
        accessory_type: accessoryName,
        // Solo campos básicos: user_id, plant_id, amount, accessory_type
      }),
    });

    // Verificar si la respuesta es OK (200-299)
    if (!donationResponse.ok) {
      let errorText;
      try {
        errorText = await donationResponse.text();
        const errorJson = JSON.parse(errorText);
        console.error("❌ Error HTTP al crear donación:", {
          status: donationResponse.status,
          statusText: donationResponse.statusText,
          error: errorJson.error || errorJson.message || errorText,
          fullError: errorJson,
        });
      } catch (e) {
        errorText = await donationResponse.text();
        console.error("❌ Error HTTP al crear donación (texto):", {
          status: donationResponse.status,
          statusText: donationResponse.statusText,
          error: errorText,
        });
      }
      alert(
        `Error al crear donación: ${JSON.stringify({
          status: donationResponse.status,
          error: errorText,
        })}`
      );
      window.location.href = `/client/screens/ShopFeedback/error?id=${currentPlantId}`;
      return;
    }

    const donationResult = await donationResponse.json();

    if (!donationResult.success) {
      console.error("❌ Error en respuesta de donación:", donationResult);
      alert(
        `Error: ${
          donationResult.message || donationResult.error || "Error desconocido"
        }`
      );
      window.location.href = `/client/screens/ShopFeedback/error?id=${currentPlantId}`;
      return;
    }

    console.log("✅ Donación creada exitosamente:", donationResult.data);

    // Intentar asignar el accesorio a la planta (opcional, no crítico)
    try {
      const assignmentResponse = await fetch(
        `${API_BASE_URL}/plants/${currentPlantId}/accessories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessory_id: accessoryId,
          }),
        }
      );

      if (!assignmentResponse.ok) {
        const errorText = await assignmentResponse.text();
        console.warn("⚠️ Error HTTP al asignar accesorio:", {
          status: assignmentResponse.status,
          error: errorText,
        });
      } else {
        const assignmentResult = await assignmentResponse.json();

        if (assignmentResult.success) {
          console.log(
            "✅ Accesorio asignado a la planta:",
            assignmentResult.data
          );
        } else {
          console.warn(
            "⚠️ No se pudo asignar el accesorio a la planta, pero la donación se creó:",
            assignmentResult
          );
        }
      }
    } catch (assignmentError) {
      console.warn(
        "⚠️ Error asignando accesorio a la planta (no crítico):",
        assignmentError
      );
    }

    // SIEMPRE redirigir a success si la donación se creó exitosamente
    console.log("✅ Redirigiendo a página de éxito...");
    window.location.href = `/client/screens/ShopFeedback/success?id=${currentPlantId}`;
  } catch (error) {
    console.error("❌ Error en la compra:", error);
    window.location.href = `/client/screens/ShopFeedback/error?id=${
      plantId || ""
    }`;
  }
};

// Cargar accesorios desde la API
async function loadAccessories() {
  try {
    const container = document.getElementById("accessoriesList");
    if (!container) return;

    console.log("🔍 Cargando accesorios desde:", `${API_BASE_URL}/accessories`);
    const res = await fetch(`${API_BASE_URL}/accessories`);

    if (!res.ok) {
      console.error("❌ Error en respuesta:", res.status, res.statusText);
      container.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #666;">No se pudieron cargar los accesorios</div>';
      return;
    }

    const result = await res.json();
    console.log("✅ Respuesta recibida:", result);

    if (
      !result.success ||
      !result.data ||
      !Array.isArray(result.data) ||
      result.data.length === 0
    ) {
      console.warn("⚠️ No hay accesorios disponibles");
      container.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #666;">No hay accesorios disponibles</div>';
      return;
    }

    // Mostrar solo los primeros 2 accesorios en VirtualPet
    const accessoriesToShow = result.data.slice(0, 2);
    container.innerHTML = "";

    accessoriesToShow.forEach((acc) => {
      const img = resolveAccessoryImage(acc.image, acc.name);
      const price = acc.price_estimate || 0;
      const formattedPrice = `$${price.toLocaleString("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;

      const card = document.createElement("div");
      card.className = "accessory-card";
      card.innerHTML = `
        <div class="accessory-image">
          <img src="${img}" alt="${
        acc.name
      }" onerror="this.src='../../src/assets/images/accessory-1.png';" />
        </div>
        <div class="accessory-content">
          <div class="accessory-title">${acc.name || "Sin nombre"}</div>
          <div class="accessory-description">${acc.description || ""}</div>
          <div class="accessory-price">${formattedPrice}</div>
          <button class="add-button-small" onclick="purchaseAccessory('${
            acc.id
          }', '${acc.name}', ${price}, '${plantId || ""}')">
            <span class="iconify" data-icon="material-symbols:add"></span>
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    console.log("✅ Accesorios renderizados correctamente");
  } catch (e) {
    console.error("❌ Error loading accessories", e);
    const container = document.getElementById("accessoriesList");
    if (container) {
      container.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Error al cargar accesorios: ${e.message}</div>`;
    }
  }
}

// Cargar accesorios al cargar la página
loadAccessories();
