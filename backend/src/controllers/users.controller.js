import {
  findAllUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  updateUser,
  deleteUser,
  findPlantsByUserId,
} from "../db/users.db.js";
import { createUserModel, sanitizeUserUpdate } from "../models/users.model.js";

const handleError = (error, res) => {
  const status = error?.status || 500;
  let message = error?.message || "Error interno del servidor";

  // Mejorar mensaje de error para errores de Supabase
  if (error?.code) {
    // Errores comunes de Supabase
    if (error.code === '42703') {
      message = "Campo no existe en la base de datos. Verifica que el campo 'avatar_url' esté en la tabla 'users'.";
    } else if (error.code === '23505') {
      message = "Violación de restricción única. El email ya está en uso.";
    } else if (error.code === '23503') {
      message = "Violación de clave foránea.";
    } else if (error.message) {
      message = error.message;
    }
  }

  // Forzar headers CORS en errores
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );

  console.error("❌ handleError llamado:", { status, message, errorCode: error?.code });

  // Asegurar que los headers CORS estén configurados ANTES de enviar la respuesta
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.header("Content-Type", "application/json");

  // Construir respuesta de error
  const errorResponse = { 
    success: false, 
    message,
    errorCode: error?.code || undefined,
  };
  
  // Solo agregar details en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = error?.details;
    errorResponse.stack = error?.stack;
  }

  return res.status(status).json(errorResponse);
};

export const UsersController = {
  list: async (req, res) => {
    try {
      // Forzar headers CORS
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Origin"
      );

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
      
      console.log("=".repeat(50));
      console.log("📝 INICIO ACTUALIZACIÓN USUARIO");
      console.log("📝 ID del usuario:", id);
      console.log("📝 Body recibido:", JSON.stringify(req.body, null, 2));
      
      const updateData = sanitizeUserUpdate(req.body);
      
      console.log("📝 Datos después de sanitización:", JSON.stringify(updateData, null, 2));
      
      // Verificar que hay datos para actualizar
      if (Object.keys(updateData).length === 0) {
        console.warn("⚠️ No hay datos válidos para actualizar");
        return res.status(400).json({
          success: false,
          message: "No hay datos válidos para actualizar. Se requiere al menos el campo 'name'.",
        });
      }
      
      // Verificar que el ID es válido
      if (!id || typeof id !== 'string' || id.length === 0) {
        console.error("❌ ID de usuario inválido:", id);
        return res.status(400).json({
          success: false,
          message: "ID de usuario inválido",
        });
      }
      
      console.log("📝 Llamando a updateUser con:", JSON.stringify(updateData, null, 2));
      
      // Solo actualizar el name - la imagen se maneja completamente en localStorage del frontend
      const hasName = 'name' in updateData;
      
      if (!hasName) {
        console.warn("⚠️ No hay campo 'name' para actualizar");
        return res.status(400).json({
          success: false,
          message: "Se requiere al menos el campo 'name' para actualizar.",
        });
      }
      
      console.log("📝 Actualizando solo el campo 'name' (imagen se maneja en localStorage)...");
      const result = await updateUser(id, updateData);
      
      if (result.error) {
        console.error("❌ Error al actualizar name:");
        console.error("   Código:", result.error.code);
        console.error("   Mensaje:", result.error.message);
        console.error("   Detalles:", result.error.details);
        console.error("   Hint:", result.error.hint);
        console.log("=".repeat(50));
        
        const error = new Error(result.error.message || "Error al actualizar el nombre");
        error.code = result.error.code;
        error.details = result.error.details;
        error.hint = result.error.hint;
        throw error;
      }
      
      if (!result.data) {
        console.warn("⚠️ No se encontró usuario con ID:", id);
        return res.status(404).json({ 
          success: false, 
          message: "Usuario no encontrado" 
        });
      }
      
      console.log("✅ Nombre actualizado exitosamente");
      console.log("✅ Nota: La imagen se maneja en localStorage del frontend");
      console.log("✅ Datos devueltos:", JSON.stringify(result.data, null, 2));
      console.log("=".repeat(50));
      
      req.io?.emit("user_updated", {
        type: "user_updated",
        data: result.data,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(200).json({
        success: true,
        message: "Nombre actualizado exitosamente. La imagen se guarda localmente en tu navegador.",
        data: result.data,
        imageUpdated: false // Siempre false porque la imagen se maneja en localStorage
      });
    } catch (error) {
      console.error("=".repeat(50));
      console.error("❌ ERROR GENERAL EN UPDATE:");
      console.error("   Tipo:", error.constructor.name);
      console.error("   Mensaje:", error.message);
      console.error("   Stack:", error.stack);
      console.error("   Error completo:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      console.error("=".repeat(50));
      
      // Asegurar que el error tenga un status
      if (!error.status) {
        error.status = 500;
      }
      
      // Asegurar que el error tenga un mensaje
      if (!error.message) {
        error.message = "Error interno del servidor";
      }
      
      return handleError(error, res);
    }
  },
  signup: async (req, res) => {
    try {
      // Forzar headers CORS
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Origin"
      );

      const { email, name } = req.body;
      // password se ignora ya que no se guarda en la BD (autenticación simulada)

      if (!email || !name) {
        return res.status(400).json({
          success: false,
          message: "Email and name are required",
        });
      }

      // Verificar si el usuario ya existe
      const { data: existingUser } = await findUserByEmail(email);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Crear nuevo usuario (sin password - autenticación simulada)
      const userData = createUserModel({
        name,
        email,
        rol: "user", // rol por defecto
      });

      const { data: newUser, error } = await insertUser(userData);

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            rol: newUser.rol,
            registration_date: newUser.registration_date,
          },
        },
      });
    } catch (error) {
      return handleError(error, res);
    }
  },
  login: async (req, res) => {
    try {
      // Forzar headers CORS
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Origin"
      );

      const { email } = req.body;
      // password se ignora ya que la autenticación es simulada

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // Buscar usuario por email (autenticación simulada - solo verifica que existe)
      const { data: user, error } = await findUserByEmail(email);

      if (error && error.code !== "PGRST116") {
        // PGRST116 es "no rows returned"
        throw error;
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please sign up first.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            rol: user.rol || "user",
            registration_date: user.registration_date,
          },
        },
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
