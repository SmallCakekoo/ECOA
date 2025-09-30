import supabase from "../services/supabase.service.js";

export async function findAllPlants(filters = {}) {
  let query = supabase.from("plants").select("*");
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query = query.eq(key, value);
    }
  });
  return await query;
}

export async function findPlantById(id) {
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function insertPlant(plant) {
  return await supabase.from("plants").insert([plant]).select().single();
}

export async function updatePlant(id, updateData) {
  return await supabase
    .from("plants")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
}

export async function deletePlant(id) {
  const { error } = await supabase.from("plants").delete().eq("id", id);
  return { data: error ? null : { id }, error };
}

export async function assignAccessoryToPlant(plantId, accessoryId) {
  return await supabase
    .from("plants_accessories")
    .insert([{ plant_id: plantId, accessory_id: accessoryId }])
    .select()
    .single();
}

export default {
  findAllPlants,
  findPlantById,
  insertPlant,
  updatePlant,
  deletePlant,
  assignAccessoryToPlant,
};
