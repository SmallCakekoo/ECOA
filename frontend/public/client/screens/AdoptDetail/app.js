const API_BASE_URL = "https://ecoabackendecoa.vercel.app";
const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));

const params = new URLSearchParams(window.location.search);

const plantId = params.get("id");

// Función para obtener la URL de la imagen de la planta usando recursos locales
function getPlantImageUrl(plant) {
  // Siempre usar el helper de plant-images.js si está disponible
  if (window.PlantImageUtils && window.PlantImageUtils.getPlantImageUrl) {
    return window.PlantImageUtils.getPlantImageUrl(plant, API_BASE_URL);
  }
  
  // Fallback si el helper no está cargado aún (usar recursos locales directamente)
  if (plant && plant.id) {
    // Generar hash del ID para seleccionar imagen local
    const plantIdStr = String(plant.id);
    let hash = 0;
    for (let i = 0; i < plantIdStr.length; i++) {
      hash = ((hash << 5) - hash) + plantIdStr.charCodeAt(i);
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    const imageIndex = (Math.abs(hash) % 10) + 1; // Número entre 1 y 10
    return `/client/src/assets/images/plants/plant-${imageIndex}.png`;
  }
  
  // Si no hay ID, usar imagen por defecto
  return "/client/src/assets/images/plant.png";
}

(async function hydratePlantPage() {
  try {
    await Promise.all([
      fetchPlantData(plantId),
      fetchPlantMetrics(plantId),
      fetchPlantStatus(plantId),
    ]);
  } catch (error) {
    console.error("Error hydrating page:", error);
  }
})();

async function fetchPlantData(plantId) {
  const response = await fetch(`${API_BASE_URL}/plants/${plantId}`);
  const { success, data: plant } = await response.json();

  if (!success) throw new Error("Failed to load plant data");

  document.title = `${plant.name} Plant - Adopt`;
  document.querySelector(".plant-title").textContent = `${plant.name} Plant`;
  document.querySelector(".plant-description").textContent =
    plant.description ||
    `The ${plant.name} Plant is the ultimate survivor. Strong, stoic, and elegant, with tall leaves shaped like green spears brushed with yellow or silver.`;

  const plantImage = document.querySelector("#plant-image");
  const imageUrl = getPlantImageUrl(plant);
  plantImage.src = imageUrl;
  
  // Manejar error de carga de imagen con fallback a recursos locales
  plantImage.onerror = function () {
    // Si el helper está disponible, usarlo
    if (window.PlantImageUtils && window.PlantImageUtils.handlePlantImageError) {
      window.PlantImageUtils.handlePlantImageError(this, plant);
      return;
    }
    
    // Fallback: intentar con imagen local basada en ID
    if (plant && plant.id) {
      const plantIdStr = String(plant.id);
      let hash = 0;
      for (let i = 0; i < plantIdStr.length; i++) {
        hash = ((hash << 5) - hash) + plantIdStr.charCodeAt(i);
        hash = hash & hash;
      }
      const imageIndex = (Math.abs(hash) % 10) + 1;
      const localImage = `/client/src/assets/images/plants/plant-${imageIndex}.png`;
      
      // Solo cambiar si es diferente a la actual
      if (this.src !== localImage && !this.src.includes('plant-')) {
        this.src = localImage;
        // Si la imagen local también falla, usar imagen por defecto
        this.onerror = function() {
          this.onerror = null; // Prevenir loops infinitos
          this.src = "/client/src/assets/images/plant.png";
        };
      } else {
        // Si ya intentamos la local, usar imagen por defecto
        this.onerror = null;
        this.src = "/client/src/assets/images/plant.png";
      }
    } else {
      // Sin ID, usar imagen por defecto directamente
      this.onerror = null;
      this.src = "/client/src/assets/images/plant.png";
    }
  };

  document.querySelector(".about-text").textContent =
    plant.description ||
    `The ${plant.name} Plant is often called the ultimate survivor among houseplants. Native to West Africa, it has earned a reputation for being almost indestructible. Its tall, upright leaves rise like green spears, sometimes edged or streaked with silver, cream, or yellow, giving it a striking architectural look that fits both modern and traditional interiors.`;
}

async function fetchPlantMetrics(plantId) {
  try {
    // Buscar por plant_id, no por id
    const response = await fetch(
      `${API_BASE_URL}/plant_stats?plant_id=${plantId}`
    );
    const { success, data } = await response.json();

    if (!success || !data || data.length === 0) {
      console.warn(
        "No se encontraron métricas para la planta, usando valores por defecto"
      );
      // Usar valores por defecto si no hay métricas
      const [tempBtn, humBtn, lightBtn] =
        document.querySelectorAll(".state-button");
      addStateButtonText(50, tempBtn);
      addStateButtonText(50, humBtn);
      addStateButtonText(50, lightBtn);
      return;
    }

    // Usar la métrica más reciente
    const plantMetrics = Array.isArray(data) ? data[0] : data;
    const [tempBtn, humBtn, lightBtn] =
      document.querySelectorAll(".state-button");
    addStateButtonText(plantMetrics.temperature || 50, tempBtn);
    addStateButtonText(plantMetrics.soil_moisture || 50, humBtn);
    addStateButtonText(plantMetrics.light || 50, lightBtn);
  } catch (error) {
    console.error("Error cargando métricas:", error);
    // Usar valores por defecto en caso de error
    const [tempBtn, humBtn, lightBtn] =
      document.querySelectorAll(".state-button");
    addStateButtonText(50, tempBtn);
    addStateButtonText(50, humBtn);
    addStateButtonText(50, lightBtn);
  }
}

async function fetchPlantStatus(plantId) {
  try {
    // Buscar por plant_id, no por id
    const response = await fetch(
      `${API_BASE_URL}/plant_status?plant_id=${plantId}`
    );
    const { success, data } = await response.json();

    if (!success || !data || data.length === 0) {
      console.warn(
        "No se encontró status para la planta, usando valor por defecto"
      );
      // Usar valor por defecto si no hay status
      const moodBtn = document.querySelectorAll(".state-button")[3];
      addStateButtonText(50, moodBtn);
      return;
    }

    // Usar el status más reciente
    const plantStatus = Array.isArray(data) ? data[0] : data;
    const moodBtn = document.querySelectorAll(".state-button")[3];
    addStateButtonText((plantStatus.mood_index || 0.5) * 100, moodBtn);
  } catch (error) {
    console.error("Error cargando status:", error);
    // Usar valor por defecto en caso de error
    const moodBtn = document.querySelectorAll(".state-button")[3];
    addStateButtonText(50, moodBtn);
  }
}

// // CREATE PLANT STAT
// const r = await fetch(`http://localhost:3000/plant_status`, {
//     method: "POST",
//     headers: {
//         'Content-Type': 'application/json',
//       },
//     body: JSON.stringify({
//       plant_id: "bc847426-4203-4d18-aa12-21864906fe08",
//       status: "healthy",
//       mood_index: 0.5,
//       mood_face: "🫠",
//     })
// });
// const { success: s, data} = await r.json()
// console.log(s, data);

// DELETE PLANT STATUS
// const r = await fetch(`http://localhost:3000/plant_status/62de8f9f-9c62-42f6-ab7e-c81f11b38b4b`, {
//   method: "DELETE",
// });
// const { success: s, data} = await r.json()
// console.log(s, data);

// AÑADIR METRICAS A UNA PLANTA. (EL SCHEMA DE LA DB NO ESTABA LISTO)
// const response = await fetch('http://localhost:3000/plants/'+plantId+"/metrics", {
//     method: "PUT",
//     headers: {
//         'Content-Type': 'application/json',
//       },
//     body: JSON.stringify({
//         "water_level": "80",
// "light_level": "100",
// "temperature": "23",
// "humidity": "70",
// "health_status": "99",
//     })
// });
// const { success, data: plant} = await response.json()
// console.log(success, plant);

function addStateButtonText(value, node) {
  const text = document.createElement("p");
  text.textContent = value + "%";
  node.appendChild(text);
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

// Funciones de navegación
window.goToHome = function (event) {
  if (event) event.preventDefault();
  window.history.back();
};

window.goToPlants = function (event) {
  if (event) event.preventDefault();
  window.location.href = "/client/screens/VirtualPet";
};

window.goToProfile = function (event) {
  if (event) event.preventDefault();
  window.location.href = "/client/screens/Profile";
};

// Función para ir a la página de éxito de adopción (expuesta globalmente)
window.adoptPlant = async function () {
  // Validar que tenemos los datos necesarios
  if (!plantId) {
    console.error("No se encontró el ID de la planta");
    alert("Error: No se pudo identificar la planta. Por favor, intenta nuevamente.");
    return;
  }

  if (!USER_DATA || !USER_DATA.id) {
    console.error("No se encontraron datos de usuario");
    alert("Error: No estás autenticado. Por favor, inicia sesión nuevamente.");
    window.location.href = "/client/screens/LogIn";
    return;
  }

  // Deshabilitar botón durante la petición
  const adoptButton = document.querySelector(".adopt-button");
  const originalText = adoptButton.innerHTML;
  adoptButton.disabled = true;
  adoptButton.style.opacity = "0.7";
  adoptButton.style.cursor = "not-allowed";
  adoptButton.innerHTML = '<span class="iconify" data-icon="svg-spinners:ring-resize"></span> Adoptando...';

  console.log("Adoptando planta:", plantId);

  try {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: USER_DATA.id,
        is_adopted: true, // Marcar como adoptada
      }),
    });

    // Validar status HTTP con switch case
    let errorMessage = "";
    switch (response.status) {
      case 200:
        // Éxito - continuar con el procesamiento
        break;
      case 400:
        errorMessage = "Solicitud inválida. Por favor verifica los datos.";
        break;
      case 401:
        errorMessage = "No autorizado. Por favor inicia sesión nuevamente.";
        break;
      case 403:
        errorMessage = "No tienes permiso para realizar esta acción.";
        break;
      case 404:
        errorMessage = "La planta no fue encontrada.";
        break;
      case 409:
        errorMessage = "Esta planta ya ha sido adoptada.";
        break;
      case 500:
        errorMessage = "Error interno del servidor. Por favor intenta más tarde.";
        break;
      case 503:
        errorMessage = "Servicio no disponible. Por favor intenta más tarde.";
        break;
      default:
        errorMessage = `Error al adoptar la planta (Código: ${response.status}).`;
        break;
    }

    // Si hay error, redirigir a pantalla de error
    if (response.status !== 200) {
      console.error("Error en adopción:", response.status, errorMessage);
      // Restaurar botón antes de redirigir
      adoptButton.disabled = false;
      adoptButton.style.opacity = "1";
      adoptButton.style.cursor = "pointer";
      adoptButton.innerHTML = originalText;
      // Guardar mensaje de error en sessionStorage para mostrarlo en la pantalla de error
      sessionStorage.setItem("adoptionError", errorMessage);
      window.location.href = "/client/screens/AdoptFeedback/error";
      return;
    }

    // Si el status es 200, procesar la respuesta JSON
    const { success, data: plant } = await response.json();
    console.log("Adopción exitosa:", success, plant);

    if (success) {
      // Restaurar botón antes de redirigir
      adoptButton.disabled = false;
      adoptButton.style.opacity = "1";
      adoptButton.style.cursor = "pointer";
      adoptButton.innerHTML = originalText;
      window.location.href = "/client/screens/AdoptFeedback/success";
    } else {
      // Si success es false aunque el status sea 200
      adoptButton.disabled = false;
      adoptButton.style.opacity = "1";
      adoptButton.style.cursor = "pointer";
      adoptButton.innerHTML = originalText;
      sessionStorage.setItem("adoptionError", "La adopción no se pudo completar.");
      window.location.href = "/client/screens/AdoptFeedback/error";
    }
  } catch (error) {
    console.error("Error adoptando planta:", error);
    // Restaurar botón en caso de error
    if (adoptButton) {
      adoptButton.disabled = false;
      adoptButton.style.opacity = "1";
      adoptButton.style.cursor = "pointer";
      adoptButton.innerHTML = originalText;
    }
    sessionStorage.setItem("adoptionError", "Error de conexión. Por favor verifica tu internet.");
    window.location.href = "/client/screens/AdoptFeedback/error";
  }
};
