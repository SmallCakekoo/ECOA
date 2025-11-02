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
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
});

// Handle form submission - Sign In
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Obtener todos los usuarios y buscar por email
    const response = await fetch("https://ecoa-backend-three.vercel.app/users");
    const data = await response.json();
    console.log(data);

    if (data.success && data.data) {
      // Buscar usuario por email
      const user = data.data.find((u) => u.email === email);

      if (user) {
        localStorage.setItem("USER_DATA", JSON.stringify(user));
        // Si el usuario existe, redirigir a home
        window.location.href = "/client/screens/Home";
      } else {
        // Si no existe, mostrar mensaje de error
        alert("User not found. Please sign up first.");
      }
    } else {
      alert("Error loading users");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred. Please try again.");
  }
});

// Handle signup link - Sign Up
const signupLink = document.getElementById("signupLink");
signupLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/client/screens/SingUp";
});
