import express from "express";
import PlantsAccessoriesController from "../controllers/plants_accessories.controller.js";

const router = express.Router();

router.get("/", PlantsAccessoriesController.list);
router.get("/:id", PlantsAccessoriesController.get);
router.post("/", PlantsAccessoriesController.create);
router.put("/:id", PlantsAccessoriesController.update);
router.delete("/:id", PlantsAccessoriesController.remove);
router.get("/plant/:plant_id", PlantsAccessoriesController.getByPlant);
router.get(
  "/accessory/:accessory_id",
  PlantsAccessoriesController.getByAccessory
);
router.put("/:id/deactivate", PlantsAccessoriesController.deactivate);

export default router;
