const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));

const API_BASE_URL = "https://ecoa-ruddy.vercel.app";

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
      hash = (hash << 5) - hash + plantIdStr.charCodeAt(i);
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    const imageIndex = (Math.abs(hash) % 10) + 1; // Número entre 1 y 10
    return `/client/src/assets/images/plants/plant-${imageIndex}.png`;
  }

  // Si no hay ID, usar imagen por defecto
  return "/client/src/assets/images/plant.png";
}

function createPlantCard(plant, index) {
  // contenedor principal
  const card = document.createElement("div");
  card.className = "plant-card";
  card.onclick = () => selectPlant(plant.id);

  // imagen
  const img = document.createElement("img");
  const imageUrl = getPlantImageUrl(plant);
  img.src = imageUrl;
  img.alt = `${plant.name} Plant`;
  img.className = `plant-image plant-image${index}`;

  // Manejar error de carga de imagen con fallback a recursos locales
  img.onerror = function () {
    // Si el helper está disponible, usarlo
    if (
      window.PlantImageUtils &&
      window.PlantImageUtils.handlePlantImageError
    ) {
      window.PlantImageUtils.handlePlantImageError(this, plant);
      return;
    }

    // Fallback: intentar con imagen local basada en ID
    if (plant && plant.id) {
      const plantIdStr = String(plant.id);
      let hash = 0;
      for (let i = 0; i < plantIdStr.length; i++) {
        hash = (hash << 5) - hash + plantIdStr.charCodeAt(i);
        hash = hash & hash;
      }
      const imageIndex = (Math.abs(hash) % 10) + 1;
      const localImage = `/client/src/assets/images/plants/plant-${imageIndex}.png`;

      // Solo cambiar si es diferente a la actual
      if (this.src !== localImage && !this.src.includes("plant-")) {
        this.src = localImage;
        // Si la imagen local también falla, usar imagen por defecto
        this.onerror = function () {
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

  // Si la URL es del backend y no es data URL, verificar primero con recursos locales
  // Esto previene errores de carga y mejora la experiencia
  if (
    imageUrl &&
    !imageUrl.startsWith("data:") &&
    !imageUrl.startsWith("/client/src/assets/images/")
  ) {
    // Si es una URL del backend, intentar cargar primero la local como respaldo
    const localImageUrl =
      window.PlantImageUtils && window.PlantImageUtils.getLocalPlantImage
        ? window.PlantImageUtils.getLocalPlantImage(plant)
        : plant && plant.id
        ? (() => {
            const plantIdStr = String(plant.id);
            let hash = 0;
            for (let i = 0; i < plantIdStr.length; i++) {
              hash = (hash << 5) - hash + plantIdStr.charCodeAt(i);
              hash = hash & hash;
            }
            const imageIndex = (Math.abs(hash) % 10) + 1;
            return `/client/src/assets/images/plants/plant-${imageIndex}.png`;
          })()
        : "/client/src/assets/images/plant.png";

    // Pre-cargar la imagen local para tenerla lista
    const preloadImg = new Image();
    preloadImg.src = localImageUrl;
  }

  // contenedor de información
  const info = document.createElement("div");
  info.className = "plant-info";

  const name = document.createElement("div");
  name.className = "plant-name";
  name.textContent = plant.name;

  const description = document.createElement("div");
  description.className = "plant-description";
  description.textContent = `Especie: ${plant.species}. Super resistant, purifies the air.`;

  // agregar name y description a info
  info.appendChild(name);
  info.appendChild(description);

  // botón
  const button = document.createElement("button");
  button.className = "add-button";
  button.textContent = "+";
  button.onclick = (event) => {
    event.stopPropagation();
    adoptPlant(plant.id);
  };

  // ensamblar la card
  card.appendChild(img);
  card.appendChild(info);
  card.appendChild(button);

  return card;
}

(async () => {
  try {
    // Obtener todas las plantas y filtrar disponibles localmente
    const response = await fetch(`${API_BASE_URL}/plants`);
    const { success, data: plants } = await response.json();
    console.log("Plantas disponibles:", success, plants);

    if (!success) return;

    // Mostrar solo las plantas disponibles (no adoptadas)
    const availablePlants = plants.filter((plant) => !plant.is_adopted);
    console.log("Plantas disponibles para adopción:", availablePlants);

    if (availablePlants.length === 0) {
      document.querySelector(".plant-cards").innerHTML = `
        <p style="text-align: center; width: 100%; padding: 2rem; color: #666;">
          No hay plantas disponibles para adopción en este momento.
        </p>
      `;
      return;
    }

    availablePlants.forEach((plant, index) => {
      const card = createPlantCard(plant, index + 1);
      document.querySelector(".plant-cards").appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando plantas:", error);
  }
})();

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

// Funciones de navegación (expuestas globalmente para onclick)
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

// Función para volver atrás - va a Home
window.goBack = function () {
  console.log("Volviendo a Home...");
  window.location.href = "/client/screens/Home";
};

// Función para ver detalles de una planta (click en tarjeta)
window.selectPlant = function (id) {
  console.log("Ver detalles de planta:", id);
  window.location.href = "/client/screens/AdoptDetail?id=" + id;
};

// Función para adoptar una planta (click en botón +)
window.adoptPlant = async function (id) {
  console.log("Adoptando planta:", id);

  try {
    const response = await fetch(`${API_BASE_URL}/plants/` + id, {
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
        errorMessage =
          "Error interno del servidor. Por favor intenta más tarde.";
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
      // Guardar mensaje de error en sessionStorage para mostrarlo en la pantalla de error
      sessionStorage.setItem("adoptionError", errorMessage);
      window.location.href = "/client/screens/AdoptFeedback/error";
      return;
    }

    // Si el status es 200, procesar la respuesta JSON
    const { success, data: plant } = await response.json();
    console.log("Adopción exitosa:", success, plant);

    if (success) {
      window.location.href = "/client/screens/AdoptFeedback/success";
    } else {
      // Si success es false aunque el status sea 200
      sessionStorage.setItem(
        "adoptionError",
        "La adopción no se pudo completar."
      );
      window.location.href = "/client/screens/AdoptFeedback/error";
    }
  } catch (error) {
    console.error("Error adoptando planta:", error);
    sessionStorage.setItem(
      "adoptionError",
      "Error de conexión. Por favor verifica tu internet."
    );
    window.location.href = "/client/screens/AdoptFeedback/error";
  }
};
