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
    updateProfileDisplay(user);
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

  // Botón para editar perfil
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.remove("active");
      openEditProfileModal();
    });
  }
}

// Función para actualizar la visualización del perfil
function updateProfileDisplay(user) {
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const avatar = document.getElementById("profileAvatar");
  const dropdownAvatar = document.querySelector(".dropdown-avatar");

  if (userNameEl) userNameEl.textContent = user.name || "Administrador";
  if (userEmailEl) userEmailEl.textContent = user.email || "admin@ecoa.org";

  // Actualizar avatares (soporta tanto 'image' como 'avatar_url' para compatibilidad)
  // También verifica localStorage como respaldo
  let avatarUrl = user.image || user.avatar_url;

  // Si no hay imagen en el usuario, buscar en localStorage
  if (!avatarUrl && user.id) {
    const userImageKey = `user_${user.id}_avatar`;
    const storedImage = localStorage.getItem(userImageKey);
    if (storedImage) {
      avatarUrl = storedImage;
      console.log("📸 Imagen recuperada de localStorage");
    }
  }

  // Si aún no hay imagen, usar placeholder
  if (!avatarUrl) {
    avatarUrl =
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop";
  }

  if (avatar) {
    avatar.style.backgroundImage = `url(${avatarUrl})`;
  }
  if (dropdownAvatar) {
    dropdownAvatar.style.backgroundImage = `url(${avatarUrl})`;
  }
}

// Función para abrir el modal de edición de perfil
function openEditProfileModal() {
  const modal = document.getElementById("editProfileModal");
  const user = window.AdminAPI.getCurrentUser();

  if (!modal || !user) return;

  // Cargar datos actuales
  const nameInput = document.getElementById("profileName");
  const photoPreview = document.getElementById("profilePhotoPreview");
  const photoInput = document.getElementById("profilePhotoInput");
  const uploadInner = document.querySelector("#profileUploadBox .upload-inner");

  if (nameInput) {
    nameInput.value = user.name || "";
  }

  if (photoPreview) {
    // Buscar imagen en user, luego en localStorage
    let avatarUrl = user.image || user.avatar_url || "";

    // Si no hay imagen en el usuario, buscar en localStorage
    if (!avatarUrl && user.id) {
      const userImageKey = `user_${user.id}_avatar`;
      const storedImage = localStorage.getItem(userImageKey);
      if (storedImage) {
        avatarUrl = storedImage;
        console.log("📸 Imagen recuperada de localStorage para el modal");
      }
    }

    // Limpiar estado anterior
    photoPreview.removeAttribute("data-image-changed");

    if (avatarUrl && avatarUrl.trim() !== "") {
      // Hay una imagen original - cargarla y mostrarla
      photoPreview.src = avatarUrl;
      photoPreview.style.display = "block";
      photoPreview.style.opacity = "1";

      // Ocultar el upload-inner cuando hay imagen
      if (uploadInner) {
        uploadInner.style.display = "none";
      }

      // Guardar la imagen original para comparar después
      photoPreview.setAttribute("data-original-image", avatarUrl);

      // Manejar error de carga de imagen
      photoPreview.onerror = () => {
        console.warn("⚠️ Error cargando imagen original, usando placeholder");
        photoPreview.style.display = "none";
        if (uploadInner) {
          uploadInner.style.display = "flex";
        }
        photoPreview.removeAttribute("data-original-image");
      };

      // Confirmar que la imagen cargó correctamente
      photoPreview.onload = () => {
        console.log(
          "✅ Imagen original cargada correctamente:",
          avatarUrl.substring(0, 50)
        );
      };
    } else {
      // No hay imagen original - mostrar solo el upload box
      photoPreview.style.display = "none";
      photoPreview.src = "";
      if (uploadInner) {
        uploadInner.style.display = "flex";
      }
      photoPreview.removeAttribute("data-original-image");
    }
  }

  if (photoInput) {
    photoInput.value = "";
  }

  modal.style.display = "flex";
}

// Función para cerrar el modal de edición de perfil
function closeEditProfileModal() {
  const modal = document.getElementById("editProfileModal");
  if (modal) {
    modal.style.display = "none";
  }
}

async function initializeApp() {
  try {
    // Configurar modal de edición de perfil
    setupEditProfileModal();

    // Cargar estadísticas
    await loadStats();

    // Cargar plantas recientes
    await loadRecentPlants();

    // Cargar donaciones recientes
    await loadRecentDonations();

    // Cargar dispositivos para el selector
    await loadDevices();

    // Configurar formulario de nueva planta
    setupPlantForm();

    // Configurar actualización automática
    setInterval(loadStats, 30000); // Actualizar cada 30 segundos
    setInterval(loadRecentDonations, 30000); // Actualizar donaciones cada 30 segundos
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("Error al cargar los datos del dashboard", "error");
  }
}

// Configurar eventos del modal de edición de perfil
function setupEditProfileModal() {
  const modal = document.getElementById("editProfileModal");
  const closeBtn = document.getElementById("closeEditProfileModal");
  const cancelBtn = document.getElementById("cancelEditProfile");
  const form = document.getElementById("editProfileForm");
  const photoInput = document.getElementById("profilePhotoInput");
  const photoPreview = document.getElementById("profilePhotoPreview");

  // Cerrar modal
  if (closeBtn) {
    closeBtn.addEventListener("click", closeEditProfileModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeEditProfileModal);
  }

  // Cerrar al hacer clic fuera del modal
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeEditProfileModal();
      }
    });
  }

  // Manejar subida de foto
  if (photoInput) {
    photoInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        // Mostrar estado de carga
        const uploadInner = photoPreview.parentElement.querySelector(".upload-inner");
        if (uploadInner) {
          uploadInner.innerHTML = '<div class="spinner"></div><p>Subiendo...</p>';
          uploadInner.style.display = "flex";
        }
        photoPreview.style.display = "none";

        // Subir imagen directamente al backend
        console.log("📤 Subiendo imagen de perfil...");
        const imageUrl = await window.AdminAPI.uploadImage(file);

        // Mostrar imagen subida
        if (photoPreview) {
          photoPreview.src = imageUrl;
          photoPreview.style.display = "block";
          photoPreview.setAttribute("data-image-changed", "true");
          // Guardar URL en atributo para usarla al guardar
          photoPreview.setAttribute("data-uploaded-url", imageUrl);
          
          if (uploadInner) {
            uploadInner.style.display = "none";
            // Restaurar contenido original
            uploadInner.innerHTML = '<i class="fas fa-camera"></i><p>Change Photo</p>';
          }
        }
        console.log("✅ Imagen de perfil subida:", imageUrl);

      } catch (error) {
        console.error("Error al subir imagen:", error);
        alert("Error al subir la imagen. Por favor, intenta de nuevo.");
        
        // Restaurar estado
        const uploadInner = photoPreview.parentElement.querySelector(".upload-inner");
        if (uploadInner) {
          uploadInner.innerHTML = '<i class="fas fa-camera"></i><p>Change Photo</p>';
          uploadInner.style.display = "flex";
        }
      }
    });
  }

  // Manejar envío del formulario
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = window.AdminAPI.getCurrentUser();
      if (!user || !user.id) {
        alert("Error: No se pudo identificar al usuario.");
        return;
      }

      const nameInput = document.getElementById("profileName");
      const name = nameInput ? nameInput.value.trim() : "";

      if (!name) {
        alert("El nombre es requerido.");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Guardando...";
      }

      try {
        // Obtener URL de la imagen
        let imageUrl = null;
        const imageChanged = photoPreview?.getAttribute("data-image-changed") === "true";
        const uploadedUrl = photoPreview?.getAttribute("data-uploaded-url");
        const originalImage = photoPreview?.getAttribute("data-original-image");

        if (imageChanged && uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log("📸 Usando nueva imagen subida:", imageUrl);
        } else if (imageChanged && photoPreview.src && photoPreview.src !== originalImage) {
          // Fallback por si acaso
          imageUrl = photoPreview.src;
        }

        // Actualizar usuario
        const updateData = {
          name: name,
        };

        if (imageUrl) {
          updateData.image = imageUrl;
          updateData.avatar_url = imageUrl; // Para compatibilidad
        }

        const response = await window.AdminAPI.updateUser(user.id, updateData);

        if (response.success) {
          // Actualizar usuario en localStorage
          const updatedUser = {
            ...user,
            ...response.data,
            image: imageUrl || user.image,
            avatar_url: imageUrl || user.avatar_url
          };

          localStorage.setItem("admin_user", JSON.stringify(updatedUser));

          // Actualizar visualización
          updateProfileDisplay(updatedUser);

          // Cerrar modal
          closeEditProfileModal();
          alert("Perfil actualizado exitosamente.");
        } else {
          throw new Error(response.message || "Error al actualizar el perfil");
        }
      } catch (error) {
        console.error("Error al actualizar perfil:", error);
        let errorMessage = error.message || "Error al actualizar el perfil";
        if (error.response && error.response.message) {
          errorMessage = error.response.message;
        }
        alert(`Error al actualizar el perfil: ${errorMessage}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Guardar Cambios";
        }
      }
    });
  }
}

async function loadStats() {
  try {
    const stats = await window.AdminAPI.getStats();
    console.log("Stats loaded:", stats);

    // Calcular nuevas adopciones este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const adoptedThisMonth = stats.plants.adopted || 0; // Simplificado, podría mejorarse con fecha de adopción

    // Actualizar contadores correctamente (IDs según index.html)
    updateStatCard("totalUsers", stats.plants.adopted || 0); // Total Adoptions
    updateStatSubtext("newUsers", `${adoptedThisMonth} nuevos este mes`); // Actualizar subtítulo

    // Total Donations
    const totalDonations = Number(stats.donations.totalAmount || 0);
    updateStatCard("totalAmount", `$${totalDonations.toLocaleString()}`);
    updateStatSubtext(
      "activeDonations",
      `${stats.donations.active || 0} donaciones activas`
    );

    // Plants in Catalog
    updateStatCard("totalPlants", stats.plants.total || 0);
    updateStatSubtext(
      "availablePlants",
      `${stats.plants.available || 0} disponibles`
    );

    // Health Score
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
    showNotification("Error al cargar estadísticas", "error");
  }
}

function updateStatCard(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}

function updateStatSubtext(elementId, value) {
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
              console.log(
                `✅ Usando imagen subida (data URL) para ${plant.name}`
              );
            }
            // Si es URL completa, usar directamente
            else if (ownImage.startsWith("http")) {
              plantImage = ownImage;
              console.log(`✅ Usando imagen subida (URL) para ${plant.name}`);
            }
            // Si es ruta relativa, construir URL completa
            else {
              plantImage = `${window.AdminConfig.API_BASE_URL}${ownImage}`;
              console.log(
                `✅ Usando imagen subida (relativa) para ${plant.name}: ${plantImage}`
              );
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
              plant.users?.name || "None"
            }</div>
            <div class="status-cell">
              <span class="status ${
                (plant.health_status || "healthy").toLowerCase()
              }">${
                getStatusText(plant.health_status || "healthy")
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
    recovering: "Recovering",
    bad: "Bad",
    // Mapeos legacy para compatibilidad
    excellent: "Healthy", // Mapear excellent a healthy si existe en datos legacy
    needs_care: "Recovering",
    sick: "Bad",
    dying: "Bad",
    critical: "Bad", // Mapeo para valores legacy
  };
  return statusMap[status] || status;
}

async function loadDevices() {
  try {
    const response = await window.AdminAPI.getDevices();
    const devices = response.data || [];

    const deviceSelect = document.getElementById("deviceSelect");
    if (deviceSelect) {
      // Limpiar opciones existentes excepto la primera
      deviceSelect.innerHTML =
        '<option value="">Select a device (optional)</option>';

      // Agregar dispositivos al selector
      devices.forEach((device) => {
        const option = document.createElement("option");
        option.value = device.id;
        // Mostrar información útil del dispositivo (serial_number o serial, model, location)
        const serial = device.serial_number || device.serial || "Unknown";
        const deviceLabel = [serial, device.model || "", device.location || ""]
          .filter(Boolean)
          .join(" - ");
        option.textContent = deviceLabel || device.id;
        deviceSelect.appendChild(option);
      });

      console.log(`✅ ${devices.length} dispositivos cargados en el selector`);
    }
  } catch (error) {
    console.error("Error loading devices:", error);
    // No mostrar error al usuario, simplemente dejar el selector vacío
  }
}

function setupPlantForm() {
  const uploadBox = document.getElementById("uploadBox");
  const fileInput = document.getElementById("plantPhoto");
  const preview = document.getElementById("photoPreview");

  if (uploadBox && fileInput && preview) {
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      try {
        // Mostrar estado de carga
        const uploadInner = uploadBox.querySelector(".upload-inner");
        if (uploadInner) {
          uploadInner.innerHTML = '<div class="spinner"></div><p>Procesando y subiendo...</p>';
          uploadInner.style.display = "flex";
        }
        preview.style.display = "none";

        // Convertir imagen a PNG para preservar transparencia
        const processedFile = await convertImageToPNG(file);

        // Subir imagen directamente a Supabase Storage
        console.log("📤 Subiendo imagen al backend...");
        const imageUrl = await window.AdminAPI.uploadImage(processedFile);

        // Mostrar preview
        preview.src = imageUrl;
        preview.style.display = "block";
        preview.setAttribute("data-image-url", imageUrl);
        
        if (uploadInner) {
          uploadInner.style.display = "none";
          // Restaurar contenido original
          uploadInner.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Click to upload image</p>';
        }
        
        console.log("✅ Imagen subida exitosamente:", imageUrl);

      } catch (error) {
        console.error("Error uploading image:", error);
        showNotification("Error al subir la imagen: " + (error.message || "Error desconocido"), "error");
        
        // Restaurar estado
        const uploadInner = uploadBox.querySelector(".upload-inner");
        if (uploadInner) {
          uploadInner.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Click to upload image</p>';
          uploadInner.style.display = "flex";
        }
        preview.style.display = "none";
      }
    });
  }
}

// Función para convertir imagen a PNG preservando transparencia
async function convertImageToPNG(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Crear canvas para redimensionar y convertir a PNG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calcular dimensiones manteniendo aspecto
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200; // Máximo 1200px en la dimensión más grande

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada (preserva transparencia)
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a Blob en formato PNG
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Error al convertir imagen a PNG"));
            return;
          }
          
          // Crear un nuevo File con nombre .png
          const fileName = file.name.replace(/\.[^/.]+$/, "") + ".png";
          const pngFile = new File([blob], fileName, { type: "image/png" });
          
          console.log(`✅ Imagen convertida a PNG: ${Math.round(pngFile.size / 1024)}KB`);
          resolve(pngFile);
        }, "image/png", 0.95); // Calidad 0.95 para PNG (mantiene buena calidad y transparencia)
      };
      img.onerror = () => {
        reject(new Error("Error al cargar la imagen"));
      };
      img.src = e.target.result;
    };
    reader.onerror = (error) => {
      reject(new Error("Error al leer el archivo"));
    };
    reader.readAsDataURL(file);
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

  // Obtener la imagen subida (URL de Supabase)
  const photoPreview = document.getElementById("photoPreview");
  let imageUrl = null;

  // Obtener la URL del atributo data-image-url (ahora será URL de Supabase, no Base64)
  if (photoPreview && photoPreview.style.display !== "none") {
    const uploadedUrl = photoPreview.getAttribute("data-image-url");
    if (uploadedUrl) {
      imageUrl = uploadedUrl;
      console.log("✅ Dashboard - Imagen obtenida del atributo data-image-url (URL de Supabase)");
    } else if (
      photoPreview.src &&
      photoPreview.src !== "" &&
      photoPreview.src !== "about:blank" &&
      !photoPreview.src.includes("unsplash.com/photo-1506905925346") &&
      !photoPreview.src.includes("placeholder") &&
      !photoPreview.src.includes("upgrade_access.jpg") &&
      !photoPreview.src.startsWith("data:")
    ) {
      // Si no hay atributo pero el src es una URL válida (no Base64), usarla
      imageUrl = photoPreview.src;
      console.log("✅ Dashboard - Imagen obtenida del src (URL)");
    }

    if (imageUrl) {
      console.log("🔍 Dashboard - Imagen validada:", {
        hasImage: true,
        isSupabaseUrl: imageUrl.includes("supabase"),
        imageUrl: imageUrl.substring(0, 100) + "...",
      });
    } else {
      console.warn("⚠️ Dashboard - No se encontró imagen válida en el preview");
    }
  }

  // Obtener device_id del selector (puede ser null o string vacío)
  const deviceId = formData.get("device_id");
  const deviceIdValue = deviceId && deviceId.trim() !== "" ? deviceId : null;

  const plantData = {
    user_id: null, // Plantas nuevas no tienen usuario asignado hasta ser adoptadas
    name: formData.get("plantName"),
    species: formData.get("species"),
    description: formData.get("description"),
    image: imageUrl,
    device_id: deviceIdValue, // Solo incluir si se seleccionó un dispositivo
    // No enviar campos que no existen en la tabla plants
    // status, health_status, water_level, etc. van en otras tablas relacionadas
  };

  // Obtener healthStatus del select (valor en lowercase: excellent, healthy, recovering, bad)
  const healthStatusSelect = document.getElementById("healthStatus");
  const healthStatus = healthStatusSelect ? healthStatusSelect.value : null;

  try {
    showLoading(true);
    const result = await window.AdminAPI.createPlant(plantData);

    if (result.success) {
      // Si se especificó un healthStatus, actualizarlo en plant_status
      if (healthStatus && result.data && result.data.id) {
        try {
          await window.AdminAPI.updatePlantMetrics(result.data.id, {
            health_status: healthStatus,
          });
          console.log("✅ Health status registrado:", healthStatus);
        } catch (statusError) {
          console.warn(
            "⚠️ No se pudo registrar el health_status, pero la planta se creó:",
            statusError
          );
          // No fallar si no se puede actualizar el status, la planta ya se creó
        }
      }

      showNotification("Planta creada exitosamente", "success");
      form.reset();
      document.getElementById("photoPreview").style.display = "none";
      document.querySelector(".upload-inner").style.display = "block";

      // Recargar datos
      await loadStats();
      await loadRecentPlants();
    }
  } catch (error) {
    console.error("Error creating plant:", error);
    showNotification(error.message || "Error al crear la planta", "error");
  } finally {
    showLoading(false);
  }
}

async function loadRecentDonations() {
  try {
    const response = await window.AdminAPI.getDonations({});
    const donations = response.data || [];

    // Ordenar por fecha de creación (más recientes primero) y tomar las primeras 3
    const sortedDonations = donations
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      })
      .slice(0, 3);

    const container = document.getElementById("recentDonations");
    if (!container) return;

    if (sortedDonations.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666;">
          No hay donaciones recientes
        </div>
      `;
      return;
    }

    container.innerHTML = sortedDonations
      .map((donation) => {
        // Obtener nombre del usuario
        const userName =
          donation.user_name || donation.users?.name || "Usuario";

        // Obtener nombre de la planta o tipo de accesorio
        const plantName = donation.plant_name || donation.plants?.name || "";
        const accessoryType = donation.accessory_type || "";
        const donationNote = accessoryType
          ? `For ${accessoryType}`
          : plantName
          ? `For ${plantName}`
          : "Donation";

        // Formatear monto
        const amount = Number(donation.amount || 0);
        const formattedAmount = `$${amount.toLocaleString()}`;

        return `
          <div class="donation-item">
            <div class="donation-left">
              <div class="donation-icon">
                <span
                  class="iconify"
                  data-icon="material-symbols:attach-money-rounded"
                  style="font-size: 28px; color: white"
                ></span>
              </div>
              <div class="donation-info">
                <div class="donation-name">${userName}</div>
                <div class="donation-note">${donationNote}</div>
              </div>
            </div>
            <div class="donation-amount">${formattedAmount}</div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading recent donations:", error);
    const container = document.getElementById("recentDonations");
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #d32f2f;">
          Error al cargar donaciones
        </div>
      `;
    }
  }
}

function showLoading(show = true) {
  window.AdminUtils.showLoading(show);
}

function showNotification(message, type = "error") {
  window.AdminUtils.showNotification(message, type);
}
