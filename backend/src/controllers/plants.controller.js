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
        imageLength: plantData.image ? plantData.image.length : 0
      });
      
      const { data, error } = await insertPlant(plantData);
      
      if (error) {
        // Log completo del error para debugging
        console.error('❌ Error insertando en Supabase:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          stack: error.stack,
          plantDataKeys: Object.keys(plantData),
          plantDataSummary: {
            id: plantData.id,
            name: plantData.name,
            species: plantData.species,
            hasImage: !!plantData.image,
            imageLength: plantData.image ? plantData.image.length : 0,
            imagePreview: plantData.image ? `${plantData.image.substring(0, 50)}...` : null,
            user_id: plantData.user_id,
            is_adopted: plantData.is_adopted
          }
        });
        
        // Si es un error de tipo desconocido, loguear el objeto completo
        if (!error.code && !error.message) {
          console.error('❌ Error completo sin código/mensaje:', JSON.stringify(error, null, 2));
        }
        
        // Mensajes de error más claros basados en el código de error
        if (error.message && (error.message.includes('value too long') || error.message.includes('exceeds maximum') || error.message.includes('too long for type'))) {
          return res.status(400).json({ 
            success: false, 
            message: 'La imagen es demasiado grande. Por favor usa una imagen más pequeña (<250KB)' 
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
        // En producción, dar mensaje genérico pero loguear detalles
        const errorMessage = `Error al guardar en la base de datos${error.message ? ': ' + error.message : ''}`;
        
        // Loguear error completo para debugging
        console.error('❌ Error completo de Supabase:', JSON.stringify(error, null, 2));
        
        return res.status(500).json({
          success: false,
          message: errorMessage,
          // En desarrollo, incluir más detalles
          ...(process.env.NODE_ENV !== 'production' && {
            error: {
              code: error.code,
              details: error.details,
              hint: error.hint
            }
          })
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
      console.error('❌ Error completo al crear planta:', error);
      // Si es un error de sintaxis o otro error no relacionado con Supabase
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
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
      const { data, error } = await updatePlant(id, metricsData);
      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Planta no encontrada" });
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
