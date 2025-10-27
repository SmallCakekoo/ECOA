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
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/Garden';
}

// Funciones de navegación del navbar
function goToHome(event) {
    if (event) event.preventDefault();
    console.log('Navegando a Home');
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/Home';
}

function goToPlants(event) {
    if (event) event.preventDefault();
    console.log('Navegando a Virtual Pet');
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/VirtualPet';
}

function goToProfile(event) {
    if (event) event.preventDefault();
    console.log('Navegando a Profile');
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/Profile';
}

// Funciones para los botones de accesorios
function goToShopSuccess() {
    console.log('Navegando a Shop Feedback Success');
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/ShopFeedback/success';
}

function goToShopError() {
    console.log('Navegando a Shop Feedback Error');
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/ShopFeedback/error';
}

// Función para el botón View More
function goToShop() {
    console.log('Navegando a Shop');
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/Shop';
}