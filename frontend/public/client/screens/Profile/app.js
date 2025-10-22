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

// Cargar información del usuario desde localStorage
function loadUserData() {
    const userName = localStorage.getItem('userName') || 'Julianana :)';
    const userImage = localStorage.getItem('userImage') || 'user-profile.jpg';
    const plantsCount = localStorage.getItem('plantsCount') || '132,643';

    document.getElementById('userName').textContent = userName;
    document.getElementById('profileImage').src = userImage;
    document.getElementById('plantsCount').textContent = plantsCount;
}

// Cargar datos al iniciar
window.addEventListener('DOMContentLoaded', loadUserData);

// Funciones de navegación del navbar
function goToHome() {
    console.log('Navegando a Home');
    window.location.href = '../Home/index.html';
}

function goToPlants() {
    console.log('Navegando a Virtual Pet');
    window.location.href = '../VirtualPet/index.html';
}

function goToGlobe() {
    console.log('Navegando a Globe/Community');
    // Implementar cuando exista la página
    alert('Globe feature coming soon!');
}

function goToProfile() {
    console.log('Ya estás en Profile');
    // Ya estamos aquí, no hacer nada
}

// Funciones de ajustes
function goToChangePassword() {
    console.log('Navegando a Change Password');
    // Aquí iría la navegación a la página de cambio de contraseña
    alert('Change Password feature - Create this page next!');
}

function goToEditProfile() {
    console.log('Navegando a Edit Profile');
    // Aquí iría la navegación a la página de editar perfil
    alert('Edit Profile feature - Create this page next!');
}

function goToNotifications() {
    console.log('Navegando a Notifications');
    // Aquí iría la navegación a la página de notificaciones
    alert('Notifications settings - Create this page next!');
}

function goToPrivacy() {
    console.log('Navegando a Privacy & Security');
    // Aquí iría la navegación a la página de privacidad
    alert('Privacy & Security settings - Create this page next!');
}

function goToAbout() {
    console.log('Navegando a About');
    // Aquí iría la navegación a la página de acerca de
    alert('About ECOA - Version 1.0.0');
}

// Función para cerrar sesión
function handleLogout() {
    // Confirmar antes de cerrar sesión
    const confirmLogout = confirm('Are you sure you want to log out?');
    
    if (confirmLogout) {
        console.log('Cerrando sesión...');
        
        // Limpiar datos de sesión del localStorage
        localStorage.removeItem('userToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('isLoggedIn');
        
        // Opcional: Mantener algunos datos si quieres que persistan
        // localStorage.removeItem('userName');
        // localStorage.removeItem('userImage');
        
        // Mostrar mensaje
        alert('You have been logged out successfully');
        
        // Redirigir a la página de inicio de sesión
        window.location.href = '../Login/index.html';
    }
}