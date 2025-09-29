import express from "express";
import PlantMessagesController from "../controllers/plant_messages.controller.js";

const router = express.Router();

router.get("/", PlantMessagesController.list);
router.get("/:id", PlantMessagesController.get);
router.post("/", PlantMessagesController.create);
router.put("/:id", PlantMessagesController.update);
router.delete("/:id", PlantMessagesController.remove);
router.get("/plant/:plant_id", PlantMessagesController.getByPlant);
router.get("/user/:user_id", PlantMessagesController.getByUser);
router.put("/:id/read", PlantMessagesController.markAsRead);
router.put("/read", PlantMessagesController.markMultipleAsRead);
router.get("/user/:user_id/unread", PlantMessagesController.getUnreadByUser);
router.get("/stats", PlantMessagesController.getStats);

export default router;
