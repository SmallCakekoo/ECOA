import express from "express";
import UsersController from "../controllers/users.controller.js";

const router = express.Router();

// Middleware para manejar OPTIONS requests
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

router.get("/", UsersController.list);
router.get("/:id", UsersController.get);
router.post("/", UsersController.create);
router.post("/signup", UsersController.signup);
router.post("/login", UsersController.login);
router.put("/:id", UsersController.update);
router.delete("/:id", UsersController.remove);
router.get("/:id/plants", UsersController.listPlants);

export default router;
