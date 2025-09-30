import express from "express";
import AccessoriesController from "../controllers/accessories.controller.js";

const router = express.Router();

router.get("/", AccessoriesController.list);
router.get("/:id", AccessoriesController.get);
router.post("/", AccessoriesController.create);
router.put("/:id", AccessoriesController.update);
router.delete("/:id", AccessoriesController.remove);
router.get("/categories", AccessoriesController.getCategories);
router.get("/plant/:plant_id", AccessoriesController.getByPlant);
router.delete(
  "/plant/:plant_id/:accessory_id",
  AccessoriesController.unassignFromPlant
);

export default router;
