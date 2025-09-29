import express from "express";
import AlertHistoryController from "../controllers/alert_history.controller.js";

const router = express.Router();

router.get("/", AlertHistoryController.list);
router.get("/:id", AlertHistoryController.get);
router.post("/", AlertHistoryController.create);
router.get("/alert/:alert_id", AlertHistoryController.getByAlert);
router.get("/plant/:plant_id", AlertHistoryController.getByPlant);
router.get("/user/:user_id", AlertHistoryController.getByUser);
router.get("/stats", AlertHistoryController.getStats);

export default router;
