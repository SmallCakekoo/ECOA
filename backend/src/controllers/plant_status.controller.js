import {
  findAllPlantStatus,
  findPlantStatusById,
  insertPlantStatus,
  updatePlantStatus,
  deletePlantStatus,
} from "../db/plant_status.db.js";
import {
  createPlantStatusModel,
  sanitizePlantStatusUpdate,
} from "../models/plant_status.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  const message = error?.message || "Error interno del servidor";
  return res.status(status).json({ success: false, message });
};

export const PlantStatusController = {
  list: async (req, res) => {
    try {
      const { plant_id, status, date_from, date_to } = req.query;
      const filters = {};
      if (plant_id) filters.plant_id = plant_id;
      if (status) filters.status = status;
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;

      const { data, error } = await findAllPlantStatus(filters);
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  get: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findPlantStatusById(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Estado de planta no encontrado" });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleError(error, res);
    }
  },

  create: async (req, res) => {
    try {
      const statusData = createPlantStatusModel(req.body);
      const { data, error } = await insertPlantStatus(statusData);
      if (error) throw error;
      req.io?.emit("plant_status_created", {
        type: "plant_status_created",
        data,
        timestamp: new Date().toISOString(),
      });
      return res
        .status(201)
        .json({
          success: true,
          message: "Estado de planta creado exitosamente",
          data,
        });
    } catch (error) {
      return handleError(error, res);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = sanitizePlantStatusUpdate(req.body);
      const { data, error } = await updatePlantStatus(id, updateData);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Estado de planta no encontrado" });
      req.io?.emit("plant_status_updated", {
        type: "plant_status_updated",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(200).json({
        success: true,
        message: "Estado de planta actualizado exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await deletePlantStatus(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Estado de planta no encontrado" });
      req.io?.emit("plant_status_deleted", {
        type: "plant_status_deleted",
        data: { id },
        timestamp: new Date().toISOString(),
      });
      return res
        .status(200)
        .json({
          success: true,
          message: "Estado de planta eliminado exitosamente",
        });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getByPlant: async (req, res) => {
    try {
      const { plant_id } = req.params;
      const { data, error } = await findAllPlantStatus({ plant_id });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getLatestByPlant: async (req, res) => {
    try {
      const { plant_id } = req.params;
      const { data, error } = await findAllPlantStatus({
        plant_id,
        latest: true,
      });
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleError(error, res);
    }
  },
};

export default PlantStatusController;
