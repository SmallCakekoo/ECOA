
// Actualizar hora actual
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('current-time').textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 60000);

// Toggle password visibility para ambos campos
const eyeIcons = document.querySelectorAll('.eye-icon');

eyeIcons.forEach(eyeIcon => {
  eyeIcon.addEventListener('click', () => {
    const targetId = eyeIcon.getAttribute('data-target');
    const passwordInput = document.getElementById(targetId);
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
  });
});

// Handle form submission
const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const repeatPassword = document.getElementById('repeat-password').value;

  // Validar que las contraseñas coincidan
  if (password !== repeatPassword) {
    errorMessage.textContent = 'Passwords do not match!';
    errorMessage.classList.add('show');
    return;
  }

  // Ocultar mensaje de error si todo está bien
  errorMessage.classList.remove('show');
  
  console.log('Signup attempt:', { email, username, password });
  alert(`Account created successfully!\nEmail: ${email}\nUsername: ${username}`);
  
  // Aquí va la logica de registro
});

// Handle signin link
const signinLink = document.getElementById('signinLink');
signinLink.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('Navigate to signin');
  alert('Redirecting to sign in page...');
  
  // Aquí la lógica de navegación
});
