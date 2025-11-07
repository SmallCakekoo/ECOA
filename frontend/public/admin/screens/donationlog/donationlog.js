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

    // Configurar paginación
    setupPagination();

    // Cargar distribución de donaciones (vista simulada)
    loadDonationDistribution();
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("Error al cargar las donaciones", "error");
  }
}

async function loadDonations() {
  try {
    showLoading(true);
    // Cargar todas las donaciones sin filtros
    const response = await window.AdminAPI.getDonations({});
    allDonations = response.data || [];
    filteredDonations = allDonations; // Sin filtros, mostrar todas

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

// Función mantenida por compatibilidad pero ya no se usa (no hay filtros)
function setupFilters() {
  // No hay filtros en la nueva versión
}

function setupPagination() {
  document.querySelectorAll(".page-num").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.page);
      if (page && page !== currentPage) {
        currentPage = page;
        renderDonations();
        updatePagination();
      }
    });
  });
  
  // También manejar los botones Previous/Next
  document.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.page);
      if (page && page !== currentPage && !btn.disabled) {
        currentPage = page;
        renderDonations();
        updatePagination();
      }
    });
  });
}

function updatePagination() {
  const totalPages = Math.ceil(filteredDonations.length / 10);
  const pagination = document.querySelector(".pagination");

  if (pagination) {
    const donationsPerPage = 10;
    const startIndex = (currentPage - 1) * donationsPerPage;
    const endIndex = Math.min(startIndex + donationsPerPage, filteredDonations.length);
    const showing = filteredDonations.length > 0 ? endIndex - startIndex : 0;
    
    let paginationHTML = `<div style="margin-right: auto; color: #263238; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;">Showing ${showing} of ${filteredDonations.length} donations</div>`;
    
    // Botón Previous
    paginationHTML += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">Previous</button>`;
    
    // Números de página (máximo 2 páginas visibles como en la imagen)
    for (let i = 1; i <= totalPages && i <= 2; i++) {
      const isActive = i === currentPage ? "active" : "";
      paginationHTML += `<button class="page-num ${isActive}" data-page="${i}">${i}</button>`;
    }
    
    // Botón Next
    paginationHTML += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Next</button>`;

    pagination.innerHTML = paginationHTML;

    // Reconfigurar event listeners
    setupPagination();
  }
}

// Función mantenida por compatibilidad pero ya no se usa
function setupSearch() {
  // No hay búsqueda en la nueva versión sin filtros
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

// Función para cargar distribución de donaciones (vista simulada con datos de prueba)
function loadDonationDistribution() {
  try {
    // Generar datos simulados basados en los últimos 4 meses
    const now = new Date();
    const months = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Obtener los últimos 4 meses
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: monthNames[date.getMonth()],
        shortName: monthNames[date.getMonth()].substring(0, 3),
        monthIndex: date.getMonth(),
        year: date.getFullYear()
      });
    }

    // Calcular distribución basada en donaciones reales si existen, sino usar datos simulados
    let distributionData = [];
    
    if (allDonations && allDonations.length > 0) {
      // Calcular distribución real basada en las donaciones
      months.forEach(month => {
        const monthDonations = allDonations.filter(d => {
          if (!d.created_at) return false;
          const donationDate = new Date(d.created_at);
          return donationDate.getMonth() === month.monthIndex && 
                 donationDate.getFullYear() === month.year;
        });
        
        const monthTotal = monthDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        distributionData.push({
          ...month,
          amount: monthTotal,
          count: monthDonations.length
        });
      });
    } else {
      // Datos simulados si no hay donaciones reales
      const simulatedAmounts = [45000, 38000, 42000, 50000]; // Montos simulados
      months.forEach((month, index) => {
        distributionData.push({
          ...month,
          amount: simulatedAmounts[index] || 0,
          count: Math.floor(Math.random() * 10) + 5
        });
      });
    }

    // Calcular total para porcentajes
    const totalAmount = distributionData.reduce((sum, m) => sum + m.amount, 0);

    // Actualizar la leyenda con los datos
    const legend = document.querySelector('.legend');
    if (legend) {
      const dotClasses = ['dot-june', 'dot-may', 'dot-april', 'dot-march'];
      
      legend.innerHTML = distributionData.map((month, index) => {
        const percentage = totalAmount > 0 ? Math.round((month.amount / totalAmount) * 100) : 0;
        const formattedAmount = `$${month.amount.toLocaleString()}`;
        const dotClass = dotClasses[index] || dotClasses[dotClasses.length - 1];
        
        return `
          <li>
            <span class="dot ${dotClass}"></span>
            <span class="month-name">${month.name}</span>
            <span class="month-stats">${formattedAmount} (${percentage}%)</span>
          </li>
        `;
      }).join('');
    }
  } catch (error) {
    console.error("Error loading donation distribution:", error);
    // En caso de error, mantener la vista estática original
  }
}
