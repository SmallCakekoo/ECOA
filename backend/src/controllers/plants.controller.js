import {
  findAllPlants,
  findPlantById,
  insertPlant,
  updatePlant,
  deletePlant,
  assignAccessoryToPlant,
} from "../db/plants.db.js";
import {
  createPlantModel,
  sanitizePlantUpdate,
  sanitizePlantMetrics,
} from "../models/plants.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  const message = error?.message || "Error interno del servidor";
  return res.status(status).json({ success: false, message });
};

export const PlantsController = {
  list: async (req, res) => {
    try {
      const {
        user_id,
        status,
        health_status,
        species,
        is_adopted,
        search,
      } = req.query;
      const filters = {};
      if (user_id) filters.user_id = user_id;
      if (status) filters.status = status;
      if (health_status) filters.health_status = health_status;
      if (species) filters.species = species;
      if (typeof is_adopted !== "undefined") filters.is_adopted = is_adopted;
      if (search) filters.search = search;

      const { data, error } = await findAllPlants(filters);
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
  get: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findPlantById(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Planta no encontrada" });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleError(error, res);
    }
  },
  create: async (req, res) => {
    try {
      const plantData = createPlantModel(req.body);
      const { data, error } = await insertPlant(plantData);
      if (error) throw error;
      req.io?.emit("plant_created", {
        type: "plant_created",
        data,
        timestamp: new Date().toISOString(),
      });
      return res
        .status(201)
        .json({ success: true, message: "Planta creada exitosamente", data });
    } catch (error) {
      return handleError(error, res);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = sanitizePlantUpdate(req.body);
      const { data, error } = await updatePlant(id, updateData);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Planta no encontrada" });
      req.io?.emit("plant_updated", {
        type: "plant_updated",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(200).json({
        success: true,
        message: "Planta actualizada exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },
  updateMetrics: async (req, res) => {
    try {
      const { id } = req.params;
      const metricsData = sanitizePlantMetrics(req.body);
      const { data, error } = await updatePlant(id, metricsData);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Planta no encontrada" });
      req.io?.emit("plant_metrics_updated", {
        type: "plant_metrics_updated",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(200).json({
        success: true,
        message: "Métricas actualizadas exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },
  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await deletePlant(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Planta no encontrada" });
      req.io?.emit("plant_deleted", {
        type: "plant_deleted",
        data: { id },
        timestamp: new Date().toISOString(),
      });
      return res
        .status(200)
        .json({ success: true, message: "Planta eliminada exitosamente" });
    } catch (error) {
      return handleError(error, res);
    }
  },
  assignAccessory: async (req, res) => {
    try {
      const { id } = req.params;
      const { accessory_id } = req.body;
      const { data, error } = await assignAccessoryToPlant(id, accessory_id);
      if (error) throw error;
      req.io?.emit("accessory_assigned", {
        type: "accessory_assigned",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(201).json({
        success: true,
        message: "Accesorio asignado exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getByUser: async (req, res) => {
    try {
      const { user_id } = req.params;
      const { data, error } = await findAllPlants({ user_id });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getByFoundation: async (req, res) => {
    try {
      const { foundation_id } = req.params;
      const { data, error } = await findAllPlants({ foundation_id });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getAdopted: async (req, res) => {
    try {
      const { data, error } = await findAllPlants({ is_adopted: true });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getAvailable: async (req, res) => {
    try {
      const { data, error } = await findAllPlants({ is_adopted: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
};

export default PlantsController;
