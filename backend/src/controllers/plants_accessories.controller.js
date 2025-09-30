import PlantsAccessoriesDB from "../db/plants_accessories.db.js";

const PlantsAccessoriesController = {
  // Listar todas las asignaciones
  async list(req, res) {
    try {
      const { plant_id, accessory_id } = req.query;
      const data = await PlantsAccessoriesDB.list({
        plant_id,
        accessory_id,
      });

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener asignaciones",
        error: error.message,
      });
    }
  },

  // Obtener asignación por ID
  async get(req, res) {
    try {
      const { id } = req.params;
      const data = await PlantsAccessoriesDB.getById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Asignación no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener asignación",
        error: error.message,
      });
    }
  },

  // Crear nueva asignación
  async create(req, res) {
    try {
      const assignmentData = req.body;
      const data = await PlantsAccessoriesDB.create(assignmentData);

      // Emitir evento de Socket.IO
      req.io.emit("plant_accessory_assigned", {
        type: "plant_accessory_assigned",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: "Accesorio asignado exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al asignar accesorio",
        error: error.message,
      });
    }
  },

  // Actualizar asignación
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await PlantsAccessoriesDB.update(id, updateData);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Asignación no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("plant_accessory_updated", {
        type: "plant_accessory_updated",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Asignación actualizada exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar asignación",
        error: error.message,
      });
    }
  },

  // Eliminar asignación
  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await PlantsAccessoriesDB.remove(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Asignación no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("plant_accessory_removed", {
        type: "plant_accessory_removed",
        data: { id: id },
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Asignación eliminada exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar asignación",
        error: error.message,
      });
    }
  },

  // Obtener accesorios por planta
  async getByPlant(req, res) {
    try {
      const { plant_id } = req.params;
      const data = await PlantsAccessoriesDB.getByPlant(plant_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener accesorios de la planta",
        error: error.message,
      });
    }
  },

  // Obtener plantas por accesorio
  async getByAccessory(req, res) {
    try {
      const { accessory_id } = req.params;
      const data = await PlantsAccessoriesDB.getByAccessory(accessory_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener plantas del accesorio",
        error: error.message,
      });
    }
  },

  // Desactivar asignación
  async deactivate(req, res) {
    try {
      const { id } = req.params;
      const data = await PlantsAccessoriesDB.deactivate(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Asignación no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("plant_accessory_deactivated", {
        type: "plant_accessory_deactivated",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Asignación desactivada exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al desactivar asignación",
        error: error.message,
      });
    }
  },
};

export default PlantsAccessoriesController;
