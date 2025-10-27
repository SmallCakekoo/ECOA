const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));

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
    if (event) event.preventDefault();
    console.log('Navegando a Home');
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/Home';
}

function goToPlants(event) {
    if (event) event.preventDefault();
    console.log('Ya estás en Plants');
    // Ya estamos en esta página
}

function goToProfile(event) {
    if (event) event.preventDefault();
    console.log('Navegando a Profile');
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/Profile';
}

function createPlantCard(plant, i) {
    const card = document.createElement('div');
    card.className = 'plant-card';
    card.innerHTML = `
        <div class="card-background"></div>
        <img class="plant-image" src="http://localhost:3000/api/upload/plants/${plant.id}.png" alt="Planta ${i}">
        <div class="card-overlay">
            <div class="plant-name">${plant.name}</div>
            <div class="plant-stats">
                <div class="stat">
                    <span class="iconify" data-icon="solar:sun-linear"></span>
                    ${plant.light}%
                </div>
                <div class="stat">
                    <span class="iconify" data-icon="lets-icons:water-light"></span>
                    ${plant.soil_moisture}%
                </div>
            </div>
        </div>
    `;
    
    // Al hacer clic en una planta, ir a Virtual Pet
    card.onclick = function() {
        console.log('Navegando a Virtual Pet con planta: ' + plant.name);
        window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/VirtualPet';
    };

    return card
}

// Generar plantas
const plantsGrid = document.getElementById('plantsGrid');

(async () => {
    const response = await fetch(`http://localhost:3000/users/${USER_DATA.id}/plants`);
    const { success, data: plants} = await response.json()
    
    if(!success) return
    
    const promises = plants.map(async (plant, index) => {
        const res = await fetch(`http://localhost:3000/plant_stats/${plant.id}`);
        const {data: plantMetrics = {}} = await res.json()

        const card = createPlantCard({
            ...plant, 
            soil_moisture: plantMetrics.soil_moisture || 0,
            light: plantMetrics.light || 0,
        },
        index
        );

        plantsGrid.appendChild(card);
    });

    await Promise.allSettled(promises)
    
    // Botón de agregar - Redirige a Shop
    const addButton = document.createElement('div');
    addButton.className = 'plant-card add-button';
    addButton.onclick = function() {
        console.log('Navegando a Adopt para adoptar nueva planta');
        window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/Adopt';
    };
    plantsGrid.appendChild(addButton);
    
    // CREATE PLANT STAT
    // const r = await fetch(`http://localhost:3000/plant_stats`, {
    //     method: "POST",
    //     headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     body: JSON.stringify({
    //         "plant_id": "bc847426-4203-4d18-aa12-21864906fe08",
    //         "soil_moisture": 44,
    //         "temperature": 26.2,
    //         "light": 70.5,
    //       })
    // });
    // const { success: s, data} = await r.json()
    // console.log(s, data);

    // DELETE PLANT STAT
    // const r = await fetch(`http://localhost:3000/plant_stats/35f62fc2-9f08-41fc-9633-efe6832a9d60`, {
    //     method: "DELETE",
    // });
    // const { success: s, data} = await r.json()
    // console.log(s, data);
})()