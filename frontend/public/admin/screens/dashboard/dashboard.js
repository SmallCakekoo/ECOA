// Cargar el servicio de API y autenticación
const apiScript = document.createElement('script');
apiScript.src = '../../src/api.js';
document.head.appendChild(apiScript);

const authScript = document.createElement('script');
authScript.src = '../../src/auth.js';
document.head.appendChild(authScript);

document.addEventListener('DOMContentLoaded', async () => {
  // Esperar a que se cargue la API
  if (!window.AdminAPI) {
    await new Promise(resolve => {
      const checkAPI = () => {
        if (window.AdminAPI) {
          resolve();
        } else {
          setTimeout(checkAPI, 100);
        }
      };
      checkAPI();
    });
  }

  // Verificar autenticación
  if (!window.AdminAPI.isAuthenticated()) {
    console.log('No autenticado, redirigiendo al login');
    window.location.href = '../login/index.html';
    return;
  }

  console.log('Usuario autenticado, inicializando dashboard');
  
  // Inicializar la aplicación
  await initializeApp();

  // Event listeners para menú
  document.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Event listeners para logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (window.AuthManager) {
        window.AuthManager.logout();
      } else {
        window.AdminAPI.logout();
        window.location.href = '../login/index.html';
      }
    });
  }
});

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
    console.error('Error initializing app:', error);
    showNotification('Error al cargar los datos del dashboard', 'error');
  }
}

async function loadStats() {
  try {
    const stats = await window.AdminAPI.getStats();
    
    // Actualizar contadores
    updateStatCard('totalUsers', stats.users.total);
    updateStatCard('newUsers', stats.users.new);
    updateStatCard('totalPlants', stats.plants.total);
    updateStatCard('adoptedPlants', stats.plants.adopted);
    updateStatCard('availablePlants', stats.plants.available);
    updateStatCard('totalDonations', stats.donations.total);
    updateStatCard('activeDonations', stats.donations.active);
    updateStatCard('totalAmount', `$${stats.donations.totalAmount.toLocaleString()}`);
    
    // Actualizar gráficos (si existen)
    updateCharts(stats);
  } catch (error) {
    console.error('Error loading stats:', error);
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
  console.log('Stats loaded:', stats);
}

async function loadRecentPlants() {
  try {
    const response = await window.AdminAPI.getPlants({ status: 'active' });
    const plants = response.data.slice(0, 5); // Últimas 5 plantas
    
    const container = document.getElementById('recentPlants');
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
      
      // Crear filas de plantas
      const plantRows = plants.map(plant => `
        <div class="plant-item">
          <div class="plant-image">
            <img src="${plant.image_url || '../../src/plant-placeholder.svg'}" alt="${plant.name}">
          </div>
          <div class="plant-info">
            <h4>${plant.name} #${String(plant.id).padStart(6, '0')}</h4>
            <p>${plant.species}</p>
          </div>
          <div class="adopter-info">${plant.adopter_name || 'Available'}</div>
          <div class="status-cell">
            <span class="status ${plant.health_status}">${getStatusText(plant.health_status)}</span>
          </div>
          <div class="care-notes">${plant.care_notes || 'No recent notes'}</div>
        </div>
      `).join('');
      
      container.innerHTML = tableHeaders + plantRows;
    }
  } catch (error) {
    console.error('Error loading recent plants:', error);
  }
}

function getStatusText(status) {
  const statusMap = {
    'healthy': 'Healthy',
    'needs_care': 'Recovering',
    'sick': 'Sick',
    'dying': 'Dying'
  };
  return statusMap[status] || status;
}

function setupPlantForm() {
  const uploadBox = document.getElementById('uploadBox');
  const fileInput = document.getElementById('plantPhoto');
  const preview = document.getElementById('photoPreview');

  if (uploadBox && fileInput && preview) {
    uploadBox.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      
      try {
        const imageUrl = await window.AdminAPI.uploadImage(file);
        preview.src = imageUrl;
        preview.style.display = 'block';
        uploadBox.querySelector('.upload-inner').style.display = 'none';
      } catch (error) {
        console.error('Error uploading image:', error);
        showNotification('Error al subir la imagen', 'error');
      }
    });
  }

  const plantForm = document.getElementById('plantForm');
  if (plantForm) {
    plantForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await createPlant();
    });
  }
}

async function createPlant() {
  const form = document.getElementById('plantForm');
  const formData = new FormData(form);
  
  const plantData = {
    user_id: 1, // Por ahora hardcodeado, en producción sería el ID del admin
    name: formData.get('plantName'),
    species: formData.get('species'),
    description: formData.get('description'),
    image_url: document.getElementById('photoPreview').src || null,
    status: 'active',
    health_status: 'healthy',
    water_level: 0,
    light_level: 0,
    temperature: 0,
    humidity: 0
  };

  try {
    showLoading(true);
    const result = await window.AdminAPI.createPlant(plantData);
    
    if (result.success) {
      showNotification('Planta creada exitosamente', 'success');
      form.reset();
      document.getElementById('photoPreview').style.display = 'none';
      document.querySelector('.upload-inner').style.display = 'block';
      
      // Recargar datos
      await loadStats();
      await loadRecentPlants();
    }
  } catch (error) {
    console.error('Error creating plant:', error);
    showNotification(error.message || 'Error al crear la planta', 'error');
  } finally {
    showLoading(false);
  }
}

function showLoading(show = true) {
  window.AdminUtils.showLoading(show);
}

function showNotification(message, type = 'error') {
  window.AdminUtils.showNotification(message, type);
}


