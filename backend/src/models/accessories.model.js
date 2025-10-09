export function createAccessoryModel(payload) {
  const { name, price_estimate, description, image } = payload;

  if (!name) {
    throw new Error("name es requerido");
  }

  return {
    name,
    price_estimate: price_estimate || 0,
    description: description || null,
    image: image || null,
    created_at: new Date().toISOString(),
  };
}

export function sanitizeAccessoryUpdate(payload) {
  const allowed = ["name", "price_estimate", "description", "image"];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined && payload[k] !== null) update[k] = payload[k];
  });
  update.updated_at = new Date().toISOString();
  return update;
}
