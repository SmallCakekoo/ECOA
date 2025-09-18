import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import usersRoutes from "./routes/users.js";
import plantsRoutes from "./routes/plants.js";
import donationsRoutes from "./routes/donations.js";
import accessoriesRoutes from "./routes/accessories.js";
import achievementsRoutes from "./routes/achievements.js";
import alertsRoutes from "./routes/alerts.js";

const app = express();

// Middleware
app.use(express.json());

// Servidor y Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware para pasar io a las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Montar rutas
app.use("/users", usersRoutes);
app.use("/plants", plantsRoutes);
app.use("/donations", donationsRoutes);
app.use("/accessories", accessoriesRoutes);
app.use("/achievements", achievementsRoutes);
app.use("/alerts", alertsRoutes);

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
      achievements: "/achievements",
      alerts: "/alerts",
      health: "/health",
    },
  });
});

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
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

// Socket.IO - Conexiones
io.on("connection", (socket) => {
  console.log(`Nuevo cliente conectado: ${socket.id}`);

  // Unirse a sala de usuario específico
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Cliente ${socket.id} se unió a la sala del usuario ${userId}`);
  });

  // Unirse a sala de planta específica
  socket.on("join_plant_room", (plantId) => {
    socket.join(`plant_${plantId}`);
    console.log(
      `Cliente ${socket.id} se unió a la sala de la planta ${plantId}`
    );
  });

  // Desconexión
  socket.on("disconnect", (reason) => {
    console.log(`Cliente ${socket.id} desconectado: ${reason}`);
  });

  // Eventos personalizados del cliente
  socket.on("ping", () => {
    socket.emit("pong", { timestamp: new Date().toISOString() });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor ECOA corriendo en puerto ${PORT}`);
  console.log(`📡 Socket.IO habilitado`);
  console.log(`🌱 API disponible en: http://localhost:${PORT}`);
});
