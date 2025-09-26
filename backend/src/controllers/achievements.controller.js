import {
  listAchievements,
  getAchievement,
  createAchievement,
  updateAchievementProfile,
  removeAchievement,
  listUserAchievements,
  assignAchievement,
} from "../services/achievements.service.js";

export const AchievementsController = {
  list: (req, res) => listAchievements(req, res),
  get: (req, res) => getAchievement(req, res),
  create: (req, res) => createAchievement(req, res),
  update: (req, res) => updateAchievementProfile(req, res),
  remove: (req, res) => removeAchievement(req, res),
  listByUser: (req, res) => listUserAchievements(req, res),
  assign: (req, res) => assignAchievement(req, res),
};

export default AchievementsController;
