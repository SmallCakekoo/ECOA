export function createAchievementModel(payload) {
  const {
    name,
    description,
    category,
    difficulty = "easy",
    points_reward = 0,
    icon_url,
    requirements,
  } = payload;
  if (!name || !description || !category) {
    throw new Error("name, description y category son requeridos");
  }
  if (!["easy", "medium", "hard", "expert"].includes(difficulty)) {
    throw new Error("Dificultad inválida");
  }
  if (points_reward < 0) {
    throw new Error("Los puntos de recompensa no pueden ser negativos");
  }
  return {
    name,
    description,
    category,
    difficulty,
    points_reward,
    icon_url: icon_url || null,
    requirements: requirements || null,
    created_at: new Date().toISOString(),
  };
}

export function sanitizeAchievementUpdate(payload) {
  const blocked = new Set(["id", "created_at"]);
  const update = {};
  Object.keys(payload || {}).forEach((k) => {
    if (!blocked.has(k) && payload[k] !== undefined) update[k] = payload[k];
  });
  update.updated_at = new Date().toISOString();
  return update;
}
