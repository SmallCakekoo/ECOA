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
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch('http://localhost:3000/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  const data = await response.json()
  console.log(data);

  localStorage.setItem("USER_DATA", JSON.stringify(data.data.user))
  
  if (data.success) {
    // Si el usuario existe, redirigir a home
    window.location.href = "https://ecoa-frontend.vercel.app/client/screens/Home";
  } else {
    // Si no existe, mostrar mensaje de error
    alert("Usuario o contraseña incorrectos");
  }
});

// Handle signup link - Sign Up
const signupLink = document.getElementById("signupLink");
signupLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "https://ecoa-frontend.vercel.app/client/screens/SingUp";
});