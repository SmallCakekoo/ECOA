import express from "express";
import DonationsController from "../controllers/donations.controller.js";

const router = express.Router();

router.get("/", DonationsController.list);
router.get("/:id", DonationsController.get);
router.post("/", DonationsController.create);
router.put("/:id", DonationsController.update);
router.delete("/:id", DonationsController.remove);

export default router;
