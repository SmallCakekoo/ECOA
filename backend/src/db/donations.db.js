import supabase from "../services/supabase.service.js";

const DonationsDB = {
  // Listar todas las donaciones
  async list({ user_id, plant_id, status } = {}) {
    let query = supabase
      .from("donations")
      .select(
        `
        *,
        users:user_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .order("created_at", { ascending: false });

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (plant_id) {
      query = query.eq("plant_id", plant_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener donación por ID
  async getById(id) {
    const { data, error } = await supabase
      .from("donations")
      .select(
        `
        *,
        users:user_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nueva donación
  async create(donationData) {
    const data = {
      ...donationData,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("donations")
      .insert([data])
      .select(
        `
        *,
        users:user_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .single();

    if (error) throw error;
    return result;
  },

  // Actualizar donación
  async update(id, updateData) {
    const data = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("donations")
      .update(data)
      .eq("id", id)
      .select(
        `
        *,
        users:user_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .single();

    if (error) throw error;
    return result;
  },

  // Actualizar estado de donación
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from("donations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        users:user_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar donación
  async remove(id) {
    const { data, error } = await supabase
      .from("donations")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener donaciones por usuario
  async getByUser(user_id) {
    const { data, error } = await supabase
      .from("donations")
      .select(
        `
        *,
        users:user_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener donaciones por planta
  async getByPlant(plant_id) {
    const { data, error } = await supabase
      .from("donations")
      .select(
        `
        *,
        users:user_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .eq("plant_id", plant_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};

export default DonationsDB;
