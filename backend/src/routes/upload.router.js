import express from "express";
import { UploadController } from "../controllers/upload.controller.js";

const router = express.Router();

// Ruta para subir imagen
router.post("/image", UploadController.uploadSingle, UploadController.uploadImage);

// Ruta para eliminar imagen
router.delete("/image", UploadController.deleteImage);

// Ruta para servir imágenes estáticas
router.get("/plants/:filename", UploadController.serveImage);

export default router;
