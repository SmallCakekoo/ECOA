// backend/src/services/integrations/perenual-db.service.js
// Servicio para integrar Perenual API con la base de datos

import { searchPlants, getPlantDetails } from "./perenual.service.js";
import { findPlantById, updatePlant } from "../../db/plants.db.js";
import { sanitizePlantUpdate } from "../../models/plants.model.js";

/**
 * Busca una planta en Perenual y devuelve el mejor match
 * @param {string} query - Nombre común o científico de la planta
 * @returns {Object|null} - Datos de la planta de Perenual o null
 */
export async function findPlantInPerenual(query) {
  try {
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return null;
    }

    const result = await searchPlants(query.trim(), 1, 5);
    
    if (!result.success || !result.search_results?.plants?.length) {
      return null;
    }

    // Retornar el primer resultado (mejor match)
    return result.search_results.plants[0];
  } catch (error) {
    console.error("Error buscando planta en Perenual:", error);
    return null;
  }
}

/**
 * Enriquece los datos de una planta con información de Perenual
 * Solo actualiza campos que existen en el modelo de la BD (name, species, description, image)
 * @param {Object} plantData - Datos básicos de la planta
 * @param {Object} perenualData - Datos de Perenual
 * @returns {Object} - Datos enriquecidos con información de Perenual (solo campos válidos para BD)
 */
export function enrichPlantWithPerenualData(plantData, perenualData) {
  if (!perenualData) {
    return plantData;
  }

  const enriched = { ...plantData };

  // Usar imagen de Perenual si no hay imagen local
  if (!enriched.image && perenualData.default_image) {
    // Preferir medium_url, luego small_url, luego thumbnail
    enriched.image = 
      perenualData.default_image.medium_url ||
      perenualData.default_image.small_url ||
      perenualData.default_image.thumbnail ||
      null;
  }

  // Enriquecer descripción con información de Perenual
  if (!enriched.description && perenualData.description) {
    enriched.description = perenualData.description;
  } else if (enriched.description && perenualData.description) {
    // Combinar descripciones si ambas existen (evitar duplicados)
    if (!enriched.description.includes(perenualData.description.substring(0, 50))) {
      enriched.description = `${enriched.description}\n\n${perenualData.description}`;
    }
  }

  // Actualizar especie si está vacía o mejorar con nombre científico
  if (perenualData.scientific_name && (!enriched.species || enriched.species.trim() === "")) {
    enriched.species = perenualData.scientific_name;
  }

  // Actualizar nombre si está vacío
  if (perenualData.common_name && (!enriched.name || enriched.name.trim() === "")) {
    enriched.name = perenualData.common_name;
  }

  // NO agregar perenual_data aquí porque no existe en el modelo de BD
  // Los metadatos de Perenual se pueden usar en otros lugares pero no se guardan en plants

  return enriched;
}

/**
 * Enriquece una planta existente en la BD con datos de Perenual
 * @param {string} plantId - ID de la planta en la BD
 * @param {string} searchQuery - Término de búsqueda para Perenual (opcional, usa name o species si no se proporciona)
 * @returns {Object} - Resultado de la operación
 */
export async function enrichExistingPlant(plantId, searchQuery = null) {
  try {
    // Obtener la planta actual
    const { data: plant, error: plantError } = await findPlantById(plantId);
    
    if (plantError || !plant) {
      return {
        success: false,
        error: "Planta no encontrada",
        message: `No se encontró la planta con ID: ${plantId}`,
      };
    }

    // Determinar término de búsqueda
    const query = searchQuery || plant.name || plant.species;
    
    if (!query) {
      return {
        success: false,
        error: "No hay término de búsqueda",
        message: "No se puede buscar en Perenual sin nombre o especie",
      };
    }

    // Buscar en Perenual
    const perenualData = await findPlantInPerenual(query);
    
    if (!perenualData) {
      return {
        success: false,
        error: "No encontrado en Perenual",
        message: `No se encontró información en Perenual para: ${query}`,
      };
    }

    // Preparar datos para actualizar
    const updateData = {};
    
    // Actualizar imagen solo si no hay imagen actual
    if (!plant.image && perenualData.default_image) {
      updateData.image = 
        perenualData.default_image.medium_url ||
        perenualData.default_image.small_url ||
        perenualData.default_image.thumbnail ||
        null;
    }

    // Actualizar descripción
    if (perenualData.description) {
      if (!plant.description) {
        updateData.description = perenualData.description;
      } else if (!plant.description.includes(perenualData.description.substring(0, 50))) {
        // Solo agregar si no está ya incluida
        updateData.description = `${plant.description}\n\n${perenualData.description}`;
      }
    }

    // Actualizar especie si está vacía o es diferente
    if (perenualData.scientific_name && (!plant.species || plant.species.trim() === "")) {
      updateData.species = perenualData.scientific_name;
    }

    // Sanitizar datos antes de actualizar
    const sanitizedData = sanitizePlantUpdate(updateData);
    
    if (Object.keys(sanitizedData).length === 0) {
      return {
        success: true,
        message: "Planta ya tiene toda la información disponible",
        plant,
        perenual_data: perenualData,
      };
    }

    // Actualizar en la BD
    const { data: updatedPlant, error: updateError } = await updatePlant(plantId, sanitizedData);
    
    if (updateError) {
      return {
        success: false,
        error: "Error actualizando planta",
        message: updateError.message,
      };
    }

    return {
      success: true,
      message: "Planta enriquecida exitosamente con datos de Perenual",
      plant: updatedPlant,
      perenual_data: perenualData,
      updates_applied: Object.keys(sanitizedData),
    };
  } catch (error) {
    console.error("Error enriqueciendo planta:", error);
    return {
      success: false,
      error: error.message,
      message: "Error al enriquecer la planta con datos de Perenual",
    };
  }
}

/**
 * Crea una planta en la BD usando datos de Perenual
 * @param {string} perenualId - ID de la planta en Perenual
 * @param {Object} additionalData - Datos adicionales (user_id, foundation_id, etc.)
 * @returns {Object} - Resultado de la operación
 */
export async function createPlantFromPerenual(perenualId, additionalData = {}) {
  try {
    // Obtener detalles de Perenual
    const perenualResult = await getPlantDetails(perenualId);
    
    if (!perenualResult.success || !perenualResult.plant) {
      return {
        success: false,
        error: "No encontrado en Perenual",
        message: `No se encontró la planta con ID ${perenualId} en Perenual`,
      };
    }

    const perenualPlant = perenualResult.plant;

    // Preparar datos para crear la planta
    const plantData = {
      name: perenualPlant.common_name || perenualPlant.scientific_name || "Planta sin nombre",
      species: perenualPlant.scientific_name || perenualPlant.common_name || "",
      description: perenualPlant.description || null,
      image: perenualPlant.default_image?.medium_url || 
             perenualPlant.default_image?.small_url || 
             perenualPlant.default_image?.thumbnail || 
             null,
      ...additionalData, // user_id, foundation_id, etc.
    };

    return {
      success: true,
      plant_data: plantData,
      perenual_data: perenualPlant,
      message: "Datos de planta preparados desde Perenual",
    };
  } catch (error) {
    console.error("Error creando planta desde Perenual:", error);
    return {
      success: false,
      error: error.message,
      message: "Error al obtener datos de Perenual",
    };
  }
}

/**
 * Busca plantas en Perenual y devuelve resultados formateados para crear en BD
 * @param {string} query - Término de búsqueda
 * @param {number} limit - Número de resultados
 * @returns {Object} - Resultados formateados
 */
export async function searchAndFormatForDB(query, limit = 10) {
  try {
    const result = await searchPlants(query, 1, limit);
    
    if (!result.success || !result.search_results?.plants?.length) {
      return {
        success: false,
        message: `No se encontraron plantas para: ${query}`,
        plants: [],
      };
    }

    // Formatear plantas para fácil creación en BD
    const formattedPlants = result.search_results.plants.map((plant) => ({
      perenual_id: plant.id,
      name: plant.common_name || plant.scientific_name || "Planta sin nombre",
      species: plant.scientific_name || plant.common_name || "",
      description: plant.description || null,
      image: plant.default_image?.medium_url || 
             plant.default_image?.small_url || 
             plant.default_image?.thumbnail || 
             null,
      metadata: {
        watering: plant.watering,
        sunlight: plant.sunlight,
        care_level: plant.care_level,
        hardiness: plant.hardiness,
        cycle: plant.cycle,
        indoor: plant.indoor,
      },
    }));

    return {
      success: true,
      plants: formattedPlants,
      total: result.search_results.total_results,
      query,
    };
  } catch (error) {
    console.error("Error buscando y formateando plantas:", error);
    return {
      success: false,
      error: error.message,
      message: "Error al buscar plantas en Perenual",
      plants: [],
    };
  }
}

