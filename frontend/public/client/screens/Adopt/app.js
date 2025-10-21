// Actualizar hora
function updateTime() {
  var now = new Date();
  var hours = now.getHours().toString();
  var minutes = now.getMinutes().toString();
  
  if (hours.length === 1) hours = '0' + hours;
  if (minutes.length === 1) minutes = '0' + minutes;
  
  var timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.textContent = hours + ':' + minutes;
  }
}

updateTime();
setInterval(updateTime, 60000);

// Funciones de navegación
function goToHome(event) {
  event.preventDefault();
  console.log('Navegando a Home');
  window.location.href = '../Home/index.html';
}

function goToPlants(event) {
  event.preventDefault();
  console.log('Navegando a Virtual Pet');
  window.location.href = '../VirtualPet/index.html';
}

function goToProfile(event) {
  event.preventDefault();
  console.log('Navegando a Profile');
  window.location.href = '../Profile/index.html';
}

// Función para volver atrás - va a Shop
function goBack() {
  console.log('Volviendo a Shop...');
  window.location.href = '../Shop/index.html';
}

// Función para seleccionar una planta
function selectPlant(id) {
  console.log('Planta seleccionada:', id);
  // Aquí puedes agregar lógica adicional si necesitas
}

// Función para adoptar una planta
function adoptPlant(id) {
  console.log('Adoptando planta:', id);
  
  // Si es la planta 1 (Snake Plant), va a success
  if (id === 1) {
    window.location.href = '../AdoptFeedback/success.html';
  } else {
    // El resto va a error
    window.location.href = '../AdoptFeedback/error.html';
  }
}