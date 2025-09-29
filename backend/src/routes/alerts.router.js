import express from "express";
import AlertsController from "../controllers/alerts.controller.js";

const router = express.Router();

router.get("/", AlertsController.list);
router.get("/:id", AlertsController.get);
router.post("/", AlertsController.create);
router.put("/:id", AlertsController.update);
router.put("/:id/status", AlertsController.updateStatus);
router.delete("/:id", AlertsController.remove);
router.get("/plant/:plant_id", AlertsController.getByPlant);
router.get("/user/:user_id", AlertsController.getByUser);
router.post("/bulk-status", AlertsController.bulkUpdateStatus);

export default router;
