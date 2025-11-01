const API_BASE_URL = "https://ecoa-nine.vercel.app";
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

// Función para volver atrás (expuesta globalmente)
window.goBack = function () {
  window.history.back();
};

// Funciones de navegación (expuestas globalmente)
window.goToHome = function (event) {
  if (event) event.preventDefault();
  window.location.href = "/client/screens/Home";
};

window.goToPlants = function (event) {
  if (event) event.preventDefault();
  window.location.href = "/client/screens/VirtualPet";
};

window.goToProfile = function (event) {
  if (event) event.preventDefault();
  window.location.href = "/client/screens/Profile";
};

// Función para ir a Shop Feedback Success (expuesta globalmente)
window.goToShopFeedback = function () {
  window.location.href = "/client/screens/ShopFeedback/success";
};

// Cargar accesorios desde Supabase vía backend y renderizar
function resolveAccessoryImage(image) {
  // Ruta relativa desde /client/screens/Shop/ a /client/src/assets/images/
  const asset = (name) => `../../src/assets/images/${name || "accessory-1.png"}`;
  if (!image) return asset("accessory-1.png");
  // URL absoluta (http/https)
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  // Data URL
  if (image.startsWith("data:")) return image;
  // Ruta absoluta del backend (/uploads/...)
  if (image.startsWith("/")) {
    // Si es ruta del backend, intentar usar directamente, si falla usar placeholder
    return `${API_BASE_URL}${image}`;
  }
  // Nombre de archivo en assets (relativo)
  return asset(image);
}

(async function loadAccessories() {
  try {
    const res = await fetch(`${API_BASE_URL}/accessories`);
    const { success, data } = await res.json();
    if (!success) return;

    const container = document.querySelector(".shop-content");
    if (!container) return;
    container.innerHTML = "";

    data.forEach((acc) => {
      const img = resolveAccessoryImage(acc.image);
      const card = document.createElement("div");
      card.className = "shop-card";
      card.innerHTML = `
        <div class="shop-image">
          <img src="${img}" alt="${acc.name}" onerror="this.src='../../src/assets/images/accessory-1.png'" />
        </div>
        <div class="shop-info">
          <div class="shop-title">${acc.name}</div>
          <div class="shop-description">${acc.description || ""}</div>
          <button class="add-button" onclick="goToShopFeedback()">
            <span class="iconify" data-icon="material-symbols:add"></span>
          </button>
        </div>`;
      container.appendChild(card);
    });
  } catch (e) {
    console.error("Error loading accessories", e);
  }
})();
