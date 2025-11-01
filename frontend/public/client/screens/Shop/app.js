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

// Función helper para obtener la ruta base de assets
function getAssetBasePath() {
  // Desde /client/screens/Shop/, la ruta relativa ../../src/assets/images/ funciona
  // Pero necesitamos construir una ruta absoluta que funcione en producción
  const currentPath = window.location.pathname;
  
  // Si estamos en una ruta de Shop, usar ruta relativa que funciona
  if (currentPath.includes('/Shop')) {
    return '../../src/assets/images/';
  }
  
  // Fallback: ruta absoluta desde la raíz
  return '/client/src/assets/images/';
}

// Cargar accesorios desde Supabase vía backend y renderizar
function resolveAccessoryImage(image, accessoryName) {
  const basePath = getAssetBasePath();
  
  // Mapear nombre del accesorio a imagen de asset
  const nameMap = {
    "fertilizante": "accessory-3.png",
    "lámpara": "accessory-1.png",
    "lampara": "accessory-1.png",
    "matera": "accessory-2.png"
  };
  
  // Si no hay imagen o es inválida, intentar mapear por nombre del accesorio
  if (!image || image.trim() === "") {
    const accessoryLower = (accessoryName || "").toLowerCase();
    for (const [key, value] of Object.entries(nameMap)) {
      if (accessoryLower.includes(key)) {
        const assetPath = `${basePath}${value}`;
        console.log(`Mapeando por nombre "${accessoryName}" a ${assetPath}`);
        return assetPath;
      }
    }
    console.warn(`No se encontró imagen para accesorio: ${accessoryName}`);
    return null;
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
  // intentar mapear a los assets del client
  if (image.includes(".") && !image.includes("/")) {
    const imageNameMap = {
      "fertilizante.png": "accessory-3.png",
      "lampara.png": "accessory-1.png",
      "matera.png": "accessory-2.png",
      "fertilizante": "accessory-3.png",
      "lampara": "accessory-1.png",
      "matera": "accessory-2.png"
    };
    
    const fileName = image.toLowerCase();
    const mappedName = imageNameMap[fileName] || imageNameMap[fileName.replace(".png", "")];
    
    if (mappedName) {
      const assetPath = `${basePath}${mappedName}`;
      console.log(`Mapeando "${image}" a ${assetPath}`);
      return assetPath;
    }
    
    // Si no está en el mapa, intentar directamente
    const assetPath = `${basePath}${image}`;
    console.log(`Intentando cargar imagen de accesorio desde assets: ${assetPath}`);
    return assetPath;
  }
  
  // Si no es ninguno de los anteriores, intentar mapear por nombre
  console.warn(`Accesorio con imagen "${image}" no es una URL válida, intentando mapear por nombre`);
  const accessoryLower = (accessoryName || "").toLowerCase();
  for (const [key, value] of Object.entries(nameMap)) {
    if (accessoryLower.includes(key)) {
      const assetPath = `${basePath}${value}`;
      console.log(`Mapeando por nombre "${accessoryName}" a ${assetPath}`);
      return assetPath;
    }
  }
  
  // Si nada funciona, devolver null (no mostrar imagen)
  console.warn(`No se pudo resolver imagen para accesorio: ${accessoryName}`);
  return null;
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
      
      // Si no hay imagen, intentar mapear por nombre directamente
      const finalImg = img || resolveAccessoryImage(null, acc.name);
      
      // Construir HTML sin placeholder de Unsplash en onerror
      card.innerHTML = `
        <div class="shop-image">
          ${finalImg ? `<img src="${finalImg}" alt="${acc.name}" onerror="console.error('Error cargando imagen:', '${finalImg}'); this.style.display='none';" />` : '<div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;">Sin imagen</div>'}
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
