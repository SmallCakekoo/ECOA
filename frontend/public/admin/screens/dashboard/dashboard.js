document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Dashboard cargando...");

  // Verificar que AdminAPI esté disponible
  if (!window.AdminAPI) {
    console.error("❌ AdminAPI no está disponible");
    window.location.href = "/admin/screens/login";
    return;
  }

  console.log("✅ AdminAPI disponible");

  // Verificar autenticación
  const isAuth = window.AdminAPI.isAuthenticated();
  console.log("🔐 ¿Está autenticado?", isAuth);

  if (!isAuth) {
    console.log("❌ No autenticado, redirigiendo al login");
    window.location.href = "/admin/screens/login";
    return;
  }

  console.log("✅ Usuario autenticado, inicializando dashboard");

  // Inicializar la aplicación
  await initializeApp();

  // Event listeners para menú
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".menu-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // Event listeners para dropdown de perfil
  setupProfileDropdown();

  // Event listeners para logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (window.AuthManager) {
        window.AuthManager.logout();
      } else {
        window.AdminAPI.logout();
        window.location.href = "/admin/screens/login";
      }
    });
  }
});

// Función para configurar el dropdown del perfil
function setupProfileDropdown() {
  const avatar = document.getElementById("profileAvatar");
  const dropdown = document.getElementById("profileDropdown");

  console.log("🎯 Configurando dropdown de perfil", { avatar, dropdown });

  if (!avatar || !dropdown) {
    console.warn("⚠️ Avatar o dropdown no encontrado");
    return;
  }

  // Cargar información del usuario
  const user = window.AdminAPI.getCurrentUser();
  if (user) {
    const userNameEl = document.getElementById("userName");
    const userEmailEl = document.getElementById("userEmail");
    if (userNameEl) userNameEl.textContent = user.name || "Administrador";
    if (userEmailEl) userEmailEl.textContent = user.email || "admin@ecoa.org";
  }

  // Toggle dropdown al hacer clic en el avatar
  avatar.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });

  // Cerrar dropdown al hacer scroll
  window.addEventListener("scroll", () => {
    dropdown.classList.remove("active");
  });
}

async function initializeApp() {
  try {
    // Cargar estadísticas
    await loadStats();

    // Cargar plantas recientes
    await loadRecentPlants();

    // Configurar formulario de nueva planta
    setupPlantForm();

    // Configurar actualización automática
    setInterval(loadStats, 30000); // Actualizar cada 30 segundos
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("Error al cargar los datos del dashboard", "error");
  }
}

async function loadStats() {
  try {
    const stats = await window.AdminAPI.getStats();
    console.log("Stats loaded:", stats);

    // Actualizar contadores correctamente (IDs según index.html)
    updateStatCard("totalUsers", stats.plants.adopted || 0); // Total Adoptions
    updateStatCard(
      "totalAmount",
      `$${Number(stats.donations.totalAmount || 0).toLocaleString()}`
    );
    updateStatCard("totalPlants", stats.plants.total || 0);
    const healthScore = (() => {
      const total = stats.plants.total || 0;
      const healthy = stats.plants.healthy || 0;
      if (!total) return "0%";
      const pct = Math.round((healthy / total) * 100);
      return `${pct}%`;
    })();
    updateStatCard("healthScore", healthScore);

    // Actualizar gráficos (si existen)
    updateCharts(stats);
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

function updateStatCard(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}

function updateCharts(stats) {
  // Aquí se pueden actualizar gráficos si se implementan
  console.log("Stats loaded:", stats);
}

async function loadRecentPlants() {
  try {
    // Cargar todas las plantas sin filtro de status
    const response = await window.AdminAPI.getPlants();
    const plants = response.data.slice(0, 5); // Últimas 5 plantas

    const container = document.getElementById("recentPlants");
    if (container) {
      // Crear encabezados de tabla
      const tableHeaders = `
        <div class="plant-item plant-header-row">
          <div class="plant-image"></div>
          <div class="plant-info">PLANT</div>
          <div class="adopter-info">ADOPTER</div>
          <div class="status-cell">STATUS</div>
          <div class="care-notes">CARE NOTES</div>
        </div>
      `;

      // Crear filas de plantas con imágenes de Perenual API
      const plantRows = await Promise.all(
        plants.map(async (plant) => {
          // 1) Usar la imagen subida si existe (prioridad máxima)
          let plantImage = null;
          const ownImage = plant.image || plant.image_url;
          if (ownImage) {
            // Si es data URL (base64), usar directamente - es la imagen subida por el usuario
            if (ownImage.startsWith("data:")) {
              plantImage = ownImage;
              console.log(`✅ Usando imagen subida (data URL) para ${plant.name}`);
            } 
            // Si es URL completa, usar directamente
            else if (ownImage.startsWith("http")) {
              plantImage = ownImage;
              console.log(`✅ Usando imagen subida (URL) para ${plant.name}`);
            } 
            // Si es ruta relativa, construir URL completa
            else {
              plantImage = `${window.AdminConfig.API_BASE_URL}${ownImage}`;
              console.log(`✅ Usando imagen subida (relativa) para ${plant.name}: ${plantImage}`);
            }
          }

          // 2) Si no hay imagen subida, buscar en Perenual como fallback
          const searchTerms = [
            plant.species,
            plant.name,
            plant.species.split(" ")[0], // Solo el género
            plant.species.split(" ").slice(0, 2).join(" "), // Género + especie
          ].filter((term) => term && term.trim());

          if (!plantImage) {
            for (const searchTerm of searchTerms) {
            try {
              const perenualResponse = await fetch(
                `${
                  window.AdminConfig.API_BASE_URL
                }/api/integrations/perenual/search?q=${encodeURIComponent(
                  searchTerm
                )}&limit=1`
              );
              const perenualData = await perenualResponse.json();

              if (
                perenualData.success &&
                perenualData.search_results?.plants?.length > 0
              ) {
                const perenualPlant = perenualData.search_results.plants[0];
                console.log(
                  `🔍 Datos de imagen para ${plant.name}:`,
                  perenualPlant.default_image
                );

                // Verificar que la imagen no sea un placeholder genérico
                const imageUrl =
                  perenualPlant.default_image?.thumbnail ||
                  perenualPlant.default_image?.small_url ||
                  perenualPlant.default_image?.medium_url ||
                  perenualPlant.default_image?.regular_url;

                if (
                  imageUrl &&
                  !imageUrl.includes("upgrade_access.jpg") &&
                  !imageUrl.includes("placeholder")
                ) {
                  plantImage = imageUrl;
                  console.log(
                    `✅ Imagen real encontrada para ${plant.name} con término: "${searchTerm}" - URL: ${plantImage}`
                  );
                    break;
                } else {
                  console.log(
                    `❌ Imagen placeholder detectada para ${plant.name} con término: "${searchTerm}" - URL: ${imageUrl}`
                  );
                }
              }
            } catch (error) {
              console.log(
                `Error buscando "${searchTerm}" para ${plant.name}:`,
                error
              );
            }
            }
          }

          if (!plantImage) {
            console.log(
              `❌ No se encontró imagen real para ${plant.name} (${plant.species})`
            );
          } else {
            console.log(`🖼️ Imagen final para ${plant.name}: ${plantImage}`);
          }

          return `
          <div class="plant-item">
            <div class="plant-image">
              ${
                plantImage
                  ? `<img src="${plantImage}" 
                     alt="${plant.name}" 
                     style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;">`
                  : `<div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; text-align: center;">
                   Sin<br>imagen
                 </div>`
              }
            </div>
            <div class="plant-info">
              <h4>${plant.name} #${String(plant.id).padStart(6, "0")}</h4>
              <p>${plant.species}</p>
            </div>
            <div class="adopter-info">${
              plant.is_adopted ? "Adopted" : "Available"
            }</div>
            <div class="status-cell">
              <span class="status healthy">${
                plant.is_adopted ? "Adopted" : "Available"
              }</span>
            </div>
            <div class="care-notes">${
              plant.description || "No recent notes"
            }</div>
          </div>
        `;
        })
      );

      container.innerHTML = tableHeaders + plantRows.join("");
    }
  } catch (error) {
    console.error("Error loading recent plants:", error);
    showNotification("Error al cargar las plantas recientes", "error");
  }
}

function getStatusText(status) {
  const statusMap = {
    healthy: "Healthy",
    needs_care: "Recovering",
    sick: "Sick",
    dying: "Dying",
  };
  return statusMap[status] || status;
}

function setupPlantForm() {
  const uploadBox = document.getElementById("uploadBox");
  const fileInput = document.getElementById("plantPhoto");
  const preview = document.getElementById("photoPreview");

  if (uploadBox && fileInput && preview) {
    uploadBox.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      try {
        // Comprimir la imagen antes de convertirla a data URL
        // Límite: 200KB en data URL para evitar problemas con Supabase
        const maxDataUrlSize = 200 * 1024; // 200KB
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // Crear canvas para comprimir
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calcular dimensiones manteniendo aspecto
            let width = img.width;
            let height = img.height;
            const maxDimension = 800; // Máximo 800px en la dimensión más grande
            
            if (width > height && width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir a data URL con calidad ajustada
            let quality = 0.9;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Si aún es muy grande, reducir calidad gradualmente
            while (dataUrl.length > maxDataUrlSize && quality > 0.1) {
              quality -= 0.1;
              dataUrl = canvas.toDataURL('image/jpeg', quality);
              console.log(`🔄 Comprimiendo imagen, calidad: ${quality.toFixed(1)}, tamaño: ${Math.round(dataUrl.length / 1024)}KB`);
            }
            
            // Si sigue siendo muy grande después de comprimir, usar PNG
            if (dataUrl.length > maxDataUrlSize) {
              dataUrl = canvas.toDataURL('image/png');
              // Si PNG también es muy grande, reducir dimensiones más
              if (dataUrl.length > maxDataUrlSize) {
                const scale = Math.sqrt(maxDataUrlSize / dataUrl.length) * 0.9;
                canvas.width = Math.round(width * scale);
                canvas.height = Math.round(height * scale);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              }
            }
            
            if (dataUrl.length > maxDataUrlSize) {
              console.warn(`⚠️ Imagen muy grande incluso después de comprimir: ${Math.round(dataUrl.length / 1024)}KB`);
              showNotification("La imagen es muy grande. Se guardará sin imagen.", "warning");
              dataUrl = null;
            } else {
              console.log(`✅ Dashboard - Imagen comprimida, tamaño final: ${Math.round(dataUrl.length / 1024)}KB`);
            }
            
            preview.src = dataUrl || '/placeholder.png';
            preview.style.display = "block";
            uploadBox.querySelector(".upload-inner").style.display = "none";
            // Guardar el data URL en un atributo del preview para usarlo después
            preview.setAttribute('data-image-url', dataUrl || '');
          };
          img.onerror = () => {
            console.error("Error cargando imagen para compresión");
            showNotification("Error al procesar la imagen", "error");
          };
          img.src = e.target.result;
        };
        reader.onerror = (error) => {
          console.error("Error leyendo archivo:", error);
          showNotification("Error al leer la imagen", "error");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing image:", error);
        showNotification("Error al procesar la imagen", "error");
      }
    });
  }

  const plantForm = document.getElementById("plantForm");
  if (plantForm) {
    plantForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await createPlant();
    });
  }
}

async function createPlant() {
  const form = document.getElementById("plantForm");
  const formData = new FormData(form);

  // Obtener la imagen subida (data URL)
  const photoPreview = document.getElementById("photoPreview");
  let imageUrl = null;
  
  // Obtener el data URL del atributo o del src
  if (photoPreview && photoPreview.style.display !== "none") {
    // Primero intentar obtener del atributo data-image-url (más confiable)
    const dataImageUrl = photoPreview.getAttribute('data-image-url');
    if (dataImageUrl && dataImageUrl.startsWith("data:")) {
      imageUrl = dataImageUrl;
      console.log("✅ Dashboard - Imagen obtenida del atributo data-image-url");
    } 
    // Si no está en el atributo, usar el src si es data URL
    else if (photoPreview.src && photoPreview.src.startsWith("data:")) {
      imageUrl = photoPreview.src;
      console.log("✅ Dashboard - Imagen obtenida del src (data URL)");
    }
    // Si el src no es data URL, verificar que no sea placeholder
    else if (photoPreview.src && 
             photoPreview.src !== "" && 
             photoPreview.src !== "about:blank" &&
             !photoPreview.src.includes("unsplash.com/photo-1506905925346") && 
             !photoPreview.src.includes("placeholder") && 
             !photoPreview.src.includes("upgrade_access.jpg")) {
      imageUrl = photoPreview.src;
      console.log("✅ Dashboard - Imagen obtenida del src (URL)");
    }
    
    if (imageUrl) {
      console.log("🔍 Dashboard - Imagen validada:", { 
        hasImage: true, 
        isDataUrl: imageUrl.startsWith("data:"),
        imageLength: imageUrl.length,
        imagePreview: imageUrl.substring(0, 50) + "..."
      });
    } else {
      console.warn("⚠️ Dashboard - No se encontró imagen válida en el preview");
    }
  }

  const plantData = {
    user_id: null, // Plantas nuevas no tienen usuario asignado hasta ser adoptadas
    name: formData.get("plantName"),
    species: formData.get("species"),
    description: formData.get("description"),
    image: imageUrl,
    // No enviar campos que no existen en la tabla plants
    // status, health_status, water_level, etc. van en otras tablas relacionadas
  };

  try {
    showLoading(true);
    const result = await window.AdminAPI.createPlant(plantData);

    if (result.success) {
      showNotification("Planta creada exitosamente", "success");
      form.reset();
      const preview = document.getElementById("photoPreview");
      if (preview) {
        preview.style.display = "none";
        preview.src = "";
        preview.removeAttribute('data-image-url');
      }
      const uploadInner = document.querySelector(".upload-inner");
      if (uploadInner) uploadInner.style.display = "block";

      // Recargar datos
      await loadStats();
      await loadRecentPlants();
    } else {
      showNotification(result.message || "Error al crear la planta", "error");
    }
  } catch (error) {
    console.error("Error creating plant:", error);
    showNotification(error.message || "Error al crear la planta", "error");
  } finally {
    showLoading(false);
  }
}

function showLoading(show = true) {
  window.AdminUtils.showLoading(show);
}

function showNotification(message, type = "error") {
  window.AdminUtils.showNotification(message, type);
}
