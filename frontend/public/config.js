// Configuración dinámica para ECOA
(function() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = isLocalhost ? 'http://localhost:3000' : 'https://ecoabackendecoa.vercel.app';
  
  window.ECOA_CONFIG = {
    API_BASE_URL: API_URL,
    SOCKET_URL: API_URL.replace(/^http/, 'ws').replace(/^https/, 'wss')
  };

  console.log('ECOA Config loaded:', window.ECOA_CONFIG);
})();
