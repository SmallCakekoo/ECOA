// Configuración del panel de administración
const AdminConfig = {
  // URL del backend - Servidor en producción
  API_BASE_URL: "https://ecoa-frontend-four-k32o.vercel.app",

  // Configuración de autenticación
  AUTH: {
    TOKEN_KEY: "admin_token",
    USER_KEY: "admin_user",
    TOKEN_EXPIRY_HOURS: 24,
  },

  // Configuración de paginación
  PAGINATION: {
    PLANTS_PER_PAGE: 12,
    DONATIONS_PER_PAGE: 10,
    USERS_PER_PAGE: 15,
  },

  // Configuración de actualización automática
  AUTO_REFRESH: {
    DASHBOARD_INTERVAL: 30000, // 30 segundos
    ENABLED: true,
  },

  // Configuración de notificaciones
  NOTIFICATIONS: {
    DURATION: 5000, // 5 segundos
    POSITION: "top-right",
  },

  // Configuración de subida de archivos
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    QUALITY: 0.8, // Para compresión de imágenes
  },

  // Configuración de validación
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_PASSWORD_LENGTH: 6,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
  },

  // Configuración de estados
  PLANT_STATUSES: {
    HEALTHY: "healthy",
    NEEDS_CARE: "needs_care",
    SICK: "sick",
    DYING: "dying",
  },

  DONATION_STATUSES: {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  },

  // Configuración de colores
  COLORS: {
    PRIMARY: "#7EB234",
    PRIMARY_DARK: "#6EA32E",
    SUCCESS: "#27ae60",
    ERROR: "#e74c3c",
    WARNING: "#f39c12",
    INFO: "#3498db",
  },

  // Configuración de breakpoints para responsive
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
  },

  // Configuración de desarrollo
  DEBUG: {
    ENABLED: true,
    LOG_API_CALLS: true,
    LOG_ERRORS: true,
  },
};

// Exportar configuración globalmente
window.AdminConfig = AdminConfig;
