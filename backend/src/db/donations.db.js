import supabase from "../services/supabase.service.js";

const DonationsDB = {
  // Listar todas las donaciones
  async list({ user_id, plant_id, status } = {}) {
    // Construir query base
    let query = supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    // Aplicar filtros
    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (plant_id) {
      query = query.eq("plant_id", plant_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Ejecutar query
    const { data, error } = await query;
    
    if (error) {
      console.error("Error en query de donaciones:", error);
      throw error;
    }

    // Si no hay datos, retornar array vacío
    if (!data || data.length === 0) {
      return [];
    }

    // Obtener nombres de usuarios y plantas por separado para evitar problemas con relaciones
    const userIds = [...new Set(data.map(d => d.user_id).filter(Boolean))];
    const plantIds = [...new Set(data.map(d => d.plant_id).filter(Boolean))];

    let usersMap = {};
    let plantsMap = {};

    // Obtener usuarios si hay
    if (userIds.length > 0) {
      try {
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, name, email")
          .in("id", userIds);

        if (!usersError && users) {
          users.forEach(user => {
            usersMap[user.id] = user;
          });
        }
      } catch (e) {
        console.warn("Error obteniendo usuarios:", e);
      }
    }

    // Obtener plantas si hay
    if (plantIds.length > 0) {
      try {
        const { data: plants, error: plantsError } = await supabase
          .from("plants")
          .select("id, name, species")
          .in("id", plantIds);

        if (!plantsError && plants) {
          plants.forEach(plant => {
            plantsMap[plant.id] = plant;
          });
        }
      } catch (e) {
        console.warn("Error obteniendo plantas:", e);
      }
    }

    // Combinar datos
    const enrichedData = data.map(donation => {
      const user = usersMap[donation.user_id];
      const plant = plantsMap[donation.plant_id];

      return {
        ...donation,
        user_name: user?.name || null,
        user_email: user?.email || null,
        plant_name: plant?.name || null,
        plant_species: plant?.species || null,
        // Mantener compatibilidad con formato anterior
        users: user ? { name: user.name, email: user.email } : null,
        plants: plant ? { name: plant.name, species: plant.species } : null,
      };
    });

    return enrichedData;
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
