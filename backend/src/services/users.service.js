import { isValidUUID, handleSupabaseError } from "./supabase.service.js";
import { createUserModel, sanitizeUserUpdate } from "../models/user.model.js";
import {
  findAllUsers,
  findUserById,
  insertUser,
  updateUser,
  deleteUser,
  findPlantsByUserId,
} from "../repositories/users.repository.js";

export async function listUsers(req, res) {
  try {
    const { data, error } = await findAllUsers();
    if (error) throw error;
    return res.status(200).json({ success: true, data, count: data.length });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de usuario inválido" });
    }
    const { data, error } = await findUserById(id);
    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function createUser(req, res) {
  try {
    const userData = createUserModel(req.body);
    const { data, error } = await insertUser(userData);
    if (error) throw error;
    req.io?.emit("user_created", {
      type: "user_created",
      data,
      timestamp: new Date().toISOString(),
    });
    return res
      .status(201)
      .json({ success: true, message: "Usuario creado exitosamente", data });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function updateUserProfile(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de usuario inválido" });
    }
    const updateData = sanitizeUserUpdate(req.body);
    const { data, error } = await updateUser(id, updateData);
    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    req.io?.emit("user_updated", {
      type: "user_updated",
      data,
      timestamp: new Date().toISOString(),
    });
    return res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data,
    });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function removeUser(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de usuario inválido" });
    }
    const { data, error } = await deleteUser(id);
    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    req.io?.emit("user_deleted", {
      type: "user_deleted",
      data: { id },
      timestamp: new Date().toISOString(),
    });
    return res
      .status(200)
      .json({ success: true, message: "Usuario eliminado exitosamente" });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}

export async function listUserPlants(req, res) {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de usuario inválido" });
    }
    const { data, error } = await findPlantsByUserId(id);
    if (error) throw error;
    return res.status(200).json({ success: true, data, count: data.length });
  } catch (error) {
    return handleSupabaseError(error, res);
  }
}
