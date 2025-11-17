/**
 * Servicio para calcular el estado de la planta y generar matrices de emoji
 */

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    mood_face: "😊",
    emojiMatrixKey: "happy",
  },
  recovering: {
    label: "Recovering",
    mood_face: "😐",
    emojiMatrixKey: "neutral",
  },
  bad: {
    label: "Bad",
    mood_face: "😢",
    emojiMatrixKey: "sad",
  },
};

const DEFAULT_STATUS_KEY = "recovering";

function normalizeStatusKey(status) {
  const key = (status || "").toLowerCase();
  return STATUS_CONFIG[key] ? key : DEFAULT_STATUS_KEY;
}

// Matrices de emoji predefinidas (8x8)
const EMOJI_MATRICES = {
  // Feliz (Healthy)
  happy: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ],
  // Neutral (Recovering)
  neutral: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ],
  // Triste (Bad)
  sad: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ],
};

/**
 * Calcula el estado de la planta basado en los valores de los sensores
 * @param {number} temperature - Temperatura en °C
 * @param {number} light - Luminosidad en lx
 * @param {number} soil_moisture - Humedad del suelo en %
 * @returns {Object} { status, mood_index, mood_face }
 */
export function calculatePlantStatus(temperature, light, soil_moisture) {
  // Valores ideales (ajustables según el tipo de planta)
  const IDEAL_TEMP_MIN = 18;
  const IDEAL_TEMP_MAX = 26;
  const IDEAL_LIGHT_MIN = 200; // lx
  const IDEAL_LIGHT_MAX = 1000; // lx
  const IDEAL_MOISTURE_MIN = 40;
  const IDEAL_MOISTURE_MAX = 70;

  // Calcular scores individuales (0-1)
  let tempScore = 1;
  if (temperature < IDEAL_TEMP_MIN) {
    tempScore = Math.max(0, 1 - (IDEAL_TEMP_MIN - temperature) / 10);
  } else if (temperature > IDEAL_TEMP_MAX) {
    tempScore = Math.max(0, 1 - (temperature - IDEAL_TEMP_MAX) / 10);
  }

  let lightScore = 1;
  if (light < IDEAL_LIGHT_MIN) {
    lightScore = Math.max(0, light / IDEAL_LIGHT_MIN);
  } else if (light > IDEAL_LIGHT_MAX) {
    lightScore = Math.max(0, 1 - (light - IDEAL_LIGHT_MAX) / 2000);
  }

  let moistureScore = 1;
  if (soil_moisture < IDEAL_MOISTURE_MIN) {
    moistureScore = Math.max(0, soil_moisture / IDEAL_MOISTURE_MIN);
  } else if (soil_moisture > IDEAL_MOISTURE_MAX) {
    moistureScore = Math.max(0, 1 - (soil_moisture - IDEAL_MOISTURE_MAX) / 30);
  }

  // Score general (promedio ponderado)
  // La humedad es más crítica, así que tiene más peso
  const overallScore =
    tempScore * 0.3 + lightScore * 0.3 + moistureScore * 0.4;

  // Determinar estado
  let status;
  let mood_index;
  let mood_face;

  if (overallScore >= 0.7) {
    status = "healthy";
  } else if (overallScore >= 0.4) {
    status = "recovering";
  } else {
    status = "bad";
  }

  const statusKey = normalizeStatusKey(status);
  const statusConfig = STATUS_CONFIG[statusKey];
  mood_index = overallScore;
  mood_face = statusConfig.mood_face;

  return {
    status: statusKey,
    mood_index: Math.round(mood_index * 100) / 100, // Redondear a 2 decimales
    mood_face,
  };
}

/**
 * Obtiene la matriz 8x8 del emoji basado en el estado
 * @param {string} status - Estado de la planta (Healthy, Recovering, Bad)
 * @param {number} mood_index - Índice de ánimo (0-1)
 * @returns {Array<Array<number>>} Matriz 8x8
 */
export function getEmojiMatrix(status, mood_index = null) {
  // Mapear estado a tipo de emoji
  let statusKey = normalizeStatusKey(status);
  let emojiType = STATUS_CONFIG[statusKey].emojiMatrixKey;

  // Si hay mood_index, podemos interpolar entre estados
  if (mood_index !== null && mood_index !== undefined) {
    if (mood_index >= 0.7) {
      emojiType = STATUS_CONFIG.healthy.emojiMatrixKey;
      statusKey = "healthy";
    } else if (mood_index >= 0.4) {
      emojiType = STATUS_CONFIG.recovering.emojiMatrixKey;
      statusKey = "recovering";
    } else {
      emojiType = STATUS_CONFIG.bad.emojiMatrixKey;
      statusKey = "bad";
    }
  }

  return EMOJI_MATRICES[emojiType] || EMOJI_MATRICES.neutral;
}

/**
 * Convierte un emoji string a matriz (para compatibilidad)
 * @param {string} mood_face - Emoji string (😊, 😐, 😢)
 * @returns {Array<Array<number>>} Matriz 8x8
 */
export function emojiToMatrix(mood_face) {
  const emojiMap = {
    "😊": "happy",
    "😐": "neutral",
    "😢": "sad",
  };

  const emojiType = emojiMap[mood_face] || "neutral";
  return EMOJI_MATRICES[emojiType];
}

export default {
  calculatePlantStatus,
  getEmojiMatrix,
  emojiToMatrix,
  EMOJI_MATRICES,
  STATUS_CONFIG,
  normalizeStatusKey,
};

