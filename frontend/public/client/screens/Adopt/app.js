const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));

const API_BASE_URL = "https://ecoa-nine.vercel.app";

// Función para obtener la URL de la imagen de la planta
function getPlantImageUrl(plant) {
  const url = plant.image_url || plant.image;
  if (url) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url}`;
  }
  // Imagen por defecto
  return "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=400&fit=crop";
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
  // Manejar error de carga de imagen
  img.onerror = function () {
    this.src =
      "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=400&fit=crop";
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

    const availablePlants = plants.filter((p) => !p.is_adopted);
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

    const { success, data: plant } = await response.json();
    console.log("Adopción exitosa:", success, plant);

    if (success) {
      window.location.href = "/client/screens/AdoptFeedback/success";
    } else {
      window.location.href = "/client/screens/AdoptFeedback/error";
    }
  } catch (error) {
    console.error("Error adoptando planta:", error);
    window.location.href = "/client/screens/AdoptFeedback/error";
  }
};
