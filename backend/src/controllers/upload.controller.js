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

// Función auxiliar para extraer el path de una URL de Supabase
function extractPathFromUrl(url) {
  if (!url) return null;
  
  // Si es Base64, no es una URL de Storage
  if (url.startsWith("data:")) {
    return null;
  }
  
  // Si es una URL completa de Supabase Storage
  // Formato: https://[project].supabase.co/storage/v1/object/public/plants_images/[filename]
  const supabaseUrlMatch = url.match(/\/storage\/v1\/object\/public\/plants_images\/(.+?)(?:\?|$)/);
  if (supabaseUrlMatch) {
    return `plants_images/${supabaseUrlMatch[1]}`;
  }
  
  // Si ya es un path relativo
  if (url.startsWith("plants_images/")) {
    return url;
  }
  
  // Intentar extraer el filename si la URL contiene el nombre del archivo
  // Último recurso: buscar el patrón de nombre de archivo
  const filenameMatch = url.match(/([^\/]+\.(png|jpg|jpeg|gif|webp))(?:\?|$)/i);
  if (filenameMatch) {
    return `plants_images/${filenameMatch[1]}`;
  }
  
  return null;
}

// Función para eliminar una imagen antigua de Supabase Storage
async function deleteOldImage(imageUrl) {
  if (!imageUrl) return;
  
  try {
    // Si es Base64, no hay nada que eliminar
    if (imageUrl.startsWith("data:")) {
      console.log("ℹ️ Imagen es Base64, no se elimina de Storage");
      return;
    }
    
    const filePath = extractPathFromUrl(imageUrl);
    if (!filePath) {
      console.log("⚠️ No se pudo extraer el path de la URL:", imageUrl);
      return;
    }
    
    console.log("🗑️ Eliminando imagen antigua:", filePath);
    const { error } = await supabase.storage
      .from("plants_images")
      .remove([filePath]);
    
    if (error) {
      console.error("❌ Error eliminando imagen antigua:", error);
      // No lanzar error, solo loguear - la imagen nueva ya se subió
    } else {
      console.log("✅ Imagen antigua eliminada exitosamente");
    }
  } catch (error) {
    console.error("❌ Error en deleteOldImage:", error);
    // No lanzar error, solo loguear
  }
}

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
      // Siempre usar PNG para preservar transparencia
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.png`;
      const filePath = `plants_images/${fileName}`;
      
      // Si hay una imagen antigua que reemplazar (viene en el body)
      const oldImageUrl = req.body.oldImageUrl;
      if (oldImageUrl) {
        await deleteOldImage(oldImageUrl);
      }

      console.log("📂 Subiendo archivo:", {
        fileName,
        filePath,
        bucketName: "plants_images",
        fileSize: file.size,
        mimeType: file.mimetype,
        oldImageUrl: oldImageUrl || "none",
      });

      // Determinar content type - preferir PNG para transparencia
      let contentType = file.mimetype;
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        // Si el frontend ya lo convirtió a PNG, usar PNG
        contentType = "image/png";
      }

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from("plants_images")
        .upload(filePath, file.buffer, {
          contentType: contentType,
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
        .list("", {
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
  
  // Endpoint para eliminar una imagen
  deleteImage: async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "No se proporcionó la URL de la imagen a eliminar",
        });
      }
      
      await deleteOldImage(imageUrl);
      
      return res.status(200).json({
        success: true,
        message: "Imagen eliminada exitosamente",
      });
    } catch (error) {
      console.error("❌ Error deleting image:", error);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar la imagen",
        error: error.message,
      });
    }
  },
};

// Exportar función auxiliar para uso en otros controladores
export { deleteOldImage };

export default UploadController;
