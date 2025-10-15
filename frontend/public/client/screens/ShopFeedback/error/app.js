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

// Navegar a la tienda
function goToShop(event) {
    event.preventDefault();
    window.location.href = '../shop.html';
}

// Navegar al inicio
function goToHome(event) {
    event.preventDefault();
    window.location.href = '../../index.html';
}

// Navegar a plantas
function goToPlants(event) {
    event.preventDefault();
    window.location.href = '../../plants.html';
}

// Navegar al perfil
function goToProfile(event) {
    event.preventDefault();
    window.location.href = '../../profile.html';
}