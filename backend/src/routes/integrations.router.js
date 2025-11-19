// Rutas para las integraciones externas
// Weather API

import express from "express";
import {
  getCurrentWeather,
  getGreetingByTime,
} from "../services/integrations/weather.service.js";

const router = express.Router();

// ===== RUTAS DE WEATHER API =====

// GET /api/integrations/weather - Obtener clima actual
router.get("/weather", async (req, res) => {
  try {
    const { city = "Cali", country = "CO" } = req.query;

    const result = await getCurrentWeather(city, country);

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

// GET /api/integrations/weather/greeting - Obtener saludo según la hora
router.get("/weather/greeting", async (req, res) => {
  try {
    const hour = req.query.hour ? parseInt(req.query.hour) : null;
    const greeting = getGreetingByTime(hour);

    res.status(200).json({
      success: true,
      greeting,
      hour: hour !== null ? hour : new Date().getHours(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error obteniendo saludo:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// GET /api/integrations/weather/combined - Obtener clima y saludo juntos
router.get("/weather/combined", async (req, res) => {
  try {
    const { city = "Cali", country = "CO" } = req.query;

    const [weatherResult, greeting] = await Promise.all([
      getCurrentWeather(city, country),
      Promise.resolve(getGreetingByTime()),
    ]);

    res.status(200).json({
      success: weatherResult.success,
      weather: weatherResult.success
        ? {
            temperature: weatherResult.temperature,
            description: weatherResult.description,
            city: weatherResult.city,
            country: weatherResult.country,
            humidity: weatherResult.humidity,
            icon: weatherResult.icon,
          }
        : null,
      greeting,
      error: weatherResult.error || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error obteniendo clima y saludo:", error);
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
      weather: {
        name: "Weather API",
        status: "disponible",
        endpoints: [
          "GET /api/integrations/weather",
          "GET /api/integrations/weather/greeting",
          "GET /api/integrations/weather/combined",
        ],
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
