import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { Server } from "socket.io";

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
import { setupSocketIO } from "./services/sockets/sockets.service.js";

const app = express();

// Middleware
app.use(express.json());

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
app.use("/integrations", integrationsRoutes);

// Ruta de salud del servidor
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Servidor ECOA funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
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
      integrations: "/integrations",
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
