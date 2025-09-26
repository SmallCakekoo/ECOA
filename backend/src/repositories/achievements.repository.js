import { supabase } from "../services/supabase.service.js";

export async function findAllAchievements(filters = {}) {
  const { category, difficulty } = filters;
  let query = supabase
    .from("achievements")
    .select("*")
    .order("difficulty", { ascending: true });
  if (category) query = query.eq("category", category);
  if (difficulty) query = query.eq("difficulty", difficulty);
  return await query;
}

export async function findAchievementById(id) {
  return await supabase.from("achievements").select("*").eq("id", id).single();
}

export async function insertAchievement(data) {
  return await supabase.from("achievements").insert([data]).select().single();
}

export async function updateAchievement(id, data) {
  return await supabase
    .from("achievements")
    .update(data)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteAchievement(id) {
  return await supabase
    .from("achievements")
    .delete()
    .eq("id", id)
    .select()
    .single();
}

export async function findUserAchievements(userId) {
  return await supabase
    .from("user_achievements")
    .select(
      `
        *,
        achievements(*)
      `
    )
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });
}

export async function assignAchievementToUser(userId, achievementId) {
  return await supabase
    .from("user_achievements")
    .insert([
      {
        user_id: userId,
        achievement_id: achievementId,
        earned_at: new Date().toISOString(),
      },
    ])
    .select(
      `
        *,
        achievements(*)
      `
    )
    .single();
}
