import express from "express";
import { supabase, handleSupabaseError, isValidUUID } from "../db.js";

const router = express.Router();

// GET /donations - Listar todas las donaciones
router.get("/", async (req, res) => {
  try {
    const { user_id, plant_id, status } = req.query;

    let query = supabase
      .from("donations")
      .select(
        `
        *,
        users:donor_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .order("created_at", { ascending: false });

    // Filtros opcionales
    if (user_id && isValidUUID(user_id)) {
      query = query.eq("donor_id", user_id);
    }

    if (plant_id && isValidUUID(plant_id)) {
      query = query.eq("plant_id", plant_id);
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

// GET /donations/:id - Obtener donación por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de donación inválido",
      });
    }

    const { data, error } = await supabase
      .from("donations")
      .select(
        `
        *,
        users:donor_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Donación no encontrada",
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

// POST /donations - Crear nueva donación
router.post("/", async (req, res) => {
  try {
    const {
      donor_id,
      plant_id,
      amount,
      message,
      status = "pending",
      donation_type = "water",
    } = req.body;

    // Validaciones básicas
    if (!donor_id || !plant_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "donor_id, plant_id y amount son requeridos",
      });
    }

    if (!isValidUUID(donor_id) || !isValidUUID(plant_id)) {
      return res.status(400).json({
        success: false,
        message: "IDs inválidos",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "El monto debe ser mayor a 0",
      });
    }

    const donationData = {
      donor_id,
      plant_id,
      amount,
      message: message || null,
      status,
      donation_type,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("donations")
      .insert([donationData])
      .select(
        `
        *,
        users:donor_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .single();

    if (error) throw error;

    // Emitir evento de Socket.IO
    req.io.emit("donation_created", {
      type: "donation_created",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Donación creada exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// PUT /donations/:id - Actualizar donación
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de donación inválido",
      });
    }

    // Remover campos que no se pueden actualizar
    delete updateData.id;
    delete updateData.donor_id;
    delete updateData.plant_id;
    delete updateData.created_at;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("donations")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        users:donor_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Donación no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("donation_updated", {
      type: "donation_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Donación actualizada exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// PUT /donations/:id/status - Actualizar estado de donación
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de donación inválido",
      });
    }

    if (!status || !["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido. Debe ser: pending, completed, o cancelled",
      });
    }

    const { data, error } = await supabase
      .from("donations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        users:donor_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Donación no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("donation_status_updated", {
      type: "donation_status_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Estado de donación actualizado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// DELETE /donations/:id - Eliminar donación
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de donación inválido",
      });
    }

    const { data, error } = await supabase
      .from("donations")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Donación no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("donation_deleted", {
      type: "donation_deleted",
      data: { id: id },
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Donación eliminada exitosamente",
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// GET /donations/user/:user_id - Obtener donaciones por usuario
router.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!isValidUUID(user_id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    const { data, error } = await supabase
      .from("donations")
      .select(
        `
        *,
        users:donor_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .eq("donor_id", user_id)
      .order("created_at", { ascending: false });

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

// GET /donations/plant/:plant_id - Obtener donaciones por planta
router.get("/plant/:plant_id", async (req, res) => {
  try {
    const { plant_id } = req.params;

    if (!isValidUUID(plant_id)) {
      return res.status(400).json({
        success: false,
        message: "ID de planta inválido",
      });
    }

    const { data, error } = await supabase
      .from("donations")
      .select(
        `
        *,
        users:donor_id(name, email),
        plants:plant_id(name, species)
      `
      )
      .eq("plant_id", plant_id)
      .order("created_at", { ascending: false });

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

export default router;
