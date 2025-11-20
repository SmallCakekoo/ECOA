let currentPage = 1;
let currentFilters = {};
let allPlants = [];

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  if (!window.AdminAPI.isAuthenticated()) {
    window.location.href = "/admin/screens/login";
    return;
  }

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

  if (!avatar || !dropdown) return;

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
    
    if (avatarUrl && avatarUrl.trim() !== '') {
      photoPreview.src = avatarUrl;
      photoPreview.style.display = "block";
      photoPreview.style.opacity = "1";
      if (uploadInner) {
        uploadInner.style.display = "none";
      }
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
      
      photoPreview.onload = () => {
        console.log("✅ Imagen original cargada correctamente:", avatarUrl.substring(0, 50));
      };
    } else {
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
    
    // Cargar plantas
    await loadPlants();
    await updateMetricsFromPlants();

    // Cargar dispositivos para los selectores
    await loadDevices();

    // Configurar filtros
    setupFilters();

    // Configurar paginación
    setupPagination();

    // Configurar formulario de nueva planta
    setupPlantForm();

    // Configurar búsqueda
    setupSearch();
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("Error al cargar las plantas", "error");
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
          if (photoPreview.src.startsWith("data:")) {
            imageUrl = photoPreview.src;
            console.log("📸 Enviando nueva imagen (data URL)");
          } else if (photoPreview.src && photoPreview.src !== originalImage) {
            imageUrl = photoPreview.src;
            console.log("📸 Enviando nueva imagen (URL)");
          }
        } else if (!originalImage && photoPreview && photoPreview.style.display !== "none" && photoPreview.src.startsWith("data:")) {
          imageUrl = photoPreview.src;
          console.log("📸 Enviando primera imagen");
        } else {
          console.log("📸 No se enviará imagen (no fue cambiada)");
        }
        
        // Actualizar usuario
        const updateData = {
          name: name
        };
        
        if (imageUrl) {
          updateData.image = imageUrl;
          console.log("📸 Imagen incluida en updateData");
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
          
          throw new Error(response.message || "Error al actualizar el perfil");
        }
      } catch (error) {
        console.error("Error al actualizar perfil:", error);
        console.error("Detalles del error:", {
          message: error.message,
          response: error.response,
          stack: error.stack
        });
        
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

async function loadPlants() {
  try {
    showLoading(true);
    const response = await window.AdminAPI.getPlants(currentFilters);
    allPlants = response.data;

    renderPlants();
    updatePagination();
  } catch (error) {
    console.error("Error loading plants:", error);
    showNotification("Error al cargar las plantas", "error");
  } finally {
    showLoading(false);
  }
}

function renderPlants() {
  const table = document.querySelector(".catalog .table");
  if (!table) return;

  const thead = table.querySelector(".thead");
  const plantsPerPage = 12;
  const startIndex = (currentPage - 1) * plantsPerPage;
  const endIndex = startIndex + plantsPerPage;
  const plantsToShow = allPlants.slice(startIndex, endIndex);

  if (plantsToShow.length === 0) {
    table.innerHTML = `
      <div class="thead">
        <div>Plant</div>
        <div>Species</div>
        <div>Date Added</div>
        <div>Status</div>
        <div>Actions</div>
      </div>
      <div class="trow"><div class="cell" style="grid-column: span 5; text-align:center">No se encontraron plantas</div></div>
    `;
    return;
  }

  const rowsHTML = plantsToShow
    .map((plant, index) => {
      // Usar la imagen real de la planta si existe, de lo contrario usar un placeholder único basado en el índice
      let img = resolveImageUrl(plant.image);
      if (!img) {
        // Placeholder único para cada planta basado en su índice y nombre
        const placeholderIndex = (index % 10) + 1; // Ciclar entre 1-10
        img = `https://images.unsplash.com/photo-${1506905925346 + placeholderIndex * 1000}?w=400&h=400&fit=crop`;
      }
      
      const date = plant.created_at || plant.registration_date
        ? new Date(plant.created_at || plant.registration_date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "";
      // Mapear health_status para mostrar correctamente (usar lowercase para clases CSS)
      let healthStatusValue = plant.health_status;
      // Normalizar valores legacy a nuevos valores para consistencia
      if (healthStatusValue === 'excellent') healthStatusValue = 'healthy'; // Mapear excellent a healthy
      if (healthStatusValue === 'needs_care') healthStatusValue = 'recovering';
      if (healthStatusValue === 'dying') healthStatusValue = 'bad';
      if (healthStatusValue === 'sick') healthStatusValue = 'bad';
      if (healthStatusValue === 'critical') healthStatusValue = 'bad'; // Mapeo legacy
      
      // Usar AdminUtils.getStatusText si está disponible, sino usar función local
      const statusText = window.AdminUtils && window.AdminUtils.getStatusText 
        ? window.AdminUtils.getStatusText(healthStatusValue, 'health')
        : (healthStatusValue === 'healthy' ? 'Healthy' :
           healthStatusValue === 'recovering' ? 'Recovering' :
           healthStatusValue === 'bad' ? 'Bad' : healthStatusValue);
      
      const statusBadge = healthStatusValue 
        ? `<span class="badge ${healthStatusValue.toLowerCase()}">${statusText}</span>`
        : '<span class="badge healthy">Healthy</span>';
      const adoptBadge = plant.is_adopted
        ? '<span class="badge adopted">Adopted</span>'
        : '';
      return `
        <div class="trow">
          <div class="cell plant">
            <div class="thumb"><img src="${img}" alt="${plant.name}" onerror="this.src='https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=400&fit=crop'"></div>
            <div>
              <div class="plant-name">${plant.name}</div>
              <div class="plant-id">ID: PLT-${String(plant.id).substring(0, 8)}</div>
            </div>
          </div>
          <div class="cell">${plant.species || ""}</div>
          <div class="cell">${date}</div>
          <div class="cell">${statusBadge} ${adoptBadge}</div>
          <div class="cell actions">
            <a class="edit" href="#" onclick="editPlant('${plant.id}')">Edit</a>
            <a class="delete" href="#" onclick="deletePlant('${plant.id}')">Delete</a>
          </div>
        </div>`;
    })
    .join("");

  table.innerHTML = (thead ? thead.outerHTML : "") + rowsHTML;
}

function setupFilters() {
  const resetBtn = document.getElementById("resetFilters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document.querySelectorAll(".filters select").forEach((s) => {
        s.selectedIndex = 0;
      });
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.value = "";
      }
      currentFilters = {};
      currentPage = 1;
      loadPlants();
    });
  }

  // Event listeners para filtros
  document.querySelectorAll(".filters select").forEach((select) => {
    select.addEventListener("change", () => {
      const filterName = select.name;
      const filterValue = select.value;

      if (filterValue && filterValue !== "all") {
        currentFilters[filterName] = filterValue;
      } else {
        delete currentFilters[filterName];
      }

      currentPage = 1;
      loadPlants();
    });
  });
}

function setupPagination() {
  document.querySelectorAll(".page-num").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.page);
      if (page && page !== currentPage) {
        currentPage = page;
        document
          .querySelectorAll(".page-num")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderPlants();
      }
    });
  });
}

function updatePagination() {
  const totalPages = Math.ceil(allPlants.length / 12);
  const pagination = document.querySelector(".pagination");

  if (pagination) {
    let paginationHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === currentPage ? "active" : "";
      paginationHTML += `<button class="page-num ${isActive}" data-page="${i}">${i}</button>`;
    }

    pagination.innerHTML = paginationHTML;

    // Reconfigurar event listeners
    setupPagination();
  }
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.trim();
        if (searchTerm) {
          currentFilters.search = searchTerm;
        } else {
          delete currentFilters.search;
        }
        currentPage = 1;
        loadPlants();
      }, 500);
    });
  }
}

// Función global para cerrar el overlay (necesaria para createPlant)
function closeOverlay() {
  const overlay = document.getElementById("addPlantOverlay");
  if (overlay) {
    overlay.classList.remove("show");
    document.body.style.overflow = "auto";
    resetForm();
  }
}

async function loadDevices() {
  try {
    const response = await window.AdminAPI.getDevices();
    const devices = response.data || [];
    
    // Cargar dispositivos en el selector del formulario de nueva planta
    const overlayDeviceSelect = document.getElementById("overlayDeviceSelect");
    if (overlayDeviceSelect) {
      overlayDeviceSelect.innerHTML = '<option value="">Select a device (optional)</option>';
      devices.forEach(device => {
        const option = document.createElement("option");
        option.value = device.id;
         // Mostrar información útil del dispositivo (serial_number o serial, model, location)
         const serial = device.serial_number || device.serial || 'Unknown';
         const deviceLabel = [
           serial,
           device.model || '',
           device.location || ''
         ].filter(Boolean).join(' - ');
         option.textContent = deviceLabel || device.id;
        overlayDeviceSelect.appendChild(option);
      });
    }
    
    // Cargar dispositivos en el selector del formulario de edición
    const editDeviceSelect = document.getElementById("editDeviceSelect");
    if (editDeviceSelect) {
      editDeviceSelect.innerHTML = '<option value="">Select a device (optional)</option>';
      devices.forEach(device => {
        const option = document.createElement("option");
        option.value = device.id;
         // Mostrar información útil del dispositivo (serial_number o serial, model, location)
         const serial = device.serial_number || device.serial || 'Unknown';
         const deviceLabel = [
           serial,
           device.model || '',
           device.location || ''
         ].filter(Boolean).join(' - ');
         option.textContent = deviceLabel || device.id;
        editDeviceSelect.appendChild(option);
      });
    }
    
    console.log(`✅ ${devices.length} dispositivos cargados en los selectores`);
  } catch (error) {
    console.error("Error loading devices:", error);
    // No mostrar error al usuario, simplemente dejar los selectores vacíos
  }
}

function setupPlantForm() {
  const openAddPlant = document.getElementById("openAddPlant");
  const overlay = document.getElementById("addPlantOverlay");
  const closeAddPlant = document.getElementById("closeAddPlant");

  function openOverlay() {
    overlay && overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  openAddPlant && openAddPlant.addEventListener("click", openOverlay);
  closeAddPlant && closeAddPlant.addEventListener("click", closeOverlay);
  overlay &&
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay();
    });

  // Configurar subida de imagen
  const overlayUpload = document.getElementById("overlayUpload");
  const overlayInput = document.getElementById("overlayPhotoInput");
  const overlayPreview = document.getElementById("overlayPhotoPreview");

  if (overlayUpload && overlayInput && overlayPreview) {
    overlayUpload.addEventListener("click", () => overlayInput.click());
    overlayInput.addEventListener("change", async () => {
      const file = overlayInput.files && overlayInput.files[0];
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
              console.log(`✅ Plant Catalog - Imagen comprimida, tamaño final: ${Math.round(dataUrl.length / 1024)}KB`);
            }
            
            overlayPreview.src = dataUrl || '/placeholder.png';
            overlayPreview.style.display = "block";
            const inner = overlayUpload.querySelector(".upload-inner");
            if (inner) inner.style.display = "none";
            // Guardar el data URL en un atributo del preview para usarlo después
            overlayPreview.setAttribute('data-image-url', dataUrl || '');
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

  // Configurar formulario
  const overlayPlantForm = document.getElementById("overlayPlantForm");
  if (overlayPlantForm) {
    overlayPlantForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await createPlant();
    });
  }
}

async function createPlant() {
  // CÓDIGO EXACTO DE DASHBOARD - Solo cambiando IDs del DOM
  const form = document.getElementById("overlayPlantForm");
  const formData = new FormData(form);

  // Obtener la imagen subida (data URL)
  const overlayPhotoPreview = document.getElementById("overlayPhotoPreview");
  let imageUrl = null;
  
  // Obtener el data URL del atributo o del src
  if (overlayPhotoPreview && overlayPhotoPreview.style.display !== "none") {
    // Primero intentar obtener del atributo data-image-url (más confiable)
    const dataImageUrl = overlayPhotoPreview.getAttribute('data-image-url');
    if (dataImageUrl && dataImageUrl.startsWith("data:")) {
      imageUrl = dataImageUrl;
      console.log("✅ Plant Catalog - Imagen obtenida del atributo data-image-url");
    } 
    // Si no está en el atributo, usar el src si es data URL
    else if (overlayPhotoPreview.src && overlayPhotoPreview.src.startsWith("data:")) {
      imageUrl = overlayPhotoPreview.src;
      console.log("✅ Plant Catalog - Imagen obtenida del src (data URL)");
    }
    // Si el src no es data URL, verificar que no sea placeholder
    else if (overlayPhotoPreview.src && 
             overlayPhotoPreview.src !== "" && 
             overlayPhotoPreview.src !== "about:blank" &&
             !overlayPhotoPreview.src.includes("unsplash.com/photo-1506905925346") && 
             !overlayPhotoPreview.src.includes("placeholder") && 
             !overlayPhotoPreview.src.includes("upgrade_access.jpg")) {
      imageUrl = overlayPhotoPreview.src;
      console.log("✅ Plant Catalog - Imagen obtenida del src (URL)");
    }
    
    if (imageUrl) {
      console.log("🔍 Plant Catalog - Imagen validada:", { 
        hasImage: true, 
        isDataUrl: imageUrl.startsWith("data:"),
        imageLength: imageUrl.length,
        imagePreview: imageUrl.substring(0, 50) + "..."
      });
    } else {
      console.warn("⚠️ Plant Catalog - No se encontró imagen válida en el preview");
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

  try {
    showFormLoading(true);
    const result = await window.AdminAPI.createPlant(plantData);

    if (result.success) {
      showNotification("Planta creada exitosamente", "success");
      form.reset();
      document.getElementById("overlayPhotoPreview").style.display = "none";
      const uploadInner = document.querySelector("#overlayUpload .upload-inner");
      if (uploadInner) uploadInner.style.display = "block";

      // Recargar datos
      closeOverlay();
      await loadPlants();
    }
  } catch (error) {
    console.error("Error creating plant:", error);
    showNotification(error.message || "Error al crear la planta", "error");
  } finally {
    showFormLoading(false);
  }
}

async function editPlant(plantId) {
  try {
    const response = await window.AdminAPI.getPlant(plantId);
    const plant = response.data;

    // Llenar formulario de edición
    document.getElementById("editPlantName").value = plant.name || "";
    document.getElementById("editSpecies").value = plant.species || "";
    document.getElementById("editDescription").value = plant.description || "";
    
    // Establecer el health_status si existe
    const healthStatusSelect = document.getElementById("editHealthStatus");
    if (healthStatusSelect && plant.health_status) {
      healthStatusSelect.value = plant.health_status;
    }
    
    // Establecer el device_id si existe
    const deviceSelect = document.getElementById("editDeviceSelect");
    if (deviceSelect && plant.device_id) {
      deviceSelect.value = plant.device_id;
    } else if (deviceSelect) {
      deviceSelect.value = ""; // Asegurar que esté vacío si no hay device_id
    }

    // Mostrar imagen actual de la planta
    const editPhotoPreview = document.getElementById("editPhotoPreview");
    const editUpload = document.getElementById("editUpload");
    const editUploadInner = editUpload?.querySelector(".upload-inner");
    
    if (editPhotoPreview && editUpload) {
      // Obtener la imagen actual de la planta
      let currentImageUrl = plant.image || plant.image_url;
      
      if (currentImageUrl) {
        let previewSrc = currentImageUrl;
        
        // Si es data URL, usar directamente
        if (currentImageUrl.startsWith("data:")) {
          previewSrc = currentImageUrl;
        }
        // Si es URL completa, usar directamente
        else if (currentImageUrl.startsWith("http://") || currentImageUrl.startsWith("https://")) {
          previewSrc = currentImageUrl;
        }
        // Si es ruta relativa, construir URL completa
        else {
          const API_BASE_URL = window.AdminConfig?.API_BASE_URL || "https://ecoabackendecoa.vercel.app";
          previewSrc = `${API_BASE_URL}${currentImageUrl.startsWith("/") ? currentImageUrl : "/" + currentImageUrl}`;
        }
        
        editPhotoPreview.src = previewSrc;
        editPhotoPreview.setAttribute('data-original-src', previewSrc);
        editPhotoPreview.style.display = "block";
        if (editUploadInner) editUploadInner.style.display = "none";
      } else {
        // Si no hay imagen, mostrar el placeholder de subida
        editPhotoPreview.style.display = "none";
        editPhotoPreview.removeAttribute('data-original-src');
        if (editUploadInner) editUploadInner.style.display = "block";
      }
    }

    // Mostrar modal de edición primero
    const editModal = document.getElementById("editPlantModal");
    if (editModal) {
      editModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }

    // Configurar subida de nueva imagen DESPUÉS de mostrar el modal
    // Usar setTimeout para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      setupEditImageUpload();
    }, 100);

    // Configurar envío del formulario de edición
    const editForm = document.getElementById("editPlantForm");
    if (editForm) {
      editForm.onsubmit = async (e) => {
        e.preventDefault();
        await updatePlant(plantId);
      };
    }
  } catch (error) {
    console.error("Error loading plant for edit:", error);
    showNotification("Error al cargar la planta", "error");
  }
}

// Función helper para comprimir imagen (reutilizable)
function compressImage(file, callback) {
  const maxDataUrlSize = 150 * 1024; // 150KB (límite más conservador para Supabase)
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;
      const maxDimension = 800;
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      let quality = 0.9;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      while (dataUrl.length > maxDataUrlSize && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      
      if (dataUrl.length > maxDataUrlSize) {
        dataUrl = canvas.toDataURL('image/png');
        if (dataUrl.length > maxDataUrlSize) {
          const scale = Math.sqrt(maxDataUrlSize / dataUrl.length) * 0.9;
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        }
      }
      
      if (dataUrl.length > maxDataUrlSize) {
        console.warn(`⚠️ Imagen muy grande: ${Math.round(dataUrl.length / 1024)}KB`);
        callback(null);
      } else {
        callback(dataUrl);
      }
    };
    img.onerror = () => callback(null);
    img.src = e.target.result;
  };
  reader.onerror = () => callback(null);
  reader.readAsDataURL(file);
}

// Configurar subida de imagen en el formulario de edición
function setupEditImageUpload() {
  const editUpload = document.getElementById("editUpload");
  const editInput = document.getElementById("editPhotoInput");
  const editPreview = document.getElementById("editPhotoPreview");

  if (!editUpload || !editInput || !editPreview) {
    console.warn("⚠️ Elementos de edición de imagen no encontrados");
    return;
  }

  // Remover listeners anteriores si existen (usando cloneNode para limpiar)
  const newEditInput = editInput.cloneNode(true);
  editInput.parentNode.replaceChild(newEditInput, editInput);
  
  // Obtener referencias actualizadas después del clone
  const currentEditInput = document.getElementById("editPhotoInput");
  const editUploadInner = editUpload.querySelector(".upload-inner");

  // El label ya maneja el click automáticamente, solo necesitamos el change event
  currentEditInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      console.log("⚠️ No se seleccionó ningún archivo");
      return;
    }

    console.log("📸 Archivo seleccionado para edición:", file.name, "Tamaño:", Math.round(file.size / 1024), "KB");

    compressImage(file, (dataUrl) => {
      if (dataUrl) {
        editPreview.src = dataUrl;
        editPreview.style.display = "block";
        if (editUploadInner) editUploadInner.style.display = "none";
        editPreview.setAttribute('data-image-url', dataUrl);
        console.log(`✅ Plant Catalog - Imagen comprimida para edición, tamaño: ${Math.round(dataUrl.length / 1024)}KB`);
      } else {
        showNotification("La imagen es muy grande. Se guardará sin cambiar la imagen.", "warning");
      }
    });
  });

  console.log("✅ Event listeners de edición de imagen configurados");
}

async function updatePlant(plantId) {
  const form = document.getElementById("editPlantForm");
  const formData = new FormData(form);

  // Obtener la nueva imagen si se subió una
  const editPhotoPreview = document.getElementById("editPhotoPreview");
  let imageUrl = null;
  
  if (editPhotoPreview) {
    // Verificar si hay una nueva imagen subida (data URL en el atributo)
    const dataImageUrl = editPhotoPreview.getAttribute('data-image-url');
    if (dataImageUrl && dataImageUrl.startsWith("data:")) {
      // Verificar si es diferente a la imagen original
      const originalSrc = editPhotoPreview.getAttribute('data-original-src') || '';
      if (dataImageUrl !== originalSrc) {
        imageUrl = dataImageUrl;
        console.log("✅ Plant Catalog - Nueva imagen obtenida para edición");
      }
    } else if (editPhotoPreview.src && editPhotoPreview.src.startsWith("data:")) {
      // Si no hay atributo pero el src es data URL, verificar si es nueva
      const originalSrc = editPhotoPreview.getAttribute('data-original-src') || '';
      if (editPhotoPreview.src !== originalSrc) {
        imageUrl = editPhotoPreview.src;
      }
    }
  }

  // Obtener device_id del selector (puede ser null o string vacío)
  const deviceId = formData.get("device_id");
  const deviceIdValue = deviceId && deviceId.trim() !== "" ? deviceId : null;

  const plantData = {
    name: formData.get("plantName"),
    species: formData.get("species"),
    description: formData.get("description"),
    device_id: deviceIdValue, // Solo incluir si se seleccionó un dispositivo
  };

  // Incluir imagen solo si se subió una nueva
  if (imageUrl) {
    // Validar tamaño de la data URL antes de enviar
    // Usar límite más conservador para evitar problemas con Supabase
    const maxDataUrlSize = 150 * 1024; // 150KB
    const imageSize = imageUrl.length;
    
    console.log(`📊 Tamaño de imagen a enviar: ${Math.round(imageSize / 1024)}KB`);
    
    if (imageSize > maxDataUrlSize) {
      console.warn(`⚠️ Imagen demasiado grande (${Math.round(imageSize / 1024)}KB), no se actualizará la imagen`);
      showNotification("La imagen es demasiado grande. Se actualizará la planta sin cambiar la imagen.", "warning");
      // No incluir la imagen si es demasiado grande
    } else {
      plantData.image = imageUrl;
      console.log(`✅ Imagen validada y lista para enviar (${Math.round(imageSize / 1024)}KB)`);
    }
  }

  // health_status se maneja en la tabla plant_status, no directamente en plants
  // Si se quiere actualizar el health_status, se debe hacer en plant_status
  const healthStatus = formData.get("healthStatus");

  try {
    showFormLoading(true);
    
    // Actualizar primero los datos básicos de la planta
    let result;
    try {
      result = await window.AdminAPI.updatePlant(plantId, plantData);
      
      if (!result.success) {
        throw new Error(result.message || "Error al actualizar la planta");
      }
    } catch (updateError) {
      // Si falla y hay imagen, verificar si es un error de tamaño de imagen
      if (plantData.image && updateError.message) {
        // Si el error menciona que la imagen es muy grande, intentar sin imagen
        if (updateError.message.includes("Error interno") || updateError.message.includes("muy grande") || updateError.message.includes("demasiado grande")) {
          console.warn("⚠️ Error al actualizar con imagen, intentando sin imagen...");
          const plantDataWithoutImage = { ...plantData };
          delete plantDataWithoutImage.image;
          
          try {
            result = await window.AdminAPI.updatePlant(plantId, plantDataWithoutImage);
            if (result.success) {
              showNotification("Planta actualizada exitosamente, pero la imagen no pudo ser actualizada. La imagen puede ser demasiado grande o tener un formato no soportado.", "warning");
            } else {
              throw updateError; // Si también falla sin imagen, lanzar el error original
            }
          } catch (retryError) {
            throw updateError; // Lanzar el error original si el retry también falla
          }
        } else {
          // Si es otro tipo de error, lanzarlo normalmente
          throw updateError;
        }
      } else {
        throw updateError;
      }
    }

    // Actualizar health_status si se especificó
    let healthStatusUpdated = false;
    if (healthStatus) {
      try {
        const metricsResult = await window.AdminAPI.updatePlantMetrics(plantId, { health_status: healthStatus });
        console.log("✅ Health status actualizado:", healthStatus, metricsResult);
        healthStatusUpdated = true;
        // NO mostrar notificación aquí, solo una al final
      } catch (statusError) {
        console.error("❌ Error al actualizar health_status:", statusError);
        // No mostrar notificación de warning aquí para evitar duplicados
        // Solo lanzar error si es crítico
        if (statusError.message && statusError.message.includes("coerce")) {
          throw new Error("Error al actualizar el estado de salud. Por favor, inténtalo de nuevo.");
        }
      }
    }

    // Si la actualización fue exitosa y hay una nueva imagen, asegurarse de que se guardó
    if (result.success && result.data) {
      console.log("✅ Respuesta del servidor:", {
        hasImage: !!result.data.image,
        imageLength: result.data.image ? result.data.image.length : 0,
        imagePreview: result.data.image ? `${result.data.image.substring(0, 50)}...` : null
      });
      
      // Si se envió una imagen pero no está en la respuesta, podría no haberse guardado
      if (imageUrl && !result.data.image) {
        console.warn("⚠️ Se envió una imagen pero no está en la respuesta del servidor");
      }
    }

    // Actualizar el objeto local inmediatamente para reflejar cambios sin esperar recarga
    const plantIndex = allPlants.findIndex(p => p.id === plantId);
    if (plantIndex !== -1) {
      // Usar la imagen de la respuesta del servidor si está disponible, sino la que enviamos
      const updatedImage = result.data?.image || imageUrl || allPlants[plantIndex].image;
      allPlants[plantIndex] = {
        ...allPlants[plantIndex],
        ...plantData,
        image: updatedImage, // Usar imagen de la respuesta del servidor
        health_status: healthStatus || allPlants[plantIndex].health_status
      };
      console.log("✅ Objeto local actualizado:", {
        id: allPlants[plantIndex].id,
        name: allPlants[plantIndex].name,
        hasImage: !!allPlants[plantIndex].image,
        imageLength: allPlants[plantIndex].image ? allPlants[plantIndex].image.length : 0
      });
    }

    // Mostrar UNA sola notificación
    const notificationMessage = healthStatusUpdated && healthStatus
      ? `Planta actualizada exitosamente. Estado: ${healthStatus}`
      : "Planta actualizada exitosamente";
    showNotification(notificationMessage, "success");
    closeEditModal();
    
    // Recargar plantas desde el servidor para obtener los datos más actualizados
    await loadPlants();
    // Renderizar y actualizar paginación
    renderPlants();
    updatePagination();
    
  } catch (error) {
    console.error("❌ Error updating plant:", error);
    showNotification(error.message || "Error al actualizar la planta", "error");
  } finally {
    showFormLoading(false);
  }
}

async function deletePlant(plantId) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta planta?")) {
    return;
  }

  try {
    showLoading(true);
    const result = await window.AdminAPI.deletePlant(plantId);

    if (result.success) {
      showNotification("Planta eliminada exitosamente", "success");
      await loadPlants();
    }
  } catch (error) {
    console.error("Error deleting plant:", error);
    showNotification(error.message || "Error al eliminar la planta", "error");
  } finally {
    showLoading(false);
  }
}

// Exponer funciones globalmente para que funcionen en onclick
window.deletePlant = deletePlant;
window.editPlant = editPlant;

function closeEditModal() {
  const editModal = document.getElementById("editPlantModal");
  if (editModal) {
    editModal.classList.remove("show");
    document.body.style.overflow = "auto";
    
    // Limpiar formulario y preview de imagen
    const editForm = document.getElementById("editPlantForm");
    if (editForm) editForm.reset();
    
    const editPhotoPreview = document.getElementById("editPhotoPreview");
    const editPhotoInput = document.getElementById("editPhotoInput");
    const editUploadInner = document.querySelector("#editUpload .upload-inner");
    
    if (editPhotoPreview) {
      editPhotoPreview.style.display = "none";
      editPhotoPreview.src = "";
      editPhotoPreview.removeAttribute('data-image-url');
      editPhotoPreview.removeAttribute('data-original-src');
    }
    
    if (editPhotoInput) {
      editPhotoInput.value = "";
    }
    
    if (editUploadInner) {
      editUploadInner.style.display = "block";
    }
  }
}

function resetForm() {
  const form = document.getElementById("overlayPlantForm");
  if (form) form.reset();

  const preview = document.getElementById("overlayPhotoPreview");
  if (preview) {
    preview.style.display = "none";
    preview.src = "";
    preview.removeAttribute('data-image-url');
  }

  const uploadInner = document.querySelector("#overlayUpload .upload-inner");
  if (uploadInner) uploadInner.style.display = "block";
}

function showLoading(show = true) {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = show ? "flex" : "none";
  }
}

function showFormLoading(show = true) {
  const submitBtn = document.querySelector(
    '#overlayPlantForm button[type="submit"]'
  );
  const editSubmitBtn = document.querySelector(
    '#editPlantForm button[type="submit"]'
  );
  
  if (submitBtn) {
    if (show) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Creando...';
      submitBtn.style.opacity = "0.7";
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Register Plant";
      submitBtn.style.opacity = "1";
    }
  }
  
  if (editSubmitBtn) {
    if (show) {
      editSubmitBtn.disabled = true;
      editSubmitBtn.innerHTML = '<span class="spinner"></span> Actualizando...';
      editSubmitBtn.style.opacity = "0.7";
    } else {
      editSubmitBtn.disabled = false;
      editSubmitBtn.innerHTML = "Update Plant";
      editSubmitBtn.style.opacity = "1";
    }
  }
}

function getStatusText(status) {
  const statusMap = {
    healthy: "Saludable",
    needs_care: "Necesita cuidado",
    sick: "Enferma",
    dying: "En peligro",
  };
  return statusMap[status] || status;
}

function showNotification(message, type = "error") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ${
      type === "error"
        ? "background-color: #e74c3c;"
        : "background-color: #27ae60;"
    }
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

function resolveImageUrl(url, fallback) {
  const candidate = url || fallback;
  if (!candidate) return null;
  // Si es data URL, devolver directamente
  if (candidate.startsWith("data:")) return candidate;
  // Si es URL absoluta, devolver directamente
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) return candidate;
  // Si viene relativa (/uploads/...), prepender base del backend
  let baseUrl = window.AdminConfig?.API_BASE_URL || "https://ecoabackendecoa.vercel.app";
  // Asegurar que baseUrl no termine con /
  baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${baseUrl}${candidate.startsWith("/") ? candidate : "/" + candidate}`;
}

async function updateMetricsFromPlants() {
  try {
    const totals = {
      total: allPlants.length,
      healthy: allPlants.filter((p) => p.health_status === "healthy").length,
      recovering: allPlants.filter((p) => 
        p.health_status === "recovering" || p.health_status === "needs_care"
      ).length,
      bad: allPlants.filter((p) => 
        p.health_status === "bad" || 
        p.health_status === "critical" || 
        p.health_status === "dying" || 
        p.health_status === "sick"
      ).length,
    };

    const values = document.querySelectorAll(
      ".metrics .metric-card .metric-value"
    );
    if (values[0]) values[0].textContent = totals.total.toLocaleString();
    if (values[1]) values[1].textContent = totals.healthy.toLocaleString();
    if (values[2]) values[2].textContent = totals.recovering.toLocaleString();
    if (values[3]) values[3].textContent = totals.bad.toLocaleString();
  } catch (e) {
    console.error("Error updating metrics:", e);
  }
}

