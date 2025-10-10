export function createPlantModel(payload) {
  const {
    user_id,
    name,
    species,
    description,
    image_url,
    status = "active",
    health_status = "healthy",
    water_level = 0,
    light_level = 0,
    temperature = 0,
    humidity = 0,
  } = payload;

  if (!user_id || !name || !species) {
    throw new Error("user_id, name y species son requeridos");
  }

  return {
    user_id,
    name,
    species,
    description: description || null,
    image_url: image_url || null,
    status,
    health_status,
    water_level,
    light_level,
    temperature,
    humidity,
    created_at: new Date().toISOString(),
  };
}

export function sanitizePlantUpdate(payload) {
  const blocked = new Set(["id", "user_id", "created_at"]);
  const update = {};
  Object.keys(payload || {}).forEach((k) => {
    if (!blocked.has(k) && payload[k] !== undefined) update[k] = payload[k];
  });
  update.updated_at = new Date().toISOString();
  return update;
}

export function sanitizePlantMetrics(payload) {
  const allowed = [
    "water_level",
    "light_level",
    "temperature",
    "humidity",
    "health_status",
  ];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined && payload[k] !== null) update[k] = payload[k];
  });
  update.updated_at = new Date().toISOString();
  return update;
}
