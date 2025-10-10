export function createPlantStatsModel(payload) {
  const { plant_id, soil_moisture, temperature, light } = payload;

  if (!plant_id) {
    throw new Error("plant_id es requerido");
  }

  return {
    plant_id,
    soil_moisture: soil_moisture || 0,
    temperature: temperature || 0,
    light: light || 0,
    recorded_at: new Date().toISOString(),
  };
}

export function sanitizePlantStatsUpdate(payload) {
  const allowed = ["plant_id", "soil_moisture", "temperature", "light"];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined && payload[k] !== null) update[k] = payload[k];
  });
  update.updated_at = new Date().toISOString();
  return update;
}
