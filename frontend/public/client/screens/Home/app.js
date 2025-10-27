const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"))
console.log(USER_DATA);

document.querySelector(".greeting").textContent = `Good Morning, ${USER_DATA.name}`

;(async () => {
  const response = await fetch(`http://localhost:3000/users/${USER_DATA.id}/plants`);
  const { success, data: plants, count} = await response.json()
    
  if(!success || count === 0) return

  const plant = getMostRecentPlant(plants)

  document.querySelector(".subgreeting").style.display = "block"
  document.querySelector(".last-plant-card").style.display = "flex"
  document.querySelector(".plant-name").textContent = plant.name

  fetchPlantMetrics(plant.id)

})() 

function getMostRecentPlant(plants) {
  return [...plants].sort(
    (a, b) => new Date(b.registration_date) - new Date(a.registration_date)
  )[0];
}

async function fetchPlantMetrics(plantId) {
  const response = await fetch(`http://localhost:3000/plant_status/${plantId}`);
  const { success, data: plantMetrics } = await response.json();
  console.log(plantMetrics, success);
  

  if (!success) throw new Error('Failed to load plant metrics');
  const percent = (plantMetrics.mood_index * 100);

  document.querySelector(".progress-text").textContent = percent + "%"
  // Animar progreso circular
  const circumference = 2 * Math.PI * 30;
  const progressCircle = document.getElementById('progressCircle');
  const offset = circumference - (percent / 100) * circumference;
  progressCircle.style.strokeDashoffset = offset;
}








// Actualizar hora
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('current-time').textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 60000);


// Funciones de navegación
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

// Adopt button - Redirige a página de adopción
document.getElementById('adoptBtn').addEventListener('click', () => {
  console.log('Adopt a new plant clicked');
  window.location.href = '../Adopt/index.html';
});

// Actualizar estadísticas aleatoriamente
function updateStats() {
  const randomPlants = Math.floor(Math.random() * 1000) + 3000;
  document.getElementById('statsText').textContent = 
    `${randomPlants.toLocaleString()} plants adopted this week!`;
}

// Actualizar cada 10 segundos
setInterval(updateStats, 10000);