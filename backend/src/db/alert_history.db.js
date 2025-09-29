import supabase from "../services/supabase.service.js";

const AlertHistoryDB = {
  // Listar todo el historial de alertas
  async list({ plant_id, user_id, action } = {}) {
    let query = supabase
      .from("alert_history")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:user_id(name, email)
      `
      )
      .order("created_at", { ascending: false });

    if (plant_id) {
      query = query.eq("plant_id", plant_id);
    }

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (action) {
      query = query.eq("action", action);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener entrada de historial por ID
  async getById(id) {
    const { data, error } = await supabase
      .from("alert_history")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:user_id(name, email)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nueva entrada de historial
  async create(historyData) {
    const data = {
      ...historyData,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("alert_history")
      .insert([data])
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:user_id(name, email)
      `
      )
      .single();

    if (error) throw error;
    return result;
  },

  // Obtener historial por planta
  async getByPlant(plant_id) {
    const { data, error } = await supabase
      .from("alert_history")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:user_id(name, email)
      `
      )
      .eq("plant_id", plant_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener historial por usuario
  async getByUser(user_id) {
    const { data, error } = await supabase
      .from("alert_history")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:user_id(name, email)
      `
      )
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener estadísticas de alertas
  async getStats({ plant_id, user_id, date_from, date_to } = {}) {
    let query = supabase.from("alert_history").select("action, created_at");

    if (plant_id) {
      query = query.eq("plant_id", plant_id);
    }

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (date_from) {
      query = query.gte("created_at", date_from);
    }

    if (date_to) {
      query = query.lte("created_at", date_to);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Procesar estadísticas
    const stats = {
      total: data.length,
      by_action: {},
      by_day: {},
    };

    data.forEach((entry) => {
      // Contar por acción
      stats.by_action[entry.action] = (stats.by_action[entry.action] || 0) + 1;

      // Contar por día
      const day = entry.created_at.split("T")[0];
      stats.by_day[day] = (stats.by_day[day] || 0) + 1;
    });

    return stats;
  },
};

export default AlertHistoryDB;
