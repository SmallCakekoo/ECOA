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

// Nombres aleatorios
const names = ['Julio', 'María', 'Pedro', 'Ana', 'Luis', 'Carmen', 'Carlos', 'Rosa', 'Diego', 'Elena'];

// Generar plantas
const plantsGrid = document.getElementById('plantsGrid');

// Crear 10 tarjetas de plantas
for (let i = 1; i <= 10; i++) {
    const card = document.createElement('div');
    card.className = 'plant-card';
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomSun = Math.floor(Math.random() * 51) + 30; // 30-80%
    const randomWater = Math.floor(Math.random() * 51) + 30; // 30-80%
    
    card.innerHTML = `
        <div class="card-background"></div>
        <img class="plant-image" src="./assets/images/${i}.png" alt="Planta ${i}">
        <div class="card-overlay">
            <div class="plant-name">${randomName}</div>
            <div class="plant-stats">
                <div class="stat">
                    <span class="iconify" data-icon="solar:sun-linear"></span>
                    ${randomSun}%
                </div>
                <div class="stat">
                    <span class="iconify" data-icon="lets-icons:water-light"></span>
                    ${randomWater}%
                </div>
            </div>
        </div>
    `;
    
    plantsGrid.appendChild(card);
}

// Botón de agregar
const addButton = document.createElement('div');
addButton.className = 'plant-card add-button';
addButton.onclick = function() {
    alert('Agregar nueva planta');
};
plantsGrid.appendChild(addButton);