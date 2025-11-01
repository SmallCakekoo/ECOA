import supabase from "../services/supabase.service.js";

export async function findAllPlants(filters = {}) {
  let query = supabase.from("plants").select("*");

  // búsqueda por nombre o especie
  if (filters.search) {
    const term = `%${filters.search}%`;
    query = query.or(`name.ilike.${term},species.ilike.${term}`);
  }

  // filtros exactos
  Object.entries(filters).forEach(([key, value]) => {
    if (["search"].includes(key)) return;
    if (value === undefined || value === null || value === "") return;

    // coerción para booleanos enviados como string
    let v = value;
    if (key === "is_adopted" && typeof value === "string") {
      if (value === "true") v = true;
      if (value === "false") v = false;
    }
    query = query.eq(key, v);
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
