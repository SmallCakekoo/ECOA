// Update time
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('current-time').textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 60000);

// Navigation functions
function goBack() {
  console.log('Going back...');
  // Aquí puedes agregar la lógica para volver a la página anterior
}

function navigate(page) {
  console.log('Navigating to:', page);
  // Aquí puedes agregar la lógica de navegación
  
  // Update active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
}

function selectPlant(id) {
  console.log('Plant selected:', id);
  // Aquí puedes agregar la lógica para ver detalles de la planta
}

function adoptPlant(id) {
  console.log('Adopting plant:', id);
  alert('¡Planta adoptada exitosamente! 🌱');
  // Aquí puedes agregar la lógica para adoptar la planta
}

// Add smooth animations
document.querySelectorAll('.plant-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.3s ease';
  });
});