import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear directorio de uploads si no existe
    const uploadDir = path.join(__dirname, '../../uploads/plants');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `plant-${uniqueSuffix}${ext}`);
  }
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

      // Generar URL pública para la imagen
      const imageUrl = `/uploads/plants/${req.file.filename}`;
      
      return res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: imageUrl,
          fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
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
