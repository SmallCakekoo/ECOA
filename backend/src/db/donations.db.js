import supabase from "../services/supabase.service.js";

const DonationsDB = {
  // Listar todas las donaciones
  async list({ user_id, plant_id, status } = {}) {
    try {
      // Construir query base sin filtro de status (puede no existir en la tabla)
      let query = supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      // Aplicar filtros que sabemos que existen
      if (user_id) {
        query = query.eq("user_id", user_id);
      }

      if (plant_id) {
        query = query.eq("plant_id", plant_id);
      }

      // Ejecutar query
      let { data, error } = await query;
      
      if (error) {
        console.error("❌ Error en query de donaciones:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          filters: { user_id, plant_id, status }
        });
        throw error;
      }

      // Si no hay datos, retornar array vacío
      if (!data || data.length === 0) {
        console.log("✅ Query exitosa, pero no hay donaciones");
        return [];
      }

      // Aplicar filtro de status en memoria si se especificó
      if (status && status !== "all") {
        const beforeFilter = data.length;
        data = data.filter(donation => {
          // Asegurar que el status existe y coincide (case insensitive)
          return donation.status && donation.status.toLowerCase() === status.toLowerCase();
        });
        console.log(`✅ Filtrado por status "${status}": ${beforeFilter} -> ${data.length} donaciones`);
      }

      // Si después del filtro no hay datos, retornar array vacío
      if (!data || data.length === 0) {
        console.log("✅ Query exitosa, pero no hay donaciones con los filtros aplicados");
        return [];
      }

      console.log(`✅ Query exitosa: ${data.length} donaciones encontradas`);

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

          if (usersError) {
            console.warn("⚠️ Error obteniendo usuarios:", usersError.message);
          } else if (users) {
            users.forEach(user => {
              usersMap[user.id] = user;
            });
            console.log(`✅ ${users.length} usuarios obtenidos`);
          }
        } catch (e) {
          console.warn("⚠️ Excepción obteniendo usuarios:", e.message);
        }
      }

      // Obtener plantas si hay
      if (plantIds.length > 0) {
        try {
          const { data: plants, error: plantsError } = await supabase
            .from("plants")
            .select("id, name, species")
            .in("id", plantIds);

          if (plantsError) {
            console.warn("⚠️ Error obteniendo plantas:", plantsError.message);
          } else if (plants) {
            plants.forEach(plant => {
              plantsMap[plant.id] = plant;
            });
            console.log(`✅ ${plants.length} plantas obtenidas`);
          }
        } catch (e) {
          console.warn("⚠️ Excepción obteniendo plantas:", e.message);
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

      console.log(`✅ ${enrichedData.length} donaciones enriquecidas exitosamente`);
      return enrichedData;
    } catch (error) {
      console.error("❌ Error completo en list() de donations:", {
        message: error.message,
        stack: error.stack,
        filters: { user_id, plant_id, status }
      });
      throw error;
    }
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
    try {
      // Remover created_at si existe (Supabase lo maneja automáticamente con timestamps)
      const { created_at, ...dataWithoutTimestamp } = donationData;
      
      console.log("📝 Creando donación con datos:", dataWithoutTimestamp);

      // Insertar sin relaciones primero para evitar errores
      const { data: result, error } = await supabase
        .from("donations")
        .insert([dataWithoutTimestamp])
        .select("*")
        .single();

      if (error) {
        console.error("❌ Error en Supabase al crear donación:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log("✅ Donación creada exitosamente:", result?.id);

      // Si no hay resultado, retornar null
      if (!result) {
        throw new Error("No se pudo crear la donación");
      }

      // Enriquecer con datos de usuario y planta si existen
      let enrichedResult = { ...result };

      // Obtener datos del usuario si existe
      if (result.user_id) {
        try {
          const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("id", result.user_id)
            .single();

          if (!userError && user) {
            enrichedResult.user_name = user.name;
            enrichedResult.user_email = user.email;
            enrichedResult.users = { name: user.name, email: user.email };
          }
        } catch (e) {
          console.warn("⚠️ No se pudo obtener datos del usuario:", e.message);
        }
      }

      // Obtener datos de la planta si existe
      if (result.plant_id) {
        try {
          const { data: plant, error: plantError } = await supabase
            .from("plants")
            .select("id, name, species")
            .eq("id", result.plant_id)
            .single();

          if (!plantError && plant) {
            enrichedResult.plant_name = plant.name;
            enrichedResult.plant_species = plant.species;
            enrichedResult.plants = { name: plant.name, species: plant.species };
          }
        } catch (e) {
          console.warn("⚠️ No se pudo obtener datos de la planta:", e.message);
        }
      }

      return enrichedResult;
    } catch (error) {
      console.error("❌ Error completo al crear donación:", {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
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
