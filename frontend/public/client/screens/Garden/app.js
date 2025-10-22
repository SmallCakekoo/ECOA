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
    console.log('Navegando a Home');
    window.location.href = '../Home/index.html';
}

function goToPlants(event) {
    event.preventDefault();
    console.log('Ya estás en Plants');
    // Ya estamos en esta página
}

function goToProfile(event) {
    event.preventDefault();
    window.location.href = '../Profile/index.html';
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
        <img class="plant-image" src="../../src/assets/images/plant-${i}.png" alt="Planta ${i}">
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
    
    // Al hacer clic en una planta, ir a Virtual Pet
    card.onclick = function() {
        console.log('Navegando a Virtual Pet con planta: ' + randomName);
        window.location.href = '../VirtualPet/index.html';
    };
    
    plantsGrid.appendChild(card);
}

// Botón de agregar - Redirige a Shop
const addButton = document.createElement('div');
addButton.className = 'plant-card add-button';
addButton.onclick = function() {
    console.log('Navegando a Shop para adoptar nueva planta');
    window.location.href = '../Adopt/index.html';
};
plantsGrid.appendChild(addButton);