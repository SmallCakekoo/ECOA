// Utilidades compartidas para el panel de administración

// Función para mostrar notificaciones
function showNotification(message, type = 'error') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
    ${type === 'error' ? 'background-color: #e74c3c;' : 'background-color: #27ae60;'}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// Función para mostrar loading
function showLoading(show = true, elementId = 'loadingOverlay') {
  const loadingElement = document.getElementById(elementId);
  if (loadingElement) {
    loadingElement.style.display = show ? 'flex' : 'none';
  }
}

// Función para mostrar loading en botones
function showButtonLoading(button, show = true, loadingText = 'Cargando...') {
  if (button) {
    if (show) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `<span class="spinner"></span> ${loadingText}`;
      button.style.opacity = '0.7';
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
      button.style.opacity = '1';
    }
  }
}

// Función para formatear fechas
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Función para formatear fechas cortas
function formatDateShort(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Función para formatear moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Función para obtener texto de estado
function getStatusText(status, type = 'general') {
  const statusMaps = {
    general: {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'pending': 'Pendiente',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    },
    health: {
      'excellent': 'Excellent',
      'healthy': 'Healthy',
      'recovering': 'Recovering',
      'critical': 'Critical',
      // Mapeos legacy para compatibilidad
      'needs_care': 'Recovering',
      'sick': 'Sick',
      'dying': 'Critical'
    },
    donation: {
      'pending': 'Pendiente',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    }
  };
  
  const map = statusMaps[type] || statusMaps.general;
  return map[status] || status;
}

// Función para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar formulario
function validateForm(formData, rules) {
  const errors = {};
  
  for (const field in rules) {
    const value = formData.get(field);
    const rule = rules[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${rule.label} es requerido`;
    } else if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `${rule.label} debe tener al menos ${rule.minLength} caracteres`;
    } else if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${rule.label} no puede tener más de ${rule.maxLength} caracteres`;
    } else if (value && rule.email && !isValidEmail(value)) {
      errors[field] = `${rule.label} debe ser un email válido`;
    } else if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${rule.label} tiene un formato inválido`;
    }
  }
  
  return errors;
}

// Función para mostrar errores de formulario
function showFormErrors(errors) {
  // Limpiar errores anteriores
  document.querySelectorAll('.field-error').forEach(error => error.remove());
  
  for (const field in errors) {
    const input = document.querySelector(`[name="${field}"]`);
    if (input) {
      const errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      errorElement.textContent = errors[field];
      errorElement.style.cssText = `
        color: #e74c3c;
        font-size: 12px;
        margin-top: 4px;
        font-weight: 500;
      `;
      
      input.parentNode.appendChild(errorElement);
      input.style.borderColor = '#e74c3c';
    }
  }
}

// Función para limpiar errores de formulario
function clearFormErrors() {
  document.querySelectorAll('.field-error').forEach(error => error.remove());
  document.querySelectorAll('input, select, textarea').forEach(input => {
    input.style.borderColor = '';
  });
}

// Función para confirmar acción
function confirmAction(message, callback) {
  if (confirm(message)) {
    callback();
  }
}

// Función para debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Función para throttle
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Función para copiar al portapapeles
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copiado al portapapeles', 'success');
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    showNotification('Error al copiar al portapapeles', 'error');
  }
}

// Función para descargar archivo
function downloadFile(data, filename, type = 'text/plain') {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Función para exportar datos a CSV
function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    showNotification('No hay datos para exportar', 'error');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  downloadFile(csvContent, filename, 'text/csv');
}

// Función para generar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para capitalizar texto
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Función para truncar texto
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// Función para obtener parámetros de URL
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// Función para actualizar parámetros de URL
function updateUrlParams(params) {
  const url = new URL(window.location);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  }
  window.history.replaceState({}, '', url);
}

// Exportar funciones globalmente
window.AdminUtils = {
  showNotification,
  showLoading,
  showButtonLoading,
  formatDate,
  formatDateShort,
  formatCurrency,
  getStatusText,
  isValidEmail,
  validateForm,
  showFormErrors,
  clearFormErrors,
  confirmAction,
  debounce,
  throttle,
  copyToClipboard,
  downloadFile,
  exportToCSV,
  generateId,
  capitalize,
  truncateText,
  getUrlParams,
  updateUrlParams
};
