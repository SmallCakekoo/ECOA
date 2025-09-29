// Rutas para las integraciones externas
// OpenAI, OpenWeatherMap y Plant.id

import express from "express";
import {
  generatePlantMessage,
  generatePlantCareTips,
  diagnosePlantProblem,
} from "../services/integrations/openai.service.js";
import {
  getWeather,
  getWeatherForecast,
  getPlantCareRecommendations,
} from "../services/integrations/weather.service.js";
import {
  searchPlants,
  getPlantDetails,
  identifyPlantWithHealth,
  identifyMultiplePlants,
  getPlantFamilies,
} from "../services/integrations/plantid.service.js";

const router = express.Router();

// ===== RUTAS DE GEMINI (PLANTAS QUE HABLAN) =====

// POST /api/integrations/gemini/chat - Hacer que una planta "hable"
router.post("/gemini/chat", async (req, res) => {
  try {
    const { message, plantType = "planta", plantName } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "El mensaje es requerido",
      });
    }

    const result = await generatePlantMessage(message, plantType, plantName);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error en chat de Gemini:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// POST /api/integrations/gemini/care-tips - Consejos de cuidado desde la perspectiva de la planta
router.post("/gemini/care-tips", async (req, res) => {
  try {
    const { plantType, issue, plantName } = req.body;

    if (
      !plantType ||
      typeof plantType !== "string" ||
      plantType.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "El tipo de planta es requerido",
      });
    }

    const result = await generatePlantCareTips(plantType, issue, plantName);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error en consejos de cuidado:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// POST /api/integrations/gemini/diagnose - Diagnóstico desde la perspectiva de la planta
router.post("/gemini/diagnose", async (req, res) => {
  try {
    const { symptoms, plantType = "planta", plantName } = req.body;

    if (
      !symptoms ||
      typeof symptoms !== "string" ||
      symptoms.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Los síntomas son requeridos",
      });
    }

    const result = await diagnosePlantProblem(symptoms, plantType, plantName);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error en diagnóstico:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// ===== RUTAS DE OPEN-METEO =====

// GET /api/integrations/weather/current - Obtener clima actual por coordenadas
router.get("/weather/current", async (req, res) => {
  try {
    const { latitude, longitude, units = "celsius" } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Se requieren coordenadas (latitude y longitude)",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Las coordenadas deben ser números válidos",
      });
    }

    const result = await getWeather(lat, lng, units);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error obteniendo clima:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// GET /api/integrations/weather/forecast - Obtener pronóstico del clima
router.get("/weather/forecast", async (req, res) => {
  try {
    const { city, country, units = "metric" } = req.query;

    if (!city || typeof city !== "string" || city.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la ciudad es requerido",
      });
    }

    const result = await getWeatherForecast(city, country, units);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error obteniendo pronóstico:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// GET /api/integrations/weather/recommendations - Recomendaciones de cuidado basadas en clima
router.get("/weather/recommendations", async (req, res) => {
  try {
    const { city, plantType } = req.query;

    if (!city || typeof city !== "string" || city.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la ciudad es requerido",
      });
    }

    const result = await getPlantCareRecommendations(city, plantType);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error obteniendo recomendaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// ===== RUTAS DE TREFL.IO =====

// GET /api/integrations/plantid/families - Obtener familias de plantas
router.get("/plantid/families", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await getPlantFamilies(parseInt(page), parseInt(limit));

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error obteniendo familias de plantas:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// GET /api/integrations/trefle/search - Buscar plantas por nombre
router.get("/trefle/search", async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "El término de búsqueda es requerido",
      });
    }

    const result = await searchPlants(q, parseInt(page), parseInt(limit));

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error buscando plantas:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// POST /api/integrations/plantid/identify-health - Identificar planta con análisis de salud
router.post("/plantid/identify-health", async (req, res) => {
  try {
    const {
      imageBase64,
      healthDetails = ["common_names", "url", "description", "treatment"],
    } = req.body;

    if (
      !imageBase64 ||
      typeof imageBase64 !== "string" ||
      imageBase64.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "La imagen en base64 es requerida",
      });
    }

    const result = await identifyPlantWithHealth(imageBase64, healthDetails);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error identificando planta con salud:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// POST /api/integrations/plantid/identify-multiple - Identificar múltiples plantas
router.post("/plantid/identify-multiple", async (req, res) => {
  try {
    const { imageBase64, maxResults = 3 } = req.body;

    if (
      !imageBase64 ||
      typeof imageBase64 !== "string" ||
      imageBase64.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "La imagen en base64 es requerida",
      });
    }

    const result = await identifyMultiplePlants(imageBase64, maxResults);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error identificando múltiples plantas:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// GET /api/integrations/plantid/details/:plantId - Obtener detalles de una planta
router.get("/plantid/details/:plantId", async (req, res) => {
  try {
    const { plantId } = req.params;

    if (
      !plantId ||
      typeof plantId !== "string" ||
      plantId.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "El ID de la planta es requerido",
      });
    }

    const result = await getPlantDetails(plantId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error obteniendo detalles de planta:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// ===== RUTA DE ESTADO DE INTEGRACIONES =====

// GET /api/integrations/status - Estado de todas las integraciones
router.get("/status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Estado de las integraciones",
    integrations: {
      openai: {
        name: "OpenAI",
        status: "disponible",
        endpoints: [
          "POST /api/integrations/openai/chat",
          "POST /api/integrations/openai/care-tips",
          "POST /api/integrations/openai/diagnose",
        ],
      },
      weather: {
        name: "OpenWeatherMap",
        status: "disponible",
        endpoints: [
          "GET /api/integrations/weather/current",
          "GET /api/integrations/weather/forecast",
          "GET /api/integrations/weather/recommendations",
        ],
      },
      plantid: {
        name: "Plant.id",
        status: "disponible",
        endpoints: [
          "POST /api/integrations/plantid/identify",
          "POST /api/integrations/plantid/identify-health",
          "POST /api/integrations/plantid/identify-multiple",
          "GET /api/integrations/plantid/details/:plantId",
        ],
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
