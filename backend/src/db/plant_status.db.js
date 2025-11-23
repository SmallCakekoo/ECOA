import supabase from "../services/supabase.service.js";

export async function findAllPlantStatus(filters = {}) {
  let query = supabase
    .from("plant_status")
    .select("*")
    .order("recorded_at", { ascending: false });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "date_from") {
        query = query.gte("recorded_at", value);
      } else if (key === "date_to") {
        query = query.lte("recorded_at", value);
      } else if (key === "latest") {
        query = query.limit(1);
      } else {
        query = query.eq(key, value);
      }
    }
  });

  return await query;
}

export async function findPlantStatusById(id) {
  const { data, error } = await supabase
    .from("plant_status")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function insertPlantStatus(status) {
  return await supabase.from("plant_status").insert([status]).select().single();
}

export async function updatePlantStatus(id, updateData) {
  return await supabase
    .from("plant_status")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
}

export async function deletePlantStatus(id) {
  const { error } = await supabase.from("plant_status").delete().eq("id", id);
  return { data: error ? null : { id }, error };
}

export async function findPlantStatusByPlant(plantId, limit = null) {
  let query = supabase
    .from("plant_status")
    .select("*")
    .eq("plant_id", plantId)
    .order("recorded_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  return await query;
}

export async function getLatestPlantStatus(plantId) {
  const { data, error } = await supabase
    .from("plant_status")
    .select("*")
    .eq("plant_id", plantId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single();
  return { data, error };
}

/**
 * Verifica si existe un registro en plant_status para un plant_id dado
 * @param {string} plantId - ID de la planta
 * @returns {Promise<{data: boolean, error: any}>} - true si existe, false si no
 */
export async function plantStatusExists(plantId) {
  const { data, error } = await supabase
    .from("plant_status")
    .select("id")
    .eq("plant_id", plantId)
    .limit(1);
  
  if (error) {
    return { data: false, error };
  }
  
  return { data: data && data.length > 0, error: null };
}

export async function findPlantStatusByStatus(status) {
  return await supabase
    .from("plant_status")
    .select("*")
    .eq("status", status)
    .order("recorded_at", { ascending: false });
}

export default {
  findAllPlantStatus,
  findPlantStatusById,
  insertPlantStatus,
  updatePlantStatus,
  deletePlantStatus,
  findPlantStatusByPlant,
  getLatestPlantStatus,
  findPlantStatusByStatus,
  plantStatusExists,
};
