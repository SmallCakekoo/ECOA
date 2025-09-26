import { isValidUUID, handleSupabaseError } from "./supabase.service.js";
import {
  createPlantModel,
  sanitizePlantUpdate,
  sanitizePlantMetrics,
} from "../models/plant.model.js";
import {
  findAllPlants,
  findPlantById,
  insertPlant,
  updatePlant,
  deletePlant,
  assignAccessoryToPlant,
} from "../repositories/plants.repository.js";

export async function listPlants(req, res) {
  try {
    const { user_id, status } = req.query;
    const filters = {};
    if (user_id && isValidUUID(user_id)) filters.user_id = user_id;
    if (status) filters.status = status;
    const { data, error } = await findAllPlants(filters);
    if (error) throw error;
    return res.status(200).json({ success: true, data, count: data.length });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function getPlant(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de planta inválido" });
    }
    const { data, error } = await findPlantById(id);
    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Planta no encontrada" });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function createPlant(req, res) {
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
    return handleSupabaseError(error, res);
  }
}

export async function updatePlantProfile(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de planta inválido" });
    }
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
    return handleSupabaseError(error, res);
  }
}

export async function updatePlantMetrics(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de planta inválido" });
    }
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
    return handleSupabaseError(error, res);
  }
}

export async function removePlant(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de planta inválido" });
    }
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
    return handleSupabaseError(error, res);
  }
}

export async function assignAccessory(req, res) {
  try {
    const { id } = req.params;
    const { accessory_id } = req.body;
    if (!isValidUUID(id) || !isValidUUID(accessory_id)) {
      return res.status(400).json({ success: false, message: "IDs inválidos" });
    }
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
    return handleSupabaseError(error, res);
  }
}
