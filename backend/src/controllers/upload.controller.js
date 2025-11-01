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

      let dataUrl;
      const filename = req.file.originalname || `plant-${Date.now()}.jpg`;

      // Por ahora, convertir a base64 para que el frontend pueda mostrar la imagen
      // NOTA: Si la imagen es muy grande (>500KB), puede causar problemas en Supabase
      // En producción se recomienda usar Supabase Storage para imágenes grandes
      if (req.file.buffer) {
        const maxSize = 500 * 1024; // 500KB máximo recomendado
        
        if (req.file.buffer.length > maxSize) {
          console.warn(`⚠️ Imagen muy grande (${req.file.buffer.length} bytes). Usando placeholder.`);
          // Si es muy grande, usar una URL placeholder pero el frontend verá su imagen en preview
          dataUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop';
        } else {
          const base64Image = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype;
          dataUrl = `data:${mimeType};base64,${base64Image}`;
        }
      } 
      else if (req.file.path) {
        const fs = await import('fs');
        const imageBuffer = fs.readFileSync(req.file.path);
        
        if (imageBuffer.length > 500 * 1024) {
          console.warn(`⚠️ Imagen muy grande (${imageBuffer.length} bytes). Usando placeholder.`);
          dataUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop';
        } else {
          const base64Image = imageBuffer.toString('base64');
          const mimeType = req.file.mimetype;
          dataUrl = `data:${mimeType};base64,${base64Image}`;
        }
      } else {
        console.warn('No se pudo procesar el archivo, usando fallback');
        dataUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop';
      }

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
