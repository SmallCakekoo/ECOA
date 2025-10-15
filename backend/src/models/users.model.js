export function createUserModel(payload) {
  const { name, email, avatar_url, level, experience_points } = payload;
  if (!name || !email) {
    throw new Error("Nombre y email son requeridos");
  }
  return {
    name,
    email,
    avatar_url: avatar_url || null,
    level: level || 1,
    experience_points: experience_points || 0,
    created_at: new Date().toISOString(),
  };
}

export function sanitizeUserUpdate(payload) {
  const allowed = ["name", "email", "avatar_url", "level", "experience_points"];
  const update = {};
  allowed.forEach((k) => {
    if (payload[k] !== undefined) update[k] = payload[k];
  });
  update.updated_at = new Date().toISOString();
  return update;
}
