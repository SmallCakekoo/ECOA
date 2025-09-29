import FoundationsDB from "../db/foundations.db.js";

const FoundationsController = {
  // Listar todas las fundaciones
  async list(req, res) {
    try {
      const { verified, active, country } = req.query;
      const data = await FoundationsDB.list({ verified, active, country });

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener fundaciones",
        error: error.message,
      });
    }
  },

  // Obtener fundación por ID
  async get(req, res) {
    try {
      const { id } = req.params;
      const data = await FoundationsDB.getById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Fundación no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener fundación",
        error: error.message,
      });
    }
  },

  // Crear nueva fundación
  async create(req, res) {
    try {
      const foundationData = req.body;
      const data = await FoundationsDB.create(foundationData);

      // Emitir evento de Socket.IO
      req.io.emit("foundation_created", {
        type: "foundation_created",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: "Fundación creada exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear fundación",
        error: error.message,
      });
    }
  },

  // Actualizar fundación
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await FoundationsDB.update(id, updateData);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Fundación no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("foundation_updated", {
        type: "foundation_updated",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Fundación actualizada exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar fundación",
        error: error.message,
      });
    }
  },

  // Eliminar fundación
  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await FoundationsDB.remove(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Fundación no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("foundation_deleted", {
        type: "foundation_deleted",
        data: { id: id },
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Fundación eliminada exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar fundación",
        error: error.message,
      });
    }
  },

  // Obtener fundaciones por país
  async getByCountry(req, res) {
    try {
      const { country } = req.params;
      const data = await FoundationsDB.getByCountry(country);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener fundaciones del país",
        error: error.message,
      });
    }
  },

  // Obtener países disponibles
  async getCountries(req, res) {
    try {
      const data = await FoundationsDB.getCountries();

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener países",
        error: error.message,
      });
    }
  },
};

export default FoundationsController;
