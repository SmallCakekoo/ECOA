let currentPage = 1;
let currentFilters = {};
let allDonations = [];
let filteredDonations = [];

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
    // Cargar donaciones
    await loadDonations();
    await updateMetricsFromDonations();

    // Configurar filtros
    setupFilters();

    // Configurar paginación
    setupPagination();

    // Configurar búsqueda
    setupSearch();
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("Error al cargar las donaciones", "error");
  }
}

async function loadDonations() {
  try {
    showLoading(true);
    // Solo enviar filtros que el backend soporta (status, user_id, plant_id)
    const backendFilters = {};
    if (currentFilters.status && currentFilters.status !== "all") {
      backendFilters.status = currentFilters.status;
    }
    if (currentFilters.user_id) {
      backendFilters.user_id = currentFilters.user_id;
    }
    if (currentFilters.plant_id) {
      backendFilters.plant_id = currentFilters.plant_id;
    }

    const response = await window.AdminAPI.getDonations(backendFilters);
    allDonations = response.data || [];

    // Aplicar búsqueda en el frontend si existe
    applySearchFilter();

    renderDonations();
    updatePagination();
  } catch (error) {
    console.error("Error loading donations:", error);
    showNotification("Error al cargar las donaciones", "error");
  } finally {
    showLoading(false);
  }
}

function applySearchFilter() {
  filteredDonations = [...allDonations];
  
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    filteredDonations = allDonations.filter((donation) => {
      const userName = (donation.user_name || donation.users?.name || "").toLowerCase();
      const plantName = (donation.plant_name || donation.plants?.name || "").toLowerCase();
      const amount = String(donation.amount || "");
      const paymentMethod = (donation.payment_method || "").toLowerCase();
      
      return (
        userName.includes(searchTerm) ||
        plantName.includes(searchTerm) ||
        amount.includes(searchTerm) ||
        paymentMethod.includes(searchTerm)
      );
    });
  }
}

function renderDonations() {
  const container = document.getElementById("donationsList");
  if (!container) return;

  const donationsPerPage = 10;
  const startIndex = (currentPage - 1) * donationsPerPage;
  const endIndex = startIndex + donationsPerPage;
  const donationsToShow = filteredDonations.slice(startIndex, endIndex);

  if (donationsToShow.length === 0) {
    container.innerHTML = `
      <div class="no-donations">
        <p>No se encontraron donaciones</p>
      </div>
    `;
    return;
  }

  container.innerHTML = donationsToShow
    .map(
      (donation) => {
        // Manejar diferentes formatos de datos (relaciones o campos directos)
        const userName = donation.user_name || donation.users?.name || "N/A";
        
        // Generar iniciales para el avatar si no hay imagen
        const initials = userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        
        // Formatear fecha para mostrar solo la fecha (sin hora)
        const donationDate = donation.created_at
          ? new Date(donation.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A";
        
        // Formatear monto
        const formattedAmount = `$${donation.amount || 0}`;
        
        return `
    <div class="trow" data-donation-id="${donation.id}">
      <div class="cell donor">
        <div class="avatar" style="background: #E6F2D8; color: #5f7a59; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px;">${initials}</div>
        <span>${userName}</span>
      </div>
      <div class="cell amount">${formattedAmount}</div>
      <div class="cell date">${donationDate}</div>
    </div>
  `;
      }
    )
    .join("");
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
      loadDonations();
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
      loadDonations();
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
        renderDonations();
      }
    });
  });
}

function updatePagination() {
  const totalPages = Math.ceil(filteredDonations.length / 10);
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
        applySearchFilter();
        renderDonations();
        updatePagination();
      }, 500);
    });
  }
}

async function updateDonationStatus(donationId, status) {
  try {
    showLoading(true);
    const result = await window.AdminAPI.updateDonationStatus(
      donationId,
      status
    );

    if (result.success) {
      showNotification(
        `Donación ${getStatusText(status).toLowerCase()} exitosamente`,
        "success"
      );
      await loadDonations();
    }
  } catch (error) {
    console.error("Error updating donation status:", error);
    showNotification(
      error.message || "Error al actualizar el estado de la donación",
      "error"
    );
  } finally {
    showLoading(false);
  }
}

async function deleteDonation(donationId) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta donación?")) {
    return;
  }

  try {
    showLoading(true);
    const result = await window.AdminAPI.deleteDonation(donationId);

    if (result.success) {
      showNotification("Donación eliminada exitosamente", "success");
      await loadDonations();
    }
  } catch (error) {
    console.error("Error deleting donation:", error);
    showNotification(error.message || "Error al eliminar la donación", "error");
  } finally {
    showLoading(false);
  }
}

function getStatusText(status) {
  const statusMap = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
    completed: "Completada",
    cancelled: "Cancelada",
  };
  return statusMap[status] || status;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showLoading(show = true) {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = show ? "flex" : "none";
  }
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

// Actualiza las tarjetas de métricas superiores con datos reales
async function updateMetricsFromDonations() {
  try {
    // Usar allDonations para las métricas (sin filtros de búsqueda)
    const totalAmount = allDonations.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0
    );
    const uniqueDonors = new Set(
      allDonations.map((d) => d.user_id).filter((v) => v != null)
    ).size;
    const now = new Date();
    const monthAmount = allDonations
      .filter((d) => {
        if (!d.created_at) return false;
        const dt = new Date(d.created_at);
        return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
      })
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const avg = allDonations.length ? totalAmount / allDonations.length : 0;

    const values = document.querySelectorAll(
      ".metrics .metric-card .metric-value"
    );
    if (values[0]) values[0].textContent = `$${totalAmount.toLocaleString()}`;
    if (values[1]) values[1].textContent = uniqueDonors.toLocaleString();
    if (values[2]) values[2].textContent = `$${monthAmount.toLocaleString()}`;
    if (values[3]) values[3].textContent = Math.round(avg).toLocaleString();
  } catch (e) {
    console.error("Error updating donation metrics:", e);
  }
}
