const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"))

function createPlantCard(plant, index) {
  // contenedor principal
  const card = document.createElement('div');
  card.className = 'plant-card';
  card.onclick = () => selectPlant(plant.id);

  // imagen
  const img = document.createElement('img');
  img.src = `http://localhost:3000/api/upload/plants/${plant.id}.png`;
  img.alt = `${plant.name} Plant`;
  img.className = `plant-image plant-image${index}`;

  // contenedor de información
  const info = document.createElement('div');
  info.className = 'plant-info';

  const name = document.createElement('div');
  name.className = 'plant-name';
  name.textContent = plant.name;

  const description = document.createElement('div');
  description.className = 'plant-description';
  description.textContent = `Especie: ${plant.species}. Super resistant, purifies the air.`;

  // agregar name y description a info
  info.appendChild(name);
  info.appendChild(description);

  // botón
  const button = document.createElement('button');
  button.className = 'add-button';
  button.textContent = '+';
  button.onclick = (event) => {
    event.stopPropagation();
    adoptPlant(plant.id);
  };

  // ensamblar la card
  card.appendChild(img);
  card.appendChild(info);
  card.appendChild(button);

  return card;
}

(async () => {
  const response = await fetch('http://localhost:3000/plants');
  const { success, data: plants} = await response.json()
  console.log(success, plants);

  if(!success) return

  plants.forEach((plant, index) => {
    const card = createPlantCard(plant, index + 1);
    document.querySelector(".plant-cards").appendChild(card);
  });
})()





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

// Función para volver atrás - va a Shop
function goBack() {
  console.log('Volviendo a Shop...');
  window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/Shop';
}

// Función para ver detalles de una planta (click en tarjeta)
function selectPlant(id) {
  console.log('Ver detalles de planta:', id);
  window.location.href = 'https://ecoa-frontend.vercel.app/client/screens/AdoptDetail?id=' + id;
}

// Función para adoptar una planta (click en botón +)
async function adoptPlant(id) {
  console.log('Adoptando planta:', id);
  const response = await fetch('http://localhost:3000/plants/' + id, {
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