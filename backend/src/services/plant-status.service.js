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
 * Normaliza los valores de los sensores
 * @param {number} temperature - Temperatura en °C
 * @param {number} light - Luminosidad (0-1023 o 0-1 según sensor)
 * @param {number} soil_moisture - Humedad del suelo en %
 * @returns {Object} { temp, light, humidity } valores normalizados
 */
function normalizeSensorValues(temperature, light, soil_moisture) {
  // Normalizar temperatura: rango aceptable 15-35°C
  const TEMP_MIN = 15;
  const TEMP_MAX = 35;
  const temp = Math.max(TEMP_MIN, Math.min(TEMP_MAX, temperature));

  // Normalizar luz: si está en rango 0-1, convertir a 0-1023
  // Asumimos que valores > 1 están en escala 0-1023
  let normalizedLight = light;
  if (light <= 1) {
    normalizedLight = light * 1023;
  }
  normalizedLight = Math.max(0, Math.min(1023, normalizedLight));

  // Normalizar humedad: 0-100%
  const humidity = Math.max(0, Math.min(100, soil_moisture));

  return { temp, light: normalizedLight, humidity };
}

/**
 * Calcula el estado de la planta basado en los valores de los sensores
 * Lógica unificada para JS y Python
 * @param {number} temperature - Temperatura en °C
 * @param {number} light - Luminosidad (0-1023 o 0-1 según sensor)
 * @param {number} soil_moisture - Humedad del suelo en %
 * @returns {Object} { status, mood_index, mood_face }
 */
export function calculatePlantStatus(temperature, light, soil_moisture) {
  return computeMood(temperature, light, soil_moisture);
}

/**
 * Función unificada para calcular el mood index y estado de la planta
 * Reglas:
 * - bad si luz demasiado alta (>900) o demasiado baja (<100)
 * - bad si temperatura demasiado alta (>35) o demasiado baja (<15)
 * - bad si humedad demasiado alta (>80)
 * - healthy si valores dentro de rango
 * - recovering si humedad ligeramente alta (70-80)
 * 
 * @param {number} temperature - Temperatura en °C
 * @param {number} light - Luminosidad (0-1023 o 0-1 según sensor)
 * @param {number} soil_moisture - Humedad del suelo en %
 * @returns {Object} { status, mood_index, mood_face }
 */
export function computeMood(temperature, light, soil_moisture) {
  // Normalizar valores
  const { temp, light: normalizedLight, humidity } = normalizeSensorValues(
    temperature,
    light,
    soil_moisture
  );

  // Rangos aceptables
  const TEMP_MIN = 15;
  const TEMP_MAX = 35;
  const LIGHT_MIN = 100; // Mínimo aceptable
  const LIGHT_MAX = 900; // Máximo aceptable
  const HUMIDITY_MAX_ACCEPTABLE = 80; // Máximo aceptable
  const HUMIDITY_RECOVERING_MIN = 70; // Inicio de rango "recovering"

  // Evaluar condiciones críticas (bad)
  let isBad = false;
  let reasons = [];

  // Temperatura fuera de rango
  if (temp < TEMP_MIN || temp > TEMP_MAX) {
    isBad = true;
    reasons.push(`temperatura ${temp < TEMP_MIN ? 'muy baja' : 'muy alta'}`);
  }

  // Luz fuera de rango
  if (normalizedLight < LIGHT_MIN || normalizedLight > LIGHT_MAX) {
    isBad = true;
    reasons.push(`luz ${normalizedLight < LIGHT_MIN ? 'muy baja' : 'muy alta'}`);
  }

  // Humedad demasiado alta
  if (humidity > HUMIDITY_MAX_ACCEPTABLE) {
    isBad = true;
    reasons.push('humedad muy alta');
  }

  // Si hay alguna condición crítica, retornar bad
  if (isBad) {
    const statusKey = normalizeStatusKey("bad");
    const statusConfig = STATUS_CONFIG[statusKey];
    
    // Calcular mood_index basado en qué tan mal está
    let mood_index = 0.2; // Base para "bad"
    
    // Ajustar según número de problemas
    if (reasons.length === 1) {
      mood_index = 0.3;
    } else if (reasons.length >= 2) {
      mood_index = 0.1;
    }

    return {
      status: statusKey,
      mood_index: Math.round(mood_index * 100) / 100,
      mood_face: statusConfig.mood_face,
    };
  }

  // Evaluar condición recovering (humedad ligeramente alta)
  if (humidity >= HUMIDITY_RECOVERING_MIN && humidity <= HUMIDITY_MAX_ACCEPTABLE) {
    const statusKey = normalizeStatusKey("recovering");
    const statusConfig = STATUS_CONFIG[statusKey];
    
    // Calcular mood_index: más cerca de 80 = peor, más cerca de 70 = mejor
    const humidityScore = 1 - ((humidity - HUMIDITY_RECOVERING_MIN) / (HUMIDITY_MAX_ACCEPTABLE - HUMIDITY_RECOVERING_MIN));
    const mood_index = 0.4 + (humidityScore * 0.3); // Entre 0.4 y 0.7

    return {
      status: statusKey,
      mood_index: Math.round(mood_index * 100) / 100,
      mood_face: statusConfig.mood_face,
    };
  }

  // Si llegamos aquí, está healthy
  // Calcular mood_index basado en qué tan cerca están los valores del ideal
  const tempScore = temp >= TEMP_MIN && temp <= TEMP_MAX ? 1 : 0;
  const lightScore = normalizedLight >= LIGHT_MIN && normalizedLight <= LIGHT_MAX ? 1 : 0;
  const humidityScore = humidity >= 0 && humidity < HUMIDITY_RECOVERING_MIN ? 1 : 0;

  // Promedio ponderado (todos tienen igual peso)
  const overallScore = (tempScore + lightScore + humidityScore) / 3;
  
  // Asegurar que healthy tenga un mood_index alto
  const mood_index = Math.max(0.7, 0.7 + (overallScore * 0.3)); // Entre 0.7 y 1.0

  const statusKey = normalizeStatusKey("healthy");
  const statusConfig = STATUS_CONFIG[statusKey];

  return {
    status: statusKey,
    mood_index: Math.round(mood_index * 100) / 100,
    mood_face: statusConfig.mood_face,
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

