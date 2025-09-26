import { supabase } from "../services/supabase.service.js";

export async function findAllPlants(filters = {}) {
  const { user_id, status } = filters;

  let query = supabase
    .from("plants")
    .select(
      `
        *,
        users:user_id(name, email),
        accessories:plant_accessories(
          accessories(*)
        )
      `
    )
    .order("created_at", { ascending: false });

  if (user_id) query = query.eq("user_id", user_id);
  if (status) query = query.eq("status", status);

  return await query;
}

export async function findPlantById(plantId) {
  return await supabase
    .from("plants")
    .select(
      `
        *,
        users:user_id(name, email),
        accessories:plant_accessories(
          accessories(*)
        )
      `
    )
    .eq("id", plantId)
    .single();
}

export async function insertPlant(plantData) {
  return await supabase.from("plants").insert([plantData]).select().single();
}

export async function updatePlant(plantId, updateData) {
  return await supabase
    .from("plants")
    .update(updateData)
    .eq("id", plantId)
    .select()
    .single();
}

export async function deletePlant(plantId) {
  return await supabase
    .from("plants")
    .delete()
    .eq("id", plantId)
    .select()
    .single();
}

export async function assignAccessoryToPlant(plantId, accessoryId) {
  return await supabase
    .from("plant_accessories")
    .insert([
      {
        plant_id: plantId,
        accessory_id: accessoryId,
        assigned_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();
}
