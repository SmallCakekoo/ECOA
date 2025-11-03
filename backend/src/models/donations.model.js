export function createDonationModel(payload) {
  const { user_id, plant_id, amount, accessory_type } = payload;

  if (!user_id || !plant_id || amount === undefined || amount === null) {
    throw new Error("user_id, plant_id y amount son requeridos");
  }

  // Validar que amount sea un número
  const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(amountNum) || amountNum < 0) {
    throw new Error("amount debe ser un número válido mayor o igual a 0");
  }

  // Solo incluir campos que existen en la tabla donations
  // No incluir: created_at (Supabase lo maneja), status (no existe), payment_method (no existe)
  const donationData = {
    user_id,
    plant_id,
    amount: amountNum,
    accessory_type: accessory_type || null,
  };

  return donationData;
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
