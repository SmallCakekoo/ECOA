const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"))

const params = new URLSearchParams(window.location.search);

const plantId = params.get('id');     


(async function hydratePlantPage() {
  try {
    await Promise.all([
      fetchPlantData(plantId),
      fetchPlantMetrics(plantId),
      fetchPlantStatus(plantId)
    ]);
  } catch (error) {
    console.error('Error hydrating page:', error);
  }
})()

async function fetchPlantData(plantId) {
  const response = await fetch(`http://localhost:3000/plants/${plantId}`);
  const { success, data: plant } = await response.json();

  if (!success) throw new Error('Failed to load plant data');

  document.title = `${plant.name} Plant - Adopt`;
  document.querySelector('.plant-title').textContent = `${plant.name} Plant`;
  document.querySelector('.plant-description').textContent = `The ${plant.name} Plant is the ultimate survivor. Strong, stoic, and elegant, with tall leaves shaped like green spears brushed with yellow or silver.`;
  document.querySelector('#plant-image').src = `http://localhost:3000/api/upload/plants/${plant.id}.png`;
  document.querySelector('.about-text').textContent = `The ${plant.name} Plant is often called the ultimate survivor among houseplants. Native to West Africa, it has earned a reputation for being almost indestructible. Its tall, upright leaves rise like green spears, sometimes edged or streaked with silver, cream, or yellow, giving it a striking architectural look that fits both modern and traditional interiors.`;
}

async function fetchPlantMetrics(plantId) {
  const response = await fetch(`http://localhost:3000/plant_stats/${plantId}`);
  const { success, data: plantMetrics } = await response.json();

  if (!success) throw new Error('Failed to load plant metrics');

  const [tempBtn, humBtn, lightBtn] = document.querySelectorAll('.state-button');
  addStateButtonText(plantMetrics.temperature, tempBtn);
  addStateButtonText(plantMetrics.soil_moisture, humBtn);
  addStateButtonText(plantMetrics.light, lightBtn);
}

async function fetchPlantStatus(plantId) {
  const response = await fetch(`http://localhost:3000/plant_status/${plantId}`);
  const { success, data: plantStatus } = await response.json();

  if (!success) throw new Error('Failed to load plant status');

  const moodBtn = document.querySelectorAll('.state-button')[3];
  addStateButtonText(plantStatus.mood_index, moodBtn);
}



  // // CREATE PLANT STAT
  // const r = await fetch(`http://localhost:3000/plant_status`, {
  //     method: "POST",
  //     headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     body: JSON.stringify({
  //       plant_id: "bc847426-4203-4d18-aa12-21864906fe08",
  //       status: "healthy",
  //       mood_index: 0.5,
  //       mood_face: "🫠",
  //     })
  // });
  // const { success: s, data} = await r.json()
  // console.log(s, data);

  // DELETE PLANT STATUS
  // const r = await fetch(`http://localhost:3000/plant_status/62de8f9f-9c62-42f6-ab7e-c81f11b38b4b`, {
  //   method: "DELETE",
  // });
  // const { success: s, data} = await r.json()
  // console.log(s, data);

    // AÑADIR METRICAS A UNA PLANTA. (EL SCHEMA DE LA DB NO ESTABA LISTO)
    // const response = await fetch('http://localhost:3000/plants/'+plantId+"/metrics", {
    //     method: "PUT",
    //     headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     body: JSON.stringify({
    //         "water_level": "80",
    // "light_level": "100",
    // "temperature": "23",
    // "humidity": "70",
    // "health_status": "99",
    //     })
    // });
    // const { success, data: plant} = await response.json()
    // console.log(success, plant);

  function addStateButtonText (value, node) {
    const text = document.createElement("p")
    text.textContent = value + "%"
    node.appendChild(text)
  }



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
    window.history.back();
}

function goToPlants(event) {
    if (event) event.preventDefault();
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/VirtualPet';
}

function goToProfile(event) {
    if (event) event.preventDefault();
    window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/Profile';
}

// Función para ir a la página de éxito de adopción
async function adoptPlant() {
    console.log('Adoptando planta:', plantId);
    const response = await fetch('http://localhost:3000/plants/' + plantId, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: USER_DATA.id
      })
    });
    
    const { success, data: plant} = await response.json()
    console.log(success, plant);
    
    if (success) {
      window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/AdoptFeedback/success';
    } else {
      window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/AdoptFeedback/error';
    }
  }