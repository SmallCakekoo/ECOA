import express from "express";
import { supabase, handleSupabaseError, isValidUUID } from "../db.js";

const router = express.Router();

// GET /accessories - Listar todos los accesorios
router.get("/", async (req, res) => {
  try {
    const { category, available } = req.query;

    let query = supabase
      .from("accessories")
      .select("*")
      .order("name", { ascending: true });

    // Filtros opcionales
    if (category) {
      query = query.eq("category", category);
    }

    if (available !== undefined) {
      query = query.eq("available", available === "true");
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

// GET /accessories/:id - Obtener accesorio por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de accesorio inválido",
      });
    }

    const { data, error } = await supabase
      .from("accessories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Accesorio no encontrado",
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

// POST /accessories - Crear nuevo accesorio
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      image_url,
      available = true,
      effect_type,
      effect_value,
    } = req.body;

    // Validaciones básicas
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "name y category son requeridos",
      });
    }

    if (price && price < 0) {
      return res.status(400).json({
        success: false,
        message: "El precio no puede ser negativo",
      });
    }

    const accessoryData = {
      name,
      description: description || null,
      category,
      price: price || 0,
      image_url: image_url || null,
      available,
      effect_type: effect_type || null,
      effect_value: effect_value || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("accessories")
      .insert([accessoryData])
      .select()
      .single();

    if (error) throw error;

    // Emitir evento de Socket.IO
    req.io.emit("accessory_created", {
      type: "accessory_created",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Accesorio creado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// PUT /accessories/:id - Actualizar accesorio
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de accesorio inválido",
      });
    }

    // Remover campos que no se pueden actualizar
    delete updateData.id;
    delete updateData.created_at;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("accessories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Accesorio no encontrado",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("accessory_updated", {
      type: "accessory_updated",
      data: data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Accesorio actualizado exitosamente",
      data: data,
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// DELETE /accessories/:id - Eliminar accesorio
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de accesorio inválido",
      });
    }

    const { data, error } = await supabase
      .from("accessories")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Accesorio no encontrado",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("accessory_deleted", {
      type: "accessory_deleted",
      data: { id: id },
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Accesorio eliminado exitosamente",
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// GET /accessories/categories - Obtener todas las categorías
router.get("/categories", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("accessories")
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

// GET /accessories/plant/:plant_id - Obtener accesorios asignados a una planta
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
      .from("plant_accessories")
      .select(
        `
        *,
        accessories(*)
      `
      )
      .eq("plant_id", plant_id);

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

// DELETE /accessories/plant/:plant_id/:accessory_id - Desasignar accesorio de planta
router.delete("/plant/:plant_id/:accessory_id", async (req, res) => {
  try {
    const { plant_id, accessory_id } = req.params;

    if (!isValidUUID(plant_id) || !isValidUUID(accessory_id)) {
      return res.status(400).json({
        success: false,
        message: "IDs inválidos",
      });
    }

    const { data, error } = await supabase
      .from("plant_accessories")
      .delete()
      .eq("plant_id", plant_id)
      .eq("accessory_id", accessory_id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada",
      });
    }

    // Emitir evento de Socket.IO
    req.io.emit("accessory_unassigned", {
      type: "accessory_unassigned",
      data: { plant_id, accessory_id },
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Accesorio desasignado exitosamente",
    });
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

export default router;
