import supabase from "../services/supabase.service.js";

const PlantsAccessoriesDB = {
  // Listar todas las asignaciones
  async list({ plant_id, accessory_id } = {}) {
    let query = supabase
      .from("plants_accessories")
      .select(
        `
        *,
        plants:plant_id(name, species),
        accessories:accessory_id(name, image, price_estimate)
      `
      )
      .order("created_at", { ascending: false });

    if (plant_id) {
      query = query.eq("plant_id", plant_id);
    }

    if (accessory_id) {
      query = query.eq("accessory_id", accessory_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener asignación por ID
  async getById(id) {
    const { data, error } = await supabase
      .from("plants_accessories")
      .select(
        `
        *,
        plants:plant_id(name, species),
        accessories:accessory_id(name, image, price_estimate)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nueva asignación
  async create(assignmentData) {
    const data = {
      ...assignmentData,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("plants_accessories")
      .insert([data])
      .select(
        `
        *,
        plants:plant_id(name, species),
       accessories:accessory_id(name, image, price_estimate)
      `
      )
      .single();

    if (error) throw error;
    return result;
  },

  // Actualizar asignación
  async update(id, updateData) {
    const data = {
      ...updateData,
    };

    const { data: result, error } = await supabase
      .from("plants_accessories")
      .update(data)
      .eq("id", id)
      .select(
        `
        *,
        plants:plant_id(name, species),
        accessories:accessory_id(name, image, price_estimate)
      `
      )
      .single();

    if (error) throw error;
    return result;
  },

  // Eliminar asignación
  async remove(id) {
    const { data, error } = await supabase
      .from("plants_accessories")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener accesorios por planta
  async getByPlant(plant_id) {
    const { data, error } = await supabase
      .from("plants_accessories")
      .select(
        `
        *,
        accessories:accessory_id(*)
      `
      )
      .eq("plant_id", plant_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener plantas por accesorio
  async getByAccessory(accessory_id) {
    const { data, error } = await supabase
      .from("plants_accessories")
      .select(
        `
        *,
        plants:plant_id(*)
      `
      )
      .eq("accessory_id", accessory_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Eliminar asignación (equivalente a desactivar)
  async deactivate(id) {
    const { data, error } = await supabase
      .from("plants_accessories")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default PlantsAccessoriesDB;
