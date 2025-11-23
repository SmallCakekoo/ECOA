import supabase from "../services/supabase.service.js";

export async function findAllPlants(filters = {}) {
  // Separar health_status del filtro porque no está en la tabla plants directamente
  const healthStatusFilter = filters.health_status;
  const otherFilters = { ...filters };
  delete otherFilters.health_status;

  // Query básica en la tabla plants
  let query = supabase.from("plants").select("*, users(name)");

  // búsqueda por nombre o especie
  if (otherFilters.search) {
    const term = `%${otherFilters.search}%`;
    query = query.or(`name.ilike.${term},species.ilike.${term}`);
  }

  // filtros exactos (excluyendo health_status)
  Object.entries(otherFilters).forEach(([key, value]) => {
    if (["search"].includes(key)) return;
    if (value === undefined || value === null || value === "") return;

    // coerción para booleanos enviados como string
    let v = value;
    if (key === "is_adopted" && typeof value === "string") {
      if (value === "true") v = true;
      if (value === "false") v = false;
    }
    query = query.eq(key, v);
  });

  const { data, error } = await query;
  
  if (error) {
    return { data, error };
  }

  // Si hay filtro de health_status, obtener el último status de cada planta y filtrar
  if (healthStatusFilter && data) {
    const filteredData = [];
    
    // Obtener todos los status en una sola query más eficiente
    const plantIds = data.map(p => p.id);
    
    if (plantIds.length > 0) {
      // Obtener el último status de cada planta
      const { data: allStatuses } = await supabase
        .from("plant_status")
        .select("plant_id, status, recorded_at")
        .in("plant_id", plantIds)
        .order("recorded_at", { ascending: false });

      // Crear un mapa de plant_id -> último status
      const latestStatusMap = {};
      if (allStatuses) {
        allStatuses.forEach(status => {
          if (!latestStatusMap[status.plant_id] || 
              new Date(status.recorded_at) > new Date(latestStatusMap[status.plant_id].recorded_at)) {
            latestStatusMap[status.plant_id] = status;
          }
        });
      }

      // Mapear valores del filtro a valores de la BD si es necesario
           const statusMap = {
             'healthy': ['healthy', 'excellent'], // Mapear excellent a healthy
             'recovering': ['recovering', 'needs_care'], // Compatibilidad con valores legacy
             'bad': ['bad', 'critical', 'dying', 'sick'], // Compatibilidad con valores legacy
           };
      
      const statusValuesToMatch = statusMap[healthStatusFilter] || [healthStatusFilter];
      
      // Filtrar plantas y agregar health_status
      data.forEach(plant => {
        const latestStatus = latestStatusMap[plant.id];
        if (latestStatus && statusValuesToMatch.includes(latestStatus.status)) {
          plant.health_status = latestStatus.status;
          filteredData.push(plant);
        } else if (!latestStatus && healthStatusFilter === "healthy") {
          // Si no hay status registrado y se busca "healthy", incluir la planta
          plant.health_status = "healthy";
          filteredData.push(plant);
        }
      });
    }
    
    return { data: filteredData, error: null };
  }

  // Si no hay filtro de health_status, agregar el último status a cada planta si existe
  if (data && data.length > 0) {
    const plantIds = data.map(p => p.id);
    const { data: allStatuses } = await supabase
      .from("plant_status")
      .select("plant_id, status, recorded_at")
      .in("plant_id", plantIds)
      .order("recorded_at", { ascending: false });

    const latestStatusMap = {};
    if (allStatuses) {
      allStatuses.forEach(status => {
        if (!latestStatusMap[status.plant_id] || 
            new Date(status.recorded_at) > new Date(latestStatusMap[status.plant_id].recorded_at)) {
          latestStatusMap[status.plant_id] = status;
        }
      });
    }

    // Agregar health_status a cada planta desde plant_status
    // IMPORTANTE: No asignar valor por defecto, usar el último status conocido
    // Si no hay status, dejar undefined para que el frontend sepa que no hay datos
    data.forEach(plant => {
      const latestStatus = latestStatusMap[plant.id];
      if (latestStatus) {
        // Usar el status real de la tabla plant_status
        plant.health_status = latestStatus.status;
      }
      // Si no hay latestStatus, NO asignar valor por defecto
      // Esto permite que el frontend detecte que no hay datos de la Raspberry
    });
  }

  return { data, error };
}

export async function findPlantById(id) {
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function insertPlant(plant) {
  return await supabase.from("plants").insert([plant]).select().single();
}

export async function updatePlant(id, updateData) {
  return await supabase
    .from("plants")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
}

export async function deletePlant(id) {
  const { error } = await supabase.from("plants").delete().eq("id", id);
  return { data: error ? null : { id }, error };
}

export async function assignAccessoryToPlant(plantId, accessoryId) {
  return await supabase
    .from("plants_accessories")
    .insert([{ plant_id: plantId, accessory_id: accessoryId }])
    .select()
    .single();
}

export async function findPlantByDeviceId(deviceId) {
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("device_id", deviceId)
    .single();
  return { data, error };
}

export default {
  findAllPlants,
  findPlantById,
  insertPlant,
  updatePlant,
  deletePlant,
  assignAccessoryToPlant,
  findPlantByDeviceId,
};
