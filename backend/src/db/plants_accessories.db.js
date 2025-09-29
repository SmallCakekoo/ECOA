import supabase from "../services/supabase.service.js";

const PlantsAccessoriesDB = {
  // Listar todas las asignaciones
  async list({ plant_id, accessory_id, active } = {}) {
    let query = supabase
      .from("plant_accessories")
      .select(
        `
        *,
        plants:plant_id(name, species),
        accessories:accessory_id(name, category)
      `
      )
      .order("assigned_at", { ascending: false });

    if (plant_id) {
      query = query.eq("plant_id", plant_id);
    }

    if (accessory_id) {
      query = query.eq("accessory_id", accessory_id);
    }

    if (active !== undefined) {
      query = query.eq("active", active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener asignación por ID
  async getById(id) {
    const { data, error } = await supabase
      .from("plant_accessories")
      .select(
        `
        *,
        plants:plant_id(name, species),
        accessories:accessory_id(name, category)
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
      assigned_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("plant_accessories")
      .insert([data])
      .select(
        `
        *,
        plants:plant_id(name, species),
        accessories:accessory_id(name, category)
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
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("plant_accessories")
      .update(data)
      .eq("id", id)
      .select(
        `
        *,
        plants:plant_id(name, species),
        accessories:accessory_id(name, category)
      `
      )
      .single();

    if (error) throw error;
    return result;
  },

  // Eliminar asignación
  async remove(id) {
    const { data, error } = await supabase
      .from("plant_accessories")
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
      .from("plant_accessories")
      .select(
        `
        *,
        accessories:accessory_id(*)
      `
      )
      .eq("plant_id", plant_id)
      .eq("active", true)
      .order("assigned_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener plantas por accesorio
  async getByAccessory(accessory_id) {
    const { data, error } = await supabase
      .from("plant_accessories")
      .select(
        `
        *,
        plants:plant_id(*)
      `
      )
      .eq("accessory_id", accessory_id)
      .eq("active", true)
      .order("assigned_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Desactivar asignación
  async deactivate(id) {
    const { data, error } = await supabase
      .from("plant_accessories")
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default PlantsAccessoriesDB;
