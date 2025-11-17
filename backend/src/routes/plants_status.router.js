import express from "express";
import PlantStatusController from "../controllers/plant_status.controller.js";

const router = express.Router();

router.get("/", PlantStatusController.list);
router.get("/plant/:plant_id/latest", PlantStatusController.getLatestByPlant);
router.get("/:id", PlantStatusController.get);
router.post("/", PlantStatusController.create);
router.put("/:id", PlantStatusController.update);
router.delete("/:id", PlantStatusController.remove);

export default router;
