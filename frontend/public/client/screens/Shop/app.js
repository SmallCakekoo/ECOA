const API_BASE_URL = "https://ecoa-backend-three.vercel.app";
const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));

// Obtener el ID de la planta desde la URL
const params = new URLSearchParams(window.location.search);
const plantId = params.get("id");

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

// Cargar datos de la planta si hay plant_id en la URL
async function loadPlantData() {
  const headerTitle = document.querySelector(".header-title");
  
  if (!plantId) {
    console.warn("No plant ID provided in URL");
    // Mantener "Shop" como título si no hay plantId
    if (headerTitle && headerTitle.textContent === "Julio") {
      headerTitle.textContent = "Shop";
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/plants/${plantId}`);
    
    if (!response.ok) {
      console.warn(`Error obteniendo planta: ${response.status}`);
      return;
    }
    
    const { success, data: plant } = await response.json();

    if (success && plant) {
      // Actualizar título y nombre en el DOM
      document.title = `Shop - ${plant.name}`;
      if (headerTitle) {
        headerTitle.textContent = plant.name;
      }
      console.log("✅ Datos de planta cargados:", plant.name);
    } else {
      console.warn("No se encontró la planta con ID:", plantId);
    }
  } catch (error) {
    console.error("Error loading plant data:", error);
  }
}

// Cargar primero la información de la planta y luego los accesorios
(async function initializeShop() {
  // Cargar datos de la planta primero
  await loadPlantData();
  
  // Luego cargar accesorios
  await loadAccessories();
})();

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
  if (plantId) {
    window.location.href = `/client/screens/ShopFeedback/success?id=${plantId}`;
  } else {
    window.location.href = "/client/screens/ShopFeedback/success";
  }
};

// Función helper para obtener la ruta base de assets
// Usar new URL() para resolver rutas relativas correctamente desde la URL actual
function getAssetBasePath() {
  // Obtener la URL base desde la ubicación actual
  const baseUrl = new URL(window.location.href);
  // Desde /client/screens/Shop, subir 2 niveles para llegar a /client/
  const pathParts = baseUrl.pathname.split('/').filter(p => p);
  // Remover 'screens' y 'Shop'
  if (pathParts.length >= 2 && pathParts[pathParts.length - 2] === 'screens') {
    pathParts.pop(); // Shop
    pathParts.pop(); // screens
  }
  // Construir ruta base relativa (desde /client/screens/Shop/ a /client/src/assets/images/)
  // Necesitamos subir 2 niveles y luego entrar a src/assets/images/
  return '../../src/assets/images/';
}

// Función helper para construir URL de imagen
function buildImageUrl(imagePath) {
  // Si ya es una URL completa (http/https/data), retornar directamente
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  // Si es una ruta relativa (empieza con ../), convertirla a absoluta con /client/
  if (imagePath.startsWith("../")) {
    try {
      // Resolver ruta relativa desde la URL actual usando new URL()
      const baseUrl = new URL(window.location.href);
      const resolvedUrl = new URL(imagePath, baseUrl);
      // Extraer solo el pathname y asegurar que tenga /client/
      let pathname = resolvedUrl.pathname;
      
      // Si la ruta resuelta no tiene /client/, agregarlo
      if (!pathname.startsWith("/client/") && pathname.startsWith("/src/")) {
        pathname = "/client" + pathname;
      }
      return pathname;
    } catch (e) {
      // Si falla new URL(), construir manualmente
      // Desde /client/screens/Shop/, subir 2 niveles = /client/
      // Luego agregar src/assets/images/nombre
      const fileName = imagePath.replace("../", "").replace("../", "");
      return "/client/src/assets/images/" + fileName;
    }
  }

  // Si ya es una ruta absoluta (empieza con /), construirla correctamente
  if (imagePath.startsWith("/")) {
    // Si empieza con /client/ es correcta
    if (imagePath.startsWith("/client/")) {
      return imagePath;
    }
    // Si empieza con /src/, convertirlo a /client/src/
    if (imagePath.startsWith("/src/")) {
      return "/client" + imagePath;
    }
    return imagePath;
  }

  // Si es un nombre de archivo simple, agregarlo a la ruta base
  const basePath = getAssetBasePath();
  if (basePath.startsWith("../")) {
    // Construir ruta absoluta desde relativa
    // Desde /client/screens/Shop/, subir 2 niveles = /client/
    // Luego src/assets/images/nombre
    const fileName = imagePath;
    return "/client/src/assets/images/" + fileName;
  }
  return basePath + imagePath;
}

// Cargar accesorios desde Supabase vía backend y renderizar
function resolveAccessoryImage(image, accessoryName) {
  // Función helper para construir ruta correcta de imagen
  const getImagePath = (imageName) => {
    // Construir ruta absoluta manualmente - las imágenes están en /client/src/assets/images/
    return `/client/src/assets/images/${imageName}`;
  };

  // Mapear nombre del accesorio a imagen de asset
  const nameMap = {
    fertilizante: "accessory-3.png",
    lámpara: "accessory-1.png",
    lampara: "accessory-1.png",
    matera: "accessory-2.png",
  };

  // Si no hay imagen o es inválida, intentar mapear por nombre del accesorio
  if (!image || image.trim() === "") {
    const accessoryLower = (accessoryName || "").toLowerCase();
    for (const [key, value] of Object.entries(nameMap)) {
      if (accessoryLower.includes(key)) {
        const fullUrl = getImagePath(value);
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
      fertilizante: "accessory-3.png",
      lampara: "accessory-1.png",
      matera: "accessory-2.png",
    };

    const fileName = image.toLowerCase();
    const mappedName =
      imageNameMap[fileName] || imageNameMap[fileName.replace(".png", "")];

    if (mappedName) {
      const fullUrl = getImagePath(mappedName);
      console.log(`Mapeando "${image}" a ${fullUrl}`);
      return fullUrl;
    }

    // Si no está en el mapa, intentar directamente
    const fullUrl = getImagePath(image);
    console.log(
      `Intentando cargar imagen de accesorio desde assets: ${fullUrl}`
    );
    return fullUrl;
  }

  // Si no es ninguno de los anteriores, intentar mapear por nombre
  console.warn(
    `Accesorio con imagen "${image}" no es una URL válida, intentando mapear por nombre`
  );
  const accessoryLower = (accessoryName || "").toLowerCase();
  for (const [key, value] of Object.entries(nameMap)) {
    if (accessoryLower.includes(key)) {
      const fullUrl = getImagePath(value);
      console.log(`Mapeando por nombre "${accessoryName}" a ${fullUrl}`);
      return fullUrl;
    }
  }

  // Si nada funciona, devolver null (no mostrar imagen)
  console.warn(`No se pudo resolver imagen para accesorio: ${accessoryName}`);
  return null;
}

async function loadAccessories() {
  try {
    console.log("🔍 Cargando accesorios desde:", `${API_BASE_URL}/accessories`);
    const res = await fetch(`${API_BASE_URL}/accessories`);

    if (!res.ok) {
      console.error("❌ Error en respuesta:", res.status, res.statusText);
      return;
    }

    const result = await res.json();
    console.log("✅ Respuesta recibida:", result);

    if (!result.success) {
      console.error("❌ Respuesta sin éxito:", result);
      return;
    }

    const data = result.data;
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn("⚠️ No hay accesorios o el array está vacío");
      return;
    }

    console.log(
      `✅ Cargados ${data.length} accesorios:`,
      data.map((a) => a.name)
    );

    const container = document.querySelector(".shop-content");
    if (!container) {
      console.error("❌ No se encontró el contenedor .shop-content");
      return;
    }
    container.innerHTML = "";

    data.forEach((acc) => {
      console.log(`📦 Procesando accesorio: ${acc.name}`, {
        image: acc.image,
        description: acc.description,
      });
      const img = resolveAccessoryImage(acc.image, acc.name);
      const card = document.createElement("div");
      card.className = "shop-card";

      // Si no hay imagen, intentar mapear por nombre directamente
      const finalImg = img || resolveAccessoryImage(null, acc.name);
      
      // Usar la imagen directamente (ya viene con ruta resuelta desde resolveAccessoryImage)
      let imageSrc = finalImg;

      // Construir HTML sin placeholder de Unsplash en onerror
      card.innerHTML = `
        <div class="shop-image">
          ${
            imageSrc
              ? `<img src="${imageSrc}" alt="${acc.name}" onerror="console.error('Error cargando imagen:', '${imageSrc}'); this.style.display='none';" />`
              : '<div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;">Sin imagen</div>'
          }
        </div>
        <div class="shop-info">
          <div class="shop-title">${acc.name || "Sin nombre"}</div>
          <div class="shop-description">${acc.description || ""}</div>
          <button class="add-button" onclick="goToShopFeedback()">
            <span class="iconify" data-icon="material-symbols:add"></span>
          </button>
        </div>`;
      container.appendChild(card);
    });

    console.log("✅ Accesorios renderizados correctamente");
  } catch (e) {
    console.error("❌ Error loading accessories", e);
    const container = document.querySelector(".shop-content");
    if (container) {
      container.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Error al cargar accesorios: ${e.message}</div>`;
    }
  }
}
