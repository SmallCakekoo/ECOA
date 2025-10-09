import express from "express";
import PlantStatsController from "../controllers/plant_stats.controller.js";

const router = express.Router();

router.get("/", PlantStatsController.list);
router.get("/:id", PlantStatsController.get);
router.post("/", PlantStatsController.create);
router.put("/:id", PlantStatsController.update);
router.delete("/:id", PlantStatsController.remove);

export default router;
