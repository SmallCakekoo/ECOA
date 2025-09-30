import express from "express";
import AchievementsController from "../controllers/achievements.controller.js";

const router = express.Router();

router.get("/", AchievementsController.list);
router.get("/:id", AchievementsController.get);
router.post("/", AchievementsController.create);
router.put("/:id", AchievementsController.update);
router.delete("/:id", AchievementsController.remove);
router.get("/user/:user_id", AchievementsController.listByUser);
router.post("/assign", AchievementsController.assign);
router.get("/categories", AchievementsController.list);

export default router;
