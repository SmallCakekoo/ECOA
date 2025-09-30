import RecentActionsDB from "../db/recent_actions.db.js";

const RecentActionsController = {
  // Listar todas las acciones recientes
  async list(req, res) {
    try {
      const { admin_id, plant_id, action_type, limit } = req.query;
      const data = await RecentActionsDB.list({
        admin_id,
        plant_id,
        action_type,
        limit,
      });

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener acciones recientes",
        error: error.message,
      });
    }
  },

  // Obtener acción por ID
  async get(req, res) {
    try {
      const { id } = req.params;
      const data = await RecentActionsDB.getById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Acción no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener acción",
        error: error.message,
      });
    }
  },

  // Crear nueva acción
  async create(req, res) {
    try {
      const actionData = req.body;
      const data = await RecentActionsDB.create(actionData);

      // Emitir evento de Socket.IO
      req.io.emit("recent_action_created", {
        type: "recent_action_created",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: "Acción registrada exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al registrar acción",
        error: error.message,
      });
    }
  },

  // Obtener acciones por administrador
  async getByAdmin(req, res) {
    try {
      const { admin_id } = req.params;
      const { limit } = req.query;
      const data = await RecentActionsDB.getByAdmin(admin_id, limit);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener acciones del administrador",
        error: error.message,
      });
    }
  },

  // Obtener acciones por planta
  async getByPlant(req, res) {
    try {
      const { plant_id } = req.params;
      const { limit } = req.query;
      const data = await RecentActionsDB.getByPlant(plant_id, limit);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener acciones de la planta",
        error: error.message,
      });
    }
  },

  // Obtener acciones por tipo
  async getByActionType(req, res) {
    try {
      const { action_type } = req.params;
      const { limit } = req.query;
      const data = await RecentActionsDB.getByActionType(action_type, limit);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener acciones por tipo",
        error: error.message,
      });
    }
  },

  // Obtener estadísticas de acciones
  async getStats(req, res) {
    try {
      const { admin_id, plant_id, date_from, date_to } = req.query;
      const data = await RecentActionsDB.getStats({
        admin_id,
        plant_id,
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
        message: "Error al obtener estadísticas de acciones",
        error: error.message,
      });
    }
  },

  // Obtener actividad reciente
  async getRecentActivity(req, res) {
    try {
      const { admin_id } = req.params;
      const data = await RecentActionsDB.getRecentActivity(admin_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener actividad reciente",
        error: error.message,
      });
    }
  },

  // Limpiar acciones antiguas
  async cleanupOldActions(req, res) {
    try {
      const data = await RecentActionsDB.cleanupOldActions();

      res.status(200).json({
        success: true,
        message: `${data.length} acciones antiguas eliminadas`,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al limpiar acciones antiguas",
        error: error.message,
      });
    }
  },
};

export default RecentActionsController;
