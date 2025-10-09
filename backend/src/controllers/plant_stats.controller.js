import {
  findAllPlantStats,
  findPlantStatsById,
  insertPlantStats,
  updatePlantStats,
  deletePlantStats,
} from "../db/plant_stats.db.js";
import {
  createPlantStatsModel,
  sanitizePlantStatsUpdate,
} from "../models/plant_stats.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  const message = error?.message || "Error interno del servidor";
  return res.status(status).json({ success: false, message });
};

export const PlantStatsController = {
  list: async (req, res) => {
    try {
      const { plant_id, date_from, date_to } = req.query;
      const filters = {};
      if (plant_id) filters.plant_id = plant_id;
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;

      const { data, error } = await findAllPlantStats(filters);
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  get: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findPlantStatsById(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({
            success: false,
            message: "Estadística de planta no encontrada",
          });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleError(error, res);
    }
  },

  create: async (req, res) => {
    try {
      const statsData = createPlantStatsModel(req.body);
      const { data, error } = await insertPlantStats(statsData);
      if (error) throw error;
      req.io?.emit("plant_stats_created", {
        type: "plant_stats_created",
        data,
        timestamp: new Date().toISOString(),
      });
      return res
        .status(201)
        .json({
          success: true,
          message: "Estadística de planta creada exitosamente",
          data,
        });
    } catch (error) {
      return handleError(error, res);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = sanitizePlantStatsUpdate(req.body);
      const { data, error } = await updatePlantStats(id, updateData);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({
            success: false,
            message: "Estadística de planta no encontrada",
          });
      req.io?.emit("plant_stats_updated", {
        type: "plant_stats_updated",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(200).json({
        success: true,
        message: "Estadística de planta actualizada exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await deletePlantStats(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({
            success: false,
            message: "Estadística de planta no encontrada",
          });
      req.io?.emit("plant_stats_deleted", {
        type: "plant_stats_deleted",
        data: { id },
        timestamp: new Date().toISOString(),
      });
      return res
        .status(200)
        .json({
          success: true,
          message: "Estadística de planta eliminada exitosamente",
        });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getByPlant: async (req, res) => {
    try {
      const { plant_id } = req.params;
      const { data, error } = await findAllPlantStats({ plant_id });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
};

export default PlantStatsController;
