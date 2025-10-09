import express from "express";
import AlertHistoryController from "../controllers/alert_history.controller.js";

const router = express.Router();

router.get("/", AlertHistoryController.list);
router.get("/:id", AlertHistoryController.get);
router.post("/", AlertHistoryController.create);
router.put("/:id", AlertHistoryController.update);
router.delete("/:id", AlertHistoryController.remove);

export default router;
