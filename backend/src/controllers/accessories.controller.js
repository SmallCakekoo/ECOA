import AccessoriesDB from "../db/accessories.db.js";

const AccessoriesController = {
  // Listar todos los accesorios
  async list(req, res) {
    try {
      const { category, available } = req.query;
      const data = await AccessoriesDB.list({ category, available });

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener accesorios",
        error: error.message,
      });
    }
  },

  // Obtener accesorio por ID
  async get(req, res) {
    try {
      const { id } = req.params;
      const data = await AccessoriesDB.getById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Accesorio no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener accesorio",
        error: error.message,
      });
    }
  },

  // Crear nuevo accesorio
  async create(req, res) {
    try {
      const accessoryData = req.body;
      const data = await AccessoriesDB.create(accessoryData);

      // Emitir evento de Socket.IO
      req.io.emit("accessory_created", {
        type: "accessory_created",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: "Accesorio creado exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear accesorio",
        error: error.message,
      });
    }
  },

  // Actualizar accesorio
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await AccessoriesDB.update(id, updateData);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Accesorio no encontrado",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("accessory_updated", {
        type: "accessory_updated",
        data: data,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Accesorio actualizado exitosamente",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar accesorio",
        error: error.message,
      });
    }
  },

  // Eliminar accesorio
  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await AccessoriesDB.remove(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Accesorio no encontrado",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("accessory_deleted", {
        type: "accessory_deleted",
        data: { id: id },
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Accesorio eliminado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar accesorio",
        error: error.message,
      });
    }
  },

  // Obtener categorías
  async getCategories(req, res) {
    try {
      const data = await AccessoriesDB.getCategories();

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener categorías",
        error: error.message,
      });
    }
  },

  // Obtener accesorios por planta
  async getByPlant(req, res) {
    try {
      const { plant_id } = req.params;
      const data = await AccessoriesDB.getByPlant(plant_id);

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

  // Desasignar accesorio de planta
  async unassignFromPlant(req, res) {
    try {
      const { plant_id, accessory_id } = req.params;
      const data = await AccessoriesDB.unassignFromPlant(
        plant_id,
        accessory_id
      );

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Asignación no encontrada",
        });
      }

      // Emitir evento de Socket.IO
      req.io.emit("accessory_unassigned", {
        type: "accessory_unassigned",
        data: { plant_id, accessory_id },
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Accesorio desasignado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al desasignar accesorio",
        error: error.message,
      });
    }
  },
};

export default AccessoriesController;
