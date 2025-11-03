export function createDonationModel(payload) {
  const { user_id, plant_id, amount, accessory_type, status, payment_method } = payload;

  if (!user_id || !plant_id || !amount) {
    throw new Error("user_id, plant_id y amount son requeridos");
  }

  return {
    user_id,
    plant_id,
    amount,
    accessory_type: accessory_type || null,
    status: status || "pending",
    payment_method: payment_method || null,
    created_at: new Date().toISOString(),
  };
}

export function sanitizeDonationUpdate(payload) {
  const allowed = ["user_id", "plant_id", "amount", "accessory_type", "status", "payment_method"];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined && payload[k] !== null) update[k] = payload[k];
  });
  update.updated_at = new Date().toISOString();
  return update;
}
