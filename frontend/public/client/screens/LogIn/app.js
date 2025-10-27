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
    const response = await fetch("https://ecoa-nine.vercel.app/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        // password no se envía ya que la autenticación es simulada
      }),
    });
    const data = await response.json();
    console.log(data);

    if (data.success && data.data && data.data.user) {
      localStorage.setItem("USER_DATA", JSON.stringify(data.data.user));
      // Si el usuario existe, redirigir a home
      window.location.href = "/client/screens/Home";
    } else {
      // Si no existe, mostrar mensaje de error
      alert(data.message || "User not found");
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
