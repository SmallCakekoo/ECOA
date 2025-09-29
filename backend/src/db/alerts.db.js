import supabase from "../services/supabase.service.js";

const AlertsDB = {
  // Listar todas las alertas
  async list({ plant_id, user_id, status, alert_type } = {}) {
    let query = supabase
      .from("alerts")
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .order("created_at", { ascending: false });

    if (plant_id) {
      query = query.eq("plant_id", plant_id);
    }

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (alert_type) {
      query = query.eq("alert_type", alert_type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener alerta por ID
  async getById(id) {
    const { data, error } = await supabase
      .from("alerts")
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nueva alerta
  async create(alertData) {
    const data = {
      ...alertData,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("alerts")
      .insert([data])
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .single();

    if (error) throw error;
    return result;
  },

  // Actualizar alerta
  async update(id, updateData) {
    const data = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("alerts")
      .update(data)
      .eq("id", id)
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .single();

    if (error) throw error;
    return result;
  },

  // Actualizar estado de alerta
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from("alerts")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar alerta
  async remove(id) {
    const { data, error } = await supabase
      .from("alerts")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener alertas por planta
  async getByPlant(plant_id, status) {
    let query = supabase
      .from("alerts")
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .eq("plant_id", plant_id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener alertas por usuario
  async getByUser(user_id, status) {
    let query = supabase
      .from("alerts")
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Actualizar estado de múltiples alertas
  async bulkUpdateStatus(alert_ids, status) {
    const { data, error } = await supabase
      .from("alerts")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in("id", alert_ids).select(`
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `);

    if (error) throw error;
    return data;
  },
};

export default AlertsDB;

