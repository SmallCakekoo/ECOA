document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle-password');
  const password = document.getElementById('password');
  const form = document.getElementById('login-form');

  if (toggle && password) {
    toggle.addEventListener('click', () => {
      const showing = password.getAttribute('type') === 'text';
      password.setAttribute('type', showing ? 'password' : 'text');
      toggle.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailValue = /** @type {HTMLInputElement} */(document.getElementById('email')).value.trim();
      const remember = /** @type {HTMLInputElement} */(document.getElementById('remember')).checked;
      // Simulación de login; aquí después se integrará con backend
      console.log('Login attempt', { email: emailValue, remember });
      form.querySelector('.btn-primary').disabled = true;
      setTimeout(() => {
        form.querySelector('.btn-primary').disabled = false;
        alert('Inicio de sesión simulado. Integra con backend.');
      }, 600);
    });
  }
});


