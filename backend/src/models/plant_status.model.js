export function createPlantStatusModel(payload) {
  const { plant_id, status, mood_index, mood_face } = payload;

  if (!plant_id || !status) {
    throw new Error("plant_id y status son requeridos");
  }

  return {
    plant_id,
    status,
    mood_index: mood_index || 0,
    mood_face: mood_face || "😐",
    recorded_at: new Date().toISOString(),
  };
}

export function sanitizePlantStatusUpdate(payload) {
  const allowed = ["plant_id", "status", "mood_index", "mood_face"];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined && payload[k] !== null) update[k] = payload[k];
  });
  update.recorded_at = new Date().toISOString();
  return update;
}
