import {
  findAllAchievements,
  findAchievementById,
  insertAchievement,
  updateAchievement,
  deleteAchievement,
  findUserAchievements,
  assignAchievementToUser,
} from "../db/achievements.db.js";
import {
  createAchievementModel,
  sanitizeAchievementUpdate,
} from "../models/achievement.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  const message = error?.message || "Error interno del servidor";
  return res.status(status).json({ success: false, message });
};

export const AchievementsController = {
  list: async (req, res) => {
    try {
      const { category, difficulty } = req.query;
      const { data, error } = await findAllAchievements({
        category,
        difficulty,
      });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
  get: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findAchievementById(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Logro no encontrado" });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleError(error, res);
    }
  },
  create: async (req, res) => {
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
      return handleError(error, res);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
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
      return res.status(200).json({
        success: true,
        message: "Logro actualizado exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },
  remove: async (req, res) => {
    try {
      const { id } = req.params;
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
      return handleError(error, res);
    }
  },
  listByUser: async (req, res) => {
    try {
      const { user_id } = req.params;
      const { data, error } = await findUserAchievements(user_id);
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
  assign: async (req, res) => {
    try {
      const { user_id, achievement_id } = req.body;
      if (!user_id || !achievement_id)
        return res.status(400).json({
          success: false,
          message: "user_id y achievement_id son requeridos",
        });
      const { data, error } = await assignAchievementToUser(
        user_id,
        achievement_id
      );
      if (error) throw error;
      req.io?.emit("achievement_earned", {
        type: "achievement_earned",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(201).json({
        success: true,
        message: "Logro asignado exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },
};

export default AchievementsController;
