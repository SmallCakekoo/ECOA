// Utilidad para manejar imágenes de plantas desde recursos locales
// Esta función ayuda a resolver imágenes de plantas usando recursos locales como fallback

// Usar rutas absolutas desde /client/ para que funcionen correctamente en Vercel
const PLANTS_IMAGES_BASE_PATH = '/client/src/assets/images/plants/';
const DEFAULT_PLANT_IMAGE = '/client/src/assets/images/plant.png';
const UNSPLASH_PLACEHOLDER = 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=400&fit=crop';

/**
 * Obtiene la URL de la imagen de una planta con fallback a recursos locales
 * @param {Object} plant - Objeto de la planta con propiedades image, image_url, id, name
 * @param {string} API_BASE_URL - URL base del API (opcional)
 * @returns {string} URL de la imagen
 */
function getPlantImageUrl(plant, API_BASE_URL = (typeof window !== 'undefined' && window.ECOA_CONFIG?.API_BASE_URL) || 'https://ecoabackendecoa.vercel.app') {
  if (!plant) {
    return getLocalPlantImage(null);
  }

  // 1) Prioridad: Imagen del backend (data URL, URL completa, o relativa)
  const ownImage = plant.image || plant.image_url;
  if (ownImage) {
    // Si es data URL (base64), usar directamente
    if (ownImage.startsWith('data:')) {
      return ownImage;
    }
    // Si es URL completa, usar directamente
    if (ownImage.startsWith('http://') || ownImage.startsWith('https://')) {
      return ownImage;
    }
    // Si es ruta relativa que parece ser de assets locales, usar ruta relativa local
    if (ownImage.includes('/src/assets/images/') || ownImage.includes('src/assets/images/')) {
      // Extraer el nombre del archivo y construir ruta relativa
      const fileName = ownImage.split('/').pop();
      if (ownImage.includes('plants/')) {
        return `${PLANTS_IMAGES_BASE_PATH}${fileName}`;
      }
      return DEFAULT_PLANT_IMAGE;
    }
    // Si es ruta relativa del backend (no de assets locales), construir URL completa del backend
    const relativePath = ownImage.startsWith('/') ? ownImage : '/' + ownImage;
    return `${API_BASE_URL}${relativePath}`;
  }

  // 2) Fallback: Imagen local basada en ID o nombre de la planta
  return getLocalPlantImage(plant);
}

/**
 * Obtiene una imagen local de la carpeta de recursos
 * @param {Object} plant - Objeto de la planta con id o name
 * @returns {string} Ruta relativa a la imagen local
 */
function getLocalPlantImage(plant) {
  if (!plant) {
    return DEFAULT_PLANT_IMAGE;
  }

  // Intentar usar el ID de la planta para seleccionar una imagen
  if (plant.id) {
    // Generar un índice basado en el ID (hash simple)
    const plantIdStr = String(plant.id);
    let hash = 0;
    for (let i = 0; i < plantIdStr.length; i++) {
      hash = ((hash << 5) - hash) + plantIdStr.charCodeAt(i);
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    const imageIndex = (Math.abs(hash) % 10) + 1; // Número entre 1 y 10
    const localImagePath = `${PLANTS_IMAGES_BASE_PATH}plant-${imageIndex}.png`;
    return localImagePath;
  }

  // Si no hay ID, usar el nombre
  if (plant.name) {
    const hash = plant.name.charCodeAt(0) % 10;
    const imageIndex = hash + 1; // Número entre 1 y 10
    const localImagePath = `${PLANTS_IMAGES_BASE_PATH}plant-${imageIndex}.png`;
    return localImagePath;
  }

  // Último recurso: imagen por defecto
  return DEFAULT_PLANT_IMAGE;
}

/**
 * Maneja el error de carga de imagen, intentando con recursos locales
 * @param {HTMLImageElement} imgElement - Elemento de imagen que falló
 * @param {Object} plant - Objeto de la planta
 * @returns {void}
 */
function handlePlantImageError(imgElement, plant) {
  // Intentar con imagen local
  const localImage = getLocalPlantImage(plant);
  if (imgElement.src !== localImage && !imgElement.src.includes(localImage)) {
    imgElement.src = localImage;
    // Si la imagen local también falla, usar placeholder de Unsplash
    imgElement.onerror = function() {
      this.onerror = null; // Prevenir loops infinitos
      this.src = UNSPLASH_PLACEHOLDER;
    };
  } else {
    // Si ya intentamos la local, usar placeholder
    imgElement.onerror = null; // Prevenir loops infinitos
    imgElement.src = UNSPLASH_PLACEHOLDER;
  }
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
  window.PlantImageUtils = {
    getPlantImageUrl,
    getLocalPlantImage,
    handlePlantImageError,
    PLANTS_IMAGES_BASE_PATH,
    DEFAULT_PLANT_IMAGE,
    UNSPLASH_PLACEHOLDER
  };
}

