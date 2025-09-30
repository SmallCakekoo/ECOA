// backend/src/integrations/plantid.js
// Integración con Trefle.io para obtener datos de plantas
// Requiere API Key -> https://trefle.io/

const TREFLE_API_KEY = process.env.TREFLE_API_KEY;
const TREFLE_BASE_URL = process.env.TREFLE_BASE_URL;

/**
 * Busca plantas por nombre común o científico
 * @param {string} query - Término de búsqueda
 * @param {number} page - Página de resultados (default 1)
 * @param {number} limit - Resultados por página (default 10)
 */
export async function searchPlants(query, page = 1, limit = 10) {
  try {
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return {
        success: false,
        error: "El término de búsqueda es requerido",
        message: "Por favor, proporciona un nombre de planta para buscar",
      };
    }

    const url = `${TREFLE_BASE_URL}/plants/search?token=${TREFLE_API_KEY}&q=${encodeURIComponent(
      query.trim()
    )}&page=${page}&per_page=${limit}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error de Trefle API: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "No se encontraron plantas",
        message: `No se encontraron plantas que coincidan con "${query}"`,
      };
    }

    const plants = data.map((plant) => ({
      id: plant.id,
      common_name: plant.common_name || "Sin nombre común",
      scientific_name: plant.scientific_name || "Sin nombre científico",
      family: plant.family_common_name || plant.family || "Desconocida",
      genus: plant.genus || "Desconocido",
      image_url: plant.image_url || null,
    }));

    return {
      success: true,
      search_results: {
        plants,
        current_page: page,
        per_page: limit,
        total_results: plants.length,
      },
      query,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error en searchPlants:", error);
    return {
      success: false,
      error: error.message,
      message: "No se pudo buscar plantas en este momento.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Obtiene detalles de una planta por ID
 * @param {number|string} plantId - ID de la planta en Trefle
 */
export async function getPlantDetails(plantId) {
  try {
    if (!plantId) {
      return {
        success: false,
        error: "ID requerido",
        message: "Por favor, proporciona un ID de planta válido",
      };
    }

    const url = `${TREFLE_BASE_URL}/plants/${plantId}?token=${TREFLE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error de Trefle API: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      plant: {
        id: data.data?.id,
        common_name: data.data?.common_name || "No disponible",
        scientific_name: data.data?.scientific_name || "No disponible",
        family: data.data?.family || "No disponible",
        genus: data.data?.genus || "No disponible",
        image_url: data.data?.image_url || null,
        bibliography: data.data?.bibliography || null,
        author: data.data?.author || null,
        year: data.data?.year || null,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error en getPlantDetails:", error);
    return {
      success: false,
      error: error.message,
      message: "No se pudo obtener la información detallada de la planta.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Obtiene especies de plantas
 * @param {number} page - Página de resultados (default 1)
 * @param {number} limit - Resultados por página (default 10)
 */
export async function getPlantSpecies(page = 1, limit = 10) {
  try {
    const url = `${TREFLE_BASE_URL}/species?token=${TREFLE_API_KEY}&page=${page}&per_page=${limit}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error de Trefle API: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      species: data.data || [],
      current_page: page,
      per_page: limit,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error en getPlantSpecies:", error);
    return {
      success: false,
      error: error.message,
      message: "No se pudieron obtener las especies de plantas.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Obtiene familias de plantas
 * @param {number} page - Página de resultados (default 1)
 * @param {number} limit - Resultados por página (default 10)
 */
export async function getPlantFamilies(page = 1, limit = 10) {
  try {
    const url = `${TREFLE_BASE_URL}/families?token=${TREFLE_API_KEY}&page=${page}&per_page=${limit}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error de Trefle API: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      families: data.data || [],
      current_page: page,
      per_page: limit,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error en getPlantFamilies:", error);
    return {
      success: false,
      error: error.message,
      message: "No se pudieron obtener las familias de plantas.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Identifica una planta con análisis de salud (función placeholder)
 * @param {string} imageBase64 - Imagen en base64
 * @param {Array} healthDetails - Detalles de salud a incluir
 */
export async function identifyPlantWithHealth(imageBase64, healthDetails = []) {
  try {
    // Esta es una función placeholder - en una implementación real
    // se conectaría con Plant.id API para identificación con análisis de salud
    return {
      success: false,
      error: "Función no implementada",
      message:
        "La identificación de plantas con análisis de salud no está implementada actualmente.",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error en identifyPlantWithHealth:", error);
    return {
      success: false,
      error: error.message,
      message: "No se pudo identificar la planta con análisis de salud.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Identifica múltiples plantas (función placeholder)
 * @param {string} imageBase64 - Imagen en base64
 * @param {number} maxResults - Número máximo de resultados
 */
export async function identifyMultiplePlants(imageBase64, maxResults = 3) {
  try {
    // Esta es una función placeholder - en una implementación real
    // se conectaría con Plant.id API para identificación múltiple
    return {
      success: false,
      error: "Función no implementada",
      message:
        "La identificación múltiple de plantas no está implementada actualmente.",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error en identifyMultiplePlants:", error);
    return {
      success: false,
      error: error.message,
      message: "No se pudieron identificar múltiples plantas.",
      timestamp: new Date().toISOString(),
    };
  }
}
