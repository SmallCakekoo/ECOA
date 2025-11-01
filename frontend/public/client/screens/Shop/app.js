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
function resolveAccessoryImage(image, accessoryName) {
  // Si no hay imagen o es inválida, usar placeholder basado en el nombre
  if (!image || image.trim() === "") {
    // Placeholder único basado en el nombre del accesorio
    const hash = accessoryName ? accessoryName.charCodeAt(0) % 5 : 0;
    const placeholders = [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop", // Plant
      "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=400&fit=crop", // Lamp
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&h=400&fit=crop", // Pot
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=400&fit=crop", // Fertilizer
      "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=400&h=400&fit=crop"  // Tool
    ];
    return placeholders[hash];
  }
  
  // URL absoluta (http/https) - usar directamente
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  
  // Data URL - usar directamente
  if (image.startsWith("data:")) {
    return image;
  }
  
  // Ruta absoluta del backend (/uploads/...) - construir URL completa
  if (image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }
  
  // Si es un nombre de archivo (ej: "fertilizante.png", "lampara.png", "matera.png")
  // intentar cargar desde los assets del client
  if (image.includes(".") && !image.includes("/")) {
    // Es probablemente un nombre de archivo como "fertilizante.png"
    const assetPath = `/client/src/assets/images/${image}`;
    console.log(`Intentando cargar imagen de accesorio desde assets: ${assetPath}`);
    return assetPath;
  }
  
  // Si no es ninguno de los anteriores, usar placeholder
  console.warn(`Accesorio con imagen "${image}" no es una URL válida, usando placeholder`);
  const hash = accessoryName ? accessoryName.charCodeAt(0) % 5 : 0;
  const placeholders = [
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=400&h=400&fit=crop"
  ];
  return placeholders[hash];
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
      const img = resolveAccessoryImage(acc.image, acc.name);
      const card = document.createElement("div");
      card.className = "shop-card";
      const placeholderImg = resolveAccessoryImage(null, acc.name);
      card.innerHTML = `
        <div class="shop-image">
          <img src="${img}" alt="${acc.name}" onerror="this.onerror=null; this.src='${placeholderImg}'" />
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
