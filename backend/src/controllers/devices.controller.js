import {
  findAllDevices,
  findDeviceById,
  insertDevice,
  updateDevice,
  deleteDevice,
} from "../db/devices.db.js";
import {
  createDeviceModel,
  sanitizeDeviceUpdate,
} from "../models/devices.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  const message = error?.message || "Error interno del servidor";
  return res.status(status).json({ success: false, message });
};

export const DevicesController = {
  list: async (req, res) => {
    try {
      const { foundation_id, model, location } = req.query;
      const filters = {};
      if (foundation_id) filters.foundation_id = foundation_id;
      if (model) filters.model = model;
      if (location) filters.location = location;

      const { data, error } = await findAllDevices(filters);
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  get: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findDeviceById(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Dispositivo no encontrado" });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleError(error, res);
    }
  },

  create: async (req, res) => {
    try {
      const deviceData = createDeviceModel(req.body);
      const { data, error } = await insertDevice(deviceData);
      if (error) throw error;
      req.io?.emit("device_created", {
        type: "device_created",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(201).json({
        success: true,
        message: "Dispositivo creado exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = sanitizeDeviceUpdate(req.body);
      const { data, error } = await updateDevice(id, updateData);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Dispositivo no encontrado" });
      req.io?.emit("device_updated", {
        type: "device_updated",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(200).json({
        success: true,
        message: "Dispositivo actualizado exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await deleteDevice(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Dispositivo no encontrado" });
      req.io?.emit("device_deleted", {
        type: "device_deleted",
        data: { id },
        timestamp: new Date().toISOString(),
      });
      return res
        .status(200)
        .json({ success: true, message: "Dispositivo eliminado exitosamente" });
    } catch (error) {
      return handleError(error, res);
    }
  },
};

export default DevicesController;
