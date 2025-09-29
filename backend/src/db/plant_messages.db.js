import supabase from "../services/supabase.service.js";

const PlantMessagesDB = {
  // Listar todos los mensajes
  async list({ plant_id, user_id, message_type, sender_type, read } = {}) {
    let query = supabase
      .from("plant_messages")
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

    if (message_type) {
      query = query.eq("message_type", message_type);
    }

    if (sender_type) {
      query = query.eq("sender_type", sender_type);
    }

    if (read !== undefined) {
      query = query.eq("read", read);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener mensaje por ID
  async getById(id) {
    const { data, error } = await supabase
      .from("plant_messages")
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

  // Crear nuevo mensaje
  async create(messageData) {
    const data = {
      ...messageData,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("plant_messages")
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

  // Actualizar mensaje
  async update(id, updateData) {
    const data = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("plant_messages")
      .update(data)
      .eq("id", id)
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

  // Eliminar mensaje
  async remove(id) {
    const { data, error } = await supabase
      .from("plant_messages")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener mensajes por planta
  async getByPlant(plant_id) {
    const { data, error } = await supabase
      .from("plant_messages")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:user_id(name, email)
      `
      )
      .eq("plant_id", plant_id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Obtener mensajes por usuario
  async getByUser(user_id) {
    const { data, error } = await supabase
      .from("plant_messages")
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

  // Marcar mensaje como leído
  async markAsRead(id) {
    const { data, error } = await supabase
      .from("plant_messages")
      .update({
        read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marcar múltiples mensajes como leídos
  async markMultipleAsRead(ids) {
    const { data, error } = await supabase
      .from("plant_messages")
      .update({
        read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in("id", ids)
      .select();

    if (error) throw error;
    return data;
  },

  // Obtener mensajes no leídos por usuario
  async getUnreadByUser(user_id) {
    const { data, error } = await supabase
      .from("plant_messages")
      .select(
        `
        *,
        plants:plant_id(name, species),
        users:user_id(name, email)
      `
      )
      .eq("user_id", user_id)
      .eq("read", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener estadísticas de mensajes
  async getStats({ plant_id, user_id, date_from, date_to } = {}) {
    let query = supabase
      .from("plant_messages")
      .select("message_type, sender_type, read, created_at");

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
      by_type: {},
      by_sender: {},
      unread: 0,
      by_day: {},
    };

    data.forEach((message) => {
      // Contar por tipo
      stats.by_type[message.message_type] =
        (stats.by_type[message.message_type] || 0) + 1;

      // Contar por remitente
      stats.by_sender[message.sender_type] =
        (stats.by_sender[message.sender_type] || 0) + 1;

      // Contar no leídos
      if (!message.read) {
        stats.unread++;
      }

      // Contar por día
      const day = message.created_at.split("T")[0];
      stats.by_day[day] = (stats.by_day[day] || 0) + 1;
    });

    return stats;
  },
};

export default PlantMessagesDB;
