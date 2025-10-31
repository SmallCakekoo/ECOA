import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import usersRoutes from "./routes/users.router.js";
import plantsRoutes from "./routes/plants.router.js";
import donationsRoutes from "./routes/donations.router.js";
import accessoriesRoutes from "./routes/accessories.router.js";
import foundationsRoutes from "./routes/foundations.router.js";
import plantsAccessoriesRoutes from "./routes/plants_accessories.router.js";
import alertHistoryRoutes from "./routes/alert_history.router.js";
import devicesRoutes from "./routes/devices.router.js";
import plantStatsRoutes from "./routes/plants_stats.router.js";
import plantStatusRoutes from "./routes/plants_status.router.js";
import integrationsRoutes from "./routes/integrations.router.js";
import uploadRoutes from "./routes/upload.router.js";
import { setupSocketIO } from "./services/sockets/sockets.service.js";

const app = express();

// Middleware CORS más agresivo para Vercel
app.use((req, res, next) => {
  // Headers CORS obligatorios - DEBE ir primero
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Preflight request recibido:', req.method, req.url, 'Origin:', req.headers.origin);
    res.status(200).end();
    return;
  }
  
  next();
});

// Configurar CORS con cors package como respaldo
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));

// Servidor y Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Configurar Socket.IO
const socketHandlers = setupSocketIO(io);

// Middleware para pasar io y handlers a las rutas
app.use((req, res, next) => {
  req.io = io;
  req.socketHandlers = socketHandlers;
  next();
});

// Middleware CORS específico para cada ruta
app.use("/users", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use("/plants", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use("/donations", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Montar rutas
app.use("/users", usersRoutes);
app.use("/plants", plantsRoutes);
app.use("/donations", donationsRoutes);
app.use("/accessories", accessoriesRoutes);
app.use("/foundations", foundationsRoutes);
app.use("/plants_accessories", plantsAccessoriesRoutes);
app.use("/alert_history", alertHistoryRoutes);
app.use("/devices", devicesRoutes);
app.use("/plant_stats", plantStatsRoutes);
app.use("/plant_status", plantStatusRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/upload", uploadRoutes);

// Ruta de salud del servidor
app.get("/health", (req, res) => {
  // Forzar headers CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  res.status(200).json({
    success: true,
    message: "Servidor ECOA funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Endpoint de prueba CORS específico
app.get("/test-cors", (req, res) => {
  // Forzar headers CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  res.status(200).json({
    success: true,
    message: "CORS funcionando correctamente",
    timestamp: new Date().toISOString(),
    cors: "enabled"
  });
});

// Endpoint de login de prueba
app.post("/test-login", (req, res) => {
  // Forzar headers CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email es requerido"
    });
  }
  
  res.status(200).json({
    success: true,
    message: "Login de prueba exitoso",
    data: {
      user: {
        id: 1,
        email: email,
        role: 'admin'
      },
      token: 'test-token-123'
    }
  });
});

// Endpoint para subir imágenes
app.post("/api/upload/image", (req, res) => {
  // Forzar headers CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  try {
    // Simulación compatible con el controlador real: devolver la misma estructura
    const filename = `plant-${Date.now()}.jpg`;
    const url = `/uploads/plants/${filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${url}`;

    res.status(200).json({
      success: true,
      message: "Imagen subida exitosamente",
      data: {
        filename,
        url,
        fullUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error subiendo imagen",
      error: error.message
    });
  }
});

// Endpoint para buscar imágenes de plantas
app.get("/api/integrations/perenual/search", async (req, res) => {
  // Forzar headers CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Query parameter 'q' is required"
    });
  }
  
  try {
    // Simular respuesta de Perenual API con imágenes reales
    const mockImages = {
      'ficus lyrata': {
        default_image: {
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
          small_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
          medium_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop'
        }
      },
      'monstera deliciosa': {
        default_image: {
          thumbnail: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=150&h=150&fit=crop',
          small_url: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=300&h=300&fit=crop',
          medium_url: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=600&h=600&fit=crop'
        }
      },
      'luna': {
        default_image: {
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
          small_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
          medium_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop'
        }
      },
      'sol': {
        default_image: {
          thumbnail: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=150&h=150&fit=crop',
          small_url: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=300&h=300&fit=crop',
          medium_url: 'https://images.unsplash.com/photo-1519336056116-9e61c7f83ab8?w=600&h=600&fit=crop'
        }
      }
    };
    
    const searchTerm = q.toLowerCase();
    const plantData = mockImages[searchTerm];
    
    if (plantData) {
      res.status(200).json({
        success: true,
        search_results: {
          plants: [plantData]
        }
      });
    } else {
      res.status(200).json({
        success: true,
        search_results: {
          plants: []
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching for plant images",
      error: error.message
    });
  }
});

// Ruta raíz
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API ECOA - Backend con Express, Supabase y Socket.IO",
    version: "1.0.0",
    endpoints: {
      users: "/users",
      plants: "/plants",
      donations: "/donations",
      accessories: "/accessories",
      foundations: "/foundations",
      plants_accessories: "/plants_accessories",
      alert_history: "/alert_history",
      devices: "/devices",
      plant_stats: "/plant_stats",
      plant_status: "/plant_status",
      integrations: "/api/integrations",
      health: "/health",
    },
  });
});

// Manejo de rutas no encontradas
app.use("/", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error:
      process.env.NODE_ENV === "development" ? err.message : "Error interno",
  });
});

// Las conexiones de Socket.IO se manejan en setupSocketIO

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor ECOA corriendo en puerto ${PORT}`);
  console.log(`📡 Socket.IO habilitado`);
  console.log(`🌱 API disponible en: http://localhost:${PORT}`);
});
