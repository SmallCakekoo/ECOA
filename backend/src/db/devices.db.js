import supabase from "../services/supabase.service.js";

export async function findAllDevices(filters = {}) {
  let query = supabase.from("devices").select("*");
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query = query.eq(key, value);
    }
  });
  return await query;
}

export async function findDeviceById(id) {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function insertDevice(device) {
  return await supabase.from("devices").insert([device]).select().single();
}

export async function updateDevice(id, updateData) {
  return await supabase
    .from("devices")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteDevice(id) {
  const { error } = await supabase.from("devices").delete().eq("id", id);
  return { data: error ? null : { id }, error };
}

export async function findDevicesByFoundation(foundationId) {
  return await supabase
    .from("devices")
    .select("*")
    .eq("foundation_id", foundationId);
}

export async function updateDeviceConnection(id) {
  return await supabase
    .from("devices")
    .update({ last_connection: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
}

export default {
  findAllDevices,
  findDeviceById,
  insertDevice,
  updateDevice,
  deleteDevice,
  findDevicesByFoundation,
  updateDeviceConnection,
};
