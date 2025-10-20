document.addEventListener('DOMContentLoaded', () => {
 
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');

  if (togglePassword && passwordInput && eyeIcon) {
    togglePassword.addEventListener('click', function(e) {
      e.preventDefault();
      
      
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

 
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember').checked;
      
      
      console.log('Login attempt:', { email, password, remember });
      
      
      window.location.href = '../dashboard/index.html';
    });
  }

 
  const forgotLink = document.getElementById('forgot-link');
  
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password reset functionality would be implemented here.');
    });
  }
});