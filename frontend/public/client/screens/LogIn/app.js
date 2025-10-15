
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  document.getElementById(
    "current-time"
  ).textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 60000);

// Toggle password visibility
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const type =
    passwordInput.getAttribute("type") === "password"
      ? "text"
      : "password";
  passwordInput.setAttribute("type", type);
});

// Handle form submission
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("Login attempt:", { username, password });
  alert(`Login attempt with username: ${username}`);

  // Aquí va la lógica de autenticación
});

// Handle signup link
const signupLink = document.getElementById("signupLink");
signupLink.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Navigate to signup");
  alert("Redirecting to signup page...");

  // Aquí la lógica de navegación
});
