import express from "express";
import FoundationsController from "../controllers/foundations.controller.js";

const router = express.Router();

router.get("/", FoundationsController.list);
router.get("/:id", FoundationsController.get);
router.post("/", FoundationsController.create);
router.put("/:id", FoundationsController.update);
router.delete("/:id", FoundationsController.remove);

export default router;
