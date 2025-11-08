const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));

const API_BASE_URL = "https://ecoabackendecoa.vercel.app";

// Función para obtener la URL de la imagen de la planta usando recursos locales
function getPlantImageUrl(plant) {
  // Usar la función helper si está disponible, sino usar lógica local
  if (window.PlantImageUtils && window.PlantImageUtils.getPlantImageUrl) {
    return window.PlantImageUtils.getPlantImageUrl(plant, API_BASE_URL);
  }
  
  // Fallback si no está disponible el helper
  const url = plant.image || plant.image_url;
  if (url) {
    if (url.startsWith("data:")) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
  }
  
  // Usar imagen local como fallback
  if (plant.id) {
    const hash = String(plant.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = (hash % 10) + 1;
    return `../../src/assets/images/plants/plant-${imageIndex}.png`;
  }
  
  return "../../src/assets/images/plant.png";
}

function createPlantCard(plant, index) {
  // contenedor principal
  const card = document.createElement("div");
  card.className = "plant-card";
  card.onclick = () => selectPlant(plant.id);

  // imagen
  const img = document.createElement("img");
  img.src = getPlantImageUrl(plant);
  img.alt = `${plant.name} Plant`;
  img.className = `plant-image plant-image${index}`;
  // Manejar error de carga de imagen con fallback a recursos locales
  img.onerror = function () {
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

    // Mostrar todas las plantas (adoptadas y disponibles)
    const availablePlants = plants;
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
      sessionStorage.setItem("adoptionError", "La adopción no se pudo completar.");
      window.location.href = "/client/screens/AdoptFeedback/error";
    }
  } catch (error) {
    console.error("Error adoptando planta:", error);
    sessionStorage.setItem("adoptionError", "Error de conexión. Por favor verifica tu internet.");
    window.location.href = "/client/screens/AdoptFeedback/error";
  }
};
