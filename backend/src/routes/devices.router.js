import express from "express";
import DevicesController from "../controllers/devices.controller.js";

const router = express.Router();

router.get("/", DevicesController.list);
router.get("/:id", DevicesController.get);
router.post("/", DevicesController.create);
router.put("/:id", DevicesController.update);
router.delete("/:id", DevicesController.remove);

export default router;
