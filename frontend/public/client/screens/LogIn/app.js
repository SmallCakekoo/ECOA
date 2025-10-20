function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  document.getElementById("current-time").textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 60000);

// Toggle password visibility
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
});

// Handle form submission - Sign In
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  // Obtener usuarios registrados
  const users = JSON.parse(localStorage.getItem("users")) || [];
  
  // Verificar si el usuario existe
  const userExists = users.find(
    (user) => user.username === username && user.password === password
  );
  
  if (userExists) {
    // Si el usuario existe, redirigir a home
    window.location.href = "../Home/index.html";
  } else {
    // Si no existe, mostrar mensaje de error
    alert("Usuario o contraseña incorrectos");
  }
});

// Handle signup link - Sign Up
const signupLink = document.getElementById("signupLink");
signupLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "../SingUp/index.html";
});