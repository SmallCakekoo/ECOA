// Configuración de Socket.IO para ECOA
// Manejo de eventos en tiempo real para usuarios y plantas

import { Server } from "socket.io";

/**
 * Configura y maneja los eventos de Socket.IO
 * @param {Server} io - Instancia de Socket.IO Server
 */
export function setupSocketIO(io) {
  console.log("🔌 Configurando Socket.IO...");

  // Evento de conexión
  io.on("connection", (socket) => {
    console.log(`✅ Nuevo cliente conectado: ${socket.id}`);

    // Eventos de salas de usuario
    socket.on("join_user_room", (userId) => {
      if (!userId) {
        socket.emit("error", {
          type: "validation_error",
          message: "ID de usuario requerido",
        });
        return;
      }

      socket.join(`user_${userId}`);
      console.log(
        `👤 Cliente ${socket.id} se unió a la sala del usuario ${userId}`
      );

      socket.emit("joined_room", {
        type: "user_room",
        room: `user_${userId}`,
        message: "Te has unido a la sala de tu usuario",
      });
    });

    // Eventos de salas de planta
    socket.on("join_plant_room", (plantId) => {
      if (!plantId) {
        socket.emit("error", {
          type: "validation_error",
          message: "ID de planta requerido",
        });
        return;
      }

      socket.join(`plant_${plantId}`);
      console.log(
        `🌱 Cliente ${socket.id} se unió a la sala de la planta ${plantId}`
      );

      socket.emit("joined_room", {
        type: "plant_room",
        room: `plant_${plantId}`,
        message: "Te has unido a la sala de la planta",
      });
    });

    // Eventos de salas generales
    socket.on("join_general_room", () => {
      socket.join("general");
      console.log(`🌍 Cliente ${socket.id} se unió a la sala general`);

      socket.emit("joined_room", {
        type: "general_room",
        room: "general",
        message: "Te has unido a la sala general de ECOA",
      });
    });

    // Eventos de salas de notificaciones
    socket.on("join_notifications_room", (userId) => {
      if (!userId) {
        socket.emit("error", {
          type: "validation_error",
          message: "ID de usuario requerido para notificaciones",
        });
        return;
      }

      socket.join(`notifications_${userId}`);
      console.log(
        `🔔 Cliente ${socket.id} se unió a las notificaciones del usuario ${userId}`
      );

      socket.emit("joined_room", {
        type: "notifications_room",
        room: `notifications_${userId}`,
        message: "Te has unido a las notificaciones",
      });
    });

    // Eventos de salas de alertas
    socket.on("join_alerts_room", (userId) => {
      if (!userId) {
        socket.emit("error", {
          type: "validation_error",
          message: "ID de usuario requerido para alertas",
        });
        return;
      }

      socket.join(`alerts_${userId}`);
      console.log(
        `⚠️ Cliente ${socket.id} se unió a las alertas del usuario ${userId}`
      );

      socket.emit("joined_room", {
        type: "alerts_room",
        room: `alerts_${userId}`,
        message: "Te has unido a las alertas",
      });
    });

    // Eventos de ping/pong para mantener la conexión
    socket.on("ping", () => {
      socket.emit("pong", {
        timestamp: new Date().toISOString(),
        message: "Conexión activa",
      });
    });

    // Eventos de estado de la planta
    socket.on("request_plant_status", (plantId) => {
      if (!plantId) {
        socket.emit("error", {
          type: "validation_error",
          message: "ID de planta requerido",
        });
        return;
      }

      // Emitir a la sala de la planta específica
      socket.to(`plant_${plantId}`).emit("plant_status_requested", {
        type: "status_request",
        plantId: plantId,
        requestedBy: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Eventos de métricas de plantas
    socket.on("plant_metrics_update", (data) => {
      const { plantId, metrics } = data;

      if (!plantId || !metrics) {
        socket.emit("error", {
          type: "validation_error",
          message: "ID de planta y métricas requeridos",
        });
        return;
      }

      // Emitir actualización a la sala de la planta
      socket.to(`plant_${plantId}`).emit("plant_metrics_updated", {
        type: "metrics_update",
        plantId: plantId,
        metrics: metrics,
        timestamp: new Date().toISOString(),
      });
    });

    // Eventos de notificaciones personalizadas
    socket.on("send_notification", (data) => {
      const { userId, message, type = "info" } = data;

      if (!userId || !message) {
        socket.emit("error", {
          type: "validation_error",
          message: "ID de usuario y mensaje requeridos",
        });
        return;
      }

      // Emitir notificación a la sala del usuario
      socket.to(`notifications_${userId}`).emit("notification_received", {
        type: "notification",
        notificationType: type,
        message: message,
        timestamp: new Date().toISOString(),
      });
    });

    // Eventos de alertas de plantas
    socket.on("plant_alert", (data) => {
      const { plantId, alertType, message, severity = "medium" } = data;

      if (!plantId || !alertType || !message) {
        socket.emit("error", {
          type: "validation_error",
          message: "ID de planta, tipo de alerta y mensaje requeridos",
        });
        return;
      }

      // Emitir alerta a la sala de la planta y sala general
      socket.to(`plant_${plantId}`).emit("plant_alert_received", {
        type: "plant_alert",
        plantId: plantId,
        alertType: alertType,
        message: message,
        severity: severity,
        timestamp: new Date().toISOString(),
      });

      // También emitir a la sala general para alertas críticas
      if (severity === "high" || severity === "critical") {
        socket.to("general").emit("critical_plant_alert", {
          type: "critical_alert",
          plantId: plantId,
          alertType: alertType,
          message: message,
          severity: severity,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Eventos de chat en tiempo real (opcional)
    socket.on("send_message", (data) => {
      const { room, message, senderId, senderName } = data;

      if (!room || !message || !senderId) {
        socket.emit("error", {
          type: "validation_error",
          message: "Sala, mensaje y ID del remitente requeridos",
        });
        return;
      }

      // Emitir mensaje a la sala especificada
      socket.to(room).emit("message_received", {
        type: "chat_message",
        room: room,
        message: message,
        senderId: senderId,
        senderName: senderName || "Usuario anónimo",
        timestamp: new Date().toISOString(),
      });
    });

    // Eventos de desconexión
    socket.on("disconnect", (reason) => {
      console.log(`❌ Cliente ${socket.id} desconectado: ${reason}`);

      // Emitir evento de desconexión a las salas relevantes
      socket.broadcast.emit("user_disconnected", {
        type: "disconnection",
        socketId: socket.id,
        reason: reason,
        timestamp: new Date().toISOString(),
      });
    });

    // Eventos de error
    socket.on("error", (error) => {
      console.error(`❌ Error en socket ${socket.id}:`, error);
      socket.emit("socket_error", {
        type: "socket_error",
        message: "Ha ocurrido un error en la conexión",
        error: error.message || "Error desconocido",
        timestamp: new Date().toISOString(),
      });
    });
  });

  // Funciones auxiliares para emitir eventos desde las rutas
  return {
    // Emitir evento de usuario creado
    emitUserCreated: (userData) => {
      io.emit("user_created", {
        type: "user_created",
        data: userData,
        timestamp: new Date().toISOString(),
      });

      // Emitir también a la sala del usuario específico
      io.to(`user_${userData.id}`).emit("user_profile_created", {
        type: "profile_created",
        data: userData,
        timestamp: new Date().toISOString(),
      });
    },

    // Emitir evento de usuario actualizado
    emitUserUpdated: (userData) => {
      io.emit("user_updated", {
        type: "user_updated",
        data: userData,
        timestamp: new Date().toISOString(),
      });

      // Emitir también a la sala del usuario específico
      io.to(`user_${userData.id}`).emit("user_profile_updated", {
        type: "profile_updated",
        data: userData,
        timestamp: new Date().toISOString(),
      });
    },

    // Emitir evento de usuario eliminado
    emitUserDeleted: (userId) => {
      io.emit("user_deleted", {
        type: "user_deleted",
        data: { id: userId },
        timestamp: new Date().toISOString(),
      });
    },

    // Emitir evento de planta creada
    emitPlantCreated: (plantData) => {
      io.emit("plant_created", {
        type: "plant_created",
        data: plantData,
        timestamp: new Date().toISOString(),
      });

      // Emitir también a la sala del usuario propietario
      io.to(`user_${plantData.user_id}`).emit("user_plant_created", {
        type: "user_plant_created",
        data: plantData,
        timestamp: new Date().toISOString(),
      });

      // Emitir también a la sala de la planta específica
      io.to(`plant_${plantData.id}`).emit("plant_profile_created", {
        type: "plant_profile_created",
        data: plantData,
        timestamp: new Date().toISOString(),
      });
    },

    // Emitir evento de planta actualizada
    emitPlantUpdated: (plantData) => {
      io.emit("plant_updated", {
        type: "plant_updated",
        data: plantData,
        timestamp: new Date().toISOString(),
      });

      // Emitir también a la sala del usuario propietario
      io.to(`user_${plantData.user_id}`).emit("user_plant_updated", {
        type: "user_plant_updated",
        data: plantData,
        timestamp: new Date().toISOString(),
      });

      // Emitir también a la sala de la planta específica
      io.to(`plant_${plantData.id}`).emit("plant_profile_updated", {
        type: "plant_profile_updated",
        data: plantData,
        timestamp: new Date().toISOString(),
      });
    },

    // Emitir evento de planta eliminada
    emitPlantDeleted: (plantId, userId) => {
      io.emit("plant_deleted", {
        type: "plant_deleted",
        data: { id: plantId },
        timestamp: new Date().toISOString(),
      });

      // Emitir también a la sala del usuario propietario
      if (userId) {
        io.to(`user_${userId}`).emit("user_plant_deleted", {
          type: "user_plant_deleted",
          data: { id: plantId },
          timestamp: new Date().toISOString(),
        });
      }
    },

    // Emitir evento de métricas de planta actualizadas
    emitPlantMetricsUpdated: (plantData) => {
      io.emit("plant_metrics_updated", {
        type: "plant_metrics_updated",
        data: plantData,
        timestamp: new Date().toISOString(),
      });

      // Emitir también a la sala de la planta específica
      io.to(`plant_${plantData.id}`).emit("plant_metrics_changed", {
        type: "metrics_changed",
        data: plantData,
        timestamp: new Date().toISOString(),
      });
    },

    // Emitir notificación general
    emitNotification: (userId, message, type = "info") => {
      io.to(`notifications_${userId}`).emit("notification_received", {
        type: "notification",
        notificationType: type,
        message: message,
        timestamp: new Date().toISOString(),
      });
    },

    // Emitir alerta de planta
    emitPlantAlert: (plantId, alertType, message, severity = "medium") => {
      io.to(`plant_${plantId}`).emit("plant_alert_received", {
        type: "plant_alert",
        plantId: plantId,
        alertType: alertType,
        message: message,
        severity: severity,
        timestamp: new Date().toISOString(),
      });
    },
  };
}
