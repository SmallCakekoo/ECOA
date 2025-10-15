export function createDeviceModel(payload) {
  const { serial_number, model, location, foundation_id } = payload;

  if (!serial_number || !model || !location) {
    throw new Error("serial_number, model y location son requeridos");
  }

  return {
    serial_number,
    model,
    location,
    foundation_id: foundation_id || null,
    last_connection: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

export function sanitizeDeviceUpdate(payload) {
  const allowed = [
    "serial_number",
    "model",
    "location",
    "foundation_id",
    "last_connection",
  ];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined && payload[k] !== null) update[k] = payload[k];
  });
  update.updated_at = new Date().toISOString();
  return update;
}
