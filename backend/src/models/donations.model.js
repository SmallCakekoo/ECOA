export function createDonationModel(payload) {
  const { user_id, plant_id, amount, accessory_type } = payload;

  if (!user_id || !plant_id || !amount) {
    throw new Error("user_id, plant_id y amount son requeridos");
  }

  return {
    user_id,
    plant_id,
    amount,
    accessory_type: accessory_type || null,
    created_at: new Date().toISOString(),
  };
}

export function sanitizeDonationUpdate(payload) {
  const allowed = ["user_id", "plant_id", "amount", "accessory_type"];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined && payload[k] !== null) update[k] = payload[k];
  });
  update.updated_at = new Date().toISOString();
  return update;
}
