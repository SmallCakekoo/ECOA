import AlertsDB from "../db/alerts.db.js";

const AlertsController = {
  // Listar todas las alertas
  async list(req, res) {
    try {
      const { plant_id, user_id, status, alert_type } = req.query;
      const data = await AlertsDB.list({
        plant_id,
        user_id,
        status,
        alert_type,
      });

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener alertas",
        error: error.message,
      });
    }
  },

  // Obtener alerta por ID
  async get(req, res) {
    try {
      const { id } = req.params;
      const data = await AlertsDB.getById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Alerta no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener alerta",
        error: error.message,
      });
    }
  },

  // Crear nueva alerta
  async create(req, res) {
    try {
      const alertData = req.body;
      const data = await AlertsDB.create(alertData);

      // Emitir evento de Socket.IO
      req.io.emit("alert_created", {
        type: "alert_created",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: "Alerta creada exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear alerta",
        error: error.message,
      });
    }
  },

  // Actualizar alerta
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await AlertsDB.update(id, updateData);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Alerta no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("alert_updated", {
        type: "alert_updated",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Alerta actualizada exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar alerta",
        error: error.message,
      });
    }
  },

  // Actualizar estado de alerta
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const data = await AlertsDB.updateStatus(id, status);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Alerta no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("alert_status_updated", {
        type: "alert_status_updated",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Estado de alerta actualizado exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar estado de alerta",
        error: error.message,
      });
    }
  },

  // Eliminar alerta
  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await AlertsDB.remove(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Alerta no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("alert_deleted", {
        type: "alert_deleted",
        data: { id: id },
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Alerta eliminada exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar alerta",
        error: error.message,
      });
    }
  },

  // Obtener alertas por planta
  async getByPlant(req, res) {
    try {
      const { plant_id } = req.params;
      const { status } = req.query;
      const data = await AlertsDB.getByPlant(plant_id, status);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener alertas de la planta",
        error: error.message,
      });
    }
  },

  // Obtener alertas por usuario
  async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const { status } = req.query;
      const data = await AlertsDB.getByUser(user_id, status);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener alertas del usuario",
        error: error.message,
      });
    }
  },

  // Actualizar estado de múltiples alertas
  async bulkUpdateStatus(req, res) {
    try {
      const { alert_ids, status } = req.body;
      const data = await AlertsDB.bulkUpdateStatus(alert_ids, status);

      // Emitir evento de Socket.IO
      req.io.emit("alerts_bulk_updated", {
        type: "alerts_bulk_updated",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: `${data.length} alertas actualizadas exitosamente`,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar alertas",
        error: error.message,
      });
    }
  },
};

export default AlertsController;

