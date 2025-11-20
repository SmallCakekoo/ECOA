import { insertPlantStats } from "../db/plant_stats.db.js";
import {
  insertPlantStatus,
  updatePlantStatus,
  getLatestPlantStatus,
} from "../db/plant_status.db.js";
import { findAllPlants } from "../db/plants.db.js";
import {
  findDeviceBySerial,
  insertDevice as insertDeviceRecord,
  updateDevice as updateDeviceRecord,
} from "../db/devices.db.js";
import {
  calculatePlantStatus,
  getEmojiMatrix,
  emojiToMatrix,
} from "../services/plant-status.service.js";
import {
  createDeviceModel,
  sanitizeDeviceUpdate,
} from "../models/devices.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  const message = error?.message || "Error interno del servidor";
  return res.status(status).json({ success: false, message });
};

/**
 * POST /sensor-data
 * Recibe datos de sensores de la Raspberry Pi
 * Body: { temperature, light, soil_moisture, plant_id? }
 */
export const receiveSensorData = async (req, res) => {
  try {
    const {
      temperature,
      light,
      soil_moisture,
      plant_id,
      device_serial,
      device_model,
      device_location,
      foundation_id,
    } = req.body;

    // Validar datos requeridos
    if (
      temperature === undefined ||
      light === undefined ||
      soil_moisture === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "temperature, light y soil_moisture son requeridos",
      });
    }

    // Si no hay plant_id, buscar la primera planta adoptada
    let targetPlantId = plant_id;
    if (!targetPlantId) {
      const { data: plants, error: plantsError } = await findAllPlants({
        is_adopted: true,
      });

      if (plantsError || !plants || plants.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No hay plantas adoptadas. Se requiere plant_id o al menos una planta adoptada.",
        });
      }

      // Usar la primera planta adoptada
      targetPlantId = plants[0].id;
      console.log(
        `⚠️ No se proporcionó plant_id, usando primera planta adoptada: ${targetPlantId}`
      );
    }

    let deviceRecord = null;

    if (device_serial) {
      // Obtener el nombre de la fundación desde la tabla users si foundation_id está disponible
      let location = device_location || "Unknown";
      if (foundation_id) {
        try {
          const { findUserById } = await import("../db/users.db.js");
          const { data: foundationUser, error: foundationError } = await findUserById(foundation_id);
          
          if (!foundationError && foundationUser && foundationUser.name) {
            location = foundationUser.name;
            console.log(`📍 Location obtenida desde fundación: ${location}`);
          } else {
            // Si no se encuentra en users, intentar buscar en foundations
            const FoundationsDB = (await import("../db/foundations.db.js")).default;
            try {
              const foundation = await FoundationsDB.getById(foundation_id);
              if (foundation && foundation.name) {
                location = foundation.name;
                console.log(`📍 Location obtenida desde tabla foundations: ${location}`);
              }
            } catch (foundationDbError) {
              console.warn("⚠️ No se pudo obtener nombre de fundación, usando location proporcionado o 'Unknown'");
            }
          }
        } catch (error) {
          console.warn("⚠️ Error obteniendo location desde fundación:", error.message);
        }
      }

      const { data: existingDevice, error: deviceLookupError } =
        await findDeviceBySerial(device_serial);

      if (deviceLookupError) {
        console.error("Error buscando device:", deviceLookupError);
        throw deviceLookupError;
      }

      if (existingDevice) {
        const deviceUpdatePayload = sanitizeDeviceUpdate({
          model: device_model,
          location: location,
          foundation_id,
          last_connection: new Date().toISOString(),
        });
        const { data: updatedDevice, error: deviceUpdateError } =
          await updateDeviceRecord(existingDevice.id, deviceUpdatePayload);

        if (deviceUpdateError) {
          console.error("Error actualizando device:", deviceUpdateError);
          throw deviceUpdateError;
        }

        deviceRecord = updatedDevice;
      } else {
        const baseDevicePayload = createDeviceModel({
          serial_number: device_serial,
          model: device_model || "Raspberry Pi",
          location: location,
          foundation_id,
        });

        const { data: createdDevice, error: deviceCreateError } =
          await insertDeviceRecord(baseDevicePayload);

        if (deviceCreateError) {
          console.error("Error creando device:", deviceCreateError);
          throw deviceCreateError;
        }

        deviceRecord = createdDevice;
      }
    }

    // Guardar datos en plant_stats - Actualizar si existe, crear si no
    const statsData = {
      plant_id: targetPlantId,
      soil_moisture: parseFloat(soil_moisture) || 0,
      temperature: parseFloat(temperature) || 0,
      light: parseFloat(light) || 0,
      recorded_at: new Date().toISOString(),
    };

    // Buscar si ya existe una estadística para esta planta
    const { getLatestPlantStats } = await import("../db/plant_stats.db.js");
    const { updatePlantStats } = await import("../db/plant_stats.db.js");
    const { data: existingStats, error: statsCheckError } = await getLatestPlantStats(targetPlantId);

    let savedStats;

    if (!statsCheckError && existingStats && existingStats.plant_id === targetPlantId) {
      // Actualizar estadística existente
      const updateData = {
        soil_moisture: statsData.soil_moisture,
        temperature: statsData.temperature,
        light: statsData.light,
        recorded_at: statsData.recorded_at,
      };

      const { data: updatedStats, error: updateError } = await updatePlantStats(
        existingStats.id,
        updateData
      );

      if (updateError) {
        console.error("Error actualizando plant_stats:", updateError);
        throw updateError;
      }

      savedStats = updatedStats;
    } else {
      // Crear nueva estadística
      const { data: createdStats, error: statsError } = await insertPlantStats(
        statsData
      );

      if (statsError) {
        console.error("Error guardando plant_stats:", statsError);
        throw statsError;
      }

      savedStats = createdStats;
    }

    // Calcular estado de la planta
    const statusData = calculatePlantStatus(
      statsData.temperature,
      statsData.light,
      statsData.soil_moisture
    );

    // Verificar si ya existe un status para esta planta
    const { data: existingStatus, error: statusCheckError } =
      await getLatestPlantStatus(targetPlantId);

    let savedStatus;

    if (
      !statusCheckError &&
      existingStatus &&
      existingStatus.plant_id === targetPlantId
    ) {
      // Actualizar status existente
      const updateData = {
        status: statusData.status,
        mood_index: statusData.mood_index,
        mood_face: statusData.mood_face,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedStatus, error: updateError } =
        await updatePlantStatus(existingStatus.id, updateData);

      if (updateError) {
        console.error("Error actualizando plant_status:", updateError);
        throw updateError;
      }

      savedStatus = updatedStatus;
    } else {
      // Crear nuevo status
      const newStatusData = {
        plant_id: targetPlantId,
        status: statusData.status,
        mood_index: statusData.mood_index,
        mood_face: statusData.mood_face,
        recorded_at: new Date().toISOString(),
      };

      const { data: createdStatus, error: createError } =
        await insertPlantStatus(newStatusData);

      if (createError) {
        console.error("Error creando plant_status:", createError);
        throw createError;
      }

      savedStatus = createdStatus;
    }

    // Emitir evento Socket.IO
    req.io?.emit("sensor_data_received", {
      type: "sensor_data_received",
      data: {
        stats: savedStats,
        status: savedStatus,
        device: deviceRecord,
      },
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: "Datos de sensores recibidos y procesados",
      data: {
        stats: savedStats,
        status: savedStatus,
        device: deviceRecord,
      },
    });
  } catch (error) {
    return handleError(error, res);
  }
};

/**
 * GET /emoji
 * Obtiene la matriz 8x8 del emoji actual
 * Query params: plant_id? (opcional, si no se proporciona usa la primera planta adoptada)
 */
export const getEmoji = async (req, res) => {
  try {
    const { plant_id } = req.query;

    // Si no hay plant_id, buscar la primera planta adoptada
    let targetPlantId = plant_id;
    if (!targetPlantId) {
      const { data: plants, error: plantsError } = await findAllPlants({
        is_adopted: true,
      });

      if (plantsError || !plants || plants.length === 0) {
        // Si no hay plantas, devolver emoji neutral por defecto
        const defaultMatrix = getEmojiMatrix("recovering", 0.5);
        return res.status(200).json({
          success: true,
          matrix: defaultMatrix,
          status: "recovering",
          mood_face: "😐",
          message: "No hay plantas adoptadas, usando emoji por defecto",
        });
      }

      targetPlantId = plants[0].id;
    }

    // Obtener último status de la planta
    const { data: latestStatus, error: statusError } =
      await getLatestPlantStatus(targetPlantId);

    if (statusError || !latestStatus) {
      // Si no hay status, devolver emoji neutral
      const defaultMatrix = getEmojiMatrix("recovering", 0.5);
      return res.status(200).json({
        success: true,
        matrix: defaultMatrix,
        status: "recovering",
        mood_face: "😐",
        message: "No hay estado disponible, usando emoji por defecto",
      });
    }

    // Generar matriz basada en el estado
    const matrix = getEmojiMatrix(
      latestStatus.status,
      latestStatus.mood_index
    );

    return res.status(200).json({
      success: true,
      matrix,
      status: latestStatus.status,
      mood_face: latestStatus.mood_face,
      mood_index: latestStatus.mood_index,
      plant_id: targetPlantId,
    });
  } catch (error) {
    return handleError(error, res);
  }
};

export default {
  receiveSensorData,
  getEmoji,
};

