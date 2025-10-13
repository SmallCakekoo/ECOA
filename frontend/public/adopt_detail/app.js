// Actualizar la hora actual
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

// Actualizar la hora al cargar la página
updateTime();

// Actualizar la hora cada minuto
setInterval(updateTime, 60000);

// Función para volver atrás
function goBack() {
    window.history.back();
}

// Funciones de navegación
function goToHome(event) {
    event.preventDefault();
    window.location.href = 'index.html';
}

function goToPlants(event) {
    event.preventDefault();
    window.location.href = 'plants.html';
}

function goToShop(event) {
    event.preventDefault();
    window.location.href = 'shop.html';
}

function goToProfile(event) {
    event.preventDefault();
    window.location.href = 'profile.html';
}

// Función para adoptar la planta
function adoptPlant() {
    alert('¡Felicitaciones! Has adoptado a Snake Plant 🌱');
    // Aquí puedes agregar más lógica, como guardar en localStorage
    // o redirigir a otra página
}