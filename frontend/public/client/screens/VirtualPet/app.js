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

// Función para volver a Garden
function goToGarden() {
    window.location.href = '../Garden/index.html';
}

// Funciones de navegación del navbar
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
    window.location.href = '../Profile/index.html';
}

// Funciones para los botones de accesorios
function goToShopSuccess() {
    console.log('Navegando a Shop Feedback Success');
    window.location.href = '../ShopFeedback/success/index.html';
}

function goToShopError() {
    console.log('Navegando a Shop Feedback Error');
    window.location.href = '../ShopFeedback/error/index.html';
}

// Función para el botón View More
function goToShop() {
    console.log('Navegando a Shop');
    window.location.href = '../Shop/index.html';
}