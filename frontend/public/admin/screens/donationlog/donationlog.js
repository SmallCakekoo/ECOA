let currentPage = 1;
let currentFilters = {};
let allDonations = [];

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  if (!window.AdminAPI.isAuthenticated()) {
    window.location.href = "/admin/login";
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

  // Event listeners para logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (window.AuthManager) {
        window.AuthManager.logout();
      } else {
        window.AdminAPI.logout();
        window.location.href = "/admin/login";
      }
    });
  }
});

async function initializeApp() {
  try {
    // Cargar donaciones
    await loadDonations();

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
    const response = await window.AdminAPI.getDonations(currentFilters);
    allDonations = response.data;

    renderDonations();
    updatePagination();
  } catch (error) {
    console.error("Error loading donations:", error);
    showNotification("Error al cargar las donaciones", "error");
  } finally {
    showLoading(false);
  }
}

function renderDonations() {
  const container = document.getElementById("donationsList");
  if (!container) return;

  const donationsPerPage = 10;
  const startIndex = (currentPage - 1) * donationsPerPage;
  const endIndex = startIndex + donationsPerPage;
  const donationsToShow = allDonations.slice(startIndex, endIndex);

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
      (donation) => `
    <div class="donation-item" data-donation-id="${donation.id}">
      <div class="donation-info">
        <div class="donation-header">
          <h3>Donación #${donation.id}</h3>
          <span class="donation-status ${donation.status}">
            ${getStatusText(donation.status)}
          </span>
        </div>
        <div class="donation-details">
          <p><strong>Usuario:</strong> ${donation.user_name || "N/A"}</p>
          <p><strong>Planta:</strong> ${donation.plant_name || "N/A"}</p>
          <p><strong>Monto:</strong> $${donation.amount || 0}</p>
          <p><strong>Fecha:</strong> ${formatDate(donation.created_at)}</p>
          <p><strong>Método:</strong> ${donation.payment_method || "N/A"}</p>
        </div>
        <div class="donation-actions">
          <button class="btn-approve" onclick="updateDonationStatus(${
            donation.id
          }, 'approved')" 
                  ${donation.status === "approved" ? "disabled" : ""}>
            <i class="icon-check"></i> Aprobar
          </button>
          <button class="btn-reject" onclick="updateDonationStatus(${
            donation.id
          }, 'rejected')"
                  ${donation.status === "rejected" ? "disabled" : ""}>
            <i class="icon-close"></i> Rechazar
          </button>
          <button class="btn-pending" onclick="updateDonationStatus(${
            donation.id
          }, 'pending')"
                  ${donation.status === "pending" ? "disabled" : ""}>
            <i class="icon-clock"></i> Pendiente
          </button>
          <button class="btn-delete" onclick="deleteDonation(${donation.id})">
            <i class="icon-delete"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  `
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
  const totalPages = Math.ceil(allDonations.length / 10);
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
        loadDonations();
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
