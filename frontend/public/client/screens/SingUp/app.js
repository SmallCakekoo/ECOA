// Actualizar hora actual
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  document.getElementById("current-time").textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 60000);

// Toggle password visibility para ambos campos
const eyeIcons = document.querySelectorAll(".eye-icon");

eyeIcons.forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    const targetId = eyeIcon.getAttribute("data-target");
    const passwordInput = document.getElementById(targetId);

    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
  });
});

// Handle form submission - Sign Up
const signupForm = document.getElementById("signupForm");
const errorMessage = document.getElementById("errorMessage");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const repeatPassword = document.getElementById("repeat-password").value;

  // Validar que las contraseñas coincidan (solo por UX, no se guardan)
  if (password !== repeatPassword) {
    errorMessage.textContent = "Passwords do not match!";
    errorMessage.classList.add("show");
    return;
  }

  // Ocultar mensaje de error si todo está bien
  errorMessage.classList.remove("show");

  try {
    // POST directo a la tabla users
    const response = await fetch("https://ecoabackendecoa.vercel.app/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username,
        email: email,
        rol: "donante", // rol por defecto
      }),
    });

    const data = await response.json();

    if (!data.success) {
      errorMessage.textContent = data.message || "Error creating account";
      errorMessage.classList.add("show");
      return;
    }

    if (data.data) {
      localStorage.setItem("USER_DATA", JSON.stringify(data.data));

      // Mostrar mensaje de éxito y redirigir
      alert(
        `Account created successfully!\nEmail: ${email}\nUsername: ${username}`
      );

      // Redirigir a la página de Home
      window.location.href = "/client/screens/Home";
    }
  } catch (error) {
    console.error("Signup error:", error);
    errorMessage.textContent = "An error occurred. Please try again.";
    errorMessage.classList.add("show");
  }
});

// Handle signin link - Sign In
const signinLink = document.getElementById("signinLink");
signinLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/client/screens/LogIn";
});
