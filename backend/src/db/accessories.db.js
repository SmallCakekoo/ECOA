import supabase from "../services/supabase.service.js";

const AccessoriesDB = {
  // Listar todos los accesorios
  async list({ category, available } = {}) {
    let query = supabase
      .from("accessories")
      .select("*")
      .order("name", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    if (available !== undefined) {
      query = query.eq("available", available === "true");
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener accesorio por ID
  async getById(id) {
    const { data, error } = await supabase
      .from("accessories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nuevo accesorio
  async create(accessoryData) {
    const data = {
      ...accessoryData,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("accessories")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Actualizar accesorio
  async update(id, updateData) {
    const data = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("accessories")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Eliminar accesorio
  async remove(id) {
    const { data, error } = await supabase
      .from("accessories")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener categorías
  async getCategories() {
    const { data, error } = await supabase
      .from("accessories")
      .select("category")
      .not("category", "is", null);

    if (error) throw error;

    // Obtener categorías únicas
    const categories = [...new Set(data.map((item) => item.category))];
    return categories;
  },

  // Obtener accesorios por planta
  async getByPlant(plant_id) {
    const { data, error } = await supabase
      .from("plant_accessories")
      .select(
        `
        *,
        accessories(*)
      `
      )
      .eq("plant_id", plant_id);

    if (error) throw error;
    return data;
  },

  // Desasignar accesorio de planta
  async unassignFromPlant(plant_id, accessory_id) {
    const { data, error } = await supabase
      .from("plant_accessories")
      .delete()
      .eq("plant_id", plant_id)
      .eq("accessory_id", accessory_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default AccessoriesDB;
