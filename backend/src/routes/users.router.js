import express from "express";
import UsersController from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", UsersController.list);
router.get("/:id", UsersController.get);
router.post("/", UsersController.create);
router.put("/:id", UsersController.update);
router.delete("/:id", UsersController.remove);
router.get("/:id/plants", UsersController.listPlants);

export default router;
