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
  window.location.href = '../../Home/index.html';
}

function goToPlants(event) {
  event.preventDefault();
  console.log('Navegando a Virtual Pet');
  window.location.href = '../../VirtualPet/index.html';
}

function goToProfile(event) {
  event.preventDefault();
  console.log('Navegando a Profile');
  window.location.href = '../../Profile/index.html';
}

// Función para volver atrás - va a la página anterior
function goBack() {
  console.log('Volviendo atrás...');
  window.history.back();
}

// Función para ir a Garden
function goToGarden() {
  console.log('Yendo a Garden...');
  window.location.href = '../../Garden/index.html';
}