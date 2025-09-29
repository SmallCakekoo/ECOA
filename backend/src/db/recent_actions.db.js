import supabase from "../services/supabase.service.js";

const RecentActionsDB = {
  // Listar todas las acciones recientes
  async list({ admin_id, plant_id, action_type, limit = 50 } = {}) {
    let query = supabase
      .from("recent_actions")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:admin_id(name, email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (admin_id) {
      query = query.eq("admin_id", admin_id);
    }

    if (plant_id) {
      query = query.eq("plant_id", plant_id);
    }

    if (action_type) {
      query = query.eq("action_type", action_type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener acción por ID
  async getById(id) {
    const { data, error } = await supabase
      .from("recent_actions")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:admin_id(name, email)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nueva acción
  async create(actionData) {
    const data = {
      ...actionData,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("recent_actions")
      .insert([data])
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:admin_id(name, email)
      `
      )
      .single();

    if (error) throw error;
    return result;
  },

  // Obtener acciones por administrador
  async getByAdmin(admin_id, limit = 50) {
    const { data, error } = await supabase
      .from("recent_actions")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:admin_id(name, email)
      `
      )
      .eq("admin_id", admin_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Obtener acciones por planta
  async getByPlant(plant_id, limit = 50) {
    const { data, error } = await supabase
      .from("recent_actions")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:admin_id(name, email)
      `
      )
      .eq("plant_id", plant_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Obtener acciones por tipo
  async getByActionType(action_type, limit = 50) {
    const { data, error } = await supabase
      .from("recent_actions")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:admin_id(name, email)
      `
      )
      .eq("action_type", action_type)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Obtener estadísticas de acciones
  async getStats({ admin_id, plant_id, date_from, date_to } = {}) {
    let query = supabase
      .from("recent_actions")
      .select("action_type, created_at");

    if (admin_id) {
      query = query.eq("admin_id", admin_id);
    }

    if (plant_id) {
      query = query.eq("plant_id", plant_id);
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
      by_action_type: {},
      by_day: {},
      by_hour: {},
    };

    data.forEach((action) => {
      // Contar por tipo de acción
      stats.by_action_type[action.action_type] =
        (stats.by_action_type[action.action_type] || 0) + 1;

      // Contar por día
      const day = action.created_at.split("T")[0];
      stats.by_day[day] = (stats.by_day[day] || 0) + 1;

      // Contar por hora
      const hour = new Date(action.created_at).getHours();
      stats.by_hour[hour] = (stats.by_hour[hour] || 0) + 1;
    });

    return stats;
  },

  // Obtener actividad reciente (últimas 24 horas)
  async getRecentActivity(admin_id) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from("recent_actions")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:admin_id(name, email)
      `
      )
      .eq("admin_id", admin_id)
      .gte("created_at", yesterday.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Limpiar acciones antiguas (más de 30 días)
  async cleanupOldActions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("recent_actions")
      .delete()
      .lt("created_at", thirtyDaysAgo.toISOString())
      .select();

    if (error) throw error;
    return data;
  },
};

export default RecentActionsDB;
