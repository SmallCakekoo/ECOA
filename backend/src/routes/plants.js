import express from "express";
import { supabase, handleSupabaseError, isValidUUID } from "../db.js";

const router = express.Router();

// GET /plants - Listar todas las plantas
router.get("/", async (req, res) => {
  try {
    const { user_id, status } = req.query;

    let query = supabase
      .from("plants")
      .select(
        `
        *,
        users:user_id(name, email),
        accessories:plant_accessories(
          accessories(*)
        )
      `
      )
      .order("created_at", { ascending: false });

    // Filtros opcionales
    if (user_id && isValidUUID(user_id)) {
      query = query.eq("user_id", user_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
      count: data.length,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// GET /plants/:id - Obtener planta por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de planta inválido",
      });
    }

    const { data, error } = await supabase
      .from("plants")
      .select(
        `
        *,
        users:user_id(name, email),
        accessories:plant_accessories(
          accessories(*)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Planta no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// POST /plants - Crear nueva planta
router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      name,
      species,
      description,
      image_url,
      status = "active",
      health_status = "healthy",
      water_level = 0,
      light_level = 0,
      temperature = 0,
      humidity = 0,
    } = req.body;

    // Validaciones básicas
    if (!user_id || !name || !species) {
      return res.status(400).json({
        success: false,
        message: "user_id, name y species son requeridos",
      });
    }

    if (!isValidUUID(user_id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    const plantData = {
      user_id,
      name,
      species,
      description: description || null,
      image_url: image_url || null,
      status,
      health_status,
      water_level,
      light_level,
      temperature,
      humidity,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("plants")
      .insert([plantData])
      .select()
      .single();

    if (error) throw error;

    // Emitir evento de Socket.IO
    req.io.emit("plant_created", {
      type: "plant_created",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Planta creada exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// PUT /plants/:id - Actualizar planta
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de planta inválido",
      });
    }

    // Remover campos que no se pueden actualizar
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.created_at;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("plants")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Planta no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("plant_updated", {
      type: "plant_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Planta actualizada exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// PUT /plants/:id/metrics - Actualizar métricas de la planta
router.put("/:id/metrics", async (req, res) => {
  try {
    const { id } = req.params;
    const { water_level, light_level, temperature, humidity, health_status } =
      req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de planta inválido",
      });
    }

    const metricsData = {
      water_level: water_level !== undefined ? water_level : null,
      light_level: light_level !== undefined ? light_level : null,
      temperature: temperature !== undefined ? temperature : null,
      humidity: humidity !== undefined ? humidity : null,
      health_status: health_status || null,
      updated_at: new Date().toISOString(),
    };

    // Remover campos null/undefined
    Object.keys(metricsData).forEach((key) => {
      if (metricsData[key] === null || metricsData[key] === undefined) {
        delete metricsData[key];
      }
    });

    const { data, error } = await supabase
      .from("plants")
      .update(metricsData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Planta no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("plant_metrics_updated", {
      type: "plant_metrics_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Métricas actualizadas exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// DELETE /plants/:id - Eliminar planta
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de planta inválido",
      });
    }

    const { data, error } = await supabase
      .from("plants")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Planta no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("plant_deleted", {
      type: "plant_deleted",
      data: { id: id },
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Planta eliminada exitosamente",
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// POST /plants/:id/accessories - Asignar accesorio a planta
router.post("/:id/accessories", async (req, res) => {
  try {
    const { id } = req.params;
    const { accessory_id } = req.body;

    if (!isValidUUID(id) || !isValidUUID(accessory_id)) {
      return res.status(400).json({
        success: false,
        message: "IDs inválidos",
      });
    }

    const { data, error } = await supabase
      .from("plant_accessories")
      .insert([
        {
          plant_id: id,
          accessory_id: accessory_id,
          assigned_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Emitir evento de Socket.IO
    req.io.emit("accessory_assigned", {
      type: "accessory_assigned",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Accesorio asignado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

export default router;
