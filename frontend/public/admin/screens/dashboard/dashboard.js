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
    avatarUrl = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop';
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
    let avatarUrl = user.image || user.avatar_url || '';
    
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
    photoPreview.removeAttribute('data-image-changed');
    
    if (avatarUrl && avatarUrl.trim() !== '') {
      // Hay una imagen original - cargarla y mostrarla
      photoPreview.src = avatarUrl;
      photoPreview.style.display = "block";
      photoPreview.style.opacity = "1";
      
      // Ocultar el upload-inner cuando hay imagen
      if (uploadInner) {
        uploadInner.style.display = "none";
      }
      
      // Guardar la imagen original para comparar después
      photoPreview.setAttribute('data-original-image', avatarUrl);
      
      // Manejar error de carga de imagen
      photoPreview.onerror = () => {
        console.warn("⚠️ Error cargando imagen original, usando placeholder");
        photoPreview.style.display = "none";
        if (uploadInner) {
          uploadInner.style.display = "flex";
        }
        photoPreview.removeAttribute('data-original-image');
      };
      
      // Confirmar que la imagen cargó correctamente
      photoPreview.onload = () => {
        console.log("✅ Imagen original cargada correctamente:", avatarUrl.substring(0, 50));
      };
    } else {
      // No hay imagen original - mostrar solo el upload box
      photoPreview.style.display = "none";
      photoPreview.src = "";
      if (uploadInner) {
        uploadInner.style.display = "flex";
      }
      photoPreview.removeAttribute('data-original-image');
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
        // Convertir a base64
        const reader = new FileReader();
        reader.onload = (event) => {
          if (photoPreview) {
            photoPreview.src = event.target.result;
            photoPreview.style.display = "block";
            // Marcar que la imagen fue cambiada
            photoPreview.setAttribute('data-image-changed', 'true');
            if (photoPreview.parentElement) {
              const uploadInner = photoPreview.parentElement.querySelector(".upload-inner");
              if (uploadInner) {
                uploadInner.style.display = "none";
              }
            }
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error al cargar imagen:", error);
        alert("Error al cargar la imagen. Por favor, intenta de nuevo.");
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
        // Obtener imagen solo si fue cambiada
        let imageUrl = null;
        const imageChanged = photoPreview?.getAttribute('data-image-changed') === 'true';
        const originalImage = photoPreview?.getAttribute('data-original-image');
        
        if (imageChanged && photoPreview && photoPreview.style.display !== "none") {
          // Solo enviar si la imagen fue cambiada
          if (photoPreview.src.startsWith("data:")) {
            // Es una nueva imagen en base64 - convertir a File y subir
            console.log("📸 Imagen nueva detectada (data URL), convirtiendo y subiendo...");
            try {
              // Convertir data URL a Blob directamente
              const dataUrl = photoPreview.src;
              const arr = dataUrl.split(',');
              if (arr.length < 2) {
                throw new Error("Formato de data URL inválido");
              }
              
              const mimeMatch = arr[0].match(/:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const blob = new Blob([u8arr], { type: mime });
              
              // Crear un File desde el Blob
              const file = new File([blob], `profile-${user.id}-${Date.now()}.jpg`, {
                type: mime
              });
              
              console.log("📤 Subiendo imagen al servidor...");
              // Subir la imagen usando el método uploadImage
              imageUrl = await window.AdminAPI.uploadImage(file);
              console.log("✅ Imagen subida exitosamente:", imageUrl.substring(0, 50) + "...");
            } catch (uploadError) {
              console.error("❌ Error al subir imagen:", uploadError);
              // Si falla la subida, usar el data URL como fallback
              imageUrl = photoPreview.src;
              console.log("⚠️ Usando data URL como fallback");
            }
          } else if (photoPreview.src && photoPreview.src !== originalImage) {
            // La imagen cambió a una URL diferente (ya está subida)
            imageUrl = photoPreview.src;
            console.log("📸 Enviando nueva imagen (URL)");
          }
        } else if (!originalImage && photoPreview && photoPreview.style.display !== "none" && photoPreview.src.startsWith("data:")) {
          // Si no había imagen original pero ahora hay una nueva
          console.log("📸 Primera imagen detectada (data URL), convirtiendo y subiendo...");
          try {
            // Convertir data URL a Blob directamente
            const dataUrl = photoPreview.src;
            const arr = dataUrl.split(',');
            if (arr.length < 2) {
              throw new Error("Formato de data URL inválido");
            }
            
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            
            // Crear un File desde el Blob
            const file = new File([blob], `profile-${user.id}-${Date.now()}.jpg`, {
              type: mime
            });
            
            console.log("📤 Subiendo imagen al servidor...");
            // Subir la imagen usando el método uploadImage
            imageUrl = await window.AdminAPI.uploadImage(file);
            console.log("✅ Imagen subida exitosamente:", imageUrl.substring(0, 50) + "...");
          } catch (uploadError) {
            console.error("❌ Error al subir imagen:", uploadError);
            // Si falla la subida, usar el data URL como fallback
            imageUrl = photoPreview.src;
            console.log("⚠️ Usando data URL como fallback");
          }
        } else {
          console.log("📸 No se enviará imagen (no fue cambiada o no hay imagen nueva)");
        }
        
        // Actualizar usuario
        const updateData = {
          name: name
        };
        
        if (imageUrl) {
          // Enviar como avatar_url si es una URL, o como image si es data URL
          if (imageUrl.startsWith("data:")) {
            updateData.image = imageUrl;
            console.log("📸 Imagen incluida en updateData (data URL), tamaño:", Math.round(imageUrl.length / 1024), "KB");
          } else {
            // Si es una URL, enviar como avatar_url (preferido) o image
            updateData.avatar_url = imageUrl;
            updateData.image = imageUrl; // También como image para compatibilidad
            console.log("📸 Imagen incluida en updateData (URL):", imageUrl.substring(0, 50) + "...");
          }
        } else {
          console.log("📸 No se incluye imagen en updateData");
        }
        
        const response = await window.AdminAPI.updateUser(user.id, updateData);
        
        // Si hay una imagen y la respuesta fue exitosa o si falló pero la imagen está en updateData
        if (imageUrl) {
          // Guardar imagen en localStorage como respaldo
          const userImageKey = `user_${user.id}_avatar`;
          localStorage.setItem(userImageKey, imageUrl);
          console.log("📸 Imagen guardada en localStorage como respaldo");
        }
        
        if (response.success) {
          // Actualizar usuario en localStorage
          // Mapear avatar_url a image para compatibilidad con el frontend
          const updatedUser = { 
            ...user, 
            ...response.data,
            image: response.data.avatar_url || response.data.image || user.image || user.avatar_url || imageUrl
          };
          
          // Si la imagen no se guardó en la BD pero está en localStorage, usarla
          if (!updatedUser.image && imageUrl) {
            updatedUser.image = imageUrl;
          }
          
          localStorage.setItem("admin_user", JSON.stringify(updatedUser));
          
          // Actualizar visualización
          updateProfileDisplay(updatedUser);
          
          // Cerrar modal
          closeEditProfileModal();
          
          // Mensaje según si la imagen se guardó o no
          if (imageUrl && !response.imageUpdated) {
            alert("Nombre actualizado exitosamente. La imagen se guardó localmente. Para guardarla permanentemente, agrega el campo 'avatar_url' a la tabla 'users' en Supabase.");
          } else {
            alert("Perfil actualizado exitosamente.");
          }
        } else {
          // Si falló pero tenemos imagen, guardarla en localStorage y actualizar visualización
          if (imageUrl) {
            const updatedUser = { 
              ...user, 
              name: name,
              image: imageUrl
            };
            localStorage.setItem("admin_user", JSON.stringify(updatedUser));
            updateProfileDisplay(updatedUser);
            closeEditProfileModal();
            alert("Nombre actualizado. La imagen se guardó localmente. Para guardarla permanentemente, agrega el campo 'avatar_url' a la tabla 'users' en Supabase.");
            return;
          }
          
          // Usar el mensaje del backend que ahora es más específico
          const errorMessage = response.message || "Error al actualizar el perfil";
          console.error("Error del backend:", response);
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error("Error al actualizar perfil:", error);
        console.error("Detalles del error:", {
          message: error.message,
          response: error.response,
          stack: error.stack
        });
        
        // Mostrar mensaje más específico si está disponible
        let errorMessage = error.message || "Error al actualizar el perfil";
        
        // Si el error viene del backend con un mensaje específico, usarlo
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
    updateStatSubtext("activeDonations", `${stats.donations.active || 0} donaciones activas`);

    // Plants in Catalog
    updateStatCard("totalPlants", stats.plants.total || 0);
    updateStatSubtext("availablePlants", `${stats.plants.available || 0} disponibles`);

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
        // Límite: 150KB en data URL para evitar problemas con Supabase
        const maxDataUrlSize = 150 * 1024; // 150KB (límite más conservador)
        
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
          await window.AdminAPI.updatePlantMetrics(result.data.id, { health_status: healthStatus });
          console.log("✅ Health status registrado:", healthStatus);
        } catch (statusError) {
          console.warn("⚠️ No se pudo registrar el health_status, pero la planta se creó:", statusError);
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
        const userName = donation.user_name || donation.users?.name || "Usuario";
        
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
