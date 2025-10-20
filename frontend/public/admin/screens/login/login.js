// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Toggle password visibility
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');

  if (togglePassword && passwordInput && eyeIcon) {
    togglePassword.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Cambiar el tipo de input y el icono
      if (passwordInput.type === 'password') {
        // Mostrar contraseña
        passwordInput.type = 'text';
        eyeIcon.setAttribute('data-icon', 'mdi:eye-outline');
        console.log('Contraseña visible');
      } else {
        // Ocultar contraseña
        passwordInput.type = 'password';
        eyeIcon.setAttribute('data-icon', 'mdi:eye-off-outline');
        console.log('Contraseña oculta');
      }
    });
  }

  // Form submission
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember').checked;
      
      // Here you would typically send a request to your backend
      console.log('Login attempt:', { email, password, remember });
      
      // Redirect to dashboard (for demo purposes)
      window.location.href = '../dashboard/index.html';
    });
  }

  // Forgot password link
  const forgotLink = document.getElementById('forgot-link');
  
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password reset functionality would be implemented here.');
    });
  }
});