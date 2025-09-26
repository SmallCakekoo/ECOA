import { handleSupabaseError, isValidUUID } from "./supabase.service.js";
import {
  createAchievementModel,
  sanitizeAchievementUpdate,
} from "../models/achievement.model.js";
import {
  findAllAchievements,
  findAchievementById,
  insertAchievement,
  updateAchievement,
  deleteAchievement,
  findUserAchievements,
  assignAchievementToUser,
} from "../repositories/achievements.repository.js";

export async function listAchievements(req, res) {
  try {
    const { category, difficulty } = req.query;
    const { data, error } = await findAllAchievements({ category, difficulty });
    if (error) throw error;
    return res.status(200).json({ success: true, data, count: data.length });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function getAchievement(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id))
      return res
        .status(400)
        .json({ success: false, message: "ID de logro inválido" });
    const { data, error } = await findAchievementById(id);
    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Logro no encontrado" });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function createAchievement(req, res) {
  try {
    const achievementData = createAchievementModel(req.body);
    const { data, error } = await insertAchievement(achievementData);
    if (error) throw error;
    req.io?.emit("achievement_created", {
      type: "achievement_created",
      data,
      timestamp: new Date().toISOString(),
    });
    return res
      .status(201)
      .json({ success: true, message: "Logro creado exitosamente", data });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function updateAchievementProfile(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id))
      return res
        .status(400)
        .json({ success: false, message: "ID de logro inválido" });
    const updateData = sanitizeAchievementUpdate(req.body);
    const { data, error } = await updateAchievement(id, updateData);
    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Logro no encontrado" });
    req.io?.emit("achievement_updated", {
      type: "achievement_updated",
      data,
      timestamp: new Date().toISOString(),
    });
    return res
      .status(200)
      .json({ success: true, message: "Logro actualizado exitosamente", data });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function removeAchievement(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id))
      return res
        .status(400)
        .json({ success: false, message: "ID de logro inválido" });
    const { data, error } = await deleteAchievement(id);
    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Logro no encontrado" });
    req.io?.emit("achievement_deleted", {
      type: "achievement_deleted",
      data: { id },
      timestamp: new Date().toISOString(),
    });
    return res
      .status(200)
      .json({ success: true, message: "Logro eliminado exitosamente" });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function listUserAchievements(req, res) {
  try {
    const { user_id } = req.params;
    if (!isValidUUID(user_id))
      return res
        .status(400)
        .json({ success: false, message: "ID de usuario inválido" });
    const { data, error } = await findUserAchievements(user_id);
    if (error) throw error;
    return res.status(200).json({ success: true, data, count: data.length });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function assignAchievement(req, res) {
  try {
    const { user_id, achievement_id } = req.body;
    if (!user_id || !achievement_id)
      return res
        .status(400)
        .json({
          success: false,
          message: "user_id y achievement_id son requeridos",
        });
    if (!isValidUUID(user_id) || !isValidUUID(achievement_id))
      return res.status(400).json({ success: false, message: "IDs inválidos" });

    // Verificar si ya existe
    const { data: existing } = await assignAchievementToUser(
      user_id,
      achievement_id
    );
    // Nota: si la tabla tiene restricción única (user_id, achievement_id), Supabase devolverá error si ya existe
    const data = existing;
    req.io?.emit("achievement_earned", {
      type: "achievement_earned",
      data,
      timestamp: new Date().toISOString(),
    });
    return res
      .status(201)
      .json({ success: true, message: "Logro asignado exitosamente", data });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}
