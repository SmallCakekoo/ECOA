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
  const avatarUrl = user.image || user.avatar_url || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop';
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
  
  if (nameInput) {
    nameInput.value = user.name || "";
  }
  
  if (photoPreview) {
    const avatarUrl = user.image || user.avatar_url || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop';
    photoPreview.src = avatarUrl;
    photoPreview.style.display = (user.image || user.avatar_url) ? "block" : "none";
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
            if (photoPreview.parentElement) {
              photoPreview.parentElement.querySelector(".upload-inner").style.display = "none";
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
        // Obtener imagen (base64 o URL)
        let imageUrl = null;
        if (photoPreview && photoPreview.style.display !== "none") {
          if (photoPreview.src.startsWith("data:")) {
            imageUrl = photoPreview.src;
          } else if (photoPreview.src && !photoPreview.src.includes("unsplash.com")) {
            imageUrl = photoPreview.src;
          }
        }
        
        // Actualizar usuario
        const updateData = {
          name: name
        };
        
        if (imageUrl) {
          updateData.image = imageUrl;
        }
        
        const response = await window.AdminAPI.updateUser(user.id, updateData);
        
        if (response.success) {
          // Actualizar usuario en localStorage
          // Mapear avatar_url a image para compatibilidad con el frontend
          const updatedUser = { 
            ...user, 
            ...response.data,
            image: response.data.avatar_url || response.data.image || user.image || user.avatar_url
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
        alert(`Error al actualizar el perfil: ${error.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Guardar Cambios";
        }
      }
    });
  }
}

async function initializeApp() {
  try {
    // Configurar modal de edición de perfil
    setupEditProfileModal();
    
    // Cargar donaciones
    await loadDonations();
    await updateMetricsFromDonations();

    // Configurar paginación
    setupPagination();

    // Cargar distribución de donaciones (vista simulada)
    loadDonationDistribution();

    // Configurar botones de Quick Actions
    setupQuickActions();
  } catch (error) {
    console.error("Error initializing app:", error);
    showNotification("Error al cargar las donaciones", "error");
  }
}

// Configurar botones de Quick Actions
function setupQuickActions() {
  const exportDataBtn = document.getElementById("exportDataBtn");
  const viewAnalyticsBtn = document.getElementById("viewAnalyticsBtn");
  const closeFeatureModal = document.getElementById("closeFeatureModal");
  const featureModal = document.getElementById("featureModal");
  const featureModalMessage = document.getElementById("featureModalMessage");

  // Botón Export Data
  if (exportDataBtn) {
    exportDataBtn.addEventListener("click", () => {
      if (featureModalMessage) {
        featureModalMessage.textContent = 
          "La funcionalidad de exportar datos está en desarrollo y estará disponible pronto. Podrás exportar todas las donaciones en formato CSV o Excel.";
      }
      showFeatureModal();
    });
  }

  // Botón View Analytics
  if (viewAnalyticsBtn) {
    viewAnalyticsBtn.addEventListener("click", () => {
      if (featureModalMessage) {
        featureModalMessage.textContent = 
          "La funcionalidad de análisis detallado está en desarrollo y estará disponible pronto. Podrás ver gráficos avanzados, tendencias y estadísticas detalladas de las donaciones.";
      }
      showFeatureModal();
    });
  }

  // Cerrar modal
  if (closeFeatureModal) {
    closeFeatureModal.addEventListener("click", () => {
      hideFeatureModal();
    });
  }

  // Cerrar modal al hacer click fuera
  if (featureModal) {
    featureModal.addEventListener("click", (e) => {
      if (e.target.classList.contains("feature-modal-overlay")) {
        hideFeatureModal();
      }
    });
  }

  // Cerrar modal con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && featureModal && featureModal.classList.contains("show")) {
      hideFeatureModal();
    }
  });
}

// Mostrar modal de feature en desarrollo
function showFeatureModal() {
  const featureModal = document.getElementById("featureModal");
  if (featureModal) {
    featureModal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

// Ocultar modal de feature en desarrollo
function hideFeatureModal() {
  const featureModal = document.getElementById("featureModal");
  if (featureModal) {
    featureModal.classList.remove("show");
    document.body.style.overflow = "";
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

    // Paleta de colores más atractiva y variada
    const colors = [
      '#65b845', // Verde principal
      '#4a9e2e', // Verde oscuro
      '#7acb57', // Verde claro
      '#8fd86b'  // Verde muy claro
    ];

    // Generar gráfico donut dinámico
    const donutChart = document.getElementById('donutChart');
    const legend = document.getElementById('donationLegend');
    const donutTotal = document.getElementById('donutTotal');
    
    if (donutChart && legend && donutTotal) {
      // Limpiar gráfico anterior
      donutChart.innerHTML = '';
      
      // Actualizar total en el centro
      donutTotal.textContent = `$${totalAmount.toLocaleString()}`;
      
      // Configuración del gráfico
      const centerX = 100;
      const centerY = 100;
      const radius = 80;
      const innerRadius = 50;
      const strokeWidth = radius - innerRadius;
      
      // Calcular la circunferencia
      const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
      
      // Crear círculo de fondo (gris claro) - PRIMERO
      const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      backgroundCircle.setAttribute('cx', centerX);
      backgroundCircle.setAttribute('cy', centerY);
      backgroundCircle.setAttribute('r', radius - strokeWidth / 2);
      backgroundCircle.setAttribute('fill', 'none');
      backgroundCircle.setAttribute('stroke', '#e6f0e2');
      backgroundCircle.setAttribute('stroke-width', strokeWidth);
      donutChart.appendChild(backgroundCircle);
      
      let offset = 0; // Offset acumulado para cada segmento
      
      // Crear segmentos del donut usando stroke-dasharray
      distributionData.forEach((month, index) => {
        const percentage = totalAmount > 0 ? (month.amount / totalAmount) * 100 : 0;
        if (percentage === 0) return; // Saltar si no hay porcentaje
        
        const segmentLength = (percentage / 100) * circumference;
        const gap = index === distributionData.length - 1 ? 0 : 3; // Pequeño gap entre segmentos
        
        // Crear círculo para cada segmento
        const segment = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        segment.setAttribute('cx', centerX);
        segment.setAttribute('cy', centerY);
        segment.setAttribute('r', radius - strokeWidth / 2);
        segment.setAttribute('fill', 'none');
        segment.setAttribute('stroke', colors[index % colors.length]);
        segment.setAttribute('stroke-width', strokeWidth);
        segment.setAttribute('stroke-dasharray', `${segmentLength} ${circumference}`);
        segment.setAttribute('stroke-dashoffset', -offset);
        segment.setAttribute('stroke-linecap', 'round');
        segment.setAttribute('class', 'donut-segment');
        segment.setAttribute('data-index', index);
        segment.style.transition = 'opacity 0.3s ease';
        segment.style.cursor = 'pointer';
        segment.setAttribute('opacity', '0.9');
        
        // Agregar hover effect
        segment.addEventListener('mouseenter', () => {
          segment.setAttribute('opacity', '1');
        });
        segment.addEventListener('mouseleave', () => {
          segment.setAttribute('opacity', '0.9');
        });
        
        donutChart.appendChild(segment);
        
        // Actualizar offset para el siguiente segmento
        offset += segmentLength + gap;
      });
      
      // Crear círculo interior (hueco del donut) AL FINAL para que esté encima
      const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      innerCircle.setAttribute('cx', centerX);
      innerCircle.setAttribute('cy', centerY);
      innerCircle.setAttribute('r', innerRadius);
      innerCircle.setAttribute('fill', '#ffffff');
      donutChart.appendChild(innerCircle);
      
      // Actualizar leyenda con colores y datos
      legend.innerHTML = distributionData.map((month, index) => {
        const percentage = totalAmount > 0 ? Math.round((month.amount / totalAmount) * 100) : 0;
        const formattedAmount = `$${month.amount.toLocaleString()}`;
        const color = colors[index % colors.length];
        
        return `
          <li class="legend-item" data-index="${index}">
            <span class="dot" style="background: ${color}"></span>
            <span class="month-name">${month.name}</span>
            <span class="month-stats">${formattedAmount} (${percentage}%)</span>
          </li>
        `;
      }).join('');
      
      // Agregar interactividad a la leyenda
      legend.querySelectorAll('.legend-item').forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.style.transition = 'opacity 0.3s ease';
        item.addEventListener('mouseenter', () => {
          const segments = donutChart.querySelectorAll('.donut-segment');
          segments.forEach((seg, i) => {
            if (i === index) {
              seg.setAttribute('opacity', '1');
            } else {
              seg.setAttribute('opacity', '0.5');
            }
          });
          item.style.opacity = '1';
        });
        item.addEventListener('mouseleave', () => {
          const segments = donutChart.querySelectorAll('.donut-segment');
          segments.forEach(seg => seg.setAttribute('opacity', '0.9'));
          item.style.opacity = '1';
        });
      });
    }
  } catch (error) {
    console.error("Error loading donation distribution:", error);
  }
}
