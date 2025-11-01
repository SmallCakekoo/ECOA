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
// Usar EXACTAMENTE la misma ruta relativa que el HTML estático
function getAssetBasePath() {
  // El HTML estático usa: ../../src/assets/images/accessory-X.png
  // Esta ruta relativa funciona en el HTML, usarla exactamente igual
  return '../../src/assets/images/';
}

// Función helper para construir URL de imagen
function buildImageUrl(imagePath) {
  // Si ya es una URL completa (http/https/data), retornar directamente
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Si es una ruta relativa (empieza con ../), retornarla tal cual (igual que HTML estático)
  if (imagePath.startsWith('../')) {
    return imagePath;
  }
  
  // Si ya es una ruta absoluta (empieza con /), retornarla tal cual
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Si es un nombre de archivo simple, agregarlo a la ruta base relativa
  return getAssetBasePath() + imagePath;
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
        const fullUrl = buildImageUrl(assetPath);
        console.log(`Mapeando por nombre "${accessoryName}" a ${fullUrl}`);
        return fullUrl;
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
      const fullUrl = buildImageUrl(assetPath);
      console.log(`Mapeando "${image}" a ${fullUrl}`);
      return fullUrl;
    }
    
    // Si no está en el mapa, intentar directamente
    const assetPath = `${basePath}${image}`;
    const fullUrl = buildImageUrl(assetPath);
    console.log(`Intentando cargar imagen de accesorio desde assets: ${fullUrl}`);
    return fullUrl;
  }
  
  // Si no es ninguno de los anteriores, intentar mapear por nombre
  console.warn(`Accesorio con imagen "${image}" no es una URL válida, intentando mapear por nombre`);
  const accessoryLower = (accessoryName || "").toLowerCase();
  for (const [key, value] of Object.entries(nameMap)) {
    if (accessoryLower.includes(key)) {
      const assetPath = `${basePath}${value}`;
      const fullUrl = buildImageUrl(assetPath);
      console.log(`Mapeando por nombre "${accessoryName}" a ${fullUrl}`);
      return fullUrl;
    }
  }
  
  // Si nada funciona, devolver null (no mostrar imagen)
  console.warn(`No se pudo resolver imagen para accesorio: ${accessoryName}`);
  return null;
}

(async function loadAccessories() {
  try {
    console.log('🔍 Cargando accesorios desde:', `${API_BASE_URL}/accessories`);
    const res = await fetch(`${API_BASE_URL}/accessories`);
    
    if (!res.ok) {
      console.error('❌ Error en respuesta:', res.status, res.statusText);
      return;
    }
    
    const result = await res.json();
    console.log('✅ Respuesta recibida:', result);
    
    if (!result.success) {
      console.error('❌ Respuesta sin éxito:', result);
      return;
    }
    
    const data = result.data;
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ No hay accesorios o el array está vacío');
      return;
    }
    
    console.log(`✅ Cargados ${data.length} accesorios:`, data.map(a => a.name));

    const container = document.querySelector(".shop-content");
    if (!container) {
      console.error('❌ No se encontró el contenedor .shop-content');
      return;
    }
    container.innerHTML = "";

    data.forEach((acc) => {
      console.log(`📦 Procesando accesorio: ${acc.name}`, { image: acc.image, description: acc.description });
      const img = resolveAccessoryImage(acc.image, acc.name);
      const card = document.createElement("div");
      card.className = "shop-card";
      
      // Si no hay imagen, intentar mapear por nombre directamente
      const finalImg = img || resolveAccessoryImage(null, acc.name);
      
      // Usar EXACTAMENTE las mismas rutas relativas que el HTML estático
      // El HTML estático funciona con: ../../src/assets/images/accessory-X.png
      // No convertir a absolutas, usar las rutas relativas directamente
      let imageSrc = finalImg;
      
      // Construir HTML sin placeholder de Unsplash en onerror
      card.innerHTML = `
        <div class="shop-image">
          ${imageSrc ? `<img src="${imageSrc}" alt="${acc.name}" onerror="console.error('Error cargando imagen:', '${imageSrc}'); this.style.display='none';" />` : '<div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;">Sin imagen</div>'}
        </div>
        <div class="shop-info">
          <div class="shop-title">${acc.name || 'Sin nombre'}</div>
          <div class="shop-description">${acc.description || ""}</div>
          <button class="add-button" onclick="goToShopFeedback()">
            <span class="iconify" data-icon="material-symbols:add"></span>
          </button>
        </div>`;
      container.appendChild(card);
    });
    
    console.log('✅ Accesorios renderizados correctamente');
  } catch (e) {
    console.error("❌ Error loading accessories", e);
    const container = document.querySelector(".shop-content");
    if (container) {
      container.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Error al cargar accesorios: ${e.message}</div>`;
    }
  }
})();
