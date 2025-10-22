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

// Funciones de navegación
function goToHome(event) {
    event.preventDefault();
    window.history.back();
}

function goToPlants(event) {
    event.preventDefault();
    window.location.href = '../VirtualPet/index.html';
}

function goToProfile(event) {
    event.preventDefault();
    window.location.href = '../Profile/index.html';
}

// Función para ir a la página de éxito de adopción
function goToAdoptSuccess() {
    window.location.href = '../AdoptFeedback/success.html';
}