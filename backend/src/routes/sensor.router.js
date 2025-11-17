import express from "express";
import SensorController from "../controllers/sensor.controller.js";

const router = express.Router();

// POST /sensor-data - Recibe datos de sensores de la Raspberry Pi
router.post("/sensor-data", SensorController.receiveSensorData);

// GET /emoji - Obtiene la matriz 8x8 del emoji actual
router.get("/emoji", SensorController.getEmoji);

export default router;

