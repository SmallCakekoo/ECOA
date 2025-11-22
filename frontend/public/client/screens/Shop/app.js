const API_BASE_URL = "https://ecoa-ruddy.vercel.app";
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

// Función para comprar un accesorio (expuesta globalmente)
window.purchaseAccessory = async function (
  accessoryId,
  accessoryName,
  price,
  pId
) {
  try {
    // Usar el plantId de la variable global o del parámetro
    const currentPlantId = pId || plantId;

    // Verificar que hay un usuario logueado
    if (!USER_DATA || !USER_DATA.id) {
      console.error("Usuario no autenticado");
      window.location.href = "/client/screens/ShopFeedback/error";
      return;
    }

    // Verificar que hay una planta seleccionada
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
      userId: USER_DATA.id,
    });

    // Crear la donación (compra) en Supabase
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
        // Solo campos básicos: user_id, plant_id, amount, accessory_type
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
          fullError: errorJson,
        });
      } catch (e) {
        errorText = await donationResponse.text();
        console.error("❌ Error HTTP al crear donación (texto):", {
          status: donationResponse.status,
          statusText: donationResponse.statusText,
          error: errorText,
        });
      }
      alert(
        `Error al crear donación: ${JSON.stringify({
          status: donationResponse.status,
          error: errorText,
        })}`
      );
      window.location.href = `/client/screens/ShopFeedback/error?id=${currentPlantId}`;
      return;
    }

    const donationResult = await donationResponse.json();

    if (!donationResult.success) {
      console.error("❌ Error en respuesta de donación:", donationResult);
      alert(
        `Error: ${
          donationResult.message || donationResult.error || "Error desconocido"
        }`
      );
      window.location.href = `/client/screens/ShopFeedback/error?id=${currentPlantId}`;
      return;
    }

    console.log("✅ Donación creada exitosamente:", donationResult.data);

    // Intentar asignar el accesorio a la planta (opcional, no crítico)
    try {
      const assignmentResponse = await fetch(
        `${API_BASE_URL}/plants/${currentPlantId}/accessories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessory_id: accessoryId,
          }),
        }
      );

      if (!assignmentResponse.ok) {
        const errorText = await assignmentResponse.text();
        console.warn("⚠️ Error HTTP al asignar accesorio:", {
          status: assignmentResponse.status,
          error: errorText,
        });
      } else {
        const assignmentResult = await assignmentResponse.json();

        if (assignmentResult.success) {
          console.log(
            "✅ Accesorio asignado a la planta:",
            assignmentResult.data
          );
        } else {
          console.warn(
            "⚠️ No se pudo asignar el accesorio a la planta, pero la donación se creó:",
            assignmentResult
          );
        }
      }
    } catch (assignmentError) {
      console.warn(
        "⚠️ Error asignando accesorio a la planta (no crítico):",
        assignmentError
      );
      // No fallar si no se puede asignar, la donación ya se creó
    }

    // SIEMPRE redirigir a success si la donación se creó exitosamente
    console.log("✅ Redirigiendo a página de éxito...");
    window.location.href = `/client/screens/ShopFeedback/success?id=${currentPlantId}`;
  } catch (error) {
    console.error("❌ Error en la compra:", error);
    window.location.href = `/client/screens/ShopFeedback/error?id=${
      plantId || ""
    }`;
  }
};

// Función para ir a Shop Feedback Success (expuesta globalmente) - Mantener para compatibilidad
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
  const pathParts = baseUrl.pathname.split("/").filter((p) => p);
  // Remover 'screens' y 'Shop'
  if (pathParts.length >= 2 && pathParts[pathParts.length - 2] === "screens") {
    pathParts.pop(); // Shop
    pathParts.pop(); // screens
  }
  // Construir ruta base relativa (desde /client/screens/Shop/ a /client/src/assets/images/)
  // Necesitamos subir 2 niveles y luego entrar a src/assets/images/
  return "../../src/assets/images/";
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
  // Usar ruta relativa igual que el HTML estático que funciona
  const getImagePath = (imageName) => {
    // Ruta relativa desde /client/screens/Shop/ a /client/src/assets/images/
    // Igual que en el HTML: ../../src/assets/images/nombre.png
    return `../../src/assets/images/${imageName}`;
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
      // Usar ruta relativa exacta como en el HTML estático
      const imagePath =
        imageSrc ||
        `../../src/assets/images/${mappedName || "accessory-1.png"}`;
      // Formatear el precio
      const price = acc.price_estimate || 0;
      const formattedPrice = `$${price.toLocaleString("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;

      card.innerHTML = `
        <div class="shop-image">
          ${
            imageSrc
              ? `<img src="${imageSrc}" alt="${acc.name}" onerror="console.error('Error cargando imagen:', this.src); this.src='../../src/assets/images/accessory-1.png';" />`
              : '<div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;">Sin imagen</div>'
          }
        </div>
        <div class="shop-info">
          <div class="shop-title">${acc.name || "Sin nombre"}</div>
          <div class="shop-description">${acc.description || ""}</div>
          <div class="shop-price">${formattedPrice}</div>
          <button class="add-button" onclick="purchaseAccessory('${acc.id}', '${
        acc.name
      }', ${price}, '${plantId || ""}')">
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
