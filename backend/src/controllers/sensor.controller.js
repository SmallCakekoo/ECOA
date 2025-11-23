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
        message: "temperature, light y soil_moisture son requeridos",
      });
    }

    // Determinar el plant_id correcto basado en device_serial
    let targetPlantId = plant_id;
    let deviceRecord = null;

    if (device_serial) {
      // Obtener el nombre de la fundación desde la tabla users si foundation_id está disponible
      let location = device_location || "Unknown";
      if (foundation_id) {
        try {
          const { findUserById } = await import("../db/users.db.js");
          const { data: foundationUser, error: foundationError } =
            await findUserById(foundation_id);

          if (!foundationError && foundationUser && foundationUser.name) {
            location = foundationUser.name;
            console.log(`📍 Location obtenida desde fundación: ${location}`);
          } else {
            // Si no se encuentra en users, intentar buscar en foundations
            const FoundationsDB = (await import("../db/foundations.db.js"))
              .default;
            try {
              const foundation = await FoundationsDB.getById(foundation_id);
              if (foundation && foundation.name) {
                location = foundation.name;
                console.log(
                  `📍 Location obtenida desde tabla foundations: ${location}`
                );
              }
            } catch (foundationDbError) {
              console.warn(
                "⚠️ No se pudo obtener nombre de fundación, usando location proporcionado o 'Unknown'"
              );
            }
          }
        } catch (error) {
          console.warn(
            "⚠️ Error obteniendo location desde fundación:",
            error.message
          );
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

        // Si no se proporcionó plant_id, buscar la planta asociada a este device
        if (!targetPlantId && existingDevice.id) {
          const { findPlantByDeviceId } = await import("../db/plants.db.js");
          const { data: plantWithDevice, error: plantError } =
            await findPlantByDeviceId(existingDevice.id);

          if (!plantError && plantWithDevice) {
            targetPlantId = plantWithDevice.id;
            console.log(
              `✅ Plant_id determinado desde device_serial: ${device_serial} -> plant_id: ${targetPlantId}`
            );
          }
        }
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

    // Si aún no hay plant_id, buscar la primera planta adoptada (fallback)
    if (!targetPlantId) {
      const { data: plants, error: plantsError } = await findAllPlants({
        is_adopted: true,
      });

      if (plantsError || !plants || plants.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No se pudo determinar plant_id. Se requiere plant_id, device_serial asociado a una planta, o al menos una planta adoptada.",
        });
      }

      // Usar la primera planta adoptada como último recurso
      targetPlantId = plants[0].id;
      console.log(
        `⚠️ No se pudo determinar plant_id desde device, usando primera planta adoptada: ${targetPlantId}`
      );
    }

    // Validar que el plant_id existe
    const { findPlantById } = await import("../db/plants.db.js");
    const { data: plantExists, error: plantCheckError } = await findPlantById(
      targetPlantId
    );

    if (plantCheckError || !plantExists) {
      return res.status(404).json({
        success: false,
        message: `El plant_id ${targetPlantId} no existe en la base de datos.`,
      });
    }

    // Guardar datos en plant_stats - Actualizar si existe, crear si no
    const statsData = {
      plant_id: targetPlantId,
      soil_moisture: parseFloat(soil_moisture) || 0,
      temperature: parseFloat(temperature) || 0,
      light: parseFloat(light) || 0,
      recorded_at: new Date().toISOString(),
    };

    // Buscar el último registro de stats para esta planta
    const { getLatestPlantStats, updatePlantStats } = await import(
      "../db/plant_stats.db.js"
    );
    const { data: existingStats, error: statsCheckError } =
      await getLatestPlantStats(targetPlantId);

    let savedStats;

    // Si existe un registro para esta planta, actualizarlo
    if (
      !statsCheckError &&
      existingStats &&
      existingStats.plant_id === targetPlantId
    ) {
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
      console.log(`✅ Plant_stats actualizado para plant_id: ${targetPlantId}`);
    } else {
      // Si no existe, crear nuevo registro
      const { data: createdStats, error: statsError } = await insertPlantStats(
        statsData
      );

      if (statsError) {
        console.error("Error guardando plant_stats:", statsError);
        throw statsError;
      }

      savedStats = createdStats;
      console.log(
        `✅ Nuevo plant_stats creado para plant_id: ${targetPlantId}`
      );
    }

    // Calcular estado de la planta
    const statusData = calculatePlantStatus(
      statsData.temperature,
      statsData.light,
      statsData.soil_moisture
    );

    // Verificar si ya existe un registro en plant_status para este plant_id
    // CRÍTICO: Verificar ANTES de insertar para evitar duplicados
    const { plantStatusExists } = await import("../db/plant_status.db.js");
    const { data: statusExists, error: existsCheckError } =
      await plantStatusExists(targetPlantId);

    let savedStatus;

    if (existsCheckError) {
      console.warn(
        "⚠️ Error verificando existencia de plant_status, intentando obtener último registro:",
        existsCheckError
      );
    }

    // Si existe un registro para este plant_id, SIEMPRE actualizar
    // Esto previene duplicados al asignar/reiniciar la Raspberry
    if (statusExists || (!existsCheckError && statusExists === undefined)) {
      // Obtener el registro existente para actualizarlo
      const { data: existingStatus, error: statusCheckError } =
        await getLatestPlantStatus(targetPlantId);

      if (existingStatus && existingStatus.plant_id === targetPlantId) {
        // Actualizar status existente de la misma planta
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
        console.log(
          `✅ Plant_status actualizado para plant_id: ${targetPlantId} (ID registro: ${existingStatus.id})`
        );
      } else {
        // Si no se encontró el registro pero existe, crear uno nuevo
        // Esto puede pasar en casos de inconsistencia de datos
        console.warn(
          `⚠️ Se detectó existencia pero no se encontró registro, creando nuevo para plant_id: ${targetPlantId}`
        );
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
        console.log(
          `✅ Nuevo plant_status creado para plant_id: ${targetPlantId} (después de verificación)`
        );
      }
    } else {
      // Solo crear nuevo status si NO existe ningún registro para esta planta
      // Verificación explícita antes de insertar
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
        // Si hay error de duplicado, intentar actualizar
        if (
          createError.code === "23505" ||
          createError.message?.includes("duplicate") ||
          createError.message?.includes("unique")
        ) {
          console.warn(
            "⚠️ Intento de duplicado detectado, actualizando registro existente"
          );
          const { data: existingStatus } = await getLatestPlantStatus(
            targetPlantId
          );
          if (existingStatus) {
            const updateData = {
              status: statusData.status,
              mood_index: statusData.mood_index,
              mood_face: statusData.mood_face,
              updated_at: new Date().toISOString(),
            };
            const { data: updatedStatus, error: updateError } =
              await updatePlantStatus(existingStatus.id, updateData);
            if (updateError) {
              console.error(
                "Error actualizando después de duplicado:",
                updateError
              );
              throw updateError;
            }
            savedStatus = updatedStatus;
            console.log(
              `✅ Plant_status actualizado después de detectar duplicado para plant_id: ${targetPlantId}`
            );
          } else {
            throw createError;
          }
        } else {
          console.error("Error creando plant_status:", createError);
          throw createError;
        }
      } else {
        savedStatus = createdStatus;
        console.log(
          `✅ Nuevo plant_status creado para plant_id: ${targetPlantId} (primera vez, verificado)`
        );
      }
    }

    // Generar matriz LED basada en el estado actual
    const emojiMatrix = getEmojiMatrix(
      savedStatus.status,
      savedStatus.mood_index
    );

    // Emitir evento Socket.IO global
    req.io?.emit("sensor_data_received", {
      type: "sensor_data_received",
      data: {
        stats: savedStats,
        status: savedStatus,
        device: deviceRecord,
        matrix: emojiMatrix, // Incluir matriz LED
      },
      timestamp: new Date().toISOString(),
    });

    // Emitir evento específico para la planta (sala por plant_id)
    req.io?.to(`plant_${targetPlantId}`).emit("plant_status_updated", {
      type: "plant_status_updated",
      data: {
        plant_id: targetPlantId,
        stats: savedStats,
        status: savedStatus,
        matrix: emojiMatrix, // Matriz LED para actualización inmediata
      },
      timestamp: new Date().toISOString(),
    });

    // Emitir evento para actualización de mood/emoji
    req.io?.to(`plant_${targetPlantId}`).emit("mood_updated", {
      type: "mood_updated",
      data: {
        plant_id: targetPlantId,
        status: savedStatus.status,
        mood_index: savedStatus.mood_index,
        mood_face: savedStatus.mood_face,
        matrix: emojiMatrix,
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
    const matrix = getEmojiMatrix(latestStatus.status, latestStatus.mood_index);

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
