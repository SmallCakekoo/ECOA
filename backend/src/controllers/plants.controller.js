import {
  findAllPlants,
  findPlantById,
  insertPlant,
  updatePlant,
  deletePlant,
  assignAccessoryToPlant,
} from "../db/plants.db.js";
import {
  createPlantModel,
  sanitizePlantUpdate,
  sanitizePlantMetrics,
} from "../models/plants.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  const message = error?.message || "Error interno del servidor";
  return res.status(status).json({ success: false, message });
};

export const PlantsController = {
  list: async (req, res) => {
    try {
      const {
        user_id,
        status,
        health_status,
        species,
        is_adopted,
        search,
      } = req.query;
      const filters = {};
      if (user_id) filters.user_id = user_id;
      if (status) filters.status = status;
      if (health_status) filters.health_status = health_status;
      if (species) filters.species = species;
      if (typeof is_adopted !== "undefined") filters.is_adopted = is_adopted;
      if (search) filters.search = search;

      const { data, error } = await findAllPlants(filters);
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
  get: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await findPlantById(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Planta no encontrada" });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return handleError(error, res);
    }
  },
  create: async (req, res) => {
    try {
      // Validar campos requeridos antes de crear el modelo
      if (!req.body.name || !req.body.name.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: "El nombre de la planta es requerido" 
        });
      }
      
      if (!req.body.species || !req.body.species.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: "La especie de la planta es requerida" 
        });
      }

      console.log('📝 Creando planta con datos:', {
        name: req.body.name,
        species: req.body.species,
        description: req.body.description ? 'presente' : 'ausente',
        hasImage: !!req.body.image,
        imageLength: req.body.image ? req.body.image.length : 0,
        imagePreview: req.body.image ? `${req.body.image.substring(0, 50)}...` : null
      });
      
      let plantData;
      try {
        plantData = createPlantModel(req.body);
      } catch (modelError) {
        console.error('❌ Error validando modelo:', modelError);
        return res.status(400).json({
          success: false,
          message: modelError.message || "Error validando los datos de la planta"
        });
      }
      
      console.log('✅ Modelo creado:', {
        id: plantData.id,
        name: plantData.name,
        species: plantData.species,
        hasImage: !!plantData.image,
        imageLength: plantData.image ? plantData.image.length : 0,
        keys: Object.keys(plantData),
        plantDataValues: {
          ...plantData,
          image: plantData.image ? `[data URL de ${Math.round(plantData.image.length / 1024)}KB]` : null
        }
      });
      
      let result;
      let data, error;
      
      try {
        result = await insertPlant(plantData);
        data = result?.data;
        error = result?.error;
        
        console.log('🔍 Resultado de insertPlant:', {
          hasResult: !!result,
          hasData: !!data,
          hasError: !!error,
          errorType: error ? typeof error : 'none',
          errorKeys: error ? Object.keys(error) : [],
          dataType: data ? typeof data : 'none',
          resultKeys: result ? Object.keys(result) : []
        });
      } catch (insertError) {
        console.error('❌ Excepción al llamar insertPlant:', insertError);
        return res.status(500).json({
          success: false,
          message: 'Error al insertar la planta en la base de datos',
          error: {
            message: insertError.message || 'Error desconocido',
            stack: process.env.NODE_ENV !== 'production' ? insertError.stack : undefined
          }
        });
      }
      
      if (error) {
        // Log completo del error para debugging
        console.error('❌ Error insertando en Supabase:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          errorObject: error,
          errorString: JSON.stringify(error, null, 2),
          plantDataKeys: Object.keys(plantData),
          plantDataSummary: {
            id: plantData.id,
            name: plantData.name,
            species: plantData.species,
            hasImage: !!plantData.image,
            imageLength: plantData.image ? plantData.image.length : 0,
            user_id: plantData.user_id,
            is_adopted: plantData.is_adopted
          }
        });
        
        // Mensajes de error más claros basados en el código de error
        if (error.message && (error.message.includes('value too long') || error.message.includes('exceeds maximum') || error.message.includes('too long for type'))) {
          return res.status(400).json({ 
            success: false, 
            message: 'La imagen es demasiado grande. Por favor usa una imagen más pequeña (<200KB)' 
          });
        }
        
        if (error.code === '23505') { // Unique violation
          return res.status(400).json({
            success: false,
            message: 'Ya existe una planta con este nombre o ID'
          });
        }
        
        if (error.code === '23502') { // Not null violation
          return res.status(400).json({
            success: false,
            message: `Falta un campo requerido: ${error.details || 'campo desconocido'}`
          });
        }
        
        if (error.code === '23503') { // Foreign key violation
          return res.status(400).json({
            success: false,
            message: 'El user_id o foundation_id no existe'
          });
        }
        
        // Error genérico con más detalles
        const errorMessage = error.message || `Error al guardar en la base de datos`;
        
        // Loguear error completo para debugging
        console.error('❌ Error completo de Supabase:', JSON.stringify(error, null, 2));
        console.error('❌ Error completo (objeto):', error);
        console.error('❌ Error completo (toString):', error.toString());
        
        return res.status(500).json({
          success: false,
          message: errorMessage || 'Error interno del servidor',
          // Incluir más detalles siempre para debugging
          error: {
            code: error.code || 'UNKNOWN',
            message: error.message || 'Error desconocido',
            details: error.details || null,
            hint: error.hint || null
          }
        });
      }
      
      if (!data) {
        console.error('❌ No se recibió data de Supabase después de insertar');
        return res.status(500).json({
          success: false,
          message: 'Error al crear la planta: no se recibió respuesta del servidor'
        });
      }
      
      req.io?.emit("plant_created", {
        type: "plant_created",
        data,
        timestamp: new Date().toISOString(),
      });
      
      return res
        .status(201)
        .json({ success: true, message: "Planta creada exitosamente", data });
    } catch (error) {
      console.error('❌ Error al crear planta (catch general):', error);
      console.error('❌ Stack:', error.stack);
      console.error('❌ Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      return handleError(error, res);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = sanitizePlantUpdate(req.body);
      const { data, error } = await updatePlant(id, updateData);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Planta no encontrada" });
      req.io?.emit("plant_updated", {
        type: "plant_updated",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(200).json({
        success: true,
        message: "Planta actualizada exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },
  updateMetrics: async (req, res) => {
    try {
      const { id } = req.params;
      const metricsData = sanitizePlantMetrics(req.body);
      
      console.log("📝 Actualizando métricas para planta:", id, metricsData);
      
      // Si hay health_status, insertar un nuevo registro en plant_status
      if (metricsData.health_status) {
        const { insertPlantStatus } = await import("../db/plant_status.db.js");
        const { createPlantStatusModel } = await import("../models/plant_status.model.js");
        
        try {
          const statusData = createPlantStatusModel({
            plant_id: id,
            status: metricsData.health_status
          });
          
          const { data: statusResult, error: statusError } = await insertPlantStatus(statusData);
          
          if (statusError) {
            console.error("❌ Error insertando plant_status:", statusError);
            throw statusError;
          }
          
          console.log("✅ Health status registrado en plant_status:", statusResult);
        } catch (statusError) {
          console.error("❌ Error al registrar health_status:", statusError);
          throw statusError;
        }
      }
      
      // Obtener la planta actualizada para devolver
      const { data, error } = await findPlantById(id);
      if (error) throw error;
      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "Planta no encontrada" });
      }
      
      // Enriquecer con el último health_status
      const { findAllPlantStatus } = await import("../db/plant_status.db.js");
      const { data: statuses } = await findAllPlantStatus({ plant_id: id });
      if (statuses && statuses.length > 0) {
        const latestStatus = statuses.sort((a, b) => 
          new Date(b.recorded_at) - new Date(a.recorded_at)
        )[0];
        data.health_status = latestStatus.status;
      }
      
      req.io?.emit("plant_metrics_updated", {
        type: "plant_metrics_updated",
        data,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(200).json({
        success: true,
        message: "Métricas actualizadas exitosamente",
        data,
      });
    } catch (error) {
      console.error("❌ Error en updateMetrics:", error);
      return handleError(error, res);
    }
  },
  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await deletePlant(id);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Planta no encontrada" });
      req.io?.emit("plant_deleted", {
        type: "plant_deleted",
        data: { id },
        timestamp: new Date().toISOString(),
      });
      return res
        .status(200)
        .json({ success: true, message: "Planta eliminada exitosamente" });
    } catch (error) {
      return handleError(error, res);
    }
  },
  assignAccessory: async (req, res) => {
    try {
      const { id } = req.params;
      const { accessory_id } = req.body;
      const { data, error } = await assignAccessoryToPlant(id, accessory_id);
      if (error) throw error;
      req.io?.emit("accessory_assigned", {
        type: "accessory_assigned",
        data,
        timestamp: new Date().toISOString(),
      });
      return res.status(201).json({
        success: true,
        message: "Accesorio asignado exitosamente",
        data,
      });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getByUser: async (req, res) => {
    try {
      const { user_id } = req.params;
      const { data, error } = await findAllPlants({ user_id });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getByFoundation: async (req, res) => {
    try {
      const { foundation_id } = req.params;
      const { data, error } = await findAllPlants({ foundation_id });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getAdopted: async (req, res) => {
    try {
      const { data, error } = await findAllPlants({ is_adopted: true });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },

  getAvailable: async (req, res) => {
    try {
      const { data, error } = await findAllPlants({ is_adopted: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data, count: data.length });
    } catch (error) {
      return handleError(error, res);
    }
  },
};

export default PlantsController;
