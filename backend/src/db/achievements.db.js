import supabase from "../services/supabase.service.js";

export async function findAllAchievements(filters = {}) {
  let query = supabase.from("achievements").select("*");
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query = query.eq(key, value);
    }
  });
  return await query;
}

export async function findAchievementById(id) {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function insertAchievement(achievement) {
  return await supabase
    .from("achievements")
    .insert([achievement])
    .select()
    .single();
}

export async function updateAchievement(id, updateData) {
  return await supabase
    .from("achievements")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteAchievement(id) {
  const { error } = await supabase.from("achievements").delete().eq("id", id);
  return { data: error ? null : { id }, error };
}

export async function findUserAchievements(userId) {
  return await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId);
}

export async function assignAchievementToUser(userId, achievementId) {
  return await supabase
    .from("user_achievements")
    .insert([{ user_id: userId, achievement_id: achievementId }])
    .select()
    .single();
}

export default {
  findAllAchievements,
  findAchievementById,
  insertAchievement,
  updateAchievement,
  deleteAchievement,
  findUserAchievements,
  assignAchievementToUser,
};
