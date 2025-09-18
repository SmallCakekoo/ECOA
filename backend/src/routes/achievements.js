import express from "express";
import { supabase, handleSupabaseError, isValidUUID } from "../db.js";

const router = express.Router();

// GET /achievements - Listar todos los logros
router.get("/", async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    let query = supabase
      .from("achievements")
      .select("*")
      .order("difficulty", { ascending: true });

    // Filtros opcionales
    if (category) {
      query = query.eq("category", category);
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
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

// GET /achievements/:id - Obtener logro por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de logro inválido",
      });
    }

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Logro no encontrado",
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

// POST /achievements - Crear nuevo logro
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      difficulty = "easy",
      points_reward = 0,
      icon_url,
      requirements,
    } = req.body;

    // Validaciones básicas
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "name, description y category son requeridos",
      });
    }

    if (!["easy", "medium", "hard", "expert"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Dificultad debe ser: easy, medium, hard, o expert",
      });
    }

    if (points_reward < 0) {
      return res.status(400).json({
        success: false,
        message: "Los puntos de recompensa no pueden ser negativos",
      });
    }

    const achievementData = {
      name,
      description,
      category,
      difficulty,
      points_reward,
      icon_url: icon_url || null,
      requirements: requirements || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("achievements")
      .insert([achievementData])
      .select()
      .single();

    if (error) throw error;

    // Emitir evento de Socket.IO
    req.io.emit("achievement_created", {
      type: "achievement_created",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Logro creado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// PUT /achievements/:id - Actualizar logro
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de logro inválido",
      });
    }

    // Remover campos que no se pueden actualizar
    delete updateData.id;
    delete updateData.created_at;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("achievements")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Logro no encontrado",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("achievement_updated", {
      type: "achievement_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Logro actualizado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// DELETE /achievements/:id - Eliminar logro
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de logro inválido",
      });
    }

    const { data, error } = await supabase
      .from("achievements")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Logro no encontrado",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("achievement_deleted", {
      type: "achievement_deleted",
      data: { id: id },
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Logro eliminado exitosamente",
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// GET /achievements/user/:user_id - Obtener logros de un usuario
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
      .from("user_achievements")
      .select(
        `
        *,
        achievements(*)
      `
      )
      .eq("user_id", user_id)
      .order("earned_at", { ascending: false });

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

// POST /achievements/assign - Asignar logro a usuario
router.post("/assign", async (req, res) => {
  try {
    const { user_id, achievement_id } = req.body;

    if (!user_id || !achievement_id) {
      return res.status(400).json({
        success: false,
        message: "user_id y achievement_id son requeridos",
      });
    }

    if (!isValidUUID(user_id) || !isValidUUID(achievement_id)) {
      return res.status(400).json({
        success: false,
        message: "IDs inválidos",
      });
    }

    // Verificar si el usuario ya tiene este logro
    const { data: existingAchievement } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", user_id)
      .eq("achievement_id", achievement_id)
      .single();

    if (existingAchievement) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya tiene este logro",
      });
    }

    // Obtener información del logro para los puntos
    const { data: achievement, error: achievementError } = await supabase
      .from("achievements")
      .select("points_reward")
      .eq("id", achievement_id)
      .single();

    if (achievementError) throw achievementError;

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Logro no encontrado",
      });
    }

    // Asignar logro al usuario
    const { data, error } = await supabase
      .from("user_achievements")
      .insert([
        {
          user_id,
          achievement_id,
          earned_at: new Date().toISOString(),
        },
      ])
      .select(
        `
        *,
        achievements(*)
      `
      )
      .single();

    if (error) throw error;

    // Actualizar puntos de experiencia del usuario
    const { error: updateError } = await supabase
      .from("users")
      .update({
        experience_points: supabase.raw(
          `experience_points + ${achievement.points_reward}`
        ),
      })
      .eq("id", user_id);

    if (updateError) throw updateError;

    // Emitir evento de Socket.IO
    req.io.emit("achievement_earned", {
      type: "achievement_earned",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Logro asignado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// GET /achievements/categories - Obtener todas las categorías
router.get("/categories", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("category")
      .not("category", "is", null);

    if (error) throw error;

    // Obtener categorías únicas
    const categories = [...new Set(data.map((item) => item.category))];

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

export default router;
