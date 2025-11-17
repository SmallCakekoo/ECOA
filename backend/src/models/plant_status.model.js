const ALLOWED_STATUS = ["healthy", "recovering", "bad"];

function normalizeStatusValue(value) {
  if (!value || typeof value !== "string") {
    throw new Error(
      `status es requerido y debe ser uno de: ${ALLOWED_STATUS.join(", ")}`
    );
  }

  const normalized = value.trim().toLowerCase();

  if (!ALLOWED_STATUS.includes(normalized)) {
    throw new Error(
      `status inválido. Valores permitidos: ${ALLOWED_STATUS.join(", ")}`
    );
  }

  return normalized;
}

export function createPlantStatusModel(payload) {
  const { plant_id, status, mood_index, mood_face } = payload;

  if (!plant_id || !status) {
    throw new Error("plant_id y status son requeridos");
  }

  const normalizedStatus = normalizeStatusValue(status);

  return {
    plant_id,
    status: normalizedStatus,
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

  if (update.status) {
    update.status = normalizeStatusValue(update.status);
  }

  update.recorded_at = new Date().toISOString();
  return update;
}

export { ALLOWED_STATUS, normalizeStatusValue };
