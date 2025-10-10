import AlertHistoryDB from "../db/alert_history.db.js";

const AlertHistoryController = {
  // Listar todo el historial de alertas
  async list(req, res) {
    try {
      const { alert_id, plant_id, user_id, action } = req.query;
      const data = await AlertHistoryDB.list({
        alert_id,
        plant_id,
        user_id,
        action,
      });

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener historial de alertas",
        error: error.message,
      });
    }
  },

  // Obtener entrada de historial por ID
  async get(req, res) {
    try {
      const { id } = req.params;
      const data = await AlertHistoryDB.getById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Entrada de historial no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener entrada de historial",
        error: error.message,
      });
    }
  },

  // Crear nueva entrada de historial
  async create(req, res) {
    try {
      const historyData = req.body;
      const data = await AlertHistoryDB.create(historyData);

      // Emitir evento de Socket.IO
      req.io.emit("alert_history_created", {
        type: "alert_history_created",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: "Entrada de historial creada exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear entrada de historial",
        error: error.message,
      });
    }
  },

  // Obtener historial por alerta
  async getByAlert(req, res) {
    try {
      const { alert_id } = req.params;
      const data = await AlertHistoryDB.getByAlert(alert_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener historial de la alerta",
        error: error.message,
      });
    }
  },

  // Obtener historial por planta
  async getByPlant(req, res) {
    try {
      const { plant_id } = req.params;
      const data = await AlertHistoryDB.getByPlant(plant_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener historial de la planta",
        error: error.message,
      });
    }
  },

  // Obtener historial por usuario
  async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const data = await AlertHistoryDB.getByUser(user_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener historial del usuario",
        error: error.message,
      });
    }
  },

  // Obtener estadísticas de alertas
  async getStats(req, res) {
    try {
      const { plant_id, user_id, date_from, date_to } = req.query;
      const data = await AlertHistoryDB.getStats({
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
        message: "Error al obtener estadísticas de alertas",
        error: error.message,
      });
    }
  },

  // Actualizar entrada de historial
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await AlertHistoryDB.update(id, updateData);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Entrada de historial no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io?.emit("alert_history_updated", {
        type: "alert_history_updated",
        data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Entrada de historial actualizada exitosamente",
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar entrada de historial",
        error: error.message,
      });
    }
  },

  // Eliminar entrada de historial
  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await AlertHistoryDB.remove(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Entrada de historial no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io?.emit("alert_history_deleted", {
        type: "alert_history_deleted",
        data: { id },
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Entrada de historial eliminada exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar entrada de historial",
        error: error.message,
      });
    }
  },
};

export default AlertHistoryController;
