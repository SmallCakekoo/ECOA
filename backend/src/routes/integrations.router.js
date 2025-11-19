// Rutas para las integraciones externas
// Perenual API

import express from "express";
// Eliminadas integraciones de OpenAI/Gemini y Weather
import {
  searchPlants,
  getPlantDetails,
  getPlantSpecies,
  getPlantFamilies,
  identifyPlantWithHealth,
  identifyMultiplePlants,
} from "../services/integrations/perenual.service.js";
import {
  enrichExistingPlant,
  createPlantFromPerenual,
  searchAndFormatForDB,
} from "../services/integrations/perenual-db.service.js";
import { insertPlant } from "../db/plants.db.js";
import { createPlantModel } from "../models/plants.model.js";

const router = express.Router();

// Se eliminaron rutas de Gemini y Weather

// ===== RUTAS DE PERENUAL API =====

// GET /api/integrations/perenual - Información sobre los endpoints de Perenual
router.get("/perenual", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API de Perenual disponible",
    service: "Perenual Plant API",
    endpoints: {
      search: {
        method: "GET",
        path: "/api/integrations/perenual/search",
        description: "Buscar plantas por nombre",
        parameters: {
          q: "string (requerido) - Término de búsqueda",
          page: "number (opcional) - Página de resultados (default: 1)",
          limit: "number (opcional) - Resultados por página (default: 10)",
        },
      },
      details: {
        method: "GET",
        path: "/api/integrations/perenual/details/:plantId",
        description: "Obtener detalles de una planta por ID",
        parameters: {
          plantId: "string (requerido) - ID de la planta",
        },
      },
      species: {
        method: "GET",
        path: "/api/integrations/perenual/species",
        description: "Obtener lista de especies de plantas",
        parameters: {
          page: "number (opcional) - Página de resultados (default: 1)",
          limit: "number (opcional) - Resultados por página (default: 10)",
        },
      },
      families: {
        method: "GET",
        path: "/api/integrations/perenual/families",
        description: "Obtener familias de plantas",
        parameters: {
          page: "number (opcional) - Página de resultados (default: 1)",
          limit: "number (opcional) - Resultados por página (default: 10)",
        },
      },
      identify_health: {
        method: "POST",
        path: "/api/integrations/perenual/identify-health",
        description: "Identificar planta con análisis de salud",
        parameters: {
          imageBase64: "string (requerido) - Imagen en formato base64",
          healthDetails: "array (opcional) - Detalles de salud a incluir",
        },
      },
      identify_multiple: {
        method: "POST",
        path: "/api/integrations/perenual/identify-multiple",
        description: "Identificar múltiples plantas",
        parameters: {
          imageBase64: "string (requerido) - Imagen en formato base64",
          maxResults:
            "number (opcional) - Número máximo de resultados (default: 3)",
        },
      },
    },
    documentation: "https://perenual.com/docs/plant-open-api",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/integrations/perenual/families - Obtener familias de plantas
router.get("/perenual/families", async (req, res) => {
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

// GET /api/integrations/perenual/search - Buscar plantas por nombre
router.get("/perenual/search", async (req, res) => {
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

// POST /api/integrations/perenual/identify-health - Identificar planta con análisis de salud
router.post("/perenual/identify-health", async (req, res) => {
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

// POST /api/integrations/perenual/identify-multiple - Identificar múltiples plantas
router.post("/perenual/identify-multiple", async (req, res) => {
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

// GET /api/integrations/perenual/details/:plantId - Obtener detalles de una planta
router.get("/perenual/details/:plantId", async (req, res) => {
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

// GET /api/integrations/perenual/species - Obtener especies de plantas
router.get("/perenual/species", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await getPlantSpecies(parseInt(page), parseInt(limit));

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error obteniendo especies de plantas:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// ===== RUTAS DE INTEGRACIÓN PERENUAL-DB =====

// POST /api/integrations/perenual/enrich/:plantId - Enriquece una planta existente con datos de Perenual
router.post("/perenual/enrich/:plantId", async (req, res) => {
  try {
    const { plantId } = req.params;
    const { search_query } = req.body; // Opcional: término de búsqueda personalizado

    if (!plantId) {
      return res.status(400).json({
        success: false,
        message: "El ID de la planta es requerido",
      });
    }

    const result = await enrichExistingPlant(plantId, search_query);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error enriqueciendo planta:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// POST /api/integrations/perenual/create-from-search - Busca en Perenual y crea planta en BD
router.post("/perenual/create-from-search", async (req, res) => {
  try {
    const { query, perenual_id, ...additionalData } = req.body;

    // Si se proporciona perenual_id, usar ese directamente
    if (perenual_id) {
      const result = await createPlantFromPerenual(perenual_id, additionalData);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Crear la planta en la BD
      try {
        const plantData = createPlantModel(result.plant_data);
        const { data: createdPlant, error: insertError } = await insertPlant(plantData);
        
        if (insertError) {
          return res.status(500).json({
            success: false,
            message: "Error creando planta en la base de datos",
            error: insertError.message,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Planta creada exitosamente desde Perenual",
          plant: createdPlant,
          perenual_data: result.perenual_data,
        });
      } catch (modelError) {
        return res.status(400).json({
          success: false,
          message: "Error validando datos de la planta",
          error: modelError.message,
        });
      }
    }

    // Si se proporciona query, buscar y devolver resultados formateados
    if (query) {
      const result = await searchAndFormatForDB(query, 10);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({
        success: true,
        message: "Plantas encontradas en Perenual (listas para crear)",
        plants: result.plants,
        total: result.total,
        query: result.query,
        note: "Usa POST /api/integrations/perenual/create-from-search con perenual_id para crear una planta específica",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Se requiere 'query' para buscar o 'perenual_id' para crear directamente",
    });
  } catch (error) {
    console.error("Error creando planta desde Perenual:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// GET /api/integrations/perenual/search-for-db - Busca plantas en Perenual formateadas para BD
router.get("/perenual/search-for-db", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "El término de búsqueda 'q' es requerido",
      });
    }

    const result = await searchAndFormatForDB(q, parseInt(limit));

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error buscando plantas para BD:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// ===== RUTA DE ESTADO DE INTEGRACIONES =====

// GET /api/integrations/status - Estado de todas las integraciones
router.get("/status", async (req, res) => {
  // Verificar conexión de Supabase
  const { testConnection } = await import("../services/supabase.service.js");
  const dbStatus = await testConnection();

  res.status(200).json({
    success: true,
    message: "Estado de las integraciones",
    database: {
      status: dbStatus.connected ? "conectado" : "desconectado",
      message: dbStatus.message || dbStatus.error,
    },
    integrations: {
      perenual: {
        name: "Perenual",
        status: process.env.PERENUAL_API_KEY ? "disponible" : "no configurado",
        endpoints: [
          "GET /api/integrations/perenual/search",
          "GET /api/integrations/perenual/details/:plantId",
          "GET /api/integrations/perenual/species",
          "GET /api/integrations/perenual/families",
          "POST /api/integrations/perenual/identify-health",
          "POST /api/integrations/perenual/identify-multiple",
          "POST /api/integrations/perenual/enrich/:plantId",
          "POST /api/integrations/perenual/create-from-search",
          "GET /api/integrations/perenual/search-for-db",
        ],
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
