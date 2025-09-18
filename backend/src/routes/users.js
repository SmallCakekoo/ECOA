import express from "express";
import { supabase, handleSupabaseError, isValidUUID } from "../db.js";

const router = express.Router();

// GET /users - Listar todos los usuarios
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
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

// GET /users/:id - Obtener usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
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

// POST /users - Crear nuevo usuario
router.post("/", async (req, res) => {
  try {
    const { name, email, avatar_url, level, experience_points } = req.body;

    // Validaciones básicas
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Nombre y email son requeridos",
      });
    }

    const userData = {
      name,
      email,
      avatar_url: avatar_url || null,
      level: level || 1,
      experience_points: experience_points || 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;

    // Emitir evento de Socket.IO
    req.io.emit("user_created", {
      type: "user_created",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// PUT /users/:id - Actualizar usuario
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    // Remover campos que no se pueden actualizar
    delete updateData.id;
    delete updateData.created_at;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("user_updated", {
      type: "user_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// DELETE /users/:id - Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("user_deleted", {
      type: "user_deleted",
      data: { id: id },
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// GET /users/:id/plants - Obtener plantas del usuario
router.get("/:id/plants", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("user_id", id)
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
