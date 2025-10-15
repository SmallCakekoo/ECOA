document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle-password');
  const password = document.getElementById('password');
  const form = document.getElementById('login-form');

  if (toggle && password) {
    const eyeIcon = toggle.querySelector('img');
    toggle.addEventListener('click', () => {
      const showing = password.getAttribute('type') === 'text';
      password.setAttribute('type', showing ? 'password' : 'text');
      toggle.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
      
      // Cambiar la imagen del ojo según el estado
      if (eyeIcon) {
        if (showing) {
          eyeIcon.src = './ assets/Ojocerrado.png'; // Ojo cerrado cuando está oculto
        } else {
          eyeIcon.src = './ assets/Ojoabierto.png'; // Ojo abierto cuando está visible
        }
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailValue = document.getElementById('email').value.trim();
      const remember = document.getElementById('remember').checked;
      
      console.log('Login attempt', { email: emailValue, remember });
      const btn = form.querySelector('.btn-primary');
      btn.disabled = true;
      setTimeout(() => {
        btn.disabled = false;
        alert('Inicio de sesión simulado. Integra con backend.');
      }, 600);
    });
  }
});