import express from "express";
import DonationsController from "../controllers/donations.controller.js";

const router = express.Router();

router.get("/", DonationsController.list);
router.get("/:id", DonationsController.get);
router.post("/", DonationsController.create);
router.put("/:id", DonationsController.update);
router.put("/:id/status", DonationsController.updateStatus);
router.delete("/:id", DonationsController.remove);
router.get("/user/:user_id", DonationsController.getByUser);
router.get("/plant/:plant_id", DonationsController.getByPlant);

export default router;
