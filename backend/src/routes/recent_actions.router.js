import express from "express";
import RecentActionsController from "../controllers/recent_actions.controller.js";

const router = express.Router();

router.get("/", RecentActionsController.list);
router.get("/:id", RecentActionsController.get);
router.post("/", RecentActionsController.create);
router.get("/admin/:admin_id", RecentActionsController.getByAdmin);
router.get("/plant/:plant_id", RecentActionsController.getByPlant);
router.get("/type/:action_type", RecentActionsController.getByActionType);
router.get("/stats", RecentActionsController.getStats);
router.get(
  "/admin/:admin_id/recent",
  RecentActionsController.getRecentActivity
);
router.delete("/cleanup", RecentActionsController.cleanupOldActions);

export default router;
