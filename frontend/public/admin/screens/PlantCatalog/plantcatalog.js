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
    .map((plant) => {
      const img = plant.image_url || "../../src/plant-placeholder.svg";
      const date = plant.created_at
        ? new Date(plant.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "";
      const statusBadge = `<span class=\"badge ${plant.health_status}\">${getStatusText(
        plant.health_status
      )}</span>`;
      const adoptBadge = plant.is_adopted
        ? '<span class="badge adopted">Adopted</span>'
        : '';
      return `
        <div class="trow">
          <div class="cell plant">
            <div class="thumb"><img src="${img}" alt="plant"></div>
            <div>
              <div class="plant-name">${plant.name}</div>
              <div class="plant-id">ID: PLT-${String(plant.id).padStart(5, "0")}</div>
            </div>
          </div>
          <div class="cell">${plant.species || ""}</div>
          <div class="cell">${date}</div>
          <div class="cell">${statusBadge} ${adoptBadge}</div>
          <div class="cell actions">
            <a class="edit" href="#" onclick="editPlant(${plant.id})">Edit</a>
            <a class="delete" href="#" onclick="deletePlant(${plant.id})">Delete</a>
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
        const imageUrl = await window.AdminAPI.uploadImage(file);
        overlayPreview.src = imageUrl;
        overlayPreview.style.display = "block";
        const inner = overlayUpload.querySelector(".upload-inner");
        if (inner) inner.style.display = "none";
      } catch (error) {
        console.error("Error uploading image:", error);
        showNotification("Error al subir la imagen", "error");
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

  const plantData = {
    user_id: 1, // Por ahora hardcodeado
    name: formData.get("plantName"),
    species: formData.get("species"),
    description: formData.get("description"),
    image_url: document.getElementById("overlayPhotoPreview").src || null,
    status: "active",
    health_status: formData.get("healthStatus") || "healthy",
    water_level: 0,
    light_level: 0,
    temperature: 0,
    humidity: 0,
  };

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
