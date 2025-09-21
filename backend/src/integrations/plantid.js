// backend/src/integrations/trefle.js
// Integración con Trefle.io para obtener datos de plantas
// Requiere API Key -> https://trefle.io/

const TREFLE_API_KEY = "AzoCGr-wieeaGVQvfMowbrwizdbuK9jiAgcVA-0xIWg"; // hardcoded
const TREFLE_BASE_URL = "https://trefle.io/api/v1";

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
