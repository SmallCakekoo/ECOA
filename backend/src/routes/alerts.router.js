import express from "express";
import { supabase, handleSupabaseError, isValidUUID } from "../db.js";

const router = express.Router();

// GET /alerts - Listar todas las alertas
router.get("/", async (req, res) => {
  try {
    const { plant_id, user_id, status, alert_type } = req.query;

    let query = supabase
      .from("alerts")
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .order("created_at", { ascending: false });

    // Filtros opcionales
    if (plant_id && isValidUUID(plant_id)) {
      query = query.eq("plant_id", plant_id);
    }

    if (user_id && isValidUUID(user_id)) {
      query = query.eq("user_id", user_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (alert_type) {
      query = query.eq("alert_type", alert_type);
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

// GET /alerts/:id - Obtener alerta por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de alerta inválido",
      });
    }

    const { data, error } = await supabase
      .from("alerts")
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Alerta no encontrada",
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

// POST /alerts - Crear nueva alerta
router.post("/", async (req, res) => {
  try {
    const {
      plant_id,
      user_id,
      title,
      message,
      alert_type = "info",
      priority = "medium",
      status = "active",
    } = req.body;

    // Validaciones básicas
    if (!plant_id || !user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "plant_id, user_id, title y message son requeridos",
      });
    }

    if (!isValidUUID(plant_id) || !isValidUUID(user_id)) {
      return res.status(400).json({
        success: false,
        message: "IDs inválidos",
      });
    }

    if (!["info", "warning", "error", "success"].includes(alert_type)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de alerta debe ser: info, warning, error, o success",
      });
    }

    if (!["low", "medium", "high", "urgent"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Prioridad debe ser: low, medium, high, o urgent",
      });
    }

    const alertData = {
      plant_id,
      user_id,
      title,
      message,
      alert_type,
      priority,
      status,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("alerts")
      .insert([alertData])
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .single();

    if (error) throw error;

    // Emitir evento de Socket.IO
    req.io.emit("alert_created", {
      type: "alert_created",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Alerta creada exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// PUT /alerts/:id - Actualizar alerta
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de alerta inválido",
      });
    }

    // Remover campos que no se pueden actualizar
    delete updateData.id;
    delete updateData.plant_id;
    delete updateData.user_id;
    delete updateData.created_at;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("alerts")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Alerta no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("alert_updated", {
      type: "alert_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Alerta actualizada exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// PUT /alerts/:id/status - Actualizar estado de alerta
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de alerta inválido",
      });
    }

    if (!status || !["active", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido. Debe ser: active, resolved, o dismissed",
      });
    }

    const { data, error } = await supabase
      .from("alerts")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Alerta no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("alert_status_updated", {
      type: "alert_status_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Estado de alerta actualizado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// DELETE /alerts/:id - Eliminar alerta
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de alerta inválido",
      });
    }

    const { data, error } = await supabase
      .from("alerts")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Alerta no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("alert_deleted", {
      type: "alert_deleted",
      data: { id: id },
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Alerta eliminada exitosamente",
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// GET /alerts/plant/:plant_id - Obtener alertas por planta
router.get("/plant/:plant_id", async (req, res) => {
  try {
    const { plant_id } = req.params;
    const { status } = req.query;

    if (!isValidUUID(plant_id)) {
      return res.status(400).json({
        success: false,
        message: "ID de planta inválido",
      });
    }

    let query = supabase
      .from("alerts")
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .eq("plant_id", plant_id)
      .order("created_at", { ascending: false });

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

// GET /alerts/user/:user_id - Obtener alertas por usuario
router.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status } = req.query;

    if (!isValidUUID(user_id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    let query = supabase
      .from("alerts")
      .select(
        `
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `
      )
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

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

// POST /alerts/bulk-status - Actualizar estado de múltiples alertas
router.post("/bulk-status", async (req, res) => {
  try {
    const { alert_ids, status } = req.body;

    if (!alert_ids || !Array.isArray(alert_ids) || alert_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "alert_ids debe ser un array no vacío",
      });
    }

    if (!status || !["active", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido. Debe ser: active, resolved, o dismissed",
      });
    }

    // Validar que todos los IDs sean UUIDs válidos
    const invalidIds = alert_ids.filter((id) => !isValidUUID(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Algunos IDs de alerta son inválidos",
      });
    }

    const { data, error } = await supabase
      .from("alerts")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in("id", alert_ids).select(`
        *,
        plants:plant_id(name, species, users:user_id(name, email))
      `);

    if (error) throw error;

    // Emitir evento de Socket.IO
    req.io.emit("alerts_bulk_updated", {
      type: "alerts_bulk_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: `${data.length} alertas actualizadas exitosamente`,
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

export default router;
