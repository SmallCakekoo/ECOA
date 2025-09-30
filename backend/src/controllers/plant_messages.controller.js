import PlantMessagesDB from "../db/plant_messages.db.js";

const PlantMessagesController = {
  // Listar todos los mensajes
  async list(req, res) {
    try {
      const { plant_id, user_id, message_type, sender_type, read } = req.query;
      const data = await PlantMessagesDB.list({
        plant_id,
        user_id,
        message_type,
        sender_type,
        read,
      });

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener mensajes",
        error: error.message,
      });
    }
  },

  // Obtener mensaje por ID
  async get(req, res) {
    try {
      const { id } = req.params;
      const data = await PlantMessagesDB.getById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Mensaje no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener mensaje",
        error: error.message,
      });
    }
  },

  // Crear nuevo mensaje
  async create(req, res) {
    try {
      const messageData = req.body;
      const data = await PlantMessagesDB.create(messageData);

      // Emitir evento de Socket.IO
      req.io.emit("plant_message_created", {
        type: "plant_message_created",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: "Mensaje creado exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear mensaje",
        error: error.message,
      });
    }
  },

  // Actualizar mensaje
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await PlantMessagesDB.update(id, updateData);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Mensaje no encontrado",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("plant_message_updated", {
        type: "plant_message_updated",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Mensaje actualizado exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar mensaje",
        error: error.message,
      });
    }
  },

  // Eliminar mensaje
  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await PlantMessagesDB.remove(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Mensaje no encontrado",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("plant_message_deleted", {
        type: "plant_message_deleted",
        data: { id: id },
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Mensaje eliminado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar mensaje",
        error: error.message,
      });
    }
  },

  // Obtener mensajes por planta
  async getByPlant(req, res) {
    try {
      const { plant_id } = req.params;
      const data = await PlantMessagesDB.getByPlant(plant_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener mensajes de la planta",
        error: error.message,
      });
    }
  },

  // Obtener mensajes por usuario
  async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const data = await PlantMessagesDB.getByUser(user_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener mensajes del usuario",
        error: error.message,
      });
    }
  },

  // Marcar mensaje como leído
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const data = await PlantMessagesDB.markAsRead(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Mensaje no encontrado",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("plant_message_read", {
        type: "plant_message_read",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Mensaje marcado como leído",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al marcar mensaje como leído",
        error: error.message,
      });
    }
  },

  // Marcar múltiples mensajes como leídos
  async markMultipleAsRead(req, res) {
    try {
      const { ids } = req.body;
      const data = await PlantMessagesDB.markMultipleAsRead(ids);

      // Emitir evento de Socket.IO
      req.io.emit("plant_messages_read", {
        type: "plant_messages_read",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: `${data.length} mensajes marcados como leídos`,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al marcar mensajes como leídos",
        error: error.message,
      });
    }
  },

  // Obtener mensajes no leídos por usuario
  async getUnreadByUser(req, res) {
    try {
      const { user_id } = req.params;
      const data = await PlantMessagesDB.getUnreadByUser(user_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener mensajes no leídos",
        error: error.message,
      });
    }
  },

  // Obtener estadísticas de mensajes
  async getStats(req, res) {
    try {
      const { plant_id, user_id, date_from, date_to } = req.query;
      const data = await PlantMessagesDB.getStats({
        plant_id,
        user_id,
        date_from,
        date_to,
      });

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener estadísticas de mensajes",
        error: error.message,
      });
    }
  },
};

export default PlantMessagesController;
