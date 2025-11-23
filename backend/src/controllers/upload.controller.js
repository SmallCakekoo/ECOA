import multer from "multer";
import supabase from "../services/supabase.service.js";

// Configurar multer para recibir el archivo en memoria
const storage = multer.memoryStorage();

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});

export const UploadController = {
  // Middleware para subir una imagen
  uploadSingle: upload.single("image"),

  // Endpoint para subir imagen
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No se proporcionó ningún archivo",
        });
      }

      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      // CAMBIO: Incluir la carpeta plants_images/ en la ruta
      const filePath = `plants_images/${fileName}`;

      console.log("📂 Subiendo archivo:", {
        fileName,
        filePath,
        bucketName: "plants_images",
        fileSize: file.size,
        mimeType: file.mimetype,
      });

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from("plants_images")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
          cacheControl: "3600",
        });

      if (error) {
        console.error("❌ Error subiendo a Supabase:", error);
        return res.status(500).json({
          success: false,
          message: "Error al subir la imagen",
          error: error.message,
          details: error,
        });
      }

      console.log("✅ Archivo subido exitosamente a Supabase:", data);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("plants_images")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      console.log("🔗 URL pública generada:", publicUrl);

      return res.status(200).json({
        success: true,
        message: "Imagen subida exitosamente",
        data: {
          filename: fileName,
          originalName: file.originalname,
          size: file.size,
          url: publicUrl,
          fullUrl: publicUrl,
          path: filePath,
        },
      });
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      return res.status(500).json({
        success: false,
        message: "Error al subir la imagen",
        error: error.message,
      });
    }
  },

  // Endpoint para obtener imagen desde Supabase
  getImage: async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = `plants_images/${filename}`;

      // Verificar si el archivo existe
      const { data: files, error: listError } = await supabase.storage
        .from("plants_images")
        .list("plants_images", {
          limit: 1,
          search: filename,
        });

      if (listError) {
        throw listError;
      }

      if (!files || files.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Imagen no encontrada",
        });
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("plants_images")
        .getPublicUrl(filePath);

      return res.status(200).json({
        success: true,
        url: urlData.publicUrl,
      });
    } catch (error) {
      console.error("Error obteniendo imagen:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener la imagen",
        error: error.message,
      });
    }
  },

  // Endpoint para servir imágenes estáticas (mantenido por compatibilidad)
  serveImage: (req, res) => {
    res.status(404).json({
      success: false,
      message: "Las imágenes ahora se sirven desde Supabase",
    });
  },
};

export default UploadController;
