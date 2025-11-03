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
      // Usar query params para buscar por plant_id y obtener el más reciente
      const statsResponse = await fetch(
        `${API_BASE_URL}/plant_stats?plant_id=${plantId}`
      );
      
      let stats = null;
      if (statsResponse.ok) {
        const result = await statsResponse.json();
        if (result.success && result.data && result.data.length > 0) {
          // Tomar el más reciente (ya viene ordenado por fecha descendente)
          stats = result.data[0];
        }
      }

      if (stats) {
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
      // Usar query params para buscar por plant_id y obtener el más reciente
      const statusResponse = await fetch(
        `${API_BASE_URL}/plant_status?plant_id=${plantId}`
      );
      
      let status = null;
      if (statusResponse.ok) {
        const result = await statusResponse.json();
        if (result.success && result.data && result.data.length > 0) {
          // Tomar el más reciente (ya viene ordenado por fecha descendente)
          status = result.data[0];
        }
      }

      if (status) {
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

  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
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
    const mappedName = imageNameMap[fileName] || imageNameMap[fileName.replace(".png", "")];
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
window.purchaseAccessory = async function (accessoryId, accessoryName, price, pId) {
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
      userId: USER_DATA.id
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
        status: "pending"
        // No incluir payment_method - no existe en la tabla
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
          fullError: errorJson
        });
      } catch (e) {
        errorText = await donationResponse.text();
        console.error("❌ Error HTTP al crear donación (texto):", {
          status: donationResponse.status,
          statusText: donationResponse.statusText,
          error: errorText
        });
      }
      alert(`Error al crear donación: ${JSON.stringify({ status: donationResponse.status, error: errorText })}`);
      window.location.href = `/client/screens/ShopFeedback/error?id=${currentPlantId}`;
      return;
    }

    const donationResult = await donationResponse.json();

    if (!donationResult.success) {
      console.error("❌ Error en respuesta de donación:", donationResult);
      alert(`Error: ${donationResult.message || donationResult.error || 'Error desconocido'}`);
      window.location.href = `/client/screens/ShopFeedback/error?id=${currentPlantId}`;
      return;
    }

    console.log("✅ Donación creada exitosamente:", donationResult.data);

    // Intentar asignar el accesorio a la planta (opcional, no crítico)
    try {
      const assignmentResponse = await fetch(`${API_BASE_URL}/plants/${currentPlantId}/accessories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessory_id: accessoryId
        }),
      });

      if (!assignmentResponse.ok) {
        const errorText = await assignmentResponse.text();
        console.warn("⚠️ Error HTTP al asignar accesorio:", {
          status: assignmentResponse.status,
          error: errorText
        });
      } else {
        const assignmentResult = await assignmentResponse.json();
        
        if (assignmentResult.success) {
          console.log("✅ Accesorio asignado a la planta:", assignmentResult.data);
        } else {
          console.warn("⚠️ No se pudo asignar el accesorio a la planta, pero la donación se creó:", assignmentResult);
        }
      }
    } catch (assignmentError) {
      console.warn("⚠️ Error asignando accesorio a la planta (no crítico):", assignmentError);
    }

    // SIEMPRE redirigir a success si la donación se creó exitosamente
    console.log("✅ Redirigiendo a página de éxito...");
    window.location.href = `/client/screens/ShopFeedback/success?id=${currentPlantId}`;

  } catch (error) {
    console.error("❌ Error en la compra:", error);
    window.location.href = `/client/screens/ShopFeedback/error?id=${plantId || ''}`;
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
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No se pudieron cargar los accesorios</div>';
      return;
    }

    const result = await res.json();
    console.log("✅ Respuesta recibida:", result);

    if (!result.success || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
      console.warn("⚠️ No hay accesorios disponibles");
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No hay accesorios disponibles</div>';
      return;
    }

    // Mostrar solo los primeros 2 accesorios en VirtualPet
    const accessoriesToShow = result.data.slice(0, 2);
    container.innerHTML = "";

    accessoriesToShow.forEach((acc) => {
      const img = resolveAccessoryImage(acc.image, acc.name);
      const price = acc.price_estimate || 0;
      const formattedPrice = `$${price.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

      const card = document.createElement("div");
      card.className = "accessory-card";
      card.innerHTML = `
        <div class="accessory-image">
          <img src="${img}" alt="${acc.name}" onerror="this.src='../../src/assets/images/accessory-1.png';" />
        </div>
        <div class="accessory-content">
          <div class="accessory-title">${acc.name || "Sin nombre"}</div>
          <div class="accessory-description">${acc.description || ""}</div>
          <div class="accessory-price">${formattedPrice}</div>
          <button class="add-button-small" onclick="purchaseAccessory('${acc.id}', '${acc.name}', ${price}, '${plantId || ''}')">
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
