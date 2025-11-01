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
    // Cargar plantas
    await loadPlants();
    await updateMetricsFromPlants();

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
      const statusBadge = plant.health_status 
        ? `<span class="badge ${plant.health_status}">${getStatusText(plant.health_status)}</span>`
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

function setupPlantForm() {
  const openAddPlant = document.getElementById("openAddPlant");
  const overlay = document.getElementById("addPlantOverlay");
  const closeAddPlant = document.getElementById("closeAddPlant");

  function openOverlay() {
    overlay && overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeOverlay() {
    overlay && overlay.classList.remove("show");
    document.body.style.overflow = "auto";
    resetForm();
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
        // Leer el archivo como data URL directamente (no subir al servidor)
        // Esto garantiza que tenemos la imagen completa para enviar a la BD
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          overlayPreview.src = dataUrl;
          overlayPreview.style.display = "block";
          const inner = overlayUpload.querySelector(".upload-inner");
          if (inner) inner.style.display = "none";
          // Guardar el data URL en un atributo del preview para usarlo después
          overlayPreview.setAttribute('data-image-url', dataUrl);
          console.log('✅ Plant Catalog - Imagen cargada como data URL, tamaño:', Math.round(dataUrl.length / 1024), 'KB');
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

      const plantData = {
        user_id: null, // Plantas nuevas no tienen usuario asignado hasta ser adoptadas
        name: formData.get("plantName")?.trim() || "",
        species: formData.get("species")?.trim() || "",
        description: formData.get("description")?.trim() || null,
        image: imageUrl, // Puede ser null, data URL, o URL
        // No enviar campos que no existen en la tabla plants
        // status, health_status, water_level, etc. van en otras tablas relacionadas
      };

      // Validar campos requeridos antes de enviar
      if (!plantData.name || !plantData.species) {
        showNotification("El nombre y la especie son requeridos", "error");
        showFormLoading(false);
        return;
      }

      // Log para debugging
      console.log("📤 Plant Catalog - Enviando datos de planta:", {
        name: plantData.name,
        species: plantData.species,
        hasImage: !!plantData.image,
        imageType: plantData.image ? (plantData.image.startsWith("data:") ? "data URL" : "URL") : "null",
        imageLength: plantData.image ? plantData.image.length : 0
      });

  try {
    showFormLoading(true);
    const result = await window.AdminAPI.createPlant(plantData);

    if (result.success) {
      showNotification("Planta creada exitosamente", "success");
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
    document.getElementById("editPlantName").value = plant.name;
    document.getElementById("editSpecies").value = plant.species;
    document.getElementById("editDescription").value = plant.description || "";

    // Mostrar modal de edición
    const editModal = document.getElementById("editPlantModal");
    if (editModal) {
      editModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }

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

async function updatePlant(plantId) {
  const form = document.getElementById("editPlantForm");
  const formData = new FormData(form);

  const plantData = {
    name: formData.get("plantName"),
    species: formData.get("species"),
    description: formData.get("description"),
    health_status: formData.get("healthStatus") || "healthy",
  };

  try {
    showFormLoading(true);
    const result = await window.AdminAPI.updatePlant(plantId, plantData);

    if (result.success) {
      showNotification("Planta actualizada exitosamente", "success");
      closeEditModal();
      await loadPlants();
    }
  } catch (error) {
    console.error("Error updating plant:", error);
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

function closeEditModal() {
  const editModal = document.getElementById("editPlantModal");
  if (editModal) {
    editModal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
}

function resetForm() {
  const form = document.getElementById("overlayPlantForm");
  if (form) form.reset();

  const preview = document.getElementById("overlayPhotoPreview");
  if (preview) {
    preview.style.display = "none";
    preview.src = "";
  }

  const uploadInner = document.querySelector(".upload-inner");
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
  if (submitBtn) {
    if (show) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Creando...';
      submitBtn.style.opacity = "0.7";
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Crear Planta";
      submitBtn.style.opacity = "1";
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
  const baseUrl = window.AdminConfig?.API_BASE_URL || "https://ecoa-nine.vercel.app";
  return `${baseUrl}${candidate.startsWith("/") ? candidate : "/" + candidate}`;
}

async function updateMetricsFromPlants() {
  try {
    const totals = {
      total: allPlants.length,
      healthy: allPlants.filter((p) => p.health_status === "healthy").length,
      recovering: allPlants.filter((p) => p.health_status === "needs_care").length,
      bad:
        allPlants.filter((p) => p.health_status === "sick").length +
        allPlants.filter((p) => p.health_status === "dying").length,
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
