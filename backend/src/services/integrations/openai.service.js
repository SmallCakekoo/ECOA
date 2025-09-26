// backend/src/integrations/openai.js
// Integración con Google Gemini para que las plantas "hablen"
// Usando la API de Gemini para que respondan como si fueran seres vivos

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyAVNvzh5tikBquAlM7fHWO8Sx92xhYNMiA";

// Inicializar cliente Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Hace que una planta "hable" usando Google Gemini
 * @param {string} message - El mensaje del usuario a la planta
 * @param {string} plantType - Tipo de planta (opcional)
 * @param {string} plantName - Nombre de la planta (opcional)
 * @returns {Promise<Object>} - Respuesta JSON con el mensaje de la planta
 */
export async function generatePlantMessage(
  message,
  plantType = "planta",
  plantName = null
) {
  try {
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return {
        success: false,
        error: "El mensaje no puede estar vacío",
        message: "Por favor, escribe algo a tu planta",
      };
    }

    const plantNameText = plantName ? ` (me llamo ${plantName})` : "";
    const systemPrompt = `Eres una ${plantType}${plantNameText} que puede hablar y comunicarse con su dueño.
Responde como si fueras la planta misma, con personalidad, emociones y conocimiento sobre tu propio cuidado.
Usa un tono cariñoso, agradecido y a veces travieso.
Menciona cosas como: cómo te sientes, qué necesitas, agradece el cuidado,
da consejos sobre tu cuidado desde tu perspectiva como planta.
Responde en primera persona como si fueras la planta hablando directamente a tu dueño.
Mantén las respuestas entre 2-4 oraciones, siendo conversacional y emotiva.`;

    // Modelo: gemini-1.5-flash (puedes cambiarlo por gemini-1.5-pro)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nDueño: "${message}"` }],
        },
      ],
    });

    const generatedMessage =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!generatedMessage) {
      throw new Error("No se pudo generar una respuesta válida");
    }

    return {
      success: true,
      message: generatedMessage.trim(),
      plant_response: {
        plant_type: plantType,
        plant_name: plantName,
        personality: "cariñosa y agradecida",
      },
      model: "gemini-1.5-flash",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error en generatePlantMessage:", error);
    return {
      success: false,
      error: error.message,
      message:
        "🌱 *susurra suavemente* Hmm... no puedo escucharte bien ahora. ¿Puedes intentar de nuevo?",
      fallback: true,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Hace que la planta dé consejos sobre su propio cuidado
 */
export async function generatePlantCareTips(
  plantType,
  issue = null,
  plantName = null
) {
  try {
    let message = "¿Podrías darme consejos sobre cómo cuidarte mejor?";
    if (issue) message += ` Especialmente sobre: ${issue}`;
    return await generatePlantMessage(message, plantType, plantName);
  } catch (error) {
    console.error("Error en generatePlantCareTips:", error);
    return {
      success: false,
      error: error.message,
      message:
        "🌱 No puedo darte consejos ahora, pero siempre agradezco tu cuidado.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Hace que la planta se "diagnostique" a sí misma
 */
export async function diagnosePlantProblem(
  symptoms,
  plantType = "planta",
  plantName = null
) {
  try {
    const message = `He notado que tengo estos síntomas: ${symptoms}. ¿Qué me está pasando y cómo me puedes ayudar?`;
    return await generatePlantMessage(message, plantType, plantName);
  } catch (error) {
    console.error("Error en diagnosePlantProblem:", error);
    return {
      success: false,
      error: error.message,
      message:
        "🌱 No me siento muy bien, pero no puedo explicarte qué me pasa ahora mismo.",
      timestamp: new Date().toISOString(),
    };
  }
}
