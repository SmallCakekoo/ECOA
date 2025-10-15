import {
  findAllUsers,
  findUserById,
  insertUser,
  updateUser,
  deleteUser,
  findPlantsByUserId,
} from "../db/users.db.js";
import { createUserModel, sanitizeUserUpdate } from "../models/users.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  const message = error?.message || "Error interno del servidor";
  return res.status(status).json({ success: false, message });
};

export const UsersController = {
  list: async (req, res) => {
    try {
      const { data, error } = await findAllUsers();
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
  get: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findUserById(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleError(error, res);
    }
  },
  create: async (req, res) => {
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
      return handleError(error, res);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
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
      return handleError(error, res);
    }
  },
  remove: async (req, res) => {
    try {
      const { id } = req.params;
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
      return handleError(error, res);
    }
  },
  listPlants: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findPlantsByUserId(id);
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
};

export default UsersController;
