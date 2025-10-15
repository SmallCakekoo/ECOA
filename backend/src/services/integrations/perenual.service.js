// backend/src/services/integrations/perenual.service.js
// Integración con Perenual API para obtener datos de plantas
// Requiere API Key -> https://perenual.com/

const PERENUAL_API_KEY = process.env.PERENUAL_API_KEY;
const PERENUAL_BASE_URL = "https://perenual.com/api";

/**
 * Función auxiliar para limpiar datos y evitar valores null innecesarios
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} - Objeto limpio sin valores null/undefined
 */
function cleanObject(obj) {
  if (obj === null || obj === undefined) return undefined;

  if (Array.isArray(obj)) {
    return obj
      .map((item) => cleanObject(item))
      .filter((item) => item !== undefined);
  }

  if (typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanObject(value);
      if (cleanedValue !== undefined && cleanedValue !== null) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return obj;
}

/**
 * Función auxiliar para limpiar datos de imagen
 * @param {Object} imageObj - Objeto de imagen
 * @returns {Object|null} - Objeto de imagen limpio o null
 */
function cleanImageData(imageObj) {
  if (!imageObj) return null;

  const cleaned = {};
  const imageFields = [
    "thumbnail",
    "small_url",
    "medium_url",
    "regular_url",
    "original_url",
  ];

  for (const field of imageFields) {
    if (imageObj[field] && imageObj[field] !== null) {
      cleaned[field] = imageObj[field];
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

/**
 * Busca plantas por nombre común o científico
 * @param {string} query - Término de búsqueda
 * @param {number} page - Página de resultados (default 1)
 * @param {number} limit - Resultados por página (default 10)
 */
export async function searchPlants(query, page = 1, limit = 10) {
  try {
    if (!PERENUAL_API_KEY) {
      return {
        success: false,
        error: "Configuración incompleta",
        message: "Falta PERENUAL_API_KEY en el entorno del servidor",
      };
    }
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return {
        success: false,
        error: "El término de búsqueda es requerido",
        message: "Por favor, proporciona un nombre de planta para buscar",
      };
    }

    const url = `${PERENUAL_BASE_URL}/species-list?key=${PERENUAL_API_KEY}&q=${encodeURIComponent(
      query.trim()
    )}&page=${page}&per_page=${limit}`;

    const response = await fetch(url);
    if (response.status === 401) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: "No autorizado",
        message:
          body?.error ||
          "Perenual devolvió 401. Revisa que PERENUAL_API_KEY sea válido y no esté expirado.",
      };
    }
    if (!response.ok) {
      throw new Error(`Error de Perenual API: ${response.status}`);
    }

    const data = await response.json();
    const items = data?.data || [];

    if (!items || items.length === 0) {
      return {
        success: false,
        error: "No se encontraron plantas",
        message: `No se encontraron plantas que coincidan con "${query}"`,
      };
    }

    const plants = items.map((plant) => {
      const cleanedPlant = cleanObject({
        id: plant.id,
        common_name: plant.common_name,
        scientific_name: plant.scientific_name,
        other_name: plant.other_name,
        family: plant.family,
        hybrid: plant.hybrid,
        authority: plant.authority,
        subspecies: plant.subspecies,
        cultivar: plant.cultivar,
        variety: plant.variety,
        species_epithet: plant.species_epithet,
        genus: plant.genus,
        default_image: cleanImageData(plant.default_image),
        watering: plant.watering,
        sunlight: plant.sunlight,
        cycle: plant.cycle,
        hardiness: plant.hardiness,
        care_level: plant.care_level,
        description: plant.description,
        origin: plant.origin,
        type: plant.type,
        dimensions: plant.dimensions,
        attracts: plant.attracts,
        propagation: plant.propagation,
        hardiness_location: plant.hardiness_location,
        flowers: plant.flowers,
        leaf: plant.leaf,
        fruits: plant.fruits,
        edible_fruit: plant.edible_fruit,
        edible_fruit_taste_profile: plant.edible_fruit_taste_profile,
        cuisine: plant.cuisine,
        medicinal: plant.medicinal,
        poisonous_to_humans: plant.poisonous_to_humans,
        poisonous_to_pets: plant.poisonous_to_pets,
        drought_tolerant: plant.drought_tolerant,
        salt_tolerant: plant.salt_tolerant,
        thorny: plant.thorny,
        invasive: plant.invasive,
        tropical: plant.tropical,
        indoor: plant.indoor,
        care_guides: plant.care_guides,
        soil: plant.soil,
        growth_rate: plant.growth_rate,
        maintenance: plant.maintenance,
        watering_general_benchmark: plant.watering_general_benchmark,
        pruning_month: plant.pruning_month,
        pruning_count: plant.pruning_count,
        repotting: plant.repotting,
        pest_susceptibility: plant.pest_susceptibility,
        pest_susceptibility_api: plant.pest_susceptibility_api,
        flowers_conspicuous: plant.flowers_conspicuous,
        foliage_texture: plant.foliage_texture,
        foliage_color: plant.foliage_color,
        leaf_retention: plant.leaf_retention,
        growth_habit: plant.growth_habit,
        toxicity: plant.toxicity,
        faunal_attractions: plant.faunal_attractions,
        propagation_methods: plant.propagation_methods,
        light_requirements: plant.light_requirements,
        soil_nutrition: plant.soil_nutrition,
        soil_ph: plant.soil_ph,
        soil_salinity: plant.soil_salinity,
        soil_texture: plant.soil_texture,
        soil_water_retention: plant.soil_water_retention,
        minimum_temperature: plant.minimum_temperature,
        maximum_temperature: plant.maximum_temperature,
        minimum_precipitation: plant.minimum_precipitation,
        maximum_precipitation: plant.maximum_precipitation,
        minimum_humidity: plant.minimum_humidity,
        maximum_humidity: plant.maximum_humidity,
        low_water_tolerance: plant.low_water_tolerance,
        medium_water_tolerance: plant.medium_water_tolerance,
        high_water_tolerance: plant.high_water_tolerance,
        low_light_tolerance: plant.low_light_tolerance,
        medium_light_tolerance: plant.medium_light_tolerance,
        high_light_tolerance: plant.high_light_tolerance,
        low_fertilizer_tolerance: plant.low_fertilizer_tolerance,
        medium_fertilizer_tolerance: plant.medium_fertilizer_tolerance,
        high_fertilizer_tolerance: plant.high_fertilizer_tolerance,
        low_salt_tolerance: plant.low_salt_tolerance,
        medium_salt_tolerance: plant.medium_salt_tolerance,
        high_salt_tolerance: plant.high_salt_tolerance,
        low_soil_ph_tolerance: plant.low_soil_ph_tolerance,
        medium_soil_ph_tolerance: plant.medium_soil_ph_tolerance,
        high_soil_ph_tolerance: plant.high_soil_ph_tolerance,
        low_soil_texture_tolerance: plant.low_soil_texture_tolerance,
        medium_soil_texture_tolerance: plant.medium_soil_texture_tolerance,
        high_soil_texture_tolerance: plant.high_soil_texture_tolerance,
        low_soil_water_retention_tolerance:
          plant.low_soil_water_retention_tolerance,
        medium_soil_water_retention_tolerance:
          plant.medium_soil_water_retention_tolerance,
        high_soil_water_retention_tolerance:
          plant.high_soil_water_retention_tolerance,
        low_temperature_tolerance: plant.low_temperature_tolerance,
        medium_temperature_tolerance: plant.medium_temperature_tolerance,
        high_temperature_tolerance: plant.high_temperature_tolerance,
        low_humidity_tolerance: plant.low_humidity_tolerance,
        medium_humidity_tolerance: plant.medium_humidity_tolerance,
        high_humidity_tolerance: plant.high_humidity_tolerance,
        low_precipitation_tolerance: plant.low_precipitation_tolerance,
        medium_precipitation_tolerance: plant.medium_precipitation_tolerance,
        high_precipitation_tolerance: plant.high_precipitation_tolerance,
        bibliography: plant.bibliography,
        author: plant.author,
        year: plant.year,
      });

      return cleanedPlant;
    });

    return {
      success: true,
      search_results: {
        plants,
        current_page: page,
        per_page: limit,
        total_results: data?.total || plants.length,
        last_page: data?.last_page || 1,
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
 * @param {number|string} plantId - ID de la planta en Perenual
 */
export async function getPlantDetails(plantId) {
  try {
    if (!PERENUAL_API_KEY) {
      return {
        success: false,
        error: "Configuración incompleta",
        message: "Falta PERENUAL_API_KEY en el entorno del servidor",
      };
    }
    if (!plantId) {
      return {
        success: false,
        error: "ID requerido",
        message: "Por favor, proporciona un ID de planta válido",
      };
    }

    const url = `${PERENUAL_BASE_URL}/species/details/${plantId}?key=${PERENUAL_API_KEY}`;
    const response = await fetch(url);

    if (response.status === 401) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: "No autorizado",
        message:
          body?.error ||
          "Perenual devolvió 401. Revisa que PERENUAL_API_KEY sea válido y no esté expirado.",
      };
    }
    if (!response.ok) {
      throw new Error(`Error de Perenual API: ${response.status}`);
    }

    const data = await response.json();

    const cleanedPlant = cleanObject({
      id: data.id,
      common_name: data.common_name,
      scientific_name: data.scientific_name,
      other_name: data.other_name,
      family: data.family,
      hybrid: data.hybrid,
      authority: data.authority,
      subspecies: data.subspecies,
      cultivar: data.cultivar,
      variety: data.variety,
      species_epithet: data.species_epithet,
      genus: data.genus,
      origin: data.origin,
      type: data.type,
      dimensions: data.dimensions,
      cycle: data.cycle,
      attracts: data.attracts,
      propagation: data.propagation,
      hardiness: data.hardiness,
      hardiness_location: data.hardiness_location,
      watering: data.watering,
      watering_general_benchmark: data.watering_general_benchmark,
      plant_anatomy: data.plant_anatomy,
      sunlight: data.sunlight,
      pruning_month: data.pruning_month,
      pruning_count: data.pruning_count,
      seeds: data.seeds,
      maintenance: data.maintenance,
      care_guides: data.care_guides,
      soil: data.soil,
      growth_rate: data.growth_rate,
      drought_tolerant: data.drought_tolerant,
      salt_tolerant: data.salt_tolerant,
      thorny: data.thorny,
      invasive: data.invasive,
      tropical: data.tropical,
      indoor: data.indoor,
      care_level: data.care_level,
      pest_susceptibility: data.pest_susceptibility,
      flowers: data.flowers,
      flowering_season: data.flowering_season,
      cones: data.cones,
      fruits: data.fruits,
      edible_fruit: data.edible_fruit,
      harvest_season: data.harvest_season,
      leaf: data.leaf,
      edible_leaf: data.edible_leaf,
      cuisine: data.cuisine,
      medicinal: data.medicinal,
      poisonous_to_humans: data.poisonous_to_humans,
      poisonous_to_pets: data.poisonous_to_pets,
      description: data.description,
      default_image: cleanImageData(data.default_image),
      other_images: data.other_images
        ? data.other_images
            .map((img) => cleanImageData(img))
            .filter((img) => img !== null)
        : undefined,
      xWateringQuality: data.xWateringQuality,
      xWateringPeriod: data.xWateringPeriod,
      xWateringAvgVolumeRequirement: data.xWateringAvgVolumeRequirement,
      xWateringDepthRequirement: data.xWateringDepthRequirement,
      xWateringBasedTemperature: data.xWateringBasedTemperature,
      xWateringPhLevel: data.xWateringPhLevel,
      xSunlightDuration: data.xSunlightDuration,
      xTemperatureTolence: data.xTemperatureTolence,
      xPlantSpacingRequirement: data.xPlantSpacingRequirement,
    });

    return {
      success: true,
      plant: cleanedPlant,
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
    if (!PERENUAL_API_KEY) {
      return {
        success: false,
        error: "Configuración incompleta",
        message: "Falta PERENUAL_API_KEY en el entorno del servidor",
      };
    }
    const url = `${PERENUAL_BASE_URL}/species-list?key=${PERENUAL_API_KEY}&page=${page}&per_page=${limit}`;

    const response = await fetch(url);
    if (response.status === 401) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: "No autorizado",
        message:
          body?.error ||
          "Perenual devolvió 401. Revisa que PERENUAL_API_KEY sea válido y no esté expirado.",
      };
    }
    if (!response.ok) {
      throw new Error(`Error de Perenual API: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      species: data.data || [],
      current_page: page,
      per_page: limit,
      total_results: data?.total ?? undefined,
      last_page: data?.last_page ?? undefined,
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
 * Obtiene familias de plantas (función adaptada para Perenual)
 * @param {number} page - Página de resultados (default 1)
 * @param {number} limit - Resultados por página (default 10)
 */
export async function getPlantFamilies(page = 1, limit = 10) {
  try {
    if (!PERENUAL_API_KEY) {
      return {
        success: false,
        error: "Configuración incompleta",
        message: "Falta PERENUAL_API_KEY en el entorno del servidor",
      };
    }

    // Perenual no tiene un endpoint específico para familias,
    // pero podemos obtener especies y extraer las familias únicas
    const url = `${PERENUAL_BASE_URL}/species-list?key=${PERENUAL_API_KEY}&page=${page}&per_page=${limit}`;

    const response = await fetch(url);
    if (response.status === 401) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: "No autorizado",
        message:
          body?.error ||
          "Perenual devolvió 401. Revisa que PERENUAL_API_KEY sea válido y no esté expirado.",
      };
    }
    if (!response.ok) {
      throw new Error(`Error de Perenual API: ${response.status}`);
    }

    const data = await response.json();
    const species = data.data || [];

    // Extraer familias únicas de las especies
    const families = [
      ...new Set(species.map((plant) => plant.family).filter(Boolean)),
    ].map((family) => ({
      name: family,
      common_name: family,
    }));

    return {
      success: true,
      families,
      current_page: page,
      per_page: limit,
      total_results: families.length,
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
 * Identifica una planta con análisis de salud usando Perenual Plant Identification API
 * @param {string} imageBase64 - Imagen en base64
 * @param {Array} healthDetails - Detalles de salud a incluir
 */
export async function identifyPlantWithHealth(imageBase64, healthDetails = []) {
  try {
    if (!PERENUAL_API_KEY) {
      return {
        success: false,
        error: "Configuración incompleta",
        message: "Falta PERENUAL_API_KEY en el entorno del servidor",
      };
    }

    if (!imageBase64) {
      return {
        success: false,
        error: "Imagen requerida",
        message: "Por favor, proporciona una imagen en formato base64",
      };
    }

    const url = `${PERENUAL_BASE_URL}/plant-identification?key=${PERENUAL_API_KEY}`;

    const formData = new FormData();
    formData.append("images", imageBase64);
    if (healthDetails.length > 0) {
      formData.append("health", healthDetails.join(","));
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (response.status === 401) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: "No autorizado",
        message:
          body?.error ||
          "Perenual devolvió 401. Revisa que PERENUAL_API_KEY sea válido y no esté expirado.",
      };
    }

    if (!response.ok) {
      throw new Error(
        `Error de Perenual Plant Identification API: ${response.status}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      identification: {
        suggestions: data.suggestions || [],
        health_assessment: data.health_assessment || null,
        is_plant: data.is_plant || null,
        is_healthy: data.is_healthy || null,
        disease_suggestions: data.disease_suggestions || [],
      },
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
 * Identifica múltiples plantas usando Perenual Plant Identification API
 * @param {string} imageBase64 - Imagen en base64
 * @param {number} maxResults - Número máximo de resultados
 */
export async function identifyMultiplePlants(imageBase64, maxResults = 3) {
  try {
    if (!PERENUAL_API_KEY) {
      return {
        success: false,
        error: "Configuración incompleta",
        message: "Falta PERENUAL_API_KEY en el entorno del servidor",
      };
    }

    if (!imageBase64) {
      return {
        success: false,
        error: "Imagen requerida",
        message: "Por favor, proporciona una imagen en formato base64",
      };
    }

    const url = `${PERENUAL_BASE_URL}/plant-identification?key=${PERENUAL_API_KEY}&max_results=${maxResults}`;

    const formData = new FormData();
    formData.append("images", imageBase64);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (response.status === 401) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: "No autorizado",
        message:
          body?.error ||
          "Perenual devolvió 401. Revisa que PERENUAL_API_KEY sea válido y no esté expirado.",
      };
    }

    if (!response.ok) {
      throw new Error(
        `Error de Perenual Plant Identification API: ${response.status}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      identification: {
        suggestions: data.suggestions || [],
        is_plant: data.is_plant || null,
        max_results: maxResults,
      },
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
