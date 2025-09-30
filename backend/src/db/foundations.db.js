import supabase from "../services/supabase.service.js";

const FoundationsDB = {
  // Listar todas las fundaciones
  async list({ verified, active, country } = {}) {
    let query = supabase
      .from("foundations")
      .select("*")
      .order("name", { ascending: true });

    if (verified !== undefined) {
      query = query.eq("verified", verified);
    }

    if (active !== undefined) {
      query = query.eq("active", active);
    }

    if (country) {
      query = query.eq("country", country);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener fundación por ID
  async getById(id) {
    const { data, error } = await supabase
      .from("foundations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nueva fundación
  async create(foundationData) {
    const data = {
      ...foundationData,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("foundations")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Actualizar fundación
  async update(id, updateData) {
    const data = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from("foundations")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Eliminar fundación
  async remove(id) {
    const { data, error } = await supabase
      .from("foundations")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener fundaciones por país
  async getByCountry(country) {
    const { data, error } = await supabase
      .from("foundations")
      .select("*")
      .eq("country", country)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Obtener países disponibles
  async getCountries() {
    const { data, error } = await supabase
      .from("foundations")
      .select("country")
      .not("country", "is", null);

    if (error) throw error;

    // Obtener países únicos
    const countries = [...new Set(data.map((item) => item.country))];
    return countries;
  },
};

export default FoundationsDB;
