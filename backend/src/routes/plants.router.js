import express from "express";
import { PlantsController } from "../controllers/plants.controller.js";

const router = express.Router();

router.get("/", PlantsController.list);
router.get("/:id", PlantsController.get);
router.post("/", PlantsController.create);
router.put("/:id", PlantsController.update);
router.put("/:id/metrics", PlantsController.updateMetrics);
router.delete("/:id", PlantsController.remove);
router.post("/:id/accessories", PlantsController.assignAccessory);

export default router;
