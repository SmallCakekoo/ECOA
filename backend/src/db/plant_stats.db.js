import supabase from "../services/supabase.service.js";

export async function findAllPlantStats(filters = {}) {
  let query = supabase
    .from("plant_stats")
    .select("*")
    .order("recorded_at", { ascending: false });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "date_from") {
        query = query.gte("recorded_at", value);
      } else if (key === "date_to") {
        query = query.lte("recorded_at", value);
      } else {
        query = query.eq(key, value);
      }
    }
  });

  return await query;
}

export async function findPlantStatsById(id) {
  const { data, error } = await supabase
    .from("plant_stats")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function insertPlantStats(stats) {
  return await supabase.from("plant_stats").insert([stats]).select().single();
}

export async function updatePlantStats(id, updateData) {
  return await supabase
    .from("plant_stats")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
}

export async function deletePlantStats(id) {
  const { error } = await supabase.from("plant_stats").delete().eq("id", id);
  return { data: error ? null : { id }, error };
}

export async function findPlantStatsByPlant(plantId, limit = null) {
  let query = supabase
    .from("plant_stats")
    .select("*")
    .eq("plant_id", plantId)
    .order("recorded_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  return await query;
}

export async function getLatestPlantStats(plantId) {
  const { data, error } = await supabase
    .from("plant_stats")
    .select("*")
    .eq("plant_id", plantId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single();
  return { data, error };
}

export default {
  findAllPlantStats,
  findPlantStatsById,
  insertPlantStats,
  updatePlantStats,
  deletePlantStats,
  findPlantStatsByPlant,
  getLatestPlantStats,
};
