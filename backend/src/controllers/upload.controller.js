import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subir archivos
// En Vercel (serverless) no se puede escribir a disco; usar memoria
const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
const storage = isServerless
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/plants');
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `plant-${uniqueSuffix}${ext}`);
      },
    });

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

export const UploadController = {
  // Middleware para subir una imagen
  uploadSingle: upload.single('image'),

  // Endpoint para subir imagen
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      // Convertir la imagen a base64 para guardarla en la BD
      // Esto funciona tanto en serverless como en local
      const imageBuffer = req.file.buffer;
      const base64Image = imageBuffer.toString('base64');
      const mimeType = req.file.mimetype;
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      const filename = req.file.originalname || `plant-${Date.now()}.jpg`;

      return res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: dataUrl,
          fullUrl: dataUrl,
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al subir la imagen',
        error: error.message
      });
    }
  },

  // Endpoint para servir imágenes estáticas
  serveImage: (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../../uploads/plants', filename);
    
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error serving image:', err);
        res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }
    });
  }
};

export default UploadController;
