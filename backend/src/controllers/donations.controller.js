import DonationsDB from "../db/donations.db.js";
import { createDonationModel } from "../models/donations.model.js";

const DonationsController = {
  // Listar todas las donaciones
  async list(req, res) {
    try {
      const { user_id, plant_id, status } = req.query;
      const data = await DonationsDB.list({ user_id, plant_id, status });

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener donaciones",
        error: error.message,
      });
    }
  },

  // Obtener donación por ID
  async get(req, res) {
    try {
      const { id } = req.params;
      const data = await DonationsDB.getById(id);

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
      res.status(500).json({
        success: false,
        message: "Error al obtener donación",
        error: error.message,
      });
    }
  },

  // Crear nueva donación
  async create(req, res) {
    try {
      console.log("📥 Recibida petición para crear donación:", req.body);
      
      // Usar el modelo para validar y sanitizar los datos
      const donationData = createDonationModel(req.body);
      console.log("✅ Datos validados:", donationData);
      
      const data = await DonationsDB.create(donationData);
      console.log("✅ Donación creada en DB:", data?.id);

      // Emitir evento de Socket.IO solo si existe
      if (req.io) {
        try {
          req.io.emit("donation_created", {
            type: "donation_created",
            data: data,
            timestamp: new Date().toISOString(),
          });
          console.log("✅ Evento Socket.IO emitido");
        } catch (ioError) {
          console.warn("⚠️ Error emitiendo evento Socket.IO (no crítico):", ioError.message);
        }
      }

      res.status(201).json({
        success: true,
        message: "Donación creada exitosamente",
        data: data,
      });
    } catch (error) {
      console.error("❌ Error en create() de donations controller:", {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
      res.status(500).json({
        success: false,
        message: "Error al crear donación",
        error: error.message,
      });
    }
  },

  // Actualizar donación
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const data = await DonationsDB.update(id, updateData);

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
      res.status(500).json({
        success: false,
        message: "Error al actualizar donación",
        error: error.message,
      });
    }
  },

  // Actualizar estado de donación
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const data = await DonationsDB.updateStatus(id, status);

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
      res.status(500).json({
        success: false,
        message: "Error al actualizar estado de donación",
        error: error.message,
      });
    }
  },

  // Eliminar donación
  async remove(req, res) {
    try {
      const { id } = req.params;
      const data = await DonationsDB.remove(id);

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
      res.status(500).json({
        success: false,
        message: "Error al eliminar donación",
        error: error.message,
      });
    }
  },

  // Obtener donaciones por usuario
  async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const data = await DonationsDB.getByUser(user_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener donaciones del usuario",
        error: error.message,
      });
    }
  },

  // Obtener donaciones por planta
  async getByPlant(req, res) {
    try {
      const { plant_id } = req.params;
      const data = await DonationsDB.getByPlant(plant_id);

      res.status(200).json({
        success: true,
        data: data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener donaciones de la planta",
        error: error.message,
      });
    }
  },
};

export default DonationsController;
